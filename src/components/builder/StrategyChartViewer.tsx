"use client"

import * as React from "react"
import { useBuilderStore } from "@/store/useBuilderStore"
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Area, AreaChart, BarChart, Bar, Cell, ComposedChart, ReferenceLine 
} from 'recharts'
import { 
  generateMockData, runLocalBacktest, OHLCV, BacktestResult, 
  calculateEMA, calculateRSI, calculateBollingerBands, calculateMACD, getRealisticAssetPrice 
} from '@/lib/backtester/engine'
import { 
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Layers, Sliders, 
  Play, Pause, RefreshCw, Zap, ShieldCheck, BarChart3, LayoutGrid, CheckCircle2, 
  AlertTriangle, ChevronDown, ChevronUp, Eye, EyeOff, Activity, Crosshair, ArrowRight,
  Sun, Moon, CandlestickChart, Sparkles
} from "lucide-react"
import { toast } from "sonner"

interface ChartDataPoint {
  index: number
  date: string
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
  zigzag?: number | null
  ema20?: number
  ema50?: number
  ema200?: number
  bbUpper?: number
  bbLower?: number
  bbMiddle?: number
  rsi?: number
  macd?: number
  macdSignal?: number
  macdHist?: number
  tradeEvent?: {
    side: 'BUY_LONG' | 'SELL_SHORT' | 'EXIT'
    price: number
    label: string
    netPnl?: number
    pnlPct?: number
    reason?: string
  }
}

/**
 * Institutional ZigZag indicator: connects swing highs and swing lows
 * filtering out fluctuations smaller than deviationPct (default 1.8%).
 */
function calculateZigZag(
  candles: { high: number; low: number; close: number }[],
  deviationPct = 1.8
): (number | null)[] {
  const result: (number | null)[] = new Array(candles.length).fill(null)
  if (candles.length < 3) return result

  let lastSwingIdx = 0
  let lastSwingPrice = candles[0].close
  let swingType: 'high' | 'low' | null = null
  result[0] = lastSwingPrice

  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high
    const low = candles[i].low

    if (swingType === null) {
      if (high >= lastSwingPrice * (1 + deviationPct / 100)) {
        swingType = 'high'
        lastSwingIdx = i
        lastSwingPrice = high
        result[i] = high
      } else if (low <= lastSwingPrice * (1 - deviationPct / 100)) {
        swingType = 'low'
        lastSwingIdx = i
        lastSwingPrice = low
        result[i] = low
      }
    } else if (swingType === 'high') {
      if (high > lastSwingPrice) {
        result[lastSwingIdx] = null
        lastSwingIdx = i
        lastSwingPrice = high
        result[i] = high
      } else if (low <= lastSwingPrice * (1 - deviationPct / 100)) {
        swingType = 'low'
        lastSwingIdx = i
        lastSwingPrice = low
        result[i] = low
      }
    } else if (swingType === 'low') {
      if (low < lastSwingPrice) {
        result[lastSwingIdx] = null
        lastSwingIdx = i
        lastSwingPrice = low
        result[i] = low
      } else if (high >= lastSwingPrice * (1 + deviationPct / 100)) {
        swingType = 'high'
        lastSwingIdx = i
        lastSwingPrice = high
        result[i] = high
      }
    }
  }

  if (lastSwingIdx < candles.length - 1) {
    result[candles.length - 1] = candles[candles.length - 1].close
  }

  return result
}

