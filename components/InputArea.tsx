import React, { useState, useEffect } from 'react';
import { Mic, Send, Loader2, StopCircle } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { ParsingStatus, Language, DICTIONARY } from '../types';

interface InputAreaProps {
  onProcess: (text: string) => void;
  status: ParsingStatus;
  lang: Language;
}

export const InputArea: React.FC<InputAreaProps> = ({ onProcess, status, lang }) => {
  // Map 'ar' to 'ar-SA' (Saudi Arabia is standard for generic Arabic STT) or use 'ar-EG'
  const speechLang = lang === 'ar' ? 'ar-SA' : 'en-US';
  
  const { isListening, transcript, startListening, stopListening, setTranscript } = useSpeechRecognition(speechLang);
  const [inputValue, setInputValue] = useState('');
  const t = DICTIONARY[lang];
  const isRTL = lang === 'ar';

  // Sync transcript to input
  useEffect(() => {
    if (isListening) {
      setInputValue(transcript);
    }
  }, [transcript, isListening]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;
    onProcess(inputValue);
    setInputValue('');
    setTranscript('');
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {t.recordTransaction}
      </label>
      <form onSubmit={handleSubmit} className="relative flex items-center gap-3">
        <div className="relative flex-grow">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t.placeholder}
            className={`w-full ${isRTL ? 'pr-4 pl-12' : 'pl-4 pr-12'} py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-slate-800 placeholder:text-slate-400`}
            disabled={status === ParsingStatus.PROCESSING}
          />
          <button
            type="button"
            onClick={handleMicClick}
            className={`absolute ${isRTL ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
              isListening 
                ? 'bg-rose-100 text-rose-600 animate-pulse' 
                : 'bg-transparent text-slate-400 hover:text-primary hover:bg-slate-100'
            }`}
            title={isListening ? "Stop Listening" : "Start Voice Input"}
          >
            {isListening ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        </div>

        <button
          type="submit"
          disabled={!inputValue.trim() || status === ParsingStatus.PROCESSING}
          className="bg-primary hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center shadow-md shadow-indigo-100"
        >
          {status === ParsingStatus.PROCESSING ? (
            <>
              <Loader2 className={`w-5 h-5 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t.processing}
            </>
          ) : (
            <>
              {t.add}
              <Send className={`w-4 h-4 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
            </>
          )}
        </button>
      </form>
      <div className="mt-2 text-xs text-slate-400 flex justify-between">
        <span>AI-powered categorization enabled</span>
        {isListening && <span className="text-rose-500 font-medium">{t.listening}</span>}
      </div>
    </div>
  );
};