import React from 'react';
import { Transaction, Language, DICTIONARY, CurrencyCode, CURRENCIES } from '../types';
import { ArrowDownLeft, ArrowUpRight, Trash2, Edit2, RefreshCw, Layers, AlertTriangle, PiggyBank, HandCoins, CalendarClock, CheckCircle } from 'lucide-react';
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
      <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center">
        <h3 className="font-semibold text-slate-800">{t.recentTransactions}</h3>
        <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
          {transactions.length} {t.records}
        </span>
      </div>
      <div className="overflow-y-auto max-h-[500px] custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr>
              <th className={`px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>{t.description}</th>
              <th className={`px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>{t.category}</th>
              <th className={`px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>{t.date}</th>
              <th className={`px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider ${isRTL ? 'text-left' : 'text-right'}`}>{t.amount}</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">{t.action}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {transactions.map((tItem) => {
              const CategoryIcon = getIconByKey(categoryIcons[tItem.category]);
              const isLoan = tItem.loanDetails?.isLoan;
              const isRepaid = tItem.loanDetails?.isRepaid;
              const isOverdue = !isRepaid && tItem.loanDetails?.repaymentDate && new Date(tItem.loanDetails.repaymentDate) < new Date();
              
              return (
              <tr key={tItem.id} className={`hover:bg-slate-50 transition-colors group ${isRepaid ? 'opacity-60 bg-slate-50/50' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full ${isRTL ? 'ml-3' : 'mr-3'} ${tItem.type === 'income' ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                      {tItem.type === 'income' ? (
                        <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4 text-rose-500" />
                      )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className={`font-medium text-slate-700 ${isRepaid ? 'line-through text-slate-400' : ''}`}>{tItem.description}</span>
                            {tItem.recurrence && tItem.recurrence !== 'none' && (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center gap-1" title={`Repeats ${tItem.recurrence}`}>
                                    <RefreshCw className="w-3 h-3" />
                                </span>
                            )}
                            {/* Analysis Icons */}
                            {tItem.isHarmful && (
                                <span className="text-rose-500" title={t.harmful + ": " + tItem.analysisReasoning}>
                                    <AlertTriangle className="w-4 h-4" />
                                </span>
                            )}
                            {tItem.isUnnecessary && (
                                <span className="text-orange-500" title={t.unnecessary + ": " + tItem.analysisReasoning}>
                                    <PiggyBank className="w-4 h-4" />
                                </span>
                            )}
                            {/* Loan Icon */}
                            {isLoan && (
                                <span className="text-blue-500 flex items-center gap-1" title={t.lentTo + " " + tItem.loanDetails?.borrower}>
                                    <HandCoins className="w-4 h-4" />
                                </span>
                            )}
                        </div>
                        {isLoan && (
                            <div className="text-xs mt-1 flex items-center gap-2">
                                <span className="text-blue-600">{t.lentTo}: {tItem.loanDetails?.borrower}</span>
                                {isRepaid ? (
                                    <span className="flex items-center gap-0.5 px-1 rounded bg-green-100 text-green-700 font-medium">
                                        <CheckCircle className="w-3 h-3" /> {t.repaid}
                                    </span>
                                ) : (
                                    tItem.loanDetails?.repaymentDate && (
                                        <span className={`flex items-center gap-0.5 px-1 rounded ${isOverdue ? 'bg-rose-100 text-rose-600 font-bold' : 'bg-blue-50 text-blue-500'}`}>
                                            <CalendarClock className="w-3 h-3" />
                                            {t.repaymentDue}: {new Date(tItem.loanDetails.repaymentDate).toLocaleDateString()}
                                        </span>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="flex items-center w-fit gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                    <CategoryIcon className="w-3 h-3 text-slate-500" />
                    {tItem.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {new Date(tItem.date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap font-bold ${isRTL ? 'text-left' : 'text-right'} ${tItem.type === 'income' ? 'text-emerald-600' : 'text-slate-800'}`}>
                  <span dir="ltr">
                    {tItem.type === 'expense' && '-'}
                    {formatMoney(tItem.amount)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex justify-center gap-1">
                    {/* Repay Button for Loans */}
                    {isLoan && !isRepaid && onRepay && (
                        <button
                          onClick={(e) => {
                              e.stopPropagation();
                              onRepay(tItem);
                          }}
                          className="text-slate-400 hover:text-green-600 transition-colors p-1.5 hover:bg-green-50 rounded-md"
                          title={t.markRepaid}
                        >
                          <CheckCircle className="w-4 h-4 pointer-events-none" />
                        </button>
                    )}
                    
                    <button
                      onClick={() => onEdit(tItem)}
                      className="text-slate-400 hover:text-primary transition-colors p-1.5 hover:bg-slate-100 rounded-md"
                      title={t.update}
                    >
                      <Edit2 className="w-4 h-4 pointer-events-none" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(tItem.id);
                      }}
                      className="text-slate-400 hover:text-rose-500 transition-colors p-1.5 hover:bg-slate-100 rounded-md cursor-pointer"
                      title={t.delete}
                    >
                      <Trash2 className="w-4 h-4 pointer-events-none" />
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