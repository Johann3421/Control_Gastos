"use client"

import Link from "next/link"
import { AlertTriangle, CheckCircle } from "lucide-react"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { Skeleton } from "@/components/ui/Skeleton"
import { formatCurrency } from "@/lib/currency"
import { usePreferencesStore } from "@/store/preferences"
import type { BudgetWithUsage } from "@/types"

interface BudgetAlertsProps {
  budgets: BudgetWithUsage[]
}

export function BudgetAlerts({ budgets }: BudgetAlertsProps) {
  const { currency } = usePreferencesStore()

  const overBudget = budgets.filter((b) => b.percentageUsed >= 100)
  const nearLimit = budgets.filter((b) => b.percentageUsed >= 80 && b.percentageUsed < 100)
  const alertBudgets = [...overBudget, ...nearLimit].slice(0, 4)

  if (alertBudgets.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-900 rounded-2xl p-5 border border-surface-200 dark:border-dark-700">
        <h2 className="text-sm font-semibold text-ink-primary dark:text-ink-inverse mb-4">
          Presupuestos
        </h2>
        <div className="flex flex-col items-center py-4 gap-2">
          <CheckCircle className="w-8 h-8 text-income-500" />
          <p className="text-sm text-ink-tertiary">Todo bajo control</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-dark-900 rounded-2xl p-5 border border-surface-200 dark:border-dark-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-ink-primary dark:text-ink-inverse">
          Presupuestos
        </h2>
        <Link href="/budgets" className="text-xs text-primary-500 hover:text-primary-600 font-medium">
          Ver todos
        </Link>
      </div>
      <div className="space-y-3">
        {alertBudgets.map((b) => (
          <div key={b.id}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                {b.percentageUsed >= 100 && (
                  <AlertTriangle className="w-3.5 h-3.5 text-expense-500" />
                )}
                <span className="text-xs font-medium text-ink-primary dark:text-ink-inverse">
                  {b.category?.name ?? "Sin categoría"}
                </span>
              </div>
              <span className="text-xs text-ink-tertiary">
                {formatCurrency(b.spent, currency)} / {formatCurrency(b.amount, currency)}
              </span>
            </div>
            <ProgressBar value={b.percentageUsed} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function BudgetAlertsSkeleton() {
  return (
    <div className="bg-white dark:bg-dark-900 rounded-2xl p-5 border border-surface-200 dark:border-dark-700">
      <Skeleton className="h-4 w-28 mb-4" />
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i}>
            <div className="flex justify-between mb-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-2 rounded-full w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
