import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-[40px] w-full rounded-[var(--radius-md)] border bg-bg-surface px-[12px] py-0 text-[14px] text-text-primary outline-none transition-all placeholder:text-text-tertiary disabled:cursor-not-allowed disabled:opacity-50",
          error
            ? "border-accent-red focus:border-accent-red focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
            : "border-bg-border focus:border-accent-blue focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
