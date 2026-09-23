"use client"

import * as React from "react"
import { Handle, Position } from "reactflow"
import { X, ShieldAlert, ShieldCheck, TrendingDown, TrendingUp, AlertTriangle, Lock } from "lucide-react"
import { useBuilderStore } from "@/store/useBuilderStore"

export function RiskNode({ id, data, selected }: { id: string; data: any; selected?: boolean }) {
  const setNodes = useBuilderStore((state) => state.setNodes)
  const setEdges = useBuilderStore((state) => state.setEdges)

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setNodes((nds) => nds.filter((node) => node.id !== id))
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id))
  }

  const risk = data.dslRisk || {
    stopLossPercentage: 2.5,
    takeProfitPercentage: 6.0,
    trailingStopPercentage: 1.5,
    leverage: 10
  }

  const sl = risk.stopLossPercentage ?? 2.5
  const tp = risk.takeProfitPercentage ?? 6.0
  const trail = risk.trailingStopPercentage
  const maxDD = risk.maxDailyDrawdownPct
  const leverage = risk.leverage ?? 10

  // Calculate risk-reward ratio
  const rrRatio = sl > 0 ? (tp / sl).toFixed(1) : '2.0'
  const estLiquidationPct = leverage > 1 ? (100 / leverage) * 0.9 : 100
  const safetyBuffer = (estLiquidationPct / Math.max(sl, 1)).toFixed(1)

  return (
    <div 
      className={`group relative flex w-[320px] flex-col rounded-2xl border-2 border-amber-500/40 bg-gradient-to-b from-[#1f1606]/95 via-[#110d03]/98 to-[#090601]/95 p-4 shadow-2xl backdrop-blur-xl transition-all duration-200 hover:border-amber-400 ${
        selected ? 'border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.45)] scale-[1.03]' : ''
      }`}
      style={{
        boxShadow: selected 
          ? '0 0 30px rgba(245,158,11,0.35), inset 0 1px 0 rgba(255,255,255,0.1)' 
          : '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)'
      }}
    >
      {/* Top Ambient Glow Line */}
      <div 
        className="absolute -top-[2px] left-6 right-6 h-[2px] rounded-full blur-[1px]" 
        style={{ background: 'linear-gradient(90deg, transparent, #f59e0b, transparent)' }}
      />

      {/* Delete Button */}
      <button 
        onClick={onDelete}
        className="absolute right-2.5 top-2.5 hidden h-6 w-6 items-center justify-center rounded-lg bg-slate-800/90 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-700/60 transition-all group-hover:flex z-10"
        title="Remove Risk Node"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
            RISK & CAPITAL MANAGEMENT
          </span>
        </div>

        <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
          R:R 1:{rrRatio}
        </span>
      </div>

      {/* Title */}
      <div className="mb-2.5">
        <h4 className="text-[13.5px] font-bold text-white tracking-tight leading-snug">
          {data.label || "Dynamic Risk & Liquidation Guard"}
        </h4>
        <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-slate-400">
          <span>Position Armor: <span className="text-emerald-400 font-bold">Hard Stop Enabled</span></span>
        </div>
      </div>

      {/* ═══ VISUAL RISK / REWARD BRACKET BAR ═══ */}
      <div className="mb-2.5 rounded-xl border border-slate-200 bg-white p-2.5 shadow-xs">
        <div className="flex items-center justify-between text-[9px] font-mono mb-1.5">
          <span className="text-rose-600 font-bold flex items-center gap-0.5">
            <TrendingDown className="h-2.5 w-2.5" />
            Stop Loss -{sl}%
          </span>
          <span className="text-slate-600">Entry: <span className="text-slate-900 font-bold">0.0%</span></span>
          <span className="text-emerald-600 font-bold flex items-center gap-0.5">
            Take Profit +{tp}%
            <TrendingUp className="h-2.5 w-2.5" />
          </span>
        </div>

        {/* Dual-Sided Bracket Progress Meter */}
        <div className="flex items-center gap-1 h-3 w-full rounded-full bg-slate-100 p-0.5 border border-slate-200">
          {/* Risk Red Zone */}
          <div 
            className="h-full rounded-l-full bg-gradient-to-r from-rose-600 to-rose-400 shadow-xs"
            style={{ width: `${Math.min(50, Math.max(20, (sl / (sl + tp)) * 100))}%` }}
          />
          {/* Neutral Divider */}
          <div className="h-4 w-1 bg-slate-700 rounded-full shadow-xs" />
          {/* Reward Green Zone */}
          <div 
            className="h-full rounded-r-full bg-gradient-to-r from-emerald-500 to-teal-500 shadow-xs"
            style={{ width: `${Math.min(80, Math.max(50, (tp / (sl + tp)) * 100))}%` }}
          />
        </div>

        {/* Micro Badges inside visualizer */}
        <div className="mt-2 flex flex-wrap gap-1.5 text-[9.5px] font-mono">
          {trail && (
            <span className="rounded bg-blue-50 border border-blue-200 text-blue-700 px-1.5 py-0.5 font-bold">
              Trail: {trail}%
            </span>
          )}
          {maxDD && (
            <span className="rounded bg-rose-50 border border-rose-200 text-rose-700 px-1.5 py-0.5 font-bold">
              MaxDD: {maxDD}%
            </span>
          )}
          <span className="rounded bg-slate-100 border border-slate-200 text-slate-700 px-1.5 py-0.5 font-bold">
            Buffer: ~{safetyBuffer}x SL
          </span>
        </div>
      </div>

      {/* Footer Status */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] font-mono">
        <div className="flex items-center gap-1 text-slate-400">
          <ShieldCheck className="h-3 w-3 text-emerald-400" />
          <span>Liq Distance: <span className="text-amber-400 font-bold">~{estLiquidationPct.toFixed(1)}%</span></span>
        </div>
        <span className="text-emerald-400 font-bold flex items-center gap-1">
          <Lock className="h-3 w-3" />
          Audited
        </span>
      </div>

      {/* ReactFlow Handles */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="h-4 w-4 border-2 border-slate-900 bg-amber-400 transition-transform hover:scale-125" 
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="h-4 w-4 border-2 border-slate-900 bg-amber-400 transition-transform hover:scale-125" 
      />
    </div>
  )
}
