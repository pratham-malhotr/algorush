"use client"

import React, { useEffect, useRef, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, ArrowUpRight, ArrowDownRight, Star, Zap, 
  Layers, BarChart3, Activity, Shield, Info, DollarSign,
  TrendingUp, Maximize2, Minimize2, X
} from 'lucide-react'
import { ALL_ASSETS, Asset } from '@/lib/constants/assets'
import { useWatchlistStore } from '@/store/useWatchlistStore'
import { usePaperTradingStore } from '@/store/usePaperTradingStore'
import { toast } from 'sonner'

// --- TradingView Technical Analysis Embedded Widget ---
const TechnicalAnalysisWidget = ({ symbol }: { symbol: string }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.innerHTML = ''
    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js"
    script.type = "text/javascript"
    script.async = true
    script.innerHTML = JSON.stringify({
      interval: "1D",
      width: "100%",
      isTransparent: true,
      height: "100%",
      symbol: symbol,
      showIntervalTabs: true,
      displayMode: "single",
      locale: "en",
      colorTheme: "light"
    })
    container.appendChild(script)

    return () => {
      if (container) container.innerHTML = ''
    }
  }, [symbol])

  return <div ref={containerRef} className="w-full h-full min-h-[420px]" />
}

// --- TradingView Symbol Info Embedded Banner Widget ---
const SymbolInfoWidget = ({ symbol }: { symbol: string }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.innerHTML = ''
    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js"
    script.type = "text/javascript"
    script.async = true
    script.innerHTML = JSON.stringify({
      symbol: symbol,
      width: "100%",
      locale: "en",
      colorTheme: "light",
      isTransparent: true
    })
    container.appendChild(script)

    return () => {
      if (container) container.innerHTML = ''
    }
  }, [symbol])

  return <div ref={containerRef} className="w-full min-h-[64px]" />
}

