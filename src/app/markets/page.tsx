"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { TrendingUp, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react"

const GrowthChart = dynamic(
  () => import("@/components/markets/GrowthChart").then((mod) => mod.GrowthChart),
  { ssr: false, loading: () => <div className="h-full w-full animate-pulse bg-bg-elevated rounded-md" /> }
)

import { useState, useEffect, memo } from "react"
import { motion } from "framer-motion"

interface MarketData {
  pair: string;
  price: number;
  change: number;
  isPositive: boolean;
  volume: string;
}

const INITIAL_MARKETS: MarketData[] = [
  { pair: "BTC/USDT", price: 0, change: 0, isPositive: true, volume: "..." },
  { pair: "ETH/USDT", price: 0, change: 0, isPositive: true, volume: "..." },
  { pair: "SOL/USDT", price: 0, change: 0, isPositive: true, volume: "..." },
  { pair: "AVAX/USDT", price: 0, change: 0, isPositive: true, volume: "..." },
  { pair: "LINK/USDT", price: 0, change: 0, isPositive: true, volume: "..." },
]

const TickerRow = memo(function TickerRow({ market }: { market: MarketData }) {
  const [flash, setFlash] = useState<string>("transparent")
  const [prevPrice, setPrevPrice] = useState(market.price)

  useEffect(() => {
    if (market.price === 0) return; // ignore initial load

    if (market.price > prevPrice) {
      setFlash("rgba(34, 197, 94, 0.15)") // Green flash
    } else if (market.price < prevPrice) {
      setFlash("rgba(239, 68, 68, 0.15)") // Red flash
    }
    setPrevPrice(market.price)

    const timeout = setTimeout(() => {
      setFlash("transparent")
    }, 500)
    return () => clearTimeout(timeout)
  }, [market.price])

  return (
    <motion.tr 
      animate={{ backgroundColor: flash }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="group cursor-pointer border-b border-bg-border"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-elevated text-[10px] font-bold text-text-secondary">
            {market.pair.split('/')[0]}
          </div>
          <span className="font-semibold text-text-primary">{market.pair}</span>
        </div>
      </td>
      <td className="px-6 py-4 font-mono text-[15px] text-text-primary">
        ${market.price > 0 ? market.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : "---"}
      </td>
      <td className={`px-6 py-4 font-mono text-[14px] ${market.isPositive ? 'text-accent-green' : 'text-accent-red'}`}>
        <div className="flex items-center">
          {market.isPositive ? <ArrowUpRight className="mr-1 h-4 w-4" /> : <ArrowDownRight className="mr-1 h-4 w-4" />}
          {market.isPositive ? "+" : ""}{market.change.toFixed(2)}%
        </div>
      </td>
      <td className="px-6 py-4 text-right font-mono text-[14px] text-text-secondary">{market.volume}</td>
    </motion.tr>
  )
})

export default function MarketsPage() {
  const [markets, setMarkets] = useState<MarketData[]>(INITIAL_MARKETS)

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const symbols = '["BTCUSDT","ETHUSDT","SOLUSDT","AVAXUSDT","LINKUSDT"]'
        const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${symbols}`)
        const data = await response.json()

        if (Array.isArray(data)) {
          const formatted = data.map((item: any) => {
            const pair = item.symbol.replace("USDT", "/USDT")
            const change = parseFloat(item.priceChangePercent)
            // format volume (e.g. 1.2B or 450M)
            const volNum = parseFloat(item.quoteVolume)
            const volume = volNum > 1e9 ? `$${(volNum / 1e9).toFixed(1)}B` : `$${(volNum / 1e6).toFixed(0)}M`

            return {
              pair,
              price: parseFloat(item.lastPrice),
              change: change,
              isPositive: change >= 0,
              volume: volume
            }
          })
          
          // Order by initial array
          const ordered = INITIAL_MARKETS.map(init => formatted.find(f => f.pair === init.pair) || init)
          setMarkets(ordered as MarketData[])
        }
      } catch (e) {
        console.error("Failed to fetch markets", e)
      }
    }

    // Initial fetch
    fetchMarkets()
    
    // Poll every 5 seconds
    const interval = setInterval(fetchMarkets, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex min-h-[calc(100vh-64px)] w-full flex-col bg-[#070A0D] p-6 lg:p-10">
      <div className="mx-auto w-full max-w-[1200px]">
        
        {/* Top Overview Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex flex-col justify-between rounded-[var(--radius-lg)] border border-bg-border bg-bg-surface p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-blue/10">
                <Wallet className="h-5 w-5 text-accent-blue" />
              </div>
              <span className="text-[14px] font-semibold text-text-secondary">Estimated Balance</span>
            </div>
            <div className="mt-6 flex flex-col">
              <span className="font-mono text-[36px] font-bold text-text-primary">$13,850.00</span>
              <span className="flex items-center text-[13px] text-accent-green">
                <ArrowUpRight className="mr-1 h-4 w-4" />
                +$1,450.00 (11.7%) this week
              </span>
            </div>
          </div>

          <div className="col-span-1 rounded-[var(--radius-lg)] border border-bg-border bg-bg-surface p-6 shadow-[var(--shadow-card)] md:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[14px] font-semibold text-text-secondary">Portfolio Growth</span>
              <div className="flex gap-2">
                {["1W", "1M", "1Y", "ALL"].map((tf, i) => (
                  <button key={tf} className={`rounded px-2 py-1 text-[12px] font-medium transition-colors ${i === 0 ? "bg-bg-elevated text-text-primary" : "text-text-tertiary hover:text-text-secondary"}`}>
                    {tf}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[140px] w-full">
              <GrowthChart />
            </div>
          </div>
        </div>

        {/* Live Markets Table */}
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-bg-border bg-bg-surface shadow-[var(--shadow-card)]">
          <div className="border-b border-bg-border bg-[#0F1318] px-6 py-4">
            <h2 className="text-[18px] font-bold text-text-primary flex items-center gap-2">
              Live Markets
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-green"></span>
              </span>
            </h2>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-bg-border text-[12px] uppercase tracking-wider text-text-secondary">
                <th className="px-6 py-4 font-semibold">Trading Pair</th>
                <th className="px-6 py-4 font-semibold">Last Price</th>
                <th className="px-6 py-4 font-semibold">24h Change</th>
                <th className="px-6 py-4 text-right font-semibold">24h Volume</th>
              </tr>
            </thead>
            <tbody>
              {markets.map((market) => (
                <TickerRow key={market.pair} market={market} />
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
