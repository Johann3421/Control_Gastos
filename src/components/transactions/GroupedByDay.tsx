"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"
import { TransactionRow } from "./TransactionRow"
import { useUIStore } from "@/store/ui"
import type { TransactionWithRelations } from "@/types"

interface GroupedByDayProps {
  transactions: TransactionWithRelations[]
  onDelete?: (id: string) => void
}

export function GroupedByDay({ transactions, onDelete }: GroupedByDayProps) {
  const { selectedTransactionIds, selectTransaction, deselectTransaction } = useUIStore()

  // Group by date
  const groups = new Map<string, TransactionWithRelations[]>()
  for (const tx of transactions) {
    const key = format(new Date(tx.date), "yyyy-MM-dd")
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(tx)
  }

  const handleSelect = (id: string, checked: boolean) => {
    if (checked) selectTransaction(id)
    else deselectTransaction(id)
  }

  return (
    <div className="space-y-4">
      {[...groups.entries()].map(([dateKey, txs]) => (
        <div key={dateKey}>
          <div className="px-4 py-1.5">
            <span className="text-xs font-semibold text-ink-tertiary capitalize">
              {format(new Date(dateKey + "T12:00:00"), "EEEE, d 'de' MMMM", {
                locale: es,
              })}
            </span>
          </div>
          <div className="space-y-0.5">
            {txs.map((tx) => (
              <TransactionRow
                key={tx.id}
                transaction={tx}
                isSelected={selectedTransactionIds.includes(tx.id)}
                onSelect={handleSelect}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
