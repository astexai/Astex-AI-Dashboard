import { useState } from "react";
import { Plus, CheckCircle2 } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AddTodoDialog } from "@/components/dashboard/AddTodoDialog";
import { TodoItem } from "@/components/dashboard/TodoItem";
import { Button } from "@/components/ui/button";
import { useTodos } from "@/hooks/useTodos";
import { Skeleton } from "@/components/ui/skeleton";

const Todos = () => {
  const { data: todos = [], isLoading } = useTodos();
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const pendingTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);
  const highPriority = pendingTodos.filter((t) => t.priority === "high");
  const mediumPriority = pendingTodos.filter((t) => t.priority === "medium");
  const lowPriority = pendingTodos.filter((t) => t.priority === "low");

  const hasTodos = todos.length > 0;

  return (
    <DashboardLayout
      title={hasTodos ? "Todos" : undefined}
      description={hasTodos ? `${pendingTodos.length} pending • ${completedTodos.length} completed` : undefined}
      headerActions={
        hasTodos ? (
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Todo
          </Button>
        ) : undefined
      }
    >
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : !hasTodos ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground mb-4 text-center">
            No todos yet. Create your first todo to get started.
          </p>
          <Button onClick={() => setAddDialogOpen(true)} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Todo
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Three Column Layout for Priority */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* High Priority */}
            <div className="dashboard-section">
              <div className="p-4 border-b border-border bg-red-500/10">
                <h3 className="font-semibold text-red-600 dark:text-red-400">
                  High Priority ({highPriority.length})
                </h3>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {highPriority.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground text-center">
                    No high priority tasks
                  </p>
                ) : (
                  highPriority.map((todo) => (
                    <TodoItem key={todo.id} todo={todo} />
                  ))
                )}
              </div>
            </div>

            {/* Medium Priority */}
            <div className="dashboard-section">
              <div className="p-4 border-b border-border bg-yellow-500/10">
                <h3 className="font-semibold text-yellow-600 dark:text-yellow-400">
                  Medium Priority ({mediumPriority.length})
                </h3>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {mediumPriority.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground text-center">
                    No medium priority tasks
                  </p>
                ) : (
                  mediumPriority.map((todo) => (
                    <TodoItem key={todo.id} todo={todo} />
                  ))
                )}
              </div>
            </div>

            {/* Low Priority */}
            <div className="dashboard-section">
              <div className="p-4 border-b border-border bg-green-500/10">
                <h3 className="font-semibold text-green-600 dark:text-green-400">
                  Low Priority ({lowPriority.length})
                </h3>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {lowPriority.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground text-center">
                    No low priority tasks
                  </p>
                ) : (
                  lowPriority.map((todo) => (
                    <TodoItem key={todo.id} todo={todo} />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Completed Section */}
          <div className="dashboard-section">
            <div className="p-4 border-b border-border flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <h3 className="font-semibold">Completed ({completedTodos.length})</h3>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {completedTodos.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground text-center">
                  No completed tasks yet
                </p>
              ) : (
                completedTodos.map((todo) => (
                  <TodoItem key={todo.id} todo={todo} />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <AddTodoDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </DashboardLayout>
  );
};

export default Todos;
