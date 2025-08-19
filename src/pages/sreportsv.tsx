import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Shield, AlertTriangle, FileText, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface SafetyReport {
  id: string;
  title: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  description: string;
  reporter: string;
  reportDate: string;
  status: 'submitted' | 'investigating' | 'resolved' | 'closed';
  assignedTo?: string;
  followUpRequired: boolean;
  resolutionNotes?: string;
}

interface Employee {
  id: string;
  name: string;
}

const mockSafetyReports: SafetyReport[] = [
  {
    id: 'SR-001',
    title: 'Slip hazard in warehouse',
    type: 'Hazard Report',
    severity: 'medium',
    location: 'Warehouse A, Section 3',
    description: 'Water spillage creating slip hazard near loading dock. No signage posted.',
    reporter: 'John Smith',
    reportDate: '2024-07-20T08:30:00',
    status: 'investigating',
    assignedTo: 'Safety Team',
    followUpRequired: true
  },
  {
    id: 'SR-002',
    title: 'Near miss incident with forklift',
    type: 'Near Miss',
    severity: 'high',
    location: 'Main Storage Area',
    description: 'Forklift nearly collided with employee walking around blind corner.',
    reporter: 'Sarah Johnson',
    reportDate: '2024-07-19T14:45:00',
    status: 'resolved',
    assignedTo: 'Operations Manager',
    followUpRequired: false,
    resolutionNotes: 'Forklift operator retrained on blind spot awareness. New mirrors installed.'
  },
  {
    id: 'SR-003',
    title: 'Equipment malfunction',
    type: 'Equipment',
    severity: 'low',
    location: 'Workshop B',
    description: 'Drill press guard not functioning properly, needs immediate attention.',
    reporter: 'Mike Wilson',
    reportDate: '2024-07-18T10:15:00',
    status: 'submitted',
    followUpRequired: true
  }
];

const mockEmployees: Employee[] = [
  { id: 'emp-001', name: 'Alice Brown' },
  { id: 'emp-002', name: 'Bob Green' },
  { id: 'emp-003', name: 'Charlie Davis' },
  { id: 'emp-004', name: 'Diana Miller' },
];

