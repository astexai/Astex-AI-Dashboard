import { FolderKanban, CheckSquare, Receipt, TrendingUp } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { TodoItem } from "@/components/dashboard/TodoItem";
import { ExpenseItem } from "@/components/dashboard/ExpenseItem";
import { AddProjectDialog } from "@/components/dashboard/AddProjectDialog";
import { AddTodoDialog } from "@/components/dashboard/AddTodoDialog";
import { AddExpenseDialog } from "@/components/dashboard/AddExpenseDialog";
import { useProjects } from "@/hooks/useProjects";
import { useTodos } from "@/hooks/useTodos";
import { useExpenses } from "@/hooks/useExpenses";

const Dashboard = () => {
  const { data: projects = [] } = useProjects();
  const { data: todos = [] } = useTodos();
  const { data: expenses = [] } = useExpenses();

  const activeProjects = projects.filter((p) => p.status === "active").length;
  const pendingTodos = todos.filter((t) => !t.completed).length;
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const completedTodosPercent = todos.length > 0 
    ? Math.round((todos.filter((t) => t.completed).length / todos.length) * 100) 
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Active Projects"
            value={activeProjects}
            icon={FolderKanban}
            description={`${projects.length} total projects`}
          />
          <StatCard
            title="Pending Todos"
            value={pendingTodos}
            icon={CheckSquare}
            description={`${completedTodosPercent}% completed`}
          />
          <StatCard
            title="Total Expenses"
            value={`$${totalExpenses.toFixed(2)}`}
            icon={Receipt}
            description={`${expenses.length} transactions`}
          />
          <StatCard
            title="Productivity"
            value={`${completedTodosPercent}%`}
            icon={TrendingUp}
            description="Tasks completion rate"
          />
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {/* Projects Section */}
          <div className="dashboard-section xl:col-span-1">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-semibold">Recent Projects</h2>
              <AddProjectDialog />
            </div>
            <div className="max-h-80 overflow-y-auto">
              {projects.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground text-center">
                  No projects yet. Create your first one!
                </p>
              ) : (
                projects.slice(0, 5).map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))
              )}
            </div>
          </div>

          {/* Todos Section */}
          <div className="dashboard-section xl:col-span-1">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-semibold">Today's Todos</h2>
              <AddTodoDialog />
            </div>
            <div className="max-h-80 overflow-y-auto">
              {todos.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground text-center">
                  No todos yet. Add your first task!
                </p>
              ) : (
                todos.slice(0, 6).map((todo) => (
                  <TodoItem key={todo.id} todo={todo} />
                ))
              )}
            </div>
          </div>

          {/* Expenses Section */}
          <div className="dashboard-section xl:col-span-1 lg:col-span-2 xl:col-span-1">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-semibold">Recent Expenses</h2>
              <AddExpenseDialog />
            </div>
            <div className="max-h-80 overflow-y-auto">
              {expenses.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground text-center">
                  No expenses yet. Track your spending!
                </p>
              ) : (
                expenses.slice(0, 5).map((expense) => (
                  <ExpenseItem key={expense.id} expense={expense} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
