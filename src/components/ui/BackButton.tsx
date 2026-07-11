"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export function BackButton() {
  const router = useRouter()
  
  return (
    <button 
      onClick={() => router.back()}
      className="group mb-8 flex h-10 w-10 items-center justify-center rounded-full border border-bg-border bg-bg-surface text-text-secondary transition-all hover:border-text-secondary hover:text-text-primary hover:bg-bg-elevated"
      aria-label="Go Back"
    >
      <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
    </button>
  )
}
