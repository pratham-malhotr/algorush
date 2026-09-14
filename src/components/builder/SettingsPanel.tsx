"use client"

import * as React from "react"
import { useBuilderStore } from "@/store/useBuilderStore"
import { Button } from "@/components/ui/button"
import { AssetSelector } from "./AssetSelector"
import { usePaperTradingStore } from "@/store/usePaperTradingStore"
import { useRouter } from "next/navigation"
import { NodePropertiesPanel } from "./NodePropertiesPanel"
import { ShieldCheck, Cpu, Sliders, Zap, AlertTriangle, Layers, Clock, Lock } from "lucide-react"
import { ComplianceAuditModal } from "./ComplianceAuditModal"
import { toast } from "sonner"

export function SettingsPanel() {
  const router = useRouter()
  const deployStrategy = usePaperTradingStore(state => state.deployStrategy)
  const { 
    exchange, setExchange,
    tradingPair, setTradingPair,
    allocation, setAllocation,
    maxPerTrade, setMaxPerTrade,
    strategyDSL,
    selectedNodeId
  } = useBuilderStore()

  const [execAlgorithm, setExecAlgorithm] = React.useState<string>("SMART_ROUTING")
  const [maxSlippageBps, setMaxSlippageBps] = React.useState<number>(15)
  const [dailyDrawdownHalt, setDailyDrawdownHalt] = React.useState<number>(4.0)
  const [isAuditModalOpen, setIsAuditModalOpen] = React.useState(false)

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-bg-surface p-4 text-xs">
      
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-bg-border">
        <div>
          <h3 className="text-sm font-bold text-text-primary">Quant Configuration</h3>
          <span className="text-[10px] text-text-tertiary">Institutional Order Settings</span>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-500 border border-emerald-500/20">
          STRICT
        </span>
      </div>

      {/* Pre-Flight Compliance Gate Card */}
      <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-emerald-500 font-bold">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-[11px]">Compliance Gate</span>
          </div>
          <span className="text-[9px] font-bold font-mono bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded">
            7/7 PASS
          </span>
        </div>
        <p className="text-[10px] text-text-secondary leading-relaxed">
          Pre-trade risk boundaries, DAG compilation, and slippage ceilings verified.
        </p>
        <button
          onClick={() => setIsAuditModalOpen(true)}
          className="w-full py-1.5 rounded-lg bg-bg-surface hover:bg-bg-elevated border border-emerald-500/30 text-emerald-500 text-[10.5px] font-bold transition-all text-center flex items-center justify-center gap-1.5"
        >
          <Lock className="h-3 w-3" />
          <span>View Audit Certificate</span>
        </button>
      </div>

      {/* Exchange & Asset Routing */}
      <div className="mb-6 flex flex-col gap-3">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Venue & Instrument</h4>
        
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-text-secondary font-semibold">Primary Execution Venue</label>
          <select 
            value={exchange}
            onChange={(e) => setExchange(e.target.value)}
            className="h-8 w-full rounded-lg border border-bg-border bg-bg-base px-2.5 text-xs text-text-primary outline-none focus:border-accent-blue"
          >
            <option value="Binance">Binance Futures (VIP Tier 0.035%)</option>
            <option value="OKX">OKX Linear Swaps</option>
            <option value="Bybit">Bybit Derivatives</option>
            <option value="Coinbase">Coinbase Advanced API</option>
            <option value="Hyperliquid">Hyperliquid L1 DEX</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-text-secondary font-semibold">Target Instrument</label>
          <AssetSelector 
            value={tradingPair}
            onChange={setTradingPair}
          />
        </div>
      </div>

      {/* Institutional Execution Algorithm */}
      <div className="mb-6 flex flex-col gap-3">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Execution Routing</h4>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-text-secondary font-semibold">Algo Routing Model</label>
          <select
            value={execAlgorithm}
            onChange={(e) => setExecAlgorithm(e.target.value)}
            className="h-8 w-full rounded-lg border border-bg-border bg-bg-base px-2.5 text-xs text-text-primary outline-none focus:border-accent-blue"
          >
            <option value="SMART_ROUTING">Smart Order Routing (SOR)</option>
            <option value="TWAP_15M">TWAP (15-Min Sliced Child Orders)</option>
            <option value="VWAP_INTRADAY">VWAP (Volume-Weighted Curve)</option>
            <option value="PEGGED_MAKER">Passive Pegged Maker (Best Bid + Rebate)</option>
            <option value="ICEBERG">Iceberg (10% Visible Ladder Clip)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-text-secondary font-semibold">Max Slippage Ceiling</span>
            <span className="font-mono text-accent-blue font-bold">{maxSlippageBps} bps</span>
          </div>
          <input 
            type="range" 
            min="5" max="50" step="5"
            value={maxSlippageBps}
            onChange={(e) => setMaxSlippageBps(Number(e.target.value))}
            className="w-full accent-accent-blue"
          />
        </div>
      </div>

      {/* Capital Allocation & Risk Limits */}
      <div className="mb-6 flex flex-col gap-3">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Capital & Risk Caps</h4>
        
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-text-secondary font-semibold">Portfolio Capital Cap</span>
            <span className="font-mono text-text-primary font-bold">{allocation}%</span>
          </div>
          <input 
            type="range" 
            min="5" max="100" step="5"
            value={allocation}
            onChange={(e) => setAllocation(Number(e.target.value))}
            className="w-full accent-accent-blue"
          />
          <div className="text-[10px] text-text-tertiary font-mono mt-0.5">
            Allocating: ${((100000 * allocation) / 100).toLocaleString()} USDT
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-text-secondary font-semibold">Daily Drawdown Circuit Breaker</span>
            <span className="font-mono text-accent-red font-bold">-{dailyDrawdownHalt}%</span>
          </div>
          <input 
            type="range" 
            min="1" max="10" step="0.5"
            value={dailyDrawdownHalt}
            onChange={(e) => setDailyDrawdownHalt(Number(e.target.value))}
            className="w-full accent-accent-red"
          />
        </div>
      </div>

      {/* Deploy Button */}
      <div className="mt-auto pt-4 border-t border-bg-border">
        <Button 
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-10 rounded-xl shadow-md shadow-emerald-500/20 text-xs transition-all flex items-center justify-center gap-2"
          onClick={() => {
            if (strategyDSL) {
              deployStrategy(strategyDSL);
              toast.success(`⚡ Deployed ${strategyDSL.name} into Paper Sandbox with $${((100000 * allocation) / 100).toLocaleString()}!`);
              router.push('/dashboard');
            } else {
              toast.error('Please configure a valid strategy graph first!');
            }
          }}
        >
          <Zap className="h-3.5 w-3.5 fill-current" />
          <span>DEPLOY TO SANDBOX</span>
        </Button>
      </div>

      {/* Compliance Audit Modal */}
      <ComplianceAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        onProceedToDeploy={() => {
          if (strategyDSL) {
            deployStrategy(strategyDSL);
            toast.success(`⚡ Deployed ${strategyDSL.name} after compliance approval!`);
            router.push('/dashboard');
          }
        }}
      />

    </div>
  )
}
