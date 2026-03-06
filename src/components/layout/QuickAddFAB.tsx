"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Plus, X, TrendingDown, TrendingUp, PiggyBank, TrendingUpIcon as Investment } from "lucide-react"
import { useState } from "react"
import { useUIStore } from "@/store/ui"

const options = [
  { label: "Gasto", color: "bg-expense-500", icon: TrendingDown, type: "EXPENSE" },
  { label: "Ingreso", color: "bg-income-500", icon: TrendingUp, type: "INCOME" },
  { label: "Ahorro", color: "bg-saving-500", icon: PiggyBank, type: "SAVING" },
  { label: "Inversión", color: "bg-investment-500", icon: Investment, type: "INVESTMENT" },
]

export function QuickAddFAB() {
  const [expanded, setExpanded] = useState(false)
  const { openTransactionForm } = useUIStore()

  return (
    <div className="fixed bottom-6 right-6 z-40 lg:hidden flex flex-col-reverse items-end gap-2">
      <motion.button
        onClick={() => setExpanded(!expanded)}
        className="w-14 h-14 rounded-full bg-primary-500 hover:bg-primary-600 text-white shadow-lg flex items-center justify-center"
        animate={{ rotate: expanded ? 45 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      <AnimatePresence>
        {expanded &&
          options.map((opt, i) => (
            <motion.div
              key={opt.type}
              initial={{ opacity: 0, scale: 0.5, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.5, x: 20 }}
              transition={{ delay: i * 0.05, duration: 0.15 }}
              className="flex items-center gap-2"
            >
              <span className="bg-white dark:bg-dark-800 text-ink-primary dark:text-ink-inverse text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
                {opt.label}
              </span>
              <button
                onClick={() => {
                  openTransactionForm(opt.type as any)
                  setExpanded(false)
                }}
                className={`w-11 h-11 rounded-full ${opt.color} text-white shadow flex items-center justify-center`}
              >
                <opt.icon className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  )
}
