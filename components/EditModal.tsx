import React, { useState, useEffect } from 'react';
import { Transaction, Language, DICTIONARY } from '../types';
import { X, Save, HandCoins, User, Calendar, History, CheckCircle2 } from 'lucide-react';

interface EditModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Transaction) => void;
  lang: Language;
  categories: string[];
}

export const EditModal: React.FC<EditModalProps> = ({ transaction, isOpen, onClose, onSave, lang, categories }) => {
  const [formData, setFormData] = useState<Partial<Transaction>>({});
  const t = DICTIONARY[lang];

  useEffect(() => {
    if (transaction) {
      setFormData({ 
        ...transaction,
        loanDetails: transaction.loanDetails || { isLoan: false, borrower: '', repaymentDate: '', isRepaid: false, repayments: [] }
      });
    }
  }, [transaction]);

  if (!isOpen || !transaction) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount && formData.description) {
      onSave({ ...transaction, ...formData } as Transaction);
      onClose();
    }
  };

  const isRTL = lang === 'ar';
  const totalRepaid = (formData.loanDetails?.repayments || []).reduce((sum, r) => sum + r.amount, 0);
  const remaining = Math.max(0, (formData.amount || 0) - totalRepaid);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in flex flex-col max-h-[90vh]"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-lg text-slate-800">{t.editTransaction}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.amount}</label>
            <input
              type="number"
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.description}</label>
            <input
              type="text"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.category}</label>
            <div className="relative">
                <input
                    type="text"
                    list="category-options"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
                <datalist id="category-options">
                    {categories.map(c => <option key={c} value={c} />)}
                </datalist>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.date}</label>
              <input
                type="date"
                value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''}
                onChange={e => setFormData({...formData, date: new Date(e.target.value).toISOString()})}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as 'income' | 'expense'})}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white text-sm"
              >
                <option value="income">{t.filterIncome}</option>
                <option value="expense">{t.filterExpense}</option>
              </select>
            </div>
          </div>
          
          <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.recurrence}</label>
              <select
                value={formData.recurrence || 'none'}
                onChange={e => setFormData({...formData, recurrence: e.target.value as any})}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white text-sm"
              >
                <option value="none">{t.none}</option>
                <option value="daily">{t.daily}</option>
                <option value="weekly">{t.weekly}</option>
                <option value="monthly">{t.monthly}</option>
              </select>
          </div>

          {/* Loan Details Section */}
          <div className="pt-4 mt-2 border-t border-slate-100">
             <div className="flex items-center gap-2 mb-3">
                <HandCoins className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-bold text-slate-800">Loan Tracking</span>
             </div>
             
             <div className="flex items-center gap-2 mb-4">
                <input 
                  type="checkbox"
                  id="isLoan"
                  checked={formData.loanDetails?.isLoan || false}
                  onChange={(e) => setFormData({
                    ...formData, 
                    loanDetails: { 
                      ...(formData.loanDetails || { borrower: '', repaymentDate: '', isRepaid: false, repayments: [] }),
                      isLoan: e.target.checked 
                    }
                  })}
                  className="w-4 h-4 text-primary focus:ring-primary border-slate-300 rounded"
                />
                <label htmlFor="isLoan" className="text-sm font-medium text-slate-700">This is a loan (money lent)</label>
             </div>

             {formData.loanDetails?.isLoan && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                    <div>
                      <label className="block text-xs font-semibold text-blue-700 mb-1 uppercase tracking-wider">{t.lentTo}</label>
                      <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-400" />
                          <input
                            type="text"
                            value={formData.loanDetails.borrower || ''}
                            onChange={e => setFormData({
                              ...formData,
                              loanDetails: { ...formData.loanDetails!, borrower: e.target.value }
                            })}
                            className="w-full pl-9 pr-3 py-1.5 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            placeholder="Name of borrower"
                          />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-blue-700 mb-1 uppercase tracking-wider">{t.repaymentDue}</label>
                      <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-400" />
                          <input
                            type="date"
                            value={formData.loanDetails.repaymentDate ? new Date(formData.loanDetails.repaymentDate).toISOString().split('T')[0] : ''}
                            onChange={e => setFormData({
                              ...formData,
                              loanDetails: { ...formData.loanDetails!, repaymentDate: e.target.value }
                            })}
                            className="w-full pl-9 pr-3 py-1.5 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                          />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox"
                        id="isRepaid"
                        checked={formData.loanDetails.isRepaid}
                        onChange={(e) => setFormData({
                          ...formData, 
                          loanDetails: { ...formData.loanDetails!, isRepaid: e.target.checked }
                        })}
                        className="w-4 h-4 text-emerald-500 focus:ring-emerald-500 border-slate-300 rounded"
                      />
                      <label htmlFor="isRepaid" className="text-xs font-medium text-slate-600">{t.repaid}</label>
                    </div>
                  </div>

                  {/* Repayment History Visualization */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1.5">
                              <History className="w-3.5 h-3.5 text-slate-500" />
                              <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">Repayment History</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500">{totalRepaid} / {formData.amount} Paid</span>
                      </div>
                      
                      {/* Miniature progress bar */}
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden mb-3">
                          <div 
                              className="h-full bg-emerald-500 transition-all duration-500"
                              style={{ width: `${Math.min(100, (totalRepaid / (formData.amount || 1)) * 100)}%` }}
                          ></div>
                      </div>

                      <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                          {(formData.loanDetails.repayments || []).length > 0 ? (
                              formData.loanDetails.repayments!.map((r, i) => (
                                  <div key={i} className="flex justify-between items-center text-[11px] bg-white p-2 rounded border border-slate-100">
                                      <div className="flex items-center gap-1.5 text-slate-600">
                                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                          {new Date(r.date).toLocaleDateString()}
                                      </div>
                                      <span className="font-bold text-slate-800">+{r.amount}</span>
                                  </div>
                              ))
                          ) : (
                              <p className="text-[10px] text-slate-400 text-center italic">No repayments recorded yet.</p>
                          )}
                      </div>
                      
                      {remaining > 0 && (
                          <div className="mt-3 pt-2 border-t border-slate-200 text-right">
                              <span className="text-[10px] text-slate-500 font-medium">Balance remaining: </span>
                              <span className="text-xs font-black text-rose-600">{remaining}</span>
                          </div>
                      )}
                  </div>
                </div>
             )}
          </div>

          <div className="pt-4 flex gap-3 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors flex items-center justify-center gap-2 shadow-md shadow-indigo-100"
            >
              <Save className="w-4 h-4" />
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};