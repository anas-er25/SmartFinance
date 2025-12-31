import React, { useState, useMemo } from 'react';
import { Transaction, Language, DICTIONARY, CurrencyCode, CURRENCIES } from '../types';
import { X, FileText, AlertTriangle, PiggyBank, ArrowDown, ArrowUp } from 'lucide-react';
import { generatePdfReport } from '../services/pdfService';

interface MonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  lang: Language;
  currency: CurrencyCode;
}

export const MonthlyReportModal: React.FC<MonthlyReportModalProps> = ({ 
  isOpen, 
  onClose, 
  transactions, 
  lang,
  currency 
}) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const t = DICTIONARY[lang];
  const isRTL = lang === 'ar';
  const currencyConfig = CURRENCIES[currency];

  const years = Array.from(new Set(transactions.map(t => new Date(t.date).getFullYear()))).sort((a,b) => b-a);
  if (years.length === 0) years.push(new Date().getFullYear());

  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  // Arabic months
  const monthsAr = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];
  
  // French months
  const monthsFr = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const currentMonthName = lang === 'ar' ? monthsAr[selectedMonth] : (lang === 'fr' ? monthsFr[selectedMonth] : months[selectedMonth]);

  const reportData = useMemo(() => {
    const filtered = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    const income = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const unnecessary = filtered.filter(t => t.isUnnecessary).reduce((sum, t) => sum + t.amount, 0);
    const harmful = filtered.filter(t => t.isHarmful).reduce((sum, t) => sum + t.amount, 0);
    
    return {
      filtered,
      income,
      expense,
      balance: income - expense,
      unnecessary,
      harmful
    };
  }, [transactions, selectedMonth, selectedYear]);

  const formatMoney = (amount: number) => {
    const val = amount.toLocaleString(undefined, { minimumFractionDigits: 2 });
    return currencyConfig.position === 'prefix' ? `${currencyConfig.symbol}${val}` : `${val} ${currencyConfig.symbol}`;
  };

  const handleDownload = () => {
    generatePdfReport('monthly-report-content', `Report_${selectedYear}_${selectedMonth+1}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-600" />
            <h3 className="font-bold text-lg text-slate-800">{t.monthlyReport}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          
          {/* Controls */}
          <div className="flex gap-4 mb-6">
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            >
              {(lang === 'ar' ? monthsAr : (lang === 'fr' ? monthsFr : months)).map((m, idx) => (
                <option key={idx} value={idx}>{m}</option>
              ))}
            </select>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {/* Report ID for PDF Generation */}
          <div id="monthly-report-content" className="space-y-6 bg-white p-4">
            
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">{t.title}</h2>
                <p className="text-slate-500">{t.reportFor} {currentMonthName} {selectedYear}</p>
            </div>

            {/* Big Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                  <p className="text-xs text-emerald-600 font-medium uppercase">{t.totalIncome}</p>
                  <p className="text-xl font-bold text-emerald-700 flex items-center gap-1">
                     <ArrowUp className="w-4 h-4" /> {formatMoney(reportData.income)}
                  </p>
               </div>
               <div className="p-4 rounded-xl bg-rose-50 border border-rose-100">
                  <p className="text-xs text-rose-600 font-medium uppercase">{t.totalExpense}</p>
                  <p className="text-xl font-bold text-rose-700 flex items-center gap-1">
                     <ArrowDown className="w-4 h-4" /> {formatMoney(reportData.expense)}
                  </p>
               </div>
               <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                  <p className="text-xs text-indigo-600 font-medium uppercase">{t.netBalance}</p>
                  <p className="text-xl font-bold text-indigo-700">
                     {formatMoney(reportData.balance)}
                  </p>
               </div>
            </div>

            {/* Analysis Section */}
            {(reportData.unnecessary > 0 || reportData.harmful > 0) && (
                <div className="border-t border-slate-100 pt-6">
                    <h4 className="font-semibold text-slate-700 mb-4">{t.analysis}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {reportData.unnecessary > 0 && (
                            <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
                                <div className="p-2 bg-white rounded-full text-orange-500 shadow-sm">
                                    <PiggyBank className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-orange-800">{t.potentialSavings}</p>
                                    <p className="text-lg font-semibold text-orange-700">{formatMoney(reportData.unnecessary)}</p>
                                    <p className="text-xs text-orange-600 mt-1">Money spent on "Wants" vs "Needs".</p>
                                </div>
                            </div>
                        )}
                        {reportData.harmful > 0 && (
                            <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                                <div className="p-2 bg-white rounded-full text-red-500 shadow-sm">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-red-800">{t.healthRisks}</p>
                                    <p className="text-lg font-semibold text-red-700">{formatMoney(reportData.harmful)}</p>
                                    <p className="text-xs text-red-600 mt-1">Spending that negatively impacts health.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {/* Top Expenses List */}
            {reportData.filtered.length > 0 && (
                <div className="border-t border-slate-100 pt-6">
                   <h4 className="font-semibold text-slate-700 mb-3">Recent Items</h4>
                   <table className="w-full text-sm text-left">
                       <thead className="bg-slate-50 text-slate-500">
                           <tr>
                               <th className={`px-2 py-1 ${isRTL ? 'text-right' : 'text-left'}`}>{t.date}</th>
                               <th className={`px-2 py-1 ${isRTL ? 'text-right' : 'text-left'}`}>{t.description}</th>
                               <th className={`px-2 py-1 ${isRTL ? 'text-left' : 'text-right'}`}>{t.amount}</th>
                           </tr>
                       </thead>
                       <tbody>
                           {reportData.filtered.slice(0, 10).map(tx => (
                               <tr key={tx.id} className="border-b border-slate-50">
                                   <td className="px-2 py-2">{new Date(tx.date).toLocaleDateString()}</td>
                                   <td className="px-2 py-2">
                                       {tx.description}
                                       {tx.isHarmful && <span className="text-red-500 mx-1">*</span>}
                                   </td>
                                   <td className={`px-2 py-2 font-medium ${isRTL ? 'text-left' : 'text-right'} ${tx.type==='income'?'text-emerald-600':'text-slate-700'}`}>
                                       {formatMoney(tx.amount)}
                                   </td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
                </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors font-medium"
          >
            {t.close}
          </button>
          <button 
            onClick={handleDownload}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            {t.exportPdf}
          </button>
        </div>
      </div>
    </div>
  );
};
