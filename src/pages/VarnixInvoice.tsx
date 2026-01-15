import { useState, useEffect } from "react";
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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  const [customProjectName, setCustomProjectName] = useState("");
  const [developmentCost, setDevelopmentCost] = useState("");
  const [additionalCost, setAdditionalCost] = useState("");
  const [projectStatus, setProjectStatus] = useState("pending");

  // Payment dialog state
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("upi");

  // Calculations
  const totalProjectsOnboard = varnixProjects.length;
  const completedProjects = varnixProjects.filter((p) => p.status === "completed").length;
  const ongoingProjects = varnixProjects.filter((p) => p.status === "ongoing").length;
  const totalProjectValue = varnixProjects.reduce((sum, p) => sum + Number(p.cost || 0), 0);
  const totalAmountReceived = varnixPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const totalAmountRemaining = totalProjectValue - totalAmountReceived;

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const isCustomProject = selectedProjectId === "custom";

  // Auto-fetch development cost when project is selected
  useEffect(() => {
    if (selectedProject && !isCustomProject) {
      setDevelopmentCost(String(selectedProject.cost || 0));
    } else if (isCustomProject) {
      setDevelopmentCost("");
    }
  }, [selectedProjectId, selectedProject, isCustomProject]);

  // Calculate total cost
  const totalCost = (parseFloat(developmentCost) || 0) + (parseFloat(additionalCost) || 0);

  const handleAddProject = () => {
    const projectName = isCustomProject ? customProjectName : selectedProject?.name;
    if (!projectName) {
      toast({ title: "Please enter a project name", variant: "destructive" });
      return;
    }

    createVarnixProject.mutate(
      {
        project_id: isCustomProject ? undefined : selectedProjectId,
        project_name: projectName,
        development_cost: parseFloat(developmentCost) || 0,
        additional_cost: parseFloat(additionalCost) || 0,
        cost: totalCost,
        status: projectStatus,
      },
      {
        onSuccess: () => {
          toast({ title: "Project added to Varnix!" });
          setProjectDialogOpen(false);
          resetProjectForm();
        },
      }
    );
  };

  const resetProjectForm = () => {
    setSelectedProjectId("");
    setCustomProjectName("");
    setDevelopmentCost("");
    setAdditionalCost("");
    setProjectStatus("pending");
  };

  const handleAddPayment = () => {
    if (!paymentAmount) return;
    createVarnixPayment.mutate(
      {
        date: paymentDate || new Date().toISOString().split("T")[0],
        amount: parseFloat(paymentAmount),
        mode: paymentMode,
      },
      {
        onSuccess: () => {
          toast({ title: "Payment recorded!" });
          setPaymentDialogOpen(false);
          setPaymentDate("");
          setPaymentAmount("");
          setPaymentMode("upi");
        },
      }
    );
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Varnix Total Billing Statement", pageWidth / 2, 25, { align: "center" });

    // Updated date
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Updated on ${format(new Date(), "MMMM d, yyyy")}`, pageWidth / 2, 35, { align: "center" });

    // All Projects & Cost heading
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("All Projects & Cost", 14, 50);

    // Projects table
    autoTable(doc, {
      startY: 55,
      head: [["Project Name", "Development Cost", "Additional Cost", "Total", "Status"]],
      body: varnixProjects.map((p) => [
        p.project_name,
        `₹${(p.development_cost || 0).toLocaleString()}`,
        `₹${(p.additional_cost || 0).toLocaleString()}`,
        `₹${p.cost.toLocaleString()}`,
        p.status.charAt(0).toUpperCase() + p.status.slice(1),
      ]),
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [66, 66, 66], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    // Get the Y position after the first table
    const firstTableEndY = (doc as any).lastAutoTable.finalY + 15;

    // Received Amount heading
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Received Amount", 14, firstTableEndY);

    // Payments table
    autoTable(doc, {
      startY: firstTableEndY + 5,
      head: [["Received Amount Date", "Amount INR", "Mode"]],
      body: varnixPayments.map((p) => [
        format(new Date(p.date), "MMM d, yyyy"),
        `₹${p.amount.toLocaleString()}`,
        p.mode.toUpperCase(),
      ]),
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [66, 66, 66], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    // Get the Y position after the second table
    const secondTableEndY = (doc as any).lastAutoTable.finalY + 15;

    // Summary section
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Projects Value: ₹${totalProjectValue.toLocaleString()}`, 14, secondTableEndY);
    doc.text(`Total Received Amount: ₹${totalAmountReceived.toLocaleString()}`, 14, secondTableEndY + 8);
    doc.setTextColor(255, 100, 100);
    doc.text(`Total Remaining Amount to Pay: ₹${totalAmountRemaining.toLocaleString()}`, 14, secondTableEndY + 16);

    // Save the PDF
    doc.save("varnix-billing-statement.pdf");
    toast({ title: "Invoice PDF downloaded!" });
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
      <div className="space-y-6">
        {/* Varnix Projects */}
        <div className="dashboard-section">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold">All Projects & Cost</h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Development Cost</TableHead>
                  <TableHead>Additional Cost</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {varnixProjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No projects yet
                    </TableCell>
                  </TableRow>
                ) : (
                  varnixProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.project_name}</TableCell>
                      <TableCell>₹{(project.development_cost || 0).toLocaleString()}</TableCell>
                      <TableCell>₹{(project.additional_cost || 0).toLocaleString()}</TableCell>
                      <TableCell className="font-semibold">₹{project.cost.toLocaleString()}</TableCell>
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
            <h3 className="font-semibold">Received Amount</h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Received Amount Date</TableHead>
                  <TableHead>Amount INR</TableHead>
                  <TableHead>Mode</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {varnixPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No payments yet
                    </TableCell>
                  </TableRow>
                ) : (
                  varnixPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{format(new Date(payment.date), "MMM d, yyyy")}</TableCell>
                      <TableCell>₹{payment.amount.toLocaleString()}</TableCell>
                      <TableCell className="uppercase">{payment.mode}</TableCell>
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
      <Dialog open={projectDialogOpen} onOpenChange={(open) => {
        setProjectDialogOpen(open);
        if (!open) resetProjectForm();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Project to Varnix</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Project</Label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom (Enter manually)</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isCustomProject && (
              <div className="space-y-2">
                <Label>Project Name</Label>
                <Input
                  value={customProjectName}
                  onChange={(e) => setCustomProjectName(e.target.value)}
                  placeholder="Enter project name"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Development Cost (INR)</Label>
              <Input
                type="number"
                value={developmentCost}
                onChange={(e) => setDevelopmentCost(e.target.value)}
                placeholder="Enter development cost"
              />
            </div>

            <div className="space-y-2">
              <Label>Additional Cost (INR)</Label>
              <Input
                type="number"
                value={additionalCost}
                onChange={(e) => setAdditionalCost(e.target.value)}
                placeholder="Enter additional cost"
              />
            </div>

            <div className="p-3 rounded-lg bg-secondary">
              <p className="text-sm text-muted-foreground">Total Cost</p>
              <p className="text-lg font-semibold">₹{totalCost.toLocaleString()}</p>
            </div>

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
            <div className="space-y-2">
              <Label>Mode</Label>
              <Select value={paymentMode} onValueChange={setPaymentMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
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