"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MonthSummaryProps {
  totalToPay: number
  balanceToPay: number
}

export default function MonthSummary({ totalToPay, balanceToPay }: MonthSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-gray-700">Total a Pagar</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalToPay)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-gray-700">Saldo a Pagar</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(balanceToPay)}</p>
        </CardContent>
      </Card>
    </div>
  )
}
