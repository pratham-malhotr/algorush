"use client"

import * as React from "react"
import { Handle, Position } from "reactflow"
import { X, BellRing, Send, Radio, Check, Wifi } from "lucide-react"
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
    toast.success(`⚡ Test packet dispatched to ${webhook.channel || 'Webhook'} endpoint!`, {
      description: "Payload delivered in 1.4ms via Async Webhook Worker."
    })
  }

  return (
    <div className={`group relative flex min-h-[120px] w-[290px] flex-col justify-between rounded-xl border ${
      selected 
        ? 'border-indigo-400 shadow-[0_0_28px_rgba(99,102,241,0.45)] ring-1 ring-indigo-400/50 scale-[1.02]' 
        : 'border-indigo-500/40 hover:border-indigo-400/80 shadow-[0_4px_20px_rgba(0,0,0,0.6)]'
    } bg-gradient-to-b from-[#111638] via-[#0b0e24] to-[#060814] px-4 py-3 backdrop-blur-xl transition-all select-none`}>
      
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
          <div className="h-5 w-5 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.3)]">
            <BellRing className="h-3 w-3 text-indigo-300" />
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-300">
            DISPATCH & WEBHOOK
          </span>
        </div>
        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/40 shadow-[0_0_8px_rgba(99,102,241,0.25)]">
          {webhook.channel || 'REST / HOOK'}
        </span>
      </div>

      {/* Label */}
      <div className="text-[12.5px] font-bold text-slate-100 leading-snug tracking-tight mb-2">
        {data.label || 'Real-Time Alert Dispatcher'}
      </div>

      {/* Embedded SVG Packet Pulse Waveform */}
      <div className="relative h-[34px] w-full rounded-lg bg-black/40 border border-indigo-500/20 px-2.5 flex items-center justify-between overflow-hidden">
        <div className="flex items-center gap-1.5 text-[9px] font-mono text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
          <span>HTTP 200 OK</span>
        </div>

        {/* SVG Transmission Pulse */}
        <svg className="h-6 w-24" viewBox="0 0 100 24" fill="none">
          <path 
            d="M 0 12 L 20 12 L 25 4 L 32 20 L 38 7 L 44 14 L 48 12 L 100 12" 
            stroke="#818cf8" 
            strokeWidth="1.75" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        </svg>

        <button
          onClick={handleTestPing}
          className="text-[8.5px] font-mono text-indigo-300 hover:text-white px-2 py-0.5 rounded bg-indigo-500/25 hover:bg-indigo-500/40 border border-indigo-500/40 transition-colors shadow-xs"
        >
          Ping
        </button>
      </div>

      {/* Footer */}
      <div className="mt-2.5 flex items-center justify-between text-[9.5px] font-mono border-t border-indigo-500/20 pt-1.5 text-slate-400">
        <div className="flex items-center gap-1 text-indigo-300">
          <Wifi className="h-3 w-3 text-emerald-400" />
          <span>Low-Latency Socket</span>
        </div>
        <span className="text-slate-400 text-[9px]">TLS 1.3 Validated</span>
      </div>

      <Handle 
        type="target" 
        position={Position.Top} 
        className="h-3.5 w-3.5 border-2 border-slate-900 bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)] transition-transform hover:scale-125" 
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="h-3.5 w-3.5 border-2 border-slate-900 bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)] transition-transform hover:scale-125" 
      />
    </div>
  )
}