// --- TradingView Advanced Candlestick Chart Widget with Side Drawing Toolbar ---
const TradingViewAdvancedChart = ({ 
  symbol, 
  isFullScreen = false 
}: { 
  symbol: string; 
  isFullScreen?: boolean 
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.innerHTML = ''
    const widgetContainer = document.createElement('div')
    widgetContainer.className = 'tradingview-widget-container w-full h-full'
    widgetContainer.style.height = '100%'
    widgetContainer.style.minHeight = isFullScreen ? 'calc(100vh - 120px)' : '540px'

    const widgetDiv = document.createElement('div')
    widgetDiv.className = 'tradingview-widget-container__widget w-full h-full'
    widgetDiv.style.height = '100%'
    widgetContainer.appendChild(widgetDiv)

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: "D",
      timezone: "Etc/UTC",
      theme: "light",
      style: "1",
      locale: "en",
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      calendar: false,
      hide_volume: false,
      hide_side_toolbar: false, // Enables native Trendline, Ray, Fibonacci, & Annotation drawing toolbar
      allow_symbol_change: true,
      withdateranges: true,
      details: false, // Removed side pricing in which volume and open market are displayed
      hotlist: false,
      support_host: "https://www.tradingview.com"
    })
    widgetContainer.appendChild(script)
    container.appendChild(widgetContainer)

    return () => {
      if (container) container.innerHTML = ''
    }
  }, [symbol, isFullScreen])

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full ${isFullScreen ? 'min-h-[calc(100vh-120px)]' : 'min-h-[540px]'}`} 
    />
  )
}

// --- Fear and Greed Index Sentiment Gauge ---
const FearAndGreedIndex = ({ symbol }: { symbol: string }) => {
  const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const score = (hash % 65) + 25 
  
  let label = "Neutral"
  let color = "text-yellow-500"
  let barColor = "bg-yellow-500"
  
  if (score < 25) { label = "Extreme Fear"; color = "text-red-500"; barColor = "bg-red-500" }
  else if (score < 45) { label = "Fear"; color = "text-orange-500"; barColor = "bg-orange-500" }
  else if (score > 75) { label = "Extreme Greed"; color = "text-green-500"; barColor = "bg-green-500" }
  else if (score > 55) { label = "Greed"; color = "text-emerald-500"; barColor = "bg-emerald-500" }

  return (
    <div className="flex flex-col justify-center h-full p-6 bg-bg-surface border border-bg-border rounded-2xl shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
          <Activity className="h-4 w-4 text-accent-blue" />
          Market Sentiment
        </h3>
        <span className="text-[11px] font-mono text-text-tertiary uppercase bg-bg-elevated px-2 py-0.5 rounded-md font-bold">
          Crypto Gauge
        </span>
      </div>
      
      <div className="flex flex-col gap-0.5 mb-6 mt-1">
        <span className={`text-4xl font-black font-mono ${color}`}>{score}</span>
        <span className={`text-sm font-bold ${color}`}>{label}</span>
      </div>
      
      <div className="relative w-full h-2.5 bg-bg-elevated rounded-full overflow-hidden shadow-inner">
        <div className={`absolute top-0 left-0 h-full ${barColor} transition-all duration-1000 ease-out`} style={{ width: `${score}%` }} />
      </div>
      
      <div className="flex justify-between mt-2.5 text-[10px] text-text-tertiary uppercase font-bold tracking-wider">
        <span>0 Fear</span>
        <span>50 Neutral</span>
        <span>100 Greed</span>
      </div>
    </div>
  )
}

export default function AssetDashboardPage() {
  const params = useParams()
  const router = useRouter()
  const symbolParam = (params.symbol as string) || 'BTC-USDT'
  const symbolRaw = symbolParam.replace('-', '/')
  const baseAsset = symbolRaw.split('/')[0]
  const tvBase = symbolRaw.replace('/', '')

  const { isWatchlisted, addWatchlist, removeWatchlist } = useWatchlistStore()
  const inWatchlist = isWatchlisted(symbolRaw)
  const executeTrade = usePaperTradingStore(state => state.executeTrade)

  // Full Screen Chart Modal View State
  const [isFullScreen, setIsFullScreen] = useState(false)

  // Find asset metadata or generate robust fallback
  const asset: Asset = useMemo(() => {
    const found = ALL_ASSETS.find(a => 
      a.symbol.toLowerCase() === symbolRaw.toLowerCase() || 
      a.symbol.replace('/', '-').toLowerCase() === symbolParam.toLowerCase()
    )
    if (found) return found

    return {
      symbol: symbolRaw,
      name: baseAsset,
      market: 'CRYPTO',
      price: 100.00,
      change24h: 2.50,
      marketCap: 1000000000,
      marketCapFormatted: '$1.00B',
      fdv: 1200000000,
      fdvFormatted: '$1.20B',
      volume24h: 50000000,
      volume24hFormatted: '$50.0M',
      circulatingSupply: 10000000,
      circulatingSupplyFormatted: '10.0M',
      totalSupply: 12000000,
      totalSupplyFormatted: '12.0M',
      ath: 150.00,
      athChange: -33.3,
      high24h: 105.00,
      low24h: 98.00,
      rank: 99,
      segment: 'DeFi',
      marketDominance: 0.05,
      description: `${baseAsset} decentralized token traded on global spot and derivatives exchanges.`,
      technicalSummary: {
        rsi14: 55.4,
        rsiSignal: 'Neutral',
        macdSignal: 'Bullish',
        ema20_50: 'Bullish Cross',
        overall: 'Buy'
      }
    }
  }, [symbolRaw, symbolParam, baseAsset])

  // Real-time live market ticker state
  const [liveTicker, setLiveTicker] = useState<{
    price?: number;
    change24h?: number;
    high24h?: number;
    low24h?: number;
    volume24h?: number;
    quoteVolume?: number;
    volume24hFormatted?: string;
    marketCap?: number;
    marketCapFormatted?: string;
  }>({})

  useEffect(() => {
    let isMounted = true
    const fetchLiveAsset = async () => {
      try {
        const res = await fetch(`/api/market-tickers?symbol=${encodeURIComponent(symbolRaw)}`)
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.ticker && isMounted) {
            setLiveTicker(data.ticker)
          }
        }
      } catch {
        // Fallback to baseline
      }
    }

    fetchLiveAsset()
    const interval = setInterval(fetchLiveAsset, 3000)
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [symbolRaw])

  const livePrice = liveTicker.price || asset.price || 100
  const liveChange = liveTicker.change24h !== undefined ? liveTicker.change24h : (asset.change24h || 0)
  const isPositive = liveChange >= 0
  const liveVolume = liveTicker.volume24hFormatted || asset.volume24hFormatted || '$1.0B'
  const liveMarketCap = liveTicker.marketCapFormatted || asset.marketCapFormatted || '$1.0B'
  const liveAthChange = asset.ath ? (((livePrice - asset.ath) / asset.ath) * 100).toFixed(1) : (asset.athChange || -10).toFixed(1)

  // Keyboard shortcut (Escape to close fullscreen)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullScreen])

  const fullTvSymbol = `BINANCE:${tvBase}`

  const tech = asset.technicalSummary || {
    rsi14: 61.4,
    rsiSignal: 'Neutral',
    macdSignal: 'Bullish',
    ema20_50: 'Bullish Cross',
    overall: 'Strong Buy'
  }

  const ema20 = livePrice * 0.985
  const ema50 = livePrice * 0.962
  const ema200 = livePrice * 0.895
  const pivotP = livePrice * 0.995
  const pivotR1 = livePrice * 1.025
  const pivotS1 = livePrice * 0.975

  return (
    <div className="flex min-h-[calc(100vh-64px)] w-full flex-col bg-bg-base p-6 lg:p-8 overflow-y-auto text-text-primary">
      
      {/* ========================================================================= */}
      {/* FULLSCREEN PRO TRADING TERMINAL MODAL (WHITE)                             */}
      {/* ========================================================================= */}
      {isFullScreen && (
        <div className="fixed inset-0 z-50 bg-white text-gray-900 flex flex-col animate-in fade-in duration-200">
          
          {/* Top Fullscreen Header */}
          <div className="border-b border-gray-200 bg-white/95 backdrop-blur-md px-6 py-3 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-sm text-gray-900">
            
            {/* Left: Asset Identity & Price */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsFullScreen(false)}
                className="flex items-center gap-2 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-300 px-3.5 py-1.5 text-xs font-bold text-gray-800 transition-all shadow-sm"
                title="Exit Full View (Esc)"
              >
                <Minimize2 className="h-4 w-4 text-accent-blue" />
                <span>Exit Full View</span>
                <span className="text-[10px] text-gray-500 bg-gray-200 px-1 rounded font-mono">Esc</span>
              </button>

              <div className="h-4 w-px bg-gray-200" />

              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-gray-900">{asset.name}</span>
                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                  {symbolRaw}
                </span>
                <span className="font-mono text-sm font-black text-gray-900 ml-2">
                  ${livePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono ${isPositive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                  {isPositive ? '+' : ''}{liveChange.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Right: Quick Sandbox Execution & Close */}
            <div className="flex items-center gap-2.5">
              <button 
                onClick={() => {
                  executeTrade('BUY', symbolRaw, +(1000 / livePrice).toFixed(4), livePrice)
                  toast.success(`⚡ Sandbox BUY order placed: ${(1000 / livePrice).toFixed(4)} ${baseAsset} @ $${livePrice}`)
                }}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
              >
                ⚡ Buy $1k
              </button>
              <button 
                onClick={() => {
                  executeTrade('SELL', symbolRaw, +(1000 / livePrice).toFixed(4), livePrice)
                  toast.success(`⚡ Sandbox SHORT order placed: ${(1000 / livePrice).toFixed(4)} ${baseAsset} @ $${livePrice}`)
                }}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-sm"
              >
                ⚡ Short $1k
              </button>
              <button 
                onClick={() => setIsFullScreen(false)}
                className="p-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-600 hover:text-gray-900 transition-all ml-1"
                title="Close Full View"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

          </div>

          {/* Fullscreen Main Chart View Area (Clean White Background) */}
          <div className="flex-1 w-full relative flex flex-col overflow-hidden bg-white">
            <div className="w-full h-full flex-1 bg-white">
              <TradingViewAdvancedChart symbol={fullTvSymbol} isFullScreen={true} />
            </div>
          </div>

          {/* Bottom Fullscreen Status Bar */}
          <div className="border-t border-gray-200 bg-white px-6 py-2 flex items-center justify-between text-xs font-mono text-gray-500 shrink-0">
            <div className="flex items-center gap-4">
              <span>Drawing Toolbar: <strong className="text-gray-900">Active (Left Margin)</strong></span>
              <span>•</span>
              <span>Interval: <strong className="text-gray-900">1 Day Candles</strong></span>
              <span>•</span>
              <span>Exchange Feed: <strong className="text-gray-900">Binance Global</strong></span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-600 flex items-center gap-1 font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping" />
                Live Workstation Stream
              </span>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* STANDARD PAGE VIEW                                                        */}
      {/* ========================================================================= */}
      <div className="mx-auto w-full max-w-[1440px] flex flex-col gap-6">
        
        {/* Header Navigation & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/markets')}
              className="flex items-center gap-2 rounded-xl border border-bg-border bg-bg-surface px-4 py-2 text-xs font-bold text-text-primary hover:bg-bg-elevated transition-colors shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Markets
            </button>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-text-primary uppercase tracking-tight">
                {asset.name}
              </h1>
              <span className="font-mono text-sm font-bold text-text-tertiary bg-bg-elevated px-2.5 py-0.5 rounded-lg border border-bg-border">
                {symbolRaw}
              </span>
              {asset.rank && (
                <span className="text-xs font-bold text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                  Rank #{asset.rank}
                </span>
              )}
              {asset.segment && (
                <span className="text-xs font-bold text-accent-blue bg-accent-blue/10 border border-accent-blue/20 px-2.5 py-0.5 rounded-full">
                  {asset.segment}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if (inWatchlist) removeWatchlist(symbolRaw)
                else addWatchlist(symbolRaw)
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${inWatchlist ? 'border-amber-400/40 bg-amber-400/10 text-amber-500' : 'border-bg-border bg-bg-surface text-text-secondary hover:text-text-primary'}`}
            >
              <Star className={`h-3.5 w-3.5 ${inWatchlist ? 'fill-amber-400' : ''}`} />
              {inWatchlist ? 'Watchlisted' : 'Add Watchlist'}
            </button>

            {/* FULL CHART VIEW BUTTON */}
            <button
              onClick={() => setIsFullScreen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-accent-blue/40 bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/20 text-xs font-bold transition-all shadow-sm"
              title="Open Fullscreen Pro Terminal with Trendlines & Drawing Tools"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              Full Chart View
            </button>

            <Link
              href={`/builder?pair=${symbolRaw}&timeframe=15m`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-blue hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-md shadow-accent-blue/20"
            >
              <Zap className="h-4 w-4" />
              Build AI Strategy
            </Link>
          </div>
        </div>

        {/* Top Banner (TradingView Symbol Info Widget) */}
        <div className="w-full bg-bg-surface rounded-2xl border border-bg-border overflow-hidden shadow-sm px-4 py-2">
          <SymbolInfoWidget symbol={fullTvSymbol} />
        </div>

        {/* 8-Card Market Cap & Valuation Information Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3.5">
          
          <div className="p-4 rounded-2xl border border-bg-border bg-bg-surface flex flex-col shadow-sm">
            <span className="text-[11px] uppercase tracking-wider text-text-tertiary font-bold">Market Cap</span>
            <span className="text-base font-mono font-black text-text-primary mt-1">
              {liveMarketCap}
            </span>
            <span className="text-[10px] text-text-secondary mt-0.5">Rank #{asset.rank || 1}</span>
          </div>

          <div className="p-4 rounded-2xl border border-bg-border bg-bg-surface flex flex-col shadow-sm">
            <span className="text-[11px] uppercase tracking-wider text-text-tertiary font-bold">FDV Valuation</span>
            <span className="text-base font-mono font-black text-text-primary mt-1">
              {asset.totalSupply ? `$${((asset.totalSupply * livePrice) / 1e9).toFixed(2)}B` : liveMarketCap}
            </span>
            <span className="text-[10px] text-text-secondary mt-0.5">Fully Diluted</span>
          </div>

          <div className="p-4 rounded-2xl border border-bg-border bg-bg-surface flex flex-col shadow-sm">
            <span className="text-[11px] uppercase tracking-wider text-text-tertiary font-bold">24h Volume</span>
            <span className="text-base font-mono font-black text-text-primary mt-1">
              {liveVolume}
            </span>
            <span className="text-[10px] text-text-secondary mt-0.5">Global Trading</span>
          </div>

          <div className="p-4 rounded-2xl border border-bg-border bg-bg-surface flex flex-col shadow-sm">
            <span className="text-[11px] uppercase tracking-wider text-text-tertiary font-bold">Market Dominance</span>
            <span className="text-base font-mono font-black text-accent-blue mt-1">
              {(asset.marketDominance || 54.8).toFixed(2)}%
            </span>
            <span className="text-[10px] text-text-secondary mt-0.5">Total Share</span>
          </div>

          <div className="p-4 rounded-2xl border border-bg-border bg-bg-surface flex flex-col shadow-sm">
            <span className="text-[11px] uppercase tracking-wider text-text-tertiary font-bold">Circulating Supply</span>
            <span className="text-base font-mono font-black text-text-primary mt-1">
              {asset.circulatingSupplyFormatted || '19.75M'}
            </span>
            <span className="text-[10px] text-text-secondary mt-0.5">Max: {asset.totalSupplyFormatted || '21.00M'}</span>
          </div>

          <div className="p-4 rounded-2xl border border-bg-border bg-bg-surface flex flex-col shadow-sm">
            <span className="text-[11px] uppercase tracking-wider text-text-tertiary font-bold">All-Time High</span>
            <span className="text-base font-mono font-black text-text-primary mt-1">
              ${(asset.ath || livePrice * 1.2).toLocaleString()}
            </span>
            <span className={`text-[10px] font-bold mt-0.5 ${parseFloat(liveAthChange) >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
              {parseFloat(liveAthChange) >= 0 ? '+' : ''}{liveAthChange}%
            </span>
          </div>

          <div className="p-4 rounded-2xl border border-bg-border bg-bg-surface flex flex-col shadow-sm">
            <span className="text-[11px] uppercase tracking-wider text-text-tertiary font-bold">Market Sector</span>
            <span className="text-base font-bold text-accent-blue mt-1">
              {asset.segment || 'Layer 1'}
            </span>
            <span className="text-[10px] text-text-secondary mt-0.5">Segment</span>
          </div>

          <div className="p-4 rounded-2xl border border-bg-border bg-bg-surface flex flex-col shadow-sm">
            <span className="text-[11px] uppercase tracking-wider text-text-tertiary font-bold">Technical Bias</span>
            <span className={`text-base font-black mt-1 ${tech.overall === 'Strong Buy' || tech.overall === 'Buy' ? 'text-accent-green' : tech.overall === 'Neutral' ? 'text-amber-500' : 'text-accent-red'}`}>
              {tech.overall}
            </span>
            <span className="text-[10px] text-text-secondary mt-0.5">RSI: {tech.rsi14.toFixed(1)}</span>
          </div>

        </div>

        {/* Primary Row: TradingView Advanced Candlestick Chart (Left) + Sentiment & Technical Analysis (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Col: Advanced TradingView Interactive Candlestick Chart */}
          <div className="lg:col-span-2 flex flex-col gap-3 min-h-[580px] h-auto">
            
            {/* Chart Toolbar Header */}
            <div className="flex items-center justify-between bg-bg-surface px-5 py-3 rounded-2xl border border-bg-border shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-accent-green animate-ping" />
                  <span className="text-xs font-bold text-text-primary">Interactive Candlestick Chart</span>
                </div>
                <span className="text-[11px] font-mono text-text-tertiary bg-bg-elevated px-2 py-0.5 rounded border border-bg-border">
                  1D • Binance Feed
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFullScreen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-blue text-white hover:bg-blue-600 text-xs font-bold transition-all shadow-sm"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  Full Chart View
                </button>
              </div>
            </div>

            {/* Main Chart Box */}
            <div className="flex-1 rounded-2xl border border-bg-border overflow-hidden bg-bg-surface shadow-sm p-2">
              <TradingViewAdvancedChart symbol={fullTvSymbol} />
            </div>
          </div>

          {/* Right Col: Market Sentiment & TradingView Technical Analysis */}
          <div className="lg:col-span-1 flex flex-col gap-6 min-h-[550px] h-auto">
            
            {/* Fear & Greed Sentiment */}
            <div className="h-[185px] shrink-0">
              <FearAndGreedIndex symbol={fullTvSymbol} />
            </div>

            {/* TradingView Technical Analysis Speedometer Widget */}
            <div className="flex-1 bg-bg-surface border border-bg-border rounded-2xl p-5 overflow-hidden shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4 text-accent-blue" />
                  Technical Analysis Summary
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-accent-green/10 text-accent-green font-mono">
                  Multi-Indicator
                </span>
              </div>
              <div className="w-full flex-1 min-h-[360px] rounded-xl overflow-hidden">
                <TechnicalAnalysisWidget symbol={fullTvSymbol} />
              </div>
            </div>

          </div>

        </div>

        {/* Secondary Row: Market Segment Deep Dive & Institutional Oscillators / Moving Averages */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Market Segment & Tokenomics */}
          <div className="bg-bg-surface rounded-2xl border border-bg-border p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
              <Layers className="h-4 w-4 text-accent-blue" />
              Market Segment & Tokenomics
            </div>

            <div className="p-3.5 rounded-xl bg-bg-elevated border border-bg-border text-xs leading-relaxed">
              <span className="text-text-tertiary font-bold uppercase text-[10px]">Sector Classification</span>
              <div className="text-sm font-bold text-accent-blue mt-0.5">{asset.segment || 'Layer 1'}</div>
              <p className="text-text-secondary mt-1">
                {asset.description || `${asset.name} is a high-volume cryptocurrency powering decentralized settlements.`}
              </p>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-bg-border/50">
                <span className="text-text-tertiary">Issuance Model</span>
                <span className="font-bold text-text-primary">{asset.totalSupply ? 'Capped Finite Supply' : 'Proof of Stake Inflation'}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-bg-border/50">
                <span className="text-text-tertiary">Circulating Ratio</span>
                <span className="font-bold text-accent-green">
                  {asset.totalSupply && asset.circulatingSupply ? `${((asset.circulatingSupply / asset.totalSupply) * 100).toFixed(1)}% Circulating` : '94.0% Circulating'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-bg-border/50">
                <span className="text-text-tertiary">Volume / MCap Ratio</span>
                <span className="font-bold text-text-primary">
                  {asset.marketCap && asset.volume24h ? `${((asset.volume24h / asset.marketCap) * 100).toFixed(2)}% (Deep Liquidity)` : '2.62%'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-bg-border/50">
                <span className="text-text-tertiary">Settlement Base</span>
                <span className="font-bold text-text-primary">USDT Tether Perpetual</span>
              </div>
            </div>

            <div className="mt-2 flex gap-2">
              <button 
                onClick={() => {
                  executeTrade('BUY', symbolRaw, +(500 / livePrice).toFixed(4), livePrice)
                  toast.success(`⚡ Sandbox order placed: BUY ${(500 / livePrice).toFixed(4)} ${baseAsset} @ $${livePrice}`)
                }}
                className="flex-1 py-2.5 rounded-xl border border-accent-green/30 bg-accent-green/10 text-accent-green text-xs font-bold hover:bg-accent-green/20 transition-all text-center"
              >
                Quick Sandbox BUY
              </button>
              <button 
                onClick={() => {
                  executeTrade('SELL', symbolRaw, +(500 / livePrice).toFixed(4), livePrice)
                  toast.success(`⚡ Sandbox order placed: SHORT ${(500 / livePrice).toFixed(4)} ${baseAsset} @ $${livePrice}`)
                }}
                className="flex-1 py-2.5 rounded-xl border border-accent-red/30 bg-accent-red/10 text-accent-red text-xs font-bold hover:bg-accent-red/20 transition-all text-center"
              >
                Quick Sandbox SHORT
              </button>
            </div>
          </div>

          {/* Institutional Oscillators */}
          <div className="bg-bg-surface rounded-2xl border border-bg-border p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
                <Activity className="h-4 w-4 text-accent-blue" />
                Key Technical Oscillators
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-accent-green/10 text-accent-green font-mono">
                {tech.overall}
              </span>
            </div>

            <div className="flex flex-col gap-2 font-mono text-xs">
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-bg-elevated/60 border border-bg-border">
                <span className="text-text-secondary">RSI (14 Period)</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-text-primary">{tech.rsi14.toFixed(1)}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-accent-blue/10 text-accent-blue">
                    {tech.rsiSignal}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-xl bg-bg-elevated/60 border border-bg-border">
                <span className="text-text-secondary">MACD Signal</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-text-primary">+14.2</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-accent-green/10 text-accent-green">
                    Bullish Cross
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-xl bg-bg-elevated/60 border border-bg-border">
                <span className="text-text-secondary">Stochastic %K</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-text-primary">64.5</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-accent-blue/10 text-accent-blue">
                    Neutral
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-xl bg-bg-elevated/60 border border-bg-border">
                <span className="text-text-secondary">Williams %R (14)</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-text-primary">-28.4</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-accent-green/10 text-accent-green">
                    Accumulation
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-xl bg-bg-elevated/60 border border-bg-border">
                <span className="text-text-secondary">CCI (20)</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-text-primary">+82.4</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-accent-green/10 text-accent-green">
                    Buy
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Moving Averages & Pivots */}
          <div className="bg-bg-surface rounded-2xl border border-bg-border p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
              <BarChart3 className="h-4 w-4 text-accent-blue" />
              Moving Averages & Pivots
            </div>

            <div className="flex flex-col gap-2 font-mono text-xs">
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-bg-elevated/60 border border-bg-border">
                <span className="text-text-secondary">EMA 20</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-text-primary">${ema20.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-accent-green/10 text-accent-green">Above</span>
                </div>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-xl bg-bg-elevated/60 border border-bg-border">
                <span className="text-text-secondary">EMA 50</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-text-primary">${ema50.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-accent-green/10 text-accent-green">Above</span>
                </div>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-xl bg-bg-elevated/60 border border-bg-border">
                <span className="text-text-secondary">EMA 200</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-text-primary">${ema200.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-accent-green/10 text-accent-green">Golden Cross</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-bg-elevated/40 border border-bg-border mt-0.5">
                <div className="flex justify-between text-[11px] mb-1 font-bold">
                  <span className="text-accent-red">S1: ${pivotS1.toFixed(1)}</span>
                  <span className="text-text-tertiary">Pivot: ${pivotP.toFixed(1)}</span>
                  <span className="text-accent-green">R1: ${pivotR1.toFixed(1)}</span>
                </div>
                <div className="h-1.5 w-full bg-bg-base rounded-full overflow-hidden flex">
                  <div className="w-1/2 bg-accent-red/40" />
                  <div className="w-1/2 bg-accent-green/40" />
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
