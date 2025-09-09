export async function sendQueryToChatbot(
  query: string,
  sessionId?: string
) {
  const res = await fetch("/api/chatbot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, session_id: sessionId }),
  });

  if (!res.ok) throw new Error(`Chatbot API error: ${res.statusText}`);

  return res.json();
}
