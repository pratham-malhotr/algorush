"use client"

import * as React from "react"
import { 
  Crown, Medal, Users, TrendingUp, ChevronDown, ChevronUp, Lock, Sparkles, 
  CheckCircle2, Copy, Zap, ArrowRight, ShieldCheck, Activity, LineChart, 
  BarChart3, RefreshCw, Sliders, ExternalLink, Play, AlertCircle, DollarSign, X, User
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"

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
  category: "Arbitrage" | "Mean Reversion" | "Trend Following" | "Grid Trading"
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
    name: "Marcus Vance", 
    initials: "MV",
    gradient: "from-blue-600 to-indigo-700",
    creatorHandle: "@marcusvance_quant",
    strategyName: "Apex Volatility Mean Reversion PRO", 
    category: "Mean Reversion",
    return30d: "+218.4%", 
    returnNum: 218.4,
    sharpeRatio: 3.12,
    winRate: "74.2%", 
    maxDrawdown: "-3.8%",
    profitFactor: 2.85,
    subs: 1420, 
    monthlyRevenue: "$17,040", 
    badge: <Crown className="h-5 w-5 text-amber-500" />,
    logicAst: `IF RSI(14) < 28.5 AND MACD_Hist(12,26,9) > 0 THEN\n  EXECUTE_BUY(Capital * 0.15, OrderType="LIMIT", Peg="BEST_BID")\n\nIF RSI(14) > 71.2 OR Drawdown > 2.0% THEN\n  FLATTEN_POSITION(Reason="TAKE_PROFIT_OR_RISK_LIMIT")\n\nSET_DYNAMIC_TRAILING_STOP(Distance="1.8%")`,
    equityData: [
      { day: "Day 1", strategy: 100, benchmark: 100 },
      { day: "Day 5", strategy: 118, benchmark: 102 },
      { day: "Day 10", strategy: 135, benchmark: 99 },
      { day: "Day 15", strategy: 162, benchmark: 105 },
      { day: "Day 20", strategy: 185, benchmark: 103 },
      { day: "Day 25", strategy: 202, benchmark: 108 },
      { day: "Day 30", strategy: 318.4, benchmark: 112 },
    ],
    recentTrades: [
      { pair: "BTC/USDT", side: "BUY", venue: "Binance Futures", price: "$64,210.50", size: "1.85 BTC", slippage: "0.012%", timestamp: "12 mins ago", pnl: "+$1,420.50 (+2.2%)" },
      { pair: "ETH/USDT", side: "SELL", venue: "Hyperliquid", price: "$3,450.20", size: "24.5 ETH", slippage: "0.008%", timestamp: "45 mins ago", pnl: "+$2,850.00 (+4.8%)" },
      { pair: "SOL/USDT", side: "BUY", venue: "Bybit Linear", price: "$144.80", size: "150 SOL", slippage: "0.015%", timestamp: "2 hours ago", pnl: "+$890.20 (+1.9%)" },
    ],
    description: "Institutional mean-reversion algorithm designed for BTC & ETH high-volatility regime trading with dynamic ATR trailing stops.",
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
    gradient: "from-emerald-600 to-teal-700",
    creatorHandle: "@elena_derivatives",
    strategyName: "Spot-Futures Cash & Carry Basis Scanner", 
    category: "Arbitrage",
    return30d: "+184.2%", 
    returnNum: 184.2,
    sharpeRatio: 3.84,
    winRate: "91.8%", 
    maxDrawdown: "-1.1%",
    profitFactor: 4.12,
    subs: 980, 
    monthlyRevenue: "$11,760", 
    badge: <Medal className="h-5 w-5 text-gray-400" />,
    logicAst: `SCAN_FUNDING_RATE(8h_Rate > 0.04%)\nLONG_SPOT(Venue="Binance", Size=Size_USD)\nSHORT_PERPETUAL(Venue="Hyperliquid", Size=Size_USD, Leverage=1x)\n\nREBALANCE_INVENTORY(Delta_Tolerance=0.01)`,
    equityData: [
      { day: "Day 1", strategy: 100, benchmark: 100 },
      { day: "Day 5", strategy: 112, benchmark: 102 },
      { day: "Day 10", strategy: 128, benchmark: 99 },
      { day: "Day 15", strategy: 145, benchmark: 105 },
      { day: "Day 20", strategy: 161, benchmark: 103 },
      { day: "Day 25", strategy: 174, benchmark: 108 },
      { day: "Day 30", strategy: 284.2, benchmark: 112 },
    ],
    recentTrades: [
      { pair: "SOL/USDT", side: "BUY", venue: "Binance Spot", price: "$145.20", size: "200 SOL", slippage: "0.005%", timestamp: "8 mins ago", pnl: "+$420.00 (+0.8%)" },
      { pair: "SOL-PERP", side: "SELL", venue: "Hyperliquid", price: "$145.90", size: "200 SOL", slippage: "0.004%", timestamp: "8 mins ago", pnl: "+$850.00 (+1.4%)" },
    ],
    description: "Delta-neutral cash and carry yield harvest strategy capturing 8-hour perpetual funding rates across Binance and Hyperliquid.",
    parameters: [
      { name: "Min Funding Rate APY", value: "48.0%" },
      { name: "Max Leverage", value: "1.0x (Delta Neutral)" },
      { name: "Rebalance Frequency", value: "Hourly" },
    ]
  },
  { 
    rank: 3, 
    id: "strat-3",
    name: "Dr. Julian Thorne", 
    initials: "JT",
    gradient: "from-purple-600 to-indigo-800",
    creatorHandle: "@thorne_quant",
    strategyName: "Multi-Timeframe Trend Follower v3", 
    category: "Trend Following",
    return30d: "+156.9%", 
    returnNum: 156.9,
    sharpeRatio: 2.75,
    winRate: "65.4%", 
    maxDrawdown: "-4.2%",
    profitFactor: 2.45,
    subs: 3400, 
    monthlyRevenue: "$40,800", 
    badge: <Medal className="h-5 w-5 text-orange-600" />,
    logicAst: `IF EMA(20) > EMA(50) AND Close > Keltner_Upper THEN\n  BUY_LONG(Portfolio_Risk=2%)\nIF EMA(20) < EMA(50) THEN\n  CLOSE_ALL_POSITIONS()`,
    equityData: [
      { day: "Day 1", strategy: 100, benchmark: 100 },
      { day: "Day 5", strategy: 108, benchmark: 102 },
      { day: "Day 10", strategy: 122, benchmark: 99 },
      { day: "Day 15", strategy: 139, benchmark: 105 },
      { day: "Day 20", strategy: 170, benchmark: 103 },
      { day: "Day 25", strategy: 210, benchmark: 108 },
      { day: "Day 30", strategy: 256.9, benchmark: 112 },
    ],
    recentTrades: [
      { pair: "AVAX/USDT", side: "BUY", venue: "OKX Futures", price: "$28.40", size: "500 AVAX", slippage: "0.010%", timestamp: "25 mins ago", pnl: "+$620.00 (+4.3%)" }
    ],
    description: "Algorithmic breakout algorithm capturing multi-day trend continuations with Keltner Channel volatility filters.",
    parameters: [
      { name: "Fast EMA", value: "20" },
      { name: "Slow EMA", value: "50" },
      { name: "Risk Per Trade", value: "2.0%" }
    ]
  },
  { 
    rank: 4, 
    id: "strat-4",
    name: "Vikram Malhotra", 
    initials: "VM",
    gradient: "from-amber-600 to-orange-700",
    creatorHandle: "@vikram_algo_prop",
    strategyName: "High-Frequency Grid Scalper PRO", 
    category: "Grid Trading",
    return30d: "+112.0%", 
    returnNum: 112.0,
    sharpeRatio: 3.40,
    winRate: "88.1%", 
    maxDrawdown: "-1.8%",
    profitFactor: 3.20,
    subs: 510, 
    monthlyRevenue: "$6,120", 
    badge: null,
    logicAst: `GRID_SCALPER(Pair="BTC/USDT", Lower=$61,000, Upper=$68,000, Grids=60)\nIF Daily_Drawdown > 1.5% THEN\n  PAUSE_GRID(Duration="24 Hours")`,
    equityData: [
      { day: "Day 1", strategy: 100, benchmark: 100 },
      { day: "Day 5", strategy: 106, benchmark: 102 },
      { day: "Day 10", strategy: 114, benchmark: 99 },
      { day: "Day 15", strategy: 125, benchmark: 105 },
      { day: "Day 20", strategy: 140, benchmark: 103 },
      { day: "Day 25", strategy: 170, benchmark: 108 },
      { day: "Day 30", strategy: 212.0, benchmark: 112 },
    ],
    recentTrades: [
      { pair: "BTC/USDT", side: "BUY", venue: "Binance Futures", price: "$63,800.00", size: "0.25 BTC", slippage: "0.002%", timestamp: "1 min ago", pnl: "+$95.00 (+0.6%)" }
    ],
    description: "Low-drawdown high-frequency grid scalper harvesting intraday bid-ask spreads within tight range-bound markets.",
    parameters: [
      { name: "Grid Count", value: "60 Grids" },
      { name: "Upper Range", value: "$68,000" },
      { name: "Lower Range", value: "$61,000" }
    ]
  },
  { 
    rank: 5, 
    id: "strat-5",
    name: "Sophia Lin", 
    initials: "SL",
    gradient: "from-cyan-600 to-blue-800",
    creatorHandle: "@sophialin_fintech",
    strategyName: "Spatial Tri-Venue Arbitrage Radar", 
    category: "Arbitrage",
    return30d: "+142.8%", 
    returnNum: 142.8,
    sharpeRatio: 3.65,
    winRate: "94.2%", 
    maxDrawdown: "-0.9%",
    profitFactor: 3.90,
    subs: 1850, 
    monthlyRevenue: "$22,200", 
    badge: null,
    logicAst: `SCAN_SPATIAL_SPREAD(MinSpread > 0.35%)\nBUY_VENUE("LBank", ETH/USDT)\nSELL_VENUE("Binance", ETH/USDT)\nAUTO_REBALANCE()`,
    equityData: [
      { day: "Day 1", strategy: 100, benchmark: 100 },
      { day: "Day 10", strategy: 130, benchmark: 101 },
      { day: "Day 20", strategy: 185, benchmark: 104 },
      { day: "Day 30", strategy: 242.8, benchmark: 112 },
    ],
    recentTrades: [
      { pair: "ETH/USDT", side: "BUY", venue: "LBank Pro", price: "$3,440.00", size: "15 ETH", slippage: "0.006%", timestamp: "5 mins ago", pnl: "+$210.00 (+0.4%)" }
    ],
    description: "Spatial price difference scanner capturing sub-second bid/ask dislocations across 6 CEX orderbook ladders.",
    parameters: [
      { name: "Min Net Spread", value: "0.35%" },
      { name: "Max Slippage Tolerance", value: "0.05%" }
    ]
  },
  { 
    rank: 6, 
    id: "strat-6",
    name: "Kaito Tanaka", 
    initials: "KT",
    gradient: "from-rose-600 to-pink-700",
    creatorHandle: "@kaito_crypto_quant",
    strategyName: "NLP Sentiment & Fed News Event Trader", 
    category: "Trend Following",
    return30d: "+168.5%", 
    returnNum: 168.5,
    sharpeRatio: 2.92,
    winRate: "70.1%", 
    maxDrawdown: "-3.1%",
    profitFactor: 2.65,
    subs: 740, 
    monthlyRevenue: "$8,880", 
    badge: null,
    logicAst: `IF SentimentIndex > 80 AND NewsImpact == "HIGH" THEN\n  BUY_LONG(Size=10%, Leverage=3x)\nIF SentimentIndex < 30 THEN\n  FLATTEN_ALL()`,
    equityData: [
      { day: "Day 1", strategy: 100, benchmark: 100 },
      { day: "Day 15", strategy: 160, benchmark: 105 },
      { day: "Day 30", strategy: 268.5, benchmark: 112 },
    ],
    recentTrades: [
      { pair: "BTC/USDT", side: "BUY", venue: "Binance Futures", price: "$64,100.00", size: "1.2 BTC", slippage: "0.008%", timestamp: "18 mins ago", pnl: "+$980.00 (+1.5%)" }
    ],
    description: "Event-driven NLP algorithm executing instant leveraged longs on positive Fed rate cut and CPI headlines.",
    parameters: [
      { name: "Sentiment Threshold", value: "> 80 (Bullish)" },
      { name: "Min Confidence", value: "90%" }
    ]
  },
  { 
    rank: 7, 
    id: "strat-7",
    name: "Daniel Reed", 
    initials: "DR",
    gradient: "from-blue-700 to-cyan-800",
    creatorHandle: "@dreed_macro",
    strategyName: "Chicago Volatility Breakout & ATR Stop", 
    category: "Mean Reversion",
    return30d: "+134.2%", 
    returnNum: 134.2,
    sharpeRatio: 3.14,
    winRate: "71.5%", 
    maxDrawdown: "-2.4%",
    profitFactor: 2.90,
    subs: 1120, 
    monthlyRevenue: "$13,440", 
    badge: null,
    logicAst: `IF ATR(14) > ATR_SMA(20) * 1.5 AND Close > Upper_Band THEN\n  EXECUTE_BREAKOUT_LONG()\nSET_STOP_LOSS(ATR * 2)`,
    equityData: [
      { day: "Day 1", strategy: 100, benchmark: 100 },
      { day: "Day 30", strategy: 234.2, benchmark: 112 },
    ],
    recentTrades: [
      { pair: "ETH/USDT", side: "BUY", venue: "Bybit", price: "$3,455.00", size: "10 ETH", slippage: "0.009%", timestamp: "32 mins ago", pnl: "+$410.00 (+1.2%)" }
    ],
    description: "Chicago macro volatility breakout model executing momentum signals when ATR volatility expands beyond 20-day averages.",
    parameters: [
      { name: "ATR Multiplier", value: "1.5x" },
      { name: "Stop Loss ATR", value: "2.0x" }
    ]
  },
  { 
    rank: 8, 
    id: "strat-8",
    name: "Amara Benali", 
    initials: "AB",
    gradient: "from-emerald-700 to-green-800",
    creatorHandle: "@amara_volatility",
    strategyName: "Paris Orderbook Depth Scalper 4500", 
    category: "Grid Trading",
    return30d: "+108.9%", 
    returnNum: 108.9,
    sharpeRatio: 3.52,
    winRate: "89.4%", 
    maxDrawdown: "-1.2%",
    profitFactor: 3.40,
    subs: 620, 
    monthlyRevenue: "$7,440", 
    badge: null,
    logicAst: `ORDERBOOK_SCALPER(Depth_Level=5, Min_Volume=$50,000)\nEXECUTE_PASSIVE_LIMIT(Maker_Fee_Bps=-1)`,
    equityData: [
      { day: "Day 1", strategy: 100, benchmark: 100 },
      { day: "Day 30", strategy: 208.9, benchmark: 112 },
    ],
    recentTrades: [
      { pair: "SOL/USDT", side: "BUY", venue: "Hyperliquid", price: "$145.10", size: "100 SOL", slippage: "0.001%", timestamp: "4 mins ago", pnl: "+$140.00 (+1.0%)" }
    ],
    description: "Maker rebate scalping bot placing non-crossing passive limit orders into 5-level orderbook bid/ask stacks.",
    parameters: [
      { name: "Orderbook Levels", value: "5 Levels" },
      { name: "Execution Type", value: "Maker Only" }
    ]
  },
  { 
    rank: 9, 
    id: "strat-9",
    name: "Jean-Luc Moreau", 
    initials: "JL",
    gradient: "from-indigo-600 to-purple-800",
    creatorHandle: "@jl_geneva_alpha",
    strategyName: "Geneva Perpetual Funding Yield Harvest", 
    category: "Arbitrage",
    return30d: "+176.4%", 
    returnNum: 176.4,
    sharpeRatio: 3.78,
    winRate: "93.1%", 
    maxDrawdown: "-0.8%",
    profitFactor: 3.95,
    subs: 1540, 
    monthlyRevenue: "$18,480", 
    badge: null,
    logicAst: `HARVEST_YIELD(Target_Pair="BTC/USDT", Min_APY=60%)\nSHORT_PERP(Venue="Bybit", Leverage=1x)\nLONG_SPOT(Venue="Binance")`,
    equityData: [
      { day: "Day 1", strategy: 100, benchmark: 100 },
      { day: "Day 30", strategy: 276.4, benchmark: 112 },
    ],
    recentTrades: [
      { pair: "BTC/USDT", side: "SELL", venue: "Bybit", price: "$64,250.00", size: "1.0 BTC", slippage: "0.003%", timestamp: "15 mins ago", pnl: "+$520.00 (+0.8%)" }
    ],
    description: "Swiss institutional delta-neutral yield farmer capturing funding rate APY with automated inventory rebalancing.",
    parameters: [
      { name: "Min APY", value: "60.0%" },
      { name: "Delta Tolerance", value: "0.005" }
    ]
  },
  { 
    rank: 10, 
    id: "strat-10",
    name: "Christopher Hayes", 
    initials: "CH",
    gradient: "from-violet-600 to-purple-900",
    creatorHandle: "@chayes_bytes",
    strategyName: "Sydney Dual Moving Average Crossover", 
    category: "Trend Following",
    return30d: "+124.5%", 
    returnNum: 124.5,
    sharpeRatio: 2.80,
    winRate: "66.8%", 
    maxDrawdown: "-3.5%",
    profitFactor: 2.50,
    subs: 430, 
    monthlyRevenue: "$5,160", 
    badge: null,
    logicAst: `IF SMA(50) > SMA(200) THEN\n  BUY_LONG()\nIF SMA(50) < SMA(200) THEN\n  SELL_SHORT()`,
    equityData: [
      { day: "Day 1", strategy: 100, benchmark: 100 },
      { day: "Day 30", strategy: 224.5, benchmark: 112 },
    ],
    recentTrades: [
      { pair: "ETH/USDT", side: "BUY", venue: "Coinbase Pro", price: "$3,445.00", size: "8 ETH", slippage: "0.011%", timestamp: "1 hour ago", pnl: "+$310.00 (+0.9%)" }
    ],
    description: "Classic Golden Cross momentum algorithm enhanced with volume confirmation filters and risk caps.",
    parameters: [
      { name: "Fast SMA", value: "50" },
      { name: "Slow SMA", value: "200" }
    ]
  }
]

