"use client"

import * as React from "react"
import { Search, ChevronDown, ChevronRight, GripVertical, Sparkles, X, Zap, ArrowRight } from "lucide-react"
import { useBuilderStore } from "@/store/useBuilderStore"
import { toast } from "sonner"

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
        label: "Ichimoku Tenkan/Kijun Cross", 
        type: "conditionNode", 
        dsl: { left: { type: 'ICHIMOKU_TENKAN', parameters: { conversion: 9 } }, comparator: 'CROSSES_ABOVE', right: { type: 'ICHIMOKU_KIJUN', parameters: { base: 26 } }, logicalOperator: 'AND' } 
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
        label: "Binance Funding Rate Filter (< 0%)", 
        type: "conditionNode", 
        dsl: { left: { type: 'FUNDING_RATE' }, comparator: 'LESS_THAN', right: 0.0, logicalOperator: 'AND' } 
      },
      { 
        label: "Orderbook Imbalance (> 65% Buy)", 
        type: "conditionNode", 
        dsl: { left: { type: 'ORDERBOOK_IMBALANCE' }, comparator: 'GREATER_THAN', right: 65, logicalOperator: 'AND' } 
      },
      { 
        label: "Stochastic Oversold (< 20)", 
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
      { label: "Market Buy (50% Account)", type: "executeNode", dsl: { type: 'BUY', orderType: 'MARKET', quantityType: 'PERCENT_OF_ACCOUNT', quantityValue: 50 } },
      { label: "Limit Order (Post-Only)", type: "executeNode", dsl: { type: 'BUY', orderType: 'LIMIT', quantityType: 'PERCENT_OF_ACCOUNT', quantityValue: 50 } },
      { label: "Volatility Risk Sizing (1%)", type: "executeNode", dsl: { type: 'BUY', orderType: 'MARKET', quantityType: 'VOLATILITY_RISK_PCT', quantityValue: 1 } },
      { label: "Half-Kelly Optimal Size", type: "executeNode", dsl: { type: 'BUY', orderType: 'MARKET', quantityType: 'KELLY_CRITERION', quantityValue: 0.5 } },
      { label: "TWAP Execution (Binance)", type: "executeNode", dsl: { type: 'BUY', orderType: 'TWAP', quantityType: 'PERCENT_OF_ACCOUNT', quantityValue: 50 } },
      { label: "Grid Step Limit Order", type: "executeNode", dsl: { type: 'BUY', orderType: 'GRID_LIMIT', quantityType: 'PERCENT_OF_ACCOUNT', quantityValue: 25 } },
      { label: "Sell Position (Short)", type: "executeNode", dsl: { type: 'SELL', orderType: 'MARKET', quantityType: 'PERCENT_OF_ACCOUNT', quantityValue: 50 } },
      { label: "Close Position", type: "executeNode", dsl: { type: 'CLOSE_POSITION' } },
    ]
  },
  {
    name: "CONFLUENCE & LOGIC",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500",
    blocks: [
      { label: "Confluence Gate (All True / AND)", type: "logicGateNode", dsl: { operator: 'ALL_TRUE', threshold: 2 } },
      { label: "Disjunctive Gate (Any True / OR)", type: "logicGateNode", dsl: { operator: 'ANY_TRUE', threshold: 1 } },
      { label: "Weighted Confluence (Score >= 2)", type: "logicGateNode", dsl: { operator: 'WEIGHTED_SCORE', threshold: 2 } },
    ]
  },
  {
    name: "FILTERS & REGIMES",
    color: "text-teal-400",
    bgColor: "bg-teal-500",
    blocks: [
      { label: "Session Filter (London & NY)", type: "filterNode", dsl: { sessions: ['LONDON', 'NEW_YORK'], daysOfWeek: [1, 2, 3, 4, 5] } },
      { label: "Volatility Regime Filter (ATR > 1.2%)", type: "filterNode", dsl: { minVolatilityATR: 1.2 } },
      { label: "Weekday Filter (Mon - Fri Only)", type: "filterNode", dsl: { daysOfWeek: [1, 2, 3, 4, 5] } },
    ]
  },
  {
    name: "STAGED TP LADDERS",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500",
    blocks: [
      { 
        label: "3-Tier TP Ladder (TP1 + BE, TP2, TP3)", 
        type: "takeProfitLadderNode", 
        dsl: [
          { targetPercentage: 2.5, allocationPercentage: 50, moveToBreakEven: true },
          { targetPercentage: 5.0, allocationPercentage: 30 },
          { targetPercentage: 8.0, allocationPercentage: 20, trailingStopPct: 1.5 }
        ] 
      },
    ]
  },
  {
    name: "ALERTS & WEBHOOKS",
    color: "text-indigo-400",
    bgColor: "bg-indigo-500",
    blocks: [
      { label: "Discord Execution Webhook", type: "webhookNode", dsl: { channel: 'DISCORD', triggerEvents: ['ORDER_FILLED', 'SL_HIT', 'TP_HIT'] } },
      { label: "Telegram Signal Dispatcher", type: "webhookNode", dsl: { channel: 'TELEGRAM', triggerEvents: ['SIGNAL_TRIGGERED', 'ORDER_FILLED'] } },
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
      { label: "Binance Futures Leverage (10x Cross)", type: "riskNode", dsl: { leverage: 10, marginMode: 'CROSS', stopLossPercentage: 2 } },
    ]
  }
]

