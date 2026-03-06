import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
export const runtime = "nodejs"
import { transactionSchema } from "@/lib/validations/transaction"
import { revalidatePath } from "next/cache"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const transaction = await prisma.transaction.findFirst({
    where: { id, userId: session.user.id },
    include: {
      category: true,
      wallet: true,
      goal: true,
    },
  })

  if (!transaction) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json({ ...transaction, amount: Number(transaction.amount) })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const existing = await prisma.transaction.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  try {
    const body = await req.json()
    const parsed = transactionSchema.partial().safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
    }

    const { recurringConfig, isRecurring, ...txData } = parsed.data

    const updated = await prisma.transaction.update({
      where: { id },
      data: { ...txData },
      include: { category: true, wallet: true },
    })

    revalidatePath("/dashboard")
    revalidatePath("/transactions")

    return NextResponse.json({ ...updated, amount: Number(updated.amount) })
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const existing = await prisma.transaction.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await prisma.transaction.delete({ where: { id } })

  revalidatePath("/dashboard")
  revalidatePath("/transactions")

  return NextResponse.json({ success: true })
}
