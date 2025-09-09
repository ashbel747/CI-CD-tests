import { NextRequest, NextResponse } from "next/server";

export interface ChatbotResponse {
  response: string;
  session_id: string;
}

export async function POST(req: NextRequest) {
  try {
    const { query, session_id } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const response = await fetch("https://luxe-bot.onrender.com/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, session_id }),
    });

    if (!response.ok) {
      throw new Error(`Chatbot API error: ${response.statusText}`);
    }

    const data: ChatbotResponse = await response.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to contact chatbot backend." },
      { status: 500 }
    );
  }
}
