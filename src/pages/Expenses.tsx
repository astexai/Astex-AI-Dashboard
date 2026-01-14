import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ExpenseItem } from "@/components/dashboard/ExpenseItem";
import { AddExpenseDialog } from "@/components/dashboard/AddExpenseDialog";
import { useExpenses } from "@/hooks/useExpenses";
import { Skeleton } from "@/components/ui/skeleton";

const Expenses = () => {
  const { data: expenses = [], isLoading } = useExpenses();

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const typeTotals = expenses.reduce((acc, e) => {
    acc[e.expense_type] = (acc[e.expense_type] || 0) + Number(e.amount);
    return acc;
  }, {} as Record<string, number>);

  const typeLabels: Record<string, string> = {
    personal: "👤 Personal",
    business: "💼 Business",
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage your spending.
            </p>
          </div>
          <AddExpenseDialog />
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="stat-card">
            <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
            <p className="text-3xl font-bold mt-1">₹{totalExpenses.toFixed(2)}</p>
          </div>
          {Object.entries(typeTotals).map(([type, total]) => (
            <div key={type} className="stat-card">
              <p className="text-sm font-medium text-muted-foreground">
                {typeLabels[type] || type}
              </p>
              <p className="text-xl font-bold mt-1">₹{total.toFixed(2)}</p>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : expenses.length === 0 ? (
          <div className="dashboard-section p-12 text-center">
            <p className="text-muted-foreground">
              No expenses yet. Start tracking your spending!
            </p>
          </div>
        ) : (
          <div className="dashboard-section">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold">All Expenses ({expenses.length})</h2>
            </div>
            {expenses.map((expense) => (
              <ExpenseItem key={expense.id} expense={expense} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Expenses;
