"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type ExpenseCategory =
  | "lazer"
  | "compras"
  | "saude"
  | "alimentacao"
  | "transporte"
  | "moradia"
  | "educacao"
  | "outros"

export interface Expense {
  id: string
  name: string
  amount: number
  date: string
  category: ExpenseCategory
  isPaid: boolean
  isInstallment: boolean
  totalInstallments: number
  currentInstallment: number
  installmentGroupId?: string
}

interface MonthData {
  expenses: Expense[]
  totalToPay: number
  balanceToPay: number
}

interface FinanceContextType {
  currentMonth: string
  setCurrentMonth: (month: string) => void
  monthsData: Record<string, MonthData>
  addExpense: (expense: Omit<Expense, "id">) => void
  updateExpense: (expense: Expense) => void
  deleteExpense: (id: string, deleteAll: boolean) => void
  togglePaidStatus: (id: string) => void
  getOverdueExpenses: () => Expense[]
  getExpensesByCategory: (month: string) => Record<ExpenseCategory, number>
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

export const useFinance = () => {
  const context = useContext(FinanceContext)
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider")
  }
  return context
}

export const FinanceProvider = ({ children }: { children: ReactNode }) => {
  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })

  const [monthsData, setMonthsData] = useState<Record<string, MonthData>>({})

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedData = localStorage.getItem("financeData")
    if (savedData) {
      setMonthsData(JSON.parse(savedData))
    }
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (Object.keys(monthsData).length > 0) {
      localStorage.setItem("financeData", JSON.stringify(monthsData))
    }
  }, [monthsData])

  // Initialize month data if it doesn't exist
  useEffect(() => {
    if (!monthsData[currentMonth]) {
      setMonthsData((prev) => ({
        ...prev,
        [currentMonth]: {
          expenses: [],
          totalToPay: 0,
          balanceToPay: 0,
        },
      }))
    }
  }, [currentMonth, monthsData])

  // Calculate totals whenever expenses change
  const calculateTotals = (month: string, expenses: Expense[]) => {
    const totalToPay = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    const balanceToPay = expenses.reduce((sum, expense) => (expense.isPaid ? sum : sum + expense.amount), 0)

    return { totalToPay, balanceToPay }
  }

  // Add a new expense
  const addExpense = (expenseData: Omit<Expense, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    let installmentGroupId = undefined

    // Create a copy of the current state
    const newMonthsData = { ...monthsData }

    // If this is an installment expense, we need to create multiple entries
    if (expenseData.isInstallment && expenseData.totalInstallments > 1) {
      installmentGroupId = Math.random().toString(36).substring(2, 9)

      // Create an expense for each installment
      for (let i = 0; i < expenseData.totalInstallments; i++) {
        const installmentDate = new Date(expenseData.date)
        installmentDate.setMonth(installmentDate.getMonth() + i)

        const installmentMonth = `${installmentDate.getFullYear()}-${String(installmentDate.getMonth() + 1).padStart(2, "0")}`

        // Initialize month data if it doesn't exist
        if (!newMonthsData[installmentMonth]) {
          newMonthsData[installmentMonth] = {
            expenses: [],
            totalToPay: 0,
            balanceToPay: 0,
          }
        }

        const installmentExpense: Expense = {
          id: Math.random().toString(36).substring(2, 9),
          name: expenseData.name,
          amount: expenseData.amount / expenseData.totalInstallments,
          date: installmentDate.toISOString().split("T")[0],
          category: expenseData.category,
          isPaid: i === 0 ? expenseData.isPaid : false, // Only the first installment might be paid
          isInstallment: true,
          totalInstallments: expenseData.totalInstallments,
          currentInstallment: i + 1,
          installmentGroupId,
        }

        newMonthsData[installmentMonth].expenses.push(installmentExpense)

        // Recalculate totals for this month
        const { totalToPay, balanceToPay } = calculateTotals(installmentMonth, newMonthsData[installmentMonth].expenses)

        newMonthsData[installmentMonth].totalToPay = totalToPay
        newMonthsData[installmentMonth].balanceToPay = balanceToPay
      }
    } else {
      // For non-installment expenses, just add to the current month
      const expense: Expense = {
        ...expenseData,
        id,
        installmentGroupId: undefined,
      }

      // Make sure the month exists in our data
      if (!newMonthsData[currentMonth]) {
        newMonthsData[currentMonth] = {
          expenses: [],
          totalToPay: 0,
          balanceToPay: 0,
        }
      }

      newMonthsData[currentMonth].expenses.push(expense)

      // Recalculate totals
      const { totalToPay, balanceToPay } = calculateTotals(currentMonth, newMonthsData[currentMonth].expenses)

      newMonthsData[currentMonth].totalToPay = totalToPay
      newMonthsData[currentMonth].balanceToPay = balanceToPay
    }

    setMonthsData(newMonthsData)
  }

  // Update an existing expense
  const updateExpense = (updatedExpense: Expense) => {
    setMonthsData((prev) => {
      const newData = { ...prev }

      // Find the month that contains this expense
      for (const month in newData) {
        const expenseIndex = newData[month].expenses.findIndex((e) => e.id === updatedExpense.id)

        if (expenseIndex !== -1) {
          // Update the expense
          newData[month].expenses[expenseIndex] = updatedExpense

          // Recalculate totals
          const { totalToPay, balanceToPay } = calculateTotals(month, newData[month].expenses)
          newData[month].totalToPay = totalToPay
          newData[month].balanceToPay = balanceToPay

          break
        }
      }

      return newData
    })
  }

  // Delete an expense (single or all installments)
  const deleteExpense = (id: string, deleteAll: boolean) => {
    setMonthsData((prev) => {
      const newData = { ...prev }
      let groupIdToDelete: string | undefined

      // First, find the expense to get its groupId if needed
      for (const month in newData) {
        const expense = newData[month].expenses.find((e) => e.id === id)
        if (expense && deleteAll && expense.installmentGroupId) {
          groupIdToDelete = expense.installmentGroupId
          break
        }
      }

      // Now delete the expense(s)
      for (const month in newData) {
        if (deleteAll && groupIdToDelete) {
          // Delete all expenses in the installment group
          newData[month].expenses = newData[month].expenses.filter((e) => e.installmentGroupId !== groupIdToDelete)
        } else {
          // Delete just this specific expense
          newData[month].expenses = newData[month].expenses.filter((e) => e.id !== id)
        }

        // Recalculate totals
        const { totalToPay, balanceToPay } = calculateTotals(month, newData[month].expenses)
        newData[month].totalToPay = totalToPay
        newData[month].balanceToPay = balanceToPay
      }

      return newData
    })
  }

  // Toggle the paid status of an expense
  const togglePaidStatus = (id: string) => {
    setMonthsData((prev) => {
      const newData = { ...prev }

      // Find the month that contains this expense
      for (const month in newData) {
        const expenseIndex = newData[month].expenses.findIndex((e) => e.id === id)

        if (expenseIndex !== -1) {
          // Toggle the paid status
          newData[month].expenses[expenseIndex].isPaid = !newData[month].expenses[expenseIndex].isPaid

          // Recalculate totals
          const { totalToPay, balanceToPay } = calculateTotals(month, newData[month].expenses)
          newData[month].totalToPay = totalToPay
          newData[month].balanceToPay = balanceToPay

          break
        }
      }

      return newData
    })
  }

  // Get all overdue expenses from previous months
  const getOverdueExpenses = () => {
    const now = new Date()
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`

    const overdue: Expense[] = []

    for (const month in monthsData) {
      // Only check previous months
      if (month < currentMonthStr) {
        const unpaidExpenses = monthsData[month].expenses.filter((e) => !e.isPaid)
        overdue.push(...unpaidExpenses)
      }
    }

    return overdue
  }

  // Get expenses grouped by category for a specific month
  const getExpensesByCategory = (month: string) => {
    const result: Record<ExpenseCategory, number> = {
      lazer: 0,
      compras: 0,
      saude: 0,
      alimentacao: 0,
      transporte: 0,
      moradia: 0,
      educacao: 0,
      outros: 0,
    }

    if (!monthsData[month]) return result

    monthsData[month].expenses.forEach((expense) => {
      result[expense.category] += expense.amount
    })

    return result
  }

  return (
    <FinanceContext.Provider
      value={{
        currentMonth,
        setCurrentMonth,
        monthsData,
        addExpense,
        updateExpense,
        deleteExpense,
        togglePaidStatus,
        getOverdueExpenses,
        getExpensesByCategory,
      }}
    >
      {children}
    </FinanceContext.Provider>
  )
}
