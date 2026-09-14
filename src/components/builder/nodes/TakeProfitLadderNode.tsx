"use client"

import * as React from "react"
import { Handle, Position } from "reactflow"
import { X, Layers, TrendingUp, ShieldCheck, Target } from "lucide-react"
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
    <div className={`group relative flex min-h-[105px] w-[280px] flex-col justify-center rounded-xl border ${
      selected 
        ? 'border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.4)] scale-[1.02]' 
        : 'border-emerald-500/50 hover:border-emerald-400'
    } bg-[#041f12] px-5 py-3.5 shadow-[var(--shadow-card)] backdrop-blur-md transition-all hover:scale-[1.02]`}>
      
      <button 
        onClick={onDelete}
        className="absolute right-2 top-2 hidden h-5 w-5 items-center justify-center rounded-md bg-bg-base/80 text-text-secondary hover:text-accent-red group-hover:flex"
        title="Delete Node"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2">
          <Target className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-400">
            STAGED TP LADDER
          </span>
        </div>
        <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          3-TIER SCALING
        </span>
      </div>

      <span className="text-[13px] font-semibold text-text-primary leading-snug">
        {data.label || 'Multi-Target Staged Profit Taking'}
      </span>

      {/* Tier Visual Breakdown */}
      <div className="mt-2.5 flex flex-col gap-1 pt-1.5 border-t border-emerald-500/20">
        {ladder.map((tier: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between text-[10px] font-mono bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
            <span className="text-emerald-300 font-bold">
              TP{idx + 1}: +{tier.targetPercentage}% ({tier.allocationPercentage}%)
            </span>
            <span className="text-text-tertiary">
              {tier.moveToBreakEven ? '⚡ Auto B/E' : tier.trailingStopPct ? `Trail ${tier.trailingStopPct}%` : 'Limit Close'}
            </span>
          </div>
        ))}
      </div>

      <Handle 
        type="target" 
        position={Position.Top} 
        className="h-4 w-4 border-2 border-bg-base bg-emerald-400 transition-transform hover:scale-125" 
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="h-4 w-4 border-2 border-bg-base bg-emerald-400 transition-transform hover:scale-125" 
      />
    </div>
  )
}
