// auth is dynamically imported inside the component to avoid bundling Node-only
// modules into Edge runtime chunks
import { prisma } from "@/lib/prisma"
import { BudgetsClient } from "@/components/budgets/BudgetsClient"
import { startOfMonth, endOfMonth } from "date-fns"

export const dynamic = "force-dynamic"

export default async function BudgetsPage() {
  const { auth } = await import("@/lib/auth")
  const session = await auth()
  const userId = session!.user!.id!

  const now = new Date()
  const start = startOfMonth(now)
  const end = endOfMonth(now)

    const [budgets, categories] = await Promise.all([
      prisma.budget.findMany({
        where: { userId },
        include: { category: true },
        orderBy: { createdAt: "desc" },
      }),
    prisma.category.findMany({
      where: { OR: [{ userId }, { isDefault: true }] },
      orderBy: { name: "asc" },
      select: { id: true, name: true, icon: true },
    }),
  ])

  // Calculate spent per budget
  const budgetCategoryIds = budgets.filter((b) => b.categoryId).map((b) => b.categoryId!)
  const spent = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      userId,
      type: "EXPENSE",
      categoryId: { in: budgetCategoryIds },
      date: { gte: start, lte: end },
    },
    _sum: { amount: true },
  })
  const spentMap = new Map(spent.map((s) => [s.categoryId, s._sum.amount ?? 0]))

  const budgetsWithUsage = budgets.map((b) => ({
    ...b,
    spent: b.categoryId ? (spentMap.get(b.categoryId) ?? 0) : 0,
    percentageUsed:
      b.amount > 0
        ? ((b.categoryId ? (spentMap.get(b.categoryId) ?? 0) : 0) / b.amount) * 100
        : 0,
    isOverBudget:
      b.amount > 0 && (b.categoryId ? (spentMap.get(b.categoryId) ?? 0) : 0) > b.amount,
  }))

  return <BudgetsClient budgets={budgetsWithUsage as any} categories={categories} />
}
