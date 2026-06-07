"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Menu } from "lucide-react"
import { Logo } from "@/components/ui/Logo"
import { Button } from "@/components/ui/button"

import { ConnectButton } from "@rainbow-me/rainbowkit"

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Builder", href: "/builder" },
  { name: "Markets", href: "/markets" },
  { name: "Leaderboard", href: "/leaderboard" },
  { name: "Docs", href: "/docs" },
]

export function Navbar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  return (
    <nav className="sticky top-0 z-[100] flex h-[64px] w-full items-center justify-between border-b border-bg-border bg-[#0A0C10]/85 px-4 backdrop-blur-md sm:px-6 lg:px-8">
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

      {/* Right side */}
      <div className="hidden items-center gap-4 md:flex">
        <ConnectButton />
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

      {/* Mobile Drawer (simplified for now) */}
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
          <div className="mt-auto pb-8">
             <Button variant="primary" className="w-full">
              Connect Wallet
            </Button>
          </div>
        </div>
      )}
    </nav>
  )
}
