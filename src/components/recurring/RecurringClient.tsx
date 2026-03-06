"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Pause, Play, Trash2, CalendarClock, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/currency"
import { usePreferencesStore } from "@/store/preferences"
import { Badge } from "@/components/ui/Badge"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { EmptyState } from "@/components/ui/EmptyState"

interface RecurringTx {
  id: string
  name: string
  description: string | null
  amount: number
  type: string
  frequency: string
  nextDate: Date
  active: boolean
  category: { id: string; name: string; icon: string; color: string } | null
  wallet: { id: string; name: string } | null
}

const frequencyLabel: Record<string, string> = {
  DAILY: "Diario",
  WEEKLY: "Semanal",
  BIWEEKLY: "Quincenal",
  MONTHLY: "Mensual",
  QUARTERLY: "Trimestral",
  YEARLY: "Anual",
}

const typeVariant = {
  INCOME: "income",
  EXPENSE: "expense",
  SAVING: "saving",
  INVESTMENT: "investment",
} as const

export function RecurringClient({ recurring: initial }: { recurring: RecurringTx[] }) {
  const { currency } = usePreferencesStore()
  const [recurring, setRecurring] = useState(initial)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const handleToggle = async (id: string, active: boolean) => {
    setTogglingId(id)
    try {
      const res = await fetch("/api/recurring", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !active }),
      })
      if (!res.ok) throw new Error()
      setRecurring((prev) =>
        prev.map((r) => (r.id === id ? { ...r, active: !active } : r))
      )
      toast.success(active ? "Transacción pausada" : "Transacción activada")
    } catch {
      toast.error("Error al actualizar")
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(null)
    try {
      const res = await fetch(`/api/recurring?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setRecurring((prev) => prev.filter((r) => r.id !== id))
      toast.success("Transacción recurrente eliminada")
    } catch {
      toast.error("Error al eliminar")
    }
  }

  if (recurring.length === 0) {
    return (
      <EmptyState
        icon="🔄"
        title="Sin transacciones recurrentes"
        description="Las transacciones creadas como recurrentes aparecerán aquí."
      />
    )
  }

  return (
    <div className="space-y-3 max-w-3xl mx-auto">
      <p className="text-sm text-ink-tertiary">{recurring.length} transacción{recurring.length !== 1 ? "es" : ""} recurrente{recurring.length !== 1 ? "s" : ""}</p>
      {recurring.map((r) => (
        <div
          key={r.id}
          className={`bg-white dark:bg-dark-900 rounded-2xl p-4 border flex items-center gap-3 ${
            !r.active
              ? "border-surface-200 dark:border-dark-700 opacity-60"
              : "border-surface-200 dark:border-dark-700"
          }`}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
            style={{ background: (r.category?.color ?? "#94a3b8") + "20" }}
          >
            <span>{r.category?.icon ?? "🔄"}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-ink-primary dark:text-ink-inverse">
                {r.name}
              </p>
              <Badge variant={(typeVariant as any)[r.type] ?? "default"}>
                {r.type === "INCOME" ? "Ingreso" : r.type === "EXPENSE" ? "Gasto" : r.type === "SAVING" ? "Ahorro" : "Inversión"}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-ink-tertiary">
                {frequencyLabel[r.frequency] ?? r.frequency}
              </span>
              <span className="text-xs text-ink-tertiary">·</span>
              <span className="text-xs text-ink-tertiary">
                Próximo: {format(new Date(r.nextDate), "d MMM yyyy", { locale: es })}
              </span>
              {r.wallet && (
                <>
                  <span className="text-xs text-ink-tertiary">·</span>
                  <span className="text-xs text-ink-tertiary">{r.wallet.name}</span>
                </>
              )}
            </div>
          </div>
          <p className={`text-sm font-semibold flex-shrink-0 ${
            r.type === "INCOME"
              ? "text-income-600 dark:text-income-400"
              : r.type === "EXPENSE"
              ? "text-expense-600 dark:text-expense-400"
              : r.type === "SAVING"
              ? "text-saving-600 dark:text-saving-400"
              : "text-investment-600 dark:text-investment-400"
          }`}>
            {formatCurrency(r.amount, currency)}
          </p>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => handleToggle(r.id, r.active)}
              disabled={togglingId === r.id}
              className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-dark-700 text-ink-tertiary"
            >
              {togglingId === r.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : r.active ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => setDeletingId(r.id)}
              className="p-1.5 rounded-lg hover:bg-expense-50 dark:hover:bg-expense-500/10 text-ink-tertiary hover:text-expense-500"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <ConfirmDialog
            isOpen={deletingId === r.id}
            onClose={() => setDeletingId(null)}
            onConfirm={() => handleDelete(r.id)}
            title="Eliminar recurrente"
            description={`¿Eliminar "${r.name}"? Las transacciones ya creadas no se borrarán.`}
            confirmLabel="Eliminar"
          />
        </div>
      ))}
    </div>
  )
}
