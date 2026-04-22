import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const response = await fetch("http://127.0.0.1:8000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.body) {
      return new Response("No stream received", { status: 500 })
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    })
  } catch (error) {
    return new Response("Error in streamChat", { status: 500 })
  }
}