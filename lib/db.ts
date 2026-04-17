import Dexie, { Table } from 'dexie'
import type { Transaction, Budget, Category } from '@/types'

class BudgetDatabase extends Dexie {
  transactions!: Table<Transaction>
  budgets!: Table<Budget>
  categories!: Table<Category>

  constructor() {
    super('BudgetProDB')
    this.version(1).stores({
      transactions: '++id, type, category, date, syncStatus',
      budgets: '++id, category, period, syncStatus',
      categories: '++id, name'
    })
  }

  async addTransaction(transaction: Omit<Transaction, 'id' | 'syncStatus' | 'createdAt' | 'updatedAt'>) {
    const tx: Transaction = {
      ...transaction,
      syncStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const id = await this.transactions.add(tx)

    // Trigger background sync if available
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready
        await registration.sync.register('sync-transactions')
      } catch (error) {
        console.log('Background sync not supported')
      }
    }

    return id
  }

  async updateTransaction(id: number, updates: Partial<Transaction>) {
    await this.transactions.update(id, {
      ...updates,
      syncStatus: 'pending',
      updatedAt: new Date()
    })

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready
        await registration.sync.register('sync-transactions')
      } catch (error) {
        console.log('Background sync not supported')
      }
    }
  }

  async deleteTransaction(id: number) {
    await this.transactions.delete(id)
  }

  async getTransactions(startDate?: Date, endDate?: Date, limit?: number) {
    let collection = this.transactions.orderBy('date').reverse()

    if (startDate && endDate) {
      collection = collection.filter(tx => 
        tx.date >= startDate && tx.date <= endDate
      )
    }

    const results = await collection.toArray()
    return limit ? results.slice(0, limit) : results
  }

  async getTransactionsByCategory(category: string) {
    return await this.transactions
      .where('category')
      .equals(category)
      .reverse()
      .sortBy('date')
  }

  async getMonthlyTransactions(year: number, month: number) {
    const start = new Date(year, month, 1)
    const end = new Date(year, month + 1, 0, 23, 59, 59)
    return await this.getTransactions(start, end)
  }

  async addBudget(budget: Omit<Budget, 'id' | 'syncStatus'>) {
    const b: Budget = {
      ...budget,
      syncStatus: 'pending'
    }
    return await this.budgets.add(b)
  }

  async updateBudget(id: number, updates: Partial<Budget>) {
    await this.budgets.update(id, {
      ...updates,
      syncStatus: 'pending'
    })
  }

  async deleteBudget(id: number) {
    await this.budgets.delete(id)
  }

  async getBudgets() {
    return await this.budgets.toArray()
  }

  async getBudgetStatus(month: Date) {
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1)
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0)

    const budgets = await this.budgets.toArray()
    const transactions = await this.transactions
      .where('date')
      .between(startOfMonth, endOfMonth)
      .and(tx => tx.type === 'expense')
      .toArray()

    return budgets.map(budget => {
      const spent = transactions
        .filter(tx => tx.category === budget.category)
        .reduce((sum, tx) => sum + tx.amount, 0)

      return {
        ...budget,
        spent,
        remaining: budget.limit - spent,
        percentage: budget.limit > 0 ? (spent / budget.limit) * 100 : 0
      }
    })
  }

  async getPendingSync() {
    return {
      transactions: await this.transactions.where('syncStatus').equals('pending').toArray(),
      budgets: await this.budgets.where('syncStatus').equals('pending').toArray()
    }
  }

  async markAsSynced(table: 'transactions' | 'budgets', id: number) {
    await this[table].update(id, { syncStatus: 'synced' })
  }

  async getCategories() {
    return await this.categories.toArray()
  }

  async addCategory(category: Omit<Category, 'id'>) {
    return await this.categories.add(category)
  }

  async getStats(): Promise<{ income: number; expenses: number; balance: number; savings: number }> {
    const transactions = await this.transactions.toArray()
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const balance = income - expenses
    const savings = income > 0 ? ((income - expenses) / income) * 100 : 0

    return { income, expenses, balance, savings }
  }

  async exportData() {
    return {
      transactions: await this.transactions.toArray(),
      budgets: await this.budgets.toArray(),
      categories: await this.categories.toArray(),
      exportedAt: new Date().toISOString()
    }
  }

  async importData(data: { transactions?: Transaction[], budgets?: Budget[], categories?: Category[] }) {
    if (data.transactions) {
      await this.transactions.clear()
      await this.transactions.bulkAdd(data.transactions)
    }
    if (data.budgets) {
      await this.budgets.clear()
      await this.budgets.bulkAdd(data.budgets)
    }
    if (data.categories) {
      await this.categories.clear()
      await this.categories.bulkAdd(data.categories)
    }
  }
}

export const db = new BudgetDatabase()

// Default categories
const defaultCategories: Omit<Category, 'id'>[] = [
  { name: 'Food & Dining', color: '#ef4444', icon: '🍽️', isDefault: true },
  { name: 'Transportation', color: '#f97316', icon: '🚗', isDefault: true },
  { name: 'Housing', color: '#8b5cf6', icon: '🏠', isDefault: true },
  { name: 'Entertainment', color: '#ec4899', icon: '🎬', isDefault: true },
  { name: 'Shopping', color: '#06b6d4', icon: '🛍️', isDefault: true },
  { name: 'Healthcare', color: '#10b981', icon: '⚕️', isDefault: true },
  { name: 'Utilities', color: '#f59e0b', icon: '💡', isDefault: true },
  { name: 'Income', color: '#22c55e', icon: '💰', isDefault: true },
  { name: 'Investments', color: '#3b82f6', icon: '📈', isDefault: true },
  { name: 'Other', color: '#6b7280', icon: '📦', isDefault: true }
]

export async function initializeDatabase() {
  try {
    const count = await db.categories.count()
    if (count === 0) {
      await db.categories.bulkAdd(defaultCategories)
      console.log('Database initialized with default categories')
    }
  } catch (error) {
    console.error('Failed to initialize database:', error)
  }
}

export default db
