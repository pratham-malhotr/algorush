import * as React from "react"
import { useBuilderStore } from "@/store/useBuilderStore"
import { Button } from "@/components/ui/button"
import { AssetSelector } from "./AssetSelector"

export function SettingsPanel() {
  const { 
    exchange, setExchange,
    tradingPair, setTradingPair,
    allocation, setAllocation,
    maxPerTrade, setMaxPerTrade
  } = useBuilderStore()

  return (
    <div className="flex h-full w-[320px] shrink-0 flex-col overflow-y-auto border-l border-bg-border bg-bg-surface p-5">
      <h3 className="mb-6 text-[16px] font-bold text-text-primary">Strategy Settings</h3>

      {/* Exchange & Market */}
      <div className="mb-8 flex flex-col gap-4">
        <h4 className="text-[12px] font-bold uppercase tracking-wider text-text-secondary">Exchange & Market</h4>
        
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] text-text-secondary">Exchange</label>
          <select 
            value={exchange}
            onChange={(e) => setExchange(e.target.value)}
            className="h-10 w-full rounded-md border border-bg-border bg-bg-base px-3 text-[14px] text-text-primary outline-none"
          >
            <option value="Binance">Binance</option>
            <option value="Coinbase">Coinbase</option>
            <option value="Kraken">Kraken</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] text-text-secondary">Trading Pair / Asset</label>
          <AssetSelector 
            value={tradingPair}
            onChange={setTradingPair}
          />
        </div>
      </div>

      {/* Capital Allocation */}
      <div className="mb-8 flex flex-col gap-4">
        <h4 className="text-[12px] font-bold uppercase tracking-wider text-text-secondary">Capital Allocation</h4>
        
        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <span className="text-[12px] text-text-secondary">Total Allocation</span>
            <span className="font-mono text-[12px] text-text-primary">{allocation}%</span>
          </div>
          <input 
            type="range" 
            min="1" max="100" 
            value={allocation}
            onChange={(e) => setAllocation(Number(e.target.value))}
            className="w-full accent-accent-blue"
          />
          <div className="mt-1 text-[11px] text-text-tertiary">
            Using ${((8420 * allocation) / 100).toFixed(2)} USDT
          </div>
        </div>

        <div className="flex flex-col gap-1 mt-2">
          <div className="flex justify-between">
            <span className="text-[12px] text-text-secondary">Max Per Trade</span>
            <span className="font-mono text-[12px] text-text-primary">{maxPerTrade}%</span>
          </div>
          <input 
            type="range" 
            min="1" max="100" 
            value={maxPerTrade}
            onChange={(e) => setMaxPerTrade(Number(e.target.value))}
            className="w-full accent-accent-blue"
          />
        </div>
      </div>

    </div>
  )
}
