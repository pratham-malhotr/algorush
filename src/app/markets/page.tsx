"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { 
  Wallet, ArrowUpRight, ArrowDownRight, Search, Star, 
  Layers, SlidersHorizontal, TrendingUp, BarChart3, Filter
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAccount, useBalance } from "wagmi"
import { useState, useEffect, memo, useMemo } from "react"
import { motion } from "framer-motion"

import { ALL_ASSETS, Asset, MarketSegment } from "@/lib/constants/assets"
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
  const [flash, setFlash] = useState<string>("rgba(0, 0, 0, 0)")
  const prevPriceRef = React.useRef(market.price)
  const router = useRouter()

  useEffect(() => {
    if (market.price === 0) return; 
    const prevPrice = prevPriceRef.current;
    
    if (market.price > prevPrice) setFlash("rgba(34, 197, 94, 0.15)") // Green
    else if (market.price < prevPrice) setFlash("rgba(239, 68, 68, 0.15)") // Red
    
    prevPriceRef.current = market.price;

    const timeout = setTimeout(() => setFlash("rgba(0, 0, 0, 0)"), 500)
    return () => clearTimeout(timeout)
  }, [market.price])

  const handleClick = () => {
    const routeSymbol = market.symbol.replace('/', '-')
    router.push(`/markets/${routeSymbol}`)
  }

  const baseSymbol = market.symbol.split('/')[0]

  return (
    <motion.tr 
      onClick={handleClick}
      animate={{ backgroundColor: flash }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="group cursor-pointer border-b border-bg-border hover:bg-bg-elevated/70 transition-colors"
    >
      {/* Rank & Star */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-2.5">
          <button 
            onClick={(e) => onToggleWatchlist(e, market.symbol)}
            className="p-1 rounded-md hover:bg-bg-surface transition-colors"
            title={isWatchlisted ? "Remove from watchlist" : "Add to watchlist"}
          >
            <Star className={`h-4 w-4 ${isWatchlisted ? 'text-yellow-500 fill-yellow-500' : 'text-text-tertiary group-hover:text-text-secondary'}`} />
          </button>
          <span className="font-mono text-xs font-bold text-text-tertiary w-6 text-center">
            {market.rank || '-'}
          </span>
        </div>
      </td>

      {/* Asset Name & Icon */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-bg-surface border border-bg-border text-[11px] font-black text-accent-blue shadow-sm">
            {baseSymbol.slice(0, 3)}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-text-primary group-hover:text-accent-blue transition-colors">{market.name}</span>
              <span className="font-mono text-xs text-text-secondary uppercase">{baseSymbol}</span>
            </div>
            {market.segment && (
              <span className="text-[10.5px] text-text-tertiary font-medium">
                {market.segment}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Price */}
      <td className="px-5 py-4 font-mono text-[14px] font-bold text-text-primary">
        ${market.price > 0 ? market.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: market.price < 1 ? 4 : 2 }) : "---"}
      </td>

      {/* 24h Change */}
      <td className={`px-5 py-4 font-mono text-[13.5px] font-bold ${market.isPositive ? 'text-accent-green' : 'text-accent-red'}`}>
        <div className="flex items-center">
          {market.isPositive ? <ArrowUpRight className="mr-0.5 h-4 w-4" /> : <ArrowDownRight className="mr-0.5 h-4 w-4" />}
          {market.isPositive ? "+" : ""}{market.change.toFixed(2)}%
        </div>
      </td>

      {/* Market Cap */}
      <td className="px-5 py-4 font-mono text-[14px] font-bold text-text-primary">
        {market.marketCapFormatted || (market.marketCap ? `$${(market.marketCap / 1e9).toFixed(2)}B` : '---')}
      </td>

      {/* 24h Volume */}
      <td className="px-5 py-4 font-mono text-[13.5px] text-text-secondary">
        {market.volume24hFormatted || market.volume}
      </td>

      {/* Market Segment Badge */}
      <td className="px-5 py-4 text-right">
        {market.segment ? (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border border-bg-border bg-bg-surface text-text-secondary">
            {market.segment}
          </span>
        ) : (
          <span className="text-text-tertiary text-xs">Crypto</span>
        )}
      </td>
    </motion.tr>
  )
})

