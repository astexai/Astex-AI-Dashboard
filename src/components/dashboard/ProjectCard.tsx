import { MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Project, useUpdateProject, useDeleteProject } from "@/hooks/useProjects";

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const statusColors: Record<string, string> = {
    active: "bg-success/10 text-success",
    completed: "bg-primary/10 text-primary",
    "on-hold": "bg-warning/10 text-warning",
  };

  const handleProgressChange = (newProgress: number) => {
    updateProject.mutate({
      id: project.id,
      progress: newProgress,
      status: newProgress === 100 ? "completed" : "active",
    });
  };

  return (
    <div className="p-4 border-b border-border last:border-b-0 hover:bg-secondary/50 transition-colors animate-slide-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium truncate">{project.name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColors[project.status]}`}>
              {project.status}
            </span>
          </div>
          {project.description && (
            <p className="text-sm text-muted-foreground mt-1 truncate">
              {project.description}
            </p>
          )}
          <div className="mt-3 flex items-center gap-3">
            <Progress value={project.progress} className="flex-1 h-2" />
            <span className="text-sm font-medium tabular-nums">{project.progress}%</span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleProgressChange(Math.min(100, project.progress + 10))}>
              Add 10% progress
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleProgressChange(100)}>
              Mark complete
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => deleteProject.mutate(project.id)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
