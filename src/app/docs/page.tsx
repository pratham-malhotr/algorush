"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  BookOpen, Terminal, Activity, ChevronRight, Search, Copy, Check, 
  Webhook, Layers, Info, AlertTriangle, Lightbulb, Server
} from "lucide-react"
import { BackButton } from "@/components/ui/BackButton"

// --- Custom Documentation UI Components ---

function Callout({ type, title, children }: { type: 'info' | 'warning' | 'tip', title: string, children: React.ReactNode }) {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    tip: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  }
  const icons = {
    info: <Info className="h-5 w-5 text-blue-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    tip: <Lightbulb className="h-5 w-5 text-emerald-500" />
  }
  
  return (
    <div className={`my-6 flex gap-4 rounded-xl border p-4 ${styles[type]}`}>
      <div className="shrink-0 mt-0.5">{icons[type]}</div>
      <div>
        <h5 className="font-semibold mb-1">{title}</h5>
        <div className="text-sm opacity-90 leading-relaxed">{children}</div>
      </div>
    </div>
  )
}

function CodeBlock({ code, language = "json", title }: { code: string, language?: string, title?: string }) {
  const [copied, setCopied] = React.useState(false)
  
  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group rounded-xl bg-[#0D1117] border border-gray-200 dark:border-gray-800 overflow-hidden my-6 shadow-xl shadow-black/5">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#161B22]">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-[#FF5F56]" />
            <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
            <div className="h-3 w-3 rounded-full bg-[#27C93F]" />
          </div>
          {title && <span className="text-xs font-mono text-gray-400">{title}</span>}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-gray-500 uppercase">{language}</span>
          <button onClick={handleCopy} className="text-gray-400 hover:text-white transition-colors">
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="p-5 overflow-x-auto text-[13px] font-mono leading-relaxed text-gray-300">
        <pre><code dangerouslySetInnerHTML={{
          __html: code
            .replace(/("[^"]*")/g, '<span class="text-emerald-300">$1</span>')
            .replace(/([0-9]+)/g, '<span class="text-amber-300">$1</span>')
            .replace(/(true|false|null)/g, '<span class="text-blue-300">$1</span>')
            .replace(/([a-zA-Z_]+)(?=:)/g, '<span class="text-blue-200">$1</span>')
            .replace(/#.*/g, '<span class="text-gray-500 italic">$&</span>')
        }} /></pre>
      </div>
    </div>
  )
}

function EndpointCard({ method, path, description, children }: { method: string, path: string, description: string, children: React.ReactNode }) {
  const isGet = method === 'GET'
  const isPost = method === 'POST'
  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden my-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 border-b border-gray-100 bg-gray-50/50">
        <span className={`px-2.5 py-1 text-xs font-bold rounded-md tracking-wide ${isGet ? 'bg-blue-100 text-blue-700' : isPost ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
          {method}
        </span>
        <code className="text-sm font-mono text-gray-900 bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">{path}</code>
      </div>
      <div className="p-6">
        <p className="text-gray-600 mb-6">{description}</p>
        {children}
      </div>
    </div>
  )
}

function NavMenuLink({ href, title, active }: { href: string, title: string, active?: boolean }) {
  return (
    <a 
      href={href} 
      className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
        active 
          ? "bg-blue-50 text-blue-600 font-medium" 
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      <span>{title}</span>
    </a>
  )
}

// --- Main Page ---

export default function DocsPage() {
  const [activeSection, setActiveSection] = React.useState("architecture")

  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id)
        }
      })
    }, { rootMargin: "-100px 0px -80% 0px" })
    
    document.querySelectorAll("section[id]").forEach(section => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      
      {/* Docs Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-40 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] flex-col md:flex-row items-start md:items-center justify-between px-6 py-6 gap-6">
          <div className="flex items-center gap-6">
            <BackButton />
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">AlgoText Platform Documentation</h1>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-gray-500 w-64 shadow-inner">
            <Search className="h-4 w-4" />
            <span className="text-sm">Search docs...</span>
            <div className="ml-auto flex items-center gap-1 rounded bg-white px-1.5 py-0.5 text-xs font-mono border border-gray-200 shadow-sm text-gray-400">
              <span>⌘</span><span>K</span>
            </div>
          </div>
        </div>
      </div>

      {/* Docs Layout (3 Columns) */}
      <div className="mx-auto flex max-w-[1400px] flex-col md:flex-row px-6 py-12 gap-8 lg:gap-16 relative">
        
        {/* Left Sidebar (Navigation) */}
        <aside className="hidden md:block w-[240px] shrink-0">
          <div className="sticky top-32 flex flex-col gap-8">
            <div>
              <h3 className="mb-3 px-3 text-xs font-bold uppercase tracking-wider text-gray-900">Getting Started</h3>
              <div className="flex flex-col gap-0.5">
                <NavMenuLink href="#architecture" title="Architecture Overview" active={activeSection === 'architecture'} />
                <NavMenuLink href="#prompting" title="Prompt Engineering" active={activeSection === 'prompting'} />
                <NavMenuLink href="#backtesting" title="Backtesting Engine" active={activeSection === 'backtesting'} />
              </div>
            </div>
            <div>
              <h3 className="mb-3 px-3 text-xs font-bold uppercase tracking-wider text-gray-900">Execution Engine</h3>
              <div className="flex flex-col gap-0.5">
                <NavMenuLink href="#order-types" title="TWAP & VWAP" active={activeSection === 'order-types'} />
                <NavMenuLink href="#risk-management" title="Risk Parameters" active={activeSection === 'risk-management'} />
              </div>
            </div>
            <div>
              <h3 className="mb-3 px-3 text-xs font-bold uppercase tracking-wider text-gray-900">API & Integrations</h3>
              <div className="flex flex-col gap-0.5">
                <NavMenuLink href="#api-reference" title="REST API" active={activeSection === 'api-reference'} />
                <NavMenuLink href="#python-sdk" title="Python SDK" active={activeSection === 'python-sdk'} />
                <NavMenuLink href="#webhooks" title="Webhooks" active={activeSection === 'webhooks'} />
              </div>
            </div>
            <div>
              <h3 className="mb-3 px-3 text-xs font-bold uppercase tracking-wider text-gray-900">Help</h3>
              <div className="flex flex-col gap-0.5">
                <NavMenuLink href="#faq" title="FAQ" active={activeSection === 'faq'} />
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 max-w-[800px] pb-32">
          
          {/* Architecture */}
          <section id="architecture" className="scroll-mt-32 mb-24">
            <div className="mb-4 flex items-center gap-2 text-blue-600">
              <Layers className="h-5 w-5" />
              <span className="text-sm font-bold uppercase tracking-wider">Overview</span>
            </div>
            <h2 className="mb-6 text-4xl font-extrabold text-gray-900 tracking-tight">Architecture</h2>
            <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
              <p>
                AlgoText is designed to bridge the gap between human intent and deterministic execution. 
                Our platform parses natural language strategies into a strict, validated JSON Abstract Syntax Tree (AST), which is then processed by a high-performance Rust execution engine.
              </p>
              
              <Callout type="info" title="Deterministic Parsing">
                While we use Large Language Models (LLMs) to understand intent, the actual trading logic is never generated blindly. The LLM simply maps your words to our strictly typed Strategy DSL.
              </Callout>

              <CodeBlock 
                title="Example Strategy DSL Output"
                language="json"
                code={`{
  "name": "Mean Reversion Trade",
  "instruments": [{ "symbol": "AAPL", "assetClass": "EQUITY" }],
  "entryConditions": [
    { "left": { "type": "RSI" }, "comparator": "LESS_THAN", "right": 30 }
  ],
  "action": {
    "type": "BUY",
    "quantityValue": 100
  },
  "riskParameters": {
    "stopLossPercentage": 3.0
  }
}`}
              />
            </div>
          </section>

          {/* Prompt Engineering */}
          <section id="prompting" className="scroll-mt-32 mb-24">
            <h2 className="mb-6 text-4xl font-extrabold text-gray-900 tracking-tight">Prompt Engineering</h2>
            <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
              <p>
                The more precise you are with your natural language prompt, the more accurate the generated Strategy DSL will be. 
                AlgoText supports complex indicators, time delays, and high-frequency loops natively.
              </p>
              
              <Callout type="tip" title="Time Delays and Loops">
                Our parser natively understands time-based logic. You can say "buy after 5 seconds of selling" or "loop for 20 trades".
              </Callout>

              <CodeBlock 
                title="HFT Loop Prompt Example"
                language="prompt"
                code={`"Buy Bitcoin now, then sell it in 10 seconds. Buy it again after 5 seconds of selling. Do this loop for 20 trades."`}
              />
              <p>This compiles into explicit `TIME_SINCE_ENTRY` and `LOOP_COUNT` conditions in the AST.</p>
            </div>
          </section>

          {/* Backtesting Engine */}
          <section id="backtesting" className="scroll-mt-32 mb-24">
            <h2 className="mb-6 text-4xl font-extrabold text-gray-900 tracking-tight">Backtesting Engine</h2>
            <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
              <p>
                AlgoText features a high-fidelity vector-based backtesting engine capable of testing years of tick data in seconds. We account for realistic slippage, maker/taker fees, and latency models.
              </p>
              <Callout type="info" title="Data Resolution">
                By default, backtests run on 1-minute OHLCV candles. For HFT strategies utilizing `TIME_SINCE_ENTRY`, the engine automatically upgrades to tick-level data resolution for precise modeling.
              </Callout>
            </div>
          </section>

          {/* Execution Engine */}
          <section id="order-types" className="scroll-mt-32 mb-24">
             <div className="mb-4 flex items-center gap-2 text-emerald-600">
              <Activity className="h-5 w-5" />
              <span className="text-sm font-bold uppercase tracking-wider">Execution</span>
            </div>
            <h2 className="mb-6 text-4xl font-extrabold text-gray-900 tracking-tight">TWAP & VWAP</h2>
            <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
              <p>
                For institutional sizing, dumping market orders causes massive slippage. AlgoText supports algorithmic execution types to spread your orders out over time or volume.
              </p>
              <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden mt-8">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-100/50 text-gray-900">
                      <th className="p-4 font-semibold">Algorithm</th>
                      <th className="p-4 font-semibold">Use Case</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 divide-y divide-gray-200">
                    <tr>
                      <td className="p-4 font-mono font-medium text-blue-600">TWAP</td>
                      <td className="p-4">Time-Weighted Average Price. Executes evenly over a specific time period.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-mono font-medium text-emerald-600">VWAP</td>
                      <td className="p-4">Volume-Weighted Average Price. Executes based on historical volume profiles.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Risk Management */}
          <section id="risk-management" className="scroll-mt-32 mb-24">
            <h2 className="mb-6 text-4xl font-extrabold text-gray-900 tracking-tight">Risk Parameters</h2>
            <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
              <p>
                Risk management is a first-class citizen in AlgoText. Instead of manually writing stop-loss logic, simply describe your risk tolerance in natural language.
              </p>
              <CodeBlock 
                title="Risk Prompt Example"
                language="prompt"
                code={`"Limit max exposure to 5% of portfolio per trade, with a 2% trailing stop loss."`}
              />
            </div>
          </section>

          {/* API Reference */}
          <section id="api-reference" className="scroll-mt-32 mb-24">
            <div className="mb-4 flex items-center gap-2 text-orange-600">
              <Server className="h-5 w-5" />
              <span className="text-sm font-bold uppercase tracking-wider">Developer API</span>
            </div>
            <h2 className="mb-6 text-4xl font-extrabold text-gray-900 tracking-tight">REST API</h2>
            <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
              <p>
                AlgoText provides a secure, low-latency REST API to manage your strategies, fetch backtest results, and monitor live portfolio performance.
              </p>
              
              <Callout type="warning" title="Authentication">
                All requests must include your API key in the Authorization header: `Authorization: Bearer sk_live_...`
              </Callout>

              <EndpointCard 
                method="POST" 
                path="/v1/strategies/deploy" 
                description="Deploys a pre-compiled JSON Strategy DSL to the live execution cluster."
              >
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Request Body</h4>
                  <CodeBlock 
                    language="json"
                    code={`{
  "strategy_name": "Volatility Breakout",
  "broker_id": "brk_823902",
  "dsl_payload": { ... }
}`}
                  />
                </div>
              </EndpointCard>

               <EndpointCard 
                method="GET" 
                path="/v1/portfolio/positions" 
                description="Retrieves all currently open positions managed by AlgoText strategies."
              >
              </EndpointCard>
            </div>
          </section>

          {/* Python SDK */}
          <section id="python-sdk" className="scroll-mt-32 mb-24">
            <h2 className="mb-6 text-4xl font-extrabold text-gray-900 tracking-tight">Python SDK</h2>
            <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
              <p>
                For power users, our official Python SDK allows you to programmatically compile natural language strategies, run backtests, and manage live deployments from your Jupyter notebooks.
              </p>
              
              <CodeBlock 
                title="Install and Initialize"
                language="python"
                code={`pip install algotext-sdk

from algotext import AlgoClient

client = AlgoClient(api_key="sk_live_...")

# Compile a strategy from plain English
ast = client.compile("Buy AAPL if RSI < 30")

# Run a backtest
results = client.backtest(ast, start_date="2023-01-01", end_date="2024-01-01")
print(f"Sharpe Ratio: {results.sharpe_ratio}")`}
              />
            </div>
          </section>

          {/* Webhooks */}
          <section id="webhooks" className="scroll-mt-32 mb-24">
            <div className="mb-4 flex items-center gap-2 text-purple-600">
              <Webhook className="h-5 w-5" />
              <span className="text-sm font-bold uppercase tracking-wider">Integrations</span>
            </div>
            <h2 className="mb-6 text-4xl font-extrabold text-gray-900 tracking-tight">TradingView Webhooks</h2>
            <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
              <p>
                Trigger AlgoText Execution nodes directly from TradingView alerts.
              </p>
              <CodeBlock 
                title="Webhook Payload"
                language="json"
                code={`{
  "api_key": "algt_...",
  "action": "execute",
  "strategy_id": "strat_098234",
  "override_side": "{{strategy.order.action}}"
}`}
              />
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="scroll-mt-32 mb-24">
            <h2 className="mb-6 text-4xl font-extrabold text-gray-900 tracking-tight">Frequently Asked Questions</h2>
            <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Can I plug in my own custom indicators?</h4>
                <p>Yes. Using the Python SDK, you can upload pre-computed Pandas DataFrames containing your proprietary indicators, and prompt AlgoText to execute logic based on those custom columns.</p>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Do you take custody of my funds?</h4>
                <p>No. AlgoText is completely non-custodial. We connect directly to brokers like Alpaca and Interactive Brokers using OAuth or restricted API keys. We never have withdrawal permissions.</p>
              </div>
            </div>
          </section>

          {/* Footer Nav */}
          <div className="mt-16 pt-8 border-t border-gray-200 flex justify-between">
            <a href="#" className="flex flex-col gap-1 group">
              <span className="text-sm text-gray-500">Previous</span>
              <span className="text-blue-600 font-medium group-hover:underline">Quick Start Guide</span>
            </a>
            <a href="#" className="flex flex-col gap-1 items-end group">
              <span className="text-sm text-gray-500">Next</span>
              <span className="text-blue-600 font-medium group-hover:underline">TradingView Webhooks</span>
            </a>
          </div>

        </main>

        {/* Right Sidebar (Table of Contents) */}
        <aside className="hidden xl:block w-[200px] shrink-0">
          <div className="sticky top-32">
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-900">On This Page</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#architecture" className={`transition-colors ${activeSection === 'architecture' ? 'text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-900'}`}>Overview</a>
              </li>
              <li>
                <a href="#prompting" className={`transition-colors ${activeSection === 'prompting' ? 'text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-900'}`}>Prompt Engineering</a>
              </li>
              <li>
                <a href="#backtesting" className={`transition-colors ${activeSection === 'backtesting' ? 'text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-900'}`}>Backtesting Engine</a>
              </li>
              <li>
                <a href="#order-types" className={`transition-colors ${activeSection === 'order-types' ? 'text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-900'}`}>TWAP & VWAP</a>
              </li>
              <li>
                <a href="#risk-management" className={`transition-colors ${activeSection === 'risk-management' ? 'text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-900'}`}>Risk Parameters</a>
              </li>
              <li>
                <a href="#api-reference" className={`transition-colors ${activeSection === 'api-reference' ? 'text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-900'}`}>REST API Reference</a>
              </li>
              <li>
                <a href="#python-sdk" className={`transition-colors ${activeSection === 'python-sdk' ? 'text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-900'}`}>Python SDK</a>
              </li>
              <li>
                <a href="#webhooks" className={`transition-colors ${activeSection === 'webhooks' ? 'text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-900'}`}>Webhooks</a>
              </li>
              <li>
                <a href="#faq" className={`transition-colors ${activeSection === 'faq' ? 'text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-900'}`}>FAQ</a>
              </li>
            </ul>
          </div>
        </aside>

      </div>
    </div>
  )
}
