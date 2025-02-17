"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function FinancialsPage() {
  const router = useRouter()
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleFormSubmit = (data: any) => {
    // Handle form submission logic here
    setIsSubmitted(true)
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Financials</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">This is where you'll enter your financial information.</p>
          {/* Add your financials form or content here */}
          <Button onClick={handleFormSubmit}>Submit Financials</Button>
        </CardContent>
      </Card>
      {isSubmitted && (
        <div className="mt-6">
          <Button variant="outline" onClick={() => router.push("/onboarding/landing")}>
            Back to Onboarding Home
          </Button>
        </div>
      )}
    </div>
  )
}

