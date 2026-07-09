import * as React from "react"
import { Check } from "lucide-react"

export function FeeTransparency() {
  return (
    <section className="w-full border-t border-bg-border bg-[#0A0C10] py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <h2 className="mb-16 text-center text-[36px] font-bold text-text-primary">
          The most transparent fee model in crypto
        </h2>

        <div className="flex w-full flex-col gap-12 lg:flex-row lg:items-center">
          {/* Left Column */}
          <div className="flex flex-1 flex-col">
            <h3 className="mb-2 font-sans text-[80px] font-bold leading-none text-accent-blue">
              Just 0.05%
            </h3>
            <p className="mb-6 text-[20px] text-text-secondary">
              on executed trade volume
            </p>
            <p className="max-w-[400px] text-[16px] leading-[1.6] text-text-tertiary">
              No monthly fees for running your own strategies. No profit sharing. No hidden charges.
            </p>
          </div>

          {/* Right Column: Table */}
          <div className="flex-1 w-full overflow-x-auto">
            <div className="min-w-[500px] rounded-[var(--radius-lg)] border border-bg-border bg-bg-surface overflow-hidden">
              <table className="w-full text-left text-[14px]">
                <thead>
                  <tr className="border-b border-bg-border bg-bg-elevated text-[12px] uppercase tracking-wider text-text-secondary">
                    <th className="px-6 py-4 font-semibold">Platform</th>
                    <th className="px-6 py-4 font-semibold">Fee Model</th>
                    <th className="px-6 py-4 font-semibold">On Profits?</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bg-border">
                  <tr className="bg-accent-green/5 border-l-4 border-l-accent-green">
                    <td className="px-6 py-4 font-semibold text-accent-green flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-accent-green" /> AlgoText.ai
                    </td>
                    <td className="px-6 py-4 text-text-primary font-medium">0.05% volume</td>
                    <td className="px-6 py-4 text-text-primary font-medium">No</td>
                  </tr>
                  {[
                    { platform: "3Commas", model: "$37–79/month", profits: "Sometimes" },
                    { platform: "Cryptohopper", model: "$24–107/month", profits: "No" },
                    { platform: "Pionex", model: "0.05% + extra bots", profits: "No" },
                    { platform: "Binance Grid", model: "0.1% trading fee", profits: "No" },
                  ].map((row, i) => (
                    <tr key={i} className="bg-bg-surface hover:bg-white/[0.02] transition-colors">
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
