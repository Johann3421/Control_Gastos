import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export const runtime = "nodejs"

const categorySchema = z.object({
  name: z.string().min(1).max(40),
  type: z.enum(["EXPENSE", "INCOME", "SAVING", "INVESTMENT", "TRANSFER"]),
  icon: z.string().default("tag"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#6366f1"),
})

// GET /api/categories — list all categories for current user
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const categories = await prisma.category.findMany({
    where: { userId: session.user.id },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  })
  return NextResponse.json({ categories })
}

// POST /api/categories — create a new category
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = categorySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 })

  // Check for duplicate (unique constraint: userId + name + type)
  const existing = await prisma.category.findFirst({
    where: { userId: session.user.id, name: parsed.data.name, type: parsed.data.type },
  })
  if (existing) return NextResponse.json({ error: "Ya existe una categoría con ese nombre y tipo" }, { status: 409 })

  const category = await prisma.category.create({
    data: { ...parsed.data, userId: session.user.id },
  })
  return NextResponse.json({ category }, { status: 201 })
}

// PATCH /api/categories?id=xxx — update a category
export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const id = new URL(req.url).searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const existing = await prisma.category.findFirst({ where: { id, userId: session.user.id } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = await req.json()
  const parsed = categorySchema.partial().safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const category = await prisma.category.update({ where: { id }, data: parsed.data })
  return NextResponse.json({ category })
}

// DELETE /api/categories?id=xxx — delete a category
export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const id = new URL(req.url).searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const existing = await prisma.category.findFirst({ where: { id, userId: session.user.id } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Check if category has transactions
  const txCount = await prisma.transaction.count({ where: { categoryId: id } })
  if (txCount > 0) {
    return NextResponse.json(
      { error: `No se puede eliminar: tiene ${txCount} transacciones asociadas` },
      { status: 409 }
    )
  }

  await prisma.category.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
