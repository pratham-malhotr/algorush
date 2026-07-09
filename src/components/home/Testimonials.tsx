"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Star } from "lucide-react"

const TESTIMONIALS = [
  {
    name: "Alex M.",
    role: "Day Trader",
    content: "AlgoText.ai completely changed how I trade. I built a complex RSI strategy in 10 minutes without knowing Python.",
  },
  {
    name: "Sarah J.",
    role: "Crypto Fund Manager",
    content: "The backtesting engine is incredibly fast. Being able to visualize the logic before deploying real capital is a game-changer.",
  },
  {
    name: "David K.",
    role: "Hobbyist",
    content: "I've tried other bot builders, but they were too confusing. AlgoText.ai's visual canvas makes algorithmic trading accessible to anyone.",
  }
]

export function Testimonials() {
  return (
    <section className="bg-bg-base py-24">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-[36px] font-bold text-text-primary">Trusted by Traders</h2>
          <p className="text-[18px] text-text-secondary">Join thousands scaling their portfolios.</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              key={i} 
              className="flex flex-col rounded-[var(--radius-lg)] border border-bg-border bg-bg-surface p-8"
            >
              <div className="mb-4 flex gap-1 text-accent-amber">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mb-6 flex-1 text-[15px] leading-relaxed text-text-secondary">"{t.content}"</p>
              <div>
                <p className="font-semibold text-text-primary">{t.name}</p>
                <p className="text-[13px] text-text-tertiary">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