export default function LeaderboardPage() {
  const router = useRouter()
  const [isSubscribed, setIsSubscribed] = React.useState(true) // Default to subscribed so user experiences enterprise features!
  const [selectedStrategy, setSelectedStrategy] = React.useState<StrategyItem | null>(null)
  const [copyingId, setCopyingId] = React.useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = React.useState<string>("All")
  const [copyAllocatedUsd, setCopyAllocatedUsd] = React.useState<number>(5000)
  const [copyLeverage, setCopyLeverage] = React.useState<number>(2)
  const [showCopySuccessModal, setShowCopySuccessModal] = React.useState<boolean>(false)
  const [showPaywallModal, setShowPaywallModal] = React.useState<boolean>(false)

  const filteredData = React.useMemo(() => {
    if (categoryFilter === "All") return LEADERBOARD_DATA
    return LEADERBOARD_DATA.filter(s => s.category === categoryFilter)
  }, [categoryFilter])

  function handleInitiateCopy(strategy: StrategyItem) {
    if (!isSubscribed) {
      setShowPaywallModal(true)
      return
    }
    setSelectedStrategy(strategy)
  }

  function handleConfirmLiveCopy() {
    if (!selectedStrategy) return
    setCopyingId(selectedStrategy.id)
    setTimeout(() => {
      setCopyingId(null)
      setShowCopySuccessModal(true)
    }, 1500)
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-white p-6 lg:p-10 relative overflow-hidden">
      
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="mx-auto w-full max-w-[1250px] relative z-10">
        
        {/* Account Status Switcher Bar */}
        <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-blue-200 bg-blue-50/60 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-3 text-blue-900">
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-sm">Account Status: {isSubscribed ? "Pro Subscription Active" : "Free Plan"}</span>
              <p className="text-xs text-blue-700">
                {isSubscribed ? "You have full access to inspect strategy AST logic, live trade feeds, and 1-click mirror copy-trading." : "Subscribe to unlock live trade signals and automatic strategy copying."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-bold uppercase text-gray-500">Toggle Subscription State:</span>
            <button 
              onClick={() => setIsSubscribed(!isSubscribed)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${isSubscribed ? 'bg-emerald-600' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isSubscribed ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Header Title & Filter Controls */}
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-widest mb-3">
              <Activity className="h-3.5 w-3.5 text-emerald-600" />
              Verified Live Institutional Algos ({LEADERBOARD_DATA.length} Active)
            </div>
            <h1 className="mb-2 text-[38px] font-extrabold text-gray-900 tracking-tight md:text-[46px]">
              Top Quant Leaderboard & Mirror Trading
            </h1>
            <p className="text-base text-gray-600 max-w-2xl leading-relaxed">
              Inspect verified live performance, analyze sub-second trade execution feeds, and mirror top quantitative strategies directly to your exchange account.
            </p>
          </div>

          {/* Strategy Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-gray-100/80 rounded-2xl border border-gray-200/80 shrink-0">
            {["All", "Arbitrage", "Mean Reversion", "Trend Following", "Grid Trading"].map((cat) => (
              <button 
                key={cat} 
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${categoryFilter === cat ? "bg-white text-gray-900 shadow-md" : "text-gray-500 hover:text-gray-900"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="rounded-3xl border border-gray-200 bg-white shadow-xl overflow-hidden mb-16">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                <th className="px-6 py-5">Rank</th>
                <th className="px-6 py-5">Quantitative Trader & Strategy</th>
                <th className="px-6 py-5">30D Return</th>
                <th className="px-6 py-5">Sharpe Ratio</th>
                <th className="px-6 py-5">Win Rate</th>
                <th className="px-6 py-5">Max Drawdown</th>
                <th className="px-6 py-5">Followers</th>
                <th className="px-6 py-5 text-right">Live Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.map((item) => (
                <tr 
                  key={item.id} 
                  className="group hover:bg-blue-50/30 transition-colors"
                >
                  <td className="px-6 py-6">
                    <div className="flex items-center justify-center h-10 w-10 rounded-2xl bg-gray-100 font-mono text-[15px] font-extrabold text-gray-700 shadow-inner">
                      {item.badge || `#${item.rank}`}
                    </div>
                  </td>
                  
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3.5">
                      {/* Instagram/Twitter Default Profile Silhouette Photo */}
                      <div className="h-12 w-12 rounded-full bg-gradient-to-b from-gray-200 to-gray-300 border-2 border-gray-300 flex items-center justify-center text-gray-500 shrink-0 shadow-inner group-hover:border-blue-400 group-hover:scale-105 transition-all">
                        <User className="h-7 w-7 text-gray-500 fill-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-base leading-snug flex items-center gap-1.5">
                          <span>{item.strategyName}</span>
                          <CheckCircle2 className="h-4 w-4 fill-blue-500 text-white shrink-0" />
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mt-0.5">
                          <span className="text-blue-600 font-semibold">{item.creatorHandle}</span>
                          <span>•</span>
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-mono text-[11px]">{item.category}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-6 font-mono">
                    <span className="inline-flex items-center font-extrabold text-[17px] text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200/60">
                      <TrendingUp className="mr-1.5 h-4 w-4" />
                      {item.return30d}
                    </span>
                  </td>

                  <td className="px-6 py-6 font-mono text-sm font-bold text-gray-900">
                    <div className="flex flex-col">
                      <span>{item.sharpeRatio}</span>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">Sharpe</span>
                    </div>
                  </td>

                  <td className="px-6 py-6 font-mono text-sm font-bold text-gray-800">
                    {item.winRate}
                  </td>

                  <td className="px-6 py-6 font-mono text-sm font-bold text-emerald-600">
                    {item.maxDrawdown}
                  </td>

                  <td className="px-6 py-6 text-sm font-medium text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="font-bold font-mono text-gray-900">{item.subs.toLocaleString()}</span>
                    </div>
                  </td>

                  <td className="px-6 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setSelectedStrategy(item)}
                        className="rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 px-4 py-2.5 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <LineChart className="h-3.5 w-3.5 text-blue-600" />
                        Inspect Details
                      </button>

                      <button 
                        onClick={() => handleInitiateCopy(item)}
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-xs font-bold shadow-md shadow-blue-500/25 transition-all hover:scale-105 flex items-center gap-1.5"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Mirror Strategy
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* --- STRATEGY DEEP-DIVE & COPY-TRADING MODAL --- */}
      <AnimatePresence>
        {selectedStrategy && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
            <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-gray-100">
              
              {/* Modal Header */}
              <div className="p-6 md:p-8 bg-gray-950 text-white flex items-start justify-between border-b border-gray-800">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-b from-gray-200 to-gray-300 border-2 border-gray-400 flex items-center justify-center text-gray-600 shrink-0 shadow-inner">
                    <User className="h-8 w-8 text-gray-600 fill-gray-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-lg border border-blue-400/30 uppercase font-mono">
                        {selectedStrategy.category}
                      </span>
                      <span className="text-xs text-gray-400">{selectedStrategy.creatorHandle}</span>
                    </div>
                    <h3 className="text-2xl font-extrabold text-white">{selectedStrategy.strategyName}</h3>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedStrategy(null)}
                  className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 md:p-8 overflow-y-auto space-y-8 text-gray-700">
                
                {/* Paywall Banner if Free User */}
                {!isSubscribed && (
                  <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Lock className="h-6 w-6 text-amber-600 shrink-0" />
                      <div>
                        <h4 className="font-bold text-base">Subscription Required to Copy Trade</h4>
                        <p className="text-xs text-amber-700">Subscribe to AlgoText to mirror live trades automatically to your Binance/OKX account.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => router.push("/pricing")}
                      className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-all shrink-0"
                    >
                      Subscribe Now →
                    </button>
                  </div>
                )}

                {/* Quantitative Metric Badges Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-200">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">30D Return</span>
                    <span className="text-xl font-extrabold text-emerald-600 font-mono">{selectedStrategy.return30d}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Sharpe Ratio</span>
                    <span className="text-xl font-extrabold text-gray-900 font-mono">{selectedStrategy.sharpeRatio}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Profit Factor</span>
                    <span className="text-xl font-extrabold text-gray-900 font-mono">{selectedStrategy.profitFactor}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Max Drawdown</span>
                    <span className="text-xl font-extrabold text-emerald-600 font-mono">{selectedStrategy.maxDrawdown}</span>
                  </div>
                </div>

                {/* Strategy Abstract & Parameters */}
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-2">Strategy Overview & Parameters</h4>
                  <p className="text-sm leading-relaxed text-gray-600 mb-4">{selectedStrategy.description}</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {selectedStrategy.parameters.map((p, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-gray-100/70 border border-gray-200 text-center">
                        <div className="text-[10px] uppercase font-bold text-gray-400">{p.name}</div>
                        <div className="text-sm font-bold text-gray-900 font-mono mt-0.5">{p.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AST Code Logic Box */}
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-2">Underlying AST Compiler Logic</h4>
                  <div className="rounded-2xl bg-[#0D1117] p-5 text-xs font-mono text-emerald-400 leading-relaxed overflow-x-auto shadow-inner border border-gray-800">
                    {selectedStrategy.logicAst}
                  </div>
                </div>

                {/* Recent Live Trades Feed */}
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-3">Live Execution Trade Feed</h4>
                  <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase">
                        <tr>
                          <th className="p-3.5">Asset Pair</th>
                          <th className="p-3.5">Venue</th>
                          <th className="p-3.5">Side</th>
                          <th className="p-3.5">Exec Price</th>
                          <th className="p-3.5">Slippage</th>
                          <th className="p-3.5 text-right">Realized PnL</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-mono">
                        {selectedStrategy.recentTrades.map((t, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/60">
                            <td className="p-3.5 font-bold text-gray-900">{t.pair}</td>
                            <td className="p-3.5 text-gray-600">{t.venue}</td>
                            <td className="p-3.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.side === 'BUY' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                {t.side}
                              </span>
                            </td>
                            <td className="p-3.5 text-gray-700">{t.price}</td>
                            <td className="p-3.5 text-gray-500">{t.slippage}</td>
                            <td className="p-3.5 text-right font-bold text-emerald-600">{t.pnl}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Live Copy Trading Setup Controls */}
                <div className="p-6 rounded-3xl bg-blue-50/70 border border-blue-200 space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-extrabold text-blue-950">Live Strategy Mirror Setup</h4>
                      <p className="text-xs text-blue-700">Configure your automated copy-trading position sizing and leverage limit.</p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-300">
                      WebSocket Signal Connected
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <div className="flex justify-between text-xs font-bold text-gray-700 mb-2">
                        <span>Capital Allocation (USD):</span>
                        <span className="font-mono text-blue-600">${copyAllocatedUsd.toLocaleString()}</span>
                      </div>
                      <input 
                        type="range" 
                        min="500" max="50000" step="500"
                        value={copyAllocatedUsd}
                        onChange={(e) => setCopyAllocatedUsd(parseInt(e.target.value))}
                        className="w-full h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-gray-700 mb-2">
                        <span>Max Leverage Limit:</span>
                        <span className="font-mono text-blue-600">{copyLeverage}x Leverage</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" max="10" step="1"
                        value={copyLeverage}
                        onChange={(e) => setCopyLeverage(parseInt(e.target.value))}
                        className="w-full h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleConfirmLiveCopy}
                    disabled={copyingId === selectedStrategy.id}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-2xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                  >
                    {copyingId === selectedStrategy.id ? (
                      <>
                        <RefreshCw className="h-5 w-5 animate-spin" /> Syncing Webhook API Signals...
                      </>
                    ) : (
                      <>
                        <Copy className="h-5 w-5" /> Confirm & Start Auto Copy Trading (${copyAllocatedUsd.toLocaleString()})
                      </>
                    )}
                  </button>
                </div>

              </div>

            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Copy Success Toast Modal */}
      <AnimatePresence>
        {showCopySuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-4 border border-gray-100">
              <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900">Live Strategy Mirror Active!</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                You are now automatically mirroring <strong>{selectedStrategy?.strategyName}</strong> with ${copyAllocatedUsd.toLocaleString()} capital allocation.
              </p>
              <button 
                onClick={() => {
                  setShowCopySuccessModal(false)
                  setSelectedStrategy(null)
                }}
                className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm rounded-xl transition-colors"
              >
                Go to Live Dashboard →
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
