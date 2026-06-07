import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-accent-blue text-white rounded-[var(--radius-md)] px-[20px] py-[10px] font-semibold text-[14px] hover:bg-accent-blue-dim hover:shadow-[var(--shadow-glow-blue)] active:scale-[0.97]":
              variant === "primary",
            "bg-transparent border border-bg-border text-text-primary rounded-[var(--radius-md)] px-[20px] py-[10px] font-semibold text-[14px] hover:bg-white/5":
              variant === "secondary",
            "bg-transparent border border-accent-red text-accent-red rounded-[var(--radius-md)] px-[20px] py-[10px] font-semibold text-[14px] hover:bg-accent-red/10":
              variant === "danger",
            "bg-transparent border-none text-text-secondary rounded-[var(--radius-md)] px-[20px] py-[10px] font-semibold text-[14px] hover:text-text-primary hover:bg-white/5":
              variant === "ghost",
            "bg-transparent border-none text-text-secondary rounded-[var(--radius-sm)] w-[32px] h-[32px] hover:text-text-primary hover:bg-white/5 p-0":
              variant === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
