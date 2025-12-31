export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: string;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  lastGenerated?: string; // Tracks the last date a recurring transaction was generated
  isHarmful?: boolean;
  isUnnecessary?: boolean;
  analysisReasoning?: string;
}

export type Language = 'en' | 'ar' | 'fr';

export type CurrencyCode = 'MAD' | 'USD' | 'EUR' | 'GBP';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  position: 'prefix' | 'suffix';
}

export interface Budget {
  category: string;
  limit: number;
}

export interface AppSettings {
  lowBalanceThreshold: number;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  MAD: { code: 'MAD', symbol: 'DH', position: 'suffix' },
  USD: { code: 'USD', symbol: '$', position: 'prefix' },
  EUR: { code: 'EUR', symbol: '€', position: 'prefix' },
  GBP: { code: 'GBP', symbol: '£', position: 'prefix' },
};

export interface FilterState {
  search: string;
  type: 'all' | 'income' | 'expense';
  startDate: string;
  endDate: string;
  category: string;
}

export interface AppState {
  balance: number;
  transactions: Transaction[];
  isProcessing: boolean;
  language: Language;
}

export enum ParsingStatus {
  IDLE = 'IDLE',
  LISTENING = 'LISTENING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface ParseResult {
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  isHarmful: boolean;
  isUnnecessary: boolean;
  analysisReasoning: string;
}

