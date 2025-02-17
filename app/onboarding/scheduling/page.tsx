"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AvailabilityForm from "@/components/AvailabilityForm"
import axios from "axios"

export default function SchedulingPage() {
  const router = useRouter()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    const loadExistingData = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("onboardingBasicInfo") || "{}")
        if (userInfo.onboardingId) {
          const response = await axios.get(`/api/onboarding/${userInfo.onboardingId}`)
          if (response.data.submissions?.[0]) {
            // Pre-populate the form with existing scheduling data
            const existingData = response.data.submissions[0]
            // Update form state with existing data
            setFormData(existingData)
          }
        }
      } catch (error) {
        console.error("Error loading existing scheduling data:", error)
      }
    }

    loadExistingData()
  }, [])

  const handleFormSubmit = (data: any) => {
    // Handle form submission logic here
    setIsSubmitted(true)
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Scheduling & Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <AvailabilityForm onSubmit={handleFormSubmit} formData={formData} setFormData={setFormData} />
        </CardContent>
      </Card>
    </div>
  )
}

