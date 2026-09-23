"use client"

import * as React from "react"
import { 
  Send, Sparkles, Loader2, Bot, User, BrainCircuit, Key, Zap, 
  Settings2, ShieldCheck, TrendingUp, AlertTriangle, ArrowRight, CheckCircle2, ChevronRight, Cpu,
  Copy, Check, RotateCcw, BarChart3, Dna, Activity, Rocket, Mic, MicOff,
  Sliders, ChevronDown, ChevronUp, Code2, Play, ExternalLink, RefreshCw, Terminal, Layers
} from "lucide-react"
import { useBuilderStore, AiModelType } from "@/store/useBuilderStore"
import { isExplicitStrategyIntent } from "@/lib/parser/intentClassifier"
import { generateMockData, runLocalBacktest } from "@/lib/backtester/engine"
import { generatePythonCCXT, generatePineScriptV5 } from "@/lib/generators/codeGenerators"
import { StrategyDSL } from "@/lib/types/strategy"
import { toast } from "sonner"


const SAMPLE_PRESETS = [
  {
    label: "👋 Say Hello / Ask a Question",
    prompt: "Hi! How does AlgoRush AI Copilot help me develop quant trading strategies?",
  },
  {
    label: "💡 Explain EMA vs SMA in Python",
    prompt: "Explain how EMA reduces lag compared to SMA in crypto trading and provide an async CCXT code snippet",
  },
  {
    label: "🔬 Kelly Criterion & Risk Math",
    prompt: "What is the Kelly Criterion formula and how do quants use half-kelly to prevent liquidation cascades?",
  },
  {
    label: "⚡ Strategy: 15m ETH Trend (10x)",
    prompt: "Backtest ETH when 20 EMA crosses above 50 EMA on 15m and RSI < 35, stop loss 2.5%, take profit 6%, 10x leverage",
  },
  {
    label: "🌊 Strategy: SOL Bollinger Reversion",
    prompt: "Long SOL when price is below lower Bollinger Band and RSI < 30 on 15m, exit when price reaches upper Bollinger Band, stop loss 3%, 5x leverage",
  },
]

