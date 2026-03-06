// auth is dynamically imported inside the component to avoid bundling Node-only
// modules into Edge runtime chunks
import { prisma } from "@/lib/prisma"
import { TransactionsClient } from "@/components/transactions/TransactionsClient"

export const dynamic = "force-dynamic"

export default async function TransactionsPage() {
  const { auth } = await import("@/lib/auth")
  const session = await auth()
  const userId = session!.user!.id!

  const [categories, wallets] = await Promise.all([
    prisma.category.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, icon: true, type: true, color: true },
    }),
    prisma.wallet.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true },
    }),
  ])

  return <TransactionsClient categories={categories} wallets={wallets} />
}
