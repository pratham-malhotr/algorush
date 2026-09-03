"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, X, Zap, Shield, Crown, HelpCircle, Info, Star, Cpu, BarChart3, CheckCircle2, Bitcoin, Wallet, Copy, ExternalLink, Lock, Clock, AlertTriangle, ArrowRight } from "lucide-react"
import { BackButton } from "@/components/ui/BackButton"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { MERCHANT_BTC_ADDRESS } from "@/lib/payments/btc"

const faqs = [
  { question: "Can I pay using Bitcoin?", answer: "Yes! We accept direct on-chain Bitcoin (BTC) payments. Your transaction will be verified on the Bitcoin network and your account will be upgraded instantly upon confirmation." },
  { question: "Can I cancel my subscription?", answer: "Yes, you can cancel your subscription at any time. Your access will remain active until the end of your current billing period." },
  { question: "What is included in the free trial?", answer: "The 14-day free trial gives you full access to all Pro features. You can build, backtest, and run live strategies to see the value before paying." },
  { question: "How does premium execution routing work?", answer: "Premium routing reduces latency by connecting directly to exchange APIs through our dedicated institutional-grade servers, ensuring faster trade execution." },
  { question: "Can I upgrade or downgrade later?", answer: "Absolutely. You can change your plan at any time. Prorated charges or credits will be automatically applied to your account." },
]

const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="group relative flex items-center">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[250px] px-3 py-2 bg-text-primary text-bg-primary text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none shadow-2xl z-50 translate-y-1 group-hover:translate-y-0">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-text-primary" />
    </div>
  </div>
)