const PROMPT_ARCHETYPES = [
  {
    label: "⚡ Trend / Momentum",
    icon: TrendingUp,
    color: "text-accent-blue border-accent-blue/30 bg-accent-blue/10",
    template: "Long BTC when 50 EMA crosses above 200 EMA and 14 RSI > 50 on 1h, stop loss 3%, take profit 7%, 5x leverage"
  },
  {
    label: "🌊 Mean Reversion",
    icon: Activity,
    color: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10",
    template: "Long SOL when price is below lower Bollinger Band and RSI < 30 on 15m, exit when price reaches upper Bollinger Band, stop loss 3%, 5x leverage"
  },
  {
    label: "🛡️ Delta-Neutral & Grid",
    icon: Layers,
    color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    template: "Deploy delta-neutral cash and carry basis arbitrage between Binance spot and quarterly futures on BTC/USDT with 50% allocation"
  },
  {
    label: "🔬 Kelly Risk Math",
    icon: BrainCircuit,
    color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    template: "Calculate optimal half-kelly position sizing for a 58% win-rate crypto strategy with 1.8 profit factor and show Python CCXT execution"
  },
  {
    label: "💡 Explain VWAP",
    icon: Sparkles,
    color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
    template: "Explain institutional VWAP bands and why market makers use them, with an async Python CCXT code snippet"
  }
]

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success("Code copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-2 rounded-lg border border-bg-border/80 bg-bg-base/90 overflow-hidden shadow-inner font-mono text-[11px]">
      <div className="flex items-center justify-between px-2.5 py-1 bg-bg-surface/80 border-b border-bg-border/60 text-[10px] text-text-tertiary">
        <span className="font-semibold uppercase text-accent-blue tracking-wider">{language || 'code'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-text-primary transition-colors py-0.5 px-1.5 rounded hover:bg-bg-elevated"
          title="Copy code"
        >
          {copied ? <Check className="h-2.5 w-2.5 text-emerald-400" /> : <Copy className="h-2.5 w-2.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-2.5 overflow-x-auto text-text-secondary leading-relaxed scrollbar-thin">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function FormattedTextBlock({ text }: { text: string }) {
  if (!text) return null
  const lines = text.split('\n')

  const parseInline = (str: string) => {
    const parts = str.split(/(\*\*[^*]+\*\*|`[^`]+`|\$\$[^$]+\$\$|\$[^$]+\$)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-text-primary">{part.slice(2, -2)}</strong>
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="rounded bg-bg-base/80 border border-bg-border/60 px-1.5 py-0.5 font-mono text-[10px] text-accent-blue">{part.slice(1, -1)}</code>
      }
      if (part.startsWith('$$') && part.endsWith('$$')) {
        return (
          <span key={i} className="inline-block my-1 rounded-md border border-emerald-500/30 bg-emerald-950/30 px-2 py-0.5 font-mono text-[11px] text-emerald-300 font-semibold shadow-inner">
            {part.slice(2, -2).trim()}
          </span>
        )
      }
      if (part.startsWith('$') && part.endsWith('$')) {
        return <span key={i} className="font-mono text-emerald-400 bg-emerald-500/15 border border-emerald-500/25 px-1 py-0.2 rounded text-[10px] mx-0.5 font-semibold">{part.slice(1, -1)}</span>
      }
      return part
    })
  }

  return (
    <div className="flex flex-col gap-1.5 leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim()
        if (!trimmed) return <div key={idx} className="h-1" />

        // Mathematical block formula $$ ... $$
        if (trimmed.startsWith('$$') && trimmed.endsWith('$$')) {
          return (
            <div key={idx} className="my-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/20 px-3 py-2 text-center font-mono text-[12px] text-emerald-300 shadow-inner">
              {trimmed.slice(2, -2).trim()}
            </div>
          )
        }

        if (trimmed.startsWith('### ')) {
          return <h4 key={idx} className="font-bold text-[12px] text-text-primary mt-1 text-accent-blue">{parseInline(trimmed.slice(4))}</h4>
        }
        if (trimmed.startsWith('## ')) {
          return <h3 key={idx} className="font-bold text-[13px] text-text-primary mt-1.5 pb-1 border-b border-bg-border/60">{parseInline(trimmed.slice(3))}</h3>
        }

        if (trimmed.startsWith('• ') || trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          const content = trimmed.replace(/^[•*-]\s*/, '')
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1">
              <span className="text-accent-blue font-bold text-[11px] leading-tight shrink-0">•</span>
              <span className="text-text-secondary">{parseInline(content)}</span>
            </div>
          )
        }

        const numMatch = trimmed.match(/^(\d+)\.\s*(.*)/)
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1">
              <span className="text-accent-blue/90 font-mono text-[10px] shrink-0 font-bold bg-accent-blue/10 border border-accent-blue/20 rounded px-1">{numMatch[1]}</span>
              <span className="text-text-secondary">{parseInline(numMatch[2])}</span>
            </div>
          )
        }

        if (trimmed.startsWith('> ')) {
          return (
            <div key={idx} className="border-l-2 border-accent-blue/50 bg-accent-blue/10 pl-2.5 py-1 my-0.5 italic text-text-secondary rounded-r text-[11px]">
              {parseInline(trimmed.slice(2))}
            </div>
          )
        }

        return <p key={idx} className="text-text-secondary">{parseInline(line)}</p>
      })}
    </div>
  )
}

/**
 * Sleek Institutional Reasoning Disclosure ("Reasoning trace (Xs)")
 */
function DeepThinkingAccordion({
  reasoning,
  latencyMs,
  modelName
}: {
  reasoning: string;
  latencyMs?: number;
  modelName?: string;
}) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (!reasoning || !reasoning.trim()) return null;

  const seconds = latencyMs ? (latencyMs / 1000).toFixed(1) : "1.2";

  return (
    <div className="my-2 overflow-hidden rounded-lg border border-bg-border bg-bg-elevated/40 text-[11px] transition-all">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-2.5 py-1.5 text-left font-mono text-text-secondary hover:text-text-primary hover:bg-bg-elevated/70 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-3.5 w-3.5 text-accent-blue" />
          <span className="font-semibold text-text-secondary">Reasoning trace</span>
          <span className="text-[10px] text-text-tertiary font-normal">({seconds}s)</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-text-tertiary hover:text-text-secondary">
          <span>{isExpanded ? "Hide" : "Show"}</span>
          <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-bg-border/60 bg-bg-base/90 p-3 text-text-secondary leading-relaxed animate-in fade-in duration-150">
          <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-accent-blue">
            <Sparkles className="h-3 w-3" />
            <span>Chain-of-Thought & Quantitative Proof</span>
          </div>
          <FormattedContent text={reasoning} />
        </div>
      )}
    </div>
  );
}

/**
 * Multi-Stage Institutional Quant Progress Indicator
 */
function DeepWorkingProgress({ aiModel, isStrategy = true }: { aiModel: string; isStrategy?: boolean }) {
  const [stage, setStage] = React.useState(0);

  React.useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 1200);
    const t2 = setTimeout(() => setStage(2), 2600);
    const t3 = setTimeout(() => setStage(3), 4200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const STRATEGY_STAGES = [
    { text: "Analyzing market microstructure & volatility regime...", icon: BrainCircuit, color: "text-accent-blue" },
    { text: "Formulating quantitative edge equations & expectancy E[R]...", icon: Sparkles, color: "text-cyan-400" },
    { text: "Simulating 90-day order execution & liquidation buffer...", icon: Activity, color: "text-amber-400" },
    { text: "Compiling institutional StrategyDSL & synthesising code...", icon: Zap, color: "text-emerald-400" },
  ];

  const CONVERSATIONAL_STAGES = [
    { text: "Parsing quantitative question & financial context...", icon: BrainCircuit, color: "text-accent-blue" },
    { text: "Formulating mathematical reasoning & equations...", icon: Sparkles, color: "text-cyan-400" },
    { text: "Synthesizing institutional insights & practical guidelines...", icon: Activity, color: "text-amber-400" },
    { text: "Formatting comprehensive quant response...", icon: Zap, color: "text-emerald-400" },
  ];

  const STAGES = isStrategy ? STRATEGY_STAGES : CONVERSATIONAL_STAGES;
  const current = STAGES[stage] || STAGES[0];
  const Icon = current.icon;

  return (
    <div className="flex gap-2.5 animate-in fade-in duration-200">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-accent-blue/10 text-accent-blue border border-accent-blue/20 shadow-xs">
        <BrainCircuit className="h-4 w-4 animate-pulse" />
      </div>
      <div className="flex flex-col gap-1.5 rounded-xl border border-bg-border bg-bg-surface/90 px-3.5 py-2.5 text-[11.5px] shadow-xs max-w-[90%] w-full">
        <div className="flex items-center justify-between border-b border-bg-border/60 pb-1.5">
          <div className="flex items-center gap-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-accent-blue shrink-0" />
            <span className="font-semibold text-text-primary text-[12px]">
              {isStrategy ? "Synthesizing Strategy..." : "Analyzing Quant Inquiry..."}
            </span>
          </div>
          <span className="rounded-md bg-accent-blue/10 border border-accent-blue/20 px-1.5 py-0.5 text-[9.5px] font-mono font-bold text-accent-blue">
            AlgoRush Copilot
          </span>
        </div>
        <div className="flex items-center gap-2 text-text-secondary pt-0.5 text-[11px]">
          <Icon className={`h-3.5 w-3.5 ${current.color} shrink-0`} />
          <span className="font-medium text-text-secondary">{current.text}</span>
        </div>
      </div>
    </div>
  );
}

function FormattedContent({ text }: { text: string }) {
  if (!text) return null

  // Split by code blocks ```...```
  const blockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g
  const blocks: Array<{ type: 'text' | 'code'; content: string; language?: string }> = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = blockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      blocks.push({ type: 'text', content: text.substring(lastIndex, match.index) })
    }
    blocks.push({
      type: 'code',
      language: match[1] || 'python',
      content: match[2].trimEnd()
    })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    blocks.push({ type: 'text', content: text.substring(lastIndex) })
  }

  return (
    <div className="flex flex-col gap-1 text-[11.5px] leading-relaxed">
      {blocks.map((b, bIdx) => {
        if (b.type === 'code') {
          return <CodeBlock key={bIdx} code={b.content} language={b.language || 'python'} />
        }
        return <FormattedTextBlock key={bIdx} text={b.content} />
      })}
    </div>
  )
}

function StreamingMessageContent({
  content,
  isStreaming,
  onComplete,
  onTick
}: {
  content: string;
  isStreaming: boolean;
  onComplete?: () => void;
  onTick?: () => void;
}) {
  const [displayedLength, setDisplayedLength] = React.useState(() => isStreaming ? 0 : content.length)
  const [isFinished, setIsFinished] = React.useState(!isStreaming)

  const handleSkip = React.useCallback(() => {
    setDisplayedLength(content.length)
    setIsFinished(true)
    onComplete?.()
    onTick?.()
  }, [content.length, onComplete, onTick])

  React.useEffect(() => {
    if (!isStreaming) {
      setDisplayedLength(content.length)
      setIsFinished(true)
      return
    }

    setDisplayedLength(0)
    setIsFinished(false)

    const len = content.length
    if (len === 0) {
      setIsFinished(true)
      onComplete?.()
      return
    }

    // Dynamic, energetic typing speed like ChatGPT:
    const stepSize = len < 120 ? 1 : len < 400 ? 3 : Math.max(4, Math.ceil(len / 60))
    const intervalMs = len < 120 ? 15 : len < 400 ? 12 : 10

    let current = 0
    const timer = setInterval(() => {
      current = Math.min(len, current + stepSize)
      setDisplayedLength(current)
      onTick?.()

      if (current >= len) {
        clearInterval(timer)
        setIsFinished(true)
        onComplete?.()
      }
    }, intervalMs)

    return () => clearInterval(timer)
  }, [content, isStreaming, onComplete, onTick])

  const displayedText = content.slice(0, displayedLength)

  const normalizedText = React.useMemo(() => {
    if (isFinished) return displayedText
    let t = displayedText
    const codeBlockCount = (t.match(/```/g) || []).length
    if (codeBlockCount % 2 === 1) {
      t += '\n```'
    }
    const boldCount = (t.match(/\*\*/g) || []).length
    if (boldCount % 2 === 1) {
      t += '**'
    }
    return t
  }, [displayedText, isFinished])

  return (
    <div className="relative select-text" onClick={!isFinished ? handleSkip : undefined}>
      <FormattedContent text={normalizedText} />
      
      {!isFinished && (
        <span className="inline-flex items-center ml-0.5 text-accent-blue font-mono font-bold animate-pulse text-[12px] leading-none align-baseline">
          ▊
        </span>
      )}

      {!isFinished && (
        <div className="mt-1.5 flex items-center justify-between text-[10px] text-text-tertiary border-t border-bg-border/40 pt-1">
          <span className="flex items-center gap-1 text-accent-blue font-medium">
            <Sparkles className="h-2.5 w-2.5 animate-spin" />
            <span>Streaming quant response...</span>
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleSkip()
            }}
            className="text-[9px] font-semibold text-accent-blue hover:text-white hover:bg-accent-blue bg-accent-blue/10 px-1.5 py-0.5 rounded border border-accent-blue/25 transition-all"
          >
            Skip typing ⚡
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * Interactive Strategy Tuning Studio & Code Preview inside Copilot message card
 */
function StrategyCardInteractiveControls({
  strategy,
  onOpenAnalytics,
  onOpenOptimizer,
  onOpenDeploy,
  onOpenCodeLab,
}: {
  strategy: StrategyDSL;
  onOpenAnalytics: () => void;
  onOpenOptimizer: () => void;
  onOpenDeploy: () => void;
  onOpenCodeLab: () => void;
}) {
  const { setNodes, updateStrategy, setBacktestResult, setTimeframe, setAllocation } = useBuilderStore()

  const [isTuningOpen, setIsTuningOpen] = React.useState(false)
  const [isCodeOpen, setIsCodeOpen] = React.useState(false)
  const [codeTab, setCodeTab] = React.useState<'python' | 'pinescript' | 'json'>('python')
  const [copiedCode, setCopiedCode] = React.useState(false)

  // Local tuning state initialized from strategy
  const [leverage, setLeverage] = React.useState<number>(
    strategy.action?.leverage || strategy.riskParameters?.leverage || 5
  )
  const [stopLoss, setStopLoss] = React.useState<number>(
    strategy.riskParameters?.stopLossPercentage || 3.0
  )
  const [takeProfit, setTakeProfit] = React.useState<number>(
    strategy.riskParameters?.takeProfitPercentage || 6.0
  )
  const [allocPct, setAllocPct] = React.useState<number>(
    strategy.action?.quantityValue || 50
  )
  const [tf, setTf] = React.useState<string>(strategy.timeframe || '15m')

  // Real-time calculated risk metrics
  const riskReward = (takeProfit / Math.max(0.1, stopLoss)).toFixed(2)
  const estLiqBuffer = (90 / Math.max(1, leverage)).toFixed(1)

  // Synchronize tuned parameters to canvas & local backtest engine
  const handleApplyTuning = () => {
    const updatedDsl: StrategyDSL = {
      ...strategy,
      timeframe: tf as any,
      action: {
        ...strategy.action,
        leverage: leverage,
        quantityValue: allocPct,
      },
      riskParameters: {
        ...strategy.riskParameters,
        leverage: leverage,
        stopLossPercentage: stopLoss,
        takeProfitPercentage: takeProfit,
      }
    }

    // 1. Update Global DSL
    updateStrategy(updatedDsl)
    setTimeframe(tf)
    setAllocation(allocPct)

    // 2. Update Canvas Execute Node & Risk Node
    const isShort = updatedDsl.action?.type === 'SELL'
    const orderType = updatedDsl.action?.orderType && updatedDsl.action.orderType !== 'MARKET' ? ` ${updatedDsl.action.orderType}` : ''
    const execLabel = `${isShort ? 'SHORT' : 'BUY'}${orderType} ${allocPct}% (${leverage}x Lev)`

    setNodes((prevNodes) =>
      prevNodes.map((n) => {
        if (n.type === 'executeNode') {
          return {
            ...n,
            data: {
              ...n.data,
              label: execLabel,
              dslAction: updatedDsl.action,
            }
          }
        }
        if (n.type === 'riskNode') {
          return {
            ...n,
            data: {
              ...n.data,
              label: `Risk Bracket (SL ${stopLoss}% / TP ${takeProfit}%)`,
              dslRisk: updatedDsl.riskParameters,
            }
          }
        }
        return n
      })
    )

    // 3. Re-run local backtest with updated parameters
    const freshResult = runLocalBacktest(updatedDsl, generateMockData(90))
    setBacktestResult(freshResult)

    toast.success(`⚡ Synced: ${leverage}x Lev, SL ${stopLoss}%, TP ${takeProfit}% applied to canvas!`)
  }

  const generatedCode = React.useMemo(() => {
    if (codeTab === 'python') return generatePythonCCXT(strategy)
    if (codeTab === 'pinescript') return generatePineScriptV5(strategy)
    return JSON.stringify(strategy, null, 2)
  }, [strategy, codeTab])

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode)
    setCopiedCode(true)
    toast.success(`${codeTab.toUpperCase()} code copied!`)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  return (
    <div className="flex flex-col gap-2 pt-1 border-t border-accent-blue/15 mt-2">
      {/* Action Row */}
      <div className="grid grid-cols-5 gap-1 text-[10px] font-bold">
        <button
          type="button"
          onClick={onOpenAnalytics}
          className="flex items-center justify-center gap-1 rounded-md bg-accent-blue/10 hover:bg-accent-blue/20 text-accent-blue border border-accent-blue/30 py-1 transition-all"
          title="Open Full 90D Backtest Drawer"
        >
          <BarChart3 className="h-3 w-3" />
          <span className="hidden sm:inline">Analytics</span>
        </button>

        <button
          type="button"
          onClick={onOpenOptimizer}
          className="flex items-center justify-center gap-1 rounded-md bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 py-1 transition-all"
          title="Run AI Genetic Parameter Sweep"
        >
          <Dna className="h-3 w-3" />
          <span className="hidden sm:inline">AI Sweep</span>
        </button>

        <button
          type="button"
          onClick={() => setIsTuningOpen(prev => !prev)}
          className={`flex items-center justify-center gap-1 rounded-md border py-1 transition-all ${
            isTuningOpen
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
              : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30'
          }`}
          title="Tune Leverage, SL, TP directly"
        >
          <Sliders className="h-3 w-3" />
          <span>Tune</span>
        </button>

        <button
          type="button"
          onClick={() => setIsCodeOpen(prev => !prev)}
          className={`flex items-center justify-center gap-1 rounded-md border py-1 transition-all ${
            isCodeOpen
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
              : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
          }`}
          title="View Python CCXT & Pine Script v5 Code"
        >
          <Code2 className="h-3 w-3" />
          <span>Code</span>
        </button>

        <button
          type="button"
          onClick={onOpenDeploy}
          className="flex items-center justify-center gap-1 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/40 py-1 transition-all shadow-sm"
          title="Deploy Strategy Live or to Paper Trading Sandbox"
        >
          <Rocket className="h-3 w-3" />
          <span>Deploy</span>
        </button>
      </div>

      {/* Expandable Parameter Tuning Studio */}
      {isTuningOpen && (
        <div className="rounded-xl border border-amber-500/30 bg-bg-base/90 p-2.5 space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-1 border-b border-bg-border/60">
            <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
              <Sliders className="h-3 w-3" />
              <span>⚡ Strategy Parameter Studio</span>
            </span>
            <span className="text-[9.5px] font-mono text-text-tertiary">
              R/R: <strong className="text-emerald-400">1 : {riskReward}</strong>
            </span>
          </div>

          {/* Leverage & Liquidation buffer */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-text-secondary">Leverage Multiple</span>
              <span className="font-mono font-bold text-amber-400">{leverage}x <span className="text-[9px] text-text-tertiary font-normal">(Liq buffer: ~{estLiqBuffer}%)</span></span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={leverage}
              onChange={(e) => setLeverage(Number(e.target.value))}
              className="w-full h-1.5 bg-bg-elevated rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          {/* Stop Loss & Take Profit Sliders */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-text-secondary">Stop Loss</span>
                <span className="font-mono font-bold text-rose-400">{stopLoss}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="10"
                step="0.5"
                value={stopLoss}
                onChange={(e) => setStopLoss(Number(e.target.value))}
                className="w-full h-1.5 bg-bg-elevated rounded-lg appearance-none cursor-pointer accent-rose-400"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-text-secondary">Take Profit</span>
                <span className="font-mono font-bold text-emerald-400">{takeProfit}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="0.5"
                value={takeProfit}
                onChange={(e) => setTakeProfit(Number(e.target.value))}
                className="w-full h-1.5 bg-bg-elevated rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>
          </div>

          {/* Allocation & Timeframe */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1 text-[10px]">
              <span className="text-text-tertiary">Timeframe:</span>
              <div className="flex rounded bg-bg-elevated border border-bg-border p-0.5">
                {['1m', '5m', '15m', '1h', '4h'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTf(t)}
                    className={`px-1.5 py-0.2 text-[9.5px] font-mono rounded ${
                      tf === t ? 'bg-accent-blue text-white font-bold' : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleApplyTuning}
              className="flex items-center gap-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-2 py-1 text-[10px] font-bold transition-all shadow-sm"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Apply to Canvas</span>
            </button>
          </div>
        </div>
      )}

      {/* Expandable Multi-Target Code Preview */}
      {isCodeOpen && (
        <div className="rounded-xl border border-cyan-500/30 bg-bg-base/95 p-2 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-1 border-b border-bg-border/60">
            {/* Language Selector Pills */}
            <div className="flex rounded-md bg-bg-elevated p-0.5 border border-bg-border">
              <button
                type="button"
                onClick={() => setCodeTab('python')}
                className={`px-2 py-0.5 text-[9.5px] font-bold rounded transition-colors ${
                  codeTab === 'python' ? 'bg-accent-blue text-white' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Python CCXT
              </button>
              <button
                type="button"
                onClick={() => setCodeTab('pinescript')}
                className={`px-2 py-0.5 text-[9.5px] font-bold rounded transition-colors ${
                  codeTab === 'pinescript' ? 'bg-accent-blue text-white' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Pine Script v5
              </button>
              <button
                type="button"
                onClick={() => setCodeTab('json')}
                className={`px-2 py-0.5 text-[9.5px] font-bold rounded transition-colors ${
                  codeTab === 'json' ? 'bg-accent-blue text-white' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                DSL JSON
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1 rounded bg-bg-elevated px-1.5 py-0.5 text-[9.5px] font-medium text-text-secondary hover:text-text-primary hover:bg-bg-border transition-colors"
              >
                {copiedCode ? <Check className="h-2.5 w-2.5 text-emerald-400" /> : <Copy className="h-2.5 w-2.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                type="button"
                onClick={onOpenCodeLab}
                className="flex items-center gap-1 rounded bg-accent-blue/15 text-accent-blue hover:bg-accent-blue hover:text-white px-1.5 py-0.5 text-[9.5px] font-bold transition-all"
                title="Open in full screen Quant Lab IDE"
              >
                <Terminal className="h-2.5 w-2.5" />
                <span>Quant Lab</span>
              </button>
            </div>
          </div>

          <pre className="p-2 overflow-x-auto text-[10px] text-text-secondary font-mono leading-relaxed bg-black/40 rounded-lg max-h-[160px] scrollbar-thin">
            <code>{generatedCode}</code>
          </pre>
        </div>
      )}
    </div>
  )
}

export function AICopilot() {
  const [prompt, setPrompt] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [copiedIdx, setCopiedIdx] = React.useState<number | null>(null)
  const [isListening, setIsListening] = React.useState(false)
  const [isModelDropdownOpen, setIsModelDropdownOpen] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const recognitionRef = React.useRef<any>(null)
  
  const { 
    chatHistory, 
    addChatMessage, 
    clearChatHistory,
    updateStrategy, 
    setNodes, 
    setEdges, 
    setStrategyName, 
    setTradingPair, 
    setTimeframe,
    setAllocation, 
    setIsAnimatingBuild, 
    setBacktestResult,
    setIsBacktestDrawerOpen,
    setIsOptimizerModalOpen,
    setIsDeployModalOpen,
    setWorkspaceMode,
    executeFullEndToEndBuild,
    aiModel,
    setAiModel,
    geminiApiKey,
    setIsGeminiModalOpen
  } = useBuilderStore()

  // Set of chat indices that have already completed streaming
  const [streamedIndices, setStreamedIndices] = React.useState<Set<number>>(() => {
    return new Set(chatHistory.map((_, i) => i))
  })

  React.useEffect(() => {
    if (chatHistory.length > 1) {
      setStreamedIndices(prev => {
        const next = new Set(prev)
        for (let i = 0; i < chatHistory.length - 1; i++) {
          next.add(i)
        }
        return next
      })
    }
  }, [chatHistory.length])

  const handleCopyMessage = (content: string, idx: number) => {
    navigator.clipboard.writeText(content)
    setCopiedIdx(idx)
    toast.success("Copied to clipboard!")
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  const scrollToBottom = React.useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? "smooth" : "auto" })
    }
  }, [])

  React.useEffect(() => {
    scrollToBottom(true)
  }, [chatHistory, isLoading, scrollToBottom])

  const executeStrategyBuild = async (textToParse: string) => {
    if (!textToParse.trim() || isLoading) return
    setIsLoading(true)
    try {
      await executeFullEndToEndBuild(textToParse)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || isLoading) return
    const current = prompt
    setPrompt("")
    executeStrategyBuild(current)
  }

  // Audio Speech Recognition via Web Speech API
  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.error("Speech Recognition is not supported in this browser. Please use Chrome or Edge.")
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        setIsListening(true)
        toast.info("🎙️ Listening... Speak your quant strategy or market question")
      }

      recognition.onresult = (event: any) => {
        let currentTranscript = ''
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript
        }
        setPrompt(prev => prev ? `${prev} ${currentTranscript}` : currentTranscript)
      }

      recognition.onerror = (event: any) => {
        setIsListening(false)
        if (event.error !== 'no-speech') {
          toast.error(`Voice error: ${event.error}`)
        }
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
      recognition.start()
    } catch (err: any) {
      setIsListening(false)
      toast.error("Could not initialize microphone: " + err.message)
    }
  }

  const getModelBadge = () => {
    switch (aiModel) {
      case 'claude-3-7-sonnet':
        return { label: 'Claude 3.7 Sonnet (Auto-Groq)', icon: Sparkles, color: 'text-amber-300', bg: 'bg-amber-500/15 border-amber-500/30' }
      case 'claude-3-5-sonnet':
        return { label: 'Claude 3.5 Sonnet (Auto-Groq)', icon: Sparkles, color: 'text-amber-300', bg: 'bg-amber-500/15 border-amber-500/30' }
      case 'groq-gpt-120b':
        return { label: '⚡ Groq Neural Quant™', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' }
      case 'groq-qwen-27b':
        return { label: '⚡ Groq LPU (Instant)', icon: Cpu, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' }
      case 'gemini-2.5-flash':
        return { label: 'Gemini 2.5 Flash', icon: Cpu, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' }
      case 'gemini-2.5-pro':
        return { label: 'Gemini 2.5 Pro (Reasoning)', icon: Sparkles, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' }
      case 'gemini-3.8-flash':
        return { label: 'Gemini 2.5 Flash', icon: Cpu, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' }
      case 'gemini-2.0-flash':
        return { label: 'Gemini 2.0 Flash', icon: Cpu, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/30' }
      case 'gemini-1.5-pro':
        return { label: 'Gemini 1.5 Pro', icon: Sparkles, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' }
      case 'gemini-1.5-flash-8b':
        return { label: 'Gemini Flash 8B', icon: Zap, color: 'text-accent-blue', bg: 'bg-accent-blue/10 border-accent-blue/30' }
      default:
        return { label: 'Claude 3.7 Sonnet (Auto-Groq)', icon: Sparkles, color: 'text-amber-300', bg: 'bg-amber-500/15 border-amber-500/30' }
    }
  }

  const modelBadge = getModelBadge()
  const IconComponent = modelBadge.icon

  const formatModelBadge = (_name?: string) => {
    return 'AlgoRush Copilot'
  }

  return (
    <div className="flex h-full w-full flex-col bg-bg-surface overflow-hidden relative">
      {/* Copilot Subheader / Status Control Bar */}
      <div className="flex h-[40px] items-center justify-between border-b border-bg-border px-3 bg-bg-base/60 backdrop-blur-sm z-30">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="text-[11px] font-bold text-text-primary tracking-wide">Quant Intelligence</span>
          <span className="rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 py-0.2 text-[9px] font-mono font-semibold">
            Active
          </span>
        </div>

        <div className="flex items-center gap-1.5 relative">
          {/* Reset Chat Button */}
          {chatHistory.length > 1 && (
            <button
              onClick={() => {
                clearChatHistory()
                setStreamedIndices(new Set([0]))
                toast.info('Chat session reset')
              }}
              className="flex items-center gap-1 rounded-md border border-bg-border/60 bg-bg-base/60 px-1.5 py-0.5 text-[10px] font-medium text-text-tertiary hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/10 transition-all"
              title="Reset conversation"
            >
              <RotateCcw className="h-2.5 w-2.5" />
              <span>Reset</span>
            </button>
          )}

          {/* Status Indicator */}
          <div className="flex items-center gap-1.5 rounded-md border border-accent-blue/30 bg-accent-blue/10 px-2 py-0.5 text-[10px] font-bold text-accent-blue shadow-xs">
            <Sparkles className="h-3 w-3 text-accent-blue" />
            <span>AI Copilot</span>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-bg-border">
        <div className="flex flex-col gap-3">
          {chatHistory.map((msg, idx) => {
            const isAssistant = msg.role === 'assistant'
            const isStreamingActive = isAssistant && !streamedIndices.has(idx)
            const isCardRevealed = !isStreamingActive || streamedIndices.has(idx)

            return (
            <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                msg.role === 'user' 
                  ? 'bg-bg-elevated' 
                  : msg.metadata?.isAi 
                    ? 'bg-accent-blue/15 text-accent-blue border border-accent-blue/30' 
                    : 'bg-bg-elevated text-text-secondary'
              }`}>
                {msg.role === 'user' ? <User className="h-3 w-3 text-text-secondary" /> : <Bot className="h-3 w-3" />}
              </div>

              <div className={`flex max-w-[92%] flex-col gap-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-xl px-3 py-2.5 text-[12px] leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-accent-blue text-white rounded-tr-sm shadow-sm' 
                    : 'bg-bg-elevated text-text-primary rounded-tl-sm border border-bg-border shadow-sm w-full'
                }`}>
                  {/* AI Badge & Actions */}
                  {msg.role === 'assistant' && (
                    <>
                      <div className="mb-2 flex items-center justify-between border-b border-bg-border/60 pb-1.5 text-[10px]">
                        <span className="flex items-center gap-1.5 font-bold text-accent-blue tracking-wide">
                          <Sparkles className="h-3 w-3 text-accent-blue" />
                          <span>AlgoRush Copilot</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          {msg.metadata?.latencyMs !== undefined && (
                            <span 
                              title="Quant Inference Latency"
                              className="font-mono text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.5 rounded cursor-default"
                            >
                              {msg.metadata.latencyMs}ms
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(msg.content, idx)}
                            className="p-0.5 text-text-tertiary hover:text-accent-blue transition-colors rounded"
                            title="Copy message content"
                          >
                            {copiedIdx === idx ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Message Content: Streamed progressive typewriter for new assistant messages */}
                  {!isAssistant ? (
                    <FormattedContent text={msg.content} />
                  ) : (
                    <StreamingMessageContent
                      content={msg.content}
                      isStreaming={isStreamingActive}
                      onComplete={() => {
                        setStreamedIndices(prev => new Set(prev).add(idx))
                        scrollToBottom(true)
                      }}
                      onTick={() => scrollToBottom(false)}
                    />
                  )}

                  {/* Deep Reasoning & Mathematical Proof (Revealed for BOTH strategies and conversational inquiries) */}
                  {msg.metadata?.reasoning && isCardRevealed && (
                    <DeepThinkingAccordion
                      reasoning={msg.metadata.reasoning}
                      latencyMs={msg.metadata.latencyMs}
                      modelName={msg.metadata.modelUsed}
                    />
                  )}

                  {/* Risk Assessment Card - ONLY for Strategy Builds (Revealed once typing finishes) */}
                  {msg.metadata?.strategy && msg.metadata?.riskAssessment && isCardRevealed && (
                    <div className="mt-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2 text-[11px] animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex items-center gap-1 font-bold text-emerald-400 mb-1">
                        <ShieldCheck className="h-3 w-3" />
                        <span>Risk & Liquidation Audit</span>
                      </div>
                      <p className="text-text-secondary leading-normal">
                        {msg.metadata.riskAssessment}
                      </p>
                    </div>
                  )}

                  {/* Verification Audit Checklist Card - ONLY for Strategy Builds (Revealed once typing finishes) */}
                  {msg.metadata?.strategy && msg.metadata?.verificationAudit && isCardRevealed && (
                    <div className="mt-2.5 rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-2.5 text-[11px] animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-emerald-500/20">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span>Gemini Verified Institutional Audit</span>
                        </div>
                        <span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">
                          Score: {msg.metadata.verificationAudit.score}/100
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-2">
                        <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold ${
                          msg.metadata.verificationAudit.directionalAlignment === 'SHORT_ALIGNED'
                            ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {msg.metadata.verificationAudit.directionalAlignment === 'SHORT_ALIGNED' ? '🔻 Short Bias' : '🟢 Long Bias'}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9.5px] font-semibold bg-bg-base text-text-secondary border border-bg-border">
                          R/R: {msg.metadata.verificationAudit.riskRewardRatio}
                        </span>
                        {msg.metadata.verificationAudit.estimatedLiquidationDistancePct !== undefined && (
                          <span className="px-1.5 py-0.5 rounded text-[9.5px] font-semibold bg-bg-base text-text-secondary border border-bg-border">
                            Liq Buffer: ~{msg.metadata.verificationAudit.estimatedLiquidationDistancePct}%
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col gap-1 text-[10px] text-text-secondary">
                        {msg.metadata.verificationAudit.checksPassed.map((chk, cIdx) => (
                          <div key={cIdx} className="flex items-center gap-1.5">
                            <span className="text-emerald-400 font-bold">✓</span>
                            <span>{chk}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Enterprise Backtest Simulation Card - ONLY for Strategy Builds (Revealed once typing finishes) */}
                  {msg.metadata?.strategy && msg.metadata?.backtestResult && isCardRevealed && (
                    <div className="mt-2.5 rounded-lg border border-accent-blue/30 bg-accent-blue/5 p-2.5 text-[11px] animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex items-center justify-between mb-2 pb-1 border-b border-accent-blue/20">
                        <div className="flex items-center gap-1.5 font-bold text-accent-blue">
                          <BarChart3 className="h-3.5 w-3.5 text-accent-blue shrink-0" />
                          <span>Backtest Simulation (90D)</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                          (msg.metadata.backtestResult.metrics.totalReturnRaw ?? 0) >= 0 
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}>
                          {msg.metadata.backtestResult.metrics.totalReturn} Return
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 mb-2 text-center">
                        <div className="rounded bg-bg-base/80 border border-bg-border/60 p-1">
                          <span className="block text-[9px] text-text-tertiary">Win Rate</span>
                          <span className="font-mono font-bold text-[10.5px] text-emerald-400">{msg.metadata.backtestResult.metrics.winRate}</span>
                        </div>
                        <div className="rounded bg-bg-base/80 border border-bg-border/60 p-1">
                          <span className="block text-[9px] text-text-tertiary">Profit Factor</span>
                          <span className="font-mono font-bold text-[10.5px] text-accent-blue">{msg.metadata.backtestResult.metrics.profitFactor}</span>
                        </div>
                        <div className="rounded bg-bg-base/80 border border-bg-border/60 p-1">
                          <span className="block text-[9px] text-text-tertiary">Max DD</span>
                          <span className="font-mono font-bold text-[10.5px] text-rose-400">{msg.metadata.backtestResult.metrics.maxDrawdown}</span>
                        </div>
                        <div className="rounded bg-bg-base/80 border border-bg-border/60 p-1">
                          <span className="block text-[9px] text-text-tertiary">Trades</span>
                          <span className="font-mono font-bold text-[10.5px] text-text-primary">{msg.metadata.backtestResult.metrics.totalTrades}</span>
                        </div>
                        <div className="rounded bg-bg-base/80 border border-bg-border/60 p-1">
                          <span className="block text-[9px] text-text-tertiary">Sharpe</span>
                          <span className="font-mono font-bold text-[10.5px] text-accent-blue">{msg.metadata.backtestResult.metrics.sharpeRatio}</span>
                        </div>
                        <div className="rounded bg-bg-base/80 border border-bg-border/60 p-1">
                          <span className="block text-[9px] text-text-tertiary">Friction</span>
                          <span className="font-mono font-bold text-[10.5px] text-amber-400">0.05% Fee</span>
                        </div>
                      </div>

                      {/* Interactive Tuning Studio & Multi-Target Code Controls */}
                      <StrategyCardInteractiveControls
                        strategy={msg.metadata.strategy}
                        onOpenAnalytics={() => setIsBacktestDrawerOpen(true)}
                        onOpenOptimizer={() => setIsOptimizerModalOpen(true)}
                        onOpenDeploy={() => setIsDeployModalOpen(true)}
                        onOpenCodeLab={() => setWorkspaceMode('code')}
                      />
                    </div>
                  )}

                  {/* Suggested Tweaks or Follow-ups (Revealed once typing finishes) */}
                  {msg.metadata?.suggestedTweaks && msg.metadata.suggestedTweaks.length > 0 && isCardRevealed && (
                    <div className="mt-2.5 flex flex-col gap-1 border-t border-bg-border/60 pt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                        {msg.metadata?.strategy ? 'AI Recommended Tweaks:' : 'Suggested Explorations:'}
                      </span>
                      {msg.metadata.suggestedTweaks.map((tweak, tIdx) => (
                        <button
                          key={tIdx}
                          type="button"
                          onClick={() => {
                            if (msg.metadata?.strategy) {
                              setPrompt(`Apply this tweak to ${msg.metadata?.strategy?.name || 'strategy'}: ${tweak}`)
                            } else {
                              setPrompt(tweak)
                            }
                          }}
                          className="group flex items-center justify-between rounded-lg border border-bg-border bg-bg-base/80 px-2 py-1.5 text-left text-[10.5px] text-text-secondary hover:border-accent-blue/50 hover:bg-bg-surface hover:text-text-primary transition-all"
                        >
                          <span className="truncate pr-1">{tweak}</span>
                          <ArrowRight className="h-3 w-3 shrink-0 text-accent-blue opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            )
          })}

          {/* Multi-Stage Animated Deep Thinking Indicator */}
          {isLoading && (
            <DeepWorkingProgress 
              aiModel={aiModel} 
              isStrategy={chatHistory.length > 0 ? isExplicitStrategyIntent(chatHistory[chatHistory.length - 1].content, chatHistory.slice(0, -1).map(m => ({ role: m.role, content: m.content }))) : true} 
            />
          )}

          {/* Quick Preset Prompts when chat is at initial welcome */}
          {chatHistory.length <= 1 && !isLoading && (
            <div className="flex flex-col gap-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary px-1">
                💡 Sample Ideas & Questions (Optional):
              </span>
              {SAMPLE_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => executeStrategyBuild(p.prompt)}
                  className="flex items-center justify-between rounded-xl border border-bg-border bg-bg-elevated/70 px-2.5 py-2 text-left text-[11px] text-text-secondary hover:border-accent-blue/50 hover:bg-bg-elevated hover:text-text-primary transition-all group"
                >
                  <span className="font-medium text-text-primary group-hover:text-accent-blue transition-colors">
                    {p.label}
                  </span>
                  <ChevronRight className="h-3 w-3 text-text-tertiary group-hover:text-accent-blue transition-colors" />
                </button>
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-2.5 border-t border-bg-border bg-bg-base flex flex-col gap-1.5 z-20">
        {/* Quick Strategy Archetypes Pill Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[10px]">
          {PROMPT_ARCHETYPES.map((arch, i) => {
            const Icon = arch.icon
            return (
              <button
                key={i}
                type="button"
                onClick={() => setPrompt(arch.template)}
                className={`shrink-0 flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium transition-all hover:scale-105 ${arch.color}`}
              >
                <Icon className="h-2.5 w-2.5" />
                <span>{arch.label}</span>
              </button>
            )
          })}
        </div>

        {/* Input Form with Audio Microphone Dictation */}
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
          <div className="absolute left-2.5 top-3 text-accent-blue pointer-events-none">
            <Sparkles className="h-3.5 w-3.5" />
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={isListening ? "Listening... Speak now..." : "Say 'hi', ask any quant question, or describe a strategy to build..."}
            className={`min-h-[44px] max-h-[120px] w-full resize-none rounded-xl border pl-8 pr-16 pt-2.5 text-[12px] text-text-primary outline-none transition-all ${
              isListening
                ? 'border-rose-500 bg-rose-500/5 shadow-[0_0_12px_rgba(244,63,94,0.2)] placeholder:text-rose-400'
                : 'border-bg-border bg-bg-surface placeholder:text-text-tertiary focus:border-accent-blue'
            }`}
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />

          {/* Action buttons (Mic + Send) inside right of textarea */}
          <div className="absolute right-1.5 top-1.5 flex items-center gap-1">
            {/* Audio Voice Input Button */}
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                  : 'bg-bg-elevated hover:bg-bg-border text-text-secondary hover:text-text-primary'
              }`}
              title={isListening ? "Stop listening" : "Speak trading strategy (Voice Dictation)"}
            >
              {isListening ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-blue text-white disabled:opacity-50 transition-colors hover:bg-blue-600 shadow-sm"
              title="Send to AI Copilot (Enter)"
            >
              <Send className="h-3 w-3" />
            </button>
          </div>
        </form>

        {/* Engine status footer */}
        <div className="flex items-center justify-between px-1 text-[10px] text-text-tertiary">
          <button
            type="button"
            onClick={() => setIsGeminiModalOpen(true)}
            className="flex items-center gap-1 hover:text-accent-blue transition-colors"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Engine: <strong>{modelBadge.label}</strong></span>
          </button>
          <span className="text-emerald-400/90 font-medium flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            Institutional Quant Active
          </span>
        </div>
      </div>
    </div>
  )
}
