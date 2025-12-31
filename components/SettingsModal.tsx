import React, { useState, useEffect } from 'react';
import { CurrencyCode, CURRENCIES, Language, DICTIONARY, Budget, AppSettings } from '../types';
import { X, Plus, Trash2, Settings, Target, AlertCircle } from 'lucide-react';
import { AVAILABLE_ICONS, getIconByKey } from '../utils/icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  categories: string[];
  onAddCategory: (cat: string, iconKey: string) => void;
  onRemoveCategory: (cat: string) => void;
  budgets: Budget[];
  onSetBudget: (category: string, amount: number) => void;
  settings: AppSettings;
  onUpdateSettings: (s: AppSettings) => void;
  categoryIcons: Record<string, string>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  lang,
  currency,
  setCurrency,
  categories,
  onAddCategory,
  onRemoveCategory,
  budgets,
  onSetBudget,
  settings,
  onUpdateSettings,
  categoryIcons
}) => {
  const [newCategory, setNewCategory] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('tag');
  const t = DICTIONARY[lang];
  const isRTL = lang === 'ar';
  const currencyConfig = CURRENCIES[currency];

  const getBudget = (cat: string) => budgets.find(b => b.category === cat)?.limit || '';

  if (!isOpen) return null;

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.trim()) {
      onAddCategory(newCategory.trim(), selectedIcon);
      setNewCategory('');
      setSelectedIcon('tag');
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
          
          {/* General Settings */}
          <section>
             <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">General</h4>
             <div className="space-y-4">
                 {/* Currency */}
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">{t.currency}</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
                        <button
                        key={code}
                        onClick={() => setCurrency(code)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
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
                 </div>

                 {/* Low Balance Threshold */}
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.lowBalanceThreshold}</label>
                    <div className="relative">
                        <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="number" 
                            value={settings.lowBalanceThreshold}
                            onChange={(e) => onUpdateSettings({ ...settings, lowBalanceThreshold: parseFloat(e.target.value) || 0 })}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>
                 </div>
             </div>
          </section>

          {/* Categories & Budgets Section */}
          <section>
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">{t.manageCategories} & {t.setBudget}</h4>
            
            <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
              <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder={t.addCategory}
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
                  />
                  <select 
                    value={selectedIcon}
                    onChange={(e) => setSelectedIcon(e.target.value)}
                    className="w-24 px-2 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
                  >
                     {Object.keys(AVAILABLE_ICONS).map(iconKey => (
                         <option key={iconKey} value={iconKey}>{iconKey}</option>
                     ))}
                  </select>
              </div>
              <button
                type="submit"
                disabled={!newCategory.trim()}
                className="bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white p-2 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </form>

            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-slate-400 px-3">
                  <div className="col-span-7">{t.category}</div>
                  <div className="col-span-4">{t.setBudget} ({currencyConfig.symbol})</div>
              </div>
              {categories.map((cat) => {
                const Icon = getIconByKey(categoryIcons[cat]);
                return (
                    <div key={cat} className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg transition-all group">
                    <div className="p-1.5 bg-white rounded-md border border-slate-100 text-slate-500">
                        <Icon className="w-4 h-4" />
                    </div>
                    <span className="flex-1 text-sm font-medium text-slate-700 truncate">{cat}</span>
                    
                    {/* Budget Input */}
                    <div className="relative w-24">
                        <Target className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                        <input 
                            type="number"
                            placeholder="0"
                            className="w-full pl-6 pr-2 py-1 text-sm border border-slate-200 rounded focus:ring-1 focus:ring-primary outline-none"
                            value={getBudget(cat)}
                            onChange={(e) => onSetBudget(cat, parseFloat(e.target.value) || 0)}
                        />
                    </div>

                    <button
                        onClick={() => onRemoveCategory(cat)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-white rounded transition-colors opacity-50 group-hover:opacity-100"
                        title={t.delete}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    </div>
                );
              })}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};