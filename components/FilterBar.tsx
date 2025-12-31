import React from 'react';
import { FilterState, Language, DICTIONARY } from '../types';
import { Search, Filter, Calendar } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  availableCategories: string[];
  lang: Language;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, setFilters, availableCategories, lang }) => {
  const t = DICTIONARY[lang];
  const isRTL = lang === 'ar';

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row gap-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Search */}
      <div className="relative flex-grow">
        <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm`}
        />
      </div>

      {/* Type Filter */}
      <div className="flex-shrink-0">
        <select
          value={filters.type}
          onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
          className="w-full md:w-auto px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm cursor-pointer"
        >
          <option value="all">{t.filterAll}</option>
          <option value="income">{t.filterIncome}</option>
          <option value="expense">{t.filterExpense}</option>
        </select>
      </div>

      {/* Category Filter */}
      <div className="flex-shrink-0">
        <select
          value={filters.category}
          onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
          className="w-full md:w-auto px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm cursor-pointer"
        >
          <option value="">{t.allCategories}</option>
          {availableCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Date Range - Simplified to Start/End inputs */}
      <div className="flex gap-2 items-center flex-shrink-0">
        <div className="relative">
             <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full md:w-32 px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none text-xs"
                placeholder={t.startDate}
            />
        </div>
        <span className="text-slate-400">-</span>
        <div className="relative">
             <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full md:w-32 px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none text-xs"
                placeholder={t.endDate}
            />
        </div>
      </div>
    </div>
  );
};
