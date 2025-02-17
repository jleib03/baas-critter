"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import AdminDashboard from "@/components/AdminDashboard"
import { Button } from "@/components/ui/button"

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Login</h1>
        <button
          onClick={() => setIsLoggedIn(true)}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80"
        >
          Log In (Demo)
        </button>
        <Button onClick={() => router.push("/")} className="mt-4">
          Back to Main Page
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminDashboard />
    </div>
  )
}

