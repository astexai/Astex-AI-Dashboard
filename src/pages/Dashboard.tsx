import { FolderKanban, CheckSquare, IndianRupee, TrendingUp } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { useProjects } from "@/hooks/useProjects";
import { useTodos } from "@/hooks/useTodos";
import { useExpenses } from "@/hooks/useExpenses";
import { usePayments } from "@/hooks/usePayments";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";

const getProgressColor = (progress: number) => {
  if (progress === 100) return "bg-green-600";
  if (progress > 80) return "bg-green-400";
  if (progress >= 50) return "bg-yellow-500";
  return "bg-red-500";
};

const Dashboard = () => {
  const { data: projects = [] } = useProjects();
  const { data: todos = [] } = useTodos();
  const { data: expenses = [] } = useExpenses();
  const { data: payments = [] } = usePayments();

  const activeProjects = projects.filter((p) => p.status === "active").length;
  const completedProjects = projects.filter((p) => p.status === "completed").length;
  const totalProjectsValue = projects.reduce((sum, p) => sum + Number(p.cost || 0), 0);
  const pendingTodos = todos.filter((t) => !t.completed).length;

  const recentProjects = projects.slice(0, 5);
  const recentTodos = todos.slice(0, 5);
  const recentExpenses = expenses.slice(0, 5);
  const recentPayments = payments.slice(0, 5);

  return (
    <DashboardLayout title="Overview" description="Welcome back! Here's what's happening today.">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Active Projects"
          value={activeProjects}
          icon={FolderKanban}
          description={`${projects.length} total projects`}
        />
        <StatCard
          title="Completed Projects"
          value={completedProjects}
          icon={TrendingUp}
          description="Projects delivered"
        />
        <StatCard
          title="Total Projects Value"
          value={`₹${totalProjectsValue.toLocaleString()}`}
          icon={IndianRupee}
          description="Combined project cost"
        />
        <StatCard
          title="Pending Todos"
          value={pendingTodos}
          icon={CheckSquare}
          description={`${todos.filter((t) => t.completed).length} completed`}
        />
      </div>

      {/* Recent Activity Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Projects */}
        <div className="dashboard-section">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold">Recent Projects</h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentProjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No projects yet
                    </TableCell>
                  </TableRow>
                ) : (
                  recentProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell>{project.client || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 min-w-[100px]">
                          <Progress
                            value={project.progress}
                            className="h-2 flex-1"
                            indicatorClassName={getProgressColor(project.progress)}
                          />
                          <span className="text-xs">{project.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-xs px-2 py-1 rounded-full capitalize ${
                            project.status === "active"
                              ? "bg-success/10 text-success"
                              : project.status === "completed"
                              ? "bg-primary/10 text-primary"
                              : "bg-warning/10 text-warning"
                          }`}
                        >
                          {project.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Recent Todos */}
        <div className="dashboard-section">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold">Recent Todos</h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTodos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No todos yet
                    </TableCell>
                  </TableRow>
                ) : (
                  recentTodos.map((todo) => (
                    <TableRow key={todo.id}>
                      <TableCell className="font-medium">{todo.title}</TableCell>
                      <TableCell>
                        <span
                          className={`text-xs px-2 py-1 rounded-full capitalize ${
                            todo.priority === "high"
                              ? "bg-red-500/10 text-red-500"
                              : todo.priority === "medium"
                              ? "bg-yellow-500/10 text-yellow-600"
                              : "bg-green-500/10 text-green-600"
                          }`}
                        >
                          {todo.priority}
                        </span>
                      </TableCell>
                      <TableCell>
                        {todo.due_date ? format(new Date(todo.due_date), "MMM d") : "-"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            todo.completed
                              ? "bg-success/10 text-success"
                              : "bg-warning/10 text-warning"
                          }`}
                        >
                          {todo.completed ? "Done" : "Pending"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="dashboard-section">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold">Recent Expenses</h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No expenses yet
                    </TableCell>
                  </TableRow>
                ) : (
                  recentExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.description}</TableCell>
                      <TableCell className="capitalize">{expense.expense_type}</TableCell>
                      <TableCell className="text-right">₹{expense.amount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="dashboard-section">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold">Recent Payments Received</h3>
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
                {recentPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No payments yet
                    </TableCell>
                  </TableRow>
                ) : (
                  recentPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.client}</TableCell>
                      <TableCell>{format(new Date(payment.date), "MMM d, yyyy")}</TableCell>
                      <TableCell className="text-right">₹{payment.amount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
