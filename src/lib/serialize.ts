export function serializePrisma(data: any) {
  return JSON.parse(
    JSON.stringify(data, (_key, value) => {
      if (value && typeof value === "object") {
        // Prisma Decimal-like objects often expose toNumber or toJSNumber
        if (typeof value.toNumber === "function") return Number(value.toNumber())
        if (typeof value.toJSNumber === "function") return Number(value.toJSNumber())
      }
      return value
    })
  )
}

export function toNumberSafe(v: any, fallback = 0) {
  if (v == null) return fallback
  if (typeof v === "number") return v
  if (typeof v === "string") {
    const n = Number(v)
    return Number.isFinite(n) ? n : fallback
  }
  if (typeof v === "object") {
    if (typeof v.toNumber === "function") return Number(v.toNumber())
    if (typeof v.toJSNumber === "function") return Number(v.toJSNumber())
  }
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}
