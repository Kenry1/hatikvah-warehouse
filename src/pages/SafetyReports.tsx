import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Shield, AlertTriangle, FileText, MapPin, Camera } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

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
    followUpRequired: false
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

export default function SafetyReports() {
  const [reports, setReports] = useState<SafetyReport[]>(mockSafetyReports);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

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

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'hazard report':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'near miss':
        return <Shield className="h-4 w-4 text-yellow-500" />;
      case 'equipment':
        return <FileText className="h-4 w-4 text-blue-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
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

  const handleSubmitReport = () => {
    toast({
      title: "Safety Report Submitted",
      description: "Your safety report has been submitted and will be investigated.",
    });
    setIsAddDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Safety Reports</h1>
          <p className="text-muted-foreground">Report and track safety incidents and hazards</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Report Incident
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Submit Safety Report</DialogTitle>
              <DialogDescription>
                Report safety incidents, near misses, or hazards for investigation.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Incident Title</Label>
                <Input 
                  id="title" 
                  placeholder="Brief description of the incident"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Report Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hazard">Hazard Report</SelectItem>
                      <SelectItem value="near-miss">Near Miss</SelectItem>
                      <SelectItem value="incident">Incident</SelectItem>
                      <SelectItem value="equipment">Equipment Issue</SelectItem>
                      <SelectItem value="environmental">Environmental</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="severity">Severity Level</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  placeholder="Where did this occur? (Building, room, area)"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Provide a detailed description of what happened, including contributing factors..."
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="immediate-action">Immediate Action Taken</Label>
                <Textarea 
                  id="immediate-action" 
                  placeholder="Describe any immediate actions taken to address the situation..."
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="photos">Photos/Evidence</Label>
                <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                  <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload photos or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG up to 10MB each
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSubmitReport} className="flex-1">Submit Report</Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
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
          <SelectTrigger className="w-40">
            <SelectValue />
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

      <Tabs defaultValue="my-reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="my-reports">My Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="my-reports" className="space-y-4">
          <div className="grid gap-4">
            {filteredReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(report.type)}
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {report.title}
                          <span className="text-sm font-normal text-muted-foreground">#{report.id}</span>
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          {report.location}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(report.severity)}>
                        <span className="capitalize">{report.severity}</span>
                      </Badge>
                      <Badge className={getStatusColor(report.status)}>
                        <span className="capitalize">{report.status}</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <span className="ml-2">{report.type}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Reported:</span>
                      <span className="ml-2">{format(new Date(report.reportDate), "MMM dd, yyyy HH:mm")}</span>
                    </div>
                    {report.assignedTo && (
                      <div>
                        <span className="text-muted-foreground">Assigned to:</span>
                        <span className="ml-2">{report.assignedTo}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Follow-up:</span>
                      <span className="ml-2">{report.followUpRequired ? 'Required' : 'Not required'}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">View Details</Button>
                    <Button variant="outline" size="sm" className="flex-1">Add Update</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}