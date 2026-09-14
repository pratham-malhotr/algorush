"use client"

import * as React from "react"
import { Handle, Position } from "reactflow"
import { X, GitMerge, Cpu, CheckCircle2 } from "lucide-react"
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

  const label = isAll 
    ? 'CONFLUENCE GATE (ALL MUST BE TRUE)' 
    : isAny 
    ? 'DISJUNCTIVE GATE (ANY TRIGGER VALID)' 
    : `WEIGHTED CONFLUENCE (SCORE >= ${gate.threshold || 2})`

  return (
    <div className={`group relative flex min-h-[90px] w-[270px] flex-col justify-center rounded-xl border ${
      selected 
        ? 'border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.4)] scale-[1.02]' 
        : 'border-cyan-500/50 hover:border-cyan-400'
    } bg-[#041924] px-5 py-3.5 shadow-[var(--shadow-card)] backdrop-blur-md transition-all hover:scale-[1.02]`}>
      
      {/* Delete button */}
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
          <GitMerge className="h-3.5 w-3.5 text-cyan-400" />
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-cyan-400">
            LOGIC CONFLUENCE
          </span>
        </div>
        <span className={`text-[9.5px] font-bold font-mono px-1.5 py-0.5 rounded border ${
          isAll 
            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' 
            : isAny 
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
            : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
        }`}>
          {gate.operator?.replace('_', ' ')}
        </span>
      </div>

      <span className="text-[13px] font-semibold text-text-primary leading-snug">
        {data.label || label}
      </span>

      <div className="mt-2 flex items-center justify-between text-[10.5px] text-text-tertiary font-mono pt-1.5 border-t border-cyan-500/20">
        <span className="flex items-center gap-1 text-cyan-300">
          <Cpu className="h-3 w-3" />
          <span>Synchronous DAG Gate</span>
        </span>
        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
          <CheckCircle2 className="h-3 w-3" />
          <span>Multi-Path</span>
        </span>
      </div>

      {/* ReactFlow Handles: Target on top (takes multiple inputs), Source on bottom */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="h-4 w-4 border-2 border-bg-base bg-cyan-400 transition-transform hover:scale-125" 
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="h-4 w-4 border-2 border-bg-base bg-cyan-400 transition-transform hover:scale-125" 
      />
    </div>
  )
}
