import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { AddProjectDialog } from "@/components/dashboard/AddProjectDialog";
import { useProjects } from "@/hooks/useProjects";
import { Skeleton } from "@/components/ui/skeleton";

const Projects = () => {
  const { data: projects = [], isLoading } = useProjects();

  const activeProjects = projects.filter((p) => p.status === "active");
  const completedProjects = projects.filter((p) => p.status === "completed");
  const onHoldProjects = projects.filter((p) => p.status === "on-hold");

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all your projects in one place.
            </p>
          </div>
          <AddProjectDialog />
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="dashboard-section p-12 text-center">
            <p className="text-muted-foreground">
              No projects yet. Create your first project to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeProjects.length > 0 && (
              <div className="dashboard-section">
                <div className="p-4 border-b border-border">
                  <h2 className="font-semibold">Active ({activeProjects.length})</h2>
                </div>
                {activeProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}

            {onHoldProjects.length > 0 && (
              <div className="dashboard-section">
                <div className="p-4 border-b border-border">
                  <h2 className="font-semibold">On Hold ({onHoldProjects.length})</h2>
                </div>
                {onHoldProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}

            {completedProjects.length > 0 && (
              <div className="dashboard-section">
                <div className="p-4 border-b border-border">
                  <h2 className="font-semibold">Completed ({completedProjects.length})</h2>
                </div>
                {completedProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Projects;
