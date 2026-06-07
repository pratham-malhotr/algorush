import * as React from "react"
import { useBuilderStore } from "@/store/useBuilderStore"
import { X } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const mockData = [
  { date: 'Jan', value: 10000 },
  { date: 'Feb', value: 10500 },
  { date: 'Mar', value: 10200 },
  { date: 'Apr', value: 11800 },
  { date: 'May', value: 11500 },
  { date: 'Jun', value: 13200 },
  { date: 'Jul', value: 13840 },
]

export function BacktestDrawer() {
  const { isBacktestDrawerOpen, setIsBacktestDrawerOpen, strategyName } = useBuilderStore()

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
        {/* Metrics Row */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-6">
          {[
            { label: "Total Return", value: "+38.4%", color: "text-accent-green" },
            { label: "Win Rate", value: "68.2%", color: "text-text-primary" },
            { label: "Max Drawdown", value: "-12.1%", color: "text-accent-red" },
            { label: "Sharpe Ratio", value: "2.14", color: "text-text-primary" },
            { label: "Total Trades", value: "142", color: "text-text-primary" },
            { label: "Avg Duration", value: "4h 22m", color: "text-text-primary" },
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
            <LineChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2836" vertical={false} />
              <XAxis dataKey="date" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#151B24', border: '1px solid #1E2836', borderRadius: '6px' }}
                itemStyle={{ color: '#F8FAFC' }}
              />
              <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
