import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Todo, useUpdateTodo, useDeleteTodo } from "@/hooks/useTodos";
import { format } from "date-fns";

interface TodoItemProps {
  todo: Todo;
}

export const TodoItem = ({ todo }: TodoItemProps) => {
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  const priorityClasses: Record<string, string> = {
    high: "priority-high",
    medium: "priority-medium",
    low: "priority-low",
  };

  return (
    <div className={`flex items-center gap-3 p-3 border-b border-border last:border-b-0 hover:bg-secondary/50 transition-colors animate-slide-in ${todo.completed ? "opacity-60" : ""}`}>
      <Checkbox
        checked={todo.completed}
        onCheckedChange={(checked) =>
          updateTodo.mutate({ id: todo.id, completed: checked as boolean })
        }
      />
      
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
          {todo.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-xs capitalize ${priorityClasses[todo.priority]}`}>
            {todo.priority}
          </span>
          {todo.due_date && (
            <span className="text-xs text-muted-foreground">
              Due: {format(new Date(todo.due_date), "MMM d")}
            </span>
          )}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-0 group-hover:opacity-100 hover:opacity-100"
        onClick={() => deleteTodo.mutate(todo.id)}
      >
        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
      </Button>
    </div>
  );
};
