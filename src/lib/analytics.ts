import { prisma } from "@/lib/prisma"
import { getPeriodDates, getDaysInMonth } from "@/lib/utils"
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns"

export async function getWalletBalance(walletId: string): Promise<number> {
  const [incomes, expenses, transfersIn, transfersOut] = await Promise.all([
    prisma.transaction.aggregate({
      where: { walletId, type: { in: ["INCOME", "SAVING", "INVESTMENT"] } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { walletId, type: "EXPENSE" },
      _sum: { amount: true },
    }),
    prisma.transfer.aggregate({
      where: { toId: walletId },
      _sum: { amountTo: true },
    }),
    prisma.transfer.aggregate({
      where: { fromId: walletId },
      _sum: { amount: true },
    }),
  ])

  return (
    Number(incomes._sum.amount ?? 0) -
    Number(expenses._sum.amount ?? 0) +
    Number(transfersIn._sum.amountTo ?? 0) -
    Number(transfersOut._sum.amount ?? 0)
  )
}

export async function getBudgetUsage(budgetId: string, userId: string) {
  const budget = await prisma.budget.findUnique({
    where: { id: budgetId },
    include: { category: true },
  })
  if (!budget) throw new Error("Budget not found")

  const { start, end } = getPeriodDates(budget.period, budget.startDate)

  const spent = await prisma.transaction.aggregate({
    where: {
      userId,
      type: "EXPENSE",
      categoryId: budget.categoryId ?? undefined,
      date: { gte: start, lte: end },
    },
    _sum: { amount: true },
  })

  const usedAmount = Number(spent._sum.amount ?? 0)
  const percentage = (usedAmount / Number(budget.amount)) * 100

  return {
    budget,
    usedAmount,
    remainingAmount: Math.max(0, Number(budget.amount) - usedAmount),
    percentage: Math.round(percentage * 10) / 10,
    isExceeded: usedAmount > Number(budget.amount),
    status:
      percentage >= 100 ? "EXCEEDED" : percentage >= 80 ? "WARNING" : "OK",
  }
}

export async function getDashboardStats(
  userId: string,
  start: Date,
  end: Date
) {
  const [transactions, prevTransactions] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId, date: { gte: start, lte: end } },
      include: { category: true, wallet: true },
      orderBy: { date: "desc" },
    }),
    prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startOfMonth(subMonths(start, 1)),
          lte: endOfMonth(subMonths(start, 1)),
        },
      },
    }),
  ])

  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((acc, t) => acc + Number(t.amount), 0)

  const totalExpense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((acc, t) => acc + Number(t.amount), 0)

  const totalSaving = transactions
    .filter((t) => t.type === "SAVING")
    .reduce((acc, t) => acc + Number(t.amount), 0)

  const totalInvestment = transactions
    .filter((t) => t.type === "INVESTMENT")
    .reduce((acc, t) => acc + Number(t.amount), 0)

  const prevIncome = prevTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((acc, t) => acc + Number(t.amount), 0)

  const prevExpense = prevTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((acc, t) => acc + Number(t.amount), 0)

  const netSaving = totalIncome - totalExpense
  const savingRate = totalIncome > 0 ? (netSaving / totalIncome) * 100 : 0

  const incomeChange =
    prevIncome > 0 ? ((totalIncome - prevIncome) / prevIncome) * 100 : 0
  const expenseChange =
    prevExpense > 0
      ? ((totalExpense - prevExpense) / prevExpense) * 100
      : 0

  // Category breakdown
  const categoryMap = new Map<
    string,
    { name: string; color: string; icon: string; total: number }
  >()
  for (const t of transactions.filter((t) => t.type === "EXPENSE")) {
    const key = t.categoryId
    const existing = categoryMap.get(key)
    if (existing) {
      existing.total += Number(t.amount)
    } else {
      categoryMap.set(key, {
        name: t.category.name,
        color: t.category.color,
        icon: t.category.icon,
        total: Number(t.amount),
      })
    }
  }

  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.total - a.total)

  const biggestExpenseCategory = categoryBreakdown[0] ?? null

  return {
    totalIncome,
    totalExpense,
    totalSaving,
    totalInvestment,
    netSaving,
    savingRate: Math.round(savingRate * 10) / 10,
    transactionCount: transactions.length,
    incomeCount: transactions.filter((t) => t.type === "INCOME").length,
    expenseCount: transactions.filter((t) => t.type === "EXPENSE").length,
    incomeChange: Math.round(incomeChange * 10) / 10,
    expenseChange: Math.round(expenseChange * 10) / 10,
    categoryBreakdown,
    biggestExpenseCategory,
    dailyAverage:
      transactions.filter((t) => t.type === "EXPENSE").length > 0
        ? totalExpense / Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
        : 0,
    recentTransactions: transactions.slice(0, 7),
  }
}

export async function getMonthlyChartData(userId: string, months = 6) {
  const result = []
  const now = new Date()

  for (let i = months - 1; i >= 0; i--) {
    const date = subMonths(now, i)
    const start = startOfMonth(date)
    const end = endOfMonth(date)

    const [income, expense] = await Promise.all([
      prisma.transaction.aggregate({
        where: { userId, type: "INCOME", date: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, type: "EXPENSE", date: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
    ])

    const incomeVal = Number(income._sum.amount ?? 0)
    const expenseVal = Number(expense._sum.amount ?? 0)

    result.push({
      month: format(date, "MMM yy"),
      income: incomeVal,
      expense: expenseVal,
      balance: incomeVal - expenseVal,
    })
  }

  return result
}

export function calculateGoalProjection(goal: {
  targetAmount: number | string
  currentAmount: number | string
  deadline?: Date | null
}) {
  const remaining = Number(goal.targetAmount) - Number(goal.currentAmount)
  const today = new Date()

  if (!goal.deadline) {
    return { remaining, monthsNeeded: null, monthlyRequired: null, daysLeft: null }
  }

  const daysLeft = Math.ceil(
    (goal.deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )
  const monthsLeft = daysLeft / 30
  const monthlyRequired = monthsLeft > 0 ? remaining / monthsLeft : Infinity

  return {
    remaining,
    daysLeft,
    monthsLeft: Math.round(monthsLeft * 10) / 10,
    monthlyRequired: Math.round(monthlyRequired * 100) / 100,
  }
}
