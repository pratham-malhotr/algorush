"use client"

import * as React from "react"
import { Handle, Position } from "reactflow"
import { X, Clock, Calendar, ShieldCheck, Activity, Globe } from "lucide-react"
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
  const sessions: string[] = filter.sessions || ['ALL']
  const minAtr = filter.minVolatilityATR

  return (
    <div className={`group relative flex min-h-[120px] w-[290px] flex-col justify-between rounded-xl border ${
      selected 
        ? 'border-teal-400 shadow-[0_0_28px_rgba(20,184,166,0.45)] ring-1 ring-teal-400/50 scale-[1.02]' 
        : 'border-teal-500/40 hover:border-teal-400/80 shadow-[0_4px_20px_rgba(0,0,0,0.6)]'
    } bg-gradient-to-b from-[#03231e] via-[#021815] to-[#010e0c] px-4 py-3 backdrop-blur-xl transition-all select-none`}>
      
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
          <div className="h-5 w-5 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center shadow-[0_0_10px_rgba(20,184,166,0.3)]">
            <Globe className="h-3 w-3 text-teal-300" />
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-300">
            SESSION & REGIME FILTER
          </span>
        </div>
        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/40 shadow-[0_0_8px_rgba(20,184,166,0.25)]">
          PRE-TRADE GATE
        </span>
      </div>

      {/* Label */}
      <div className="text-[12.5px] font-bold text-slate-100 leading-snug tracking-tight mb-2">
        {data.label || 'Active Session & Volatility Filter'}
      </div>

      {/* Embedded Visual: 24h Session Timeline Tracker */}
      <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-xs flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[8.5px] font-mono">
          <span className="text-slate-500">00:00 UTC</span>
          <span className="text-teal-700 font-bold">12:00 (NY/LON OVERLAP)</span>
          <span className="text-slate-500">24:00 UTC</span>
        </div>
        {/* 24-hour visual progress bar with highlighted active windows */}
        <div className="relative h-2.5 w-full rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
          {/* Asian session: 00:00 - 08:00 (33%) */}
          <div className="absolute left-0 top-0 h-full w-[33%] bg-slate-200" title="Asia Session" />
          {/* London session: 08:00 - 16:30 (35%) */}
          <div className="absolute left-[33%] top-0 h-full w-[35%] bg-teal-400/50" title="London Session" />
          {/* New York session: 13:00 - 21:00 (33%) */}
          <div className="absolute left-[54%] top-0 h-full w-[33%] bg-teal-500 shadow-xs" title="New York Session" />
          {/* Current Live Time Indicator Pin */}
          <div className="absolute left-[58%] top-0 h-full w-1 bg-slate-800 shadow-xs" />
        </div>
      </div>

      {/* Badges Footer */}
      <div className="mt-2.5 flex items-center justify-between text-[9.5px] font-mono border-t border-teal-500/20 pt-1.5 text-slate-400">
        <div className="flex items-center gap-1.5 text-teal-300">
          <Clock className="h-3 w-3" />
          <span>{sessions.slice(0, 2).join(' / ')}</span>
        </div>
        <div className="flex items-center gap-1 text-emerald-400 font-bold">
          <Activity className="h-3 w-3" />
          <span>{minAtr !== undefined ? `ATR > ${minAtr}%` : 'Vol Pass'}</span>
        </div>
      </div>

      <Handle 
        type="target" 
        position={Position.Top} 
        className="h-3.5 w-3.5 border-2 border-slate-900 bg-teal-400 shadow-[0_0_8px_rgba(20,184,166,0.8)] transition-transform hover:scale-125" 
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="h-3.5 w-3.5 border-2 border-slate-900 bg-teal-400 shadow-[0_0_8px_rgba(20,184,166,0.8)] transition-transform hover:scale-125" 
      />
    </div>
  )
}
