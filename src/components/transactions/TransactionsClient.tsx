"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Download, Plus, Upload, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useFiltersStore } from "@/store/filters"
import { useUIStore } from "@/store/ui"
import { GroupedByDay } from "@/components/transactions/GroupedByDay"
import { FilterBar } from "@/components/transactions/FilterBar"
import { TransactionForm } from "@/components/transactions/TransactionForm"
import { EmptyState } from "@/components/ui/EmptyState"
import { Button } from "@/components/ui/Button"
import { SkeletonRow } from "@/components/ui/Skeleton"
import type { TransactionWithRelations } from "@/types"

interface TransactionsClientProps {
  categories: { id: string; name: string; icon: string; type: string; color: string }[]
  wallets: { id: string; name: string }[]
}

export function TransactionsClient({ categories, wallets }: TransactionsClientProps) {
  const router = useRouter()
  const { type, categoryIds, walletIds, search, startDate, endDate } = useFiltersStore()
  const { openTransactionForm, openImportModal, isTransactionFormOpen } = useUIStore()
  const setActiveMonth = useFiltersStore((s) => s.setActiveMonth)
  const { selectedTransactionIds, clearSelection } = useUIStore()

  const [transactions, setTransactions] = useState<TransactionWithRelations[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)

  const fetchTransactions = useCallback(async (p = 1, append = false) => {
    setIsLoading(true)
    try {
      const isoStart = new Date(startDate).toISOString()
      const isoEnd = new Date(endDate).toISOString()
      const params = new URLSearchParams({
        page: String(p),
        limit: "30",
        startDate: isoStart,
        endDate: isoEnd,
      })

      console.debug("[TransactionsClient] Fetching transactions", { page: p, startDate: isoStart, endDate: isoEnd, append })
      if (type && type !== "ALL") params.set("type", type)
      if (search) params.set("search", search)
      if (categoryIds.length) params.set("categoryIds", categoryIds.join(","))
      if (walletIds.length) params.set("walletIds", walletIds.join(","))

      const res = await fetch(`/api/transactions?${params}`)
      const json = await res.json()
      const data: TransactionWithRelations[] = json.transactions ?? []
      setTotal(json.total ?? 0)
      setHasMore(json.hasMore ?? false)
      setTransactions(append ? (prev) => [...prev, ...data] : data)
    } catch {
      toast.error("Error cargando transacciones")
    } finally {
      setIsLoading(false)
    }
  }, [type, categoryIds, walletIds, search, startDate, endDate])

  const handleDeleteLocal = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
    setTotal((prev) => Math.max(0, prev - 1))
  }

  const handleDeleteSelected = async () => {
    if (!selectedTransactionIds || selectedTransactionIds.length === 0) return
    try {
      const ids = selectedTransactionIds
      // Delete in parallel
      await Promise.all(
        ids.map((id) => fetch(`/api/transactions/${id}`, { method: "DELETE" }))
      )
      // Remove locally
      setTransactions((prev) => prev.filter((t) => !ids.includes(t.id)))
      setTotal((prev) => Math.max(0, prev - ids.length))
      clearSelection()
      toast.success(`Eliminadas ${ids.length} transacción(es)`)
    } catch (err) {
      toast.error("Error eliminando transacciones seleccionadas")
    }
  }

  useEffect(() => {
    // Ensure persisted activeMonth is applied before the first fetch.
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("flowtrack-filters") : null
      if (raw) {
        const parsed = JSON.parse(raw)
        // Zustand persist may store under { state: { ... } } or directly the object
        const activeRaw = parsed?.state?.activeMonth ?? parsed?.activeMonth
        if (activeRaw) {
          const active = new Date(activeRaw)
          if (active instanceof Date && !isNaN(active.getTime())) {
            const currentIso = new Date(startDate).toISOString().slice(0, 7)
            const persistedIso = active.toISOString().slice(0, 7)
            if (currentIso !== persistedIso) {
              setActiveMonth(active)
              return
            }
          }
        }
      }
    } catch (err) {
      // ignore and continue to fetch with current store values
    }

    setPage(1)
    fetchTransactions(1, false)
  }, [fetchTransactions, startDate, endDate, setActiveMonth])

  // Refresh after form closes
  useEffect(() => {
    if (!isTransactionFormOpen) {
      fetchTransactions(1, false)
    }
  }, [isTransactionFormOpen, fetchTransactions])

  const handleExport = async () => {
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    })
    const res = await fetch(`/api/export?${params}`)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `flowtrack-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-ink-tertiary">
            {total} transacción{total !== 1 ? "es" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedTransactionIds && selectedTransactionIds.length > 0 ? (
            <Button variant="danger" size="sm" onClick={handleDeleteSelected}>
              Eliminar seleccionadas
            </Button>
          ) : null}
          <Button variant="ghost" size="sm" onClick={openImportModal}>
            <Upload className="w-4 h-4 mr-1.5" />
            Importar
          </Button>
          <Button variant="ghost" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-1.5" />
            Exportar
          </Button>
          <Button size="sm" onClick={() => openTransactionForm()}>
            <Plus className="w-4 h-4 mr-1.5" />
            Nueva
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white dark:bg-dark-900 rounded-2xl p-4 border border-surface-200 dark:border-dark-700">
        <FilterBar categories={categories} wallets={wallets} />
      </div>

      {/* Transaction list */}
      <div className="bg-white dark:bg-dark-900 rounded-2xl border border-surface-200 dark:border-dark-700 overflow-hidden">
        {isLoading && transactions.length === 0 ? (
          <div className="p-4 space-y-1">
            {[...Array(8)].map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState
            icon="💸"
            title="Sin transacciones"
            description="No hay transacciones en el período seleccionado."
            action={
              <Button size="sm" onClick={() => openTransactionForm()}>
                <Plus className="w-4 h-4 mr-1.5" />
                Crear primera transacción
              </Button>
            }
          />
        ) : (
          <div className="p-2">
            <GroupedByDay transactions={transactions} onDelete={handleDeleteLocal} />
          </div>
        )}

        {hasMore && (
          <div className="p-4 border-t border-surface-100 dark:border-dark-800 text-center">
            <Button
              variant="ghost"
              size="sm"
              disabled={isLoading}
              onClick={() => {
                const next = page + 1
                setPage(next)
                fetchTransactions(next, true)
              }}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
              ) : null}
              Cargar más
            </Button>
          </div>
        )}
      </div>

      {/* Transaction form modal */}
      <TransactionForm categories={categories} wallets={wallets} />
    </div>
  )
}
