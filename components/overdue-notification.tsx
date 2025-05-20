"use client"
import { useFinance, type Expense } from "@/context/finance-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { ThumbsUp } from "lucide-react"

interface OverdueNotificationProps {
  onClose: () => void
}

export default function OverdueNotification({ onClose }: OverdueNotificationProps) {
  const { getOverdueExpenses, togglePaidStatus } = useFinance()
  const overdueExpenses = getOverdueExpenses()

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

  const handleMarkAsPaid = (expense: Expense) => {
    togglePaidStatus(expense.id)
  }

  const totalOverdue = overdueExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <AlertDialog open={true} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-[600px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600">Despesas em Atraso</AlertDialogTitle>
          <AlertDialogDescription>
            Você tem {overdueExpenses.length} despesas em atraso totalizando {formatCurrency(totalOverdue)}.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="max-h-[300px] overflow-y-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4">Nome</th>
                <th className="text-left py-2 px-4">Data</th>
                <th className="text-right py-2 px-4">Valor</th>
                <th className="text-center py-2 px-4">Ação</th>
              </tr>
            </thead>
            <tbody>
              {overdueExpenses.map((expense) => (
                <tr key={expense.id} className="border-b">
                  <td className="py-2 px-4">{expense.name}</td>
                  <td className="py-2 px-4">{formatDate(expense.date)}</td>
                  <td className="py-2 px-4 text-right">{formatCurrency(expense.amount)}</td>
                  <td className="py-2 px-4 text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-600 hover:bg-green-50"
                      onClick={() => handleMarkAsPaid(expense)}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" /> Marcar Pago
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>Fechar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
