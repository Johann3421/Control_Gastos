"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Plus, Trash2, Loader2, AlertTriangle } from "lucide-react"
import { budgetSchema } from "@/lib/validations/budget"
import { formatCurrency } from "@/lib/currency"
import { usePreferencesStore } from "@/store/preferences"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { AmountInput } from "@/components/ui/AmountInput"
import { Modal } from "@/components/ui/Modal"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { EmptyState } from "@/components/ui/EmptyState"
import type { z } from "zod"

type FormValues = z.infer<typeof budgetSchema>

interface Budget {
  id: string
  amount: number
  period: string
  notes: string | null
  spent: number
  percentageUsed: number
  isOverBudget: boolean
  category: { id: string; name: string; icon: string; color: string } | null
}

interface BudgetsClientProps {
  budgets: Budget[]
  categories: { id: string; name: string; icon: string }[]
}

export function BudgetsClient({ budgets: initial, categories }: BudgetsClientProps) {
  const router = useRouter()
  const { currency } = usePreferencesStore()
  const [budgets, setBudgets] = useState(initial)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(budgetSchema) })

  const amount = watch("amount") ?? 0

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/budgets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error("Error al crear presupuesto")
        const { budget } = await res.json()
        setBudgets((prev) => [...prev, { ...budget, spent: 0, percentageUsed: 0, isOverBudget: false }])
        toast.success("Presupuesto creado")
        reset()
        setIsModalOpen(false)
      } catch (e: any) {
        toast.error(e.message)
      }
    })
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      const res = await fetch(`/api/budgets?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Error al eliminar")
      setBudgets((prev) => prev.filter((b) => b.id !== id))
      toast.success("Presupuesto eliminado")
    } catch {
      toast.error("Error al eliminar")
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-tertiary">{budgets.length} presupuesto{budgets.length !== 1 ? "s" : ""} activo{budgets.length !== 1 ? "s" : ""}</p>
        <Button size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Nuevo presupuesto
        </Button>
      </div>

      {budgets.length === 0 ? (
        <EmptyState
          icon="📊"
          title="Sin presupuestos"
          description="Crea presupuestos por categoría para controlar tus gastos."
          action={<Button size="sm" onClick={() => setIsModalOpen(true)}>Crear presupuesto</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {budgets.map((b) => (
            <div
              key={b.id}
              className={`bg-white dark:bg-dark-900 rounded-2xl p-4 border ${
                b.isOverBudget
                  ? "border-expense-300 dark:border-expense-500/40"
                  : b.percentageUsed >= 80
                  ? "border-amber-300 dark:border-amber-500/40"
                  : "border-surface-200 dark:border-dark-700"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                    style={{ background: (b.category?.color ?? "#94a3b8") + "20" }}
                  >
                    <span>{b.category?.icon ?? "📦"}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink-primary dark:text-ink-inverse">
                      {b.category?.name ?? "General"}
                    </p>
                    <p className="text-xs text-ink-tertiary capitalize">{b.period.toLowerCase()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {b.isOverBudget && <AlertTriangle className="w-4 h-4 text-expense-500" />}
                  <button
                    onClick={() => handleDelete(b.id)}
                    disabled={deleting === b.id}
                    className="p-1.5 rounded-lg hover:bg-expense-50 dark:hover:bg-expense-500/10 text-ink-tertiary hover:text-expense-500"
                  >
                    {deleting === b.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-ink-tertiary mb-2">
                <span>{formatCurrency(b.spent, currency)} gastado</span>
                <span>de {formatCurrency(b.amount, currency)}</span>
              </div>
              <ProgressBar value={b.percentageUsed} />
              <p className="text-xs text-ink-tertiary mt-1.5 text-right">
                {b.percentageUsed.toFixed(0)}% utilizado
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nuevo presupuesto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink-secondary dark:text-ink-muted mb-1">
              Categoría
            </label>
            <select
              {...register("categoryId")}
              className="w-full px-3 py-2 text-sm rounded-xl bg-surface-50 dark:bg-dark-800 border border-surface-200 dark:border-dark-700 text-ink-primary dark:text-ink-inverse focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Toda la cuenta</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
          <AmountInput
            label="Monto límite"
            currency={currency}
            value={amount}
            onChange={(v) => setValue("amount", v, { shouldValidate: true })}
            error={errors.amount?.message}
          />
          <div>
            <label className="block text-xs font-medium text-ink-secondary dark:text-ink-muted mb-1">
              Período
            </label>
            <select
              {...register("period")}
              defaultValue="MONTHLY"
              className="w-full px-3 py-2 text-sm rounded-xl bg-surface-50 dark:bg-dark-800 border border-surface-200 dark:border-dark-700 text-ink-primary dark:text-ink-inverse focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="MONTHLY">Mensual</option>
              <option value="WEEKLY">Semanal</option>
              <option value="YEARLY">Anual</option>
            </select>
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              Crear presupuesto
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