export function StrategyChartViewer() {
  const { 
    strategyDSL, 
    strategyName, 
    tradingPair, 
    setTradingPair, 
    timeframe, 
    setTimeframe, 
    setWorkspaceMode,
    setIsDeployModalOpen,
    runBacktest,
    isBacktesting
  } = useBuilderStore()

  // Theme configuration: White Theme by default
  const [chartTheme, setChartTheme] = React.useState<'white' | 'dark'>('white')
  const isWhite = chartTheme === 'white'

  // Chart configuration state
  const [lookbackDays, setLookbackDays] = React.useState<number>(30)
  const [showZigzag, setShowZigzag] = React.useState<boolean>(true)
  const [showEma20, setShowEma20] = React.useState<boolean>(true)
  const [showEma50, setShowEma50] = React.useState<boolean>(true)
  const [showEma200, setShowEma200] = React.useState<boolean>(false)
  const [showBollinger, setShowBollinger] = React.useState<boolean>(true)
  const [showTrades, setShowTrades] = React.useState<boolean>(true)
  const [subChartType, setSubChartType] = React.useState<'rsi' | 'volume' | 'macd'>('rsi')
  const [isBlotterOpen, setIsBlotterOpen] = React.useState<boolean>(true)
  const [isSimulating, setIsSimulating] = React.useState<boolean>(false)
  const [isLiveActive, setIsLiveActive] = React.useState<boolean>(true)
  const [chartMode, setChartMode] = React.useState<'area' | 'bar'>('area')

  // Chart dataset and backtest state
  const [chartData, setChartData] = React.useState<ChartDataPoint[]>([])
  const [backtestStats, setBacktestStats] = React.useState<BacktestResult | null>(null)
  const [currentPrice, setCurrentPrice] = React.useState<number>(66500)
  const [priceChange24h, setPriceChange24h] = React.useState<{ val: number; pct: number }>({ val: 1420, pct: 2.18 })
  const [lastTickDirection, setLastTickDirection] = React.useState<'up' | 'down' | 'neutral'>('neutral')

  // Build high-resolution chart series
  const computeChartSeries = React.useCallback(() => {
    setIsSimulating(true)
    const assetMeta = getRealisticAssetPrice(tradingPair)
    const ohlcv = generateMockData(lookbackDays, assetMeta.price, timeframe, assetMeta.volatility)
    
    const closes = ohlcv.map(d => d.close)
    const zigzagSeries = calculateZigZag(ohlcv, 1.8)
    const ema20 = calculateEMA(closes, 20)
    const ema50 = calculateEMA(closes, 50)
    const ema200 = calculateEMA(closes, 200)
    const bb = calculateBollingerBands(closes, 20, 2.0)
    const rsi = calculateRSI(closes, 14)
    const macd = calculateMACD(closes, 12, 26, 9)

    // Run backtest if strategyDSL is present
    let btResult: BacktestResult | null = null
    const tradeMap = new Map<string, any>()
    
    if (strategyDSL) {
      try {
        btResult = runLocalBacktest(strategyDSL, ohlcv)
        setBacktestStats(btResult)
        
        // Map trades by nearest timestamp/date
        btResult.trades.forEach(trade => {
          tradeMap.set(trade.entryDate, {
            side: trade.side,
            price: trade.entryPrice,
            label: trade.side === 'BUY_LONG' ? 'BUY ▲' : 'SELL ▼',
            reason: 'ENTRY_SIGNAL'
          })
          tradeMap.set(trade.exitDate, {
            side: 'EXIT',
            price: trade.exitPrice,
            label: `EXIT ${trade.reason === 'TAKE_PROFIT' ? 'TP' : trade.reason === 'STOP_LOSS' ? 'SL' : 'CLOSE'}`,
            netPnl: trade.netPnl,
            pnlPct: trade.pnlPercent,
            reason: trade.reason
          })
        })
      } catch (err) {
        console.error("Backtest execution error in StrategyChartViewer:", err)
      }
    }

    const compiled: ChartDataPoint[] = ohlcv.map((d, i) => ({
      index: i,
      date: d.date,
      timestamp: d.timestamp,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
      volume: d.volume,
      zigzag: zigzagSeries[i] !== null ? +zigzagSeries[i]!.toFixed(2) : null,
      ema20: +ema20[i].toFixed(2),
      ema50: +ema50[i].toFixed(2),
      ema200: +ema200[i].toFixed(2),
      bbUpper: +bb.upper[i].toFixed(2),
      bbLower: +bb.lower[i].toFixed(2),
      bbMiddle: +bb.middle[i].toFixed(2),
      rsi: +rsi[i].toFixed(1),
      macd: +macd.macdLine[i].toFixed(2),
      macdSignal: +macd.signalLine[i].toFixed(2),
      macdHist: +macd.histogram[i].toFixed(2),
      tradeEvent: tradeMap.get(d.date)
    }))

    setChartData(compiled.slice(-140))
    if (ohlcv.length > 0) {
      const last = ohlcv[ohlcv.length - 1]
      const prev = ohlcv[Math.max(0, ohlcv.length - 25)]
      setCurrentPrice(last.close)
      const diff = last.close - prev.close
      setPriceChange24h({
        val: +diff.toFixed(2),
        pct: +((diff / prev.close) * 100).toFixed(2)
      })
    }
    setIsSimulating(false)
  }, [tradingPair, timeframe, lookbackDays, strategyDSL])

  React.useEffect(() => {
    computeChartSeries()
  }, [computeChartSeries])

  // Live Dynamic Price Tick Stream (Simulates real-time market action)
  React.useEffect(() => {
    if (!isLiveActive) return

    const interval = setInterval(() => {
      setChartData(prev => {
        if (!prev.length) return prev
        const lastIdx = prev.length - 1
        const lastPoint = prev[lastIdx]
        
        // Micro-fluctuation: ±0.06%
        const deltaPct = (Math.random() - 0.49) * 0.0012
        const delta = +(lastPoint.close * deltaPct).toFixed(2)
        const newClose = +(lastPoint.close + delta).toFixed(2)
        const newHigh = Math.max(lastPoint.high, newClose)
        const newLow = Math.min(lastPoint.low, newClose)

        setLastTickDirection(delta >= 0 ? 'up' : 'down')
        setCurrentPrice(newClose)

        const updated = [...prev]
        updated[lastIdx] = {
          ...lastPoint,
          close: newClose,
          high: newHigh,
          low: newLow,
          volume: lastPoint.volume + Math.floor(Math.random() * 45)
        }
        return updated
      })
    }, 1800)

    return () => clearInterval(interval)
  }, [isLiveActive])

  // Custom Dot for Trade Executions
  const renderTradeMarkerDot = (props: any) => {
    if (!showTrades) return null
    const { cx, cy, payload } = props
    if (!payload?.tradeEvent) return null

    const event = payload.tradeEvent
    const isBuy = event.side === 'BUY_LONG'
    const isExit = event.side === 'EXIT'
    const isWin = (event.netPnl || 0) >= 0

    return (
      <g key={`trade-${payload.index}`}>
        <circle 
          cx={cx} 
          cy={cy} 
          r={5.5} 
          fill={isBuy ? "#10b981" : isExit ? (isWin ? "#0284c7" : "#ef4444") : "#f59e0b"} 
          stroke={isWhite ? "#ffffff" : "#090d16"} 
          strokeWidth={2}
          className="filter drop-shadow-sm cursor-pointer"
        />
      </g>
    )
  }

  // Custom High-Density Tooltip (Theme Responsive)
  const CustomChartTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null
    const pt: ChartDataPoint = payload[0]?.payload
    if (!pt) return null

    return (
      <div className={`rounded-xl border p-3 shadow-2xl backdrop-blur-md text-xs font-mono min-w-[220px] select-none z-50 ${
        isWhite 
          ? 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/50' 
          : 'bg-slate-950/95 border-slate-700/80 text-slate-100 shadow-black/80'
      }`}>
        <div className={`flex items-center justify-between border-b pb-1.5 mb-2 ${isWhite ? 'border-slate-100' : 'border-slate-800'}`}>
          <span className={`font-bold ${isWhite ? 'text-slate-900' : 'text-slate-100'}`}>{pt.date}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
            isWhite ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-blue-500/15 text-blue-300'
          }`}>
            {timeframe}
          </span>
        </div>

        {/* OHLCV */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] mb-2">
          <div className="flex justify-between">
            <span className={isWhite ? 'text-slate-500' : 'text-slate-400'}>Open:</span>
            <span className="font-semibold">${pt.open.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className={isWhite ? 'text-slate-500' : 'text-slate-400'}>Close:</span>
            <span className={`font-bold ${pt.close >= pt.open ? 'text-emerald-600' : 'text-rose-600'}`}>
              ${pt.close.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className={isWhite ? 'text-slate-500' : 'text-slate-400'}>High:</span>
            <span className="font-semibold">${pt.high.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className={isWhite ? 'text-slate-500' : 'text-slate-400'}>Low:</span>
            <span className="font-semibold">${pt.low.toLocaleString()}</span>
          </div>
        </div>

        {/* Technical Overlays */}
        <div className={`border-t pt-1.5 flex flex-col gap-1 text-[10.5px] ${isWhite ? 'border-slate-100' : 'border-slate-800'}`}>
          {showEma20 && pt.ema20 && (
            <div className="flex justify-between text-amber-600">
              <span>EMA (20):</span>
              <span className="font-semibold">${pt.ema20.toLocaleString()}</span>
            </div>
          )}
          {showEma50 && pt.ema50 && (
            <div className="flex justify-between text-sky-600">
              <span>EMA (50):</span>
              <span className="font-semibold">${pt.ema50.toLocaleString()}</span>
            </div>
          )}
          {showEma200 && pt.ema200 && (
            <div className="flex justify-between text-purple-600">
              <span>EMA (200):</span>
              <span className="font-semibold">${pt.ema200.toLocaleString()}</span>
            </div>
          )}
          {showBollinger && pt.bbUpper && pt.bbLower && (
            <div className="flex justify-between text-teal-600 text-[10px]">
              <span>Bollinger (20,2):</span>
              <span>${pt.bbLower.toLocaleString()} - ${pt.bbUpper.toLocaleString()}</span>
            </div>
          )}
          {pt.rsi !== undefined && (
            <div className="flex justify-between text-violet-600">
              <span>RSI (14):</span>
              <span className="font-bold">{pt.rsi}</span>
            </div>
          )}
        </div>

        {/* Trade Execution Flag If Present */}
        {pt.tradeEvent && (
          <div className={`mt-2.5 p-2 rounded-lg border ${
            pt.tradeEvent.side === 'BUY_LONG' 
              ? (isWhite ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300')
              : pt.tradeEvent.side === 'EXIT'
              ? (pt.tradeEvent.netPnl || 0) >= 0 
                ? (isWhite ? 'bg-sky-50 border-sky-300 text-sky-800' : 'bg-sky-950/60 border-sky-500/40 text-sky-300')
                : (isWhite ? 'bg-rose-50 border-rose-300 text-rose-800' : 'bg-rose-950/60 border-rose-500/40 text-rose-300')
              : (isWhite ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-amber-950/60 border-amber-500/40 text-amber-300')
          }`}>
            <div className="flex items-center justify-between font-bold text-[11px]">
              <span>⚡ {pt.tradeEvent.label}</span>
              <span>${pt.tradeEvent.price.toLocaleString()}</span>
            </div>
            {pt.tradeEvent.pnlPct !== undefined && (
              <div className="text-[10px] mt-1 flex justify-between font-mono">
                <span>Realized PnL:</span>
                <span className={`font-bold ${pt.tradeEvent.pnlPct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {pt.tradeEvent.pnlPct >= 0 ? '+' : ''}{pt.tradeEvent.pnlPct}% (${pt.tradeEvent.netPnl?.toFixed(2)})
                </span>
              </div>
            )}
            <div className={`text-[9px] mt-0.5 ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
              Trigger: {pt.tradeEvent.reason || 'Confluence Rule'}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`flex h-full w-full flex-col overflow-hidden select-none transition-colors duration-200 ${
      isWhite ? 'bg-white text-slate-800' : 'bg-[#070b12] text-slate-100'
    }`}>
      
      {/* ═══ Header 1: Asset Ticker & Timeframe Navigation ═══ */}
      <div className={`flex h-[52px] shrink-0 items-center justify-between border-b px-4 transition-colors ${
        isWhite ? 'bg-slate-50/90 border-slate-200 shadow-xs' : 'bg-[#090e17] border-slate-800/80'
      }`}>
        
        {/* Left: Asset Picker & Live Price Ticker */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <select
              value={tradingPair}
              onChange={(e) => setTradingPair(e.target.value)}
              className={`rounded-lg border px-2.5 py-1 text-xs font-bold font-mono outline-none cursor-pointer transition-colors ${
                isWhite 
                  ? 'bg-white border-slate-300 text-slate-900 hover:border-blue-500 shadow-xs' 
                  : 'bg-slate-900 border-slate-700 text-white hover:border-accent-blue'
              }`}
            >
              <option value="BTC/USDT">BTC/USDT</option>
              <option value="ETH/USDT">ETH/USDT</option>
              <option value="SOL/USDT">SOL/USDT</option>
              <option value="NEAR/USDT">NEAR/USDT</option>
              <option value="PAXG/USDT">PAXG/USDT</option>
            </select>
            
            <div className="flex items-baseline gap-2 font-mono">
              <span className={`text-base font-extrabold flex items-center gap-1 ${isWhite ? 'text-slate-900' : 'text-white'}`}>
                ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                {lastTickDirection === 'up' && (
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                )}
                {lastTickDirection === 'down' && (
                  <span className="inline-block h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                )}
              </span>
              <span className={`flex items-center text-xs font-bold ${
                priceChange24h.pct >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {priceChange24h.pct >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                {priceChange24h.pct >= 0 ? '+' : ''}{priceChange24h.pct}%
              </span>
            </div>
          </div>

          <div className={`h-4 w-px ${isWhite ? 'bg-slate-200' : 'bg-slate-800'}`} />

          {/* Timeframe Selectors */}
          <div className={`flex items-center rounded-lg p-0.5 border text-[11px] font-mono ${
            isWhite ? 'bg-slate-200/70 border-slate-300 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}>
            {(['1m', '5m', '15m', '1h', '4h', '1d'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-0.5 rounded font-bold transition-all ${
                  timeframe === tf 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : isWhite ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Lookback Horizon */}
          <div className={`hidden xl:flex items-center rounded-lg p-0.5 border text-[11px] font-mono ${
            isWhite ? 'bg-slate-200/70 border-slate-300' : 'bg-slate-900 border-slate-800'
          }`}>
            {[7, 30, 90, 180].map((days) => (
              <button
                key={days}
                onClick={() => setLookbackDays(days)}
                className={`px-2 py-0.5 rounded font-bold transition-all ${
                  lookbackDays === days 
                    ? isWhite ? 'bg-slate-800 text-white' : 'bg-slate-700 text-white' 
                    : isWhite ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                {days}D
              </button>
            ))}
          </div>
        </div>

        {/* Center: Technical Overlay Toggles */}
        <div className="hidden lg:flex items-center gap-1.5">
          <button
            onClick={() => setShowZigzag(!showZigzag)}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10.5px] font-mono font-bold border transition-all ${
              showZigzag 
                ? (isWhite ? 'bg-amber-100/90 border-amber-400 text-amber-900 shadow-xs' : 'bg-amber-500/20 border-amber-500/60 text-amber-300') 
                : (isWhite ? 'border-slate-200 bg-white text-slate-500 hover:text-slate-800' : 'border-slate-800 bg-slate-900/60 text-slate-500 hover:text-slate-300')
            }`}
            title="Toggle Institutional ZigZag Swing Highs & Lows Pattern"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            <span>ZigZag Swings</span>
          </button>

          <button
            onClick={() => setShowEma20(!showEma20)}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10.5px] font-mono font-bold border transition-all ${
              showEma20 
                ? (isWhite ? 'bg-amber-100/70 border-amber-300 text-amber-800 shadow-xs' : 'bg-amber-500/15 border-amber-500/50 text-amber-300') 
                : (isWhite ? 'border-slate-200 bg-white text-slate-500 hover:text-slate-800' : 'border-slate-800 bg-slate-900/60 text-slate-500 hover:text-slate-300')
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            <span>EMA 20</span>
          </button>

          <button
            onClick={() => setShowEma50(!showEma50)}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10.5px] font-mono font-bold border transition-all ${
              showEma50 
                ? (isWhite ? 'bg-sky-100/70 border-sky-300 text-sky-800 shadow-xs' : 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300') 
                : (isWhite ? 'border-slate-200 bg-white text-slate-500 hover:text-slate-800' : 'border-slate-800 bg-slate-900/60 text-slate-500 hover:text-slate-300')
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
            <span>EMA 50</span>
          </button>

          <button
            onClick={() => setShowEma200(!showEma200)}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10.5px] font-mono font-bold border transition-all ${
              showEma200 
                ? (isWhite ? 'bg-purple-100/70 border-purple-300 text-purple-800 shadow-xs' : 'bg-purple-500/15 border-purple-500/50 text-purple-300') 
                : (isWhite ? 'border-slate-200 bg-white text-slate-500 hover:text-slate-800' : 'border-slate-800 bg-slate-900/60 text-slate-500 hover:text-slate-300')
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
            <span>EMA 200</span>
          </button>

          <button
            onClick={() => setShowBollinger(!showBollinger)}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10.5px] font-mono font-bold border transition-all ${
              showBollinger 
                ? (isWhite ? 'bg-teal-100/70 border-teal-300 text-teal-800 shadow-xs' : 'bg-teal-500/15 border-teal-500/50 text-teal-300') 
                : (isWhite ? 'border-slate-200 bg-white text-slate-500 hover:text-slate-800' : 'border-slate-800 bg-slate-900/60 text-slate-500 hover:text-slate-300')
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
            <span>Bollinger (20,2)</span>
          </button>

          <button
            onClick={() => setShowTrades(!showTrades)}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10.5px] font-mono font-bold border transition-all ${
              showTrades 
                ? (isWhite ? 'bg-emerald-100/80 border-emerald-400 text-emerald-800 shadow-xs' : 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300') 
                : (isWhite ? 'border-slate-200 bg-white text-slate-500 hover:text-slate-800' : 'border-slate-800 bg-slate-900/60 text-slate-500 hover:text-slate-300')
            }`}
          >
            <Zap className="h-3 w-3 text-emerald-600" />
            <span>Trades Overlay</span>
          </button>
        </div>

        {/* Right: Actions, Live Stream & Theme Switcher */}
        <div className="flex items-center gap-2">
          {/* Live Simulator Toggle */}
          <button
            onClick={() => setIsLiveActive(!isLiveActive)}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
              isLiveActive
                ? (isWhite ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs' : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300')
                : (isWhite ? 'bg-white border-slate-300 text-slate-500' : 'bg-slate-800 border-slate-700 text-slate-400')
            }`}
            title="Toggle Live Price Simulation"
          >
            {isLiveActive ? (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden sm:inline">Live Sim</span>
              </>
            ) : (
              <>
                <Pause className="h-3 w-3" />
                <span className="hidden sm:inline">Paused</span>
              </>
            )}
          </button>

          {/* Theme Selector Button: White Theme Default */}
          <button
            onClick={() => setChartTheme(isWhite ? 'dark' : 'white')}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
              isWhite 
                ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 shadow-xs' 
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title={`Switch to ${isWhite ? 'Dark' : 'White'} Theme`}
          >
            {isWhite ? (
              <>
                <Sun className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                <span className="hidden sm:inline">White Theme</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5 text-blue-400" />
                <span className="hidden sm:inline">Dark Theme</span>
              </>
            )}
          </button>

          <button
            onClick={() => computeChartSeries()}
            disabled={isSimulating}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
              isWhite
                ? 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700 shadow-xs'
                : 'border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200'
            }`}
            title="Re-run chart calculations with latest data"
          >
            <RefreshCw className={`h-3 w-3 ${isSimulating ? 'animate-spin text-blue-600' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => setWorkspaceMode('canvas')}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
              isWhite
                ? 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700 shadow-xs'
                : 'border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200'
            }`}
            title="Switch back to Visual Flowchart Canvas"
          >
            <LayoutGrid className="h-3 w-3 text-blue-600" />
            <span className="hidden sm:inline">Flow Graph</span>
          </button>

          <button
            onClick={() => setIsDeployModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-3 py-1 text-[11px] font-bold text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            title="Deploy this strategy to Paper or Live exchange"
          >
            <Zap className="h-3 w-3 fill-current" />
            <span>Deploy</span>
          </button>
        </div>
      </div>

      {/* ═══ Header 2: Strategy Executive Performance Ribbon ═══ */}
      {backtestStats && (
        <div className={`flex h-11 shrink-0 items-center justify-between border-b px-4 text-xs font-mono transition-colors ${
          isWhite ? 'bg-slate-100/70 border-slate-200 text-slate-700' : 'bg-[#080d15] border-slate-800/60 text-slate-400'
        }`}>
          <div className="flex items-center gap-3">
            <span className={`font-bold flex items-center gap-1.5 ${isWhite ? 'text-slate-900' : 'text-slate-200'}`}>
              <Activity className="h-3.5 w-3.5 text-blue-600" />
              <span>{strategyName || "Institutional Strategy"}</span>
            </span>
            <span className={isWhite ? 'text-slate-300' : 'text-slate-600'}>•</span>
            <span>
              Win Rate: <span className="font-bold text-emerald-600">{backtestStats.metrics.winRate}</span>
            </span>
            <span className={`hidden sm:inline ${isWhite ? 'text-slate-300' : 'text-slate-600'}`}>•</span>
            <span className="hidden sm:inline">
              Net Return: <span className={`font-bold ${backtestStats.metrics.totalReturnRaw >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {backtestStats.metrics.totalReturn}
              </span>
            </span>
            <span className={`hidden md:inline ${isWhite ? 'text-slate-300' : 'text-slate-600'}`}>•</span>
            <span className="hidden md:inline">
              Sharpe: <span className="font-bold text-blue-600">{backtestStats.metrics.sharpeRatio}</span>
            </span>
            <span className={`hidden md:inline ${isWhite ? 'text-slate-300' : 'text-slate-600'}`}>•</span>
            <span className="hidden md:inline">
              Max DD: <span className="font-bold text-rose-600">{backtestStats.metrics.maxDrawdown}</span>
            </span>
            <span className={`hidden lg:inline ${isWhite ? 'text-slate-300' : 'text-slate-600'}`}>•</span>
            <span className="hidden lg:inline">
              Profit Factor: <span className="font-bold text-amber-600">{backtestStats.metrics.profitFactor}</span>
            </span>
            <span className={`hidden lg:inline ${isWhite ? 'text-slate-300' : 'text-slate-600'}`}>•</span>
            <span className="hidden lg:inline">
              Trades: <span className={`font-bold ${isWhite ? 'text-slate-900' : 'text-slate-200'}`}>{backtestStats.metrics.totalTrades}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              isWhite ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30'
            }`}>
              ✓ Verified Backtest
            </span>
          </div>
        </div>
      )}

      {/* ═══ Main Split View: Technical Candlestick Area Chart & Sub-Pane ═══ */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        
        {/* Top: Main Price Action Chart */}
        <div className={`flex-1 w-full relative min-h-[300px] transition-colors ${
          isWhite ? 'bg-white' : 'bg-[#070b12]'
        }`}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 12, right: 24, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isWhite ? "#2563eb" : "#06b6d4"} stopOpacity={isWhite ? 0.22 : 0.25} />
                  <stop offset="95%" stopColor={isWhite ? "#2563eb" : "#06b6d4"} stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="bbBandGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0d9488" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#0d9488" stopOpacity={0.03} />
                </linearGradient>
              </defs>

              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={isWhite ? "#f1f5f9" : "#1e293b"} 
                vertical={true} 
                opacity={isWhite ? 0.9 : 0.6} 
              />
              
              <XAxis 
                dataKey="date" 
                stroke={isWhite ? "#94a3b8" : "#64748b"} 
                fontSize={10} 
                tickLine={false}
                minTickGap={45}
                fontFamily="monospace"
              />
              
              <YAxis 
                domain={['auto', 'auto']} 
                stroke={isWhite ? "#94a3b8" : "#64748b"} 
                fontSize={10} 
                orientation="right"
                tickLine={false}
                fontFamily="monospace"
                tickFormatter={(val) => {
                  if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`
                  if (val >= 1000) return `$${(val / 1000).toFixed(1)}k`
                  return `$${val.toFixed(0)}`
                }}
              />

              <Tooltip content={<CustomChartTooltip />} />

              {/* Bollinger Bands Envelopes */}
              {showBollinger && (
                <>
                  <Line 
                    type="linear" 
                    dataKey="bbUpper" 
                    stroke="#0d9488" 
                    strokeWidth={1} 
                    strokeDasharray="4 2" 
                    dot={false} 
                    isAnimationActive={false} 
                  />
                  <Line 
                    type="linear" 
                    dataKey="bbLower" 
                    stroke="#0d9488" 
                    strokeWidth={1} 
                    strokeDasharray="4 2" 
                    dot={false} 
                    isAnimationActive={false} 
                  />
                </>
              )}

              {/* ZigZag Swing Highs & Lows Pattern */}
              {showZigzag && (
                <Line 
                  type="linear" 
                  dataKey="zigzag" 
                  stroke="#f59e0b" 
                  strokeWidth={2.5} 
                  dot={{ r: 3.5, fill: '#f59e0b', stroke: isWhite ? '#ffffff' : '#0f172a', strokeWidth: 1.5 }} 
                  connectNulls={true} 
                  isAnimationActive={false} 
                />
              )}

              {/* Overlaid EMA Curves (Discrete Linear Steps) */}
              {showEma20 && (
                <Line 
                  type="linear" 
                  dataKey="ema20" 
                  stroke="#d97706" 
                  strokeWidth={1.75} 
                  dot={false} 
                  isAnimationActive={false} 
                />
              )}
              {showEma50 && (
                <Line 
                  type="linear" 
                  dataKey="ema50" 
                  stroke="#0284c7" 
                  strokeWidth={1.75} 
                  dot={false} 
                  isAnimationActive={false} 
                />
              )}
              {showEma200 && (
                <Line 
                  type="linear" 
                  dataKey="ema200" 
                  stroke="#7c3aed" 
                  strokeWidth={1.75} 
                  dot={false} 
                  isAnimationActive={false} 
                />
              )}

              {/* Main Price Area with Trade Markers - Zig-Zag Market Construction */}
              <Area 
                type="linear" 
                dataKey="close" 
                stroke={isWhite ? "#2563eb" : "#38bdf8"} 
                strokeWidth={2} 
                fill="url(#priceGradient)"
                dot={renderTradeMarkerDot}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom: Sub-Chart Pane (RSI / Volume / MACD) */}
        <div className={`h-[140px] shrink-0 border-t px-2 pt-1 relative transition-colors ${
          isWhite ? 'bg-white border-slate-200' : 'bg-[#080c14] border-slate-800/80'
        }`}>
          <div className="flex items-center justify-between px-3 mb-1">
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold">
              <button
                onClick={() => setSubChartType('rsi')}
                className={`px-2 py-0.5 rounded transition-all ${
                  subChartType === 'rsi' 
                    ? (isWhite ? 'bg-purple-600 text-white shadow-xs' : 'bg-violet-500/20 text-violet-300 border border-violet-500/40') 
                    : (isWhite ? 'text-slate-600 hover:text-slate-900' : 'text-slate-500 hover:text-slate-300')
                }`}
              >
                RSI (14)
              </button>
              <button
                onClick={() => setSubChartType('volume')}
                className={`px-2 py-0.5 rounded transition-all ${
                  subChartType === 'volume' 
                    ? (isWhite ? 'bg-sky-600 text-white shadow-xs' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40') 
                    : (isWhite ? 'text-slate-600 hover:text-slate-900' : 'text-slate-500 hover:text-slate-300')
                }`}
              >
                Volume Flow
              </button>
              <button
                onClick={() => setSubChartType('macd')}
                className={`px-2 py-0.5 rounded transition-all ${
                  subChartType === 'macd' 
                    ? (isWhite ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40') 
                    : (isWhite ? 'text-slate-600 hover:text-slate-900' : 'text-slate-500 hover:text-slate-300')
                }`}
              >
                MACD (12,26,9)
              </button>
            </div>

            {subChartType === 'rsi' && (
              <span className={`text-[9.5px] font-mono ${isWhite ? 'text-slate-500' : 'text-slate-400'}`}>
                Oversold &lt; 30 • Overbought &gt; 70
              </span>
            )}
          </div>

          <div className="h-[105px] w-full">
            {subChartType === 'rsi' && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 24, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isWhite ? "#f1f5f9" : "#1e293b"} vertical={false} opacity={0.6} />
                  <YAxis 
                    domain={[0, 100]} 
                    ticks={[30, 50, 70]} 
                    orientation="right" 
                    stroke={isWhite ? "#94a3b8" : "#64748b"} 
                    fontSize={9} 
                    fontFamily="monospace"
                  />
                  <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" opacity={0.7} />
                  <ReferenceLine y={50} stroke={isWhite ? "#cbd5e1" : "#475569"} strokeDasharray="2 2" opacity={0.5} />
                  <ReferenceLine y={30} stroke="#10b981" strokeDasharray="3 3" opacity={0.7} />
                  <Line 
                    type="linear" 
                    dataKey="rsi" 
                    stroke="#7c3aed" 
                    strokeWidth={1.75} 
                    dot={false} 
                    isAnimationActive={false} 
                  />
                </LineChart>
              </ResponsiveContainer>
            )}

            {subChartType === 'volume' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 24, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isWhite ? "#f1f5f9" : "#1e293b"} vertical={false} opacity={0.6} />
                  <YAxis 
                    orientation="right" 
                    stroke={isWhite ? "#94a3b8" : "#64748b"} 
                    fontSize={9} 
                    fontFamily="monospace"
                    tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
                  />
                  <Bar dataKey="volume" isAnimationActive={false}>
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.close >= entry.open ? '#10b981' : '#ef4444'} 
                        opacity={0.75} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}

            {subChartType === 'macd' && (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 5, right: 24, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isWhite ? "#f1f5f9" : "#1e293b"} vertical={false} opacity={0.6} />
                  <YAxis orientation="right" stroke={isWhite ? "#94a3b8" : "#64748b"} fontSize={9} fontFamily="monospace" />
                  <ReferenceLine y={0} stroke={isWhite ? "#cbd5e1" : "#475569"} strokeDasharray="2 2" />
                  <Bar dataKey="macdHist" isAnimationActive={false}>
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`macd-cell-${index}`} 
                        fill={(entry.macdHist || 0) >= 0 ? '#10b981' : '#ef4444'} 
                        opacity={0.8} 
                      />
                    ))}
                  </Bar>
                  <Line type="linear" dataKey="macd" stroke="#0284c7" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                  <Line type="linear" dataKey="macdSignal" stroke="#d97706" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Bottom Expandable Execution Blotter ═══ */}
      <div className={`border-t shrink-0 transition-colors ${
        isWhite ? 'bg-white border-slate-200' : 'bg-[#070b12] border-slate-800'
      }`}>
        <div 
          onClick={() => setIsBlotterOpen(!isBlotterOpen)}
          className={`flex h-8 items-center justify-between px-4 cursor-pointer transition-colors ${
            isWhite ? 'hover:bg-slate-100' : 'hover:bg-slate-900/60'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-mono font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className={isWhite ? 'text-slate-800' : 'text-slate-300'}>Live Strategy Execution Blotter</span>
            {backtestStats && (
              <span className={`font-normal ${isWhite ? 'text-slate-500' : 'text-slate-500'}`}>
                ({backtestStats.trades.length} historical trades recorded)
              </span>
            )}
          </div>

          <button className={`p-1 ${isWhite ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}>
            {isBlotterOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
          </button>
        </div>

        {isBlotterOpen && (
          <div className={`max-h-[140px] overflow-y-auto border-t p-2 font-mono text-[11px] ${
            isWhite ? 'border-slate-200 bg-white' : 'border-slate-800/80 bg-[#070b12]'
          }`}>
            {backtestStats && backtestStats.trades.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {backtestStats.trades.slice(-9).reverse().map((trade) => (
                  <div 
                    key={trade.id}
                    className={`rounded-lg border p-2 flex flex-col justify-between transition-all ${
                      trade.pnlPercent >= 0 
                        ? (isWhite ? 'bg-emerald-50/70 border-emerald-200 shadow-xs' : 'bg-emerald-950/20 border-emerald-500/30') 
                        : (isWhite ? 'bg-rose-50/70 border-rose-200 shadow-xs' : 'bg-rose-950/20 border-rose-500/30')
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                        trade.side === 'BUY_LONG' 
                          ? (isWhite ? 'bg-emerald-200/70 text-emerald-900' : 'bg-emerald-500/20 text-emerald-300') 
                          : (isWhite ? 'bg-amber-200/70 text-amber-900' : 'bg-amber-500/20 text-amber-300')
                      }`}>
                        {trade.side}
                      </span>
                      <span className={`font-bold ${trade.pnlPercent >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {trade.pnlPercent >= 0 ? '+' : ''}{trade.pnlPercent}% (${trade.netPnl.toFixed(2)})
                      </span>
                    </div>

                    <div className={`flex items-center justify-between text-[10px] mt-1.5 ${
                      isWhite ? 'text-slate-600' : 'text-slate-400'
                    }`}>
                      <span>${trade.entryPrice.toLocaleString()} → ${trade.exitPrice.toLocaleString()}</span>
                      <span className={isWhite ? 'text-slate-500' : 'text-slate-500'}>{trade.reason}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`py-4 text-center ${isWhite ? 'text-slate-400' : 'text-slate-500'}`}>
                No trades triggered yet for current parameters. Build or adjust strategy rules on canvas to generate signals.
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  )
}
