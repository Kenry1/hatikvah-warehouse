import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Monitor, AlertCircle, CheckCircle, Clock, Zap, Settings, UserPlus, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface ITTicket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'pending' | 'resolved' | 'closed';
  requester: string;
  assignedTo?: string;
  createdDate: string;
  updatedDate: string;
  dueDate?: string;
}

const mockTickets: ITTicket[] = [
  {
    id: 'TKT-001',
    title: 'Email server not responding',
    description: 'User unable to send or receive emails since this morning. Getting timeout errors and emails are stuck in outbox.',
    category: 'Email & Communication',
    priority: 'high',
    status: 'open',
    requester: 'John Smith',
    createdDate: '2024-07-20T09:30:00',
  },
  {
    id: 'TKT-002',
    title: 'Need software installation',
    description: 'Request to install Adobe Creative Suite on my workstation for design work. Licensing details are attached.',
    category: 'Software',
    priority: 'medium',
    status: 'open',
    requester: 'Sarah Johnson',
    createdDate: '2024-07-19T14:20:00',
  },
  {
    id: 'TKT-003',
    title: 'Printer not working',
    description: 'Office printer showing paper jam error but no paper is jammed. Model: XYZ-123. Location: 3rd Floor, near conference room.',
    category: 'Hardware',
    priority: 'low',
    status: 'resolved',
    requester: 'Mike Wilson',
    assignedTo: 'Hardware Support',
    createdDate: '2024-07-18T11:45:00',
    updatedDate: '2024-07-19T09:30:00'
  },
  {
    id: 'TKT-004',
    title: 'New employee laptop setup',
    description: 'New hire, Emily White, needs a laptop with standard software installed. Please configure with Windows 11, Office 365, and VPN client.',
    category: 'Hardware',
    priority: 'medium',
    status: 'open',
    requester: 'HR Department',
    createdDate: '2024-07-21T10:00:00',
  },
  {
    id: 'TKT-005',
    title: 'Network drive access issue',
    description: 'User unable to access shared network drive. Error message: \'Access Denied\'. User: David Lee. Drive: P: drive.',
    category: 'Network & Internet',
    priority: 'high',
    status: 'pending',
    requester: 'David Lee',
    createdDate: '2024-07-20T16:00:00',
  }
];

const mockITPersonnel = [
  'Alice Green',
  'Bob White',
  'Charlie Black',
  'Diana Yellow',
];

export default function IncomingTickets() {
  const [tickets, setTickets] = useState<ITTicket[]>(mockTickets);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<ITTicket | null>(null);
  const [assignee, setAssignee] = useState<string>('');
  const { toast } = useToast();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Zap className="h-3 w-3" />;
      case 'high':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.requester.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'hardware':
        return <Monitor className="h-4 w-4" />;
      case 'software':
        return <Settings className="h-4 w-4" />;
      case 'email & communication':
        return <Mail className="h-4 w-4" />;
      case 'network & internet':
        return <Wifi className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const handleViewClick = (ticket: ITTicket) => {
    setSelectedTicket(ticket);
    setIsViewModalOpen(true);
  };

  const handleAssignClick = (ticket: ITTicket) => {
    setSelectedTicket(ticket);
    setAssignee(ticket.assignedTo || ''); // Pre-fill if already assigned
    setIsAssignModalOpen(true);
  };

  const handleAssignTicket = () => {
    if (selectedTicket && assignee) {
      setTickets(tickets.map(ticket => 
        ticket.id === selectedTicket.id 
          ? { ...ticket, assignedTo: assignee, status: 'in-progress', updatedDate: new Date().toISOString() }
          : ticket
      ));
      toast({
        title: "Ticket Assigned",
        description: `Ticket ${selectedTicket.id} has been assigned to ${assignee}.`,
      });
      setIsAssignModalOpen(false);
      setSelectedTicket(null);
      setAssignee('');
    } else {
      toast({
        title: "Error",
        description: "Please select an assignee.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Incoming IT Tickets</h1>
          <p className="text-muted-foreground text-sm md:text-base">Manage all support tickets submitted by users</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Filter by Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Incoming Tickets</CardTitle>
          <CardDescription>Comprehensive list of all support tickets.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Ticket ID</th>
                  <th className="text-left p-3">Title</th>
                  <th className="text-left p-3">Requester</th>
                  <th className="text-left p-3">Category</th>
                  <th className="text-left p-3">Priority</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Created</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.length > 0 ? (
                  filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{ticket.id}</td>
                      <td className="p-3">{ticket.title}</td>
                      <td className="p-3">{ticket.requester}</td>
                      <td className="p-3">{ticket.category}</td>
                      <td className="p-3">
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {getPriorityIcon(ticket.priority)}
                          <span className="ml-1 capitalize">{ticket.priority}</span>
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge className={getStatusColor(ticket.status)}>
                          {getStatusIcon(ticket.status)}
                          <span className="ml-1 capitalize">{ticket.status.replace('-', ' ')}</span>
                        </Badge>
                      </td>
                      <td className="p-3">{format(new Date(ticket.createdDate), "MMM dd")}</td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleViewClick(ticket)}>
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleAssignClick(ticket)}>
                            <UserPlus className="h-4 w-4 mr-1" /> Assign
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-3 text-center text-muted-foreground">
                      No incoming IT tickets found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* View Ticket Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Ticket Details: {selectedTicket?.id}</DialogTitle>
            <DialogDescription>
              Comprehensive details of the selected IT support ticket.
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Title</Label>
                <Input id="title" value={selectedTicket.title} className="col-span-3" readOnly />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="requester" className="text-right">Requester</Label>
                <Input id="requester" value={selectedTicket.requester} className="col-span-3" readOnly />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Category</Label>
                <Input id="category" value={selectedTicket.category} className="col-span-3" readOnly />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="priority" className="text-right">Priority</Label>
                <Input id="priority" value={selectedTicket.priority} className="col-span-3 capitalize" readOnly />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Status</Label>
                <Input id="status" value={selectedTicket.status.replace('-', ' ')} className="col-span-3 capitalize" readOnly />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="assignedTo" className="text-right">Assigned To</Label>
                <Input id="assignedTo" value={selectedTicket.assignedTo || 'Not Assigned'} className="col-span-3" readOnly />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="createdDate" className="text-right">Created Date</Label>
                <Input id="createdDate" value={format(new Date(selectedTicket.createdDate), "MMM dd, yyyy HH:mm")} className="col-span-3" readOnly />
              </div>
              {selectedTicket.updatedDate && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="updatedDate" className="text-right">Last Updated</Label>
                  <Input id="updatedDate" value={format(new Date(selectedTicket.updatedDate), "MMM dd, yyyy HH:mm")} className="col-span-3" readOnly />
                </div>
              )}
              {selectedTicket.dueDate && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dueDate" className="text-right">Due Date</Label>
                  <Input id="dueDate" value={format(new Date(selectedTicket.dueDate), "MMM dd, yyyy HH:mm")} className="col-span-3" readOnly />
                </div>
              )}
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right mt-2">Description</Label>
                <Textarea id="description" value={selectedTicket.description} className="col-span-3 resize-none" readOnly rows={5} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Ticket Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign Ticket: {selectedTicket?.id}</DialogTitle>
            <DialogDescription>
              Assign this IT ticket to a support personnel.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="assignee" className="text-right">Assign To</Label>
              <Select onValueChange={setAssignee} value={assignee} >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select personnel" />
                </SelectTrigger>
                <SelectContent>
                  {mockITPersonnel.map((personnel) => (
                    <SelectItem key={personnel} value={personnel}>{personnel}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAssignTicket}>Assign Ticket</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}