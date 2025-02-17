import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key is not configured" }, { status: 500 })
    }

    const { prompt, type } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "No prompt provided" }, { status: 400 })
    }

    let systemPrompt = ""
    switch (type) {
      case "durationsAndCosts":
        systemPrompt = `You are an AI assistant analyzing pet care service offerings.
Parse the input and return a JSON object with the following structure for each service mentioned:

{
  "walking": {
    "durations": [
      { "duration": "30 minutes", "cost": 30 },
      { "duration": "60 minutes", "cost": 45 }
    ]
  },
  "sitting": {
    "durations": [
      { "duration": "30 minutes", "cost": 25 }
    ]
  },
  "overnight": {
    "durations": [
      { "duration": "per night", "cost": 80 }
    ]
  }
}

Include only services that are explicitly mentioned with pricing information.
Return ONLY the JSON object, no additional text or formatting.`
        break

      case "petTypes":
        systemPrompt = `You are an AI assistant analyzing pet care service offerings.
Parse the input and return a JSON object with the following structure for each service mentioned:

{
  "walking": {
    "acceptedPets": ["Dogs"],
    "restrictions": {
      "size": "Up to 60 pounds",
      "capacity": "Up to 2 dogs per walk"
    }
  },
  "sitting": {
    "acceptedPets": ["Cats", "Small dogs", "Birds", "Hamsters"],
    "restrictions": {}
  }
}

Include only services that are explicitly mentioned with pet type information.
Return ONLY the JSON object, no additional text or formatting.`
        break

      case "logistics":
        systemPrompt = `You are an AI assistant analyzing pet care logistics.
Parse the input and return a JSON object with the following structure:

{
  "generic": {
    "serviceArea": {
      "zipCodes": ["12345", "12346"],
      "locations": ["Deerfield, IL"]
    },
    "travelFee": {
      "distance": "5 miles",
      "fee": 5
    }
  },
  "serviceSpecific": {
    "walking": {
      "cancellationPolicy": "24-hour notice required"
    },
    "overnight": {
      "cancellationPolicy": "1 week notice required"
    }
  }
}

Include generic logistics that apply to all services under the "generic" key.
Include service-specific logistics under the "serviceSpecific" key, organized by service.
If a policy applies to all services, include it in the "generic" section.
Return ONLY the JSON object, no additional text or formatting.`
        break

      default:
        return NextResponse.json({ error: `Invalid analysis type: ${type}` }, { status: 400 })
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
      max_tokens: 500,
    })

    if (!response.choices[0].message.content) {
      throw new Error("No response from OpenAI")
    }

    return NextResponse.json({
      analysis: response.choices[0].message.content,
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      {
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

