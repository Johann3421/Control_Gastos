import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const user = await prisma.user.findUnique({ where: { email: "demo@flowtrack.app" } })
    if (!user) return NextResponse.json({ ok: false, reason: "no_user" }, { status: 404 })
    const hasPassword = !!user.password
    let check = false
    if (user.password) {
      check = await bcrypt.compare("Demo123!", user.password)
    }

    return NextResponse.json({ ok: true, email: user.email, hasPassword, matchesDemoPassword: check })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
