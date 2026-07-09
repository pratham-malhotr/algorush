"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { LayoutGrid, TrendingUp, History, Zap, Copy, ShieldAlert } from "lucide-react"

const FEATURES = [
  {
    title: "Visual Strategy Builder",
    description: "Drag blocks like Lego, connect with lines. Build complex logic visually.",
    icon: LayoutGrid,
  },
  {
    title: "50+ Technical Indicators",
    description: "RSI, MACD, Bollinger, Stochastic, ATR, and dozens more built-in.",
    icon: TrendingUp,
  },
  {
    title: "Instant Backtesting",
    description: "Test any strategy on 3 years of tick-level data in seconds.",
    icon: History,
  },
  {
    title: "Live Execution Engine",
    description: "Real-time strategy runner with sub-second latency via WebSockets.",
    icon: Zap,
  },
  {
    title: "Copy Top Traders",
    description: "Subscribe to profitable algos, mirror their trades automatically.",
    icon: Copy,
  },
  {
    title: "Risk Management",
    description: "Built-in stop loss, trailing stop, and drawdown limits to protect capital.",
    icon: ShieldAlert,
  },
]

export function FeaturesGrid() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-[36px] font-bold tracking-tight text-text-primary md:text-[48px]">
            Everything you need to <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-accent-blue to-accent-green bg-clip-text text-transparent">trade algorithmically</span>
          </h2>
          <p className="mx-auto max-w-[600px] text-[18px] text-text-secondary">
            Professional-grade tools packaged in an intuitive, no-code interface.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              key={i}
              className="group relative flex flex-col rounded-[var(--radius-lg)] border border-bg-border bg-white/50 p-8 transition-all hover:scale-[1.005]"
            >
              <div className="absolute inset-0 -z-10 rounded-[var(--radius-lg)] bg-gradient-to-br from-accent-blue/0 to-transparent opacity-0 transition-opacity duration-500 group-hover:from-accent-blue/10 group-hover:opacity-100" />
              <div className="absolute -inset-px -z-10 rounded-[var(--radius-lg)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: "linear-gradient(to bottom right, rgba(59,130,246,0.5), transparent)" }} />
              
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-bg-elevated transition-colors duration-500 group-hover:bg-accent-blue/20 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                <feature.icon className="h-6 w-6 text-text-secondary transition-colors duration-500 group-hover:text-accent-blue" />
              </div>
              <h3 className="mb-3 text-[18px] font-semibold text-text-primary">
                {feature.title}
              </h3>
              <p className="text-[14px] leading-[1.6] text-text-secondary">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
