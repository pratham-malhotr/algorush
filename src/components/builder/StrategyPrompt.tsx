"use client"

import * as React from "react"
import { Send, Sparkles, Loader2, AlertCircle } from "lucide-react"
import { useBuilderStore } from "@/store/useBuilderStore"

export function StrategyPrompt() {
  const [prompt, setPrompt] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [clarification, setClarification] = React.useState<string | null>(null)
  
  const updateStrategy = useBuilderStore(state => state.updateStrategy)
  const setNodes = useBuilderStore(state => state.setNodes)
  const setEdges = useBuilderStore(state => state.setEdges)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setIsLoading(true)
    setClarification(null)
    
    try {
      const response = await fetch("/api/parse-strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: prompt }),
      })
      
      const data = await response.json()
      
      if (data.status === "NEEDS_CLARIFICATION") {
        setClarification(data.clarificationMessage)
      } else if (data.status === "SUCCESS") {
        // Map DSL to ReactFlow nodes and update store
        const strat = data.strategy;
        updateStrategy(strat);
        
        const newNodes = [
          { id: 'start', type: 'triggerNode', position: { x: 250, y: 50 }, data: { label: 'Start Strategy' } },
          { id: 'cond1', type: 'conditionNode', position: { x: 250, y: 150 }, data: { category: 'technical', label: `Entry: ${strat.entryConditions?.[0]?.type || 'Custom'}` } },
          { id: 'exec1', type: 'executeNode', position: { x: 250, y: 250 }, data: { label: `Buy ${strat.assets?.[0] || 'Asset'}` } },
          { id: 'cond2', type: 'conditionNode', position: { x: 250, y: 350 }, data: { category: 'risk', label: `Exit: ${strat.exitConditions?.[0]?.type || 'Custom'}` } },
          { id: 'exec2', type: 'executeNode', position: { x: 250, y: 450 }, data: { label: `Close Position` } },
        ];
        
        const newEdges = [
          { id: 'e1', source: 'start', target: 'cond1', animated: true },
          { id: 'e2', source: 'cond1', target: 'exec1', animated: true },
          { id: 'e3', source: 'exec1', target: 'cond2', animated: true },
          { id: 'e4', source: 'cond2', target: 'exec2', animated: true },
        ];
        
        setNodes(newNodes);
        setEdges(newEdges);

        setPrompt("") // clear on success
      } else {
        console.error("Unknown response", data)
      }
    } catch (error) {
      console.error("Error parsing strategy", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50">
      <div className="flex flex-col gap-2 rounded-xl border border-bg-border bg-bg-surface/90 backdrop-blur-md p-4 shadow-2xl">
        
        {clarification && (
          <div className="flex items-start gap-3 rounded-lg bg-accent-blue/10 p-3 text-[14px] text-accent-blue">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{clarification}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
          <div className="absolute left-3 top-3.5 text-accent-blue">
            <Sparkles className="h-5 w-5" />
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your strategy... e.g. 'Buy 50 AAPL if RSI drops below 30, with a 3% stop loss'"
            className="min-h-[52px] max-h-[150px] w-full resize-none rounded-lg bg-transparent pl-10 pr-[60px] pt-3.5 text-[15px] text-text-primary outline-none placeholder:text-text-tertiary"
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
            className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-md bg-accent-blue text-white disabled:opacity-50 transition-colors hover:bg-blue-600"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </form>
      </div>
    </div>
  )
}
