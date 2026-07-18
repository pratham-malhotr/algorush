"use client"

import * as React from "react"
import { Crown, Medal, Users, TrendingUp, ChevronDown, ChevronUp, Lock, Sparkles, CheckCircle2, Copy } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { useRouter } from "next/navigation"

// --- Fake Data ---

const LEADERBOARD_DATA = [
  { 
    rank: 1, name: "AlgoWhale", strategy: "Mean Reversion PRO", return: "+218.4%", winRate: "68%", subs: 1240, revenue: "$14,880", 
    badge: <Crown className="h-5 w-5 text-amber-500" />,
    sparkline: "M0 20 Q 10 15, 20 25 T 40 15 T 60 5 T 80 10 T 100 0",
    logic: "IF RSI(14) < 30 AND MACD_Histogram > 0 THEN BUY 10% Portfolio\nIF RSI(14) > 70 THEN SELL_ALL\nSTOP_LOSS 3%",
    trades: [ { pair: "BTC/USDT", side: "BUY", price: "$64,210.50", pnl: "+1.2%" }, { pair: "ETH/USDT", side: "SELL", price: "$3,450.20", pnl: "+4.5%" } ]
  },
  { 
    rank: 2, name: "QuantSniper", strategy: "Trend Follower v2", return: "+184.2%", winRate: "72%", subs: 890, revenue: "$10,680",
    badge: <Medal className="h-5 w-5 text-gray-400" />,
    sparkline: "M0 25 Q 15 25, 30 15 T 50 10 T 70 20 T 90 5 T 100 5",
    logic: "IF EMA(50) > EMA(200) AND Close > Bollinger_Upper THEN BUY 5% Portfolio\nIF EMA(50) < EMA(200) THEN SELL_ALL",
    trades: [ { pair: "SOL/USDT", side: "BUY", price: "$145.20", pnl: "+8.2%" }, { pair: "LINK/USDT", side: "SELL", price: "$14.50", pnl: "-1.1%" } ]
  },
  { 
    rank: 3, name: "GridMaster", strategy: "Stablecoin Grid", return: "+156.9%", winRate: "81%", subs: 3200, revenue: "$38,400",
    badge: <Medal className="h-5 w-5 text-orange-600" />,
    sparkline: "M0 30 Q 10 25, 20 20 T 40 15 T 60 10 T 80 5 T 100 0",
    logic: "GRID_TRADING(USDT/USDC, Lower=0.99, Upper=1.01, Grids=50)",
    trades: [ { pair: "USDC/USDT", side: "BUY", price: "$0.999", pnl: "+0.1%" }, { pair: "USDC/USDT", side: "SELL", price: "$1.001", pnl: "+0.1%" } ]
  },
  { 
    rank: 4, name: "Satoshi_Bot", strategy: "BTC Accumulator", return: "+112.0%", winRate: "54%", subs: 450, revenue: "$5,400",
    badge: null,
    sparkline: "M0 15 Q 10 20, 25 15 T 45 25 T 65 10 T 85 20 T 100 5",
    logic: "DCA_BUY(BTC, $100, DAILY, 08:00 UTC)\nIF RSI(14) < 25 THEN DCA_MULTIPLIER = 2",
    trades: [ { pair: "BTC/USDT", side: "BUY", price: "$63,100.00", pnl: "0.0%" } ]
  },
]

