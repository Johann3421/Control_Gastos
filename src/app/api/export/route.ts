import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
export const runtime = "nodejs"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { startOfMonth, endOfMonth } from "date-fns"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const exportType = searchParams.get("type") ?? "csv"
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")

  const now = new Date()
  const start = startDate ? new Date(startDate) : startOfMonth(now)
  const end = endDate ? new Date(endDate) : endOfMonth(now)

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
      date: { gte: start, lte: end },
    },
    include: {
      category: { select: { name: true } },
      wallet: { select: { name: true } },
    },
    orderBy: [{ date: "desc" }],
  })

  if (exportType === "csv") {
    const headers = [
      "Fecha",
      "Tipo",
      "Descripción",
      "Categoría",
      "Billetera",
      "Monto",
      "Etiquetas",
      "Notas",
    ]

    const rows = transactions.map((t) => [
      format(new Date(t.date), "dd/MM/yyyy"),
      t.type,
      `"${t.description.replace(/"/g, '""')}"`,
      t.category.name,
      t.wallet.name,
      Number(t.amount).toFixed(2),
      t.tags.join(";"),
      t.notes ? `"${t.notes.replace(/"/g, '""')}"` : "",
    ])

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const dateLabel = format(now, "yyyy-MM", { locale: es })

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="flowtrack-${dateLabel}.csv"`,
      },
    })
  }

  return NextResponse.json({ error: "Tipo de exportación no soportado" }, { status: 400 })
}
