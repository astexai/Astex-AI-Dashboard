import { useState } from "react";
import { Plus, Download, FolderKanban, CheckCircle, Clock, IndianRupee } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProjects } from "@/hooks/useProjects";
import { useVarnixProjects, useCreateVarnixProject, useVarnixPayments, useCreateVarnixPayment } from "@/hooks/useVarnix";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

const VarnixInvoice = () => {
  const { data: projects = [] } = useProjects();
  const { data: varnixProjects = [] } = useVarnixProjects();
  const { data: varnixPayments = [] } = useVarnixPayments();
  const createVarnixProject = useCreateVarnixProject();
  const createVarnixPayment = useCreateVarnixPayment();

  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  // Project dialog state
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [projectStatus, setProjectStatus] = useState("pending");

  // Payment dialog state
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");

  // Calculations
  const totalProjectsOnboard = varnixProjects.length;
  const completedProjects = varnixProjects.filter((p) => p.status === "completed").length;
  const ongoingProjects = varnixProjects.filter((p) => p.status === "ongoing").length;
  const totalProjectValue = varnixProjects.reduce((sum, p) => sum + Number(p.cost || 0), 0);
  const totalAmountReceived = varnixPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const totalAmountRemaining = totalProjectValue - totalAmountReceived;

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const handleAddProject = () => {
    if (!selectedProjectId || !selectedProject) return;
    createVarnixProject.mutate(
      {
        project_id: selectedProjectId,
        project_name: selectedProject.name,
        cost: selectedProject.cost || 0,
        status: projectStatus,
      },
      {
        onSuccess: () => {
          toast({ title: "Project added to Varnix!" });
          setProjectDialogOpen(false);
          setSelectedProjectId("");
          setProjectStatus("pending");
        },
      }
    );
  };

  const handleAddPayment = () => {
    if (!paymentAmount) return;
    createVarnixPayment.mutate(
      {
        date: paymentDate || new Date().toISOString().split("T")[0],
        amount: parseFloat(paymentAmount),
      },
      {
        onSuccess: () => {
          toast({ title: "Payment recorded!" });
          setPaymentDialogOpen(false);
          setPaymentDate("");
          setPaymentAmount("");
        },
      }
    );
  };

  const generatePDF = () => {
    const content = `
VARNIX COSTING DOC
==================

Last Updated: ${format(new Date(), "MMMM d, yyyy")}

ALL PROJECTS
------------
${varnixProjects.map((p) => `${p.project_name}: ₹${p.cost.toLocaleString()}`).join("\n")}

RECEIVED AMOUNT DATE
--------------------
${varnixPayments.map((p) => `${format(new Date(p.date), "MMM d, yyyy")}: ₹${p.amount.toLocaleString()}`).join("\n")}

SUMMARY
-------
Total Project Value: ₹${totalProjectValue.toLocaleString()}
Total Received Amount: ₹${totalAmountReceived.toLocaleString()}
Total Remaining Amount: ₹${totalAmountRemaining.toLocaleString()}
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "varnix-costing-doc.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Invoice downloaded!" });
  };

  return (
    <DashboardLayout title="Varnix Invoice" description="Single-client consolidated details">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-8">
        <StatCard
          title="Projects Onboard"
          value={totalProjectsOnboard}
          icon={FolderKanban}
        />
        <StatCard
          title="Completed"
          value={completedProjects}
          icon={CheckCircle}
        />
        <StatCard
          title="Ongoing"
          value={ongoingProjects}
          icon={Clock}
        />
        <StatCard
          title="Amount Received"
          value={`₹${totalAmountReceived.toLocaleString()}`}
          icon={IndianRupee}
        />
        <StatCard
          title="Amount Remaining"
          value={`₹${totalAmountRemaining.toLocaleString()}`}
          icon={IndianRupee}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Button onClick={() => setProjectDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
        <Button onClick={() => setPaymentDialogOpen(true)} variant="secondary">
          <Plus className="h-4 w-4 mr-2" />
          Amount Received
        </Button>
        <Button onClick={generatePDF} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download Invoice
        </Button>
      </div>

      {/* Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Varnix Projects */}
        <div className="dashboard-section">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold">All Projects</h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Cost (INR)</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {varnixProjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No projects yet
                    </TableCell>
                  </TableRow>
                ) : (
                  varnixProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>{project.project_name}</TableCell>
                      <TableCell>₹{project.cost.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                          project.status === "completed" ? "bg-success/10 text-success" :
                          project.status === "ongoing" ? "bg-primary/10 text-primary" :
                          "bg-warning/10 text-warning"
                        }`}>
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

        {/* Varnix Payments */}
        <div className="dashboard-section">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold">Received Amount Dates</h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount (INR)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {varnixPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      No payments yet
                    </TableCell>
                  </TableRow>
                ) : (
                  varnixPayments.map((payment) => (
                    <TableRow key={payment.id}>
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

      {/* Summary */}
      <div className="mt-8 dashboard-section p-6">
        <h3 className="font-semibold mb-4">Summary</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="p-4 rounded-lg bg-secondary">
            <p className="text-sm text-muted-foreground">Total Project Value</p>
            <p className="text-2xl font-bold">₹{totalProjectValue.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-lg bg-success/10">
            <p className="text-sm text-muted-foreground">Total Received</p>
            <p className="text-2xl font-bold text-success">₹{totalAmountReceived.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-lg bg-warning/10">
            <p className="text-sm text-muted-foreground">Total Remaining</p>
            <p className="text-2xl font-bold text-warning">₹{totalAmountRemaining.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Add Project Dialog */}
      <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Project to Varnix</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Project Name</Label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedProject && (
              <div className="p-3 rounded-lg bg-secondary">
                <p className="text-sm text-muted-foreground">Project Cost</p>
                <p className="text-lg font-semibold">₹{(selectedProject.cost || 0).toLocaleString()}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={projectStatus} onValueChange={setProjectStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddProject} className="w-full">
              Add Project
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Amount Received Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Amount (INR)</Label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            <Button onClick={handleAddPayment} className="w-full">
              Record Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default VarnixInvoice;
