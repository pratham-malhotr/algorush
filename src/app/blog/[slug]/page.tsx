"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  ArrowLeft, Calendar, Clock, User, Share2, Copy, Check, Bookmark, 
  Sparkles, AlertCircle, Info, ChevronRight, ThumbsUp, MessageSquare
} from "lucide-react"
import { BLOG_POSTS, BlogPost } from "@/lib/data/blogPosts"
import { BackButton } from "@/components/ui/BackButton"
import { toast } from "sonner"

function CodeSnippetBlock({ title, language, code }: { title: string; language: string; code: string }) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success("Code copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-6 rounded-2xl border border-bg-border bg-[#0D1117] overflow-hidden shadow-xl">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-[#FF5F56]" />
            <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
            <div className="h-3 w-3 rounded-full bg-[#27C93F]" />
          </div>
          <span className="font-mono text-xs text-text-tertiary">{title}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs font-mono text-text-tertiary hover:text-white transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-accent-green" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre className="p-5 font-mono text-[13px] text-emerald-400 overflow-x-auto leading-relaxed scrollbar-thin scrollbar-thumb-white/10">
        <code>{code}</code>
      </pre>
    </div>
  )
}

export default function BlogPostReaderPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string

  const post = BLOG_POSTS.find((p) => p.slug === slug) || BLOG_POSTS[0]
  const relatedPosts = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3)

  const [copiedLink, setCopiedLink] = React.useState(false)
  const [likes, setLikes] = React.useState(42)
  const [liked, setLiked] = React.useState(false)

  const handleCopyShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopiedLink(true)
    toast.success("Article link copied!")
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleLike = () => {
    if (!liked) {
      setLikes((l) => l + 1)
      setLiked(true)
      toast.success("Thank you for your feedback!")
    }
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-primary selection:bg-accent-blue/30 pb-32">
      
      {/* Reader Sticky Top Bar */}
      <header className="sticky top-0 z-40 border-b border-bg-border bg-bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1000px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <BackButton />
            <div className="h-4 w-px bg-bg-border hidden sm:block" />
            <span className="text-sm font-semibold text-text-secondary truncate max-w-[300px] hidden sm:block">
              {post.title}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyShare}
              className="flex items-center gap-1.5 rounded-xl border border-bg-border bg-bg-base px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-all"
            >
              {copiedLink ? <Check className="h-3.5 w-3.5 text-accent-green" /> : <Share2 className="h-3.5 w-3.5" />}
              <span>Share</span>
            </button>
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                liked
                  ? "border-accent-blue bg-accent-blue/10 text-accent-blue"
                  : "border-bg-border bg-bg-base text-text-secondary hover:bg-bg-elevated"
              }`}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              <span>{likes}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <article className="mx-auto max-w-[800px] px-6 pt-12">
        
        {/* Article Meta Header */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-accent-blue/10 px-3.5 py-1 text-xs font-bold text-accent-blue border border-accent-blue/20">
              {post.category}
            </span>
            <span className="flex items-center text-xs text-text-tertiary font-mono">
              <Calendar className="mr-1 h-3.5 w-3.5" /> {post.date}
            </span>
            <span className="flex items-center text-xs text-text-tertiary font-mono">
              <Clock className="mr-1 h-3.5 w-3.5" /> {post.readTime}
            </span>
          </div>

          <h1 className="text-[34px] md:text-[46px] font-extrabold text-text-primary tracking-tight leading-tight">
            {post.title}
          </h1>

          <p className="text-[17px] text-text-secondary leading-relaxed font-medium">
            {post.excerpt}
          </p>

          {/* Author Card */}
          <div className="flex items-center gap-4 pt-4 border-t border-bg-border">
            <img
              src={post.authorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
              alt={post.author}
              className="h-12 w-12 rounded-full object-cover border border-bg-border shadow-sm"
            />
            <div>
              <div className="text-sm font-bold text-text-primary">{post.author}</div>
              <div className="text-xs text-text-tertiary">{post.authorRole} • AlgoText Research</div>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="mb-12 overflow-hidden rounded-3xl border border-bg-border shadow-2xl">
          <img
            src={post.image}
            alt={post.title}
            className="h-[360px] w-full object-cover"
          />
        </div>

        {/* Article Content Body */}
        <div className="space-y-8 text-[16px] text-text-secondary leading-relaxed font-normal">
          <p className="text-[18px] text-text-primary leading-relaxed font-medium">
            {post.content.introduction}
          </p>

          {post.content.sections.map((section, idx) => (
            <div key={idx} className="space-y-4 pt-4">
              <h2 className="text-[24px] font-bold text-text-primary tracking-tight">
                {section.heading}
              </h2>

              <p>{section.body}</p>

              {section.callout && (
                <div className="my-6 rounded-2xl border border-accent-blue/30 bg-accent-blue/10 p-5 space-y-2 text-[14px]">
                  <strong className="text-accent-blue font-bold flex items-center gap-2">
                    <Info className="h-4 w-4" /> {section.callout.title}
                  </strong>
                  <p className="text-text-secondary leading-relaxed">{section.callout.text}</p>
                </div>
              )}

              {section.codeSnippet && (
                <CodeSnippetBlock
                  title={section.codeSnippet.title}
                  language={section.codeSnippet.language}
                  code={section.codeSnippet.code}
                />
              )}
            </div>
          ))}

          {/* Conclusion */}
          <div className="pt-8 border-t border-bg-border space-y-4">
            <h3 className="text-[20px] font-bold text-text-primary">Conclusion & Next Steps</h3>
            <p className="italic text-text-secondary">{post.content.conclusion}</p>
          </div>
        </div>

        {/* Tags */}
        <div className="my-10 flex flex-wrap gap-2 pt-6 border-t border-bg-border">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-xl bg-bg-surface px-3 py-1 text-xs font-semibold text-text-secondary border border-bg-border"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Risk Notice Banner */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-xs text-text-secondary leading-relaxed space-y-1">
          <strong className="text-amber-500 font-bold block">Financial Risk Notice</strong>
          Trading digital assets involves significant market risk. Quantitative models and backtests do not guarantee or confirm future returns. Always manage position sizing responsibly.
        </div>

        {/* Related Articles Carousel */}
        <div className="mt-16 pt-12 border-t border-bg-border">
          <h3 className="text-[22px] font-bold text-text-primary mb-6">More Quantitative Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map((rel) => (
              <Link
                key={rel.id}
                href={`/blog/${rel.slug}`}
                className="group flex flex-col justify-between rounded-2xl border border-bg-border bg-bg-surface p-5 transition-all hover:border-accent-blue/40 hover:shadow-lg"
              >
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-accent-blue block mb-2">
                    {rel.category}
                  </span>
                  <h4 className="text-sm font-bold text-text-primary group-hover:text-accent-blue transition-colors line-clamp-2 mb-2">
                    {rel.title}
                  </h4>
                  <p className="text-xs text-text-tertiary line-clamp-2 leading-relaxed">
                    {rel.excerpt}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between text-[11px] text-text-tertiary font-mono pt-3 border-t border-bg-border">
                  <span>{rel.readTime}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-accent-blue group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>

      </article>
    </div>
  )
}
