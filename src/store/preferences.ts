"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface PreferencesState {
  currency: string
  locale: string
  theme: "light" | "dark" | "system"
  monthStart: number
  dateFormat: "DD/MM/YYYY" | "MM/DD/YYYY"
  balanceVisible: boolean

  setCurrency: (currency: string) => void
  setLocale: (locale: string) => void
  setTheme: (theme: "light" | "dark" | "system") => void
  setMonthStart: (day: number) => void
  setDateFormat: (format: string) => void
  setBalanceVisible: (visible: boolean) => void
  toggleBalanceVisible: () => void
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      currency: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ?? "PEN",
      locale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "es-PE",
      theme: "light",
      monthStart: 1,
      dateFormat: "DD/MM/YYYY",
      balanceVisible: true,

      setCurrency: (currency) => set({ currency }),
      setLocale: (locale) => set({ locale }),
      setTheme: (theme) => set({ theme }),
      setMonthStart: (monthStart) => set({ monthStart }),
      setDateFormat: (dateFormat: any) => set({ dateFormat }),
      setBalanceVisible: (balanceVisible) => set({ balanceVisible }),
      toggleBalanceVisible: () =>
        set((s) => ({ balanceVisible: !s.balanceVisible })),
    }),
    { name: "flowtrack-preferences" }
  )
)
