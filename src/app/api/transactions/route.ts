import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
export const runtime = "nodejs"
import { transactionSchema } from "@/lib/validations/transaction"
import { processRecurringTransactions } from "@/lib/recurring"
import { revalidatePath } from "next/cache"
import { startOfMonth, endOfMonth } from "date-fns"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Process any due recurring transactions
  await processRecurringTransactions(session.user.id).catch(() => {})

  const { searchParams } = new URL(req.url)
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")
  const type = searchParams.get("type")
  const categoryId = searchParams.get("categoryId")
  const walletId = searchParams.get("walletId")
  const search = searchParams.get("search")
  const page = parseInt(searchParams.get("page") ?? "1")
  const limit = parseInt(searchParams.get("limit") ?? "50")

  const where: Record<string, unknown> = {
    userId: session.user.id,
  }

  if (startDate && endDate) {
    where.date = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    }
  } else {
    const now = new Date()
    where.date = {
      gte: startOfMonth(now),
      lte: endOfMonth(now),
    }
  }

  if (type && type !== "ALL") where.type = type
  if (categoryId) where.categoryId = categoryId
  if (walletId) where.walletId = walletId
  if (search) {
    where.description = { contains: search, mode: "insensitive" }
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, icon: true, color: true, type: true } },
        wallet: { select: { id: true, name: true, icon: true, color: true, type: true } },
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ])

  return NextResponse.json({
    transactions: transactions.map((t) => ({
      ...t,
      amount: Number(t.amount),
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = transactionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { recurringConfig, isRecurring, ...txData } = parsed.data
    const userId = session.user.id

    const transaction = await prisma.$transaction(async (tx) => {
      let recurringId: string | undefined

    if (isRecurring && recurringConfig) {
        const recurring = await tx.recurringTransaction.create({
          data: {
            description: txData.description,
            amount: txData.amount,
            type: txData.type,
            frequency: recurringConfig.frequency,
            startDate: txData.date,
            endDate: recurringConfig.endDate ?? null,
            nextDate: txData.date,
            dayOfMonth: recurringConfig.dayOfMonth ?? null,
            categoryId: txData.categoryId,
            walletId: txData.walletId,
            userId,
          },
        })
        recurringId = recurring.id
      }

      return tx.transaction.create({
        data: {
          ...txData,
          isRecurring: isRecurring ?? false,
          userId,
          recurringId: recurringId ?? null,
        },
        include: {
          category: true,
          wallet: true,
        },
      })
    })

    revalidatePath("/dashboard")
    revalidatePath("/transactions")

    return NextResponse.json(
      { ...transaction, amount: Number(transaction.amount) },
      { status: 201 }
    )
  } catch (err) {
    console.error("Transaction POST error:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
