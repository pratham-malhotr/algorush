"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ShieldCheck, TrendingUp, Zap } from "lucide-react"

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = React.useState(1)

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
    else router.push("/builder")
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] w-full flex-col items-center justify-center bg-[#070A0D] p-6 relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-blue/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="z-10 w-full max-w-[500px]">
        
        {/* Progress Bar */}
        <div className="mb-8 flex w-full gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${step >= i ? "bg-accent-blue" : "bg-bg-border"}`} />
          ))}
        </div>

        <div className="min-h-[400px] rounded-[var(--radius-xl)] border border-bg-border bg-bg-surface p-8 shadow-[var(--shadow-card)] relative overflow-hidden">
          <AnimatePresence mode="wait">
            
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col h-full"
              >
                <h2 className="mb-2 text-[24px] font-bold text-text-primary">Welcome to AlgoText.ai</h2>
                <p className="mb-8 text-[15px] text-text-secondary">What's your experience level with algorithmic trading?</p>
                
                <div className="flex flex-col gap-4">
                  {[
                    { title: "Beginner", desc: "I want to copy others or use simple blocks.", icon: Users },
                    { title: "Intermediate", desc: "I know indicators like RSI and MACD.", icon: TrendingUp },
                    { title: "Expert", desc: "I need complex logic gates and precise execution.", icon: Zap },
                  ].map((lvl, i) => (
                    <button key={i} className="group flex items-center gap-4 rounded-lg border border-bg-border bg-bg-base p-4 text-left transition-all hover:border-accent-blue hover:bg-[#0F2036] hover:shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg-elevated transition-colors group-hover:bg-accent-blue/20">
                        <lvl.icon className="h-5 w-5 text-text-secondary group-hover:text-accent-blue transition-colors" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-text-primary">{lvl.title}</span>
                        <span className="text-[13px] text-text-secondary">{lvl.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col h-full"
              >
                <h2 className="mb-2 text-[24px] font-bold text-text-primary">Risk Tolerance</h2>
                <p className="mb-8 text-[15px] text-text-secondary">Set your global safety nets. You can always change this later.</p>
                
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between">
                      <span className="font-medium text-text-primary">Max Drawdown Limit</span>
                      <span className="font-mono text-accent-red">-15%</span>
                    </div>
                    <input type="range" className="w-full accent-accent-red" min="1" max="50" defaultValue="15" />
                    <p className="text-[12px] text-text-tertiary">All bots will automatically halt if total portfolio drops by this amount.</p>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between">
                      <span className="font-medium text-text-primary">Default Position Size</span>
                      <span className="font-mono text-accent-blue">5%</span>
                    </div>
                    <input type="range" className="w-full accent-accent-blue" min="1" max="25" defaultValue="5" />
                    <p className="text-[12px] text-text-tertiary">Percentage of portfolio allocated per trade by default.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col h-full"
              >
                <h2 className="mb-2 text-[24px] font-bold text-text-primary">Connect Exchange</h2>
                <p className="mb-8 text-[15px] text-text-secondary">Securely connect via Read/Trade APIs. We never request withdrawal access.</p>
                
                <div className="flex flex-col gap-4">
                  <select className="h-12 w-full rounded-md border border-bg-border bg-bg-base px-4 text-[14px] text-text-primary outline-none focus:border-accent-blue">
                    <option>Binance</option>
                    <option>Coinbase Advanced</option>
                    <option>Kraken</option>
                  </select>
                  
                  <input 
                    type="password" 
                    placeholder="API Key" 
                    className="h-12 w-full rounded-md border border-bg-border bg-bg-base px-4 text-[14px] text-text-primary outline-none focus:border-accent-blue focus:shadow-[0_0_0_2px_rgba(59,130,246,0.15)] transition-all"
                  />
                  <input 
                    type="password" 
                    placeholder="API Secret" 
                    className="h-12 w-full rounded-md border border-bg-border bg-bg-base px-4 text-[14px] text-text-primary outline-none focus:border-accent-blue focus:shadow-[0_0_0_2px_rgba(59,130,246,0.15)] transition-all"
                  />
                  
                  <div className="mt-4 flex items-center gap-2 rounded-lg border border-accent-green/30 bg-accent-green/10 p-3 text-[12px] text-accent-green">
                    <ShieldCheck className="h-5 w-5" />
                    Keys are encrypted client-side before transmission.
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Action Buttons */}
          <div className="mt-12 flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={handleBack}
              className={step === 1 ? "invisible" : ""}
            >
              Back
            </Button>
            <Button 
              variant="primary" 
              onClick={handleNext}
              className="px-8 shadow-[var(--shadow-glow-blue)]"
            >
              {step === 3 ? "Complete Setup" : "Continue"}
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}

function Users(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
