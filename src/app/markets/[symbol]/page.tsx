"use client"
import React, { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { ALL_ASSETS } from '@/lib/constants/assets'

const TechnicalAnalysisWidget = ({ symbol }: { symbol: string }) => {
  const cleanId = `ta_widget_${symbol.replace(/[^a-zA-Z0-9]/g, '_')}`;
  
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js";
    script.type = "text/javascript";
    script.async = true;
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
    });
    const container = document.getElementById(cleanId);
    if (container) {
      container.innerHTML = '';
      container.appendChild(script);
    }
  }, [symbol, cleanId]);

  return <div id={cleanId} className="w-full h-full min-h-[450px]" />
}

const SymbolInfoWidget = ({ symbol }: { symbol: string }) => {
  const cleanId = `si_widget_${symbol.replace(/[^a-zA-Z0-9]/g, '_')}`;

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: symbol,
      width: "100%",
      locale: "en",
      colorTheme: "light",
      isTransparent: true
    });
    const container = document.getElementById(cleanId);
    if (container) {
      container.innerHTML = '';
      container.appendChild(script);
    }
  }, [symbol, cleanId]);

  return <div id={cleanId} className="w-full pointer-events-none" />
}

const FearAndGreedIndex = ({ symbol, type }: { symbol: string, type: 'CRYPTO' }) => {
  // Deterministic mock based on symbol
  const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const score = (hash % 80) + 10; 
  
  let label = "Neutral"
  let color = "text-yellow-500"
  let barColor = "bg-yellow-500"
  
  if (score < 25) { label = "Extreme Fear"; color = "text-red-500"; barColor = "bg-red-500" }
  else if (score < 45) { label = "Fear"; color = "text-orange-500"; barColor = "bg-orange-500" }
  else if (score > 75) { label = "Extreme Greed"; color = "text-green-500"; barColor = "bg-green-500" }
  else if (score > 55) { label = "Greed"; color = "text-emerald-400"; barColor = "bg-emerald-400" }

  return (
    <div className="flex flex-col justify-center h-full p-6 bg-bg-surface border border-bg-border rounded-xl shadow-[var(--shadow-card)]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[15px] font-bold text-text-primary">Market Sentiment</h3>
        <span className="text-xs font-mono text-text-tertiary uppercase bg-bg-elevated px-2 py-1 rounded">{type} Market</span>
      </div>
      
      <div className="flex flex-col gap-1 mb-8 mt-2">
        <span className={`text-[42px] leading-none font-black ${color}`}>{score}</span>
        <span className={`text-[16px] font-bold ${color}`}>{label}</span>
      </div>
      
      <div className="relative w-full h-3 bg-bg-elevated rounded-full overflow-hidden shadow-inner">
        <div className={`absolute top-0 left-0 h-full ${barColor} transition-all duration-1000 ease-out`} style={{ width: `${score}%` }} />
      </div>
      
      <div className="flex justify-between mt-3 text-[10px] text-text-tertiary uppercase font-bold tracking-wider">
        <span>0</span>
        <span>Fear</span>
        <span>Neutral</span>
        <span>Greed</span>
        <span>100</span>
      </div>
    </div>
  )
}

export default function AssetDashboardPage() {
  const params = useParams()
  const router = useRouter()
  const symbolParam = params.symbol as string
  
  // Resolve Asset Exchange & Type
  const symbolRaw = symbolParam ? symbolParam.replace('-', '/') : 'BTC/USDT'
  const tvSymbolBase = symbolRaw.replace('/', '')
  
  const asset = ALL_ASSETS.find(a => a.symbol === symbolRaw)
  let fullSymbol = tvSymbolBase
  let marketType: 'CRYPTO' = 'CRYPTO'
  
  if (asset) {
    if (asset.market === 'CRYPTO') {
       fullSymbol = `OKX:${tvSymbolBase}`
       marketType = 'CRYPTO'
    }
  } else {
    // Fallback logic
    fullSymbol = `OKX:${tvSymbolBase}`
    marketType = 'CRYPTO'
  }

  useEffect(() => {
    // Dynamically load the TradingView Advanced Chart widget script
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if (typeof window !== "undefined" && (window as any).TradingView) {
        new (window as any).TradingView.widget({
          autosize: true,
          symbol: fullSymbol,
          interval: "D",
          timezone: "Etc/UTC",
          theme: "light",
          style: "1",
          locale: "en",
          enable_publishing: false,
          backgroundColor: "#ffffff", // matches bg-bg-surface roughly in light mode
          gridColor: "#e5e7eb", // standard light gray border
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          container_id: "tradingview_chart",
        });
      }
    };
    document.getElementById("tradingview_container")?.appendChild(script);

    return () => {
      const container = document.getElementById("tradingview_container");
      if (container) {
        container.innerHTML = '<div id="tradingview_chart" class="w-full h-full min-h-[500px]"></div>';
      }
    };
  }, [fullSymbol]);

  return (
    <div className="flex min-h-[calc(100vh-64px)] w-full flex-col bg-white p-6 lg:p-8 overflow-y-auto">
      <div className="mx-auto w-full max-w-[1400px] flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 rounded-md border border-bg-border bg-bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-bg-elevated transition-colors shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Markets
            </button>
            <h1 className="text-2xl font-bold text-text-primary uppercase tracking-tight">
              {symbolRaw}
            </h1>
          </div>
        </div>
        
        {/* Top Banner (Symbol Info) */}
        <div className="w-full min-h-[80px] h-auto py-2 bg-bg-surface rounded-xl border border-bg-border overflow-hidden shadow-[var(--shadow-card)] flex items-center px-4">
           <SymbolInfoWidget symbol={fullSymbol} />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           
           {/* Left Col (Chart) */}
           <div className="lg:col-span-2 flex flex-col gap-6 min-h-[550px] h-auto">
              <div className="flex-1 rounded-xl border border-bg-border overflow-hidden shadow-[var(--shadow-card)]" id="tradingview_container">
                 <div id="tradingview_chart" className="w-full h-full min-h-[500px]" />
              </div>
           </div>

           {/* Right Col (Analytics) */}
           <div className="lg:col-span-1 flex flex-col gap-6 min-h-[550px] h-auto">
              <div className="h-[180px] shrink-0">
                 <FearAndGreedIndex symbol={fullSymbol} type={marketType} />
              </div>
              <div className="flex-1 bg-bg-surface border border-bg-border rounded-xl p-4 overflow-hidden shadow-[var(--shadow-card)] flex flex-col">
                 <h3 className="text-[15px] font-bold text-text-primary mb-2">Technical Analysis</h3>
                 <div className="w-full flex-1 min-h-[350px] rounded-lg overflow-hidden">
                    <TechnicalAnalysisWidget symbol={fullSymbol} />
                 </div>
              </div>
           </div>

        </div>
      </div>
    </div>
  )
}
