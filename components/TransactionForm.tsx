"use client"

import { useState, useEffect } from 'react'
import { db } from '@/lib/db'
import type { Category } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Plus, Camera, Mic, ArrowRightLeft, TrendingUp } from 'lucide-react'

export function TransactionForm() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    const cats = await db.getCategories()
    setCategories(cats)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return

    if (!formData.category || !formData.amount || !formData.description) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      await db.addTransaction({
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category,
        description: formData.description,
        date: new Date(formData.date)
      })

      toast({
        title: "Success",
        description: "Transaction added successfully",
      })

      // Reset form
      setFormData({
        amount: '',
        type: 'expense',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add transaction",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = categories.filter(cat => {
    if (formData.type === 'income') {
      return ['Income', 'Investments'].includes(cat.name)
    }
    return !['Income', 'Investments'].includes(cat.name)
  })

  const uniqueCategories = filteredCategories.filter((category, index, list) =>
    list.findIndex(item => item.name === category.name) === index
  )

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2 text-xl">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Plus className="h-5 w-5 text-blue-400" />
            </div>
            Add Transaction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type Selection */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({...formData, type: 'expense', category: ''})}
                className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                  formData.type === 'expense' 
                    ? 'border-red-500 bg-red-500/10 text-red-400' 
                    : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                }`}
              >
                <ArrowRightLeft className="h-6 w-6" />
                <span className="font-medium">Expense</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({...formData, type: 'income', category: ''})}
                className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                  formData.type === 'income' 
                    ? 'border-green-500 bg-green-500/10 text-green-400' 
                    : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                }`}
              >
                <TrendingUp className="h-6 w-6" />
                <span className="font-medium">Income</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-slate-300">
                  Amount <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="bg-slate-800 border-slate-700 pl-8 text-lg"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-slate-300">
                  Date <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-slate-300">
                Category <span className="text-red-400">*</span>
              </Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({...formData, category: value})}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 h-12">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {uniqueCategories.map(cat => (
                    <SelectItem 
                      key={cat.id} 
                      value={cat.name}
                      className="focus:bg-slate-700 focus:text-white"
                    >
                      <div className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-300">
                Description <span className="text-red-400">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="description"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="bg-slate-800 border-slate-700 h-12"
                  placeholder="e.g., Grocery shopping at Walmart"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  className="shrink-0 h-12 w-12 border-slate-700 hover:bg-slate-800"
                  title="Voice input (coming soon)"
                >
                  <Mic className="h-5 w-5 text-slate-400" />
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  className="shrink-0 h-12 w-12 border-slate-700 hover:bg-slate-800"
                  title="Scan receipt (coming soon)"
                >
                  <Camera className="h-5 w-5 text-slate-400" />
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Adding...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add Transaction
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
