import { cn } from "@/lib/utils"

interface ProgressBarProps {
  value: number
  max?: number
  variant?: "default" | "income" | "expense" | "warning"
  size?: "sm" | "md"
  animated?: boolean
  className?: string
  showLabel?: boolean
}

export function ProgressBar({
  value,
  max = 100,
  variant = "default",
  size = "sm",
  animated = true,
  className,
  showLabel,
}: ProgressBarProps) {
  const pct = Math.min(100, (value / max) * 100)

  const barColors = {
    default: pct >= 100 ? "bg-expense-500" : pct >= 80 ? "bg-saving-500" : "bg-primary-500",
    income: "bg-income-500",
    expense: "bg-expense-500",
    warning: "bg-saving-500",
  }

  return (
    <div className={cn("w-full flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex-1 bg-surface-200 dark:bg-dark-600 rounded-full overflow-hidden",
          size === "sm" ? "h-1.5" : "h-2.5"
        )}
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemax={100}
      >
        <div
          className={cn(
            "h-full rounded-full",
            animated && "transition-all duration-700 ease-out",
            barColors[variant] || barColors.default
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-mono text-ink-tertiary w-10 text-right flex-shrink-0">
          {Math.round(pct)}%
        </span>
      )}
    </div>
  )
}
