// services/geminiService.ts
import fetch from 'cross-fetch'; // если используешь Node, иначе можно fetch из браузера

// Функция генерации ответа через Tavily
export async function generateReply(userMessage: string): Promise<string> {
  try {
    const response = await fetch('https://api.tavily.com/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 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', // твой ключ
      },
      body: JSON.stringify({
        prompt: userMessage,
        model: 'gpt-3.5-mini', // или любая доступная модель
      }),
    });

    const data = await response.json();

    // В API Tavily ответ обычно в data.output или data.text
    return data.output?.[0]?.content || 'Не удалось сгенерировать ответ';
  } catch (error) {
    console.error('Tavily API error:', error);
    return 'Ошибка при генерации ответа';
  }
}