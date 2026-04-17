"use client"

import { useEffect, useState } from 'react'
import { db, type Budget, type Category } from '@/lib/db'
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
import { 
  Plus, 
  Target, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp,
  Wallet,
  Trash2,
  Edit2
} from 'lucide-react'
import { format } from 'date-fns'

export function BudgetManager() {
  const { toast } = useToast()
  const [budgets, setBudgets] = useState<(Budget & { spent: number; remaining: number; percentage: number })[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [currentMonth] = useState(new Date())
  const [formData, setFormData] = useState({
    category: '',
    limit: '',
    period: 'monthly' as const,
    rollover: false
  })

  useEffect(() => {
    loadData()
  }, [currentMonth])

  async function loadData() {
    const [budgetsWithStatus, cats] = await Promise.all([
      db.getBudgetStatus(currentMonth),
      db.getCategories()
    ])
    setBudgets(budgetsWithStatus)
    setCategories(cats.filter(c => !['Income', 'Investments'].includes(c.name)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.category || !formData.limit) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    try {
      if (editingId) {
        await db.updateBudget(editingId, {
          category: formData.category,
          limit: parseFloat(formData.limit),
          period: formData.period,
          rollover: formData.rollover
        })
        toast({ title: "Success", description: "Budget updated successfully" })
      } else {
        await db.addBudget({
          category: formData.category,
          limit: parseFloat(formData.limit),
          period: formData.period,
          rollover: formData.rollover
        })
        toast({ title: "Success", description: "Budget created successfully" })
      }

      resetForm()
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save budget",
        variant: "destructive"
      })
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this budget?')) return

    try {
      await db.deleteBudget(id)
      toast({ title: "Success", description: "Budget deleted successfully" })
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete budget",
        variant: "destructive"
      })
    }
  }

  function handleEdit(budget: Budget) {
    setFormData({
      category: budget.category,
      limit: budget.limit.toString(),
      period: budget.period,
      rollover: budget.rollover
    })
    setEditingId(budget.id || null)
    setShowForm(true)
  }

  function resetForm() {
    setFormData({
      category: '',
      limit: '',
      period: 'monthly',
      rollover: false
    })
    setEditingId(null)
    setShowForm(false)
  }

  const usedCategories = budgets.map(b => b.category)
  const availableCategories = categories.filter(c => !usedCategories.includes(c.name) || editingId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Budgets</h2>
          <p className="text-slate-400 mt-1">
            {format(currentMonth, 'MMMM yyyy')}
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? 'Cancel' : 'New Budget'}
        </Button>
      </div>

      {showForm && (
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-slate-200">
              {editingId ? 'Edit Budget' : 'Create New Budget'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({...formData, category: value})}
                    disabled={!!editingId}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {availableCategories.map(cat => (
                        <SelectItem key={cat.id} value={cat.name}>
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
                  <Label className="text-slate-300">Budget Limit ($)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.limit}
                      onChange={(e) => setFormData({...formData, limit: e.target.value})}
                      className="bg-slate-800 border-slate-700 pl-8"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Period</Label>
                  <Select 
                    value={formData.period} 
                    onValueChange={(value: 'monthly' | 'weekly' | 'yearly') => 
                      setFormData({...formData, period: value})
                    }
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Rollover</Label>
                  <Select 
                    value={formData.rollover ? 'yes' : 'no'} 
                    onValueChange={(value) => 
                      setFormData({...formData, rollover: value === 'yes'})
                    }
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="yes">Yes - Carry over unused</SelectItem>
                      <SelectItem value="no">No - Reset each period</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  {editingId ? 'Update Budget' : 'Create Budget'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} className="border-slate-700">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.length > 0 ? (
          budgets.map((budget) => (
            <Card 
              key={budget.id} 
              className={`bg-slate-900/50 border-slate-800 backdrop-blur overflow-hidden ${
                budget.percentage >= 100 ? 'border-red-500/50' : 
                budget.percentage >= 80 ? 'border-yellow-500/50' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ 
                        backgroundColor: categories.find(c => c.name === budget.category)?.color + '20',
                        color: categories.find(c => c.name === budget.category)?.color 
                      }}
                    >
                      {categories.find(c => c.name === budget.category)?.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{budget.category}</h3>
                      <p className="text-sm text-slate-500 capitalize">{budget.period}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEdit(budget)}
                      className="h-8 w-8 text-slate-400 hover:text-white"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(budget.id!)}
                      className="h-8 w-8 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">
                      ${budget.spent.toFixed(2)} spent
                    </span>
                    <span className={`font-medium ${
                      budget.percentage >= 100 ? 'text-red-400' : 
                      budget.percentage >= 80 ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      ${budget.remaining.toFixed(2)} left
                    </span>
                  </div>

                  <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${
                        budget.percentage >= 100 ? 'bg-red-500' : 
                        budget.percentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className={`text-sm font-medium ${
                      budget.percentage >= 100 ? 'text-red-400' : 
                      budget.percentage >= 80 ? 'text-yellow-400' : 'text-slate-400'
                    }`}>
                      {budget.percentage.toFixed(0)}% used
                    </span>
                    <span className="text-sm text-slate-500">
                      of ${budget.limit.toFixed(2)}
                    </span>
                  </div>

                  {budget.percentage >= 100 && (
                    <div className="flex items-center gap-2 text-red-400 text-sm mt-2 bg-red-500/10 p-2 rounded">
                      <AlertCircle className="h-4 w-4" />
                      Budget exceeded!
                    </div>
                  )}

                  {budget.rollover && (
                    <div className="flex items-center gap-2 text-blue-400 text-xs mt-2">
                      <TrendingUp className="h-3 w-3" />
                      Rollover enabled
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full bg-slate-900/50 border-slate-800 backdrop-blur">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-medium text-slate-300 mb-2">No budgets yet</h3>
              <p className="text-slate-500 max-w-sm mx-auto mb-4">
                Create your first budget to start tracking your spending and stay on top of your finances.
              </p>
              <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Budget
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {budgets.length > 0 && (
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                <p className="text-2xl font-bold text-white">{budgets.length}</p>
                <p className="text-sm text-slate-500">Active Budgets</p>
              </div>
              <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                <p className="text-2xl font-bold text-green-400">
                  {budgets.filter(b => b.percentage < 80).length}
                </p>
                <p className="text-sm text-slate-500">On Track</p>
              </div>
              <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-400">
                  {budgets.filter(b => b.percentage >= 80 && b.percentage < 100).length}
                </p>
                <p className="text-sm text-slate-500">Warning</p>
              </div>
              <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                <p className="text-2xl font-bold text-red-400">
                  {budgets.filter(b => b.percentage >= 100).length}
                </p>
                <p className="text-sm text-slate-500">Exceeded</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
