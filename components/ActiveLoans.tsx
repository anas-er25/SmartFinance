import React, { useMemo } from 'react';
import { Transaction, Language, CurrencyCode, DICTIONARY, CURRENCIES } from '../types';
import { HandCoins, CheckCircle, CalendarClock, Trash2, ArrowRight } from 'lucide-react';

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

  const formatMoney = (amount: number) => {
    const val = amount.toLocaleString(undefined, { minimumFractionDigits: 2 });
    return currencyConfig.position === 'prefix' ? `${currencyConfig.symbol}${val}` : `${val} ${currencyConfig.symbol}`;
  };

  if (activeLoans.length === 0) return null;

  return (
    <div className="mb-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-2 mb-4 px-1">
        <HandCoins className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-slate-800">{t.activeLoans}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeLoans.map(loan => {
          const isOverdue = loan.loanDetails?.repaymentDate && new Date(loan.loanDetails.repaymentDate) < new Date();
          
          return (
            <div key={loan.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col relative group">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-blue-50 text-blue-600">
                        <HandCoins className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400">{t.lentTo}</p>
                        <p className="font-bold text-slate-800">{loan.loanDetails?.borrower}</p>
                    </div>
                </div>
                <p className="font-bold text-blue-600 text-lg">{formatMoney(loan.amount)}</p>
              </div>

              <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between">
                {loan.loanDetails?.repaymentDate ? (
                   <div className={`flex items-center gap-1.5 text-xs font-medium ${isOverdue ? 'text-rose-500' : 'text-slate-500'}`}>
                      <CalendarClock className="w-3.5 h-3.5" />
                      <span>{new Date(loan.loanDetails.repaymentDate).toLocaleDateString()}</span>
                      {isOverdue && <span className="bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide">Overdue</span>}
                   </div>
                ) : (
                    <span className="text-xs text-slate-400">-</span>
                )}

                <div className="flex gap-2">
                    <button
                        onClick={() => onDelete(loan.id)}
                        className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        title={t.delete}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => onRepay(loan)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors"
                    >
                        <CheckCircle className="w-3.5 h-3.5" />
                        {t.markRepaid}
                    </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};