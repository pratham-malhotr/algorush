"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Blocks, LineChart, Shield, Activity, MessageSquare, Bot, Sparkles, Zap, Crosshair, TrendingUp, Briefcase, MousePointer2, BellRing, CheckCircle2, ArrowRightLeft } from "lucide-react"

const STEPS = [
  {
    title: "Type your strategy in plain English",
    description: "No coding required. Just tell the AI what you want to build in plain English, and it instantly generates the algorithmic logic for you.",
    icon: MessageSquare,
  },
  {
    title: "Review visual strategy blocks",
    description: "Your text is instantly converted into a drag-and-drop flowchart. Tweak parameters, add conditions, and visualize the exact logic.",
    icon: Blocks,
  },
  {
    title: "Backtest against real history",
    description: "Run against 1–3 years of real OHLCV data, see return %, drawdown, win rate before risking capital.",
    icon: LineChart,
  },
  {
    title: "Connect your wallet securely",
    description: "AlgoText.ai executes trades directly to your connected brokerage account or Web3 wallet.",
    icon: Shield,
  },
  {
    title: "Go live and monitor 24/7",
    description: "Connect your broker securely. The strategy runs automatically, sending you alerts when trades execute.",
    icon: Activity,
  },
]

function TypingMockup() {
  const PROMPTS = [
    "Buy BTC if 15m RSI < 30 and MACD crosses up. Set ATR trailing stop.",
    "Short TSLA if it gaps up > 3% pre-market. Target 2R profit.",
    "Yield farm ETH/USDC on Uniswap V3. Auto-rebalance if IL > 2%.",
    "Sell AAPL Iron Condor 45 DTE. Close at 50% max profit."
  ]
  const [typedText, setTypedText] = React.useState("")
  const [phase, setPhase] = React.useState("typing")
  
  React.useEffect(() => {
    let isMounted = true
    const run = async () => {
      let index = 0
      while(isMounted) {
        const text = PROMPTS[index]
        setTypedText("")
        setPhase("typing")
        await new Promise(r => setTimeout(r, 500))
        
        // Type forward
        for (let i = 0; i <= text.length; i++) {
          if (!isMounted) return
          setTypedText(text.slice(0, i))
          await new Promise(r => setTimeout(r, 30 + Math.random() * 20))
        }
        
        setPhase("done")
        await new Promise(r => setTimeout(r, 2500))
        
        setPhase("deleting")
        // Delete backward
        for (let i = text.length; i >= 0; i--) {
          if (!isMounted) return
          setTypedText(text.slice(0, i))
          await new Promise(r => setTimeout(r, 15))
        }
        
        index = (index + 1) % PROMPTS.length
      }
    }
    run()
    return () => { isMounted = false }
  }, [])
  
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 p-6" style={{ backgroundImage: "radial-gradient(circle, #cbd5e1 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
      <div className="relative z-30 flex w-full max-w-[400px] items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
        <Bot className="h-6 w-6 text-black shrink-0 mt-1" />
        <div className="flex-1 text-sm text-black font-semibold font-mono whitespace-normal break-words leading-relaxed min-h-[40px] pt-1">
          {typedText}
          {phase === "typing" && (
            <motion.span 
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="inline-block w-[2px] h-[14px] bg-black ml-1 align-middle"
            />
          )}
        </div>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
           <Sparkles className="h-4 w-4 text-black" />
        </div>
      </div>
    </div>
  )
}

const BLOCK_CONFIGS = [
  { 
    nodes: [
      { id: 1, title: "TRIGGER", desc: "4H Sweep", x: 110, y: 10, color: "blue", Icon: Crosshair },
      { id: 2, title: "FILTER", desc: "RSI < 30", x: 40, y: 70, color: "amber", Icon: Activity },
      { id: 3, title: "FILTER", desc: "MACD Cross", x: 180, y: 70, color: "amber", Icon: TrendingUp },
      { id: 4, title: "ACTION", desc: "Buy BTC", x: 40, y: 130, color: "green", Icon: Zap },
      { id: 5, title: "RISK", desc: "Trail Stop", x: 180, y: 130, color: "red", Icon: Shield },
    ],
    edges: [ { from: 1, to: 2 }, { from: 1, to: 3 }, { from: 2, to: 4 }, { from: 3, to: 5 } ]
  },
  { 
    nodes: [
      { id: 1, title: "POOL", desc: "ETH/USDC", x: 110, y: 10, color: "blue", Icon: Activity },
      { id: 2, title: "YIELD", desc: "APY > 10%", x: 110, y: 70, color: "amber", Icon: TrendingUp },
      { id: 3, title: "ACTION", desc: "Mint LP", x: 110, y: 130, color: "green", Icon: Zap },
      { id: 4, title: "GUARD", desc: "IL > 2%", x: 10, y: 130, color: "red", Icon: Shield },
      { id: 5, title: "ALERT", desc: "Telegram", x: 210, y: 130, color: "purple", Icon: MessageSquare },
    ],
    edges: [ { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 2, to: 4 }, { from: 2, to: 5 } ]
  },
  { 
    nodes: [
      { id: 1, title: "EVENT", desc: "Earnings", x: 110, y: 10, color: "blue", Icon: MessageSquare },
      { id: 2, title: "VOL", desc: "IV Rank > 80", x: 40, y: 70, color: "amber", Icon: Activity },
      { id: 3, title: "MACRO", desc: "VIX < 20", x: 180, y: 70, color: "amber", Icon: LineChart },
      { id: 4, title: "ACTION", desc: "Sell Condor", x: 110, y: 130, color: "green", Icon: Briefcase },
    ],
    edges: [ { from: 1, to: 2 }, { from: 1, to: 3 }, { from: 2, to: 4 }, { from: 3, to: 4 } ]
  }
]

