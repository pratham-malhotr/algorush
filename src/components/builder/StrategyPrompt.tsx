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
        
        const newNodes: any[] = [];
        const newEdges: any[] = [];
        let yPos = 50;
        let sideToggle = -1; // -1 for left, 1 for right

        // 1. Start Node
        newNodes.push({ id: 'start', type: 'triggerNode', position: { x: 250, y: yPos }, data: { label: 'Strategy Start' } });
        yPos += 120; // Increased vertical spacing for curved edges

        // 2. Entry Conditions
        if (strat.entryConditions?.length) {
          strat.entryConditions.forEach((cond: any, idx: number) => {
            const nodeId = `entry-${idx}`;
            newNodes.push({ 
              id: nodeId, 
              type: 'conditionNode', 
              position: { x: 250 + (sideToggle * 150), y: yPos }, 
              data: { category: 'technical', label: `If ${cond.left?.type} == ${cond.right}` } 
            });
            sideToggle *= -1;
            newEdges.push({ id: `e-${nodeId}`, source: idx === 0 ? 'start' : `entry-${idx-1}`, target: nodeId, animated: true });
            yPos += 120;
          });
        }

        // 3. Entry Action
        const exec1Id = 'exec-1';
        newNodes.push({ 
          id: exec1Id, 
          type: 'executeNode', 
          position: { x: 250 + (sideToggle * 150), y: yPos }, 
          data: { label: `${strat.action?.type} ${strat.action?.quantityValue || ''} ${strat.instruments?.[0]?.symbol || 'Asset'}` } 
        });
        sideToggle *= -1;
        const lastEntryNode = strat.entryConditions?.length ? `entry-${strat.entryConditions.length - 1}` : 'start';
        newEdges.push({ id: `e-${exec1Id}`, source: lastEntryNode, target: exec1Id, animated: true });
        yPos += 120;

        // 4. Exit Conditions
        if (strat.exitConditions?.length) {
          strat.exitConditions.forEach((cond: any, idx: number) => {
            const nodeId = `exit-${idx}`;
            newNodes.push({ 
              id: nodeId, 
              type: 'conditionNode', 
              position: { x: 250 + (sideToggle * 150), y: yPos }, 
              data: { category: 'risk', label: `If ${cond.left?.type} == ${cond.right}` } 
            });
            sideToggle *= -1;
            newEdges.push({ id: `e-${nodeId}`, source: idx === 0 ? exec1Id : `exit-${idx-1}`, target: nodeId, animated: true });
            yPos += 120;
          });
        }

        // 5. Exit Action (Centered anchor)
        const exec2Id = 'exec-2';
        newNodes.push({ 
          id: exec2Id, 
          type: 'executeNode', 
          position: { x: 250, y: yPos }, 
          data: { label: `SELL/CLOSE POSITION` } 
        });
        const lastExitNode = strat.exitConditions?.length ? `exit-${strat.exitConditions.length - 1}` : exec1Id;
        newEdges.push({ id: `e-${exec2Id}`, source: lastExitNode, target: exec2Id, animated: true });
        
        const animateBuild = async () => {
          setNodes([]);
          setEdges([]);
          for (let i = 0; i < newNodes.length; i++) {
            await new Promise(r => setTimeout(r, 500));
            setNodes((prev) => {
              // Prevent duplicates if multiple clicks happen
              if (prev.find(n => n.id === newNodes[i].id)) return prev;
              return [...prev, newNodes[i]];
            });
            if (i > 0) {
              setEdges((prev) => {
                if (prev.find(e => e.id === newEdges[i - 1].id)) return prev;
                return [...prev, newEdges[i - 1]];
              });
            }
          }
        };
        animateBuild();

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
            placeholder="Type your strategy... e.g. 'Buy 50 BTC if RSI drops below 30, with a 3% stop loss'"
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
