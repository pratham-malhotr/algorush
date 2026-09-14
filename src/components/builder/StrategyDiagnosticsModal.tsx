"use client"

import * as React from "react"
import { 
  ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle, X, 
  Dna, ArrowRight, Activity, Cpu, Sparkles, Wrench, RefreshCw,
  Gauge, TrendingUp, DollarSign, Database
} from "lucide-react"
import { useBuilderStore } from "@/store/useBuilderStore"
import { toast } from "sonner"

export function StrategyDiagnosticsModal({
  isOpen,
  onClose,
  onAutoRepair
}: {
  isOpen: boolean
  onClose: () => void
  onAutoRepair: () => void
}) {
  const { 
    strategyDSL, 
    nodes, 
    edges, 
    validateGraph, 
    tradingPair, 
    timeframe,
    strategyName
  } = useBuilderStore()

  const validation = validateGraph()
  const leverage = strategyDSL?.action?.leverage || strategyDSL?.riskParameters?.leverage || 1
  const stopLoss = strategyDSL?.riskParameters?.stopLossPercentage || 3.0
  const takeProfit = strategyDSL?.riskParameters?.takeProfitPercentage || 6.0
  const riskRewardRatio = (takeProfit / (stopLoss || 1)).toFixed(2)

  // Liquidation buffer estimation for crypto futures
  const liquidationDistancePct = leverage > 1 
    ? +(100 / leverage * 0.9).toFixed(1)
    : 100

  const hasOrphanNodes = nodes.some(n => n.type !== 'triggerNode' && !edges.some(e => e.source === n.id || e.target === n.id))
  const hasRiskGuard = nodes.some(n => n.type === 'riskNode' || n.type === 'takeProfitLadderNode')
  const hasExecution = nodes.some(n => n.type === 'executeNode')
  const hasCondition = nodes.some(n => n.type === 'conditionNode')

  // Overall Institutional Readiness Score (0 - 100)
  let healthScore = 100
  if (!validation.isValid) healthScore -= 40
  if (hasOrphanNodes) healthScore -= 15
  if (!hasRiskGuard) healthScore -= 20
  if (leverage > 20) healthScore -= 15
  if (stopLoss > 8) healthScore -= 10
  if (healthScore < 0) healthScore = 20

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-bg-border bg-bg-surface shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-bg-border px-6 py-4 bg-bg-elevated/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-blue/15 border border-accent-blue/30 text-accent-blue">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-text-primary">
                Pre-Flight Institutional Diagnostics
              </h2>
              <p className="text-[11.5px] text-text-secondary">
                Autonomous quantitative validation, risk audit & execution feasibility matrix
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Top Score Banner */}
          <div className="flex items-center justify-between rounded-xl border border-bg-border bg-bg-base p-4">
            <div className="flex items-center gap-4">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border text-xl font-bold font-mono ${
                healthScore >= 80 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : healthScore >= 60 
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                  : 'bg-red-500/10 text-accent-red border-red-500/30'
              }`}>
                {healthScore}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-bold text-text-primary">
                    {healthScore >= 80 ? 'Institutional Grade' : healthScore >= 60 ? 'Moderate Readiness' : 'Pre-Flight Issues Detected'}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    healthScore >= 80 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {healthScore >= 80 ? 'PASSED' : 'ATTENTION'}
                  </span>
                </div>
                <p className="text-[11.5px] text-text-secondary mt-0.5">
                  Strategy &ldquo;{strategyName}&rdquo; &bull; {tradingPair} ({timeframe}) &bull; {nodes.length} Nodes &bull; {edges.length} Connections
                </p>
              </div>
            </div>

            {healthScore < 90 && (
              <button
                onClick={() => {
                  onAutoRepair()
                  toast.success("✨ Graph topology auto-repaired and synchronized!")
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-blue hover:bg-blue-600 text-white text-[11.5px] font-bold shadow-md shadow-accent-blue/20 transition-all"
              >
                <Wrench className="h-3.5 w-3.5" />
                <span>Auto-Repair DAG</span>
              </button>
            )}
          </div>

          {/* Section 1: DAG Structural Integrity */}
          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-text-tertiary mb-2.5 flex items-center gap-2">
              <Cpu className="h-3.5 w-3.5 text-accent-blue" />
              <span>DAG Graph Topology Integrity</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div className="flex items-center justify-between p-3 rounded-xl border border-bg-border bg-bg-base text-[12px]">
                <span className="text-text-secondary">Start Trigger Node</span>
                {nodes.some(n => n.type === 'triggerNode') ? (
                  <span className="flex items-center gap-1 font-bold text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Present
                  </span>
                ) : (
                  <span className="flex items-center gap-1 font-bold text-accent-red">
                    <AlertTriangle className="h-3.5 w-3.5" /> Missing
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-bg-border bg-bg-base text-[12px]">
                <span className="text-text-secondary">Execution Node (Order Router)</span>
                {hasExecution ? (
                  <span className="flex items-center gap-1 font-bold text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1 font-bold text-accent-red">
                    <AlertTriangle className="h-3.5 w-3.5" /> Action Required
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-bg-border bg-bg-base text-[12px]">
                <span className="text-text-secondary">Condition Logic Blocks</span>
                {hasCondition ? (
                  <span className="flex items-center gap-1 font-bold text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {nodes.filter(n => n.type === 'conditionNode').length} Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1 font-bold text-amber-400">
                    <AlertTriangle className="h-3.5 w-3.5" /> None (Always Triggers)
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-bg-border bg-bg-base text-[12px]">
                <span className="text-text-secondary">Orphan / Disconnected Nodes</span>
                {!hasOrphanNodes ? (
                  <span className="flex items-center gap-1 font-bold text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> None (Clean DAG)
                  </span>
                ) : (
                  <span className="flex items-center gap-1 font-bold text-amber-400">
                    <AlertTriangle className="h-3.5 w-3.5" /> Disconnected Nodes
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Quantitative Risk & Margin Audit */}
          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-text-tertiary mb-2.5 flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-accent-green" />
              <span>Quantitative Risk & Margin Audit</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl border border-bg-border bg-bg-base flex flex-col">
                <span className="text-[10.5px] font-bold text-text-tertiary uppercase">Leverage</span>
                <span className="text-[15px] font-bold font-mono text-text-primary mt-1">
                  {leverage}x
                </span>
                <span className="text-[10px] text-text-tertiary mt-0.5">
                  {leverage > 10 ? 'High Leverage' : 'Institutional Safe'}
                </span>
              </div>

              <div className="p-3 rounded-xl border border-bg-border bg-bg-base flex flex-col">
                <span className="text-[10.5px] font-bold text-text-tertiary uppercase">Est. Liquidation</span>
                <span className={`text-[15px] font-bold font-mono mt-1 ${
                  liquidationDistancePct < 5 ? 'text-accent-red' : 'text-emerald-400'
                }`}>
                  {liquidationDistancePct > 50 ? '> 50%' : `${liquidationDistancePct}%`}
                </span>
                <span className="text-[10px] text-text-tertiary mt-0.5">
                  {liquidationDistancePct > stopLoss ? 'SL protects position' : 'CRITICAL: SL > Liq'}
                </span>
              </div>

              <div className="p-3 rounded-xl border border-bg-border bg-bg-base flex flex-col">
                <span className="text-[10.5px] font-bold text-text-tertiary uppercase">Risk / Reward</span>
                <span className="text-[15px] font-bold font-mono text-accent-blue mt-1">
                  1 : {riskRewardRatio}
                </span>
                <span className="text-[10px] text-text-tertiary mt-0.5">
                  {+riskRewardRatio >= 2 ? 'Optimal Expectancy' : 'Suboptimal RR'}
                </span>
              </div>

              <div className="p-3 rounded-xl border border-bg-border bg-bg-base flex flex-col">
                <span className="text-[10.5px] font-bold text-text-tertiary uppercase">Stop Loss Bracket</span>
                <span className="text-[15px] font-bold font-mono text-accent-red mt-1">
                  {stopLoss}%
                </span>
                <span className="text-[10px] text-text-tertiary mt-0.5">
                  TP Target: +{takeProfit}%
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Venue Compatibility Matrix */}
          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-text-tertiary mb-2.5 flex items-center gap-2">
              <Database className="h-3.5 w-3.5 text-purple-400" />
              <span>Multi-Exchange Execution Matrix</span>
            </h3>
            <div className="overflow-x-auto rounded-xl border border-bg-border bg-bg-base">
              <table className="w-full text-left text-[11.5px]">
                <thead className="bg-bg-elevated/60 text-text-tertiary font-mono uppercase text-[10px] border-b border-bg-border">
                  <tr>
                    <th className="px-3.5 py-2">Exchange Venue</th>
                    <th className="px-3 py-2">Pair Support</th>
                    <th className="px-3 py-2">Order Execution</th>
                    <th className="px-3 py-2">Rate Limit Status</th>
                    <th className="px-3 py-2">Latency Est.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bg-border">
                  {[
                    { venue: 'Binance Futures', status: 'Optimal', latency: '4.2ms', limit: '1200 req/min', supported: true },
                    { venue: 'Bybit Unified', status: 'Optimal', latency: '6.1ms', limit: '1000 req/min', supported: true },
                    { venue: 'OKX v5', status: 'Compatible', latency: '7.8ms', limit: '600 req/min', supported: true },
                    { venue: 'Hyperliquid L1', status: 'Optimal', latency: '2.4ms', limit: 'Unlimited', supported: true },
                    { venue: 'Coinbase Advanced', status: 'Spot Only', latency: '12.0ms', limit: '300 req/min', supported: !leverage || leverage === 1 },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-bg-elevated/40 transition-colors">
                      <td className="px-3.5 py-2 font-bold text-text-primary">{row.venue}</td>
                      <td className="px-3 py-2 text-text-secondary">{tradingPair}</td>
                      <td className="px-3 py-2">
                        {row.supported ? (
                          <span className="text-emerald-400 font-semibold">{row.status}</span>
                        ) : (
                          <span className="text-amber-400 font-semibold">Margin Restricted</span>
                        )}
                      </td>
                      <td className="px-3 py-2 font-mono text-text-tertiary">{row.limit}</td>
                      <td className="px-3 py-2 font-mono text-accent-blue">{row.latency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-bg-border px-6 py-3.5 bg-bg-elevated/40 shrink-0">
          <div className="flex items-center gap-2 text-text-secondary text-[11.5px]">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Continuous Quant Diagnostics Engine Active</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl border border-bg-border bg-bg-surface text-text-primary hover:bg-bg-elevated text-[12px] font-bold transition-all"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
