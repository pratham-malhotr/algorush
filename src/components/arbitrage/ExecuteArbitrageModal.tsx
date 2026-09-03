"use client"

import * as React from "react"
import { 
  X, Zap, ShieldCheck, ArrowRight, CheckCircle2, RefreshCw, 
  Layers, DollarSign, Clock, AlertCircle, ArrowUpRight, Cpu, ExternalLink, AlertTriangle 
} from "lucide-react"
import { SpatialArbitrageOpportunity, calculateVwapSlippage, formatProfit, formatRoi } from "@/lib/arbitrage/radarEngine"
import { usePaperTradingStore } from "@/store/usePaperTradingStore"
import { useArbitrageStore, ArbitrageExecution } from "@/store/useArbitrageStore"
import { toast } from "sonner"

interface ExecuteArbitrageModalProps {
  arb: SpatialArbitrageOpportunity | null;
  isOpen: boolean;
  onClose: () => void;
  allocatedCapital?: number;
  onExecutionCompleted?: (execution: ArbitrageExecution) => void;
}

export function ExecuteArbitrageModal({
  arb,
  isOpen,
  onClose,
  allocatedCapital = 25000,
  onExecutionCompleted
}: ExecuteArbitrageModalProps) {
  const { executeTrade } = usePaperTradingStore()
  const { logExecution } = useArbitrageStore()

  const [capital, setCapital] = React.useState(allocatedCapital)
  const [executionStep, setExecutionStep] = React.useState<"idle" | "routing_buy" | "transferring" | "routing_sell" | "settled">("idle")
  const [executedRecord, setExecutedRecord] = React.useState<ArbitrageExecution | null>(null)

  React.useEffect(() => {
    if (allocatedCapital) setCapital(allocatedCapital)
  }, [allocatedCapital])

  if (!isOpen || !arb) return null

  const sim = calculateVwapSlippage(arb, capital)
  const baseSymbol = arb.pair.split('/')[0]
  const unitQty = +(capital / sim.effectiveBuyPrice).toFixed(arb.buyPrice < 1 ? 2 : 4)

  const profitDisplay = formatProfit(sim.netPnLUsdt)
  const roiDisplay = formatRoi(sim.netReturnPct)

  const handleStartExecution = async () => {
    // Step 1: Submitting Buy Order on Buy Venue
    setExecutionStep("routing_buy")
    await new Promise((r) => setTimeout(r, 550))

    // Step 2: Instant Cross-Venue Hedging / Flash Route
    setExecutionStep("transferring")
    await new Promise((r) => setTimeout(r, 650))

    // Step 3: Submitting Sell Order on Sell Venue
    setExecutionStep("routing_sell")
    await new Promise((r) => setTimeout(r, 600))

    // Step 4: Final Settlement
    const txHash = "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
    
    // Execute trades in paper trading account
    executeTrade('BUY', arb.pair, unitQty, sim.effectiveBuyPrice)
    executeTrade('SELL', arb.pair, unitQty, sim.effectiveSellPrice)

    const isTradeProfitable = sim.netPnLUsdt >= 0

    // Record execution in Arbitrage Store
    const newRecord = logExecution({
      timestamp: Date.now(),
      pair: arb.pair,
      strategyType: 'SPATIAL',
      buyExchange: arb.buyExchange,
      sellExchange: arb.sellExchange,
      buyPrice: sim.effectiveBuyPrice,
      sellPrice: sim.effectiveSellPrice,
      allocatedCapitalUsdt: capital,
      quantity: unitQty,
      grossSpreadPct: arb.grossSpreadPct,
      grossProfitUsdt: sim.grossPnLUsdt,
      buyFeeUsdt: sim.buyFeeUsdt,
      sellFeeUsdt: sim.sellFeeUsdt,
      networkGasFeeUsdt: sim.gasFeeUsdt,
      vwapSlippageCostUsdt: sim.slippageCostUsdt,
      totalCostsUsdt: sim.totalCostsUsdt,
      netProfitUsdt: sim.netPnLUsdt,
      netRoiPct: sim.netReturnPct,
      executionTimeMs: arb.executionTimeMs || 12,
      txHash,
      status: isTradeProfitable ? 'COMPLETED' : 'FAILED',
      notes: isTradeProfitable 
        ? `Atomic 2-leg crossing between ${arb.buyExchange} and ${arb.sellExchange}`
        : `Executed with net loss of -$${Math.abs(sim.netPnLUsdt)} due to venue fees exceeding gross spread`
    })

    setExecutedRecord(newRecord)
    setExecutionStep("settled")

    if (isTradeProfitable) {
      toast.success(`⚡ Arbitrage Executed! ${profitDisplay.text} net profit captured on ${arb.pair}`)
    } else {
      toast.error(`⚠️ Arbitrage Filled with Net Loss: ${profitDisplay.text} (fees exceeded spread)`)
    }

    if (onExecutionCompleted) {
      onExecutionCompleted(newRecord)
    }
  }

  const handleResetAndClose = () => {
    setExecutionStep("idle")
    setExecutedRecord(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="flex w-full max-w-[650px] flex-col overflow-hidden rounded-2xl border border-bg-border bg-bg-surface shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-bg-border px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-blue/10 text-accent-blue border border-accent-blue/20">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                <span>Instant Multi-Exchange Execution</span>
                <span className="rounded bg-accent-blue/10 px-2 py-0.5 text-[10px] font-bold text-accent-blue border border-accent-blue/20">
                  Atomic Sandbox Fill
                </span>
              </h2>
              <p className="text-xs text-text-secondary">Simultaneous 2-Leg Crossing ({arb.buyExchange} ➔ {arb.sellExchange})</p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="rounded-lg p-2 text-text-tertiary hover:bg-bg-elevated hover:text-text-primary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">

          {/* Pair & Venues Overview */}
          <div className="rounded-xl border border-bg-border bg-bg-base p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-text-primary">{arb.pair}</span>
                <span className="rounded bg-emerald-500/10 text-emerald-500 text-xs font-bold px-2.5 py-0.5 border border-emerald-500/20">
                  +{arb.grossSpreadPct}% Gross Spread
                </span>
              </div>
              <span className="text-xs font-mono text-text-secondary flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-accent-blue" />
                {arb.executionTimeMs}ms Speed
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-bg-border">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-text-tertiary font-bold">Leg 1: Buy Venue (Lowest Ask)</span>
                <div className="text-xs font-semibold text-text-primary flex items-center gap-1">
                  <span>{arb.buyExchange}</span>
                  <span className="text-[10px] text-text-tertiary font-mono">({arb.buyFeeRatePct || 0.035}% fee)</span>
                </div>
                <div className="font-mono text-sm font-bold text-emerald-500">${arb.buyPrice.toLocaleString()}</div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-text-tertiary font-bold">Leg 2: Sell Venue (Highest Bid)</span>
                <div className="text-xs font-semibold text-text-primary flex items-center gap-1">
                  <span>{arb.sellExchange}</span>
                  <span className="text-[10px] text-text-tertiary font-mono">({arb.sellFeeRatePct || 0.035}% fee)</span>
                </div>
                <div className="font-mono text-sm font-bold text-accent-blue">${arb.sellPrice.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Capital Allocation & Fee Breakdown */}
          {executionStep === "idle" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-text-secondary uppercase tracking-wider">Simulated Capital Size</span>
                <span className="font-mono font-bold text-accent-blue text-sm">${capital.toLocaleString()} USDT</span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {[2500, 5000, 10000, 25000, 50000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setCapital(amt)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      capital === amt
                        ? "border-accent-blue bg-accent-blue/15 text-accent-blue shadow-sm"
                        : "border-bg-border bg-bg-base text-text-secondary hover:text-text-primary hover:border-text-secondary"
                    }`}
                  >
                    ${(amt / 1000).toFixed(amt < 10000 ? 1 : 0)}k
                  </button>
                ))}
              </div>

              {/* Negative Return Warning Alert if fees exceed spread */}
              {!sim.isProfitable && (
                <div className="rounded-xl border border-accent-red/30 bg-accent-red/10 p-3.5 flex items-start gap-2.5 text-xs text-accent-red">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Negative Net Return Warning</span>
                    <span className="text-[11px] leading-relaxed block text-accent-red/90">
                      Trading fees and VWAP slippage (-${sim.totalCostsUsdt} USDT) exceed the gross spread (+${sim.grossPnLUsdt} USDT). Executing this pair will result in a net loss of {profitDisplay.text}.
                    </span>
                  </div>
                </div>
              )}

              {/* Itemized Fee & Cost Ledger */}
              <div className="rounded-xl border border-bg-border bg-bg-base p-4 space-y-2.5 text-xs font-mono">
                <div className="flex justify-between text-text-secondary">
                  <span>Order Quantity:</span>
                  <span className="text-text-primary font-bold">{unitQty} {baseSymbol}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Gross Value Spread:</span>
                  <span className="text-emerald-500 font-bold">+${sim.grossPnLUsdt} USDT</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Buy Venue Fee ({arb.buyExchange}):</span>
                  <span className="text-accent-red font-semibold">-${sim.buyFeeUsdt} USDT</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Sell Venue Fee ({arb.sellExchange}):</span>
                  <span className="text-accent-red font-semibold">-${sim.sellFeeUsdt} USDT</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Pre-Funded Cross-Exchange Gas:</span>
                  <span className="text-text-tertiary font-semibold">$0.00 USDT (Pre-Funded)</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>VWAP Slippage Cost ({sim.realizedSlippagePct}%):</span>
                  <span className="text-amber-500 font-semibold">-${sim.slippageCostUsdt} USDT</span>
                </div>

                <div className="pt-2 border-t border-bg-border flex justify-between items-center text-sm font-bold">
                  <span className="text-text-primary">Net Realized Profit:</span>
                  <div className="text-right">
                    <span className={`text-base font-black ${profitDisplay.colorClass}`}>
                      {profitDisplay.text}
                    </span>
                    <span className={`text-[11px] block ${profitDisplay.colorClass}`}>
                      ({roiDisplay.text} ROI)
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleStartExecution}
                className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
                  sim.isProfitable
                    ? "bg-accent-blue hover:bg-blue-600 text-white shadow-accent-blue/20"
                    : "bg-accent-red/90 hover:bg-accent-red text-white shadow-accent-red/20"
                }`}
              >
                <Zap className="h-4 w-4 fill-current" />
                <span>
                  {sim.isProfitable
                    ? `Execute Instant Arbitrage Fill (${profitDisplay.text})`
                    : `Execute Anyway (Loss: ${profitDisplay.text})`}
                </span>
              </button>
            </div>
          )}

          {/* Multi-Step Execution Visual Flow */}
          {executionStep !== "idle" && executionStep !== "settled" && (
            <div className="rounded-xl border border-bg-border bg-bg-base p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-bg-border">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">HFT Execution Pipeline</span>
                <span className="flex items-center gap-1.5 text-xs text-accent-blue font-mono">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Routing in Progress
                </span>
              </div>

              <div className="space-y-3">
                <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  executionStep === "routing_buy" ? "bg-accent-blue/10 border-accent-blue text-accent-blue" : "bg-bg-surface border-bg-border text-text-secondary"
                }`}>
                  <div className="h-6 w-6 rounded-full flex items-center justify-center bg-bg-elevated font-bold text-xs">1</div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-text-primary">Submitting Buy Order on {arb.buyExchange}</div>
                    <div className="text-[11px] text-text-tertiary font-mono">Qty: {unitQty} @ ${arb.buyPrice}</div>
                  </div>
                  {executionStep !== "routing_buy" && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                </div>

                <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  executionStep === "transferring" ? "bg-accent-blue/10 border-accent-blue text-accent-blue" : "bg-bg-surface border-bg-border text-text-secondary"
                }`}>
                  <div className="h-6 w-6 rounded-full flex items-center justify-center bg-bg-elevated font-bold text-xs">2</div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-text-primary">Cross-Exchange Pre-Funded Inventory Hedging</div>
                    <div className="text-[11px] text-text-tertiary font-mono">Slippage: {sim.realizedSlippagePct}% • Zero Gas</div>
                  </div>
                  {executionStep === "routing_sell" && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                </div>

                <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  executionStep === "routing_sell" ? "bg-accent-blue/10 border-accent-blue text-accent-blue" : "bg-bg-surface border-bg-border text-text-secondary"
                }`}>
                  <div className="h-6 w-6 rounded-full flex items-center justify-center bg-bg-elevated font-bold text-xs">3</div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-text-primary">Submitting Sell Order on {arb.sellExchange}</div>
                    <div className="text-[11px] text-text-tertiary font-mono">Qty: {unitQty} @ ${arb.sellPrice}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settled / Completed Confirmation */}
          {executionStep === "settled" && executedRecord && (
            <div className={`rounded-xl border p-6 space-y-4 text-center ${
              executedRecord.netProfitUsdt >= 0
                ? "border-emerald-500/30 bg-emerald-500/10"
                : "border-accent-red/30 bg-accent-red/10"
            }`}>
              <div className={`h-12 w-12 rounded-full mx-auto flex items-center justify-center border ${
                executedRecord.netProfitUsdt >= 0
                  ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/30"
                  : "bg-accent-red/20 text-accent-red border-accent-red/30"
              }`}>
                {executedRecord.netProfitUsdt >= 0 ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <AlertTriangle className="h-6 w-6" />
                )}
              </div>

              <div>
                <h3 className={`text-base font-bold ${
                  executedRecord.netProfitUsdt >= 0 ? "text-text-primary" : "text-accent-red"
                }`}>
                  {executedRecord.netProfitUsdt >= 0
                    ? "Arbitrage Successfully Captured!"
                    : "Arbitrage Completed with Net Loss"}
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  {executedRecord.netProfitUsdt >= 0
                    ? "Both exchange legs filled atomically with net positive spread."
                    : "Both legs filled, but total trading fees exceeded the gross spread."}
                </p>
              </div>

              <div className={`grid grid-cols-3 gap-3 py-3 border-y font-mono text-xs ${
                executedRecord.netProfitUsdt >= 0 ? "border-emerald-500/20" : "border-accent-red/20"
              }`}>
                <div>
                  <span className="text-[10px] text-text-tertiary block uppercase">Net Profit / PnL</span>
                  <span className={`text-sm font-black ${
                    executedRecord.netProfitUsdt >= 0 ? "text-emerald-500" : "text-accent-red"
                  }`}>
                    {formatProfit(executedRecord.netProfitUsdt).text}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-text-tertiary block uppercase">Return (ROI)</span>
                  <span className={`text-sm font-black ${
                    executedRecord.netProfitUsdt >= 0 ? "text-emerald-500" : "text-accent-red"
                  }`}>
                    {formatRoi(executedRecord.netRoiPct).text}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-text-tertiary block uppercase">Latency</span>
                  <span className="text-sm font-black text-text-primary">{executedRecord.executionTimeMs}ms</span>
                </div>
              </div>

              <div className="text-left font-mono text-[11px] text-text-tertiary break-all bg-bg-base/60 p-2.5 rounded-lg border border-bg-border">
                <span className="font-bold text-text-secondary block mb-0.5">Tx Hash:</span>
                {executedRecord.txHash}
              </div>

              <button
                onClick={handleResetAndClose}
                className="w-full py-3 rounded-xl bg-accent-blue hover:bg-blue-600 text-white font-bold text-xs shadow-md transition-all"
              >
                Close & View Execution Tracker
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
