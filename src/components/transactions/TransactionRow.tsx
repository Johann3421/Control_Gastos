"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Pencil, Trash2, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/currency"
import { usePreferencesStore } from "@/store/preferences"
import { useUIStore } from "@/store/ui"
import { Badge } from "@/components/ui/Badge"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import type { TransactionWithRelations } from "@/types"

interface TransactionRowProps {
  transaction: TransactionWithRelations
  isSelected: boolean
  onSelect: (id: string, checked: boolean) => void
  onDelete?: (id: string) => void
}

const typeVariant = {
  INCOME: "income",
  EXPENSE: "expense",
  SAVING: "saving",
  INVESTMENT: "investment",
  TRANSFER: "default",
} as const

const typeLabel = {
  INCOME: "Ingreso",
  EXPENSE: "Gasto",
  SAVING: "Ahorro",
  INVESTMENT: "Inversión",
  TRANSFER: "Transferencia",
}

export function TransactionRow({ transaction: tx, isSelected, onSelect, onDelete }: TransactionRowProps) {
  const { currency } = usePreferencesStore()
  const { openTransactionForm } = useUIStore()
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/transactions/${tx.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Error al eliminar")
      toast.success("Transacción eliminada")
      if (typeof onDelete === "function") onDelete(tx.id)
    } catch {
      toast.error("Error al eliminar la transacción")
    } finally {
      setDeleting(false)
      setShowConfirm(false)
    }
  }

  const sign = tx.type === "INCOME" ? "+" : tx.type === "EXPENSE" ? "-" : ""
  const amountColor =
    tx.type === "INCOME"
      ? "text-income-600 dark:text-income-400"
      : tx.type === "EXPENSE"
      ? "text-expense-600 dark:text-expense-400"
      : tx.type === "SAVING"
      ? "text-saving-600 dark:text-saving-400"
      : "text-investment-600 dark:text-investment-400"

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-3 hover:bg-surface-50 dark:hover:bg-dark-800 rounded-xl transition-colors group">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(tx.id, e.target.checked)}
          className="rounded border-surface-300 text-primary-500 focus:ring-primary-500 flex-shrink-0"
        />
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0"
          style={{ background: (tx.category?.color ?? "#94a3b8") + "25" }}
        >
          <span>{tx.category?.icon ?? "💳"}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-ink-primary dark:text-ink-inverse truncate">
            {tx.description}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-ink-tertiary">
              {format(new Date(tx.date), "d MMM", { locale: es })}
            </span>
            {tx.category && (
              <span className="text-xs text-ink-tertiary">· {tx.category.name}</span>
            )}
            {tx.wallet && (
              <span className="text-xs text-ink-tertiary hidden sm:inline">
                · {tx.wallet.name}
              </span>
            )}
          </div>
        </div>
        <Badge variant={typeVariant[tx.type] ?? "default"} className="hidden sm:flex">
          {typeLabel[tx.type]}
        </Badge>
        <p className={`text-sm font-semibold ${amountColor} w-24 text-right flex-shrink-0`}>
          {sign}{formatCurrency(tx.amount, currency)}
        </p>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => openTransactionForm(tx.id)}
            className="p-1.5 rounded-lg hover:bg-surface-200 dark:hover:bg-dark-700 text-ink-tertiary"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            className="p-1.5 rounded-lg hover:bg-expense-50 dark:hover:bg-expense-500/10 text-ink-tertiary hover:text-expense-500"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Eliminar transacción"
        description={`¿Eliminar "${tx.description}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        isLoading={deleting}
      />
    </>
  )
}
