import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
export const runtime = "nodejs"
import { getDashboardStats, getMonthlyChartData } from "@/lib/analytics"
import { startOfMonth, endOfMonth } from "date-fns"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")
  const type = searchParams.get("type") ?? "dashboard"

  const now = new Date()
  const start = startDate ? new Date(startDate) : startOfMonth(now)
  const end = endDate ? new Date(endDate) : endOfMonth(now)

  if (type === "monthly-chart") {
    const months = parseInt(searchParams.get("months") ?? "6")
    const data = await getMonthlyChartData(session.user.id, months)
    return NextResponse.json(data)
  }

  const stats = await getDashboardStats(session.user.id, start, end)

  return NextResponse.json({
    ...stats,
    recentTransactions: stats.recentTransactions.map((t) => ({
      ...t,
      amount: Number(t.amount),
    })),
  })
}
