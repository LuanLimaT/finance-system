import { FinanceProvider } from "@/context/finance-context"
import Dashboard from "@/components/dashboard"

export default function Home() {
  return (
    <FinanceProvider>
      <Dashboard />
    </FinanceProvider>
  )
}
