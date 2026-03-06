"use client"

import { usePathname } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Download, Menu, X } from "lucide-react"
import { useFiltersStore } from "@/store/filters"
import { useUIStore } from "@/store/ui"

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/transactions": "Transacciones",
  "/analytics": "Analíticas",
  "/goals": "Metas de ahorro",
  "/wallets": "Billeteras",
  "/recurring": "Recurrentes",
  "/settings": "Configuración",
}

export function TopBar() {
  const pathname = usePathname()
  const { activeMonth, prevMonth, nextMonth } = useFiltersStore()
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore()

  const title = pageTitles[pathname] ?? "FlowTrack"
  const activeMonthDate =
    activeMonth instanceof Date ? activeMonth : new Date(activeMonth)

  const isCurrentMonth =
    activeMonthDate.getFullYear() === new Date().getFullYear() &&
    activeMonthDate.getMonth() === new Date().getMonth()

  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-dark-900/80 backdrop-blur-sm border-b border-surface-200 dark:border-dark-700 px-4 h-14 flex items-center gap-3">
      {/* Mobile menu toggle */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-surface-100 dark:hover:bg-dark-700 text-ink-secondary"
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Page title */}
      <h1 className="text-base font-semibold text-ink-primary dark:text-ink-inverse flex-1">
        {title}
      </h1>

      {/* Period nav — only on main pages */}
      {["/dashboard", "/transactions", "/analytics", "/budgets"].includes(pathname) && (
        <div className="hidden sm:flex items-center gap-1 bg-surface-100 dark:bg-dark-800 rounded-xl px-1 py-0.5">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-dark-700 text-ink-tertiary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
            <span className="text-sm font-medium text-ink-primary dark:text-ink-inverse min-w-[120px] text-center capitalize">
            {format(activeMonthDate, "MMMM yyyy", { locale: es })}
          </span>
          <button
            onClick={nextMonth}
            disabled={isCurrentMonth}
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-dark-700 text-ink-tertiary transition-colors disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  )
}
