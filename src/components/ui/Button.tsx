import { cn } from "@/lib/utils"
import { forwardRef, ButtonHTMLAttributes } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline"
  size?: "xs" | "sm" | "md" | "lg"
  loading?: boolean
}

const variants = {
  primary: "bg-primary-500 hover:bg-primary-600 text-white shadow-sm",
  secondary: "bg-surface-100 dark:bg-dark-700 hover:bg-surface-200 dark:hover:bg-dark-600 text-ink-primary dark:text-ink-inverse",
  ghost: "hover:bg-surface-100 dark:hover:bg-dark-700 text-ink-secondary hover:text-ink-primary dark:hover:text-ink-inverse",
  danger: "bg-expense-500 hover:bg-expense-600 text-white shadow-sm",
  outline: "border border-surface-300 dark:border-dark-500 hover:bg-surface-50 dark:hover:bg-dark-700 text-ink-primary dark:text-ink-inverse",
}

const sizes = {
  xs: "px-2 py-1 text-xs rounded-lg gap-1",
  sm: "px-3 py-1.5 text-sm rounded-xl gap-1.5",
  md: "px-4 py-2 text-sm rounded-xl gap-2",
  lg: "px-5 py-2.5 text-base rounded-xl gap-2",
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
)
Button.displayName = "Button"
