import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { TodoItem } from "@/components/dashboard/TodoItem";
import { AddTodoDialog } from "@/components/dashboard/AddTodoDialog";
import { useTodos } from "@/hooks/useTodos";
import { Skeleton } from "@/components/ui/skeleton";

const Todos = () => {
  const { data: todos = [], isLoading } = useTodos();

  const pendingTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);

  const highPriority = pendingTodos.filter((t) => t.priority === "high");
  const mediumPriority = pendingTodos.filter((t) => t.priority === "medium");
  const lowPriority = pendingTodos.filter((t) => t.priority === "low");

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Todos</h1>
            <p className="text-muted-foreground mt-1">
              {pendingTodos.length} pending, {completedTodos.length} completed
            </p>
          </div>
          <AddTodoDialog />
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : todos.length === 0 ? (
          <div className="dashboard-section p-12 text-center">
            <p className="text-muted-foreground">
              No todos yet. Add your first task to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {highPriority.length > 0 && (
              <div className="dashboard-section">
                <div className="p-4 border-b border-border">
                  <h2 className="font-semibold text-destructive">High Priority ({highPriority.length})</h2>
                </div>
                {highPriority.map((todo) => (
                  <TodoItem key={todo.id} todo={todo} />
                ))}
              </div>
            )}

            {mediumPriority.length > 0 && (
              <div className="dashboard-section">
                <div className="p-4 border-b border-border">
                  <h2 className="font-semibold text-warning">Medium Priority ({mediumPriority.length})</h2>
                </div>
                {mediumPriority.map((todo) => (
                  <TodoItem key={todo.id} todo={todo} />
                ))}
              </div>
            )}

            {lowPriority.length > 0 && (
              <div className="dashboard-section">
                <div className="p-4 border-b border-border">
                  <h2 className="font-semibold text-muted-foreground">Low Priority ({lowPriority.length})</h2>
                </div>
                {lowPriority.map((todo) => (
                  <TodoItem key={todo.id} todo={todo} />
                ))}
              </div>
            )}

            {completedTodos.length > 0 && (
              <div className="dashboard-section opacity-60">
                <div className="p-4 border-b border-border">
                  <h2 className="font-semibold">Completed ({completedTodos.length})</h2>
                </div>
                {completedTodos.map((todo) => (
                  <TodoItem key={todo.id} todo={todo} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Todos;
