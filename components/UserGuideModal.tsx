import React from 'react';
import { X, Mic, Zap, TrendingUp, Settings, HandCoins, DollarSign } from 'lucide-react';
import { Language, DICTIONARY } from '../types';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;
  const t = DICTIONARY[lang];
  const isRTL = lang === 'ar';

  const steps = [
    { icon: Mic, title: t.guideVoiceTitle, desc: t.guideVoiceDesc, color: "text-rose-500 bg-rose-50" },
    { icon: Zap, title: t.guideQuickAddTitle, desc: t.guideQuickAddDesc, color: "text-amber-500 bg-amber-50" },
    { icon: TrendingUp, title: t.guideAnalysisTitle, desc: t.guideAnalysisDesc, color: "text-indigo-500 bg-indigo-50" },
    { icon: Settings, title: t.guideBudgetTitle, desc: t.guideBudgetDesc, color: "text-slate-500 bg-slate-100" },
    { icon: HandCoins, title: t.guideLoansTitle, desc: t.guideLoansDesc, color: "text-blue-500 bg-blue-50" },
    { icon: DollarSign, title: t.guideSalaryTitle, desc: t.guideSalaryDesc, color: "text-emerald-500 bg-emerald-50" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-lg text-slate-800">{t.userGuide}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
             {steps.map((step, idx) => (
                 <div key={idx} className="flex gap-4 items-start">
                     <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${step.color}`}>
                         <step.icon className="w-6 h-6" />
                     </div>
                     <div>
                         <h4 className="font-bold text-slate-800 mb-1">{step.title}</h4>
                         <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                     </div>
                 </div>
             ))}
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
            <button onClick={onClose} className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                {t.gotIt}
            </button>
        </div>
      </div>
    </div>
  );
};