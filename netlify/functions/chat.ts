// netlify/functions/chat.ts
import type { Handler } from "@netlify/functions";
import fetch from "cross-fetch";

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
    }
    if (!event.body) {
      return { statusCode: 400, body: JSON.stringify({ error: "Empty request body" }) };
    }

    const { message } = JSON.parse(event.body);
    if (!message || typeof message !== "string") {
      return { statusCode: 400, body: JSON.stringify({ error: "No valid message provided" }) };
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: "Server config error: OPENROUTER_API_KEY missing" }) };
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat",
        messages: [{ role: "user", content: message }],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    const data = await response.json();
    const aiReply = data?.choices?.[0]?.message?.content || "No reply generated";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ reply: aiReply, rawResponse: data })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error", details: err instanceof Error ? err.message : String(err) })
    };
  }
};