export default function SafetyReportsViewer() {
  const [reports, setReports] = useState<SafetyReport[]>(mockSafetyReports);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isInvestigateModalOpen, setIsInvestigateModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<SafetyReport | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [assignedEmployee, setAssignedEmployee] = useState<string | undefined>(undefined);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'investigating':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || report.severity === severityFilter;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const handleViewReport = (report: SafetyReport) => {
    setSelectedReport(report);
    setResolveNotes(report.resolutionNotes || '');
    setIsViewModalOpen(true);
  };

  const handleResolveReport = () => {
    if (selectedReport) {
      setReports(reports.map(report =>
        report.id === selectedReport.id
          ? { ...report, status: 'resolved', resolutionNotes: resolveNotes, followUpRequired: false }
          : report
      ));
      setIsViewModalOpen(false);
      setSelectedReport(null);
      setResolveNotes('');
    }
  };

  const handleInvestigateReport = (report: SafetyReport) => {
    setSelectedReport(report);
    setTaskDescription(`Investigate: ${report.title} at ${report.location}. Description: ${report.description}`);
    setAssignedEmployee(report.assignedTo ? mockEmployees.find(emp => emp.name === report.assignedTo)?.id : undefined);
    setIsInvestigateModalOpen(true);
  };

  const handleAssignTask = () => {
    if (selectedReport && assignedEmployee) {
      const employeeName = mockEmployees.find(emp => emp.id === assignedEmployee)?.name;
      setReports(reports.map(report =>
        report.id === selectedReport.id
          ? { ...report, status: 'investigating', assignedTo: employeeName }
          : report
      ));
      setIsInvestigateModalOpen(false);
      setSelectedReport(null);
      setTaskDescription('');
      setAssignedEmployee(undefined);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Submitted Safety Reports</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Complete overview of all submitted safety incidents and reports</p>
        </div>
        {/* Optional: Add a button for submitting new reports here for larger screens */}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center w-full">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="investigating">Investigating</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filter by Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Desktop and Tablet View (Table) */}
      <Card className="hidden sm:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 min-w-[100px]">Report ID</th>
                  <th className="text-left p-3 min-w-[150px]">Title</th>
                  <th className="text-left p-3 min-w-[120px]">Type</th>
                  <th className="text-left p-3 min-w-[150px]">Location</th>
                  <th className="text-left p-3 min-w-[100px]">Severity</th>
                  <th className="text-left p-3 min-w-[120px]">Status</th>
                  <th className="text-left p-3 min-w-[120px]">Reporter</th>
                  <th className="text-left p-3 min-w-[100px]">Date</th>
                  <th className="text-left p-3 min-w-[120px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length > 0 ? (
                  filteredReports.map((report) => (
                    <tr key={report.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{report.id}</td>
                      <td className="p-3">{report.title}</td>
                      <td className="p-3">{report.type}</td>
                      <td className="p-3">{report.location}</td>
                      <td className="p-3">
                        <Badge className={getSeverityColor(report.severity)}>
                          <span className="capitalize">{report.severity}</span>
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge className={getStatusColor(report.status)}>
                          <span className="capitalize">{report.status}</span>
                        </Badge>
                      </td>
                      <td className="p-3">{report.reporter}</td>
                      <td className="p-3">{format(new Date(report.reportDate), "MMM dd, yyyy")}</td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleViewReport(report)}>View</Button>
                          <Button variant="ghost" size="sm" onClick={() => handleInvestigateReport(report)}>Investigate</Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-muted-foreground">No reports found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Mobile View (Cards) */}
      <div className="grid gap-4 sm:hidden">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <Card key={report.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{report.title}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <FileText className="h-4 w-4 text-muted-foreground" /> {report.type}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" /> {report.location}
                  </div>
                  <Badge className={getSeverityColor(report.severity)}>
                    <span className="capitalize">{report.severity}</span>
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{report.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Shield className="h-4 w-4 text-muted-foreground" /> {report.reporter}
                  </div>
                  <Badge className={getStatusColor(report.status)}>
                    <span className="capitalize">{report.status}</span>
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground text-right">
                  Reported: {format(new Date(report.reportDate), "MMM dd, yyyy")}
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleViewReport(report)}>View</Button>
                  <Button size="sm" onClick={() => handleInvestigateReport(report)}>Investigate</Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No reports found.
            </CardContent>
          </Card>
        )}
      </div>

      {/* View Report Modal */}
      {selectedReport && (
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Safety Report: {selectedReport.id}</DialogTitle>
              <DialogDescription>
                Details for "{selectedReport.title}"
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Title</Label>
                <Input id="title" value={selectedReport.title} className="col-span-3" readOnly />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">Type</Label>
                <Input id="type" value={selectedReport.type} className="col-span-3" readOnly />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">Location</Label>
                <Input id="location" value={selectedReport.location} className="col-span-3" readOnly />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="severity" className="text-right">Severity</Label>
                <div className="col-span-3">
                  <Badge className={getSeverityColor(selectedReport.severity)}>
                    <span className="capitalize">{selectedReport.severity}</span>
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Status</Label>
                <div className="col-span-3">
                  <Badge className={getStatusColor(selectedReport.status)}>
                    <span className="capitalize">{selectedReport.status}</span>
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reporter" className="text-right">Reporter</Label>
                <Input id="reporter" value={selectedReport.reporter} className="col-span-3" readOnly />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">Date</Label>
                <Input id="date" value={format(new Date(selectedReport.reportDate), "MMM dd, yyyy")} className="col-span-3" readOnly />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Textarea id="description" value={selectedReport.description} className="col-span-3 resize-none" readOnly rows={4} />
              </div>
              {selectedReport.assignedTo && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="assignedTo" className="text-right">Assigned To</Label>
                  <Input id="assignedTo" value={selectedReport.assignedTo} className="col-span-3" readOnly />
                </div>
              )}
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="resolveNotes" className="text-right">Resolution Notes</Label>
                <Textarea
                  id="resolveNotes"
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  className="col-span-3 resize-none"
                  placeholder="Add notes for resolution..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={handleResolveReport}
                disabled={selectedReport.status === 'resolved' || selectedReport.status === 'closed'}
              >
                Resolve Incident
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Investigate Report Modal */}
      {selectedReport && (
        <Dialog open={isInvestigateModalOpen} onOpenChange={setIsInvestigateModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Assign Task for: {selectedReport.id}</DialogTitle>
              <DialogDescription>
                Create a task and assign an employee to investigate "{selectedReport.title}"
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="taskDescription" className="text-right">Task Description</Label>
                <Textarea
                  id="taskDescription"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="col-span-3 resize-none"
                  placeholder="Describe the investigation task..."
                  rows={5}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="assignEmployee" className="text-right">Assign To</Label>
                <Select value={assignedEmployee} onValueChange={setAssignedEmployee}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select Employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockEmployees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={handleAssignTask}
                disabled={!assignedEmployee || selectedReport.status === 'resolved' || selectedReport.status === 'closed'}
              >
                Assign Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}