"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { AmountInput } from "@/components/ui/AmountInput"
import { useUIStore } from "@/store/ui"
import { usePreferencesStore } from "@/store/preferences"
import { transactionSchema } from "@/lib/validations/transaction"
import type { TransactionWithRelations } from "@/types"

type FormValues = z.infer<typeof transactionSchema>

const tabs = [
  { id: "EXPENSE", label: "Gasto", color: "text-expense-600 dark:text-expense-400" },
  { id: "INCOME", label: "Ingreso", color: "text-income-600 dark:text-income-400" },
  { id: "SAVING", label: "Ahorro", color: "text-saving-600 dark:text-saving-400" },
  { id: "INVESTMENT", label: "Inversión", color: "text-investment-600 dark:text-investment-400" },
  { id: "TRANSFER", label: "Transferencia", color: "text-primary-600 dark:text-primary-400" },
]

interface TransactionFormProps {
  categories: { id: string; name: string; icon: string; type: string }[]
  wallets: { id: string; name: string }[]
  transaction?: TransactionWithRelations
}

export function TransactionForm({ categories, wallets, transaction }: TransactionFormProps) {
  const router = useRouter()
  const { isTransactionFormOpen, closeTransactionForm, transactionFormType } = useUIStore()
  const { currency } = usePreferencesStore()

  const defaultType = transaction?.type ?? (transactionFormType as FormValues["type"]) ?? "EXPENSE"
  const [activeTab, setActiveTab] = useState<string>(defaultType)
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: defaultType as FormValues["type"],
      description: transaction?.description ?? "",
      amount: transaction?.amount ?? 0,
      date: transaction ? format(new Date(transaction.date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      categoryId: transaction?.categoryId ?? "",
      walletId: transaction?.walletId ?? "",
      tags: transaction?.tags ?? [],
    },
  })

  const amount = watch("amount")
  const filteredCategories = categories.filter(
    (c) =>
      activeTab === "TRANSFER" ||
      c.type === activeTab ||
      c.type === "GENERAL"
  )

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      try {
        const url = transaction
          ? `/api/transactions/${transaction.id}`
          : "/api/transactions"
        const method = transaction ? "PATCH" : "POST"

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, type: activeTab }),
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error ?? "Error al guardar")
        }

        toast.success(transaction ? "Transacción actualizada" : "Transacción creada")
        closeTransactionForm()
        reset()
        router.refresh()
      } catch (e: any) {
        toast.error(e.message)
      }
    })
  }

  return (
    <Modal
      isOpen={isTransactionFormOpen}
      onClose={closeTransactionForm}
      title={transaction ? "Editar transacción" : "Nueva transacción"}
    >
      {/* Tabs */}
      <div className="flex gap-1 mb-5 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id)
              setValue("type", tab.id as FormValues["type"])
            }}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-surface-100 dark:bg-dark-700 " + tab.color
                : "text-ink-tertiary hover:bg-surface-50 dark:hover:bg-dark-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AmountInput
          label="Monto"
          currency={currency}
          value={String(amount ?? "")}
          onChange={(v) => setValue("amount", v, { shouldValidate: true })}
          error={errors.amount?.message}
        />

        <Input
          label="Descripción"
          placeholder="Ej. Almuerzo, Sueldo, Netflix..."
          error={errors.description?.message}
          {...register("description")}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-ink-secondary dark:text-ink-muted mb-1">
              Categoría
            </label>
            <select
              {...register("categoryId")}
              className="w-full px-3 py-2 text-sm rounded-xl bg-surface-50 dark:bg-dark-800 border border-surface-200 dark:border-dark-700 text-ink-primary dark:text-ink-inverse focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Seleccionar</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-secondary dark:text-ink-muted mb-1">
              Billetera
            </label>
            <select
              {...register("walletId")}
              className="w-full px-3 py-2 text-sm rounded-xl bg-surface-50 dark:bg-dark-800 border border-surface-200 dark:border-dark-700 text-ink-primary dark:text-ink-inverse focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Seleccionar</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Input
          type="date"
          label="Fecha"
          error={errors.date?.message}
          {...register("date")}
        />

        <div className="flex gap-2 pt-1">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={closeTransactionForm}
          >
            Cancelar
          </Button>
          <Button type="submit" className="flex-1" disabled={isPending}>
            {isPending && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
            {transaction ? "Guardar cambios" : "Crear transacción"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
