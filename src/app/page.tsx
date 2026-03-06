import { redirect } from "next/navigation"
// auth is dynamically imported inside the component to avoid bundling Node-only
// modules into Edge runtime chunks

export default async function RootPage() {
  const { auth } = await import("@/lib/auth")
  const session = await auth()
  if (session?.user) {
    redirect("/dashboard")
  } else {
    redirect("/login")
  }
}
