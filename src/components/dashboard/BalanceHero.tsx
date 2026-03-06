"use client"

import { Eye, EyeOff } from "lucide-react"
import { usePreferencesStore } from "@/store/preferences"
import { formatCurrency } from "@/lib/currency"
import { Skeleton } from "@/components/ui/Skeleton"
import type { DashboardStats } from "@/types"

interface BalanceHeroProps {
  stats: DashboardStats
}

export function BalanceHero({ stats }: BalanceHeroProps) {
  const { currency, balanceVisible, setBalanceVisible } = usePreferencesStore()

  const fmt = (n: number) =>
    balanceVisible ? formatCurrency(n, currency) : "••••••"

  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-500 p-6 text-white">
      <div className="flex items-start justify-between mb-1">
        <span className="text-sm font-medium text-white/70">Saldo total</span>
        <button
          onClick={() => setBalanceVisible(!balanceVisible)}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          {balanceVisible ? (
            <EyeOff className="w-4 h-4 text-white/70" />
          ) : (
            <Eye className="w-4 h-4 text-white/70" />
          )}
        </button>
      </div>
      <p className="text-3xl font-bold tracking-tight mb-4">
        {fmt(stats.totalBalance)}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/10 rounded-xl px-3 py-2">
          <p className="text-xs text-white/60 mb-0.5">Ingresos del mes</p>
          <p className="text-base font-semibold">
            {fmt(stats.monthIncome)}
          </p>
        </div>
        <div className="bg-white/10 rounded-xl px-3 py-2">
          <p className="text-xs text-white/60 mb-0.5">Gastos del mes</p>
          <p className="text-base font-semibold">
            {fmt(stats.monthExpenses)}
          </p>
        </div>
      </div>
    </div>
  )
}

export function BalanceHeroSkeleton() {
  return (
    <div className="rounded-2xl bg-surface-200 dark:bg-dark-800 p-6">
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-9 w-40 mb-4" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-14 rounded-xl" />
        <Skeleton className="h-14 rounded-xl" />
      </div>
    </div>
  )
}
