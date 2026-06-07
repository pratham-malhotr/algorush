"use client"

import * as React from "react"

const MOCK_TICKERS = [
  { symbol: "BTC", price: 64230.5, change: 2.4 },
  { symbol: "ETH", price: 3450.2, change: 1.8 },
  { symbol: "BNB", price: 580.4, change: -0.5 },
  { symbol: "SOL", price: 145.2, change: 5.2 },
  { symbol: "XRP", price: 0.52, change: 0.1 },
  { symbol: "ADA", price: 0.45, change: -1.2 },
  { symbol: "MATIC", price: 0.72, change: 3.4 },
  { symbol: "AVAX", price: 35.8, change: -2.1 },
  { symbol: "DOT", price: 7.2, change: 1.1 },
  { symbol: "DOGE", price: 0.15, change: 8.4 },
]

export function LiveTicker() {
  return (
    <div className="flex h-[36px] w-full overflow-hidden border-b border-bg-border bg-bg-surface">
      <div className="flex animate-marquee whitespace-nowrap">
        {/* Render the list twice to create a seamless infinite loop */}
        {[...MOCK_TICKERS, ...MOCK_TICKERS].map((ticker, index) => {
          const isPositive = ticker.change >= 0
          return (
            <div key={`${ticker.symbol}-${index}`} className="flex items-center">
              <div className="flex items-center gap-2 px-6 font-mono text-[13px]">
                {/* Placeholder for coin icon */}
                <div className="h-4 w-4 rounded-full bg-bg-elevated" />
                <span className="font-semibold text-text-primary">{ticker.symbol}</span>
                <span className="text-text-secondary">${ticker.price.toLocaleString()}</span>
                <span className={isPositive ? "text-accent-green" : "text-accent-red"}>
                  {isPositive ? "▲" : "▼"} {Math.abs(ticker.change)}%
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
