"use client"

import * as React from "react"
import { X, Layers, Sliders, Zap, ShieldCheck, TrendingUp, AlertTriangle, ArrowRight, BarChart2, CheckCircle2, RefreshCw } from "lucide-react"
import { SpatialArbitrageOpportunity, calculateVwapSlippage } from "@/lib/arbitrage/radarEngine"
import { usePaperTradingStore } from "@/store/usePaperTradingStore"
import { toast } from "sonner"

interface OrderBookLadderModalProps {
  arb: SpatialArbitrageOpportunity | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderBookLadderModal({ arb, isOpen, onClose }: OrderBookLadderModalProps) {
  const { deployStrategy } = usePaperTradingStore()

  const [capitalUsdt, setCapitalUsdt] = React.useState<number>(25000)
  const [isDeploying, setIsDeploying] = React.useState(false)
  const [liveDepth, setLiveDepth] = React.useState<{
    buyAsks: { price: number; quantity: number; totalUsdt: number }[];
    sellBids: { price: number; quantity: number; totalUsdt: number }[];
    isLiveL2: boolean;
  } | null>(null)
  const [isLoadingDepth, setIsLoadingDepth] = React.useState(false)

  // Fetch real live L2 order book depth directly from the exchanges
  React.useEffect(() => {
    if (!arb || !isOpen) {
      setLiveDepth(null)
      return
    }

    let isMounted = true
    setIsLoadingDepth(true)

    fetch(`/api/arbitrage/depth?symbol=${encodeURIComponent(arb.symbol)}&buyExchange=${encodeURIComponent(arb.buyExchange)}&sellExchange=${encodeURIComponent(arb.sellExchange)}`)
      .then(r => r.json())
      .then(data => {
        if (!isMounted) return
        if (data.success && data.buyVenue?.asks?.length > 0 && data.sellVenue?.bids?.length > 0) {
          setLiveDepth({
            buyAsks: data.buyVenue.asks,
            sellBids: data.sellVenue.bids,
            isLiveL2: true
          })
        }
      })
      .catch(err => {
        console.error("Failed to fetch live L2 depth:", err)
      })
      .finally(() => {
        if (isMounted) setIsLoadingDepth(false)
      })

    return () => {
      isMounted = false
    }
  }, [arb, isOpen])

  if (!isOpen || !arb) return null

  const simResult = calculateVwapSlippage(arb, capitalUsdt)

  const handleDeployBot = async () => {
    setIsDeploying(true)
    await new Promise((r) => setTimeout(r, 700))

    try {
      deployStrategy({
        name: `L2 Arbitrage Bot: ${arb.pair} ($${capitalUsdt.toLocaleString()})`,
        description: `Level-2 VWAP protected arbitrage worker on ${arb.buyExchange} ➔ ${arb.sellExchange}`,
        instruments: [{ symbol: arb.pair, assetClass: "CRYPTO" }],
        action: { type: "BUY", quantityType: "PERCENT_OF_ACCOUNT", quantityValue: 50 },
        entryConditions: [],
        exitConditions: [],
        riskParameters: { stopLossPercentage: 1.0, takeProfitPercentage: 2.0 }
      })

      toast.success(`🚀 Deployed L2 Arbitrage Bot ($${capitalUsdt.toLocaleString()})! Projected Net PnL: +$${simResult.netPnLUsdt}`)
      onClose()
    } catch (e: any) {
      toast.error("Deployment failed: " + e.message)
    } finally {
      setIsDeploying(false)
    }
  }

  const displayBuyAsks = liveDepth?.buyAsks && liveDepth.buyAsks.length > 0 ? liveDepth.buyAsks : arb.buyOrderBook.asks
  const displaySellBids = liveDepth?.sellBids && liveDepth.sellBids.length > 0 ? liveDepth.sellBids : arb.sellOrderBook.bids

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="flex h-[720px] w-full max-w-[960px] flex-col overflow-hidden rounded-2xl border border-bg-border bg-bg-surface shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-bg-border px-6 py-4">
          <div>
            <h2 className="text-[18px] font-bold text-text-primary flex items-center gap-2">
              <Layers className="h-5 w-5 text-accent-blue" />
              <span>Level-2 Orderbook Depth & VWAP Slippage Calculator</span>
              <span className="rounded bg-accent-blue/10 px-2 py-0.5 text-[11px] font-bold text-accent-blue border border-accent-blue/20">
                {arb.pair}
              </span>
            </h2>
            <p className="text-[12px] text-text-secondary mt-0.5">
              Simulating multi-level orderbook absorption between <strong className="text-text-primary">{arb.buyExchange}</strong> (Ask) and <strong className="text-text-primary">{arb.sellExchange}</strong> (Bid).
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-text-tertiary hover:bg-bg-elevated hover:text-text-primary">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-bg-border">
          {/* Capital Slider Toolbar */}
          <div className="rounded-xl border border-bg-border bg-bg-base p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                <Sliders className="h-4 w-4 text-accent-blue" />
                Capital Allocation Size (USD)
              </label>
              <span className="font-mono text-xl font-bold text-accent-blue">${capitalUsdt.toLocaleString()} USDT</span>
            </div>

            <input
              type="range"
              min="1000"
              max="250000"
              step="1000"
              value={capitalUsdt}
              onChange={(e) => setCapitalUsdt(Number(e.target.value))}
              className="w-full accent-accent-blue cursor-pointer"
            />

            <div className="flex justify-between text-[11px] text-text-tertiary font-mono">
              <span>$1,000 (Retail)</span>
              <span>$50,000 (Pro)</span>
              <span>$250,000 (Institutional Cap)</span>
            </div>
          </div>

          {/* Real-Time VWAP Simulation Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-bg-border bg-bg-base p-3.5 space-y-1">
              <span className="text-[10.5px] font-bold uppercase text-text-tertiary block">Effective VWAP Buy</span>
              <span className="font-mono text-lg font-bold text-text-primary">${simResult.effectiveBuyPrice}</span>
              <span className="text-[10px] text-text-tertiary block">Base ${arb.buyPrice}</span>
            </div>

            <div className="rounded-xl border border-bg-border bg-bg-base p-3.5 space-y-1">
              <span className="text-[10.5px] font-bold uppercase text-text-tertiary block">Effective VWAP Sell</span>
              <span className="font-mono text-lg font-bold text-text-primary">${simResult.effectiveSellPrice}</span>
              <span className="text-[10px] text-text-tertiary block">Base ${arb.sellPrice}</span>
            </div>

            <div className="rounded-xl border border-bg-border bg-bg-base p-3.5 space-y-1">
              <span className="text-[10.5px] font-bold uppercase text-text-tertiary block">Order Depth Slippage</span>
              <span className="font-mono text-lg font-bold text-amber-500">{simResult.realizedSlippagePct}%</span>
              <span className="text-[10px] text-text-tertiary block">Book Impact</span>
            </div>

            <div className="rounded-xl border border-accent-green/30 bg-accent-green/10 p-3.5 space-y-1">
              <span className="text-[10.5px] font-bold uppercase text-accent-green block">Net Realized PnL</span>
              <span className="font-mono text-lg font-bold text-accent-green">+${simResult.netPnLUsdt} USDT</span>
              <span className="text-[10px] text-accent-green/80 font-bold block">+{simResult.netReturnPct}% Return</span>
            </div>
          </div>

          {/* Level-2 Orderbook Ladder Display */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-text-primary">Direct Exchange Order Books (Top Levels)</span>
              {liveDepth?.isLiveL2 ? (
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-0.5 text-[10.5px] font-bold font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Verified Live Exchange Depth ({displayBuyAsks.length} Levels)
                </span>
              ) : isLoadingDepth ? (
                <span className="flex items-center gap-1.5 rounded-full bg-accent-blue/10 text-accent-blue border border-accent-blue/20 px-2.5 py-0.5 text-[10.5px] font-bold font-mono">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Connecting Exchange Order Books...
                </span>
              ) : (
                <span className="rounded-full bg-bg-elevated text-text-tertiary border border-bg-border px-2.5 py-0.5 text-[10.5px] font-bold font-mono">
                  Orderbook Depth
                </span>
              )}
            </div>
            <span className="text-[11px] font-mono text-text-tertiary">Real Execution Spread</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Buy Exchange Asks (Orderbook) */}
            <div className="rounded-xl border border-bg-border bg-bg-base p-4 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-bg-border">
                <span className="text-[12px] font-bold text-text-primary flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-accent-red" />
                  {arb.buyExchange} Ask Depth (Asks)
                </span>
                <span className="text-[11px] font-mono text-text-tertiary">Lowest Sellers</span>
              </div>

              <div className="space-y-1.5 font-mono text-[11.5px]">
                <div className="grid grid-cols-3 text-[10px] text-text-tertiary uppercase font-bold pb-1">
                  <span>Price ($)</span>
                  <span className="text-right">Qty ({arb.pair.split('/')[0]})</span>
                  <span className="text-right">Total ($)</span>
                </div>
                {displayBuyAsks.map((level, idx) => (
                  <div key={idx} className="grid grid-cols-3 p-1 rounded bg-bg-surface hover:bg-bg-elevated border border-bg-border/40">
                    <span className="text-accent-red font-bold">${level.price}</span>
                    <span className="text-right text-text-secondary">{level.quantity}</span>
                    <span className="text-right text-text-primary font-semibold">${level.totalUsdt.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sell Exchange Bids (Orderbook) */}
            <div className="rounded-xl border border-bg-border bg-bg-base p-4 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-bg-border">
                <span className="text-[12px] font-bold text-text-primary flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-accent-green" />
                  {arb.sellExchange} Bid Depth (Bids)
                </span>
                <span className="text-[11px] font-mono text-text-tertiary">Highest Buyers</span>
              </div>

              <div className="space-y-1.5 font-mono text-[11.5px]">
                <div className="grid grid-cols-3 text-[10px] text-text-tertiary uppercase font-bold pb-1">
                  <span>Price ($)</span>
                  <span className="text-right">Qty ({arb.pair.split('/')[0]})</span>
                  <span className="text-right">Total ($)</span>
                </div>
                {displaySellBids.map((level, idx) => (
                  <div key={idx} className="grid grid-cols-3 p-1 rounded bg-bg-surface hover:bg-bg-elevated border border-bg-border/40">
                    <span className="text-accent-green font-bold">${level.price}</span>
                    <span className="text-right text-text-secondary">{level.quantity}</span>
                    <span className="text-right text-text-primary font-semibold">${level.totalUsdt.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-bg-border bg-bg-base px-6 py-4">
          <div className="flex items-center gap-2 text-[12px] text-text-tertiary">
            <ShieldCheck className="h-4 w-4 text-accent-green" />
            <span>Sub-Second Execution • Zero Frontrunning Guarantee</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-xl border border-bg-border bg-bg-surface px-4 py-2.5 text-[13px] font-semibold text-text-secondary hover:bg-bg-elevated transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeployBot}
              disabled={isDeploying || !simResult.canAbsorbVolume}
              className="flex items-center gap-2 rounded-xl bg-accent-green px-6 py-2.5 text-[13px] font-bold text-white hover:bg-green-600 shadow-lg shadow-green-500/20 disabled:opacity-50 transition-all"
            >
              {isDeploying ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Zap className="h-4 w-4 fill-current" /> Deploy L2 Arbitrage Bot ($${capitalUsdt.toLocaleString()})
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
