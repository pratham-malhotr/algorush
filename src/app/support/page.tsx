"use client"

import * as React from "react"
import { Search, Book, MessageCircle, FileText, ChevronDown, CheckCircle2, Mail, ExternalLink } from "lucide-react"
import { BackButton } from "@/components/ui/BackButton"

const FAQS = [
  { q: "Do you have access to my crypto?", a: "No. AlgoText is 100% non-custodial. We execute trades via smart contracts authorized by your self-hosted wallet (like MetaMask). You can revoke access at any time." },
  { q: "How much does it cost?", a: "We charge a flat 0.05% fee on the volume of trades executed. There are no monthly subscriptions, setup fees, or hidden charges." },
  { q: "Can I use AlgoText if I don't know how to code?", a: "Yes! That is exactly what we built it for. You just type your strategy in plain English, and our AI compiler handles all the complex logic, node generation, and execution." },
  { q: "What exchanges are supported?", a: "Currently, we route liquidity through major decentralized exchanges (DEXs) like Uniswap, Curve, and 1inch on Ethereum, Arbitrum, and Polygon." },
  { q: "Is backtesting accurate?", a: "We use ultra-high resolution historical tick data to simulate slippage and fees, making our backtesting environment extremely close to live market conditions." },
]

export default function SupportPage() {
  const [openFaq, setOpenFaq] = React.useState<number | null>(0)

  return (
    <div className="min-h-screen bg-white pt-2 pb-32">
      
      {/* Navigation & Status Bar */}
      <div className="mx-auto max-w-[1200px] px-6 py-6 flex items-center justify-between">
        <BackButton />
        <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 shadow-sm">
          <CheckCircle2 className="h-4 w-4" />
          All Systems Operational
        </div>
      </div>

      {/* Help Center Hero */}
      <section className="mx-auto max-w-[800px] px-6 py-16 text-center">
        <h1 className="mb-6 text-5xl font-extrabold text-gray-900 md:text-7xl tracking-tight">
          How can we help?
        </h1>
        <div className="relative mx-auto mt-10 max-w-[600px] shadow-xl rounded-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search for articles, guides, or issues..." 
            className="w-full rounded-full border-2 border-transparent bg-white py-5 pl-16 pr-6 text-lg text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all shadow-sm ring-1 ring-gray-200"
          />
        </div>
      </section>

      {/* Categorized Support Links */}
      <section className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="group rounded-3xl border border-gray-200 bg-gray-50 p-8 hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 group-hover:bg-blue-600 transition-colors">
              <Book className="h-7 w-7 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">Getting Started</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">Learn the basics of prompt engineering and how to deploy your first strategy.</p>
            <div className="text-blue-600 font-semibold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Read Guide <ExternalLink className="h-4 w-4" />
            </div>
          </div>

          <div className="group rounded-3xl border border-gray-200 bg-gray-50 p-8 hover:shadow-xl hover:border-emerald-200 transition-all cursor-pointer">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 group-hover:bg-emerald-600 transition-colors">
              <FileText className="h-7 w-7 text-emerald-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">API Documentation</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">Detailed references for our REST API, Webhooks, and Python SDK.</p>
            <div className="text-emerald-600 font-semibold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              View API Docs <ExternalLink className="h-4 w-4" />
            </div>
          </div>

          <div className="group rounded-3xl border border-gray-200 bg-gray-50 p-8 hover:shadow-xl hover:border-amber-200 transition-all cursor-pointer">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 group-hover:bg-amber-600 transition-colors">
              <Mail className="h-7 w-7 text-amber-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">Email Support</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">Have a billing issue or need enterprise-grade assistance? Send us a ticket.</p>
            <div className="text-amber-600 font-semibold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Contact Us <ExternalLink className="h-4 w-4" />
            </div>
          </div>

          <div className="group rounded-3xl border border-gray-200 bg-gray-50 p-8 hover:shadow-xl hover:border-purple-200 transition-all cursor-pointer">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 group-hover:bg-purple-600 transition-colors">
              <MessageCircle className="h-7 w-7 text-purple-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">Community Discord</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">Join thousands of quants sharing strategies and helping each other out.</p>
            <div className="text-purple-600 font-semibold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Join Discord <ExternalLink className="h-4 w-4" />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="mx-auto max-w-[800px] px-6 py-16">
        <h2 className="mb-10 text-3xl font-bold text-gray-900 text-center">Frequently Asked Questions</h2>
        <div className="flex flex-col gap-4">
          {FAQS.map((faq, i) => (
            <div 
              key={i} 
              className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <button 
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between p-6 text-left focus:outline-none"
              >
                <span className="font-semibold text-gray-900 text-lg">{faq.q}</span>
                <div className={`flex items-center justify-center h-8 w-8 rounded-full bg-gray-50 transition-transform ${openFaq === i ? 'rotate-180 bg-blue-50 text-blue-600' : 'text-gray-400'}`}>
                  <ChevronDown className="h-5 w-5" />
                </div>
              </button>
              {openFaq === i && (
                <div className="px-6 pb-6 pt-2 text-gray-600 text-lg leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
      
    </div>
  )
}
