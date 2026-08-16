"use client"

import * as React from "react"
import { Send, Sparkles, Loader2, Bot, User, BrainCircuit } from "lucide-react"
import { useBuilderStore } from "@/store/useBuilderStore"

export function AICopilot() {
  const [prompt, setPrompt] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  
  const { chatHistory, addChatMessage, updateStrategy, setNodes, setEdges, setStrategyName, setTradingPair, setAllocation } = useBuilderStore()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [chatHistory, isLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || isLoading) return

    const userPrompt = prompt;
    setPrompt("");
    addChatMessage({ role: 'user', content: userPrompt });
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/parse-strategy", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": "Bearer at_admin_master_secret"
        },
        body: JSON.stringify({ text: userPrompt }),
      })
      
      const data = await response.json()
      
      if (data.status === "NEEDS_CLARIFICATION") {
        addChatMessage({ role: 'assistant', content: data.clarificationMessage });
      } else if (data.status === "SUCCESS") {
        const strat = data.strategy;
        
        if (strat.name) setStrategyName(strat.name);
        if (strat.instruments?.[0]?.symbol) setTradingPair(strat.instruments[0].symbol);
        if (strat.action?.quantityValue) setAllocation(strat.action.quantityValue);
        
        updateStrategy(strat);
        
        const newNodes: any[] = [];
        const newEdges: any[] = [];
        let yPos = 50;
        let sideToggle = -1;

        newNodes.push({ id: 'start', type: 'triggerNode', position: { x: 250, y: yPos }, data: { label: 'Strategy Start' } });
        yPos += 120;

        if (strat.entryConditions?.length) {
          strat.entryConditions.forEach((cond: any, idx: number) => {
            const nodeId = `entry-${idx}`;
            newNodes.push({ 
              id: nodeId, 
              type: 'conditionNode', 
              position: { x: 250 + (sideToggle * 150), y: yPos }, 
              data: { category: 'ENTRY CONDITIONS', label: `Entry Condition`, dslCondition: cond } 
            });
            sideToggle *= -1;
            newEdges.push({ id: `e-${nodeId}`, source: idx === 0 ? 'start' : `entry-${idx-1}`, target: nodeId, animated: true });
            yPos += 120;
          });
        }

        const exec1Id = 'exec-1';
        newNodes.push({ 
          id: exec1Id, 
          type: 'executeNode', 
          position: { x: 250 + (sideToggle * 150), y: yPos }, 
          data: { label: `Execute`, dslAction: strat.action } 
        });
        sideToggle *= -1;
        const lastEntryNode = strat.entryConditions?.length ? `entry-${strat.entryConditions.length - 1}` : 'start';
        newEdges.push({ id: `e-${exec1Id}`, source: lastEntryNode, target: exec1Id, animated: true });
        yPos += 120;

        if (strat.exitConditions?.length) {
          strat.exitConditions.forEach((cond: any, idx: number) => {
            const nodeId = `exit-${idx}`;
            newNodes.push({ 
              id: nodeId, 
              type: 'conditionNode', 
              position: { x: 250 + (sideToggle * 150), y: yPos }, 
              data: { category: 'EXIT CONDITIONS', label: `Exit Condition`, dslCondition: cond } 
            });
            sideToggle *= -1;
            newEdges.push({ id: `e-${nodeId}`, source: idx === 0 ? exec1Id : `exit-${idx-1}`, target: nodeId, animated: true });
            yPos += 120;
          });
        }

        if (strat.riskParameters && (strat.riskParameters.stopLossPercentage || strat.riskParameters.takeProfitPercentage)) {
            const riskId = 'risk-1';
            newNodes.push({ 
              id: riskId, 
              type: 'riskNode', 
              position: { x: 250, y: yPos }, 
              data: { label: `Risk Controls`, dslRisk: strat.riskParameters } 
            });
            const lastExitNode = strat.exitConditions?.length ? `exit-${strat.exitConditions.length - 1}` : exec1Id;
            newEdges.push({ id: `e-${riskId}`, source: lastExitNode, target: riskId, animated: true });
            yPos += 120;
        }

        const animateBuild = async () => {
          setNodes([]);
          setEdges([]);
          for (let i = 0; i < newNodes.length; i++) {
            await new Promise(r => setTimeout(r, 300));
            setNodes((prev) => {
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
          addChatMessage({ role: 'assistant', content: "Strategy graph built successfully. Code, indicators, and exchange rules updated." });
        };
        
        animateBuild();
      }
    } catch (error) {
      addChatMessage({ role: 'assistant', content: "Sorry, I encountered an error while processing that." });
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-full w-[260px] shrink-0 flex-col border-r border-bg-border bg-bg-surface">
      <div className="flex h-[46px] items-center justify-between border-b border-bg-border px-3">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-4 w-4 text-accent-blue" />
          <h3 className="text-[13px] font-bold text-text-primary">AI Copilot</h3>
        </div>
        <span className="rounded bg-accent-green/10 px-1.5 py-0.2 text-[9.5px] font-bold text-accent-green border border-accent-green/20">
          PRO
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-bg-border">
        <div className="flex flex-col gap-4">
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${msg.role === 'user' ? 'bg-bg-elevated' : 'bg-accent-blue/10 text-accent-blue'}`}>
                {msg.role === 'user' ? <User className="h-3.5 w-3.5 text-text-secondary" /> : <Bot className="h-3.5 w-3.5" />}
              </div>
              <div className={`flex max-w-[85%] flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-2xl px-3 py-2 text-[12.5px] ${msg.role === 'user' ? 'bg-accent-blue text-white rounded-tr-sm' : 'bg-bg-elevated text-text-primary rounded-tl-sm border border-bg-border'}`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-blue/10 text-accent-blue">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div className="flex items-center rounded-2xl rounded-tl-sm border border-bg-border bg-bg-elevated px-3 py-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-text-secondary" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-3 border-t border-bg-border bg-bg-base">
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
          <div className="absolute left-2.5 top-3 text-accent-blue">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type strategy prompt..."
            className="min-h-[44px] max-h-[120px] w-full resize-none rounded-xl border border-bg-border bg-bg-surface pl-8 pr-10 pt-2.5 text-[12.5px] text-text-primary outline-none placeholder:text-text-tertiary focus:border-accent-blue transition-all"
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
            className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-accent-blue text-white disabled:opacity-50 transition-colors hover:bg-blue-600 shadow-sm"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  )
}
