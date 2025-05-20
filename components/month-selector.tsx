"use client"
import { useFinance } from "@/context/finance-context"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function MonthSelector() {
  const { currentMonth, setCurrentMonth } = useFinance()

  const [year, month] = currentMonth.split("-").map(Number)

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const goToPreviousMonth = () => {
    let newMonth = month - 1
    let newYear = year

    if (newMonth < 1) {
      newMonth = 12
      newYear -= 1
    }

    setCurrentMonth(`${newYear}-${String(newMonth).padStart(2, "0")}`)
  }

  const goToNextMonth = () => {
    let newMonth = month + 1
    let newYear = year

    if (newMonth > 12) {
      newMonth = 1
      newYear += 1
    }

    setCurrentMonth(`${newYear}-${String(newMonth).padStart(2, "0")}`)
  }

  return (
    <div className="flex items-center space-x-4">
      <Button variant="outline" size="icon" onClick={goToPreviousMonth} className="h-8 w-8">
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <h2 className="text-xl font-medium">
        {monthNames[month - 1]} {year}
      </h2>

      <Button variant="outline" size="icon" onClick={goToNextMonth} className="h-8 w-8">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
