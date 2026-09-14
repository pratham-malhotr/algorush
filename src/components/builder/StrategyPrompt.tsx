"use client"

import * as React from "react"
import { Send, Sparkles, Loader2, AlertCircle, Zap, ChevronDown, ChevronUp, Layers } from "lucide-react"
import { useBuilderStore } from "@/store/useBuilderStore"
import { generateMockData, runLocalBacktest } from "@/lib/backtester/engine"
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
    label: "💎 NVDA Donchian Channel Breakout",
    prompt: "Breakout strategy for NVDA: Buy when price breaks 20 period Donchian high, exit on 10 period Donchian low or 3% trailing stop, allocate $5000",
  }
]

// Format a human-readable label from a DSL condition
function formatConditionLabel(cond: any): string {
  const leftStr = cond.left?.type || 'PRICE'
  const period = cond.left?.parameters?.period
  const leftLabel = period ? `${period} ${leftStr}` : leftStr
  
  const compMap: Record<string, string> = {
    GREATER_THAN: '>',
    LESS_THAN: '<',
    EQUAL: '==',
    CROSSES_ABOVE: 'Crosses Above',
    CROSSES_BELOW: 'Crosses Below',
    GREATER_THAN_OR_EQUAL: '>=',
    LESS_THAN_OR_EQUAL: '<='
  }
  const comp = compMap[cond.comparator] || cond.comparator

  let rightLabel = ''
  if (typeof cond.right === 'object' && cond.right !== null && cond.right.type) {
    const rp = cond.right.parameters?.period
    rightLabel = rp ? `${rp} ${cond.right.type}` : cond.right.type
  } else {
    rightLabel = String(cond.right ?? '')
  }

  return `${leftLabel} ${comp} ${rightLabel}`
}

