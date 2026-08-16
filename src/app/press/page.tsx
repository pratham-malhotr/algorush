"use client"

import * as React from "react"
import { Download, Newspaper, Mail, FileText, CheckCircle2, ArrowRight, ShieldCheck, Sparkles } from "lucide-react"
import { BackButton } from "@/components/ui/BackButton"

interface PressRelease {
  id: string
  date: string
  title: string
  outlet: string
  category: string
  summary: string
  link: string
}

const PRESS_RELEASES: PressRelease[] = [
  {
    id: "pr-1",
    date: "Aug 14, 2026",
    title: "AlgoText Unveils Institutional Arbitrage Suite & Level-2 Depth VWAP Scanner across 60+ Venues",
    outlet: "Bloomberg Terminals & PR Newswire",
    category: "Product Launch",
    summary: "AlgoText announces the public release of its Level-2 orderbook depth calculator, Spot-Futures cash & carry basis yield scanner, and CEX-DEX gas latency optimization suite.",
    link: "#"
  },
  {
    id: "pr-2",
    date: "Jul 28, 2026",
    title: "AlgoText Closes $18M Series A Funding Round to Expand AI Genetic Parameter Optimization Engine",
    outlet: "TechCrunch",
    category: "Corporate Funding",
    summary: "Led by top FinTech & Quantitative Venture Capital firms, the Series A capital will accelerate the development of real-time financial NLP sentiment engines and sub-millisecond execution.",
    link: "#"
  },
  {
    id: "pr-3",
    date: "May 10, 2026",
    title: "AlgoText Surpasses $8.5M Monthly Automated Trading Volume with 99.99% Engine Uptime",
    outlet: "CoinDesk Institutional",
    category: "Milestone",
    summary: "Over 1,240 active quantitative strategies are now running on AlgoText, executing orders with zero platform volume markups across major global exchanges.",
    link: "#"
  }
]

export default function PressPage() {
  const [downloaded, setDownloaded] = React.useState(false)

  function handleDownloadKit() {
    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 3000)
  }

  return (
    <div className="min-h-screen bg-white pt-2 pb-32">
      
      {/* Navigation Header */}
      <div className="mx-auto max-w-[1200px] px-6 py-6 flex items-center justify-between">
        <BackButton />
        <div className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-700 shadow-sm">
          <Newspaper className="h-3.5 w-3.5 text-blue-600" />
          Press & Media Kit 2026
        </div>
      </div>

      {/* Hero Section */}
      <section className="mx-auto max-w-[950px] px-6 py-16 text-center">
        <h1 className="mb-6 text-5xl font-extrabold text-gray-900 md:text-7xl tracking-tight">
          Press, Media & <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">Brand Resources</span>.
        </h1>
        
        <p className="text-xl text-gray-600 leading-relaxed mb-10 max-w-2xl mx-auto">
          Official announcements, executive press kits, high-res brand logos, and media contact channels for AlgoText.ai.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button 
            onClick={handleDownloadKit}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white px-7 py-4 text-base font-bold shadow-lg shadow-blue-500/25 transition-all hover:scale-105"
          >
            {downloaded ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-emerald-300 animate-bounce" /> Brand Kit Downloaded (.ZIP)
              </>
            ) : (
              <>
                <Download className="h-5 w-5" /> Download Full Press Kit (35 MB ZIP)
              </>
            )}
          </button>

          <a 
            href="mailto:press@algotext.ai" 
            className="inline-flex items-center gap-2 rounded-2xl border border-gray-300 bg-white text-gray-900 px-7 py-4 text-base font-bold hover:bg-gray-50 transition-colors"
          >
            <Mail className="h-5 w-5 text-gray-600" /> Contact Press Office
          </a>
        </div>
      </section>

      {/* Official Press Releases Section */}
      <section className="mx-auto max-w-[1000px] px-6 py-16 border-t border-gray-100">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2 block">Company Announcements</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Official Press Releases</h2>
          </div>
          <p className="text-sm text-gray-500 font-medium">Updated weekly with corporate milestone announcements.</p>
        </div>

        <div className="flex flex-col gap-6">
          {PRESS_RELEASES.map((pr) => (
            <div 
              key={pr.id} 
              className="group rounded-3xl border border-gray-200 bg-white p-8 transition-all hover:shadow-xl hover:border-blue-300"
            >
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-gray-500 mb-3">
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-200">{pr.category}</span>
                <span className="font-bold text-gray-900">{pr.outlet}</span>
                <span>•</span>
                <span>{pr.date}</span>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-3 leading-snug">
                {pr.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed text-base mb-4">{pr.summary}</p>
              
              <div className="flex items-center gap-2 text-blue-600 font-bold text-sm group-hover:translate-x-1 transition-transform">
                Read Full Release <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Brand Assets Section */}
      <section className="mx-auto max-w-[1000px] px-6 py-16 border-t border-gray-100">
        <h2 className="mb-10 text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight text-center">Approved Brand Assets</h2>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Logo Card 1 */}
          <div className="flex flex-col justify-between rounded-3xl border border-gray-200 bg-gray-950 p-8 h-[280px] shadow-xl relative overflow-hidden group">
            <div className="flex-1 flex items-center justify-center">
              <span className="text-5xl font-extrabold tracking-tight text-white flex items-center gap-2">
                AlgoText<span className="text-blue-500">.ai</span>
              </span>
            </div>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
              <div>
                <h4 className="font-bold text-white text-base">Primary Dark Logo</h4>
                <p className="text-xs text-gray-400">SVG, PNG (Transparent 4000x1000px)</p>
              </div>
              <button 
                onClick={handleDownloadKit}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white hover:bg-blue-600 transition-colors shadow-md"
              >
                <Download className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Logo Card 2 */}
          <div className="flex flex-col justify-between rounded-3xl border border-gray-200 bg-gray-50 p-8 h-[280px] shadow-sm relative overflow-hidden group">
            <div className="flex-1 flex items-center justify-center">
              <span className="text-5xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2">
                AlgoText<span className="text-blue-600">.ai</span>
              </span>
            </div>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-200">
              <div>
                <h4 className="font-bold text-gray-900 text-base">Primary Light Logo</h4>
                <p className="text-xs text-gray-500">SVG, PNG (Transparent 4000x1000px)</p>
              </div>
              <button 
                onClick={handleDownloadKit}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-200 text-gray-900 hover:bg-blue-600 hover:text-white transition-colors shadow-md"
              >
                <Download className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Media Inquiries Contact Banner */}
      <section className="mx-auto max-w-[1000px] px-6 py-12">
        <div className="rounded-3xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-extrabold text-white">Media Inquiries & Interview Requests</h3>
            <p className="text-sm text-gray-300 max-w-xl">
              Our executive team is available for expert commentary on quantitative trading, AI prompt engineering, and digital asset market structures.
            </p>
          </div>
          <a 
            href="mailto:press@algotext.ai" 
            className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-500/30 transition-all shrink-0 hover:scale-105"
          >
            Email press@algotext.ai →
          </a>
        </div>
      </section>

    </div>
  )
}
