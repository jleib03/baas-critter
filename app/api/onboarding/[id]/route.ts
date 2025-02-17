import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // First, get the onboarding record with its submissions
    const onboarding = await prisma.onboarding.findUnique({
      where: { id: params.id },
      include: {
        submissions: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    })

    if (!onboarding) {
      console.log(`No onboarding record found for id: ${params.id}`)
      return NextResponse.json({ error: "Onboarding record not found" }, { status: 404 })
    }

    // Detailed logging of the onboarding record
    console.log("Detailed onboarding record:", JSON.stringify(onboarding, null, 2))

    // Check if serviceOfferings exists and is not empty
    const hasServiceOfferings =
      (onboarding.serviceOfferings !== null && Object.keys(onboarding.serviceOfferings || {}).length > 0) ||
      onboarding.status === "SERVICE_OFFERINGS_SUBMITTED"

    // Check if there are any submissions or if scheduling was submitted
    const hasSubmissions = onboarding.submissions?.length > 0 || onboarding.status === "SCHEDULING_SUBMITTED"

    // Calculate completion status based on the onboarding record and status
    const completionStatus = {
      serviceOfferings: hasServiceOfferings,
      scheduling: hasSubmissions,
      financials: !!onboarding.financials || onboarding.status === "FINANCIALS_SUBMITTED",
      customerInfo: !!onboarding.customerInfo || onboarding.status === "CUSTOMER_INFO_SUBMITTED",
    }

    // Log completion checks
    console.log("Completion checks:", {
      hasServiceOfferings,
      serviceOfferingsData: onboarding.serviceOfferings,
      hasSubmissions,
      submissionsCount: onboarding.submissions?.length,
      status: onboarding.status,
      completionStatus,
    })

    // Calculate progress
    const totalSteps = Object.keys(completionStatus).length
    const completedSteps = Object.values(completionStatus).filter((value) => value === true).length
    const progressPercentage = (completedSteps / totalSteps) * 100

    const finalCompletionStatus = {
      ...completionStatus,
      progress: progressPercentage,
    }

    return NextResponse.json({
      ...onboarding,
      completionStatus: finalCompletionStatus,
    })
  } catch (error) {
    console.error("Error fetching onboarding record:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch onboarding record",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

