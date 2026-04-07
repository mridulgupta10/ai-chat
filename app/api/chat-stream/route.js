import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req) {
  try {
    const { message } = await req.json();

    const stream = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: message }],
      stream: true,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
        async start(controller){
            for await(const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || ""

              if(content) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({content})}\n\n`))
              }
            }
            controller.close();
        }
    });

    return new Response(readable , {
        headers: {
            'Content-Type': "text/event-stream",
            'Cache-Control' : 'no-cache',
            'Connection' : 'keep-alive'
        }
    })
  } catch (error) {
      console.error("Groq API Error:", error.response?.data || error);
      return Response.json(
        { error: "Failed to process request" },
        { status: 500 }
      );
  }
}
