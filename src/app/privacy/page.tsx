import * as React from "react"
import { BackButton } from "@/components/ui/BackButton"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg-primary pt-2 pb-32">
      <div className="mx-auto max-w-[800px] px-6 py-12">
        <BackButton />
        <h1 className="mb-4 text-4xl font-bold text-text-primary tracking-tight">Privacy Policy</h1>
        <p className="mb-12 text-text-secondary">Last Updated: October 15, 2026</p>

        <div className="prose prose-invert max-w-none text-text-secondary">
          <h3 className="text-xl font-bold text-text-primary mb-4">1. Information We Collect</h3>
          <p className="mb-8 leading-relaxed">
            When you use AlgoText, we collect minimal personal information to provide our services. This includes your public wallet address (used as your primary identifier), non-identifiable usage metrics, and the trading strategies you construct on our platform (which are encrypted at rest). We do not collect your name, physical address, or IP addresses in our permanent logs.
          </p>

          <h3 className="text-xl font-bold text-text-primary mb-4">2. How We Use Your Data</h3>
          <p className="mb-8 leading-relaxed">
            We use the collected data solely to operate and maintain the AlgoText platform, process your transactions, and improve the underlying AI models (anonymized strategy structures may be used to train our natural language parser, but strict parameter values are scrubbed).
          </p>

          <h3 className="text-xl font-bold text-text-primary mb-4">3. Data Security</h3>
          <p className="mb-8 leading-relaxed">
            The security of your data is paramount. We implement industry-standard encryption protocols (AES-256) for all data at rest and TLS 1.3 for data in transit. Because AlgoText is non-custodial, we do not store private keys or seed phrases under any circumstances.
          </p>

          <h3 className="text-xl font-bold text-text-primary mb-4">4. Third-Party Services</h3>
          <p className="mb-8 leading-relaxed">
            We may employ third-party companies and individuals to facilitate our Service (e.g., node providers, RPC endpoints, analytics tools). These third parties have access to your public wallet address and transaction data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
          </p>

          <h3 className="text-xl font-bold text-text-primary mb-4">5. Contact Us</h3>
          <p className="mb-8 leading-relaxed">
            If you have any questions about this Privacy Policy, please contact our Data Protection Officer at privacy@algotext.ai.
          </p>
        </div>
      </div>
    </div>
  )
}
