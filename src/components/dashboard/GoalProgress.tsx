"use client"

import Link from "next/link"
import { usePreferencesStore } from "@/store/preferences"
import { formatCurrency } from "@/lib/currency"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { Skeleton } from "@/components/ui/Skeleton"
import type { GoalWithProgress } from "@/types"

interface GoalProgressProps {
  goals: GoalWithProgress[]
}

export function GoalProgress({ goals }: GoalProgressProps) {
  const { currency } = usePreferencesStore()

  const activeGoals = goals.filter((g) => g.status === "ACTIVE").slice(0, 4)

  return (
    <div className="bg-white dark:bg-dark-900 rounded-2xl p-5 border border-surface-200 dark:border-dark-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-ink-primary dark:text-ink-inverse">
          Metas de ahorro
        </h2>
        <Link
          href="/goals"
          className="text-xs text-primary-500 hover:text-primary-600 font-medium"
        >
          Ver todas
        </Link>
      </div>
      {activeGoals.length === 0 ? (
        <p className="text-sm text-ink-tertiary text-center py-4">
          No tienes metas activas
        </p>
      ) : (
        <div className="space-y-4">
          {activeGoals.map((goal) => (
            <div key={goal.id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-ink-primary dark:text-ink-inverse truncate max-w-[140px]">
                  {goal.name}
                </span>
                <span className="text-xs text-ink-tertiary">
                  {formatCurrency(goal.currentAmount, currency)} /{" "}
                  {formatCurrency(goal.targetAmount, currency)}
                </span>
              </div>
              <ProgressBar value={goal.progressPercentage} />
              {goal.targetDate && (
                <p className="text-[11px] text-ink-tertiary mt-1">
                  Meta:{" "}
                  {new Date(goal.targetDate).toLocaleDateString("es-PE", {
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function GoalProgressSkeleton() {
  return (
    <div className="bg-white dark:bg-dark-900 rounded-2xl p-5 border border-surface-200 dark:border-dark-700">
      <Skeleton className="h-4 w-32 mb-4" />
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i}>
            <div className="flex justify-between mb-1">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-2 rounded-full w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
