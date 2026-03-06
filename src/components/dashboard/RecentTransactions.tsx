"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { usePreferencesStore } from "@/store/preferences"
import { formatCurrency } from "@/lib/currency"
import { Badge } from "@/components/ui/Badge"
import { Skeleton } from "@/components/ui/Skeleton"
import type { TransactionWithRelations } from "@/types"

interface RecentTransactionsProps {
  transactions: TransactionWithRelations[]
}

const typeVariant: Record<string, "income" | "expense" | "saving" | "investment" | "default"> = {
  INCOME: "income",
  EXPENSE: "expense",
  SAVING: "saving",
  INVESTMENT: "investment",
  TRANSFER: "default",
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const { currency } = usePreferencesStore()

  return (
    <div className="bg-white dark:bg-dark-900 rounded-2xl p-5 border border-surface-200 dark:border-dark-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-ink-primary dark:text-ink-inverse">
          Transacciones recientes
        </h2>
        <Link
          href="/transactions"
          className="text-xs text-primary-500 hover:text-primary-600 font-medium"
        >
          Ver todas
        </Link>
      </div>
      {transactions.length === 0 ? (
        <p className="text-sm text-ink-tertiary text-center py-6">
          No hay transacciones aún
        </p>
      ) : (
        <div className="space-y-1">
          {transactions.slice(0, 8).map((tx) => (
            <div
              key={tx.id}
              className="flex items-center gap-3 py-2 px-2 rounded-xl hover:bg-surface-50 dark:hover:bg-dark-800 transition-colors"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                style={{ background: tx.category?.color + "20" }}
              >
                <span>{tx.category?.icon ?? "💳"}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink-primary dark:text-ink-inverse truncate">
                  {tx.description}
                </p>
                <p className="text-xs text-ink-tertiary">
                  {formatDistanceToNow(new Date(tx.date), {
                    addSuffix: true,
                    locale: es,
                  })}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p
                  className={`text-sm font-semibold ${
                    tx.type === "INCOME"
                      ? "text-income-600 dark:text-income-400"
                      : tx.type === "EXPENSE"
                      ? "text-expense-600 dark:text-expense-400"
                      : tx.type === "SAVING"
                      ? "text-saving-600 dark:text-saving-400"
                      : "text-investment-600 dark:text-investment-400"
                  }`}
                >
                  {tx.type === "INCOME" ? "+" : "-"}
                  {formatCurrency(tx.amount, currency)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function RecentTransactionsSkeleton() {
  return (
    <div className="bg-white dark:bg-dark-900 rounded-2xl p-5 border border-surface-200 dark:border-dark-700">
      <Skeleton className="h-4 w-40 mb-4" />
      <div className="space-y-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-2">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-3.5 w-36 mb-1.5" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}
