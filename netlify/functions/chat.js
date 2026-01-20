"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const handler = async (event) => {
    try {
        const { message } = JSON.parse(event.body || "{}");
        if (!message) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "No message provided" }),
            };
        }
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // ВАЖНО: обратные кавычки
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            },
            body: JSON.stringify({
                model: "deepseek/deepseek-r1",
                messages: [
                    {
                        role: "system",
                        content: "Ты AI-ассистент для деловой переписки. Отвечай понятно, полезно и по делу.",
                    },
                    {
                        role: "user",
                        content: message,
                    },
                ],
                max_tokens: 300,
            }),
        });
        const data = await response.json();
        const reply = data?.choices?.[0]?.message?.content;
        return {
            statusCode: 200,
            body: JSON.stringify({
                reply: reply || "Не удалось сгенерировать ответ",
            }),
        };
    }
    catch (error) {
        console.error("Function error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal server error" }),
        };
    }
};
exports.handler = handler;
