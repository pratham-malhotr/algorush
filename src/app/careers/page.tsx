import * as React from "react"
import Link from "next/link"
import { ArrowUpRight, Code, Cpu, LineChart, MessageSquare } from "lucide-react"
import { BackButton } from "@/components/ui/BackButton"

const JOBS = [
  { id: 1, title: "Senior Rust Engineer", team: "Execution Engine", location: "Remote (Global)", icon: Code },
  { id: 2, title: "Quantitative Researcher", team: "Data Science", location: "New York / Remote", icon: LineChart },
  { id: 3, title: "AI/ML Engineer (LLMs)", team: "AI Labs", location: "San Francisco / Remote", icon: Cpu },
  { id: 4, title: "Community Manager", team: "Growth", location: "Remote (EMEA)", icon: MessageSquare },
]

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-bg-primary pt-24 pb-32">
      <section className="mx-auto max-w-[800px] px-6 py-20 text-center">
        <div className="flex justify-start"><BackButton /></div>
        <h1 className="mb-6 text-5xl font-bold text-text-primary md:text-7xl tracking-tight">
          Join the <span className="text-accent-blue">Revolution.</span>
        </h1>
        <p className="text-xl text-text-secondary leading-relaxed mb-10">
          We are a team of engineers, quants, and designers building the future of automated trading. Join us in making Wall Street technology available to Main Street.
        </p>
      </section>

      <section className="mx-auto max-w-[1000px] px-6 py-12">
        <h2 className="mb-8 text-3xl font-bold text-text-primary">Open Roles</h2>
        <div className="flex flex-col gap-4">
          {JOBS.map((job) => (
            <div key={job.id} className="group flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border border-bg-border bg-bg-surface p-6 transition-colors hover:border-accent-blue hover:bg-bg-elevated cursor-pointer">
              <div className="flex items-center gap-4 mb-4 sm:mb-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-bg-primary border border-bg-border">
                  <job.icon className="h-6 w-6 text-text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary group-hover:text-accent-blue transition-colors">{job.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <span>{job.team}</span>
                    <span className="h-1 w-1 rounded-full bg-text-tertiary" />
                    <span>{job.location}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-accent-blue font-semibold">
                Apply Now <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1000px] px-6 py-20">
        <h2 className="mb-8 text-3xl font-bold text-text-primary text-center">Perks & Benefits</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {["Remote First", "Crypto Salary Options", "Unlimited PTO", "Health & Wellness", "Home Office Stipend", "Learning Budget", "Annual Retreats", "Token Equity"].map((perk, i) => (
            <div key={i} className="rounded-xl border border-bg-border bg-bg-surface p-4 text-center text-text-primary font-medium">
              {perk}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
