"use client"

import * as React from "react"
import { BackButton } from "@/components/ui/BackButton"
import { FileDown, CalendarDays } from "lucide-react"

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = React.useState("collection")

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
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-6">Privacy Policy</h3>
            <ul className="space-y-3 text-sm font-medium">
              <li>
                <a href="#collection" className={`transition-colors ${activeSection === 'collection' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}>1. Information We Collect</a>
              </li>
              <li>
                <a href="#usage" className={`transition-colors ${activeSection === 'usage' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}>2. How We Use Your Data</a>
              </li>
              <li>
                <a href="#security" className={`transition-colors ${activeSection === 'security' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}>3. Data Security</a>
              </li>
              <li>
                <a href="#third-party" className={`transition-colors ${activeSection === 'third-party' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}>4. Third-Party Services</a>
              </li>
              <li>
                <a href="#contact" className={`transition-colors ${activeSection === 'contact' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}>5. Contact Us</a>
              </li>
            </ul>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 max-w-[800px] pb-32">
          <div className="mb-12">
            <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-4">Privacy Policy</h1>
            <div className="flex items-center gap-2 text-gray-500">
              <CalendarDays className="h-4 w-4" />
              <span>Last Updated: October 15, 2026</span>
            </div>
          </div>

          <div className="prose prose-lg max-w-none text-gray-600 space-y-12">
            <section id="collection" className="scroll-mt-32">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
              <p>
                When you use AlgoText, we collect minimal personal information to provide our services. We strongly believe in data minimization. We collect:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your public wallet address (used as your primary identifier)</li>
                <li>Non-identifiable platform usage metrics (clicks, page views)</li>
                <li>The trading strategies you construct on our platform (encrypted at rest)</li>
              </ul>
              <p>
                <strong>What we DO NOT collect:</strong> We do not collect your name, physical address, or IP addresses in our permanent logs.
              </p>
            </section>

            <section id="usage" className="scroll-mt-32">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Data</h2>
              <p>
                We use the collected data solely to operate and maintain the AlgoText platform, process your transactions, and improve the underlying AI models.
              </p>
              <blockquote className="border-l-4 border-purple-500 bg-purple-50 p-4 rounded-r-lg text-purple-900 not-italic my-6">
                <strong>Model Training Note:</strong> Highly anonymized strategy structures (ASTs) may be used to train our natural language parser to understand syntax better. However, strict numerical parameter values (e.g., specific stop losses or moving average lengths) are aggressively scrubbed before any training occurs.
              </blockquote>
            </section>

            <section id="security" className="scroll-mt-32">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Data Security</h2>
              <p>
                The security of your data is paramount. We implement industry-standard encryption protocols (AES-256) for all data at rest and TLS 1.3 for data in transit. 
              </p>
              <p>
                Because AlgoText is entirely non-custodial, <strong>we do not store private keys or seed phrases under any circumstances</strong>. Even in the event of a catastrophic database breach, your funds would remain completely safe.
              </p>
            </section>

            <section id="third-party" className="scroll-mt-32">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Third-Party Services</h2>
              <p>
                We may employ third-party companies and individuals to facilitate our Service (e.g., blockchain node providers, RPC endpoints, analytics tools). These third parties have access to your public wallet address and transaction data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
              </p>
            </section>

            <section id="contact" className="scroll-mt-32">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact our Data Protection Officer at <a href="mailto:privacy@algotext.ai" className="text-blue-600 hover:underline">privacy@algotext.ai</a>.
              </p>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
