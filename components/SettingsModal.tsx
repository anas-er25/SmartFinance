import React, { useState } from 'react';
import { CurrencyCode, CURRENCIES, Language, DICTIONARY } from '../types';
import { X, Plus, Trash2, Settings } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  categories: string[];
  onAddCategory: (cat: string) => void;
  onRemoveCategory: (cat: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  lang,
  currency,
  setCurrency,
  categories,
  onAddCategory,
  onRemoveCategory
}) => {
  const [newCategory, setNewCategory] = useState('');
  const t = DICTIONARY[lang];
  const isRTL = lang === 'ar';

  if (!isOpen) return null;

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.trim()) {
      onAddCategory(newCategory.trim());
      setNewCategory('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in flex flex-col max-h-[85vh]"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-600" />
            <h3 className="font-bold text-lg text-slate-800">{t.settings}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
          
          {/* Currency Section */}
          <section>
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">{t.currency}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
                <button
                  key={code}
                  onClick={() => setCurrency(code)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                    currency === code
                      ? 'bg-primary/5 border-primary text-primary ring-1 ring-primary'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-primary/50'
                  }`}
                >
                  <span className="text-lg font-bold">{CURRENCIES[code].symbol}</span>
                  <span className="text-xs font-medium opacity-70">{code}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Categories Section */}
          <section>
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">{t.manageCategories}</h4>
            
            <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder={t.addCategory}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
              />
              <button
                type="submit"
                disabled={!newCategory.trim()}
                className="bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white p-2 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </form>

            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <div key={cat} className="group flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-sm text-slate-700 hover:border-slate-200 hover:bg-white transition-all">
                  <span>{cat}</span>
                  <button
                    onClick={() => onRemoveCategory(cat)}
                    className="text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};
