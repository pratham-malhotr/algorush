"use client"

import * as React from "react"
import { Send, Sparkles, Loader2, Bot, User, BrainCircuit } from "lucide-react"
import { useBuilderStore } from "@/store/useBuilderStore"
import { generateMockData, runLocalBacktest } from "@/lib/backtester/engine"
import { toast } from "sonner"

export function AICopilot() {
  const [prompt, setPrompt] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  
  const { 
    chatHistory, 
    addChatMessage, 
    updateStrategy, 
    setNodes, 
    setEdges, 
    setStrategyName, 
    setTradingPair, 
    setTimeframe,
    setAllocation, 
    setIsAnimatingBuild, 
    setBacktestResult
  } = useBuilderStore()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [chatHistory, isLoading])

  const executeStrategyBuild = async (textToParse: string) => {
    if (!textToParse.trim() || isLoading) return

    addChatMessage({ role: 'user', content: textToParse })
    setIsLoading(true)
    
    try {
      const response = await fetch("/api/parse-strategy", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": "Bearer at_admin_master_secret"
        },
        body: JSON.stringify({ text: textToParse }),
      })
      
      const data = await response.json()
      
      if (data.status === "NEEDS_CLARIFICATION") {
        addChatMessage({ role: 'assistant', content: data.clarificationMessage })
      } else if (data.status === "SUCCESS") {
        const strat = data.strategy
        
        if (strat.name) setStrategyName(strat.name)
        if (strat.instruments?.[0]?.symbol) setTradingPair(strat.instruments[0].symbol)
        if (strat.timeframe) setTimeframe(strat.timeframe)
        if (strat.action?.quantityValue) setAllocation(strat.action.quantityValue)
        
        // Format condition labels for canvas nodes
        const fmtLabel = (cond: any): string => {
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
              position: { x: 250 + (sideToggle * 120), y: yPos }, 
              data: { category: 'ENTRY CONDITIONS', label: fmtLabel(cond), dslCondition: cond } 
            })
            sideToggle *= -1
            newEdges.push({ id: `e-${nodeId}`, source: idx === 0 ? 'start' : `entry-${idx-1}`, target: nodeId, animated: true })
            yPos += 130
          })
        }

        // 3. Execution Node
        const exec1Id = 'exec-1'
        const isShort = strat.action?.type === 'SELL'
        newNodes.push({ 
          id: exec1Id, 
          type: 'executeNode', 
          position: { x: 250, y: yPos }, 
          data: { 
            label: `${isShort ? 'SHORT' : 'BUY'} ${strat.action?.quantityValue || 50}%`, 
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
              position: { x: 250 + (sideToggle * 120), y: yPos }, 
              data: { category: 'EXIT CONDITIONS', label: fmtLabel(cond), dslCondition: cond } 
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

        const animateBuild = async () => {
          setIsAnimatingBuild(true)
          setNodes([])
          setEdges([])
          for (let i = 0; i < newNodes.length; i++) {
            await new Promise(r => setTimeout(r, 240))
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
            content: summaryText
          })
          toast.success(`Generated: ${strat.name}`)
        }
        
        animateBuild()
      }
    } catch (error) {
      addChatMessage({ role: 'assistant', content: "Sorry, I encountered an error while processing that strategy prompt." })
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

  return (
    <div className="flex h-full w-[270px] shrink-0 flex-col border-r border-bg-border bg-bg-surface">
      <div className="flex h-[46px] items-center justify-between border-b border-bg-border px-3">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-4 w-4 text-accent-blue" />
          <h3 className="text-[13px] font-bold text-text-primary">AI Copilot</h3>
        </div>
        <span className="rounded bg-accent-green/10 px-1.5 py-0.5 text-[9.5px] font-bold text-accent-green border border-accent-green/20">
          PRO VIP
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-bg-border">
        <div className="flex flex-col gap-3">
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${msg.role === 'user' ? 'bg-bg-elevated' : 'bg-accent-blue/10 text-accent-blue'}`}>
                {msg.role === 'user' ? <User className="h-3 w-3 text-text-secondary" /> : <Bot className="h-3 w-3" />}
              </div>
              <div className={`flex max-w-[88%] flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-xl px-2.5 py-2 text-[12px] whitespace-pre-line leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-accent-blue text-white rounded-tr-sm' 
                    : 'bg-bg-elevated text-text-primary rounded-tl-sm border border-bg-border shadow-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-blue/10 text-accent-blue">
                <Bot className="h-3 w-3" />
              </div>
              <div className="flex items-center gap-2 rounded-xl rounded-tl-sm border border-bg-border bg-bg-elevated px-3 py-2 text-[11.5px] text-text-secondary">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-accent-blue" />
                <span>Compiling quantitative strategy...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-2.5 border-t border-bg-border bg-bg-base">
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
          <div className="absolute left-2.5 top-3 text-accent-blue">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type any strategy... (e.g. 5m EMA cross with 10x leverage)"
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
      </div>
    </div>
  )
}