export default function LeaderboardPage() {
  const router = useRouter()
  const [isPremium, setIsPremium] = React.useState(false)
  const [expandedRow, setExpandedRow] = React.useState<number | null>(null)
  
  // Modals
  const [showPaywallModal, setShowPaywallModal] = React.useState(false)
  const [showSuccessToast, setShowSuccessToast] = React.useState(false)

  const handleRowClick = (rank: number) => {
    setExpandedRow(expandedRow === rank ? null : rank)
  }

  const handleCopyClick = (e: React.MouseEvent, strategyName: string) => {
    e.stopPropagation() // Prevent row expansion toggle
    if (!isPremium) {
      setShowPaywallModal(true)
    } else {
      setShowSuccessToast(true)
      setTimeout(() => setShowSuccessToast(false), 3000)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#F8FAFC] p-6 lg:p-10 relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="mx-auto w-full max-w-[1200px] relative z-10">
        
        {/* Testing Toggle Bar */}
        <div className="mb-8 flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/50 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-3 text-blue-800">
            <Sparkles className="h-5 w-5" />
            <div>
              <span className="font-bold">Testing Tools:</span>
              <span className="ml-2 text-sm opacity-80">Toggle your account status to test Premium features.</span>
            </div>
          </div>
          <button 
            onClick={() => setIsPremium(!isPremium)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${isPremium ? 'bg-blue-600' : 'bg-gray-300'}`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isPremium ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* Header */}
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="mb-3 text-[40px] font-extrabold text-gray-900 tracking-tight">Top Strategies</h1>
            <p className="text-lg text-gray-600">Analyze institutional-grade logic and automatically copy trades directly to your portfolio.</p>
          </div>
          <div className="flex gap-2 p-1 bg-white rounded-lg border border-gray-200 shadow-sm">
            {["7 Days", "30 Days", "All Time"].map((tf, i) => (
              <button key={tf} className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${i === 1 ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-900"}`}>
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-200/50 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50 text-[12px] uppercase tracking-wider text-gray-500">
                <th className="px-6 py-5 font-bold">Rank</th>
                <th className="px-6 py-5 font-bold">Trader & Strategy</th>
                <th className="px-6 py-5 font-bold">30D Performance</th>
                <th className="px-6 py-5 font-bold">Win Rate</th>
                <th className="px-6 py-5 font-bold">Creator Revenue</th>
                <th className="px-6 py-5 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {LEADERBOARD_DATA.map((trader) => (
                <React.Fragment key={trader.rank}>
                  
                  {/* Main Row */}
                  <tr 
                    onClick={() => handleRowClick(trader.rank)}
                    className={`group transition-all cursor-pointer ${expandedRow === trader.rank ? 'bg-blue-50/30' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-6 py-6">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 font-mono text-[15px] font-bold text-gray-600 shadow-sm">
                        {trader.badge || trader.rank}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-[16px] mb-1">{trader.strategy}</span>
                        <div className="flex items-center gap-3 text-[13px] text-gray-500 font-medium">
                          <span>by @{trader.name}</span>
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {trader.subs.toLocaleString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 w-[200px]">
                      <div className="flex flex-col">
                        <span className="flex items-center font-mono text-[18px] font-bold text-emerald-600 mb-2">
                          <TrendingUp className="mr-2 h-4 w-4" />
                          {trader.return}
                        </span>
                        {/* Sparkline SVG */}
                        <svg className="w-[120px] h-[30px] overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" style={{stopColor: '#10b981', stopOpacity: 0.2}} />
                              <stop offset="100%" style={{stopColor: '#10b981', stopOpacity: 0}} />
                            </linearGradient>
                          </defs>
                          <path d={`${trader.sparkline} L 100 30 L 0 30 Z`} fill="url(#grad1)" />
                          <path d={trader.sparkline} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-gray-100 font-mono text-[15px] font-bold text-gray-700">
                        {trader.winRate}
                      </div>
                    </td>
                    <td className="px-6 py-6 font-mono text-[15px] font-bold text-blue-600">
                      {trader.revenue}
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex items-center justify-end gap-4">
                        <button 
                          onClick={(e) => handleCopyClick(e, trader.strategy)}
                          className="flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-sm font-bold shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5"
                        >
                          <Copy className="h-4 w-4" />
                          Copy Strategy
                        </button>
                        <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                          {expandedRow === trader.rank ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Content Area */}
                  <AnimatePresence>
                    {expandedRow === trader.rank && (
                      <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <td colSpan={6} className="p-0 border-b border-gray-200 bg-gray-50/50">
                          <div className="relative p-8">
                            
                            {/* Paywall Overlay */}
                            {!isPremium && (
                              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 backdrop-blur-md rounded-b-2xl">
                                <div className="bg-white p-6 rounded-2xl shadow-xl shadow-black/5 border border-gray-200 text-center max-w-sm">
                                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 mb-4">
                                    <Lock className="h-6 w-6 text-amber-600" />
                                  </div>
                                  <h4 className="text-lg font-bold text-gray-900 mb-2">Premium Feature</h4>
                                  <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                                    Unlock Premium to view the exact algorithmic logic and recent trade history of top strategies.
                                  </p>
                                  <button 
                                    onClick={() => router.push("/pricing")}
                                    className="w-full rounded-lg bg-gray-900 text-white py-2.5 font-bold hover:bg-gray-800 transition-colors"
                                  >
                                    Upgrade Now
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Actual Expanded Content */}
                            <div className={`grid grid-cols-2 gap-8 ${!isPremium ? 'opacity-30 select-none' : ''}`}>
                              
                              {/* Strategy Logic */}
                              <div>
                                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Underlying Logic (AST)</h4>
                                <div className="rounded-xl bg-[#0D1117] p-4 text-[13px] font-mono leading-relaxed text-emerald-400 whitespace-pre-wrap shadow-inner border border-gray-800">
                                  {trader.logic}
                                </div>
                              </div>

                              {/* Recent Trades */}
                              <div>
                                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Recent Live Trades</h4>
                                <div className="rounded-xl bg-white border border-gray-200 overflow-hidden shadow-sm">
                                  <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                                      <tr>
                                        <th className="px-4 py-2">Asset</th>
                                        <th className="px-4 py-2">Side</th>
                                        <th className="px-4 py-2">Exec Price</th>
                                        <th className="px-4 py-2 text-right">Realized PnL</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 font-mono">
                                      {trader.trades.map((t, idx) => (
                                        <tr key={idx}>
                                          <td className="px-4 py-3 font-medium text-gray-900">{t.pair}</td>
                                          <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${t.side === 'BUY' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                              {t.side}
                                            </span>
                                          </td>
                                          <td className="px-4 py-3 text-gray-600">{t.price}</td>
                                          <td className={`px-4 py-3 text-right font-bold ${t.pnl.startsWith('+') ? 'text-emerald-600' : 'text-gray-500'}`}>
                                            {t.pnl}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>

                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* --- Modals & Toasts --- */}

      {/* Paywall Modal */}
      <AnimatePresence>
        {showPaywallModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 to-orange-500" />
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 mb-6 border border-amber-200">
                <Crown className="h-8 w-8 text-amber-600" />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">AlgoText Premium</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Unlock the ability to instantly copy institutional-grade strategies directly to your portfolio. 
                <br/><br/>
                <strong>Creator Royalty:</strong> 20% of your monthly subscription goes directly to the creators of the strategies you copy, incentivizing top quants to share their edge!
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowPaywallModal(false)}
                  className="flex-1 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 font-bold transition-colors"
                >
                  Maybe Later
                </button>
                <button 
                  onClick={() => router.push("/pricing")}
                  className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-3 font-bold shadow-lg shadow-orange-500/30 transition-all"
                >
                  Upgrade
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-black/20 border border-gray-800"
          >
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            <div>
              <p className="font-bold">Strategy Copied Successfully!</p>
              <p className="text-sm text-gray-400">It is now available in your Dashboard.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
