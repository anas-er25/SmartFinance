import React, { useState } from 'react';
import { Plus, X, Tag } from 'lucide-react';
import { Language, DICTIONARY, QuickAddItem } from '../types';
import { getIconByKey } from '../utils/icons';

interface QuickAddProps {
  quickAddItems: QuickAddItem[];
  onQuickAdd: (text: string) => void;
  onAddQuickItem: (item: QuickAddItem) => void;
  onDeleteQuickItem: (id: string) => void;
  categories: string[];
  categoryIcons: Record<string, string>;
  lang: Language;
}

export const QuickAdd: React.FC<QuickAddProps> = ({ 
    quickAddItems, 
    onQuickAdd, 
    onAddQuickItem, 
    onDeleteQuickItem,
    categories,
    categoryIcons,
    lang 
}) => {
  const t = DICTIONARY[lang];
  const isRTL = lang === 'ar';
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const colors = [
    'text-amber-600 bg-amber-50 border-amber-100 hover:bg-amber-100',
    'text-orange-600 bg-orange-50 border-orange-100 hover:bg-orange-100',
    'text-blue-600 bg-blue-50 border-blue-100 hover:bg-blue-100',
    'text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-100',
    'text-indigo-600 bg-indigo-50 border-indigo-100 hover:bg-indigo-100',
    'text-rose-600 bg-rose-50 border-rose-100 hover:bg-rose-100',
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel) return;

    // Construct text for AI
    let text = newDesc || newLabel;
    if (newAmount) {
        text = `Spent ${newAmount} on ${text}`;
    }
    if (newCategory) {
        text += ` for ${newCategory}`;
    }

    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newItem: QuickAddItem = {
        id: crypto.randomUUID(),
        label: newLabel,
        text: text,
        amount: newAmount ? parseFloat(newAmount) : undefined,
        category: newCategory || undefined,
        colorClass: randomColor
    };

    onAddQuickItem(newItem);
    resetForm();
  };

  const resetForm = () => {
    setNewLabel('');
    setNewAmount('');
    setNewCategory('');
    setNewDesc('');
    setIsModalOpen(false);
  };

  return (
    <>
        <div className="mb-6 overflow-x-auto pb-2 custom-scrollbar" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex items-center justify-between px-1 mb-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.quickAdd}</h3>
        </div>
        <div className="flex gap-3">
            {/* Add Button */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-dashed border-slate-300 text-slate-500 hover:text-primary hover:border-primary hover:bg-indigo-50 transition-all whitespace-nowrap bg-white"
            >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">{t.add}</span>
            </button>

            {quickAddItems.map((sc) => {
                const Icon = sc.category ? getIconByKey(categoryIcons[sc.category]) : Tag;
                return (
                    <div key={sc.id} className="relative group">
                        <button
                            onClick={() => onQuickAdd(sc.text)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm transition-all whitespace-nowrap ${sc.colorClass}`}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="text-sm font-medium">{sc.label}</span>
                            {sc.amount && <span className="text-xs opacity-70 border-l border-current pl-2 ml-1">{sc.amount}</span>}
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDeleteQuickItem(sc.id); }}
                            className="absolute -top-1 -right-1 bg-white text-rose-500 rounded-full p-0.5 shadow-md border border-rose-100 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                );
            })}
        </div>
        </div>

        {/* Create Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
                    <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="font-bold text-slate-800">{t.addNewShortcut}</h3>
                        <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <form onSubmit={handleCreate} className="p-5 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t.shortcutLabel}</label>
                            <input 
                                type="text"
                                value={newLabel}
                                onChange={e => setNewLabel(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
                                placeholder="e.g. Morning Coffee"
                                autoFocus
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t.amount}</label>
                                <input 
                                    type="number"
                                    value={newAmount}
                                    onChange={e => setNewAmount(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t.category}</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        list="qa-category-options"
                                        value={newCategory}
                                        onChange={e => setNewCategory(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
                                        placeholder="Select or type..."
                                    />
                                    <datalist id="qa-category-options">
                                        {categories.map(c => <option key={c} value={c} />)}
                                    </datalist>
                                </div>
                            </div>
                        </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t.shortcutDesc}</label>
                            <input 
                                type="text"
                                value={newDesc}
                                onChange={e => setNewDesc(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
                                placeholder={newLabel ? `Spent ${newAmount || '...'} on ${newLabel}` : "Optional description"}
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="w-full bg-primary text-white py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                        >
                            {t.create}
                        </button>
                    </form>
                </div>
            </div>
        )}
    </>
  );
};