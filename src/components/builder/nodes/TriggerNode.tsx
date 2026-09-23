"use client"

import * as React from "react"
import { Handle, Position } from "reactflow"
import { Activity, Radio, Play, Zap, Cpu } from "lucide-react"
import { useBuilderStore } from "@/store/useBuilderStore"

export function TriggerNode({ data, selected }: { data: any; selected?: boolean }) {
  const tradingPair = useBuilderStore((state) => state.tradingPair)
  const timeframe = useBuilderStore((state) => state.timeframe)

  return (
    <div 
      className={`group relative flex w-[300px] flex-col rounded-2xl border-2 border-cyan-500/50 bg-gradient-to-b from-[#091829]/95 via-[#050f1c]/98 to-[#030912]/95 p-4 shadow-2xl backdrop-blur-xl transition-all duration-200 hover:border-cyan-400 ${
        selected ? 'border-cyan-300 shadow-[0_0_35px_rgba(6,182,212,0.5)] scale-[1.03]' : ''
      }`}
      style={{
        boxShadow: selected 
          ? '0 0 30px rgba(6,182,212,0.4), inset 0 1px 0 rgba(255,255,255,0.1)' 
          : '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)'
      }}
    >
      {/* Top Ambient Glow Line */}
      <div 
        className="absolute -top-[2px] left-6 right-6 h-[2px] rounded-full blur-[1px]" 
        style={{ background: 'linear-gradient(90deg, transparent, #06b6d4, transparent)' }}
      />

      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
            STRATEGY START TRIGGER
          </span>
        </div>

        <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
          <Radio className="h-2.5 w-2.5 animate-pulse" />
          <span>L2 WEBSOCKET</span>
        </span>
      </div>

      {/* Main Trigger Details */}
      <div className="mb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 shrink-0">
            <Play className="h-4 w-4 fill-current ml-0.5" />
          </div>
          <div>
            <h4 className="text-[14px] font-bold text-white tracking-tight leading-tight">
              {data.label || "Market Event Listener"}
            </h4>
            <span className="text-[10px] font-mono text-cyan-300 font-bold">
              {tradingPair || "BTC/USDT"} • {timeframe || "15m"} Candlesticks
            </span>
          </div>
        </div>
      </div>

      {/* ═══ ANIMATED LIVE MARKET STREAM PULSE SVG ═══ */}
      <div className="mb-2.5 rounded-xl border border-slate-200 bg-white p-2 overflow-hidden shadow-xs">
        <div className="flex items-center justify-between text-[8.5px] font-mono mb-1">
          <span className="text-slate-600">Continuous Tick Feed</span>
          <span className="text-cyan-700 font-bold">Zero-Lag Ingestion</span>
        </div>

        <svg className="w-full h-7 overflow-visible" viewBox="0 0 260 28" fill="none">
          {/* Subtle gridline */}
          <line x1="0" y1="14" x2="260" y2="14" stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="1" />
          
          {/* Animated Zig-Zag Financial Tick Pulse */}
          <path 
            d="M 0 14 L 20 14 L 35 8 L 50 20 L 65 6 L 80 22 L 95 11 L 110 17 L 125 14 L 155 14 L 170 6 L 185 22 L 200 8 L 215 18 L 230 14 L 260 14" 
            stroke="#0284c7" 
            strokeWidth="2" 
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Glowing pulse dot */}
          <circle cx="225" cy="14" r="3.5" fill="#0284c7" className="animate-ping" />
          <circle cx="225" cy="14" r="2" fill="#ffffff" />
        </svg>
      </div>

      {/* Footer Status */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] font-mono">
        <div className="flex items-center gap-1 text-slate-400">
          <Cpu className="h-3 w-3 text-cyan-400" />
          <span>Latency: <span className="text-emerald-400 font-bold">3.8ms</span></span>
        </div>
        <span className="text-emerald-400 font-bold flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Engine Active
        </span>
      </div>

      {/* Output Handle */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="h-4 w-4 border-2 border-slate-900 bg-cyan-400 transition-transform hover:scale-125 shadow-md"
      />
    </div>
  )
}
