import { BalanceHeroSkeleton } from "@/components/dashboard/BalanceHero"
import { SummaryCardsSkeleton } from "@/components/dashboard/SummaryCards"
import { SpendingChartSkeleton } from "@/components/dashboard/SpendingChart"
import { CategoryDonutSkeleton } from "@/components/dashboard/CategoryDonut"
import { WalletCardsSkeleton } from "@/components/dashboard/WalletCards"
import { RecentTransactionsSkeleton } from "@/components/dashboard/RecentTransactions"
import { BudgetAlertsSkeleton } from "@/components/dashboard/BudgetAlerts"
import { GoalProgressSkeleton } from "@/components/dashboard/GoalProgress"

export default function DashboardLoading() {
  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-1"><BalanceHeroSkeleton /></div>
        <div className="xl:col-span-2"><SummaryCardsSkeleton /></div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2"><SpendingChartSkeleton /></div>
        <div className="xl:col-span-1"><CategoryDonutSkeleton /></div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-1"><WalletCardsSkeleton /></div>
        <div className="xl:col-span-2"><RecentTransactionsSkeleton /></div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <BudgetAlertsSkeleton />
        <GoalProgressSkeleton />
      </div>
    </div>
  )
}
