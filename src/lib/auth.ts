import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        try {
          const parsed = loginSchema.safeParse(credentials)
          if (!parsed.success) return null

          const { email, password } = parsed.data

          const user = await prisma.user.findUnique({ where: { email } })
          if (!user || !user.password) return null

          const isValid = await bcrypt.compare(password, user.password)
          if (!isValid) return null

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          }
        } catch (err) {
          console.error("[auth][authorize] error:", err)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ account }) {
      // Allow credentials sign-in even without a linked Account record in DB
      if (account?.provider === "credentials") return true
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string
      }
      return session
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAuthPage =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/register")
      const isApiAuth = nextUrl.pathname.startsWith("/api/auth")
      const isPublic = nextUrl.pathname === "/" || isAuthPage || isApiAuth

      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl))
      }
      if (!isLoggedIn && !isPublic) {
        const loginUrl = new URL("/login", nextUrl)
        loginUrl.searchParams.set("callbackUrl", nextUrl.pathname)
        return Response.redirect(loginUrl)
      }
      return true
    },
  },
})
