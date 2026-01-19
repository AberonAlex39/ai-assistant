
import { GoogleGenAI } from "@google/genai";
import { ReplyPurpose, ReplyTone } from "../types";

export async function generateReply(input: string, purpose: ReplyPurpose, tone: ReplyTone): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const systemInstruction = `Ты — опытный ассистент по переписке. Твоя задача — писать готовые к отправке ответы.
Правила:
1. Сохраняй контекст входящего сообщения.
2. Строго учитывай выбранную цель и тон.
3. Пиши кратко, по-человечески, без лишней "воды".
4. Используй эмодзи ТОЛЬКО если выбран тон «Дружелюбный».
5. НИКОГДА не упоминай, что ты AI.
6. Не добавляй никаких пояснений, вводных слов ("Вот ваш ответ:") или комментариев.
7. Выводи ТОЛЬКО чистый текст ответа.`;

  const prompt = `Входящее сообщение:
${input}

Цель ответа:
${purpose}

Тон ответа:
${tone}

Напиши готовый к отправке ответ.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const text = response.text || "Не удалось сгенерировать ответ. Пожалуйста, попробуйте еще раз.";
    return text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Произошла ошибка при обращении к AI. Проверьте соединение или попробуйте позже.");
  }
}
