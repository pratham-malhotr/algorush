import * as React from "react"
import { Button } from "@/components/ui/button"
import { Crown, Medal } from "lucide-react"

const TOP_TRADERS = [
  {
    rank: 1,
    username: "AlgoWhale",
    return: "+218.4%",
    winRate: "68%",
    glow: "shadow-[0_0_20px_rgba(245,197,66,0.3)] border-[#F5C542]/50",
    badge: <Crown className="h-4 w-4 text-[#F5C542]" />,
  },
  {
    rank: 2,
    username: "QuantSniper",
    return: "+184.2%",
    winRate: "72%",
    glow: "shadow-[0_0_20px_rgba(192,192,192,0.3)] border-[#C0C0C0]/50",
    badge: <Medal className="h-4 w-4 text-[#C0C0C0]" />,
  },
  {
    rank: 3,
    username: "GridMaster",
    return: "+156.9%",
    winRate: "81%",
    glow: "shadow-[0_0_20px_rgba(205,127,50,0.3)] border-[#CD7F32]/50",
    badge: <Medal className="h-4 w-4 text-[#CD7F32]" />,
  },
]

export function LeaderboardPreview() {
  return (
    <section className="w-full bg-bg-surface py-24">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center px-6">
        <div className="mb-16 flex w-full flex-col items-center justify-between gap-6 sm:flex-row">
          <h2 className="text-[36px] font-bold text-text-primary">Top traders this month</h2>
          <Button variant="ghost" className="text-accent-blue hover:text-accent-blue-dim">
            See Full Leaderboard →
          </Button>
        </div>

        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
          {TOP_TRADERS.map((trader) => (
            <div
              key={trader.username}
              className={`flex flex-col rounded-[var(--radius-lg)] border bg-bg-surface p-6 transition-transform hover:scale-[1.02] ${trader.glow}`}
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-bg-elevated">
                    {/* Avatar placeholder */}
                    <div className="h-full w-full rounded-full bg-gradient-to-br from-accent-blue to-purple-600 opacity-80" />
                    <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-bg-base">
                      {trader.badge}
                    </div>
                  </div>
                  <span className="font-semibold text-text-primary">{trader.username}</span>
                </div>
              </div>

              <div className="mb-6 flex justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-[12px] text-text-secondary">30d Return</span>
                  <span className="font-mono text-[24px] font-bold text-accent-green">{trader.return}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[12px] text-text-secondary">Win Rate</span>
                  <span className="font-mono text-[16px] text-text-primary">{trader.winRate}</span>
                </div>
              </div>

              {/* Sparkline Mockup */}
              <div className="mb-6 h-12 w-full">
                <svg className="h-full w-full" preserveAspectRatio="none">
                  <path d="M0 40 Q 20 20, 40 30 T 80 10 T 120 20 L120 40 Z" fill="rgba(34,197,94,0.1)" />
                  <path d="M0 40 Q 20 20, 40 30 T 80 10 T 120 20" fill="none" stroke="#22C55E" strokeWidth="2" />
                </svg>
              </div>

              <Button variant="ghost" className="w-full border border-bg-border">
                Subscribe & Copy
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
