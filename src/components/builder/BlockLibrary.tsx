"use client"

import * as React from "react"
import { Search, ChevronDown, ChevronRight, GripVertical } from "lucide-react"

const CATEGORIES = [
  {
    name: "ENTRY CONDITIONS",
    color: "text-accent-blue",
    bgColor: "bg-accent-blue",
    blocks: [
      { 
        label: "1h EMA Trend Filter (50 > 200)", 
        type: "conditionNode", 
        dsl: { left: { type: 'EMA', timeframe: '1h', parameters: { period: 50 } }, comparator: 'GREATER_THAN', right: { type: 'EMA', timeframe: '1h', parameters: { period: 200 } }, logicalOperator: 'AND' } 
      },
      { 
        label: "Golden Cross (50/200 EMA)", 
        type: "conditionNode", 
        dsl: { left: { type: 'EMA', timeframe: '5m', parameters: { period: 50 } }, comparator: 'CROSSES_ABOVE', right: { type: 'EMA', timeframe: '5m', parameters: { period: 200 } }, logicalOperator: 'AND' } 
      },
      { 
        label: "RSI Oversold (< 30)", 
        type: "conditionNode", 
        dsl: { left: { type: 'RSI', parameters: { period: 14 } }, comparator: 'LESS_THAN', right: 30, logicalOperator: 'AND' } 
      },
      { 
        label: "MACD Signal Line Cross", 
        type: "conditionNode", 
        dsl: { left: { type: 'MACD', parameters: { fast: 12, slow: 26 } }, comparator: 'CROSSES_ABOVE', right: { type: 'MACD_SIGNAL', parameters: { period: 9 } }, logicalOperator: 'AND' } 
      },
      { 
        label: "Bollinger Lower Breakout", 
        type: "conditionNode", 
        dsl: { left: { type: 'PRICE' }, comparator: 'LESS_THAN', right: { type: 'BOLLINGER_LOWER', parameters: { period: 20, multiplier: 2 } }, logicalOperator: 'AND' } 
      },
      { 
        label: "ADX Trend Strength (> 25)", 
        type: "conditionNode", 
        dsl: { left: { type: 'ADX', parameters: { period: 14 } }, comparator: 'GREATER_THAN', right: 25, logicalOperator: 'AND' } 
      },
      { 
        label: "Supertrend Bullish", 
        type: "conditionNode", 
        dsl: { left: { type: 'PRICE' }, comparator: 'GREATER_THAN', right: { type: 'SUPERTREND', parameters: { period: 10, multiplier: 3 } }, logicalOperator: 'AND' } 
      },
      { 
        label: "Volume Spike (1.5x SMA)", 
        type: "conditionNode", 
        dsl: { left: { type: 'VOLUME' }, comparator: 'GREATER_THAN', right: { type: 'VOLUME_SMA', parameters: { period: 20 } }, logicalOperator: 'AND' } 
      },
      { 
        label: "Stochastic Oversold", 
        type: "conditionNode", 
        dsl: { left: { type: 'STOCHASTIC_K', parameters: { period: 14 } }, comparator: 'LESS_THAN', right: 20, logicalOperator: 'AND' } 
      },
    ]
  },
  {
    name: "EXIT CONDITIONS",
    color: "text-accent-green",
    bgColor: "bg-accent-green",
    blocks: [
      { 
        label: "RSI Overbought (> 70)", 
        type: "conditionNode", 
        dsl: { left: { type: 'RSI', parameters: { period: 14 } }, comparator: 'GREATER_THAN', right: 70, logicalOperator: 'OR' } 
      },
      { 
        label: "Death Cross (50/200 EMA)", 
        type: "conditionNode", 
        dsl: { left: { type: 'EMA', parameters: { period: 50 } }, comparator: 'CROSSES_BELOW', right: { type: 'EMA', parameters: { period: 200 } }, logicalOperator: 'OR' } 
      },
      { 
        label: "Bollinger Upper Target", 
        type: "conditionNode", 
        dsl: { left: { type: 'PRICE' }, comparator: 'GREATER_THAN', right: { type: 'BOLLINGER_UPPER', parameters: { period: 20, multiplier: 2 } }, logicalOperator: 'OR' } 
      },
      { 
        label: "Time Since Entry (> 24h)", 
        type: "conditionNode", 
        dsl: { left: { type: 'TIME_SINCE_ENTRY' }, comparator: 'GREATER_THAN', right: 86400, logicalOperator: 'OR' } 
      },
    ]
  },
  {
    name: "EXECUTION & SIZING",
    color: "text-purple-500",
    bgColor: "bg-purple-500",
    blocks: [
      { label: "Buy (50% Account Allocation)", type: "executeNode", dsl: { type: 'BUY', orderType: 'MARKET', quantityType: 'PERCENT_OF_ACCOUNT', quantityValue: 50 } },
      { label: "Buy (Volatility Risk Sizing 1%)", type: "executeNode", dsl: { type: 'BUY', orderType: 'MARKET', quantityType: 'VOLATILITY_RISK_PCT', quantityValue: 1 } },
      { label: "Buy (Half-Kelly Optimal Size)", type: "executeNode", dsl: { type: 'BUY', orderType: 'MARKET', quantityType: 'KELLY_CRITERION', quantityValue: 0.5 } },
      { label: "Sell Position (Short)", type: "executeNode", dsl: { type: 'SELL', orderType: 'MARKET', quantityType: 'PERCENT_OF_ACCOUNT', quantityValue: 50 } },
      { label: "Close Position", type: "executeNode", dsl: { type: 'CLOSE_POSITION' } },
    ]
  },
  {
    name: "RISK MANAGEMENT",
    color: "text-accent-amber",
    bgColor: "bg-accent-amber",
    blocks: [
      { label: "Stop Loss (3%) & Take Profit (6%)", type: "riskNode", dsl: { stopLossPercentage: 3, takeProfitPercentage: 6, riskPerTradePct: 1 } },
      { label: "ATR Trailing Stop Loss (2%)", type: "riskNode", dsl: { trailingStopPercentage: 2, stopLossPercentage: 2.5 } },
      { label: "Max Daily Drawdown Guard (5%)", type: "riskNode", dsl: { maxDailyDrawdownPct: 5, stopLossPercentage: 3 } },
    ]
  }
]

