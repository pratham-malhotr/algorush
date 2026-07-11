import * as React from "react"
import Link from "next/link"
import { Logo } from "@/components/ui/Logo"
import { ShieldCheck } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full border-t border-bg-border bg-bg-base py-16">
      <div className="mx-auto flex max-w-[1200px] flex-col px-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {/* COL 1: Logo + tagline + social icons */}
          <div className="flex flex-col gap-6">
            <Logo />
            <p className="text-[14px] text-text-secondary">
              Trade Smarter. No Code Required.
            </p>
            <div className="flex gap-4">
              {/* Mock Social Icons */}
              {["Twitter", "Discord", "Telegram", "GitHub"].map((social) => (
                <div
                  key={social}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-bg-elevated text-text-tertiary transition-colors hover:text-text-primary"
                  title={social}
                >
                  <span className="text-[12px]">{social[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* COL 2: Links */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-text-primary">Platform</h4>
            <Link href="/builder" className="text-[14px] text-text-secondary hover:text-accent-blue">Builder</Link>
            <Link href="/markets" className="text-[14px] text-text-secondary hover:text-accent-blue">Markets</Link>
            <Link href="/leaderboard" className="text-[14px] text-text-secondary hover:text-accent-blue">Leaderboard</Link>
            <Link href="/docs" className="text-[14px] text-text-secondary hover:text-accent-blue">Docs</Link>
            <Link href="/blog" className="text-[14px] text-text-secondary hover:text-accent-blue">Blog</Link>
            <Link href="/api" className="text-[14px] text-text-secondary hover:text-accent-blue">API</Link>
          </div>

          {/* COL 3: Links */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-text-primary">Company</h4>
            <Link href="/about" className="text-[14px] text-text-secondary hover:text-accent-blue">About</Link>
            <Link href="/careers" className="text-[14px] text-text-secondary hover:text-accent-blue">Careers</Link>
            <Link href="/press" className="text-[14px] text-text-secondary hover:text-accent-blue">Press</Link>
            <Link href="/affiliates" className="text-[14px] text-accent-green font-medium hover:text-accent-blue flex items-center gap-2">
              Affiliate Program <span className="flex h-4 items-center rounded-full bg-accent-green/20 px-1.5 text-[10px] uppercase text-accent-green">New</span>
            </Link>
            <Link href="/terms" className="text-[14px] text-text-secondary hover:text-accent-blue">Terms</Link>
            <Link href="/privacy" className="text-[14px] text-text-secondary hover:text-accent-blue">Privacy</Link>
            <Link href="/support" className="text-[14px] text-text-secondary hover:text-accent-blue">Support</Link>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-bg-border pt-8 sm:flex-row">
          <p className="text-[14px] text-text-tertiary">
            © 2026 AlgoText.ai. All rights reserved.
          </p>
          <div className="flex items-center gap-2 rounded-full border border-[#166534] bg-[#052E16] px-3 py-1 text-[12px] font-semibold text-accent-green">
            <ShieldCheck className="h-4 w-4" />
            Audited by CertiK
          </div>
        </div>
      </div>
    </footer>
  )
}
