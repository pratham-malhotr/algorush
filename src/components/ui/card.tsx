import * as React from "react"
import { cn } from "@/lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-[var(--radius-lg)] border border-bg-border bg-bg-surface p-[20px] sm:p-[24px] shadow-[var(--shadow-card)] transition-all",
        hoverable && "hover:border-accent-blue/40 hover:scale-[1.005]",
        className
      )}
      {...props}
    />
  )
)
Card.displayName = "Card"

export { Card }
