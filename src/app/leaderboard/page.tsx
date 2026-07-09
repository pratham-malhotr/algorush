"use client"

import * as React from "react"
import { Crown, Medal, Users, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

const LEADERBOARD_DATA = [
  { rank: 1, name: "AlgoWhale", strategy: "Mean Reversion PRO", return: "+218.4%", winRate: "68%", subs: 1240, badge: <Crown className="h-5 w-5 text-[#F5C542]" />, color: "border-[#F5C542]/50 shadow-[0_0_20px_rgba(245,197,66,0.1)]" },
  { rank: 2, name: "QuantSniper", strategy: "Trend Follower v2", return: "+184.2%", winRate: "72%", subs: 890, badge: <Medal className="h-5 w-5 text-[#C0C0C0]" />, color: "border-[#C0C0C0]/50 shadow-[0_0_20px_rgba(192,192,192,0.1)]" },
  { rank: 3, name: "GridMaster", strategy: "Stablecoin Grid", return: "+156.9%", winRate: "81%", subs: 3200, badge: <Medal className="h-5 w-5 text-[#CD7F32]" />, color: "border-[#CD7F32]/50 shadow-[0_0_20px_rgba(205,127,50,0.1)]" },
  { rank: 4, name: "Satoshi_Bot", strategy: "BTC Accumulator", return: "+112.0%", winRate: "54%", subs: 450, badge: null, color: "border-bg-border" },
  { rank: 5, name: "DeFi_Degen", strategy: "Altcoin Breakout", return: "+94.5%", winRate: "42%", subs: 120, badge: null, color: "border-bg-border" },
]

import { motion } from "framer-motion"

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

export default function LeaderboardPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] w-full flex-col bg-white p-6 lg:p-10">
      <div className="mx-auto w-full max-w-[1200px]">
        
        {/* Header */}
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="mb-2 text-[36px] font-bold text-text-primary">Top Strategies</h1>
            <p className="text-[16px] text-text-secondary">Mirror the most profitable algorithms automatically.</p>
          </div>
          <div className="flex gap-2 rounded-lg bg-bg-surface p-1 border border-bg-border">
            {["7 Days", "30 Days", "All Time"].map((tf, i) => (
              <button key={tf} className={`rounded-md px-4 py-2 text-[13px] font-medium transition-colors ${i === 1 ? "bg-bg-elevated text-text-primary shadow-sm" : "text-text-tertiary hover:text-text-secondary"}`}>
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="rounded-[var(--radius-lg)] border border-bg-border bg-bg-surface shadow-[var(--shadow-card)] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-bg-border bg-bg-surface text-[12px] uppercase tracking-wider text-text-secondary">
                <th className="px-6 py-5 font-semibold">Rank</th>
                <th className="px-6 py-5 font-semibold">Trader & Strategy</th>
                <th className="px-6 py-5 font-semibold">Return (30D)</th>
                <th className="px-6 py-5 font-semibold">Win Rate</th>
                <th className="px-6 py-5 font-semibold">Subscribers</th>
                <th className="px-6 py-5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <motion.tbody 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="divide-y divide-bg-border"
            >
              {LEADERBOARD_DATA.map((trader) => (
                <motion.tr 
                  variants={itemVariants}
                  key={trader.rank} 
                  className="group transition-colors hover:bg-white/[0.02]"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-bg-elevated font-mono text-[14px] font-bold text-text-secondary">
                      {trader.badge || trader.rank}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-text-primary">{trader.strategy}</span>
                      <span className="text-[13px] text-text-secondary">by @{trader.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="flex items-center font-mono text-[18px] font-bold text-accent-green">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      {trader.return}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-mono text-[15px] text-text-primary">{trader.winRate}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-text-secondary">
                      <Users className="h-4 w-4" />
                      <span className="font-mono text-[14px]">{trader.subs.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <Button variant="ghost" className="border border-bg-border hover:border-accent-blue hover:text-accent-blue transition-colors">
                      Copy
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
