"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts"
import { usePreferencesStore } from "@/store/preferences"
import { formatCurrency, formatCurrencyCompact } from "@/lib/currency"
import type { MonthlyChartData } from "@/types"

interface CategoryBreakdown {
  id: string
  name: string
  color: string
  icon: string
  income: number
  expense: number
  total: number
}

interface AnalyticsClientProps {
  chartData: MonthlyChartData[]
  categoryBreakdown: CategoryBreakdown[]
}

export function AnalyticsClient({ chartData, categoryBreakdown }: AnalyticsClientProps) {
  const { currency } = usePreferencesStore()
  const fmt = (v: number) => formatCurrencyCompact(v, currency)
  const fmtFull = (v: number) => formatCurrency(v, currency)

  const topExpenses = categoryBreakdown.slice(0, 8)
  const totalExpenses = topExpenses.reduce((s, c) => s + c.expense, 0)

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Income vs Expenses Bar Chart */}
      <div className="bg-white dark:bg-dark-900 rounded-2xl p-5 border border-surface-200 dark:border-dark-700">
        <h2 className="text-sm font-semibold text-ink-primary dark:text-ink-inverse mb-4">
          Ingresos vs Gastos
        </h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-200)" vertical={false} />
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
              formatter={(v: number | undefined, name: string | undefined) => [
                fmtFull(v ?? 0),
                name === "income" ? "Ingresos" : "Gastos",
              ]}
              contentStyle={{
                background: "#fff",
                border: "1px solid var(--color-surface-200)",
                borderRadius: 12,
                fontSize: 12,
              }}
            />
            <Legend
              formatter={(v) => (v === "income" ? "Ingresos" : "Gastos")}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="income" fill="var(--color-income-400)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" fill="var(--color-expense-400)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Net flow line chart */}
        <div className="bg-white dark:bg-dark-900 rounded-2xl p-5 border border-surface-200 dark:border-dark-700">
          <h2 className="text-sm font-semibold text-ink-primary dark:text-ink-inverse mb-4">
            Flujo neto
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-200)" vertical={false} />
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
                formatter={(v: number | undefined) => [fmtFull(v ?? 0), "Neto"]}
                contentStyle={{
                  background: "#fff",
                  border: "1px solid var(--color-surface-200)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="net"
                stroke="var(--color-primary-500)"
                strokeWidth={2.5}
                dot={{ fill: "var(--color-primary-500)", r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie */}
        <div className="bg-white dark:bg-dark-900 rounded-2xl p-5 border border-surface-200 dark:border-dark-700">
          <h2 className="text-sm font-semibold text-ink-primary dark:text-ink-inverse mb-4">
            Distribución de gastos
          </h2>
          <div className="flex gap-4">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={topExpenses} cx="50%" cy="50%" innerRadius={44} outerRadius={72} dataKey="expense" paddingAngle={2}>
                  {topExpenses.map((c) => (
                    <Cell key={c.id} fill={c.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number | undefined) => fmtFull(v ?? 0)} contentStyle={{ background: "#fff", border: "1px solid var(--color-surface-200)", borderRadius: 10, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5 overflow-auto max-h-40">
              {topExpenses.map((c) => (
                <div key={c.id} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                  <span className="text-xs text-ink-secondary flex-1 truncate">{c.icon} {c.name}</span>
                  <span className="text-xs font-medium text-ink-primary dark:text-ink-inverse">
                    {totalExpenses > 0 ? ((c.expense / totalExpenses) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top categories table */}
      <div className="bg-white dark:bg-dark-900 rounded-2xl p-5 border border-surface-200 dark:border-dark-700">
        <h2 className="text-sm font-semibold text-ink-primary dark:text-ink-inverse mb-4">
          Categorías por gasto
        </h2>
        <div className="space-y-2">
          {topExpenses.map((c) => (
            <div key={c.id} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                style={{ background: c.color + "20" }}>
                <span>{c.icon}</span>
              </div>
              <span className="text-sm text-ink-primary dark:text-ink-inverse flex-1">{c.name}</span>
              <div className="flex-1 max-w-[160px] h-2 bg-surface-100 dark:bg-dark-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${totalExpenses > 0 ? (c.expense / totalExpenses) * 100 : 0}%`,
                    background: c.color,
                  }}
                />
              </div>
              <span className="text-sm font-semibold text-ink-primary dark:text-ink-inverse w-24 text-right">
                {fmtFull(c.expense)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
