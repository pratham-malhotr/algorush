import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function FinalCTA() {
  return (
    <section className="w-full bg-bg-surface py-32 text-center">
      <div className="mx-auto flex max-w-[800px] flex-col items-center px-6">
        <h2 className="mb-4 text-[48px] font-bold text-text-primary">
          Start trading smarter today
        </h2>
        <p className="mb-10 text-[20px] text-text-secondary">
          Join 12,000+ traders using AlgoText.ai
        </p>
        
        <Link href="/onboarding" className="mb-6">
          <Button variant="primary" className="px-10 py-4 text-[16px]">
            Create Free Account
          </Button>
        </Link>
        <Button variant="ghost" className="text-text-secondary">
          Connect Wallet Instead
        </Button>
      </div>
    </section>
  )
}
