"use client"

import * as React from "react"
import { Handle, Position } from "reactflow"
import { X, TrendingUp, TrendingDown, ArrowRight, ShieldCheck, Zap, Layers } from "lucide-react"
import { useBuilderStore } from "@/store/useBuilderStore"

export function ExecuteNode({ id, data, selected }: { id: string; data: any; selected?: boolean }) {
  const setNodes = useBuilderStore((state) => state.setNodes)
  const setEdges = useBuilderStore((state) => state.setEdges)

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setNodes((nds) => nds.filter((node) => node.id !== id))
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id))
  }

  const action = data.dslAction || {}
  const isShort = action.type === 'SELL'
  const isClose = action.type === 'CLOSE_POSITION'

  const title = isClose ? 'Close Position' : isShort ? 'Short Execution' : 'Long Execution'
  const isBuy = !isShort && !isClose

  const qtyStr = action.quantityType === 'FIXED_USD' || action.quantityType === 'USD_VALUE'
    ? `$${action.quantityValue || 1000}`
    : action.quantityType === 'KELLY_CRITERION'
    ? `Kelly (${action.quantityValue || 0.5})`
    : `${action.quantityValue || 10}% Portfolio`

  const leverageStr = action.leverage && action.leverage > 1 ? `${action.leverage}x Isolated` : '1x Spot'
  const orderType = action.orderType || 'MARKET'

  return (
    <div 
      className={`group relative flex w-[320px] flex-col rounded-2xl border-2 p-4 shadow-2xl backdrop-blur-xl transition-all duration-200 ${
        selected 
          ? 'border-white shadow-[0_0_35px_rgba(255,255,255,0.45)] scale-[1.03]' 
          : isBuy
          ? 'border-emerald-500/40 hover:border-emerald-400 bg-gradient-to-b from-[#0a2012]/95 via-[#05130b]/98 to-[#030905]/95'
          : isShort
          ? 'border-rose-500/40 hover:border-rose-400 bg-gradient-to-b from-[#250d0d]/95 via-[#150606]/98 to-[#0b0303]/95'
          : 'border-purple-500/40 hover:border-purple-400 bg-gradient-to-b from-[#180e29]/95 via-[#0d0717]/98 to-[#07030d]/95'
      }`}
      style={{
        boxShadow: selected 
          ? '0 0 30px rgba(16,185,129,0.4), inset 0 1px 0 rgba(255,255,255,0.1)' 
          : `0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)`
      }}
    >
      {/* Top Ambient Glow Line */}
      <div 
        className="absolute -top-[2px] left-6 right-6 h-[2px] rounded-full blur-[1px]" 
        style={{ 
          background: isBuy 
            ? 'linear-gradient(90deg, transparent, #10b981, transparent)' 
            : isShort
            ? 'linear-gradient(90deg, transparent, #f43f5e, transparent)'
            : 'linear-gradient(90deg, transparent, #a855f7, transparent)'
        }}
      />

      {/* Delete Button */}
      <button 
        onClick={onDelete}
        className="absolute right-2.5 top-2.5 hidden h-6 w-6 items-center justify-center rounded-lg bg-slate-800/90 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-700/60 transition-all group-hover:flex z-10"
        title="Remove Execution Node"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isBuy ? 'bg-emerald-400' : isShort ? 'bg-rose-400' : 'bg-purple-400'
            }`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              isBuy ? 'bg-emerald-400' : isShort ? 'bg-rose-400' : 'bg-purple-400'
            }`} />
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${
            isBuy ? 'text-emerald-400' : isShort ? 'text-rose-400' : 'text-purple-400'
          }`}>
            ORDER EXECUTION
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span className={`text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded border ${
            isBuy 
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
              : isShort 
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
              : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
          }`}>
            {orderType}
          </span>
          <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60">
            {title}
          </span>
        </div>
      </div>

      {/* Main Execution Title */}
      <div className="mb-3">
        <div className="flex items-center gap-2">
          {isBuy ? (
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shrink-0">
              <TrendingUp className="h-4 w-4" />
            </div>
          ) : isShort ? (
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400 shrink-0">
              <TrendingDown className="h-4 w-4" />
            </div>
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-400 shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
          )}
          <div>
            <h4 className="text-[14px] font-bold text-white tracking-tight leading-tight">
              {isBuy ? `BUY / LONG ${qtyStr}` : isShort ? `SHORT / SELL ${qtyStr}` : 'FLATTEN POSITION'}
            </h4>
            <span className="text-[10px] font-mono text-slate-400">
              Leverage: <span className="text-emerald-400 font-bold">{leverageStr}</span>
            </span>
          </div>
        </div>
      </div>

      {/* ═══ VISUAL ORDER EXECUTION LADDER GRAPHIC ═══ */}
      <div className="mb-2.5 rounded-xl border border-slate-200 bg-white p-2.5 shadow-xs">
        <div className="flex items-center justify-between text-[9px] font-mono mb-1.5">
          <span className="flex items-center gap-1 text-slate-700 font-bold">
            <Layers className="h-2.5 w-2.5 text-blue-600" />
            <span>Smart Routing</span>
          </span>
          <span className="text-emerald-700 font-bold">Maker 0.02% • Taker 0.04%</span>
        </div>

        {/* Visual Depth Fill Meter */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[9.5px] font-mono">
            <span className="text-slate-600">Target Allocation:</span>
            <span className="text-slate-900 font-bold">{qtyStr}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                isBuy 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-xs' 
                  : 'bg-gradient-to-r from-rose-500 to-amber-500 shadow-xs'
              }`}
              style={{ width: `${Math.min(100, Math.max(25, action.quantityValue || 50))}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[8.5px] font-mono text-slate-500 pt-0.5">
            <span>Slippage: &lt;0.03%</span>
            <span>Route: Binance USDT-M Direct</span>
          </div>
        </div>
      </div>

      {/* Footer Status */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] font-mono">
        <div className="flex items-center gap-1 text-slate-400">
          <Zap className="h-3 w-3 text-amber-400" />
          <span>Speed: <span className="text-slate-200">1.2ms DMA</span></span>
        </div>
        <span className="text-emerald-400 font-bold flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Ready
        </span>
      </div>

      {/* ReactFlow Handles */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className={`h-4 w-4 border-2 border-slate-900 transition-transform hover:scale-125 ${
          isBuy ? 'bg-emerald-400' : isShort ? 'bg-rose-400' : 'bg-purple-400'
        }`}
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className={`h-4 w-4 border-2 border-slate-900 transition-transform hover:scale-125 ${
          isBuy ? 'bg-emerald-400' : isShort ? 'bg-rose-400' : 'bg-purple-400'
        }`}
      />
    </div>
  )
}
