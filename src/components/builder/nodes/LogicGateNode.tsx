"use client"

import * as React from "react"
import { Handle, Position } from "reactflow"
import { X, GitMerge, Cpu, CheckCircle2, ShieldAlert } from "lucide-react"
import { useBuilderStore } from "@/store/useBuilderStore"

export function LogicGateNode({ id, data, selected }: { id: string; data: any; selected?: boolean }) {
  const setNodes = useBuilderStore((state) => state.setNodes)
  const setEdges = useBuilderStore((state) => state.setEdges)

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setNodes((nds) => nds.filter((node) => node.id !== id))
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id))
  }

  const gate = data.dslGate || { operator: 'ALL_TRUE', threshold: 2 }
  const isAll = gate.operator === 'ALL_TRUE'
  const isAny = gate.operator === 'ANY_TRUE'
  const isWeighted = gate.operator === 'WEIGHTED_SCORE'

  const operatorLabel = isAll 
    ? 'CONFLUENCE (AND)' 
    : isAny 
    ? 'DISJUNCTIVE (OR)' 
    : `WEIGHTED (≥ ${gate.threshold || 2})`

  return (
    <div className={`group relative flex min-h-[120px] w-[290px] flex-col justify-between rounded-xl border ${
      selected 
        ? 'border-cyan-400 shadow-[0_0_28px_rgba(6,182,212,0.45)] ring-1 ring-cyan-400/50 scale-[1.02]' 
        : 'border-cyan-500/40 hover:border-cyan-400/80 shadow-[0_4px_20px_rgba(0,0,0,0.6)]'
    } bg-gradient-to-b from-[#061e2c] via-[#041620] to-[#020d14] px-4 py-3 backdrop-blur-xl transition-all select-none`}>
      
      {/* Delete button */}
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
          <div className="h-5 w-5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.3)]">
            <GitMerge className="h-3 w-3 text-cyan-300" />
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300">
            LOGIC CONFLUENCE
          </span>
        </div>
        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
          isAll 
            ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.25)]' 
            : isAny 
            ? 'bg-amber-500/15 text-amber-300 border-amber-500/40' 
            : 'bg-purple-500/15 text-purple-300 border-purple-500/40'
        }`}>
          {operatorLabel}
        </span>
      </div>

      {/* Label */}
      <div className="text-[12.5px] font-bold text-slate-100 leading-snug tracking-tight mb-2">
        {data.label || 'Multi-Signal Confluence Gate'}
      </div>

      {/* Embedded SVG Logic Convergence Diagram */}
      <div className="relative h-[42px] w-full rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-between px-3 overflow-hidden shadow-xs">
        {/* Left Inputs */}
        <div className="flex flex-col gap-1 text-[8.5px] font-mono font-semibold">
          <div className="flex items-center gap-1 text-cyan-700 font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-600 shadow-xs" />
            <span>SIG_A (OK)</span>
          </div>
          <div className="flex items-center gap-1 text-cyan-700 font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-600 shadow-xs" />
            <span>SIG_B (OK)</span>
          </div>
        </div>

        {/* Center SVG Converging Rays */}
        <svg className="h-7 w-20" viewBox="0 0 80 28" fill="none">
          <path d="M 0 6 C 25 6, 35 14, 50 14" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="3 2" />
          <path d="M 0 22 C 25 22, 35 14, 50 14" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="3 2" />
          <polygon points="50,10 60,14 50,18" fill="#0284c7" />
          <circle cx="68" cy="14" r="5" fill="#ecfdf5" stroke="#059669" strokeWidth="1.5" />
          <circle cx="68" cy="14" r="2.5" fill="#059669" />
        </svg>

        {/* Right Output */}
        <div className="flex flex-col items-end text-[8.5px] font-mono">
          <span className="text-emerald-700 font-bold uppercase tracking-wider">PASSED</span>
          <span className="text-slate-500 text-[8px]">True DAG</span>
        </div>
      </div>

      {/* Telemetry Footer */}
      <div className="mt-2.5 flex items-center justify-between text-[9.5px] font-mono border-t border-cyan-500/20 pt-1.5 text-slate-400">
        <span className="flex items-center gap-1 text-cyan-300">
          <Cpu className="h-3 w-3" />
          <span>Synchronous DAG</span>
        </span>
        <span className="text-emerald-400 font-bold flex items-center gap-0.5">
          <CheckCircle2 className="h-3 w-3" />
          <span>Zero-Lag</span>
        </span>
      </div>

      {/* ReactFlow Handles: Target on top, Source on bottom */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="h-3.5 w-3.5 border-2 border-slate-900 bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)] transition-transform hover:scale-125" 
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="h-3.5 w-3.5 border-2 border-slate-900 bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)] transition-transform hover:scale-125" 
      />
    </div>
  )
}