export const DICTIONARY = {
  en: {
    title: "SmartFinance",
    recordTransaction: "Record a Transaction",
    placeholder: 'Type or say "Spent 50 DH on groceries"',
    processing: "Processing...",
    add: "Add",
    listening: "Listening...",
    recentTransactions: "Recent Transactions",
    description: "Description",
    category: "Category",
    date: "Date",
    amount: "Amount",
    action: "Action",
    noTransactions: "No transactions recorded yet.",
    noTransactionsSub: "Your financial journey begins with a single record.",
    currentBalance: "Current Balance",
    totalIncome: "Total Income",
    totalExpense: "Total Expenses",
    exportXlsx: "Export Excel",
    exportPdf: "Export PDF",
    searchPlaceholder: "Search description...",
    filterAll: "All Types",
    filterIncome: "Income",
    filterExpense: "Expense",
    startDate: "Start Date",
    endDate: "End Date",
    editTransaction: "Edit Transaction",
    save: "Save",
    cancel: "Cancel",
    welcomeTitle: "Welcome to SmartFinance!",
    welcomeText: "Start by entering your initial salary or balance.",
    welcomeExample: "Initial balance 5000",
    allCategories: "All Categories",
    records: "Records",
    update: "Update",
    delete: "Delete",
    settings: "Settings",
    currency: "Currency",
    categories: "Categories",
    addCategory: "Add Category",
    manageCategories: "Manage Categories",
    recurrence: "Recurrence",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    none: "None",
    lowBalance: "Low Balance Warning!",
    lowBalanceMsg: "Your balance is below limit. Notify someone?",
    sendWhatsapp: "WhatsApp",
    sendEmail: "Email",
    monthlyReport: "Monthly Report",
    selectMonth: "Select Month",
    potentialSavings: "Potential Savings (Unnecessary)",
    healthRisks: "Health Risk Spending",
    netBalance: "Net Balance",
    unnecessary: "Unnecessary",
    harmful: "Harmful",
    reportFor: "Report for",
    close: "Close",
    analysis: "Spending Analysis",
    quickAdd: "Quick Add",
    spendingTrends: "Spending Trends",
    budgetStatus: "Budget Status",
    topCategories: "Top Categories",
    setBudget: "Set Monthly Budget",
    remaining: "remaining",
    overBudget: "Over Budget",
    lowBalanceThreshold: "Low Balance Threshold",
    pickIcon: "Icon"
  },
  ar: {
    title: "إدارة الأموال الذكية",
    recordTransaction: "سجل معاملة مالية",
    placeholder: 'اكتب أو قل "صرفت 50 درهم بقالة"',
    processing: "جاري المعالجة...",
    add: "إضافة",
    listening: "جاري الاستماع...",
    recentTransactions: "المعاملات الأخيرة",
    description: "الوصف",
    category: "الفئة",
    date: "التاريخ",
    amount: "المبلغ",
    action: "إجراء",
    noTransactions: "لا توجد معاملات مسجلة بعد.",
    noTransactionsSub: "رحلتك المالية تبدأ بتسجيل واحد.",
    currentBalance: "الرصيد الحالي",
    totalIncome: "إجمالي الدخل",
    totalExpense: "إجمالي المصروفات",
    exportXlsx: "تصدير إكسل",
    exportPdf: "تصدير PDF",
    searchPlaceholder: "بحث في الوصف...",
    filterAll: "كل الأنواع",
    filterIncome: "دخل",
    filterExpense: "مصروف",
    startDate: "من تاريخ",
    endDate: "إلى تاريخ",
    editTransaction: "تعديل المعاملة",
    save: "حفظ",
    cancel: "إلغاء",
    welcomeTitle: "مرحباً بك في إدارة الأموال",
    welcomeText: "ابدأ بإدخال راتبك المبدئي أو رصيدك الحالي.",
    welcomeExample: "الرصيد المبدئي 5000",
    allCategories: "كل الفئات",
    records: "سجلات",
    update: "تحديث",
    delete: "حذف",
    settings: "الإعدادات",
    currency: "العملة",
    categories: "الفئات",
    addCategory: "إضافة فئة",
    manageCategories: "إدارة الفئات",
    recurrence: "التكرار",
    daily: "يومي",
    weekly: "أسبوعي",
    monthly: "شهري",
    none: "لا يوجد",
    lowBalance: "تنبيه انخفاض الرصيد!",
    lowBalanceMsg: "رصيدك أقل من الحد. هل تود إرسال تنبيه؟",
    sendWhatsapp: "واتساب",
    sendEmail: "بريد إلكتروني",
    monthlyReport: "التقرير الشهري",
    selectMonth: "اختر الشهر",
    potentialSavings: "توفير محتمل (غير ضروري)",
    healthRisks: "إنفاق ضار بالصحة",
    netBalance: "صافي الرصيد",
    unnecessary: "غير ضروري",
    harmful: "ضار",
    reportFor: "تقرير شهر",
    close: "إغلاق",
    analysis: "تحليل الإنفاق",
    quickAdd: "إضافة سريعة",
    spendingTrends: "اتجاهات الإنفاق",
    budgetStatus: "حالة الميزانية",
    topCategories: "أعلى الفئات",
    setBudget: "تحديد ميزانية شهرية",
    remaining: "متبقي",
    overBudget: "تجاوز الميزانية",
    lowBalanceThreshold: "حد انخفاض الرصيد",
    pickIcon: "أيقونة"
  },
  fr: {
    title: "SmartFinance",
    recordTransaction: "Enregistrer une transaction",
    placeholder: 'Tapez ou dites "Dépensé 50 DH pour l\'épicerie"',
    processing: "Traitement...",
    add: "Ajouter",
    listening: "Écoute...",
    recentTransactions: "Transactions Récentes",
    description: "Description",
    category: "Catégorie",
    date: "Date",
    amount: "Montant",
    action: "Action",
    noTransactions: "Aucune transaction enregistrée.",
    noTransactionsSub: "Votre parcours financier commence par un seul enregistrement.",
    currentBalance: "Solde Actuel",
    totalIncome: "Revenus Totaux",
    totalExpense: "Dépenses Totales",
    exportXlsx: "Exporter Excel",
    exportPdf: "Exporter PDF",
    searchPlaceholder: "Rechercher...",
    filterAll: "Tous les types",
    filterIncome: "Revenu",
    filterExpense: "Dépense",
    startDate: "Date de début",
    endDate: "Date de fin",
    editTransaction: "Modifier Transaction",
    save: "Enregistrer",
    cancel: "Annuler",
    welcomeTitle: "Bienvenue sur SmartFinance!",
    welcomeText: "Commencez par saisir votre salaire ou solde initial.",
    welcomeExample: "Solde initial 5000",
    allCategories: "Toutes Catégories",
    records: "Enregistrements",
    update: "Mettre à jour",
    delete: "Supprimer",
    settings: "Paramètres",
    currency: "Devise",
    categories: "Catégories",
    addCategory: "Ajouter Catégorie",
    manageCategories: "Gérer Catégories",
    recurrence: "Récurrence",
    daily: "Quotidien",
    weekly: "Hebdomadaire",
    monthly: "Mensuel",
    none: "Aucun",
    lowBalance: "Attention Solde Bas!",
    lowBalanceMsg: "Votre solde est inférieur à la limite. Notifier quelqu'un?",
    sendWhatsapp: "WhatsApp",
    sendEmail: "Email",
    monthlyReport: "Rapport Mensuel",
    selectMonth: "Sélectionner le Mois",
    potentialSavings: "Économies Potentielles",
    healthRisks: "Risques Santé",
    netBalance: "Solde Net",
    unnecessary: "Inutile",
    harmful: "Nocif",
    reportFor: "Rapport pour",
    close: "Fermer",
    analysis: "Analyse des dépenses",
    quickAdd: "Ajout Rapide",
    spendingTrends: "Tendances des dépenses",
    budgetStatus: "État du Budget",
    topCategories: "Top Catégories",
    setBudget: "Définir Budget Mensuel",
    remaining: "restant",
    overBudget: "Budget Dépassé",
    lowBalanceThreshold: "Seuil Solde Bas",
    pickIcon: "Icône"
  }
};