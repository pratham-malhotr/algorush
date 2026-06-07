import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "live" | "paused" | "draft" | "error"
}

function Badge({ className, variant = "draft", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-[8px] py-[3px] text-[11px] font-semibold uppercase tracking-[0.04em] transition-colors",
        {
          "bg-[#052E16] text-[#22C55E] border-[#166534]": variant === "live",
          "bg-[#1C1917] text-[#F59E0B] border-[#78350F]": variant === "paused",
          "bg-[#1E293B] text-[#94A3B8] border-[#334155]": variant === "draft",
          "bg-[#1C0A0A] text-[#EF4444] border-[#7F1D1D]": variant === "error",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
