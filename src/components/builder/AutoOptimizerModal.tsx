"use client"

import * as React from "react"
import { X, Sparkles, Sliders, RefreshCw, CheckCircle2, TrendingUp, ShieldCheck, Flame, ArrowRight, Dna } from "lucide-react"
import { useBuilderStore } from "@/store/useBuilderStore"
import { runGeneticOptimization, OptimizationResult, CandidateChromosome } from "@/lib/optimizer/geneticEngine"
import { toast } from "sonner"

interface AutoOptimizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AutoOptimizerModal({ isOpen, onClose }: AutoOptimizerModalProps) {
  const { strategyDSL, strategyName, updateStrategy } = useBuilderStore()

  const [targetMetric, setTargetMetric] = React.useState<"SHARPE" | "WIN_RATE" | "MIN_DRAWDOWN">("SHARPE")
  const [generations, setGenerations] = React.useState<number>(30)
  const [isOptimizing, setIsOptimizing] = React.useState(false)
  const [results, setResults] = React.useState<OptimizationResult | null>(null)
  const [selectedCandidate, setSelectedCandidate] = React.useState<CandidateChromosome | null>(null)

  if (!isOpen) return null

  const handleRunOptimizer = async () => {
    setIsOptimizing(true)
    await new Promise(r => setTimeout(r, 900))

    try {
      const optRes = runGeneticOptimization(strategyDSL, targetMetric, generations)
      setResults(optRes)
      setSelectedCandidate(optRes.bestChromosome)
      toast.success(`Genetic Optimization Complete! Evaluated ${generations * 10} parameter combinations.`)
    } catch (e: any) {
      toast.error("Error executing optimization sweep: " + e.message)
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleApplyParameters = () => {
    if (!selectedCandidate || !strategyDSL) return

    const updatedDSL = {
      ...strategyDSL,
      name: `${strategyName} (AI Optimized)`,
      entryConditions: [
        {
          id: 'opt-entry-1',
          left: { type: 'EMA' as const, parameters: { period: selectedCandidate.genes.ema_fast } },
          comparator: 'CROSSES_ABOVE' as const,
          right: { type: 'EMA' as const, parameters: { period: selectedCandidate.genes.ema_slow } },
          logicalOperator: 'AND' as const
        },
        {
          id: 'opt-entry-2',
          left: { type: 'RSI' as const, parameters: { period: selectedCandidate.genes.rsi_period } },
          comparator: 'LESS_THAN' as const,
          right: 42
        }
      ],
      riskParameters: {
        ...strategyDSL.riskParameters,
        stopLossPercentage: selectedCandidate.genes.stop_loss,
        takeProfitPercentage: selectedCandidate.genes.take_profit
      }
    }

    updateStrategy(updatedDSL)
    toast.success(`Applied AI Genetic parameters to Visual Strategy Builder!`)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="flex h-[660px] w-full max-w-[840px] flex-col overflow-hidden rounded-2xl border border-bg-border bg-bg-surface shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-bg-border px-6 py-4">
          <div>
            <h2 className="text-[18px] font-bold text-text-primary flex items-center gap-2">
              <Dna className="h-5 w-5 text-accent-blue" />
              <span>AI Genetic Parameter Auto-Optimizer</span>
              <span className="rounded bg-accent-blue/10 px-2 py-0.5 text-[11px] font-bold text-accent-blue border border-accent-blue/20">
                Sharpe Multi-Sweep
              </span>
            </h2>
            <p className="text-[12px] text-text-secondary mt-0.5">
              Auto-tune RSI periods, EMA lengths, and SL/TP ratios for <strong className="text-text-primary">{strategyName}</strong> across 500+ parameter variations.
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-text-tertiary hover:bg-bg-elevated hover:text-text-primary">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-bg-border">
          {/* Controls Row */}
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-bg-border bg-bg-base p-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold uppercase tracking-wider text-text-secondary">Optimization Fitness Goal</label>
              <select
                value={targetMetric}
                onChange={(e) => setTargetMetric(e.target.value as any)}
                className="h-10 w-full rounded-xl border border-bg-border bg-bg-surface px-3 text-[13px] font-semibold text-text-primary outline-none focus:border-accent-blue cursor-pointer"
              >
                <option value="SHARPE">Maximize Sharpe Ratio (Best Risk-Adjusted)</option>
                <option value="WIN_RATE">Maximize Win Rate (%)</option>
                <option value="MIN_DRAWDOWN">Minimize Max Drawdown (%)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-bold uppercase tracking-wider text-text-secondary">Evolution Generations</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="10"
                  value={generations}
                  onChange={(e) => setGenerations(Number(e.target.value))}
                  className="flex-1 accent-accent-blue"
                />
                <span className="font-mono text-[13px] font-bold text-accent-blue w-12 text-right">{generations} Gen</span>
              </div>
            </div>
          </div>

          {/* Action Trigger */}
          {!results && (
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-bg-border bg-bg-base">
              <Sparkles className="h-10 w-10 text-accent-blue mb-3 animate-pulse" />
              <h3 className="text-[16px] font-bold text-text-primary mb-1">Ready to Evolve Parameters</h3>
              <p className="text-[13px] text-text-secondary max-w-[480px] mb-6">
                Click run to launch genetic parameter mutation. AlgoText will simulate 300+ backtest iterations to find the peak Sharpe Ratio.
              </p>
              <button
                onClick={handleRunOptimizer}
                disabled={isOptimizing}
                className="flex items-center gap-2 rounded-xl bg-accent-blue px-6 py-2.5 text-[13px] font-bold text-white hover:bg-blue-600 shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all"
              >
                {isOptimizing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Evolving Chromosomes...
                  </>
                ) : (
                  <>
                    <Flame className="h-4 w-4 text-amber-300" /> Run Genetic Auto-Optimizer
                  </>
                )}
              </button>
            </div>
          )}

          {/* Results Display */}
          {results && (
            <div className="space-y-4">
              {/* Baseline vs Best Comparison */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-bg-border bg-bg-base p-4 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Current Strategy Baseline</span>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-text-secondary">Sharpe Ratio:</span>
                    <strong className="font-mono text-text-primary">{results.baselineMetrics.sharpeRatio.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-text-secondary">Total Return:</span>
                    <strong className="font-mono text-accent-green">+{results.baselineMetrics.totalReturnPct.toFixed(1)}%</strong>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-text-secondary">Max Drawdown:</span>
                    <strong className="font-mono text-accent-red">-{results.baselineMetrics.maxDrawdownPct.toFixed(1)}%</strong>
                  </div>
                </div>

                <div className="rounded-xl border border-accent-green/30 bg-accent-green/10 p-4 space-y-2 shadow-sm">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-accent-green flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" /> Best Evolved Candidate (Gen {results.bestChromosome.generation})
                  </span>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-text-secondary">Optimal Sharpe Ratio:</span>
                    <strong className="font-mono text-accent-blue font-bold text-[15px]">{results.bestChromosome.metrics.sharpeRatio}</strong>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-text-secondary">Optimized Return:</span>
                    <strong className="font-mono text-accent-green font-bold">+{results.bestChromosome.metrics.totalReturnPct}%</strong>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-text-secondary">Optimized Drawdown:</span>
                    <strong className="font-mono text-amber-500 font-bold">-{results.bestChromosome.metrics.maxDrawdownPct}%</strong>
                  </div>
                </div>
              </div>

              {/* Top 5 Candidates List */}
              <div className="space-y-2">
                <span className="text-[12px] font-bold uppercase tracking-wider text-text-secondary">Top Evolved Parameter Chromosomes</span>
                <div className="space-y-2">
                  {results.topCandidates.map((cand) => {
                    const isSelected = selectedCandidate?.id === cand.id
                    return (
                      <button
                        key={cand.id}
                        onClick={() => setSelectedCandidate(cand)}
                        className={`flex w-full items-center justify-between rounded-xl border p-3.5 text-left transition-all ${
                          isSelected
                            ? "border-accent-blue bg-accent-blue/10 shadow-sm"
                            : "border-bg-border bg-bg-base hover:border-text-tertiary"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-elevated font-mono font-bold text-xs text-accent-blue">
                            G{cand.generation}
                          </div>
                          <div>
                            <div className="font-mono text-[12.5px] font-bold text-text-primary">
                              EMA({cand.genes.ema_fast}/{cand.genes.ema_slow}) • RSI({cand.genes.rsi_period}) • SL {cand.genes.stop_loss}% • TP {cand.genes.take_profit}%
                            </div>
                            <span className="text-[11px] text-text-tertiary">
                              Fitness Score: <strong className="text-accent-blue">{cand.metrics.score}</strong> | Win Rate: {cand.metrics.winRatePct}%
                            </span>
                          </div>
                        </div>

                        <div className="text-right font-mono text-[13px]">
                          <span className="block font-bold text-accent-green">+{cand.metrics.totalReturnPct}%</span>
                          <span className="text-[11px] text-text-tertiary">Sharpe: {cand.metrics.sharpeRatio}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-bg-border bg-bg-base px-6 py-4">
          <div className="flex items-center gap-2 text-[12px] text-text-tertiary">
            <ShieldCheck className="h-4 w-4 text-accent-green" />
            <span>Deterministic Mutation Engine • Zero Overfitting Guard</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-xl border border-bg-border bg-bg-surface px-4 py-2.5 text-[13px] font-semibold text-text-secondary hover:bg-bg-elevated transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyParameters}
              disabled={!selectedCandidate}
              className="flex items-center gap-2 rounded-xl bg-accent-green px-6 py-2.5 text-[13px] font-bold text-white hover:bg-green-600 shadow-lg shadow-green-500/20 disabled:opacity-50 transition-all"
            >
              <CheckCircle2 className="h-4 w-4" /> Apply AI Parameters to Canvas
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
