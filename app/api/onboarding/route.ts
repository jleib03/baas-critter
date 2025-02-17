import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, businessName } = body

    // Validate required fields
    const missingFields = []
    if (!firstName) missingFields.push("First Name")
    if (!lastName) missingFields.push("Last Name")
    if (!email) missingFields.push("Email")
    if (!businessName) missingFields.push("Business Name")

    if (missingFields.length > 0) {
      return NextResponse.json({ error: `Missing required fields: ${missingFields.join(", ")}` }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
    }

    try {
      // Try to create a new onboarding record
      const onboarding = await prisma.onboarding.create({
        data: {
          firstName,
          lastName,
          email,
          businessName,
          status: "STARTED",
        },
      })

      return NextResponse.json(onboarding, { status: 201 })
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle unique constraint violation
        if (e.code === "P2002") {
          // Try to update existing record instead
          const updated = await prisma.onboarding.update({
            where: { email },
            data: {
              firstName,
              lastName,
              businessName,
              status: "IN_PROGRESS",
            },
          })
          return NextResponse.json(updated)
        }
      }
      throw e // Re-throw if it's not a unique constraint violation
    }
  } catch (error) {
    console.error("Error handling onboarding record:", error)
    return NextResponse.json(
      {
        error: "An error occurred while processing your request. Please try again.",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const onboardings = await prisma.onboarding.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(onboardings)
  } catch (error) {
    console.error("Error fetching onboarding records:", error)
    return NextResponse.json({ error: "Error fetching onboarding records" }, { status: 500 })
  }
}

