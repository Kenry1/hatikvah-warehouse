import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Search, Calendar as CalendarIcon, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { LeaveRequest, addLeaveRequest, getLeaveRequestList, deleteLeaveRequest } from '@/lib/firestoreHelpers';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/navigation/LoadingSpinner';

export default function LeaveRequests() {
  const { user: currentUser } = useAuth();
  const [myRequests, setMyRequests] = useState<LeaveRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [leaveType, setLeaveType] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchLeaveRequests = async () => {
    if (!currentUser?.companyId || !currentUser.id) {
      setError("User or company information is missing.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Only fetch requests for the current user
      const fetchedRequests = await getLeaveRequestList(currentUser.id, currentUser.companyId);
      setMyRequests(fetchedRequests);
    } catch (err) {
      console.error("Failed to fetch leave requests:", err);
      setError("Failed to load leave requests.");
      toast({
        title: "Error",
        description: "Failed to load leave requests. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchLeaveRequests();
    }
  }, [currentUser]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const calculateDays = (start?: Date, end?: Date) => {
    if (start && end) {
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };

  const handleSubmitRequest = async () => {
    if (!startDate || !endDate || !leaveType || !reason) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields: Leave Type, Start Date, End Date, and Reason.",
        variant: "destructive"
      });
      return;
    }

    if (!currentUser || !currentUser.id || !currentUser.username || typeof currentUser.department !== 'string' || !currentUser.companyId) {
       toast({
        title: "User Information Missing",
        description: "Your user profile is incomplete. Please contact support.",
        variant: "destructive",
      });
      return;
    }

    const days = calculateDays(startDate, endDate);
    if (days <= 0) {
      toast({
        title: "Invalid Dates",
        description: "End date must be on or after start date.",
        variant: "destructive"
      });
      return;
    }

    try {
      await addLeaveRequest({
        employeeId: currentUser.id,
        employeeName: currentUser.username,
        department: currentUser.department,
        leaveType: leaveType,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        days: days,
        reason: reason,
        status: 'pending',
        companyId: currentUser.companyId,
      });
      toast({
        title: "Leave Request Submitted",
        description: "Your leave request has been submitted for approval.",
      });
      setIsAddDialogOpen(false);
      setStartDate(undefined);
      setEndDate(undefined);
      setLeaveType('');
      setReason('');
      fetchLeaveRequests(); // Re-fetch requests to show the new one
    } catch (err) {
      console.error("Error submitting leave request:", err);
      toast({
        title: "Error",
        description: "Failed to submit leave request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    if (!requestId) return;
    try {
      await deleteLeaveRequest(requestId);
      toast({
        title: "Leave Request Cancelled",
        description: "Your leave request has been successfully cancelled.",
      });
      fetchLeaveRequests(); // Refresh the list of requests
    } catch (err) {
      console.error("Error cancelling leave request:", err);
      toast({
        title: "Error",
        description: "Failed to cancel leave request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredRequests = myRequests.filter(request => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (request.employeeName && request.employeeName.toLowerCase().includes(searchLower)) ||
      (request.department && request.department.toLowerCase().includes(searchLower)) ||
      (request.leaveType && request.leaveType.toLowerCase().includes(searchLower)) ||
      (request.reason && request.reason.toLowerCase().includes(searchLower));
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Leave Requests</h1>
          <p className="text-muted-foreground">Submit and manage your leave requests</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Request Leave
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Submit Leave Request</DialogTitle>
              <DialogDescription>
                Fill in the details for your leave request.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leaveType">Leave Type</Label>
                  <Select value={leaveType} onValueChange={setLeaveType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Annual Leave">Annual Leave</SelectItem>
                      <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                      <SelectItem value="Personal Leave">Personal Leave</SelectItem>
                      <SelectItem value="Maternity Leave">Maternity Leave</SelectItem>
                      <SelectItem value="Emergency Leave">Emergency Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <div className="text-sm text-muted-foreground">
                    {calculateDays(startDate, endDate) > 0
                      ? `${calculateDays(startDate, endDate)} days`
                      : 'Select dates to calculate'
                    }
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Leave</Label>
                <Textarea
                  id="reason"
                  placeholder="Please provide a brief reason for your leave request..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
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

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search my requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <UserIcon className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{request.leaveType}</CardTitle>
                      <CardDescription>
                        {format(new Date(request.startDate), "MMM dd")} - {format(new Date(request.endDate), "MMM dd, yyyy")}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={getStatusColor(request.status)}>
                    <span className="capitalize">{request.status}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="ml-2 font-medium">{request.days} days</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Applied:</span>
                    <span className="ml-2">{request.appliedDate ? format(new Date(request.appliedDate.toDate()), "MMM dd, yyyy") : 'N/A'}</span>
                  </div>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Reason:</span>
                  <p className="mt-1">{request.reason}</p>
                </div>
                {request.status === 'pending' && (
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">Edit</Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleCancelRequest(request.id!)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-8 text-muted-foreground">
              You have not submitted any leave requests yet.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}