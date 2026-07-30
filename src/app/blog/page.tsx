"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ArrowRight, Calendar, Clock, User, ChevronRight } from "lucide-react"
import Link from "next/link"

const FEATURED_POST = {
  title: "Introducing AlgoText: The Future of Algorithmic Trading",
  excerpt: "Today, we're thrilled to announce AlgoText, a revolutionary platform that translates human intuition into executable quantitative trading strategies in milliseconds using our proprietary Deterministic AST compiler.",
  date: "July 24, 2026",
  readTime: "8 min read",
  author: "Pratham Malhotra",
  authorRole: "Founder & CEO",
  category: "Company",
  image: "https://images.unsplash.com/photo-1639762681485-074b7f4d2382?auto=format&fit=crop&q=80&w=2832&ixlib=rb-4.0.3" // Abstract tech pattern
}

const POSTS = [
  {
    id: 1,
    title: "Understanding Order Flow Toxicity",
    excerpt: "A deep dive into how institutional volume affects micro-structure and how you can build VPIN-based indicators using the AlgoText Engine.",
    date: "July 18, 2026",
    readTime: "12 min read",
    author: "Elena Rodriguez",
    category: "Quant Research"
  },
  {
    id: 2,
    title: "Rust at the Edge: Scaling to 10M Orders/Sec",
    excerpt: "How we completely rewrote our execution engine in Rust to achieve sub-millisecond latencies across globally distributed edge nodes.",
    date: "July 12, 2026",
    readTime: "15 min read",
    author: "David Chen",
    category: "Engineering"
  },
  {
    id: 3,
    title: "Building a Market Neutral Statistical Arbitrage Bot",
    excerpt: "Step-by-step guide to pairs trading on crypto markets. Learn how to cointegrate pairs and capture mean-reverting alpha.",
    date: "June 28, 2026",
    readTime: "10 min read",
    author: "Alex Morgan",
    category: "Tutorials"
  },
  {
    id: 4,
    title: "Security First: Non-Custodial Trading Architecture",
    excerpt: "Why we never hold your funds. A look into our API-key encryption, IP whitelisting, and strict withdrawal restrictions.",
    date: "June 15, 2026",
    readTime: "6 min read",
    author: "Marcus Wei",
    category: "Security"
  },
  {
    id: 5,
    title: "The Ultimate Guide to Paper Trading Options",
    excerpt: "Test your complex derivatives strategies in our zero-risk simulation environment with ultra-realistic slippage models.",
    date: "June 02, 2026",
    readTime: "9 min read",
    author: "Sarah Jenkins",
    category: "Product"
  },
  {
    id: 6,
    title: "May 2026 Platform Updates",
    excerpt: "New TWAP/VWAP execution models, enhanced WebSocket stability, and expanded support for 50+ new DeFi pools.",
    date: "May 30, 2026",
    readTime: "4 min read",
    author: "Product Team",
    category: "Changelog"
  }
]

const CATEGORIES = ["All", "Company", "Quant Research", "Engineering", "Tutorials", "Security", "Product", "Changelog"]

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = React.useState("All")

  const filteredPosts = React.useMemo(() => {
    if (activeCategory === "All") return POSTS
    return POSTS.filter(post => post.category === activeCategory)
  }, [activeCategory])

  return (
    <div className="min-h-screen bg-bg-base pt-10 pb-32">
      <div className="mx-auto max-w-[1200px] px-6">
        
        {/* Header */}
        <div className="mb-16 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 text-5xl font-bold text-text-primary md:text-6xl tracking-tight"
          >
            Insights & <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-blue to-purple-500">Updates</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-lg text-text-secondary max-w-[600px] mx-auto"
          >
            Discover the latest news, quantitative research, and engineering deep dives from the AlgoText team.
          </motion.p>
        </div>

        {/* Featured Post */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="group relative mb-20 overflow-hidden rounded-[2rem] border border-bg-border bg-bg-surface transition-all hover:border-accent-blue/50"
        >
          <div className="grid md:grid-cols-2">
            {/* Image Side */}
            <div className="relative h-[300px] w-full overflow-hidden md:h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-bg-surface/50 to-transparent z-10" />
              <img 
                src={FEATURED_POST.image} 
                alt="Featured Post" 
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            
            {/* Content Side */}
            <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16 relative">
              {/* Glow Effect */}
              <div className="absolute -top-32 -right-32 h-[300px] w-[300px] rounded-full bg-accent-blue/10 blur-[100px]" />
              
              <div className="mb-6 flex items-center gap-3">
                <span className="rounded-full bg-accent-blue/10 px-3 py-1 text-xs font-semibold text-accent-blue border border-accent-blue/20">
                  {FEATURED_POST.category}
                </span>
                <span className="flex items-center text-xs text-text-tertiary">
                  <Clock className="mr-1 h-3 w-3" />
                  {FEATURED_POST.readTime}
                </span>
              </div>
              <h2 className="mb-4 text-3xl font-bold text-text-primary leading-tight group-hover:text-accent-blue transition-colors">
                <Link href="#">{FEATURED_POST.title}</Link>
              </h2>
              <p className="mb-8 text-text-secondary leading-relaxed">
                {FEATURED_POST.excerpt}
              </p>
              
              <div className="mt-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-elevated border border-bg-border text-text-secondary">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-text-primary">{FEATURED_POST.author}</div>
                    <div className="text-xs text-text-tertiary">{FEATURED_POST.authorRole}</div>
                  </div>
                </div>
                <Link href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-elevated text-text-primary transition-colors hover:bg-accent-blue hover:text-white">
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Categories */}
        <div className="mb-12 flex flex-wrap items-center gap-2 border-b border-bg-border pb-6">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeCategory === category
                  ? "bg-text-primary text-bg-base"
                  : "bg-transparent text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Post Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="group flex flex-col justify-between rounded-2xl border border-bg-border bg-bg-surface p-6 transition-all hover:border-accent-blue/30 hover:bg-bg-elevated hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
            >
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full bg-bg-base px-3 py-1 text-[11px] font-semibold text-text-secondary border border-bg-border">
                    {post.category}
                  </span>
                  <span className="flex items-center text-[11px] text-text-tertiary">
                    <Calendar className="mr-1 h-3 w-3" />
                    {post.date}
                  </span>
                </div>
                <h3 className="mb-3 text-xl font-bold text-text-primary leading-snug group-hover:text-accent-blue transition-colors">
                  <Link href="#">{post.title}</Link>
                </h3>
                <p className="mb-6 text-sm text-text-secondary leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
              </div>
              
              <div className="mt-6 flex items-center justify-between border-t border-bg-border pt-4">
                <span className="text-xs font-medium text-text-secondary">By {post.author}</span>
                <span className="flex items-center text-xs font-bold text-accent-blue group-hover:underline">
                  Read More <ChevronRight className="ml-1 h-3 w-3" />
                </span>
              </div>
            </motion.div>
          ))}
          
          {filteredPosts.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <p className="text-text-secondary">No articles found in this category.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
