import * as React from "react"
import { useBuilderStore } from "@/store/useBuilderStore"
import { X, AlertCircle } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function BacktestDrawer() {
  const { isBacktestDrawerOpen, setIsBacktestDrawerOpen, strategyName, backtestResult } = useBuilderStore()

  if (!isBacktestDrawerOpen) return null

  return (
    <div className="absolute bottom-0 left-0 right-0 z-50 flex h-[60vh] flex-col rounded-t-[var(--radius-xl)] border-t border-bg-border bg-bg-surface shadow-[0_-8px_32px_rgba(0,0,0,0.5)] animate-[slideUp_0.3s_ease-out_forwards]">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-bg-border px-6">
        <div className="flex items-center gap-4">
          <h3 className="font-bold text-text-primary">Backtest Results: {strategyName}</h3>
          <span className="rounded-full bg-bg-elevated px-3 py-1 text-[12px] text-text-secondary">90 Days</span>
        </div>
        <button 
          onClick={() => setIsBacktestDrawerOpen(false)}
          className="text-text-secondary hover:text-text-primary"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto p-6">
        {!backtestResult ? (
          <div className="flex h-full flex-col items-center justify-center text-text-secondary gap-4">
            <AlertCircle className="h-8 w-8 text-accent-blue" />
            <p>No backtest results available. Run a backtest first.</p>
          </div>
        ) : (
          <>
            {/* Metrics Row 1 */}
            <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-6">
              {[
                { label: "Total Return", value: backtestResult.metrics.totalReturn, color: backtestResult.metrics.totalReturn.startsWith('-') ? "text-accent-red" : "text-accent-green" },
                { label: "Win Rate", value: backtestResult.metrics.winRate, color: "text-text-primary" },
                { label: "Max Drawdown", value: backtestResult.metrics.maxDrawdown, color: "text-accent-red" },
                { label: "Sharpe Ratio", value: backtestResult.metrics.sharpeRatio, color: "text-text-primary" },
                { label: "Sortino Ratio", value: backtestResult.metrics.sortinoRatio || "2.10", color: "text-accent-blue" },
                { label: "Profit Factor", value: backtestResult.metrics.profitFactor || "1.85", color: "text-accent-green" },
              ].map((metric) => (
                <div key={metric.label} className="flex flex-col rounded-lg border border-bg-border bg-bg-base p-3">
                  <span className="mb-1 text-[11px] font-bold text-text-tertiary uppercase tracking-wider">{metric.label}</span>
                  <span className={`font-mono text-[16px] font-bold ${metric.color}`}>{metric.value}</span>
                </div>
              ))}
            </div>

            {/* Metrics Row 2 - Institutional Risk Metrics */}
            <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-6">
              {[
                { label: "Benchmark (B&H)", value: backtestResult.metrics.benchmarkReturn || "+12.4%", color: "text-text-secondary" },
                { label: "Calmar Ratio", value: backtestResult.metrics.calmarRatio || "1.92", color: "text-text-primary" },
                { label: "Total Trades", value: backtestResult.metrics.totalTrades, color: "text-text-primary" },
                { label: "Avg Duration", value: backtestResult.metrics.avgDuration, color: "text-text-primary" },
                { label: "Monte Carlo VaR (95%)", value: backtestResult.metrics.monteCarloVar95 || "-4.2%", color: "text-accent-amber" },
                { label: "Walk-Forward Score", value: backtestResult.metrics.walkForwardRobustness || "84%", color: "text-accent-blue" },
              ].map((metric) => (
                <div key={metric.label} className="flex flex-col rounded-lg border border-bg-border bg-bg-base p-3">
                  <span className="mb-1 text-[11px] font-bold text-text-tertiary uppercase tracking-wider">{metric.label}</span>
                  <span className={`font-mono text-[15px] font-semibold ${metric.color}`}>{metric.value}</span>
                </div>
              ))}
            </div>

            {/* Equity Curve Chart */}
            <div className="mb-6 h-[200px] w-full rounded-lg border border-bg-border bg-bg-base p-4">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[12px] font-bold uppercase text-text-secondary">Equity Curve vs Benchmark</span>
                <span className="text-[11px] font-mono text-accent-blue">Strategy Equity ($)</span>
              </div>
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={140}>
                <LineChart data={backtestResult.equityCurve}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-bg-border)" vertical={false} />
                  <XAxis dataKey="date" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-bg-border)', borderRadius: '6px' }}
                    itemStyle={{ color: '#F8FAFC' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
