import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
import React from "react"
import { Button } from "./Button"

interface EmptyStateProps {
  icon?: LucideIcon | React.ReactNode | string
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center",
        className
      )}
    >
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-dark-700 flex items-center justify-center mb-4">
          {typeof Icon === "string" || typeof Icon === "number" ? (
            <span className="text-2xl">{Icon}</span>
          ) : (
            // If it's a Lucide icon/component or a React node
            // If Icon is a component (function), render it with className
            // Otherwise render it directly
            (typeof Icon === "function" ? (
              // @ts-ignore - allow calling LucideIcon
              <Icon className="w-8 h-8 text-ink-tertiary" />
            ) : (
              Icon as React.ReactNode
            ))
          )}
        </div>
      )}
      <h3 className="text-base font-semibold text-ink-primary dark:text-ink-inverse mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-ink-secondary max-w-xs mb-6">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  )
}
