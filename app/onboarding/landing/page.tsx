"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import CritterLogo from "@/components/CritterLogo"
import { Calendar, DollarSign, Briefcase, Clock, Check, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import axios from "axios"

interface OnboardingStep {
  id: string
  title: string
  icon: React.ReactNode
  path: string
  description: string
  requiredSteps: string[]
}

interface ModuleStatus {
  serviceOfferings: string
  scheduling: string
  financials: string
  customerInfo: string
}

interface CompletionStatus {
  serviceOfferings: boolean
  scheduling: boolean
  financials: boolean
  customerInfo: boolean
  progress: number
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: "service_offerings",
    title: "Service Offerings",
    icon: <Briefcase className="h-6 w-6" />,
    path: "/onboarding/service-offerings",
    description: "Define your pet care services and specialties",
    requiredSteps: [],
  },
  {
    id: "scheduling",
    title: "Scheduling & Availability",
    icon: <Clock className="h-6 w-6" />,
    path: "/onboarding/scheduling",
    description: "Configure your working hours and availability",
    requiredSteps: ["service_offerings"],
  },
  {
    id: "financials",
    title: "Financials",
    icon: <DollarSign className="h-6 w-6" />,
    path: "/onboarding/financials",
    description: "Set up your pricing and payment information",
    requiredSteps: ["service_offerings", "scheduling"],
  },
  {
    id: "customer_info",
    title: "Customer Information",
    icon: <Calendar className="h-6 w-6" />,
    path: "/onboarding/customer-info",
    description: "Set up your customer management preferences",
    requiredSteps: ["service_offerings", "scheduling", "financials"],
  },
]

export default function OnboardingLandingPage() {
  const router = useRouter()
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [moduleStatus, setModuleStatus] = useState<ModuleStatus | null>(null)
  const [completionStatus, setCompletionStatus] = useState<CompletionStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOnboardingStatus = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("onboardingBasicInfo") || "{}")
        console.log("Retrieved user info:", userInfo)

        if (!userInfo.onboardingId) {
          console.log("No onboardingId found in localStorage")
          setLoading(false)
          return
        }

        console.log("Fetching onboarding status for ID:", userInfo.onboardingId)
        const response = await axios.get(`/api/onboarding/${userInfo.onboardingId}`)
        console.log("Onboarding status response:", response.data)

        const { completionStatus } = response.data

        // Update completed steps based on completion status and status field
        const completed = []

        // Check service offerings
        if (response.data.serviceOfferings || response.data.status === "SERVICE_OFFERINGS_SUBMITTED") {
          completed.push("service_offerings")
        }

        // Check scheduling
        if (response.data.submissions?.length > 0 || response.data.status === "SCHEDULING_SUBMITTED") {
          completed.push("scheduling")
        }

        // Check financials
        if (response.data.financials || response.data.status === "FINANCIALS_SUBMITTED") {
          completed.push("financials")
        }

        // Check customer info
        if (response.data.customerInfo || response.data.status === "CUSTOMER_INFO_SUBMITTED") {
          completed.push("customer_info")
        }

        console.log("Setting completed steps:", completed)
        setCompletedSteps(completed)
        setModuleStatus(response.data.moduleStatus)
        setCompletionStatus(completionStatus)
      } catch (error) {
        console.error("Error fetching onboarding status:", error)
        if (axios.isAxiosError(error)) {
          setError(error.response?.data?.error || "Failed to fetch onboarding status")
        } else {
          setError("An unexpected error occurred")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchOnboardingStatus()
  }, [])

  const isStepAvailable = (step: OnboardingStep) => {
    // If step is already completed, it's always available
    if (completedSteps.includes(step.id)) return true

    // Special case for scheduling - it should be available after service offerings
    if (step.id === "scheduling" && completedSteps.includes("service_offerings")) {
      return true
    }

    // Otherwise, check if all required steps are completed
    return step.requiredSteps.every((requiredStep) => completedSteps.includes(requiredStep))
  }

  const getStepStatus = (step: OnboardingStep) => {
    // Check if the step is completed by looking at the moduleStatus
    if (completedSteps.includes(step.id)) {
      return "completed"
    }

    // Check if the step should be available
    if (isStepAvailable(step)) {
      return "available"
    }

    return "locked"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    )
  }

  const progress = completionStatus?.progress ?? 0

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <CritterLogo className="mx-auto h-12 w-auto" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Welcome to Care by Critter</h2>
          <p className="mt-2 text-sm text-gray-600">Complete your onboarding process</p>

          <div className="mt-6 relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block text-primary">Onboarding Progress</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-primary">{Math.round(progress)}%</span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
              <div
                style={{ width: `${progress}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-500"
              ></div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <p className="text-center text-lg font-medium text-gray-900">
            Please complete each section of your onboarding process.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TooltipProvider>
              {onboardingSteps.map((step) => {
                const status = getStepStatus(step)
                return (
                  <Tooltip key={step.id}>
                    <TooltipTrigger asChild>
                      <div>
                        {status === "available" || status === "completed" ? (
                          <Link href={step.path}>
                            <Card
                              className={`
                                hover:shadow-lg transition-all cursor-pointer
                                ${status === "completed" ? "bg-green-50 border-green-200" : ""}
                              `}
                            >
                              <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                  <span className="flex items-center">
                                    {step.icon}
                                    <span className="ml-2">{step.title}</span>
                                  </span>
                                  {status === "completed" && <Check className="h-5 w-5 text-green-500" />}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm text-gray-600">{step.description}</p>
                                {status === "completed" && (
                                  <p className="text-sm text-green-600 mt-2">Completed - Click to edit</p>
                                )}
                              </CardContent>
                            </Card>
                          </Link>
                        ) : (
                          <Card className="opacity-50 cursor-not-allowed">
                            <CardHeader>
                              <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center">
                                  {step.icon}
                                  <span className="ml-2">{step.title}</span>
                                </span>
                                <Lock className="h-5 w-5 text-gray-400" />
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-gray-600">{step.description}</p>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </TooltipTrigger>
                    {status === "locked" && (
                      <TooltipContent>
                        <p>Complete {step.requiredSteps.join(", ")} first</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                )
              })}
            </TooltipProvider>
          </div>
        </div>
      </div>
      <div className="mt-8 text-center">
        <Button onClick={() => router.push("/admin")} className="bg-gray-500 hover:bg-gray-600 text-white">
          Admin Dashboard
        </Button>
      </div>
    </div>
  )
}

