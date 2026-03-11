import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
export const runtime = "nodejs"
import { goalSchema, goalDepositSchema } from "@/lib/validations/goal"
import { calculateGoalProjection } from "@/lib/analytics"
import { revalidatePath } from "next/cache"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const goals = await prisma.savingGoal.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  const goalsWithProjection = goals.map((g) => {
    const projection = calculateGoalProjection({
      targetAmount: Number(g.targetAmount),
      currentAmount: Number(g.currentAmount),
      deadline: g.deadline,
    })
    const targetNum = Number(g.targetAmount)
    const currentNum = Number(g.currentAmount)
    const percentage =
      targetNum > 0
        ? Math.min(
            100,
            Math.round((currentNum / targetNum) * 1000) / 10
          )
        : 0
    return {
      ...g,
      targetAmount: targetNum,
      currentAmount: currentNum,
      percentage,
      ...projection,
    }
  })

  return NextResponse.json(goalsWithProjection)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const action = searchParams.get("action")

  if (action === "deposit") {
    const body = await req.json()
    const parsed = goalDepositSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
    }

    const { amount, walletId, categoryId, notes, goalId } = {
      ...parsed.data,
      goalId: searchParams.get("goalId") ?? "",
    }

    const goal = await prisma.savingGoal.findFirst({
      where: { id: goalId, userId: session.user.id },
    })
    if (!goal) return NextResponse.json({ error: "Meta no encontrada" }, { status: 404 })

    const [transaction, updatedGoal] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          amount,
          type: "SAVING",
          description: `Depósito: ${goal.name}`,
          notes: notes ?? null,
          date: new Date(),
          categoryId,
          walletId,
          userId: session.user.id,
          goalId,
          tags: [],
          attachments: [],
        },
      }),
      prisma.savingGoal.update({
        where: { id: goalId },
        data: {
          currentAmount: { increment: amount },
          status:
            Number(goal.currentAmount) + amount >= Number(goal.targetAmount)
              ? "COMPLETED"
              : "IN_PROGRESS",
        },
      }),
    ])

    revalidatePath("/goals")
    revalidatePath("/dashboard")

    return NextResponse.json({
      transaction: { ...transaction, amount: Number(transaction.amount) },
      goal: { ...updatedGoal, targetAmount: Number(updatedGoal.targetAmount), currentAmount: Number(updatedGoal.currentAmount) },
    })
  }

  try {
    const body = await req.json()
    const parsed = goalSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
    }

    const goal = await prisma.savingGoal.create({
      data: { ...parsed.data, userId: session.user.id },
    })

    revalidatePath("/goals")

    return NextResponse.json(
      { ...goal, targetAmount: Number(goal.targetAmount), currentAmount: Number(goal.currentAmount) },
      { status: 201 }
    )
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

  const existing = await prisma.savingGoal.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.savingGoal.delete({ where: { id } })
  revalidatePath("/goals")

  return NextResponse.json({ success: true })
}
