"use client"

import * as React from "react"
import { 
  Send, Sparkles, Loader2, Bot, User, BrainCircuit, Key, Zap, 
  Settings2, ShieldCheck, TrendingUp, AlertTriangle, ArrowRight, CheckCircle2, ChevronRight, Cpu,
  Copy, Check, RotateCcw, BarChart3, Dna, Activity
} from "lucide-react"
import { useBuilderStore, AiModelType } from "@/store/useBuilderStore"
import { generateMockData, runLocalBacktest } from "@/lib/backtester/engine"
import { toast } from "sonner"

const SAMPLE_PRESETS = [
  {
    label: "⚡ Backtest 15m Trend (10x)",
    prompt: "Backtest ETH when 20 EMA crosses above 50 EMA on 15m and RSI < 35, stop loss 2.5%, take profit 6%, 10x leverage",
  },
  {
    label: "💡 Explain EMA vs SMA in Python",
    prompt: "Explain how EMA reduces lag compared to SMA in crypto trading and provide an async CCXT code snippet",
  },
  {
    label: "🌊 SOL Bollinger Reversion",
    prompt: "Long SOL when price is below lower Bollinger Band and RSI < 30 on 15m, exit when price reaches upper Bollinger Band, stop loss 3%, 5x leverage",
  },
  {
    label: "📉 BTC 5x Short Breakdown",
    prompt: "Go short BTC when 50 EMA crosses below 200 EMA and MACD histogram < 0 on 1h, exit when RSI < 30 or 3% trailing stop, 5x leverage",
  },
  {
    label: "🔬 Kelly Criterion & Risk Math",
    prompt: "What is the Kelly Criterion formula and how do quants use half-kelly to prevent liquidation cascades?",
  },
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
    const parts = str.split(/(\*\*[^*]+\*\*|`[^`]+`|\$[^$]+\$)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-text-primary">{part.slice(2, -2)}</strong>
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="rounded bg-bg-base/80 border border-bg-border/60 px-1 py-0.5 font-mono text-[10px] text-accent-blue">{part.slice(1, -1)}</code>
      }
      if (part.startsWith('$') && part.endsWith('$')) {
        return <span key={i} className="font-mono text-emerald-400 bg-emerald-500/10 px-1 rounded text-[10px]">{part.slice(1, -1)}</span>
      }
      return part
    })
  }

  return (
    <div className="flex flex-col gap-1.5 leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim()
        if (!trimmed) return <div key={idx} className="h-1" />

        if (trimmed.startsWith('### ')) {
          return <h4 key={idx} className="font-bold text-[12px] text-text-primary mt-1">{parseInline(trimmed.slice(4))}</h4>
        }
        if (trimmed.startsWith('## ')) {
          return <h3 key={idx} className="font-bold text-[12.5px] text-text-primary mt-1.5 pb-0.5 border-b border-bg-border/40">{parseInline(trimmed.slice(3))}</h3>
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
              <span className="text-accent-blue/80 font-mono text-[10px] shrink-0 font-bold">{numMatch[1]}.</span>
              <span className="text-text-secondary">{parseInline(numMatch[2])}</span>
            </div>
          )
        }

        if (trimmed.startsWith('> ')) {
          return (
            <div key={idx} className="border-l-2 border-accent-blue/40 bg-accent-blue/5 pl-2 py-0.5 my-0.5 italic text-text-secondary rounded-r text-[11px]">
              {parseInline(trimmed.slice(2))}
            </div>
          )
        }

        return <p key={idx} className="text-text-secondary">{parseInline(line)}</p>
      })}
    </div>
  )
}

function FormattedContent({ text }: { text: string }) {
  if (!text) return null

  // Split by code blocks ```...```
  const blockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g
  const blocks: Array<{ type: 'text' | 'code'; content: string; language?: string }> = []
  let lastIndex = 0
  let match

  while ((match = blockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      blocks.push({ type: 'text', content: text.substring(lastIndex, match.index) })
    }
    blocks.push({ type: 'code', content: match[2].trim(), language: match[1] || 'python' })
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

export function AICopilot() {
  const [prompt, setPrompt] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [copiedIdx, setCopiedIdx] = React.useState<number | null>(null)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  
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
    executeFullEndToEndBuild,
    aiModel,
    setAiModel,
    geminiApiKey,
    setIsGeminiModalOpen
  } = useBuilderStore()

  const handleCopyMessage = (content: string, idx: number) => {
    navigator.clipboard.writeText(content)
    setCopiedIdx(idx)
    toast.success("Copied to clipboard!")
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [chatHistory, isLoading])

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

  const getModelBadge = () => {
    switch (aiModel) {
      case 'gemini-2.5-flash':
        return { label: 'Gemini 2.5 Flash', icon: Cpu, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' }
      case 'gemini-2.5-pro':
        return { label: 'Gemini 2.5 Pro (Reasoning)', icon: Sparkles, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' }
      case 'gemini-3.8-flash':
        return { label: 'Gemini 2.5 Flash', icon: Cpu, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' }
      case 'gemini-2.0-flash':
        return { label: 'Gemini 2.0 Flash', icon: Cpu, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' }
      case 'gemini-1.5-pro':
        return { label: 'Gemini 1.5 Pro', icon: Sparkles, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' }
      case 'gemini-1.5-flash-8b':
        return { label: 'Gemini Flash 8B', icon: Zap, color: 'text-accent-blue', bg: 'bg-accent-blue/10 border-accent-blue/30' }
      case 'gemini-1.5-flash':
        return { label: 'Gemini 1.5 Flash', icon: Sparkles, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' }
      default:
        return { label: 'Gemini AI', icon: Cpu, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' }
    }
  }

  const modelBadge = getModelBadge()
  const IconComponent = modelBadge.icon

  return (
    <div className="flex h-full w-full flex-col bg-bg-surface overflow-hidden">
      {/* Copilot Header */}
      <div className="flex h-[46px] items-center justify-between border-b border-bg-border px-3">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-4 w-4 text-accent-blue" />
          <h3 className="text-[13px] font-bold text-text-primary">AI Copilot</h3>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Reset Chat Button */}
          {chatHistory.length > 1 && (
            <button
              onClick={() => {
                clearChatHistory()
                toast.info('Chat session reset')
              }}
              className="flex items-center gap-1 rounded-lg border border-bg-border/60 bg-bg-base/60 px-1.5 py-1 text-[10px] font-medium text-text-tertiary hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/10 transition-all"
              title="Reset chat conversation"
            >
              <RotateCcw className="h-2.5 w-2.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          {/* Gemini Engine Trigger Pill */}
          <button
            onClick={() => setIsGeminiModalOpen(true)}
            className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[10px] font-bold transition-all hover:scale-105 ${modelBadge.bg} ${modelBadge.color}`}
            title="Configure Gemini AI Engine & Free Key"
          >
            <IconComponent className="h-3 w-3" />
            <span>{modelBadge.label}</span>
            <Settings2 className="h-2.5 w-2.5 opacity-60 ml-0.5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-bg-border">
        <div className="flex flex-col gap-3">
          {chatHistory.map((msg, idx) => (
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

              <div className={`flex max-w-[90%] flex-col gap-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-xl px-3 py-2.5 text-[12px] leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-accent-blue text-white rounded-tr-sm shadow-sm' 
                    : 'bg-bg-elevated text-text-primary rounded-tl-sm border border-bg-border shadow-sm w-full'
                }`}>
                  {/* AI Badge & Actions */}
                  {msg.role === 'assistant' && (
                    <div className="mb-2 flex items-center justify-between border-b border-bg-border/60 pb-1.5 text-[10px]">
                      <span className="flex items-center gap-1 font-bold text-accent-blue">
                        <Zap className="h-3 w-3" />
                        <span>{msg.metadata?.modelUsed ? (msg.metadata.modelUsed.includes('3.8') || msg.metadata.modelUsed.includes('2.5') ? 'Gemini 2.5 Flash' : msg.metadata.modelUsed.includes('2.0') ? 'Gemini 2.0 Flash' : msg.metadata.modelUsed) : 'Google Gemini AI'}</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        {msg.metadata?.latencyMs && (
                          <span className="font-mono text-text-tertiary">
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
                  )}

                  {/* Quant Edge Rationale Card - ONLY for Strategy Builds */}
                  {msg.metadata?.strategy && msg.metadata?.reasoning && (
                    <div className="mb-2.5 rounded-lg border border-accent-blue/20 bg-accent-blue/5 p-2 text-[11px] text-text-primary">
                      <div className="flex items-center gap-1 font-bold text-accent-blue mb-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>Quant Edge Rationale</span>
                      </div>
                      <p className="text-text-secondary leading-normal">
                        {msg.metadata.reasoning}
                      </p>
                    </div>
                  )}

                  {/* Main Content */}
                  {msg.role === 'user' ? (
                    <div className="whitespace-pre-line text-[11.5px]">
                      {msg.content}
                    </div>
                  ) : (
                    <FormattedContent text={msg.content} />
                  )}

                  {/* Risk Assessment Card - ONLY for Strategy Builds */}
                  {msg.metadata?.strategy && msg.metadata?.riskAssessment && (
                    <div className="mt-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2 text-[11px]">
                      <div className="flex items-center gap-1 font-bold text-emerald-400 mb-1">
                        <ShieldCheck className="h-3 w-3" />
                        <span>Risk & Liquidation Audit</span>
                      </div>
                      <p className="text-text-secondary leading-normal">
                        {msg.metadata.riskAssessment}
                      </p>
                    </div>
                  )}

                  {/* Verification Audit Checklist Card - ONLY for Strategy Builds */}
                  {msg.metadata?.strategy && msg.metadata?.verificationAudit && (
                    <div className="mt-2.5 rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-2.5 text-[11px]">
                      <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-emerald-500/20">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span>{msg.metadata.modelUsed?.includes('3.8') ? 'Gemini 3.8 Flash Verified Audit' : msg.metadata.modelUsed?.includes('2.0') ? 'Gemini 2.0 Flash Verified Audit' : 'Gemini 3.8 Flash Verified Audit'}</span>
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
                        {msg.metadata.verificationAudit.correctionsApplied?.map((cor, crIdx) => (
                          <div key={crIdx} className="flex items-center gap-1.5 text-amber-300 font-medium">
                            <span className="text-amber-400 font-bold">⚡</span>
                            <span>Auto-Calibrated: {cor}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Enterprise Backtest Simulation Card - ONLY for Strategy Builds */}
                  {msg.metadata?.strategy && msg.metadata?.backtestResult && (
                    <div className="mt-2.5 rounded-lg border border-accent-blue/30 bg-accent-blue/5 p-2.5 text-[11px]">
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

                      <div className="grid grid-cols-3 gap-1.5 mb-2.5 text-center">
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

                      {/* Interactive Drawer & Sweep Triggers */}
                      <div className="flex gap-1.5 pt-1 border-t border-accent-blue/15">
                        <button
                          type="button"
                          onClick={() => setIsBacktestDrawerOpen(true)}
                          className="flex-1 flex items-center justify-center gap-1 rounded-md bg-accent-blue/10 hover:bg-accent-blue/20 text-accent-blue border border-accent-blue/30 py-1 text-[10px] font-bold transition-all"
                        >
                          <BarChart3 className="h-3 w-3" />
                          <span>Full Analytics</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsOptimizerModalOpen(true)}
                          className="flex-1 flex items-center justify-center gap-1 rounded-md bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 py-1 text-[10px] font-bold transition-all"
                        >
                          <Dna className="h-3 w-3" />
                          <span>AI Sweep</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Suggested Tweaks or Follow-ups */}
                  {msg.metadata?.suggestedTweaks && msg.metadata.suggestedTweaks.length > 0 && (
                    <div className="mt-2.5 flex flex-col gap-1 border-t border-bg-border/60 pt-2">
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
          ))}

          {/* Thinking / Analyzing Indicator */}
          {isLoading && (
            <div className="flex gap-2 animate-in fade-in duration-200">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <Bot className="h-3 w-3 animate-spin" />
              </div>
              <div className="rounded-xl px-3 py-2.5 bg-bg-elevated border border-bg-border text-text-secondary text-[11.5px] flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400 shrink-0" />
                <span className="font-medium text-emerald-400/90 animate-pulse">
                  Google Gemini AI is thinking & formulating response...
                </span>
              </div>
            </div>
          )}

          {/* Quick Preset Prompts when chat is at initial welcome */}
          {chatHistory.length <= 1 && !isLoading && (
            <div className="flex flex-col gap-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary px-1">
                Quick AI Strategy Starters:
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
      <div className="p-2.5 border-t border-bg-border bg-bg-base flex flex-col gap-1.5">
        {/* Quick action chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[10px]">
          <button
            type="button"
            onClick={() => setPrompt("Backtest BTC when 20 EMA crosses 50 EMA on 15m, stop loss 2%, take profit 5%")}
            className="shrink-0 rounded-full border border-bg-border bg-bg-surface px-2 py-0.5 text-text-secondary hover:border-accent-blue hover:text-accent-blue transition-colors"
          >
            ⚡ Fast Backtest
          </button>
          <button
            type="button"
            onClick={() => setPrompt("How does slippage simulation impact high frequency crypto backtests?")}
            className="shrink-0 rounded-full border border-bg-border bg-bg-surface px-2 py-0.5 text-text-secondary hover:border-accent-blue hover:text-accent-blue transition-colors"
          >
            🔬 Slippage Audit
          </button>
          <button
            type="button"
            onClick={() => setPrompt("What is the Kelly Criterion formula and how do quants use half-kelly?")}
            className="shrink-0 rounded-full border border-bg-border bg-bg-surface px-2 py-0.5 text-text-secondary hover:border-accent-blue hover:text-accent-blue transition-colors"
          >
            📐 Kelly Math
          </button>
          <button
            type="button"
            onClick={() => setPrompt("When 50 EMA crosses above 200 EMA on 4h buy BTC with 5x leverage, stop loss 3%, take profit 8%")}
            className="shrink-0 rounded-full border border-bg-border bg-bg-surface px-2 py-0.5 text-text-secondary hover:border-accent-blue hover:text-accent-blue transition-colors"
          >
            📈 Golden Cross (4h)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
          <div className="absolute left-2.5 top-3 text-accent-blue">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask any quant question or describe a strategy... (e.g. 'why did trade fail?' or 'Buy ETH on 15m')"
            className="min-h-[44px] max-h-[120px] w-full resize-none rounded-xl border border-bg-border bg-bg-surface pl-8 pr-10 pt-2.5 text-[12px] text-text-primary outline-none placeholder:text-text-tertiary focus:border-accent-blue transition-all"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-accent-blue text-white disabled:opacity-50 transition-colors hover:bg-blue-600 shadow-sm"
          >
            <Send className="h-3 w-3" />
          </button>
        </form>

        {/* Engine status footer */}
        <div className="flex items-center justify-between px-1 text-[10px] text-text-tertiary">
          <button
            type="button"
            onClick={() => setIsGeminiModalOpen(true)}
            className="flex items-center gap-1 hover:text-accent-blue transition-colors"
          >
            <span className={`h-1.5 w-1.5 rounded-full ${geminiApiKey ? 'bg-emerald-400' : 'bg-accent-blue animate-ping'}`} />
            <span>Engine: <strong>{modelBadge.label}</strong></span>
          </button>
          <button
            type="button"
            onClick={() => setIsGeminiModalOpen(true)}
            className="hover:text-text-primary underline"
          >
            {geminiApiKey ? 'Key Configured' : 'Get Free Key'}
          </button>
        </div>
      </div>
    </div>
  )
}
