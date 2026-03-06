"use client"

import { create } from "zustand"

interface UIState {
  // Modals & drawers
  isQuickAddOpen: boolean
  isTransactionFormOpen: boolean
  editingTransactionId: string | null
  isTransferModalOpen: boolean
  isGoalDepositModalOpen: boolean
  depositGoalId: string | null
  isImportModalOpen: boolean
  isBulkActionsVisible: boolean
  selectedTransactionIds: string[]

  // View state
  transactionView: "grouped" | "list" | "compact"
  sidebarCollapsed: boolean
  transactionFormType: string | null

  // Filter panel
  isAdvancedFiltersOpen: boolean

  // Mobile menu
  mobileMenuOpen: boolean

  // Category filter from donut
  highlightedCategoryId: string | null

  // Actions
  openQuickAdd: () => void
  closeQuickAdd: () => void
  openTransactionForm: (idOrType?: string) => void
  closeTransactionForm: () => void
  openTransferModal: () => void
  closeTransferModal: () => void
  openGoalDeposit: (goalId: string) => void
  closeGoalDeposit: () => void
  openImportModal: () => void
  closeImportModal: () => void
  setTransactionView: (view: "grouped" | "list" | "compact") => void
  toggleSidebar: () => void
  toggleAdvancedFilters: () => void
  selectTransaction: (id: string) => void
  deselectTransaction: (id: string) => void
  selectAllTransactions: (ids: string[]) => void
  clearSelection: () => void
  setHighlightedCategory: (id: string | null) => void
  setMobileMenuOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set, get) => ({
  isQuickAddOpen: false,
  isTransactionFormOpen: false,
  editingTransactionId: null,
  isTransferModalOpen: false,
  isGoalDepositModalOpen: false,
  depositGoalId: null,
  isImportModalOpen: false,
  isBulkActionsVisible: false,
  selectedTransactionIds: [],
  transactionView: "grouped",
  sidebarCollapsed: false,
  transactionFormType: null,
  isAdvancedFiltersOpen: false,
  mobileMenuOpen: false,
  highlightedCategoryId: null,

  openQuickAdd: () => set({ isQuickAddOpen: true }),
  closeQuickAdd: () => set({ isQuickAddOpen: false }),

  openTransactionForm: (idOrType) => {
    const types = ["EXPENSE", "INCOME", "SAVING", "INVESTMENT", "TRANSFER"]
    if (idOrType && types.includes(idOrType)) {
      set({ isTransactionFormOpen: true, editingTransactionId: null, transactionFormType: idOrType })
    } else {
      set({ isTransactionFormOpen: true, editingTransactionId: idOrType ?? null, transactionFormType: null })
    }
  },
  closeTransactionForm: () =>
    set({ isTransactionFormOpen: false, editingTransactionId: null, transactionFormType: null }),

  openTransferModal: () => set({ isTransferModalOpen: true }),
  closeTransferModal: () => set({ isTransferModalOpen: false }),

  openGoalDeposit: (goalId) =>
    set({ isGoalDepositModalOpen: true, depositGoalId: goalId }),
  closeGoalDeposit: () =>
    set({ isGoalDepositModalOpen: false, depositGoalId: null }),

  openImportModal: () => set({ isImportModalOpen: true }),
  closeImportModal: () => set({ isImportModalOpen: false }),

  setTransactionView: (view) => set({ transactionView: view }),
  toggleSidebar: () =>
    set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  toggleAdvancedFilters: () =>
    set((s) => ({ isAdvancedFiltersOpen: !s.isAdvancedFiltersOpen })),

  selectTransaction: (id) =>
    set((s) => ({
      selectedTransactionIds: [...s.selectedTransactionIds, id],
      isBulkActionsVisible: true,
    })),

  deselectTransaction: (id) =>
    set((s) => {
      const ids = s.selectedTransactionIds.filter((i) => i !== id)
      return { selectedTransactionIds: ids, isBulkActionsVisible: ids.length > 0 }
    }),

  selectAllTransactions: (ids) =>
    set({ selectedTransactionIds: ids, isBulkActionsVisible: ids.length > 0 }),

  clearSelection: () =>
    set({ selectedTransactionIds: [], isBulkActionsVisible: false }),

  setHighlightedCategory: (id) => set({ highlightedCategoryId: id }),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
}))
