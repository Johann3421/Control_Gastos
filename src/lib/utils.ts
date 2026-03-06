import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import {
  format,
  formatDistanceToNow,
  isToday,
  isYesterday,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfYear,
  endOfYear,
  subMonths,
  subWeeks,
  subYears,
  subQuarters,
} from "date-fns"
import { es } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeDate(date: Date | string): string {
  const d = new Date(date)
  if (isToday(d)) return "Hoy"
  if (isYesterday(d)) return "Ayer"

  const distance = formatDistanceToNow(d, { locale: es, addSuffix: true })
  const daysDiff = Math.abs(
    Math.floor((new Date().getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  )
  if (daysDiff <= 7) return `Hace ${daysDiff} días`

  return format(d, "d MMM", { locale: es })
}

export function formatDate(date: Date | string, formatStr = "dd/MM/yyyy"): string {
  return format(new Date(date), formatStr, { locale: es })
}

export function formatDateLong(date: Date | string): string {
  return format(new Date(date), "EEEE, d 'de' MMMM yyyy", { locale: es }).toUpperCase()
}

export function getMonthLabel(date: Date | string): string {
  return format(new Date(date), "MMMM yyyy", { locale: es })
    .replace(/^\w/, (c) => c.toUpperCase())
}

export type Period =
  | "today"
  | "this-week"
  | "this-month"
  | "last-month"
  | "last-3-months"
  | "last-6-months"
  | "this-year"
  | "last-year"
  | "custom"

export function getPeriodRange(period: Period, customStart?: Date, customEnd?: Date) {
  const now = new Date()
  switch (period) {
    case "today":
      return { start: new Date(now.setHours(0,0,0,0)), end: new Date(now.setHours(23,59,59,999)) }
    case "this-week":
      return { start: startOfWeek(now, { locale: es }), end: endOfWeek(now, { locale: es }) }
    case "this-month":
      return { start: startOfMonth(now), end: endOfMonth(now) }
    case "last-month": {
      const last = subMonths(now, 1)
      return { start: startOfMonth(last), end: endOfMonth(last) }
    }
    case "last-3-months":
      return { start: startOfMonth(subMonths(now, 2)), end: endOfMonth(now) }
    case "last-6-months":
      return { start: startOfMonth(subMonths(now, 5)), end: endOfMonth(now) }
    case "this-year":
      return { start: startOfYear(now), end: endOfYear(now) }
    case "last-year": {
      const lastYear = subYears(now, 1)
      return { start: startOfYear(lastYear), end: endOfYear(lastYear) }
    }
    case "custom":
      return {
        start: customStart ?? startOfMonth(now),
        end: customEnd ?? endOfMonth(now),
      }
    default:
      return { start: startOfMonth(now), end: endOfMonth(now) }
  }
}

export function getPeriodDates(
  budgetPeriod: string,
  startDate: Date
): { start: Date; end: Date } {
  const now = new Date()
  switch (budgetPeriod) {
    case "WEEKLY":
      return { start: startOfWeek(now, { locale: es }), end: endOfWeek(now, { locale: es }) }
    case "MONTHLY":
      return { start: startOfMonth(now), end: endOfMonth(now) }
    case "QUARTERLY":
      return { start: startOfMonth(subQuarters(now, 0)), end: endOfMonth(now) }
    case "YEARLY":
      return { start: startOfYear(now), end: endOfYear(now) }
    default:
      return { start: startDate, end: now }
  }
}

export function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + "…"
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}
