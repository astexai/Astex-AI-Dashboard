import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateExpense } from "@/hooks/useExpenses";
import { useToast } from "@/hooks/use-toast";

export const AddExpenseDialog = () => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("other");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const createExpense = useCreateExpense();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createExpense.mutateAsync({
        title,
        amount: parseFloat(amount),
        category,
        date,
      });
      toast({ title: "Expense added successfully" });
      setOpen(false);
      setTitle("");
      setAmount("");
      setCategory("other");
      setDate(new Date().toISOString().split("T")[0]);
    } catch (error) {
      toast({
        title: "Error adding expense",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Description</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What did you spend on?"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="office">🏢 Office</SelectItem>
                  <SelectItem value="software">💻 Software</SelectItem>
                  <SelectItem value="travel">✈️ Travel</SelectItem>
                  <SelectItem value="marketing">📢 Marketing</SelectItem>
                  <SelectItem value="other">📦 Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={createExpense.isPending}>
            {createExpense.isPending ? "Adding..." : "Add Expense"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
