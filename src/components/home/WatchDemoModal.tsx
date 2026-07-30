"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { X, Play, Code2, Wallet, Activity } from "lucide-react"

const SCENES = [
  { id: "intro", text: "Welcome to Algo Text. The world's most advanced, yet beautifully simple, algorithmic trading platform. Today, we're going to show you how to build, test, and deploy a professional crypto trading bot. In just a few minutes." },
  { id: "text", text: "It all starts with a simple text prompt. You do not need to know Python. And you do not need to understand complex logic. Just type your strategy in plain English. For example. Tell the AI. Buy one Bitcoin, when the R.S.I. drops below thirty, and the MAC-D crosses up." },
  { id: "build", text: "Instantly. Our engine translates your English prompt into a fully functional, visual logic flow. You can see the conditions being wired together perfectly. It is entirely transparent. This allows you to easily verify exactly what your bot is going to do." },
  { id: "test", text: "Next. You can test your strategy against years of historical tick data, in a matter of seconds. Our ultra fast backtesting engine simulates thousands of trades instantly. You will immediately see crucial metrics. Like your total return. Win rate. And the exact number of trades executed." },
  { id: "wallet", text: "When you are confident in your strategy, and ready to go live, security is our top priority. We use a completely non custodial architecture. Simply connect your own Web 3 wallet, like MetaMask. We never hold your funds. Your keys. Your crypto." },
  { id: "monitor", text: "Once deployed. Your bot runs continuously on our secure cloud infrastructure. You get a live, twenty four seven monitoring terminal. Watch as your strategy actively scans the market, detects signals, and executes trades with sub-second latency. Completely automatically." },
  { id: "outro", text: "Algo Text. It is time to trade smarter. Without the manual effort. Close this video, and click 'Start Building' to begin your algorithmic trading journey today." }
]

