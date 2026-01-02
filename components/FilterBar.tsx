import React from 'react';
import { Language, DICTIONARY } from '../types';
import { Search, RotateCcw, X } from 'lucide-react';

interface FilterBarProps {
  filters: any;
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  availableCategories: string[];
  lang: Language;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, setFilters, availableCategories, lang }) => {
  const t = DICTIONARY[lang];
  const isRTL = lang === 'ar';

  const handleClearFilters = () => {
    setFilters((prev: any) => ({
      ...prev,
      search: '',
      type: 'all',
      startDate: '',
      endDate: '',
      category: '',
      includeRepaid: false
    }));
  };

  const hasActiveFilters = filters.search || filters.type !== 'all' || filters.category || filters.startDate || filters.endDate || filters.includeRepaid;

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 flex flex-col gap-4 animate-fade-in" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-grow">
          <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={filters.search}
            onChange={(e) => setFilters((prev: any) => ({ ...prev, search: e.target.value }))}
            className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm transition-all`}
          />
          {filters.search && (
            <button 
              onClick={() => setFilters((prev: any) => ({ ...prev, search: '' }))}
              className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
            {/* Type Filter */}
            <div className="flex-shrink-0 min-w-[120px]">
            <select
                value={filters.type}
                onChange={(e) => setFilters((prev: any) => ({ ...prev, type: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm cursor-pointer appearance-none"
            >
                <option value="all">{t.filterAll}</option>
                <option value="income">{t.filterIncome}</option>
                <option value="expense">{t.filterExpense}</option>
            </select>
            </div>

            {/* Category Filter */}
            <div className="flex-shrink-0 min-w-[140px]">
            <select
                value={filters.category}
                onChange={(e) => setFilters((prev: any) => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm cursor-pointer appearance-none"
            >
                <option value="">{t.allCategories}</option>
                {availableCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>
            </div>

            {/* Date Range */}
            <div className="flex gap-2 items-center flex-shrink-0">
            <div className="relative">
                <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters((prev: any) => ({ ...prev, startDate: e.target.value }))}
                    className="w-32 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-xs"
                />
            </div>
            <span className="text-slate-400">-</span>
            <div className="relative">
                <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters((prev: any) => ({ ...prev, endDate: e.target.value }))}
                    className="w-32 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-xs"
                />
            </div>
            </div>
        </div>
      </div>

      {/* Bottom Bar: Toggles & Clear */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-50 pt-3 px-1">
        <label className="flex items-center gap-2 cursor-pointer group select-none">
          <div className="relative flex items-center">
            <input 
              type="checkbox"
              checked={filters.includeRepaid || false}
              onChange={(e) => setFilters((prev: any) => ({ ...prev, includeRepaid: e.target.checked }))}
              className="sr-only"
            />
            <div className={`w-9 h-5 bg-slate-200 rounded-full transition-colors ${filters.includeRepaid ? 'bg-emerald-500' : ''}`}></div>
            <div className={`absolute left-1 w-3.5 h-3.5 bg-white rounded-full transition-transform shadow-sm ${filters.includeRepaid ? 'translate-x-4' : ''}`}></div>
          </div>
          <span className="text-xs font-medium text-slate-500 group-hover:text-slate-800 transition-colors">Include Repaid Loans</span>
        </label>

        {hasActiveFilters && (
            <button 
                onClick={handleClearFilters}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
            >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear Filters
            </button>
        )}
      </div>
    </div>
  );
};