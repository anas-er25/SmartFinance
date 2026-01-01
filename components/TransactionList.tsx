import React from 'react';
import { Transaction, Language, DICTIONARY, CurrencyCode, CURRENCIES } from '../types';
import { ArrowDownLeft, ArrowUpRight, Trash2, Edit2, RefreshCw, Layers, AlertTriangle, PiggyBank, HandCoins, CalendarClock, CheckCircle, AlertCircle } from 'lucide-react';
import { getIconByKey } from '../utils/icons';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  onRepay?: (transaction: Transaction) => void;
  lang: Language;
  currency: CurrencyCode;
  categoryIcons: Record<string, string>;
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete, onEdit, onRepay, lang, currency, categoryIcons }) => {
  const t = DICTIONARY[lang];
  const isRTL = lang === 'ar';
  const currencyConfig = CURRENCIES[currency];

  const formatMoney = (amount: number) => {
    const val = amount.toLocaleString(undefined, { minimumFractionDigits: 2 });
    return currencyConfig.position === 'prefix' ? `${currencyConfig.symbol}${val}` : `${val} ${currencyConfig.symbol}`;
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 animate-fade-in" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="mx-auto w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4 animate-float">
          <Layers className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-lg font-medium text-slate-800">{t.noTransactions}</h3>
        <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto">{t.noTransactionsSub}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-20">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            {t.recentTransactions}
        </h3>
        <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full border border-slate-200">
          {transactions.length} {t.records}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className={`px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest ${isRTL ? 'text-right' : 'text-left'}`}>{t.description}</th>
              <th className={`px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest ${isRTL ? 'text-right' : 'text-left'}`}>{t.category}</th>
              <th className={`px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest ${isRTL ? 'text-right' : 'text-left'}`}>{t.date}</th>
              <th className={`px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest ${isRTL ? 'text-left' : 'text-right'}`}>{t.amount}</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t.action}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {transactions.map((tItem) => {
              const CategoryIcon = getIconByKey(categoryIcons[tItem.category]);
              const isLoan = tItem.loanDetails?.isLoan;
              const isRepaid = tItem.loanDetails?.isRepaid;
              const hasRepayments = (tItem.loanDetails?.repayments || []).length > 0;
              const isOverdue = !isRepaid && tItem.loanDetails?.repaymentDate && new Date(tItem.loanDetails.repaymentDate) < new Date();
              
              return (
              <tr key={tItem.id} className={`hover:bg-slate-50/80 transition-all group ${isRepaid ? 'opacity-60 grayscale-[0.5]' : ''} ${isOverdue ? 'bg-rose-50/30' : ''}`}>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className={`p-2.5 rounded-xl ${isRTL ? 'ml-3' : 'mr-3'} ${tItem.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'} ${isLoan && !isRepaid ? 'bg-blue-50 text-blue-600' : ''}`}>
                      {tItem.type === 'income' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-bold text-slate-700 ${isRepaid ? 'line-through text-slate-400 font-normal' : ''}`}>{tItem.description}</span>
                            
                            {/* Status Badges */}
                            {tItem.recurrence && tItem.recurrence !== 'none' && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100 font-bold uppercase tracking-tight flex items-center gap-1">
                                    <RefreshCw className="w-2.5 h-2.5" />
                                </span>
                            )}
                            {tItem.isHarmful && (
                                <span className="text-rose-500" title={t.harmful + ": " + tItem.analysisReasoning}>
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                </span>
                            )}
                            {tItem.isUnnecessary && (
                                <span className="text-orange-500" title={t.unnecessary + ": " + tItem.analysisReasoning}>
                                    <PiggyBank className="w-3.5 h-3.5" />
                                </span>
                            )}
                            {isLoan && (
                                <span className={`flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${isRepaid ? 'bg-emerald-100 text-emerald-700' : (isOverdue ? 'bg-rose-600 text-white animate-pulse' : (hasRepayments ? 'bg-blue-400 text-white' : 'bg-blue-600 text-white'))}`}>
                                    <HandCoins className="w-2.5 h-2.5" />
                                    {isRepaid ? t.repaid : (isOverdue ? 'OVERDUE' : (hasRepayments ? 'PARTIAL' : 'LOAN'))}
                                </span>
                            )}
                        </div>
                        
                        {isLoan && (
                            <div className="text-[11px] mt-1 flex items-center gap-3 flex-wrap">
                                <span className="text-slate-500 font-medium">Borrower: <span className="text-slate-900 font-bold">{tItem.loanDetails?.borrower}</span></span>
                                {!isRepaid && tItem.loanDetails?.repaymentDate && (
                                    <span className={`flex items-center gap-1 font-bold ${isOverdue ? 'text-rose-600' : 'text-blue-500'}`}>
                                        <CalendarClock className="w-3 h-3" />
                                        {new Date(tItem.loanDetails.repaymentDate).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="flex items-center w-fit gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold bg-white text-slate-600 border border-slate-200 shadow-sm">
                    <CategoryIcon className="w-3.5 h-3.5 text-slate-400" />
                    {tItem.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-400">
                  {new Date(tItem.date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap font-black text-base ${isRTL ? 'text-left' : 'text-right'} ${tItem.type === 'income' ? 'text-emerald-600' : 'text-slate-800'}`}>
                  <span dir="ltr">
                    {tItem.type === 'expense' && '-'}
                    {formatMoney(tItem.amount)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex justify-center gap-1">
                    {isLoan && !isRepaid && onRepay && (
                        <button
                          onClick={(e) => {
                              e.stopPropagation();
                              onRepay(tItem);
                          }}
                          className="text-blue-600 hover:text-white hover:bg-blue-600 transition-all p-2 rounded-lg border border-blue-100 bg-blue-50/50"
                          title={t.addRepayment}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                    )}
                    
                    <button
                      onClick={() => onEdit(tItem)}
                      className="text-slate-400 hover:text-primary transition-all p-2 hover:bg-indigo-50 rounded-lg border border-transparent hover:border-indigo-100"
                      title={t.update}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(tItem.id);
                      }}
                      className="text-slate-400 hover:text-rose-500 transition-all p-2 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-100"
                      title={t.delete}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );
};