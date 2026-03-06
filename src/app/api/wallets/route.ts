import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
export const runtime = "nodejs"
import { getWalletBalance } from "@/lib/analytics"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const walletSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["CASH", "BANK", "DIGITAL", "CREDIT", "INVESTMENT", "SAVINGS"]),
  currency: z.string().default("PEN"),
  color: z.string().default("#6366f1"),
  icon: z.string().default("wallet"),
  isDefault: z.boolean().default(false),
  includeInTotal: z.boolean().default(true),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const wallets = await prisma.wallet.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  })

  const walletsWithBalance = await Promise.all(
    wallets.map(async (w) => ({
      ...w,
      balance: await getWalletBalance(w.id),
    }))
  )

  return NextResponse.json(walletsWithBalance)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = walletSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
    }

    const wallet = await prisma.wallet.create({
      data: { ...parsed.data, userId: session.user.id },
    })

    revalidatePath("/wallets")

    return NextResponse.json({ ...wallet, balance: 0 }, { status: 201 })
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

  const existing = await prisma.wallet.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Check for transactions
  const txCount = await prisma.transaction.count({ where: { walletId: id } })
  if (txCount > 0) {
    return NextResponse.json(
      { error: "Esta billetera tiene transacciones. No puedes eliminarla." },
      { status: 409 }
    )
  }

  await prisma.wallet.delete({ where: { id } })
  revalidatePath("/wallets")

  return NextResponse.json({ success: true })
}
