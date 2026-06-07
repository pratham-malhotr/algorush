import * as React from "react"
import { Blocks, LineChart, Shield, Activity } from "lucide-react"

const STEPS = [
  {
    title: "Build your strategy visually",
    description: "Explain drag-and-drop block system, no code, plain English logic. Build strategies like Lego blocks.",
    icon: Blocks,
  },
  {
    title: "Backtest against real history",
    description: "Run against 1–3 years of real OHLCV data, see return %, drawdown, win rate before risking capital.",
    icon: LineChart,
  },
  {
    title: "Connect your wallet securely",
    description: "AlgoRush never holds funds. Trades execute via your own wallet securely using smart contracts.",
    icon: Shield,
  },
  {
    title: "Go live and monitor 24/7",
    description: "Strategy runs automatically. Get alerts on Telegram, Email, or browser when trades happen.",
    icon: Activity,
  },
]

export function HowItWorks() {
  return (
    <section className="mx-auto flex w-full max-w-[1200px] flex-col items-center px-6 py-24">
      <div className="mb-16 text-center">
        <h2 className="mb-4 text-[36px] font-bold text-text-primary">How AlgoRush works</h2>
        <p className="text-[16px] text-text-secondary">From idea to live trading bot in under 5 minutes</p>
      </div>

      <div className="flex w-full flex-col gap-24">
        {STEPS.map((step, i) => {
          const isEven = i % 2 === 0
          return (
            <div key={i} className={`flex flex-col items-center gap-12 md:flex-row ${!isEven ? "md:flex-row-reverse" : ""}`}>
              {/* Text content */}
              <div className="flex flex-1 flex-col gap-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-bg-elevated text-[24px] font-bold text-text-secondary border border-bg-border">
                  {i + 1}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-blue/10 text-accent-blue">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-[24px] font-bold text-text-primary">{step.title}</h3>
                </div>
                <p className="text-[16px] leading-[1.6] text-text-secondary">
                  {step.description}
                </p>
              </div>

              {/* Visual Mockup */}
              <div className="flex flex-1 items-center justify-center w-full">
                <div className="relative aspect-video w-full overflow-hidden rounded-[var(--radius-xl)] border border-bg-border bg-bg-surface shadow-[var(--shadow-card)]">
                  {/* Mock content based on step */}
                  {i === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#070A0D]" style={{ backgroundImage: "radial-gradient(circle, #1E2836 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
                       <div className="h-20 w-48 rounded-lg border border-accent-blue bg-[#0F2036] shadow-[0_0_15px_rgba(59,130,246,0.15)] flex items-center justify-center">
                         <span className="font-medium text-white">RSI Block</span>
                       </div>
                    </div>
                  )}
                  {i === 1 && (
                     <div className="absolute inset-0 flex flex-col p-6 bg-bg-surface">
                       <div className="h-full w-full rounded border border-bg-border bg-gradient-to-t from-accent-green/5 to-transparent relative overflow-hidden">
                          <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                            <path d="M0 150 Q 50 100, 100 120 T 200 80 T 300 40 L300 200 L0 200 Z" fill="rgba(34,197,94,0.1)" />
                            <path d="M0 150 Q 50 100, 100 120 T 200 80 T 300 40" fill="none" stroke="#22C55E" strokeWidth="3" />
                          </svg>
                       </div>
                     </div>
                  )}
                  {i === 2 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-bg-base/50">
                      <div className="w-64 rounded-xl border border-bg-border bg-bg-elevated p-4 shadow-xl">
                        <div className="mb-4 flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-accent-blue/20" />
                          <div className="h-4 w-24 rounded bg-bg-border" />
                        </div>
                        <div className="h-10 w-full rounded-md bg-accent-blue/10 border border-accent-blue/50" />
                      </div>
                    </div>
                  )}
                  {i === 3 && (
                    <div className="absolute inset-0 flex p-6 bg-[#070A0D]">
                      <div className="w-full flex flex-col gap-3">
                        {[1, 2, 3].map((j) => (
                          <div key={j} className="h-12 w-full rounded border border-bg-border bg-bg-elevated flex items-center px-4">
                            <div className="h-2 w-2 rounded-full bg-accent-green mr-3" />
                            <div className="h-3 w-32 rounded bg-bg-border" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
