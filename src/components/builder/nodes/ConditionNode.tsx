"use client"

import * as React from "react"
import { Handle, Position } from "reactflow"
import { X, Clock, Activity, Zap, TrendingUp, TrendingDown, Sliders } from "lucide-react"
import { useBuilderStore } from "@/store/useBuilderStore"

const CATEGORY_CONFIG: Record<string, { 
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  glowColor: string;
  accentColor: string;
}> = {
  "ENTRY CONDITIONS": { 
    badgeBg: "bg-cyan-500/15 border-cyan-500/30", 
    badgeText: "text-cyan-400", 
    borderColor: "border-cyan-500/40 hover:border-cyan-400", 
    glowColor: "rgba(6,182,212,0.25)",
    accentColor: "#06b6d4"
  },
  "EXIT CONDITIONS": { 
    badgeBg: "bg-emerald-500/15 border-emerald-500/30", 
    badgeText: "text-emerald-400", 
    borderColor: "border-emerald-500/40 hover:border-emerald-400", 
    glowColor: "rgba(16,185,129,0.25)",
    accentColor: "#10b981"
  },
  "RISK MANAGEMENT": { 
    badgeBg: "bg-amber-500/15 border-amber-500/30", 
    badgeText: "text-amber-400", 
    borderColor: "border-amber-500/40 hover:border-amber-400", 
    glowColor: "rgba(245,158,11,0.25)",
    accentColor: "#f59e0b"
  },
}

