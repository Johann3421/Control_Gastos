// auth is dynamically imported inside the component to avoid bundling Node-only
// modules into Edge runtime chunks
import { prisma } from "@/lib/prisma"
import { GoalsClient } from "@/components/goals/GoalsClient"
import { serializePrisma, toNumberSafe } from "@/lib/serialize"

export const dynamic = "force-dynamic"

export default async function GoalsPage() {
  const { auth } = await import("@/lib/auth")
  const session = await auth()
  const userId = session!.user!.id!

  const goals = await prisma.savingGoal.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  })

  const goalsWithProgress = goals.map((g) => {
    const targetAmount = toNumberSafe((g as any).targetAmount)
    const currentAmount = toNumberSafe((g as any).currentAmount)
    return {
      ...g,
      targetAmount,
      currentAmount,
      progressPercentage: targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0,
    }
  })

  const goalsPlain = serializePrisma(goalsWithProgress)
  const goalsArray = Array.isArray(goalsPlain) ? goalsPlain : []

  return <GoalsClient goals={goalsArray as any} />
}
