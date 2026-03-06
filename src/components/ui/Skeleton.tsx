import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
  lines?: number
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-shimmer bg-gradient-to-r from-surface-100 via-surface-200 to-surface-100",
        "dark:from-dark-700 dark:via-dark-600 dark:to-dark-700",
        "bg-[length:200%_100%] rounded-xl",
        className
      )}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-dark-800 border border-surface-200 dark:border-dark-600 rounded-2xl p-5 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3 px-4">
      <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-4 w-20" />
    </div>
  )
}
