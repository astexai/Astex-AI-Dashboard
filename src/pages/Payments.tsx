import { useState } from "react";
import { IndianRupee, Plus, Wallet, Receipt, TrendingDown } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProjects, useUpdateProject } from "@/hooks/useProjects";
import { usePayments, useCreatePayment } from "@/hooks/usePayments";
import { useExpenses, useCreateExpense } from "@/hooks/useExpenses";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

const Payments = () => {
  const { data: projects = [] } = useProjects();
  const { data: payments = [] } = usePayments();
  const { data: expenses = [] } = useExpenses();
  const updateProject = useUpdateProject();
  const createPayment = useCreatePayment();
  const createExpense = useCreateExpense();

  const [costDialogOpen, setCostDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);

  // Cost dialog state
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [projectCost, setProjectCost] = useState("");

  // Payment dialog state
  const [paymentClient, setPaymentClient] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");

  // Expense dialog state
  const [expenseType, setExpenseType] = useState("business");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");

  // Calculations
  const totalProjectsValue = projects.reduce((sum, p) => sum + Number(p.cost || 0), 0);
  const totalAmountReceived = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const totalRemainingInAccount = totalAmountReceived - totalExpenses;
  const totalAmountRemaining = totalProjectsValue - totalAmountReceived;

  // Get unique clients from projects
  const clients = [...new Set(projects.map(p => p.client).filter(Boolean))];

  const handleAddCost = () => {
    if (!selectedProjectId || !projectCost) return;
    updateProject.mutate(
      { id: selectedProjectId, cost: parseFloat(projectCost) },
      {
        onSuccess: () => {
          toast({ title: "Project cost updated!" });
          setCostDialogOpen(false);
          setSelectedProjectId("");
          setProjectCost("");
        },
      }
    );
  };

  const handleAddPayment = () => {
    if (!paymentClient || !paymentAmount) return;
    createPayment.mutate(
      {
        client: paymentClient,
        date: paymentDate || new Date().toISOString().split("T")[0],
        amount: parseFloat(paymentAmount),
      },
      {
        onSuccess: () => {
          toast({ title: "Payment recorded!" });
          setPaymentDialogOpen(false);
          setPaymentClient("");
          setPaymentDate("");
          setPaymentAmount("");
        },
      }
    );
  };

  const handleAddExpense = () => {
    if (!expenseDescription || !expenseAmount) return;
    createExpense.mutate(
      {
        expense_type: expenseType,
        description: expenseDescription,
        amount: parseFloat(expenseAmount),
      },
      {
        onSuccess: () => {
          toast({ title: "Expense added!" });
          setExpenseDialogOpen(false);
          setExpenseType("business");
          setExpenseDescription("");
          setExpenseAmount("");
        },
      }
    );
  };

  return (
    <DashboardLayout title="Payments & Dues" description="Track your payments, expenses, and dues">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-8">
        <StatCard
          title="Total Projects Value"
          value={`₹${totalProjectsValue.toLocaleString()}`}
          icon={IndianRupee}
        />
        <StatCard
          title="Amount Received"
          value={`₹${totalAmountReceived.toLocaleString()}`}
          icon={Wallet}
        />
        <StatCard
          title="Total Expenses"
          value={`₹${totalExpenses.toLocaleString()}`}
          icon={Receipt}
        />
        <StatCard
          title="Remaining in Account"
          value={`₹${totalRemainingInAccount.toLocaleString()}`}
          icon={TrendingDown}
          description="Received - Expenses"
        />
        <StatCard
          title="Amount Due"
          value={`₹${totalAmountRemaining.toLocaleString()}`}
          icon={IndianRupee}
          description="Project Value - Received"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Button onClick={() => setCostDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Project Cost
        </Button>
        <Button onClick={() => setPaymentDialogOpen(true)} variant="secondary">
          <Plus className="h-4 w-4 mr-2" />
          Amount Received
        </Button>
        <Button onClick={() => setExpenseDialogOpen(true)} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Tables */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Projects with Costs */}
        <div className="dashboard-section">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold">Project Costs</h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead className="text-right">Cost (INR)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      No projects yet
                    </TableCell>
                  </TableRow>
                ) : (
                  projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>{project.name}</TableCell>
                      <TableCell className="text-right">₹{(project.cost || 0).toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Payments Received */}
        <div className="dashboard-section">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold">Payments Received</h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No payments yet
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.client}</TableCell>
                      <TableCell>{format(new Date(payment.date), "MMM d, yyyy")}</TableCell>
                      <TableCell className="text-right">₹{payment.amount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Expenses */}
        <div className="dashboard-section">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold">Expenses</h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No expenses yet
                    </TableCell>
                  </TableRow>
                ) : (
                  expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="capitalize">{expense.expense_type}</TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell className="text-right">₹{expense.amount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Add Project Cost Dialog */}
      <Dialog open={costDialogOpen} onOpenChange={setCostDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Project Cost</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Project Name</Label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Project Cost (INR)</Label>
              <Input
                type="number"
                value={projectCost}
                onChange={(e) => setProjectCost(e.target.value)}
                placeholder="Enter cost"
              />
            </div>
            <Button onClick={handleAddCost} className="w-full">
              Save Cost
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Amount Received Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Client</Label>
              <Select value={paymentClient} onValueChange={setPaymentClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client} value={client!}>
                      {client}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date of Receipt</Label>
              <Input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Amount Received (INR)</Label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            <Button onClick={handleAddPayment} className="w-full">
              Record Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Expense Dialog */}
      <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Expense Type</Label>
              <Select value={expenseType} onValueChange={setExpenseType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={expenseDescription}
                onChange={(e) => setExpenseDescription(e.target.value)}
                placeholder="Enter description"
              />
            </div>
            <div className="space-y-2">
              <Label>Amount (INR)</Label>
              <Input
                type="number"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            <Button onClick={handleAddExpense} className="w-full">
              Add Expense
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Payments;
