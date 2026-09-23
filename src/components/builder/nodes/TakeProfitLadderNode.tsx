"use client"

import * as React from "react"
import { Handle, Position } from "reactflow"
import { X, Layers, TrendingUp, ShieldCheck, Target, Award } from "lucide-react"
import { useBuilderStore } from "@/store/useBuilderStore"

export function TakeProfitLadderNode({ id, data, selected }: { id: string; data: any; selected?: boolean }) {
  const setNodes = useBuilderStore((state) => state.setNodes)
  const setEdges = useBuilderStore((state) => state.setEdges)

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setNodes((nds) => nds.filter((node) => node.id !== id))
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id))
  }

  const ladder = data.dslLadder || [
    { targetPercentage: 2.5, allocationPercentage: 50, moveToBreakEven: true },
    { targetPercentage: 5.0, allocationPercentage: 30 },
    { targetPercentage: 8.0, allocationPercentage: 20, trailingStopPct: 1.5 }
  ]

  return (
    <div className={`group relative flex min-h-[140px] w-[300px] flex-col justify-between rounded-xl border ${
      selected 
        ? 'border-emerald-400 shadow-[0_0_28px_rgba(16,185,129,0.45)] ring-1 ring-emerald-400/50 scale-[1.02]' 
        : 'border-emerald-500/40 hover:border-emerald-400/80 shadow-[0_4px_20px_rgba(0,0,0,0.6)]'
    } bg-gradient-to-b from-[#042817] via-[#021c10] to-[#011109] px-4 py-3 backdrop-blur-xl transition-all select-none`}>
      
      <button 
        onClick={onDelete}
        className="absolute right-2 top-2 z-10 hidden h-5 w-5 items-center justify-center rounded-md bg-bg-base/90 text-text-secondary hover:text-accent-red group-hover:flex transition-colors border border-white/10"
        title="Delete Node"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5">
          <div className="h-5 w-5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.3)]">
            <Target className="h-3 w-3 text-emerald-300" />
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-300">
            STAGED TP LADDER
          </span>
        </div>
        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.25)]">
          {ladder.length}-TIER SCALING
        </span>
      </div>

      {/* Label */}
      <div className="text-[12.5px] font-bold text-slate-100 leading-snug tracking-tight mb-2">
        {data.label || 'Multi-Target Staged Profit Taking'}
      </div>

      {/* Embedded SVG Stepped Ladder Progression */}
      <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-xs flex flex-col gap-1.5">
        <div className="grid grid-cols-3 gap-1.5">
          {ladder.map((tier: any, idx: number) => (
            <div key={idx} className="flex flex-col items-center bg-emerald-50 border border-emerald-200 rounded p-1">
              <span className="text-[8px] font-mono text-emerald-700 font-bold uppercase">TP {idx + 1}</span>
              <span className="text-[11px] font-mono font-extrabold text-slate-900">+{tier.targetPercentage}%</span>
              <span className="text-[8px] font-mono text-slate-500 font-medium">{tier.allocationPercentage}% size</span>
            </div>
          ))}
        </div>

        {/* Stepped Visual Bar */}
        <div className="flex items-center gap-1 h-2 w-full mt-0.5 bg-slate-100 rounded-sm p-0.5">
          <div className="h-full rounded-xs bg-emerald-600 w-[50%]" title="TP1: 50%" />
          <div className="h-full rounded-xs bg-emerald-500 w-[30%]" title="TP2: 30%" />
          <div className="h-full rounded-xs bg-emerald-400 w-[20%]" title="TP3: 20%" />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-2.5 flex items-center justify-between text-[9.5px] font-mono border-t border-emerald-500/20 pt-1.5 text-slate-400">
        <span className="text-emerald-400 flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          <span>Auto Break-Even Trigger</span>
        </span>
        <span className="text-slate-400 text-[9px]">Trailing 1.5%</span>
      </div>

      <Handle 
        type="target" 
        position={Position.Top} 
        className="h-3.5 w-3.5 border-2 border-slate-900 bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)] transition-transform hover:scale-125" 
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="h-3.5 w-3.5 border-2 border-slate-900 bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)] transition-transform hover:scale-125" 
      />
    </div>
  )
}
