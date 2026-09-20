"use client"

import * as React from "react"
import { Send, Sparkles, Loader2, Zap, ChevronDown, ChevronUp } from "lucide-react"
import { useBuilderStore } from "@/store/useBuilderStore"
import { toast } from "sonner"

const PROMPT_PRESETS = [
  {
    label: "⚡ 15m Trend Pullback (10x)",
    prompt: "Buy ETH when 20 EMA crosses above 50 EMA on 15m and RSI < 35 and Volume > 1.5x SMA, stop loss 2.5%, take profit 6%, 10x leverage",
  },
  {
    label: "🌊 SOL Bollinger Mean Reversion",
    prompt: "Long SOL when price is below lower Bollinger Band and RSI < 30, exit when price reaches upper Bollinger Band, stop loss 3%, 15% allocation",
  },
  {
    label: "📉 BTC 5x Futures Short Momentum",
    prompt: "Go short BTC when 50 EMA crosses below 200 EMA and MACD histogram < 0, exit when RSI < 30 or 3% trailing stop, allocate 40% with 5x leverage",
  },
  {
    label: "🎯 1h Supertrend + ADX Breakout",
    prompt: "Buy BTC when 1h Supertrend is bullish and ADX > 25, exit when price drops 4% or 24 hours, stop loss 2%, take profit 8%, 5x leverage",
  },
  {
    label: "EMA 9/21 Trend Scalp (BTC)",
    prompt: "Buy BTC when 9 EMA crosses above 21 EMA on 5m, RSI < 45. Stop loss 1.5%, take profit 4%, 10x leverage."
  },
  {
    label: "Bollinger Squeeze Reversion (ETH)",
    prompt: "Long ETH when price touches lower Bollinger Band and RSI < 30 on 15m. Stop loss 2%, take profit 5%, 5x leverage."
  },
  {
    label: "Golden Cross 50/200 (SOL)",
    prompt: "When 50 EMA crosses above 200 EMA on 1h buy SOL with 5x leverage, 3% trailing stop, take profit 10%."
  },
  {
    label: "Short Momentum Breakdown (DOGE)",
    prompt: "Short DOGE when 20 EMA crosses below 50 EMA on 15m and MACD histogram < 0. Stop loss 2%, take profit 6%, 5x leverage."
  },
  {
    label: "Supertrend + ATR Trailing (AVAX)",
    prompt: "Buy AVAX when price is above Supertrend on 15m with 2% ATR trailing stop and 5x leverage."
  }
]

export function StrategyPrompt() {
  const [prompt, setPrompt] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [showPresets, setShowPresets] = React.useState(true)
  
  const { executeFullEndToEndBuild } = useBuilderStore()
  
  const handleExecute = async (text: string) => {
    if (!text.trim() || isLoading) return

    setIsLoading(true)
    
    try {
      await executeFullEndToEndBuild(text)
      setPrompt("")
    } catch (error: any) {
      console.error("Error executing strategy build:", error)
      toast.error(error?.message || "Failed to parse and build quant strategy")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleExecute(prompt)
  }

  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 z-40">
      <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-[#0c1017]/90 backdrop-blur-xl p-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.6)] ring-1 ring-white/5">
        
        {/* Preset Chips Bar */}
        <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-accent-blue">
            <Zap className="h-3.5 w-3.5" />
            <span>Single-Prompt Institutional Strategies</span>
          </div>
          <button 
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="flex items-center gap-1 text-[11px] text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
          >
            <span>{showPresets ? 'Hide' : 'Presets'}</span>
            {showPresets ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>

        {showPresets && (
          <div className="flex flex-wrap gap-1.5 py-1">
            {PROMPT_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPrompt(preset.prompt)
                  handleExecute(preset.prompt)
                }}
                disabled={isLoading}
                className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-text-secondary hover:border-accent-blue/50 hover:bg-accent-blue/10 hover:text-white transition-all text-left truncate max-w-[230px] cursor-pointer"
                title={preset.prompt}
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <div className="absolute left-3 text-accent-blue">
            <Sparkles className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type any complete strategy (e.g. Go short BTC when 50 EMA crosses below 200 EMA, 3% trailing stop, 5x leverage)..."
            className="h-11 w-full rounded-xl border border-white/10 bg-bg-surface/80 pl-9 pr-28 text-[13px] text-text-primary outline-none placeholder:text-text-tertiary focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all"
            disabled={isLoading}
          />
          <div className="absolute right-1.5 flex items-center gap-1.5">
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="flex h-8 items-center gap-1.5 rounded-lg bg-accent-blue px-3 text-[12px] font-bold text-white shadow-sm hover:bg-blue-600 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Building...</span>
                </>
              ) : (
                <>
                  <Send className="h-3 w-3" />
                  <span>Build</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
