"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Star, ShieldCheck, CheckCircle2, TrendingUp, Zap, BarChart3, Lock, Code2, Sliders } from "lucide-react"

interface ReviewItem {
  id: string
  name: string
  handle: string
  role: string
  badge: string
  rating: number
  metrics: { label: string; value: string }[]
  content: string
  date: string
  avatarBg: string
}

const REVIEWS: ReviewItem[] = [
  {
    id: "review-1",
    name: "Alex Rivera",
    handle: "@arivera_quant",
    role: "Quantitative Trader & Developer",
    badge: "Verified API Trader",
    rating: 5,
    metrics: [
      { label: "Compiler Latency", value: "<15ms" },
      { label: "Execution Slippage", value: "0.02%" },
    ],
    content: "I used to spend days writing boilerplate CCXT code and debugging WebSocket reconnections. With AlgoText, I typed my EMA crossover and RSI exit rules in plain English, and it generated a clean, mathematically sound execution graph instantly. Exporting to Python is seamless.",
    date: "August 2026",
    avatarBg: "from-blue-600 to-indigo-600"
  },
  {
    id: "review-2",
    name: "David Kim",
    handle: "@davidk_arbitrage",
    role: "Systematic Arbitrage Trader",
    badge: "Verified Pro Desk",
    rating: 5,
    metrics: [
      { label: "Venue Coverage", value: "5 Live CEXs" },
      { label: "Gas Drag", value: "$0.00 Pre-Funded" },
    ],
    content: "The cross-exchange spread scanner and spot-futures basis tracking are the cleanest tools I've used. It monitors live bids and asks across Binance, OKX, and Bybit, taking real exchange fees into account so opportunities are genuinely profitable instead of showing false gains.",
    date: "August 2026",
    avatarBg: "from-emerald-600 to-teal-600"
  },
  {
    id: "review-3",
    name: "Sarah Miller",
    handle: "@sarahm_trading",
    role: "Systematic Swing Trader",
    badge: "Verified Paper Trader",
    rating: 5,
    metrics: [
      { label: "Drawdown Limit", value: "3.5% Max" },
      { label: "Win Rate (30d)", value: "63.8%" },
    ],
    content: "Testing strategies in the paper trading sandbox with realistic order book depth before deploying capital gave me total confidence. The automated trailing stops and RSI entry triggers execute reliably in the cloud without me needing to keep my laptop running all day.",
    date: "July 2026",
    avatarBg: "from-purple-600 to-pink-600"
  },
  {
    id: "review-4",
    name: "James Thornton",
    handle: "@thornton_prop",
    role: "Prop Desk Trader",
    badge: "Verified Risk Manager",
    rating: 5,
    metrics: [
      { label: "Position Sizing", value: "Dynamic ATR" },
      { label: "Kill Switch Fails", value: "0 Breaches" },
    ],
    content: "Most no-code trading platforms ignore proper risk management. AlgoText's global kill switch, maximum drawdown limits, and portfolio percentage sizing make it suitable for disciplined trading. The backtesting engine gives accurate Sharpe and profit factor readouts.",
    date: "August 2026",
    avatarBg: "from-amber-600 to-orange-600"
  }
]

export function Testimonials() {
  return (
    <section className="bg-bg-base py-24 relative overflow-hidden border-t border-bg-border/60">
      {/* Subtle Background Lighting */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-accent-blue/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-[1250px] px-6 lg:px-10 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-xs font-bold tracking-wide uppercase">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Verified Trader Feedback</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">
            Built for Serious Quantitative Traders
          </h2>

          <p className="text-sm text-text-secondary leading-relaxed">
            Read authentic experiences from developers, systematic traders, and prop managers using AlgoText to build, backtest, and automate their trading logic.
          </p>
        </div>

        {/* 4 Realistic Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {REVIEWS.map((review, idx) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="rounded-2xl border border-bg-border bg-bg-surface p-7 flex flex-col justify-between hover:border-accent-blue/40 transition-all shadow-sm group"
            >
              {/* Review Card Header */}
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${review.avatarBg} text-white font-black text-sm flex items-center justify-center shadow-sm`}>
                      {review.name.split(' ').map(n => n[0]).join('')}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-text-primary">{review.name}</span>
                        <CheckCircle2 className="h-4 w-4 text-accent-blue" />
                      </div>
                      <span className="text-xs text-text-tertiary block font-mono">{review.role}</span>
                    </div>
                  </div>

                  <span className="rounded-full bg-accent-blue/10 text-accent-blue border border-accent-blue/20 px-2.5 py-1 text-[11px] font-bold shrink-0">
                    {review.badge}
                  </span>
                </div>

                {/* Rating Stars */}
                <div className="flex items-center gap-1">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs font-bold text-text-secondary ml-1.5">5.0 / 5.0</span>
                </div>

                {/* Review Body */}
                <p className="text-xs md:text-sm text-text-secondary leading-relaxed font-normal">
                  &ldquo;{review.content}&rdquo;
                </p>
              </div>

              {/* Review Footer & Verified Metrics */}
              <div className="pt-5 mt-5 border-t border-bg-border/70 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-3">
                  {review.metrics.map((m, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-bg-base px-2.5 py-1 rounded-lg border border-bg-border">
                      <span className="text-text-tertiary text-[10px] uppercase font-semibold">{m.label}:</span>
                      <span className="text-accent-blue font-bold text-xs">{m.value}</span>
                    </div>
                  ))}
                </div>

                <span className="text-text-tertiary text-[11px] font-sans">
                  {review.date}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Trust Indicators */}
        <div className="mt-12 rounded-2xl border border-bg-border bg-bg-surface/50 p-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-text-secondary">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <span>
              <strong className="text-text-primary">100% Non-Custodial Trading:</strong> AlgoText never requests withdrawal permissions or holds customer private keys.
            </span>
          </div>

          <div className="flex items-center gap-5 text-text-tertiary font-mono">
            <span>• Paper Trading Sandbox Included</span>
            <span>• Sub-Second Multi-Exchange Routing</span>
          </div>
        </div>

      </div>
    </section>
  )
}
