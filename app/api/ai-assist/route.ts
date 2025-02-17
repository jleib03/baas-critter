import { Configuration, OpenAIApi } from "openai-edge"

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(config)

async function makeOpenAIRequest(messages: any[], retries = 5, initialDelay = 1000) {
  let delay = initialDelay
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempt ${i + 1} to make OpenAI request`)
      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messages,
        temperature: 0.1,
        max_tokens: 1000,
      })

      if (response.ok) {
        console.log("OpenAI request successful")
        return response
      }

      if (response.status === 429) {
        console.log(`Rate limited. Retrying in ${delay / 1000} seconds... (Attempt ${i + 1}/${retries})`)
        await new Promise((resolve) => setTimeout(resolve, delay))
        delay *= 2 // Exponential backoff
      } else {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error(`Error in makeOpenAIRequest (Attempt ${i + 1}):`, error)
      if (i === retries - 1) throw error
    }
  }
  throw new Error("Max retries reached")
}

export async function POST(req: Request) {
  console.log("AI assist API route called")
  try {
    const { input } = await req.json()
    console.log("Received input:", input)

    if (!input) {
      throw new Error("No input provided")
    }

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not set")
    }

    const messages = [
      {
        role: "system",
        content: `You are an AI assistant helping to set up a pet care professional's availability and services. 
        Analyze the user's input and extract information about their services, schedule, and any exceptions.
        
        Return ONLY a JSON object with the following structure:
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
          "exceptions": [
            { "date": "YYYY-MM-DD", "available": false }
          ]
        }

        Rules:
        1. For services not mentioned, set "selected": false
        2. Use 24-hour format for times (e.g., "13:00" instead of "1:00 PM")
        3. If specific times aren't mentioned for a day, use default business hours (09:00-17:00)
        4. Convert all prices to numbers without currency symbols
        5. For walking/sitting duration, convert to minutes as numbers`,
      },
      {
        role: "user",
        content: input,
      },
    ]

    console.log("Sending request to OpenAI")
    const response = await makeOpenAIRequest(messages)
    console.log("Received response from OpenAI")

    const completion = await response.json()

    if (!completion.choices || completion.choices.length === 0) {
      console.error("Unexpected OpenAI response:", completion)
      throw new Error("No completion choices returned from OpenAI")
    }

    const result = completion.choices[0].message.content

    try {
      const parsedData = JSON.parse(result)
      console.log("Successfully parsed OpenAI response")
      return new Response(JSON.stringify(parsedData), {
        headers: { "Content-Type": "application/json" },
      })
    } catch (parseError) {
      console.error("Failed to parse AI response:", result)
      throw new Error(`Invalid response format: ${parseError.message}`)
    }
  } catch (error) {
    console.error("API error:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to process request",
        details: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}

