export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: string;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  lastGenerated?: string; // Tracks the last date a recurring transaction was generated
}

export type Language = 'en' | 'ar';

export type CurrencyCode = 'MAD' | 'USD' | 'EUR' | 'GBP';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  position: 'prefix' | 'suffix';
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
    none: "None"
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
    none: "لا يوجد"
  }
};
