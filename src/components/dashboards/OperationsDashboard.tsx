import { BaseDashboard } from './BaseDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Package, Truck, Users, MapPin, Clock, AlertTriangle } from 'lucide-react';

export function OperationsDashboard() {
  const stats = [
    { title: 'Active Projects', value: 18, description: '6 critical priority', color: 'warning' as const },
    { title: 'Inventory Value', value: '$2.4M', description: 'Current stock value', color: 'success' as const },
    { title: 'Vehicles Available', value: 32, description: 'Ready for assignment', color: 'success' as const },
    { title: 'Employees on Leave', value: 9, description: 'Out today', color: 'primary' as const },
  ];

  const projects = [
    { id: 'PRJ001', name: 'Site Expansion Alpha', progress: 75, deadline: '2024-12-30', priority: 'high', manager: 'Alice Cooper' },
    { id: 'PRJ002', name: 'Network Infrastructure', progress: 45, deadline: '2024-12-25', priority: 'critical', manager: 'Bob Martin' },
    { id: 'PRJ003', name: 'Safety Compliance Audit', progress: 90, deadline: '2024-12-20', priority: 'medium', manager: 'Carol White' },
  ];

  const inventoryItems = [
    { category: 'FTTH Equipment', value: '$450,000', items: 342, lowStock: 12 },
    { category: 'Safety Gear', value: '$125,000', items: 156, lowStock: 5 },
    { category: 'Company Assets', value: '$1,200,000', items: 89, lowStock: 2 },
    { category: 'FTTX Components', value: '$680,000', items: 234, lowStock: 8 },
  ];

  const vehicleStatus = [
    { status: 'Assigned', count: 28, color: 'bg-primary' },
    { status: 'Available', count: 15, color: 'bg-success' },
    { status: 'Maintenance', count: 8, color: 'bg-warning' },
    { status: 'Out of Service', count: 3, color: 'bg-destructive' },
  ];

  const employeeLeave = [
    { name: 'John Smith', department: 'Logistics', type: 'Annual Leave', duration: '3 days', return: '2024-12-18' },
    { name: 'Sarah Johnson', department: 'Finance', type: 'Sick Leave', duration: '2 days', return: '2024-12-16' },
    { name: 'Mike Wilson', department: 'ICT', type: 'Personal Leave', duration: '1 day', return: '2024-12-15' },
  ];

  return (
    <BaseDashboard
      title="Operations Dashboard"
      description="Oversee projects, inventory, vehicles, and workforce"
      stats={stats}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Dashboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Project Dashboard
            </CardTitle>
            <CardDescription>Monitor project progress and deadlines</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="space-y-3 p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <p className="text-sm text-muted-foreground">Manager: {project.manager}</p>
                  </div>
                  <Badge variant={
                    project.priority === 'critical' ? 'destructive' :
                    project.priority === 'high' ? 'secondary' : 'default'
                  }>
                    {project.priority}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} />
                  <p className="text-xs text-muted-foreground">
                    <Clock className="inline h-3 w-3 mr-1" />
                    Due: {project.deadline}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Inventory Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Inventory Overview
            </CardTitle>
            <CardDescription>Track stock levels and reorder points</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {inventoryItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{item.category}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.items} items • {item.value}
                  </p>
                  {item.lowStock > 0 && (
                    <p className="text-xs text-warning flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {item.lowStock} items low stock
                    </p>
                  )}
                </div>
                <Button size="sm" variant="outline">View</Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Vehicle Status Tracker */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Vehicle Status Tracker
            </CardTitle>
            <CardDescription>Monitor fleet status and assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {vehicleStatus.map((status, index) => (
                  <div key={index} className="text-center p-3 border rounded-lg">
                    <p className="text-2xl font-bold">{status.count}</p>
                    <p className="text-sm text-muted-foreground">{status.status}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Truck className="mr-2 h-4 w-4" />
                  View Fleet Details
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MapPin className="mr-2 h-4 w-4" />
                  Vehicle Locations
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employee Leave Tracker */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Employee Leave Tracker
            </CardTitle>
            <CardDescription>Current employee absences and returns</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {employeeLeave.map((leave, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{leave.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {leave.department} • {leave.type}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {leave.duration} • Returns: {leave.return}
                  </p>
                </div>
                <Badge variant="secondary">Away</Badge>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              <Users className="mr-2 h-4 w-4" />
              View All Employees
            </Button>
          </CardContent>
        </Card>
      </div>
    </BaseDashboard>
  );
}