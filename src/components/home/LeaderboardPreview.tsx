import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Crown, Medal, ArrowRight, TrendingUp, ShieldCheck } from "lucide-react"

const TOP_TRADERS = [
  {
    rank: 1,
    username: "Alex_QuantAlpha",
    strategy: "Apex Volatility Reversion",
    return: "+38.4%",
    winRate: "64.8%",
    sharpe: 2.34,
    drawdown: "-4.8%",
    glow: "border-amber-500/40 bg-amber-500/5",
    badgeColor: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    badge: <Crown className="h-4 w-4 text-amber-400" />,
  },
  {
    rank: 2,
    username: "Elena_Derivatives",
    strategy: "Spot-Futures Basis Scanner",
    return: "+29.6%",
    winRate: "61.2%",
    sharpe: 2.15,
    drawdown: "-3.9%",
    glow: "border-slate-300/40 bg-slate-300/5",
    badgeColor: "text-slate-300 bg-slate-300/10 border-slate-300/20",
    badge: <Medal className="h-4 w-4 text-slate-300" />,
  },
  {
    rank: 3,
    username: "Marcus_GridLab",
    strategy: "Adaptive Dynamic Grid",
    return: "+24.8%",
    winRate: "58.5%",
    sharpe: 1.98,
    drawdown: "-3.2%",
    glow: "border-amber-700/40 bg-amber-700/5",
    badgeColor: "text-amber-600 bg-amber-600/10 border-amber-600/20",
    badge: <Medal className="h-4 w-4 text-amber-600" />,
  },
]

export function LeaderboardPreview() {
  return (
    <section className="w-full bg-bg-surface py-24 border-t border-bg-border/60">
      <div className="mx-auto flex max-w-[1250px] flex-col items-center px-6 lg:px-10">
        
        <div className="mb-14 flex w-full flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold uppercase tracking-wider mb-2">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Verified 30-Day Performance</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-text-primary tracking-tight">
              Top Algorithmic Strategies This Month
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Audited live execution records from verified trader APIs and paper sandbox portfolios.
            </p>
          </div>

          <Link href="/leaderboard">
            <Button variant="secondary" className="text-xs font-bold border-bg-border hover:border-accent-blue hover:text-accent-blue transition-colors flex items-center gap-2">
              <span>View Full Leaderboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
          {TOP_TRADERS.map((trader) => (
            <div
              key={trader.username}
              className={`flex flex-col justify-between rounded-2xl border p-6 transition-all hover:scale-[1.01] shadow-sm ${trader.glow}`}
            >
              <div>
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-bg-elevated font-black text-sm text-text-primary border border-bg-border">
                      {trader.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-sm text-text-primary block">{trader.username}</span>
                      <span className="text-[11px] text-text-tertiary font-mono">{trader.strategy}</span>
                    </div>
                  </div>

                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-bold ${trader.badgeColor}`}>
                    {trader.badge}
                    <span>Rank #{trader.rank}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 py-4 border-y border-bg-border/60 font-mono text-center mb-5">
                  <div>
                    <span className="text-[10px] text-text-tertiary uppercase block">30d Return</span>
                    <span className="text-base font-black text-emerald-500">{trader.return}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-tertiary uppercase block">Sharpe</span>
                    <span className="text-base font-black text-text-primary">{trader.sharpe}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-tertiary uppercase block">Win Rate</span>
                    <span className="text-base font-black text-accent-blue">{trader.winRate}</span>
                  </div>
                </div>
              </div>

              <Link href="/leaderboard" className="w-full">
                <Button variant="ghost" className="w-full border border-bg-border bg-bg-surface hover:bg-bg-elevated text-xs font-bold text-text-primary transition-all">
                  Inspect Strategy Logic & Copy
                </Button>
              </Link>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
