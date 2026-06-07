"use client"

import * as React from "react"
import { useBuilderStore } from "@/store/useBuilderStore"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"
import { BlockLibrary } from "@/components/builder/BlockLibrary"
import { SettingsPanel } from "@/components/builder/SettingsPanel"
import { BacktestDrawer } from "@/components/builder/BacktestDrawer"
import dynamic from "next/dynamic"

const StrategyCanvas = dynamic(
  () => import("@/components/builder/StrategyCanvas").then((mod) => mod.StrategyCanvas),
  { ssr: false, loading: () => <div className="flex-1 h-full w-full bg-[#070A0D] flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-bg-border border-t-accent-blue" /></div> }
)

export default function BuilderPage() {
  const { strategyName, strategyStatus, isBacktesting, runBacktest } = useBuilderStore()

  return (
    <div className="flex h-[calc(100vh-64px)] w-full flex-col bg-bg-base overflow-hidden">
      {/* Top Action Bar */}
      <div className="flex h-[52px] w-full shrink-0 items-center justify-between border-b border-bg-border bg-[#0F1318] px-4">
        <div className="flex items-center gap-4">
          <input 
            type="text" 
            defaultValue={strategyName} 
            className="bg-transparent text-[16px] font-semibold text-text-primary outline-none hover:bg-white/5 focus:bg-white/5 px-2 py-1 rounded"
          />
          <Badge variant={strategyStatus.toLowerCase() as any}>{strategyStatus}</Badge>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="text-[13px] h-8">Save Draft</Button>
          <Button 
            variant="secondary" 
            className="text-[13px] h-8 flex items-center gap-2"
            onClick={runBacktest}
            disabled={isBacktesting}
          >
            {isBacktesting ? (
              <span className="h-4 w-4 rounded-full border-2 border-text-secondary border-t-accent-blue animate-spin" />
            ) : (
              <Play className="h-3 w-3" />
            )}
            Backtest
          </Button>
          <Button variant="primary" className="text-[13px] h-8 bg-accent-green hover:bg-accent-green/80 hover:shadow-[var(--shadow-glow-green)]">
            Deploy Live ✓
          </Button>
        </div>
      </div>

      {/* 3-Panel Split */}
      <div className="flex flex-1 overflow-hidden relative">
        <BlockLibrary />
        <StrategyCanvas />
        <SettingsPanel />
        
        {/* Absolute positioned drawer */}
        <BacktestDrawer />
      </div>
    </div>
  )
}
