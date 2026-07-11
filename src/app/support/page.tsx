"use client"

import * as React from "react"
import { Search, Book, MessageCircle, FileText, ChevronDown } from "lucide-react"
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
    <div className="min-h-screen bg-bg-primary pt-2 pb-32">
      
      {/* Help Center Hero */}
      <section className="mx-auto max-w-[800px] px-6 py-20 text-center">
        <div className="flex justify-start"><BackButton /></div>
        <h1 className="mb-6 text-4xl font-bold text-text-primary md:text-6xl tracking-tight">
          How can we help?
        </h1>
        <div className="relative mx-auto mt-10 max-w-[600px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
          <input 
            type="text" 
            placeholder="Search for articles, guides, or issues..." 
            className="w-full rounded-full border border-bg-border bg-bg-surface py-4 pl-12 pr-6 text-text-primary placeholder-text-tertiary outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all"
          />
        </div>
      </section>

      {/* Quick Links */}
      <section className="mx-auto max-w-[1000px] px-6 py-12">
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="flex flex-col items-center text-center rounded-2xl border border-bg-border bg-bg-surface p-8 hover:border-accent-blue transition-colors cursor-pointer">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-blue/10">
              <Book className="h-6 w-6 text-accent-blue" />
            </div>
            <h3 className="mb-2 font-bold text-text-primary">Documentation</h3>
            <p className="text-sm text-text-secondary">Read our comprehensive guides and API references.</p>
          </div>
          <div className="flex flex-col items-center text-center rounded-2xl border border-bg-border bg-bg-surface p-8 hover:border-accent-green transition-colors cursor-pointer">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-green/10">
              <FileText className="h-6 w-6 text-accent-green" />
            </div>
            <h3 className="mb-2 font-bold text-text-primary">Submit a Ticket</h3>
            <p className="text-sm text-text-secondary">Can't find the answer? Reach out to our technical support team.</p>
          </div>
          <div className="flex flex-col items-center text-center rounded-2xl border border-bg-border bg-bg-surface p-8 hover:border-purple-500 transition-colors cursor-pointer">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
              <MessageCircle className="h-6 w-6 text-purple-500" />
            </div>
            <h3 className="mb-2 font-bold text-text-primary">Community Discord</h3>
            <p className="text-sm text-text-secondary">Join thousands of quants and traders in our active community.</p>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="mx-auto max-w-[800px] px-6 py-20">
        <h2 className="mb-8 text-3xl font-bold text-text-primary text-center">Frequently Asked Questions</h2>
        <div className="flex flex-col gap-4">
          {FAQS.map((faq, i) => (
            <div 
              key={i} 
              className="rounded-2xl border border-bg-border bg-bg-surface overflow-hidden"
            >
              <button 
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between p-6 text-left"
              >
                <span className="font-bold text-text-primary">{faq.q}</span>
                <ChevronDown className={`h-5 w-5 text-text-secondary transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && (
                <div className="px-6 pb-6 text-text-secondary leading-relaxed border-t border-bg-border pt-4">
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
