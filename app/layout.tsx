import "@/app/globals.css"
import type React from "react"
import { Toaster } from "@/components/ui/toaster"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-background font-sans antialiased">
        <main className="relative flex min-h-screen flex-col">{children}</main>
        <Toaster />
      </body>
    </html>
  )
}

