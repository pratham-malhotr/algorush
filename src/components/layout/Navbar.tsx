"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Menu, Wallet, ChevronDown, CheckCircle2 } from "lucide-react"
import { Logo } from "@/components/ui/Logo"
import { Button } from "@/components/ui/button"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useExchangeStore } from "@/store/useExchangeStore"
import { ExchangeConnectModal } from "@/components/ui/ExchangeConnectModal"

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Builder", href: "/builder" },
  { name: "Arbitrage", href: "/arbitrage" },
  { name: "Markets", href: "/markets" },
  { name: "Leaderboard", href: "/leaderboard" },
  { name: "Pricing", href: "/pricing" },
  { name: "Docs", href: "/docs" },
]

export function Navbar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const { getActiveAccount, setIsConnectModalOpen } = useExchangeStore()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const activeAccount = mounted ? getActiveAccount() : null

  return (
    <>
      <nav className="sticky top-0 z-[100] flex h-[64px] w-full items-center justify-between border-b border-bg-border bg-bg-base/85 px-4 backdrop-blur-md sm:px-6 lg:px-8">
        {/* Left side */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center">
            <Logo />
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative text-[14px] font-medium transition-colors ${
                    isActive ? "text-accent-blue" : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute -bottom-[21px] left-0 h-[2px] w-full bg-accent-blue" />
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Right side - Dual Connect Hub */}
        <div className="hidden items-center gap-3 md:flex">
          {/* Exchange Connection Button */}
          {activeAccount ? (
            <button
              onClick={() => setIsConnectModalOpen(true)}
              className="flex items-center gap-2.5 rounded-xl border border-accent-blue/40 bg-accent-blue/10 px-3.5 py-1.5 text-[13px] font-semibold text-text-primary hover:bg-accent-blue/20 transition-all shadow-sm"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#F3BA2F] text-black font-extrabold text-[11px]">
                {activeAccount.exchangeId.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[12px] font-bold leading-tight flex items-center gap-1">
                  {activeAccount.name}
                  <CheckCircle2 className="h-3 w-3 text-accent-green" />
                </span>
                <span className="font-mono text-[10px] text-accent-blue leading-tight">
                  ${activeAccount.balanceUsdt.toLocaleString()} USDT
                </span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-text-tertiary ml-1" />
            </button>
          ) : (
            <Button
              variant="secondary"
              className="text-[13px] h-9 border-accent-blue/30 text-accent-blue hover:bg-accent-blue/10"
              onClick={() => setIsConnectModalOpen(true)}
            >
              <Wallet className="h-4 w-4 mr-2" />
              Connect Binance / CEX
            </Button>
          )}

          {/* Web3 Wallet Connect */}
          <ConnectButton chainStatus="icon" showBalance={false} />
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-text-secondary hover:text-text-primary p-2"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Drawer */}
        {isMobileMenuOpen && (
          <div className="absolute left-0 top-[64px] flex h-[calc(100vh-64px)] w-full flex-col bg-bg-base p-4 md:hidden">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-lg font-medium text-text-secondary hover:text-text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <div className="mt-auto pb-8 space-y-3">
              <Button 
                variant="primary" 
                className="w-full"
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  setIsConnectModalOpen(true)
                }}
              >
                Connect Binance & Crypto Exchanges
              </Button>
            </div>
          </div>
        )}
      </nav>
      <ExchangeConnectModal />
    </>
  )
}

