"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"

interface TickerData {
  symbol: string;
  price: number;
  change: number;
  flash?: 'up' | 'down' | null;
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
  const tickersRef = useRef(INITIAL_TICKERS)

  useEffect(() => {
    let ws: WebSocket;
    
    const connectWS = () => {
      ws = new WebSocket('wss://stream.binance.com:9443/ws/!ticker@arr')
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        
        setTickers(currentTickers => {
          let updated = false;
          const newTickers = currentTickers.map(t => {
            const update = data.find((d: any) => d.s === `${t.symbol}USDT`)
            if (update) {
              const newPrice = parseFloat(update.c)
              const oldPrice = t.price
              let flash: 'up' | 'down' | null = null;
              
              if (newPrice > oldPrice) flash = 'up';
              else if (newPrice < oldPrice) flash = 'down';
              
              if (flash) updated = true;
              
              return {
                ...t,
                price: newPrice,
                change: parseFloat(update.P),
                flash: flash || t.flash
              }
            }
            return t
          })
          
          if (updated) {
            tickersRef.current = newTickers;
            return newTickers;
          }
          return currentTickers;
        })
        
        // Clear flash after 500ms
        setTimeout(() => {
          setTickers(curr => curr.map(t => ({ ...t, flash: null })))
        }, 500)
      }
      
      ws.onerror = () => {
        ws.close()
      }
    }
    
    connectWS()
    
    return () => {
      if (ws) ws.close()
    }
  }, [])

  return (
    <div className="flex h-[36px] w-full overflow-hidden border-b border-bg-border bg-bg-surface">
      <div className="flex animate-marquee whitespace-nowrap hover:[animation-play-state:paused]">
        {/* Render the list twice to create a seamless infinite loop */}
        {[...tickers, ...tickers].map((ticker, index) => {
          const isPositive = ticker.change >= 0
          
          let flashClass = "";
          if (ticker.flash === 'up') flashClass = "text-accent-green transition-colors duration-75";
          else if (ticker.flash === 'down') flashClass = "text-accent-red transition-colors duration-75";
          else flashClass = "text-text-secondary transition-colors duration-500";
          
          return (
            <div key={`${ticker.symbol}-${index}`} className="flex items-center">
              <div className="flex items-center gap-2 px-6 font-mono text-[13px]">
                {/* Initial circle placeholder */}
                <div className="h-4 w-4 rounded-full bg-bg-elevated text-[8px] flex items-center justify-center font-bold text-text-tertiary">
                  {ticker.symbol[0]}
                </div>
                <span className="font-semibold text-text-primary">{ticker.symbol}</span>
                <span className={flashClass}>
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