export function ConditionNode({ id, data, selected }: { id: string; data: any; selected?: boolean }) {
  const CATEGORY_MAP: Record<string, string> = {
    'technical': 'ENTRY CONDITIONS',
    'entry': 'ENTRY CONDITIONS',
    'risk': 'EXIT CONDITIONS',
    'exit': 'EXIT CONDITIONS',
  }
  const normalizedCategory = CATEGORY_MAP[data.category?.toLowerCase()] || data.category || 'ENTRY CONDITIONS'
  const config = CATEGORY_CONFIG[normalizedCategory] || CATEGORY_CONFIG["ENTRY CONDITIONS"]

  const setNodes = useBuilderStore((state) => state.setNodes)
  const setEdges = useBuilderStore((state) => state.setEdges)

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setNodes((nds) => nds.filter((node) => node.id !== id))
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id))
  }

  // Format indicator string
  const formatIndicatorStr = (ind: any) => {
    if (!ind || !ind.type) return ''
    const tf = ind.timeframe ? `[${ind.timeframe}] ` : ''
    const offset = ind.offset ? `[-${ind.offset}]` : ''
    const period = ind.parameters?.period ? `(${ind.parameters.period})` : ''
    const mult = ind.parameters?.multiplier ? ` x${ind.parameters.multiplier}` : ''
    
    if (ind.parameters?.period && (ind.type === 'EMA' || ind.type === 'SMA' || ind.type === 'WMA' || ind.type === 'HMA')) {
      return `${tf}${ind.parameters.period} ${ind.type}${offset}`
    }
    return `${tf}${ind.type}${period}${mult}${offset}`
  }

  let displayLabel = data.label || 'Technical Condition'
  let indicatorType = 'EMA'
  let comparator = 'CROSSES_ABOVE'
  let timeframe = data.dslCondition?.left?.timeframe || '15m'
  let gate = data.dslCondition?.logicalOperator || 'AND'
  let thresholdVal: string | number = 'Threshold'

  if (data.dslCondition) {
    const { left, comparator: comp, right, logicalOperator } = data.dslCondition
    comparator = comp || 'CROSSES_ABOVE'
    indicatorType = left?.type || 'EMA'
    timeframe = left?.timeframe || timeframe
    gate = logicalOperator || gate

    const compMap: Record<string, string> = {
      GREATER_THAN: '>',
      LESS_THAN: '<',
      EQUAL: '==',
      CROSSES_ABOVE: 'Crosses Above',
      CROSSES_BELOW: 'Crosses Below'
    }

    const leftStr = formatIndicatorStr(left)
    let rightStr = ''

    if (typeof right === 'object' && right !== null && right.type) {
      rightStr = formatIndicatorStr(right)
      thresholdVal = rightStr
    } else {
      rightStr = String(right)
      thresholdVal = right
    }

    displayLabel = `${leftStr} ${compMap[comparator] || comparator} ${rightStr}`
  } else {
    // Guess indicator from label
    if (/rsi/i.test(displayLabel)) indicatorType = 'RSI'
    else if (/macd/i.test(displayLabel)) indicatorType = 'MACD'
    else if (/bollinger|band/i.test(displayLabel)) indicatorType = 'BOLLINGER'
    else if (/volume/i.test(displayLabel)) indicatorType = 'VOLUME'
    else if (/atr/i.test(displayLabel)) indicatorType = 'ATR'
  }

  const isRsi = indicatorType === 'RSI' || /rsi/i.test(displayLabel)
  const isBollinger = indicatorType === 'BOLLINGER' || indicatorType === 'BOLLINGER_BANDS' || /bollinger|band/i.test(displayLabel)
  const isMacd = indicatorType === 'MACD' || /macd/i.test(displayLabel)
  const isVolume = indicatorType === 'VOLUME' || /volume/i.test(displayLabel)
  const isCrossover = comparator === 'CROSSES_ABOVE' || comparator === 'CROSSES_BELOW' || /cross/i.test(displayLabel)

  return (
    <div 
      className={`group relative flex w-[320px] flex-col rounded-2xl border-2 bg-gradient-to-b from-[#0f172a]/95 via-[#090d16]/98 to-[#05080f]/95 p-4 shadow-2xl backdrop-blur-xl transition-all duration-200 ${
        selected 
          ? 'border-accent-blue shadow-[0_0_30px_rgba(59,130,246,0.45)] scale-[1.03]' 
          : config.borderColor
      }`}
      style={{
        boxShadow: selected 
          ? '0 0 30px rgba(59,130,246,0.35), inset 0 1px 0 rgba(255,255,255,0.1)' 
          : `0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)`
      }}
    >
      {/* Top Ambient Glow Line */}
      <div 
        className="absolute -top-[2px] left-6 right-6 h-[2px] rounded-full blur-[1px]" 
        style={{ background: `linear-gradient(90deg, transparent, ${config.accentColor}, transparent)` }}
      />

      {/* Delete Button */}
      <button 
        onClick={onDelete}
        className="absolute right-2.5 top-2.5 hidden h-6 w-6 items-center justify-center rounded-lg bg-slate-800/90 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-700/60 transition-all group-hover:flex z-10"
        title="Remove Condition Node"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* Card Header Bar */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span 
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: config.accentColor }}
            />
            <span 
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ backgroundColor: config.accentColor }}
            />
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${config.badgeText}`}>
            {normalizedCategory.replace(" CONDITIONS", "")} CONDITION
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span className="flex items-center gap-1 text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60">
            <Clock className="h-2.5 w-2.5 text-cyan-400" />
            <span>{timeframe}</span>
          </span>
          <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
            {gate}
          </span>
        </div>
      </div>

      {/* Main Condition Label */}
      <div className="mb-2.5">
        <h4 className="text-[13.5px] font-bold text-white leading-snug tracking-tight">
          {displayLabel}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] font-mono font-semibold text-slate-400">
            Rule: <span className="text-cyan-300 font-bold">{comparator}</span>
          </span>
          <span className="h-1 w-1 rounded-full bg-slate-600" />
          <span className="text-[10px] font-mono text-slate-400">
            Ref: <span className="text-slate-200">{String(thresholdVal)}</span>
          </span>
        </div>
      </div>

      {/* ═══ ADVANCED EMBEDDED STRATEGY MICRO-CHART ═══ */}
      <div className="relative mb-2.5 rounded-xl border border-slate-200 bg-white p-2.5 overflow-hidden shadow-xs">
        {/* Crossover Visualizer Chart (EMA, SMA, MACD) */}
        {isCrossover && !isRsi && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[9px] font-mono px-1">
              <span className="flex items-center gap-1 text-cyan-600 font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                Fast Signal (20/50)
              </span>
              <span className="flex items-center gap-1 text-indigo-600 font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                Baseline (200)
              </span>
            </div>
            
            {/* SVG Dual-Wave Crossover Chart */}
            <svg className="w-full h-11 overflow-visible" viewBox="0 0 280 44" fill="none">
              <defs>
                <linearGradient id={`fastGrad-${id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid guide */}
              <line x1="0" y1="22" x2="280" y2="22" stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="1" />

              {/* Baseline curve (Slow Zig-Zag Trend) */}
              <path 
                d="M 0 32 L 35 30 L 70 33 L 105 28 L 140 22 L 175 20 L 210 16 L 245 18 L 280 14" 
                stroke="#6366f1" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />

              {/* Fast Crossover Zig-Zag Swing Wave */}
              <path 
                d="M 0 38 L 25 28 L 50 35 L 85 24 L 115 31 L 140 22 L 165 14 L 195 21 L 230 11 L 255 16 L 280 6" 
                stroke="#0284c7" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />

              {/* Area under fast Zig-Zag curve */}
              <path 
                d="M 0 38 L 25 28 L 50 35 L 85 24 L 115 31 L 140 22 L 165 14 L 195 21 L 230 11 L 255 16 L 280 6 L 280 44 L 0 44 Z" 
                fill={`url(#fastGrad-${id})`}
              />

              {/* Swing Pivots on Fast Zig-Zag Wave */}
              <circle cx="85" cy="24" r="2" fill="#0284c7" />
              <circle cx="165" cy="14" r="2" fill="#0284c7" />
              <circle cx="230" cy="11" r="2" fill="#0284c7" />

              {/* Glowing Golden Cross Point */}
              <circle cx="140" cy="22" r="5" fill="#0284c7" className="animate-pulse" />
              <circle cx="140" cy="22" r="2.5" fill="#ffffff" />
            </svg>

            <div className="flex items-center justify-between text-[9px] font-mono px-1 pt-0.5">
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-600" />
                <span>Golden Cross Confirmed</span>
              </span>
              <span className="text-slate-500">Spread: <span className="text-slate-900 font-bold">+1.24%</span></span>
            </div>
          </div>
        )}

        {/* Oscillator Waveform Chart (RSI, Stochastic) */}
        {isRsi && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[9px] font-mono px-1">
              <span className="text-rose-600 font-bold">OB: 70</span>
              <span className="text-slate-600">Current: <span className="text-emerald-600 font-bold">28.4</span></span>
              <span className="text-emerald-600 font-bold">OS: 30</span>
            </div>

            {/* SVG RSI Oscillator with Zig-Zag Swings and Oversold Sub-Zone */}
            <svg className="w-full h-11 overflow-visible" viewBox="0 0 280 44" fill="none">
              <defs>
                <linearGradient id={`rsiGrad-${id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* 70 Overbought boundary */}
              <line x1="0" y1="10" x2="280" y2="10" stroke="#f43f5e" strokeDasharray="3 3" strokeWidth="1" opacity="0.7" />
              {/* 30 Oversold boundary */}
              <line x1="0" y1="32" x2="280" y2="32" stroke="#10b981" strokeDasharray="3 3" strokeWidth="1" opacity="0.9" />

              {/* RSI Zig-Zag Curve dipping below 30 into oversold */}
              <path 
                d="M 0 16 L 25 22 L 50 18 L 80 26 L 105 32 L 130 28 L 155 38 L 180 41 L 205 36 L 230 30 L 255 34 L 280 22" 
                stroke="#059669" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />

              {/* Oversold Shaded Zone (< 30) */}
              <path 
                d="M 105 32 L 130 28 L 155 38 L 180 41 L 205 36 L 230 30 Z" 
                fill={`url(#rsiGrad-${id})`}
              />

              {/* Active trigger point */}
              <circle cx="180" cy="41" r="4.5" fill="#10b981" className="animate-ping" />
              <circle cx="180" cy="41" r="3" fill="#059669" />
              <circle cx="180" cy="41" r="1.5" fill="#ffffff" />
            </svg>

            <div className="flex items-center justify-between text-[9px] font-mono px-1 pt-0.5">
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <Zap className="h-3 w-3 text-emerald-600" />
                <span>Oversold Signal Triggered</span>
              </span>
              <span className="text-slate-500">Mean Rev Edge: <span className="text-emerald-700 font-bold">+2.8σ</span></span>
            </div>
          </div>
        )}

        {/* Bollinger Bands Channel Chart */}
        {isBollinger && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[9px] font-mono px-1">
              <span className="text-sky-600 font-bold">Upper Band</span>
              <span className="text-slate-500 font-medium">20 SMA Mid</span>
              <span className="text-sky-600 font-bold">Lower Band</span>
            </div>

            <svg className="w-full h-11 overflow-visible" viewBox="0 0 280 44" fill="none">
              {/* Upper band (Zig-Zag envelope) */}
              <path d="M 0 8 L 35 6 L 70 10 L 110 7 L 150 11 L 190 9 L 235 13 L 280 14" stroke="#0284c7" strokeWidth="1.5" strokeLinejoin="round" opacity="0.9" />
              {/* Mid band (Zig-Zag baseline) */}
              <path d="M 0 22 L 35 20 L 70 23 L 110 21 L 150 25 L 190 23 L 235 26 L 280 27" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2" strokeLinejoin="round" />
              {/* Lower band (Zig-Zag envelope) */}
              <path d="M 0 36 L 35 34 L 70 37 L 110 35 L 150 39 L 190 37 L 235 40 L 280 41" stroke="#0284c7" strokeWidth="1.5" strokeLinejoin="round" opacity="0.9" />

              {/* Price piercing lower band in sharp Zig-Zag pattern */}
              <path 
                d="M 0 22 L 30 12 L 65 26 L 100 16 L 135 30 L 170 24 L 195 40 L 225 32 L 255 18 L 280 12" 
                stroke="#d97706" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              <circle cx="195" cy="40" r="4" fill="#d97706" />
            </svg>

            <div className="flex items-center justify-between text-[9px] font-mono px-1 pt-0.5">
              <span className="text-amber-700 font-bold">Volatility Squeeze: Active</span>
              <span className="text-slate-500">Bandwidth: <span className="text-slate-900 font-bold">2.4%</span></span>
            </div>
          </div>
        )}

        {/* Generic Indicator / Volume / Fallback Chart */}
        {!isCrossover && !isRsi && !isBollinger && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[9px] font-mono px-1">
              <span className="text-cyan-700 font-bold">{indicatorType} Metric</span>
              <span className="text-slate-500">Threshold: <span className="text-slate-900 font-bold">{String(thresholdVal)}</span></span>
            </div>

            {/* Micro Volume/Volatility Histogram */}
            <div className="flex items-end justify-between gap-1 h-9 px-1 py-1">
              {[35, 42, 28, 65, 52, 44, 78, 92, 85, 96, 70, 88].map((h, i) => (
                <div 
                  key={i} 
                  className={`w-full rounded-xs transition-all ${
                    i >= 7 ? 'bg-cyan-500 shadow-xs' : 'bg-slate-200'
                  }`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-[9px] font-mono px-1 pt-0.5">
              <span className="text-cyan-700 font-bold">Volume Expansion: &gt; 1.5x</span>
              <span className="text-emerald-700 font-bold">Criteria Met</span>
            </div>
          </div>
        )}
      </div>

      {/* Enterprise Real-Time Status Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] font-mono">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Activity className="h-3 w-3 text-emerald-400 animate-pulse" />
          <span>Stream: <span className="text-slate-200">L2 Ticks</span></span>
        </div>
        <div className="flex items-center gap-1 font-semibold text-emerald-400">
          <span>1.8ms</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </div>
      </div>

      {/* Connection Handles */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="h-4 w-4 border-2 border-slate-900 bg-cyan-400 shadow-sm transition-transform hover:scale-125" 
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="h-4 w-4 border-2 border-slate-900 bg-cyan-400 shadow-sm transition-transform hover:scale-125" 
      />
    </div>
  )
}
