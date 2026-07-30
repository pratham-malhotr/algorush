"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { Wallet, ArrowUpRight, ArrowDownRight, Search, Plus, Minus, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAccount, useBalance } from "wagmi"
import { useState, useEffect, memo, useMemo } from "react"
import { motion } from "framer-motion"

import { ALL_ASSETS, Asset } from "@/lib/constants/assets"
import { useWatchlistStore } from "@/store/useWatchlistStore"

const GrowthChart = dynamic(
  () => import("@/components/markets/GrowthChart").then((mod) => mod.GrowthChart),
  { ssr: false, loading: () => <div className="h-full w-full animate-pulse bg-bg-elevated rounded-md" /> }
)

interface MarketDisplayData extends Asset {
  price: number;
  change: number;
  isPositive: boolean;
  volume: string;
}

const TickerRow = memo(function TickerRow({ 
  market, 
  isWatchlisted, 
  onToggleWatchlist 
}: { 
  market: MarketDisplayData, 
  isWatchlisted: boolean,
  onToggleWatchlist: (e: React.MouseEvent, symbol: string) => void
}) {
  const [flash, setFlash] = useState<string>("transparent")
  const prevPriceRef = React.useRef(market.price)
  const router = useRouter()

  useEffect(() => {
    if (market.price === 0) return; 
    const prevPrice = prevPriceRef.current;
    
    setTimeout(() => {
      if (market.price > prevPrice) setFlash("rgba(34, 197, 94, 0.15)") // Green
      else if (market.price < prevPrice) setFlash("rgba(239, 68, 68, 0.15)") // Red
    }, 0);
    
    prevPriceRef.current = market.price;

    const timeout = setTimeout(() => setFlash("transparent"), 500)
    return () => clearTimeout(timeout)
  }, [market.price])

  const handleClick = () => {
    const routeSymbol = market.symbol.replace('/', '-')
    router.push(`/markets/${routeSymbol}`)
  }

  return (
    <motion.tr 
      onClick={handleClick}
      animate={{ backgroundColor: flash }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="group cursor-pointer border-b border-bg-border hover:bg-bg-elevated transition-colors"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={(e) => onToggleWatchlist(e, market.symbol)}
            className="p-1.5 rounded-md hover:bg-bg-surface transition-colors"
          >
            {isWatchlisted ? (
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            ) : (
              <Star className="h-4 w-4 text-text-tertiary group-hover:text-text-secondary" />
            )}
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-surface border border-bg-border text-[10px] font-bold text-text-secondary">
            {market.symbol.split('/')[0].slice(0, 3)}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-text-primary">{market.symbol}</span>
            <span className="text-[11px] text-text-tertiary uppercase">{market.market.replace('_', ' ')}</span>
          </div>
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
  const { address, isConnected } = useAccount()
  const { data: balanceData } = useBalance({ address })
  
  const { watchlistedSymbols, addWatchlist, removeWatchlist, isWatchlisted } = useWatchlistStore()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<'WATCHLIST' | 'ALL'>('ALL')
  const [accountMode, setAccountMode] = useState<'LIVE' | 'DEMO'>('LIVE')
  
  // Initialize market states with dummy data before Binance populates it
  const [marketDataMap, setMarketDataMap] = useState<Record<string, MarketDisplayData>>(() => {
    const initialMap: Record<string, MarketDisplayData> = {}
    ALL_ASSETS.forEach(asset => {
      initialMap[asset.symbol] = {
        ...asset,
        price: asset.price || 100,
        change: (Math.random() * 4) - 2, // Random initial change
        isPositive: true,
        volume: `$${(Math.random() * 10 + 1).toFixed(1)}B`
      }
    })
    return initialMap
  })

  // Poll live data
  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr`)
        const data = await response.json()

        setMarketDataMap(prev => {
          const newMap = { ...prev }
          
          // Update Cryptos
          if (Array.isArray(data)) {
            data.forEach((item: any) => {
              const pair = item.symbol.replace("USDT", "/USDT")
              if (newMap[pair]) {
                const change = parseFloat(item.priceChangePercent)
                const volNum = parseFloat(item.quoteVolume)
                newMap[pair].price = parseFloat(item.lastPrice)
                newMap[pair].change = change
                newMap[pair].isPositive = change >= 0
                newMap[pair].volume = volNum > 1e9 ? `$${(volNum / 1e9).toFixed(1)}B` : `$${(volNum / 1e6).toFixed(0)}M`
              }
            })
          }
          
          // Simulate volatility for equities
          Object.values(newMap).forEach(market => {
            if (market.market !== 'CRYPTO') {
              const volatility = 0.001
              market.price = market.price * (1 + ((Math.random() * volatility * 2) - volatility))
            }
          })
          
          return newMap
        })
      } catch (e) {
        // Suppress console.error to avoid triggering Next.js dev overlay on CORS/AdBlock failures.
        // The app will just gracefully use the initial mock data.
        console.warn("Failed to fetch live markets, using mock data.", e)
      }
    }

    fetchMarkets()
    const interval = setInterval(fetchMarkets, 5000)
    return () => clearInterval(interval)
  }, [])

  // Filter logic
  const displayedMarkets = useMemo(() => {
    let filtered = Object.values(marketDataMap)
    
    if (activeTab === 'WATCHLIST') {
      filtered = filtered.filter(m => watchlistedSymbols.includes(m.symbol))
    }
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(m => 
        m.symbol.toLowerCase().includes(q) || 
        m.name.toLowerCase().includes(q)
      )
    } else if (activeTab === 'ALL') {
      // Limit to 50 when not searching to prevent lag
      filtered = filtered.slice(0, 50)
    }
    
    return filtered
  }, [marketDataMap, searchQuery, activeTab, watchlistedSymbols])

  const handleToggleWatchlist = (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation()
    if (isWatchlisted(symbol)) removeWatchlist(symbol)
    else addWatchlist(symbol)
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] w-full flex-col bg-white p-6 lg:p-10">
      <div className="mx-auto w-full max-w-[1200px]">
        
        {/* Top Overview Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex flex-col justify-between rounded-[var(--radius-lg)] border border-bg-border bg-bg-surface p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-blue/10">
                  <Wallet className="h-5 w-5 text-accent-blue" />
                </div>
                <span className="text-[14px] font-semibold text-text-secondary">Estimated Balance</span>
              </div>
              
              <div className="flex items-center gap-1 bg-bg-elevated p-1 rounded-lg">
                <button 
                  onClick={() => setAccountMode('LIVE')}
                  className={`px-3 py-1 text-[11px] font-bold rounded-md transition-colors ${accountMode === 'LIVE' ? 'bg-bg-surface text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-secondary'}`}
                >
                  LIVE
                </button>
                <button 
                  onClick={() => setAccountMode('DEMO')}
                  className={`px-3 py-1 text-[11px] font-bold rounded-md transition-colors ${accountMode === 'DEMO' ? 'bg-bg-surface text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-secondary'}`}
                >
                  DEMO
                </button>
              </div>
            </div>
            
            <div className="mt-6 flex flex-col">
              <span className="font-mono text-[36px] font-bold text-text-primary">
                {accountMode === 'DEMO' 
                  ? "$12,000.00" 
                  : (isConnected && balanceData ? `${Number(balanceData.formatted).toLocaleString(undefined, { maximumFractionDigits: 4 })} ${balanceData.symbol}` : "$0.00")
                }
              </span>
              <span className="flex items-center text-[13px] text-text-tertiary">
                {accountMode === 'DEMO' 
                  ? "Paper Trading Balance" 
                  : (isConnected ? "Wallet Connected" : "Connect wallet to view balance")
                }
              </span>
            </div>
          </div>

          <div className="col-span-1 rounded-[var(--radius-lg)] border border-bg-border bg-bg-surface p-6 shadow-[var(--shadow-card)] md:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[14px] font-semibold text-text-secondary">Portfolio Growth</span>
            </div>
            <div className="h-[140px] w-full">
              <GrowthChart />
            </div>
          </div>
        </div>

        {/* Live Markets & Watchlist Table */}
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-bg-border bg-bg-surface shadow-[var(--shadow-card)]">
          <div className="border-b border-bg-border bg-bg-surface px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div className="flex items-center gap-4">
              <h2 className="text-[18px] font-bold text-text-primary flex items-center gap-2">
                Markets
                <span className="relative flex h-2 w-2 ml-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-green"></span>
                </span>
              </h2>
              <div className="flex bg-bg-elevated rounded-lg p-1">
                <button 
                  onClick={() => setActiveTab('WATCHLIST')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'WATCHLIST' ? 'bg-bg-surface text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-secondary'}`}
                >
                  Watchlist ({watchlistedSymbols.length})
                </button>
                <button 
                  onClick={() => setActiveTab('ALL')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'ALL' ? 'bg-bg-surface text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-secondary'}`}
                >
                  Discover
                </button>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
              <input 
                type="text" 
                placeholder="Search symbol (e.g. SBI, BTC, INTU)..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-[280px] pl-9 pr-4 py-2 bg-bg-elevated border border-bg-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-blue transition-shadow placeholder:text-text-tertiary"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="border-b border-bg-border text-[12px] uppercase tracking-wider text-text-secondary bg-bg-surface">
                  <th className="px-6 py-4 font-semibold">Asset</th>
                  <th className="px-6 py-4 font-semibold">Last Price</th>
                  <th className="px-6 py-4 font-semibold">24h Change</th>
                  <th className="px-6 py-4 text-right font-semibold">24h Volume</th>
                </tr>
              </thead>
              <tbody>
                {displayedMarkets.length > 0 ? displayedMarkets.map((market) => (
                  <TickerRow 
                    key={market.symbol} 
                    market={market} 
                    isWatchlisted={isWatchlisted(market.symbol)}
                    onToggleWatchlist={handleToggleWatchlist}
                  />
                )) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-text-tertiary">
                      {searchQuery ? 'No assets found matching your search.' : 'Your watchlist is empty.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
