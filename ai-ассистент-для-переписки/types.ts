
export type ReplyPurpose = 
  | 'Вежливый ответ'
  | 'Жёстко, но корректно'
  | 'Короткий ответ'
  | 'Убедительный ответ'
  | 'Дружелюбный ответ';

export type ReplyTone = 
  | 'Нейтральный'
  | 'Профессиональный'
  | 'Дружелюбный'
  | 'Формальный';

export interface HistoryItem {
  id: string;
  text: string;
  timestamp: number;
}

export interface AssistantState {
  input: string;
  purpose: ReplyPurpose;
  tone: ReplyTone;
  loading: boolean;
  result: string | null;
  error: string | null;
  history: HistoryItem[];
}
