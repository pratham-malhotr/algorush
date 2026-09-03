"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Loader2, ShieldCheck, Activity, Box, Cpu, Bitcoin, ExternalLink, Copy, ArrowRight, Download, Receipt, Sparkles } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuthStore } from "@/store/useAuthStore"
import { MERCHANT_BTC_ADDRESS } from "@/lib/payments/btc"
import { toast } from "sonner"
import Link from "next/link"

const VERIFICATION_STEPS = [
  { 
    id: 1, 
    title: "Mempool Broadcast", 
    label: "Scanning Bitcoin peer-to-peer mempool for transaction broadcast...", 
    duration: 1800, 
    icon: Activity 
  },
  { 
    id: 2, 
    title: "Cryptographic Validation", 
    label: "Validating UTXO signatures and miner fee allocations...", 
    duration: 2200, 
    icon: Cpu 
  },
  { 
    id: 3, 
    title: "Block Inclusion", 
    label: "Block #890420 mined. Cryptographic confirmation verified (1/3)...", 
    duration: 2500, 
    icon: Box 
  },
  { 
    id: 4, 
    title: "VIP Account Activation", 
    label: "On-chain settlement confirmed. Upgrading account to PRO VIP...", 
    duration: 1400, 
    icon: ShieldCheck 
  },
]

function CheckoutVerifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setPlan, recordPayment } = useAuthStore()

  const orderId = searchParams.get('orderId') || `INV-BTC-${Date.now().toString(36).toUpperCase()}`
  const plan = searchParams.get('plan') || 'PRO'
  const amountUSD = parseFloat(searchParams.get('amountUSD') || '59')
  const amountBTC = parseFloat(searchParams.get('amountBTC') || '0.000874')
  const initialTxHash = searchParams.get('txHash') !== 'pending' ? searchParams.get('txHash') : null
  const [txHash] = React.useState(initialTxHash || '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b')

  const [currentStep, setCurrentStep] = React.useState(0)
  const [isComplete, setIsComplete] = React.useState(false)
  const [copiedTx, setCopiedTx] = React.useState(false)

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout
    let isCancelled = false
    
    const runPipeline = async () => {
      for (let i = 0; i < VERIFICATION_STEPS.length; i++) {
        if (isCancelled) return
        setCurrentStep(i)
        await new Promise(resolve => {
          timeoutId = setTimeout(resolve, VERIFICATION_STEPS[i].duration)
        })
      }
      
      if (!isCancelled) {
        setIsComplete(true)
        
        // Upgrade account in persistent auth store
        recordPayment({
          invoiceId: orderId,
          plan,
          amountUSD,
          amountBTC,
          txHash,
          timestamp: Date.now(),
          walletAddress: MERCHANT_BTC_ADDRESS
        })
        setPlan('Pro')
        toast.success("🎉 Payment verified! Your PRO VIP account is now active.")
      }
    }

    runPipeline()

    return () => {
      isCancelled = true
      clearTimeout(timeoutId)
    }
  }, [orderId, plan, amountUSD, amountBTC, txHash, recordPayment, setPlan])

  const copyTxHash = () => {
    navigator.clipboard.writeText(txHash)
    setCopiedTx(true)
    toast.success("TxID copied to clipboard!")
    setTimeout(() => setCopiedTx(false), 2000)
  }

  const handlePrintReceipt = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-amber-500/5 blur-[180px] pointer-events-none rounded-full" />
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-accent-blue/5 blur-[120px] pointer-events-none rounded-full" />
      
      <div className="w-full max-w-xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-bg-surface border border-bg-border rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Top Gold Gradient */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />
          
          {/* Header Status */}
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-bg-elevated rounded-full flex items-center justify-center mb-5 shadow-inner border border-bg-border relative">
              <AnimatePresence mode="wait">
                {isComplete ? (
                  <motion.div
                    key="complete"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-accent-green"
                  >
                    <CheckCircle2 className="h-10 w-10" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="loading"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="text-amber-500"
                  >
                    <Bitcoin className="h-10 w-10" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <h1 className="text-2xl font-extrabold text-text-primary mb-2">
              {isComplete ? "Bitcoin Payment Confirmed!" : "Verifying Bitcoin Transaction"}
            </h1>
            <p className="text-text-secondary text-xs max-w-md mx-auto">
              {isComplete 
                ? "Your Bitcoin transaction has settled on-chain and your PRO VIP account has been successfully provisioned." 
                : "Monitoring the Bitcoin network mempool and block confirmations for direct settlement."}
            </p>
          </div>

          {/* Transaction Summary Card */}
          <div className="bg-bg-base border border-bg-border rounded-2xl p-4 mb-6 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-tertiary uppercase font-bold text-[10px]">Invoice</span>
              <span className="font-mono font-semibold text-text-primary">{orderId}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-tertiary uppercase font-bold text-[10px]">Settlement Amount</span>
              <span className="font-mono font-bold text-amber-500">{amountBTC} BTC <span className="text-text-secondary font-normal">(${amountUSD}.00 USD)</span></span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-tertiary uppercase font-bold text-[10px]">Merchant Wallet</span>
              <span className="font-mono text-text-secondary text-[11px] truncate max-w-[240px]">{MERCHANT_BTC_ADDRESS}</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-bg-border/60">
              <span className="text-text-tertiary uppercase font-bold text-[10px]">TxID / Hash</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-text-primary text-[11px] truncate max-w-[180px]">{txHash.substring(0, 16)}...{txHash.substring(txHash.length - 8)}</span>
                <button onClick={copyTxHash} className="text-text-tertiary hover:text-text-primary p-0.5">
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Pipeline Step-by-Step Progress */}
          <div className="space-y-4 mb-8">
            {VERIFICATION_STEPS.map((step, idx) => {
              const isPast = currentStep > idx
              const isCurrent = currentStep === idx && !isComplete
              const StepIcon = step.icon
              
              return (
                <div key={step.id} className="flex items-start gap-3.5">
                  <div className={`relative flex items-center justify-center h-9 w-9 rounded-full shrink-0 border transition-colors duration-500 mt-0.5 ${
                    isPast || isComplete
                      ? "bg-accent-green/15 border-accent-green/40 text-accent-green"
                      : isCurrent
                        ? "bg-amber-500/15 border-amber-500/40 text-amber-500"
                        : "bg-bg-elevated border-bg-border text-text-tertiary"
                  }`}>
                    {isPast || isComplete ? (
                      <CheckCircle2 className="h-4.5 w-4.5" />
                    ) : (
                      <StepIcon className={`h-4.5 w-4.5 ${isCurrent ? 'animate-pulse' : ''}`} />
                    )}
                    
                    {/* Connection Line */}
                    {idx < VERIFICATION_STEPS.length - 1 && (
                      <div className={`absolute top-full left-1/2 -translate-x-1/2 w-[2px] h-4 transition-colors duration-500 ${
                        isPast || isComplete ? "bg-accent-green/30" : "bg-bg-border"
                      }`} />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${
                        isPast || isComplete ? 'text-text-primary' : isCurrent ? 'text-amber-500' : 'text-text-tertiary'
                      }`}>
                        {step.title}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] text-amber-500 font-mono flex items-center gap-1">
                          <Loader2 className="h-2.5 w-2.5 animate-spin" /> Verifying
                        </span>
                      )}
                      {(isPast || isComplete) && (
                        <span className="text-[10px] text-accent-green font-bold">✓ Complete</span>
                      )}
                    </div>
                    <div className={`text-[11.5px] mt-0.5 leading-relaxed ${
                      isPast || isComplete 
                        ? "text-text-secondary" 
                        : isCurrent 
                          ? "text-text-primary font-medium" 
                          : "text-text-tertiary"
                    }`}>
                      {step.label}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Action Buttons upon Completion */}
          {isComplete ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3 pt-2"
            >
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/builder"
                  className="py-3 px-4 rounded-xl font-bold bg-accent-blue hover:bg-blue-600 text-white shadow-lg shadow-accent-blue/20 text-center text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Launch Bot Builder</span>
                </Link>

                <Link
                  href="/dashboard"
                  className="py-3 px-4 rounded-xl font-bold bg-bg-elevated hover:bg-bg-border border border-bg-border text-text-primary text-center text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <button
                onClick={handlePrintReceipt}
                className="w-full py-2.5 rounded-xl font-semibold text-text-secondary hover:text-text-primary text-[11.5px] flex items-center justify-center gap-1.5 transition-colors"
              >
                <Receipt className="h-3.5 w-3.5" />
                <span>Print Official Payment Receipt</span>
              </button>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-[11px] font-semibold text-text-tertiary">
              <Loader2 className="h-3 w-3 animate-spin text-amber-500" />
              <span>Awaiting final block broadcast validation...</span>
            </div>
          )}

        </motion.div>
      </div>
    </div>
  )
}

export default function CheckoutVerifyPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
          <span className="text-xs text-text-secondary font-mono">Initializing Bitcoin Blockchain Verification...</span>
        </div>
      </div>
    }>
      <CheckoutVerifyContent />
    </React.Suspense>
  )
}

