// services/geminiService.ts
// Реальная генерация ответа через OpenRouter (DeepSeek R1 free)

export async function generateReply(userInput: string) {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer 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",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1-0528:free",
        messages: [
          {
            role: "user",
            content: userInput
          }
        ],
        max_tokens: 250,
      }),
    });

    const data = await response.json();

    // Проверяем формат ответа
    const message = data.choices?.[0]?.message?.content;
    if (!message) return "Извините, не удалось сгенерировать ответ";

    return message;

  } catch (error) {
    console.error("Ошибка при генерации ответа:", error);
    return "Ошибка сервера. Попробуйте позже.";
  }
}