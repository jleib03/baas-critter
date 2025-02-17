import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const currentYear = new Date().getFullYear()

const EXAMPLE_INPUTS = [
  {
    input:
      "I offer dog walking on weekdays from 9 AM to 5 PM, charging $30 for 30-minute walks. I also do overnight stays for $80 per night on weekends. I'll be on vacation from December 24-26, but I can work extra on January 2nd.",
    output: {
      services: {
        walking: { selected: true, cost: 30, duration: 30 },
        sitting: { selected: false, cost: 0, duration: 0 },
        overnights: { selected: true, cost: 80 },
        homeBoarding: { selected: false, cost: 0 },
      },
      schedule: {
        Monday: { selected: true, startTime: "09:00", endTime: "17:00" },
        Tuesday: { selected: true, startTime: "09:00", endTime: "17:00" },
        Wednesday: { selected: true, startTime: "09:00", endTime: "17:00" },
        Thursday: { selected: true, startTime: "09:00", endTime: "17:00" },
        Friday: { selected: true, startTime: "09:00", endTime: "17:00" },
        Saturday: { selected: true, startTime: "00:00", endTime: "23:59" },
        Sunday: { selected: true, startTime: "00:00", endTime: "23:59" },
      },
      daysOff: [
        { date: `${currentYear}-12-24`, available: false },
        { date: `${currentYear}-12-25`, available: false },
        { date: `${currentYear}-12-26`, available: false },
      ],
      additionalWorkDays: [{ date: `${currentYear}-01-02`, available: true }],
    },
  },
]

export async function POST(req: Request) {
  console.log("API route called")

  if (!process.env.OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({
        error: "OpenAI API key is not configured",
        details: "Please set the OPENAI_API_KEY environment variable",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }

  let userPrompt: string

  try {
    const body = await req.json()
    userPrompt = body.prompt
    console.log("Received prompt:", userPrompt)

    if (!userPrompt) {
      throw new Error("Missing prompt in request body")
    }

    const systemPrompt = `You are an AI assistant specialized in parsing pet care provider schedules and services.
    Your task is to analyze the input text and extract structured information about services, schedules, and availability.

    IMPORTANT: Unless explicitly specified with a different year, all dates should be for the current year (${currentYear}).

    Guidelines for parsing:
    1. Services:
       - Extract any mentioned services (walking, sitting, overnights, homeBoarding)
       - Capture costs as numerical values without currency symbols
       - For walking/sitting, duration should be in minutes
       - If a service isn't mentioned, mark it as not selected

    2. Schedule:
       - Convert all times to 24-hour format (e.g., "2pm" → "14:00")
       - For each day, determine if it's selected and capture start/end times
       - If no specific times are mentioned for a selected day, use business hours (09:00-17:00)
       - For overnight services, use full day coverage (00:00-23:59)

    3. Days Off:
       - Capture any mentioned vacation days, holidays, or time off
       - Format dates as YYYY-MM-DD using the current year (${currentYear}) unless explicitly specified
       - Set available: false for these dates

    4. Additional Working Days:
       - Capture any mentioned extra working days or exceptions to normal schedule
       - Format dates as YYYY-MM-DD using the current year (${currentYear}) unless explicitly specified
       - Set available: true for these dates
       - Include startTime and endTime if specified

    5. Special Cases:
       - "weekdays" = Monday through Friday
       - "weekends" = Saturday and Sunday
       - "every day" or "daily" = all seven days
       - For recurring patterns (e.g., "every Monday"), apply the schedule consistently
       - For temporary changes (e.g., "only in March"), add specific dates to additionalWorkDays

    Here are examples of how to parse different inputs:
    ${JSON.stringify(EXAMPLE_INPUTS, null, 2)}

    Return ONLY a valid JSON object matching this exact structure:
    {
      "services": {
        "walking": { "selected": boolean, "cost": number, "duration": number },
        "sitting": { "selected": boolean, "cost": number, "duration": number },
        "overnights": { "selected": boolean, "cost": number },
        "homeBoarding": { "selected": boolean, "cost": number }
      },
      "schedule": {
        "Monday": { "selected": boolean, "startTime": "HH:MM", "endTime": "HH:MM" },
        "Tuesday": { "selected": boolean, "startTime": "HH:MM", "endTime": "HH:MM" },
        "Wednesday": { "selected": boolean, "startTime": "HH:MM", "endTime": "HH:MM" },
        "Thursday": { "selected": boolean, "startTime": "HH:MM", "endTime": "HH:MM" },
        "Friday": { "selected": boolean, "startTime": "HH:MM", "endTime": "HH:MM" },
        "Saturday": { "selected": boolean, "startTime": "HH:MM", "endTime": "HH:MM" },
        "Sunday": { "selected": boolean, "startTime": "HH:MM", "endTime": "HH:MM" }
      },
      "daysOff": [{ "date": "YYYY-MM-DD", "available": boolean }],
      "additionalWorkDays": [{ "date": "YYYY-MM-DD", "available": boolean, "startTime": "HH:MM", "endTime": "HH:MM" }]
    }`

    console.log("Sending request to OpenAI")
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.1,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    })

    const content = response.choices[0].message.content

    if (!content) {
      throw new Error("No response from OpenAI")
    }

    console.log("Raw content:", content)

    try {
      const parsedContent = JSON.parse(content)

      const validationErrors = validateResponseStructure(parsedContent)
      if (validationErrors.length > 0) {
        throw new Error(`Invalid response structure: ${validationErrors.join(", ")}`)
      }

      // Ensure all dates use the current year unless explicitly specified
      if (parsedContent.daysOff) {
        parsedContent.daysOff = parsedContent.daysOff.map((day: any) => {
          if (!day.date.startsWith(`${currentYear}`)) {
            const [_, month, dayOfMonth] = day.date.split("-")
            return { ...day, date: `${currentYear}-${month}-${dayOfMonth}` }
          }
          return day
        })
      }

      if (parsedContent.additionalWorkDays) {
        parsedContent.additionalWorkDays = parsedContent.additionalWorkDays.map((day: any) => {
          if (!day.date.startsWith(`${currentYear}`)) {
            const [_, month, dayOfMonth] = day.date.split("-")
            return { ...day, date: `${currentYear}-${month}-${dayOfMonth}` }
          }
          return day
        })
      }

      console.log("Parsed content:", parsedContent)

      return new Response(JSON.stringify(parsedContent), {
        headers: { "Content-Type": "application/json" },
      })
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError)
      throw new Error(`Invalid response format: ${parseError instanceof Error ? parseError.message : "Unknown error"}`)
    }
  } catch (error) {
    console.error("API error:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

function validateResponseStructure(response: any): string[] {
  const errors: string[] = []

  // Validate services
  const requiredServices = ["walking", "sitting", "overnights", "homeBoarding"]
  if (!response.services) {
    errors.push("Missing services object")
  } else {
    requiredServices.forEach((service) => {
      if (!response.services[service]) {
        errors.push(`Missing service: ${service}`)
      }
    })
  }

  // Validate schedule
  const requiredDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  if (!response.schedule) {
    errors.push("Missing schedule object")
  } else {
    requiredDays.forEach((day) => {
      if (!response.schedule[day]) {
        errors.push(`Missing schedule for ${day}`)
      }
    })
  }

  // Validate daysOff array
  if (!Array.isArray(response.daysOff)) {
    errors.push("daysOff must be an array")
  }

  // Validate additionalWorkDays array
  if (!Array.isArray(response.additionalWorkDays)) {
    errors.push("additionalWorkDays must be an array")
  }

  return errors
}

