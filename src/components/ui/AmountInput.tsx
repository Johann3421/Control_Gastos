"use client"

import { useState, useRef, forwardRef } from "react"
import { cn } from "@/lib/utils"
import { getCurrencySymbol } from "@/lib/currency"

interface AmountInputProps {
  value: string
  onChange: (value: string) => void
  currency?: string
  className?: string
  placeholder?: string
  large?: boolean
  autoFocus?: boolean
  label?: string
  error?: string
}

export const AmountInput = forwardRef<HTMLInputElement, AmountInputProps>(
  ({ value, onChange, currency = "PEN", className, placeholder, large, autoFocus, label, error }, ref) => {
    const symbol = getCurrencySymbol(currency)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9.]/g, "")
      const parts = raw.split(".")
      if (parts.length > 2) return
      if (parts[1]?.length > 2) return
      onChange(raw)
    }

    const displayValue = value
      ? parseFloat(value).toLocaleString("es-PE", {
          minimumFractionDigits: value.includes(".") ? (value.split(".")[1]?.length ?? 0) : 0,
          maximumFractionDigits: 2,
        })
      : ""

    return (
      <div>
        {label && <label className="block text-xs font-medium text-ink-secondary dark:text-ink-muted mb-1">{label}</label>}
        <div
          className={cn(
            "relative flex items-center bg-surface-50 dark:bg-dark-700 border border-surface-300 dark:border-dark-500 rounded-xl overflow-hidden focus-within:border-primary-500 transition-all",
            className
          )}
        >
          <span
            className={cn(
              "pl-4 text-ink-tertiary font-mono select-none",
              large ? "text-2xl" : "text-sm"
            )}
          >
            {symbol}
          </span>
          <input
            ref={ref}
            type="text"
            inputMode="decimal"
            value={value}
            onChange={handleChange}
            placeholder={placeholder ?? "0.00"}
            autoFocus={autoFocus}
            aria-label={`Monto en ${currency}`}
            className={cn(
              "flex-1 pl-2 pr-4 py-2.5 bg-transparent font-mono text-ink-primary dark:text-ink-inverse placeholder-ink-tertiary focus:outline-none tabular-nums",
              large ? "text-3xl font-bold py-3" : "text-sm"
            )}
          />
        </div>
        {error && <p className="text-xs text-expense-500 mt-1">{error}</p>}
      </div>
    )
  }
)
AmountInput.displayName = "AmountInput"
