"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Activity, Globe, Shield, Zap } from "lucide-react"
import Image from "next/image"
import { BackButton } from "@/components/ui/BackButton"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-bg-primary pt-24 pb-32">
      {/* Hero */}
      <section className="mx-auto max-w-[800px] px-6 py-20 text-center">
        <div className="flex justify-start"><BackButton /></div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-5xl font-bold text-text-primary md:text-7xl tracking-tight"
        >
          Democratizing <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-blue to-purple-500">Algorithmic Trading.</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-xl text-text-secondary leading-relaxed"
        >
          For decades, quantitative trading was locked behind a wall of C++ code, PhDs, and massive institutional capital. We are tearing that wall down.
        </motion.p>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-[1200px] px-6 py-12">
        <div className="grid gap-12 md:grid-cols-2 items-center">
          <div className="relative h-[500px] w-full rounded-[2rem] overflow-hidden border border-bg-border bg-bg-surface flex items-center justify-center p-8">
             {/* Abstract visual representation of the engine */}
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent-blue/10 via-bg-surface to-bg-surface" />
             <Activity className="h-48 w-48 text-accent-blue opacity-50" />
          </div>
          <div className="space-y-6 text-lg text-text-secondary leading-relaxed">
            <h2 className="text-3xl font-bold text-text-primary">Our Mission</h2>
            <p>
              AlgoText was founded on a simple premise: if you can describe a trading strategy in plain English, you should be able to execute it instantly in the live markets.
            </p>
            <p>
              We combined breakthrough advancements in Large Language Models (LLMs) with an ultra-low latency Rust execution engine. The result is a platform that translates human intuition directly into verifiable, executable code in milliseconds.
            </p>
            <p>
              We believe the future of finance is transparent, non-custodial, and accessible to everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-[1200px] px-6 py-20">
        <h2 className="mb-12 text-center text-4xl font-bold text-text-primary">Core Values</h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl bg-bg-surface p-8 border border-bg-border">
            <Shield className="mb-4 h-10 w-10 text-orange-500" />
            <h3 className="mb-3 text-xl font-bold text-text-primary">Non-Custodial First</h3>
            <p className="text-text-secondary">We never hold your funds. Security is paramount, and self-custody is the only way to guarantee it.</p>
          </div>
          <div className="rounded-2xl bg-bg-surface p-8 border border-bg-border">
            <Zap className="h-10 w-10 text-accent-green" />
            <h3 className="mb-3 text-xl font-bold text-text-primary">Zero Compromise Speed</h3>
            <p className="text-text-secondary">Ease of use shouldn't mean slow execution. Our edge network executes trades with sub-second latency globally.</p>
          </div>
          <div className="rounded-2xl bg-bg-surface p-8 border border-bg-border">
            <Globe className="h-10 w-10 text-accent-blue" />
            <h3 className="mb-3 text-xl font-bold text-text-primary">Radical Transparency</h3>
            <p className="text-text-secondary">No hidden fees. No front-running. Our AST compiler shows you exactly what your bot will do before you deploy it.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
