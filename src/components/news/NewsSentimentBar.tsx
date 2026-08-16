"use client"

import * as React from "react"
import { Newspaper, TrendingUp, TrendingDown, Sparkles, RefreshCw, Flame, ArrowUpRight, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

export function NewsSentimentBar() {
  const [data, setData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [activeNewsIdx, setActiveNewsIdx] = React.useState(0)

  const fetchSentiment = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/sentiment")
      const json = await res.json()
      if (json.status === "SUCCESS") {
        setData(json)
      }
    } catch (e) {
      console.error("Failed to fetch news sentiment", e)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchSentiment()
    const interval = setInterval(() => {
      setActiveNewsIdx((prev) => (data?.articles ? (prev + 1) % data.articles.length : 0))
    }, 6000)
    return () => clearInterval(interval)
  }, [fetchSentiment, data?.articles])

  if (loading || !data) {
    return (
      <div className="h-9 w-full bg-bg-surface border-b border-bg-border flex items-center justify-between px-6 text-xs text-text-tertiary">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-3.5 w-3.5 animate-spin text-accent-blue" />
          <span>Connecting to LLM Real-Time Financial News Stream...</span>
        </div>
      </div>
    )
  }

  const currentNews = data.articles[activeNewsIdx] || data.articles[0]

  return (
    <div className="h-9 w-full bg-bg-surface border-b border-bg-border flex items-center justify-between px-4 sm:px-8 text-xs shrink-0 select-none overflow-hidden relative">
      {/* Left Sentiment Score Badge */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-text-primary">
          <Sparkles className="h-3.5 w-3.5 text-accent-blue" />
          <span>AI Sentiment</span>
        </div>

        <div className="flex items-center gap-1.5 rounded-full bg-accent-green/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-accent-green border border-accent-green/20 shadow-xs">
          <TrendingUp className="h-3 w-3" />
          <span>+{data.marketSentimentIndex} INDEX ({data.sentimentLabel.replace('_', ' ')})</span>
        </div>
      </div>

      {/* Middle News Ticker Item */}
      <div className="flex-1 mx-6 overflow-hidden hidden md:block">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentNews.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 truncate"
          >
            <span className="rounded bg-accent-blue/10 px-1.5 py-0.2 text-[10px] font-bold text-accent-blue uppercase shrink-0 border border-accent-blue/20">
              {currentNews.category}
            </span>
            <span className="font-semibold text-text-primary truncate">{currentNews.headline}</span>
            <span className="text-text-tertiary font-mono shrink-0">({currentNews.source} • {currentNews.timestamp})</span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => {
            fetchSentiment()
            toast.success("News sentiment stream updated!")
          }}
          className="flex items-center gap-1 text-text-tertiary hover:text-text-primary transition-colors font-mono text-[11px]"
          title="Refresh Sentiment Stream"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Sync</span>
        </button>
      </div>
    </div>
  )
}
