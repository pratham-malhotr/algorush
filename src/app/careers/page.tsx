"use client"

import * as React from "react"
import Link from "next/link"
import { 
  ArrowUpRight, Code, Cpu, LineChart, MessageSquare, Globe, Zap, Heart, 
  Shield, CheckCircle2, DollarSign, Laptop, Sparkles, Building2, MapPin, 
  Clock, Users, ArrowRight, X, Send, Briefcase
} from "lucide-react"
import { BackButton } from "@/components/ui/BackButton"

interface Job {
  id: string
  title: string
  team: string
  location: string
  type: string
  salary: string
  icon: any
  summary: string
  requirements: string[]
  responsibilities: string[]
}

const JOBS: Job[] = [
  { 
    id: "rust-eng",
    title: "Lead Rust Execution Engine Engineer", 
    team: "Low-Latency Execution Labs", 
    location: "Remote (Global)", 
    type: "Full-time",
    salary: "$220,000 – $320,000 + Token Equity",
    icon: Code,
    summary: "Architect and scale our sub-millisecond Rust matching engine and WebSocket order router connecting to 60+ CEX/DEX venues.",
    requirements: [
      "5+ years writing production Rust with zero-copy deserialization and lock-free concurrency",
      "Deep understanding of TCP/UDP networking, WebSockets, and orderbook depth data structures",
      "Experience interfacing with exchange APIs (Binance, OKX, Bybit, Hyperliquid)"
    ],
    responsibilities: [
      "Maintain sub-20ms P99 execution latency under high market volatility spikes",
      "Optimize orderbook ladder aggregators and real-time VWAP slippage calculators",
      "Lead security code audits for API key storage and RSA signers"
    ]
  },
  { 
    id: "quant-researcher",
    title: "Quantitative Research Scientist (Alpha Signals)", 
    team: "Quantitative Alpha Team", 
    location: "New York / London / Remote", 
    type: "Full-time",
    salary: "$200,000 – $350,000 + Performance Bonus",
    icon: LineChart,
    summary: "Develop statistical arbitrage, mean-reversion, and funding rate basis yield algorithms for our institutional strategy library.",
    requirements: [
      "Ph.D. or Master's in Quantitative Finance, Mathematics, Computer Science, or Physics",
      "Strong proficiency in Python (Pandas, NumPy, PyTorch) and C++ for strategy backtesting",
      "Proven track record building high-Sharpe (>2.5) intraday trading strategies"
    ],
    responsibilities: [
      "Design multi-venue Spot-Futures cash & carry arbitrage algorithms",
      "Train machine learning models on tick-level data for orderflow toxicity prediction",
      "Collaborate with the AI Labs team on genetic parameter evolution engines"
    ]
  },
  { 
    id: "ai-engineer",
    title: "Senior AI / LLM Systems Engineer", 
    team: "AI Labs & NLP Engine", 
    location: "San Francisco / Remote", 
    type: "Full-time",
    salary: "$210,000 – $310,000 + Equity",
    icon: Cpu,
    summary: "Build our financial news NLP pipeline parsing breaking macroeconomic headlines, Fed dot plots, and SEC filings into real-time trading signals.",
    requirements: [
      "4+ years deploying production LLMs and fine-tuning domain-specific transformer models",
      "Experience with high-throughput vector databases (Pinecone, Qdrant) and streaming pipelines",
      "Solid background in prompt compiler design and natural language DSL translation"
    ],
    responsibilities: [
      "Scale the /api/sentiment engine to process 10,000+ financial headlines/sec",
      "Fine-tune sentiment classification models for crypto and equities market impact",
      "Develop natural language query parsers for the Visual Strategy Builder"
    ]
  },
  { 
    id: "frontend-arch",
    title: "Senior Frontend Architect (React / WebGL / Canvas)", 
    team: "User Interface & Experience", 
    location: "Remote (Global)", 
    type: "Full-time",
    salary: "$180,000 – $260,000 + Equity",
    icon: Laptop,
    summary: "Craft ultra-responsive visual strategy building canvases, real-time Recharts financial visualizers, and trading terminal UI.",
    requirements: [
      "6+ years in modern React, Next.js App Router, TypeScript, and TailwindCSS",
      "Deep experience with canvas rendering (ReactFlow, WebGL, D3.js, Lightweight Charts)",
      "Obsessive eye for micro-animations, glassmorphism UI, and 60fps performance"
    ],
    responsibilities: [
      "Lead frontend architecture for our Visual Strategy Canvas and Quant Scratchpad",
      "Optimize Recharts and canvas renderers for 1,000-path Monte Carlo simulations",
      "Ensure zero-hydration-error SSR and sub-100ms page transitions"
    ]
  },
  { 
    id: "sales-director",
    title: "Director of Institutional Partnerships & Liquidity", 
    team: "Institutional Sales", 
    location: "London / Dubai / Remote", 
    type: "Full-time",
    salary: "$250,000 – $400,000 OTE",
    icon: Building2,
    summary: "Drive institutional adoption among hedge funds, proprietary trading desks, and family offices for AlgoText's enterprise suite.",
    requirements: [
      "7+ years selling SaaS/infrastructure solutions to institutional trading firms or prime brokers",
      "Extensive network of contacts across crypto market makers, prop desks, and hedge fund PMs",
      "Deep understanding of prime brokerage, FIX protocol, and API API key security"
    ],
    responsibilities: [
      "Close $100k+ annual enterprise license contracts with quantitative funds",
      "Expand CEX/DEX broker rebate agreements and VIP exchange API quota partnerships",
      "Represent AlgoText at premier global quantitative finance conferences"
    ]
  }
]

