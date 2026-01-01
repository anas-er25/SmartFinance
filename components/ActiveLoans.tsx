import React, { useMemo } from 'react';
import { Transaction, Language, CurrencyCode, DICTIONARY, CURRENCIES } from '../types';
import { HandCoins, Plus, CalendarClock, Trash2, AlertCircle, Users } from 'lucide-react';

interface ActiveLoansProps {
  transactions: Transaction[];
  onRepay: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  lang: Language;
  currency: CurrencyCode;
}

export const ActiveLoans: React.FC<ActiveLoansProps> = ({ transactions, onRepay, onDelete, lang, currency }) => {
  const t = DICTIONARY[lang];
  const isRTL = lang === 'ar';
  const currencyConfig = CURRENCIES[currency];

  const activeLoans = useMemo(() => {
    return transactions.filter(t => t.loanDetails?.isLoan && !t.loanDetails.isRepaid);
  }, [transactions]);

  const summary = useMemo(() => {
    const now = new Date();
    return activeLoans.reduce((acc, loan) => {
      const totalRepaid = (loan.loanDetails?.repayments || []).reduce((sum, r) => sum + r.amount, 0);
      const remaining = loan.amount - totalRepaid;
      acc.total += remaining;
      const isOverdue = loan.loanDetails?.repaymentDate && new Date(loan.loanDetails.repaymentDate) < now;
      if (isOverdue) acc.overdueCount += 1;
      return acc;
    }, { total: 0, overdueCount: 0 });
  }, [activeLoans]);

  const formatMoney = (amount: number) => {
    const val = amount.toLocaleString(undefined, { minimumFractionDigits: 2 });
    return currencyConfig.position === 'prefix' ? `${currencyConfig.symbol}${val}` : `${val} ${currencyConfig.symbol}`;
  };

  if (activeLoans.length === 0) return null;

  return (
    <div className="mb-8 animate-fade-in" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 px-1">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-600 rounded-lg shadow-sm">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg leading-tight">{t.activeLoans}</h3>
            <p className="text-xs text-slate-400 font-medium">{activeLoans.length} people owe you money</p>
          </div>
        </div>
        
        {/* Summary Dashboard Section */}
        <div className="flex items-center gap-4 bg-white border border-slate-100 shadow-sm rounded-2xl px-5 py-3">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Receivable</span>
            <span className="text-lg font-black text-blue-600 leading-none mt-1">{formatMoney(summary.total)}</span>
          </div>
          {summary.overdueCount > 0 && (
            <div className="flex flex-col border-l border-slate-100 pl-4">
              <span className="text-[10px] text-rose-400 uppercase font-bold tracking-wider">Overdue Alert</span>
              <span className="text-lg font-black text-rose-600 flex items-center gap-1 leading-none mt-1">
                <AlertCircle className="w-4 h-4" />
                {summary.overdueCount}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeLoans.map(loan => {
          const isOverdue = loan.loanDetails?.repaymentDate && new Date(loan.loanDetails.repaymentDate) < new Date();
          const repayments = loan.loanDetails?.repayments || [];
          const totalRepaid = repayments.reduce((sum, r) => sum + r.amount, 0);
          const remainingAmount = loan.amount - totalRepaid;
          const progress = Math.min((totalRepaid / loan.amount) * 100, 100);
          
          return (
            <div key={loan.id} className={`bg-white p-5 rounded-2xl shadow-sm border transition-all duration-300 hover:shadow-md ${isOverdue ? 'border-rose-200 bg-rose-50/20' : 'border-slate-100'} flex flex-col relative group`}>
              {isOverdue && (
                <div className="absolute top-3 right-3 animate-pulse">
                   <AlertCircle className="w-5 h-5 text-rose-500" />
                </div>
              )}
              
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2.5 rounded-xl ${isOverdue ? 'bg-rose-100 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                        <HandCoins className="w-5 h-5" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide leading-none mb-1">{t.lentTo}</p>
                        <p className="font-bold text-slate-800 text-base truncate">{loan.loanDetails?.borrower}</p>
                    </div>
                </div>
                <div className="flex items-baseline justify-between mb-1">
                   <p className={`font-black text-2xl ${isOverdue ? 'text-rose-600' : 'text-slate-800'}`}>{formatMoney(remainingAmount)}</p>
                   <span className="text-[10px] text-slate-400 font-bold">of {formatMoney(loan.amount)}</span>
                </div>
                
                {/* Individual Loan Progress Bar */}
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-1000 ${isOverdue ? 'bg-rose-500' : 'bg-blue-500'}`}
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between gap-2">
                <div className="flex flex-col gap-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide leading-none">{t.repaymentDue}</p>
                    {loan.loanDetails?.repaymentDate ? (
                       <div className={`flex items-center gap-1.5 text-xs font-bold ${isOverdue ? 'text-rose-600' : 'text-slate-500'}`}>
                          <CalendarClock className="w-3.5 h-3.5" />
                          <span>{new Date(loan.loanDetails.repaymentDate).toLocaleDateString()}</span>
                       </div>
                    ) : (
                        <span className="text-xs text-slate-300">No date set</span>
                    )}
                </div>

                <div className="flex gap-1.5">
                    <button
                        onClick={() => onDelete(loan.id)}
                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        title={t.delete}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => onRepay(loan)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-100 active:scale-95"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        {t.addRepayment}
                    </button>
                </div>
              </div>
              
              {isOverdue && (
                 <div className="mt-3 text-[10px] font-bold text-rose-600 bg-rose-100/50 px-2 py-1 rounded text-center uppercase tracking-wider">
                    Past Repayment Date
                 </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};