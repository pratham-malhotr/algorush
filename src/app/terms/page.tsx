"use client"

import * as React from "react"
import { BackButton } from "@/components/ui/BackButton"
import { 
  FileDown, CalendarDays, ShieldCheck, Lock, AlertTriangle, Scale, CheckCircle2, 
  Search, Copy, Check, ExternalLink, HelpCircle, Layers, Cpu, Server, Globe,
  BookOpen, ShieldAlert, ArrowRight, Printer, Sparkles, ChevronRight
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

export interface TermsSection {
  id: string;
  number: string;
  title: string;
  icon: React.ElementType;
}

const TERMS_SECTIONS: TermsSection[] = [
  { id: "definitions", number: "1.0", title: "Definitions & Interpretations", icon: BookOpen },
  { id: "acceptance", number: "2.0", title: "Acceptance & Enterprise Scope", icon: CheckCircle2 },
  { id: "non-custodial", number: "3.0", title: "Non-Custodial Architecture & Key Security", icon: Lock },
  { id: "risk-disclosure", number: "4.0", title: "Algorithmic Risk & CFTC/SEC Disclaimer", icon: AlertTriangle },
  { id: "execution-sla", number: "5.0", title: "Execution Engine SLA & Uptime (99.99%)", icon: Server },
  { id: "fees-billing", number: "6.0", title: "Fee Schedule, Billing & Subscriptions", icon: Scale },
  { id: "intellectual-property", number: "7.0", title: "Alpha Strategy Ownership & IP Rights", icon: Sparkles },
  { id: "prohibited-use", number: "8.0", title: "Prohibited Uses & Market Integrity", icon: ShieldAlert },
  { id: "limitation-liability", number: "9.0", title: "Limitation of Liability & Indemnification", icon: ShieldCheck },
  { id: "arbitration", number: "10.0", title: "Governing Law & Binding Arbitration", icon: Scale },
  { id: "severability", number: "11.0", title: "Modifications, Amendments & Severability", icon: Layers },
  { id: "contact-legal", number: "12.0", title: "Corporate Legal Notices & Compliance", icon: Globe },
]

export default function TermsPage() {
  const [activeSection, setActiveSection] = React.useState("definitions")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [copiedSection, setCopiedSection] = React.useState<string | null>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: "-100px 0px -75% 0px" }
    )

    document.querySelectorAll("section[id]").forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  const handlePrint = () => {
    window.print()
  }

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/terms#${id}`
    navigator.clipboard.writeText(url)
    setCopiedSection(id)
    toast.success("Section link copied to clipboard")
    setTimeout(() => setCopiedSection(null), 2000)
  }

  const filteredSections = TERMS_SECTIONS.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.number.includes(searchQuery)
  )

  return (
    <div className="min-h-screen bg-bg-base text-text-primary selection:bg-accent-blue/30">
      {/* Enterprise Top Sticky Header */}
      <header className="sticky top-0 z-50 border-b border-bg-border bg-bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-5">
            <BackButton />
            <div className="h-5 w-px bg-bg-border" />
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-blue/15 text-accent-blue font-bold text-xs">
                SLA
              </div>
              <div>
                <span className="text-[14px] font-bold text-text-primary block leading-tight">Enterprise Legal Center</span>
                <span className="text-[11px] font-mono text-text-tertiary">Version 3.4.0 • SOC-2 Type II Certified</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl border border-bg-border bg-bg-base px-3.5 py-2 text-[12.5px] font-semibold text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-all shadow-xs"
            >
              <Printer className="h-4 w-4" />
              <span>Print Agreement</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-accent-blue px-4 py-2 text-[12.5px] font-bold text-white hover:bg-blue-600 shadow-md shadow-blue-500/20 transition-all"
            >
              <FileDown className="h-4 w-4" />
              <span>Download PDF Terms</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="mx-auto flex max-w-[1280px] flex-col md:flex-row px-6 py-12 gap-12 relative">
        
        {/* Left Sticky Table of Contents Sidebar */}
        <aside className="hidden md:block w-[300px] shrink-0">
          <div className="sticky top-28 space-y-6 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-bg-border">
            
            {/* Search Input Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
              <input
                type="text"
                placeholder="Search Terms & Conditions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-xl border border-bg-border bg-bg-surface pl-8 pr-3 text-[12px] text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent-blue transition-all"
              />
            </div>

            {/* Quick Badges */}
            <div className="rounded-xl border border-accent-blue/20 bg-accent-blue/5 p-3 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-accent-blue flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> Security Architecture
              </span>
              <p className="text-[11.5px] text-text-secondary leading-snug">
                Client-side API key encryption. Non-custodial 0-withdrawal access design.
              </p>
            </div>

            {/* Navigation Index List */}
            <div>
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-text-tertiary block mb-2 px-1">
                Document Structure ({filteredSections.length})
              </span>
              <nav className="space-y-1">
                {filteredSections.map((sec) => {
                  const isActive = activeSection === sec.id
                  const Icon = sec.icon
                  return (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      className={`flex items-center justify-between rounded-xl px-3 py-2 text-[12px] font-semibold transition-all ${
                        isActive
                          ? "bg-accent-blue text-white shadow-md shadow-blue-500/20 font-bold"
                          : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono text-[11px] opacity-80">{sec.number}</span>
                        <span className="truncate">{sec.title}</span>
                      </div>
                      <ChevronRight className={`h-3 w-3 shrink-0 transition-transform ${isActive ? "rotate-90 text-white" : "opacity-40"}`} />
                    </a>
                  )
                })}
              </nav>
            </div>
          </div>
        </aside>

        {/* Right Main Legal Text Body */}
        <main className="flex-1 max-w-[880px] pb-32">
          
          {/* Document Header Banner */}
          <div className="mb-10 pb-8 border-b border-bg-border">
            <div className="flex items-center gap-2 mb-3">
              <span className="rounded-full bg-accent-green/10 text-accent-green text-[11px] font-bold px-3 py-0.5 border border-accent-green/20">
                ACTIVE BINDING CONTRACT
              </span>
              <span className="rounded-full bg-bg-elevated text-text-tertiary text-[11px] font-mono px-3 py-0.5 border border-bg-border">
                Effective: October 15, 2026
              </span>
            </div>
            <h1 className="text-[36px] md:text-[44px] font-extrabold text-text-primary tracking-tight leading-tight mb-4">
              Enterprise Terms of Service & Software License Agreement
            </h1>
            <p className="text-[15px] text-text-secondary leading-relaxed max-w-[780px]">
              This Master Services Agreement ("Terms") constitutes a legally binding contract between AlgoText Inc. ("AlgoText", "Company", "We") and the entity or individual ("Client", "User", "You") accessing our proprietary quantitative trading infrastructure, API interfaces, and strategy execution engine.
            </p>
          </div>

          {/* Legal Clauses Sections */}
          <div className="space-y-12 leading-relaxed text-[14.5px] text-text-secondary">
            
            {/* 1.0 Definitions */}
            <section id="definitions" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between border-b border-bg-border pb-2">
                <h2 className="text-[20px] font-bold text-text-primary flex items-center gap-2">
                  <span className="font-mono text-accent-blue">1.0</span> Definitions & Interpretations
                </h2>
                <button onClick={() => handleCopyLink("definitions")} className="text-text-tertiary hover:text-text-primary p-1">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <p>For the purposes of these Master Terms of Service, the following capitalized terms shall have the specified meanings:</p>
              <ul className="space-y-3 pl-4 border-l-2 border-accent-blue/30 my-4">
                <li>
                  <strong className="text-text-primary">"Abstract Syntax Tree (AST)":</strong> The compiled, deterministic JSON representations generated by AlgoText’s natural language parser to define strategy parameters.
                </li>
                <li>
                  <strong className="text-text-primary">"Quant Worker Nodes":</strong> The co-located, sub-millisecond execution workers running on AlgoText infrastructure on Localhost:3000 and AWS/GCP data centers.
                </li>
                <li>
                  <strong className="text-text-primary">"Exchange API Credentials":</strong> The API Key, Secret, and Passphrase tokens issued by third-party exchanges (e.g., Binance, LBank, OKX, Coinbase, Kraken, Hyperliquid) provided by Client for order routing.
                </li>
                <li>
                  <strong className="text-text-primary">"Non-Custodial Scope":</strong> The operational architecture under which AlgoText possesses zero withdrawal rights, zero custody of private keys, and zero access to Client fiat or cryptocurrency funds.
                </li>
              </ul>
            </section>

            {/* 2.0 Acceptance */}
            <section id="acceptance" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between border-b border-bg-border pb-2">
                <h2 className="text-[20px] font-bold text-text-primary flex items-center gap-2">
                  <span className="font-mono text-accent-blue">2.0</span> Acceptance & Enterprise Scope
                </h2>
                <button onClick={() => handleCopyLink("acceptance")} className="text-text-tertiary hover:text-text-primary p-1">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <p>
                By creating an account, executing API keys, clicking "I Agree", or connecting a Web3 wallet to the AlgoText platform, You represent and warrant that You have full legal capacity and corporate authority to enter into this Agreement.
              </p>
              <p>
                If You are entering into this Agreement on behalf of a financial institution, hedge fund, proprietary trading firm, or corporate entity, You affirm that You possess the authority to bind such entity to these Terms.
              </p>
            </section>

            {/* 3.0 Non-Custodial Architecture */}
            <section id="non-custodial" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between border-b border-bg-border pb-2">
                <h2 className="text-[20px] font-bold text-text-primary flex items-center gap-2">
                  <span className="font-mono text-accent-blue">3.0</span> Non-Custodial Architecture & Key Security
                </h2>
                <button onClick={() => handleCopyLink("non-custodial")} className="text-text-tertiary hover:text-text-primary p-1">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <p>
                AlgoText is exclusively a non-custodial software technology provider. At no time does AlgoText take possession, control, custody, or title of any Client funds, digital assets, or collateral.
              </p>
              
              <div className="rounded-xl border border-accent-green/30 bg-accent-green/10 p-4 space-y-2 text-[13px]">
                <strong className="text-accent-green font-bold flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" /> Client-Side Encryption & RSA-4096 Security Architecture
                </strong>
                <p className="text-text-secondary leading-normal">
                  Exchange API keys and Web3 RPC tokens are encrypted locally on the Client’s device. AlgoText API endpoints enforce strict withdrawal locks and refuse connections from API credentials with enabled withdrawal flags.
                </p>
              </div>
            </section>

            {/* 4.0 Algorithmic Risk Disclaimer */}
            <section id="risk-disclosure" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between border-b border-bg-border pb-2">
                <h2 className="text-[20px] font-bold text-text-primary flex items-center gap-2">
                  <span className="font-mono text-accent-blue">4.0</span> Algorithmic Risk & CFTC/SEC Disclaimer
                </h2>
                <button onClick={() => handleCopyLink("risk-disclosure")} className="text-text-tertiary hover:text-text-primary p-1">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <p>
                <strong>High-Risk Financial Disclosure:</strong> Trading digital assets, cryptocurrencies, perpetual futures, options, and foreign exchange carries extreme financial risk. Market volatility, leverage multipliers, liquidity gaps, slippage, and exchange engine outages can result in the partial or total loss of invested capital.
              </p>

              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-3 text-[13px]">
                <strong className="text-amber-500 font-bold flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" /> CFTC Rule 4.41 & NO GUARANTEED RETURNS DISCLAIMER
                </strong>
                <p className="text-text-secondary leading-normal font-semibold">
                  NO GUARANTEED RETURNS OR PROFITS: ALGOTEXT DOES NOT GUARANTEE OR CONFIRM ANY FINANCIAL RETURNS, PROFITS, OR YIELDS. ALL TRADING RETURNS ARE STRICTLY SUBJECT TO MARKET RISKS, VOLATILITY, SLIPPAGE, AND LIQUIDITY.
                </p>
                <p className="text-text-secondary leading-normal">
                  HYPOTHETICAL OR SIMULATED PERFORMANCE RESULTS HAVE CERTAIN INHERENT LIMITATIONS. UNLIKE AN ACTUAL PERFORMANCE RECORD, SIMULATED RESULTS DO NOT REPRESENT ACTUAL TRADING. AlgoText does not provide investment, financial, tax, or legal advice. Strategy backtests executed serve for educational and quantitative research purposes only.
                </p>
              </div>
            </section>

            {/* 5.0 SLA Uptime */}
            <section id="execution-sla" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between border-b border-bg-border pb-2">
                <h2 className="text-[20px] font-bold text-text-primary flex items-center gap-2">
                  <span className="font-mono text-accent-blue">5.0</span> Execution Engine SLA & Uptime (99.99%)
                </h2>
                <button onClick={() => handleCopyLink("execution-sla")} className="text-text-tertiary hover:text-text-primary p-1">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <p>
                AlgoText targets a <strong>99.99% Service Level Agreement (SLA)</strong> uptime for our core API endpoints and automated worker routing services during calendar billing months.
              </p>
              <p>
                In the event of scheduled maintenance or emergency exchange network degradation, AlgoText’s automated **Global Kill Switch** executes protective position stops to prevent unmonitored market exposure.
              </p>
            </section>

            {/* 6.0 Fees & Billing */}
            <section id="fees-billing" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between border-b border-bg-border pb-2">
                <h2 className="text-[20px] font-bold text-text-primary flex items-center gap-2">
                  <span className="font-mono text-accent-blue">6.0</span> Fee Schedule, Billing & Subscriptions
                </h2>
                <button onClick={() => handleCopyLink("fees-billing")} className="text-text-tertiary hover:text-text-primary p-1">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <p>
                Client agrees to pay all applicable subscription fees for PRO ($45/mo) or ELITE ($119/mo) plan tiers as selected. Payments are processed in USD via credit/debit card or non-custodial cryptocurrency transactions (BTC, ETH, SOL, USDT, USDC).
              </p>
              <p>
                All paid subscription fees are non-refundable once the billing period has commenced, except as required by mandatory consumer law.
              </p>
            </section>

            {/* 7.0 IP Rights */}
            <section id="intellectual-property" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between border-b border-bg-border pb-2">
                <h2 className="text-[20px] font-bold text-text-primary flex items-center gap-2">
                  <span className="font-mono text-accent-blue">7.0</span> Alpha Strategy Ownership & IP Rights
                </h2>
                <button onClick={() => handleCopyLink("intellectual-property")} className="text-text-tertiary hover:text-text-primary p-1">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <p>
                <strong>100% Client Alpha Ownership Policy:</strong> You retain full, unencumbered intellectual property ownership over all quantitative trading strategies, PineScript logic, Python indicators, and parameters created or compiled by You on the AlgoText platform.
              </p>
              <p>
                AlgoText will never reverse-engineer, front-run, copy, or mine Client’s private strategy logic or active trading signals.
              </p>
            </section>

            {/* 8.0 Prohibited Use */}
            <section id="prohibited-use" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between border-b border-bg-border pb-2">
                <h2 className="text-[20px] font-bold text-text-primary flex items-center gap-2">
                  <span className="font-mono text-accent-blue">8.0</span> Prohibited Uses & Market Integrity
                </h2>
                <button onClick={() => handleCopyLink("prohibited-use")} className="text-text-tertiary hover:text-text-primary p-1">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <p>Client agrees not to use AlgoText services for any unlawful or market manipulation activities, including but not limited to:</p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>Wash trading, spoofing, layer ordering, or artificial volume generation;</li>
                <li>Executing transactions intended to manipulate exchange price indexes or settlement benchmarks;</li>
                <li>Violating OFAC sanctions, anti-money laundering (AML) laws, or local regulatory constraints.</li>
              </ul>
            </section>

            {/* 9.0 Limitation Liability */}
            <section id="limitation-liability" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between border-b border-bg-border pb-2">
                <h2 className="text-[20px] font-bold text-text-primary flex items-center gap-2">
                  <span className="font-mono text-accent-blue">9.0</span> Limitation of Liability & Indemnification
                </h2>
                <button onClick={() => handleCopyLink("limitation-liability")} className="text-text-tertiary hover:text-text-primary p-1">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, ALGOTEXT INC. AND ITS DIRECTORS, OFFICERS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, OR PUNITIVE DAMAGES, OR FOR LOSS OF PROFITS, REVENUE, TRADING CAPITAL, OR DATA.
              </p>
            </section>

            {/* 10.0 Arbitration */}
            <section id="arbitration" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between border-b border-bg-border pb-2">
                <h2 className="text-[20px] font-bold text-text-primary flex items-center gap-2">
                  <span className="font-mono text-accent-blue">10.0</span> Governing Law & Binding Arbitration
                </h2>
                <button onClick={() => handleCopyLink("arbitration")} className="text-text-tertiary hover:text-text-primary p-1">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <p>
                This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to conflict of law principles. Any dispute arising out of this Agreement shall be resolved through binding commercial arbitration administered by the American Arbitration Association (AAA).
              </p>
            </section>

            {/* 11.0 Severability */}
            <section id="severability" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between border-b border-bg-border pb-2">
                <h2 className="text-[20px] font-bold text-text-primary flex items-center gap-2">
                  <span className="font-mono text-accent-blue">11.0</span> Modifications, Amendments & Severability
                </h2>
                <button onClick={() => handleCopyLink("severability")} className="text-text-tertiary hover:text-text-primary p-1">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <p>
                AlgoText reserves the right to modify these Terms with 30 days’ prior electronic notice. Continued use of the platform following the effective date of changes constitutes binding acceptance.
              </p>
            </section>

            {/* 12.0 Corporate Contact */}
            <section id="contact-legal" className="scroll-mt-28 space-y-4">
              <div className="flex items-center justify-between border-b border-bg-border pb-2">
                <h2 className="text-[20px] font-bold text-text-primary flex items-center gap-2">
                  <span className="font-mono text-accent-blue">12.0</span> Corporate Legal Notices & Compliance
                </h2>
                <button onClick={() => handleCopyLink("contact-legal")} className="text-text-tertiary hover:text-text-primary p-1">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <p>For formal legal inquiries, compliance notices, or enterprise custom contracts, please contact our legal counsel:</p>
              <div className="rounded-xl border border-bg-border bg-bg-surface p-4 space-y-1 font-mono text-[13px]">
                <div className="font-bold text-text-primary">AlgoText Inc. Corporate Legal Department</div>
                <div className="text-text-secondary">1209 North Orange Street, Suite 800</div>
                <div className="text-text-secondary">Wilmington, DE 19801, United States</div>
                <div className="text-accent-blue font-bold mt-2">Email: legal@algotext.com • compliance@algotext.com</div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
