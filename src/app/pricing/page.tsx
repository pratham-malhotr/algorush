"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, X, Zap, Shield, Crown, HelpCircle, Info, Star, Clock, Award, Building2, TrendingUp, Cpu, BarChart3 } from "lucide-react"
import { BackButton } from "@/components/ui/BackButton"

const faqs = [
  { question: "Can I cancel my subscription?", answer: "Yes, you can cancel your subscription at any time. Your access will remain active until the end of your current billing period." },
  { question: "What is included in the free trial?", answer: "The 14-day free trial gives you full access to all Pro features. You can build, backtest, and run live strategies to see the value before paying." },
  { question: "How does premium execution routing work?", answer: "Premium routing reduces latency by connecting directly to exchange APIs through our dedicated institutional-grade servers, ensuring faster trade execution." },
  { question: "Can I upgrade or downgrade later?", answer: "Absolutely. You can change your plan at any time. Prorated charges or credits will be automatically applied to your account." },
]

const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="group relative flex items-center">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-3 py-2 bg-text-primary text-bg-primary text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-text-primary" />
    </div>
  </div>
)

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = React.useState(true)
  const [hoveredTier, setHoveredTier] = React.useState<string | null>(null)

  return (
    <div className="min-h-screen bg-bg-primary pt-2 pb-32 overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[600px] bg-accent-blue/5 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute top-40 right-1/4 w-[600px] h-[400px] bg-blue-400/5 blur-[120px] pointer-events-none rounded-full" />

      <section className="mx-auto max-w-[1200px] px-6 relative z-10">
        <div className="flex justify-start mb-6"><BackButton /></div>
        
        <div className="text-center mb-10 relative">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="mb-4 text-5xl font-extrabold text-text-primary md:text-6xl tracking-tight leading-tight"
          >
            Invest in your trading edge. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-blue to-blue-400">Automate your success.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="mx-auto max-w-[700px] text-lg text-text-secondary leading-relaxed"
          >
            Join over 1500+ traders automating their strategies. Choose a predictable flat-rate plan, take emotion out of trading, and unlock powerful AI-driven insights.
          </motion.p>
        </div>

        {/* Interactive Toggle */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="flex justify-center mb-16"
        >
          <div className="bg-bg-surface/80 backdrop-blur-xl border border-bg-border p-1.5 rounded-full flex items-center relative shadow-xl">
            <button 
              onClick={() => setIsAnnual(false)}
              className={`relative w-36 py-3 text-sm font-bold rounded-full z-10 transition-colors duration-300 ${!isAnnual ? 'bg-text-primary text-bg-primary shadow-md' : 'text-text-secondary hover:text-text-primary'}`}
            >
              Pay Monthly
            </button>
            <button 
              onClick={() => setIsAnnual(true)}
              className={`relative w-36 py-3 text-sm font-bold rounded-full z-10 transition-colors duration-300 flex items-center justify-center gap-1 ${isAnnual ? 'bg-text-primary text-bg-primary shadow-md' : 'text-text-secondary hover:text-text-primary'}`}
            >
              Pay Annually
            </button>
            
            {/* Savings Badge */}
            <motion.div 
              initial={false}
              animate={{ opacity: isAnnual ? 1 : 0.5, scale: isAnnual ? 1 : 0.9 }}
              className="absolute -top-4 -right-6 text-xs font-extrabold text-white bg-gradient-to-r from-blue-500 to-cyan-400 px-3 py-1 rounded-full shadow-lg shadow-blue-500/20 rotate-12"
            >
              Save up to 24%
            </motion.div>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-[1150px] mx-auto mb-20 perspective-1000">
          
          {/* Basic */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            onHoverStart={() => setHoveredTier('basic')}
            onHoverEnd={() => setHoveredTier(null)}
            className={`rounded-[2rem] border ${hoveredTier === 'basic' ? 'border-text-secondary/50 scale-[1.02]' : 'border-bg-border'} bg-bg-surface p-8 flex flex-col transition-all duration-300 shadow-xl`}
          >
            <h3 className="text-2xl font-bold text-text-primary mb-2">Basic</h3>
            <p className="text-text-secondary text-sm mb-6 min-h-[40px]">Perfect for beginners building their first automated strategies.</p>
            <div className="mb-6 pb-6 border-b border-bg-border">
              <div className="flex items-end gap-1">
                <span className="text-5xl font-extrabold text-text-primary">$0</span>
                <span className="text-text-secondary font-medium mb-1">/mo</span>
              </div>
              <div className="text-sm text-text-secondary mt-2">Free forever. No credit card.</div>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {[
                { name: "1 Active Trading Bot", tooltip: "Maximum number of bots running concurrently." },
                { name: "2 Connected Exchanges", tooltip: "Link up to two API keys from supported exchanges." },
                { name: "Standard Execution Speed", tooltip: "Trades are routed and executed within 60 seconds of signal." },
                { name: "3 Months Backtesting History", tooltip: "Test your strategies on historical data." },
                { name: "Community Support", tooltip: "Access to our Discord and forums." }
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-text-secondary text-sm">
                  <Check className="h-5 w-5 text-text-primary shrink-0" /> 
                  <span className="leading-tight">
                    {feature.name}
                  </span>
                </li>
              ))}
            </ul>
            <button className="w-full py-3.5 rounded-xl font-bold bg-bg-primary text-text-primary border border-bg-border hover:bg-white/5 transition-colors text-sm">
              Get Started for Free
            </button>
          </motion.div>

          {/* Pro (Highlighted) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            onHoverStart={() => setHoveredTier('pro')}
            onHoverEnd={() => setHoveredTier(null)}
            className={`rounded-[2rem] bg-bg-surface p-8 flex flex-col relative transition-all duration-500 z-20 ${hoveredTier === 'pro' ? 'scale-[1.05]' : 'scale-[1.03]'} shadow-[0_0_40px_rgba(59,130,246,0.2)]`}
          >
            {/* Animated Gradient Border using pseudo-element trick */}
            <div className="absolute inset-0 rounded-[2rem] p-[2px] bg-gradient-to-br from-accent-blue via-blue-400 to-accent-blue pointer-events-none mask-border" style={{ WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }} />
            
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-accent-blue to-blue-400 text-white px-4 py-1 text-xs font-bold rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
              <Zap className="h-3.5 w-3.5 fill-white" /> Most Popular
            </div>
            
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-blue to-blue-400 mb-2">Pro</h3>
            <p className="text-text-secondary text-sm mb-6 min-h-[40px]">For active traders who need serious power, speed, and AI tools.</p>
            <div className="mb-6 pb-6 border-b border-bg-border/50 relative">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={isAnnual ? 'annual' : 'monthly'}
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }}
                  className="flex items-end gap-1"
                >
                  <span className="text-5xl font-extrabold text-text-primary">${isAnnual ? '45' : '59'}</span>
                  <span className="text-text-secondary font-medium mb-1">/mo</span>
                </motion.div>
              </AnimatePresence>
              <div className="text-sm font-medium text-accent-blue mt-2 h-5">
                {isAnnual ? 'Billed $540 annually' : 'Billed monthly'}
              </div>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {[
                { name: "10 Live Trading Bots", tooltip: "Run up to 10 automated strategies simultaneously." }, 
                { name: "5 Connected Exchanges", tooltip: "Link and trade across 5 different platforms." }, 
                { name: "Premium Execution Routing", tooltip: "Trades executed in under 2 seconds." }, 
                { name: "5 Years Backtesting History", tooltip: "Deep historical data for accurate testing." },
                { name: "AI Strategy Builder Access", tooltip: "Use our generative AI to build strategies from text prompts." }
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-text-secondary text-sm font-medium">
                  <Check className="h-5 w-5 text-accent-blue shrink-0 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" /> 
                  <span className="text-text-primary leading-tight">
                    {feature.name}
                    {feature.tooltip && (
                      <Tooltip text={feature.tooltip}>
                        <Info className="h-4 w-4 inline-block ml-1 text-text-tertiary hover:text-text-primary cursor-help" />
                      </Tooltip>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <button className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-accent-blue to-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              Start 14-Day Free Trial
            </button>
            <p className="text-center text-xs text-text-tertiary mt-4">Cancel anytime. Try Pro risk-free.</p>
          </motion.div>

          {/* Elite */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            onHoverStart={() => setHoveredTier('elite')}
            onHoverEnd={() => setHoveredTier(null)}
            className={`rounded-[2rem] border ${hoveredTier === 'elite' ? 'border-yellow-500/50 scale-[1.02]' : 'border-bg-border'} bg-bg-surface p-8 flex flex-col transition-all duration-300 shadow-xl`}
          >
            <h3 className="text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
              Elite <Crown className="h-5 w-5 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
            </h3>
            <p className="text-text-secondary text-sm mb-6 min-h-[40px]">Institutional grade features for funds, prop firms, and whales.</p>
            <div className="mb-6 pb-6 border-b border-bg-border">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={isAnnual ? 'annual' : 'monthly'}
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }}
                  className="flex items-end gap-1"
                >
                  <span className="text-5xl font-extrabold text-text-primary">${isAnnual ? '119' : '149'}</span>
                  <span className="text-text-secondary font-medium mb-1">/mo</span>
                </motion.div>
              </AnimatePresence>
              <div className="text-sm font-medium text-text-tertiary mt-2 h-5">
                {isAnnual ? 'Billed $1,428 annually' : 'Billed monthly'}
              </div>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {[
                { name: "Unlimited Trading Bots", tooltip: "No restrictions on concurrent strategies." }, 
                { name: "Ultra-Low Latency VPS", tooltip: "Trades executed in under 50ms via co-located servers." }, 
                { name: "Full Historical Tick Data", tooltip: "Access to order-book level historical data for precise backtesting." }, 
                { name: "Custom Webhooks & API", tooltip: "Connect TradingView alerts or external signal providers directly." },
                { name: "Dedicated Account Manager", tooltip: "1-on-1 support and strategy consulting." }
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-text-secondary text-sm">
                  <Check className="h-5 w-5 text-text-primary shrink-0" /> 
                  <span className="leading-tight">
                    {feature.name}
                    {feature.tooltip && (
                      <Tooltip text={feature.tooltip}>
                        <Info className="h-4 w-4 inline-block ml-1 text-text-tertiary hover:text-text-primary cursor-help" />
                      </Tooltip>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <button className="w-full py-3.5 rounded-xl font-bold bg-bg-primary text-text-primary border border-bg-border hover:bg-white/5 hover:border-text-secondary/30 transition-colors text-sm">
              Upgrade to Elite
            </button>
          </motion.div>
        </div>

        {/* Why Choose AlgoText Section */}
        <div className="max-w-[1000px] mx-auto mb-32">
          <div className="grid md:grid-cols-3 gap-8 py-10 px-8 border-y border-bg-border bg-bg-surface/30 backdrop-blur-sm rounded-3xl">
            <div className="flex flex-col items-center text-center">
              <Cpu className="h-10 w-10 text-accent-blue mb-4" />
              <h4 className="font-bold text-text-primary text-lg mb-2">Powerful AI Automation</h4>
              <p className="text-text-secondary text-sm">Translate your trading ideas into code instantly using our AI Strategy Builder. No coding required to build complex bots.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <BarChart3 className="h-10 w-10 text-blue-400 mb-4" />
              <h4 className="font-bold text-text-primary text-lg mb-2">Advanced Backtesting</h4>
              <p className="text-text-secondary text-sm">Test your strategies against years of historical data to ensure profitability before you ever risk a single dollar live.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Star className="h-10 w-10 text-yellow-500 mb-4" />
              <h4 className="font-bold text-text-primary text-lg mb-2">Trusted by 1500+</h4>
              <p className="text-text-secondary text-sm">Join a thriving community of 1500+ traders who have completely automated their strategies using our infrastructure.</p>
            </div>
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="max-w-[1000px] mx-auto mb-32 hidden md:block">
          <h2 className="text-3xl font-bold text-text-primary text-center mb-12">Deep Feature Comparison</h2>
          <div className="border border-bg-border rounded-[2rem] overflow-hidden bg-bg-surface shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-bg-border bg-bg-primary/50">
                  <th className="p-6 text-text-secondary font-medium w-1/3">Features</th>
                  <th className="p-6 text-text-primary font-bold w-[22%] text-center">Basic</th>
                  <th className="p-6 text-accent-blue font-bold w-[22%] text-center bg-accent-blue/5 border-x border-accent-blue/10">Pro</th>
                  <th className="p-6 text-text-primary font-bold w-[22%] text-center">Elite</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bg-border">
                {[
                  { name: "Active Live Bots", basic: "1", pro: "10", elite: "Unlimited" },
                  { name: "Connected Exchanges", basic: "2", pro: "5", elite: "Unlimited" },
                  { name: "Backtesting History", basic: "3 Months", pro: "5 Years", elite: "Unlimited (Tick-level)" },
                  { name: "Execution Speed", basic: "Standard (<60s)", pro: "Premium (<2s)", elite: "Ultra-Low (<50ms)" },
                  { name: "AI Strategy Builder", basic: false, pro: true, elite: true },
                  { name: "TradingView Webhooks", basic: false, pro: false, elite: true },
                  { name: "Paper Trading Accounts", basic: "1", pro: "5", elite: "Unlimited" },
                  { name: "Support Level", basic: "Community Forums", pro: "Priority Email (24h SLA)", elite: "Dedicated Slack Channel" },
                ].map((row, i) => (
                  <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="p-6 text-text-primary font-medium group-hover:text-accent-blue transition-colors">{row.name}</td>
                    <td className="p-6 text-center">
                      {typeof row.basic === 'boolean' ? (
                        row.basic ? <Check className="h-5 w-5 mx-auto text-text-secondary" /> : <X className="h-5 w-5 mx-auto text-text-tertiary/30" />
                      ) : <span className="text-text-secondary">{row.basic}</span>}
                    </td>
                    <td className="p-6 text-center bg-accent-blue/[0.02] border-x border-accent-blue/10 group-hover:bg-accent-blue/[0.05] transition-colors">
                      {typeof row.pro === 'boolean' ? (
                        row.pro ? <Check className="h-5 w-5 mx-auto text-accent-blue drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]" /> : <X className="h-5 w-5 mx-auto text-text-tertiary/30" />
                      ) : <span className="text-text-primary font-bold">{row.pro}</span>}
                    </td>
                    <td className="p-6 text-center">
                      {typeof row.elite === 'boolean' ? (
                        row.elite ? <Check className="h-5 w-5 mx-auto text-yellow-500 drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]" /> : <X className="h-5 w-5 mx-auto text-text-tertiary/30" />
                      ) : <span className="text-text-secondary font-medium">{row.elite}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-[800px] mx-auto">
          <div className="text-center mb-12">
            <HelpCircle className="h-8 w-8 text-text-secondary mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-text-primary mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-bg-surface border border-bg-border rounded-2xl p-6 hover:border-text-secondary/30 transition-colors">
                <h4 className="text-lg font-bold text-text-primary mb-2">{faq.question}</h4>
                <p className="text-text-secondary text-sm leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
