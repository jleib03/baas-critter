"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ServiceOfferingsForm from "@/components/ServiceOfferingsForm"
import axios from "axios"

export default function ServiceOfferingsPage() {
  const router = useRouter()
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    const loadExistingData = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("onboardingBasicInfo") || "{}")
        if (userInfo.onboardingId) {
          const response = await axios.get(`/api/onboarding/${userInfo.onboardingId}`)
          if (response.data.serviceOfferings) {
            // Pre-populate the form with existing data
            sessionStorage.setItem("serviceOfferingsData", JSON.stringify(response.data.serviceOfferings))
          }
        }
      } catch (error) {
        console.error("Error loading existing service offerings:", error)
      }
    }

    loadExistingData()
  }, [])

  const handleFormSubmit = async (data: any) => {
    // Store the form data in sessionStorage
    sessionStorage.setItem("serviceOfferingsData", JSON.stringify(data))
    // Navigate to the review page
    await router.push("/onboarding/service-offerings/review")
    setIsSubmitted(true)
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Service Offerings</CardTitle>
        </CardHeader>
        <CardContent>
          <ServiceOfferingsForm onSubmit={handleFormSubmit} />
        </CardContent>
      </Card>
    </div>
  )
}

