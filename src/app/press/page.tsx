import * as React from "react"
import { Download, Newspaper, Mail } from "lucide-react"
import { BackButton } from "@/components/ui/BackButton"

export default function PressPage() {
  return (
    <div className="min-h-screen bg-bg-primary pt-24 pb-32">
      <section className="mx-auto max-w-[1000px] px-6 py-20">
        <BackButton />
        <h1 className="mb-6 text-5xl font-bold text-text-primary md:text-7xl tracking-tight">
          Press & <span className="text-accent-green">Media</span>
        </h1>
        <p className="text-xl text-text-secondary leading-relaxed max-w-[600px] mb-12">
          Everything you need to write about AlgoText. For all press and media inquiries, please reach out to our communications team.
        </p>
        <a href="mailto:press@algotext.ai" className="inline-flex items-center gap-2 rounded-full bg-white text-black px-6 py-3 font-bold hover:bg-gray-200 transition-colors">
          <Mail className="h-5 w-5" /> Contact Press Team
        </a>
      </section>

      <section className="mx-auto max-w-[1000px] px-6 py-12">
        <h2 className="mb-8 text-3xl font-bold text-text-primary">Brand Assets</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          
          <div className="flex flex-col justify-between rounded-2xl border border-bg-border bg-bg-surface p-8 h-[250px]">
            <div className="flex-1 flex items-center justify-center">
              <h1 className="text-4xl font-bold tracking-tight text-white">AlgoText</h1>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <div>
                <h4 className="font-bold text-text-primary">Primary Logo (Light)</h4>
                <p className="text-sm text-text-secondary">SVG / PNG</p>
              </div>
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-elevated hover:bg-accent-blue hover:text-white transition-colors">
                <Download className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-bg-border bg-white p-8 h-[250px]">
            <div className="flex-1 flex items-center justify-center">
              <h1 className="text-4xl font-bold tracking-tight text-black">AlgoText</h1>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <div>
                <h4 className="font-bold text-black">Primary Logo (Dark)</h4>
                <p className="text-sm text-gray-600">SVG / PNG</p>
              </div>
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-black hover:bg-accent-blue hover:text-white transition-colors">
                <Download className="h-5 w-5" />
              </button>
            </div>
          </div>

        </div>
      </section>

      <section className="mx-auto max-w-[1000px] px-6 py-12">
        <h2 className="mb-8 text-3xl font-bold text-text-primary">Recent Coverage</h2>
        <div className="flex flex-col gap-4">
          {[
            { date: "Oct 12, 2026", title: "AlgoText raises $15M Series A to bring Quant tools to Retail", outlet: "TechCrunch" },
            { date: "Sep 04, 2026", title: "How generative AI is completely changing crypto trading", outlet: "Bloomberg" },
            { date: "Aug 22, 2026", title: "Review: The fastest no-code strategy builder we've ever used", outlet: "CoinDesk" },
          ].map((news, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-bg-border bg-bg-surface p-6 cursor-pointer hover:border-text-secondary transition-colors">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Newspaper className="h-4 w-4 text-accent-blue" />
                  <span className="text-sm font-bold text-text-secondary">{news.outlet}</span>
                  <span className="text-sm text-text-tertiary px-2">•</span>
                  <span className="text-sm text-text-tertiary">{news.date}</span>
                </div>
                <h3 className="text-lg font-bold text-text-primary">{news.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
