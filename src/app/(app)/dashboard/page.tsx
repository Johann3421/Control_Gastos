// auth is dynamically imported inside the component to avoid bundling Node-only
// modules into Edge runtime chunks
import { getDashboardStats, getMonthlyChartData } from "@/lib/analytics"
import { prisma } from "@/lib/prisma"
import { BalanceHero } from "@/components/dashboard/BalanceHero"
import { SummaryCards } from "@/components/dashboard/SummaryCards"
import { SpendingChart } from "@/components/dashboard/SpendingChart"
import { CategoryDonut } from "@/components/dashboard/CategoryDonut"
import { WalletCards } from "@/components/dashboard/WalletCards"
import { RecentTransactions } from "@/components/dashboard/RecentTransactions"
import { BudgetAlerts } from "@/components/dashboard/BudgetAlerts"
import { GoalProgress } from "@/components/dashboard/GoalProgress"
import { startOfMonth, endOfMonth } from "date-fns"
import { serializePrisma, toNumberSafe } from "@/lib/serialize"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const { auth } = await import("@/lib/auth")
  const session = await auth()
  const userId = session!.user!.id!

  const now = new Date()
  const start = startOfMonth(now)
  const end = endOfMonth(now)

  const [stats, chartData, wallets, recentTxs, budgets, goals, categoryStats] =
    await Promise.all([
      getDashboardStats(userId, start, end),
      getMonthlyChartData(userId, 6),
      prisma.wallet.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
      }),
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { date: "desc" },
        take: 8,
        include: { category: true, wallet: true },
      }),
      prisma.budget.findMany({
        where: { userId },
        include: { category: true },
      }),
      prisma.savingGoal.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.transaction.groupBy({
        by: ["categoryId"],
        where: {
          userId,
          type: "EXPENSE",
          date: { gte: start, lte: end },
        },
        _sum: { amount: true },
        orderBy: { _sum: { amount: "desc" } },
        take: 6,
      }),
    ])

  // wallet balances
  const walletIds = wallets.map((w) => w.id)
  const balanceAgg = await prisma.transaction.groupBy({
    by: ["walletId"],
    where: { userId, walletId: { in: walletIds } },
    _sum: { amount: true },
  })
  const walletBalanceTxs = await prisma.transaction.groupBy({
    by: ["walletId", "type"],
    where: { userId, walletId: { in: walletIds } },
    _sum: { amount: true },
  })
  const walletBalances = new Map<string, number>()
  for (const row of walletBalanceTxs) {
    const cur = walletBalances.get(row.walletId) ?? 0
    const amt = toNumberSafe((row._sum as any).amount ?? 0)
    if (row.type === "INCOME") walletBalances.set(row.walletId, cur + amt)
    else walletBalances.set(row.walletId, cur - amt)
  }
  const walletsWithBalance = wallets.map((w) => ({
    ...w,
    balance: toNumberSafe(walletBalances.get(w.id) ?? 0),
  }))

  const recentTxsPlain = recentTxs.map((t) => ({
    ...t,
    amount: toNumberSafe((t as any).amount ?? 0),
    category: t.category ? { ...t.category } : null,
    wallet: t.wallet ? { ...t.wallet, balance: toNumberSafe((t.wallet as any).balance ?? 0) } : null,
  }))

  // budget spent amounts
  const budgetCategoryIds = budgets
    .filter((b) => b.categoryId)
    .map((b) => b.categoryId!)
  const budgetSpent = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      userId,
      type: "EXPENSE",
      categoryId: { in: budgetCategoryIds },
      date: { gte: start, lte: end },
    },
    _sum: { amount: true },
  })
  const spentMap = new Map(
    budgetSpent.map((b) => [b.categoryId, toNumberSafe((b._sum as any).amount ?? 0)])
  )
  const budgetsWithUsage = budgets.map((b) => {
    const spent = b.categoryId ? (spentMap.get(b.categoryId) ?? 0) : 0
    const amount = toNumberSafe(b.amount)
    return {
      ...b,
      amount,
      spent,
      percentageUsed: amount > 0 ? (spent / amount) * 100 : 0,
      isOverBudget: spent > amount,
    }
  })

  // goals progress
  const goalsWithProgress = goals.map((g) => {
    const targetAmount = toNumberSafe((g as any).targetAmount)
    const currentAmount = toNumberSafe((g as any).currentAmount)
    return {
      ...g,
      targetAmount,
      currentAmount,
      progressPercentage: targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0,
    }
  })

  // category data for donut
  const catIds = categoryStats
    .filter((c) => c.categoryId)
    .map((c) => c.categoryId!)
  const categories = await prisma.category.findMany({
    where: { id: { in: catIds } },
    select: { id: true, name: true, color: true },
  })
  const totalExpenses = categoryStats.reduce((sum, c) => sum + toNumberSafe((c._sum as any).amount ?? 0), 0)
  const categoryData = categoryStats
    .filter((c) => c.categoryId)
    .map((c) => {
      const cat = categories.find((x) => x.id === c.categoryId)
      const total = toNumberSafe((c._sum as any).amount ?? 0)
      return {
        id: c.categoryId!,
        name: cat?.name ?? "Otro",
        color: cat?.color ?? "#94a3b8",
        total,
        percentage: totalExpenses > 0 ? (total / totalExpenses) * 100 : 0,
      }
    })

  const statsPlain = serializePrisma(stats)
  // Ensure components expecting month-specific keys receive them
  const statsWithExtras = {
    ...statsPlain,
    monthIncome: (statsPlain as any).totalIncome ?? 0,
    monthExpenses: (statsPlain as any).totalExpense ?? 0,
    monthSavings: (statsPlain as any).totalSaving ?? 0,
    monthInvestments: (statsPlain as any).totalInvestment ?? 0,
    totalBalance: walletsWithBalance.reduce((s: number, w: any) => s + (w.balance ?? 0), 0),
  }
  const chartDataPlain = serializePrisma(chartData)
  const walletsPlain = serializePrisma(walletsWithBalance)
  const recentTxsPlainFinal = serializePrisma(recentTxsPlain)
  const budgetsPlain = serializePrisma(budgetsWithUsage)
  const goalsPlain = serializePrisma(goalsWithProgress)
  const categoryDataPlain = serializePrisma(categoryData)

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Row 1: Balance + Summary */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-1">
          <BalanceHero stats={statsWithExtras} />
        </div>
        <div className="xl:col-span-2">
          <SummaryCards stats={statsWithExtras} />
        </div>
      </div>

      {/* Row 2: Chart + Donut */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <SpendingChart data={chartDataPlain} />
        </div>
        <div className="xl:col-span-1">
          <CategoryDonut data={categoryDataPlain} />
        </div>
      </div>

      {/* Row 3: Wallets + Recent Transactions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-1">
          <WalletCards wallets={walletsPlain} />
        </div>
        <div className="xl:col-span-2">
          <RecentTransactions transactions={recentTxsPlainFinal as any} />
        </div>
      </div>

      {/* Row 4: Budgets + Goals */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <BudgetAlerts budgets={budgetsPlain as any} />
        <GoalProgress goals={goalsPlain as any} />
      </div>
    </div>
  )
}
