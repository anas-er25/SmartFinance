import React, { useMemo } from 'react';
import { Transaction, Budget, Language, DICTIONARY, CurrencyCode, CURRENCIES } from '../types';
import { TrendingUp, AlertCircle, PieChart as PieChartIcon } from 'lucide-react';

interface AnalyticsDashboardProps {
  transactions: Transaction[];
  budgets: Budget[];
  lang: Language;
  currency: CurrencyCode;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ transactions, budgets, lang, currency }) => {
  const t = DICTIONARY[lang];
  const isRTL = lang === 'ar';
  const currencyConfig = CURRENCIES[currency];

  const formatMoney = (amount: number) => {
    // Shorter format for charts
    const val = amount >= 1000 ? `${(amount/1000).toFixed(1)}k` : Math.round(amount).toString();
    return currencyConfig.position === 'prefix' ? `${currencyConfig.symbol}${val}` : `${val}${currencyConfig.symbol}`;
  };

  // 1. Process Data for Top Categories (Last 30 Days) - Bar Chart
  const topCategories = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const expenses = transactions.filter(t => 
      t.type === 'expense' && new Date(t.date) >= thirtyDaysAgo
    );

    const catTotals: Record<string, number> = {};
    expenses.forEach(t => {
      catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
    });

    return Object.entries(catTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const maxCategoryValue = Math.max(...topCategories.map(c => c.value), 1);

  // 2. Process Data for Budgets (Current Month) - Progress Bars
  const budgetStatus = useMemo(() => {
    const now = new Date();
    const currentMonthExpenses = transactions.filter(t => 
      t.type === 'expense' && 
      new Date(t.date).getMonth() === now.getMonth() &&
      new Date(t.date).getFullYear() === now.getFullYear()
    );

    const catTotals: Record<string, number> = {};
    currentMonthExpenses.forEach(t => {
      catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
    });

    return budgets.map(b => {
      const spent = catTotals[b.category] || 0;
      const percentage = Math.min((spent / b.limit) * 100, 100);
      const isOver = spent > b.limit;
      const isWarning = spent > b.limit * 0.8;
      return { ...b, spent, percentage, isOver, isWarning };
    });
  }, [transactions, budgets]);

  // 3. Process Data for Spending Breakdown (Current Month) - Pie/Donut Chart
  const spendingBreakdown = useMemo(() => {
    const now = new Date();
    const currentMonthExpenses = transactions.filter(t => 
      t.type === 'expense' && 
      new Date(t.date).getMonth() === now.getMonth() &&
      new Date(t.date).getFullYear() === now.getFullYear()
    );

    const catTotals: Record<string, number> = {};
    let total = 0;
    
    currentMonthExpenses.forEach(t => {
      catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
      total += t.amount;
    });

    // Modern color palette
    const colors = [
      '#6366f1', // Indigo
      '#10b981', // Emerald
      '#f59e0b', // Amber
      '#ef4444', // Red
      '#8b5cf6', // Violet
      '#06b6d4', // Cyan
      '#ec4899', // Pink
      '#84cc16', // Lime
      '#14b8a6', // Teal
      '#f43f5e'  // Rose
    ];

    let accumulatedPercent = 0;

    return Object.entries(catTotals)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value], index) => {
        const percent = total > 0 ? (value / total) * 100 : 0;
        const item = {
          name,
          value,
          percent,
          color: colors[index % colors.length],
          startPercent: accumulatedPercent
        };
        accumulatedPercent += percent;
        return item;
      });
  }, [transactions]);

  if (topCategories.length === 0 && budgetStatus.length === 0 && spendingBreakdown.length === 0) return null;

  // Constants for Donut Chart
  const radius = 35;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* 1. Category Breakdown (Donut Chart) */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
        <div className="flex items-center gap-2 mb-4 text-slate-800">
           <PieChartIcon className="w-5 h-5 text-indigo-500" />
           <h3 className="font-bold">{t.spendingTrends}</h3>
           <span className="text-xs text-slate-400 font-normal ml-auto text-right">{new Date().toLocaleString(lang === 'en' ? 'default': lang, { month: 'short' })}</span>
        </div>

        {spendingBreakdown.length > 0 ? (
          <div className="flex flex-col items-center flex-grow">
            {/* SVG Donut Chart */}
            <div className="relative w-40 h-40 mb-4">
               <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {spendingBreakdown.map((item, i) => {
                    const strokeDasharray = `${(item.percent / 100) * circumference} ${circumference}`;
                    const strokeDashoffset = -((item.startPercent / 100) * circumference);
                    
                    return (
                      <circle
                        key={item.name}
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="transparent"
                        stroke={item.color}
                        strokeWidth="15"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-500 hover:opacity-80"
                      />
                    );
                  })}
                  {/* Inner Circle for 'Donut' effect */}
                  <circle cx="50" cy="50" r="28" fill="white" />
               </svg>
               {/* Center Text (Total) */}
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] text-slate-400 uppercase font-medium">Total</span>
                  <span className="text-sm font-bold text-slate-800">
                     {formatMoney(spendingBreakdown.reduce((sum, item) => sum + item.value, 0))}
                  </span>
               </div>
            </div>

            {/* Legend */}
            <div className="w-full space-y-2 overflow-y-auto max-h-[120px] custom-scrollbar pr-1">
               {spendingBreakdown.map((item) => (
                 <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                       <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                       <span className="text-slate-600 font-medium truncate max-w-[80px]">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="text-slate-800 font-semibold">{formatMoney(item.value)}</span>
                       <span className="text-slate-400 w-8 text-right">{Math.round(item.percent)}%</span>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        ) : (
           <div className="flex-grow flex items-center justify-center text-slate-400 text-sm">
             No expenses this month
           </div>
        )}
      </div>

      {/* 2. Top Categories (Bar Chart) */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-4 text-slate-800">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-bold">{t.topCategories}</h3>
            <span className="text-xs text-slate-400 font-normal ml-auto">(30 days)</span>
        </div>
        
        {topCategories.length > 0 ? (
          <div className="space-y-4">
            {topCategories.map((cat, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">{cat.name}</span>
                  <span className="text-slate-500 font-mono">{formatMoney(cat.value)}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(cat.value / maxCategoryValue) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
           <p className="text-sm text-slate-400 text-center py-4">No data yet</p>
        )}
      </div>

      {/* 3. Budget Progress */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
         <div className="flex items-center gap-2 mb-4 text-slate-800">
            <AlertCircle className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold">{t.budgetStatus}</h3>
            <span className="text-xs text-slate-400 font-normal ml-auto text-right">{new Date().toLocaleString(lang === 'en' ? 'default': lang, { month: 'short' })}</span>
        </div>

        {budgetStatus.length > 0 ? (
            <div className="space-y-4 overflow-y-auto max-h-[180px] custom-scrollbar pr-2">
                {budgetStatus.map((b, idx) => (
                    <div key={idx}>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="font-semibold text-slate-700">{b.category}</span>
                            <span className={`${b.isOver ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                                {b.isOver ? t.overBudget : `${formatMoney(b.limit - b.spent)} ${t.remaining}`}
                            </span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden relative">
                             <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                    b.isOver ? 'bg-rose-500' : (b.isWarning ? 'bg-amber-400' : 'bg-emerald-500')
                                }`}
                                style={{ width: `${b.percentage}%` }}
                             ></div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center py-6">
                <p className="text-sm text-slate-400 mb-2">No budgets set</p>
                <div className="text-xs text-primary bg-primary/5 inline-block px-3 py-1 rounded-full border border-primary/20">
                    Use Settings to add budgets
                </div>
            </div>
        )}
      </div>
    </div>
  );
};