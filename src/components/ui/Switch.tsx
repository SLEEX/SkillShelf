import * as React from "react"
import { cn } from "@/lib/utils"

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void
  checked?: boolean
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <label className={cn("relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full transition-colors", checked ? "bg-primary" : "bg-muted", className)}>
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          ref={ref}
          {...props}
        />
        <span
          className={cn(
            "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform",
            checked ? "translate-x-4.5" : "translate-x-0.5"
          )}
        />
      </label>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }
