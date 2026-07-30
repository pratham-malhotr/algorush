"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Loader2, ShieldCheck, Activity, Box, Cpu } from "lucide-react"
import { useRouter } from "next/navigation"

const VERIFICATION_STEPS = [
  { id: 1, label: "Scanning mempool for transaction...", duration: 2000, icon: Activity },
  { id: 2, label: "Verifying cryptographic signatures...", duration: 2500, icon: Cpu },
  { id: 3, label: "Awaiting blockchain confirmations...", duration: 3000, icon: Box },
  { id: 4, label: "Transaction Confirmed. Upgrading account...", duration: 1500, icon: ShieldCheck },
]

export default function CheckoutVerifyPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState(0)
  const [isComplete, setIsComplete] = React.useState(false)

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout
    
    const runSteps = async () => {
      for (let i = 0; i < VERIFICATION_STEPS.length; i++) {
        setCurrentStep(i)
        await new Promise(resolve => {
          timeoutId = setTimeout(resolve, VERIFICATION_STEPS[i].duration)
        })
      }
      
      setIsComplete(true)
      
      // Final delay before redirect
      timeoutId = setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    }

    runSteps()

    return () => clearTimeout(timeoutId)
  }, [router])

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-blue/10 blur-[150px] pointer-events-none rounded-full" />
      
      <div className="w-full max-w-lg relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-bg-surface border border-bg-border rounded-[2rem] p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Animated Gradient Top Border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-accent-blue to-cyan-400" />
          
          <div className="text-center mb-10">
            <div className="mx-auto w-20 h-20 bg-bg-elevated rounded-full flex items-center justify-center mb-6 shadow-inner border border-bg-border relative">
              <AnimatePresence mode="wait">
                {isComplete ? (
                  <motion.div
                    key="complete"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-green-500"
                  >
                    <CheckCircle2 className="h-10 w-10" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="loading"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="text-accent-blue"
                  >
                    <Loader2 className="h-10 w-10" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              {isComplete ? "Payment Successful" : "Verifying Transaction"}
            </h1>
            <p className="text-text-secondary text-sm">
              {isComplete 
                ? "Your account has been upgraded. Redirecting..." 
                : "Please do not close this window while we verify your crypto payment on the blockchain."}
            </p>
          </div>

          <div className="space-y-6">
            {VERIFICATION_STEPS.map((step, idx) => {
              const isPast = currentStep > idx
              const isCurrent = currentStep === idx && !isComplete
              const StepIcon = step.icon
              
              return (
                <div key={step.id} className="flex items-center gap-4">
                  <div className={`relative flex items-center justify-center h-10 w-10 rounded-full shrink-0 border transition-colors duration-500 ${
                    isPast || isComplete
                      ? "bg-green-500/10 border-green-500/30 text-green-500"
                      : isCurrent
                        ? "bg-accent-blue/10 border-accent-blue/30 text-accent-blue"
                        : "bg-bg-elevated border-bg-border text-text-tertiary"
                  }`}>
                    {isPast || isComplete ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <StepIcon className={`h-5 w-5 ${isCurrent ? 'animate-pulse' : ''}`} />
                    )}
                    
                    {/* Connection Line */}
                    {idx < VERIFICATION_STEPS.length - 1 && (
                      <div className={`absolute top-full left-1/2 -translate-x-1/2 w-[2px] h-6 transition-colors duration-500 ${
                        isPast || isComplete ? "bg-green-500/30" : "bg-bg-border"
                      }`} />
                    )}
                  </div>
                  
                  <div className={`text-sm font-medium transition-colors duration-500 ${
                    isPast || isComplete 
                      ? "text-text-primary" 
                      : isCurrent 
                        ? "text-accent-blue font-bold" 
                        : "text-text-tertiary"
                  }`}>
                    {step.label}
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
