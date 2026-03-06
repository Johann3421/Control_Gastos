"use client"

import { TrendingUp, TrendingDown, PiggyBank, TrendingUpIcon as Investment } from "lucide-react"
import { usePreferencesStore } from "@/store/preferences"
import { formatCurrency } from "@/lib/currency"
import { Skeleton } from "@/components/ui/Skeleton"
import type { DashboardStats } from "@/types"

interface SummaryCardsProps {
  stats: DashboardStats
}

export function SummaryCards({ stats }: SummaryCardsProps) {
  const { currency, balanceVisible } = usePreferencesStore()
  const fmt = (n: number) =>
    balanceVisible ? formatCurrency(n, currency) : "••••"

  const cards = [
    {
      label: "Ingresos",
      value: fmt(stats.monthIncome),
      icon: TrendingUp,
      color: "text-income-600 dark:text-income-400",
      bg: "bg-income-50 dark:bg-income-500/10",
    },
    {
      label: "Gastos",
      value: fmt(stats.monthExpenses),
      icon: TrendingDown,
      color: "text-expense-600 dark:text-expense-400",
      bg: "bg-expense-50 dark:bg-expense-500/10",
    },
    {
      label: "Ahorros",
      value: fmt(stats.monthSavings),
      icon: PiggyBank,
      color: "text-saving-600 dark:text-saving-400",
      bg: "bg-saving-50 dark:bg-saving-500/10",
    },
    {
      label: "Inversiones",
      value: fmt(stats.monthInvestments),
      icon: Investment,
      color: "text-investment-600 dark:text-investment-400",
      bg: "bg-investment-50 dark:bg-investment-500/10",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white dark:bg-dark-900 rounded-2xl p-4 border border-surface-200 dark:border-dark-700"
        >
          <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
            <card.icon className={`w-4.5 h-4.5 ${card.color}`} />
          </div>
          <p className="text-xs text-ink-tertiary mb-0.5">{card.label}</p>
          <p className="text-base font-semibold text-ink-primary dark:text-ink-inverse truncate">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  )
}

export function SummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-dark-900 rounded-2xl p-4 border border-surface-200 dark:border-dark-700"
        >
          <Skeleton className="w-9 h-9 rounded-xl mb-3" />
          <Skeleton className="h-3 w-16 mb-1" />
          <Skeleton className="h-5 w-24" />
        </div>
      ))}
    </div>
  )
}
