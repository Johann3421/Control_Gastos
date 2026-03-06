// auth is dynamically imported inside the component to avoid bundling Node-only
// modules into Edge runtime chunks
import { prisma } from "@/lib/prisma"
import { RecurringClient } from "@/components/recurring/RecurringClient"

export const dynamic = "force-dynamic"

export default async function RecurringPage() {
  const { auth } = await import("@/lib/auth")
  const session = await auth()
  const userId = session!.user!.id!

  const recurring = await prisma.recurringTransaction.findMany({
    where: { userId },
    orderBy: { nextDate: "asc" },
  })

  const [categories, wallets] = await Promise.all([
    prisma.category.findMany({ where: { userId }, select: { id: true, name: true, icon: true, color: true } }),
    prisma.wallet.findMany({ where: { userId }, select: { id: true, name: true } }),
  ])

  const { toNumberSafe } = await import("@/lib/serialize")
  const recurringWithRelations = recurring.map((r) => ({
    ...r,
    amount: toNumberSafe((r as any).amount ?? 0),
    category: categories.find((c) => c.id === (r as any).categoryId) ?? null,
    wallet: wallets.find((w) => w.id === (r as any).walletId) ?? null,
  }))

  const { serializePrisma } = await import("@/lib/serialize")
  const recurringPlain = serializePrisma(recurringWithRelations)

  return <RecurringClient recurring={recurringPlain as any} />
}
