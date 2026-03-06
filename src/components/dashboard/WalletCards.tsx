"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { usePreferencesStore } from "@/store/preferences"
import { formatCurrency } from "@/lib/currency"
import { Skeleton } from "@/components/ui/Skeleton"
import type { WalletWithBalance } from "@/types"

interface WalletCardsProps {
  wallets: WalletWithBalance[]
}

const typeLabel: Record<string, string> = {
  CHECKING: "Cuenta corriente",
  SAVINGS: "Ahorro",
  CREDIT: "Crédito",
  CASH: "Efectivo",
  INVESTMENT: "Inversión",
  CRYPTO: "Cripto",
}

const typeGradients: Record<string, string> = {
  CHECKING: "from-primary-500 to-primary-600",
  SAVINGS: "from-saving-500 to-saving-600",
  CREDIT: "from-expense-500 to-expense-600",
  CASH: "from-income-500 to-income-600",
  INVESTMENT: "from-investment-500 to-investment-600",
  CRYPTO: "from-purple-500 to-purple-600",
}

export function WalletCards({ wallets }: WalletCardsProps) {
  const { currency, balanceVisible } = usePreferencesStore()
  const fmt = (n: number) =>
    balanceVisible ? formatCurrency(n, currency) : "••••"

  return (
    <div className="bg-white dark:bg-dark-900 rounded-2xl p-5 border border-surface-200 dark:border-dark-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-ink-primary dark:text-ink-inverse">
          Billeteras
        </h2>
        <Link
          href="/wallets"
          className="text-xs text-primary-500 hover:text-primary-600 font-medium"
        >
          Ver todas
        </Link>
      </div>
      <div className="space-y-2">
        {wallets.slice(0, 5).map((w) => (
          <div
            key={w.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 dark:bg-dark-800"
          >
            <div
              className={`w-9 h-9 rounded-xl bg-gradient-to-br ${typeGradients[w.type] ?? "from-primary-500 to-primary-600"} flex items-center justify-center flex-shrink-0`}
            >
              <span className="text-white text-xs font-bold">
                {w.name[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink-primary dark:text-ink-inverse truncate">
                {w.name}
              </p>
              <p className="text-xs text-ink-tertiary">
                {typeLabel[w.type] ?? w.type}
              </p>
            </div>
            <p
              className={`text-sm font-semibold ${
                w.balance >= 0
                  ? "text-income-600 dark:text-income-400"
                  : "text-expense-600 dark:text-expense-400"
              }`}
            >
              {fmt(w.balance)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function WalletCardsSkeleton() {
  return (
    <div className="bg-white dark:bg-dark-900 rounded-2xl p-5 border border-surface-200 dark:border-dark-700">
      <Skeleton className="h-4 w-24 mb-4" />
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
