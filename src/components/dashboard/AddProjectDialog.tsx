import { useState, useEffect } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateProject, useUpdateProject, Project } from "@/hooks/useProjects";
import { useToast } from "@/hooks/use-toast";

interface AddProjectDialogProps {
  trigger?: React.ReactNode;
  editProject?: Project;
  onClose?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const projectTypes = [
  { value: "fullstack", label: "Full Stack" },
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "ai_automation", label: "AI Automation" },
  { value: "custom", label: "Custom" },
];

export const AddProjectDialog = ({ trigger, editProject, onClose, open: controlledOpen, onOpenChange: controlledOnOpenChange }: AddProjectDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? (controlledOnOpenChange || (() => {})) : setInternalOpen;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [projectType, setProjectType] = useState("fullstack");
  const [customType, setCustomType] = useState("");
  const [client, setClient] = useState("");
  const [startDate, setStartDate] = useState("");
  const [cost, setCost] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [progress, setProgress] = useState("0");
  
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const { toast } = useToast();

  useEffect(() => {
    if (editProject) {
      setName(editProject.name);
      setDescription(editProject.description || "");
      setProjectType(editProject.project_type || "fullstack");
      setCustomType(editProject.custom_type || "");
      setClient(editProject.client || "");
      setStartDate(editProject.start_date || "");
      setCost(editProject.cost?.toString() || "0");
      setAssignedTo(editProject.assigned_to || "");
      setProgress(editProject.progress?.toString() || "0");
      setOpen(true);
    }
  }, [editProject]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setProjectType("fullstack");
    setCustomType("");
    setClient("");
    setStartDate("");
    setCost("");
    setAssignedTo("");
    setProgress("0");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const projectData = {
        name,
        description: description || undefined,
        project_type: projectType,
        custom_type: projectType === "custom" ? customType : undefined,
        client: client || undefined,
        start_date: startDate || undefined,
        cost: parseFloat(cost) || 0,
        assigned_to: assignedTo || undefined,
        progress: parseInt(progress) || 0,
      };

      if (editProject) {
        await updateProject.mutateAsync({ id: editProject.id, ...projectData });
        toast({ title: "Project updated successfully" });
      } else {
        await createProject.mutateAsync(projectData);
        toast({ title: "Project created successfully" });
      }
      
      setOpen(false);
      resetForm();
      onClose?.();
    } catch (error) {
      toast({
        title: editProject ? "Error updating project" : "Error creating project",
        variant: "destructive",
      });
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
      onClose?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {/* {trigger || (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Projects
          </Button>
        )} */}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editProject ? "Edit Project" : "Create New Project"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My awesome project"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this project about?"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectType">Project Type</Label>
              <Select value={projectType} onValueChange={setProjectType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projectTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {projectType === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="customType">Custom Type</Label>
                <Input
                  id="customType"
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  placeholder="Enter custom type"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Input
                id="client"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="Client name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Project Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost">Project Cost (INR)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Project Assigned To</Label>
              <Input
                id="assignedTo"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Team member name"
              />
            </div>
          </div>

          {editProject && (
            <div className="space-y-2">
              <Label htmlFor="progress">Progress (%)</Label>
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
                placeholder="0"
              />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={createProject.isPending || updateProject.isPending}>
            {createProject.isPending || updateProject.isPending 
              ? "Saving..." 
              : editProject 
                ? "Update Project" 
                : "Create Project"
            }
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
