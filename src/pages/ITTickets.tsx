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
import { Plus, Search, Monitor, AlertCircle, CheckCircle, Clock, Zap, Settings } from 'lucide-react';
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
    description: 'Unable to send or receive emails since this morning. Getting timeout errors.',
    category: 'Email & Communication',
    priority: 'high',
    status: 'in-progress',
    requester: 'John Smith',
    assignedTo: 'IT Support Team',
    createdDate: '2024-07-20T09:30:00',
    updatedDate: '2024-07-20T10:15:00',
    dueDate: '2024-07-20T17:00:00'
  },
  {
    id: 'TKT-002',
    title: 'Need software installation',
    description: 'Request to install Adobe Creative Suite on my workstation for design work.',
    category: 'Software',
    priority: 'medium',
    status: 'open',
    requester: 'Sarah Johnson',
    createdDate: '2024-07-19T14:20:00',
    updatedDate: '2024-07-19T14:20:00'
  },
  {
    id: 'TKT-003',
    title: 'Printer not working',
    description: 'Office printer showing paper jam error but no paper is jammed.',
    category: 'Hardware',
    priority: 'low',
    status: 'resolved',
    requester: 'Mike Wilson',
    assignedTo: 'Hardware Support',
    createdDate: '2024-07-18T11:45:00',
    updatedDate: '2024-07-19T09:30:00'
  }
];

export default function ITTickets() {
  const [tickets, setTickets] = useState<ITTicket[]>(mockTickets);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
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
                         ticket.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleSubmitTicket = () => {
    toast({
      title: "IT Ticket Created",
      description: "Your support ticket has been submitted successfully.",
    });
    setIsAddDialogOpen(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'hardware':
        return <Monitor className="h-4 w-4" />;
      case 'software':
        return <Settings className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">IT Support Tickets</h1>
          <p className="text-muted-foreground">Create and track IT support requests</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create IT Support Ticket</DialogTitle>
              <DialogDescription>
                Describe your technical issue and we'll help you resolve it.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Issue Title</Label>
                <Input 
                  id="title" 
                  placeholder="Brief description of the problem"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hardware">Hardware</SelectItem>
                      <SelectItem value="software">Software</SelectItem>
                      <SelectItem value="network">Network & Internet</SelectItem>
                      <SelectItem value="email">Email & Communication</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="access">Access & Permissions</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
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
                <Label htmlFor="description">Detailed Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Please provide detailed information about the issue, including any error messages and steps to reproduce..."
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="environment">Environment Details</Label>
                <Textarea 
                  id="environment" 
                  placeholder="Operating system, browser, software versions, etc."
                  rows={2}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSubmitTicket} className="flex-1">Create Ticket</Button>
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
            placeholder="Search tickets..."
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
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
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

      <Tabs defaultValue="my-tickets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="my-tickets">My Tickets</TabsTrigger>
        </TabsList>

        <TabsContent value="my-tickets" className="space-y-4">
          <div className="grid gap-4">
            {filteredTickets.map((ticket) => (
              <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(ticket.category)}
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {ticket.title}
                          <span className="text-sm font-normal text-muted-foreground">#{ticket.id}</span>
                        </CardTitle>
                        <CardDescription>{ticket.category}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {getPriorityIcon(ticket.priority)}
                        <span className="ml-1 capitalize">{ticket.priority}</span>
                      </Badge>
                      <Badge className={getStatusColor(ticket.status)}>
                        {getStatusIcon(ticket.status)}
                        <span className="ml-1 capitalize">{ticket.status.replace('-', ' ')}</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{ticket.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Created:</span>
                      <span className="ml-2">{format(new Date(ticket.createdDate), "MMM dd, yyyy HH:mm")}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Updated:</span>
                      <span className="ml-2">{format(new Date(ticket.updatedDate), "MMM dd, yyyy HH:mm")}</span>
                    </div>
                    {ticket.assignedTo && (
                      <div>
                        <span className="text-muted-foreground">Assigned to:</span>
                        <span className="ml-2">{ticket.assignedTo}</span>
                      </div>
                    )}
                    {ticket.dueDate && (
                      <div>
                        <span className="text-muted-foreground">Due:</span>
                        <span className="ml-2">{format(new Date(ticket.dueDate), "MMM dd, HH:mm")}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">View Details</Button>
                    <Button variant="outline" size="sm" className="flex-1">Add Comment</Button>
                    {ticket.status === 'resolved' && (
                      <Button variant="default" size="sm" className="flex-1">Close Ticket</Button>
                    )}
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