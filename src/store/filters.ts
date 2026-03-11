"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { startOfMonth, endOfMonth } from "date-fns"
import { TransactionType } from "@prisma/client"

interface FiltersState {
  // Period
  period: string
  startDate: Date
  endDate: Date
  // Filters
  type: TransactionType | "ALL"
  categoryIds: string[]
  walletIds: string[]
  search: string
  minAmount: number | undefined
  maxAmount: number | undefined
  tags: string[]
  isRecurring: boolean | undefined
  // Active month navigation
  activeMonth: Date
  // Actions
  setPeriod: (period: string) => void
  setDateRange: (start: Date, end: Date) => void
  setType: (type: TransactionType | "ALL" | null) => void
  setCategoryIds: (ids: string[]) => void
  toggleCategory: (id: string) => void
  setWalletIds: (ids: string[]) => void
  toggleWallet: (id: string) => void
  setSearch: (search: string) => void
  setMinAmount: (amount: number | undefined) => void
  setMaxAmount: (amount: number | undefined) => void
  setTags: (tags: string[]) => void
  setIsRecurring: (val: boolean | undefined) => void
  setActiveMonth: (date: Date) => void
  prevMonth: () => void
  nextMonth: () => void
  clearFilters: () => void
  getActiveFiltersCount: () => number
}

const now = new Date()

export const useFiltersStore = create<FiltersState>()(
  persist(
    (set, get) => ({
      period: "this-month",
      startDate: startOfMonth(now),
      endDate: endOfMonth(now),
      type: "ALL",
      categoryIds: [],
      walletIds: [],
      search: "",
      minAmount: undefined,
      maxAmount: undefined,
      tags: [],
      isRecurring: undefined,
      activeMonth: now,

      setPeriod: (period) => set({ period }),
      setDateRange: (startDate, endDate) =>
        set({ startDate, endDate, period: "custom" }),
      setType: (type) => set({ type: type ?? "ALL" }),
      setCategoryIds: (categoryIds) => set({ categoryIds }),
      toggleCategory: (id) =>
        set((s) => ({
          categoryIds: s.categoryIds.includes(id)
            ? s.categoryIds.filter((x) => x !== id)
            : [...s.categoryIds, id],
        })),
      setWalletIds: (walletIds) => set({ walletIds }),
      toggleWallet: (id) =>
        set((s) => ({
          walletIds: s.walletIds.includes(id)
            ? s.walletIds.filter((x) => x !== id)
            : [...s.walletIds, id],
        })),
      setSearch: (search) => set({ search }),
      setMinAmount: (minAmount) => set({ minAmount }),
      setMaxAmount: (maxAmount) => set({ maxAmount }),
      setTags: (tags) => set({ tags }),
      setIsRecurring: (isRecurring) => set({ isRecurring }),

      setActiveMonth: (date) =>
        set({
          activeMonth: date,
          startDate: startOfMonth(date),
          endDate: endOfMonth(date),
          period: "this-month",
        }),

      prevMonth: () => {
        const { activeMonth } = get()
        const prev = new Date(activeMonth)
        prev.setMonth(prev.getMonth() - 1)
        set({
          activeMonth: prev,
          startDate: startOfMonth(prev),
          endDate: endOfMonth(prev),
        })
      },

      nextMonth: () => {
        const { activeMonth } = get()
        const next = new Date(activeMonth)
        next.setMonth(next.getMonth() + 1)
        // Prevent navigating to future months beyond the current month
        const isFuture =
          next.getFullYear() > now.getFullYear() ||
          (next.getFullYear() === now.getFullYear() && next.getMonth() > now.getMonth())
        if (!isFuture) {
          set({
            activeMonth: next,
            startDate: startOfMonth(next),
            endDate: endOfMonth(next),
          })
        }
      },

      clearFilters: () =>
        set({
          type: "ALL",
          categoryIds: [],
          walletIds: [],
          search: "",
          minAmount: undefined,
          maxAmount: undefined,
          tags: [],
          isRecurring: undefined,
        }),

      getActiveFiltersCount: () => {
        const { type, categoryIds, walletIds, search, minAmount, maxAmount, tags, isRecurring } =
          get()
        let count = 0
        if (type !== "ALL") count++
        if (categoryIds.length > 0) count++
        if (walletIds.length > 0) count++
        if (search) count++
        if (minAmount !== undefined || maxAmount !== undefined) count++
        if (tags.length > 0) count++
        if (isRecurring !== undefined) count++
        return count
      },
    }),
    {
      name: "flowtrack-filters",
      partialize: (state) => ({ activeMonth: state.activeMonth }),
      onRehydrateStorage: () => (_persistedState) => {
        // startDate/endDate are re-derived at component level from activeMonth
      },
    }
  )
)
