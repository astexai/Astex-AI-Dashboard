import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Expense, useDeleteExpense } from "@/hooks/useExpenses";
import { format } from "date-fns";

interface ExpenseItemProps {
  expense: Expense;
}

export const ExpenseItem = ({ expense }: ExpenseItemProps) => {
  const deleteExpense = useDeleteExpense();

  const categoryIcons: Record<string, string> = {
    office: "🏢",
    software: "💻",
    travel: "✈️",
    marketing: "📢",
    other: "📦",
  };

  return (
    <div className="flex items-center gap-3 p-3 border-b border-border last:border-b-0 hover:bg-secondary/50 transition-colors animate-slide-in group">
      <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center text-sm">
        {categoryIcons[expense.category] || "📦"}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{expense.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground capitalize">{expense.category}</span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(expense.date), "MMM d, yyyy")}
          </span>
        </div>
      </div>

      <span className="font-medium tabular-nums">
        ${Number(expense.amount).toFixed(2)}
      </span>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-0 group-hover:opacity-100"
        onClick={() => deleteExpense.mutate(expense.id)}
      >
        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
      </Button>
    </div>
  );
};
