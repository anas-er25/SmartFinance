import { Transaction, Budget, AppSettings, SavingsGoal } from '../types';

const TRANSACTIONS_KEY = 'finance_transactions';
const CATEGORIES_KEY = 'finance_categories';
const BUDGETS_KEY = 'finance_budgets';
const SETTINGS_KEY = 'finance_settings';
const CAT_ICONS_KEY = 'finance_category_icons';
const GOALS_KEY = 'finance_goals';

// This service mimics an async database to allow for easy future migration to a real backend.
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
              goals: await db.goals.getAll()
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
              return true;
          } catch (e) {
              console.error("Restore failed", e);
              return false;
          }
      }
  }
};