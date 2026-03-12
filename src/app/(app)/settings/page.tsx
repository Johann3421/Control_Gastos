"use client"

import { useState, useEffect } from "react"
import { usePreferencesStore } from "@/store/preferences"
import { Sun, Moon, Monitor, Check } from "lucide-react"
import { CategoriesClient } from "@/components/settings/CategoriesClient"

type CategoryType = "EXPENSE" | "INCOME" | "SAVING" | "INVESTMENT" | "TRANSFER"
interface CategoryRow {
  id: string; name: string; type: CategoryType
  icon: string; color: string; isDefault: boolean
}

const currencies = [
  { code: "PEN", label: "Sol peruano (S/)" },
  { code: "USD", label: "Dólar americano ($)" },
  { code: "EUR", label: "Euro (€)" },
  { code: "BRL", label: "Real brasileño (R$)" },
  { code: "MXN", label: "Peso mexicano (MX$)" },
  { code: "CLP", label: "Peso chileno (CL$)" },
  { code: "COP", label: "Peso colombiano (CO$)" },
  { code: "ARS", label: "Peso argentino (AR$)" },
  { code: "GBP", label: "Libra esterlina (£)" },
]

const dateFormats = [
  { value: "dd/MM/yyyy", label: "DD/MM/AAAA" },
  { value: "MM/dd/yyyy", label: "MM/DD/AAAA" },
  { value: "yyyy-MM-dd", label: "AAAA-MM-DD" },
]

const themeOptions = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Oscuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
] as const

export default function SettingsPage() {
  const {
    currency,
    setCurrency,
    theme,
    setTheme,
    dateFormat,
    setDateFormat,
    monthStart,
    setMonthStart,
    balanceVisible,
    setBalanceVisible,
  } = usePreferencesStore()

  const [categories, setCategories] = useState<CategoryRow[]>([])

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => { if (d.categories) setCategories(d.categories as CategoryRow[]) })
      .catch(() => {})
  }, [])

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Appearance */}
      <section className="bg-white dark:bg-dark-900 rounded-2xl p-5 border border-surface-200 dark:border-dark-700">
        <h2 className="text-sm font-semibold text-ink-primary dark:text-ink-inverse mb-4">
          Apariencia
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {themeOptions.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-medium transition-colors ${
                theme === value
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400"
                  : "border-surface-200 dark:border-dark-700 text-ink-secondary hover:bg-surface-50 dark:hover:bg-dark-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {theme === value && <Check className="w-3.5 h-3.5 ml-auto" />}
            </button>
          ))}
        </div>
      </section>

      {/* Currency & Locale */}
      <section className="bg-white dark:bg-dark-900 rounded-2xl p-5 border border-surface-200 dark:border-dark-700">
        <h2 className="text-sm font-semibold text-ink-primary dark:text-ink-inverse mb-4">
          Moneda y formato
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink-secondary dark:text-ink-muted mb-1.5">
              Moneda por defecto
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
              className="w-full px-3 py-2 text-sm rounded-xl bg-surface-50 dark:bg-dark-800 border border-surface-200 dark:border-dark-700 text-ink-primary dark:text-ink-inverse focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-secondary dark:text-ink-muted mb-1.5">
              Formato de fecha
            </label>
            <select
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl bg-surface-50 dark:bg-dark-800 border border-surface-200 dark:border-dark-700 text-ink-primary dark:text-ink-inverse focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {dateFormats.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-secondary dark:text-ink-muted mb-1.5">
              Inicio del mes (día)
            </label>
            <select
              value={monthStart}
              onChange={(e) => setMonthStart(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm rounded-xl bg-surface-50 dark:bg-dark-800 border border-surface-200 dark:border-dark-700 text-ink-primary dark:text-ink-inverse focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {[1, 5, 10, 15, 20, 25].map((d) => (
                <option key={d} value={d}>
                  Día {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="bg-white dark:bg-dark-900 rounded-2xl p-5 border border-surface-200 dark:border-dark-700">
        <h2 className="text-sm font-semibold text-ink-primary dark:text-ink-inverse mb-4">
          Privacidad
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink-primary dark:text-ink-inverse">
              Mostrar saldo
            </p>
            <p className="text-xs text-ink-tertiary mt-0.5">
              Oculta todos los montos visualmente
            </p>
          </div>
          <button
            onClick={() => setBalanceVisible(!balanceVisible)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              balanceVisible ? "bg-primary-500" : "bg-surface-300 dark:bg-dark-600"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                balanceVisible ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </section>

      {/* Categories */}
      <CategoriesClient initialCategories={categories} />
    </div>
  )
}
