import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
export const runtime = "nodejs"
import { z } from "zod"

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  currency: z.string().default("PEN"),
})

// Default categories for new users
const DEFAULT_EXPENSE_CATEGORIES = [
  { name: "Vivienda", icon: "home", color: "#6366f1" },
  { name: "Alimentación", icon: "shopping-cart", color: "#10b981" },
  { name: "Transporte", icon: "car", color: "#f59e0b" },
  { name: "Salud", icon: "heart", color: "#f43f5e" },
  { name: "Educación", icon: "graduation-cap", color: "#8b5cf6" },
  { name: "Entretenimiento", icon: "film", color: "#ec4899" },
  { name: "Ropa y Personal", icon: "shirt", color: "#14b8a6" },
  { name: "Tecnología", icon: "smartphone", color: "#0ea5e9" },
  { name: "Deudas y Préstamos", icon: "credit-card", color: "#ef4444" },
  { name: "Regalos", icon: "gift", color: "#a855f7" },
]

const DEFAULT_INCOME_CATEGORIES = [
  { name: "Sueldo", icon: "briefcase", color: "#10b981" },
  { name: "Freelance", icon: "laptop", color: "#6366f1" },
  { name: "Intereses", icon: "trending-up", color: "#f59e0b" },
  { name: "Otros ingresos", icon: "plus-circle", color: "#94a3b8" },
]

const DEFAULT_SAVING_CATEGORIES = [
  { name: "Ahorro general", icon: "piggy-bank", color: "#f59e0b" },
]

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { name, email, password, currency } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: "Este email ya está registrado" },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, currency },
    })

    // Create default categories
    const categoryData = [
      ...DEFAULT_EXPENSE_CATEGORIES.map((c) => ({
        ...c,
        type: "EXPENSE" as const,
        isDefault: true,
        userId: user.id,
      })),
      ...DEFAULT_INCOME_CATEGORIES.map((c) => ({
        ...c,
        type: "INCOME" as const,
        isDefault: true,
        userId: user.id,
      })),
      ...DEFAULT_SAVING_CATEGORIES.map((c) => ({
        ...c,
        type: "SAVING" as const,
        isDefault: true,
        userId: user.id,
      })),
    ]

    await prisma.category.createMany({ data: categoryData })

    // Create default wallet
    await prisma.wallet.create({
      data: {
        name: "Efectivo",
        type: "CASH",
        color: "#10b981",
        icon: "wallet",
        isDefault: true,
        userId: user.id,
      },
    })

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 })
  } catch (err) {
    console.error("Register error:", err)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
