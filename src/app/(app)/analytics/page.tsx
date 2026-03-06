// auth is dynamically imported inside the component to avoid bundling Node-only
// modules into Edge runtime chunks
import { prisma } from "@/lib/prisma"
import { getMonthlyChartData } from "@/lib/analytics"
import { AnalyticsClient } from "@/components/analytics/AnalyticsClient"
import { startOfMonth, endOfMonth, subMonths } from "date-fns"

export const dynamic = "force-dynamic"

export default async function AnalyticsPage() {
  const { auth } = await import("@/lib/auth")
  const session = await auth()
  const userId = session!.user!.id!

  const now = new Date()
  const start = startOfMonth(subMonths(now, 5))
  const end = endOfMonth(now)

  const [chartData, txData] = await Promise.all([
    getMonthlyChartData(userId, 6),
    prisma.transaction.findMany({
      where: { userId, date: { gte: start, lte: end } },
      include: { category: true },
      orderBy: { date: "asc" },
    }),
  ])

  // Category breakdown
  const categoryMap = new Map<string, { name: string; color: string; icon: string; income: number; expense: number }>()
  for (const tx of txData) {
    if (!tx.categoryId || !tx.category) continue
    const existing = categoryMap.get(tx.categoryId) ?? {
      name: tx.category.name,
      color: tx.category.color,
      icon: tx.category.icon,
      income: 0,
      expense: 0,
    }
    if (tx.type === "INCOME") existing.income += tx.amount
    else if (tx.type === "EXPENSE") existing.expense += tx.amount
    categoryMap.set(tx.categoryId, existing)
  }

  const categoryBreakdown = [...categoryMap.entries()]
    .map(([id, data]) => ({ id, ...data, total: data.expense }))
    .sort((a, b) => b.expense - a.expense)

  return (
    <AnalyticsClient
      chartData={chartData}
      categoryBreakdown={categoryBreakdown}
    />
  )
}
