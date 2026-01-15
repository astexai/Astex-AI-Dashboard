import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AddProjectDialog } from "@/components/dashboard/AddProjectDialog";
import { EditProjectDialog } from "@/components/dashboard/EditProjectDialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProjects, useDeleteProject, Project } from "@/hooks/useProjects";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const getProgressColor = (progress: number) => {
  if (progress === 100) return "bg-green-600";
  if (progress > 80) return "bg-green-400";
  if (progress >= 50) return "bg-yellow-500";
  return "bg-red-500";
};

const getProjectTypeLabel = (type: string | null, customType: string | null) => {
  const types: Record<string, string> = {
    fullstack: "Full Stack",
    frontend: "Frontend",
    backend: "Backend",
    ai: "AI Automation",
    custom: customType || "Custom",
  };
  return types[type || "custom"] || type || "Custom";
};

const Projects = () => {
  const { data: projects = [], isLoading } = useProjects();
  const deleteProject = useDeleteProject();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const hasProjects = projects.length > 0;

  return (
    <DashboardLayout
      title={hasProjects ? "Project Management" : undefined}
      headerActions={
        hasProjects ? (
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        ) : undefined
      }
    >
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : !hasProjects ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground mb-4 text-center">
            Currently no projects added. Please add your first project.
          </p>
          <Button onClick={() => setAddDialogOpen(true)} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Project
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Cost (INR)</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">
                      <div>
                        <p>{project.name}</p>
                        {project.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {project.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getProjectTypeLabel(project.project_type, project.custom_type)}</TableCell>
                    <TableCell>{project.client || "-"}</TableCell>
                    <TableCell>
                      {project.start_date ? format(new Date(project.start_date), "MMM d, yyyy") : "-"}
                    </TableCell>
                    <TableCell>₹{(project.cost || 0).toLocaleString()}</TableCell>
                    <TableCell>{project.assigned_to || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <Progress 
                          value={project.progress} 
                          className="h-2 flex-1"
                          indicatorClassName={getProgressColor(project.progress)}
                        />
                        <span className="text-xs font-medium w-8">{project.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                        project.status === "active" ? "bg-success/10 text-success" :
                        project.status === "completed" ? "bg-primary/10 text-primary" :
                        "bg-warning/10 text-warning"
                      }`}>
                        {project.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingProject(project)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteProject.mutate(project.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <AddProjectDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      <EditProjectDialog 
        project={editingProject} 
        open={!!editingProject} 
        onOpenChange={(open) => !open && setEditingProject(null)} 
      />
    </DashboardLayout>
  );
};

export default Projects;
