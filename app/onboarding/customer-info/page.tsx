"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CustomerInfoPage() {
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
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">This is where you'll enter information about your customers.</p>
          {/* Add your customer information form or content here */}
          <Button onClick={handleFormSubmit}>Submit Customer Information</Button>
        </CardContent>
      </Card>
      {isSubmitted && (
        <div className="mt-6">
          <Button onClick={() => router.push("/dashboard")}>Complete Onboarding</Button>
        </div>
      )}
    </div>
  )
}

