"use client"

import * as React from "react"
import { Handle, Position } from "reactflow"
import { X, Clock, Calendar, ShieldCheck, Activity } from "lucide-react"
import { useBuilderStore } from "@/store/useBuilderStore"

export function FilterNode({ id, data, selected }: { id: string; data: any; selected?: boolean }) {
  const setNodes = useBuilderStore((state) => state.setNodes)
  const setEdges = useBuilderStore((state) => state.setEdges)

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setNodes((nds) => nds.filter((node) => node.id !== id))
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id))
  }

  const filter = data.dslFilter || { sessions: ['NEW_YORK', 'LONDON'], daysOfWeek: [1, 2, 3, 4, 5] }
  const sessions = filter.sessions || ['ALL']
  const minAtr = filter.minVolatilityATR

  return (
    <div className={`group relative flex min-h-[90px] w-[270px] flex-col justify-center rounded-xl border ${
      selected 
        ? 'border-teal-400 shadow-[0_0_25px_rgba(20,184,166,0.4)] scale-[1.02]' 
        : 'border-teal-500/50 hover:border-teal-400'
    } bg-[#041d1a] px-5 py-3.5 shadow-[var(--shadow-card)] backdrop-blur-md transition-all hover:scale-[1.02]`}>
      
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
          <Clock className="h-3.5 w-3.5 text-teal-400" />
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-teal-400">
            SESSION & REGIME FILTER
          </span>
        </div>
        <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
          PRE-TRADE
        </span>
      </div>

      <span className="text-[13px] font-semibold text-text-primary leading-snug">
        {data.label || 'Active Session & Volatility Gate'}
      </span>

      {/* Badges */}
      <div className="mt-2 flex flex-wrap gap-1.5 pt-1.5 border-t border-teal-500/20">
        <div className="flex items-center gap-1 text-[10px] text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
          <Clock className="h-3 w-3" />
          <span>{sessions.join(', ')}</span>
        </div>
        {filter.daysOfWeek && (
          <div className="flex items-center gap-1 text-[10px] text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
            <Calendar className="h-3 w-3" />
            <span>Mon-Fri</span>
          </div>
        )}
        {minAtr !== undefined && (
          <div className="flex items-center gap-1 text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            <Activity className="h-3 w-3" />
            <span>ATR &gt; {minAtr}%</span>
          </div>
        )}
      </div>

      <Handle 
        type="target" 
        position={Position.Top} 
        className="h-4 w-4 border-2 border-bg-base bg-teal-400 transition-transform hover:scale-125" 
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="h-4 w-4 border-2 border-bg-base bg-teal-400 transition-transform hover:scale-125" 
      />
    </div>
  )
}
