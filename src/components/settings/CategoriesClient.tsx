"use client"

import { useState, useTransition, useEffect } from "react"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Loader2, Tag } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Modal } from "@/components/ui/Modal"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"

type TransactionType = "EXPENSE" | "INCOME" | "SAVING" | "INVESTMENT" | "TRANSFER"

interface Category {
  id: string
  name: string
  type: TransactionType
  icon: string
  color: string
  isDefault: boolean
}

const TYPE_LABELS: Record<TransactionType, string> = {
  EXPENSE: "Gastos",
  INCOME: "Ingresos",
  SAVING: "Ahorros",
  INVESTMENT: "Inversiones",
  TRANSFER: "Transferencias",
}

const TYPE_COLORS: Record<TransactionType, string> = {
  EXPENSE: "text-red-500",
  INCOME: "text-green-500",
  SAVING: "text-blue-500",
  INVESTMENT: "text-purple-500",
  TRANSFER: "text-orange-500",
}

const PRESET_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f97316",
  "#f59e0b", "#10b981", "#14b8a6", "#3b82f6", "#06b6d4",
  "#84cc16", "#6b7280",
]

const TABS: TransactionType[] = ["EXPENSE", "INCOME", "SAVING", "INVESTMENT", "TRANSFER"]

interface FormState {
  name: string
  type: TransactionType
  icon: string
  color: string
}

const DEFAULT_FORM: FormState = { name: "", type: "EXPENSE", icon: "📌", color: "#6366f1" }

export function CategoriesClient({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [activeTab, setActiveTab] = useState<TransactionType>("EXPENSE")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState<Category | null>(null)
  const [form, setForm] = useState<FormState>(DEFAULT_FORM)
  const [isPending, startTransition] = useTransition()

  const displayed = categories.filter((c) => c.type === activeTab)

  function openNew() {
    setEditing(null)
    setForm({ ...DEFAULT_FORM, type: activeTab })
    setIsModalOpen(true)
  }

  function openEdit(cat: Category) {
    setEditing(cat)
    setForm({ name: cat.name, type: cat.type, icon: cat.icon, color: cat.color })
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setEditing(null)
  }

  function handleSave() {
    if (!form.name.trim()) {
      toast.error("El nombre es requerido")
      return
    }

    startTransition(async () => {
      try {
        if (editing) {
          const res = await fetch(`/api/categories?id=${editing.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: form.name, icon: form.icon, color: form.color }),
          })
          const data = await res.json()
          if (!res.ok) { toast.error(data.error || "Error al actualizar"); return }
          setCategories((prev) => prev.map((c) => (c.id === editing.id ? data.category : c)))
          toast.success("Categoría actualizada")
        } else {
          const res = await fetch("/api/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          })
          const data = await res.json()
          if (!res.ok) { toast.error(data.error || "Error al crear"); return }
          setCategories((prev) => [...prev, data.category])
          toast.success("Categoría creada")
        }
        closeModal()
      } catch {
        toast.error("Error de conexión")
      }
    })
  }

  function handleDelete() {
    if (!deleting) return
    startTransition(async () => {
      try {
        const res = await fetch(`/api/categories?id=${deleting.id}`, { method: "DELETE" })
        const data = await res.json()
        if (!res.ok) { toast.error(data.error || "Error al eliminar"); setDeleting(null); return }
        setCategories((prev) => prev.filter((c) => c.id !== deleting.id))
        toast.success("Categoría eliminada")
        setDeleting(null)
      } catch {
        toast.error("Error de conexión")
        setDeleting(null)
      }
    })
  }

  return (
    <section className="bg-white dark:bg-dark-900 rounded-2xl p-5 border border-surface-200 dark:border-dark-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-ink-primary dark:text-ink-inverse">
          Categorías
        </h2>
        <Button size="sm" onClick={openNew} className="gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          Nueva
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 flex-wrap">
        {TABS.map((tab) => {
          const count = categories.filter((c) => c.type === tab).length
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeTab === tab
                  ? "bg-primary-500 text-white"
                  : "bg-surface-100 dark:bg-dark-800 text-ink-secondary dark:text-ink-muted hover:bg-surface-200 dark:hover:bg-dark-700"
              }`}
            >
              {TYPE_LABELS[tab]}{" "}
              <span className="opacity-70">({count})</span>
            </button>
          )
        })}
      </div>

      {/* Category list */}
      <div className="space-y-2">
        {displayed.length === 0 ? (
          <p className="text-xs text-ink-tertiary text-center py-6">
            No hay categorías de {TYPE_LABELS[activeTab].toLowerCase()} aún
          </p>
        ) : (
          displayed.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-50 dark:bg-dark-800 group"
            >
              {/* Color dot + icon */}
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                style={{ backgroundColor: cat.color + "33", color: cat.color }}
              >
                {cat.icon}
              </span>

              <span className="flex-1 text-sm font-medium text-ink-primary dark:text-ink-inverse truncate">
                {cat.name}
              </span>

              {cat.isDefault && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-200 dark:bg-dark-700 text-ink-tertiary flex-shrink-0">
                  defecto
                </span>
              )}

              {/* Actions */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button
                  onClick={() => openEdit(cat)}
                  className="p-1 rounded-lg hover:bg-surface-200 dark:hover:bg-dark-700 text-ink-secondary"
                  title="Editar"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                {!cat.isDefault && (
                  <button
                    onClick={() => setDeleting(cat)}
                    className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editing ? "Editar categoría" : "Nueva categoría"}
      >
        <div className="space-y-4">
          <Input
            label="Nombre"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Ej: Supermercado"
            maxLength={40}
          />

          {!editing && (
            <div>
              <label className="block text-xs font-medium text-ink-secondary dark:text-ink-muted mb-1.5">
                Tipo
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as TransactionType }))}
                className="w-full px-3 py-2 text-sm rounded-xl bg-surface-50 dark:bg-dark-800 border border-surface-200 dark:border-dark-700 text-ink-primary dark:text-ink-inverse focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {TABS.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-ink-secondary dark:text-ink-muted mb-1.5">
              Ícono (emoji)
            </label>
            <input
              type="text"
              value={form.icon}
              onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
              maxLength={4}
              className="w-20 px-3 py-2 text-center text-xl rounded-xl bg-surface-50 dark:bg-dark-800 border border-surface-200 dark:border-dark-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-secondary dark:text-ink-muted mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, color: c }))}
                  className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${
                    form.color === c ? "ring-2 ring-offset-2 ring-primary-500 scale-110" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-2 py-2">
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center text-base"
              style={{ backgroundColor: form.color + "33", color: form.color }}
            >
              {form.icon || <Tag className="w-4 h-4" />}
            </span>
            <span className="text-sm font-medium text-ink-primary dark:text-ink-inverse">
              {form.name || "Vista previa"}
            </span>
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="ghost" onClick={closeModal} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isPending} className="flex-1 gap-1">
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {editing ? "Guardar" : "Crear"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Eliminar categoría"
        description={`¿Eliminar "${deleting?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
      />
    </section>
  )
}