export default function PricingPage() {
  const router = useRouter()
  const [isAnnual, setIsAnnual] = React.useState(true)
  const [hoveredTier, setHoveredTier] = React.useState<string | null>(null)
  
  // Checkout State
  const [checkoutPlan, setCheckoutPlan] = React.useState<'PRO' | 'ELITE' | null>(null)
  const [copiedAddress, setCopiedAddress] = React.useState(false)
  const [copiedAmount, setCopiedAmount] = React.useState(false)
  const [verifying, setVerifying] = React.useState(false)
  const [txHash, setTxHash] = React.useState('')
  const [btcPrice, setBtcPrice] = React.useState(67500)
  const [orderExpiry, setOrderExpiry] = React.useState(900) // 15 mins in seconds

  // Fetch live BTC price
  React.useEffect(() => {
    fetch('/api/prices?symbols=BTC/USDT')
      .then(res => res.json())
      .then(data => {
        if (data.prices && data.prices['BTC/USDT']) {
          setBtcPrice(data.prices['BTC/USDT'])
        }
      })
      .catch(() => {})
  }, [])

  // Expiration countdown
  React.useEffect(() => {
    if (!checkoutPlan) return
    const timer = setInterval(() => {
      setOrderExpiry(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [checkoutPlan])

  const planPriceUSD = checkoutPlan === 'PRO' 
    ? (isAnnual ? 540 : 59) 
    : (isAnnual ? 1428 : 149)

  const btcAmount = +(planPriceUSD / btcPrice).toFixed(6)
  const bip21Uri = `bitcoin:${MERCHANT_BTC_ADDRESS}?amount=${btcAmount}&label=AlgoText%20VIP`
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(bip21Uri)}&margin=8`

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(MERCHANT_BTC_ADDRESS)
    setCopiedAddress(true)
    toast.success("Bitcoin address copied to clipboard!")
    setTimeout(() => setCopiedAddress(false), 2500)
  }

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(btcAmount.toString())
    setCopiedAmount(true)
    toast.success(`Copied ${btcAmount} BTC to clipboard!`)
    setTimeout(() => setCopiedAmount(false), 2500)
  }

  const handleVerify = async () => {
    setVerifying(true)
    try {
      const orderId = `INV-BTC-${Date.now().toString(36).toUpperCase()}`
      // Navigate to verification pipeline with order details
      const params = new URLSearchParams({
        orderId,
        plan: checkoutPlan || 'PRO',
        cycle: isAnnual ? 'annual' : 'monthly',
        amountUSD: planPriceUSD.toString(),
        amountBTC: btcAmount.toString(),
        txHash: txHash.trim() || 'pending',
        address: MERCHANT_BTC_ADDRESS
      })
      
      setTimeout(() => {
        router.push(`/checkout/verify?${params.toString()}`)
      }, 600)
    } catch {
      setVerifying(false)
      toast.error("Failed to submit payment confirmation")
    }
  }

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-bg-primary pt-2 pb-32 overflow-hidden relative selection:bg-accent-blue/30">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-accent-blue/5 blur-[120px] pointer-events-none rounded-[100%]" />
      <div className="absolute top-[20%] -left-[20%] w-[600px] h-[600px] bg-blue-500/5 blur-[150px] pointer-events-none rounded-full" />

      <section className="mx-auto max-w-[1200px] px-6 relative z-10">
        <div className="flex justify-start mb-12"><BackButton /></div>
        
        {/* Hero Section */}
        <div className="text-center mb-16 relative">
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-xs font-bold uppercase tracking-widest mb-8"
          >
            <Shield className="h-4 w-4" /> Trusted by 1,500+ Traders
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="mb-6 text-5xl md:text-7xl font-extrabold text-text-primary tracking-tight leading-[1.1]"
          >
            Pricing that scales <br className="hidden md:block"/>
            with your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-accent-blue to-cyan-400">edge.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="mx-auto max-w-[650px] text-lg md:text-xl text-text-secondary leading-relaxed font-medium"
          >
            Automate your success without emotion. Choose a predictable flat-rate plan and unlock institutional-grade AI trading capabilities. Pay via Bitcoin.
          </motion.p>
        </div>

        {/* Animated Billing Toggle */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="flex justify-center mb-24"
        >
          <div className="bg-bg-surface/60 backdrop-blur-2xl border border-bg-border p-1.5 rounded-full flex items-center relative shadow-2xl">
            <button 
              onClick={() => setIsAnnual(false)}
              className={`relative w-40 py-3.5 text-sm font-bold rounded-full z-10 transition-colors duration-300 ${!isAnnual ? 'text-white' : 'text-text-secondary hover:text-text-primary'}`}
            >
              {!isAnnual && (
                <motion.div layoutId="active-pill" className="absolute inset-0 bg-text-primary rounded-full -z-10 shadow-lg" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
              )}
              Monthly
            </button>
            <button 
              onClick={() => setIsAnnual(true)}
              className={`relative w-44 py-3.5 text-sm font-bold rounded-full z-10 transition-colors duration-300 flex items-center justify-center gap-1.5 ${isAnnual ? 'text-white' : 'text-text-secondary hover:text-text-primary'}`}
            >
              {isAnnual && (
                <motion.div layoutId="active-pill" className="absolute inset-0 bg-text-primary rounded-full -z-10 shadow-lg" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
              )}
              Annual
              <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full ${isAnnual ? 'bg-accent-green text-black' : 'bg-accent-green/20 text-accent-green'}`}>
                Save 25%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-32">
          
          {/* FREE PLAN */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="relative bg-bg-surface border border-bg-border rounded-[2.5rem] p-8 flex flex-col justify-between shadow-xl"
          >
            <div>
              <div className="flex items-center gap-2 text-text-secondary text-sm font-bold uppercase tracking-wider mb-4">
                <Cpu className="h-4 w-4" /> Starter
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-2">Paper Sandbox</h3>
              <p className="text-text-secondary text-sm mb-6">Test strategies with simulated capital & testnets.</p>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-5xl font-extrabold text-text-primary tracking-tight">$0</span>
                <span className="text-text-secondary text-sm font-bold">/ forever</span>
              </div>

              <div className="h-px bg-bg-border mb-8" />

              <div className="space-y-4 mb-8">
                {[
                  "1 Active Paper Bot",
                  "NLP Strategy Compiler",
                  "10 Backtest Runs / day",
                  "Standard Webhook Execution",
                  "Community Discord Support"
                ].map(feature => (
                  <div key={feature} className="flex items-center gap-3 text-sm text-text-secondary">
                    <Check className="h-4 w-4 text-accent-blue shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => router.push("/builder")}
              className="w-full py-4 rounded-2xl font-bold border border-bg-border bg-bg-elevated hover:bg-bg-border/50 text-text-primary transition-all duration-300"
            >
              Start Free
            </button>
          </motion.div>

          {/* PRO PLAN (POPULAR) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="relative bg-bg-surface border-2 border-accent-blue rounded-[2.5rem] p-8 flex flex-col justify-between shadow-[0_0_50px_rgba(59,130,246,0.15)] md:-translate-y-4"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-[11px] font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
              <Star className="h-3 w-3 fill-white" /> Most Popular
            </div>

            <div>
              <div className="flex items-center gap-2 text-accent-blue text-sm font-bold uppercase tracking-wider mb-4">
                <Zap className="h-4 w-4" /> Professional
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-2">Live Quant Pro</h3>
              <p className="text-text-secondary text-sm mb-6">Automate real capital across Binance, OKX, & 60+ exchanges.</p>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-5xl font-extrabold text-text-primary tracking-tight">
                  {isAnnual ? "$45" : "$59"}
                </span>
                <span className="text-text-secondary text-sm font-bold">/ month</span>
                {isAnnual && <span className="text-xs text-text-tertiary ml-1">(billed $540/yr)</span>}
              </div>

              <div className="h-px bg-bg-border mb-8" />

              <div className="space-y-4 mb-8">
                {[
                  "10 Active Live Bots",
                  "Institutional-Grade Low Latency",
                  "Unlimited Multi-Year Backtests",
                  "Binance / OKX / LBank REST & WebSockets",
                  "Sub-Second Order Routing",
                  "Custom DSL Webhook Triggers",
                  "Priority Email & Telegram Support"
                ].map(feature => (
                  <div key={feature} className="flex items-center gap-3 text-sm text-text-primary font-medium">
                    <Check className="h-4 w-4 text-accent-green shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => setCheckoutPlan('PRO')}
              className="w-full py-4 rounded-2xl font-bold bg-accent-blue hover:bg-blue-600 text-white shadow-lg shadow-accent-blue/30 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Bitcoin className="h-4 w-4" />
              Pay with Bitcoin (PRO)
            </button>
          </motion.div>

          {/* ELITE PLAN */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="relative bg-bg-surface border border-bg-border rounded-[2.5rem] p-8 flex flex-col justify-between shadow-xl"
          >
            <div>
              <div className="flex items-center gap-2 text-text-secondary text-sm font-bold uppercase tracking-wider mb-4">
                <Crown className="h-4 w-4 text-yellow-500" /> Institutional
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-2">Elite Fund</h3>
              <p className="text-text-secondary text-sm mb-6">Dedicated co-located execution & bespoke algorithmic pipelines.</p>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-5xl font-extrabold text-text-primary tracking-tight">
                  {isAnnual ? "$119" : "$149"}
                </span>
                <span className="text-text-secondary text-sm font-bold">/ month</span>
                {isAnnual && <span className="text-xs text-text-tertiary ml-1">(billed $1,428/yr)</span>}
              </div>

              <div className="h-px bg-bg-border mb-8" />

              <div className="space-y-4 mb-8">
                {[
                  "Unlimited Live Bots",
                  "Co-Located Dedicated Servers (<5ms)",
                  "Custom Python Strategy Engine",
                  "Multi-Exchange Cross Arbitrage",
                  "Dedicated Quant Engineer",
                  "Private Slack / Telegram Channel",
                  "SLA 99.99% Uptime Guarantee"
                ].map(feature => (
                  <div key={feature} className="flex items-center gap-3 text-sm text-text-secondary">
                    <Check className="h-4 w-4 text-accent-blue shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => setCheckoutPlan('ELITE')}
              className="w-full py-4 rounded-2xl font-bold border border-bg-border bg-bg-elevated hover:bg-bg-border/50 text-text-primary transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Bitcoin className="h-4 w-4" />
              Pay with Bitcoin (Elite)
            </button>
          </motion.div>

        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-text-primary text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="p-6 rounded-2xl border border-bg-border bg-bg-surface">
                <h4 className="font-bold text-text-primary mb-2">{faq.question}</h4>
                <p className="text-sm text-text-secondary leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* ═══ Bitcoin Payment Modal ═══ */}
      <AnimatePresence>
        {checkoutPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }} 
              animate={{ opacity: 1, backdropFilter: "blur(8px)" }} 
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }} 
              onClick={() => setCheckoutPlan(null)}
              className="absolute inset-0 bg-black/75"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-bg-surface border border-bg-border rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Top Accent Gradient */}
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

              {/* Modal Header */}
              <div className="p-6 pb-4 flex justify-between items-center bg-bg-surface border-b border-bg-border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
                    <Bitcoin className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-text-primary">Receive Bitcoin</h2>
                    <div className="flex items-center gap-2 text-xs text-text-secondary mt-0.5">
                      <span className="font-semibold text-text-primary">{checkoutPlan} Plan ({isAnnual ? 'Annual' : 'Monthly'})</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-amber-500 font-mono">
                        <Clock className="h-3 w-3" /> {formatCountdown(orderExpiry)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xl font-bold text-text-primary">${planPriceUSD}</div>
                    <div className="text-xs font-mono text-amber-500 font-bold">{btcAmount} BTC</div>
                  </div>
                  <button 
                    onClick={() => setCheckoutPlan(null)} 
                    className="h-8 w-8 rounded-full hover:bg-bg-elevated flex items-center justify-center text-text-tertiary hover:text-text-primary transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-5">
                
                {/* QR Code Card */}
                <div className="bg-bg-base rounded-2xl p-5 border border-bg-border flex flex-col items-center shadow-inner">
                  {/* Bitcoin Asset Dropdown Pill */}
                  <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-500 text-xs font-bold">
                    <Bitcoin className="h-3.5 w-3.5" />
                    <span>Bitcoin Network (Native SegWit)</span>
                  </div>

                  {/* QR Image */}
                  <div className="p-3 bg-white rounded-2xl shadow-xl mb-4 relative group">
                    <img 
                      src={qrCodeUrl}
                      alt="Bitcoin QR Code"
                      className="w-44 h-44 object-contain"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="h-9 w-9 rounded-full bg-amber-500 flex items-center justify-center text-white shadow-lg border-2 border-white">
                        <Bitcoin className="h-5 w-5" />
                      </div>
                    </div>
                  </div>

                  {/* Address Display */}
                  <div className="w-full text-center">
                    <div className="font-mono text-[13px] font-bold text-text-primary break-all bg-bg-elevated/70 p-3 rounded-xl border border-bg-border select-all">
                      {MERCHANT_BTC_ADDRESS}
                    </div>
                  </div>
                </div>

                {/* Important Warning Banner */}
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/25 p-3.5 flex items-start gap-3 text-amber-500">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p className="text-[12px] font-medium leading-relaxed">
                    <strong>Notice:</strong> Only send Bitcoin (BTC) assets to this address. Other crypto assets sent will be lost forever.
                  </p>
                </div>

                {/* Action Buttons: Copy Address & Copy Amount */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleCopyAddress}
                    className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                      copiedAddress 
                        ? 'bg-accent-green/20 border-accent-green text-accent-green' 
                        : 'bg-bg-elevated border-bg-border hover:border-text-secondary text-text-primary'
                    }`}
                  >
                    {copiedAddress ? <CheckCircle2 className="h-4 w-4 text-accent-green" /> : <Copy className="h-4 w-4" />}
                    <span>{copiedAddress ? 'Address Copied!' : 'Copy Address'}</span>
                  </button>

                  <button
                    onClick={handleCopyAmount}
                    className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                      copiedAmount 
                        ? 'bg-accent-green/20 border-accent-green text-accent-green' 
                        : 'bg-bg-elevated border-bg-border hover:border-text-secondary text-text-primary'
                    }`}
                  >
                    {copiedAmount ? <CheckCircle2 className="h-4 w-4 text-accent-green" /> : <Bitcoin className="h-4 w-4" />}
                    <span>{copiedAmount ? 'BTC Copied!' : `Copy ${btcAmount} BTC`}</span>
                  </button>
                </div>

                {/* Optional TxID Input */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider">
                    Transaction ID / Hash (Optional)
                  </label>
                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="Paste 64-character Bitcoin TxID..."
                      value={txHash}
                      onChange={(e) => setTxHash(e.target.value)}
                      className="w-full bg-bg-base border border-bg-border rounded-xl py-3 pl-3.5 pr-20 text-text-primary font-mono text-xs outline-none focus:border-amber-500/50 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const text = await navigator.clipboard.readText()
                          if (text) setTxHash(text.trim())
                        } catch {}
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-semibold bg-bg-elevated hover:bg-bg-border rounded-lg text-text-secondary transition-colors"
                    >
                      Paste
                    </button>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-6 pt-3 bg-bg-surface border-t border-bg-border flex flex-col gap-3">
                <button 
                  onClick={handleVerify}
                  disabled={verifying}
                  className="w-full py-3.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-black shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {verifying ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                      <span>Initiating Confirmation Pipeline...</span>
                    </>
                  ) : (
                    <>
                      <span>I Have Sent The Bitcoin</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
                
                <div className="flex items-center justify-center gap-2 text-[10.5px] font-semibold text-text-tertiary uppercase tracking-wider">
                  <Lock className="h-3 w-3" /> Direct On-Chain Settlement • Instant Verification
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
