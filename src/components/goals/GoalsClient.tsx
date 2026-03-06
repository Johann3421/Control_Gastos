"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Plus, Trash2, Loader2, Target, PiggyBank } from "lucide-react"
import { goalSchema } from "@/lib/validations/goal"
import { formatCurrency } from "@/lib/currency"
import { usePreferencesStore } from "@/store/preferences"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { AmountInput } from "@/components/ui/AmountInput"
import { Modal } from "@/components/ui/Modal"
import { EmptyState } from "@/components/ui/EmptyState"
import type { z } from "zod"

type FormValues = z.infer<typeof goalSchema>

interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: Date | null
  status: string
  icon: string | null
  color: string | null
  notes: string | null
  progressPercentage: number
}

export function GoalsClient({ goals: initial }: { goals: Goal[] }) {
  const { currency } = usePreferencesStore()
  const safeInitial = Array.isArray(initial) ? initial : typeof initial === "function" ? [] : initial ?? []
  const [goals, setGoals] = useState<Goal[]>(safeInitial as Goal[])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null)
  const [depositAmount, setDepositAmount] = useState(0)
  const [isPending, startTransition] = useTransition()
  const [isDepositing, startDepositing] = useTransition()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(goalSchema) })

  const targetAmount = watch("targetAmount") ?? 0

  const onCreate = (data: FormValues) => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/goals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "create", ...data }),
        })
        if (!res.ok) throw new Error()
        const { goal } = await res.json()
        setGoals((prev) => [...prev, { ...goal, progressPercentage: 0 }])
        toast.success("Meta creada")
        reset()
        setIsCreateOpen(false)
      } catch {
        toast.error("Error al crear la meta")
      }
    })
  }

  const onDeposit = async () => {
    if (!depositGoalId || depositAmount <= 0) return
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deposit", goalId: depositGoalId, amount: depositAmount }),
      })
      if (!res.ok) throw new Error()
      const { goal } = await res.json()
      setGoals((prev) =>
        prev.map((g) =>
          g.id === depositGoalId
            ? {
                ...g,
                currentAmount: goal.currentAmount,
                status: goal.status,
                progressPercentage:
                  goal.targetAmount > 0
                    ? (goal.currentAmount / goal.targetAmount) * 100
                    : 0,
              }
            : g
        )
      )
      toast.success("Depósito registrado")
      setDepositGoalId(null)
      setDepositAmount(0)
    } catch {
      toast.error("Error al registrar el depósito")
    }
  }

  const onDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/goals?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setGoals((prev) => prev.filter((g) => g.id !== id))
      toast.success("Meta eliminada")
    } catch {
      toast.error("Error al eliminar")
    }
  }

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-tertiary">{goals.length} meta{goals.length !== 1 ? "s" : ""}</p>
        <Button size="sm" onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Nueva meta
        </Button>
      </div>

      {goals.length === 0 ? (
        <EmptyState
          icon="🎯"
          title="Sin metas"
          description="Define metas de ahorro para alcanzar tus objetivos financieros."
          action={<Button size="sm" onClick={() => setIsCreateOpen(true)}>Crear meta</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {goals.map((g) => (
            <div
              key={g.id}
              className={`bg-white dark:bg-dark-900 rounded-2xl p-4 border ${
                g.status === "COMPLETED"
                  ? "border-income-300 dark:border-income-500/40"
                  : "border-surface-200 dark:border-dark-700"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-saving-50 dark:bg-saving-500/10 flex items-center justify-center text-lg">
                    {g.icon ?? "🎯"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink-primary dark:text-ink-inverse">
                      {g.name}
                    </p>
                    {g.targetDate && (
                      <p className="text-xs text-ink-tertiary">
                        Meta:{" "}
                        {new Date(g.targetDate).toLocaleDateString("es-PE", {
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onDelete(g.id)}
                  className="p-1.5 rounded-lg hover:bg-expense-50 dark:hover:bg-expense-500/10 text-ink-tertiary hover:text-expense-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center justify-between text-xs text-ink-tertiary mb-2">
                <span>{formatCurrency(g.currentAmount, currency)}</span>
                <span>{formatCurrency(g.targetAmount, currency)}</span>
              </div>
              <ProgressBar value={g.progressPercentage} />
              <div className="flex items-center justify-between mt-3">
                <span className={`text-xs font-medium ${g.status === "COMPLETED" ? "text-income-600 dark:text-income-400" : "text-ink-tertiary"}`}>
                  {g.status === "COMPLETED" ? "✓ Completada" : `${g.progressPercentage.toFixed(0)}% completado`}
                </span>
                {g.status !== "COMPLETED" && (
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => setDepositGoalId(g.id)}
                  >
                    <PiggyBank className="w-3.5 h-3.5 mr-1" />
                    Depositar
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Nueva meta de ahorro">
        <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
          <Input label="Nombre" placeholder="Ej. Vacaciones, Auto nuevo..." error={errors.name?.message} {...register("name")} />
          <AmountInput
            label="Monto objetivo"
            currency={currency}
            value={targetAmount}
            onChange={(v) => setValue("targetAmount", v, { shouldValidate: true })}
            error={errors.targetAmount?.message}
          />
          <Input type="date" label="Fecha límite (opcional)" {...register("targetDate")} />
          <Input label="Descripción (opcional)" placeholder="Notas sobre esta meta..." {...register("notes")} />
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              Crear meta
            </Button>
          </div>
        </form>
      </Modal>

      {/* Deposit modal */}
      <Modal
        isOpen={depositGoalId !== null}
        onClose={() => { setDepositGoalId(null); setDepositAmount(0) }}
        title="Registrar depósito"
      >
        <div className="space-y-4">
          <AmountInput
            label="Monto a depositar"
            currency={currency}
            value={depositAmount}
            onChange={setDepositAmount}
          />
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setDepositGoalId(null)}>Cancelar</Button>
            <Button className="flex-1" onClick={onDeposit} disabled={depositAmount <= 0}>
              <PiggyBank className="w-4 h-4 mr-1.5" />
              Depositar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
