"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { usePreferencesStore } from "@/store/preferences"
import { useUIStore } from "@/store/ui"
import { formatCurrency } from "@/lib/currency"
import { Skeleton } from "@/components/ui/Skeleton"

interface CategoryData {
  id: string
  name: string
  color: string
  total: number
  percentage: number
}

interface CategoryDonutProps {
  data: CategoryData[]
}

export function CategoryDonut({ data }: CategoryDonutProps) {
  const { currency } = usePreferencesStore()
  const { setHighlightedCategory } = useUIStore()

  const top = data.slice(0, 6)

  return (
    <div className="bg-white dark:bg-dark-900 rounded-2xl p-5 border border-surface-200 dark:border-dark-700">
      <h2 className="text-sm font-semibold text-ink-primary dark:text-ink-inverse mb-4">
        Gastos por categoría
      </h2>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width={140} height={140}>
          <PieChart>
            <Pie
              data={top}
              cx="50%"
              cy="50%"
              innerRadius={44}
              outerRadius={66}
              dataKey="total"
              paddingAngle={2}
              onClick={(entry: CategoryData) =>
                setHighlightedCategory(entry.id)
              }
              className="cursor-pointer"
            >
              {top.map((entry) => (
                <Cell key={entry.id} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              formatter={(v: number | undefined) => formatCurrency(v ?? 0, currency)}
              contentStyle={{
                background: "#fff",
                border: "1px solid var(--color-surface-200)",
                borderRadius: 10,
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-1.5">
          {top.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setHighlightedCategory(cat.id)}
              className="flex items-center gap-2 w-full text-left hover:bg-surface-50 dark:hover:bg-dark-800 rounded-lg px-1 py-0.5"
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: cat.color }}
              />
              <span className="text-xs text-ink-secondary dark:text-ink-muted flex-1 truncate">
                {cat.name}
              </span>
              <span className="text-xs font-medium text-ink-primary dark:text-ink-inverse">
                {cat.percentage.toFixed(0)}%
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function CategoryDonutSkeleton() {
  return (
    <div className="bg-white dark:bg-dark-900 rounded-2xl p-5 border border-surface-200 dark:border-dark-700">
      <Skeleton className="h-4 w-40 mb-4" />
      <div className="flex items-center gap-4">
        <Skeleton className="w-[140px] h-[140px] rounded-full" />
        <div className="flex-1 space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
