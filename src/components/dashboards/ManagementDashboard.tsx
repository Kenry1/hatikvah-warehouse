import { BaseDashboard } from './BaseDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Truck, 
  Package, 
  Shield, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Building2,
  Calendar,
  FileText
} from 'lucide-react';

export function ManagementDashboard() {
  const stats = [
    { title: 'Total Employees', value: 247, description: '12 new this month', color: 'primary' as const },
    { title: 'Active Projects', value: 18, description: '3 critical, 5 on-track', color: 'warning' as const },
    { title: 'Monthly Revenue', value: '$2.4M', description: '+12% from last month', color: 'success' as const },
    { title: 'System Efficiency', value: '94%', description: 'All departments operational', color: 'success' as const },
  ];

  const departmentMetrics = [
    { 
      department: 'Finance', 
      efficiency: 92, 
      pendingRequests: 8, 
      completedToday: 15, 
      budget: '$450K',
      status: 'excellent' 
    },
    { 
      department: 'Logistics', 
      efficiency: 88, 
      pendingRequests: 5, 
      completedToday: 12, 
      budget: '$320K',
      status: 'good' 
    },
    { 
      department: 'Operations', 
      efficiency: 95, 
      pendingRequests: 3, 
      completedToday: 18, 
      budget: '$280K',
      status: 'excellent' 
    },
    { 
      department: 'HR', 
      efficiency: 85, 
      pendingRequests: 12, 
      completedToday: 8, 
      budget: '$180K',
      status: 'attention' 
    },
    { 
      department: 'Safety', 
      efficiency: 98, 
      pendingRequests: 2, 
      completedToday: 6, 
      budget: '$95K',
      status: 'excellent' 
    },
    { 
      department: 'ICT', 
      efficiency: 91, 
      pendingRequests: 7, 
      completedToday: 11, 
      budget: '$220K',
      status: 'good' 
    },
  ];

  const resourceAllocation = [
    { resource: 'Vehicle Fleet', total: 45, available: 12, inUse: 28, maintenance: 5 },
    { resource: 'Equipment', total: 230, available: 45, inUse: 175, maintenance: 10 },
    { resource: 'Personnel', total: 247, available: 38, inUse: 204, leave: 5 },
    { resource: 'Budget', total: 100, available: 22, allocated: 68, pending: 10 },
  ];

  const criticalAlerts = [
    { id: 1, type: 'Budget', message: 'Q4 budget utilization at 89%', priority: 'high', department: 'Finance' },
    { id: 2, type: 'Safety', message: '3 vehicles overdue for inspection', priority: 'high', department: 'Safety' },
    { id: 3, type: 'HR', message: '12 leave requests pending approval', priority: 'medium', department: 'HR' },
    { id: 4, type: 'Project', message: 'Network expansion 2 weeks behind', priority: 'high', department: 'Operations' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'attention': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent': return 'default';
      case 'good': return 'secondary';
      case 'attention': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <BaseDashboard
      title="Management Dashboard"
      description="Executive overview of all departments and company-wide analytics"
      stats={stats}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Department Performance Overview */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Department Performance
            </CardTitle>
            <CardDescription>Real-time efficiency metrics across all departments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {departmentMetrics.map((dept) => (
              <div key={dept.department} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{dept.department}</h4>
                    <Badge variant={getStatusBadge(dept.status) as any}>
                      {dept.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Pending</p>
                      <p className="font-medium">{dept.pendingRequests}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Completed</p>
                      <p className="font-medium">{dept.completedToday}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Budget</p>
                      <p className="font-medium">{dept.budget}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <p className={`text-2xl font-bold ${getStatusColor(dept.status)}`}>
                    {dept.efficiency}%
                  </p>
                  <Progress value={dept.efficiency} className="w-20" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Critical Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Critical Alerts
            </CardTitle>
            <CardDescription>Items requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {criticalAlerts.map((alert) => (
              <div key={alert.id} className="p-3 border rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={alert.priority === 'high' ? 'destructive' : 'secondary'}>
                    {alert.priority}
                  </Badge>
                  <Badge variant="outline">{alert.department}</Badge>
                </div>
                <p className="text-sm font-medium">{alert.message}</p>
                <Button size="sm" variant="outline" className="w-full">
                  View Details
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Resource Allocation */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Resource Allocation
            </CardTitle>
            <CardDescription>Company-wide resource utilization overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {resourceAllocation.map((resource) => (
              <div key={resource.resource} className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{resource.resource}</h4>
                  <span className="text-sm text-muted-foreground">Total: {resource.total}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-green-600 font-bold text-lg">{resource.available}</p>
                    <p className="text-muted-foreground">Available</p>
                  </div>
                  <div className="text-center">
                    <p className="text-blue-600 font-bold text-lg">{resource.inUse}</p>
                    <p className="text-muted-foreground">In Use</p>
                  </div>
                  <div className="text-center">
                    <p className="text-yellow-600 font-bold text-lg">
                      {resource.resource === 'Budget' ? resource.pending : 
                       resource.resource === 'Personnel' ? resource.leave : resource.maintenance}
                    </p>
                    <p className="text-muted-foreground">
                      {resource.resource === 'Budget' ? 'Pending' : 
                       resource.resource === 'Personnel' ? 'On Leave' : 'Maintenance'}
                    </p>
                  </div>
                </div>
                <Progress 
                  value={(resource.inUse / resource.total) * 100} 
                  className="h-2" 
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Executive Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Executive Actions
            </CardTitle>
            <CardDescription>Quick access to management tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <BarChart3 className="mr-2 h-4 w-4" />
              Generate Department Report
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <DollarSign className="mr-2 h-4 w-4" />
              Financial Analytics
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Workforce Analytics
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <TrendingUp className="mr-2 h-4 w-4" />
              Performance Trends
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Compliance Dashboard
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="mr-2 h-4 w-4" />
              Strategic Planning
            </Button>
          </CardContent>
        </Card>
      </div>
    </BaseDashboard>
  );
}