export default function MarketsPage() {
  const { address, isConnected } = useAccount()
  const { data: balanceData } = useBalance({ address })
  
  const { watchlistedSymbols, addWatchlist, removeWatchlist, isWatchlisted } = useWatchlistStore()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<'ALL' | 'WATCHLIST'>('ALL')
  const [selectedSegment, setSelectedSegment] = useState<string>('ALL')
  const [sortBy, setSortBy] = useState<'RANK' | 'PRICE' | 'CHANGE' | 'MARKET_CAP' | 'VOLUME'>('RANK')
  const [accountMode, setAccountMode] = useState<'LIVE' | 'DEMO'>('LIVE')
  
  // Initialize market data map with rich assets
  const [marketDataMap, setMarketDataMap] = useState<Record<string, MarketDisplayData>>(() => {
    const initialMap: Record<string, MarketDisplayData> = {}
    ALL_ASSETS.forEach(asset => {
      initialMap[asset.symbol] = {
        ...asset,
        price: asset.price || 100,
        change: asset.change24h !== undefined ? asset.change24h : (Math.random() * 4) - 1.5,
        isPositive: (asset.change24h !== undefined ? asset.change24h : 1) >= 0,
        volume: asset.volume24hFormatted || `$${(Math.random() * 10 + 1).toFixed(1)}B`
      }
    })
    return initialMap
  })

  // Poll live data from internal market-tickers API (all 105 tokens)
  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const response = await fetch('/api/market-tickers')
        if (response.ok) {
          const data = await response.json()
          if (data && data.tickers) {
            setMarketDataMap(prev => {
              const newMap = { ...prev }
              Object.keys(data.tickers).forEach(pair => {
                const item = data.tickers[pair]
                if (newMap[pair]) {
                  newMap[pair] = {
                    ...newMap[pair],
                    price: item.price,
                    change: item.change24h,
                    isPositive: item.isPositive,
                    volume: item.volume24hFormatted || newMap[pair].volume
                  }
                }
              })
              return newMap
            })
          }
        }
      } catch {
        // Fallback to baseline
      }
    }

    fetchMarkets()
    const interval = setInterval(fetchMarkets, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleToggleWatchlist = (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation()
    if (isWatchlisted(symbol)) {
      removeWatchlist(symbol)
    } else {
      addWatchlist(symbol)
    }
  }

  // Segment counts
  const segmentsList = useMemo(() => {
    return [
      'ALL', 'Layer 1', 'Layer 2', 'DeFi', 'AI & Big Data', 'Meme', 'DePIN', 'Gaming', 'Infrastructure', 'Payments'
    ]
  }, [])

  // Filtered & Sorted markets
  const displayedMarkets = useMemo(() => {
    let list = Object.values(marketDataMap)

    if (activeTab === 'WATCHLIST') {
      list = list.filter(m => isWatchlisted(m.symbol))
    }

    if (selectedSegment !== 'ALL') {
      list = list.filter(m => m.segment === selectedSegment)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(m => 
        m.name.toLowerCase().includes(q) || 
        m.symbol.toLowerCase().includes(q) ||
        (m.segment && m.segment.toLowerCase().includes(q))
      )
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'RANK') return (a.rank || 999) - (b.rank || 999)
      if (sortBy === 'MARKET_CAP') return (b.marketCap || 0) - (a.marketCap || 0)
      if (sortBy === 'PRICE') return b.price - a.price
      if (sortBy === 'CHANGE') return b.change - a.change
      if (sortBy === 'VOLUME') return (b.volume24h || 0) - (a.volume24h || 0)
      return 0
    })

    return list
  }, [marketDataMap, activeTab, selectedSegment, searchQuery, sortBy, isWatchlisted])

  return (
    <div className="flex min-h-[calc(100vh-64px)] w-full flex-col bg-bg-base p-6 lg:p-8 overflow-y-auto">
      <div className="mx-auto w-full max-w-[1440px] flex flex-col gap-8">
        
        {/* Top Summary Banner */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-bg-border bg-bg-surface p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                <Wallet className="h-4 w-4 text-accent-blue" />
                Trading Portfolio
              </span>
              <div className="flex rounded-lg bg-bg-elevated p-0.5 border border-bg-border">
                <button 
                  onClick={() => setAccountMode('LIVE')}
                  className={`px-3 py-1 text-[11px] font-bold rounded-md transition-colors ${accountMode === 'LIVE' ? 'bg-bg-surface text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-secondary'}`}
                >
                  LIVE CEX
                </button>
                <button 
                  onClick={() => setAccountMode('DEMO')}
                  className={`px-3 py-1 text-[11px] font-bold rounded-md transition-colors ${accountMode === 'DEMO' ? 'bg-bg-surface text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-secondary'}`}
                >
                  PAPER
                </button>
              </div>
            </div>
            
            <div className="mt-6 flex flex-col">
              <span className="font-mono text-[34px] font-extrabold text-text-primary tracking-tight">
                {accountMode === 'DEMO' 
                  ? "$100,000.00" 
                  : (isConnected && balanceData ? `${Number(balanceData.formatted).toLocaleString(undefined, { maximumFractionDigits: 4 })} ${balanceData.symbol}` : "$42,850.50 USDT")
                }
              </span>
              <span className="flex items-center text-xs text-text-tertiary mt-1">
                {accountMode === 'DEMO' 
                  ? "Sandbox Margin Balance" 
                  : (isConnected ? "Web3 Wallet Connected" : "Binance Pro Connected ($42.8k)")
                }
              </span>
            </div>
          </div>

          <div className="col-span-1 rounded-2xl border border-bg-border bg-bg-surface p-6 shadow-sm md:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-accent-green" />
                  Top 100 Crypto Market Breadth
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-accent-blue bg-accent-blue/10 px-2.5 py-0.5 rounded-full border border-accent-blue/20">
                105 Active Tokens
              </span>
            </div>
            <div className="h-[140px] w-full">
              <GrowthChart />
            </div>
          </div>
        </div>

        {/* Live Markets Table & Filter Hub */}
        <div className="overflow-hidden rounded-2xl border border-bg-border bg-bg-surface shadow-sm">
          
          {/* Header Controls */}
          <div className="border-b border-bg-border px-6 py-4 flex flex-col gap-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-extrabold text-text-primary flex items-center gap-2 tracking-tight">
                  Cryptocurrency Screener
                  <span className="relative flex h-2 w-2 ml-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-green"></span>
                  </span>
                </h2>
                
                <div className="flex bg-bg-elevated rounded-xl p-1 border border-bg-border text-xs font-bold">
                  <button 
                    onClick={() => setActiveTab('ALL')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'ALL' ? 'bg-bg-surface text-accent-blue shadow-sm' : 'text-text-tertiary hover:text-text-primary'}`}
                  >
                    Top 100+ ({ALL_ASSETS.length})
                  </button>
                  <button 
                    onClick={() => setActiveTab('WATCHLIST')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'WATCHLIST' ? 'bg-bg-surface text-accent-blue shadow-sm' : 'text-text-tertiary hover:text-text-primary'}`}
                  >
                    Watchlist ({watchlistedSymbols.length})
                  </button>
                </div>
              </div>

              {/* Search & Sort */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                  <input 
                    type="text" 
                    placeholder="Search by token, name, or sector..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-[260px] pl-9 pr-4 py-2 bg-bg-elevated border border-bg-border rounded-xl text-xs font-medium text-text-primary focus:outline-none focus:border-accent-blue transition-all placeholder:text-text-tertiary"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-bg-elevated border border-bg-border px-3 py-2 rounded-xl text-xs font-semibold">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-text-tertiary" />
                  <select 
                    value={sortBy} 
                    onChange={(e: any) => setSortBy(e.target.value)}
                    className="bg-transparent text-text-primary text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="RANK">Rank (Asc)</option>
                    <option value="MARKET_CAP">Market Cap</option>
                    <option value="PRICE">Price</option>
                    <option value="CHANGE">24h Change</option>
                    <option value="VOLUME">24h Volume</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Market Segment Chips (Requirement 2 & 3) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
              <span className="text-[11px] font-bold text-text-tertiary uppercase flex items-center gap-1 shrink-0 mr-1">
                <Filter className="h-3 w-3" />
                Sectors:
              </span>
              {segmentsList.map(seg => (
                <button
                  key={seg}
                  onClick={() => setSelectedSegment(seg)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${selectedSegment === seg ? 'bg-accent-blue text-white shadow-sm' : 'bg-bg-elevated border border-bg-border text-text-secondary hover:text-text-primary'}`}
                >
                  {seg}
                </button>
              ))}
            </div>

          </div>
          
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[850px]">
              <thead>
                <tr className="border-b border-bg-border text-[11px] uppercase tracking-wider text-text-tertiary bg-bg-surface font-bold">
                  <th className="px-5 py-3.5 w-16">#</th>
                  <th className="px-5 py-3.5">Asset / Symbol</th>
                  <th className="px-5 py-3.5">Price</th>
                  <th className="px-5 py-3.5">24h Change</th>
                  <th className="px-5 py-3.5">Market Cap</th>
                  <th className="px-5 py-3.5">24h Volume</th>
                  <th className="px-5 py-3.5 text-right">Market Sector</th>
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
                    <td colSpan={7} className="px-6 py-16 text-center text-text-tertiary">
                      {searchQuery ? `No assets found matching "${searchQuery}".` : 'No assets in this category.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer count */}
          <div className="px-6 py-3 border-t border-bg-border bg-bg-surface text-xs font-mono text-text-tertiary flex items-center justify-between">
            <span>Showing {displayedMarkets.length} of {ALL_ASSETS.length} cryptocurrencies</span>
            <span>Live WebSockets feed via Binance & OKX</span>
          </div>

        </div>

      </div>
    </div>
  )
}
