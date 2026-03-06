import { redirect } from "next/navigation"
// SessionProviderClient is a client component — import dynamically in the server component
import { Sidebar } from "@/components/layout/Sidebar"
import { TopBar } from "@/components/layout/TopBar"
import { MobileDrawer } from "@/components/layout/MobileDrawer"
import { QuickAddFAB } from "@/components/layout/QuickAddFAB"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { auth } = await import("@/lib/auth")
  const session = await auth()
  if (!session?.user) redirect("/login")
  const SessionProviderClient = (await import("@/providers/SessionProviderClient")).default

  return (
    <SessionProviderClient>
      <div className="min-h-screen bg-surface-50 dark:bg-dark-950">
        <Sidebar />
        <MobileDrawer />
        <div className="lg:pl-64 transition-all duration-200">
          <TopBar />
          <main className="p-4 sm:p-6">{children}</main>
        </div>
        <QuickAddFAB />
      </div>
    </SessionProviderClient>
  )
}
