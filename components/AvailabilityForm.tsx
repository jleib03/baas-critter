"use client"

import { useState, useCallback, useEffect } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import ServiceSelection from "./ServiceSelection"
import ScheduleSelection from "./ScheduleSelection"
import ExceptionsSelection from "./ExceptionsSelection"
import Summary from "./Summary"
import AIAssistant from "./AIAssistant"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useLLMAnalysis } from "../hooks/useLLMAnalysis"
import { LLMErrorAlert } from "./LLMErrorAlert"
import ThankYouPopup from "./ThankYouPopup"

const steps = ["Schedule & Service Submission", "Services", "Schedule", "Exceptions", "Summary"]

interface StoredUserInfo {
  firstName: string
  lastName: string
  email: string
  businessName: string
  onboardingId: string
}

export interface FormData {
  firstName: string
  lastName: string
  email: string
  businessName: string
  onboardingId: string
  services: {
    [key: string]: { selected: boolean; cost: number; duration?: number }
  }
  schedule: {
    [key: string]: { selected: boolean; startTime: string; endTime: string }
  }
  daysOff: Array<{ date: string; available: boolean }>
  additionalWorkDays: Array<{ date: string; available: boolean }>
  months: string[]
  service_availability_overview?: string
}

const currentMonth = new Date().toLocaleString("default", { month: "long" })

export default function AvailabilityForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [userInfo, setUserInfo] = useState<StoredUserInfo | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showThankYouPopup, setShowThankYouPopup] = useState(false)

  const methods = useForm<FormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      businessName: "",
      onboardingId: "",
      months: [currentMonth],
      services: {
        walking: { selected: false, cost: 0, duration: 0 },
        sitting: { selected: false, cost: 0, duration: 0 },
        overnights: { selected: false, cost: 0 },
        homeBoarding: { selected: false, cost: 0 },
      },
      schedule: {
        Monday: { selected: false, startTime: "09:00", endTime: "17:00" },
        Tuesday: { selected: false, startTime: "09:00", endTime: "17:00" },
        Wednesday: { selected: false, startTime: "09:00", endTime: "17:00" },
        Thursday: { selected: false, startTime: "09:00", endTime: "17:00" },
        Friday: { selected: false, startTime: "09:00", endTime: "17:00" },
        Saturday: { selected: false, startTime: "09:00", endTime: "17:00" },
        Sunday: { selected: false, startTime: "09:00", endTime: "17:00" },
      },
      daysOff: [],
      additionalWorkDays: [],
    },
  })

  const { setValue } = methods
  const { analyzeData, isAnalyzing, error } = useLLMAnalysis({
    setValue,
    apiRoute: "/api/analyze-availability",
  })

  useEffect(() => {
    const storedInfo = localStorage.getItem("onboardingBasicInfo")
    if (storedInfo) {
      try {
        const parsedInfo = JSON.parse(storedInfo)
        console.log("Retrieved user info:", parsedInfo)
        setUserInfo(parsedInfo)
      } catch (error) {
        console.error("Error parsing stored user info:", error)
      }
    }
  }, [])

  useEffect(() => {
    if (userInfo) {
      methods.reset({
        ...methods.getValues(),
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        email: userInfo.email,
        businessName: userInfo.businessName,
        onboardingId: userInfo.onboardingId,
      })
    }
  }, [userInfo, methods])

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
  }, [])

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }, [])

  const onSubmit = useCallback(async (data: FormData) => {
    setSubmitting(true)
    setSubmitError(null)

    try {
      if (!data.onboardingId) {
        throw new Error("Missing onboarding ID. Please complete the initial onboarding step first.")
      }

      const { months, ...submissionData } = data

      console.log("Submitting data:", JSON.stringify(submissionData, null, 2))

      const response = await axios.post("/api/submissions", submissionData)

      console.log("Submission response:", response.data)

      if (response.status === 201) {
        setShowThankYouPopup(true)
      } else {
        throw new Error(`Unexpected response status: ${response.status}`)
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", error.response?.data)
      }
      setSubmitError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while submitting the form. Please try again.",
      )
    } finally {
      setSubmitting(false)
    }
  }, [])

  const handleAnalyzeAvailability = async () => {
    try {
      const formData = methods.getValues()
      const input = formData.service_availability_overview

      if (!input || input.trim() === "") {
        throw new Error("Please provide information about your services and availability.")
      }

      console.log("Starting analysis with input:", input)

      const analysisResult = await analyzeData({ prompt: input })

      console.log("Analysis complete. Updated responses:", analysisResult)

      // Move to the next step
      nextStep()
    } catch (error) {
      console.error("Error analyzing availability:", error)
    }
  }

  const handleBackToOnboarding = () => {
    router.push("/onboarding/landing")
  }

  if (!userInfo) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500">
          Error: User information not found. Please complete the initial onboarding step first.
        </p>
        <Button onClick={() => router.push("/")} className="mt-4">
          Return to Onboarding
        </Button>
      </div>
    )
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <Card className="bg-white shadow-md rounded-lg">
          <CardContent className="p-6">
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                {steps.map((step, index) => (
                  <div
                    key={step}
                    className={`text-sm font-medium ${index <= currentStep ? "text-primary" : "text-gray-400"}`}
                  >
                    {step}
                  </div>
                ))}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {currentStep === 0 && (
              <>
                <AIAssistant
                  header="Service & Availability Overview"
                  prompt="Please describe your services, schedule, and any exceptions to your availability."
                  description="Provide an overview of your services and availability. I'll help organize this information for you."
                  exampleText="Example: I offer dog walking on weekdays from 9 AM to 5 PM, charging $30 for 30-minute walks. I also do overnight stays for $80 per night on weekends. I'll be on vacation from December 24-26, but I can work extra on January 2nd."
                  fieldName="service_availability_overview"
                />
                <LLMErrorAlert error={error} />
                <Button
                  type="button"
                  onClick={handleAnalyzeAvailability}
                  disabled={isAnalyzing}
                  className="w-full bg-primary hover:bg-primary/90 mt-4"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze Information"
                  )}
                </Button>
              </>
            )}
            {currentStep === 1 && <ServiceSelection />}
            {currentStep === 2 && <ScheduleSelection />}
            {currentStep === 3 && <ExceptionsSelection formData={methods.getValues()} />}
            {currentStep === 4 && <Summary />}

            {submitError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">{submitError}</div>
            )}

            <div className="flex justify-between mt-8">
              {currentStep > 0 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  Previous
                </Button>
              )}
              {currentStep > 0 && currentStep < steps.length - 1 && (
                <Button type="button" onClick={nextStep}>
                  Next
                </Button>
              )}
              {currentStep === steps.length - 1 && (
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Confirm and Submit"
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </form>

      {showThankYouPopup && (
        <ThankYouPopup
          message="Thank you for submitting your availability information!"
          onClose={handleBackToOnboarding}
        />
      )}
    </FormProvider>
  )
}

