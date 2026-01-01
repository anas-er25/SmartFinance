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
  loanDetails?: {
    isLoan: boolean;
    borrower?: string;
    repaymentDate?: string;
    isRepaid?: boolean;
    repayments?: Array<{ amount: number; date: string }>;
  };
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  color: string;
  icon: string;
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
  monthlySalary?: number;
  salaryDay?: number;
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
  isLoan?: boolean;
  borrower?: string;
  repaymentDate?: string;
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
    pickIcon: "Icon",
    help: "Help",
    userGuide: "User Guide",
    guideVoiceTitle: "Voice Recording",
    guideVoiceDesc: "Tap the microphone and say 'Spent 50 DH on coffee'. The AI will categorize it.",
    guideQuickAddTitle: "Quick Add",
    guideQuickAddDesc: "Use shortcuts for common expenses like coffee or lunch.",
    guideAnalysisTitle: "Smart Analysis",
    guideAnalysisDesc: "The app flags unnecessary or harmful spending automatically.",
    guideBudgetTitle: "Budgets & Icons",
    guideBudgetDesc: "Set monthly limits and custom icons in Settings.",
    guideLoansTitle: "Loan Tracking",
    guideLoansDesc: "Track money lent to friends. Mark them as repaid when you receive the money back.",
    guideSalaryTitle: "Automatic Salary",
    guideSalaryDesc: "Set your monthly salary in Settings to be added automatically on a specific day.",
    gotIt: "Got it!",
    savingsGoals: "Savings Goals",
    addGoal: "Add Goal",
    goalName: "Goal Name",
    targetAmount: "Target Amount",
    deposit: "Deposit",
    withdraw: "Withdraw",
    congrats: "Goal Reached!",
    dataManagement: "Data Management",
    backupData: "Backup Data",
    restoreData: "Restore Data",
    backupDesc: "Download a copy of your data.",
    restoreDesc: "Upload a backup file to restore data.",
    restoreWarning: "This will overwrite all current data.",
    fileError: "Invalid file format.",
    successRestore: "Data restored successfully!",
    currentSaved: "Saved",
    lentTo: "Lent to",
    repaymentDue: "Due",
    autoSalary: "Automatic Monthly Salary",
    salaryAmount: "Salary Amount",
    salaryDay: "Day of Month (1-31)",
    markRepaid: "Mark Repaid",
    addRepayment: "Add Repayment",
    repaid: "Repaid",
    confirmRepay: "Enter amount repaid by",
    repaymentFrom: "Repayment from",
    activeLoans: "Active Loans",
    noActiveLoans: "No active loans.",
    resetSystem: "Reset System",
    resetWarning: "Permanently delete ALL data.",
    confirmReset: "Are you sure? This will delete all transactions, goals, and settings. This cannot be undone.",
    partialRepayment: "Partial Repayment",
    fullRepayment: "Full Repayment"
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
    pickIcon: "أيقونة",
    help: "مساعدة",
    userGuide: "دليل المستخدم",
    guideVoiceTitle: "التسجيل الصوتي",
    guideVoiceDesc: "اضغط الميكروفون وقل 'صرفت 50 درهم قهوة'. سيقوم الذكاء الاصطناعي بتصنيفها.",
    guideQuickAddTitle: "الإضافة السريعة",
    guideQuickAddDesc: "استخدم الاختصارات للمصاريف المتكررة مثل القهوة أو الغداء.",
    guideAnalysisTitle: "التحليل الذكي",
    guideAnalysisDesc: "يقوم التطبيق بتحديد الإنفاق غير الضروري أو الضار تلقائياً.",
    guideBudgetTitle: "الميزانيات والأيقونات",
    guideBudgetDesc: "حدد حدوداً شهرية وأيقونات مخصصة في الإعدادات.",
    guideLoansTitle: "تتبع القروض",
    guideLoansDesc: "تتبع الأموال التي أقرضتها للأصدقاء. حددها كمدفوعة عند استلام المال.",
    guideSalaryTitle: "الراتب التلقائي",
    guideSalaryDesc: "اضبط راتبك الشهري في الإعدادات ليتم إضافته تلقائياً في يوم محدد.",
    gotIt: "فهمت!",
    savingsGoals: "أهداف الادخار",
    addGoal: "إضافة هدف",
    goalName: "اسم الهدف",
    targetAmount: "المبلغ المستهدف",
    deposit: "إيداع",
    withdraw: "سحب",
    congrats: "تم تحقيق الهدف!",
    dataManagement: "إدارة البيانات",
    backupData: "نسخ احتياطي",
    restoreData: "استعادة البيانات",
    backupDesc: "قم بتنزيل نسخة من بياناتك.",
    restoreDesc: "ارفع ملف النسخة الاحتياطية للاستعادة.",
    restoreWarning: "سيؤدي هذا إلى استبدال جميع البيانات الحالية.",
    fileError: "صيغة الملف غير صالحة.",
    successRestore: "تم استعادة البيانات بنجاح!",
    currentSaved: "تم توفير",
    lentTo: "أقرضت لـ",
    repaymentDue: "يستحق في",
    autoSalary: "الراتب الشهري التلقائي",
    salaryAmount: "مبلغ الراتب",
    salaryDay: "يوم الشهر (1-31)",
    markRepaid: "تحديد كمدفوع",
    addRepayment: "إضافة سداد",
    repaid: "تم السداد",
    confirmRepay: "أدخل المبلغ المدفوع من قبل",
    repaymentFrom: "سداد من",
    activeLoans: "القروض النشطة",
    noActiveLoans: "لا توجد قروض نشطة.",
    resetSystem: "إعادة تعيين النظام",
    resetWarning: "حذف جميع البيانات نهائياً.",
    confirmReset: "هل أنت متأكد؟ سيؤدي هذا إلى حذف جميع المعاملات والأهداف والإعدادات. لا يمكن التراجع عن هذه الخطوة.",
    partialRepayment: "سداد جزئي",
    fullRepayment: "سداد كامل"
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
    pickIcon: "Icône",
    help: "Aide",
    userGuide: "Guide Utilisateur",
    guideVoiceTitle: "Enregistrement Vocal",
    guideVoiceDesc: "Appuyez sur le micro et dites '50 DH pour le café'. L'IA le catégorisera.",
    guideQuickAddTitle: "Ajout Rapide",
    guideQuickAddDesc: "Utilisez les raccourcis pour les dépenses courantes.",
    guideAnalysisTitle: "Analyse Intelligente",
    guideAnalysisDesc: "L'application signale automatiquement les dépenses inutiles ou nuisibles.",
    guideBudgetTitle: "Budgets & Icônes",
    guideBudgetDesc: "Définissez des limites mensuelles et des icônes personnalisées dans les paramètres.",
    guideLoansTitle: "Suivi des Prêts",
    guideLoansDesc: "Suivez l'argent prêté à des amis. Marquez-les comme remboursés lorsque vous recevez l'argent.",
    guideSalaryTitle: "Salaire Automatique",
    guideSalaryDesc: "Définissez votre salaire mensuel dans les paramètres pour qu'il soit ajouté automatiquement.",
    gotIt: "Compris!",
    savingsGoals: "Objectifs d'Épargne",
    addGoal: "Ajouter Objectif",
    goalName: "Nom de l'Objectif",
    targetAmount: "Montant Cible",
    deposit: "Dépôt",
    withdraw: "Retrait",
    congrats: "Objectif Atteint!",
    dataManagement: "Gestion des Données",
    backupData: "Sauvegarder",
    restoreData: "Restaurer",
    backupDesc: "Télécharger une copie de vos données.",
    restoreDesc: "Uploader un fichier de sauvegarde.",
    restoreWarning: "Cela écrasera toutes les données actuelles.",
    fileError: "Format de fichier invalide.",
    successRestore: "Données restaurées avec succès!",
    currentSaved: "Épargné",
    lentTo: "Prêté à",
    repaymentDue: "Pour le",
    autoSalary: "Salaire Mensuel Auto",
    salaryAmount: "Montant Salaire",
    salaryDay: "Jour du Mois (1-31)",
    markRepaid: "Marquer comme remboursé",
    addRepayment: "Ajouter Remboursement",
    repaid: "Remboursé",
    confirmRepay: "Entrez le montant remboursé par",
    repaymentFrom: "Remboursement de",
    activeLoans: "Prêts Actifs",
    noActiveLoans: "Aucun prêt actif.",
    resetSystem: "Réinitialiser",
    resetWarning: "Supprimer TOUTES les données.",
    confirmReset: "Êtes-vous sûr ? Cela supprimera toutes les transactions, objectifs et paramètres. Cette action est irréversible.",
    partialRepayment: "Remboursement Partiel",
    fullRepayment: "Remboursement Complet"
  }
};