export function BlockLibrary() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [openCategories, setOpenCategories] = React.useState<Record<string, boolean>>({
    "ENTRY CONDITIONS": true,
    "EXIT CONDITIONS": true,
    "EXECUTION": true,
    "RISK MANAGEMENT": true,
  })

  const toggleCategory = (name: string) => {
    setOpenCategories(prev => ({ ...prev, [name]: !prev[name] }))
  }

  const onDragStart = (event: React.DragEvent, nodeType: string, label: string, category: string, dslData: any) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.setData('application/label', label)
    event.dataTransfer.setData('application/category', category)
    event.dataTransfer.setData('application/dsl', JSON.stringify(dslData))
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="flex h-full w-[260px] shrink-0 flex-col border-r border-bg-border bg-bg-surface">
      <div className="p-4 pb-2">
        <h3 className="mb-3 text-[12px] font-bold uppercase tracking-wider text-text-secondary">Block Library</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search blocks..." 
            className="h-[36px] w-full rounded-md border border-bg-border bg-bg-elevated pl-9 pr-3 text-[13px] text-text-primary outline-none placeholder:text-text-tertiary focus:border-accent-blue focus:shadow-[0_0_0_2px_rgba(59,130,246,0.15)] transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const filteredBlocks = cat.blocks.filter(b => 
            !searchQuery || b.label.toLowerCase().includes(searchQuery.toLowerCase())
          );

          if (searchQuery && filteredBlocks.length === 0) return null;

          return (
            <div key={cat.name} className="mb-2">
              <button
                onClick={() => toggleCategory(cat.name)}
                className="flex w-full items-center justify-between rounded px-2 py-2 hover:bg-black/5"
              >
                <div className="flex items-center gap-2">
                  {openCategories[cat.name] || searchQuery ? (
                    <ChevronDown className="h-4 w-4 text-text-secondary" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-text-secondary" />
                  )}
                  <span className={`text-[12px] font-bold uppercase ${cat.color}`}>{cat.name}</span>
                </div>
                <span className="text-[10px] font-mono text-text-tertiary font-bold px-1.5 py-0.5 rounded bg-bg-elevated">
                  {filteredBlocks.length}
                </span>
              </button>

              {(openCategories[cat.name] || searchQuery) && (
                <div className="mt-1 flex flex-col gap-2 pl-2 pr-1 pb-3">
                  {filteredBlocks.map((block) => (
                    <div
                      key={block.label}
                      className="group relative flex h-[52px] w-full cursor-grab items-center justify-between rounded-lg border border-bg-border bg-black/5 backdrop-blur-md px-3 active:cursor-grabbing hover:border-accent-blue/50 hover:bg-bg-surface hover:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all"
                      draggable
                      onDragStart={(e) => onDragStart(e, block.type, block.label, cat.name, block.dsl)}
                    >
                      <div className="absolute inset-0 -z-10 rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: `linear-gradient(to right, transparent, rgba(59,130,246,0.05))` }} />
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-bg-elevated group-hover:bg-accent-blue/10 transition-colors`}>
                          <div className={`h-2 w-2 rounded-full ${cat.bgColor} shadow-[0_0_8px_currentColor]`} />
                        </div>
                        <span className="text-[12px] font-semibold text-text-primary truncate">{block.label}</span>
                      </div>
                      <GripVertical className="h-4 w-4 shrink-0 text-text-tertiary opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  )
}

