"use client"

import { useState, useEffect } from "react"
import { useFinance } from "@/context/finance-context"
import MonthSelector from "@/components/month-selector"
import ExpenseList from "@/components/expense-list"
import ExpenseForm from "@/components/expense-form"
import OverdueNotification from "@/components/overdue-notification"
import MonthSummary from "@/components/month-summary"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Analytics from "@/components/analytics"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function Dashboard() {
  const { currentMonth, monthsData, getOverdueExpenses } = useFinance()
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showOverdueNotification, setShowOverdueNotification] = useState(false)

  // Check for overdue expenses on initial load
  useEffect(() => {
    const overdueExpenses = getOverdueExpenses()

    if (overdueExpenses.length > 0) {
      setShowOverdueNotification(true)
    }
  }, [getOverdueExpenses])

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Sistema de Gestão Financeira</h1>
          <p className="text-gray-600">Acompanhe e gerencie suas finanças pessoais</p>
        </header>

        {showOverdueNotification && <OverdueNotification onClose={() => setShowOverdueNotification(false)} />}

        <Tabs defaultValue="expenses" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="expenses">Despesas</TabsTrigger>
            <TabsTrigger value="analytics">Análises</TabsTrigger>
          </TabsList>

          <TabsContent value="expenses">
            <div className="flex justify-between items-center mb-6">
              <MonthSelector />
              <Button onClick={() => setShowExpenseForm(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" /> Adicionar Despesa
              </Button>
            </div>

            {monthsData[currentMonth] && (
              <MonthSummary
                totalToPay={monthsData[currentMonth].totalToPay}
                balanceToPay={monthsData[currentMonth].balanceToPay}
              />
            )}

            {monthsData[currentMonth] && monthsData[currentMonth].expenses.length > 0 ? (
              <ExpenseList expenses={monthsData[currentMonth].expenses} />
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500">Sem despesas para este mês. Adicione uma para começar!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <Analytics />
          </TabsContent>
        </Tabs>

        {showExpenseForm && <ExpenseForm onClose={() => setShowExpenseForm(false)} />}
      </div>
    </main>
  )
}
