import { cn } from "@/lib/utils"
import { formatAmountWithSign, getCurrencySymbol } from "@/lib/currency"
import { TransactionType } from "@prisma/client"

interface CurrencyDisplayProps {
  amount: number
  type?: TransactionType
  currency?: string
  size?: "sm" | "md" | "lg" | "xl"
  showSign?: boolean
  className?: string
}

const sizeMap = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl",
  xl: "text-3xl font-bold",
}

export function CurrencyDisplay({
  amount,
  type,
  currency = "PEN",
  size = "md",
  showSign = true,
  className,
}: CurrencyDisplayProps) {
  const isPositive =
    !type ||
    type === "INCOME" ||
    type === "SAVING" ||
    type === "INVESTMENT"

  const colorClass = type
    ? isPositive
      ? "text-income-600 dark:text-income-400"
      : "text-expense-600 dark:text-expense-400"
    : amount >= 0
    ? "text-income-600 dark:text-income-400"
    : "text-expense-600 dark:text-expense-400"

  const symbol = getCurrencySymbol(currency)
  const absAmount = Math.abs(amount)
  const formatted = new Intl.NumberFormat("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absAmount)

  const prefix =
    showSign && type
      ? isPositive
        ? "+"
        : "−"
      : showSign && amount < 0
      ? "−"
      : ""

  return (
    <span
      className={cn(
        "font-mono tabular-nums font-semibold",
        sizeMap[size],
        colorClass,
        className
      )}
      aria-label={`${symbol} ${formatted} en ${currency}`}
    >
      {prefix}
      {symbol} {formatted}
    </span>
  )
}