const PERKS = [
  { icon: DollarSign, title: "Top-Tier Compensation", desc: "Competitive base salaries in the top 95th percentile, generous token equity grants, and performance bonuses." },
  { icon: Globe, title: "100% Remote Global Freedom", desc: "Work from anywhere on Earth. We sponsor coworking spaces, home office setups ($3,500 budget), and annual team retreats." },
  { icon: Heart, title: "Comprehensive Healthcare & Wellness", desc: "100% premium coverage for health, dental, and vision for you and your dependents, plus monthly wellness stipends." },
  { icon: Sparkles, title: "Cutting-Edge Tech Stack", desc: "Work with Rust, Next.js 16, LLMs, and high-frequency WebSocket infrastructure with unlimited AI tooling budget." },
  { icon: Shield, title: "Unlimited PTO & Parental Leave", desc: "Minimum 4 weeks required vacation per year, plus 16 weeks fully paid parental leave for primary caregivers." },
  { icon: Zap, title: "Fast-Track Career Growth", desc: "Direct access to founders, zero corporate red tape, and rapid advancement opportunities as we scale globally." }
]

export default function CareersPage() {
  const [selectedJob, setSelectedJob] = React.useState<Job | null>(null)
  const [applied, setApplied] = React.useState(false)
  const [applicantEmail, setApplicantEmail] = React.useState("")
  const [applicantName, setApplicantName] = React.useState("")

  function handleApplySubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!applicantEmail || !applicantName) return
    setApplied(true)
    setTimeout(() => {
      setApplied(false)
      setSelectedJob(null)
      setApplicantEmail("")
      setApplicantName("")
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-white pt-2 pb-32">
      
      {/* Navigation Bar Area */}
      <div className="mx-auto max-w-[1200px] px-6 py-6 flex items-center justify-between">
        <BackButton />
        <div className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-700 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          5 Open Roles Available
        </div>
      </div>

      {/* Hero Section */}
      <section className="mx-auto max-w-[950px] px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-widest mb-6">
          <Briefcase className="h-3.5 w-3.5 text-emerald-600" />
          Careers at AlgoText.ai
        </div>
        
        <h1 className="mb-6 text-5xl font-extrabold text-gray-900 md:text-7xl tracking-tight">
          Build the infrastructure <br className="hidden md:block" />
          powering <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">next-gen quantitative finance</span>.
        </h1>
        
        <p className="text-xl text-gray-600 leading-relaxed mb-10 max-w-3xl mx-auto">
          We are a team of engineers, quants, and product architects democratizing sub-second algorithmic trading and AI parameter optimization worldwide.
        </p>

        {/* Company Quick Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto p-6 rounded-3xl bg-gray-50 border border-gray-200/80 shadow-sm">
          <div>
            <div className="text-2xl font-extrabold text-gray-900 font-mono">$8.5M+</div>
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-0.5">Monthly Volume</div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-gray-900 font-mono">14.2ms</div>
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-0.5">Engine Latency</div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-gray-900 font-mono">60+</div>
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-0.5">Connected Venues</div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-gray-900 font-mono">100%</div>
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-0.5">Remote Global</div>
          </div>
        </div>
      </section>

      {/* Perks & Benefits Section */}
      <section className="mx-auto max-w-[1200px] px-6 py-20 border-t border-gray-100">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 md:text-4xl mb-4 tracking-tight">Why Work With Us?</h2>
          <p className="text-gray-600 max-w-xl mx-auto text-lg">We invest heavily in our team's growth, autonomy, and long-term financial success.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PERKS.map((perk, i) => (
            <div key={i} className="rounded-3xl border border-gray-200 bg-white p-8 hover:shadow-xl hover:border-blue-200 transition-all">
              <div className="h-13 w-13 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-6">
                <perk.icon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{perk.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{perk.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Open Roles Section */}
      <section id="open-roles" className="mx-auto max-w-[1000px] px-6 py-20 border-t border-gray-100">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2 block">Current Opportunities</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Open Engineering & Quant Positions</h2>
          </div>
          <p className="text-sm text-gray-500 font-medium">Click any position to review requirements and apply directly.</p>
        </div>

        <div className="flex flex-col gap-5">
          {JOBS.map((job) => (
            <div 
              key={job.id} 
              onClick={() => setSelectedJob(job)}
              className="group flex flex-col md:flex-row md:items-center justify-between rounded-3xl border border-gray-200 bg-white p-7 transition-all hover:shadow-xl hover:border-blue-400 cursor-pointer"
            >
              <div className="flex items-start gap-5 mb-4 md:mb-0">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 border border-gray-200 group-hover:bg-blue-600 group-hover:border-blue-600 transition-all shrink-0">
                  <job.icon className="h-6 w-6 text-gray-700 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1.5 flex items-center gap-2">
                    <span>{job.title}</span>
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3 max-w-xl">{job.summary}</p>
                  
                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-gray-500">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-200/60">{job.team}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-gray-400" /> {job.location}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-gray-400" /> {job.type}</span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-md">{job.salary}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-blue-600 font-bold text-sm group-hover:translate-x-1 transition-transform shrink-0">
                View Role <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center bg-gray-50 p-8 rounded-3xl border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Don't see your specific role?</h3>
          <p className="text-gray-600 text-sm max-w-lg mx-auto mb-4">
            We are always looking for exceptional talent in low-latency systems, quantitative risk, and AI compilers.
          </p>
          <a 
            href="mailto:careers@algotext.ai" 
            className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm hover:underline"
          >
            Send your resume to careers@algotext.ai →
          </a>
        </div>
      </section>

      {/* Job Details & Application Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-gray-100">
            
            {/* Modal Header */}
            <div className="p-6 md:p-8 bg-gray-900 text-white flex items-start justify-between">
              <div>
                <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg uppercase tracking-wider mb-2">
                  {selectedJob.team}
                </span>
                <h3 className="text-2xl md:text-3xl font-extrabold text-white">{selectedJob.title}</h3>
                <p className="text-sm text-gray-400 mt-1 font-medium">{selectedJob.location} • {selectedJob.salary}</p>
              </div>
              <button 
                onClick={() => setSelectedJob(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-gray-700">
              {applied ? (
                <div className="py-12 text-center flex flex-col items-center">
                  <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">Application Received!</h4>
                  <p className="text-gray-600 text-sm max-w-md mx-auto">
                    Thank you for applying for {selectedJob.title}. Our talent team will review your application and respond within 48 hours.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <h4 className="text-base font-bold text-gray-900 mb-2">Role Overview</h4>
                    <p className="text-sm leading-relaxed">{selectedJob.summary}</p>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-gray-900 mb-2">Key Responsibilities</h4>
                    <ul className="list-disc pl-5 text-sm space-y-1.5">
                      {selectedJob.responsibilities.map((res, i) => (
                        <li key={i}>{res}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-gray-900 mb-2">What We're Looking For</h4>
                    <ul className="list-disc pl-5 text-sm space-y-1.5">
                      {selectedJob.requirements.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Quick Application Form */}
                  <form onSubmit={handleApplySubmit} className="pt-6 border-t border-gray-200 space-y-4">
                    <h4 className="text-lg font-bold text-gray-900">Apply for this Position</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Full Name</label>
                        <input 
                          type="text" 
                          required
                          value={applicantName}
                          onChange={(e) => setApplicantName(e.target.value)}
                          placeholder="Dr. Sarah Jenkins" 
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Email Address</label>
                        <input 
                          type="email" 
                          required
                          value={applicantEmail}
                          onChange={(e) => setApplicantEmail(e.target.value)}
                          placeholder="sarah@quantfirm.com" 
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1">LinkedIn / GitHub / Portfolio URL</label>
                      <input 
                        type="url" 
                        placeholder="https://github.com/yourhandle" 
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                    >
                      <Send className="h-4 w-4" /> Submit Application
                    </button>
                  </form>
                </>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
