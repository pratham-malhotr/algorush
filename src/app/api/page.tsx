"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Terminal, Key, Webhook, Code2, Cpu, ArrowRight, BookOpen, Layers } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ApiPage() {
  return (
    <div className="min-h-screen bg-bg-base pt-10 pb-32">
      <div className="mx-auto max-w-[1200px] px-6">
        
        {/* Hero Section */}
        <div className="mb-20 grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center rounded-full border border-accent-blue/30 bg-accent-blue/10 px-3 py-1 mb-6 text-sm font-medium text-accent-blue"
            >
              <Terminal className="mr-2 h-4 w-4" />
              AlgoText API v1
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="mb-6 text-5xl font-bold text-text-primary md:text-6xl tracking-tight"
            >
              Build trading bots <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-blue to-purple-500">at lightspeed.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="mb-8 text-lg text-text-secondary leading-relaxed max-w-[500px]"
            >
              Integrate AlgoText's institutional-grade infrastructure directly into your own applications. Connect to 50+ exchanges, backtest strategies, and stream real-time execution logs with our unified API.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button variant="primary" className="h-12 px-8 text-[15px] group">
                Generate API Key
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Link href="/docs">
                <Button variant="secondary" className="h-12 w-full sm:w-auto px-8 text-[15px] border border-bg-border bg-bg-surface hover:bg-bg-elevated">
                  Read Documentation
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Code Snippet Display */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
            className="relative rounded-[2rem] border border-bg-border bg-[#070A0D] p-6 shadow-2xl overflow-hidden"
          >
            {/* Mac Window Dots */}
            <div className="mb-4 flex items-center gap-2 border-b border-white/5 pb-4">
              <div className="h-3 w-3 rounded-full bg-red-500/80" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <div className="h-3 w-3 rounded-full bg-green-500/80" />
              <div className="ml-2 text-xs text-text-tertiary font-mono">execute_strategy.py</div>
            </div>
            
            <pre className="text-sm font-mono leading-relaxed overflow-x-auto text-gray-300">
              <code className="language-python">
                <span className="text-purple-400">import</span> algotext<br/>
                <span className="text-purple-400">from</span> algotext.models <span className="text-purple-400">import</span> Strategy<br/><br/>
                <span className="text-text-tertiary"># Initialize client with your secure API key</span><br/>
                client = algotext.Client(api_key=<span className="text-green-400">"at_sk_live_12345"</span>)<br/><br/>
                <span className="text-text-tertiary"># Load a pre-compiled AST strategy</span><br/>
                strategy = client.strategies.get(<span className="text-green-400">"strat_987xyz"</span>)<br/><br/>
                <span className="text-text-tertiary"># Deploy directly to Binance via our execution layer</span><br/>
                deployment = client.deployments.create(<br/>
                &nbsp;&nbsp;strategy_id=strategy.id,<br/>
                &nbsp;&nbsp;exchange=<span className="text-green-400">"BINANCE"</span>,<br/>
                &nbsp;&nbsp;allocation=<span className="text-orange-400">5000</span>, <span className="text-text-tertiary"># USDT</span><br/>
                &nbsp;&nbsp;max_leverage=<span className="text-orange-400">2.0</span><br/>
                )<br/><br/>
                <span className="text-blue-400">print</span>(<span className="text-green-400">f"Strategy deployed successfully! ID: </span><span className="text-orange-400">&#123;</span>deployment.id<span className="text-orange-400">&#125;</span><span className="text-green-400">"</span>)
              </code>
            </pre>
            
            {/* Glow */}
            <div className="absolute -bottom-20 -right-20 h-[200px] w-[200px] rounded-full bg-accent-blue/20 blur-[80px] pointer-events-none" />
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="mb-24">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-bg-border bg-bg-surface p-6 transition-colors hover:border-accent-blue/30 hover:bg-bg-elevated">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-blue/10 text-accent-blue border border-accent-blue/20">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-text-primary">REST API</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Manage strategies, backtests, accounts, and API keys programmatically through standard HTTP requests.
              </p>
            </div>
            <div className="rounded-2xl border border-bg-border bg-bg-surface p-6 transition-colors hover:border-purple-500/30 hover:bg-bg-elevated">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Code2 className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-text-primary">Official SDKs</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Drop-in libraries available for Python, TypeScript/Node.js, and Go for rapid integration into your stack.
              </p>
            </div>
            <div className="rounded-2xl border border-bg-border bg-bg-surface p-6 transition-colors hover:border-accent-green/30 hover:bg-bg-elevated">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-green/10 text-accent-green border border-accent-green/20">
                <Webhook className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-text-primary">WebSockets</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Stream live order book data, execution events, and portfolio balance updates with millisecond latency.
              </p>
            </div>
            <div className="rounded-2xl border border-bg-border bg-bg-surface p-6 transition-colors hover:border-orange-500/30 hover:bg-bg-elevated">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                <Key className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-text-primary">OAuth & JWT</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Securely authenticate users if you are building third-party applications on top of the AlgoText ecosystem.
              </p>
            </div>
          </div>
        </div>

        {/* Explore Docs Banner */}
        <div className="relative overflow-hidden rounded-[2rem] border border-bg-border bg-gradient-to-br from-bg-surface to-bg-base p-10 text-center md:p-16">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-blue/10 text-accent-blue border border-accent-blue/20">
              <BookOpen className="h-8 w-8" />
            </div>
            <h2 className="mb-4 text-3xl font-bold text-text-primary">Ready to start building?</h2>
            <p className="mb-8 text-text-secondary max-w-[600px] mx-auto text-lg">
              Check out our comprehensive documentation. We've included quickstarts, architectural overviews, and detailed endpoint schemas.
            </p>
            <div className="flex gap-4">
              <Link href="/docs">
                <Button variant="primary" className="h-12 px-8">
                  View Developer Docs
                </Button>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
