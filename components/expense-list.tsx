"use client"

import { useState } from "react"
import type { Expense } from "@/context/finance-context"
import ExpenseItem from "@/components/expense-item"
import ExpenseDetails from "@/components/expense-details"

interface ExpenseListProps {
  expenses: Expense[]
}

export default function ExpenseList({ expenses }: ExpenseListProps) {
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)

  // Sort expenses by date
  const sortedExpenses = [...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="divide-y divide-gray-200">
        {sortedExpenses.map((expense) => (
          <ExpenseItem key={expense.id} expense={expense} onClick={() => setSelectedExpense(expense)} />
        ))}
      </div>

      {selectedExpense && <ExpenseDetails expense={selectedExpense} onClose={() => setSelectedExpense(null)} />}
    </div>
  )
}
