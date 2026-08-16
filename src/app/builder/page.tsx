"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useBuilderStore } from "@/store/useBuilderStore"
import { usePaperTradingStore } from "@/store/usePaperTradingStore"
import { useExchangeStore } from "@/store/useExchangeStore"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, ShieldAlert, FlaskConical, Code2, CheckCircle2, Zap, ShieldCheck } from "lucide-react"
import { SettingsPanel } from "@/components/builder/SettingsPanel"
import { BacktestDrawer } from "@/components/builder/BacktestDrawer"
import { AICopilot } from "@/components/builder/AICopilot"
import { CodeViewer } from "@/components/builder/CodeViewer"
import { DeployStrategyModal } from "@/components/builder/DeployStrategyModal"
import { BlockLibrary } from "@/components/builder/BlockLibrary"
import dynamic from "next/dynamic"
import { toast } from "sonner"

const StrategyCanvas = dynamic(
  () => import("@/components/builder/StrategyCanvas").then((mod) => mod.StrategyCanvas),
  { ssr: false, loading: () => <div className="flex-1 h-full w-full bg-bg-base flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-bg-border border-t-accent-blue" /></div> }
)

export default function BuilderPage() {
  const router = useRouter()
  const { strategyName, strategyStatus, isBacktesting, runBacktest, strategyDSL, setStrategyStatus, setStrategyName } = useBuilderStore()
  const { haltAllTrading } = usePaperTradingStore()
  const { getActiveAccount, setIsConnectModalOpen } = useExchangeStore()

  const [showCode, setShowCode] = React.useState(true)
  const [isPaper, setIsPaper] = React.useState(true)
  const [isDeployModalOpen, setIsDeployModalOpen] = React.useState(false)

  const activeAccount = getActiveAccount()

  return (
    <div className="flex h-[calc(100vh-64px)] w-full flex-col bg-bg-base overflow-hidden">
      {/* Top Action Bar - Automated 1-Click Workflow */}
      <div className="flex h-[54px] w-full shrink-0 items-center justify-between border-b border-bg-border bg-bg-surface px-4">
        <div className="flex items-center gap-3">
          {/* Active VIP Subscription Badge */}
          <div className="flex items-center gap-1.5 rounded-xl border border-accent-green/30 bg-accent-green/10 px-3 py-1 text-[11.5px] font-bold text-accent-green shadow-xs">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>PRO VIP ACTIVE</span>
          </div>

          <div className="h-4 w-px bg-bg-border" />

          {/* Strategy Name */}
          <input 
            type="text" 
            value={strategyName}
            onChange={(e) => setStrategyName(e.target.value)}
            className="bg-transparent text-[15px] font-bold text-text-primary outline-none hover:bg-black/5 focus:bg-black/5 px-2 py-1 rounded transition-colors"
          />
          <Badge variant={strategyStatus.toLowerCase() as any}>{strategyStatus}</Badge>

          {/* Connected Exchange Pill */}
          <button
            onClick={() => setIsConnectModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-bg-elevated px-3 py-1 text-[12px] font-semibold text-text-primary hover:bg-accent-blue/10 hover:text-accent-blue border border-bg-border transition-all"
          >
            <div className="flex h-4 w-4 items-center justify-center rounded bg-accent-blue text-white font-extrabold text-[9px]">
              {activeAccount ? activeAccount.exchangeId.charAt(0).toUpperCase() : 'E'}
            </div>
            <span>{activeAccount ? activeAccount.name : "Connect Binance / LBank / OKX"}</span>
            {activeAccount && <CheckCircle2 className="h-3.5 w-3.5 text-accent-green" />}
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Simulation vs Live Mode */}
          <div className="flex items-center rounded-lg bg-bg-elevated p-1 border border-bg-border">
            <button 
              onClick={() => setIsPaper(true)}
              className={`flex items-center gap-1.5 rounded px-2.5 py-0.5 text-[11px] font-semibold transition-colors ${isPaper ? 'text-accent-blue bg-accent-blue/10' : 'text-text-secondary hover:text-text-primary'}`}
            >
              <FlaskConical className="h-3 w-3" />
              Paper Sandbox
            </button>
            <button 
              onClick={() => setIsPaper(false)}
              className={`flex items-center gap-1.5 rounded px-2.5 py-0.5 text-[11px] font-semibold transition-colors ${!isPaper ? 'text-accent-green bg-accent-green/10' : 'text-text-secondary hover:text-text-primary'}`}
            >
              Exchange Live
            </button>
          </div>

          <div className="h-4 w-px bg-bg-border mx-1" />

          {/* Code View Toggle */}
          <Button 
            variant="ghost" 
            className={`text-[12px] h-8 ${showCode ? 'bg-black/5 text-accent-blue font-semibold' : 'text-text-secondary'}`}
            onClick={() => setShowCode(!showCode)}
          >
            <Code2 className="h-3.5 w-3.5 mr-1.5" />
            Code View
          </Button>

          <div className="h-4 w-px bg-bg-border mx-1" />

          {/* Kill Switch */}
          <Button 
            variant="ghost" 
            className="text-[12px] h-8 text-accent-red hover:bg-accent-red/10 hover:text-accent-red px-2.5"
            onClick={async () => {
              try {
                await fetch('/api/kill-switch', {
                  method: 'POST',
                  headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer at_admin_master_secret'
                  },
                  body: JSON.stringify({ action: 'engage' })
                });
                setStrategyStatus('Paused');
                haltAllTrading();
                toast.error('CRITICAL: Kill Switch Engaged. All trading halted.');
              } catch (e) {
                toast.error('Error engaging Kill Switch!');
              }
            }}
          >
            <ShieldAlert className="h-3.5 w-3.5 mr-1.5" />
            Kill Switch
          </Button>

          <div className="h-4 w-px bg-bg-border mx-1" />

          {/* Backtest */}
          <Button 
            variant="secondary" 
            className="text-[12px] h-8 flex items-center gap-1.5 px-3"
            onClick={runBacktest}
            disabled={isBacktesting || !strategyDSL}
          >
            {isBacktesting ? (
              <span className="h-3.5 w-3.5 rounded-full border-2 border-text-secondary border-t-accent-blue animate-spin" />
            ) : (
              <Play className="h-3 w-3 fill-current" />
            )}
            Backtest
          </Button>

          {/* 1-Click Deploy Live Strategy */}
          <Button 
            variant="primary" 
            className="text-[12px] text-white h-8 flex items-center gap-1.5 bg-accent-green hover:bg-green-600 font-bold px-4 shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all"
            onClick={() => {
              if (strategyDSL) {
                setIsDeployModalOpen(true)
              } else {
                toast.error("Build a strategy first!")
              }
            }}
          >
            <Zap className="h-3.5 w-3.5 fill-current text-white" />
            Deploy AI Bot Live
          </Button>
        </div>
      </div>

      {/* 4-Panel Enterprise IDE Split */}
      <div className="flex flex-1 overflow-hidden relative">
        <AICopilot />
        <BlockLibrary />
        
        <div className="flex flex-1 flex-col overflow-hidden relative">
          <div className="flex-1 relative">
            <StrategyCanvas />
          </div>

          {/* Collapsible Bottom Code Drawer */}
          {showCode && (
            <div className="h-[220px] min-h-[180px] border-t border-bg-border">
              <CodeViewer />
            </div>
          )}
        </div>

        <SettingsPanel />
        <BacktestDrawer />
      </div>

      <DeployStrategyModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
      />
    </div>
  )
}
