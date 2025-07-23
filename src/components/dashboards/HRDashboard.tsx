import { BaseDashboard } from './BaseDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, MapPin, BarChart3, Clock, CheckCircle } from 'lucide-react';

export function HRDashboard() {
  const stats = [
    { title: 'Leave Requests', value: 15, description: '8 pending approval', color: 'warning' as const },
    { title: 'Active Employees', value: 142, description: '5 new this month', color: 'success' as const },
    { title: 'Field Trip Requests', value: 7, description: '3 approved today', color: 'primary' as const },
    { title: 'Training Sessions', value: 12, description: 'Scheduled this month', color: 'primary' as const },
  ];

  const pendingLeaveRequests = [
    { id: 1, employee: 'John Smith', type: 'Annual Leave', dates: 'Dec 15-20', days: 5, status: 'pending' },
    { id: 2, employee: 'Sarah Johnson', type: 'Sick Leave', dates: 'Dec 12-13', days: 2, status: 'pending' },
    { id: 3, employee: 'Mike Wilson', type: 'Personal Leave', dates: 'Dec 18', days: 1, status: 'pending' },
  ];

  const fieldTripRequests = [
    { id: 1, employee: 'Alex Brown', destination: 'Client Site A', date: 'Dec 15', purpose: 'System Installation' },
    { id: 2, employee: 'Lisa Davis', destination: 'Remote Office', date: 'Dec 18', purpose: 'Staff Training' },
    { id: 3, employee: 'Tom Harris', destination: 'Conference Center', date: 'Dec 20', purpose: 'Industry Conference' },
  ];

  return (
    <BaseDashboard
      title="HR Dashboard"
      description="Manage employee leaves, field trips, and human resources"
      stats={stats}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave Request Handler */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Leave Requests
            </CardTitle>
            <CardDescription>Review and approve employee leave requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingLeaveRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{request.employee}</p>
                  <p className="text-sm text-muted-foreground">{request.type} • {request.dates} ({request.days} days)</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Reject</Button>
                  <Button size="sm">Approve</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Field Trip Approvals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Field Trip Approvals
            </CardTitle>
            <CardDescription>Process travel and field work requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fieldTripRequests.map((trip) => (
              <div key={trip.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{trip.employee}</p>
                  <p className="text-sm text-muted-foreground">{trip.destination} • {trip.date}</p>
                  <p className="text-xs text-muted-foreground">{trip.purpose}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Decline</Button>
                  <Button size="sm">Approve</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Employee Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Employee Analytics
            </CardTitle>
            <CardDescription>Workforce analytics and reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">89%</p>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-success">4.2</p>
                <p className="text-sm text-muted-foreground">Avg. Performance</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-warning">12</p>
                <p className="text-sm text-muted-foreground">Training Hours</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">95%</p>
                <p className="text-sm text-muted-foreground">Satisfaction</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Global Employee List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Employee Directory & Leave Status
            </CardTitle>
            <CardDescription>Global employee list with leave indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Alice Cooper', department: 'ICT', status: 'Available' },
                { name: 'Bob Martin', department: 'Finance', status: 'On Leave' },
                { name: 'Carol White', department: 'Logistics', status: 'Field Trip' },
                { name: 'David Kim', department: 'Safety', status: 'Available' },
              ].map((employee, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{employee.name}</p>
                    <p className="text-sm text-muted-foreground">{employee.department}</p>
                  </div>
                  <Badge variant={employee.status === 'Available' ? 'default' : 'secondary'}>
                    {employee.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </BaseDashboard>
  );
}