"use client"

import { useState } from "react"
import { useFinance, type Expense, type ExpenseCategory } from "@/context/finance-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Trash2, Edit, Save } from "lucide-react"

interface ExpenseDetailsProps {
  expense: Expense
  onClose: () => void
}

export default function ExpenseDetails({ expense, onClose }: ExpenseDetailsProps) {
  const { updateExpense, deleteExpense } = useFinance()

  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const [name, setName] = useState(expense.name)
  const [amount, setAmount] = useState(expense.amount.toString())
  const [category, setCategory] = useState<ExpenseCategory>(expense.category)

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

  const handleSave = () => {
    updateExpense({
      ...expense,
      name,
      amount: Number.parseFloat(amount),
      category,
    })

    setIsEditing(false)
  }

  const handleDelete = (deleteAll: boolean) => {
    deleteExpense(expense.id, deleteAll)
    setShowDeleteDialog(false)
    onClose()
  }

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>{isEditing ? "Editar Despesa" : "Detalhes da Despesa"}</span>
              <div className="flex space-x-2">
                {isEditing ? (
                  <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                    <Save className="h-4 w-4 mr-1" /> Salvar
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => setIsEditing(true)} variant="outline">
                    <Edit className="h-4 w-4 mr-1" /> Editar
                  </Button>
                )}
                <Button size="sm" variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Excluir
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Despesa</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Valor</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={category} onValueChange={(value) => setCategory(value as ExpenseCategory)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lazer">Lazer</SelectItem>
                      <SelectItem value="compras">Compras</SelectItem>
                      <SelectItem value="saude">Saúde</SelectItem>
                      <SelectItem value="alimentacao">Alimentação</SelectItem>
                      <SelectItem value="transporte">Transporte</SelectItem>
                      <SelectItem value="moradia">Moradia</SelectItem>
                      <SelectItem value="educacao">Educação</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Nome</p>
                  <p className="text-lg font-medium">{expense.name}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Valor</p>
                  <p className="text-lg font-medium">{formatCurrency(expense.amount)}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Data</p>
                  <p>{formatDate(expense.date)}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Categoria</p>
                  <p className="capitalize">{expense.category}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p>{expense.isPaid ? "Pago" : "Não Pago"}</p>
                </div>

                {expense.isInstallment && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Parcela</p>
                    <p>
                      {expense.currentInstallment} de {expense.totalInstallments}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {!isEditing && (
            <DialogFooter>
              <Button onClick={onClose}>Fechar</Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Despesa</AlertDialogTitle>
            <AlertDialogDescription>
              {expense.isInstallment
                ? "Deseja excluir apenas esta parcela ou todas as parcelas desta despesa?"
                : "Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            {expense.isInstallment ? (
              <>
                <Button variant="destructive" onClick={() => handleDelete(false)}>
                  Excluir Esta Parcela
                </Button>
                <Button variant="destructive" onClick={() => handleDelete(true)}>
                  Excluir Todas as Parcelas
                </Button>
              </>
            ) : (
              <AlertDialogAction onClick={() => handleDelete(false)} className="bg-red-600 hover:bg-red-700">
                Excluir
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
