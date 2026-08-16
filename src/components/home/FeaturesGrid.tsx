"use client"

import * as React from "react"
import Link from "next/link"
import { motion, useMotionTemplate, useMotionValue } from "framer-motion"
import { LayoutGrid, TrendingUp, History, Zap, Copy, ShieldAlert, User, ArrowRight, Layers, Dna, Sparkles, Bell, Percent, Flame } from "lucide-react"

const FEATURES = [
  {
    id: "builder",
    title: "Visual Strategy Builder",
    description: "Drag-and-drop ReactFlow node canvas. Connect triggers, conditions, indicator parameters, and risk brackets visually without writing code.",
    icon: LayoutGrid,
    href: "/builder",
    colSpan: "md:col-span-2 lg:col-span-2",
    color: "blue",
    mockup: () => (
      <div className="absolute -right-12 -bottom-12 h-[250px] w-[350px] text-blue-500 opacity-[0.15] pointer-events-none group-hover:opacity-40 transition-opacity duration-700">
         <svg viewBox="0 0 100 100" className="w-full h-full">
            <motion.path d="M10 50 Q 30 20, 50 50 T 90 50" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" 
               animate={{ strokeDashoffset: [20, 0] }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} />
            <rect x="5" y="45" width="10" height="10" rx="2" fill="currentColor" />
            <rect x="45" y="45" width="10" height="10" rx="2" fill="currentColor" />
            <rect x="85" y="45" width="10" height="10" rx="2" fill="currentColor" />
         </svg>
      </div>
    )
  },
  {
    id: "arbitrage",
    title: "Institutional Arbitrage Radar",
    description: "Scan sub-second spatial price spreads & cash-and-carry funding yields across 60+ CEX & DEX venues with Level-2 orderbook depth.",
    icon: Layers,
    href: "/arbitrage",
    colSpan: "md:col-span-1 lg:col-span-1",
    color: "cyan",
    mockup: () => (
      <div className="absolute right-2 top-2 h-40 w-40 bg-cyan-400/10 rounded-full blur-2xl group-hover:bg-cyan-400/30 transition-colors duration-700 pointer-events-none" />
    )
  },
  {
    id: "live-execution",
    title: "Live Execution Engine",
    description: "Real-time strategy runner with sub-second latency via WebSockets, TWAP/VWAP/Iceberg algorithms, and RSA key security.",
    icon: Zap,
    href: "/docs#order-types",
    colSpan: "md:col-span-1 lg:col-span-1",
    color: "amber",
    mockup: () => (
      <div className="absolute right-0 top-0 h-48 w-48 bg-amber-400/10 rounded-full blur-3xl group-hover:bg-amber-400/30 transition-colors duration-700 pointer-events-none" />
    )
  },
  {
    id: "auto-optimizer",
    title: "AI Genetic Auto-Optimizer",
    description: "Auto-tune RSI periods, EMA lengths, and SL/TP ratios across 30+ generations of parameter evolution to maximize Sharpe ratio.",
    icon: Dna,
    href: "/docs#auto-optimizer",
    colSpan: "md:col-span-1 lg:col-span-1",
    color: "purple",
    mockup: () => (
      <div className="absolute right-4 bottom-4 h-32 w-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/30 transition-colors duration-700 pointer-events-none" />
    )
  },
  {
    id: "sentiment",
    title: "AI News & Sentiment Engine",
    description: "Parse breaking financial headlines, Fed dot plots, and CPI data in real-time with LLM sentiment scoring (-100 to +100).",
    icon: Sparkles,
    href: "/docs#sentiment-engine",
    colSpan: "md:col-span-1 lg:col-span-1",
    color: "emerald",
    mockup: () => (
      <div className="absolute left-4 bottom-4 h-28 w-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/30 transition-colors duration-700 pointer-events-none" />
    )
  },
  {
    id: "indicators",
    title: "50+ Technical Indicators",
    description: "RSI, MACD, Bollinger Bands, Stochastic, VWAP, ATR, and custom mathematical indicators built-in.",
    icon: TrendingUp,
    href: "/docs#prompting",
    colSpan: "md:col-span-1 lg:col-span-1",
    color: "green",
    mockup: () => (
       <div className="absolute inset-0 opacity-10 pointer-events-none flex items-end group-hover:opacity-30 transition-opacity duration-700 text-green-500">
         <svg viewBox="0 0 100 50" className="w-full h-full" preserveAspectRatio="none">
            <motion.path d="M0 40 L20 30 L40 45 L60 15 L80 25 L100 5 L100 50 L0 50 Z" fill="currentColor" opacity="0.2" />
            <motion.path d="M0 40 L20 30 L40 45 L60 15 L80 25 L100 5" fill="none" stroke="currentColor" strokeWidth="2" 
              initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 1.5 }} />
         </svg>
       </div>
    )
  },
  {
    id: "backtesting",
    title: "Instant Backtesting & Monte Carlo",
    description: "Test any strategy on 3 years of tick-level data in seconds. Run 1,000 Monte Carlo paths for 95% Value-at-Risk (VaR) evaluation.",
    icon: History,
    href: "/docs#backtesting",
    colSpan: "md:col-span-1 lg:col-span-1",
    color: "purple",
    mockup: () => (
      <div className="absolute right-6 bottom-6 flex gap-1.5 opacity-20 group-hover:opacity-50 transition-opacity duration-700 text-purple-500 pointer-events-none">
          {[1,2,3,4,5,6,7].map(i => (
            <motion.div key={i} className="w-2 bg-currentColor rounded-t-sm"
              animate={{ height: [10, 15 + ((i * 7) % 25), 10] }}
              transition={{ repeat: Infinity, duration: 1 + ((i * 3) % 8) / 10, delay: i * 0.1 }}
            />
          ))}
      </div>
    )
  },
  {
    id: "risk-management",
    title: "Risk Management & Kill Switch",
    description: "Built-in stop loss, trailing stop, max drawdown limits, circuit breakers, and 1-click Global Kill Switch.",
    icon: ShieldAlert,
    href: "/docs#risk-management",
    colSpan: "md:col-span-1 lg:col-span-1",
    color: "red",
    mockup: () => (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center opacity-[0.05] group-hover:opacity-20 transition-opacity duration-700 pointer-events-none text-red-500">
         <div className="w-40 h-40 border-[4px] border-currentColor rounded-full animate-ping" />
      </div>
    )
  },
  {
    id: "copy-traders",
    title: "Social Copy-Trading & Webhooks",
    description: "Subscribe to profitable algos, mirror master trades automatically, and broadcast execution alerts to Discord & Telegram channels.",
    icon: Copy,
    href: "/marketplace",
    colSpan: "md:col-span-2 lg:col-span-3",
    color: "indigo",
    mockup: () => (
      <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center opacity-[0.15] group-hover:opacity-100 transition-opacity duration-700 pointer-events-none text-indigo-500">
         {[1,2,3,4,5].map((i) => (
           <motion.div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-currentColor shadow-xl relative z-10 flex items-center justify-center text-white" 
             style={{ marginLeft: i > 1 ? -15 : 0, zIndex: 10 - i }}
             animate={{ y: [0, -5, 0] }}
             transition={{ repeat: Infinity, duration: 3, delay: i * 0.2 }}
           >
             <User className="h-5 w-5" />
           </motion.div>
         ))}
      </div>
    )
  },
]

