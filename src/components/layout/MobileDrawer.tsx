"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart3,
  Target,
  Wallet,
  CalendarClock,
  Settings,
  Zap,
  LogOut,
  Sun,
  Moon,
  Monitor,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useUIStore } from "@/store/ui"
import { usePreferencesStore } from "@/store/preferences"
import { useFiltersStore } from "@/store/filters"
import { format } from "date-fns"
import { es } from "date-fns/locale"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/transactions", icon: ArrowLeftRight, label: "Transacciones" },
  { href: "/analytics", icon: BarChart3, label: "Analíticas" },
  { href: "/goals", icon: Target, label: "Metas" },
  { href: "/wallets", icon: Wallet, label: "Billeteras" },
  { href: "/recurring", icon: CalendarClock, label: "Recurrentes" },
  { href: "/settings", icon: Settings, label: "Configuración" },
]

export function MobileDrawer() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { mobileMenuOpen, setMobileMenuOpen, openQuickAdd } = useUIStore()
  const { theme, setTheme } = usePreferencesStore()
  const { activeMonth, prevMonth, nextMonth } = useFiltersStore()

  const activeMonthDate =
    activeMonth instanceof Date ? activeMonth : new Date(activeMonth)

  const isCurrentMonth =
    activeMonthDate.getFullYear() === new Date().getFullYear() &&
    activeMonthDate.getMonth() === new Date().getMonth()

  const nextTheme = () => {
    const order: ("light" | "dark" | "system")[] = ["light", "dark", "system"]
    const idx = order.indexOf(theme)
    setTheme(order[(idx + 1) % 3])
  }

  if (!mobileMenuOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        onClick={() => setMobileMenuOpen(false)}
      />
      <aside className="fixed left-0 top-0 h-full w-72 bg-white dark:bg-dark-900 z-50 flex flex-col lg:hidden shadow-xl">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-surface-200 dark:border-dark-700">
          <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
            <Zap className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-base font-bold text-ink-primary dark:text-ink-inverse">
            FlowTrack
          </span>
        </div>

        {/* Period */}
        <div className="px-4 py-3 border-b border-surface-200 dark:border-dark-700">
          <div className="flex items-center justify-between">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-dark-700 text-ink-tertiary"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
              <span className="text-sm font-semibold text-ink-primary dark:text-ink-inverse capitalize">
              {format(activeMonthDate, "MMMM yyyy", { locale: es })}
            </span>
            <button
              onClick={nextMonth}
              disabled={isCurrentMonth}
              className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-dark-700 text-ink-tertiary disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all",
                pathname === href || pathname.startsWith(href + "/")
                  ? "bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium"
                  : "text-ink-secondary hover:bg-surface-100 dark:hover:bg-dark-700"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{label}</span>
            </Link>
          ))}
        </nav>

        {/* Quick Add */}
        <div className="px-2 pb-2">
          <button
            onClick={() => {
              openQuickAdd()
              setMobileMenuOpen(false)
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Nueva transacción</span>
          </button>
        </div>

        {/* Footer */}
        <div className="border-t border-surface-200 dark:border-dark-700 px-3 py-3">
          <div className="flex items-center gap-2">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt=""
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                  {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-ink-primary dark:text-ink-inverse truncate">
                {session?.user?.name ?? "Usuario"}
              </p>
            </div>
            <button
              onClick={nextTheme}
              className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-dark-700 text-ink-tertiary"
            >
              {theme === "dark" ? (
                <Moon className="w-4 h-4" />
              ) : theme === "system" ? (
                <Monitor className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-dark-700 text-ink-tertiary hover:text-expense-500"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
