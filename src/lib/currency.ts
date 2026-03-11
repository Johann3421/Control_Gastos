export function formatCurrency(
  amount: number,
  currency = "PEN",
  locale = "es-PE"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatAmount(amount: number, currency = "PEN"): string {
  const symbol = getCurrencySymbol(currency)
  const formatted = new Intl.NumberFormat("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount))
  return `${symbol} ${formatted}`
}

export function formatAmountWithSign(
  amount: number,
  type: "INCOME" | "EXPENSE" | "SAVING" | "INVESTMENT" | "TRANSFER",
  currency = "PEN"
): string {
  const symbol = getCurrencySymbol(currency)
  const formatted = new Intl.NumberFormat("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount))
  const prefix = type === "INCOME" || type === "SAVING" || type === "INVESTMENT" ? "+" : "−"
  return `${prefix}${symbol} ${formatted}`
}

export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    PEN: "S/",
    USD: "$",
    EUR: "€",
    BRL: "R$",
    CLP: "$",
    COP: "$",
    ARS: "$",
    MXN: "$",
    GBP: "£",
    JPY: "¥",
  }
  return symbols[currency] ?? currency
}

export function parseAmount(input: string): number {
  const cleaned = input.replace(/[^0-9.]/g, "")
  return parseFloat(cleaned) || 0
}

export function formatCurrencyCompact(amount: number, currency = "PEN"): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount)
}

export const CURRENCIES = [
  { code: "PEN", name: "Sol peruano", symbol: "S/" },
  { code: "USD", name: "Dólar estadounidense", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "BRL", name: "Real brasileño", symbol: "R$" },
  { code: "CLP", name: "Peso chileno", symbol: "$" },
  { code: "COP", name: "Peso colombiano", symbol: "$" },
  { code: "ARS", name: "Peso argentino", symbol: "$" },
  { code: "MXN", name: "Peso mexicano", symbol: "$" },
  { code: "GBP", name: "Libra esterlina", symbol: "£" },
]
