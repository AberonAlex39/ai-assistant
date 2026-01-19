
import React, { useState, useEffect } from 'react';
import { ReplyPurpose, ReplyTone, AssistantState, HistoryItem } from './types';
import { generateReply } from './services/geminiService';

const PURPOSES: ReplyPurpose[] = [
  'Вежливый ответ',
  'Жёстко, но корректно',
  'Короткий ответ',
  'Убедительный ответ',
  'Дружелюбный ответ'
];

const TONES: ReplyTone[] = [
  'Нейтральный',
  'Профессиональный',
  'Дружелюбный',
  'Формальный'
];

// Ключи для хранения данных в браузере
const STATE_KEY = 'ai_assistant_state';
const HISTORY_KEY = 'ai_assistant_history';

const App: React.FC = () => {
  // Инициализация состояния из localStorage
  const [state, setState] = useState<AssistantState>(() => {
    const savedState = localStorage.getItem(STATE_KEY);
    const savedHistory = localStorage.getItem(HISTORY_KEY);
    
    let initialState: AssistantState = {
      input: '',
      purpose: 'Вежливый ответ',
      tone: 'Нейтральный',
      loading: false,
      result: null,
      error: null,
      history: [],
    };

    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        initialState = { ...initialState, ...parsed };
      } catch (e) { console.error("Ошибка загрузки состояния:", e); }
    }

    if (savedHistory) {
      try {
        initialState.history = JSON.parse(savedHistory);
      } catch (e) { console.error("Ошибка загрузки истории:", e); }
    }

    return initialState;
  });

  // Эффект для автоматического сохранения данных при любом изменении состояния
  useEffect(() => {
    const { input, purpose, tone, result, history } = state;
    localStorage.setItem(STATE_KEY, JSON.stringify({ input, purpose, tone, result }));
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [state]);

  // Основная функция генерации ответа
  const handleGenerate = async () => {
    if (!state.input.trim()) {
      setState(prev => ({ ...prev, error: 'Пожалуйста, введите текст сообщения' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const generatedText = await generateReply(state.input, state.purpose, state.tone);
      
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        text: generatedText,
        timestamp: Date.now(),
      };

      setState(prev => ({ 
        ...prev, 
        result: generatedText, 
        loading: false,
        history: [newHistoryItem, ...prev.history].slice(0, 10)
      }));
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message, loading: false }));
    }
  };

  const copyText = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert('Текст успешно скопирован!');
  };

  /**
   * Функция очистки истории
   */
  const clearHistory = () => {
    // 1. Очищаем массив истории в состоянии React (обновляет UI)
    setState(prev => ({ 
      ...prev, 
      history: [] 
    }));
    
    // 2. Удаляем сохранённые данные из localStorage
    localStorage.removeItem(HISTORY_KEY);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center gap-8 bg-slate-50">
      {/* Основная карточка приложения */}
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-indigo-600 p-8 text-white">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span className="bg-white/20 p-2 rounded-lg">✨</span>
            AI Переписка
          </h1>
          <p className="mt-2 text-indigo-100 opacity-90">Ваш персональный помощник для идеальных ответов</p>
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Входящее сообщение</label>
            <textarea
              id="userInput"
              disabled={state.loading}
              className="w-full h-40 p-5 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all resize-none text-slate-700 text-lg"
              placeholder="Вставьте сюда текст, на который нужно ответить..."
              value={state.input}
              onChange={(e) => setState(prev => ({ ...prev, input: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Цель</label>
              <select
                disabled={state.loading}
                className="w-full p-4 border-2 border-slate-100 rounded-xl bg-slate-50 text-slate-700 font-medium focus:border-indigo-500 outline-none appearance-none cursor-pointer"
                value={state.purpose}
                onChange={(e) => setState(prev => ({ ...prev, purpose: e.target.value as ReplyPurpose }))}
              >
                {PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Тон</label>
              <select
                disabled={state.loading}
                className="w-full p-4 border-2 border-slate-100 rounded-xl bg-slate-50 text-slate-700 font-medium focus:border-indigo-500 outline-none appearance-none cursor-pointer"
                value={state.tone}
                onChange={(e) => setState(prev => ({ ...prev, tone: e.target.value as ReplyTone }))}
              >
                {TONES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <button
            id="generateButton"
            onClick={handleGenerate}
            disabled={state.loading}
            className={`w-full py-5 rounded-2xl font-black text-xl text-white transition-all shadow-lg active:scale-95 ${
              state.loading ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200'
            }`}
          >
            {state.loading ? 'Генерация...' : 'Сгенерировать ответ'}
          </button>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Результат</label>
            </div>
            <div 
              id="answerField" 
              className={`p-6 bg-indigo-50/30 border-2 border-dashed border-indigo-100 rounded-2xl min-h-[120px] text-slate-800 text-lg whitespace-pre-wrap transition-opacity ${state.loading ? 'opacity-50' : 'opacity-100'}`}
            >
              {state.result || 'Сгенерированный текст появится здесь...'}
            </div>
            <button
              id="copyButton"
              onClick={() => copyText(state.result || '')}
              disabled={!state.result || state.loading}
              className="w-full py-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              Скопировать основной ответ
            </button>
          </div>
        </div>
      </div>

      {/* Блок истории */}
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden mb-20">
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-extrabold text-slate-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
            Недавние ответы
          </h2>
          {/* Кнопка очистки истории рядом со списком */}
          {state.history.length > 0 && (
            <button 
              id="clearHistoryButton"
              onClick={clearHistory} 
              className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-full transition-colors"
            >
              Очистить историю
            </button>
          )}
        </div>
        
        <ul id="historyList" className="divide-y divide-slate-100">
          {state.history.length === 0 ? (
            <li className="p-12 text-center text-slate-400 italic">История пока пуста.</li>
          ) : (
            state.history.map((item) => (
              <li key={item.id} className="p-6 hover:bg-slate-50 transition-colors group">
                <div className="flex justify-between items-start gap-6">
                  <div className="flex-1">
                    <p className="text-slate-600 text-sm italic leading-relaxed">"{item.text}"</p>
                  </div>
                  <button 
                    onClick={() => copyText(item.text)}
                    className="flex-shrink-0 p-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default App;
