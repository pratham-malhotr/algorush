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
            {/* Metrics Row */}
            <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-6">
              {[
                { label: "Total Return", value: backtestResult.metrics.totalReturn, color: backtestResult.metrics.totalReturn.startsWith('-') ? "text-accent-red" : "text-accent-green" },
                { label: "Win Rate", value: backtestResult.metrics.winRate, color: "text-text-primary" },
                { label: "Max Drawdown", value: backtestResult.metrics.maxDrawdown, color: "text-accent-red" },
                { label: "Sharpe Ratio", value: backtestResult.metrics.sharpeRatio, color: "text-text-primary" },
                { label: "Total Trades", value: backtestResult.metrics.totalTrades, color: "text-text-primary" },
                { label: "Avg Duration", value: backtestResult.metrics.avgDuration, color: "text-text-primary" },
              ].map((metric) => (
                <div key={metric.label} className="flex flex-col rounded-lg border border-bg-border bg-bg-base p-4">
                  <span className="mb-1 text-[12px] text-text-secondary">{metric.label}</span>
                  <span className={`font-mono text-[18px] font-bold ${metric.color}`}>{metric.value}</span>
                </div>
              ))}
            </div>

            {/* Equity Curve Chart */}
            <div className="mb-8 h-[220px] w-full rounded-lg border border-bg-border bg-bg-base p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={backtestResult.equityCurve}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-bg-border)" vertical={false} />
              <XAxis dataKey="date" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
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
