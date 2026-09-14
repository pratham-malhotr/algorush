"use client"

import * as React from "react"
import { 
  Sparkles, Send, Mic, MicOff, Wand2, Terminal, Layers, 
  TrendingUp, ShieldCheck, ChevronDown, ChevronUp, Zap, 
  Cpu, RotateCcw, Copy, Check, ArrowRight, Play, Sliders,
  CheckCircle2, AlertCircle, BarChart3, HelpCircle, Flame,
  Minimize2, Maximize2, X
} from "lucide-react"
import { useBuilderStore } from "@/store/useBuilderStore"
import { toast } from "sonner"

interface TokenAnalysis {
  direction?: 'LONG' | 'SHORT';
  asset?: string;
  timeframe?: string;
  indicators: string[];
  leverage?: number;
  stopLoss?: number;
  takeProfit?: number;
  trailingStop?: number;
  allocation?: number;
}

const PRESET_STRATEGIES = [
  {
    category: "🚀 Trend & Momentum",
    color: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    items: [
      {
        title: "⚡ 15m Triple EMA Pullback (10x)",
        prompt: "Buy ETH when 20 EMA crosses above 50 EMA on 15m and price is above 200 EMA with RSI < 35, stop loss 2.5%, take profit 6.5%, 10x leverage, 40% allocation"
      },
      {
        title: "🎯 1h Supertrend + ADX Breakout",
        prompt: "Buy BTC on 1h when price is above Supertrend(10, 3) and ADX > 25 and Volume > 1.5x Volume SMA, stop loss 2%, take profit 7%, 5x leverage"
      },
      {
        title: "🌟 Institutional 4h Golden Cross",
        prompt: "Buy BTC when 50 EMA crosses above 200 EMA on 4h and MACD histogram > 0, exit when 50 EMA crosses below 200 EMA or 4% trailing stop, 3x leverage"
      }
    ]
  },
  {
    category: "🌊 Mean Reversion & Volatility",
    color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    items: [
      {
        title: "🛡️ Bollinger Squeeze Mean Reversion",
        prompt: "Long SOL on 15m when price touches lower Bollinger Band and RSI < 30, exit when price touches upper Bollinger Band, stop loss 2.5%, take profit 5.5%"
      },
      {
        title: "📉 5x Short Breakdown Scalp",
        prompt: "Go short BTC on 15m when 20 EMA crosses below 50 EMA and RSI > 65 and MACD histogram < 0, stop loss 2%, take profit 5%, 5x leverage"
      },
      {
        title: "⚡ Keltner Channel Volatility Fade",
        prompt: "Buy NEAR when price drops below Keltner Lower Channel on 5m and RSI < 25, exit at Keltner Upper Channel or 2% stop loss, 5x leverage"
      }
    ]
  },
  {
    category: "⚡ Scalping & High Frequency",
    color: "border-purple-500/30 bg-purple-500/10 text-purple-400",
    items: [
      {
        title: "🔥 5m Volume Surge Micro-Scalper",
        prompt: "Buy SOL when 5m Volume > 2x Volume SMA and 9 EMA crosses above 21 EMA with RSI between 45 and 65, stop loss 1.5%, take profit 3.5%, 10x leverage"
      },
      {
        title: "💎 Order Flow Imbalance Momentum",
        prompt: "Buy BTC on 1m when Orderbook Imbalance > 0.65 and price > VWAP, stop loss 1%, take profit 2.5%, 10x leverage, trailing stop 0.8%"
      }
    ]
  },
  {
    category: "🏛️ Equity & Multi-Asset",
    color: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    items: [
      {
        title: "📈 NVDA Donchian Channel Breakout",
        prompt: "Buy NVDA when price breaks 20 period Donchian High with Volume > 1.5x SMA, exit on 10 period Donchian Low or 3% trailing stop, allocate 30%"
      },
      {
        title: "⚖️ Gold / PAXG Safe Haven Momentum",
        prompt: "Buy PAXG/USDT on 4h when 50 EMA is above 200 EMA and RSI > 50, stop loss 2%, take profit 5%, 3x leverage"
      }
    ]
  }
]

