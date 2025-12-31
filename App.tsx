import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, ParsingStatus, Language, FilterState, DICTIONARY, CurrencyCode } from './types';
import { parseTransactionText } from './services/geminiService';
import { exportTransactionsToExcel } from './services/excelService';
import { StatsCard } from './components/StatsCard';
import { TransactionList } from './components/TransactionList';
import { InputArea } from './components/InputArea';
import { EditModal } from './components/EditModal';
import { FilterBar } from './components/FilterBar';
import { SettingsModal } from './components/SettingsModal';
import { Wallet, TrendingUp, TrendingDown, Download, BadgeDollarSign, Globe, Settings } from 'lucide-react';

export const App: React.FC = () => {
  // --- State ---
  const [language, setLanguage] = useState<Language>('en');
  const [currency, setCurrency] = useState<CurrencyCode>('MAD');
  
  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('finance_categories');
    return saved ? JSON.parse(saved) : ['Food', 'Transport', 'Salary', 'Utilities', 'Entertainment', 'Housing', 'Health', 'General'];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('finance_transactions');
    return saved ? JSON.parse(saved) : [];
  });

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
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const t = DICTIONARY[language];
  const isRTL = language === 'ar';

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('finance_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('finance_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    // Update HTML dir attribute for global RTL support
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  // Recurring Transactions Logic
  useEffect(() => {
    const checkRecurring = () => {
      const now = new Date();
      let hasChanges = false;
      const newTransactions: Transaction[] = [];
      
      const updatedTransactions = transactions.map(t => {
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
        let generatedDate = new Date(lastRun); // temp tracker for loop
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

      if (hasChanges) {
        setTransactions(prev => [...newTransactions, ...updatedTransactions]);
      }
    };

    // Run check once on mount (or when transactions list length changes significantly, but careful with loops)
    // To prevent infinite loop if we update transactions inside, we only run this if we haven't checked recently or on manual trigger.
    // For simplicity here, we only run it if the transaction count is stable, but that's tricky.
    // Better: Run only on mount.
    // Actually, to make it robust in this `useEffect` without dep loop:
    // We can rely on the fact that we update `lastGenerated`.
    // Let's just run it once on component mount.
  }, []); // Empty dependency array = run on mount only.

  // --- Handlers ---
  const handleProcessInput = async (text: string) => {
    setParsingStatus(ParsingStatus.PROCESSING);
    setErrorMsg(null);

    const result = await parseTransactionText(text, language);

    if (result) {
      // Auto-add new category if it doesn't exist? 
      // User asked to "manage" categories. Let's just add it if it's new to be helpful.
      if (result.category && !categories.includes(result.category)) {
          setCategories(prev => [...prev, result.category]);
      }

      const newTransaction: Transaction = {
        id: crypto.randomUUID(),
        amount: result.amount,
        description: result.description,
        category: result.category,
        type: result.type,
        date: new Date().toISOString(),
        recurrence: 'none'
      };

      setTransactions(prev => [newTransaction, ...prev]);
      setParsingStatus(ParsingStatus.SUCCESS);
      
      setTimeout(() => setParsingStatus(ParsingStatus.IDLE), 2000);
    } else {
      setErrorMsg(language === 'ar' ? "لم نتمكن من فهم المعاملة. يرجى المحاولة مرة أخرى." : "Could not understand that transaction. Please try again.");
      setParsingStatus(ParsingStatus.ERROR);
      setTimeout(() => setParsingStatus(ParsingStatus.IDLE), 3000);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm(language === 'ar' ? 'هل أنت متأكد أنك تريد حذف هذه المعاملة؟' : 'Are you sure you want to delete this transaction?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const handleUpdateTransaction = (updated: Transaction) => {
    // If category changed to something new, add it
    if (updated.category && !categories.includes(updated.category)) {
        setCategories(prev => [...prev, updated.category]);
    }
    setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en');
  };

  const handleAddCategory = (cat: string) => {
    if (!categories.includes(cat)) {
        setCategories(prev => [...prev, cat]);
    }
  };

  const handleRemoveCategory = (cat: string) => {
    setCategories(prev => prev.filter(c => c !== cat));
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
        // Add one day to end date to make it inclusive for the whole day
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && new Date(t.date) <= end;
      }

      return matchesSearch && matchesType && matchesCategory && matchesDate;
    });
  }, [transactions, filters]);

  // Calculations based on FILTERED data
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const currentBalance = totalIncome - totalExpense;

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
              className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium"
            >
              <Globe className="w-4 h-4" />
              <span>{language.toUpperCase()}</span>
            </button>
            <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="p-2 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                title={t.settings}
            >
                <Settings className="w-5 h-5" />
            </button>
            <button 
              onClick={() => exportTransactionsToExcel(filteredTransactions)}
              className="text-slate-500 hover:text-secondary transition-colors flex items-center text-sm font-medium gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100"
              title={t.exportXlsx}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{t.exportXlsx}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8">
        
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
                {language === 'en' ? 'Try typing:' : 'جرب كتابة:'} <span className="font-mono bg-white px-1 rounded text-indigo-600">{t.welcomeExample}</span>
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
            colorClass="text-primary" 
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

        {/* Input Area */}
        <InputArea onProcess={handleProcessInput} status={parsingStatus} lang={language} />

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
          lang={language}
          currency={currency}
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
      />
    </div>
  );
};
