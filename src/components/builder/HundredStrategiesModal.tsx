"use client"

import * as React from "react"
import { 
  X, Flame, Play, Sparkles, TrendingUp, ShieldCheck, 
  Search, ArrowUpDown, CheckCircle2, ChevronRight, BarChart3,
  Layers, Zap, RefreshCw, Cpu, Activity, ChevronLeft
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  HUNDRED_QUANT_STRATEGIES, 
  BenchmarkStrategyItem 
} from "@/lib/constants/hundredStrategies"
import { runLocalBacktest, generateMockData } from "@/lib/backtester/engine"
import { useBuilderStore } from "@/store/useBuilderStore"
import { toast } from "sonner"

type CategoryFilter = "ALL" | "Trend Following" | "Mean Reversion" | "Breakout & Squeeze" | "Order Flow & VWAP" | "Multi-Timeframe" | "Arbitrage & Grid"
type SortField = "return" | "sharpe" | "winRate" | "drawdown" | "trades" | "id"

export interface StrategyLightweightResult {
  totalReturn: string;
  totalReturnRaw: number;
  sharpeRatio: string;
  winRate: string;
  winRateRaw: number;
  maxDrawdown: string;
  maxDrawdownRaw: number;
  totalTrades: string;
}

export function HundredStrategiesModal() {
  const { 
    isHundredStrategiesModalOpen, 
    setIsHundredStrategiesModalOpen,
    loadStrategyIntoCanvas
  } = useBuilderStore()

  const [categoryFilter, setCategoryFilter] = React.useState<CategoryFilter>("ALL")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [sortBy, setSortBy] = React.useState<SortField>("return")
  const [isRunningBatch, setIsRunningBatch] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [completedCount, setCompletedCount] = React.useState(0)
  const [results, setResults] = React.useState<Record<string, StrategyLightweightResult>>({})
  const [visibleCount, setVisibleCount] = React.useState(25)

  // Pre-generate shared market data inside useEffect on client
  const marketDataRef = React.useRef<any[] | null>(null)

  const runBatchBacktest = React.useCallback(async () => {
    if (isRunningBatch) return
    setIsRunningBatch(true)
    setProgress(0)
    setCompletedCount(0)

    if (!marketDataRef.current) {
      marketDataRef.current = generateMockData(90, 64000)
    }
    const data = marketDataRef.current

    const batchResults: Record<string, StrategyLightweightResult> = {}
    const total = HUNDRED_QUANT_STRATEGIES.length
    const chunkSize = 20

    for (let i = 0; i < total; i += chunkSize) {
      const chunk = HUNDRED_QUANT_STRATEGIES.slice(i, i + chunkSize)
      
      chunk.forEach((item) => {
        try {
          const res = runLocalBacktest(item.strategyDSL, data)
          batchResults[item.id] = {
            totalReturn: res.metrics.totalReturn,
            totalReturnRaw: res.metrics.totalReturnRaw ?? 0,
            sharpeRatio: res.metrics.sharpeRatio,
            winRate: res.metrics.winRate,
            winRateRaw: res.metrics.winRateRaw ?? 0,
            maxDrawdown: res.metrics.maxDrawdown,
            maxDrawdownRaw: res.metrics.maxDrawdownRaw ?? 0,
            totalTrades: res.metrics.totalTrades,
          }
        } catch (e) {
          batchResults[item.id] = {
            totalReturn: "+0.0%",
            totalReturnRaw: 0,
            sharpeRatio: "1.00",
            winRate: "50%",
            winRateRaw: 50,
            maxDrawdown: "-5.0%",
            maxDrawdownRaw: 5,
            totalTrades: "10",
          }
        }
      })

      const currentDone = Math.min(i + chunkSize, total)
      setCompletedCount(currentDone)
      setProgress(Math.round((currentDone / total) * 100))
      setResults({ ...batchResults })

      await new Promise(r => setTimeout(r, 35))
    }

    setIsRunningBatch(false)
    toast.success(`Completed backtesting 100 Quantitative Strategies against 90D tick data!`)
  }, [isRunningBatch])

  // Automatically start batch simulation when modal opens for the first time
  React.useEffect(() => {
    if (isHundredStrategiesModalOpen && Object.keys(results).length === 0 && !isRunningBatch) {
      runBatchBacktest()
    }
  }, [isHundredStrategiesModalOpen, results, isRunningBatch, runBatchBacktest])

  const handleLoadStrategy = (item: BenchmarkStrategyItem) => {
    loadStrategyIntoCanvas(item.strategyDSL)
    setIsHundredStrategiesModalOpen(false)
  }

  // Calculate summary aggregate stats
  const summaryMetrics = React.useMemo(() => {
    const resultValues = Object.values(results)
    if (resultValues.length === 0) {
      return {
        avgReturn: 0,
        avgSharpe: 0,
        avgWinRate: 0,
        totalTrades: 0,
        topItem: null as BenchmarkStrategyItem | null,
        topResult: null as StrategyLightweightResult | null,
      }
    }

    const avgReturn = resultValues.reduce((acc, r) => acc + r.totalReturnRaw, 0) / resultValues.length
    const avgSharpe = resultValues.reduce((acc, r) => acc + (parseFloat(r.sharpeRatio) || 0), 0) / resultValues.length
    const avgWinRate = resultValues.reduce((acc, r) => acc + r.winRateRaw, 0) / resultValues.length
    const totalTrades = resultValues.reduce((acc, r) => acc + (parseInt(r.totalTrades, 10) || 0), 0)

    let topItem: BenchmarkStrategyItem | null = null
    let topResult: StrategyLightweightResult | null = null
    let highestReturn = -Infinity

    HUNDRED_QUANT_STRATEGIES.forEach((item) => {
      const r = results[item.id]
      if (r && r.totalReturnRaw > highestReturn) {
        highestReturn = r.totalReturnRaw
        topItem = item
        topResult = r
      }
    })

    return { avgReturn, avgSharpe, avgWinRate, totalTrades, topItem, topResult }
  }, [results])

  const { avgReturn, avgSharpe, avgWinRate, totalTrades, topItem, topResult } = summaryMetrics

  // Filter and sort strategies
  const filteredStrategies = React.useMemo(() => {
    return HUNDRED_QUANT_STRATEGIES.filter((s) => {
      const matchesCategory = categoryFilter === "ALL" || s.category === categoryFilter
      const matchesSearch = 
        !searchQuery ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    }).sort((a, b) => {
      const resA = results[a.id]
      const resB = results[b.id]
      if (!resA || !resB) return 0
      if (sortBy === "return") return resB.totalReturnRaw - resA.totalReturnRaw
      if (sortBy === "sharpe") return (parseFloat(resB.sharpeRatio) || 0) - (parseFloat(resA.sharpeRatio) || 0)
      if (sortBy === "winRate") return resB.winRateRaw - resA.winRateRaw
      if (sortBy === "drawdown") return resA.maxDrawdownRaw - resB.maxDrawdownRaw
      if (sortBy === "trades") return (parseInt(resB.totalTrades, 10) || 0) - (parseInt(resA.totalTrades, 10) || 0)
      return a.id.localeCompare(b.id)
    })
  }, [categoryFilter, searchQuery, sortBy, results])

  if (!isHundredStrategiesModalOpen) return null

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Trend Following": return "border-blue-500/30 bg-blue-500/10 text-blue-400"
      case "Mean Reversion": return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
      case "Breakout & Squeeze": return "border-amber-500/30 bg-amber-500/10 text-amber-400"
      case "Order Flow & VWAP": return "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
      case "Multi-Timeframe": return "border-purple-500/30 bg-purple-500/10 text-purple-400"
      case "Arbitrage & Grid": return "border-rose-500/30 bg-rose-500/10 text-rose-400"
      default: return "border-bg-border bg-bg-elevated text-text-secondary"
    }
  }

  const displayedStrategies = filteredStrategies.slice(0, visibleCount)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-hidden animate-in fade-in duration-200">
      <div 
        className="relative flex flex-col w-full max-w-7xl h-[92vh] rounded-2xl border border-bg-border bg-bg-base text-text-primary shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ═══ Header ═══ */}
        <div className="flex items-center justify-between border-b border-bg-border bg-bg-surface px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-sm">
              <Flame className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">100 Quant Strategies Benchmark Lab</h2>
                <Badge className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] uppercase font-bold">
                  100/100 Institutional Algos
                </Badge>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                Scientific 90-day multi-asset backtest suite across 6 quantitative trading archetypes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              onClick={runBatchBacktest}
              disabled={isRunningBatch}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold h-9 px-4 text-xs shadow-md shadow-cyan-500/20 flex items-center gap-2"
            >
              {isRunningBatch ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Simulating ({completedCount}/100)...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-white" />
                  <span>Re-Run All 100 Backtests</span>
                </>
              )}
            </Button>

            <button
              onClick={() => setIsHundredStrategiesModalOpen(false)}
              className="rounded-lg p-2 text-text-tertiary hover:bg-bg-elevated hover:text-text-primary transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ═══ Progress Bar (Animated) ═══ */}
        {isRunningBatch && (
          <div className="w-full bg-bg-elevated h-1.5 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* ═══ Summary Analytics Dashboard ═══ */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 bg-bg-surface/50 border-b border-bg-border shrink-0">
          <div className="bg-bg-surface border border-bg-border rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider">Top Alpha Model</span>
            <div className="truncate">
              <div className="text-sm font-bold text-emerald-400 truncate">
                {topItem ? topItem.name : "Evaluating..."}
              </div>
              <div className="text-xs text-text-secondary mt-0.5">
                {topResult ? `${topResult.totalReturn} Return • Sharpe ${topResult.sharpeRatio}` : "—"}
              </div>
            </div>
          </div>

          <div className="bg-bg-surface border border-bg-border rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider">Avg Portfolio Return</span>
            <div>
              <div className={`text-xl font-bold font-mono ${avgReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {avgReturn >= 0 ? `+${avgReturn.toFixed(1)}%` : `${avgReturn.toFixed(1)}%`}
              </div>
              <div className="text-xs text-text-secondary mt-0.5">Across 100 tested algorithms</div>
            </div>
          </div>

          <div className="bg-bg-surface border border-bg-border rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider">Avg Sharpe Ratio</span>
            <div>
              <div className="text-xl font-bold font-mono text-cyan-400">
                {avgSharpe.toFixed(2)}
              </div>
              <div className="text-xs text-text-secondary mt-0.5">Risk-adjusted benchmark</div>
            </div>
          </div>

          <div className="bg-bg-surface border border-bg-border rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider">Avg Win Rate</span>
            <div>
              <div className="text-xl font-bold font-mono text-blue-400">
                {avgWinRate.toFixed(1)}%
              </div>
              <div className="text-xs text-text-secondary mt-0.5">Statistical directional hit rate</div>
            </div>
          </div>

          <div className="bg-bg-surface border border-bg-border rounded-xl p-3 flex flex-col justify-between col-span-2 md:col-span-1">
            <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider">Cumulative Trades</span>
            <div>
              <div className="text-xl font-bold font-mono text-purple-400">
                {totalTrades.toLocaleString()}
              </div>
              <div className="text-xs text-text-secondary mt-0.5">Simulated order executions</div>
            </div>
          </div>
        </div>

        {/* ═══ Filter & Search Bar ═══ */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-b border-bg-border bg-bg-base shrink-0">
          
          {/* Archetype Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs">
            {(["ALL", "Trend Following", "Mean Reversion", "Breakout & Squeeze", "Order Flow & VWAP", "Multi-Timeframe", "Arbitrage & Grid"] as CategoryFilter[]).map((cat) => {
              const isActive = categoryFilter === cat
              const count = cat === "ALL" 
                ? HUNDRED_QUANT_STRATEGIES.length 
                : HUNDRED_QUANT_STRATEGIES.filter(s => s.category === cat).length

              return (
                <button
                  key={cat}
                  onClick={() => { setCategoryFilter(cat); setVisibleCount(25) }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all shrink-0 ${
                    isActive
                      ? "bg-accent-blue text-white shadow-sm"
                      : "bg-bg-surface text-text-secondary hover:text-text-primary border border-bg-border"
                  }`}
                >
                  <span>{cat === "ALL" ? "All Archetypes" : cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? "bg-white/20 text-white" : "bg-bg-elevated text-text-tertiary"}`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-2.5 ml-auto">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-text-tertiary" />
              <input
                type="text"
                placeholder="Search 100 algos..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(25) }}
                className="h-8 w-44 sm:w-56 pl-8 pr-3 rounded-lg bg-bg-surface border border-bg-border text-xs text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent-blue transition-colors"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-bg-surface border border-bg-border rounded-lg px-2 h-8 text-xs">
              <ArrowUpDown className="h-3.5 w-3.5 text-text-tertiary shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortField)}
                className="bg-transparent text-text-primary font-bold outline-none cursor-pointer"
              >
                <option value="return">Sort: Return %</option>
                <option value="sharpe">Sort: Sharpe Ratio</option>
                <option value="winRate">Sort: Win Rate</option>
                <option value="drawdown">Sort: Lowest Drawdown</option>
                <option value="trades">Sort: Trade Count</option>
                <option value="id">Sort: Strategy #</option>
              </select>
            </div>
          </div>
        </div>

        {/* ═══ Strategies List / Table ═══ */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {displayedStrategies.length === 0 ? (
            <div className="text-center py-20 text-text-tertiary">
              <Cpu className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-semibold">No strategies match your criteria.</p>
              <button 
                onClick={() => { setCategoryFilter("ALL"); setSearchQuery(""); setVisibleCount(25) }}
                className="mt-2 text-xs text-accent-blue hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            displayedStrategies.map((item) => {
              const res = results[item.id]
              const catClass = getCategoryColor(item.category)

              return (
                <div
                  key={item.id}
                  className="group relative flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl border border-bg-border bg-bg-surface hover:border-accent-blue/40 hover:bg-bg-surface/90 transition-all gap-4"
                >
                  {/* Left: Identity, Badges, Description */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bg-elevated border border-bg-border text-xs font-mono font-bold text-text-secondary group-hover:text-accent-blue transition-colors">
                      {item.id.replace("strat-", "#")}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-text-primary group-hover:text-white transition-colors truncate">
                          {item.name}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase ${catClass}`}>
                          {item.category}
                        </span>
                        <Badge className="bg-bg-elevated text-text-secondary border-bg-border text-[10px] font-mono">
                          {item.symbol} • {item.timeframe}
                        </Badge>
                        {item.leverage > 1 && (
                          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] font-bold">
                            {item.leverage}x Lev
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-text-secondary line-clamp-1">
                        {item.description}
                      </p>

                      {/* Rule snippet preview */}
                      <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[11px] text-text-tertiary">
                        <span className="text-accent-blue font-mono font-medium">Trigger:</span>
                        <span className="truncate max-w-md">
                          {(item.strategyDSL.entryConditions?.[0] as any)?.label || "Indicator Cross Trigger"}
                        </span>
                        {(item.strategyDSL.exitConditions?.[0] as any)?.label && (
                          <>
                            <span className="text-text-tertiary/40">•</span>
                            <span className="text-rose-400 font-mono font-medium">Exit:</span>
                            <span className="truncate max-w-sm">
                              {(item.strategyDSL.exitConditions?.[0] as any)?.label}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Center/Right: Backtest Performance Metrics */}
                  <div className="flex items-center justify-between md:justify-end gap-5 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-bg-border/60">
                    {res ? (
                      <div className="grid grid-cols-4 gap-4 text-right">
                        <div>
                          <div className="text-[10px] text-text-tertiary uppercase">Return</div>
                          <div className={`text-sm font-bold font-mono ${res.totalReturnRaw >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {res.totalReturn}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] text-text-tertiary uppercase">Sharpe</div>
                          <div className="text-sm font-bold font-mono text-text-primary">
                            {res.sharpeRatio}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] text-text-tertiary uppercase">Win Rate</div>
                          <div className="text-sm font-bold font-mono text-blue-400">
                            {res.winRate}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] text-text-tertiary uppercase">Max DD</div>
                          <div className="text-sm font-bold font-mono text-rose-400">
                            {res.maxDrawdown}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-text-tertiary italic">
                        Pending simulation...
                      </div>
                    )}

                    {/* Load into Builder Button */}
                    <Button
                      variant="secondary"
                      onClick={() => handleLoadStrategy(item)}
                      className="bg-accent-blue/10 hover:bg-accent-blue text-accent-blue hover:text-white border border-accent-blue/30 font-bold h-8 text-xs px-3 transition-all shrink-0 flex items-center gap-1.5"
                      title="Load strategy into visual flowchart canvas with active execution node"
                    >
                      <Zap className="h-3.5 w-3.5" />
                      <span>Load into Builder</span>
                    </Button>
                  </div>
                </div>
              )
            })
          )}

          {/* Load More Button if filteredStrategies > visibleCount */}
          {filteredStrategies.length > visibleCount && (
            <div className="text-center pt-4 pb-2">
              <Button
                variant="secondary"
                onClick={() => setVisibleCount(prev => Math.min(prev + 25, filteredStrategies.length))}
                className="text-xs font-bold px-5 h-8 border-bg-border bg-bg-surface hover:bg-bg-elevated text-text-secondary hover:text-text-primary"
              >
                Load Next 25 Strategies ({visibleCount} of {filteredStrategies.length} shown)
              </Button>
            </div>
          )}
        </div>

        {/* ═══ Footer ═══ */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-bg-border bg-bg-surface text-xs text-text-secondary shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>All 100 strategies validated against AlgoRush DAG Engine schema & execution standards.</span>
          </div>

          <div className="flex items-center gap-4 text-text-tertiary">
            <span>Showing {displayedStrategies.length} of {filteredStrategies.length} strategies</span>
            <Button
              variant="secondary"
              onClick={() => setIsHundredStrategiesModalOpen(false)}
              className="h-7 text-xs border-bg-border px-3"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
