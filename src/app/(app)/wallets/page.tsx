// auth is dynamically imported inside the component to avoid bundling Node-only
// modules into Edge runtime chunks
import { prisma } from "@/lib/prisma"
import { WalletsClient } from "@/components/wallets/WalletsClient"

export const dynamic = "force-dynamic"

export default async function WalletsPage() {
  const { auth } = await import("@/lib/auth")
  const session = await auth()
  const userId = session!.user!.id!

  const wallets = await prisma.wallet.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  })

  const walletIds = wallets.map((w) => w.id)
  const balanceTxs = await prisma.transaction.groupBy({
    by: ["walletId", "type"],
    where: { userId, walletId: { in: walletIds } },
    _sum: { amount: true },
  })

  const balanceMap = new Map<string, number>()
  for (const row of balanceTxs) {
    const cur = balanceMap.get(row.walletId) ?? 0
    const amt = Number(row._sum.amount ?? 0)
    if (row.type === "INCOME") balanceMap.set(row.walletId, cur + amt)
    else balanceMap.set(row.walletId, cur - amt)
  }

  const walletsWithBalance = wallets.map((w) => ({
    ...w,
    balance: balanceMap.get(w.id) ?? 0,
  }))

  return <WalletsClient wallets={walletsWithBalance as any} />
}
