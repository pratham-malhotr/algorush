"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  BookOpen, Terminal, Activity, Wallet, Shield, Zap, 
  ChevronRight, Search, Copy, Check, Webhook, Code2, Layers
} from "lucide-react"
import { BackButton } from "@/components/ui/BackButton"

// --- Helper Components ---

function CodeBlock({ code, language = "json" }: { code: string, language?: string }) {
  const [copied, setCopied] = React.useState(false)
  
  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group rounded-xl bg-[#0a0a0a] border border-bg-border overflow-hidden my-6 shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
        <span className="text-xs font-mono text-text-secondary uppercase">{language}</span>
        <button onClick={handleCopy} className="text-text-secondary hover:text-white transition-colors">
          {copied ? <Check className="h-4 w-4 text-accent-green" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-[13px] font-mono leading-relaxed text-white/90">
        <pre><code>{code}</code></pre>
      </div>
    </div>
  )
}

function TabbedCodeBlock({ id, tabs }: { id: string, tabs: { name: string, code: string, lang: string }[] }) {
  const [activeTab, setActiveTab] = React.useState(0)
  const [copied, setCopied] = React.useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(tabs[activeTab].code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <div className="rounded-xl border border-bg-border bg-bg-surface overflow-hidden my-6 shadow-2xl">
      <div className="flex items-center justify-between border-b border-bg-border bg-black/20 pr-4">
        <div className="flex">
          {tabs.map((tab, i) => (
            <button 
              key={i}
              onClick={() => setActiveTab(i)}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === i ? "text-accent-blue" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab.name}
              {activeTab === i && (
                <motion.div layoutId={`tab-indicator-${id}`} className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-blue" />
              )}
            </button>
          ))}
        </div>
        <button onClick={handleCopy} className="text-text-secondary hover:text-white transition-colors">
          {copied ? <Check className="h-4 w-4 text-accent-green" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      <div className="p-4 bg-[#0a0a0a] text-[13px] font-mono text-white/90 overflow-x-auto">
         <pre><code>{tabs[activeTab].code}</code></pre>
      </div>
    </div>
  )
}

function NavMenuLink({ href, title }: { href: string, title: string }) {
  return (
    <Link 
      href={href} 
      className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-surface hover:text-text-primary"
    >
      <span>{title}</span>
      <ChevronRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  )
}

// --- Main Page ---

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-bg-primary pt-24">
      
      {/* Docs Header */}
      <div className="border-b border-bg-border bg-bg-surface">
        <div className="mx-auto flex max-w-[1400px] flex-col md:flex-row items-start md:items-center justify-between px-6 py-12 gap-6">
          <div>
            <BackButton />
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="h-8 w-8 text-accent-blue" />
              <h1 className="text-4xl font-bold text-text-primary tracking-tight">AlgoText Documentation</h1>
            </div>
            <p className="text-xl text-text-secondary max-w-[600px]">
              Advanced guides, API references, and architecture overviews for quantitative trading.
            </p>
          </div>
          
          {/* Fake Search Bar for aesthetics */}
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-bg-border bg-bg-primary px-4 py-2 text-text-secondary w-64 shadow-inner">
            <Search className="h-4 w-4" />
            <span className="text-sm">Search documentation...</span>
            <div className="ml-auto flex items-center gap-1 rounded bg-bg-surface px-1.5 py-0.5 text-xs font-mono border border-bg-border">
              <span>⌘</span><span>K</span>
            </div>
          </div>
        </div>
      </div>

      {/* Docs Layout (3 Columns) */}
      <div className="mx-auto flex max-w-[1400px] flex-col md:flex-row px-6 py-12 gap-6 lg:gap-12 relative">
        
        {/* Left Sidebar (Navigation) */}
        <aside className="hidden md:block w-[200px] lg:w-[240px] shrink-0">
          <div className="sticky top-28 flex flex-col gap-8">
            <div>
              <h3 className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-text-secondary">Core Concepts</h3>
              <div className="flex flex-col gap-1">
                <NavMenuLink href="#architecture" title="Architecture" />
                <NavMenuLink href="#prompting" title="Prompt Engineering" />
                <NavMenuLink href="#backtesting" title="Backtesting Engine" />
              </div>
            </div>
            <div>
              <h3 className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-text-secondary">Advanced Execution</h3>
              <div className="flex flex-col gap-1">
                <NavMenuLink href="#order-types" title="TWAP & VWAP Orders" />
                <NavMenuLink href="#risk-management" title="Dynamic Risk Sizing" />
                <NavMenuLink href="#webhooks" title="TradingView Webhooks" />
              </div>
            </div>
            <div>
              <h3 className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-text-secondary">Developer</h3>
              <div className="flex flex-col gap-1">
                <NavMenuLink href="#api-reference" title="REST API Reference" />
                <NavMenuLink href="#security" title="Non-Custodial Security" />
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 max-w-[800px] space-y-24 pb-24">
          
          {/* Architecture */}
          <section id="architecture" className="scroll-mt-28">
            <div className="mb-2 flex items-center gap-2 text-accent-blue">
              <Layers className="h-5 w-5" />
              <span className="text-sm font-bold uppercase tracking-wider">Overview</span>
            </div>
            <h2 className="mb-6 text-3xl font-bold text-text-primary">System Architecture</h2>
            <div className="prose prose-invert max-w-none text-text-secondary space-y-4">
              <p className="text-[17px] leading-relaxed">
                AlgoText bridges the gap between natural language processing (NLP) and high-frequency trading (HFT). 
                The system compiles plain English intents into deterministic JSON Abstract Syntax Trees (ASTs), which are then executed by our ultra-low latency Rust order engine.
              </p>
              
              <TabbedCodeBlock 
                id="arch-tabs"
                tabs={[
                  {
                    name: "1. Plain English",
                    lang: "text",
                    code: "Buy 10 ETH over 2 hours using TWAP if RSI < 30."
                  },
                  {
                    name: "2. AST Output (Internal)",
                    lang: "json",
                    code: `{
  "intent": "EXECUTE_ORDER",
  "asset": "ETH",
  "amount": 10,
  "execution_algo": "TWAP",
  "duration_ms": 7200000,
  "conditions": [
    { "indicator": "RSI", "period": 14, "operator": "<", "value": 30 }
  ]
}`
                  }
                ]}
              />
            </div>
          </section>

          {/* Prompt Engineering */}
          <section id="prompting" className="scroll-mt-28">
            <h2 className="mb-6 text-3xl font-bold text-text-primary">Advanced Prompt Engineering</h2>
            <div className="space-y-6 text-[17px] text-text-secondary leading-relaxed">
              <p>
                While AlgoText understands basic commands, utilizing advanced prompt structures unlocks institutional-grade execution strategies.
              </p>
              <div className="rounded-xl border border-accent-blue/30 bg-accent-blue/5 p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-accent-blue" />
                <h4 className="mb-2 font-bold text-text-primary">Pro Tip: Compound Logic</h4>
                <p className="text-sm">
                  You can stack multiple indicators and timeframes using boolean logic (AND/OR). The NLP engine resolves precedence automatically.
                </p>
              </div>
              <CodeBlock 
                language="prompt"
                code={`"Enter a long position on SOL if the 1H MACD crosses above the signal line AND the 15m RSI is greater than 50, but ONLY IF the overall portfolio exposure is under 20%."`}
              />
            </div>
          </section>

          {/* Advanced Order Types */}
          <section id="order-types" className="scroll-mt-28">
            <div className="mb-2 flex items-center gap-2 text-accent-green">
              <Activity className="h-5 w-5" />
              <span className="text-sm font-bold uppercase tracking-wider">Execution</span>
            </div>
            <h2 className="mb-6 text-3xl font-bold text-text-primary">TWAP & VWAP Orders</h2>
            <div className="space-y-6 text-[17px] text-text-secondary leading-relaxed">
              <p>
                Prevent slippage on large orders by prompting for Time-Weighted Average Price (TWAP) or Volume-Weighted Average Price (VWAP) execution.
              </p>
              <table className="w-full text-left text-sm mt-4 border-collapse">
                <thead>
                  <tr className="border-b border-bg-border text-text-primary">
                    <th className="pb-3 font-bold">Algorithm</th>
                    <th className="pb-3 font-bold">Best Used For</th>
                    <th className="pb-3 font-bold">Example Prompt</th>
                  </tr>
                </thead>
                <tbody className="text-text-secondary">
                  <tr className="border-b border-bg-border">
                    <td className="py-4 font-mono text-accent-blue">TWAP</td>
                    <td className="py-4">Hiding footprint over time</td>
                    <td className="py-4">"Buy 5 BTC using TWAP over 4 hours."</td>
                  </tr>
                  <tr className="border-b border-bg-border">
                    <td className="py-4 font-mono text-accent-green">VWAP</td>
                    <td className="py-4">Following market volume profiles</td>
                    <td className="py-4">"Sell 1000 LINK via VWAP today."</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-mono text-orange-400">Iceberg</td>
                    <td className="py-4">Concealing total order size</td>
                    <td className="py-4">"Limit buy 100 ETH, show only 5 at a time."</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Risk Management */}
          <section id="risk-management" className="scroll-mt-28">
            <h2 className="mb-6 text-3xl font-bold text-text-primary">Dynamic Risk Sizing</h2>
            <div className="space-y-6 text-[17px] text-text-secondary leading-relaxed">
              <p>
                AlgoText supports dynamic position sizing models, including Fixed Fractional, Volatility-Adjusted, and Kelly Criterion.
              </p>
              <CodeBlock 
                language="prompt"
                code={`"Risk exactly 1.5% of total account equity on this trade. Set a volatility-adjusted trailing stop loss at 2x ATR(14)."`}
              />
            </div>
          </section>

          {/* Webhooks */}
          <section id="webhooks" className="scroll-mt-28">
            <div className="mb-2 flex items-center gap-2 text-purple-500">
              <Webhook className="h-5 w-5" />
              <span className="text-sm font-bold uppercase tracking-wider">Integrations</span>
            </div>
            <h2 className="mb-6 text-3xl font-bold text-text-primary">TradingView Webhooks</h2>
            <div className="space-y-6 text-[17px] text-text-secondary leading-relaxed">
              <p>
                If you prefer building visual indicators in TradingView (PineScript), you can trigger AlgoText execution nodes directly via Webhook.
              </p>
              <p>Configure your TradingView alert to send a POST request to your unique endpoint with the following JSON payload:</p>
              
              <CodeBlock 
                language="json"
                code={`{
  "api_key": "algt_test_983hf892h3f23",
  "action": "execute",
  "strategy_id": "strat_098234",
  "override_side": "{{strategy.order.action}}",
  "override_size": "{{strategy.order.contracts}}"
}`}
              />
            </div>
          </section>

          {/* API Reference */}
          <section id="api-reference" className="scroll-mt-28">
            <div className="mb-2 flex items-center gap-2 text-orange-500">
              <Terminal className="h-5 w-5" />
              <span className="text-sm font-bold uppercase tracking-wider">Developer</span>
            </div>
            <h2 className="mb-6 text-3xl font-bold text-text-primary">REST API Reference</h2>
            <div className="space-y-6 text-[17px] text-text-secondary leading-relaxed">
              <p>
                Automate your strategy deployment pipeline using the AlgoText REST API. All endpoints are authenticated via Bearer tokens.
              </p>
              <div className="rounded-xl border border-bg-border bg-bg-surface overflow-hidden">
                <div className="flex items-center gap-4 bg-black/20 p-4 border-b border-bg-border">
                  <span className="rounded bg-accent-green/20 px-2 py-1 text-xs font-bold text-accent-green">POST</span>
                  <code className="text-sm text-text-primary">/v1/strategies/deploy</code>
                </div>
                <div className="p-4">
                  <p className="text-sm text-text-secondary mb-4">Deploys a pre-compiled JSON AST strategy to the live execution cloud.</p>
                  <CodeBlock 
                    language="bash"
                    code={`curl -X POST https://api.algotext.ai/v1/strategies/deploy \\
  -H "Authorization: Bearer $ALGO_SECRET_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Volatility Breakout",
    "wallet_id": "wall_823902",
    "ast_payload": { ... }
  }'`}
                  />
                </div>
              </div>
            </div>
          </section>

        </main>

        {/* Right Sidebar (Table of Contents - Desktop Only) */}
        <aside className="hidden lg:block w-[200px] shrink-0">
          <div className="sticky top-28 border-l border-bg-border pl-4">
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-text-primary">On This Page</h4>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li className="hover:text-accent-blue cursor-pointer transition-colors">Overview</li>
              <li className="hover:text-accent-blue cursor-pointer transition-colors">Prompt Engineering</li>
              <li className="hover:text-accent-blue cursor-pointer transition-colors">TWAP & VWAP</li>
              <li className="hover:text-accent-blue cursor-pointer transition-colors">Risk Management</li>
              <li className="hover:text-accent-blue cursor-pointer transition-colors">TradingView Webhooks</li>
              <li className="hover:text-accent-blue cursor-pointer transition-colors">REST API Reference</li>
            </ul>
          </div>
        </aside>

      </div>
    </div>
  )
}
