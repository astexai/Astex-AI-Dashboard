import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Project, useUpdateProject } from "@/hooks/useProjects";
import { toast } from "@/hooks/use-toast";

interface EditProjectDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditProjectDialog = ({ project, open, onOpenChange }: EditProjectDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [projectType, setProjectType] = useState("custom");
  const [customType, setCustomType] = useState("");
  const [client, setClient] = useState("");
  const [startDate, setStartDate] = useState("");
  const [cost, setCost] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [progress, setProgress] = useState("");
  const [status, setStatus] = useState("active");

  const updateProject = useUpdateProject();

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || "");
      setProjectType(project.project_type || "custom");
      setCustomType(project.custom_type || "");
      setClient(project.client || "");
      setStartDate(project.start_date || "");
      setCost(project.cost?.toString() || "");
      setAssignedTo(project.assigned_to || "");
      setProgress(project.progress?.toString() || "0");
      setStatus(project.status);
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    
    const progressNum = parseInt(progress) || 0;
    updateProject.mutate(
      {
        id: project.id,
        name,
        description: description || null,
        project_type: projectType,
        custom_type: projectType === "custom" ? customType : null,
        client: client || null,
        start_date: startDate || null,
        cost: parseFloat(cost) || 0,
        assigned_to: assignedTo || null,
        progress: progressNum,
        status: progressNum === 100 ? "completed" : status,
      },
      {
        onSuccess: () => {
          toast({ title: "Project updated successfully!" });
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Project Name *</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-type">Project Type</Label>
            <Select value={projectType} onValueChange={setProjectType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fullstack">Full Stack</SelectItem>
                <SelectItem value="frontend">Frontend</SelectItem>
                <SelectItem value="backend">Backend</SelectItem>
                <SelectItem value="ai">AI Automation</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {projectType === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="edit-custom-type">Custom Type</Label>
              <Input
                id="edit-custom-type"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                placeholder="Enter custom type"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-client">Client</Label>
            <Input
              id="edit-client"
              value={client}
              onChange={(e) => setClient(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-start-date">Start Date</Label>
            <Input
              id="edit-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-cost">Project Cost (INR)</Label>
            <Input
              id="edit-cost"
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-assigned">Assigned To</Label>
            <Input
              id="edit-assigned"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-progress">Progress (%)</Label>
            <Input
              id="edit-progress"
              type="number"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={updateProject.isPending}>
            {updateProject.isPending ? "Updating..." : "Update Project"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
