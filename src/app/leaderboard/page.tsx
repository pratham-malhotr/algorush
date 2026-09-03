"use client"

import * as React from "react"
import Link from "next/link"
import { 
  Crown, Medal, Users, TrendingUp, ChevronDown, ChevronUp, Lock, Sparkles, 
  CheckCircle2, Copy, Zap, ArrowRight, ShieldCheck, Activity, LineChart, 
  BarChart3, RefreshCw, Sliders, ExternalLink, Play, AlertCircle, DollarSign, X, User,
  Search, ArrowUpRight, Check, Award
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { usePaperTradingStore } from "@/store/usePaperTradingStore"
import { toast } from "sonner"

interface Trade {
  pair: string
  side: "BUY" | "SELL"
  venue: string
  price: string
  size: string
  slippage: string
  timestamp: string
  pnl: string
}

interface StrategyItem {
  rank: number
  id: string
  name: string
  initials: string
  gradient: string
  creatorHandle: string
  strategyName: string
  category: "Arbitrage & Basis" | "Mean Reversion" | "Trend Following" | "Grid Trading"
  return30d: string
  returnNum: number
  sharpeRatio: number
  winRate: string
  maxDrawdown: string
  profitFactor: number
  subs: number
  monthlyRevenue: string
  badge: React.ReactNode
  logicAst: string
  equityData: { day: string; strategy: number; benchmark: number }[]
  recentTrades: Trade[]
  description: string
  parameters: { name: string; value: string }[]
}

const LEADERBOARD_DATA: StrategyItem[] = [
  { 
    rank: 1, 
    id: "strat-1",
    name: "Alex Rivera", 
    initials: "AR",
    gradient: "from-amber-500 to-amber-700",
    creatorHandle: "@arivera_quant",
    strategyName: "Apex Volatility Mean Reversion", 
    category: "Mean Reversion",
    return30d: "+38.4%", 
    returnNum: 38.4,
    sharpeRatio: 2.34,
    winRate: "64.2%", 
    maxDrawdown: "-4.8%",
    profitFactor: 2.15,
    subs: 342, 
    monthlyRevenue: "$4,104", 
    badge: <Crown className="h-4 w-4 text-amber-400" />,
    logicAst: `IF RSI(14) < 28.5 AND MACD_Hist(12,26,9) > 0 THEN\n  EXECUTE_BUY(Capital * 0.15, OrderType="LIMIT", Peg="BEST_BID")\n\nIF RSI(14) > 71.2 OR Drawdown > 2.0% THEN\n  FLATTEN_POSITION(Reason="TAKE_PROFIT_OR_RISK_LIMIT")\n\nSET_DYNAMIC_TRAILING_STOP(Distance="1.8%")`,
    equityData: [
      { day: "Day 1", strategy: 100, benchmark: 100 },
      { day: "Day 5", strategy: 104.2, benchmark: 101.5 },
      { day: "Day 10", strategy: 109.8, benchmark: 99.8 },
      { day: "Day 15", strategy: 116.5, benchmark: 102.1 },
      { day: "Day 20", strategy: 123.4, benchmark: 103.5 },
      { day: "Day 25", strategy: 131.0, benchmark: 104.8 },
      { day: "Day 30", strategy: 138.4, benchmark: 106.2 },
    ],
    recentTrades: [
      { pair: "BTC/USDT", side: "BUY", venue: "Binance Futures", price: "$64,210.50", size: "0.85 BTC", slippage: "0.012%", timestamp: "18 mins ago", pnl: "+$620.50 (+1.8%)" },
      { pair: "ETH/USDT", side: "SELL", venue: "Bybit Linear", price: "$3,450.20", size: "8.5 ETH", slippage: "0.008%", timestamp: "1 hour ago", pnl: "+$850.00 (+2.9%)" },
      { pair: "SOL/USDT", side: "BUY", venue: "OKX Spot", price: "$144.80", size: "65 SOL", slippage: "0.015%", timestamp: "3 hours ago", pnl: "+$340.20 (+1.4%)" },
    ],
    description: "Systematic mean-reversion algorithm trading BTC & ETH intraday momentum extensions with ATR-based volatility stops.",
    parameters: [
      { name: "RSI Period", value: "14" },
      { name: "Overbought Trigger", value: "71.2" },
      { name: "Oversold Trigger", value: "28.5" },
      { name: "Trailing Stop Distance", value: "1.8%" },
    ]
  },
  { 
    rank: 2, 
    id: "strat-2",
    name: "Elena Rostova", 
    initials: "ER",
    gradient: "from-slate-400 to-slate-600",
    creatorHandle: "@elena_derivatives",
    strategyName: "Spot-Futures Cash & Carry Basis Scanner", 
    category: "Arbitrage & Basis",
    return30d: "+29.6%", 
    returnNum: 29.6,
    sharpeRatio: 2.18,
    winRate: "68.4%", 
    maxDrawdown: "-2.8%",
    profitFactor: 2.05,
    subs: 285, 
    monthlyRevenue: "$3,420", 
    badge: <Medal className="h-4 w-4 text-slate-300" />,
    logicAst: `SCAN_FUNDING_RATE(8h_Rate > 0.04%)\nLONG_SPOT(Venue="Binance", Size=Size_USD)\nSHORT_PERPETUAL(Venue="Bybit", Size=Size_USD, Leverage=1x)\n\nREBALANCE_INVENTORY(Delta_Tolerance=0.01)`,
    equityData: [
      { day: "Day 1", strategy: 100, benchmark: 100 },
      { day: "Day 5", strategy: 103.8, benchmark: 101.5 },
      { day: "Day 10", strategy: 108.4, benchmark: 99.8 },
      { day: "Day 15", strategy: 114.1, benchmark: 102.1 },
      { day: "Day 20", strategy: 119.8, benchmark: 103.5 },
      { day: "Day 25", strategy: 124.6, benchmark: 104.8 },
      { day: "Day 30", strategy: 129.6, benchmark: 106.2 },
    ],
    recentTrades: [
      { pair: "SOL/USDT", side: "BUY", venue: "Binance Spot", price: "$145.20", size: "120 SOL", slippage: "0.005%", timestamp: "25 mins ago", pnl: "+$240.00 (+0.8%)" },
      { pair: "SOL-PERP", side: "SELL", venue: "Bybit Linear", price: "$145.90", size: "120 SOL", slippage: "0.004%", timestamp: "25 mins ago", pnl: "+$410.00 (+1.2%)" },
    ],
    description: "Delta-neutral cash and carry funding harvest capturing 8-hour perpetual basis yields across Binance and Bybit with automated delta rebalancing.",
    parameters: [
      { name: "Min Funding Rate APY", value: "36.0%" },
      { name: "Max Leverage", value: "1.0x (Delta Neutral)" },
      { name: "Rebalance Frequency", value: "Hourly" },
    ]
  },
  { 
    rank: 3, 
    id: "strat-3",
    name: "Dr. Julian Thorne", 
    initials: "JT",
    gradient: "from-amber-700 to-amber-900",
    creatorHandle: "@thorne_quant",
    strategyName: "Statistical Pairs Cointegration Alpha", 
    category: "Mean Reversion",
    return30d: "+24.8%", 
    returnNum: 24.8,
    sharpeRatio: 2.02,
    winRate: "59.5%", 
    maxDrawdown: "-3.4%",
    profitFactor: 1.92,
    subs: 210, 
    monthlyRevenue: "$2,520", 
    badge: <Medal className="h-4 w-4 text-amber-600" />,
    logicAst: `CALCULATE_SPREAD(SOL/USDT, AVAX/USDT, HedgeRatio=1.42)\nIF Z_Score < -2.1 THEN\n  LONG_SPREAD(Peg="VWAP")\nIF Z_Score > 2.1 THEN\n  SHORT_SPREAD(Peg="VWAP")\nIF Z_Score.Abs < 0.2 THEN\n  CLOSE_SPREAD()`,
    equityData: [
      { day: "Day 1", strategy: 100, benchmark: 100 },
      { day: "Day 5", strategy: 103.1, benchmark: 101.5 },
      { day: "Day 10", strategy: 107.0, benchmark: 99.8 },
      { day: "Day 15", strategy: 111.8, benchmark: 102.1 },
      { day: "Day 20", strategy: 116.5, benchmark: 103.5 },
      { day: "Day 25", strategy: 120.9, benchmark: 104.8 },
      { day: "Day 30", strategy: 124.8, benchmark: 106.2 },
    ],
    recentTrades: [
      { pair: "SOL/USDT", side: "BUY", venue: "OKX", price: "$144.50", size: "80 SOL", slippage: "0.010%", timestamp: "42 mins ago", pnl: "+$320.00 (+1.4%)" },
      { pair: "AVAX/USDT", side: "SELL", venue: "OKX", price: "$28.20", size: "400 AVAX", slippage: "0.011%", timestamp: "42 mins ago", pnl: "+$290.00 (+1.2%)" }
    ],
    description: "Statistical arbitrage model trading cointegrated Layer 1 token pairs based on rolling 30-day Z-Score price deviations.",
    parameters: [
      { name: "Lookback Period", value: "120 Hours" },
      { name: "Entry Z-Score", value: "2.10" },
      { name: "Exit Z-Score", value: "0.20" }
    ]
  },
  { 
    rank: 4, 
    id: "strat-4",
    name: "Vikram Malhotra", 
    initials: "VM",
    gradient: "from-blue-600 to-indigo-700",
    creatorHandle: "@vikram_algo_prop",
    strategyName: "Multi-Timeframe Trend Breakout", 
    category: "Trend Following",
    return30d: "+21.2%", 
    returnNum: 21.2,
    sharpeRatio: 1.88,
    winRate: "57.2%", 
    maxDrawdown: "-4.2%",
    profitFactor: 1.81,
    subs: 175, 
    monthlyRevenue: "$2,100", 
    badge: null,
    logicAst: `IF Close > EMA(50) AND EMA(50) > EMA(200) AND Volume > Volume_MA(20) * 1.5 THEN\n  ENTER_TREND_LONG(Risk_Pct=2.0)\nSET_STOP_LOSS(Recent_Swing_Low)\nTRAILING_STOP(ATR_Multiplier=2.5)`,
    equityData: [
      { day: "Day 1", strategy: 100, benchmark: 100 },
      { day: "Day 10", strategy: 105.8, benchmark: 99.8 },
      { day: "Day 20", strategy: 113.2, benchmark: 103.5 },
      { day: "Day 30", strategy: 121.2, benchmark: 106.2 },
    ],
    recentTrades: [
      { pair: "NEAR/USDT", side: "BUY", venue: "Binance Futures", price: "$4.82", size: "2,500 NEAR", slippage: "0.012%", timestamp: "1 hour ago", pnl: "+$410.00 (+2.1%)" }
    ],
    description: "Trend-following breakout system executing on higher-high closes confirmed by volume expansions and EMA alignment.",
    parameters: [
      { name: "Fast EMA", value: "50" },
      { name: "Slow EMA", value: "200" },
      { name: "Volume Threshold", value: "1.5x 20MA" }
    ]
  },
  { 
    rank: 5, 
    id: "strat-5",
    name: "Sophia Lin", 
    initials: "SL",
    gradient: "from-teal-600 to-emerald-700",
    creatorHandle: "@sophialin_fintech",
    strategyName: "Spatial Cross-Venue Spread Harvester", 
    category: "Arbitrage & Basis",
    return30d: "+18.5%", 
    returnNum: 18.5,
    sharpeRatio: 1.79,
    winRate: "55.8%", 
    maxDrawdown: "-3.1%",
    profitFactor: 1.74,
    subs: 148, 
    monthlyRevenue: "$1,776", 
    badge: null,
    logicAst: `SCAN_SPATIAL_SPREAD(MinSpread > 0.18%)\nBUY_VENUE("Binance", Pair)\nSELL_VENUE("Gate.io", Pair)\nAUTO_DELTA_HEDGE()`,
    equityData: [
      { day: "Day 1", strategy: 100, benchmark: 100 },
      { day: "Day 15", strategy: 108.9, benchmark: 102.1 },
      { day: "Day 30", strategy: 118.5, benchmark: 106.2 },
    ],
    recentTrades: [
      { pair: "UNI/USDT", side: "BUY", venue: "Coinbase", price: "$6.08", size: "800 UNI", slippage: "0.006%", timestamp: "35 mins ago", pnl: "+$180.00 (+0.9%)" }
    ],
    description: "High-frequency spatial difference scanner capturing inter-exchange top-of-book spread gaps using pre-funded inventory.",
    parameters: [
      { name: "Min Spread", value: "0.18%" },
      { name: "Max Execution Latency", value: "25ms" }
    ]
  },
  { 
    rank: 6, 
    id: "strat-6",
    name: "Kaito Tanaka", 
    initials: "KT",
    gradient: "from-purple-600 to-indigo-700",
    creatorHandle: "@kaito_crypto_quant",
    strategyName: "Adaptive Dynamic Grid Rebalance", 
    category: "Grid Trading",
    return30d: "+15.9%", 
    returnNum: 15.9,
    sharpeRatio: 1.65,
    winRate: "54.2%", 
    maxDrawdown: "-3.6%",
    profitFactor: 1.68,
    subs: 122, 
    monthlyRevenue: "$1,464", 
    badge: null,
    logicAst: `INITIALIZE_GEOMETRIC_GRID(Levels=40, Step=0.45%)\nBUY_LIMIT_AT_LEVEL(Step_Below)\nSELL_LIMIT_AT_LEVEL(Step_Above)\nSTOP_OUT(Price < Lower_Bound)`,
    equityData: [
      { day: "Day 1", strategy: 100, benchmark: 100 },
      { day: "Day 15", strategy: 107.5, benchmark: 102.1 },
      { day: "Day 30", strategy: 115.9, benchmark: 106.2 },
    ],
    recentTrades: [
      { pair: "BTC/USDT", side: "BUY", venue: "Binance Spot", price: "$63,850.00", size: "0.25 BTC", slippage: "0.002%", timestamp: "55 mins ago", pnl: "+$112.00 (+0.45%)" }
    ],
    description: "Geometric grid trading algorithm capturing intraday oscillation volatility within established consolidation bands.",
    parameters: [
      { name: "Grid Levels", value: "40 Grids" },
      { name: "Grid Spacing", value: "0.45%" },
      { name: "Boundaries", value: "$60,000 - $68,000" }
    ]
  }
]

export default function LeaderboardPage() {
  const router = useRouter()
  const { deployStrategy } = usePaperTradingStore()
  
  const [selectedStrategy, setSelectedStrategy] = React.useState<StrategyItem | null>(null)
  const [categoryFilter, setCategoryFilter] = React.useState<string>("All")
  const [timeframe, setTimeframe] = React.useState<"30d" | "90d" | "all">("30d")
  const [searchQuery, setSearchQuery] = React.useState<string>("")
  const [sortBy, setSortBy] = React.useState<"return" | "sharpe" | "winRate" | "drawdown">("return")

  // Copy modal state
  const [copyModalStrategy, setCopyModalStrategy] = React.useState<StrategyItem | null>(null)
  const [copyCapital, setCopyCapital] = React.useState<number>(5000)
  const [isDeployingCopy, setIsDeployingCopy] = React.useState<boolean>(false)

  // Filtered & Sorted Leaderboard
  const filteredData = React.useMemo(() => {
    return LEADERBOARD_DATA.filter((item) => {
      // Category filter
      if (categoryFilter !== "All" && item.category !== categoryFilter) return false
      
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesName = item.name.toLowerCase().includes(q)
        const matchesStrat = item.strategyName.toLowerCase().includes(q)
        const matchesHandle = item.creatorHandle.toLowerCase().includes(q)
        if (!matchesName && !matchesStrat && !matchesHandle) return false
      }

      return true
    }).sort((a, b) => {
      if (sortBy === "sharpe") return b.sharpeRatio - a.sharpeRatio
      if (sortBy === "winRate") return parseFloat(b.winRate) - parseFloat(a.winRate)
      if (sortBy === "drawdown") return parseFloat(b.maxDrawdown) - parseFloat(a.maxDrawdown)
      return b.returnNum - a.returnNum
    })
  }, [categoryFilter, searchQuery, sortBy])

  // Top 3 Podium
  const topThree = LEADERBOARD_DATA.slice(0, 3)

  // Handle Deploying Copy to Sandbox
  const handleDeployCopyToSandbox = async () => {
    if (!copyModalStrategy) return
    setIsDeployingCopy(true)

    try {
      await new Promise(r => setTimeout(r, 800))

      deployStrategy({
        name: `Copy: ${copyModalStrategy.strategyName}`,
        description: `Automated copy of ${copyModalStrategy.name}'s verified algorithm (${copyModalStrategy.return30d} 30d)`,
        instruments: [{ symbol: "BTC/USDT", assetClass: "CRYPTO" }],
        action: { type: "BUY", quantityType: "PERCENT_OF_ACCOUNT", quantityValue: 20 },
        entryConditions: [],
        exitConditions: [],
        riskParameters: { stopLossPercentage: 2.0, takeProfitPercentage: 4.5 }
      })

      toast.success(`⚡ Copied ${copyModalStrategy.strategyName} to your Sandbox portfolio with $${copyCapital.toLocaleString()} USDT!`)
      setCopyModalStrategy(null)
    } catch (e: any) {
      toast.error("Copy deployment failed: " + e.message)
    } finally {
      setIsDeployingCopy(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col">
      {/* Top Header */}
      <header className="h-16 border-b border-bg-border bg-bg-surface flex items-center justify-between px-6 lg:px-8 shrink-0">
        <div className="font-bold text-lg flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <span className="font-black tracking-tight text-text-primary">Quant Trader Leaderboard</span>
            <span className="hidden sm:inline-block ml-2 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-500 border border-amber-500/20">
              Verified 30-Day Records
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/markets" className="text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors">
            Markets
          </Link>
          <Link href="/arbitrage" className="text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors">
            Arbitrage
          </Link>
          <Link href="/dashboard" className="text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors">
            Dashboard
          </Link>
          <Link href="/builder" className="text-xs font-bold text-accent-blue bg-accent-blue/10 hover:bg-accent-blue/20 px-3 py-1.5 rounded-xl border border-accent-blue/20 transition-all">
            AI Strategy
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
        
        {/* Banner Overview */}
        <div className="bg-bg-surface border border-bg-border rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl lg:text-3xl font-black text-text-primary tracking-tight">
                Top Systematic Quant Strategies
              </h1>
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-0.5 text-xs font-bold font-mono">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Audited API Execution Records
              </span>
            </div>
            <p className="text-text-secondary text-sm max-w-3xl leading-relaxed">
              Transparent rankings of algorithmic strategies running on Binance, Bybit, OKX, and Coinbase. All returns, Sharpe ratios, and max drawdowns are verified against live exchange execution logs and tick-by-tick paper sandboxes.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-xl border border-bg-border bg-bg-base p-3 font-mono text-xs space-y-1">
              <span className="text-[10px] text-text-tertiary block uppercase font-bold">Audited Volume</span>
              <span className="text-base font-black text-accent-blue">$42.8M USD</span>
            </div>
            <div className="rounded-xl border border-bg-border bg-bg-base p-3 font-mono text-xs space-y-1">
              <span className="text-[10px] text-text-tertiary block uppercase font-bold">Top Sharpe</span>
              <span className="text-base font-black text-emerald-500">2.34</span>
            </div>
          </div>
        </div>

        {/* Top 3 Podium Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {topThree.map((trader) => (
            <div
              key={trader.id}
              className={`rounded-2xl border p-6 flex flex-col justify-between transition-all shadow-sm ${
                trader.rank === 1
                  ? "border-amber-500/40 bg-amber-500/5 hover:border-amber-500/60"
                  : trader.rank === 2
                  ? "border-slate-400/40 bg-slate-400/5 hover:border-slate-400/60"
                  : "border-amber-700/40 bg-amber-700/5 hover:border-amber-700/60"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${trader.gradient} text-white font-black text-sm flex items-center justify-center shadow-sm`}>
                      {trader.initials}
                    </div>
                    <div>
                      <span className="font-bold text-sm text-text-primary block">{trader.name}</span>
                      <span className="text-xs text-text-tertiary font-mono">{trader.creatorHandle}</span>
                    </div>
                  </div>

                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold ${
                    trader.rank === 1 
                      ? "text-amber-400 bg-amber-400/10 border-amber-400/20"
                      : trader.rank === 2 
                      ? "text-slate-300 bg-slate-300/10 border-slate-300/20"
                      : "text-amber-600 bg-amber-600/10 border-amber-600/20"
                  }`}>
                    {trader.badge}
                    <span>Rank #{trader.rank}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-text-primary">{trader.strategyName}</h3>
                  <span className="text-[11px] text-text-tertiary font-mono">{trader.category}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-bg-border/70 font-mono text-center text-xs">
                  <div>
                    <span className="text-[10px] text-text-tertiary block uppercase">30d Return</span>
                    <span className="text-base font-black text-emerald-500">{trader.return30d}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-tertiary block uppercase">Sharpe</span>
                    <span className="text-base font-black text-text-primary">{trader.sharpeRatio}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-tertiary block uppercase">Win Rate</span>
                    <span className="text-base font-black text-accent-blue">{trader.winRate}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-2">
                <button
                  onClick={() => setSelectedStrategy(trader)}
                  className="flex-1 py-2 rounded-xl bg-bg-surface hover:bg-bg-elevated text-xs font-bold text-text-primary border border-bg-border transition-colors text-center"
                >
                  Inspect Logic
                </button>
                <button
                  onClick={() => setCopyModalStrategy(trader)}
                  className="flex-1 py-2 rounded-xl bg-accent-blue hover:bg-blue-600 text-xs font-bold text-white shadow-md shadow-accent-blue/20 transition-all text-center flex items-center justify-center gap-1.5"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Strategy</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Toolbar */}
        <div className="rounded-2xl border border-bg-border bg-bg-surface p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 shadow-sm flex-wrap">
          
          {/* Search bar */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search trader, strategy, or handle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-bg-base border border-bg-border rounded-xl pl-10 pr-4 py-2 text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-blue font-medium"
            />
          </div>

          {/* Timeframe selector */}
          <div className="flex items-center gap-1 bg-bg-base p-1 rounded-xl border border-bg-border shrink-0">
            {(["30d", "90d", "all"] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  timeframe === tf
                    ? "bg-accent-blue text-white shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {tf === "30d" ? "30 Days" : tf === "90d" ? "90 Days" : "All Time"}
              </button>
            ))}
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-text-tertiary font-bold">Sort:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-bg-base border border-bg-border rounded-xl px-3 py-1.5 text-xs font-bold text-text-primary focus:outline-none focus:border-accent-blue"
            >
              <option value="return">Highest 30d Return</option>
              <option value="sharpe">Highest Sharpe Ratio</option>
              <option value="winRate">Highest Win Rate</option>
              <option value="drawdown">Lowest Max Drawdown</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {['All', 'Arbitrage & Basis', 'Mean Reversion', 'Trend Following', 'Grid Trading'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                categoryFilter === cat
                  ? "bg-text-primary text-bg-base border-text-primary shadow-sm"
                  : "bg-bg-surface text-text-secondary border-bg-border hover:text-text-primary"
              }`}
            >
              {cat === 'All' ? 'All Strategies (6)' : cat}
            </button>
          ))}
        </div>

        {/* Leaderboard Table View */}
        <div className="rounded-2xl border border-bg-border bg-bg-surface overflow-hidden shadow-sm">
          <div className="p-5 border-b border-bg-border flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-text-primary">Verified Trader Rankings</h3>
              <p className="text-xs text-text-secondary mt-0.5">Live execution telemetry updated every 60 seconds.</p>
            </div>
            <span className="text-xs text-text-tertiary font-mono">
              Showing {filteredData.length} strategies
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg-base text-text-tertiary font-bold uppercase tracking-wider border-b border-bg-border font-mono">
                <tr>
                  <th className="py-3.5 px-5">Rank & Trader</th>
                  <th className="py-3.5 px-5">Strategy / Category</th>
                  <th className="py-3.5 px-5 text-right">30d Return</th>
                  <th className="py-3.5 px-5 text-right">Sharpe</th>
                  <th className="py-3.5 px-5 text-right">Win Rate</th>
                  <th className="py-3.5 px-5 text-right">Max Drawdown</th>
                  <th className="py-3.5 px-5 text-right">Subscribers</th>
                  <th className="py-3.5 px-5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bg-border font-mono">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-bg-elevated/50 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <span className={`h-6 w-6 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                          item.rank === 1 ? "bg-amber-400 text-black font-black" :
                          item.rank === 2 ? "bg-slate-300 text-black font-black" :
                          item.rank === 3 ? "bg-amber-700 text-white font-black" :
                          "bg-bg-elevated text-text-secondary"
                        }`}>
                          {item.rank}
                        </span>
                        <div>
                          <span className="font-sans font-bold text-text-primary block text-sm">{item.name}</span>
                          <span className="text-[10px] text-text-tertiary">{item.creatorHandle}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-5 font-sans">
                      <span className="font-bold text-text-primary block">{item.strategyName}</span>
                      <span className="text-[10px] text-text-tertiary font-mono">{item.category}</span>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <span className="text-sm font-black text-emerald-500">{item.return30d}</span>
                      <span className="block text-[10px] text-text-tertiary font-sans">Verified Fills</span>
                    </td>

                    <td className="py-4 px-5 text-right font-bold text-text-primary">
                      {item.sharpeRatio}
                    </td>

                    <td className="py-4 px-5 text-right font-bold text-accent-blue">
                      {item.winRate}
                    </td>

                    <td className="py-4 px-5 text-right font-bold text-accent-red">
                      {item.maxDrawdown}
                    </td>

                    <td className="py-4 px-5 text-right text-text-secondary font-sans">
                      {item.subs} traders
                    </td>

                    <td className="py-4 px-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedStrategy(item)}
                          className="px-2.5 py-1.5 rounded-lg border border-bg-border bg-bg-surface hover:bg-bg-elevated text-xs font-semibold text-text-primary transition-colors"
                          title="Inspect Rules & Trades"
                        >
                          Inspect
                        </button>
                        <button
                          onClick={() => setCopyModalStrategy(item)}
                          className="px-3 py-1.5 rounded-lg bg-accent-blue hover:bg-blue-600 text-xs font-bold text-white shadow-sm transition-all flex items-center gap-1"
                        >
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Inspect Strategy Logic & Fills Modal */}
      {selectedStrategy && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-150">
          <div className="flex w-full max-w-[700px] flex-col overflow-hidden rounded-2xl border border-bg-border bg-bg-surface shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-bg-border px-6 py-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${selectedStrategy.gradient} text-white font-bold flex items-center justify-center text-sm shadow-sm`}>
                  {selectedStrategy.initials}
                </div>
                <div>
                  <h2 className="text-base font-bold text-text-primary">{selectedStrategy.strategyName}</h2>
                  <p className="text-xs text-text-secondary">{selectedStrategy.name} ({selectedStrategy.creatorHandle})</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedStrategy(null)}
                className="rounded-lg p-2 text-text-tertiary hover:bg-bg-elevated hover:text-text-primary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
              {/* Scorecard */}
              <div className="grid grid-cols-4 gap-3 font-mono text-xs text-center p-3.5 bg-bg-base rounded-xl border border-bg-border">
                <div>
                  <span className="text-[10px] text-text-tertiary uppercase block">30d Return</span>
                  <span className="text-sm font-black text-emerald-500">{selectedStrategy.return30d}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-tertiary uppercase block">Sharpe</span>
                  <span className="text-sm font-black text-text-primary">{selectedStrategy.sharpeRatio}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-tertiary uppercase block">Win Rate</span>
                  <span className="text-sm font-black text-accent-blue">{selectedStrategy.winRate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-tertiary uppercase block">Max DD</span>
                  <span className="text-sm font-black text-accent-red">{selectedStrategy.maxDrawdown}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1.5">Strategy Thesis</span>
                <p className="text-xs text-text-secondary leading-relaxed bg-bg-base p-3.5 rounded-xl border border-bg-border">
                  {selectedStrategy.description}
                </p>
              </div>

              {/* Logic AST */}
              <div>
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1.5">Deterministic Logic Rules (AST)</span>
                <pre className="p-3.5 bg-bg-base border border-bg-border rounded-xl font-mono text-xs text-accent-blue overflow-x-auto leading-relaxed">
                  {selectedStrategy.logicAst}
                </pre>
              </div>

              {/* Recent Fills */}
              <div>
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1.5">Recent Audited Fills</span>
                <div className="space-y-2">
                  {selectedStrategy.recentTrades.map((t, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-bg-border bg-bg-base font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.side === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-accent-red/10 text-accent-red'
                        }`}>{t.side}</span>
                        <span className="font-bold text-text-primary">{t.pair}</span>
                        <span className="text-text-tertiary text-[11px]">@{t.price} ({t.venue})</span>
                      </div>
                      <span className="text-emerald-500 font-bold">{t.pnl}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => {
                    setSelectedStrategy(null)
                    router.push('/builder')
                  }}
                  className="flex-1 py-3 rounded-xl bg-bg-elevated hover:bg-bg-surface border border-bg-border font-bold text-xs text-text-primary transition-colors text-center"
                >
                  Open in Visual Builder
                </button>
                <button
                  onClick={() => {
                    const s = selectedStrategy
                    setSelectedStrategy(null)
                    setCopyModalStrategy(s)
                  }}
                  className="flex-1 py-3 rounded-xl bg-accent-blue hover:bg-blue-600 font-bold text-xs text-white shadow-md transition-all text-center flex items-center justify-center gap-2"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Strategy</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Copy Strategy to Portfolio Sandbox Modal */}
      {copyModalStrategy && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-150">
          <div className="flex w-full max-w-[500px] flex-col overflow-hidden rounded-2xl border border-bg-border bg-bg-surface shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-bg-border px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-accent-blue/10 text-accent-blue flex items-center justify-center border border-accent-blue/20">
                  <Copy className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-text-primary">Copy Quantitative Strategy</h2>
                  <p className="text-xs text-text-secondary">{copyModalStrategy.strategyName}</p>
                </div>
              </div>

              <button
                onClick={() => setCopyModalStrategy(null)}
                className="rounded-lg p-2 text-text-tertiary hover:bg-bg-elevated hover:text-text-primary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              <div className="rounded-xl border border-bg-border bg-bg-base p-4 space-y-2 font-mono text-xs">
                <div className="flex justify-between text-text-secondary">
                  <span>Strategy Author:</span>
                  <span className="text-text-primary font-bold">{copyModalStrategy.name}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Audited 30d Return:</span>
                  <span className="text-emerald-500 font-bold">{copyModalStrategy.return30d}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Sharpe Ratio / Win Rate:</span>
                  <span className="text-accent-blue font-bold">{copyModalStrategy.sharpeRatio} / {copyModalStrategy.winRate}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Max Drawdown Limit:</span>
                  <span className="text-accent-red font-bold">{copyModalStrategy.maxDrawdown}</span>
                </div>
              </div>

              {/* Capital Allocation */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-text-secondary uppercase tracking-wider">Allocated Capital</span>
                  <span className="font-mono font-bold text-accent-blue text-sm">${copyCapital.toLocaleString()} USDT</span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[1000, 2500, 5000, 10000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setCopyCapital(amt)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        copyCapital === amt
                          ? "border-accent-blue bg-accent-blue/15 text-accent-blue shadow-sm"
                          : "border-bg-border bg-bg-base text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      ${amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sandbox Execution Info */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-xs flex items-start gap-2.5 text-text-secondary">
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed">
                  The strategy will be deployed into your <strong>Paper Trading Sandbox portfolio</strong> with automated risk stops and delta hedging enabled.
                </span>
              </div>

              <button
                onClick={handleDeployCopyToSandbox}
                disabled={isDeployingCopy}
                className="w-full py-3.5 rounded-xl bg-accent-blue hover:bg-blue-600 text-white font-bold text-xs shadow-md shadow-accent-blue/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeployingCopy ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Zap className="h-4 w-4 fill-current" />
                    <span>Deploy Copy Strategy to Sandbox</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