export function WatchDemoModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [currentScene, setCurrentScene] = React.useState(0)
  const [isPlaying, setIsPlaying] = React.useState(false)

  // Force voice loading
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      window.speechSynthesis.getVoices()
    }
  }, [])

  // State machine for sequence based on Speech end
  React.useEffect(() => {
    if (!isOpen || !isPlaying) return

    let timeout: NodeJS.Timeout
    let activeUtterance: SpeechSynthesisUtterance | null = null

    const playScene = (index: number) => {
      if (index >= SCENES.length) {
        setIsPlaying(false)
        return
      }
      
      setCurrentScene(index)
      
      const synth = window.speechSynthesis
      synth.cancel() // Stop any current speech
      
      const utterance = new SpeechSynthesisUtterance(SCENES[index].text)
      activeUtterance = utterance
      
      // Look for highest quality human-sounding voices
      const voices = synth.getVoices()
      const preferredVoice = voices.find(v => 
        v.name === "Google US English" || // High quality neural on Chrome
        v.name === "Daniel" || // Excellent UK male on Mac
        v.name === "Alex" || // Standard US male on Mac
        v.name.includes("Premium") ||
        (v.name.includes("Male") && v.lang.includes("en-US"))
      ) || voices.find(v => v.lang.includes("en-US"))
      
      if (preferredVoice) utterance.voice = preferredVoice
      
      // Speed up the voice slightly as requested by the user
      utterance.rate = 1.12 
      utterance.pitch = 1.0 
      
      // When the voice finishes speaking, move to the next scene after a 1 second pause
      utterance.onend = () => {
        timeout = setTimeout(() => {
          playScene(index + 1)
        }, 1000)
      }
      
      // Error fallback just in case
      utterance.onerror = () => {
         timeout = setTimeout(() => {
           playScene(index + 1)
         }, 4000)
      }

      synth.speak(utterance)
    }

    playScene(0)

    return () => {
      clearTimeout(timeout)
      if (activeUtterance) {
          activeUtterance.onend = null
          activeUtterance.onerror = null
      }
      window.speechSynthesis.cancel()
    }
  }, [isOpen, isPlaying])

  // Reset when closed
  React.useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setIsPlaying(false)
        setCurrentScene(0)
      }, 0)
      window.speechSynthesis.cancel()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-white/95 backdrop-blur-xl"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 z-50 rounded-full bg-black/5 p-3 text-gray-900 transition-colors hover:bg-black/10"
        >
          <X className="h-6 w-6" />
        </button>

        {!isPlaying && currentScene === 0 ? (
          // Start Screen
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center text-center"
          >
            <div className="mb-8 rounded-full border border-accent-blue/30 bg-accent-blue/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-wider text-accent-blue">
              Turn up your volume 🔊
            </div>
            <h2 className="mb-10 text-4xl font-bold text-gray-900 md:text-6xl">
              AlgoText Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-blue to-accent-green">Demo</span>
            </h2>
            <button 
              onClick={() => setIsPlaying(true)}
              className="group flex items-center gap-4 rounded-full bg-gray-900 px-8 py-4 text-xl font-bold text-white transition-transform hover:scale-105 shadow-xl"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-900 transition-transform group-hover:scale-110">
                <Play className="h-5 w-5 ml-1" fill="currentColor" />
              </div>
              Play Video (with Voice)
            </button>
          </motion.div>
        ) : (
          // Playing sequence
          <div className="flex h-full w-full flex-col items-center justify-center px-4">
            
            {/* Visual Screen Area */}
            <div className="relative flex h-[60vh] w-full max-w-[1000px] items-center justify-center overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
               <SceneVisuals sceneId={SCENES[currentScene].id} onClose={onClose} />
            </div>

            {/* Subtitles Area */}
            <div className="mt-12 h-24 text-center px-4 max-w-[1000px]">
               <AnimatePresence mode="wait">
                 <motion.p
                   key={currentScene}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   className="text-2xl md:text-3xl font-medium text-gray-800 leading-relaxed"
                 >
                   &quot;{SCENES[currentScene].text}&quot;
                 </motion.p>
               </AnimatePresence>
            </div>

            {/* Progress Bar (Now dynamic per scene instead of exact time) */}
            <div className="absolute bottom-10 left-10 right-10 flex gap-2">
               {SCENES.map((_, i) => (
                 <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-gray-200">
                   {i === currentScene && (
                     <motion.div 
                       initial={{ width: "0%" }}
                       animate={{ width: "100%" }}
                       transition={{ duration: 15, ease: "linear" }} // approximate visual fill
                       className="h-full bg-accent-blue"
                     />
                   )}
                   {i < currentScene && <div className="h-full w-full bg-accent-blue/50" />}
                 </div>
               ))}
            </div>

          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}


// Sub-component that handles the visuals for each specific scene
function SceneVisuals({ sceneId, onClose }: { sceneId: string, onClose: () => void }) {
  switch (sceneId) {
    case "intro":
      return (
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center"
        >
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-accent-blue to-accent-green shadow-[0_0_50px_rgba(59,130,246,0.3)]">
            <Activity className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 tracking-tight">AlgoText<span className="text-accent-blue">.ai</span></h1>
        </motion.div>
      )
    
    case "text":
      return (
        <div className="flex w-full max-w-[600px] flex-col gap-4">
          <motion.div 
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
             className="w-full rounded-2xl bg-gray-50 p-6 border border-gray-200 shadow-sm"
          >
             <p className="font-mono text-xl text-gray-800 leading-relaxed">
                <span className="text-accent-blue font-bold">Prompt:</span> Buy 1 BTC when RSI drops below 30 and MACD crosses up...
             </p>
             <motion.div 
                animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }}
                className="mt-2 h-6 w-3 bg-accent-green"
             />
          </motion.div>
        </div>
      )
      
    case "build":
      return (
        <div className="flex items-center gap-4">
          <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
            <Activity className="h-8 w-8 text-blue-500" />
            <span className="text-sm font-bold text-gray-900">RSI {'<'} 30</span>
          </motion.div>
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} className="h-1 w-16 bg-gray-200 origin-left" />
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
            <Code2 className="h-8 w-8 text-purple-500" />
            <span className="text-sm font-bold text-gray-900">MACD Cross</span>
          </motion.div>
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1 }} className="h-1 w-16 bg-gray-200 origin-left" />
          <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.5 }} className="flex flex-col items-center gap-2 rounded-xl border border-accent-green/30 bg-accent-green/10 p-6 shadow-sm">
            <span className="text-sm font-bold text-accent-green uppercase tracking-widest">Execute Buy</span>
          </motion.div>
        </div>
      )

    case "test":
      return (
        <div className="relative flex w-full max-w-[800px] flex-col items-center">
          <div className="flex w-full items-end gap-2 h-64 border-b border-l border-gray-200 pb-1 pl-1">
             {[...Array(30)].map((_, i) => (
               <motion.div 
                 key={i} 
                 initial={{ height: "0%" }} 
                 animate={{ height: `${20 + ((i * 13.7) % 80)}%` }}
                 transition={{ duration: 0.5, delay: i * 0.1 }}
                 className={`w-full rounded-t-sm ${i > 15 ? 'bg-accent-green' : 'bg-red-400'}`}
               />
             ))}
          </div>
          <div className="mt-8 flex gap-12">
            <div className="flex flex-col items-center"><span className="text-sm text-gray-500 font-medium">Return</span><span className="text-3xl font-bold text-accent-green">+142.5%</span></div>
            <div className="flex flex-col items-center"><span className="text-sm text-gray-500 font-medium">Win Rate</span><span className="text-3xl font-bold text-gray-900">68%</span></div>
            <div className="flex flex-col items-center"><span className="text-sm text-gray-500 font-medium">Trades</span><span className="text-3xl font-bold text-gray-900">1,204</span></div>
          </div>
        </div>
      )

    case "wallet":
      return (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center justify-center gap-8 rounded-3xl border border-gray-200 bg-gray-50 p-12 shadow-sm"
        >
          <div className="flex items-center justify-center rounded-full bg-orange-500/10 p-8 shadow-[0_0_50px_rgba(249,115,22,0.15)]">
            <Wallet className="h-16 w-16 text-orange-500" />
          </div>
          <div className="flex flex-col items-center">
             <span className="text-sm font-bold uppercase tracking-widest text-orange-500">MetaMask</span>
             <span className="text-2xl font-bold text-gray-900">Connected Safely</span>
             <span className="mt-2 text-sm text-gray-500 font-mono">0x71C...973E</span>
          </div>
        </motion.div>
      )

    case "monitor":
      // Kept dark because terminal monitors always look best dark
      return (
        <div className="flex h-full w-full flex-col bg-[#0a0a0a] p-8 font-mono">
          <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-accent-green animate-pulse" />
              <span className="text-sm font-bold text-accent-green tracking-widest">LIVE TRADING</span>
            </div>
            <span className="text-xl font-bold text-white">$1,245.50 PnL</span>
          </div>
          <div className="flex flex-col justify-end flex-1 overflow-hidden">
             {[
               { t: "10:02:44", msg: "Bot activated: Alpha Strategy", c: "text-blue-400" },
               { t: "10:14:12", msg: "SIGNAL DETECTED: RSI < 30", c: "text-yellow-400" },
               { t: "10:14:13", msg: "EXEC BUY 2.5 ETH @ $3,420", c: "text-accent-green" },
               { t: "11:45:01", msg: "TRAILING STOP UPDATED: $3,450", c: "text-white/60" },
             ].map((log, i) => (
               <motion.div 
                 key={i} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 1.5 }}
                 className="flex gap-4 py-2 border-t border-white/5 text-sm"
               >
                 <span className="text-white/40">[{log.t}]</span>
                 <span className={`font-bold ${log.c}`}>{log.msg}</span>
               </motion.div>
             ))}
             <motion.div 
                animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }}
                className="mt-4 h-4 w-2 bg-accent-green"
             />
          </div>
        </div>
      )

    case "outro":
      return (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center"
        >
          <h2 className="mb-6 text-6xl font-bold text-gray-900 tracking-tight">Trade Smarter.</h2>
          <Link href="/builder" onClick={onClose}>
            <button className="rounded-full bg-accent-blue px-8 py-4 text-xl font-bold text-white shadow-lg hover:shadow-xl transition-shadow">
              Start Building Now
            </button>
          </Link>
        </motion.div>
      )

    default:
      return null
  }
}
