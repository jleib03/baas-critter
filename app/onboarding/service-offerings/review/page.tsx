"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import ServiceSummaryTable from "@/components/ServiceSummaryTable"
import { saveToLocalStorage, getFromLocalStorage } from "@/utils/localStorage"
import ThankYouPopup from "@/components/ThankYouPopup"

export default function ServiceOfferingsReviewPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<any>(null)
  const [additionalComments, setAdditionalComments] = useState("")
  const [showThankYouPopup, setShowThankYouPopup] = useState(false)

  useEffect(() => {
    const storedData = sessionStorage.getItem("serviceOfferingsData")
    if (storedData) {
      setFormData(JSON.parse(storedData))
    } else {
      router.push("/onboarding/service-offerings")
    }

    const savedComments = getFromLocalStorage("serviceOfferings_additionalComments")
    if (savedComments) {
      setAdditionalComments(savedComments)
    }
  }, [router])

  const handleAdditionalCommentsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setAdditionalComments(value)
    saveToLocalStorage("serviceOfferings_additionalComments", value)
  }

  const handleConfirm = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("onboardingBasicInfo") || "{}")
      const dataToSubmit = {
        ...formData,
        additionalComments,
        email: userInfo.email,
        businessName: userInfo.businessName,
        onboardingId: userInfo.onboardingId,
      }

      const response = await fetch("/api/process-service-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSubmit),
      })

      if (!response.ok) {
        throw new Error("Failed to process service data")
      }

      // Clear the stored data
      sessionStorage.removeItem("serviceOfferingsData")
      localStorage.removeItem("serviceOfferings_additionalComments")

      // Show thank you popup
      setShowThankYouPopup(true)
    } catch (error) {
      console.error("Error submitting service offerings:", error)
      alert("Failed to submit service offerings. Please try again.")
    }
  }

  const handleEdit = () => {
    router.push("/onboarding/service-offerings")
  }

  const handleBackToOnboarding = () => {
    router.push("/onboarding/landing")
  }

  if (!formData) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Review Service Offerings</CardTitle>
        </CardHeader>
        <CardContent>
          <ServiceSummaryTable data={formData} />

          <div className="mt-6">
            <Label htmlFor="additionalComments" className="text-lg font-semibold">
              Additional Comments
            </Label>
            <Textarea
              id="additionalComments"
              placeholder="Add any additional information or comments about your services here..."
              value={additionalComments}
              onChange={handleAdditionalCommentsChange}
              className="mt-2"
              rows={5}
            />
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={handleEdit}>
              Edit Information
            </Button>
            <Button onClick={handleConfirm} className="bg-primary hover:bg-primary/90">
              Confirm and Submit
            </Button>
          </div>
        </CardContent>
      </Card>

      {showThankYouPopup && (
        <ThankYouPopup message="Thank you for submitting your service offerings!" onClose={handleBackToOnboarding} />
      )}
    </div>
  )
}

