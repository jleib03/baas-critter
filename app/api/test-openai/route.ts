import OpenAI from "openai"

async function makeOpenAIRequest(retries = 5, initialDelay = 1000) {
  let delay = initialDelay
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempt ${i + 1} to make OpenAI request`)
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Say hello!" }],
        max_tokens: 10,
      })

      console.log("Received response from OpenAI")
      return response
    } catch (error) {
      if (error.status === 429 && i < retries - 1) {
        console.log(`Rate limited. Retrying in ${delay / 1000} seconds... (Attempt ${i + 1}/${retries})`)
        await new Promise((resolve) => setTimeout(resolve, delay))
        delay *= 2 // Exponential backoff
      } else {
        throw error
      }
    }
  }
  throw new Error("Max retries reached")
}

export async function GET() {
  console.log("Test OpenAI endpoint called")
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    console.error("OpenAI API key is not set")
    return new Response(JSON.stringify({ error: "API key is not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
  console.log("API Key exists:", !!apiKey)
  console.log("API Key length:", apiKey.length)

  try {
    const response = await makeOpenAIRequest()

    return new Response(
      JSON.stringify({
        success: true,
        message: response.choices[0].message.content,
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("OpenAI Test Error:", error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: error.response?.data || "No additional details available",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

