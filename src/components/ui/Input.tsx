import { cn } from "@/lib/utils"
import { forwardRef, InputHTMLAttributes } from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-ink-secondary dark:text-ink-tertiary">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full py-2.5 bg-surface-50 dark:bg-dark-700 border rounded-xl text-sm text-ink-primary dark:text-ink-inverse placeholder-ink-tertiary focus:outline-none transition-all",
            icon ? "pl-9 pr-4" : "px-4",
            error
              ? "border-expense-400 focus:border-expense-500"
              : "border-surface-300 dark:border-dark-500 focus:border-primary-500",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-expense-500">{error}</p>}
    </div>
  )
)
Input.displayName = "Input"