function BlocksMockup() {
  const [index, setIndex] = React.useState(0)
  
  React.useEffect(() => {
    let isMounted = true
    const interval = setInterval(() => {
      if (isMounted) setIndex(prev => (prev + 1) % BLOCK_CONFIGS.length)
    }, 4500)
    return () => { isMounted = false; clearInterval(interval) }
  }, [])
  
  const currentConfig = BLOCK_CONFIGS[index]
  
  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue": return { border: "border-blue-200", bg: "bg-blue-100", text: "text-blue-600" }
      case "amber": return { border: "border-amber-200", bg: "bg-amber-100", text: "text-amber-600" }
      case "green": return { border: "border-green-200", bg: "bg-green-100", text: "text-green-600" }
      case "red": return { border: "border-red-200", bg: "bg-red-100", text: "text-red-600" }
      case "purple": return { border: "border-purple-200", bg: "bg-purple-100", text: "text-purple-600" }
      default: return { border: "border-gray-200", bg: "bg-gray-100", text: "text-gray-600" }
    }
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 p-4" style={{ backgroundImage: "radial-gradient(circle, #cbd5e1 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
      <div className="relative w-full max-w-[320px] h-[180px]">
        {/* SVG Lines */}
        <svg className="absolute inset-0 h-full w-full pointer-events-none">
           <AnimatePresence>
             {currentConfig.edges.map((edge, i) => {
                const fromNode = currentConfig.nodes.find(n => n.id === edge.from)
                const toNode = currentConfig.nodes.find(n => n.id === edge.to)
                if (!fromNode || !toNode) return null
                
                const startX = fromNode.x + 50
                const startY = fromNode.y + 36
                const endX = toNode.x + 50
                const endY = toNode.y
                const yMid = startY + (endY - startY) / 2
                
                const pathData = `M ${startX} ${startY} C ${startX} ${yMid}, ${endX} ${yMid}, ${endX} ${endY}`
                
                return (
                  <motion.path 
                    key={`edge-${index}-${i}`}
                    d={pathData}
                    fill="transparent" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3 3" strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  />
                )
             })}
           </AnimatePresence>
        </svg>

        {/* Nodes */}
        <AnimatePresence>
           {currentConfig.nodes.map((node, i) => {
              const colors = getColorClasses(node.color)
              const Icon = node.Icon
              return (
                <motion.div 
                  key={`node-${index}-${node.id}`}
                  initial={{ y: 10, opacity: 0, scale: 0.9 }}
                  animate={{ y: [0, -3, 0], opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  transition={{ 
                    y: { duration: 2, repeat: Infinity, repeatType: "reverse", delay: i * 0.1 },
                    opacity: { duration: 0.3 },
                    scale: { duration: 0.3 }
                  }}
                  className={`absolute flex h-9 w-[100px] items-center gap-1.5 rounded-md border ${colors.border} bg-white p-1.5 shadow-sm`}
                  style={{ left: node.x, top: node.y }}
                >
                  <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded ${colors.bg}`}>
                    <Icon className={`h-3 w-3 ${colors.text}`} />
                  </div>
                  <div className="flex flex-col overflow-hidden w-full">
                    <span className={`text-[8px] font-bold uppercase leading-none mb-0.5 ${colors.text}`}>{node.title}</span>
                    <span className="text-[9px] font-semibold text-black truncate w-full">{node.desc}</span>
                  </div>
                </motion.div>
              )
           })}
        </AnimatePresence>
      </div>
    </div>
  )
}

const BACKTEST_CONFIGS = [
  {
    asset: "BTC-USD",
    period: "2023 - 2024",
    return: "+145.2%",
    winRate: "68%",
    drawdown: "-12.4%",
    chartColor: "#22C55E",
    chartBg: "rgba(34,197,94,0.1)",
    strokePath: "M0 150 Q 50 100, 100 120 T 200 80 T 300 40",
    fillPath: "M0 150 Q 50 100, 100 120 T 200 80 T 300 40 L300 200 L0 200 Z"
  },
  {
    asset: "TSLA-OPT",
    period: "2024 YTD",
    return: "+84.1%",
    winRate: "75%",
    drawdown: "-8.2%",
    chartColor: "#3B82F6",
    chartBg: "rgba(59,130,246,0.1)",
    strokePath: "M0 130 Q 80 150, 150 100 T 250 60 T 300 30",
    fillPath: "M0 130 Q 80 150, 150 100 T 250 60 T 300 30 L300 200 L0 200 Z"
  },
  {
    asset: "ETH/USDC",
    period: "2023 - 2024",
    return: "+32.5%",
    winRate: "92%",
    drawdown: "-1.5%",
    chartColor: "#A855F7",
    chartBg: "rgba(168,85,247,0.1)",
    strokePath: "M0 170 Q 50 160, 100 140 T 200 90 T 300 40",
    fillPath: "M0 170 Q 50 160, 100 140 T 200 90 T 300 40 L300 200 L0 200 Z"
  }
]

function BacktestMockup() {
  const [index, setIndex] = React.useState(0)
  const [phase, setPhase] = React.useState("running")
  const [progress, setProgress] = React.useState(0)
  
  React.useEffect(() => {
    let isMounted = true
    const run = async () => {
      while(isMounted) {
        setPhase("running")
        setProgress(0)
        
        for(let p = 0; p <= 100; p += 4) {
          if(!isMounted) return
          setProgress(p)
          await new Promise(r => setTimeout(r, 30))
        }
        
        if(!isMounted) return
        setPhase("drawing")
        await new Promise(r => setTimeout(r, 1500))
        
        if(!isMounted) return
        setPhase("done")
        await new Promise(r => setTimeout(r, 3500))
        
        setIndex(prev => (prev + 1) % BACKTEST_CONFIGS.length)
      }
    }
    run()
    return () => { isMounted = false }
  }, [])
  
  const current = BACKTEST_CONFIGS[index]
  const isRunning = phase === "running"
  
  return (
    <div className="absolute inset-0 flex flex-col bg-bg-surface overflow-hidden">
      <div className="flex h-12 items-center justify-between border-b border-bg-border bg-bg-elevated px-4 relative z-20">
        <div className="flex items-center gap-2">
           <Activity className="h-4 w-4 text-text-secondary" />
           <span className="text-xs font-bold text-text-secondary uppercase">Historical Test</span>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-xs font-mono text-text-secondary bg-bg-surface px-2 py-1 rounded border border-bg-border">
             {current.asset}
           </span>
           <span className="text-xs font-mono text-text-secondary bg-bg-surface px-2 py-1 rounded border border-bg-border">
             {current.period}
           </span>
        </div>
      </div>
      
      <div className="relative flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {isRunning ? (
            <motion.div 
              key={`running-${index}`}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10"
            >
               <div className="w-full max-w-[240px] flex flex-col gap-4">
                 <div className="flex items-center justify-between text-xs font-mono text-text-secondary">
                   <span>{progress < 40 ? "Fetching OHLCV..." : progress < 80 ? "Simulating trades..." : "Calculating metrics..."}</span>
                   <span>{progress}%</span>
                 </div>
                 <div className="h-2 w-full rounded-full bg-bg-border overflow-hidden">
                    <div className="h-full bg-accent-blue transition-all duration-75" style={{ width: `${progress}%` }} />
                 </div>
                 <div className="flex flex-col gap-1.5 mt-2 h-10">
                   {progress > 10 && <span className="text-[10px] font-mono text-text-secondary/50">Loaded 14,234 candles</span>}
                   {progress > 50 && <span className="text-[10px] font-mono text-text-secondary/50">Executed 128 trades...</span>}
                 </div>
               </div>
            </motion.div>
          ) : (
            <motion.div
              key={`done-${index}`}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col justify-between"
            >
               <div className="grid grid-cols-3 gap-2 px-6 pt-6 relative z-10">
                 <div className="flex flex-col gap-1 rounded-lg border border-bg-border bg-bg-elevated p-2 shadow-sm">
                   <span className="text-[10px] font-bold uppercase text-text-secondary">Net Return</span>
                   <span className="text-sm font-bold" style={{ color: current.chartColor }}>{current.return}</span>
                 </div>
                 <div className="flex flex-col gap-1 rounded-lg border border-bg-border bg-bg-elevated p-2 shadow-sm">
                   <span className="text-[10px] font-bold uppercase text-text-secondary">Win Rate</span>
                   <span className="text-sm font-bold text-text-primary">{current.winRate}</span>
                 </div>
                 <div className="flex flex-col gap-1 rounded-lg border border-bg-border bg-bg-elevated p-2 shadow-sm">
                   <span className="text-[10px] font-bold uppercase text-text-secondary">Max Drawdown</span>
                   <span className="text-sm font-bold text-red-500">{current.drawdown}</span>
                 </div>
               </div>
               
               <div className="absolute inset-x-0 bottom-0 h-full pt-20 pointer-events-none">
                  <svg className="h-full w-full opacity-80" preserveAspectRatio="none" viewBox="0 0 300 200">
                    <motion.path 
                      d={current.fillPath} 
                      fill={current.chartBg}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: phase === "done" ? 1 : 0 }}
                      transition={{ duration: 1 }}
                    />
                    <motion.path 
                      d={current.strokePath} 
                      fill="none" 
                      stroke={current.chartColor} 
                      strokeWidth="3"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                  </svg>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function WalletMockup() {
  const [phase, setPhase] = React.useState("idle")
  
  React.useEffect(() => {
    let isMounted = true
    const run = async () => {
      while(isMounted) {
        setPhase("idle")
        await new Promise(r => setTimeout(r, 1200))
        
        if(!isMounted) return
        setPhase("hover")
        await new Promise(r => setTimeout(r, 600))
        
        if(!isMounted) return
        setPhase("open")
        await new Promise(r => setTimeout(r, 1000))
        
        if(!isMounted) return
        setPhase("hover_mm")
        await new Promise(r => setTimeout(r, 600))
        
        if(!isMounted) return
        setPhase("connecting")
        await new Promise(r => setTimeout(r, 1500))
        
        if(!isMounted) return
        setPhase("connected")
        await new Promise(r => setTimeout(r, 3000))
      }
    }
    run()
    return () => { isMounted = false }
  }, [])

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 p-6 overflow-hidden" style={{ backgroundImage: "radial-gradient(circle, #cbd5e1 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
      
      {/* Background Glow */}
      {phase === "connected" && (
         <motion.div 
           initial={{ opacity: 0, scale: 0.5 }}
           animate={{ opacity: 1, scale: 1 }}
           className="absolute w-[200px] h-[200px] bg-green-400/20 rounded-full blur-3xl"
         />
      )}

      <div className="relative w-full max-w-[280px] h-full flex flex-col items-center justify-center">
        
        {/* Connect Button */}
        <motion.button 
          className={`relative z-10 flex h-12 items-center gap-3 rounded-xl px-5 font-bold shadow-lg transition-all duration-300 ${phase === "connected" ? "bg-white border border-green-300 text-black shadow-green-500/10" : "bg-gradient-to-r from-blue-600 to-blue-500 text-white"}`}
          animate={phase === "idle" ? { scale: [1, 1.03, 1] } : { scale: 1 }}
          transition={{ duration: 2, repeat: phase === "idle" ? Infinity : 0 }}
        >
          {phase === "connected" ? (
             <>
               <div className="relative flex h-3 w-3 items-center justify-center">
                 <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                 <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
               </div>
               <span className="font-mono text-sm tracking-tight">0x4f...8a2C</span>
               <div className="ml-1 flex items-center rounded-lg bg-gray-100 px-2 py-1 text-[10px] text-gray-600 border border-gray-200">
                 2.4 ETH
               </div>
             </>
          ) : (
             <>Connect Wallet</>
          )}
        </motion.button>
        
        {/* Modal */}
        <AnimatePresence>
          {(phase === "open" || phase === "hover_mm" || phase === "connecting") && (
            <motion.div 
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-1/2 -translate-y-1/2 mt-16 w-[260px] rounded-2xl border border-gray-200 bg-white/90 backdrop-blur-xl p-4 shadow-2xl z-20 flex flex-col gap-3"
            >
               <h4 className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider text-center">Select Provider</h4>
               
               {/* MetaMask Option */}
               <div className={`flex h-12 w-full items-center justify-between rounded-xl border px-3 transition-colors ${phase === "hover_mm" || phase === "connecting" ? "border-blue-400 bg-blue-50" : "border-gray-100 bg-gray-50"}`}>
                 <div className="flex items-center gap-3">
                   <div className="h-7 w-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-inner">
                     <div className="w-3 h-3 bg-white" style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }} />
                   </div>
                   <span className="text-sm font-bold text-gray-800">MetaMask</span>
                 </div>
                 {phase === "connecting" ? (
                   <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                     <Activity className="h-4 w-4 text-blue-500" />
                   </motion.div>
                 ) : (
                   <div className={`h-2 w-2 rounded-full ${phase === "hover_mm" ? "bg-blue-400" : "bg-transparent"}`} />
                 )}
               </div>
               
               {/* Trust Wallet Option */}
               <div className="flex h-12 w-full items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 opacity-60">
                 <div className="flex items-center gap-3">
                   <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-inner">
                     <Shield className="h-3 w-3 text-white" />
                   </div>
                   <span className="text-sm font-bold text-gray-800">Trust Wallet</span>
                 </div>
               </div>
               
               {/* Coinbase Wallet Option */}
               <div className="flex h-12 w-full items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 opacity-60">
                 <div className="flex items-center gap-3">
                   <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-inner">
                     <span className="text-xs font-bold text-white">C</span>
                   </div>
                   <span className="text-sm font-bold text-gray-800">Coinbase</span>
                 </div>
               </div>
               
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Animated Mouse Cursor with Ripple */}
        <AnimatePresence>
           {(phase === "idle" || phase === "open") && (
             <motion.div
               initial={{ x: 100, y: 150, opacity: 0 }}
               animate={
                 phase === "hover" ? { x: 30, y: 10, opacity: 1 } 
                 : phase === "open" ? { x: 30, y: 10, opacity: 1, scale: [1, 0.8, 1] } 
                 : phase === "hover_mm" ? { x: -30, y: 60, opacity: 1 } 
                 : phase === "connecting" ? { x: -30, y: 60, opacity: 1, scale: [1, 0.8, 1] } 
                 : { opacity: 0 }
               }
               exit={{ opacity: 0 }}
               transition={{ duration: 0.6, ease: "easeInOut" }}
               className="absolute z-50 pointer-events-none"
             >
               <MousePointer2 className="h-6 w-6 text-black fill-white drop-shadow-xl" />
               
               {/* Ripple effect on click */}
               {(phase === "open" || phase === "connecting") && (
                 <motion.div 
                   initial={{ scale: 0, opacity: 0.8 }}
                   animate={{ scale: 2.5, opacity: 0 }}
                   transition={{ duration: 0.5 }}
                   className="absolute -top-2 -left-2 h-4 w-4 rounded-full border-2 border-blue-500"
                 />
               )}
             </motion.div>
           )}
        </AnimatePresence>

      </div>
    </div>
  )
}

function LiveMockup() {
  const [logs, setLogs] = React.useState<any[]>([])
  
  React.useEffect(() => {
    let isMounted = true
    const run = async () => {
       while(isMounted) {
         setLogs([{ id: 1, type: "system", msg: "Bot activated: Alpha Strategy", time: "Just now" }])
         await new Promise(r => setTimeout(r, 1500))
         
         if(!isMounted) return
         setLogs(prev => [{ id: 2, type: "trade", side: "buy", msg: "Executed BUY 2.5 ETH @ $3,420", time: "Just now" }, ...prev])
         await new Promise(r => setTimeout(r, 2000))
         
         if(!isMounted) return
         setLogs(prev => [{ id: 3, type: "alert", msg: "Trailing stop updated to $3,450", time: "Just now" }, ...prev])
         await new Promise(r => setTimeout(r, 2000))
         
         if(!isMounted) return
         setLogs(prev => [{ id: 4, type: "trade", side: "sell", msg: "Take profit hit: +$340.50", time: "Just now" }, ...prev])
         await new Promise(r => setTimeout(r, 4500)) 
       }
    }
    run()
    return () => { isMounted = false }
  }, [])

  return (
    <div className="absolute inset-0 flex flex-col bg-gray-50 overflow-hidden" style={{ backgroundImage: "radial-gradient(circle, #cbd5e1 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
      
      {/* Header */}
      <div className="relative z-10 flex h-12 shrink-0 items-center justify-between border-b border-gray-200 bg-white/90 backdrop-blur px-4">
        <div className="flex items-center gap-2">
           <Activity className="h-4 w-4 text-gray-500" />
           <span className="text-xs font-bold text-gray-600 uppercase">Live Monitor</span>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-2 py-1">
           <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
           <span className="text-[10px] font-bold text-green-700 uppercase tracking-wide">Active</span>
        </div>
      </div>
      
      {/* Feed */}
      <div className="relative flex-1 p-4 overflow-hidden flex flex-col gap-2">
         <AnimatePresence>
            {logs.map((log) => {
              const isTrade = log.type === "trade"
              const isBuy = log.side === "buy"
              
              let Icon = BellRing
              let iconColor = "text-blue-500"
              let iconBg = "bg-blue-100"
              
              if (log.type === "system") {
                Icon = CheckCircle2
                iconColor = "text-green-500"
                iconBg = "bg-green-100"
              } else if (isTrade) {
                Icon = ArrowRightLeft
                iconColor = isBuy ? "text-green-600" : "text-purple-600"
                iconBg = isBuy ? "bg-green-100" : "bg-purple-100"
              } else if (log.type === "alert") {
                Icon = Shield
                iconColor = "text-amber-500"
                iconBg = "bg-amber-100"
              }

              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white p-3 shadow-sm z-20"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
                      <Icon className={`h-4 w-4 ${iconColor}`} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-800">{log.msg}</span>
                      <span className="text-[9px] font-medium text-gray-400">{log.time}</span>
                    </div>
                  </div>
                  {isTrade && (
                     <div className={`text-[9px] font-bold px-2 py-0.5 rounded ${isBuy ? "bg-green-50 text-green-700 border border-green-200" : "bg-purple-50 text-purple-700 border border-purple-200"}`}>
                       {isBuy ? "BUY" : "SELL"}
                     </div>
                  )}
                </motion.div>
              )
            })}
         </AnimatePresence>
      </div>
    </div>
  )
}

export function HowItWorks() {
  return (
    <section className="mx-auto flex w-full max-w-[1200px] flex-col items-center px-6 py-24">
      <div className="mb-16 text-center">
        <h2 className="mb-4 text-[36px] font-bold text-text-primary">How AlgoText.ai works</h2>
        <p className="text-[16px] text-text-secondary">From idea to live trading bot in under 5 minutes</p>
      </div>

      <div className="flex w-full flex-col gap-24">
        {STEPS.map((step, i) => {
          const isEven = i % 2 === 0
          return (
            <div key={i} className={`flex flex-col items-center gap-12 md:flex-row ${!isEven ? "md:flex-row-reverse" : ""}`}>
              {/* Text content */}
              <div className="flex flex-1 flex-col gap-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-bg-elevated text-[24px] font-bold text-text-secondary border border-bg-border">
                  {i + 1}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-blue/10 text-accent-blue">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-[24px] font-bold text-text-primary">{step.title}</h3>
                </div>
                <p className="text-[16px] leading-[1.6] text-text-secondary">
                  {step.description}
                </p>
              </div>

              {/* Visual Mockup */}
              <div className="flex flex-1 items-center justify-center w-full">
                <div className="relative aspect-video w-full overflow-hidden rounded-[var(--radius-xl)] border border-bg-border bg-bg-surface shadow-[var(--shadow-card)]">
                  {/* Mock content based on step */}
                  {i === 0 && <TypingMockup />}
                  {i === 1 && <BlocksMockup />}
                  {i === 2 && <BacktestMockup />}
                  {i === 3 && <WalletMockup />}
                  {i === 4 && <LiveMockup />}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
