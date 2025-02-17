import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    console.log("Fetching submissions from database...")
    const submissions = await prisma.submission.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        onboarding: true,
      },
    })
    console.log(`Found ${submissions.length} submissions`)
    if (submissions.length > 0) {
      console.log("First submission:", JSON.stringify(submissions[0], null, 2))
    } else {
      console.log("No submissions found")
    }

    return NextResponse.json(submissions)
  } catch (error) {
    console.error("Error fetching submissions:", error)
    return NextResponse.json({ error: "Error fetching submissions" }, { status: 500 })
  }
}

