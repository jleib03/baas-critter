import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { structuredData, onboardingId } = body

    console.log("Received service offerings data:", {
      onboardingId,
      structuredDataKeys: Object.keys(structuredData),
      structuredDataSample: JSON.stringify(structuredData).slice(0, 200) + "...",
    })

    if (!onboardingId) {
      return NextResponse.json({ error: "Missing onboardingId" }, { status: 400 })
    }

    // Verify the onboarding record exists
    const existingRecord = await prisma.onboarding.findUnique({
      where: { id: onboardingId },
    })

    if (!existingRecord) {
      console.error("Onboarding record not found:", onboardingId)
      return NextResponse.json({ error: "Onboarding record not found" }, { status: 404 })
    }

    // Update the onboarding record
    const updatedOnboarding = await prisma.onboarding.update({
      where: { id: onboardingId },
      data: {
        serviceOfferings: structuredData,
        status: "IN_PROGRESS",
      },
    })

    console.log("Updated onboarding record:", {
      id: updatedOnboarding.id,
      hasServiceOfferings: !!updatedOnboarding.serviceOfferings,
      serviceOfferingsKeys: Object.keys(updatedOnboarding.serviceOfferings || {}),
      status: updatedOnboarding.status,
    })

    return NextResponse.json(updatedOnboarding, { status: 200 })
  } catch (error) {
    console.error("Error saving service offerings:", error)
    return NextResponse.json(
      {
        error: "Failed to save service offerings",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