export function StrategyPromptStudio() {
  const {
    executeFullEndToEndBuild,
    buildupPipelineStage,
    aiModel,
    geminiApiKey,
    setIsGeminiModalOpen,
    tradingPair,
    timeframe,
    strategyDSL,
    isPromptStudioOpen,
    setIsPromptStudioOpen
  } = useBuilderStore()

  const [prompt, setPrompt] = React.useState("")
  const [activeTab, setActiveTab] = React.useState<'freeform' | 'builder' | 'presets'>('freeform')
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [isListening, setIsListening] = React.useState(false)
  const [speechSupported, setSpeechSupported] = React.useState(false)

  // Keyboard shortcut Cmd+K to toggle, Esc to close
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsPromptStudioOpen(!isPromptStudioOpen)
      } else if (e.key === 'Escape' && isPromptStudioOpen) {
        setIsPromptStudioOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPromptStudioOpen, setIsPromptStudioOpen])

  // Builder Clause Matrix State
  const [builderDirection, setBuilderDirection] = React.useState<'BUY' | 'SELL'>('BUY')
  const [builderAsset, setBuilderAsset] = React.useState('BTC/USDT')
  const [builderTimeframe, setBuilderTimeframe] = React.useState('15m')
  const [builderIndicator1, setBuilderIndicator1] = React.useState('20 EMA')
  const [builderComparator, setBuilderComparator] = React.useState('Crosses Above')
  const [builderIndicator2, setBuilderIndicator2] = React.useState('50 EMA')
  const [builderFilter, setBuilderFilter] = React.useState('RSI < 35')
  const [builderLeverage, setBuilderLeverage] = React.useState('10x')
  const [builderStopLoss, setBuilderStopLoss] = React.useState('2.5%')
  const [builderTakeProfit, setBuilderTakeProfit] = React.useState('6.0%')

  // Check speech recognition support
  React.useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setSpeechSupported(true)
    }
  }, [])

  // Real-time Semantic Tokenizer HUD Analysis
  const analysis: TokenAnalysis = React.useMemo(() => {
    const t = prompt.toLowerCase()
    const result: TokenAnalysis = { indicators: [] }

    // Direction
    if (/\b(short|sell|shorting)\b/.test(t)) {
      result.direction = 'SHORT'
    } else if (/\b(long|buy|buying)\b/.test(t)) {
      result.direction = 'LONG'
    }

    // Asset
    const assetMatch = t.match(/\b(btc|eth|sol|near|doge|xrp|ada|bnb|nvda|aapl|tsla|paxg|spy|qqq)\b/)
    if (assetMatch) {
      const sym = assetMatch[1].toUpperCase()
      result.asset = sym.includes('/') ? sym : (['NVDA', 'AAPL', 'TSLA', 'SPY', 'QQQ'].includes(sym) ? sym : `${sym}/USDT`)
    }

    // Timeframe
    const tfMatch = t.match(/\b(1m|3m|5m|15m|30m|1h|2h|4h|1d|daily)\b/)
    if (tfMatch) {
      result.timeframe = tfMatch[1] === 'daily' ? '1d' : tfMatch[1]
    }

    // Indicators detected
    const indPatterns = [
      { name: 'EMA', regex: /(\d+)?\s*ema/g },
      { name: 'SMA', regex: /(\d+)?\s*sma/g },
      { name: 'RSI', regex: /rsi(\s*<\s*\d+|\s*>\s*\d+)?/g },
      { name: 'MACD', regex: /macd(\s*histogram)?/g },
      { name: 'Bollinger Bands', regex: /bollinger(\s*(upper|lower|bands|squeeze))?/g },
      { name: 'Supertrend', regex: /supertrend/g },
      { name: 'ATR', regex: /atr/g },
      { name: 'Volume', regex: /volume(\s*>\s*[\d.]+x)?/g },
      { name: 'VWAP', regex: /vwap/g },
      { name: 'Donchian', regex: /donchian/g },
      { name: 'Golden Cross', regex: /golden cross/g },
      { name: 'Death Cross', regex: /death cross/g }
    ]

    for (const p of indPatterns) {
      if (p.regex.test(t)) {
        result.indicators.push(p.name)
      }
    }

    // Leverage
    const levMatch = t.match(/(\d+)x\b/)
    if (levMatch) {
      result.leverage = parseInt(levMatch[1])
    }

    // Stop Loss
    const slMatch = t.match(/(?:stop loss|sl)\s*(?:is|=|at|of)?\s*([\d.]+)%?/i)
    if (slMatch) {
      result.stopLoss = parseFloat(slMatch[1])
    }

    // Take Profit
    const tpMatch = t.match(/(?:take profit|tp)\s*(?:is|=|at|of)?\s*([\d.]+)%?/i)
    if (tpMatch) {
      result.takeProfit = parseFloat(tpMatch[1])
    }

    // Trailing Stop
    const trailMatch = t.match(/(?:trailing stop|trailing|trail)\s*(?:is|=|at|of)?\s*([\d.]+)%?/i)
    if (trailMatch) {
      result.trailingStop = parseFloat(trailMatch[1])
    }

    return result
  }, [prompt])

  // Speech Recognition Handler
  const toggleSpeechRecognition = () => {
    if (!speechSupported) {
      toast.info("Voice input simulated: Speak your strategy...")
      setPrompt("Buy BTC when 20 EMA crosses above 50 EMA on 15m and RSI < 35, stop loss 2%, take profit 6%, 10x leverage")
      return
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      if (!isListening) {
        setIsListening(true)
        recognition.start()

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript))
          setIsListening(false)
          toast.success("Voice command transcribed!")
        }

        recognition.onerror = () => {
          setIsListening(false)
          toast.error("Speech recognition error")
        }

        recognition.onend = () => {
          setIsListening(false)
        }
      } else {
        setIsListening(false)
        recognition.stop()
      }
    } catch {
      setIsListening(false)
    }
  }

  // Quick token append
  const appendToken = (text: string) => {
    setPrompt((prev) => {
      const trimmed = prev.trim()
      if (!trimmed) return text
      return `${trimmed} and ${text}`
    })
  }

  // AI Auto-Enhance Button: Expands simple ideas into institutional rulebooks
  const handleAutoEnhance = () => {
    if (!prompt.trim()) {
      setPrompt("Buy 50% BTC on 15m when 20 EMA crosses above 50 EMA with RSI < 35 and Volume > 1.5x SMA, stop loss 2.5%, take profit 6.5%, 10x leverage")
      toast.success("✨ Strategy template injected!")
      return
    }

    const t = prompt.toLowerCase()
    let enhanced = prompt.trim()

    // Add timeframe if missing
    if (!/\b(1m|3m|5m|15m|30m|1h|2h|4h|1d)\b/.test(t)) {
      enhanced += " on 15m"
    }

    // Add indicator confirmation if single rule
    if (!/\b(rsi|volume|macd|filter|above 200)\b/.test(t)) {
      enhanced += " and RSI < 40 and Volume > 1.5x SMA"
    }

    // Add risk brackets if missing
    if (!/\b(stop loss|sl)\b/.test(t)) {
      enhanced += ", stop loss 2.0%"
    }
    if (!/\b(take profit|tp)\b/.test(t)) {
      enhanced += ", take profit 6.0%"
    }

    // Add leverage if missing
    if (!/\b(\d+x|leverage)\b/.test(t)) {
      enhanced += ", 5x leverage"
    }

    setPrompt(enhanced)
    toast.success("✨ Auto-enhanced with institutional risk safeguards!")
  }

  // Assemble Clause Matrix into Prompt
  const assembleFromMatrix = () => {
    const isShort = builderDirection === 'SELL'
    const clause = `${isShort ? 'Short' : 'Buy'} ${builderAsset} on ${builderTimeframe} when ${builderIndicator1} ${builderComparator} ${builderIndicator2} and ${builderFilter}, stop loss ${builderStopLoss}, take profit ${builderTakeProfit}, ${builderLeverage} leverage`
    setPrompt(clause)
    setActiveTab('freeform')
    toast.success("Assembled prompt from visual clause matrix!")
  }

  // Handle Build Execution
  const handleBuild = async (textToCompile?: string) => {
    const target = textToCompile || prompt
    if (!target.trim() || buildupPipelineStage > 0) return
    await executeFullEndToEndBuild(target)
  }

  const isBuilding = buildupPipelineStage > 0

  if (!isPromptStudioOpen) {
    return (
      <div className="w-full rounded-2xl border border-bg-border/90 bg-bg-surface/90 backdrop-blur-xl shadow-2xl p-1.5 flex items-center gap-2 transition-all duration-200 hover:border-accent-blue/40">
        {/* Left AI Sparkle Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-accent-blue/10 border border-accent-blue/25 text-accent-blue font-bold text-xs shrink-0 select-none shadow-xs">
          <Sparkles className="h-3.5 w-3.5 text-accent-blue animate-pulse" />
          <span className="hidden sm:inline font-mono tracking-tight text-[11px]">AI Studio</span>
        </div>

        {/* Input */}
        <div className="flex-1 relative flex items-center min-w-0">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleBuild()
              }
            }}
            placeholder="Type strategy (e.g. 'Buy 50% BTC on 15m when 20 EMA > 50 EMA, stop loss 2%')..."
            className="w-full bg-transparent px-2 text-xs text-text-primary outline-none placeholder:text-text-tertiary truncate"
          />
          {prompt.length > 0 && (
            <button
              onClick={() => setPrompt("")}
              className="p-1 text-text-tertiary hover:text-text-primary rounded"
              title="Clear"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Voice Input */}
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className={`p-1.5 rounded-lg text-xs transition-all ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
            }`}
            title="Voice input"
          >
            {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
          </button>

          {/* Auto Enhance */}
          <button
            type="button"
            onClick={handleAutoEnhance}
            className="hidden md:flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold bg-bg-elevated hover:bg-accent-blue/10 hover:text-accent-blue text-text-secondary border border-bg-border transition-all"
            title="Auto-Enhance prompt with risk safeguards"
          >
            <Wand2 className="h-3 w-3" />
            <span>Auto</span>
          </button>

          {/* Build Strategy */}
          <button
            type="button"
            onClick={() => handleBuild()}
            disabled={isBuilding || !prompt.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-blue hover:bg-blue-600 disabled:opacity-40 text-white font-bold text-[11.5px] shadow-sm shadow-accent-blue/20 transition-all hover:scale-102"
          >
            {isBuilding ? (
              <>
                <span className="h-3 w-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                <span className="hidden sm:inline">Compiling...</span>
              </>
            ) : (
              <>
                <Zap className="h-3.5 w-3.5 fill-current" />
                <span>Build</span>
              </>
            )}
          </button>

          <div className="h-4 w-px bg-bg-border mx-0.5" />

          {/* Expand to full Studio */}
          <button
            type="button"
            onClick={() => setIsPromptStudioOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold text-text-secondary hover:text-text-primary hover:bg-bg-elevated border border-transparent hover:border-bg-border transition-all"
            title="Expand Full Studio (Clause Matrix, Live Tokenizer HUD, Presets)"
          >
            <span>Studio</span>
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full rounded-2xl border border-bg-border/90 bg-bg-surface/95 backdrop-blur-xl transition-all shadow-2xl overflow-hidden flex flex-col">
      {/* ═══ Header Bar: Studio Tabs & Mode Switchers ═══ */}
      <div className="flex h-10 items-center justify-between px-4 border-b border-bg-border/60 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-bold text-accent-blue">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="tracking-wide">AI Strategy Studio</span>
          </div>

          <div className="h-3 w-px bg-bg-border mx-1" />

          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-bg-elevated p-0.5 rounded-lg border border-bg-border">
            <button
              type="button"
              onClick={() => setActiveTab('freeform')}
              className={`px-2.5 py-0.5 rounded-md font-semibold text-[11px] transition-all ${
                activeTab === 'freeform'
                  ? 'bg-accent-blue text-white shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Natural Language
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('builder')}
              className={`px-2.5 py-0.5 rounded-md font-semibold text-[11px] transition-all ${
                activeTab === 'builder'
                  ? 'bg-accent-blue text-white shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Clause Matrix
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`px-2.5 py-0.5 rounded-md font-semibold text-[11px] transition-all ${
                activeTab === 'presets'
                  ? 'bg-accent-blue text-white shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Institutional Presets
            </button>
          </div>
        </div>

        {/* Engine Status & Collapse Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsGeminiModalOpen(true)}
            className="flex items-center gap-1 text-[10.5px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
            title="Configure Frontier AI Engine"
          >
            <Cpu className="h-3 w-3" />
            <span>{aiModel.includes('3.8') ? 'Gemini 3.8 Flash' : aiModel}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPromptStudioOpen(false)}
            className="p-1 text-text-tertiary hover:text-text-primary transition-colors rounded-md hover:bg-bg-elevated"
            title="Collapse studio"
          >
            <Minimize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ═══ Tab 1: Freeform Natural Language Studio ═══ */}
      {activeTab === 'freeform' && (
        <div className="p-3.5 flex flex-col gap-2.5">
          {/* Real-time Semantic Tokenizer HUD */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[10.5px]">
            <span className="text-text-tertiary font-bold uppercase tracking-wider text-[9px] shrink-0 mr-1">
              Live HUD:
            </span>

            {/* Direction */}
            <span className={`px-2 py-0.5 rounded-md font-bold shrink-0 border ${
              analysis.direction === 'SHORT'
                ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                : analysis.direction === 'LONG'
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-bg-elevated text-text-tertiary border-bg-border'
            }`}>
              {analysis.direction === 'SHORT' ? '🔻 SHORT' : analysis.direction === 'LONG' ? '🟢 LONG' : 'Direction: Auto'}
            </span>

            {/* Asset */}
            <span className="px-2 py-0.5 rounded-md font-bold shrink-0 bg-accent-blue/10 text-accent-blue border border-accent-blue/20">
              🪙 {analysis.asset || tradingPair}
            </span>

            {/* Timeframe */}
            <span className="px-2 py-0.5 rounded-md font-bold shrink-0 bg-purple-500/10 text-purple-400 border border-purple-500/20">
              ⏱️ {analysis.timeframe || timeframe}
            </span>

            {/* Indicators */}
            {analysis.indicators.length > 0 ? (
              analysis.indicators.map((ind, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md font-medium shrink-0 bg-bg-elevated text-text-secondary border border-bg-border">
                  📊 {ind}
                </span>
              ))
            ) : (
              <span className="px-2 py-0.5 rounded-md font-medium shrink-0 bg-bg-elevated/60 text-text-tertiary border border-dashed border-bg-border">
                No Indicators Yet
              </span>
            )}

            {/* Leverage */}
            {analysis.leverage && (
              <span className="px-2 py-0.5 rounded-md font-bold shrink-0 bg-amber-500/10 text-amber-400 border border-amber-500/20">
                ⚡ {analysis.leverage}x Lev
              </span>
            )}

            {/* Risk Bracket */}
            {(analysis.stopLoss || analysis.takeProfit) && (
              <span className="px-2 py-0.5 rounded-md font-bold shrink-0 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                🛡️ SL {analysis.stopLoss || 3}% / TP {analysis.takeProfit || 6}%
              </span>
            )}
          </div>

          {/* Prompt Input Box with Quick Action Buttons */}
          <div className="relative flex flex-col rounded-xl border border-bg-border bg-bg-base/80 focus-within:border-accent-blue shadow-inner transition-colors">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Type your strategy in plain English... e.g. 'Buy 50% BTC on 15m when 20 EMA crosses above 50 EMA and RSI < 35, stop loss 2%, take profit 6%, 10x leverage'"
              className={`w-full resize-none bg-transparent p-3 text-[12.5px] text-text-primary outline-none placeholder:text-text-tertiary leading-relaxed ${
                isExpanded ? 'min-h-[100px]' : 'min-h-[64px]'
              }`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleBuild()
                }
              }}
            />

            {/* Textarea Bottom Action Strip */}
            <div className="flex items-center justify-between px-3 py-2 border-t border-bg-border/60 bg-bg-surface/50 rounded-b-xl">
              <div className="flex items-center gap-1.5">
                {/* Voice / Mic Input */}
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    isListening
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-bg-elevated text-text-secondary hover:text-text-primary hover:bg-bg-surface border border-bg-border'
                  }`}
                  title="Speech-to-Strategy Voice Input"
                >
                  {isListening ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                  <span>{isListening ? 'Listening...' : 'Voice Input'}</span>
                </button>

                {/* AI Auto-Enhance Button */}
                <button
                  type="button"
                  onClick={handleAutoEnhance}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/20 border border-accent-blue/30 transition-all"
                  title="Auto-Enhance Prompt with Institutional Risk Safeguards"
                >
                  <Wand2 className="h-3 w-3" />
                  <span>Auto-Enhance</span>
                </button>

                {/* Clear Input */}
                {prompt.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setPrompt("")}
                    className="p-1 text-text-tertiary hover:text-text-primary transition-colors"
                    title="Clear prompt"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Build Button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleBuild()}
                  disabled={isBuilding || !prompt.trim()}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-accent-blue hover:bg-blue-600 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-accent-blue/20 transition-all hover:scale-102"
                >
                  {isBuilding ? (
                    <>
                      <span className="h-3 w-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      <span>Compiling...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-3.5 w-3.5 fill-current" />
                      <span>Compile & Build Strategy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Indicator & Parameter Insertion Chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-[10.5px]">
            <span className="text-text-tertiary font-bold uppercase tracking-wider text-[9px] mr-1">
              Insert Chips:
            </span>
            <button
              type="button"
              onClick={() => appendToken("20 EMA crosses above 50 EMA")}
              className="px-2 py-0.5 rounded-md bg-bg-elevated hover:bg-accent-blue/15 hover:text-accent-blue border border-bg-border text-text-secondary transition-colors"
            >
              + 20/50 EMA Cross
            </button>
            <button
              type="button"
              onClick={() => appendToken("RSI < 30 (Oversold)")}
              className="px-2 py-0.5 rounded-md bg-bg-elevated hover:bg-accent-blue/15 hover:text-accent-blue border border-bg-border text-text-secondary transition-colors"
            >
              + RSI &lt; 30
            </button>
            <button
              type="button"
              onClick={() => appendToken("Price touches lower Bollinger Band")}
              className="px-2 py-0.5 rounded-md bg-bg-elevated hover:bg-accent-blue/15 hover:text-accent-blue border border-bg-border text-text-secondary transition-colors"
            >
              + Bollinger Lower
            </button>
            <button
              type="button"
              onClick={() => appendToken("MACD histogram > 0")}
              className="px-2 py-0.5 rounded-md bg-bg-elevated hover:bg-accent-blue/15 hover:text-accent-blue border border-bg-border text-text-secondary transition-colors"
            >
              + MACD Positive
            </button>
            <button
              type="button"
              onClick={() => appendToken("Volume > 1.5x Volume SMA")}
              className="px-2 py-0.5 rounded-md bg-bg-elevated hover:bg-accent-blue/15 hover:text-accent-blue border border-bg-border text-text-secondary transition-colors"
            >
              + Volume Spike
            </button>
            <button
              type="button"
              onClick={() => appendToken("stop loss 2%, take profit 6%")}
              className="px-2 py-0.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors font-medium"
            >
              + SL 2% / TP 6%
            </button>
            <button
              type="button"
              onClick={() => appendToken("10x leverage")}
              className="px-2 py-0.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors font-medium"
            >
              + 10x Lev
            </button>
            <button
              type="button"
              onClick={() => appendToken("2% trailing stop")}
              className="px-2 py-0.5 rounded-md bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 transition-colors font-medium"
            >
              + 2% Trail Stop
            </button>
          </div>
        </div>
      )}

      {/* ═══ Tab 2: Visual Clause Matrix Mode ═══ */}
      {activeTab === 'builder' && (
        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
              Visual Sentence Assembler:
            </span>
            <button
              type="button"
              onClick={assembleFromMatrix}
              className="flex items-center gap-1 text-xs font-bold text-accent-blue hover:underline"
            >
              <span>Convert to Prompt</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 text-xs">
            {/* Action Side */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-text-tertiary">Action</label>
              <select
                value={builderDirection}
                onChange={(e) => setBuilderDirection(e.target.value as any)}
                className="h-8 rounded-lg border border-bg-border bg-bg-elevated px-2 text-text-primary font-bold outline-none cursor-pointer"
              >
                <option value="BUY">🟢 BUY / LONG</option>
                <option value="SELL">🔻 SHORT / SELL</option>
              </select>
            </div>

            {/* Asset */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-text-tertiary">Instrument</label>
              <select
                value={builderAsset}
                onChange={(e) => setBuilderAsset(e.target.value)}
                className="h-8 rounded-lg border border-bg-border bg-bg-elevated px-2 text-text-primary font-bold outline-none cursor-pointer"
              >
                <option value="BTC/USDT">BTC/USDT</option>
                <option value="ETH/USDT">ETH/USDT</option>
                <option value="SOL/USDT">SOL/USDT</option>
                <option value="NEAR/USDT">NEAR/USDT</option>
                <option value="NVDA">NVDA</option>
              </select>
            </div>

            {/* Timeframe */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-text-tertiary">Timeframe</label>
              <select
                value={builderTimeframe}
                onChange={(e) => setBuilderTimeframe(e.target.value)}
                className="h-8 rounded-lg border border-bg-border bg-bg-elevated px-2 text-accent-blue font-bold outline-none cursor-pointer"
              >
                <option value="1m">1m</option>
                <option value="5m">5m</option>
                <option value="15m">15m</option>
                <option value="1h">1h</option>
                <option value="4h">4h</option>
                <option value="1d">1d</option>
              </select>
            </div>

            {/* Indicator 1 */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-text-tertiary">Trigger Indicator</label>
              <select
                value={builderIndicator1}
                onChange={(e) => setBuilderIndicator1(e.target.value)}
                className="h-8 rounded-lg border border-bg-border bg-bg-elevated px-2 text-text-primary font-medium outline-none cursor-pointer"
              >
                <option value="20 EMA">20 EMA</option>
                <option value="50 EMA">50 EMA</option>
                <option value="Price">Price</option>
                <option value="MACD Line">MACD Line</option>
                <option value="Lower Bollinger">Lower Bollinger</option>
              </select>
            </div>

            {/* Condition */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-text-tertiary">Condition</label>
              <select
                value={builderComparator}
                onChange={(e) => setBuilderComparator(e.target.value)}
                className="h-8 rounded-lg border border-bg-border bg-bg-elevated px-2 text-text-primary font-bold outline-none cursor-pointer"
              >
                <option value="Crosses Above">Crosses Above</option>
                <option value="Crosses Below">Crosses Below</option>
                <option value="Is Greater Than">&gt; (Greater Than)</option>
                <option value="Is Less Than">&lt; (Less Than)</option>
              </select>
            </div>

            {/* Indicator 2 */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-text-tertiary">Target Level</label>
              <select
                value={builderIndicator2}
                onChange={(e) => setBuilderIndicator2(e.target.value)}
                className="h-8 rounded-lg border border-bg-border bg-bg-elevated px-2 text-text-primary font-medium outline-none cursor-pointer"
              >
                <option value="50 EMA">50 EMA</option>
                <option value="200 EMA">200 EMA</option>
                <option value="MACD Signal">MACD Signal</option>
                <option value="Upper Bollinger">Upper Bollinger</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-bg-border">
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-text-tertiary font-bold text-[10px]">Filter:</span>
                <input
                  type="text"
                  value={builderFilter}
                  onChange={(e) => setBuilderFilter(e.target.value)}
                  className="h-7 rounded-md border border-bg-border bg-bg-elevated px-2 text-xs text-text-primary w-28"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-text-tertiary font-bold text-[10px]">Stop Loss:</span>
                <input
                  type="text"
                  value={builderStopLoss}
                  onChange={(e) => setBuilderStopLoss(e.target.value)}
                  className="h-7 rounded-md border border-bg-border bg-bg-elevated px-2 text-xs text-rose-400 font-bold w-16"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-text-tertiary font-bold text-[10px]">Take Profit:</span>
                <input
                  type="text"
                  value={builderTakeProfit}
                  onChange={(e) => setBuilderTakeProfit(e.target.value)}
                  className="h-7 rounded-md border border-bg-border bg-bg-elevated px-2 text-emerald-400 font-bold w-16"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-text-tertiary font-bold text-[10px]">Leverage:</span>
                <input
                  type="text"
                  value={builderLeverage}
                  onChange={(e) => setBuilderLeverage(e.target.value)}
                  className="h-7 rounded-md border border-bg-border bg-bg-elevated px-2 text-amber-400 font-bold w-14"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={assembleFromMatrix}
              className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-accent-blue text-white font-bold text-xs hover:bg-blue-600 transition-all shadow-sm"
            >
              <Zap className="h-3 w-3" />
              <span>Apply & Build</span>
            </button>
          </div>
        </div>
      )}

      {/* ═══ Tab 3: Institutional Presets Library ═══ */}
      {activeTab === 'presets' && (
        <div className="p-3.5 max-h-[260px] overflow-y-auto scrollbar-thin scrollbar-thumb-bg-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PRESET_STRATEGIES.map((cat, cIdx) => (
              <div key={cIdx} className="rounded-xl border border-bg-border bg-bg-base/60 p-2.5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-text-primary">{cat.category}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {cat.items.map((item, iIdx) => (
                    <button
                      key={iIdx}
                      type="button"
                      onClick={() => {
                        setPrompt(item.prompt)
                        setActiveTab('freeform')
                        handleBuild(item.prompt)
                      }}
                      className="flex flex-col text-left rounded-lg border border-bg-border/60 bg-bg-elevated/70 p-2 hover:border-accent-blue hover:bg-bg-elevated transition-all group"
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[11.5px] font-bold text-text-primary group-hover:text-accent-blue transition-colors">
                          {item.title}
                        </span>
                        <Play className="h-2.5 w-2.5 text-accent-blue opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-[10px] text-text-tertiary line-clamp-1">
                        {item.prompt}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Multi-Stage Live Pipeline Progress Bar ═══ */}
      {isBuilding && (
        <div className="px-4 py-2 bg-accent-blue/5 border-t border-accent-blue/20 flex items-center justify-between text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-accent-blue animate-ping" />
            <span className="font-bold text-accent-blue">
              {buildupPipelineStage === 1 && "Stage 1/5: Extracting Semantics & Quant Tokens..."}
              {buildupPipelineStage === 2 && "Stage 2/5: Multi-Factor Risk & Liquidation Audit..."}
              {buildupPipelineStage === 3 && "Stage 3/5: Synthesizing Hierarchical DAG Flowchart..."}
              {buildupPipelineStage === 4 && "Stage 4/5: Compiling Python CCXT & Pine Script..."}
              {buildupPipelineStage === 5 && "Stage 5/5: Running 90-Day Backtest Simulation..."}
              {buildupPipelineStage === 6 && "Stage 6/5: Strategy Ready for Execution!"}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((stg) => (
              <div
                key={stg}
                className={`h-1.5 w-8 rounded-full transition-all ${
                  buildupPipelineStage >= stg
                    ? 'bg-accent-blue'
                    : 'bg-bg-border'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
