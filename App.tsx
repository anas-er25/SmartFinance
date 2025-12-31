import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, ParsingStatus, Language, FilterState, DICTIONARY, CurrencyCode, Budget, AppSettings, SavingsGoal } from './types';
import { parseTransactionText } from './services/geminiService';
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
import { Wallet, TrendingUp, TrendingDown, Download, BadgeDollarSign, Globe, Settings, PieChart, AlertTriangle, MessageCircle, Mail, HelpCircle } from 'lucide-react';

export const App: React.FC = () => {
  // --- State ---
  const [language, setLanguage] = useState<Language>('en');
  const [currency, setCurrency] = useState<CurrencyCode>('MAD');
  
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryIcons, setCategoryIcons] = useState<Record<string, string>>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ lowBalanceThreshold: 500 });

  const [parsingStatus, setParsingStatus] = useState<ParsingStatus>(ParsingStatus.IDLE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filtering State
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: 'all',
    startDate: '',
    endDate: '',
    category: ''
  });

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const t = DICTIONARY[language];
  const isRTL = language === 'ar';

  // --- Effects ---
  
  // Load data from "Database" on mount
  useEffect(() => {
    const loadData = async () => {
      const txs = await db.transactions.getAll();
      const cats = await db.categories.getAll();
      const icons = await db.categoryIcons.getAll();
      const bgs = await db.budgets.getAll();
      const stg = await db.settings.get();
      const gls = await db.goals.getAll();
      
      setTransactions(txs);
      setCategories(cats);
      setCategoryIcons(icons);
      setBudgets(bgs);
      setSettings(stg);
      setGoals(gls);
      
      // Open guide on first visit if no transactions
      if (txs.length === 0) {
        setIsGuideModalOpen(true);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    // Update HTML dir attribute for global RTL support
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  // Recurring Transactions & Auto Salary Logic
  useEffect(() => {
    // We run this check even if transactions is empty, provided we have salary settings
    if (transactions.length === 0 && !settings.monthlySalary) return;

    const checkRecurringAndSalary = async () => {
      const now = new Date();
      let hasChanges = false;
      let newTransactions: Transaction[] = [];
      const updatedList = [...transactions];
      
      // 1. Process standard recurring items
      const updatedTransactions = updatedList.map(t => {
        if (!t.recurrence || t.recurrence === 'none') return t;
        
        // Determine last run date
        const lastRunStr = t.lastGenerated || t.date;
        const lastRun = new Date(lastRunStr);
        let nextRun = new Date(lastRun);
        
        // Calculate next run
        if (t.recurrence === 'daily') nextRun.setDate(nextRun.getDate() + 1);
        if (t.recurrence === 'weekly') nextRun.setDate(nextRun.getDate() + 7);
        if (t.recurrence === 'monthly') nextRun.setMonth(nextRun.getMonth() + 1);

        // Generate transactions until caught up to today
        let latestGeneratedStr = t.lastGenerated;

        if (nextRun <= now) {
            hasChanges = true;
            // Generate
            const newT: Transaction = {
                ...t,
                id: crypto.randomUUID(),
                date: nextRun.toISOString(),
                recurrence: 'none', // Generated children don't recur
                lastGenerated: undefined
            };
            newTransactions.push(newT);
            latestGeneratedStr = nextRun.toISOString();
        }

        if (latestGeneratedStr !== t.lastGenerated) {
            return { ...t, lastGenerated: latestGeneratedStr };
        }
        return t;
      });

      // 2. Process Automatic Monthly Salary
      if (settings.monthlySalary && settings.salaryDay && now.getDate() >= settings.salaryDay) {
          const salaryDesc = "Monthly Salary (Auto)";
          // Check if salary already exists for this month/year
          const salaryExists = [...transactions, ...newTransactions].some(t => 
              t.category === 'Salary' &&
              t.type === 'income' &&
              new Date(t.date).getMonth() === now.getMonth() && 
              new Date(t.date).getFullYear() === now.getFullYear()
          );

          if (!salaryExists) {
              const salaryTransaction: Transaction = {
                  id: crypto.randomUUID(),
                  amount: settings.monthlySalary,
                  description: salaryDesc,
                  category: 'Salary',
                  type: 'income',
                  date: new Date().toISOString(),
                  recurrence: 'none',
                  isHarmful: false,
                  isUnnecessary: false
              };
              newTransactions.push(salaryTransaction);
              hasChanges = true;
          }
      }

      if (hasChanges) {
        const finalList = [...newTransactions, ...updatedTransactions];
        setTransactions(finalList);
        await db.transactions.save(finalList);
      }
    };

    checkRecurringAndSalary();
  }, [transactions.length, settings.monthlySalary, settings.salaryDay]); 

  // --- Handlers ---
  const handleProcessInput = async (text: string) => {
    setParsingStatus(ParsingStatus.PROCESSING);
    setErrorMsg(null);

    const result = await parseTransactionText(text, language);

    if (result) {
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
            isRepaid: false
        } : undefined
      };

      const updatedTxs = await db.transactions.add(newTransaction);
      setTransactions(updatedTxs);
      
      setParsingStatus(ParsingStatus.SUCCESS);
      
      setTimeout(() => setParsingStatus(ParsingStatus.IDLE), 2000);
    } else {
      setErrorMsg(language === 'ar' ? "لم نتمكن من فهم المعاملة." : "Could not understand that transaction.");
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
      if (window.confirm(t.confirmRepay)) {
          // 1. Mark original loan as repaid
          const updatedTx: Transaction = {
              ...transaction,
              loanDetails: {
                  ...transaction.loanDetails,
                  isRepaid: true
              }
          };
          
          await db.transactions.update(updatedTx);
          
          // 2. Create repayment income
          const repaymentTx: Transaction = {
              id: crypto.randomUUID(),
              amount: transaction.amount,
              description: `${t.repaymentFrom} ${transaction.loanDetails.borrower}`,
              category: 'Loans',
              type: 'income',
              date: new Date().toISOString(),
              recurrence: 'none',
              isHarmful: false,
              isUnnecessary: false
          };
          
          // We fetch fresh to ensure we have the update
          const updatedList = await db.transactions.add(repaymentTx);
          setTransactions(updatedList);
      }
  };

  const toggleLanguage = () => {
    setLanguage(prev => {
        if (prev === 'en') return 'ar';
        if (prev === 'ar') return 'fr';
        return 'en';
    });
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
      // 1. Update the goal object
      const updatedGoals = await db.goals.update(goal);
      setGoals(updatedGoals);

      // 2. If money was added (deposit), create a transaction expense
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

  // --- Derived State (Filtering) ---
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Search
      const matchesSearch = t.description.toLowerCase().includes(filters.search.toLowerCase()) || 
                            t.category.toLowerCase().includes(filters.search.toLowerCase());
      
      // Type
      const matchesType = filters.type === 'all' || t.type === filters.type;

      // Category
      const matchesCategory = filters.category === '' || t.category === filters.category;

      // Date Range
      let matchesDate = true;
      if (filters.startDate) {
        matchesDate = matchesDate && new Date(t.date) >= new Date(filters.startDate);
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && new Date(t.date) <= end;
      }

      return matchesSearch && matchesType && matchesCategory && matchesDate;
    });
  }, [transactions, filters]);

  // Calculations
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const currentBalance = totalIncome - totalExpense;

  // Notification Links (Now includes recent bad items)
  const { waUrl, mailUrl } = createNotificationLinks(currentBalance, currency, filteredTransactions);
  const showLowBalanceWarning = currentBalance < settings.lowBalanceThreshold && transactions.length > 0;

  return (
    <div className={`min-h-screen pb-12 bg-slate-50 font-sans ${isRTL ? 'text-right' : 'text-left'}`}>
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <BadgeDollarSign className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight hidden sm:block">{t.title}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium uppercase"
            >
              <Globe className="w-4 h-4" />
              <span>{language}</span>
            </button>
            <button
                onClick={() => setIsGuideModalOpen(true)}
                className="p-2 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                title={t.help}
            >
                <HelpCircle className="w-5 h-5" />
            </button>
            <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="p-2 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                title={t.settings}
            >
                <Settings className="w-5 h-5" />
            </button>
            <div className="flex gap-1 border-l border-slate-200 pl-2 ml-1">
                <button 
                onClick={() => exportTransactionsToExcel(filteredTransactions)}
                className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title={t.exportXlsx}
                >
                <Download className="w-5 h-5" />
                </button>
                <button 
                onClick={() => setIsReportModalOpen(true)}
                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title={t.monthlyReport}
                >
                <PieChart className="w-5 h-5" />
                </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8">
        
        {/* Low Balance Alert */}
        {showLowBalanceWarning && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-bounce-slow" dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-orange-500" />
                    <div>
                        <h4 className="font-bold text-orange-800">{t.lowBalance}</h4>
                        <p className="text-sm text-orange-700">{t.lowBalanceMsg}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <a href={waUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        {t.sendWhatsapp}
                    </a>
                    <a href={mailUrl} className="flex items-center gap-2 px-3 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 text-sm font-medium transition-colors">
                        <Mail className="w-4 h-4" />
                        {t.sendEmail}
                    </a>
                </div>
            </div>
        )}

        {/* Intro / Empty State Prompt */}
        {transactions.length === 0 && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-8 flex items-start gap-4 animate-fade-in" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="bg-white p-2 rounded-full shadow-sm shrink-0">
              <TrendingUp className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
              <h3 className="text-indigo-900 font-semibold text-lg">{t.welcomeTitle}</h3>
              <p className="text-indigo-700 mt-1">
                {t.welcomeText} 
                <br />
                {language === 'en' ? 'Try typing:' : (language === 'ar' ? 'جرب كتابة:' : 'Essayez:')} <span className="font-mono bg-white px-1 rounded text-indigo-600">{t.welcomeExample}</span>
              </p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8" dir={isRTL ? 'rtl' : 'ltr'}>
          <StatsCard 
            title={t.currentBalance} 
            amount={currentBalance} 
            icon={Wallet} 
            colorClass={currentBalance < 0 ? "text-rose-500" : "text-primary"}
            bgClass="bg-indigo-50"
            currency={currency}
          />
          <StatsCard 
            title={t.totalIncome} 
            amount={totalIncome} 
            icon={TrendingUp} 
            colorClass="text-emerald-500" 
            bgClass="bg-emerald-50"
            currency={currency}
          />
          <StatsCard 
            title={t.totalExpense} 
            amount={totalExpense} 
            icon={TrendingDown} 
            colorClass="text-rose-500" 
            bgClass="bg-rose-50"
            currency={currency}
          />
        </div>

        {/* Analytics & Budget Dashboard */}
        {transactions.length > 0 && (
            <AnalyticsDashboard 
                transactions={transactions} 
                budgets={budgets} 
                lang={language}
                currency={currency}
            />
        )}

        {/* Savings Goals */}
        <SavingsGoals 
            goals={goals} 
            onAddGoal={handleAddGoal} 
            onUpdateGoal={handleUpdateGoal} 
            onDeleteGoal={handleDeleteGoal}
            lang={language}
            currency={currency}
        />

        {/* Active Loans */}
        <ActiveLoans 
            transactions={transactions}
            onRepay={handleRepayLoan}
            onDelete={handleDelete}
            lang={language}
            currency={currency}
        />

        {/* Input Area + Quick Add */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 mb-8 sticky top-6 z-20" dir={isRTL ? 'rtl' : 'ltr'}>
            <QuickAdd onQuickAdd={handleProcessInput} lang={language} />
            <InputArea onProcess={handleProcessInput} status={parsingStatus} lang={language} />
        </div>

        {/* Error Message Toast */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center justify-between animate-fade-in" dir={isRTL ? 'rtl' : 'ltr'}>
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-rose-600 font-bold">&times;</button>
          </div>
        )}

        {/* Filters */}
        <FilterBar 
          filters={filters} 
          setFilters={setFilters} 
          availableCategories={categories}
          lang={language}
        />

        {/* Transaction List */}
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

      {/* Modals */}
      <EditModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        transaction={editingTransaction}
        onSave={handleUpdateTransaction}
        lang={language}
        categories={categories}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        lang={language}
        currency={currency}
        setCurrency={setCurrency}
        categories={categories}
        onAddCategory={handleAddCategory}
        onRemoveCategory={handleRemoveCategory}
        budgets={budgets}
        onSetBudget={handleSetBudget}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        categoryIcons={categoryIcons}
      />

      <MonthlyReportModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        transactions={transactions}
        lang={language}
        currency={currency}
      />

      <UserGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        lang={language}
      />
    </div>
  );
};