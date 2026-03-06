import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Toaster } from "sonner"
import { ThemeProvider } from "@/providers/ThemeProvider"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "FlowTrack — Control Financiero Personal",
  description: "Cada sol importa. Cada decisión cuenta.",
  icons: { icon: "/favicon.ico" },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
        style={
          {
            "--font-sans": "var(--font-inter), system-ui, sans-serif",
            "--font-mono": "var(--font-jetbrains-mono), monospace",
          } as React.CSSProperties
        }
      >
        <ThemeProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "var(--color-surface-0)",
                border: "1px solid var(--color-surface-200)",
                color: "var(--color-ink-primary)",
                fontFamily: "var(--font-sans)",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
