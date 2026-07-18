"use client"

import * as React from "react"
import { BackButton } from "@/components/ui/BackButton"
import { FileDown, CalendarDays } from "lucide-react"

export default function TermsPage() {
  const [activeSection, setActiveSection] = React.useState("acceptance")

  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id)
        }
      })
    }, { rootMargin: "-100px 0px -80% 0px" })
    
    document.querySelectorAll("section[id]").forEach(section => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-40 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-6">
          <div className="flex items-center gap-6">
            <BackButton />
            <h1 className="text-xl font-bold text-gray-900">Legal Center</h1>
          </div>
          <button className="hidden sm:flex items-center gap-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 text-sm font-medium transition-colors">
            <FileDown className="h-4 w-4" />
            Download PDF
          </button>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1200px] flex-col md:flex-row px-6 py-16 gap-12 relative">
        
        {/* Sidebar TOC */}
        <aside className="hidden md:block w-[240px] shrink-0">
          <div className="sticky top-32">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-6">Terms of Service</h3>
            <ul className="space-y-3 text-sm font-medium">
              <li>
                <a href="#acceptance" className={`transition-colors ${activeSection === 'acceptance' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}>1. Acceptance of Terms</a>
              </li>
              <li>
                <a href="#non-custodial" className={`transition-colors ${activeSection === 'non-custodial' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}>2. Non-Custodial Nature</a>
              </li>
              <li>
                <a href="#risk" className={`transition-colors ${activeSection === 'risk' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}>3. Risk Disclosure</a>
              </li>
              <li>
                <a href="#fees" className={`transition-colors ${activeSection === 'fees' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}>4. Fees and Payments</a>
              </li>
              <li>
                <a href="#ip" className={`transition-colors ${activeSection === 'ip' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}>5. Intellectual Property</a>
              </li>
            </ul>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 max-w-[800px] pb-32">
          <div className="mb-12">
            <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-4">Terms of Service</h1>
            <div className="flex items-center gap-2 text-gray-500">
              <CalendarDays className="h-4 w-4" />
              <span>Last Updated: October 15, 2026</span>
            </div>
          </div>

          <div className="prose prose-lg max-w-none text-gray-600 space-y-12">
            <section id="acceptance" className="scroll-mt-32">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing or using the AlgoText platform ("Service"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the Service. AlgoText provides a non-custodial software interface that allows users to construct, backtest, and deploy algorithmic trading strategies.
              </p>
            </section>

            <section id="non-custodial" className="scroll-mt-32">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Non-Custodial Nature</h2>
              <p>
                AlgoText is strictly a non-custodial technology provider. We do not hold, control, or have direct access to your digital assets. All live trading execution is facilitated through smart contract approvals granted by your self-hosted Web3 wallet.
              </p>
              <blockquote className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg text-blue-900 not-italic my-6">
                <strong>Critical Clause:</strong> You are solely responsible for securing your private keys and seed phrases. AlgoText can never recover funds lost due to compromised wallets.
              </blockquote>
            </section>

            <section id="risk" className="scroll-mt-32">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Risk Disclosure</h2>
              <p>
                Trading cryptocurrencies involves significant risk and can result in the loss of your invested capital. You should not invest more than you can afford to lose.
              </p>
              <p>
                The backtesting results, strategies generated by our AI models, and any other data provided by AlgoText do not constitute financial advice. Past performance is not indicative of future results. The NLP compiler may occasionally misinterpret ambiguous prompts; you are required to review the compiled Abstract Syntax Tree (AST) before deploying live capital.
              </p>
            </section>

            <section id="fees" className="scroll-mt-32">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Fees and Payments</h2>
              <p>
                AlgoText charges a flat execution fee of <strong>0.05%</strong> on the notional volume of trades executed live through the platform. This fee is deducted automatically at the time of execution via our smart router.
              </p>
              <p>
                We reserve the right to modify our fee structure with a 30-day prior notice provided via the platform or email. Unpaid fees may result in the suspension of automated execution services.
              </p>
            </section>

            <section id="ip" className="scroll-mt-32">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Intellectual Property</h2>
              <p>
                The Service and its original content (excluding User-Generated Strategies), features, and functionality are and will remain the exclusive property of AlgoText Inc and its licensors. 
              </p>
              <p>
                <strong>Your Strategies:</strong> You retain full ownership of the unique algorithmic strategies you construct using our platform. We do not claim intellectual property rights over the specific alpha logic you develop.
              </p>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
