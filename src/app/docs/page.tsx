"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  BookOpen, Terminal, Activity, ChevronRight, Search, Copy, Check, 
  Webhook, Layers, Info, AlertTriangle, Lightbulb, Server,
  Lock, Zap, Code2, Globe, Shield, Coins, BarChart3, Clock,
  ArrowRight, Blocks, Cpu
} from "lucide-react"
import { BackButton } from "@/components/ui/BackButton"

// --- Custom Documentation UI Components ---

function Callout({ type, title, children }: { type: 'info' | 'warning' | 'tip' | 'danger', title: string, children: React.ReactNode }) {
  const styles = {
    info: 'bg-blue-50/50 border-blue-200/60 text-blue-900',
    warning: 'bg-amber-50/50 border-amber-200/60 text-amber-900',
    tip: 'bg-emerald-50/50 border-emerald-200/60 text-emerald-900',
    danger: 'bg-red-50/50 border-red-200/60 text-red-900',
  }
  const icons = {
    info: <Info className="h-5 w-5 text-blue-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    tip: <Lightbulb className="h-5 w-5 text-emerald-500" />,
    danger: <Shield className="h-5 w-5 text-red-500" />
  }
  
  return (
    <div className={`my-6 flex gap-4 rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md ${styles[type]}`}>
      <div className="shrink-0 mt-0.5">{icons[type]}</div>
      <div>
        <h5 className="font-bold mb-1.5 tracking-tight">{title}</h5>
        <div className="text-sm opacity-90 leading-relaxed space-y-2">{children}</div>
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
    <div className="relative group rounded-2xl bg-[#0D1117] border border-white/10 overflow-hidden my-6 shadow-2xl shadow-black/20 transition-all hover:border-white/20">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-[#FF5F56] shadow-sm" />
            <div className="h-3 w-3 rounded-full bg-[#FFBD2E] shadow-sm" />
            <div className="h-3 w-3 rounded-full bg-[#27C93F] shadow-sm" />
          </div>
          {title && <span className="text-xs font-mono text-gray-400 font-medium">{title}</span>}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">{language}</span>
          <button onClick={handleCopy} className="text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10">
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="p-5 overflow-x-auto text-[13px] font-mono leading-relaxed text-gray-300 custom-scrollbar">
        <pre><code dangerouslySetInnerHTML={{
          __html: code
            .replace(/("[^"]*")/g, '<span class="text-emerald-300">$1</span>')
            .replace(/([0-9]+)/g, '<span class="text-amber-300">$1</span>')
            .replace(/(true|false|null)/g, '<span class="text-blue-400">$1</span>')
            .replace(/([a-zA-Z_]+)(?=:)/g, '<span class="text-purple-300">$1</span>')
            .replace(/#.*/g, '<span class="text-gray-500 italic">$&</span>')
            .replace(/\/\/.*/g, '<span class="text-gray-500 italic">$&</span>')
        }} /></pre>
      </div>
    </div>
  )
}

function EndpointCard({ method, path, description, children }: { method: string, path: string, description: string, children?: React.ReactNode }) {
  const isGet = method === 'GET'
  const isPost = method === 'POST'
  const isDelete = method === 'DELETE'
  const isWs = method === 'WS'
  
  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden my-8 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 border-b border-gray-100 bg-gray-50/80 backdrop-blur-sm">
        <span className={`px-3 py-1 text-xs font-bold rounded-lg tracking-wide shadow-sm
          ${isGet ? 'bg-blue-100 text-blue-700 border border-blue-200' 
          : isPost ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
          : isDelete ? 'bg-red-100 text-red-700 border border-red-200'
          : isWs ? 'bg-purple-100 text-purple-700 border border-purple-200'
          : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
          {method}
        </span>
        <code className="text-sm font-mono text-gray-900 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">{path}</code>
      </div>
      <div className="p-6">
        <p className="text-gray-600 mb-6 text-lg leading-relaxed">{description}</p>
        {children}
      </div>
    </div>
  )
}

function NavMenuLink({ href, title, active, icon: Icon }: { href: string, title: string, active?: boolean, icon?: React.ElementType }) {
  return (
    <a 
      href={href} 
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
        active 
          ? "bg-blue-50 text-blue-700 font-semibold shadow-sm border border-blue-100/50" 
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
      }`}
    >
      {Icon && <Icon className={`h-4 w-4 ${active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />}
      <span>{title}</span>
      {active && (
        <motion.div layoutId="navIndicator" className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
      )}
    </a>
  )
}

function FeatureGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
      {children}
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) {
  return (
    <div className="p-5 rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
        <Icon className="h-5 w-5" />
      </div>
      <h4 className="font-bold text-gray-900 mb-2">{title}</h4>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}

// --- Main Page ---

export default function DocsPage() {
  const [activeSection, setActiveSection] = React.useState("architecture")

  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      // Find the intersecting entry with the largest intersection ratio
      let maxRatio = 0;
      let targetId = "";
      
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
          maxRatio = entry.intersectionRatio;
          targetId = entry.target.id;
        }
      })
      
      if (targetId) {
        setActiveSection(targetId)
      }
    }, { rootMargin: "-10% 0px -80% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] })
    
    document.querySelectorAll("section[id]").forEach(section => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50/30 selection:bg-blue-100 selection:text-blue-900">
      
      {/* Docs Header */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-xl sticky top-0 z-40 transition-all shadow-sm">
        <div className="mx-auto flex max-w-[1400px] flex-col md:flex-row items-start md:items-center justify-between px-6 py-4 md:py-5 gap-4">
          <div className="flex items-center gap-5">
            <BackButton />
            <div className="h-6 w-px bg-gray-200 hidden md:block"></div>
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Platform Documentation</h1>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">AlgoText v2.4</p>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-gray-500 w-72 shadow-inner focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all cursor-text">
            <Search className="h-4 w-4 text-gray-400" />
            <span className="text-sm">Search the docs...</span>
            <div className="ml-auto flex items-center gap-1 rounded-md bg-white px-1.5 py-0.5 text-[10px] font-mono border border-gray-200 shadow-sm text-gray-400 font-bold">
              <span>⌘</span><span>K</span>
            </div>
          </div>
        </div>
      </div>

      {/* Docs Layout (3 Columns) */}
      <div className="mx-auto flex max-w-[1400px] flex-col md:flex-row px-6 py-12 gap-8 lg:gap-16 relative">
        
        {/* Left Sidebar (Navigation) */}
        <aside className="hidden md:block w-[260px] shrink-0">
          <div className="sticky top-32 flex flex-col gap-8 pr-4 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
            <div>
              <h3 className="mb-3 px-3 text-[11px] font-bold uppercase tracking-widest text-gray-400">Getting Started</h3>
              <div className="flex flex-col gap-1">
                <NavMenuLink href="#architecture" title="Architecture Overview" icon={Layers} active={activeSection === 'architecture'} />
                <NavMenuLink href="#prompting" title="Prompt Engineering" icon={Terminal} active={activeSection === 'prompting'} />
                <NavMenuLink href="#advanced-strategies" title="Advanced Strategies" icon={Zap} active={activeSection === 'advanced-strategies'} />
                <NavMenuLink href="#backtesting" title="Backtesting Engine" icon={Clock} active={activeSection === 'backtesting'} />
              </div>
            </div>
            <div>
              <h3 className="mb-3 px-3 text-[11px] font-bold uppercase tracking-widest text-gray-400">Execution Engine</h3>
              <div className="flex flex-col gap-1">
                <NavMenuLink href="#order-types" title="Algorithmic Orders" icon={Activity} active={activeSection === 'order-types'} />
                <NavMenuLink href="#risk-management" title="Risk Parameters" icon={Shield} active={activeSection === 'risk-management'} />
                <NavMenuLink href="#rate-limits" title="Rate Limits & Tiers" icon={BarChart3} active={activeSection === 'rate-limits'} />
              </div>
            </div>
            <div>
              <h3 className="mb-3 px-3 text-[11px] font-bold uppercase tracking-widest text-gray-400">API & Integrations</h3>
              <div className="flex flex-col gap-1">
                <NavMenuLink href="#authentication" title="Authentication" icon={Lock} active={activeSection === 'authentication'} />
                <NavMenuLink href="#api-reference" title="REST API" icon={Server} active={activeSection === 'api-reference'} />
                <NavMenuLink href="#websockets" title="WebSockets Live" icon={Globe} active={activeSection === 'websockets'} />
                <NavMenuLink href="#python-sdk" title="Python SDK" icon={Code2} active={activeSection === 'python-sdk'} />
                <NavMenuLink href="#webhooks" title="Webhooks" icon={Webhook} active={activeSection === 'webhooks'} />
              </div>
            </div>
            <div>
              <h3 className="mb-3 px-3 text-[11px] font-bold uppercase tracking-widest text-gray-400">Help</h3>
              <div className="flex flex-col gap-1">
                <NavMenuLink href="#faq" title="FAQ & Support" icon={Info} active={activeSection === 'faq'} />
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 max-w-[850px] pb-32">
          
          {/* Architecture */}
          <section id="architecture" className="scroll-mt-32 mb-28">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Layers className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest text-blue-600">Core Concepts</span>
            </div>
            <h2 className="mb-6 text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">Architecture Overview</h2>
            <div className="prose prose-lg max-w-none text-gray-600 space-y-6 leading-relaxed">
              <p className="text-xl text-gray-700 font-medium">
                AlgoText bridges the gap between human intent and deterministic execution. 
                Our platform parses natural language strategies into a strict, validated JSON Abstract Syntax Tree (AST), which is then processed by our custom-built, ultra-low-latency Rust execution engine.
              </p>
              
              <FeatureGrid>
                <FeatureCard 
                  icon={Cpu}
                  title="Rust Execution Engine"
                  description="Written entirely in Rust for memory safety and zero-cost abstractions. Executes AST logic with sub-millisecond latency."
                />
                <FeatureCard 
                  icon={Blocks}
                  title="Deterministic AST"
                  description="Language models never execute trades directly. They compile intent into a strict JSON schema that is formally verified before deployment."
                />
              </FeatureGrid>

              <Callout type="info" title="Deterministic Parsing & Verification">
                While we use state-of-the-art Large Language Models (LLMs) to understand your intent, the actual trading logic is never generated blindly. The LLM simply maps your words to our strictly typed Strategy DSL. Before any strategy goes live, our verifier ensures no infinite loops, out-of-bound variables, or invalid assets are present.
              </Callout>

              <p>Below is a visual representation of how a human prompt is translated into our internal AST schema:</p>

              <CodeBlock 
                title="Example Strategy DSL AST Output"
                language="json"
                code={`{
  "name": "Mean Reversion Core Trade",
  "version": "1.2.0",
  "instruments": [
    { "symbol": "BTC", "assetClass": "CRYPTO", "exchange": "BINANCE" }
  ],
  "entryConditions": [
    { 
      "left": { "type": "INDICATOR", "name": "RSI", "period": 14 }, 
      "comparator": "LESS_THAN", 
      "right": { "type": "NUMBER", "value": 30 } 
    }
  ],
  "action": {
    "type": "BUY",
    "sizing": {
      "type": "PERCENTAGE",
      "value": 10.0
    }
  },
  "riskParameters": {
    "stopLossPercentage": 3.0,
    "takeProfitPercentage": 6.0,
    "maxDrawdown": 10.0
  }
}`}
              />
            </div>
          </section>

          {/* Prompt Engineering */}
          <section id="prompting" className="scroll-mt-32 mb-28 border-t border-gray-100 pt-16">
            <h2 className="mb-6 text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">Prompt Engineering</h2>
            <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
              <p>
                The more precise you are with your natural language prompt, the more accurate the generated Strategy DSL will be. 
                AlgoText supports complex indicators, time delays, and high-frequency loops natively out-of-the-box.
              </p>
              
              <Callout type="tip" title="Time Delays and Feedback Loops">
                Our parser natively understands time-based logic and state-machine transitions. You can use phrases like "buy after 5 seconds of selling" or "loop for 20 trades" to create stateful algorithms.
              </Callout>

              <CodeBlock 
                title="HFT Loop Prompt Example"
                language="prompt"
                code={`"Buy 100 shares of AAPL now, then sell it in 10 seconds. Wait for the MACD line to cross below the signal line. Buy it again after 5 seconds of selling. Do this loop for a maximum of 20 trades per day."`}
              />
              <p>This naturally compiles into explicit <code>TIME_SINCE_ENTRY</code>, <code>CROSSOVER(MACD, SIGNAL)</code>, and <code>LOOP_COUNT</code> conditions in the AST, handling all state tracking for you.</p>
            </div>
          </section>

          {/* Advanced Strategies */}
          <section id="advanced-strategies" className="scroll-mt-32 mb-28 border-t border-gray-100 pt-16">
            <h2 className="mb-6 text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">Advanced Strategies</h2>
            <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
              <p>
                AlgoText isn't limited to simple single-asset technical analysis. Our compiler supports multi-asset relationships, statistical arbitrage, and options logic.
              </p>

              <h4 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Pairs Trading & Correlation</h4>
              <p>You can reference multiple symbols in a single prompt to create relative-value strategies.</p>
              <CodeBlock 
                title="Pairs Trading Prompt"
                language="prompt"
                code={`"Monitor the price ratio of GOOGL to MSFT. If the 20-period moving average of the ratio deviates by more than 2 standard deviations, short the outperforming asset and buy the underperforming asset with equal dollar weighting."`}
              />

              <h4 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Rolling Windows & Volatility</h4>
              <p>Calculate dynamic thresholds based on recent market conditions rather than static numbers.</p>
              <CodeBlock 
                title="Volatility Breakout Prompt"
                language="prompt"
                code={`"Calculate the Average True Range (ATR) over the last 14 days. If today's closing price breaks above the 20-day high plus 1 ATR, enter a long position using 5% of my total account equity."`}
              />
            </div>
          </section>

          {/* Backtesting Engine */}
          <section id="backtesting" className="scroll-mt-32 mb-28 border-t border-gray-100 pt-16">
            <h2 className="mb-6 text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">Backtesting Engine</h2>
            <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
              <p>
                AlgoText features a high-fidelity vector-based backtesting engine capable of testing years of tick data in seconds. We account for realistic slippage, maker/taker fees, and latency models.
              </p>
              <Callout type="info" title="Adaptive Data Resolution">
                By default, backtests run on 1-minute OHLCV candles to save compute time. However, if your strategy utilizes <code>TIME_SINCE_ENTRY</code>, order book imbalances, or tick-level indicators, the engine automatically upgrades to Level-2 tick data resolution for precise modeling.
              </Callout>
              <p>When running a backtest, you can specify your exact fee tier to match your broker:</p>
              <CodeBlock 
                title="Backtest Configuration Payload"
                language="json"
                code={`{
  "strategy_id": "strat_99812",
  "start_time": "2023-01-01T00:00:00Z",
  "end_time": "2024-01-01T00:00:00Z",
  "starting_capital": 100000.0,
  "commission_model": {
    "maker_fee_bps": 2.0,
    "taker_fee_bps": 5.0,
    "slippage_model": "VOLUME_WEIGHTED"
  }
}`}
              />
            </div>
          </section>

          {/* Execution Engine */}
          <section id="order-types" className="scroll-mt-32 mb-28 border-t border-gray-100 pt-16">
             <div className="mb-5 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <Activity className="h-4 w-4 text-emerald-600" />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest text-emerald-600">Execution</span>
            </div>
            <h2 className="mb-6 text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">Algorithmic Order Types</h2>
            <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
              <p>
                For institutional sizing, dumping market orders causes massive slippage. AlgoText supports algorithmic execution types to spread your orders out over time, volume, or specific price action.
              </p>
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mt-8 shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/80 text-gray-900">
                      <th className="p-5 font-bold uppercase tracking-wider text-xs">Algorithm</th>
                      <th className="p-5 font-bold uppercase tracking-wider text-xs">Behavior & Use Case</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-5 font-mono font-bold text-blue-600 whitespace-nowrap">TWAP</td>
                      <td className="p-5"><strong>Time-Weighted Average Price.</strong> Slices a large order into smaller chunks and executes them evenly over a specified time period (e.g., execute 1000 BTC over 4 hours).</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-5 font-mono font-bold text-emerald-600 whitespace-nowrap">VWAP</td>
                      <td className="p-5"><strong>Volume-Weighted Average Price.</strong> Executes based on historical intraday volume profiles. Trades more aggressively when market volume is high, and less when it's low.</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-5 font-mono font-bold text-purple-600 whitespace-nowrap">ICEBERG</td>
                      <td className="p-5">Hides the true size of your order from the public order book by only displaying a small fraction (the "tip") at a time. Replenishes automatically when filled.</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-5 font-mono font-bold text-orange-600 whitespace-nowrap">PEGGED</td>
                      <td className="p-5">Dynamically adjusts your limit price to stay pegged to the Best Bid or Best Ask, ensuring you capture the spread without crossing the book.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Risk Management */}
          <section id="risk-management" className="scroll-mt-32 mb-28 border-t border-gray-100 pt-16">
            <h2 className="mb-6 text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">Risk Parameters</h2>
            <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
              <p>
                Risk management is a first-class citizen in AlgoText. Instead of manually writing stop-loss logic and tracking portfolio states, simply describe your risk tolerance in natural language. The engine handles the math globally.
              </p>
              
              <Callout type="danger" title="Circuit Breakers">
                AlgoText employs a global kill-switch. If your account equity drops below a specified threshold, all open orders are immediately canceled and all positions are flattened at market, overriding any active strategy logic.
              </Callout>

              <CodeBlock 
                title="Comprehensive Risk Prompt Example"
                language="prompt"
                code={`"Limit maximum position exposure to 5% of total portfolio equity. Use a 2% trailing stop loss on all trades. If daily drawdown exceeds 4%, halt all trading until midnight UTC."`}
              />
            </div>
          </section>

          {/* Rate Limits */}
          <section id="rate-limits" className="scroll-mt-32 mb-28 border-t border-gray-100 pt-16">
            <h2 className="mb-6 text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">Rate Limits & Tiers</h2>
            <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
              <p>
                To ensure platform stability, API requests and strategy executions are rate-limited based on your subscription tier. Note that these limits apply to the API interactions, not the internal Rust execution engine (which runs at full speed).
              </p>
              <ul className="space-y-3 mt-4">
                <li className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">P</div>
                  <span><strong>Pro Tier:</strong> 100 requests / minute, max 10 active live strategies.</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">E</div>
                  <span><strong>Enterprise Tier:</strong> 1,000 requests / minute, unlimited live strategies, direct cross-connect access.</span>
                </li>
              </ul>
              <p className="text-sm text-gray-500 mt-4">If you exceed the rate limit, the API will return an HTTP 429 Too Many Requests status code with a <code>Retry-After</code> header.</p>
            </div>
          </section>

          {/* Authentication */}
          <section id="authentication" className="scroll-mt-32 mb-28 border-t border-gray-100 pt-16">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                <Lock className="h-4 w-4 text-orange-600" />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest text-orange-600">Developer API</span>
            </div>
            <h2 className="mb-6 text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">Authentication</h2>
            <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
              <p>
                All REST API and WebSocket connections require authentication using an API key generated from your Dashboard.
              </p>
              
              <Callout type="warning" title="Keep your keys secret">
                Your API keys carry full permissions to deploy strategies and execute trades on your linked brokerage accounts. Never commit them to public repositories.
              </Callout>

              <p>Pass your API key in the Authorization header as a Bearer token:</p>
              <CodeBlock 
                title="cURL Authentication Example"
                language="bash"
                code={`curl -X GET https://api.algotext.com/v1/portfolio/positions \\
  -H "Authorization: Bearer sk_live_abc123def456ghi789" \\
  -H "Content-Type: application/json"`}
              />
            </div>
          </section>

          {/* API Reference */}
          <section id="api-reference" className="scroll-mt-32 mb-28 border-t border-gray-100 pt-16">
            <h2 className="mb-6 text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">REST API Reference</h2>
            <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
              <p>
                AlgoText provides a secure, robust REST API to manage your strategies, fetch backtest results, and monitor live portfolio performance programmatically.
              </p>

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
  "dsl_payload": { ... },
  "paper_trading": false
}`}
                  />
                  <h4 className="font-semibold text-gray-900 mt-6">Response</h4>
                  <CodeBlock 
                    language="json"
                    code={`{
  "status": "success",
  "deployment_id": "dep_49010",
  "message": "Strategy successfully deployed to execution node."
}`}
                  />
                </div>
              </EndpointCard>

              <EndpointCard 
                method="GET" 
                path="/v1/portfolio/positions" 
                description="Retrieves all currently open positions managed by AlgoText strategies."
              >
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 mt-6">Response</h4>
                  <CodeBlock 
                    language="json"
                    code={`{
  "data": [
    {
      "symbol": "AAPL",
      "side": "LONG",
      "quantity": 150,
      "entry_price": 175.20,
      "current_price": 178.40,
      "unrealized_pnl": 480.00,
      "strategy_id": "strat_9921"
    }
  ],
  "pagination": { "has_more": false }
}`}
                  />
                </div>
              </EndpointCard>

              <EndpointCard 
                method="DELETE" 
                path="/v1/orders/cancel_all" 
                description="Emergency endpoint: Cancels all open orders across all active strategies."
              >
              </EndpointCard>
            </div>
          </section>

          {/* WebSockets */}
          <section id="websockets" className="scroll-mt-32 mb-28 border-t border-gray-100 pt-16">
            <h2 className="mb-6 text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">WebSockets Live Data</h2>
            <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
              <p>
                For real-time applications, use our WebSocket API to receive instant pushed updates for order executions, portfolio changes, and strategy alerts without polling.
              </p>
              
              <h4 className="font-bold text-gray-900 mt-6">Connection Endpoint</h4>
              <code className="block p-4 bg-gray-900 text-purple-400 rounded-xl font-mono text-sm">wss://stream.algotext.com/v1/events</code>

              <p className="mt-6">After connecting, authenticate by sending an auth payload:</p>
              <CodeBlock 
                title="WebSocket Auth Payload"
                language="json"
                code={`{
  "action": "auth",
  "key": "sk_live_abc123..."
}`}
              />

              <p>Once authenticated, you will start receiving real-time event streams:</p>
              <CodeBlock 
                title="Example Execution Event"
                language="json"
                code={`{
  "event": "ORDER_FILLED",
  "timestamp": 1698239012030,
  "data": {
    "order_id": "ord_8812",
    "symbol": "TSLA",
    "fill_price": 210.45,
    "filled_qty": 50,
    "strategy_name": "Momentum Catcher"
  }
}`}
              />
            </div>
          </section>

          {/* Python SDK */}
          <section id="python-sdk" className="scroll-mt-32 mb-28 border-t border-gray-100 pt-16">
            <h2 className="mb-6 text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">Python SDK</h2>
            <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
              <p>
                For data scientists and power users, our official Python SDK allows you to programmatically compile natural language strategies, run backtests, and manage live deployments directly from Jupyter notebooks.
              </p>
              
              <CodeBlock 
                title="Install and Initialize"
                language="python"
                code={`pip install algotext-sdk

from algotext import AlgoClient
import matplotlib.pyplot as plt

# Initialize with your API Key
client = AlgoClient(api_key="sk_live_abc123")

# 1. Compile a strategy from plain English
ast = client.compile(
    "Buy BTC if RSI < 30 and volume is 20% higher than average. "
    "Set a 5% stop loss."
)

# 2. Run a historical backtest
results = client.backtest(ast, start_date="2022-01-01", end_date="2023-12-31")

print(f"Total Return: {results.total_return_pct}%")
print(f"Sharpe Ratio: {results.sharpe_ratio}")
print(f"Max Drawdown: {results.max_drawdown}%")

# 3. Plot equity curve
results.plot_equity_curve()
plt.show()

# 4. Deploy to live trading
deployment = client.deploy(ast, broker="alpaca", paper=True)
print(f"Strategy deployed successfully! ID: {deployment.id}")`}
              />
            </div>
          </section>

          {/* Webhooks */}
          <section id="webhooks" className="scroll-mt-32 mb-28 border-t border-gray-100 pt-16">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Webhook className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest text-purple-600">Integrations</span>
            </div>
            <h2 className="mb-6 text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">TradingView Webhooks</h2>
            <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
              <p>
                Prefer TradingView's visual charting? You can trigger AlgoText Execution nodes directly from TradingView alerts. Paste your unique webhook URL into TradingView and format your alert message as JSON.
              </p>
              <CodeBlock 
                title="TradingView Alert Message Payload"
                language="json"
                code={`{
  "api_key": "algt_hook_991823",
  "action": "execute",
  "strategy_id": "strat_098234",
  "override_side": "{{strategy.order.action}}",
  "price": "{{close}}",
  "ticker": "{{ticker}}"
}`}
              />
              <p>This approach lets you use PineScript for logic, while leveraging AlgoText's algorithmic execution (TWAP, Iceberg) and portfolio-level risk management.</p>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="scroll-mt-32 mb-28 border-t border-gray-100 pt-16">
            <h2 className="mb-6 text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">Frequently Asked Questions</h2>
            <div className="prose prose-lg max-w-none text-gray-600 space-y-8 mt-10">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h4 className="font-bold text-gray-900 text-xl mb-3 flex items-center gap-2">
                  <span className="text-blue-500">Q.</span> Can I plug in my own custom indicators?
                </h4>
                <p className="text-gray-600 leading-relaxed">Yes. Using the Python SDK, you can upload pre-computed Pandas DataFrames containing your proprietary indicators, and prompt AlgoText to execute logic based on those custom columns.</p>
              </div>
              
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h4 className="font-bold text-gray-900 text-xl mb-3 flex items-center gap-2">
                  <span className="text-blue-500">Q.</span> Do you take custody of my funds?
                </h4>
                <p className="text-gray-600 leading-relaxed">No. AlgoText is completely non-custodial. We connect directly to brokers like Alpaca, Interactive Brokers, and Binance using OAuth or restricted API keys. We never have withdrawal permissions.</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h4 className="font-bold text-gray-900 text-xl mb-3 flex items-center gap-2">
                  <span className="text-blue-500">Q.</span> How fast is the execution engine?
                </h4>
                <p className="text-gray-600 leading-relaxed">The core engine is written in Rust. Internal parsing and routing takes less than 1 millisecond. Overall latency will primarily depend on your proximity to the exchange servers and the broker's API response times.</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h4 className="font-bold text-gray-900 text-xl mb-3 flex items-center gap-2">
                  <span className="text-blue-500">Q.</span> Can I use AlgoText for forex and options?
                </h4>
                <p className="text-gray-600 leading-relaxed">Currently, we fully support Equities and Cryptocurrencies. Forex support is in beta, and Options trading (including complex multi-leg spreads) is slated for our Q4 roadmap.</p>
              </div>
            </div>
          </section>

          {/* Footer Nav */}
          <div className="mt-16 pt-8 border-t border-gray-200 flex justify-between items-center bg-gray-50/50 p-6 rounded-2xl">
            <a href="#" className="flex flex-col gap-1.5 group">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-gray-500 transition-colors">Previous</span>
              <span className="text-blue-600 font-bold text-lg group-hover:text-blue-700 transition-colors flex items-center gap-2">
                <ChevronRight className="h-4 w-4 rotate-180" /> Quick Start Guide
              </span>
            </a>
            <a href="#" className="flex flex-col gap-1.5 items-end group">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-gray-500 transition-colors">Next</span>
              <span className="text-blue-600 font-bold text-lg group-hover:text-blue-700 transition-colors flex items-center gap-2">
                Deployment <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </a>
          </div>

        </main>

        {/* Right Sidebar (Table of Contents) */}
        <aside className="hidden xl:block w-[220px] shrink-0">
          <div className="sticky top-32 border-l border-gray-200 pl-6 py-2">
            <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-gray-900">On This Page</h4>
            <ul className="space-y-3.5 text-[13px]">
              <li>
                <a href="#architecture" className={`block transition-all duration-200 ${activeSection === 'architecture' ? 'text-blue-600 font-bold -ml-px border-l-2 border-blue-600 pl-3' : 'text-gray-500 hover:text-gray-900'}`}>Architecture</a>
              </li>
              <li>
                <a href="#prompting" className={`block transition-all duration-200 ${activeSection === 'prompting' ? 'text-blue-600 font-bold -ml-px border-l-2 border-blue-600 pl-3' : 'text-gray-500 hover:text-gray-900'}`}>Prompt Engineering</a>
              </li>
              <li>
                <a href="#advanced-strategies" className={`block transition-all duration-200 ${activeSection === 'advanced-strategies' ? 'text-blue-600 font-bold -ml-px border-l-2 border-blue-600 pl-3' : 'text-gray-500 hover:text-gray-900'}`}>Advanced Strategies</a>
              </li>
              <li>
                <a href="#backtesting" className={`block transition-all duration-200 ${activeSection === 'backtesting' ? 'text-blue-600 font-bold -ml-px border-l-2 border-blue-600 pl-3' : 'text-gray-500 hover:text-gray-900'}`}>Backtesting Engine</a>
              </li>
              <li>
                <a href="#order-types" className={`block transition-all duration-200 ${activeSection === 'order-types' ? 'text-blue-600 font-bold -ml-px border-l-2 border-blue-600 pl-3' : 'text-gray-500 hover:text-gray-900'}`}>Algorithmic Orders</a>
              </li>
              <li>
                <a href="#risk-management" className={`block transition-all duration-200 ${activeSection === 'risk-management' ? 'text-blue-600 font-bold -ml-px border-l-2 border-blue-600 pl-3' : 'text-gray-500 hover:text-gray-900'}`}>Risk Parameters</a>
              </li>
              <li>
                <a href="#rate-limits" className={`block transition-all duration-200 ${activeSection === 'rate-limits' ? 'text-blue-600 font-bold -ml-px border-l-2 border-blue-600 pl-3' : 'text-gray-500 hover:text-gray-900'}`}>Rate Limits & Tiers</a>
              </li>
              <li>
                <a href="#authentication" className={`block transition-all duration-200 ${activeSection === 'authentication' ? 'text-blue-600 font-bold -ml-px border-l-2 border-blue-600 pl-3' : 'text-gray-500 hover:text-gray-900'}`}>Authentication</a>
              </li>
              <li>
                <a href="#api-reference" className={`block transition-all duration-200 ${activeSection === 'api-reference' ? 'text-blue-600 font-bold -ml-px border-l-2 border-blue-600 pl-3' : 'text-gray-500 hover:text-gray-900'}`}>REST API Reference</a>
              </li>
              <li>
                <a href="#websockets" className={`block transition-all duration-200 ${activeSection === 'websockets' ? 'text-blue-600 font-bold -ml-px border-l-2 border-blue-600 pl-3' : 'text-gray-500 hover:text-gray-900'}`}>WebSockets Live</a>
              </li>
              <li>
                <a href="#python-sdk" className={`block transition-all duration-200 ${activeSection === 'python-sdk' ? 'text-blue-600 font-bold -ml-px border-l-2 border-blue-600 pl-3' : 'text-gray-500 hover:text-gray-900'}`}>Python SDK</a>
              </li>
              <li>
                <a href="#webhooks" className={`block transition-all duration-200 ${activeSection === 'webhooks' ? 'text-blue-600 font-bold -ml-px border-l-2 border-blue-600 pl-3' : 'text-gray-500 hover:text-gray-900'}`}>Webhooks</a>
              </li>
              <li>
                <a href="#faq" className={`block transition-all duration-200 ${activeSection === 'faq' ? 'text-blue-600 font-bold -ml-px border-l-2 border-blue-600 pl-3' : 'text-gray-500 hover:text-gray-900'}`}>FAQ</a>
              </li>
            </ul>
          </div>
        </aside>

      </div>
    </div>
  )
}
