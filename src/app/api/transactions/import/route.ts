import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
export const runtime = "nodejs"
import { revalidatePath } from "next/cache"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { transactions } = body as {
      transactions: Array<{
        amount: number
        type: string
        description: string
        date: string
        categoryId: string
        walletId: string
        tags?: string[]
      }>
    }

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return NextResponse.json({ error: "No hay transacciones para importar" }, { status: 400 })
    }

    // Validate ownership of categories and wallets
    const categoryIds = [...new Set(transactions.map((t) => t.categoryId))]
    const walletIds = [...new Set(transactions.map((t) => t.walletId))]

    const [categories, wallets] = await Promise.all([
      prisma.category.findMany({
        where: { id: { in: categoryIds }, userId: session.user.id },
        select: { id: true },
      }),
      prisma.wallet.findMany({
        where: { id: { in: walletIds }, userId: session.user.id },
        select: { id: true },
      }),
    ])

    const validCategoryIds = new Set(categories.map((c) => c.id))
    const validWalletIds = new Set(wallets.map((w) => w.id))

    const validTransactions = transactions.filter(
      (t) => validCategoryIds.has(t.categoryId) && validWalletIds.has(t.walletId)
    )

    if (validTransactions.length === 0) {
      return NextResponse.json({ error: "Ninguna transacción válida" }, { status: 400 })
    }

    await prisma.transaction.createMany({
      data: validTransactions.map((t) => ({
        amount: t.amount,
        type: t.type as "INCOME" | "EXPENSE" | "SAVING" | "INVESTMENT" | "TRANSFER",
        description: t.description,
        date: new Date(t.date),
        categoryId: t.categoryId,
        walletId: t.walletId,
        userId: session.user.id,
        tags: t.tags ?? [],
        attachments: [],
      })),
    })

    revalidatePath("/transactions")
    revalidatePath("/dashboard")

    return NextResponse.json({
      imported: validTransactions.length,
      skipped: transactions.length - validTransactions.length,
    })
  } catch {
    return NextResponse.json({ error: "Error al importar" }, { status: 500 })
  }
}
