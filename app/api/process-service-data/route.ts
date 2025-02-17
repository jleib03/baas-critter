import { NextResponse } from "next/server"
import OpenAI from "openai"
import prisma from "@/lib/prisma"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface ServiceData {
  name: string
  durations: string[]
  costs: { [key: string]: number }
  petTypes: string[]
  restrictions: string[]
  additionalInfo: string[]
}

interface StructuredServiceData {
  [key: string]: ServiceData
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key is not configured" }, { status: 500 })
    }

    const formData = await req.json()
    const { email, businessName, onboardingId, ...serviceData } = formData

    const prompt = `
      Analyze the following service offering data and structure it by service type:
      Services: ${Object.entries(serviceData.services)
        .filter(([_, selected]) => selected)
        .map(([service]) => service)
        .join(", ")}
      Durations and Costs: ${serviceData.durationsAndCosts}
      Pet Types: ${serviceData.petTypes}
      Logistics: ${serviceData.logistics}
      Additional Comments: ${serviceData.additionalComments}

      For each service, provide the following information in a structured format:
      - Name of the service
      - Durations offered
      - Costs for each duration
      - Types of pets accepted
      - Any restrictions or limitations
      - Additional information or logistics

      Return the data as a JSON object, with each service as a key, and the details as nested objects.
      Include a separate "additionalComments" field for any general comments not specific to a particular service.
    `

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    })

    const structuredData: StructuredServiceData = JSON.parse(response.choices[0].message.content || "{}")

    // Add the additional comments to the structured data
    structuredData.additionalComments = serviceData.additionalComments

    // Save the structured data to the database
    const updatedOnboarding = await prisma.onboarding.update({
      where: { id: onboardingId },
      data: {
        serviceOfferings: structuredData,
        status: "SERVICE_OFFERINGS_SUBMITTED",
      },
    })

    // Create a Submission record
    const submission = await prisma.submission.create({
      data: {
        firstName: updatedOnboarding.firstName,
        lastName: updatedOnboarding.lastName,
        email: updatedOnboarding.email,
        businessName: updatedOnboarding.businessName,
        services: serviceData.services,
        schedule: {}, // This will be filled in later
        daysOff: [], // This will be filled in later
        additionalWorkDays: [], // This will be filled in later
        status: "SUBMITTED",
        onboarding: {
          connect: {
            id: onboardingId,
          },
        },
      },
    })

    console.log("Created submission:", submission)

    return NextResponse.json({ message: "Service offerings processed and submission created successfully" })
  } catch (error) {
    console.error("Error processing service data:", error)
    return NextResponse.json(
      {
        error: "Failed to process service data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

