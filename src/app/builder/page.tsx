"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useBuilderStore } from "@/store/useBuilderStore"
import { usePaperTradingStore } from "@/store/usePaperTradingStore"
import { useExchangeStore } from "@/store/useExchangeStore"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Play, ShieldAlert, FlaskConical, Code2, CheckCircle2, Zap, ShieldCheck, 
  ChevronUp, ChevronDown, Timer, BarChart3, Sparkles, LayoutGrid, Terminal, 
  Sliders, Layers, Flame, RefreshCw, Dna, Activity
} from "lucide-react"
import { SettingsPanel } from "@/components/builder/SettingsPanel"
import { BacktestDrawer } from "@/components/builder/BacktestDrawer"
import { AICopilot } from "@/components/builder/AICopilot"
import { CodeViewer } from "@/components/builder/CodeViewer"
import { DeployStrategyModal } from "@/components/builder/DeployStrategyModal"
import { AutoOptimizerModal } from "@/components/builder/AutoOptimizerModal"
import { ComplianceAuditModal } from "@/components/builder/ComplianceAuditModal"
import { BlockLibrary } from "@/components/builder/BlockLibrary"
import { QuantScratchpad } from "@/components/builder/QuantScratchpad"
import dynamic from "next/dynamic"
import { toast } from "sonner"

const StrategyCanvas = dynamic(
  () => import("@/components/builder/StrategyCanvas").then((mod) => mod.StrategyCanvas),
  { ssr: false, loading: () => <div className="flex-1 h-full w-full bg-bg-base flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-bg-border border-t-accent-blue" /></div> }
)

