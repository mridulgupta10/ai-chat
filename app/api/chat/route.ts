import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY, 
  baseURL: "https://api.groq.com/openai/v1", 
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant", 
      messages: [{ role: "user", content: message }],
    });

    return Response.json({
      response: completion.choices[0].message?.content || "No response",
    });
  } catch (error: any) {
    console.error("Groq API Error:", error.response?.data || error);
    return Response.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