export function BlockLibrary() {
  const { addChatMessage } = useBuilderStore()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [openCategories, setOpenCategories] = React.useState<Record<string, boolean>>({
    "CONFLUENCE & LOGIC": true,
    "ENTRY CONDITIONS": true,
    "FILTERS & REGIMES": true,
    "EXECUTION & SIZING": true,
    "STAGED TP LADDERS": true,
    "ALERTS & WEBHOOKS": true,
    "EXIT CONDITIONS": true,
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
    <div className="flex h-full w-full flex-col bg-bg-surface overflow-hidden">
      <div className="p-3 pb-2">
        <h3 className="mb-3 text-[12px] font-bold uppercase tracking-wider text-text-secondary flex items-center justify-between">
          <span>Quant Block Library</span>
          <span className="text-[10px] text-accent-blue font-semibold">Pro Indicators</span>
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search EMA, RSI, Grid, Binance..." 
            className="h-[36px] w-full rounded-md border border-bg-border bg-bg-elevated pl-9 pr-8 text-[13px] text-text-primary outline-none placeholder:text-text-tertiary focus:border-accent-blue focus:shadow-[0_0_0_2px_rgba(59,130,246,0.15)] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary p-0.5 rounded transition-colors"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-thin scrollbar-thumb-bg-border">
        {searchQuery.trim().length > 1 && (
          <div className="mb-3 rounded-xl border border-accent-blue/30 bg-accent-blue/10 p-2.5 flex flex-col gap-1.5 shadow-sm">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-accent-blue">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span>Ask Gemini Flash 8B</span>
            </div>
            <p className="text-[10px] text-text-secondary leading-snug line-clamp-2">
              Compile &ldquo;{searchQuery}&rdquo; into canvas strategy
            </p>
            <button
              type="button"
              onClick={() => {
                addChatMessage({ role: 'user', content: searchQuery })
                toast.info(`Sent to AI Copilot: "${searchQuery}"`)
              }}
              className="mt-0.5 flex items-center justify-center gap-1 w-full py-1 px-2 rounded-lg bg-accent-blue text-white text-[11px] font-bold hover:bg-blue-600 transition-colors shadow-xs"
            >
              <span>Build with AI</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        )}
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
                  <span className={`text-[11px] font-bold uppercase ${cat.color}`}>{cat.name}</span>
                </div>
                <span className="text-[10px] font-mono text-text-tertiary font-bold px-1.5 py-0.5 rounded bg-bg-elevated">
                  {filteredBlocks.length}
                </span>
              </button>

              {(openCategories[cat.name] || searchQuery) && (
                <div className="mt-1 flex flex-col gap-1.5 pl-2 pr-1 pb-2">
                  {filteredBlocks.map((block) => (
                    <div
                      key={block.label}
                      className="group relative flex h-[48px] w-full cursor-grab items-center justify-between rounded-lg border border-bg-border bg-bg-base px-3 active:cursor-grabbing hover:border-accent-blue/50 hover:bg-bg-surface hover:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all"
                      draggable
                      onDragStart={(e) => onDragStart(e, block.type, block.label, cat.name, block.dsl)}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-bg-elevated group-hover:bg-accent-blue/10 transition-colors">
                          <div className={`h-2 w-2 rounded-full ${cat.bgColor}`} />
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
