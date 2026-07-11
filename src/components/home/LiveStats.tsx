"use client"

import * as React from "react"
import { useInView } from "framer-motion"

const STATS = [
  { value: 2400000000, label: "Volume Traded", prefix: "$", suffix: "B+", divisor: 1000000000, decimals: 1 },
  { value: 48000, label: "Strategies Created", prefix: "", suffix: "+", divisor: 1, decimals: 0 },
  { value: 12800, label: "Active Traders", prefix: "", suffix: "", divisor: 1, decimals: 0 },
  { value: 0.05, label: "Flat Fee", prefix: "", suffix: "%", divisor: 1, decimals: 2 },
]

function CountUp({ value, divisor, decimals, inView }: { value: number; divisor: number; decimals: number; inView: boolean }) {
  const [current, setCurrent] = React.useState(0)
  
  React.useEffect(() => {
    if (!inView) return
    
    const target = value / divisor
    const duration = 2500 // 2.5s (slightly slower)
    const steps = 60
    const stepTime = duration / steps
    let currentStep = 0
    
    const timer = setInterval(() => {
      currentStep++
      const progress = currentStep / steps
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      
      setCurrent(target * ease)
      
      if (currentStep >= steps) {
        clearInterval(timer)
        setCurrent(target)
      }
    }, stepTime)
    
    return () => clearInterval(timer)
  }, [value, divisor, inView])
  
  return <span>{current.toFixed(decimals)}</span>
}

export function LiveStats() {
  const ref = React.useRef(null)
  // Ensure 40% of the component is visible before triggering the animation
  const isInView = useInView(ref, { once: true, amount: 0.4 })

  return (
    <div 
      ref={ref}
      className="w-full border-y border-bg-border bg-bg-surface py-10"
    >
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-8 px-6 sm:flex-row sm:gap-4">
        {STATS.map((stat, i) => (
          <div key={i} className="flex flex-col items-center text-center sm:items-start sm:text-left">
            <div className="font-sans text-[28px] font-bold text-text-primary">
              {stat.prefix}
              <CountUp value={stat.value} divisor={stat.divisor} decimals={stat.decimals} inView={isInView} />
              {stat.suffix}
            </div>
            <div className="mt-1 text-[13px] text-text-secondary">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
