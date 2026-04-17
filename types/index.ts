export interface Transaction {
  id?: number
  amount: number
  type: 'income' | 'expense'
  category: string
  description: string
  date: Date
  syncStatus: 'synced' | 'pending' | 'error'
  createdAt: Date
  updatedAt: Date
}

export interface Budget {
  id?: number
  category: string
  limit: number
  period: 'monthly' | 'weekly' | 'yearly'
  rollover: boolean
  spent?: number
  remaining?: number
  percentage?: number
  syncStatus: 'synced' | 'pending' | 'error'
}

export interface Category {
  id?: number
  name: string
  color: string
  icon: string
  isDefault: boolean
}

export interface FinancialStats {
  balance: number
  income: number
  expenses: number
  savings: number
}
