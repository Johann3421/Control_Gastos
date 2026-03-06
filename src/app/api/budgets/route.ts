import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
export const runtime = "nodejs"
import { budgetSchema } from "@/lib/validations/budget"
import { getBudgetUsage } from "@/lib/analytics"
import { revalidatePath } from "next/cache"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const budgets = await prisma.budget.findMany({
    where: { userId: session.user.id },
    include: {
      category: { select: { id: true, name: true, icon: true, color: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const budgetsWithUsage = await Promise.all(
    budgets.map(async (b) => {
      const usage = await getBudgetUsage(b.id, session.user.id)
      return {
        ...b,
        amount: Number(b.amount),
        ...usage,
        budget: undefined,
      }
    })
  )

  return NextResponse.json(budgetsWithUsage)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = budgetSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
    }

    const budget = await prisma.budget.create({
      data: { ...parsed.data, userId: session.user.id },
      include: { category: true },
    })

    revalidatePath("/budgets")
    revalidatePath("/dashboard")

    return NextResponse.json({ ...budget, amount: Number(budget.amount) }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 })

  const existing = await prisma.budget.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.budget.delete({ where: { id } })
  revalidatePath("/budgets")

  return NextResponse.json({ success: true })
}
