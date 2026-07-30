"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, X, Zap, Shield, Crown, HelpCircle, Info, Star, Cpu, BarChart3, CheckCircle2, Bitcoin, Wallet, Copy, ExternalLink, Lock } from "lucide-react"
import { BackButton } from "@/components/ui/BackButton"
import { useRouter } from "next/navigation"

const faqs = [
  { question: "Can I cancel my subscription?", answer: "Yes, you can cancel your subscription at any time. Your access will remain active until the end of your current billing period." },
  { question: "What is included in the free trial?", answer: "The 14-day free trial gives you full access to all Pro features. You can build, backtest, and run live strategies to see the value before paying." },
  { question: "How does premium execution routing work?", answer: "Premium routing reduces latency by connecting directly to exchange APIs through our dedicated institutional-grade servers, ensuring faster trade execution." },
  { question: "Can I upgrade or downgrade later?", answer: "Absolutely. You can change your plan at any time. Prorated charges or credits will be automatically applied to your account." },
]

const CRYPTO_OPTIONS = [
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC', network: 'Bitcoin Network', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' },
  { id: 'eth', name: 'Ethereum', symbol: 'ETH', network: 'ERC-20', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' },
  { id: 'sol', name: 'Solana', symbol: 'SOL', network: 'Solana Network', address: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH' },
  { id: 'usdt', name: 'USDT', symbol: 'USDT', network: 'TRC-20', address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t' }
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
  const [selectedCrypto, setSelectedCrypto] = React.useState(CRYPTO_OPTIONS[0])
  const [copied, setCopied] = React.useState(false)
  const [verifying, setVerifying] = React.useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedCrypto.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleVerify = () => {
    setVerifying(true)
    setTimeout(() => {
      router.push("/checkout/verify")
    }, 800)
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
            Automate your success without emotion. Choose a predictable flat-rate plan and unlock institutional-grade AI trading capabilities. 
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
              <span className="relative z-10">Pay Monthly</span>
            </button>
            <button 
              onClick={() => setIsAnnual(true)}
              className={`relative w-40 py-3.5 text-sm font-bold rounded-full z-10 transition-colors duration-300 flex items-center justify-center gap-2 ${isAnnual ? 'text-white' : 'text-text-secondary hover:text-text-primary'}`}
            >
              {isAnnual && (
                <motion.div layoutId="active-pill" className="absolute inset-0 bg-text-primary rounded-full -z-10 shadow-lg" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
              )}
              <span className="relative z-10">Pay Annually</span>
            </button>
            
            {/* Savings Badge */}
            <motion.div 
              initial={false}
              animate={{ opacity: isAnnual ? 1 : 0.5, scale: isAnnual ? 1 : 0.9, y: isAnnual ? 0 : 5 }}
              className="absolute -top-5 -right-8 text-[11px] font-extrabold text-white bg-gradient-to-r from-blue-600 to-cyan-500 px-3 py-1.5 rounded-full shadow-lg shadow-blue-500/30 rotate-6 border border-white/20"
            >
              Save 24%
            </motion.div>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-[1200px] mx-auto mb-32 items-center">
          
          {/* Basic */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            onHoverStart={() => setHoveredTier('basic')}
            onHoverEnd={() => setHoveredTier(null)}
            className={`rounded-[2.5rem] border ${hoveredTier === 'basic' ? 'border-text-secondary/40 bg-bg-surface/80' : 'border-bg-border bg-bg-surface/40'} backdrop-blur-xl p-8 flex flex-col transition-all duration-500 shadow-2xl relative overflow-hidden`}
          >
            <h3 className="text-2xl font-bold text-text-primary mb-2">Basic</h3>
            <p className="text-text-secondary text-sm mb-8 min-h-[40px] font-medium leading-relaxed">Perfect for beginners building their first automated strategies.</p>
            <div className="mb-8 pb-8 border-b border-bg-border/50">
              <div className="flex items-end gap-1">
                <span className="text-5xl font-extrabold text-text-primary tracking-tight">$0</span>
                <span className="text-text-secondary font-semibold mb-1">/mo</span>
              </div>
              <div className="text-sm text-text-secondary mt-2 font-medium">Free forever. No credit card.</div>
            </div>
            <ul className="space-y-4 mb-10 flex-1">
              {[
                { name: "1 Active Trading Bot", tooltip: "Maximum number of bots running concurrently." },
                { name: "2 Connected Exchanges", tooltip: "Link up to two API keys from supported exchanges." },
                { name: "Standard Execution Speed", tooltip: "Trades are routed and executed within 60 seconds of signal." },
                { name: "3 Months Backtesting History" },
                { name: "Community Support" }
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-text-secondary text-sm font-medium">
                  <Check className="h-5 w-5 text-text-primary shrink-0" /> 
                  <span className="leading-tight">
                    {feature.name}
                    {feature.tooltip && (
                      <Tooltip text={feature.tooltip}>
                        <Info className="h-4 w-4 inline-block ml-1 text-text-tertiary hover:text-text-primary cursor-help transition-colors" />
                      </Tooltip>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <button className="w-full py-4 rounded-2xl font-bold bg-white/5 text-text-primary border border-bg-border hover:bg-white/10 hover:border-text-secondary/50 transition-all duration-300 text-sm shadow-sm backdrop-blur-md">
              Start Building
            </button>
          </motion.div>

          {/* Pro (Highlighted) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            onHoverStart={() => setHoveredTier('pro')}
            onHoverEnd={() => setHoveredTier(null)}
            className={`rounded-[2.5rem] bg-bg-surface/80 backdrop-blur-2xl p-10 flex flex-col relative transition-all duration-500 z-20 ${hoveredTier === 'pro' ? 'scale-[1.03] shadow-[0_0_80px_rgba(59,130,246,0.15)]' : 'scale-100 shadow-[0_0_50px_rgba(59,130,246,0.1)]'}`}
          >
            {/* Animated Gradient Border */}
            <div className="absolute inset-0 rounded-[2.5rem] p-[2px] bg-gradient-to-br from-accent-blue/80 via-blue-400/40 to-cyan-400/80 pointer-events-none mask-border" style={{ WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }} />
            
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-accent-blue to-cyan-500 text-white px-5 py-1.5 text-xs font-extrabold rounded-full uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-500/30 border border-white/20">
              <Zap className="h-3.5 w-3.5 fill-white" /> Most Popular
            </div>
            
            <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">Pro</h3>
            <p className="text-text-secondary text-sm mb-8 min-h-[40px] font-medium leading-relaxed">For active traders who need serious power, speed, and AI tools.</p>
            <div className="mb-8 pb-8 border-b border-bg-border relative">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={isAnnual ? 'annual' : 'monthly'}
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }}
                  className="flex items-end gap-1"
                >
                  <span className="text-6xl font-extrabold text-text-primary tracking-tight">${isAnnual ? '45' : '59'}</span>
                  <span className="text-text-secondary font-semibold mb-2">/mo</span>
                </motion.div>
              </AnimatePresence>
              <div className="text-sm font-bold text-accent-blue mt-3 h-5">
                {isAnnual ? 'Billed $540 annually' : 'Billed monthly'}
              </div>
            </div>
            <ul className="space-y-4 mb-10 flex-1">
              {[
                { name: "10 Live Trading Bots", tooltip: "Run up to 10 automated strategies simultaneously." }, 
                { name: "5 Connected Exchanges" }, 
                { name: "Premium Execution Routing", tooltip: "Trades executed in under 2 seconds directly on our institutional lines." }, 
                { name: "5 Years Backtesting History" },
                { name: "AI Strategy Builder Access", tooltip: "Use our generative AI to build complex strategies purely from text prompts." }
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-text-secondary text-sm font-semibold">
                  <Check className="h-5 w-5 text-accent-blue shrink-0 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" /> 
                  <span className="text-text-primary leading-tight">
                    {feature.name}
                    {feature.tooltip && (
                      <Tooltip text={feature.tooltip}>
                        <Info className="h-4 w-4 inline-block ml-1.5 text-text-tertiary hover:text-accent-blue cursor-help transition-colors" />
                      </Tooltip>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <button 
              onClick={() => setCheckoutPlan('PRO')}
              className="w-full py-4 rounded-2xl font-extrabold bg-gradient-to-r from-blue-600 to-accent-blue text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              Get Pro Now <ExternalLink className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-center text-[11px] font-bold text-text-tertiary mt-5 flex items-center justify-center gap-1.5 uppercase tracking-wider">
              <Lock className="h-3 w-3" /> Non-Custodial Crypto Pay
            </p>
          </motion.div>

          {/* Elite */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            onHoverStart={() => setHoveredTier('elite')}
            onHoverEnd={() => setHoveredTier(null)}
            className={`rounded-[2.5rem] border ${hoveredTier === 'elite' ? 'border-yellow-500/40 bg-bg-surface/80' : 'border-bg-border bg-bg-surface/40'} backdrop-blur-xl p-8 flex flex-col transition-all duration-500 shadow-2xl relative overflow-hidden`}
          >
            <h3 className="text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
              Elite <Crown className="h-6 w-6 text-yellow-500 drop-shadow-[0_0_12px_rgba(234,179,8,0.6)]" />
            </h3>
            <p className="text-text-secondary text-sm mb-8 min-h-[40px] font-medium leading-relaxed">Institutional grade features for funds, prop firms, and whales.</p>
            <div className="mb-8 pb-8 border-b border-bg-border/50">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={isAnnual ? 'annual' : 'monthly'}
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }}
                  className="flex items-end gap-1"
                >
                  <span className="text-5xl font-extrabold text-text-primary tracking-tight">${isAnnual ? '119' : '149'}</span>
                  <span className="text-text-secondary font-semibold mb-1">/mo</span>
                </motion.div>
              </AnimatePresence>
              <div className="text-sm font-medium text-text-tertiary mt-2 h-5">
                {isAnnual ? 'Billed $1,428 annually' : 'Billed monthly'}
              </div>
            </div>
            <ul className="space-y-4 mb-10 flex-1">
              {[
                { name: "Unlimited Trading Bots" }, 
                { name: "Ultra-Low Latency VPS", tooltip: "Trades executed in under 50ms via co-located servers near exchange matching engines." }, 
                { name: "Full Historical Tick Data", tooltip: "Access to order-book level historical data for ultra-precise backtesting." }, 
                { name: "Custom Webhooks & API" },
                { name: "Dedicated Account Manager" }
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-text-secondary text-sm font-medium">
                  <Check className="h-5 w-5 text-yellow-500 shrink-0" /> 
                  <span className="leading-tight">
                    {feature.name}
                    {feature.tooltip && (
                      <Tooltip text={feature.tooltip}>
                        <Info className="h-4 w-4 inline-block ml-1.5 text-text-tertiary hover:text-yellow-500 cursor-help transition-colors" />
                      </Tooltip>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <button 
              onClick={() => setCheckoutPlan('ELITE')}
              className="w-full py-4 rounded-2xl font-bold bg-bg-primary text-text-primary border border-bg-border hover:bg-white/10 hover:border-yellow-500/30 transition-all duration-300 text-sm shadow-sm"
            >
              Contact Sales
            </button>
          </motion.div>
        </div>

        {/* Enterprise Feature Comparison */}
        <div className="max-w-[1000px] mx-auto mb-32 hidden md:block">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-text-primary tracking-tight mb-4">Deep Feature Comparison</h2>
            <p className="text-text-secondary">Compare everything before making your decision.</p>
          </div>
          
          <div className="border border-bg-border rounded-3xl overflow-hidden bg-bg-surface/50 backdrop-blur-xl shadow-2xl relative">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-bg-border to-transparent" />
            <table className="w-full text-left border-collapse relative">
              <thead className="sticky top-0 bg-bg-surface/90 backdrop-blur-md z-10">
                <tr className="border-b border-bg-border">
                  <th className="p-6 text-text-secondary font-bold uppercase tracking-wider text-xs w-1/3">Core Features</th>
                  <th className="p-6 text-text-primary font-bold w-[22%] text-center text-lg">Basic</th>
                  <th className="p-6 text-accent-blue font-bold w-[22%] text-center bg-accent-blue/[0.03] border-x border-accent-blue/10 text-lg shadow-[inset_0_2px_0_rgba(59,130,246,0.5)]">Pro</th>
                  <th className="p-6 text-text-primary font-bold w-[22%] text-center text-lg">Elite</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bg-border/50">
                {[
                  { name: "Active Live Bots", basic: "1", pro: "10", elite: "Unlimited" },
                  { name: "Connected Exchanges", basic: "2", pro: "5", elite: "Unlimited" },
                  { name: "Backtesting History", basic: "3 Months", pro: "5 Years", elite: "Unlimited (Tick-level)" },
                  { name: "Execution Speed", basic: "Standard (<60s)", pro: "Premium (<2s)", elite: "Ultra-Low (<50ms)" },
                  { name: "AI Strategy Builder", basic: false, pro: true, elite: true },
                  { name: "TradingView Webhooks", basic: false, pro: false, elite: true },
                  { name: "Paper Trading Accounts", basic: "1", pro: "5", elite: "Unlimited" },
                  { name: "Support Level", basic: "Community", pro: "Priority SLA", elite: "Dedicated Slack" },
                ].map((row, i) => (
                  <tr key={i} className="group hover:bg-white/[0.03] transition-colors duration-300">
                    <td className="p-6 text-text-primary font-semibold text-sm group-hover:text-accent-blue transition-colors">{row.name}</td>
                    <td className="p-6 text-center">
                      {typeof row.basic === 'boolean' ? (
                        row.basic ? <Check className="h-5 w-5 mx-auto text-text-primary" /> : <X className="h-5 w-5 mx-auto text-text-tertiary/40" />
                      ) : <span className="text-text-secondary font-medium">{row.basic}</span>}
                    </td>
                    <td className="p-6 text-center bg-accent-blue/[0.02] border-x border-accent-blue/10 group-hover:bg-accent-blue/[0.05] transition-colors duration-300">
                      {typeof row.pro === 'boolean' ? (
                        row.pro ? <Check className="h-5 w-5 mx-auto text-accent-blue drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" /> : <X className="h-5 w-5 mx-auto text-text-tertiary/40" />
                      ) : <span className="text-text-primary font-bold">{row.pro}</span>}
                    </td>
                    <td className="p-6 text-center">
                      {typeof row.elite === 'boolean' ? (
                        row.elite ? <Check className="h-5 w-5 mx-auto text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" /> : <X className="h-5 w-5 mx-auto text-text-tertiary/40" />
                      ) : <span className="text-text-secondary font-medium">{row.elite}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </section>

      {/* Web3 Coinbase-Style Checkout Modal */}
      <AnimatePresence>
        {checkoutPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }} 
              animate={{ opacity: 1, backdropFilter: "blur(8px)" }} 
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }} 
              onClick={() => setCheckoutPlan(null)}
              className="absolute inset-0 bg-black/70"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-bg-surface border border-bg-border rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-6 flex justify-between items-center bg-bg-primary/80 border-b border-bg-border backdrop-blur-xl relative">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent-blue to-cyan-400" />
                <div className="flex flex-col">
                  <h2 className="text-xl font-extrabold text-text-primary tracking-tight">Commerce</h2>
                  <p className="text-sm font-medium text-text-secondary mt-1">
                    Paying for {checkoutPlan === 'PRO' ? (isAnnual ? 'Pro (Annual)' : 'Pro (Monthly)') : (isAnnual ? 'Elite (Annual)' : 'Elite (Monthly)')}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-text-primary">
                    {checkoutPlan === 'PRO' ? (isAnnual ? '$540' : '$59') : (isAnnual ? '$1,428' : '$149')}
                  </div>
                  <button onClick={() => setCheckoutPlan(null)} className="absolute top-6 right-6 h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center text-text-tertiary hover:text-text-primary transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 bg-bg-surface flex flex-col gap-6">
                
                {/* Network Selection */}
                <div>
                  <h4 className="text-xs font-bold text-text-secondary mb-3 uppercase tracking-wider">Pay With</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {CRYPTO_OPTIONS.map((crypto) => (
                      <button
                        key={crypto.id}
                        onClick={() => setSelectedCrypto(crypto)}
                        className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all duration-300 ${selectedCrypto.id === crypto.id ? 'border-accent-blue bg-accent-blue/10 shadow-[0_0_20px_rgba(59,130,246,0.15)]' : 'border-bg-border hover:border-text-secondary/50 bg-bg-primary/30'}`}
                      >
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${selectedCrypto.id === crypto.id ? 'bg-accent-blue text-white' : 'bg-bg-border text-text-tertiary'}`}>
                          <Bitcoin className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                          <div className={`font-bold text-sm ${selectedCrypto.id === crypto.id ? 'text-text-primary' : 'text-text-secondary'}`}>{crypto.symbol}</div>
                          <div className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider">{crypto.network}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Deposit Address */}
                <div className="bg-bg-primary/50 rounded-3xl p-6 border border-bg-border flex flex-col items-center shadow-inner">
                  <div className="mb-6 p-3 bg-white rounded-2xl shadow-xl">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(selectedCrypto.address)}`}
                      alt="QR Code"
                      className="w-36 h-36 object-contain"
                    />
                  </div>
                  
                  <div className="w-full">
                    <div className="flex justify-center items-center mb-3">
                      <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Send to this address</span>
                    </div>
                    <div className="relative group">
                      <input 
                        readOnly 
                        value={selectedCrypto.address} 
                        className="w-full bg-bg-surface border border-bg-border rounded-xl py-4 pl-4 pr-12 text-text-primary font-mono text-sm outline-none shadow-sm focus:border-accent-blue/50 transition-colors cursor-text"
                      />
                      <button 
                        onClick={handleCopy}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-lg flex items-center justify-center transition-all duration-300 ${copied ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-bg-border hover:bg-text-secondary/20 text-text-secondary'}`}
                      >
                        {copied ? <CheckCircle2 className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="p-6 pt-0 bg-bg-surface flex flex-col gap-4">
                <button 
                  onClick={handleVerify}
                  disabled={verifying}
                  className="w-full py-4 rounded-xl font-bold bg-text-primary text-bg-primary shadow-lg hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {verifying ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-bg-primary/30 border-t-bg-primary animate-spin" />
                      Awaiting Block Confirmation...
                    </>
                  ) : (
                    "I have transferred the funds"
                  )}
                </button>
                <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-text-tertiary uppercase tracking-widest">
                  <Lock className="h-3 w-3" /> End-to-end encrypted
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
