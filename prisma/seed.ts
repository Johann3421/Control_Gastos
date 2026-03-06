import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import bcrypt from "bcryptjs"
import { subMonths, addDays, startOfMonth } from "date-fns"
import * as dotenv from "dotenv"

dotenv.config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Seeding FlowTrack...")

  // Clean up
  await prisma.transaction.deleteMany()
  await prisma.budget.deleteMany()
  await prisma.savingGoal.deleteMany()
  await prisma.wallet.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany({ where: { email: "demo@flowtrack.app" } })

  // Create demo user
  const password = await bcrypt.hash("Demo123!", 12)
  const user = await prisma.user.create({
    data: {
      email: "demo@flowtrack.app",
      name: "Demo User",
      password,
    },
  })

  // Categories
  const categories = await Promise.all([
    // Expense categories
    prisma.category.create({ data: { userId: user.id, name: "Alimentación", icon: "🍔", color: "#f97316", type: "EXPENSE" } }),
    prisma.category.create({ data: { userId: user.id, name: "Transporte", icon: "🚌", color: "#3b82f6", type: "EXPENSE" } }),
    prisma.category.create({ data: { userId: user.id, name: "Entretenimiento", icon: "🎮", color: "#8b5cf6", type: "EXPENSE" } }),
    prisma.category.create({ data: { userId: user.id, name: "Salud", icon: "💊", color: "#ef4444", type: "EXPENSE" } }),
    prisma.category.create({ data: { userId: user.id, name: "Hogar", icon: "🏠", color: "#14b8a6", type: "EXPENSE" } }),
    prisma.category.create({ data: { userId: user.id, name: "Ropa", icon: "👕", color: "#ec4899", type: "EXPENSE" } }),
    prisma.category.create({ data: { userId: user.id, name: "Educación", icon: "📚", color: "#6366f1", type: "EXPENSE" } }),
    prisma.category.create({ data: { userId: user.id, name: "Servicios", icon: "💡", color: "#f59e0b", type: "EXPENSE" } }),
    // Income categories
    prisma.category.create({ data: { userId: user.id, name: "Sueldo", icon: "💼", color: "#22c55e", type: "INCOME" } }),
    prisma.category.create({ data: { userId: user.id, name: "Freelance", icon: "💻", color: "#10b981", type: "INCOME" } }),
    prisma.category.create({ data: { userId: user.id, name: "Otros ingresos", icon: "💰", color: "#84cc16", type: "INCOME" } }),
    // Savings
    prisma.category.create({ data: { userId: user.id, name: "Fondo de emergencias", icon: "🛡️", color: "#06b6d4", type: "SAVING" } }),
    prisma.category.create({ data: { userId: user.id, name: "Vacaciones", icon: "✈️", color: "#0ea5e9", type: "SAVING" } }),
    // Investment
    prisma.category.create({ data: { userId: user.id, name: "Acciones", icon: "📈", color: "#d97706", type: "INVESTMENT" } }),
  ])

  const [food, transport, entertainment, health, home, clothes, edu, services,
    salary, freelance, otherIncome, emergency, vacation, stocks] = categories

  // Wallets
  const [checking, savings, cash] = await Promise.all([
    prisma.wallet.create({ data: { userId: user.id, name: "BCP Principal", type: "BANK", currency: "PEN" } }),
    prisma.wallet.create({ data: { userId: user.id, name: "BBVA Ahorro", type: "SAVINGS", currency: "PEN" } }),
    prisma.wallet.create({ data: { userId: user.id, name: "Efectivo", type: "CASH", currency: "PEN" } }),
  ])

  // Budgets
  await Promise.all([
    prisma.budget.create({ data: { userId: user.id, name: "Alimentación", categoryId: food.id, amount: 800, period: "MONTHLY", startDate: new Date() } }),
    prisma.budget.create({ data: { userId: user.id, name: "Entretenimiento", categoryId: entertainment.id, amount: 300, period: "MONTHLY", startDate: new Date() } }),
    prisma.budget.create({ data: { userId: user.id, name: "Transporte", categoryId: transport.id, amount: 250, period: "MONTHLY", startDate: new Date() } }),
  ])

  // Saving Goals
  await Promise.all([
    prisma.savingGoal.create({
      data: {
        userId: user.id,
        name: "Fondo de emergencias (3 meses)",
        targetAmount: 9000,
        currentAmount: 3500,
        deadline: new Date(new Date().getFullYear() + 1, 11, 31),
        status: "IN_PROGRESS",
        icon: "🛡️",
        color: "#06b6d4",
      },
    }),
    prisma.savingGoal.create({
      data: {
        userId: user.id,
        name: "Vacaciones Cusco",
        targetAmount: 2500,
        currentAmount: 800,
        deadline: new Date(new Date().getFullYear(), 6, 15),
        status: "IN_PROGRESS",
        icon: "✈️",
        color: "#0ea5e9",
      },
    }),
  ])

  // Generate transactions for past 6 months
  const transactions: any[] = []
  const now = new Date()

  for (let m = 5; m >= 0; m--) {
    const monthStart = startOfMonth(subMonths(now, m))

    // Monthly salary
    transactions.push({
      userId: user.id,
      type: "INCOME",
      amount: 4200 + Math.random() * 300,
      description: "Sueldo mensual",
      date: addDays(monthStart, 0),
      categoryId: salary.id,
      walletId: checking.id,
    })

    // Freelance (sometimes)
    if (Math.random() > 0.4) {
      transactions.push({
        userId: user.id,
        type: "INCOME",
        amount: 500 + Math.random() * 800,
        description: "Proyecto freelance",
        date: addDays(monthStart, 10 + Math.floor(Math.random() * 10)),
        categoryId: freelance.id,
        walletId: checking.id,
      })
    }

    // Food expenses (weekly)
    for (let w = 0; w < 4; w++) {
      transactions.push({
        userId: user.id,
        type: "EXPENSE",
        amount: 80 + Math.random() * 60,
        description: ["Supermercado Wong", "Plaza Vea", "Tottus", "Vivanda"][w],
        date: addDays(monthStart, w * 7 + Math.floor(Math.random() * 3)),
        categoryId: food.id,
        walletId: checking.id,
      })
    }

    // Lunch out
    for (let d = 0; d < 8; d++) {
      transactions.push({
        userId: user.id,
        type: "EXPENSE",
        amount: 15 + Math.random() * 20,
        description: ["Almuerzo", "Menú del día", "Delivery", "Café y sándwich"][d % 4],
        date: addDays(monthStart, d * 3 + Math.floor(Math.random() * 2)),
        categoryId: food.id,
        walletId: cash.id,
      })
    }

    // Transport
    for (let d = 0; d < 5; d++) {
      transactions.push({
        userId: user.id,
        type: "EXPENSE",
        amount: 30 + Math.random() * 40,
        description: ["Recarga tarjeta Lima Pass", "Taxi", "Uber", "Combustible"][d % 4],
        date: addDays(monthStart, d * 6),
        categoryId: transport.id,
        walletId: checking.id,
      })
    }

    // Home / Services
    transactions.push({
      userId: user.id,
      type: "EXPENSE",
      amount: 350 + Math.random() * 100,
      description: "Alquiler",
      date: addDays(monthStart, 0),
      categoryId: home.id,
      walletId: checking.id,
    })
    transactions.push({
      userId: user.id,
      type: "EXPENSE",
      amount: 45 + Math.random() * 20,
      description: "Luz + Agua",
      date: addDays(monthStart, 5),
      categoryId: services.id,
      walletId: checking.id,
    })
    transactions.push({
      userId: user.id,
      type: "EXPENSE",
      amount: 89.9,
      description: "Internet + Cable",
      date: addDays(monthStart, 8),
      categoryId: services.id,
      walletId: checking.id,
    })

    // Entertainment
    if (Math.random() > 0.3) {
      transactions.push({
        userId: user.id,
        type: "EXPENSE",
        amount: 42 + Math.random() * 30,
        description: "Cine + popcorn",
        date: addDays(monthStart, 13),
        categoryId: entertainment.id,
        walletId: cash.id,
      })
    }
    transactions.push({
      userId: user.id,
      type: "EXPENSE",
      amount: 38.9,
      description: "Netflix + Spotify",
      date: addDays(monthStart, 2),
      categoryId: entertainment.id,
      walletId: checking.id,
    })

    // Savings
    transactions.push({
      userId: user.id,
      type: "SAVING",
      amount: 500,
      description: "Transferencia a fondo de emergencias",
      date: addDays(monthStart, 1),
      categoryId: emergency.id,
      walletId: savings.id,
    })

    // Investment (some months)
    if (Math.random() > 0.5) {
      transactions.push({
        userId: user.id,
        type: "INVESTMENT",
        amount: 300 + Math.random() * 200,
        description: "Compra de ETFs",
        date: addDays(monthStart, 3),
        categoryId: stocks.id,
        walletId: checking.id,
      })
    }
  }

  // Batch create
  for (const tx of transactions) {
    await prisma.transaction.create({
      data: {
        ...tx,
        amount: Math.round(tx.amount * 100) / 100,
      },
    })
  }

  console.log(`✅ Created ${transactions.length} transactions`)
  console.log("👤 Demo user: demo@flowtrack.app / Demo123!")
  console.log("🎉 Seed complete!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