export default function BuilderPage() {
  const router = useRouter()
  const { 
    strategyName, 
    strategyStatus, 
    isBacktesting, 
    runBacktest, 
    strategyDSL, 
    setStrategyStatus, 
    setStrategyName, 
    tradingPair,
    setTradingPair,
    timeframe,
    setTimeframe,
    loadPresetTemplate,
    workspaceMode,
    setWorkspaceMode,
    isOptimizerModalOpen,
    setIsOptimizerModalOpen
  } = useBuilderStore()
  
  const { haltAllTrading } = usePaperTradingStore()
  const { getActiveAccount, setIsConnectModalOpen } = useExchangeStore()

  const [showCode, setShowCode] = React.useState(true)
  const [isPaper, setIsPaper] = React.useState(true)
  const [isDeployModalOpen, setIsDeployModalOpen] = React.useState(false)
  const [isComplianceModalOpen, setIsComplianceModalOpen] = React.useState(false)
  const [codeHeight, setCodeHeight] = React.useState(220)
  const [isResizing, setIsResizing] = React.useState(false)

  const activeAccount = getActiveAccount()

  // Resizable code panel handler
  const handleResizeStart = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    const startY = e.clientY
    const startHeight = codeHeight

    const handleMove = (ev: MouseEvent) => {
      const delta = startY - ev.clientY
      setCodeHeight(Math.max(120, Math.min(500, startHeight + delta)))
    }
    const handleUp = () => {
      setIsResizing(false)
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
  }, [codeHeight])

  return (
    <div className="flex h-[calc(100vh-64px)] w-full flex-col bg-bg-base overflow-hidden">
      {/* ═══ Top Action Bar ═══ */}
      <div className="flex h-[56px] w-full shrink-0 items-center justify-between border-b border-bg-border bg-bg-surface px-4 gap-3 overflow-x-auto">
        
        {/* Left: Strategy Identity & Quick Presets */}
        <div className="flex items-center gap-2.5 min-w-0 shrink-0">
          <div className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-500 shrink-0">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>VIP Quant</span>
          </div>

          <div className="h-4 w-px bg-bg-border shrink-0" />

          {/* Editable Strategy Name */}
          <input 
            type="text" 
            value={strategyName}
            onChange={(e) => setStrategyName(e.target.value)}
            className="bg-transparent text-[13px] font-bold text-text-primary outline-none hover:bg-bg-elevated focus:bg-bg-elevated px-2 py-1 rounded-lg border border-transparent focus:border-accent-blue transition-colors min-w-[140px] max-w-[220px] truncate"
            title="Click to rename strategy"
          />
          <Badge variant={strategyStatus.toLowerCase() as any} className="shrink-0 text-[10px] uppercase font-bold">{strategyStatus}</Badge>

          {/* Quick Presets Dropdown */}
          <select
            onChange={(e) => e.target.value && loadPresetTemplate(e.target.value)}
            defaultValue=""
            className="hidden xl:inline-block h-8 rounded-lg border border-bg-border bg-bg-base px-2.5 text-[11px] font-bold text-accent-blue outline-none hover:border-accent-blue transition-colors cursor-pointer"
          >
            <option value="" disabled>⚡ Institutional Presets</option>
            <option value="triple_ema">Triple EMA Trend + Volatility Guard</option>
            <option value="bollinger_squeeze">Bollinger Squeeze Mean Reversion</option>
            <option value="basis_arbitrage">Spot-Futures Basis Funding Arbitrage</option>
            <option value="order_flow">Order Flow Imbalance Scalper</option>
            <option value="pairs_trading">Statistical Pairs Cointegration (BTC/ETH)</option>
            <option value="volatility_grid">Dynamic Volatility Grid</option>
          </select>
        </div>

        {/* Center: Workspace Mode Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center rounded-xl bg-bg-elevated p-1 border border-bg-border shadow-inner">
            <button 
              onClick={() => setWorkspaceMode('canvas')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-[11.5px] font-bold transition-all ${
                workspaceMode === 'canvas'
                  ? 'bg-accent-blue text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Flow Graph</span>
            </button>

            <button 
              onClick={() => setWorkspaceMode('scratchpad')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-[11.5px] font-bold transition-all ${
                workspaceMode === 'scratchpad'
                  ? 'bg-accent-blue text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Terminal className="h-3.5 w-3.5" />
              <span>Quant Lab</span>
            </button>

            <button 
              onClick={() => setWorkspaceMode('code')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-[11.5px] font-bold transition-all ${
                workspaceMode === 'code'
                  ? 'bg-accent-blue text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>Python CCXT</span>
            </button>
          </div>

          {/* Instrument & Timeframe Pickers */}
          <div className="hidden lg:flex items-center gap-1.5 bg-bg-elevated px-2 py-1 rounded-xl border border-bg-border text-xs font-bold">
            <select
              value={tradingPair}
              onChange={(e) => setTradingPair(e.target.value)}
              className="bg-transparent text-text-primary outline-none cursor-pointer"
            >
              <option value="BTC/USDT">BTC/USDT</option>
              <option value="ETH/USDT">ETH/USDT</option>
              <option value="SOL/USDT">SOL/USDT</option>
              <option value="PAXG/USDT">PAXG/USDT (Gold)</option>
              <option value="NEAR/USDT">NEAR/USDT</option>
            </select>

            <span className="text-text-tertiary">|</span>

            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-transparent text-accent-blue outline-none cursor-pointer"
            >
              <option value="1m">1m</option>
              <option value="5m">5m</option>
              <option value="15m">15m</option>
              <option value="1h">1h</option>
              <option value="4h">4h</option>
              <option value="1d">1d</option>
            </select>
          </div>
        </div>

        {/* Right: Actions (Compliance, Optimizer, Backtest, Kill, Deploy) */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Pre-Flight Compliance Gate */}
          <button
            onClick={() => setIsComplianceModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all"
            title="Pre-Flight Institutional Risk & Compliance Audit"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Compliance</span>
          </button>

          {/* Genetic Auto-Optimizer */}
          <button
            onClick={() => setIsOptimizerModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-[11px] font-bold text-purple-400 hover:bg-purple-500/20 transition-all"
            title="Run AI Genetic Parameter Sweep"
          >
            <Dna className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">AI Optimizer</span>
          </button>

          {/* Emergency Kill Switch */}
          <button 
            className="flex items-center gap-1.5 rounded-xl border border-accent-red/30 bg-accent-red/10 px-2.5 py-1 text-[11px] font-bold text-accent-red hover:bg-accent-red/20 transition-all"
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
            title="Emergency halt all orders and close positions"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Kill</span>
          </button>

          <div className="h-4 w-px bg-bg-border" />

          {/* Backtest Trigger */}
          <Button 
            variant="secondary" 
            className="text-[11px] h-8 flex items-center gap-1.5 px-3 font-bold border-bg-border bg-bg-surface hover:bg-bg-elevated"
            onClick={runBacktest}
            disabled={isBacktesting || !strategyDSL}
          >
            {isBacktesting ? (
              <span className="h-3.5 w-3.5 rounded-full border-2 border-text-secondary border-t-accent-blue animate-spin" />
            ) : (
              <BarChart3 className="h-3.5 w-3.5 text-accent-blue" />
            )}
            <span>Backtest</span>
          </Button>

          {/* Deploy Live / Sandbox */}
          <Button 
            variant="primary" 
            className="text-[11px] text-white h-8 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 font-bold px-3.5 shadow-md shadow-emerald-500/20 transition-all"
            onClick={() => {
              if (strategyDSL) {
                setIsDeployModalOpen(true)
              } else {
                toast.error("Build a strategy first!")
              }
            }}
          >
            <Zap className="h-3.5 w-3.5 fill-current text-white" />
            <span>Deploy</span>
          </Button>
        </div>
      </div>

      {/* ═══ Main Dynamic Body ═══ */}
      <div className="flex flex-1 overflow-hidden relative">
        {workspaceMode === 'canvas' && (
          <>
            <AICopilot />
            <BlockLibrary />
            
            <div className="flex flex-1 flex-col overflow-hidden relative">
              {/* Canvas */}
              <div className="flex-1 relative min-h-[200px]">
                <StrategyCanvas />
              </div>

              {/* Resizable Code Drawer */}
              {showCode && (
                <>
                  <div 
                    className={`h-[3px] cursor-row-resize bg-bg-border hover:bg-accent-blue/50 transition-colors shrink-0 flex items-center justify-center ${isResizing ? 'bg-accent-blue' : ''}`}
                    onMouseDown={handleResizeStart}
                  >
                    <div className="w-8 h-[3px] rounded-full bg-bg-border" />
                  </div>
                  <div style={{ height: codeHeight }} className="min-h-[120px] max-h-[500px] border-t border-bg-border">
                    <CodeViewer />
                  </div>
                </>
              )}
            </div>

            <SettingsPanel />
            <BacktestDrawer />
          </>
        )}

        {workspaceMode === 'scratchpad' && (
          <div className="flex-1 h-full w-full overflow-hidden">
            <QuantScratchpad />
          </div>
        )}

        {workspaceMode === 'code' && (
          <div className="flex-1 h-full w-full bg-bg-base overflow-hidden p-4">
            <div className="h-full w-full rounded-2xl border border-bg-border overflow-hidden shadow-sm">
              <CodeViewer />
            </div>
          </div>
        )}
      </div>

      {/* Deploy Strategy Modal */}
      <DeployStrategyModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
      />

      {/* AI Genetic Auto-Optimizer Modal */}
      <AutoOptimizerModal
        isOpen={isOptimizerModalOpen}
        onClose={() => setIsOptimizerModalOpen(false)}
      />

      {/* Institutional Pre-Flight Compliance Audit Modal */}
      <ComplianceAuditModal
        isOpen={isComplianceModalOpen}
        onClose={() => setIsComplianceModalOpen(false)}
        onProceedToDeploy={() => {
          setIsDeployModalOpen(true)
        }}
      />
    </div>
  )
}
