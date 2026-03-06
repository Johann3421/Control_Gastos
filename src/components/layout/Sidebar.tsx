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
  Plus,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  LogOut,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useUIStore } from "@/store/ui"
import { usePreferencesStore } from "@/store/preferences"
import { useFiltersStore } from "@/store/filters"
import { format, addMonths, subMonths } from "date-fns"
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

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { sidebarCollapsed, toggleSidebar, openQuickAdd } = useUIStore()
  const { theme, setTheme } = usePreferencesStore()
  const { activeMonth, prevMonth, nextMonth } = useFiltersStore()

  const activeMonthDate = activeMonth instanceof Date ? activeMonth : new Date(activeMonth)
  const isCurrentMonth =
    activeMonthDate.getFullYear() === new Date().getFullYear() &&
    activeMonthDate.getMonth() === new Date().getMonth()

  const nextTheme = () => {
    const order: ("light" | "dark" | "system")[] = ["light", "dark", "system"]
    const idx = order.indexOf(theme)
    setTheme(order[(idx + 1) % 3])
  }

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col fixed left-0 top-0 h-full bg-white dark:bg-dark-900 border-r border-surface-200 dark:border-dark-700 z-30 transition-all duration-200",
        sidebarCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-surface-200 dark:border-dark-700">
        <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center flex-shrink-0">
          <Zap className="w-4.5 h-4.5 text-white" />
        </div>
        {!sidebarCollapsed && (
          <span className="text-base font-bold text-ink-primary dark:text-ink-inverse">
            FlowTrack
          </span>
        )}
        <button
          onClick={toggleSidebar}
          className="ml-auto p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-dark-700 text-ink-tertiary"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Period */}
      {!sidebarCollapsed && (
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
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-xl mb-0.5 transition-all duration-100",
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium"
                : "text-ink-secondary hover:bg-surface-100 dark:hover:bg-dark-700 hover:text-ink-primary dark:hover:text-ink-inverse"
            )}
            title={sidebarCollapsed ? label : undefined}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && (
              <span className="text-sm">{label}</span>
            )}
          </Link>
        ))}
      </nav>

      {/* Quick Add */}
      <div className="px-2 pb-2">
        <button
          onClick={openQuickAdd}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors active:scale-95",
            sidebarCollapsed ? "px-0" : "px-4"
          )}
        >
          <Plus className="w-4 h-4" />
          {!sidebarCollapsed && <span className="text-sm">Nueva transacción</span>}
        </button>
      </div>

      {/* Footer */}
      <div className="border-t border-surface-200 dark:border-dark-700 px-3 py-3">
        <div className="flex items-center gap-2">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name ?? ""}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
              </span>
            </div>
          )}
          {!sidebarCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-ink-primary dark:text-ink-inverse truncate">
                  {session?.user?.name ?? "Usuario"}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={nextTheme}
                  className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-dark-700 text-ink-tertiary"
                  title="Cambiar tema"
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
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}
