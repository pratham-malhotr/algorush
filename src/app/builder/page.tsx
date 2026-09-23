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
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X, Timer, BarChart3, Sparkles, LayoutGrid, Terminal, 
  Sliders, Layers, Flame, RefreshCw, Dna, Activity, BrainCircuit, Wrench, Rocket, LineChart
} from "lucide-react"
import { SettingsPanel } from "@/components/builder/SettingsPanel"
import { NodePropertiesPanel } from "@/components/builder/NodePropertiesPanel"
import { BacktestDrawer } from "@/components/builder/BacktestDrawer"
import { AICopilot } from "@/components/builder/AICopilot"
import { CodeViewer } from "@/components/builder/CodeViewer"
import { StrategyChartViewer } from "@/components/builder/StrategyChartViewer"
import { DeployStrategyModal } from "@/components/builder/DeployStrategyModal"
import { AutoOptimizerModal } from "@/components/builder/AutoOptimizerModal"
import { ComplianceAuditModal } from "@/components/builder/ComplianceAuditModal"
import { BlockLibrary } from "@/components/builder/BlockLibrary"
import { QuantScratchpad } from "@/components/builder/QuantScratchpad"
import { GeminiSettingsModal } from "@/components/builder/GeminiSettingsModal"
import { StrategyBuildupHubModal } from "@/components/builder/StrategyBuildupHubModal"
import { HundredStrategiesModal } from "@/components/builder/HundredStrategiesModal"
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
    setIsOptimizerModalOpen,
    isDeployModalOpen,
    setIsDeployModalOpen,
    setIsGeminiModalOpen,
    setIsHundredStrategiesModalOpen,
    setIsPromptStudioOpen,
    claudeApiKey,
    groqApiKey,
    geminiApiKey,
    aiModel,
    selectedNodeId
  } = useBuilderStore()
  
  const { haltAllTrading } = usePaperTradingStore()
  const { getActiveAccount, setIsConnectModalOpen } = useExchangeStore()

  const [activeLeftPanel, setActiveLeftPanel] = React.useState<'copilot' | 'blocks' | 'settings' | null>('copilot')
  const [showCode, setShowCode] = React.useState(false)
  const [isPaper, setIsPaper] = React.useState(true)
  const [isComplianceModalOpen, setIsComplianceModalOpen] = React.useState(false)
  const [codeHeight, setCodeHeight] = React.useState(220)
  const [isResizing, setIsResizing] = React.useState(false)
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = React.useState(false)
  const toolsDropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(event.target as Node)) {
        setIsToolsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
      {/* ═══ Top Action Bar (Enterprise Grade & Guaranteed Deploy Visibility) ═══ */}
      <div className="flex h-[58px] w-full shrink-0 items-center justify-between border-b border-bg-border bg-bg-surface px-5 select-none z-30">
        
        {/* Left Zone: Strategy Identity & Asset Context */}
        <div className="flex items-center gap-2.5 min-w-0 shrink-0">
          <div className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-500 shrink-0 shadow-xs">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">VIP Quant</span>
          </div>

          <div className="h-4 w-px bg-bg-border shrink-0" />

          {/* Editable Strategy Name */}
          <div className="flex items-center gap-1.5 group">
            <input 
              type="text" 
              value={strategyName}
              onChange={(e) => setStrategyName(e.target.value)}
              className="bg-transparent text-[13px] font-bold text-text-primary outline-none hover:bg-bg-elevated focus:bg-bg-elevated px-2 py-1 rounded-lg border border-transparent focus:border-accent-blue transition-colors w-[140px] xl:w-[180px] truncate"
              title="Click to rename strategy"
              placeholder="Strategy Title"
            />
            <Badge variant={strategyStatus.toLowerCase() as any} className="shrink-0 text-[10px] uppercase font-bold tracking-wider">{strategyStatus}</Badge>
          </div>

          <div className="h-4 w-px bg-bg-border shrink-0" />

          {/* Instrument & Timeframe Pickers */}
          <div className="flex items-center gap-1.5 bg-bg-elevated/90 px-2.5 py-1 rounded-xl border border-bg-border text-xs font-bold shadow-xs">
            <select
              value={tradingPair}
              onChange={(e) => setTradingPair(e.target.value)}
              className="bg-transparent text-text-primary outline-none cursor-pointer hover:text-accent-blue transition-colors font-mono"
            >
              <option value="BTC/USDT">BTC/USDT</option>
              <option value="ETH/USDT">ETH/USDT</option>
              <option value="SOL/USDT">SOL/USDT</option>
              <option value="PAXG/USDT">PAXG/USDT</option>
              <option value="NEAR/USDT">NEAR/USDT</option>
            </select>

            <span className="text-text-tertiary">|</span>

            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-transparent text-accent-blue outline-none cursor-pointer hover:underline transition-all font-mono"
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

        {/* Center Zone: Workspace Mode Switcher & AI Studio Trigger */}
        <div className="hidden lg:flex items-center gap-2.5 shrink-0">
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
              onClick={() => setWorkspaceMode('chart')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-[11.5px] font-bold transition-all ${
                workspaceMode === 'chart'
                  ? 'bg-accent-blue text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <LineChart className="h-3.5 w-3.5" />
              <span>Strategy Chart</span>
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

          {/* AI Strategy Studio Button */}
          <button
            onClick={() => setIsPromptStudioOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-accent-blue/30 bg-accent-blue/10 hover:bg-accent-blue/20 text-accent-blue px-3 py-1.5 text-[11.5px] font-bold transition-all shadow-xs cursor-pointer"
            title="Open AI Strategy Studio (Cmd+K)"
          >
            <Sparkles className="h-3.5 w-3.5 text-accent-blue" />
            <span>AI Studio</span>
            <span className="text-[9.5px] font-mono opacity-70 bg-accent-blue/20 px-1 py-0.2 rounded">⌘K</span>
          </button>
        </div>

        {/* Right Zone: Institutional Tools & PRIMARY ACTIONS (NEVER OVERFLOWS) */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {/* AI Copilot Status */}
          <div className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-bold text-emerald-400 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden xl:inline">AI Copilot: Online</span>
            <span className="xl:hidden">AI Online</span>
          </div>

          {/* Institutional Quant Tools Dropdown */}
          <div className="relative" ref={toolsDropdownRef}>
            <button
              onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
              className="flex items-center gap-1.5 rounded-xl border border-bg-border bg-bg-elevated hover:bg-bg-border/60 text-text-secondary hover:text-text-primary px-2.5 py-1.5 text-[11px] font-bold transition-all shadow-xs cursor-pointer"
              title="Institutional Audit & Optimization Tools"
            >
              <Wrench className="h-3.5 w-3.5 text-accent-blue" />
              <span className="hidden sm:inline">Tools</span>
              <ChevronDown className={`h-3 w-3 text-text-tertiary transition-transform ${isToolsDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Popover Menu */}
            {isToolsDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-bg-border/90 bg-bg-surface/95 backdrop-blur-xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
                  Institutional Suite
                </div>

                {/* 100 Algos Benchmark */}
                <button
                  onClick={() => {
                    setIsToolsDropdownOpen(false)
                    setIsHundredStrategiesModalOpen(true)
                  }}
                  className="w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-text-primary hover:bg-bg-elevated transition-colors cursor-pointer"
                >
                  <div className="h-7 w-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
                    <Flame className="h-4 w-4 text-cyan-400" />
                  </div>
                  <div>
                    <div className="font-bold text-[12px] text-cyan-400">100 Algos Benchmark</div>
                    <div className="text-[10px] text-text-tertiary font-normal">Batch backtest 100 quant strategies</div>
                  </div>
                </button>

                {/* Genetic Auto-Optimizer */}
                <button
                  onClick={() => {
                    setIsToolsDropdownOpen(false)
                    setIsOptimizerModalOpen(true)
                  }}
                  className="w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-text-primary hover:bg-bg-elevated transition-colors cursor-pointer"
                >
                  <div className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shrink-0">
                    <Dna className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <div className="font-bold text-[12px] text-indigo-400">Genetic Optimizer</div>
                    <div className="text-[10px] text-text-tertiary font-normal">AI hyperparameter multi-sweep</div>
                  </div>
                </button>

                {/* Compliance Audit */}
                <button
                  onClick={() => {
                    setIsToolsDropdownOpen(false)
                    setIsComplianceModalOpen(true)
                  }}
                  className="w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-text-primary hover:bg-bg-elevated transition-colors cursor-pointer"
                >
                  <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="font-bold text-[12px] text-emerald-400">Compliance Audit</div>
                    <div className="text-[10px] text-text-tertiary font-normal">Pre-flight regulatory risk check</div>
                  </div>
                </button>

                <div className="my-1.5 h-px bg-bg-border/80" />

                {/* Emergency Kill Switch */}
                <button
                  onClick={async () => {
                    setIsToolsDropdownOpen(false)
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
                  className="w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-accent-red hover:bg-accent-red/10 transition-colors cursor-pointer"
                >
                  <div className="h-7 w-7 rounded-lg bg-accent-red/10 border border-accent-red/30 flex items-center justify-center shrink-0">
                    <ShieldAlert className="h-4 w-4 text-accent-red" />
                  </div>
                  <div>
                    <div className="font-bold text-[12px] text-accent-red">Emergency Kill Switch</div>
                    <div className="text-[10px] text-text-tertiary font-normal">Halt all execution & cancel orders</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-bg-border mx-0.5" />

          {/* Primary Action 1: Backtest Simulation */}
          <Button 
            variant="secondary" 
            className="text-[11.5px] h-9 flex items-center gap-1.5 px-3.5 font-bold border-bg-border bg-bg-elevated hover:bg-bg-border/60 text-text-primary rounded-xl transition-all cursor-pointer"
            onClick={runBacktest}
            disabled={isBacktesting || !strategyDSL}
            title="Run Historical Backtest"
          >
            {isBacktesting ? (
              <span className="h-3.5 w-3.5 rounded-full border-2 border-text-secondary border-t-accent-blue animate-spin" />
            ) : (
              <BarChart3 className="h-3.5 w-3.5 text-accent-blue" />
            )}
            <span>Backtest</span>
          </Button>

          {/* Primary Action 2: DEPLOY STRATEGY (ALWAYS PROMINENT & VISIBLE) */}
          <button 
            className="text-[12px] text-white h-9 flex items-center gap-2 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 font-bold px-4 rounded-xl shadow-lg shadow-emerald-600/25 border border-emerald-400/30 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => {
              if (strategyDSL) {
                setIsDeployModalOpen(true)
              } else {
                toast.error("Build a strategy on canvas first!", {
                  description: "Use AI Copilot or AI Studio to generate your trading rules."
                })
                setIsPromptStudioOpen(true)
              }
            }}
            title="Deploy Strategy to Live Exchange or Sandbox Paper Trading"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <Zap className="h-3.5 w-3.5 fill-current text-white" />
            <span>Deploy Strategy</span>
          </button>
        </div>
      </div>

      {/* ═══ Main Dynamic Body ═══ */}
      <div className="flex flex-1 overflow-hidden relative">
        {workspaceMode === 'canvas' && (
          <div className="flex flex-1 overflow-hidden relative h-full w-full">
            {/* ═══ Slim Left Activity Bar (48px) ═══ */}
            <div className="w-[48px] shrink-0 bg-bg-surface border-r border-bg-border flex flex-col items-center py-2.5 justify-between z-20 select-none">
              <div className="flex flex-col items-center gap-2">
                {/* AI Copilot Tab */}
                <button
                  onClick={() => setActiveLeftPanel(prev => prev === 'copilot' ? null : 'copilot')}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                    activeLeftPanel === 'copilot'
                      ? 'bg-accent-blue/15 text-accent-blue border border-accent-blue/30 shadow-sm'
                      : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
                  }`}
                  title="AI Copilot (Chat & Generation)"
                >
                  <BrainCircuit className="h-4 w-4" />
                </button>

                {/* Block Library Tab */}
                <button
                  onClick={() => setActiveLeftPanel(prev => prev === 'blocks' ? null : 'blocks')}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                    activeLeftPanel === 'blocks'
                      ? 'bg-accent-blue/15 text-accent-blue border border-accent-blue/30 shadow-sm'
                      : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
                  }`}
                  title="Quant Block Library (Drag & Drop Nodes)"
                >
                  <Layers className="h-4 w-4" />
                </button>

                {/* Quant Settings Tab */}
                <button
                  onClick={() => setActiveLeftPanel(prev => prev === 'settings' ? null : 'settings')}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                    activeLeftPanel === 'settings'
                      ? 'bg-accent-blue/15 text-accent-blue border border-accent-blue/30 shadow-sm'
                      : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
                  }`}
                  title="Strategy Venue & Risk Settings"
                >
                  <Sliders className="h-4 w-4" />
                </button>
              </div>

              {/* Bottom Activity Bar Controls */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => setActiveLeftPanel(prev => prev ? null : 'copilot')}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary hover:bg-bg-elevated hover:text-text-primary transition-colors"
                  title={activeLeftPanel ? "Collapse sidebar (Maximize canvas)" : "Open sidebar"}
                >
                  {activeLeftPanel ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* ═══ Active Left Drawer (Single Panel) ═══ */}
            {activeLeftPanel && (
              <div className="w-[380px] xl:w-[410px] shrink-0 border-r border-bg-border bg-bg-surface h-full flex flex-col overflow-hidden z-10 animate-in slide-in-from-left duration-200">
                <div className="flex h-10 shrink-0 items-center justify-between px-3 border-b border-bg-border bg-bg-elevated/40 text-xs font-bold text-text-secondary">
                  <div className="flex items-center gap-1 bg-bg-base/60 p-0.5 rounded-lg border border-bg-border/60">
                    <button
                      onClick={() => setActiveLeftPanel('copilot')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                        activeLeftPanel === 'copilot'
                          ? 'bg-accent-blue text-white shadow-xs'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <BrainCircuit className="h-3 w-3" />
                      <span>Copilot</span>
                    </button>
                    <button
                      onClick={() => setActiveLeftPanel('blocks')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                        activeLeftPanel === 'blocks'
                          ? 'bg-accent-blue text-white shadow-xs'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <Layers className="h-3 w-3" />
                      <span>Blocks</span>
                    </button>
                    <button
                      onClick={() => setActiveLeftPanel('settings')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                        activeLeftPanel === 'settings'
                          ? 'bg-accent-blue text-white shadow-xs'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <Sliders className="h-3 w-3" />
                      <span>Settings</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setActiveLeftPanel(null)}
                    className="p-1 text-text-tertiary hover:text-text-primary hover:bg-bg-elevated rounded transition-colors"
                    title="Close sidebar"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex-1 overflow-hidden">
                  {activeLeftPanel === 'copilot' && <AICopilot />}
                  {activeLeftPanel === 'blocks' && <BlockLibrary />}
                  {activeLeftPanel === 'settings' && <SettingsPanel />}
                </div>
              </div>
            )}

            {/* ═══ Center: Canvas & Bottom Status Bar / Code Drawer ═══ */}
            <div className="flex flex-1 flex-col overflow-hidden relative h-full">
              {/* ReactFlow Canvas Viewport */}
              <div className="flex-1 relative h-full w-full overflow-hidden">
                <StrategyCanvas />
              </div>

              {/* Resizable Code Drawer */}
              {showCode && (
                <>
                  <div 
                    className={`h-[4px] cursor-row-resize bg-bg-border hover:bg-accent-blue/50 transition-colors shrink-0 flex items-center justify-center ${isResizing ? 'bg-accent-blue' : ''}`}
                    onMouseDown={handleResizeStart}
                  >
                    <div className="w-10 h-[3px] rounded-full bg-bg-border" />
                  </div>
                  <div style={{ height: codeHeight }} className="min-h-[120px] max-h-[500px] border-t border-bg-border bg-bg-base shrink-0 overflow-hidden">
                    <CodeViewer />
                  </div>
                </>
              )}

              {/* Sleek Bottom Status Bar */}
              <div className="h-8 shrink-0 border-t border-bg-border bg-bg-surface/90 backdrop-blur-md px-3 flex items-center justify-between text-[11px] select-none z-10">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-text-secondary font-medium">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Canvas Active</span>
                  </span>
                  <span className="text-bg-border">•</span>
                  <span className="text-text-primary font-mono font-bold">{tradingPair} ({timeframe})</span>
                  <span className="text-bg-border hidden sm:inline">•</span>
                  <span className="text-accent-blue font-mono hidden sm:inline">⚡ 4.2ms execution latency</span>
                  <span className="text-bg-border hidden md:inline">•</span>
                  <span className="text-text-secondary hidden md:inline font-mono">Binance Futures (Paper)</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowCode(!showCode)}
                    className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      showCode 
                        ? 'bg-accent-blue/15 text-accent-blue border border-accent-blue/30' 
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                    }`}
                  >
                    <Code2 className="h-3.5 w-3.5" />
                    <span>Generated Code</span>
                    {showCode ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                  </button>
                </div>
              </div>
            </div>

            {/* ═══ Right: Slide-in Node Properties Inspector ═══ */}
            {selectedNodeId && (
              <div className="w-[310px] shrink-0 border-l border-bg-border bg-bg-surface h-full overflow-y-auto shadow-2xl z-20 animate-in slide-in-from-right duration-200">
                <NodePropertiesPanel />
              </div>
            )}

            <BacktestDrawer />
          </div>
        )}

        {workspaceMode === 'chart' && (
          <div className="flex-1 h-full w-full overflow-hidden">
            <StrategyChartViewer />
          </div>
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

      {/* Gemini AI Engine Settings Modal */}
      <GeminiSettingsModal />

      {/* End-to-End Strategy Buildup Hub Modal */}
      <StrategyBuildupHubModal
        onOpenDeployModal={() => setIsDeployModalOpen(true)}
      />

      {/* 100 Quant Strategies Benchmark Lab Modal */}
      <HundredStrategiesModal />
    </div>
  )
}
