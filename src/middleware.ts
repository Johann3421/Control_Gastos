import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export default async function middleware(req: Request) {
  const nextUrl = new URL(req.url)

  const isAuthPage =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register")

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")

  if (isApiAuthRoute) return NextResponse.next()

  // Edge-compatible token check
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET })
  const isLoggedIn = !!token

  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", nextUrl))
    }
    return NextResponse.next()
  }

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl)
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
}
