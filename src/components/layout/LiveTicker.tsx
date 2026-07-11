"use client"

import * as React from "react"
import { useState, useEffect } from "react"

interface TickerData {
  symbol: string;
  price: number;
  change: number;
}

const INITIAL_TICKERS: TickerData[] = [
  { symbol: "BTC", price: 64230.5, change: 1.2 },
  { symbol: "ETH", price: 3450.2, change: 0.8 },
  { symbol: "BNB", price: 580.4, change: -0.5 },
  { symbol: "SOL", price: 145.2, change: 5.2 },
  { symbol: "XRP", price: 0.52, change: 0.1 },
  { symbol: "ADA", price: 0.45, change: -1.2 },
  { symbol: "DOGE", price: 0.15, change: 8.4 },
  { symbol: "AVAX", price: 35.8, change: -2.1 },
  { symbol: "LINK", price: 14.2, change: 1.1 },
  { symbol: "DOT", price: 7.2, change: 0.5 },
]

export function LiveTicker() {
  const [tickers, setTickers] = useState<TickerData[]>(INITIAL_TICKERS)

  useEffect(() => {
    const fetchTicker = async () => {
      try {
        const symbols = INITIAL_TICKERS.map(t => `"${t.symbol}USDT"`).join(',')
        const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=[${symbols}]`)
        const data = await response.json()
        
        if (Array.isArray(data)) {
           const formatted = data.map((item: any) => ({
              symbol: item.symbol.replace("USDT", ""),
              price: parseFloat(item.lastPrice),
              change: parseFloat(item.priceChangePercent)
           }))
           
           // Ensure we keep the same order as INITIAL_TICKERS
           const sortedFormatted = INITIAL_TICKERS.map(t => {
             const found = formatted.find(f => f.symbol === t.symbol)
             return found || t
           })
           
           setTickers(sortedFormatted)
        }
      } catch (e) {
        console.error("Failed to fetch live ticker data", e)
      }
    }
    
    fetchTicker()
    const interval = setInterval(fetchTicker, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex h-[36px] w-full overflow-hidden border-b border-bg-border bg-bg-surface">
      <div className="flex animate-marquee whitespace-nowrap">
        {/* Render the list twice to create a seamless infinite loop */}
        {[...tickers, ...tickers].map((ticker, index) => {
          const isPositive = ticker.change >= 0
          return (
            <div key={`${ticker.symbol}-${index}`} className="flex items-center">
              <div className="flex items-center gap-2 px-6 font-mono text-[13px]">
                {/* Initial circle placeholder */}
                <div className="h-4 w-4 rounded-full bg-bg-elevated text-[8px] flex items-center justify-center font-bold text-text-tertiary">
                  {ticker.symbol[0]}
                </div>
                <span className="font-semibold text-text-primary">{ticker.symbol}</span>
                <span className="text-text-secondary">
                  ${ticker.price > 0 ? ticker.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : "---"}
                </span>
                <span className={isPositive ? "text-accent-green" : "text-accent-red"}>
                  {isPositive ? "▲" : "▼"} {Math.abs(ticker.change).toFixed(2)}%
                </span>
              </div>
              <div className="h-4 w-px bg-bg-border" />
            </div>
          )
        })}
      </div>
    </div>
  )
}
