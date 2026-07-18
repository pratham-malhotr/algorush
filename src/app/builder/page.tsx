"use client"

import * as React from "react"
import { useBuilderStore } from "@/store/useBuilderStore"
import { usePaperTradingStore } from "@/store/usePaperTradingStore"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, ShieldAlert, FlaskConical, Globe, Code2 } from "lucide-react"
import { SettingsPanel } from "@/components/builder/SettingsPanel"
import { BacktestDrawer } from "@/components/builder/BacktestDrawer"
import { AICopilot } from "@/components/builder/AICopilot"
import { CodeViewer } from "@/components/builder/CodeViewer"
import dynamic from "next/dynamic"

const StrategyCanvas = dynamic(
  () => import("@/components/builder/StrategyCanvas").then((mod) => mod.StrategyCanvas),
  { ssr: false, loading: () => <div className="flex-1 h-full w-full bg-[#070A0D] flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-bg-border border-t-accent-blue" /></div> }
)

export default function BuilderPage() {
  const { strategyName, strategyStatus, isBacktesting, runBacktest, strategyDSL, setStrategyStatus } = useBuilderStore()
  const { haltAllTrading } = usePaperTradingStore()
  const [showCode, setShowCode] = React.useState(true)

  return (
    <div className="flex h-[calc(100vh-64px)] w-full flex-col bg-bg-base overflow-hidden">
      {/* Top Action Bar */}
      <div className="flex h-[52px] w-full shrink-0 items-center justify-between border-b border-bg-border bg-bg-surface px-4">
        <div className="flex items-center gap-4">
          <input 
            type="text" 
            defaultValue={strategyName} 
            className="bg-transparent text-[16px] font-semibold text-text-primary outline-none hover:bg-black/5 focus:bg-black/5 px-2 py-1 rounded"
          />
          <Badge variant={strategyStatus.toLowerCase() as any}>{strategyStatus}</Badge>
          
          {/* Simulation Toggle */}
          <div className="flex items-center ml-4 rounded-md bg-bg-elevated p-1 border border-bg-border">
            <button className="flex items-center gap-2 rounded px-3 py-1 text-[12px] font-medium text-accent-blue bg-accent-blue/10">
              <FlaskConical className="h-3 w-3" />
              Paper Trading
            </button>
            <button className="flex items-center gap-2 rounded px-3 py-1 text-[12px] font-medium text-text-secondary hover:text-text-primary">
              Live
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            className={`text-[13px] h-8 ${showCode ? 'bg-black/10 text-accent-blue' : 'text-text-secondary'}`}
            onClick={() => setShowCode(!showCode)}
          >
            <Code2 className="h-4 w-4 mr-2" />
            Code View
          </Button>
          <div className="h-4 w-px bg-bg-border mx-1" />
          <Button 
            variant="ghost" 
            className="text-[13px] h-8 text-accent-red hover:bg-accent-red/10 hover:text-accent-red"
            onClick={async () => {
              try {
                await fetch('/api/kill-switch', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'engage' })
                });
                setStrategyStatus('Paused');
                haltAllTrading();
                alert('CRITICAL: Kill Switch Engaged. All trading halted.');
              } catch (e) {
                alert('Error engaging Kill Switch!');
              }
            }}
          >
            <ShieldAlert className="h-4 w-4 mr-2" />
            Kill Switch
          </Button>
          <div className="h-4 w-px bg-bg-border mx-1" />
          <Button variant="ghost" className="text-[13px] h-8">Save Draft</Button>
          <Button 
            variant="ghost" 
            className="text-[13px] h-8 border-accent-blue/30 text-accent-blue hover:bg-accent-blue/10"
            onClick={() => {
              if (strategyDSL) {
                alert("Submitting strategy to marketplace for 30-day live validation...\nOnce verified, it will appear publicly.");
              } else {
                alert("Build a strategy first!");
              }
            }}
          >
            <Globe className="h-4 w-4 mr-2" />
            Publish
          </Button>
          <Button 
            variant="secondary" 
            className="text-[13px] h-8 flex items-center gap-2"
            onClick={runBacktest}
            disabled={isBacktesting || !strategyDSL}
          >
            {isBacktesting ? (
              <span className="h-4 w-4 rounded-full border-2 border-text-secondary border-t-accent-blue animate-spin" />
            ) : (
              <Play className="h-3 w-3" />
            )}
            Backtest
          </Button>
          <Button 
            variant="primary" 
            className="text-[13px] h-8 flex items-center gap-2"
            onClick={() => {
              if (strategyDSL) {
                alert("Strategy deployed to Alpaca Paper Trading environment successfully!\nYou can monitor it on your Dashboard.");
              } else {
                alert("Build a strategy first!");
              }
            }}
            disabled={!strategyDSL}
          >
            <Play className="h-4 w-4" />
            Deploy Live
          </Button>
        </div>
      </div>

      {/* 3-Panel Split IDE Style */}
      <div className="flex flex-1 overflow-hidden relative">
        <AICopilot />
        
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 relative">
            <StrategyCanvas />
          </div>
          {showCode && (
            <div className="h-[40%] min-h-[250px] border-t border-bg-border">
              <CodeViewer />
            </div>
          )}
        </div>

        <SettingsPanel />
        
        {/* Absolute positioned drawer */}
        <BacktestDrawer />
      </div>
    </div>
  )
}
