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
import { Plus, Search, DollarSign, Calendar, FileText, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface FinanceRequest {
  id: string;
  requestType: string;
  amount: number;
  currency: string;
  requester: string;
  department: string;
  description: string;
  category: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  requestDate: string;
  expectedDate?: string;
}

const mockFinanceRequests: FinanceRequest[] = [
  {
    id: '1',
    requestType: 'Purchase Order',
    amount: 5000,
    currency: 'USD',
    requester: 'John Smith',
    department: 'ICT',
    description: 'New laptops for development team',
    category: 'Equipment',
    urgency: 'medium',
    status: 'pending',
    requestDate: '2024-07-20',
    expectedDate: '2024-08-15'
  },
  {
    id: '2',
    requestType: 'Expense Reimbursement',
    amount: 250,
    currency: 'USD',
    requester: 'Sarah Johnson',
    department: 'Sales',
    description: 'Client dinner and transportation',
    category: 'Travel & Entertainment',
    urgency: 'low',
    status: 'approved',
    requestDate: '2024-07-18'
  },
  {
    id: '3',
    requestType: 'Budget Allocation',
    amount: 15000,
    currency: 'USD',
    requester: 'Mike Wilson',
    department: 'Operations',
    description: 'Q4 marketing campaign budget',
    category: 'Marketing',
    urgency: 'high',
    status: 'processing',
    requestDate: '2024-07-19',
    expectedDate: '2024-08-01'
  }
];

export default function FinanceRequests() {
  const [requests, setRequests] = useState<FinanceRequest[]>(mockFinanceRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmitRequest = () => {
    toast({
      title: "Finance Request Submitted",
      description: "Your finance request has been submitted for approval.",
    });
    setIsAddDialogOpen(false);
  };

  const totalPendingAmount = requests
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalApprovedAmount = requests
    .filter(r => r.status === 'approved')
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Finance Requests</h1>
          <p className="text-muted-foreground">Submit and manage financial requests and approvals</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Submit Finance Request</DialogTitle>
              <DialogDescription>
                Fill in the details for your financial request.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="requestType">Request Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select request type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="purchase">Purchase Order</SelectItem>
                      <SelectItem value="expense">Expense Reimbursement</SelectItem>
                      <SelectItem value="budget">Budget Allocation</SelectItem>
                      <SelectItem value="advance">Cash Advance</SelectItem>
                      <SelectItem value="payment">Vendor Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="travel">Travel & Entertainment</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="office">Office Supplies</SelectItem>
                      <SelectItem value="training">Training & Development</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgency</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Provide detailed description of the financial request..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="justification">Business Justification</Label>
                <Textarea 
                  id="justification" 
                  placeholder="Explain why this expense is necessary for business operations..."
                  rows={2}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSubmitRequest} className="flex-1">Submit Request</Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {requests.filter(r => r.status === 'pending').length} requests
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved This Month</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalApprovedAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {requests.filter(r => r.status === 'approved').length} requests
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {requests.filter(r => r.status === 'processing').length}
            </div>
            <p className="text-xs text-muted-foreground">In review</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Processing</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2</div>
            <p className="text-xs text-muted-foreground">Days</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search requests..."
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
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="my-requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="my-requests">My Requests</TabsTrigger>
          <TabsTrigger value="all-requests">All Requests</TabsTrigger>
          <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
        </TabsList>

        <TabsContent value="my-requests" className="space-y-4">
          <div className="grid gap-4">
            {filteredRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle className="text-lg">{request.requestType}</CardTitle>
                        <CardDescription>{request.category}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getUrgencyColor(request.urgency)}>
                        <span className="capitalize">{request.urgency}</span>
                      </Badge>
                      <Badge className={getStatusColor(request.status)}>
                        <span className="capitalize">{request.status}</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">${request.amount.toLocaleString()} {request.currency}</span>
                    <span className="text-sm text-muted-foreground">
                      Requested: {format(new Date(request.requestDate), "MMM dd, yyyy")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{request.description}</p>
                  {request.expectedDate && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Expected by:</span>
                      <span className="ml-2">{format(new Date(request.expectedDate), "MMM dd, yyyy")}</span>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">View Details</Button>
                    {request.status === 'pending' && (
                      <Button variant="destructive" size="sm" className="flex-1">Cancel</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all-requests">
          <Card>
            <CardHeader>
              <CardTitle>All Finance Requests</CardTitle>
              <CardDescription>Complete overview of all financial requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Requester</th>
                      <th className="text-left p-3">Type</th>
                      <th className="text-left p-3">Amount</th>
                      <th className="text-left p-3">Category</th>
                      <th className="text-left p-3">Urgency</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Date</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request) => (
                      <tr key={request.id} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-medium">{request.requester}</td>
                        <td className="p-3">{request.requestType}</td>
                        <td className="p-3 font-medium">${request.amount.toLocaleString()}</td>
                        <td className="p-3">{request.category}</td>
                        <td className="p-3">
                          <Badge className={getUrgencyColor(request.urgency)}>
                            <span className="capitalize">{request.urgency}</span>
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge className={getStatusColor(request.status)}>
                            <span className="capitalize">{request.status}</span>
                          </Badge>
                        </td>
                        <td className="p-3">{format(new Date(request.requestDate), "MMM dd")}</td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">View</Button>
                            <Button variant="ghost" size="sm">Process</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>Requests awaiting your approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRequests.filter(r => r.status === 'pending').map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{request.requestType}</h4>
                        <p className="text-sm text-muted-foreground">{request.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">${request.amount.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">{request.requester}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">Approve</Button>
                      <Button variant="outline" size="sm" className="flex-1">Request More Info</Button>
                      <Button variant="destructive" size="sm" className="flex-1">Reject</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}