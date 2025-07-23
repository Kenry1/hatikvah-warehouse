import { BaseDashboard } from './BaseDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Users, MapPin, Clock, CheckCircle, AlertCircle, Coffee } from 'lucide-react';

export function EmployeeDashboard() {
  const stats = [
    { title: 'My Leave Balance', value: '18 days', description: 'Annual leave remaining', color: 'success' as const },
    { title: 'Active Projects', value: 3, description: '2 due this month', color: 'primary' as const },
    { title: 'Team Members', value: 12, description: 'In your department', color: 'primary' as const },
    { title: 'Pending Requests', value: 2, description: 'Awaiting approval', color: 'warning' as const },
  ];

  const employeeDirectory = [
    { id: '1', name: 'John Doe', role: 'ICT', department: 'Technology', status: 'Available', leaveStatus: null, location: 'Office', avatar: 'JD' },
    { id: '2', name: 'Jane Smith', role: 'Finance', department: 'Finance', status: 'On Leave', leaveStatus: 'Annual Leave', location: 'Remote', avatar: 'JS' },
    { id: '3', name: 'Mike Johnson', role: 'Project Manager', department: 'Operations', status: 'Available', leaveStatus: null, location: 'Field', avatar: 'MJ' },
    { id: '4', name: 'Sarah Wilson', role: 'HR', department: 'Human Resources', status: 'Busy', leaveStatus: null, location: 'Office', avatar: 'SW' },
    { id: '5', name: 'David Brown', role: 'Site Engineer', department: 'Engineering', status: 'On Leave', leaveStatus: 'Sick Leave', location: 'Remote', avatar: 'DB' },
    { id: '6', name: 'Lisa Garcia', role: 'Logistics', department: 'Operations', status: 'Available', leaveStatus: null, location: 'Warehouse', avatar: 'LG' },
  ];

  const myLeaveHistory = [
    { id: 'L-001', type: 'Annual Leave', startDate: '2024-03-15', endDate: '2024-03-18', days: 4, status: 'Approved', approvedBy: 'HR Manager' },
    { id: 'L-002', type: 'Sick Leave', startDate: '2024-02-10', endDate: '2024-02-12', days: 3, status: 'Approved', approvedBy: 'Direct Supervisor' },
    { id: 'L-003', type: 'Annual Leave', startDate: '2024-04-20', endDate: '2024-04-25', days: 6, status: 'Pending', approvedBy: '-' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-success text-success-foreground';
      case 'On Leave': return 'bg-warning text-warning-foreground';
      case 'Busy': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getLeaveStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-success text-success-foreground';
      case 'Pending': return 'bg-warning text-warning-foreground';
      case 'Rejected': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getLocationIcon = (location: string) => {
    switch (location) {
      case 'Office': return '🏢';
      case 'Remote': return '🏠';
      case 'Field': return '🚗';
      case 'Warehouse': return '📦';
      default: return '📍';
    }
  };

  return (
    <BaseDashboard
      title="Employee Dashboard"
      description="View team directory, manage leave requests, and track project assignments"
      stats={stats}
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Employee Directory */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Employee Directory & Leave Status
            </CardTitle>
            <CardDescription>Current status and location of all team members</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Leave Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeeDirectory.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                          {employee.avatar}
                        </div>
                        <div>
                          <p className="font-medium">{employee.name}</p>
                          <p className="text-sm text-muted-foreground">{employee.role}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{employee.department}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(employee.status)} variant="secondary">
                        {employee.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{getLocationIcon(employee.location)}</span>
                        <span className="text-sm">{employee.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {employee.leaveStatus ? (
                        <Badge variant="outline" className="text-xs">
                          {employee.leaveStatus}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common tasks and requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start h-12">
              <Calendar className="h-4 w-4 mr-3" />
              <div className="text-left">
                <p className="font-medium">Request Leave</p>
                <p className="text-xs text-muted-foreground">Submit new leave request</p>
              </div>
            </Button>
            
            <Button variant="outline" className="w-full justify-start h-12">
              <MapPin className="h-4 w-4 mr-3" />
              <div className="text-left">
                <p className="font-medium">Field Trip Request</p>
                <p className="text-xs text-muted-foreground">Request travel approval</p>
              </div>
            </Button>
            
            <Button variant="outline" className="w-full justify-start h-12">
              <Clock className="h-4 w-4 mr-3" />
              <div className="text-left">
                <p className="font-medium">Update Timesheet</p>
                <p className="text-xs text-muted-foreground">Log working hours</p>
              </div>
            </Button>
            
            <Button variant="outline" className="w-full justify-start h-12">
              <Coffee className="h-4 w-4 mr-3" />
              <div className="text-left">
                <p className="font-medium">Book Meeting Room</p>
                <p className="text-xs text-muted-foreground">Reserve conference space</p>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* My Leave History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            My Leave History
          </CardTitle>
          <CardDescription>Track your leave requests and balances</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Approved By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myLeaveHistory.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell className="font-medium">{leave.id}</TableCell>
                  <TableCell>{leave.type}</TableCell>
                  <TableCell>{leave.startDate}</TableCell>
                  <TableCell>{leave.endDate}</TableCell>
                  <TableCell className="font-semibold">{leave.days}</TableCell>
                  <TableCell>
                    <Badge className={getLeaveStatusColor(leave.status)} variant="secondary">
                      {leave.status === 'Approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {leave.status === 'Pending' && <AlertCircle className="h-3 w-3 mr-1" />}
                      {leave.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {leave.approvedBy}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">
                        View
                      </Button>
                      {leave.status === 'Pending' && (
                        <Button size="sm" variant="ghost" className="text-destructive">
                          Cancel
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </BaseDashboard>
  );
}