import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Blocks } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] w-full flex-col items-center justify-center bg-bg-base px-6 text-center">
      <div className="relative mb-8 flex h-32 w-32 items-center justify-center rounded-full border border-bg-border bg-bg-surface shadow-[0_0_40px_rgba(59,130,246,0.15)]">
        <div className="absolute inset-0 animate-pulse rounded-full border border-accent-blue/50" />
        <Blocks className="h-12 w-12 text-accent-blue" />
      </div>
      
      <h1 className="mb-4 font-sans text-[64px] font-bold leading-none text-text-primary">
        404
      </h1>
      <h2 className="mb-6 text-[24px] font-semibold text-text-secondary">
        Block Not Found
      </h2>
      <p className="mb-10 max-w-[400px] text-[16px] leading-[1.6] text-text-tertiary">
        The trading logic or page you're looking for doesn't exist. It might have been deleted or moved.
      </p>
      
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" className="px-6 py-3">Return Home</Button>
        </Link>
        <Link href="/builder">
          <Button variant="primary" className="px-6 py-3">Go to Builder</Button>
        </Link>
      </div>
    </div>
  )
}
