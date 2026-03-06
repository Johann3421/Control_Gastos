"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Search, Filter, X, SlidersHorizontal } from "lucide-react"
import { Input } from "@/components/ui/Input"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { useFiltersStore } from "@/store/filters"

interface FilterBarProps {
  categories: { id: string; name: string; icon: string }[]
  wallets: { id: string; name: string }[]
}

const typeOptions = [
  { id: "EXPENSE", label: "Gastos", variant: "expense" },
  { id: "INCOME", label: "Ingresos", variant: "income" },
  { id: "SAVING", label: "Ahorros", variant: "saving" },
  { id: "INVESTMENT", label: "Inversiones", variant: "investment" },
] as const

export function FilterBar({ categories, wallets }: FilterBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const {
    search,
    type,
    categoryIds,
    walletIds,
    setSearch,
    setType,
    toggleCategory,
    toggleWallet,
    clearFilters,
    getActiveFiltersCount,
  } = useFiltersStore()

  const [showAdvanced, setShowAdvanced] = useState(false)
  const count = getActiveFiltersCount()

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar transacciones..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-dark-900 border border-surface-200 dark:border-dark-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-ink-primary dark:text-ink-inverse placeholder-ink-tertiary"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-tertiary hover:text-ink-secondary"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
            showAdvanced || count > 0
              ? "border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10"
              : "border-surface-200 dark:border-dark-700 text-ink-secondary hover:bg-surface-100 dark:hover:bg-dark-800"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {count > 0 && (
            <span className="w-4 h-4 rounded-full bg-primary-500 text-white text-[10px] flex items-center justify-center">
              {count}
            </span>
          )}
        </button>
        {count > 0 && (
          <button
            onClick={clearFilters}
            className="text-xs text-ink-tertiary hover:text-ink-secondary"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Type filter pills */}
      <div className="flex flex-wrap gap-1.5">
        {typeOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setType(type === opt.id ? null : opt.id)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              type === opt.id
                ? opt.id === "EXPENSE"
                  ? "bg-expense-50 dark:bg-expense-500/10 text-expense-600 dark:text-expense-400 border-expense-300 dark:border-expense-500/30"
                  : opt.id === "INCOME"
                  ? "bg-income-50 dark:bg-income-500/10 text-income-600 dark:text-income-400 border-income-300 dark:border-income-500/30"
                  : opt.id === "SAVING"
                  ? "bg-saving-50 dark:bg-saving-500/10 text-saving-600 dark:text-saving-400 border-saving-300 dark:border-saving-500/30"
                  : "bg-investment-50 dark:bg-investment-500/10 text-investment-600 dark:text-investment-400 border-investment-300 dark:border-investment-500/30"
                : "bg-white dark:bg-dark-900 border-surface-200 dark:border-dark-700 text-ink-secondary hover:bg-surface-50 dark:hover:bg-dark-800"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-surface-50 dark:bg-dark-800 rounded-xl border border-surface-200 dark:border-dark-700">
          <div>
            <p className="text-xs font-medium text-ink-secondary mb-2">Categorías</p>
            <div className="flex flex-wrap gap-1.5">
              {categories.slice(0, 10).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`px-2 py-1 rounded-full text-xs border transition-colors ${
                    categoryIds.includes(cat.id)
                      ? "bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 border-primary-300 dark:border-primary-500/30"
                      : "bg-white dark:bg-dark-900 border-surface-200 dark:border-dark-700 text-ink-secondary"
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-ink-secondary mb-2">Billeteras</p>
            <div className="flex flex-wrap gap-1.5">
              {wallets.map((w) => (
                <button
                  key={w.id}
                  onClick={() => toggleWallet(w.id)}
                  className={`px-2 py-1 rounded-full text-xs border transition-colors ${
                    walletIds.includes(w.id)
                      ? "bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 border-primary-300 dark:border-primary-500/30"
                      : "bg-white dark:bg-dark-900 border-surface-200 dark:border-dark-700 text-ink-secondary"
                  }`}
                >
                  {w.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
