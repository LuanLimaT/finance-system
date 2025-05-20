"use client"

import { useState, useEffect } from "react"
import { useFinance, type ExpenseCategory } from "@/context/finance-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

export default function Analytics() {
  const { monthsData } = useFinance()
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })

  const [chartData, setChartData] = useState<any[]>([])

  // Get all available months
  const availableMonths = Object.keys(monthsData).sort()

  // Format month for display
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
    return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
  }

  // Category colors
  const COLORS = {
    lazer: "#9333ea", // roxo
    compras: "#3b82f6", // azul
    saude: "#22c55e", // verde
    alimentacao: "#eab308", // amarelo
    transporte: "#f97316", // laranja
    moradia: "#ef4444", // vermelho
    educacao: "#6366f1", // índigo
    outros: "#6b7280", // cinza
  }

  // Category labels
  const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
    lazer: "Lazer",
    compras: "Compras",
    saude: "Saúde",
    alimentacao: "Alimentação",
    transporte: "Transporte",
    moradia: "Moradia",
    educacao: "Educação",
    outros: "Outros",
  }

  // Prepare chart data when selected month changes
  useEffect(() => {
    if (monthsData[selectedMonth]) {
      const expensesByCategory = monthsData[selectedMonth].expenses.reduce((acc: Record<string, number>, expense) => {
        if (!acc[expense.category]) {
          acc[expense.category] = 0
        }
        acc[expense.category] += expense.amount
        return acc
      }, {})

      const data = Object.entries(expensesByCategory).map(([category, value]) => ({
        name: CATEGORY_LABELS[category as ExpenseCategory],
        value,
        color: COLORS[category as keyof typeof COLORS],
      }))

      setChartData(data)
    } else {
      setChartData([])
    }
  }, [selectedMonth, monthsData])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount)
  }

  // Custom tooltip for the pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm">{formatCurrency(payload[0].value)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Análise de Despesas</h2>

        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Selecione um mês" />
          </SelectTrigger>
          <SelectContent>
            {availableMonths.map((month) => (
              <SelectItem key={month} value={month}>
                {formatMonth(month)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">Sem dados disponíveis para este mês</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detalhamento de Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="space-y-4">
                {chartData.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                      <span>{item.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{formatCurrency(item.value)}</span>
                      <span className="text-sm text-gray-500">
                        ({Math.round((item.value / monthsData[selectedMonth].totalToPay) * 100)}%)
                      </span>
                    </div>
                  </div>
                ))}

                <div className="pt-4 mt-4 border-t">
                  <div className="flex justify-between items-center font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(monthsData[selectedMonth].totalToPay)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">Sem dados disponíveis para este mês</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
