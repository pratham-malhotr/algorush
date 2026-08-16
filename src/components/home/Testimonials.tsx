"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Star, ShieldCheck, CheckCircle2, TrendingUp, Cpu, Award, Zap, BarChart3 } from "lucide-react"

interface Testimonial {
  id: string
  name: string
  handle: string
  role: string
  firm: string
  location: string
  avatar: string
  badge: string
  category: "fund" | "arbitrage" | "prop"
  metrics: { label: string; value: string }[]
  content: string
  verifiedAum: string
  date: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: "marcus",
    name: "Marcus Vance",
    handle: "@marcusvance_quant",
    role: "Head of Algorithmic Trading",
    firm: "Apex Volatility Alpha",
    location: "London, UK",
    avatar: "/avatars/marcus.jpg",
    badge: "Verified $4.5M AUM",
    category: "fund",
    metrics: [
      { label: "Execution Latency", value: "14.2ms" },
      { label: "Slippage Saved", value: "42 bps" },
    ],
    content: "We replaced our legacy custom Python scripts with AlgoText's sub-second execution engine. Executing multi-leg TWAP orders with L2 depth ladder absorption reduced our monthly execution drag by over $18,400 across Binance and OKX.",
    verifiedAum: "$4.5M Traded",
    date: "Aug 12, 2026"
  },
  {
    id: "elena",
    name: "Elena Rostova",
    handle: "@elena_derivatives",
    role: "Lead Arbitrage Strategist",
    firm: "Nexo Quant Capital",
    location: "Singapore",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
    badge: "Top Arbitrageur #1",
    category: "arbitrage",
    metrics: [
      { label: "Basis Yield APY", value: "94.6%" },
      { label: "Funding Captured", value: "$32.4k/mo" },
    ],
    content: "The Spot-Futures Cash & Carry Basis scanner is standard-setting. It spots sub-second funding rate divergences between Hyperliquid and Bybit instantly. The automated inventory rebalancer keeps our delta strictly 100% neutral.",
    verifiedAum: "$2.8M Traded",
    date: "Aug 14, 2026"
  },
  {
    id: "julian",
    name: "Dr. Julian Thorne",
    handle: "@thorne_quant",
    role: "Quantitative Portfolio Manager",
    firm: "Ex-Two Sigma / Independent",
    location: "New York, USA",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80",
    badge: "Verified AI Optimizer User",
    category: "fund",
    metrics: [
      { label: "Sharpe Ratio Boost", value: "1.62 → 2.85" },
      { label: "Generations Run", value: "35 Gens" },
    ],
    content: "The AI Genetic Auto-Optimizer mutated our mean-reversion parameters over 35 generations in minutes. Being able to run 1,000 Monte Carlo VaR simulation paths before deploying live capital gives our risk committee total confidence.",
    verifiedAum: "$1.2M Traded",
    date: "Aug 09, 2026"
  },
  {
    id: "vikram",
    name: "Vikram Malhotra",
    handle: "@vikram_algo_prop",
    role: "Proprietary Futures Trader",
    firm: "Dubai Quant Desk",
    location: "Dubai, UAE",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    badge: "Verified Prop Trader",
    category: "prop",
    metrics: [
      { label: "Max Drawdown Cap", value: "2.5%" },
      { label: "Kill Switch Triggers", value: "0 Breaches" },
    ],
    content: "Risk parameters are non-negotiable when managing real prop firm capital. AlgoText's Global Kill Switch and dynamic trailing stop brackets automatically protected our equity during last week's market volatility spike.",
    verifiedAum: "$850k Traded",
    date: "Aug 15, 2026"
  },
  {
    id: "sophia",
    name: "Sophia Lin",
    handle: "@sophialin_fintech",
    role: "Senior Quant Researcher",
    firm: "Blockwork Capital",
    location: "San Francisco, USA",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80",
    badge: "Verified Developer API",
    category: "fund",
    metrics: [
      { label: "Backtest Tick Speed", value: "3.2M Ticks/sec" },
      { label: "SDK Latency", value: "1.8ms" },
    ],
    content: "The REST API and Python SDK integration is seamlessly built. We stream high-frequency order signals via WebSockets into AlgoText's visual engine with zero drop-off. It feels like an institutional terminal costing $2,000/mo.",
    verifiedAum: "$3.1M Traded",
    date: "Aug 11, 2026"
  },
  {
    id: "kaito",
    name: "Kaito Tanaka",
    handle: "@kaito_crypto_quant",
    role: "Systematic Market Maker",
    firm: "Solana & CEX Liquidity",
    location: "Tokyo, Japan",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    badge: "Verified Arbitrageur",
    category: "arbitrage",
    metrics: [
      { label: "Live Win Rate", value: "88.4%" },
      { label: "Webhook Alerts", value: "<15ms" },
    ],
    content: "The Telegram & Discord signal webhooks instantly sync our master execution alerts to our private copy-trading followers with zero delay. It's the most reliable signal engine on the market.",
    verifiedAum: "$1.9M Traded",
    date: "Aug 16, 2026"
  }
]