const COLOR_MAP: Record<string, { bg: string, text: string, rgb: string }> = {
  blue: { bg: "bg-blue-50", text: "text-blue-600", rgb: "59, 130, 246" },
  cyan: { bg: "bg-cyan-50", text: "text-cyan-600", rgb: "6, 182, 212" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", rgb: "245, 158, 11" },
  green: { bg: "bg-green-50", text: "text-green-600", rgb: "34, 197, 94" },
  purple: { bg: "bg-purple-50", text: "text-purple-600", rgb: "168, 85, 247" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", rgb: "16, 185, 129" },
  red: { bg: "bg-red-50", text: "text-red-600", rgb: "239, 68, 68" },
  indigo: { bg: "bg-indigo-50", text: "text-indigo-600", rgb: "99, 102, 241" },
}

function BentoCard({ feature, index }: { feature: any, index: number }) {
  const colors = COLOR_MAP[feature.color as keyof typeof COLOR_MAP] || COLOR_MAP.blue
  
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${feature.colSpan}`}
    >
      <Link href={feature.href} className="absolute inset-0 z-20" title={`Explore ${feature.title}`} />

      {/* Spotlight Glow Effect on Hover */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-0"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(${colors.rgb}, 0.08),
              transparent 80%
            )
          `,
        }}
      />
      
      {/* Embedded mockup animation */}
      <feature.mockup />
      
      <div className="relative z-10 flex flex-col max-w-[85%] md:max-w-[75%]">
        <div className="flex items-center justify-between mb-6">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${colors.bg} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
            <feature.icon className={`h-6 w-6 ${colors.text}`} />
          </div>
          <div className="flex items-center gap-1 font-bold text-xs text-gray-400 group-hover:text-blue-600 transition-colors">
            <span>Learn Details</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>

        <h3 className="mb-3 text-[22px] font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <span>{feature.title}</span>
        </h3>
        <p className="text-[15px] leading-relaxed text-gray-500">
          {feature.description}
        </p>
      </div>
    </motion.div>
  )
}

export function FeaturesGrid() {
  return (
    <section className="bg-white py-24 overflow-hidden relative">
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
            Professional-grade tools packaged in an intuitive, ultra-modern interface. Click any feature below to inspect documentation and live execution controls.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <BentoCard key={i} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
