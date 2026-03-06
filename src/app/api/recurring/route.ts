import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
export const runtime = "nodejs"
import { revalidatePath } from "next/cache"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const recurringTx = await prisma.recurringTransaction.findMany({
    where: { userId: session.user.id },
    include: {
      transactions: {
        orderBy: { date: "desc" },
        take: 1,
        select: { amount: true, date: true },
      },
    },
    orderBy: { nextDate: "asc" },
  })

  return NextResponse.json(
    recurringTx.map((r) => ({
      ...r,
      amount: Number(r.amount),
      lastTransaction: r.transactions[0]
        ? {
            amount: Number(r.transactions[0].amount),
            date: r.transactions[0].date,
          }
        : null,
    }))
  )
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 })

  const existing = await prisma.recurringTransaction.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = await req.json()
  const updated = await prisma.recurringTransaction.update({
    where: { id },
    data: { active: body.active ?? !existing.active },
  })

  revalidatePath("/recurring")

  return NextResponse.json({ ...updated, amount: Number(updated.amount) })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 })

  const existing = await prisma.recurringTransaction.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.recurringTransaction.update({
    where: { id },
    data: { active: false },
  })

  revalidatePath("/recurring")

  return NextResponse.json({ success: true })
}
