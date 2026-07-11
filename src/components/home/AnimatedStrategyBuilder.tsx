"use client"

import * as React from "react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import { Bot, Activity, TrendingDown, TrendingUp, ShoppingCart, ShieldAlert, MessageSquare, BarChart2, DollarSign, PieChart, Sparkles, Crosshair, Zap, Briefcase } from "lucide-react"

// Array of Ultra Advanced Algorithmic Strategies
const STRATEGIES = [
  {
    text: "Sweep 4H Order Block -> TWAP buy. Hedge if funding > 0.01%. Take profit at 2 VWAP standard deviations. Set ATR trailing stop.",
    nodes: [
      { id: 1, x: 500, y: 40, icon: Crosshair, color: "blue", title: "Liquidity Sweep", desc: "4H Order Block", params: ["Source: Book", "Lookback: 24h"] },
      { id: 2, x: 500, y: 160, icon: Activity, color: "amber", title: "Filter", desc: "RSI Divergence", params: ["RSI < 30", "Timeframe: 15m"] },
      { id: 3, x: 500, y: 280, icon: Zap, color: "green", title: "Execution", desc: "TWAP Buy", params: ["Size: 2 BTC", "Duration: 2h"] },
      { id: 4, x: 500, y: 400, icon: ShieldAlert, color: "red", title: "Risk Engine", desc: "Trailing ATR Stop", params: ["Multiplier: 1.5x", "Dynamic"] },
      { id: 5, x: 500, y: 520, icon: ShieldAlert, color: "red", title: "Global Risk", desc: "Max Drawdown", params: ["Limit: 3%", "Killswitch"] },
      { id: 6, x: 200, y: 280, icon: BarChart2, color: "amber", title: "Condition", desc: "Funding > 0.01%", params: ["Exchange: Binance", "Premium"] },
      { id: 7, x: 200, y: 400, icon: Briefcase, color: "purple", title: "Execution", desc: "Hedge Position", params: ["Short ETH", "Beta Weight"] },
      { id: 8, x: 200, y: 520, icon: MessageSquare, color: "blue", title: "Notification", desc: "Webhook Alert", params: ["Discord", "Priority: High"] },
      { id: 9, x: 800, y: 280, icon: TrendingUp, color: "amber", title: "Mean Reversion", desc: "Price > VWAP", params: ["Bands: 2 StdDev", "Anchored"] },
      { id: 10, x: 800, y: 400, icon: PieChart, color: "green", title: "Take Profit 1", desc: "Scale Out", params: ["Sell 50%", "Limit Order"] },
      { id: 11, x: 800, y: 520, icon: DollarSign, color: "green", title: "Take Profit 2", desc: "Close Position", params: ["Sell 50%", "Market"] }
    ]
  },
  {
    text: "ETH Smart Contract interaction: Monitor Uniswap V3 ETH/USDC pool. If APY > 12%, mint concentrated liquidity position. Auto-rebalance if IL > 2%.",
    nodes: [
      { id: 1, x: 500, y: 40, icon: Activity, color: "blue", title: "Smart Contract", desc: "Uniswap V3 Pool", params: ["ETH/USDC", "0.3% Fee"] },
      { id: 2, x: 500, y: 160, icon: TrendingUp, color: "amber", title: "Yield Check", desc: "APY Monitor", params: ["APY > 12%", "TVL > $10M"] },
      { id: 3, x: 500, y: 280, icon: Zap, color: "green", title: "Mint Position", desc: "Concentrated Liq", params: ["Range: ±5%", "Auto-comp"] },
      { id: 4, x: 500, y: 400, icon: ShieldAlert, color: "red", title: "Impermanent Loss", desc: "IL Monitor", params: ["IL > 2%", "Rebalance"] },
      { id: 5, x: 500, y: 520, icon: MessageSquare, color: "purple", title: "Telegram", desc: "Yield Report", params: ["Daily", "Stats"] },
      { id: 6, x: 200, y: 280, icon: BarChart2, color: "amber", title: "Condition", desc: "Volatility < 50%", params: ["Source: VIX", "Stable"] },
      { id: 7, x: 200, y: 400, icon: Briefcase, color: "purple", title: "Flash Loan", desc: "Arbitrage Route", params: ["Aave", "Max Size"] },
      { id: 8, x: 200, y: 520, icon: ShieldAlert, color: "red", title: "Slippage", desc: "Revert TX", params: ["Max: 0.5%", "Hard"] },
      { id: 9, x: 800, y: 280, icon: Activity, color: "amber", title: "Condition", desc: "ETH/BTC Ratio", params: ["Trend: UP", "> 0.05"] },
      { id: 10, x: 800, y: 400, icon: Zap, color: "green", title: "Unstake", desc: "Cooldown Check", params: ["0 Days", "Instant"] },
      { id: 11, x: 800, y: 520, icon: ShoppingCart, color: "green", title: "Bridge", desc: "Target L2", params: ["Arbitrum", "Hop"] }
    ]
  },
  {
    text: "TSLA Earnings Play: If Pre-market gap > 3% and Sentiment is Bullish, execute Market On Open. Trail stop by $2. Scale out 50% at 1R.",
    nodes: [
      { id: 1, x: 500, y: 40, icon: BarChart2, color: "blue", title: "Earnings Event", desc: "Q3 Report", params: ["Ticker: TSLA", "Date: Today"] },
      { id: 2, x: 500, y: 160, icon: TrendingUp, color: "amber", title: "Gap Scan", desc: "Pre-market Gap", params: ["Gap > +3%", "High Vol"] },
      { id: 3, x: 500, y: 280, icon: ShoppingCart, color: "green", title: "Execution", desc: "Market On Open", params: ["Buy 100", "Route: IEX"] },
      { id: 4, x: 500, y: 400, icon: ShieldAlert, color: "red", title: "Risk Engine", desc: "Trailing Stop", params: ["Offset: $2.00", "Hard"] },
      { id: 5, x: 500, y: 520, icon: MessageSquare, color: "blue", title: "SMS Alert", desc: "P&L Update", params: ["To: Admin", "Filled"] },
      { id: 6, x: 200, y: 280, icon: Activity, color: "amber", title: "Sentiment", desc: "Twitter/X Feed", params: ["Score: Bullish", "NLP"] },
      { id: 7, x: 200, y: 400, icon: Zap, color: "purple", title: "Options", desc: "Buy Call", params: ["Strike: +5%", "OTM"] },
      { id: 8, x: 200, y: 520, icon: ShieldAlert, color: "red", title: "Theta Guard", desc: "Time Stop", params: ["Hold: 3 Days", "Sell"] },
      { id: 9, x: 800, y: 280, icon: Crosshair, color: "amber", title: "Sector Check", desc: "EV Industry", params: ["Up > 1%", "QQQ"] },
      { id: 10, x: 800, y: 400, icon: PieChart, color: "green", title: "Take Profit", desc: "Scale Out", params: ["Sell 50%", "At +1R"] },
      { id: 11, x: 800, y: 520, icon: DollarSign, color: "green", title: "Runner", desc: "Let Ride", params: ["Hold 50%", "Trailing"] }
    ]
  },
  {
    text: "AAPL Volatility Crush: Sell Iron Condor 45DTE before Apple event. If IV Rank > 80, open position. Close at 50% max profit or 21 DTE.",
    nodes: [
      { id: 1, x: 500, y: 40, icon: Crosshair, color: "blue", title: "Corp Event", desc: "Keynote Stream", params: ["Ticker: AAPL", "Sept 12"] },
      { id: 2, x: 500, y: 160, icon: Activity, color: "amber", title: "Volatility", desc: "IV Rank", params: ["IVR > 80", "Premium"] },
      { id: 3, x: 500, y: 280, icon: Briefcase, color: "green", title: "Execution", desc: "Sell Iron Condor", params: ["45 DTE", "16 Delta"] },
      { id: 4, x: 500, y: 400, icon: ShieldAlert, color: "red", title: "Max Loss", desc: "Auto-Stop", params: ["200% Credit", "BTC"] },
      { id: 5, x: 500, y: 520, icon: MessageSquare, color: "purple", title: "Email Report", desc: "Daily Summary", params: ["EOD", "Greeks"] },
      { id: 6, x: 200, y: 280, icon: TrendingDown, color: "amber", title: "Macro Risk", desc: "VIX Spike", params: ["VIX > 25", "Fear"] },
      { id: 7, x: 200, y: 400, icon: Zap, color: "purple", title: "Defense", desc: "Roll Position", params: ["Out in Time", "Credit"] },
      { id: 8, x: 200, y: 520, icon: ShieldAlert, color: "red", title: "Assignment", desc: "Early Ex", params: ["Monitor", "Pin Risk"] },
      { id: 9, x: 800, y: 280, icon: BarChart2, color: "amber", title: "Condition", desc: "Time Decay", params: ["Theta > 10", "Passing"] },
      { id: 10, x: 800, y: 400, icon: PieChart, color: "green", title: "Take Profit", desc: "Close Condor", params: ["50% Max", "Limit"] },
      { id: 11, x: 800, y: 520, icon: DollarSign, color: "green", title: "Time Stop", desc: "Close All", params: ["At 21 DTE", "Market"] }
    ]
  }
]

