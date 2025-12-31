import React from 'react';
import { Coffee, ShoppingBag, Car, Utensils } from 'lucide-react';
import { Language, DICTIONARY } from '../types';

interface QuickAddProps {
  onQuickAdd: (text: string) => void;
  lang: Language;
}

export const QuickAdd: React.FC<QuickAddProps> = ({ onQuickAdd, lang }) => {
  const t = DICTIONARY[lang];
  const isRTL = lang === 'ar';

  const shortcuts = [
    { label: 'Coffee', icon: Coffee, text: 'Spent 20 on Coffee', color: 'text-amber-600 bg-amber-50 border-amber-100 hover:bg-amber-100' },
    { label: 'Lunch', icon: Utensils, text: 'Spent 50 on Lunch', color: 'text-orange-600 bg-orange-50 border-orange-100 hover:bg-orange-100' },
    { label: 'Transport', icon: Car, text: 'Spent 30 on Transport', color: 'text-blue-600 bg-blue-50 border-blue-100 hover:bg-blue-100' },
    { label: 'Groceries', icon: ShoppingBag, text: 'Spent 100 on Groceries', color: 'text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-100' },
  ];

  return (
    <div className="mb-6 overflow-x-auto pb-2 custom-scrollbar" dir={isRTL ? 'rtl' : 'ltr'}>
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">{t.quickAdd}</h3>
      <div className="flex gap-3">
        {shortcuts.map((sc, idx) => (
          <button
            key={idx}
            onClick={() => onQuickAdd(sc.text)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm transition-all whitespace-nowrap ${sc.color}`}
          >
            <sc.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{sc.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};