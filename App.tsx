import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, ParsingStatus, Language, FilterState, DICTIONARY, CurrencyCode, Budget, AppSettings, SavingsGoal, ParseResult, QuickAddItem } from './types';
import { parseTransactionText, parseTransactionImage } from './services/geminiService';
import { exportTransactionsToExcel } from './services/excelService';
import { createNotificationLinks } from './services/notificationService';
import { db } from './services/db';
import { StatsCard } from './components/StatsCard';
import { TransactionList } from './components/TransactionList';
import { InputArea } from './components/InputArea';
import { EditModal } from './components/EditModal';
import { FilterBar } from './components/FilterBar';
import { SettingsModal } from './components/SettingsModal';
import { MonthlyReportModal } from './components/MonthlyReportModal';
import { UserGuideModal } from './components/UserGuideModal';
import { QuickAdd } from './components/QuickAdd';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { SavingsGoals } from './components/SavingsGoals';
import { ActiveLoans } from './components/ActiveLoans';
import { Wallet, TrendingUp, TrendingDown, Download, BadgeDollarSign, Globe, Settings, PieChart, AlertTriangle, MessageCircle, Mail, HelpCircle, AlertCircle } from 'lucide-react';

interface ExtendedFilterState extends FilterState {
    includeRepaid?: boolean;
}

