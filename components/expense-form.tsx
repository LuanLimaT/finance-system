"use client"

import type React from "react"

import { useState } from "react"
import { useFinance, type ExpenseCategory } from "@/context/finance-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface ExpenseFormProps {
  onClose: () => void
}

export default function ExpenseForm({ onClose }: ExpenseFormProps) {
  const { addExpense } = useFinance()

  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  })
  const [category, setCategory] = useState<ExpenseCategory>("other")
  const [isInstallment, setIsInstallment] = useState(false)
  const [totalInstallments, setTotalInstallments] = useState("1")
  const [isPaid, setIsPaid] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    addExpense({
      name,
      amount: Number.parseFloat(amount),
      date,
      category,
      isPaid,
      isInstallment,
      totalInstallments: Number.parseInt(totalInstallments),
      currentInstallment: 1,
    })

    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Despesa</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Despesa</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aluguel, Mercado, etc."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
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

            <div className="flex items-center justify-between">
              <Label htmlFor="isPaid">Marcar como Pago</Label>
              <Switch id="isPaid" checked={isPaid} onCheckedChange={setIsPaid} />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isInstallment">Pagamento Parcelado</Label>
              <Switch id="isInstallment" checked={isInstallment} onCheckedChange={setIsInstallment} />
            </div>

            {isInstallment && (
              <div className="space-y-2">
                <Label htmlFor="totalInstallments">Número de Parcelas</Label>
                <Input
                  id="totalInstallments"
                  type="number"
                  min="2"
                  value={totalInstallments}
                  onChange={(e) => setTotalInstallments(e.target.value)}
                  required={isInstallment}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Adicionar Despesa
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
