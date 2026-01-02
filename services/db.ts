import { Transaction, Budget, AppSettings, SavingsGoal, QuickAddItem } from '../types';

const TRANSACTIONS_KEY = 'finance_transactions';
const CATEGORIES_KEY = 'finance_categories';
const BUDGETS_KEY = 'finance_budgets';
const SETTINGS_KEY = 'finance_settings';
const CAT_ICONS_KEY = 'finance_category_icons';
const GOALS_KEY = 'finance_goals';
const QUICK_ADDS_KEY = 'finance_quick_adds';

const DEFAULT_QUICK_ADDS: QuickAddItem[] = [
    { id: '1', label: 'Coffee', text: 'Spent 20 on Coffee', amount: 20, category: 'Coffee', colorClass: 'text-amber-600 bg-amber-50 border-amber-100 hover:bg-amber-100' },
    { id: '2', label: 'Lunch', text: 'Spent 50 on Lunch', amount: 50, category: 'Food', colorClass: 'text-orange-600 bg-orange-50 border-orange-100 hover:bg-orange-100' },
    { id: '3', label: 'Transport', text: 'Spent 30 on Transport', amount: 30, category: 'Transport', colorClass: 'text-blue-600 bg-blue-50 border-blue-100 hover:bg-blue-100' },
    { id: '4', label: 'Groceries', text: 'Spent 100 on Groceries', amount: 100, category: 'Groceries', colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-100' },
];

export const db = {
  transactions: {
    getAll: async (): Promise<Transaction[]> => {
      const data = localStorage.getItem(TRANSACTIONS_KEY);
      return data ? JSON.parse(data) : [];
    },
    save: async (transactions: Transaction[]): Promise<void> => {
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
    },
    add: async (transaction: Transaction): Promise<Transaction[]> => {
      const current = await db.transactions.getAll();
      const updated = [transaction, ...current];
      await db.transactions.save(updated);
      return updated;
    },
    update: async (transaction: Transaction): Promise<Transaction[]> => {
      const current = await db.transactions.getAll();
      const updated = current.map(t => t.id === transaction.id ? transaction : t);
      await db.transactions.save(updated);
      return updated;
    },
    delete: async (id: string): Promise<Transaction[]> => {
      const current = await db.transactions.getAll();
      const updated = current.filter(t => t.id !== id);
      await db.transactions.save(updated);
      return updated;
    }
  },
  categories: {
    getAll: async (): Promise<string[]> => {
      const data = localStorage.getItem(CATEGORIES_KEY);
      return data ? JSON.parse(data) : ['Food', 'Transport', 'Salary', 'Utilities', 'Entertainment', 'Housing', 'Health', 'General', 'Savings'];
    },
    save: async (categories: string[]): Promise<void> => {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    },
    add: async (category: string): Promise<string[]> => {
      const current = await db.categories.getAll();
      if (!current.includes(category)) {
        const updated = [...current, category];
        await db.categories.save(updated);
        return updated;
      }
      return current;
    },
    delete: async (category: string): Promise<string[]> => {
      const current = await db.categories.getAll();
      const updated = current.filter(c => c !== category);
      await db.categories.save(updated);
      return updated;
    }
  },
  categoryIcons: {
    getAll: async (): Promise<Record<string, string>> => {
      const data = localStorage.getItem(CAT_ICONS_KEY);
      return data ? JSON.parse(data) : {
        'Food': 'food',
        'Transport': 'car',
        'Salary': 'work',
        'Utilities': 'utilities',
        'Entertainment': 'entertainment',
        'Housing': 'home',
        'Health': 'health',
        'General': 'tag',
        'Savings': 'bank'
      };
    },
    save: async (icons: Record<string, string>): Promise<void> => {
      localStorage.setItem(CAT_ICONS_KEY, JSON.stringify(icons));
    },
    set: async (category: string, iconKey: string): Promise<Record<string, string>> => {
      const current = await db.categoryIcons.getAll();
      const updated = { ...current, [category]: iconKey };
      await db.categoryIcons.save(updated);
      return updated;
    }
  },
  budgets: {
    getAll: async (): Promise<Budget[]> => {
      const data = localStorage.getItem(BUDGETS_KEY);
      return data ? JSON.parse(data) : [];
    },
    save: async (budgets: Budget[]): Promise<void> => {
      localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
    },
    set: async (category: string, limit: number): Promise<Budget[]> => {
      const current = await db.budgets.getAll();
      const existingIndex = current.findIndex(b => b.category === category);
      let updated;
      if (existingIndex >= 0) {
        updated = [...current];
        if (limit <= 0) {
            updated.splice(existingIndex, 1); // Remove budget if 0
        } else {
            updated[existingIndex].limit = limit;
        }
      } else {
        if (limit > 0) updated = [...current, { category, limit }];
        else updated = current;
      }
      await db.budgets.save(updated);
      return updated;
    }
  },
  goals: {
    getAll: async (): Promise<SavingsGoal[]> => {
      const data = localStorage.getItem(GOALS_KEY);
      return data ? JSON.parse(data) : [];
    },
    save: async (goals: SavingsGoal[]): Promise<void> => {
      localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
    },
    add: async (goal: SavingsGoal): Promise<SavingsGoal[]> => {
      const current = await db.goals.getAll();
      const updated = [...current, goal];
      await db.goals.save(updated);
      return updated;
    },
    update: async (goal: SavingsGoal): Promise<SavingsGoal[]> => {
        const current = await db.goals.getAll();
        const updated = current.map(g => g.id === goal.id ? goal : g);
        await db.goals.save(updated);
        return updated;
    },
    delete: async (id: string): Promise<SavingsGoal[]> => {
        const current = await db.goals.getAll();
        const updated = current.filter(g => g.id !== id);
        await db.goals.save(updated);
        return updated;
    }
  },
  quickAdds: {
    getAll: async (): Promise<QuickAddItem[]> => {
        const data = localStorage.getItem(QUICK_ADDS_KEY);
        return data ? JSON.parse(data) : DEFAULT_QUICK_ADDS;
    },
    save: async (items: QuickAddItem[]): Promise<void> => {
        localStorage.setItem(QUICK_ADDS_KEY, JSON.stringify(items));
    },
    add: async (item: QuickAddItem): Promise<QuickAddItem[]> => {
        const current = await db.quickAdds.getAll();
        const updated = [...current, item];
        await db.quickAdds.save(updated);
        return updated;
    },
    delete: async (id: string): Promise<QuickAddItem[]> => {
        const current = await db.quickAdds.getAll();
        const updated = current.filter(i => i.id !== id);
        await db.quickAdds.save(updated);
        return updated;
    }
  },
  settings: {
    get: async (): Promise<AppSettings> => {
      const data = localStorage.getItem(SETTINGS_KEY);
      return data ? JSON.parse(data) : { lowBalanceThreshold: 500 };
    },
    save: async (settings: AppSettings): Promise<void> => {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }
  },
  system: {
      backup: async (): Promise<string> => {
          const data = {
              transactions: await db.transactions.getAll(),
              categories: await db.categories.getAll(),
              categoryIcons: await db.categoryIcons.getAll(),
              budgets: await db.budgets.getAll(),
              settings: await db.settings.get(),
              goals: await db.goals.getAll(),
              quickAdds: await db.quickAdds.getAll()
          };
          return JSON.stringify(data, null, 2);
      },
      restore: async (jsonString: string): Promise<boolean> => {
          try {
              const data = JSON.parse(jsonString);
              if (data.transactions) await db.transactions.save(data.transactions);
              if (data.categories) await db.categories.save(data.categories);
              if (data.categoryIcons) await db.categoryIcons.save(data.categoryIcons);
              if (data.budgets) await db.budgets.save(data.budgets);
              if (data.settings) await db.settings.save(data.settings);
              if (data.goals) await db.goals.save(data.goals);
              if (data.quickAdds) await db.quickAdds.save(data.quickAdds);
              return true;
          } catch (e) {
              console.error("Restore failed", e);
              return false;
          }
      },
      clearAll: async (): Promise<void> => {
          localStorage.removeItem(TRANSACTIONS_KEY);
          localStorage.removeItem(CATEGORIES_KEY);
          localStorage.removeItem(BUDGETS_KEY);
          localStorage.removeItem(SETTINGS_KEY);
          localStorage.removeItem(CAT_ICONS_KEY);
          localStorage.removeItem(GOALS_KEY);
          localStorage.removeItem(QUICK_ADDS_KEY);
      },
      fillDemoData: async (): Promise<void> => {
          // 1. Ensure categories and icons exist
          const cats = ['Salary', 'Food', 'Transport', 'Utilities', 'Entertainment', 'Shopping', 'Health', 'Loans'];
          for (const c of cats) await db.categories.add(c);
          
          await db.categoryIcons.set('Salary', 'work');
          await db.categoryIcons.set('Food', 'food');
          await db.categoryIcons.set('Transport', 'car');
          await db.categoryIcons.set('Utilities', 'utilities');
          await db.categoryIcons.set('Entertainment', 'entertainment');
          await db.categoryIcons.set('Shopping', 'shopping');
          await db.categoryIcons.set('Health', 'health');
          await db.categoryIcons.set('Loans', 'bank');

          // 2. Add Transactions relative to today
          const today = new Date();
          const d = (offset: number) => {
              const date = new Date(today);
              date.setDate(today.getDate() - offset);
              return date.toISOString();
          };

          const demoTxs: Transaction[] = [
              { id: crypto.randomUUID(), amount: 5000, description: 'Monthly Salary', category: 'Salary', type: 'income', date: d(20), recurrence: 'monthly', isHarmful: false, isUnnecessary: false },
              { id: crypto.randomUUID(), amount: 150, description: 'Weekly Groceries', category: 'Food', type: 'expense', date: d(18), recurrence: 'weekly', isHarmful: false, isUnnecessary: false },
              { id: crypto.randomUUID(), amount: 45, description: 'Uber Ride', category: 'Transport', type: 'expense', date: d(15), isHarmful: false, isUnnecessary: false },
              { id: crypto.randomUUID(), amount: 200, description: 'Dinner with Friends', category: 'Entertainment', type: 'expense', date: d(10), isHarmful: false, isUnnecessary: true, analysisReasoning: "Dining out frequently is a luxury." },
              { id: crypto.randomUUID(), amount: 80, description: 'Pharmacy', category: 'Health', type: 'expense', date: d(5), isHarmful: false, isUnnecessary: false },
              { id: crypto.randomUUID(), amount: 1200, description: 'New Headphones', category: 'Shopping', type: 'expense', date: d(2), isHarmful: false, isUnnecessary: true, analysisReasoning: "Impulse buy." },
              { id: crypto.randomUUID(), amount: 50, description: 'Cigarettes', category: 'Health', type: 'expense', date: d(1), isHarmful: true, isUnnecessary: true, analysisReasoning: "Damaging to health." },
              { 
                  id: crypto.randomUUID(), 
                  amount: 300, 
                  description: 'Lent to John', 
                  category: 'Loans', 
                  type: 'expense', 
                  date: d(12), 
                  isHarmful: false, 
                  isUnnecessary: false,
                  loanDetails: {
                      isLoan: true,
                      borrower: 'John',
                      repaymentDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Due next week
                      isRepaid: false,
                      repayments: []
                  }
              }
          ];

          for (const tx of demoTxs) await db.transactions.add(tx);

          // 3. Set Budgets
          await db.budgets.set('Food', 1000);
          await db.budgets.set('Entertainment', 500);

          // 4. Set Goals
          await db.goals.add({
              id: crypto.randomUUID(),
              name: 'Vacation Fund',
              targetAmount: 10000,
              currentAmount: 1500,
              color: 'bg-teal-500',
              icon: 'plane'
          });
      }
  }
};