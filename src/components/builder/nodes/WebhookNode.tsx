"use client"

import * as React from "react"
import { Handle, Position } from "reactflow"
import { X, BellRing, Send, Radio, Check } from "lucide-react"
import { useBuilderStore } from "@/store/useBuilderStore"
import { toast } from "sonner"

export function WebhookNode({ id, data, selected }: { id: string; data: any; selected?: boolean }) {
  const setNodes = useBuilderStore((state) => state.setNodes)
  const setEdges = useBuilderStore((state) => state.setEdges)

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setNodes((nds) => nds.filter((node) => node.id !== id))
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id))
  }

  const webhook = data.dslWebhook || { channel: 'DISCORD', triggerEvents: ['ORDER_FILLED', 'SL_HIT', 'TP_HIT'] }

  const handleTestPing = (e: React.MouseEvent) => {
    e.stopPropagation()
    toast.success(`⚡ Test ping dispatched to ${webhook.channel || 'Webhook'}!`)
  }

  return (
    <div className={`group relative flex min-h-[90px] w-[270px] flex-col justify-center rounded-xl border ${
      selected 
        ? 'border-indigo-400 shadow-[0_0_25px_rgba(99,102,241,0.4)] scale-[1.02]' 
        : 'border-indigo-500/50 hover:border-indigo-400'
    } bg-[#0e1026] px-5 py-3.5 shadow-[var(--shadow-card)] backdrop-blur-md transition-all hover:scale-[1.02]`}>
      
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
          <BellRing className="h-3.5 w-3.5 text-indigo-400" />
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-indigo-400">
            DISPATCH & WEBHOOK
          </span>
        </div>
        <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          {webhook.channel || 'REST'}
        </span>
      </div>

      <span className="text-[13px] font-semibold text-text-primary leading-snug">
        {data.label || 'Real-Time Alert Dispatcher'}
      </span>

      {/* Action Footer */}
      <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-indigo-500/20">
        <div className="flex items-center gap-1 text-[10px] text-indigo-300 font-mono">
          <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
          <span>Active Listener</span>
        </div>
        <button
          onClick={handleTestPing}
          className="text-[10px] text-indigo-300 hover:text-white px-2 py-0.5 rounded bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 transition-colors"
        >
          Test Ping
        </button>
      </div>

      <Handle 
        type="target" 
        position={Position.Top} 
        className="h-4 w-4 border-2 border-bg-base bg-indigo-400 transition-transform hover:scale-125" 
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="h-4 w-4 border-2 border-bg-base bg-indigo-400 transition-transform hover:scale-125" 
      />
    </div>
  )
}
