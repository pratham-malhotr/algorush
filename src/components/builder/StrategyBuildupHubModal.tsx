"use client"

import * as React from "react"
import { 
  X, CheckCircle2, ShieldCheck, Zap, TrendingUp, BarChart3, 
  Dna, Code2, ArrowRight, Play, ExternalLink, Activity, 
  Copy, Check, Layers, AlertTriangle, Sparkles, RefreshCw
} from "lucide-react"
import { useBuilderStore } from "@/store/useBuilderStore"
import { usePaperTradingStore } from "@/store/usePaperTradingStore"
import { toast } from "sonner"

interface StrategyBuildupHubModalProps {
  onOpenDeployModal?: () => void;
}

export function StrategyBuildupHubModal({ onOpenDeployModal }: StrategyBuildupHubModalProps) {
  const { 
    isBuildupHubOpen, 
    setIsBuildupHubOpen, 
    lastBuildupReport, 
    setIsOptimizerModalOpen,
    setWorkspaceMode,
    executeFullEndToEndBuild
  } = useBuilderStore()

  const { deployStrategy } = usePaperTradingStore()
  const [copiedCode, setCopiedCode] = React.useState(false)
  const [isDeployingPaper, setIsDeployingPaper] = React.useState(false)

  if (!isBuildupHubOpen || !lastBuildupReport) return null

  const { strategy, backtestResult, verificationAudit, reasoning, riskAssessment, suggestedTweaks, modelUsed } = lastBuildupReport

  const isShort = strategy.action?.type === 'SELL'
  const symbol = strategy.instruments?.[0]?.symbol || 'BTC/USDT'
  const tf = strategy.timeframe || '1h'
  const lev = strategy.action?.leverage || strategy.riskParameters?.leverage || 1
  const sl = strategy.riskParameters?.stopLossPercentage || 3
  const tp = strategy.riskParameters?.takeProfitPercentage || 6
  const trail = strategy.riskParameters?.trailingStopPercentage

  // Deploy to Paper Trading Sandbox
  const handleDeployToPaper = async () => {
    setIsDeployingPaper(true)
    try {
      await new Promise(r => setTimeout(r, 600))
      deployStrategy(strategy)
      toast.success(`🚀 '${strategy.name}' deployed to Paper Trading Sandbox with $100k balance!`)
      setIsBuildupHubOpen(false)
    } catch (err: any) {
      toast.error("Failed to deploy to sandbox: " + err.message)
    } finally {
      setIsDeployingPaper(false)
    }
  }

  // Deploy Live to Exchange
  const handleDeployLive = () => {
    setIsBuildupHubOpen(false)
    if (onOpenDeployModal) {
      onOpenDeployModal()
    }
  }

  // Open Auto-Optimizer
  const handleOpenOptimizer = () => {
    setIsBuildupHubOpen(false)
    setIsOptimizerModalOpen(true)
  }

  // View Code
  const handleViewCode = () => {
    setIsBuildupHubOpen(false)
    setWorkspaceMode('code')
  }

  // Quick incremental tweak
  const handleApplyTweak = (tweak: string) => {
    setIsBuildupHubOpen(false)
    executeFullEndToEndBuild(`Apply this tweak to ${strategy.name}: ${tweak}`)
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="flex h-[90vh] max-h-[760px] w-full max-w-[850px] flex-col overflow-hidden rounded-2xl border border-bg-border bg-bg-surface shadow-2xl">
        {/* ═══ Header ═══ */}
        <div className="flex items-center justify-between border-b border-bg-border px-6 py-3.5 bg-bg-elevated/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[15px] font-bold text-text-primary">
                  {strategy.name}
                </h2>
                <span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  Compiled & Verified
                </span>
              </div>
              <p className="text-[11px] text-text-tertiary">
                Assembled via {modelUsed.includes('3.8') ? 'Gemini 3.8 Flash Frontier Quant Engine' : modelUsed}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsBuildupHubOpen(false)}
            className="rounded-lg p-1.5 text-text-tertiary hover:bg-bg-elevated hover:text-text-primary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ═══ Body Scroll ═══ */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin scrollbar-thumb-bg-border">
          {/* Strategy Anatomy Banner */}
          <div className="rounded-xl border border-bg-border bg-bg-base/70 p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={`px-2.5 py-1 rounded-lg font-bold ${
                isShort 
                  ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30' 
                  : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              }`}>
                {isShort ? '🔻 SHORT / SELL' : '🟢 LONG / BUY'}
              </span>

              <span className="px-2.5 py-1 rounded-lg font-bold bg-accent-blue/10 text-accent-blue border border-accent-blue/20">
                🪙 {symbol}
              </span>

              <span className="px-2.5 py-1 rounded-lg font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                ⏱️ {tf} Timeframe
              </span>

              <span className="px-2.5 py-1 rounded-lg font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                ⚡ {lev}x Leverage
              </span>

              <span className="px-2.5 py-1 rounded-lg font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                🛡️ SL {sl}% | TP {tp}% {trail ? `| Trail ${trail}%` : ''}
              </span>
            </div>

            {verificationAudit?.score && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Audit Score: {verificationAudit.score}/100</span>
              </div>
            )}
          </div>

          {/* Instant 90-Day Backtest Performance Preview */}
          {backtestResult && (
            <div className="rounded-xl border border-accent-blue/30 bg-accent-blue/5 p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-accent-blue" />
                  <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                    Instant 90-Day Backtest Simulation
                  </span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-lg font-mono font-bold text-xs ${
                  (backtestResult.metrics.totalReturnRaw ?? 0) >= 0
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                }`}>
                  {backtestResult.metrics.totalReturn} Total Return
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                <div className="rounded-lg bg-bg-surface/80 border border-bg-border/60 p-2">
                  <span className="block text-[10px] text-text-tertiary mb-0.5">Win Rate</span>
                  <span className="font-mono font-bold text-sm text-emerald-400">{backtestResult.metrics.winRate}</span>
                </div>
                <div className="rounded-lg bg-bg-surface/80 border border-bg-border/60 p-2">
                  <span className="block text-[10px] text-text-tertiary mb-0.5">Profit Factor</span>
                  <span className="font-mono font-bold text-sm text-accent-blue">{backtestResult.metrics.profitFactor}</span>
                </div>
                <div className="rounded-lg bg-bg-surface/80 border border-bg-border/60 p-2">
                  <span className="block text-[10px] text-text-tertiary mb-0.5">Max Drawdown</span>
                  <span className="font-mono font-bold text-sm text-rose-400">{backtestResult.metrics.maxDrawdown}</span>
                </div>
                <div className="rounded-lg bg-bg-surface/80 border border-bg-border/60 p-2">
                  <span className="block text-[10px] text-text-tertiary mb-0.5">Sharpe Ratio</span>
                  <span className="font-mono font-bold text-sm text-accent-blue">{backtestResult.metrics.sharpeRatio}</span>
                </div>
                <div className="rounded-lg bg-bg-surface/80 border border-bg-border/60 p-2">
                  <span className="block text-[10px] text-text-tertiary mb-0.5">Total Trades</span>
                  <span className="font-mono font-bold text-sm text-text-primary">{backtestResult.metrics.totalTrades}</span>
                </div>
                <div className="rounded-lg bg-bg-surface/80 border border-bg-border/60 p-2">
                  <span className="block text-[10px] text-text-tertiary mb-0.5">Friction Model</span>
                  <span className="font-mono font-bold text-sm text-amber-400">0.05% Fee</span>
                </div>
              </div>
            </div>
          )}

          {/* Quant Edge Rationale & Risk Assessment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
            {reasoning && (
              <div className="rounded-xl border border-accent-blue/20 bg-accent-blue/5 p-3.5 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 font-bold text-accent-blue">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Quantitative Edge Rationale</span>
                </div>
                <p className="text-text-secondary leading-relaxed text-[11.5px]">
                  {reasoning}
                </p>
              </div>
            )}

            {riskAssessment && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Liquidation Buffer & Risk Audit</span>
                </div>
                <p className="text-text-secondary leading-relaxed text-[11.5px]">
                  {riskAssessment}
                </p>
              </div>
            )}
          </div>

          {/* Verification Checks */}
          {verificationAudit && verificationAudit.checksPassed && (
            <div className="rounded-xl border border-bg-border bg-bg-base/60 p-3.5 text-xs">
              <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider block mb-2">
                Pre-Flight Validation Checks Passed:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-text-secondary">
                {verificationAudit.checksPassed.map((chk, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{chk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Iterative Refinements */}
          {suggestedTweaks && suggestedTweaks.length > 0 && (
            <div className="rounded-xl border border-bg-border bg-bg-base/40 p-3.5 text-xs">
              <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider block mb-2">
                Suggested Iterative Tweaks:
              </span>
              <div className="flex flex-col gap-1.5">
                {suggestedTweaks.map((tweak, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleApplyTweak(tweak)}
                    className="flex items-center justify-between rounded-lg border border-bg-border bg-bg-surface px-3 py-2 text-left text-[11px] text-text-secondary hover:border-accent-blue hover:text-text-primary transition-all group"
                  >
                    <span>{tweak}</span>
                    <ArrowRight className="h-3 w-3 text-accent-blue opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ═══ Footer: 1-Click End-to-End Action Gateways ═══ */}
        <div className="flex flex-wrap items-center justify-between border-t border-bg-border bg-bg-surface px-6 py-3.5 gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleViewCode}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-bg-elevated border border-bg-border transition-colors"
            >
              <Code2 className="h-3.5 w-3.5 text-accent-blue" />
              <span>Inspect CCXT Code</span>
            </button>

            <button
              type="button"
              onClick={handleOpenOptimizer}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-purple-400 hover:bg-purple-500/10 border border-purple-500/30 transition-colors"
            >
              <Dna className="h-3.5 w-3.5" />
              <span>AI Parameter Sweep</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Deploy to Paper Sandbox */}
            <button
              type="button"
              onClick={handleDeployToPaper}
              disabled={isDeployingPaper}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-bg-elevated hover:bg-bg-base border border-emerald-500/40 text-emerald-400 font-bold text-xs transition-all shadow-sm"
            >
              {isDeployingPaper ? (
                <span className="h-3.5 w-3.5 rounded-full border-2 border-emerald-400/30 border-t-emerald-400 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5 fill-current" />
              )}
              <span>Deploy to Paper Sandbox</span>
            </button>

            {/* Deploy Live to Exchange */}
            <button
              type="button"
              onClick={handleDeployLive}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all hover:scale-102"
            >
              <Zap className="h-3.5 w-3.5 fill-current text-white" />
              <span>Deploy Live Execution</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
