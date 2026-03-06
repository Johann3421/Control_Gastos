import { prisma } from "@/lib/prisma"
import { getDaysInMonth } from "@/lib/utils"
import { RecurrenceFrequency } from "@prisma/client"

export async function processRecurringTransactions(userId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const pending = await prisma.recurringTransaction.findMany({
    where: {
      userId,
      active: true,
      nextDate: { lte: today },
      OR: [{ endDate: null }, { endDate: { gte: today } }],
    },
  })

  for (const rec of pending) {
    await prisma.$transaction(async (tx) => {
      await tx.transaction.create({
        data: {
          amount: rec.amount,
          type: rec.type,
          description: rec.description,
          date: rec.nextDate,
          categoryId: rec.categoryId,
          walletId: rec.walletId,
          userId,
          isRecurring: true,
          recurringId: rec.id,
          tags: [],
          attachments: [],
        },
      })

      const nextDate = calculateNextDate(
        rec.nextDate,
        rec.frequency,
        rec.dayOfMonth
      )
      await tx.recurringTransaction.update({
        where: { id: rec.id },
        data: { nextDate },
      })
    })
  }

  return pending.length
}

export function calculateNextDate(
  current: Date,
  frequency: RecurrenceFrequency,
  dayOfMonth?: number | null
): Date {
  const next = new Date(current)
  switch (frequency) {
    case "DAILY":
      next.setDate(next.getDate() + 1)
      break
    case "WEEKLY":
      next.setDate(next.getDate() + 7)
      break
    case "BIWEEKLY":
      next.setDate(next.getDate() + 14)
      break
    case "MONTHLY":
      next.setMonth(next.getMonth() + 1)
      if (dayOfMonth) {
        next.setDate(Math.min(dayOfMonth, getDaysInMonth(next)))
      }
      break
    case "QUARTERLY":
      next.setMonth(next.getMonth() + 3)
      break
    case "YEARLY":
      next.setFullYear(next.getFullYear() + 1)
      break
  }
  return next
}

export function getFrequencyLabel(frequency: RecurrenceFrequency): string {
  const labels: Record<RecurrenceFrequency, string> = {
    DAILY: "Diario",
    WEEKLY: "Semanal",
    BIWEEKLY: "Quincenal",
    MONTHLY: "Mensual",
    QUARTERLY: "Trimestral",
    YEARLY: "Anual",
  }
  return labels[frequency]
}