// Edge Definitions (from_id -> to_id)
const EDGES = [
  { from: 1, to: 2 },
  { from: 2, to: 3 },
  { from: 3, to: 4 },
  { from: 4, to: 5 },
  
  { from: 2, to: 6 },
  { from: 6, to: 7 },
  { from: 7, to: 8 },
  
  { from: 2, to: 9 },
  { from: 9, to: 10 },
  { from: 10, to: 11 },
]

export function AnimatedStrategyBuilder() {
  const [currentStrategyIndex, setCurrentStrategyIndex] = React.useState(0)
  const [phase, setPhase] = React.useState<"reset" | "typing" | "processing" | "result">("reset")
  const [typedText, setTypedText] = React.useState("")
  const [visibleNodes, setVisibleNodes] = React.useState<number[]>([])

  const containerRef = React.useRef(null)
  const isInView = useInView(containerRef, { once: false, margin: "-100px" })

  React.useEffect(() => {
    let isMounted = true
    if (!isInView) return

    const runSequence = async () => {
      let index = 0
      while (isMounted) {
        setCurrentStrategyIndex(index)
        const currentStrategy = STRATEGIES[index]
        
        setPhase("reset")
        setTypedText("")
        setVisibleNodes([])
        await new Promise(r => setTimeout(r, 500))

        setPhase("typing")
        for (let i = 0; i <= currentStrategy.text.length; i++) {
          if (!isMounted) return
          setTypedText(currentStrategy.text.slice(0, i))
          await new Promise(r => setTimeout(r, 10 + Math.random() * 15))
        }
        await new Promise(r => setTimeout(r, 200))

        setPhase("processing")
        await new Promise(r => setTimeout(r, 600))

        setPhase("result")
        // Stagger nodes appearing
        for (const node of currentStrategy.nodes) {
           if (!isMounted) return
           setVisibleNodes(prev => [...prev, node.id])
           await new Promise(r => setTimeout(r, 60))
        }
        
        await new Promise(r => setTimeout(r, 4000))
        
        // Loop to the next strategy
        index = (index + 1) % STRATEGIES.length
      }
    }

    runSequence()

    return () => {
      isMounted = false
    }
  }, [isInView])

  const currentStrategy = STRATEGIES[currentStrategyIndex]

  // Helper to map color string to Tailwind classes (All white nodes)
  const getColorClasses = (color: string) => {
    const base = { containerBg: "bg-white", descText: "text-black font-semibold", shadow: "shadow-[0_15px_30px_rgba(255,255,255,0.3)]" }
    switch (color) {
      case "blue": return { ...base, border: "border-blue-200", iconBg: "bg-blue-100", text: "text-blue-600" }
      case "amber": return { ...base, border: "border-amber-200", iconBg: "bg-amber-100", text: "text-amber-600" }
      case "green": return { ...base, border: "border-green-200", iconBg: "bg-green-100", text: "text-green-600" }
      case "red": return { ...base, border: "border-red-200", iconBg: "bg-red-100", text: "text-red-600" }
      case "purple": return { ...base, border: "border-purple-200", iconBg: "bg-purple-100", text: "text-purple-600" }
      default: return { ...base, border: "border-gray-200", iconBg: "bg-gray-100", text: "text-gray-600" }
    }
  }

  // Draw smooth cubic bezier paths simulating the user's requested dotted zig-zag style
  const renderLines = () => {
     return EDGES.map((edge, i) => {
        const fromNode = currentStrategy.nodes.find(n => n.id === edge.from)
        const toNode = currentStrategy.nodes.find(n => n.id === edge.to)
        if (!fromNode || !toNode) return null

        const isVisible = visibleNodes.includes(edge.from) && visibleNodes.includes(edge.to)
        
        // Start from the bottom center of the fromNode
        const startX = fromNode.x
        const startY = fromNode.y + 88
        
        // End at the top center of the toNode
        const endX = toNode.x
        const endY = toNode.y
        
        // The midpoint Y where the curve bends
        const yMid = startY + (endY - startY) / 2
        
        // Cubic bezier path: M x1 y1 C x1 yMid, x2 yMid, x2 y2
        const pathData = `M ${startX} ${startY} C ${startX} ${yMid}, ${endX} ${yMid}, ${endX} ${endY}`
        
        return (
           <g key={i}>
             <motion.path
               d={pathData}
               fill="transparent"
               stroke="#3b82f6" // blue-500
               strokeWidth="2"
               strokeLinecap="round"
               strokeDasharray="1 8" // Perfect dotted line
               initial={{ pathLength: 0, opacity: 0 }}
               animate={{ pathLength: isVisible ? 1 : 0, opacity: isVisible ? 1 : 0 }}
               transition={{ duration: 0.4, ease: "easeOut" }}
             />
             {/* Small dot at the start connection */}
             <motion.circle 
               cx={startX} cy={startY} r="3" fill="#1d4ed8" // blue-700
               initial={{ scale: 0, opacity: 0 }}
               animate={{ scale: isVisible ? 1 : 0, opacity: isVisible ? 1 : 0 }}
               transition={{ duration: 0.2, delay: 0.1 }}
             />
             {/* Small dot at the end connection */}
             <motion.circle 
               cx={endX} cy={endY} r="3" fill="#1d4ed8" // blue-700
               initial={{ scale: 0, opacity: 0 }}
               animate={{ scale: isVisible ? 1 : 0, opacity: isVisible ? 1 : 0 }}
               transition={{ duration: 0.2, delay: 0.3 }}
             />
           </g>
        )
     })
  }

  return (
    <div ref={containerRef} className="absolute inset-0 flex h-full w-full flex-col p-6 font-sans overflow-hidden bg-transparent">
      
      {/* Search / Prompt Input */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-30 flex w-full max-w-[800px] mx-auto items-center gap-3 rounded-xl border border-white bg-white p-3 sm:p-4 shadow-[0_10px_30px_rgba(255,255,255,0.2)] backdrop-blur-md"
      >
        <Bot className="h-6 w-6 text-black shrink-0 mt-1" />
        <div className="flex-1 text-xs sm:text-sm text-black font-semibold font-mono whitespace-normal break-words leading-relaxed min-h-[40px] pt-1">
          {typedText}
          {phase === "typing" && (
            <motion.span 
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="inline-block w-[2px] h-[14px] bg-black ml-1 align-middle"
            />
          )}
        </div>
        
        {/* Generate Button */}
        <motion.div
          animate={{
            scale: phase === "processing" ? 0.95 : 1,
            backgroundColor: phase === "processing" ? "rgba(0, 0, 0, 0.8)" : "rgba(0, 0, 0, 0.05)",
          }}
          className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg border border-black/10"
        >
          {phase === "processing" ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </motion.div>
          ) : (
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
          )}
        </motion.div>
      </motion.div>

      {/* Node Flowchart Area with horizontal scrolling for smaller screens to preserve diagram shape */}
      <div className="relative mt-4 flex flex-1 w-full max-w-[1000px] mx-auto min-h-[630px] overflow-x-auto overflow-y-hidden pb-8 custom-scrollbar">
        <div 
          className="relative min-w-[1000px] w-full h-full mx-auto"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "24px 24px"
          }}
        >
          {/* SVG Connecting Lines */}
          <svg className="absolute inset-0 h-full w-full z-0 pointer-events-none">
             {renderLines()}
          </svg>

          {/* Nodes */}
          <AnimatePresence>
             {currentStrategy.nodes.map((node) => {
               const isVisible = visibleNodes.includes(node.id)
               if (!isVisible) return null

               const colors = getColorClasses(node.color)
               const Icon = node.icon

               return (
                 <motion.div
                   key={node.id}
                   initial={{ opacity: 0, scale: 0.8, y: 10 }}
                   animate={{ opacity: 1, scale: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                   transition={{ type: "spring", stiffness: 300, damping: 20 }}
                   className={`absolute z-10 flex h-[88px] w-[200px] sm:w-[240px] -ml-[100px] sm:-ml-[120px] flex-col justify-center gap-1 rounded-xl border ${colors.border} ${colors.containerBg} p-3 shadow-lg ${colors.shadow}`}
                   style={{ left: `${node.x}px`, top: `${node.y}px` }}
                 >
                   <div className="flex items-center gap-3">
                     <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${colors.iconBg}`}>
                       <Icon className={`h-4 w-4 ${colors.text}`} />
                     </div>
                     <div className="flex flex-col overflow-hidden">
                       <span className={`text-[9px] font-bold uppercase tracking-wider ${colors.text}`}>
                         {node.title}
                       </span>
                       <span className={`text-sm truncate ${colors.descText}`}>
                         {node.desc}
                       </span>
                     </div>
                   </div>
                   
                   {/* Advanced Metadata / Params */}
                   <div className="mt-1 flex items-center gap-2 border-t border-gray-100 pt-1.5 w-full">
                     {node.params.map((param, i) => (
                       <div key={i} className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-medium text-gray-600">
                         {param}
                       </div>
                     ))}
                   </div>
                 </motion.div>
               )
             })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
