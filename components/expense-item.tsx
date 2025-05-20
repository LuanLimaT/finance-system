"use client"

import type React from "react"

import { useFinance, type Expense, type ExpenseCategory } from "@/context/finance-context"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ExpenseItemProps {
  expense: Expense
  onClick: () => void
}

export default function ExpenseItem({ expense, onClick }: ExpenseItemProps) {
  const { togglePaidStatus } = useFinance()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR").format(date)
  }

  const getCategoryColor = (category: ExpenseCategory) => {
    const colors: Record<ExpenseCategory, string> = {
      lazer: "bg-purple-100 text-purple-800",
      compras: "bg-blue-100 text-blue-800",
      saude: "bg-green-100 text-green-800",
      alimentacao: "bg-yellow-100 text-yellow-800",
      transporte: "bg-orange-100 text-orange-800",
      moradia: "bg-red-100 text-red-800",
      educacao: "bg-indigo-100 text-indigo-800",
      outros: "bg-gray-100 text-gray-800",
    }

    return colors[category]
  }

  const handleTogglePaid = (e: React.MouseEvent) => {
    e.stopPropagation()
    togglePaidStatus(expense.id)
  }

  return (
    <div
      className={cn(
        "p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors",
        expense.isPaid ? "bg-gray-50" : "",
      )}
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        <button
          onClick={handleTogglePaid}
          className={cn(
            "p-2 rounded-full",
            expense.isPaid ? "text-green-600 hover:bg-green-100" : "text-gray-400 hover:bg-gray-100",
          )}
        >
          {expense.isPaid ? <ThumbsUp size={20} /> : <ThumbsDown size={20} />}
        </button>

        <div>
          <h3 className={cn("font-medium", expense.isPaid ? "text-gray-500 line-through" : "text-gray-900")}>
            {expense.name}
            {expense.isInstallment && (
              <span className="text-sm text-gray-500 ml-2">
                ({expense.currentInstallment}/{expense.totalInstallments})
              </span>
            )}
          </h3>
          <div className="flex items-center mt-1 space-x-2">
            <span className="text-sm text-gray-500">{formatDate(expense.date)}</span>
            <Badge variant="outline" className={getCategoryColor(expense.category)}>
              {expense.category}
            </Badge>
          </div>
        </div>
      </div>

      <div className={cn("font-medium", expense.isPaid ? "text-gray-500" : "text-gray-900")}>
        {formatCurrency(expense.amount)}
      </div>
    </div>
  )
}
