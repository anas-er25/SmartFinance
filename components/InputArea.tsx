import React, { useState, useEffect, useRef } from 'react';
import { Mic, Send, Loader2, StopCircle, Camera, Image as ImageIcon } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { ParsingStatus, Language, DICTIONARY } from '../types';

interface InputAreaProps {
  onProcess: (text: string) => void;
  onImageProcess: (base64: string, mimeType: string) => void;
  status: ParsingStatus;
  lang: Language;
}

export const InputArea: React.FC<InputAreaProps> = ({ onProcess, onImageProcess, status, lang }) => {
  // Map 'ar' to 'ar-SA' (Saudi Arabia is standard for generic Arabic STT) or use 'ar-EG'
  const speechLang = lang === 'ar' ? 'ar-SA' : 'en-US';
  
  const { isListening, transcript, startListening, stopListening, setTranscript } = useSpeechRecognition(speechLang);
  const [inputValue, setInputValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,") to get raw base64
        const base64Data = base64String.split(',')[1];
        onImageProcess(base64Data, file.type);
      };
      reader.readAsDataURL(file);
    }
    // Reset value so same file can be selected again
    e.target.value = '';
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {t.recordTransaction}
      </label>
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        accept="image/*" 
        capture="environment"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden" 
      />

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

        {/* Camera Button */}
        <button
          type="button"
          onClick={handleCameraClick}
          disabled={status === ParsingStatus.PROCESSING}
          className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center disabled:opacity-50"
          title="Scan Receipt/Image"
        >
           <Camera className="w-5 h-5" />
        </button>

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
        <span>AI-powered text & image categorization</span>
        {isListening && <span className="text-rose-500 font-medium">{t.listening}</span>}
      </div>
    </div>
  );
};