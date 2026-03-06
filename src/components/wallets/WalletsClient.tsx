"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Plus, Trash2, Loader2, CreditCard } from "lucide-react"
import { formatCurrency } from "@/lib/currency"
import { usePreferencesStore } from "@/store/preferences"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { AmountInput } from "@/components/ui/AmountInput"
import { Modal } from "@/components/ui/Modal"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { EmptyState } from "@/components/ui/EmptyState"

const walletSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(50),
  type: z.string().min(1),
  initialBalance: z.number().min(0).default(0),
  currency: z.string().default("PEN"),
})

type FormValues = z.infer<typeof walletSchema>

interface Wallet {
  id: string
  name: string
  type: string
  currency: string
  balance: number
  includeInTotal?: boolean
}

const typeLabel: Record<string, string> = {
  CHECKING: "Cuenta corriente",
  SAVINGS: "Ahorro",
  CREDIT: "Crédito",
  CASH: "Efectivo",
  INVESTMENT: "Inversión",
  CRYPTO: "Cripto",
}

const typeColors: Record<string, string> = {
  CHECKING: "from-primary-500 to-primary-600",
  SAVINGS: "from-saving-500 to-saving-600",
  CREDIT: "from-expense-500 to-expense-600",
  CASH: "from-income-500 to-income-600",
  INVESTMENT: "from-investment-500 to-investment-600",
  CRYPTO: "from-purple-500 to-purple-600",
}

export function WalletsClient({ wallets: initial }: { wallets: Wallet[] }) {
  const { currency } = usePreferencesStore()
  const [wallets, setWallets] = useState(initial)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(walletSchema),
    defaultValues: { type: "CHECKING", initialBalance: 0, currency: "PEN" },
  })

  const initialBalance = watch("initialBalance") ?? 0

  const onCreate = (data: FormValues) => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/wallets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error()
        const { wallet } = await res.json()
        setWallets((prev) => [...prev, { ...wallet, balance: data.initialBalance }])
        toast.success("Billetera creada")
        reset()
        setIsCreateOpen(false)
      } catch {
        toast.error("Error al crear la billetera")
      }
    })
  }

  const onDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/wallets?id=${id}`, { method: "DELETE" })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Error al eliminar")
      }
      setWallets((prev) => prev.filter((w) => w.id !== id))
      toast.success("Billetera eliminada")
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-tertiary">{wallets.length} billetera{wallets.length !== 1 ? "s" : ""}</p>
        <Button size="sm" onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Nueva billetera
        </Button>
      </div>

      {wallets.length === 0 ? (
        <EmptyState
          icon="👛"
          title="Sin billeteras"
          description="Agrega billeteras para gestionar tus diferentes cuentas."
          action={<Button size="sm" onClick={() => setIsCreateOpen(true)}>Crear billetera</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wallets.map((w) => (
            <div
              key={w.id}
              className="bg-white dark:bg-dark-900 rounded-2xl border border-surface-200 dark:border-dark-700 overflow-hidden"
            >
              <div className={`h-2 bg-gradient-to-r ${typeColors[w.type] ?? "from-primary-500 to-primary-600"}`} />
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-ink-primary dark:text-ink-inverse">
                      {w.name}
                    </p>
                    <p className="text-xs text-ink-tertiary">{typeLabel[w.type] ?? w.type}</p>
                  </div>
                  <button
                    onClick={() => setDeletingId(w.id)}
                    className="p-1.5 rounded-lg hover:bg-expense-50 dark:hover:bg-expense-500/10 text-ink-tertiary hover:text-expense-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className={`text-xl font-bold ${
                  w.balance >= 0
                    ? "text-income-600 dark:text-income-400"
                    : "text-expense-600 dark:text-expense-400"
                }`}>
                  {formatCurrency(w.balance, currency)}
                </p>
                <p className="text-xs text-ink-tertiary mt-0.5">{w.currency}</p>
              </div>

              <ConfirmDialog
                isOpen={deletingId === w.id}
                onClose={() => setDeletingId(null)}
                onConfirm={() => onDelete(w.id)}
                title="Eliminar billetera"
                description={`¿Eliminar la billetera "${w.name}"? Solo se puede si no tiene transacciones.`}
                confirmLabel="Eliminar"
              />
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Nueva billetera">
        <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
          <Input label="Nombre" placeholder="Ej. BCP, Efectivo, Inversiones..." error={errors.name?.message} {...register("name")} />
          <div>
            <label className="block text-xs font-medium text-ink-secondary dark:text-ink-muted mb-1">Tipo</label>
            <select
              {...register("type")}
              className="w-full px-3 py-2 text-sm rounded-xl bg-surface-50 dark:bg-dark-800 border border-surface-200 dark:border-dark-700 text-ink-primary dark:text-ink-inverse focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {Object.entries(typeLabel).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <AmountInput
            label="Saldo inicial"
            currency={currency}
            value={initialBalance}
            onChange={(v) => setValue("initialBalance", v)}
          />
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              Crear
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
