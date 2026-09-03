import * as React from "react"
import { Handle, Position } from "reactflow"
import { X } from "lucide-react"
import { useBuilderStore } from "@/store/useBuilderStore"

export function RiskNode({ id, data, selected }: { id: string; data: any; selected?: boolean }) {
  const setNodes = useBuilderStore((state) => state.setNodes)
  const setEdges = useBuilderStore((state) => state.setEdges)

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nds) => nds.filter((node) => node.id !== id))
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id))
  }

  return (
    <div className={`group relative flex min-h-[90px] w-[260px] flex-col justify-center rounded-xl border ${selected ? 'border-accent-amber shadow-[0_0_20px_rgba(245,158,11,0.3)] scale-[1.02]' : 'border-accent-amber/50'} bg-[#1F1706] px-5 py-4 shadow-[var(--shadow-card)] backdrop-blur-md transition-all hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(245,158,11,0.15)]`}>
      <button 
        onClick={onDelete}
        className="absolute right-2 top-2 hidden h-6 w-6 items-center justify-center rounded-md bg-bg-base/80 text-text-secondary hover:text-accent-red group-hover:flex"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2 mb-2">
        <span className={`flex h-2 w-2 rounded-full bg-accent-amber shadow-[0_0_10px_currentColor]`} />
        <span className={`text-[11px] font-bold uppercase tracking-wider text-accent-amber`}>
          RISK MANAGEMENT
        </span>
      </div>
      
      <span className="text-[15px] font-semibold text-text-primary mb-1">{data.label}</span>
      
      {data.dslRisk && (
        <div className="flex flex-wrap gap-2 text-[11px] text-text-tertiary font-mono mt-1">
          {data.dslRisk.stopLossPercentage !== undefined && (
            <span className="rounded bg-accent-red/10 border border-accent-red/20 text-accent-red px-1.5 py-0.5">
              SL: {data.dslRisk.stopLossPercentage}%
            </span>
          )}
          {data.dslRisk.takeProfitPercentage !== undefined && (
            <span className="rounded bg-accent-green/10 border border-accent-green/20 text-accent-green px-1.5 py-0.5">
              TP: {data.dslRisk.takeProfitPercentage}%
            </span>
          )}
          {data.dslRisk.trailingStopPercentage !== undefined && (
            <span className="rounded bg-accent-blue/10 border border-accent-blue/20 text-accent-blue px-1.5 py-0.5">
              Trail: {data.dslRisk.trailingStopPercentage}%
            </span>
          )}
          {data.dslRisk.maxDailyDrawdownPct !== undefined && (
            <span className="rounded bg-amber-500/10 border border-amber-500/20 text-accent-amber px-1.5 py-0.5">
              MaxDD: {data.dslRisk.maxDailyDrawdownPct}%
            </span>
          )}
          {data.dslRisk.leverage !== undefined && data.dslRisk.leverage > 1 && (
            <span className="rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 px-1.5 py-0.5">
              {data.dslRisk.leverage}x Lev
            </span>
          )}
        </div>
      )}

      <Handle type="target" position={Position.Top} className={`h-4 w-4 border-2 border-bg-base bg-accent-amber transition-transform hover:scale-125`} />
      <Handle type="source" position={Position.Bottom} className={`h-4 w-4 border-2 border-bg-base bg-accent-amber transition-transform hover:scale-125`} />
    </div>
  )
}
