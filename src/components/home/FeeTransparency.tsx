import * as React from "react"
import { Check, ShieldCheck } from "lucide-react"

export function FeeTransparency() {
  return (
    <section className="w-full border-t border-bg-border bg-bg-base py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <h2 className="mb-16 text-center text-[36px] font-bold text-text-primary">
          Simple, Transparent Pricing with Zero Volume Fees
        </h2>

        <div className="flex w-full flex-col gap-12 lg:flex-row lg:items-center">
          {/* Left Column */}
          <div className="flex flex-1 flex-col">
            <h3 className="mb-2 font-sans text-[80px] font-bold leading-none text-accent-blue">
              $0 Volume
            </h3>
            <p className="mb-6 text-[20px] font-semibold text-text-secondary">
              Zero trading volume markups or percentage cuts
            </p>
            <p className="max-w-[400px] text-[16px] leading-[1.6] text-text-tertiary">
              Trade unlimited volume across 60+ CEX & DEX venues. Flat monthly subscriptions with no profit cuts and no hidden surcharges.
            </p>
          </div>

          {/* Right Column: Table */}
          <div className="flex-1 w-full overflow-x-auto">
            <div className="min-w-[500px] rounded-[var(--radius-lg)] border border-bg-border bg-bg-surface overflow-hidden">
              <table className="w-full text-left text-[14px]">
                <thead>
                  <tr className="border-b border-bg-border bg-bg-elevated text-[12px] uppercase tracking-wider text-text-secondary">
                    <th className="px-6 py-4 font-semibold">Platform</th>
                    <th className="px-6 py-4 font-semibold">Volume Fee</th>
                    <th className="px-6 py-4 font-semibold">Profit Cut?</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bg-border">
                  <tr className="bg-accent-green/5 border-l-4 border-l-accent-green">
                    <td className="px-6 py-4 font-semibold text-accent-green flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-accent-green" /> AlgoText.ai
                    </td>
                    <td className="px-6 py-4 text-text-primary font-medium">$0 (Flat Subscription)</td>
                    <td className="px-6 py-4 text-text-primary font-medium">0% (Keep 100% Profits)</td>
                  </tr>
                  {[
                    { platform: "Traditional Hedge Funds", model: "2% Management + 20% Profit", profits: "20% Cut" },
                    { platform: "3Commas", model: "$37–79/mo + extra add-ons", profits: "Add-on fees" },
                    { platform: "Cryptohopper", model: "$24–107/mo + limits", profits: "Tier limits" },
                    { platform: "Pionex", model: "Exchange maker/taker fees", profits: "No" },
                  ].map((row, i) => (
                    <tr key={i} className="bg-bg-surface hover:bg-black/[0.02] transition-colors">
                      <td className="px-6 py-4 text-text-secondary">{row.platform}</td>
                      <td className="px-6 py-4 text-text-secondary">{row.model}</td>
                      <td className="px-6 py-4 text-text-secondary">{row.profits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
