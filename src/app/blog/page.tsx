"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ArrowRight, Calendar, Clock, User, ChevronRight, Search, Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BLOG_POSTS } from "@/lib/data/blogPosts"

const CATEGORIES = ["All", "Company", "Quant Research", "Engineering", "Tutorials", "Security", "Product"]

export default function BlogPage() {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = React.useState("All")
  const [searchQuery, setSearchQuery] = React.useState("")

  const featuredPost = BLOG_POSTS[0]

  const filteredPosts = React.useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      const matchesCategory = activeCategory === "All" || post.category === activeCategory
      const matchesSearch =
        searchQuery.trim() === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesCategory && matchesSearch
    })
  }, [activeCategory, searchQuery])

  const handleCardClick = (slug: string) => {
    router.push(`/blog/${slug}`)
  }

  return (
    <div className="min-h-screen bg-bg-base pt-10 pb-32 selection:bg-accent-blue/30">
      <div className="mx-auto max-w-[1200px] px-6">
        
        {/* Hero Header */}
        <div className="mb-14 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-xs font-bold uppercase tracking-widest mb-6"
          >
            <Sparkles className="h-3.5 w-3.5" /> AlgoText Quantitative Engineering Journal
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="mb-4 text-5xl font-extrabold text-text-primary md:text-6xl tracking-tight"
          >
            Insights, Microstructure & <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-blue to-purple-500">Quant Research</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-lg text-text-secondary max-w-[650px] mx-auto leading-relaxed font-medium"
          >
            Explore deep dives into low-latency Rust execution, statistical arbitrage, order flow toxicity, and non-custodial Web3 architecture.
          </motion.p>

          {/* Search Input Bar */}
          <div className="mt-8 max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search articles, indicators, or tags (e.g. VPIN, Rust, StatArb)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-4 rounded-2xl border border-bg-border bg-bg-surface text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent-blue transition-all shadow-xs"
            />
          </div>
        </div>

        {/* Featured Main Post Banner */}
        {featuredPost && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            onClick={() => handleCardClick(featuredPost.slug)}
            className="group relative mb-16 overflow-hidden rounded-[2.5rem] border border-bg-border bg-bg-surface transition-all hover:border-accent-blue/50 shadow-xl cursor-pointer"
          >
            <div className="grid md:grid-cols-2">
              <div className="relative h-[320px] w-full overflow-hidden md:h-full">
                <div className="absolute inset-0 bg-gradient-to-r from-bg-surface/60 to-transparent z-10" />
                <img 
                  src={featuredPost.image} 
                  alt={featuredPost.title} 
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              
              <div className="flex flex-col justify-between p-8 md:p-12 lg:p-14 relative">
                <div className="absolute -top-32 -right-32 h-[300px] w-[300px] rounded-full bg-accent-blue/10 blur-[100px]" />
                
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="rounded-full bg-accent-blue/10 px-3 py-1 text-xs font-bold text-accent-blue border border-accent-blue/20">
                      {featuredPost.category}
                    </span>
                    <span className="flex items-center text-xs font-mono text-text-tertiary">
                      <Clock className="mr-1 h-3 w-3" />
                      {featuredPost.readTime}
                    </span>
                  </div>

                  <h2 className="mb-4 text-2xl md:text-3xl font-extrabold text-text-primary leading-tight group-hover:text-accent-blue transition-colors">
                    {featuredPost.title}
                  </h2>
                  <p className="mb-6 text-sm text-text-secondary leading-relaxed font-medium">
                    {featuredPost.excerpt}
                  </p>
                </div>
                
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-bg-border">
                  <div className="flex items-center gap-3">
                    <img 
                      src={featuredPost.authorAvatar} 
                      alt={featuredPost.author} 
                      className="h-9 w-9 rounded-full object-cover border border-bg-border" 
                    />
                    <div>
                      <div className="text-xs font-bold text-text-primary">{featuredPost.author}</div>
                      <div className="text-[11px] text-text-tertiary">{featuredPost.authorRole}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 rounded-xl bg-accent-blue px-4 py-2 text-xs font-bold text-white shadow-md group-hover:bg-blue-600 transition-all">
                    Read Full Article <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Categories Filter Tabs */}
        <div className="mb-10 flex flex-wrap items-center gap-2 border-b border-bg-border pb-5">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeCategory === category
                  ? "bg-accent-blue text-white shadow-md shadow-blue-500/20"
                  : "bg-bg-surface text-text-secondary hover:bg-bg-elevated hover:text-text-primary border border-bg-border"
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
              transition={{ delay: 0.05 * index }}
              onClick={() => handleCardClick(post.slug)}
              className="group flex flex-col justify-between rounded-2xl border border-bg-border bg-bg-surface p-6 transition-all hover:border-accent-blue/40 hover:shadow-xl cursor-pointer"
            >
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full bg-bg-base px-2.5 py-0.5 text-[11px] font-bold text-accent-blue border border-accent-blue/20">
                    {post.category}
                  </span>
                  <span className="flex items-center text-[11px] font-mono text-text-tertiary">
                    <Calendar className="mr-1 h-3 w-3" />
                    {post.date}
                  </span>
                </div>

                <h3 className="mb-3 text-lg font-bold text-text-primary leading-snug group-hover:text-accent-blue transition-colors">
                  {post.title}
                </h3>
                
                <p className="mb-6 text-xs text-text-secondary leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
              </div>
              
              <div className="mt-auto flex items-center justify-between border-t border-bg-border pt-4">
                <div className="flex items-center gap-2">
                  <img 
                    src={post.authorAvatar} 
                    alt={post.author} 
                    className="h-6 w-6 rounded-full object-cover" 
                  />
                  <span className="text-[11px] font-semibold text-text-secondary">{post.author}</span>
                </div>

                <div className="flex items-center text-xs font-bold text-accent-blue group-hover:underline">
                  Read Article <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </div>
              </div>
            </motion.div>
          ))}
          
          {filteredPosts.length === 0 && (
            <div className="col-span-full py-20 text-center rounded-2xl border border-bg-border bg-bg-surface">
              <p className="text-text-secondary font-medium">No articles matching your search query.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
