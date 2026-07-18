import * as React from "react"
import Link from "next/link"
import { ArrowUpRight, Code, Cpu, LineChart, MessageSquare, Globe, Zap, Heart, Shield } from "lucide-react"
import { BackButton } from "@/components/ui/BackButton"

const JOBS = [
  { id: 1, title: "Senior Rust Engineer", team: "Execution Engine", location: "Remote (Global)", icon: Code, type: "Full-time" },
  { id: 2, title: "Quantitative Researcher", team: "Data Science", location: "New York / Remote", icon: LineChart, type: "Full-time" },
  { id: 3, title: "AI/ML Engineer (LLMs)", team: "AI Labs", location: "San Francisco / Remote", icon: Cpu, type: "Full-time" },
  { id: 4, title: "Community Manager", team: "Growth", location: "Remote (EMEA)", icon: MessageSquare, type: "Contract" },
]

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-white pt-2 pb-32">
      
      {/* Navigation Bar Area */}
      <div className="mx-auto max-w-[1200px] px-6 py-8">
        <BackButton />
      </div>

      {/* Hero Section */}
      <section className="mx-auto max-w-[900px] px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 mb-8 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          We are actively hiring
        </div>
        <h1 className="mb-6 text-5xl font-extrabold text-gray-900 md:text-7xl tracking-tight">
          Build the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">future</span> of finance.
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed mb-10 max-w-2xl mx-auto">
          Join a world-class team of engineers, quants, and designers working to make institutional-grade algorithmic trading accessible to everyone.
        </p>
      </section>

      {/* Values Bento Grid */}
      <section className="mx-auto max-w-[1200px] px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How we operate</h2>
          <p className="text-gray-600 max-w-xl mx-auto">Our culture is built on autonomy, speed, and an obsession with engineering excellence.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-2 rounded-3xl border border-gray-200 bg-gray-50 p-10 flex flex-col justify-between hover:shadow-xl hover:border-blue-200 transition-all">
            <div>
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Ship Fast. Iterate Faster.</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                We don't do red tape. We believe in small, autonomous teams that can make decisions quickly and push code to production multiple times a day.
              </p>
            </div>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-gray-50 p-10 flex flex-col justify-between hover:shadow-xl hover:border-emerald-200 transition-all">
            <div>
              <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-6">
                <Globe className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Remote First</h3>
              <p className="text-gray-600 leading-relaxed">
                Hire the best talent, regardless of geography. Asynchronous communication is our default.
              </p>
            </div>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-gray-50 p-10 flex flex-col justify-between hover:shadow-xl hover:border-purple-200 transition-all">
            <div>
              <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Extreme Ownership</h3>
              <p className="text-gray-600 leading-relaxed">
                You build it, you run it. We expect everyone to take pride in the quality of their systems.
              </p>
            </div>
          </div>
          <div className="col-span-1 md:col-span-2 rounded-3xl border border-gray-200 bg-gray-50 p-10 flex flex-col justify-between hover:shadow-xl hover:border-amber-200 transition-all">
            <div>
              <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center mb-6">
                <Heart className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Care Deeply</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                We are building tools that manage people's money. Empathy for our users and obsessive attention to detail are not optional.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Open Roles */}
      <section className="mx-auto max-w-[900px] px-6 py-20">
        <h2 className="mb-10 text-3xl font-bold text-gray-900 text-center">Open Roles</h2>
        <div className="flex flex-col gap-4">
          {JOBS.map((job) => (
            <div key={job.id} className="group flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:shadow-xl hover:border-blue-300 hover:ring-1 hover:ring-blue-300 cursor-pointer">
              <div className="flex items-center gap-5 mb-4 sm:mb-0">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-50 border border-gray-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                  <job.icon className="h-6 w-6 text-gray-600 group-hover:text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">{job.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                    <span className="bg-gray-100 px-2 py-0.5 rounded-md">{job.team}</span>
                    <span>{job.location}</span>
                    <span className="hidden sm:inline">&bull;</span>
                    <span className="hidden sm:inline">{job.type}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-blue-600 font-bold group-hover:translate-x-1 transition-transform">
                Apply Now <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-500">Don't see a perfect fit? Send your resume to <a href="mailto:careers@algotext.ai" className="text-blue-600 font-medium hover:underline">careers@algotext.ai</a></p>
        </div>
      </section>

    </div>
  )
}
