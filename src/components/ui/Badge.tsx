import { cn } from "@/lib/utils"

interface BadgeProps {
  children: React.ReactNode
  variant?: "default" | "income" | "expense" | "saving" | "investment" | "neutral"
  size?: "sm" | "md"
  className?: string
}

const variants = {
  default: "bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400",
  income: "bg-income-50 dark:bg-income-500/10 text-income-600 dark:text-income-400",
  expense: "bg-expense-50 dark:bg-expense-500/10 text-expense-600 dark:text-expense-400",
  saving: "bg-saving-50 dark:bg-saving-500/10 text-saving-600 dark:text-saving-400",
  investment: "bg-investment-50 dark:bg-investment-500/10 text-investment-600 dark:text-investment-400",
  neutral: "bg-surface-100 dark:bg-dark-700 text-ink-secondary",
}

const sizes = {
  sm: "px-1.5 py-0.5 text-[10px]",
  md: "px-2.5 py-0.5 text-xs",
}

export function Badge({ children, variant = "default", size = "md", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  )
}