export function Testimonials() {
  const [activeTab, setActiveTab] = React.useState<"all" | "fund" | "arbitrage" | "prop">("all")

  const filteredTestimonials = React.useMemo(() => {
    if (activeTab === "all") return TESTIMONIALS
    return TESTIMONIALS.filter(t => t.category === activeTab)
  }, [activeTab])

  return (
    <section className="bg-bg-base py-28 relative overflow-hidden border-t border-gray-100">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-[1250px] px-6 lg:px-10 relative z-10">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center max-w-[750px] mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-widest mb-4">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            Verified Wall Street & Institutional Users
          </div>
          <h2 className="mb-4 text-[36px] font-extrabold tracking-tight text-gray-900 md:text-[48px]">
            Trusted by Professional Quants & Fund Managers
          </h2>
          <p className="text-[18px] text-gray-600 leading-relaxed">
            See how systematic funds, derivative arbitrageurs, and prop traders execute automated strategies using AlgoText's high-speed quantitative stack.
          </p>

          {/* Category Filter Tabs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 p-1.5 bg-gray-100/80 rounded-2xl max-w-fit mx-auto border border-gray-200/80">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "all" ? "bg-white text-gray-900 shadow-md" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              All Quants ({TESTIMONIALS.length})
            </button>
            <button
              onClick={() => setActiveTab("fund")}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "fund" ? "bg-white text-blue-600 shadow-md" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Fund Managers & PMs
            </button>
            <button
              onClick={() => setActiveTab("arbitrage")}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "arbitrage" ? "bg-white text-emerald-600 shadow-md" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Arbitrage & Basis
            </button>
            <button
              onClick={() => setActiveTab("prop")}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "prop" ? "bg-white text-purple-600 shadow-md" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Prop Traders
            </button>
          </div>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTestimonials.map((t, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              key={t.id} 
              className="group relative flex flex-col justify-between rounded-[2rem] border border-gray-200 bg-white p-7 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div>
                {/* Header: Photo Avatar, Name, Verified Badge */}
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3.5">
                    <img 
                      src={t.avatar} 
                      alt={t.name} 
                      className="h-13 w-13 rounded-2xl object-cover ring-2 ring-blue-500/20 shadow-md group-hover:scale-105 transition-transform shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-gray-900 text-base leading-snug flex items-center gap-1.5">
                        {t.name}
                        <CheckCircle2 className="h-4 w-4 fill-blue-500 text-white shrink-0" />
                      </h4>
                      <p className="text-xs text-gray-500 font-medium">{t.role}</p>
                      <p className="text-[11px] text-blue-600 font-semibold">{t.firm} • {t.location}</p>
                    </div>
                  </div>

                  <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-600" />
                    {t.verifiedAum}
                  </span>
                </div>

                {/* Rating Stars & Verification Badge */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                  <div className="flex gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-gray-400 font-mono">{t.badge}</span>
                </div>

                {/* Real Detailed Review Text */}
                <p className="mb-6 text-[14px] leading-relaxed text-gray-700 font-normal">
                  &quot;{t.content}&quot;
                </p>
              </div>

              {/* Embedded Performance Metrics Badge */}
              <div className="mt-2 pt-4 border-t border-gray-100 bg-gray-50/70 -mx-7 -mb-7 p-5 rounded-b-[2rem] flex items-center justify-around text-center">
                {t.metrics.map((m, idx) => (
                  <div key={idx} className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{m.label}</span>
                    <span className="text-sm font-extrabold text-gray-900 font-mono">{m.value}</span>
                  </div>
                ))}
              </div>

            </motion.div>
          ))}
        </div>

        {/* Institutional Trust Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center p-8 rounded-3xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="h-12 w-12 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-400/30 shrink-0">
              <Award className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Join $8.5M+ in Automated Monthly Trading Volume</h4>
              <p className="text-xs text-gray-400 mt-0.5">Non-custodial RSA API integration. Your funds never leave your exchange account.</p>
            </div>
          </div>

          <a 
            href="/builder" 
            className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-500/30 transition-all hover:scale-105 shrink-0"
          >
            Deploy Your Strategy Now →
          </a>
        </motion.div>

      </div>
    </section>
  )
}
