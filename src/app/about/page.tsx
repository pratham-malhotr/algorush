"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Activity, Globe, Shield, Zap, Cpu, Award, Users, CheckCircle2, Lock, ArrowRight, Building2 } from "lucide-react"
import { BackButton } from "@/components/ui/BackButton"

const FOUNDERS = [
  {
    name: "Dr. Alexander Vance",
    role: "Co-Founder & Chief Executive Officer",
    background: "Ex-Citadel & Two Sigma Senior Portfolio Manager. Ph.D. in Financial Econometrics from Imperial College London.",
    avatar: "/avatars/marcus.jpg"
  },
  {
    name: "Elena Rostova",
    role: "Co-Founder & Chief Technology Officer",
    background: "Ex-Jump Trading Low-Latency Architect. M.S. in Computer Science from MIT. Built Rust matching engines processing 5M ops/sec.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80"
  },
  {
    name: "Vikram Malhotra",
    role: "Head of Quantitative Research",
    background: "Ex-Goldman Sachs Systematic Derivatives. 12+ years designing statistical arbitrage algorithms and market making engines.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"
  }
]

const STATS = [
  { value: "$8.5M+", label: "Monthly Volume Processed" },
  { value: "14.2ms", label: "P99 Execution Latency" },
  { value: "60+", label: "Integrated CEX & DEX Venues" },
  { value: "1,240+", label: "Live Quantitative Algos" }
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white pt-2 pb-32">
      
      {/* Navigation Bar */}
      <div className="mx-auto max-w-[1200px] px-6 py-6">
        <BackButton />
      </div>

      {/* Hero Section */}
      <section className="mx-auto max-w-[950px] px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-widest mb-6">
          <Building2 className="h-3.5 w-3.5 text-blue-600" />
          About AlgoText.ai
        </div>

        <h1 className="mb-6 text-5xl font-extrabold text-gray-900 md:text-7xl tracking-tight leading-tight">
          Democratizing <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">Quantitative Infrastructure</span>.
        </h1>
        
        <p className="text-xl text-gray-600 leading-relaxed mb-10 max-w-3xl mx-auto">
          For decades, high-frequency trading and quantitative arbitrage were locked behind Wall Street walls. We are engineering the open standard for natural language & visual strategy execution.
        </p>

        {/* Company Quick Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto p-6 rounded-3xl bg-gray-50 border border-gray-200/80 shadow-sm">
          {STATS.map((stat, i) => (
            <div key={i}>
              <div className="text-2xl font-extrabold text-gray-900 font-mono">{stat.value}</div>
              <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Our Mission & Engineering Foundation */}
      <section className="mx-auto max-w-[1200px] px-6 py-20 border-t border-gray-100">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          
          {/* Left Decorative Architecture Diagram */}
          <div className="relative h-[480px] w-full rounded-3xl overflow-hidden border border-gray-200 bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 p-8 text-white shadow-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
              </div>
              <span className="text-xs font-mono text-gray-400">algotext-core-v2.8.rs</span>
            </div>

            <div className="space-y-4 my-auto">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Cpu className="h-5 w-5 text-blue-400" />
                  <span className="text-sm font-mono text-gray-200">Natural Language AST Compiler</span>
                </div>
                <span className="text-xs font-mono text-emerald-400">&lt; 1.2ms &gt;</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm font-mono text-gray-200">L2 Depth VWAP Orderbook Engine</span>
                </div>
                <span className="text-xs font-mono text-emerald-400">&lt; 3.4ms &gt;</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-purple-400" />
                  <span className="text-sm font-mono text-gray-200">RSA Non-Custodial Multi-Venue Router</span>
                </div>
                <span className="text-xs font-mono text-emerald-400">&lt; 9.6ms &gt;</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs font-mono text-gray-400">
              <span>Status: ACTIVE</span>
              <span className="text-emerald-400 font-bold">100% Non-Custodial Security</span>
            </div>
          </div>

          {/* Right Narrative */}
          <div className="space-y-6 text-gray-600 leading-relaxed text-base">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 block">Our Core Philosophy</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-snug">
              Combining Wall Street Quantitative Rigor with Modern AI Engineering.
            </h2>
            <p>
              AlgoText was founded on a simple conviction: if a trader can describe an edge in plain language or visual block logic, they should be able to backtest it on 3 years of tick data and deploy it live in sub-seconds.
            </p>
            <p>
              By combining high-throughput Rust matching engines with domain-tuned Large Language Models, we eliminated the barrier between complex mathematical algorithms and live market execution.
            </p>

            <div className="pt-4 grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Non-Custodial First</h4>
                  <p className="text-xs text-gray-500">Your API keys are encrypted client-side with zero withdrawal permissions.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Zero Platform Markups</h4>
                  <p className="text-xs text-gray-500">Flat subscription pricing with $0 volume surcharges and 0% profit fees.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Leadership Team Section */}
      <section className="mx-auto max-w-[1200px] px-6 py-20 border-t border-gray-100">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Led by Wall Street & HFT Veterans</h2>
          <p className="text-gray-600 max-w-xl mx-auto text-lg">Our leadership brings decades of experience from Citadel, Two Sigma, Jump Trading, and Goldman Sachs.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {FOUNDERS.map((founder, i) => (
            <div key={i} className="group rounded-3xl border border-gray-200 bg-white p-8 hover:shadow-xl hover:border-blue-200 transition-all flex flex-col justify-between">
              <div>
                <img 
                  src={founder.avatar} 
                  alt={founder.name} 
                  className="h-20 w-20 rounded-2xl object-cover mb-6 ring-2 ring-blue-500/20 shadow-md group-hover:scale-105 transition-transform"
                />
                <h3 className="text-xl font-bold text-gray-900 mb-1">{founder.name}</h3>
                <p className="text-xs text-blue-600 font-semibold mb-4">{founder.role}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{founder.background}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="mx-auto max-w-[1000px] px-6 py-12">
        <div className="rounded-3xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white p-10 text-center shadow-2xl flex flex-col items-center">
          <h3 className="text-3xl font-extrabold text-white mb-3">Ready to Build Your Quantitative Edge?</h3>
          <p className="text-gray-300 text-base max-w-xl mb-8">
            Experience sub-second live execution, AI genetic parameter auto-tuning, and institutional arbitrage scanning today.
          </p>
          <a 
            href="/builder" 
            className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-xl shadow-blue-500/30 transition-all hover:scale-105 flex items-center gap-2"
          >
            Launch Visual Builder Canvas <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </section>

    </div>
  )
}
