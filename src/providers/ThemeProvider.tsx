"use client"

import { useEffect } from "react"
import { usePreferencesStore } from "@/store/preferences"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = usePreferencesStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement
    const applyTheme = (t: string) => {
      if (t === "dark") {
        root.classList.add("dark")
      } else if (t === "light") {
        root.classList.remove("dark")
      } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        root.classList.toggle("dark", prefersDark)
      }
    }
    applyTheme(theme)

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)")
      const handler = (e: MediaQueryListEvent) =>
        root.classList.toggle("dark", e.matches)
      mq.addEventListener("change", handler)
      return () => mq.removeEventListener("change", handler)
    }
  }, [theme])

  return <>{children}</>
}
