import { Transaction } from '../types';

const TRANSACTIONS_KEY = 'finance_transactions';
const CATEGORIES_KEY = 'finance_categories';

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
      return data ? JSON.parse(data) : ['Food', 'Transport', 'Salary', 'Utilities', 'Entertainment', 'Housing', 'Health', 'General'];
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
  }
};