export const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('en');
  const [currency, setCurrency] = useState<CurrencyCode>('MAD');
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryIcons, setCategoryIcons] = useState<Record<string, string>>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [quickAddItems, setQuickAddItems] = useState<QuickAddItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ lowBalanceThreshold: 500 });
  const [parsingStatus, setParsingStatus] = useState<ParsingStatus>(ParsingStatus.IDLE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [filters, setFilters] = useState<ExtendedFilterState>({
    search: '',
    type: 'all',
    startDate: '',
    endDate: '',
    category: '',
    includeRepaid: false
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const t = DICTIONARY[language];
  const isRTL = language === 'ar';

  useEffect(() => {
    const loadData = async () => {
      const txs = await db.transactions.getAll();
      const cats = await db.categories.getAll();
      const icons = await db.categoryIcons.getAll();
      const bgs = await db.budgets.getAll();
      const stg = await db.settings.get();
      const gls = await db.goals.getAll();
      const qas = await db.quickAdds.getAll();
      
      setTransactions(txs);
      setCategories(cats);
      setCategoryIcons(icons);
      setBudgets(bgs);
      setSettings(stg);
      setGoals(gls);
      setQuickAddItems(qas);
      
      if (txs.length === 0) {
        setIsGuideModalOpen(true);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  useEffect(() => {
    if (transactions.length === 0 && !settings.monthlySalary) return;
    const checkRecurringAndSalary = async () => {
      const now = new Date();
      let hasChanges = false;
      let newGeneratedTransactions: Transaction[] = [];
      const updatedList = [...transactions];
      
      const updatedTransactions = updatedList.map(t => {
        if (!t.recurrence || t.recurrence === 'none') return t;
        const lastRunStr = t.lastGenerated || t.date;
        const lastRun = new Date(lastRunStr);
        let nextRun = new Date(lastRun);
        if (t.recurrence === 'daily') nextRun.setDate(nextRun.getDate() + 1);
        if (t.recurrence === 'weekly') nextRun.setDate(nextRun.getDate() + 7);
        if (t.recurrence === 'monthly') nextRun.setMonth(nextRun.getMonth() + 1);
        let latestGeneratedStr = t.lastGenerated;
        if (nextRun <= now) {
            hasChanges = true;
            const newT: Transaction = {
                ...t,
                id: crypto.randomUUID(),
                date: nextRun.toISOString(),
                recurrence: 'none',
                lastGenerated: undefined
            };
            newGeneratedTransactions.push(newT);
            latestGeneratedStr = nextRun.toISOString();
        }
        if (latestGeneratedStr !== t.lastGenerated) {
            return { ...t, lastGenerated: latestGeneratedStr };
        }
        return t;
      });

      if (settings.monthlySalary && settings.salaryDay && now.getDate() >= settings.salaryDay) {
          const salaryExists = [...transactions, ...newGeneratedTransactions].some(t => 
              t.category === 'Salary' &&
              t.type === 'income' &&
              new Date(t.date).getMonth() === now.getMonth() && 
              new Date(t.date).getFullYear() === now.getFullYear()
          );
          if (!salaryExists) {
              const salaryTransaction: Transaction = {
                  id: crypto.randomUUID(),
                  amount: settings.monthlySalary,
                  description: "Monthly Salary (Auto)",
                  category: 'Salary',
                  type: 'income',
                  date: new Date().toISOString(),
                  recurrence: 'none',
                  isHarmful: false,
                  isUnnecessary: false
              };
              newGeneratedTransactions.push(salaryTransaction);
              hasChanges = true;
          }
      }
      if (hasChanges) {
        const finalList = [...newGeneratedTransactions, ...updatedTransactions];
        setTransactions(finalList);
        await db.transactions.save(finalList);
      }
    };
    checkRecurringAndSalary();
  }, [transactions.length, settings.monthlySalary, settings.salaryDay]); 

  const addTransactionFromParseResult = async (result: ParseResult) => {
      if (result.category) {
          const updatedCats = await db.categories.add(result.category);
          setCategories(updatedCats);
      }
      const newTransaction: Transaction = {
        id: crypto.randomUUID(),
        amount: result.amount,
        description: result.description,
        category: result.category,
        type: result.type,
        date: new Date().toISOString(),
        recurrence: result.recurrence || 'none',
        isHarmful: result.isHarmful,
        isUnnecessary: result.isUnnecessary,
        analysisReasoning: result.analysisReasoning,
        loanDetails: result.isLoan ? {
            isLoan: true,
            borrower: result.borrower,
            repaymentDate: result.repaymentDate,
            isRepaid: false,
            repayments: []
        } : undefined
      };
      const updatedTxs = await db.transactions.add(newTransaction);
      setTransactions(updatedTxs);
  };

  const handleProcessInput = async (text: string) => {
    setParsingStatus(ParsingStatus.PROCESSING);
    setErrorMsg(null);
    const result = await parseTransactionText(text, language);
    if (result) {
      await addTransactionFromParseResult(result);
      setParsingStatus(ParsingStatus.SUCCESS);
      setTimeout(() => setParsingStatus(ParsingStatus.IDLE), 2000);
    } else {
      setErrorMsg(language === 'ar' ? "لم نتمكن من فهم المعاملة." : "Could not understand that transaction.");
      setParsingStatus(ParsingStatus.ERROR);
      setTimeout(() => setParsingStatus(ParsingStatus.IDLE), 3000);
    }
  };

  const handleImageInput = async (base64: string, mimeType: string) => {
    setParsingStatus(ParsingStatus.PROCESSING);
    setErrorMsg(null);
    const results = await parseTransactionImage(base64, mimeType, language);
    if (results && results.length > 0) {
      for (const result of results) {
        await addTransactionFromParseResult(result);
      }
      setParsingStatus(ParsingStatus.SUCCESS);
      setTimeout(() => setParsingStatus(ParsingStatus.IDLE), 2000);
    } else {
      setErrorMsg(language === 'ar' ? "لم نتمكن من تحليل الصورة." : "Could not analyze the image.");
      setParsingStatus(ParsingStatus.ERROR);
      setTimeout(() => setParsingStatus(ParsingStatus.IDLE), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t.delete + '?')) {
      try {
        const updated = await db.transactions.delete(id);
        setTransactions(updated);
      } catch (e) {
        console.error("Failed to delete transaction", e);
      }
    }
  };

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const handleUpdateTransaction = async (updated: Transaction) => {
    if (updated.category) {
        const updatedCats = await db.categories.add(updated.category);
        setCategories(updatedCats);
    }
    const updatedList = await db.transactions.update(updated);
    setTransactions(updatedList);
  };

  const handleRepayLoan = async (transaction: Transaction) => {
      if (!transaction.loanDetails) return;
      const repayments = transaction.loanDetails.repayments || [];
      const totalRepaid = repayments.reduce((sum, r) => sum + r.amount, 0);
      const remaining = Math.max(0, transaction.amount - totalRepaid);
      const confirmMsg = `${t.confirmRepay} ${transaction.loanDetails.borrower} (Remaining: ${remaining} ${currency})`;
      const promptValue = window.prompt(confirmMsg, remaining.toString());
      if (promptValue === null) return;
      const repayAmount = parseFloat(promptValue);
      if (isNaN(repayAmount) || repayAmount <= 0) {
          alert("Please enter a valid amount.");
          return;
      }
      const newRepayment = { amount: repayAmount, date: new Date().toISOString() };
      const newRepayments = [...repayments, newRepayment];
      const newTotalRepaid = totalRepaid + repayAmount;
      const isFullyRepaid = newTotalRepaid >= transaction.amount;
      const updatedTx: Transaction = {
          ...transaction,
          loanDetails: {
              ...transaction.loanDetails,
              repayments: newRepayments,
              isRepaid: isFullyRepaid
          }
      };
      await db.transactions.update(updatedTx);
      const repaymentIncomeTx: Transaction = {
          id: crypto.randomUUID(),
          amount: repayAmount,
          description: `${t.repaymentFrom} ${transaction.loanDetails.borrower} (${isFullyRepaid ? t.fullRepayment : t.partialRepayment})`,
          category: 'Loans',
          type: 'income',
          date: new Date().toISOString(),
          recurrence: 'none',
          isHarmful: false,
          isUnnecessary: false
      };
      const updatedList = await db.transactions.add(repaymentIncomeTx);
      setTransactions(updatedList);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ar' : prev === 'ar' ? 'fr' : 'en');
  };

  const handleAddCategory = async (cat: string, iconKey: string) => {
    const updatedCats = await db.categories.add(cat);
    const updatedIcons = await db.categoryIcons.set(cat, iconKey);
    setCategories(updatedCats);
    setCategoryIcons(updatedIcons);
  };

  const handleRemoveCategory = async (cat: string) => {
    const updated = await db.categories.delete(cat);
    setCategories(updated);
  };

  const handleSetBudget = async (category: string, amount: number) => {
    const updated = await db.budgets.set(category, amount);
    setBudgets(updated);
  };

  const handleUpdateSettings = async (newSettings: AppSettings) => {
    await db.settings.save(newSettings);
    setSettings(newSettings);
  };

  const handleAddGoal = async (goal: SavingsGoal) => {
      const updated = await db.goals.add(goal);
      setGoals(updated);
  };

  const handleUpdateGoal = async (goal: SavingsGoal, amountAdded: number) => {
      const updatedGoals = await db.goals.update(goal);
      setGoals(updatedGoals);
      if (amountAdded > 0) {
          const newTransaction: Transaction = {
              id: crypto.randomUUID(),
              amount: amountAdded,
              description: `${t.deposit}: ${goal.name}`,
              category: 'Savings',
              type: 'expense',
              date: new Date().toISOString(),
              recurrence: 'none',
              isHarmful: false,
              isUnnecessary: false
          };
          const updatedTxs = await db.transactions.add(newTransaction);
          setTransactions(updatedTxs);
      }
  };

  const handleDeleteGoal = async (id: string) => {
      if(window.confirm(t.delete + '?')) {
          const updated = await db.goals.delete(id);
          setGoals(updated);
      }
  };

  const handleAddQuickItem = async (item: QuickAddItem) => {
    if (item.category) {
        const updatedCats = await db.categories.add(item.category);
        setCategories(updatedCats);
    }
    const updated = await db.quickAdds.add(item);
    setQuickAddItems(updated);
  };

  const handleDeleteQuickItem = async (id: string) => {
    if(window.confirm(t.delete + '?')) {
        const updated = await db.quickAdds.delete(id);
        setQuickAddItems(updated);
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (t.loanDetails?.isLoan && t.loanDetails.isRepaid && !filters.includeRepaid) return false;
      
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = t.description.toLowerCase().includes(searchLower) || 
                            t.category.toLowerCase().includes(searchLower) ||
                            (t.loanDetails?.borrower?.toLowerCase().includes(searchLower) ?? false);
                            
      const matchesType = filters.type === 'all' || t.type === filters.type;
      const matchesCategory = filters.category === '' || t.category === filters.category;
      let matchesDate = true;
      if (filters.startDate) matchesDate = matchesDate && new Date(t.date) >= new Date(filters.startDate);
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && new Date(t.date) <= end;
      }
      return matchesSearch && matchesType && matchesCategory && matchesDate;
    });
  }, [transactions, filters]);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const currentBalance = totalIncome - totalExpense;
  const { waUrl, mailUrl } = createNotificationLinks(currentBalance, currency, filteredTransactions);
  const showLowBalanceWarning = currentBalance < settings.lowBalanceThreshold && transactions.length > 0;

  return (
    <div className={`min-h-screen pb-12 bg-slate-50 font-sans ${isRTL ? 'text-right' : 'text-left'}`}>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2.5 rounded-xl shadow-sm shadow-indigo-100">
              <BadgeDollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
                <h1 className="text-xl font-black text-slate-800 tracking-tight hidden sm:block leading-none">{t.title}</h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden sm:block">AI-Driven Wealth Management</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleLanguage} className="flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:text-primary hover:bg-slate-100 rounded-xl transition-all text-xs font-bold uppercase border border-transparent hover:border-slate-100">
              <Globe className="w-4 h-4" />
              <span>{language}</span>
            </button>
            <button onClick={() => setIsGuideModalOpen(true)} className="p-2 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-xl transition-all border border-transparent hover:border-slate-100" title={t.help}>
                <HelpCircle className="w-5 h-5" />
            </button>
            <button onClick={() => setIsSettingsModalOpen(true)} className="p-2 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-xl transition-all border border-transparent hover:border-slate-100" title={t.settings}>
                <Settings className="w-5 h-5" />
            </button>
            <div className="flex gap-1 border-l border-slate-200 pl-2 ml-1">
                <button onClick={() => exportTransactionsToExcel(filteredTransactions)} className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all border border-transparent hover:border-slate-100" title={t.exportXlsx}>
                    <Download className="w-5 h-5" />
                </button>
                <button onClick={() => setIsReportModalOpen(true)} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-slate-100" title={t.monthlyReport}>
                    <PieChart className="w-5 h-5" />
                </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8">
        {showLowBalanceWarning && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-bounce-slow" dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-100 rounded-full">
                        <AlertTriangle className="w-6 h-6 text-rose-500" />
                    </div>
                    <div>
                        <h4 className="font-black text-rose-800 text-sm uppercase tracking-wider">{t.lowBalance}</h4>
                        <p className="text-sm text-rose-700 font-medium">{t.lowBalanceMsg}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <a href={waUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 text-xs font-black uppercase transition-all shadow-sm shadow-emerald-100">
                        <MessageCircle className="w-4 h-4" /> {t.sendWhatsapp}
                    </a>
                    <a href={mailUrl} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-900 text-xs font-black uppercase transition-all shadow-sm shadow-slate-100">
                        <Mail className="w-4 h-4" /> {t.sendEmail}
                    </a>
                </div>
            </div>
        )}

        {transactions.length === 0 && (
          <div className="bg-indigo-600 rounded-3xl p-8 mb-8 flex flex-col md:flex-row items-center gap-8 text-white relative overflow-hidden shadow-xl shadow-indigo-100 animate-fade-in" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md border border-white/20 shrink-0">
              <TrendingUp className="w-12 h-12 text-white" />
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-2">{t.welcomeTitle}</h3>
              <p className="text-indigo-100 text-base mb-4 leading-relaxed max-w-lg">{t.welcomeText} {t.welcomeExample}</p>
              <div className="flex gap-2 text-xs font-mono bg-white/10 px-3 py-2 rounded-xl w-fit">
                <span className="opacity-60">$</span><span className="animate-pulse">_</span>
                {language === 'en' ? 'Type "Got 5000 salary today"' : 'أدخل "حصلت على 5000 راتب اليوم"'}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8" dir={isRTL ? 'rtl' : 'ltr'}>
          <StatsCard title={t.currentBalance} amount={currentBalance} icon={Wallet} colorClass={currentBalance < 0 ? "text-rose-500" : "text-primary"} bgClass="bg-indigo-50" currency={currency} />
          <StatsCard title={t.totalIncome} amount={totalIncome} icon={TrendingUp} colorClass="text-emerald-500" bgClass="bg-emerald-50" currency={currency} />
          <StatsCard title={t.totalExpense} amount={totalExpense} icon={TrendingDown} colorClass="text-rose-500" bgClass="bg-rose-50" currency={currency} />
        </div>

        {transactions.length > 0 && <AnalyticsDashboard transactions={transactions} budgets={budgets} lang={language} currency={currency} />}
        
        <ActiveLoans 
            transactions={transactions}
            onRepay={handleRepayLoan}
            onDelete={handleDelete}
            lang={language}
            currency={currency}
        />

        <SavingsGoals goals={goals} onAddGoal={handleAddGoal} onUpdateGoal={handleUpdateGoal} onDeleteGoal={handleDeleteGoal} lang={language} currency={currency} />

        <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 mb-8 sticky top-6 z-20" dir={isRTL ? 'rtl' : 'ltr'}>
            <QuickAdd 
                quickAddItems={quickAddItems}
                onQuickAdd={handleProcessInput} 
                onAddQuickItem={handleAddQuickItem}
                onDeleteQuickItem={handleDeleteQuickItem}
                categories={categories}
                categoryIcons={categoryIcons}
                lang={language} 
            />
            <InputArea onProcess={handleProcessInput} onImageProcess={handleImageInput} status={parsingStatus} lang={language} />
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl flex items-center justify-between animate-fade-in shadow-sm" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex items-center gap-2"><AlertCircle className="w-5 h-5" /><span className="font-bold text-sm">{errorMsg}</span></div>
            <button onClick={() => setErrorMsg(null)} className="p-1 hover:bg-rose-100 rounded-full transition-colors">&times;</button>
          </div>
        )}

        <FilterBar filters={filters} setFilters={setFilters} availableCategories={categories} lang={language} />

        <TransactionList 
          transactions={filteredTransactions} 
          onDelete={handleDelete}
          onEdit={openEditModal}
          onRepay={handleRepayLoan}
          lang={language}
          currency={currency}
          categoryIcons={categoryIcons}
        />
      </main>

      <EditModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} transaction={editingTransaction} onSave={handleUpdateTransaction} lang={language} categories={categories} />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} lang={language} currency={currency} setCurrency={setCurrency} categories={categories} onAddCategory={handleAddCategory} onRemoveCategory={handleRemoveCategory} budgets={budgets} onSetBudget={handleSetBudget} settings={settings} onUpdateSettings={handleUpdateSettings} categoryIcons={categoryIcons} />
      <MonthlyReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} transactions={transactions} lang={language} currency={currency} />
      <UserGuideModal isOpen={isGuideModalOpen} onClose={() => setIsGuideModalOpen(false)} lang={language} />
    </div>
  );
};