export function StrategyPrompt() {
  const [prompt, setPrompt] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [clarification, setClarification] = React.useState<string | null>(null)
  const [showPresets, setShowPresets] = React.useState(true)
  
  const { 
    updateStrategy, 
    setNodes, 
    setEdges, 
    setStrategyName, 
    setTradingPair, 
    setTimeframe,
    setAllocation, 
    setIsAnimatingBuild,
    setBacktestResult,
    addChatMessage,
    aiModel,
    geminiApiKey,
    setIsGeminiModalOpen
  } = useBuilderStore()
  
  const handleExecute = async (text: string) => {
    if (!text.trim() || isLoading) return

    setIsLoading(true)
    setClarification(null)
    
    try {
      const response = await fetch("/api/parse-strategy", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": "Bearer at_admin_master_secret",
          ...(geminiApiKey ? { "x-gemini-api-key": geminiApiKey } : {})
        },
        body: JSON.stringify({ text, model: aiModel, apiKey: geminiApiKey }),
      })
      
      const data = await response.json()
      
      if (data.status === "CONVERSATIONAL") {
        addChatMessage({ 
          role: 'assistant', 
          content: data.conversationalResponse || "Here is the quantitative analysis you requested.",
          metadata: { 
            isAi: data.isAi, 
            modelUsed: data.modelUsed,
            reasoning: data.reasoning,
            riskAssessment: data.riskAssessment,
            suggestedTweaks: data.suggestedTweaks,
            latencyMs: data.latencyMs,
            verificationAudit: data.verificationAudit
          }
        })
        setPrompt("")
        return
      } else if (data.status === "NEEDS_CLARIFICATION") {
        setClarification(data.clarificationMessage)
        addChatMessage({ 
          role: 'assistant', 
          content: data.clarificationMessage,
          metadata: { isAi: data.isAi, modelUsed: data.modelUsed }
        })
      } else if (data.status === "SUCCESS") {
        const strat = data.strategy

        // Update strategy metadata
        if (strat.name) setStrategyName(strat.name)
        if (strat.instruments?.[0]?.symbol) setTradingPair(strat.instruments[0].symbol)
        if (strat.timeframe) setTimeframe(strat.timeframe)
        if (strat.action?.quantityValue) setAllocation(strat.action.quantityValue)
        
        const newNodes: any[] = []
        const newEdges: any[] = []
        let yPos = 40
        let sideToggle = -1

        // 1. Start Node
        newNodes.push({ id: 'start', type: 'triggerNode', position: { x: 250, y: yPos }, data: { label: 'Strategy Start' } })
        yPos += 130

        // 2. Entry Conditions
        if (strat.entryConditions?.length) {
          strat.entryConditions.forEach((cond: any, idx: number) => {
            const nodeId = `entry-${idx}`
            newNodes.push({ 
              id: nodeId, 
              type: 'conditionNode', 
              position: { x: 250 + (sideToggle * 130), y: yPos }, 
              data: { 
                category: 'ENTRY CONDITIONS', 
                label: formatConditionLabel(cond),
                dslCondition: cond
              } 
            })
            sideToggle *= -1
            newEdges.push({ id: `e-${nodeId}`, source: idx === 0 ? 'start' : `entry-${idx-1}`, target: nodeId, animated: true })
            yPos += 130
          })
        }

        // 3. Entry Action
        const exec1Id = 'exec-1'
        const isShort = strat.action?.type === 'SELL'
        newNodes.push({ 
          id: exec1Id, 
          type: 'executeNode', 
          position: { x: 250, y: yPos }, 
          data: { 
            label: `${isShort ? 'SHORT' : 'BUY'} ${strat.action?.quantityValue || 50}% ${strat.instruments?.[0]?.symbol || 'Asset'}`,
            dslAction: strat.action
          } 
        })
        const lastEntryNode = strat.entryConditions?.length ? `entry-${strat.entryConditions.length - 1}` : 'start'
        newEdges.push({ id: `e-${exec1Id}`, source: lastEntryNode, target: exec1Id, animated: true })
        yPos += 130

        // 4. Exit Conditions
        if (strat.exitConditions?.length) {
          strat.exitConditions.forEach((cond: any, idx: number) => {
            const nodeId = `exit-${idx}`
            newNodes.push({ 
              id: nodeId, 
              type: 'conditionNode', 
              position: { x: 250 + (sideToggle * 130), y: yPos }, 
              data: { 
                category: 'EXIT CONDITIONS', 
                label: formatConditionLabel(cond),
                dslCondition: cond
              } 
            })
            sideToggle *= -1
            newEdges.push({ id: `e-${nodeId}`, source: idx === 0 ? exec1Id : `exit-${idx-1}`, target: nodeId, animated: true })
            yPos += 130
          })
        }

        // 5. Risk Node
        let lastNode = strat.exitConditions?.length ? `exit-${strat.exitConditions.length - 1}` : exec1Id
        if (strat.riskParameters && (strat.riskParameters.stopLossPercentage || strat.riskParameters.takeProfitPercentage)) {
          const riskId = 'risk-1'
          newNodes.push({ 
            id: riskId, 
            type: 'riskNode', 
            position: { x: 250, y: yPos }, 
            data: { 
              label: `Risk Bracket (SL ${strat.riskParameters.stopLossPercentage || 3}% / TP ${strat.riskParameters.takeProfitPercentage || 6}%)`,
              dslRisk: strat.riskParameters
            } 
          })
          newEdges.push({ id: `e-${riskId}`, source: lastNode, target: riskId, animated: true })
        }
        
        // Animate build with guard flag
        const animateBuild = async () => {
          setIsAnimatingBuild(true)
          setNodes([])
          setEdges([])
          for (let i = 0; i < newNodes.length; i++) {
            await new Promise(r => setTimeout(r, 220))
            setNodes((prev) => {
              if (prev.find(n => n.id === newNodes[i].id)) return prev
              return [...prev, newNodes[i]]
            })
            if (i > 0) {
              setEdges((prev) => {
                if (prev.find(e => e.id === newEdges[i - 1].id)) return prev
                return [...prev, newEdges[i - 1]]
              })
            }
          }
          setIsAnimatingBuild(false)
          updateStrategy(strat)
          
          const freshData = generateMockData(90)
          const freshResult = runLocalBacktest(strat, freshData)
          setBacktestResult(freshResult)

          const isShortSide = strat.action?.type === 'SELL'
          const entryCount = strat.entryConditions?.length || 0
          const exitCount = strat.exitConditions?.length || 0
          const sl = strat.riskParameters?.stopLossPercentage
          const tp = strat.riskParameters?.takeProfitPercentage
          const trail = strat.riskParameters?.trailingStopPercentage
          const lev = strat.action?.leverage || strat.riskParameters?.leverage || 1

          const summaryText = `✅ **${strat.name}**\n• Direction: **${isShortSide ? '🔻 Short / Sell' : '🟢 Long / Buy'}** (${lev}x Lev)\n• Asset: **${strat.instruments?.[0]?.symbol || 'BTC/USDT'}** | Timeframe: **${strat.timeframe || '1h'}**\n• Entry Rules: **${entryCount} condition${entryCount > 1 ? 's' : ''}**\n• Exit Rules: **${exitCount} condition${exitCount > 1 ? 's' : ''}**\n• Risk: **SL ${sl}% | TP ${tp}%${trail ? ` | Trail ${trail}%` : ''}**`

          addChatMessage({ 
            role: 'assistant', 
            content: summaryText,
            metadata: {
              modelUsed: data.modelUsed,
              isAi: data.isAi,
              reasoning: data.reasoning,
              riskAssessment: data.riskAssessment,
              suggestedTweaks: data.suggestedTweaks,
              strategy: strat,
              latencyMs: data.latencyMs,
              needsApiKey: data.needsApiKey,
              fallbackReason: data.fallbackReason,
              verificationAudit: data.verificationAudit,
            }
          })
          toast.success(`Quant Strategy Built: ${strat.name}`)
        }
        animateBuild()
        setPrompt("")
      }
    } catch (error) {
      console.error("Error parsing strategy", error)
      toast.error("Failed to parse quant strategy")
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
            className="flex items-center gap-1 text-[11px] text-text-tertiary hover:text-text-primary transition-colors"
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
                className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-text-secondary hover:border-accent-blue/50 hover:bg-accent-blue/10 hover:text-white transition-all text-left truncate max-w-[230px]"
                title={preset.prompt}
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}

        {clarification && (
          <div className="flex items-start gap-2.5 rounded-lg bg-accent-blue/10 border border-accent-blue/20 p-2.5 text-[12.5px] text-accent-blue">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>{clarification}</p>
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
              className="flex h-8 items-center gap-1.5 rounded-lg bg-accent-blue px-3 text-[12px] font-bold text-white shadow-sm hover:bg-blue-600 disabled:opacity-50 transition-colors"
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

