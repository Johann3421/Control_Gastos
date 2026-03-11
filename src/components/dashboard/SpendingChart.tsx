"use client"

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { usePreferencesStore } from "@/store/preferences"
import { formatCurrency, formatCurrencyCompact } from "@/lib/currency"
import { Skeleton } from "@/components/ui/Skeleton"
import type { MonthlyChartData } from "@/types"

interface SpendingChartProps {
  data: MonthlyChartData[]
}

export function SpendingChart({ data }: SpendingChartProps) {
  const { currency } = usePreferencesStore()

  const fmt = (v: number | string) =>
    typeof v === "number" ? formatCurrencyCompact(v, currency) : v

  return (
    <div className="bg-white dark:bg-dark-900 rounded-2xl p-5 border border-surface-200 dark:border-dark-700">
      <h2 className="text-sm font-semibold text-ink-primary dark:text-ink-inverse mb-4">
        Flujo de 6 meses
      </h2>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-surface-200)"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tick={{ fill: "var(--color-ink-tertiary)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={fmt}
            tick={{ fill: "var(--color-ink-tertiary)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value: number | undefined, name: string | undefined) => [
              formatCurrency(value ?? 0, currency),
              name === "income"
                ? "Ingresos"
                : name === "expenses"
                ? "Gastos"
                : "Neto",
            ]}
            contentStyle={{
              background: "var(--color-white, #fff)",
              border: "1px solid var(--color-surface-200)",
              borderRadius: 12,
              fontSize: 12,
            }}
          />
          <Legend
            formatter={(v) =>
              v === "income" ? "Ingresos" : v === "expenses" ? "Gastos" : "Neto"
            }
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12 }}
          />
          <Bar dataKey="income" fill="var(--color-income-400)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" fill="var(--color-expense-400)" radius={[4, 4, 0, 0]} />
          <Line
            type="monotone"
            dataKey="net"
            stroke="var(--color-primary-500)"
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export function SpendingChartSkeleton() {
  return (
    <div className="bg-white dark:bg-dark-900 rounded-2xl p-5 border border-surface-200 dark:border-dark-700">
      <Skeleton className="h-4 w-32 mb-4" />
      <Skeleton className="h-[220px] rounded-xl" />
    </div>
  )
}
