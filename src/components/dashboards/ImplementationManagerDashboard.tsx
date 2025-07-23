import { BaseDashboard } from './BaseDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, X, Clock, BarChart3, Fuel, Package2, DollarSign, Truck } from 'lucide-react';

export function ImplementationManagerDashboard() {
  const stats = [
    { title: 'Pending Approvals', value: 23, description: '8 urgent requests', color: 'warning' as const },
    { title: 'Approved Today', value: 15, description: '3 finance, 7 fuel, 5 material', color: 'success' as const },
    { title: 'Active Projects', value: 12, description: '4 behind schedule', color: 'primary' as const },
    { title: 'Budget Utilization', value: '78%', description: 'This quarter', color: 'primary' as const },
  ];

  const unifiedApprovals = [
    { id: 'FA001', type: 'Finance', requester: 'John Smith', amount: '$2,500', purpose: 'Equipment Purchase', priority: 'high', date: '2024-12-15' },
    { id: 'FU002', type: 'Fuel', requester: 'Sarah Johnson', amount: '$450', purpose: 'Field Trip to Site A', priority: 'medium', date: '2024-12-15' },
    { id: 'MA003', type: 'Material', requester: 'Mike Wilson', amount: '$1,200', purpose: 'FTTH Installation Supplies', priority: 'high', date: '2024-12-14' },
    { id: 'VH004', type: 'Vehicle', requester: 'Alice Cooper', amount: 'N/A', purpose: 'Site Inspection Vehicle', priority: 'medium', date: '2024-12-14' },
  ];

  const projectTracking = [
    { id: 'PRJ001', name: 'Network Expansion Phase 2', status: 'on-track', completion: 65, budget: '$450,000', spent: '$292,500' },
    { id: 'PRJ002', name: 'Safety Compliance Upgrade', status: 'delayed', completion: 40, budget: '$125,000', spent: '$75,000' },
    { id: 'PRJ003', name: 'Fleet Management System', status: 'ahead', completion: 85, budget: '$320,000', spent: '$240,000' },
  ];

  const approvalSummary = [
    { category: 'Finance', pending: 8, approved: 24, rejected: 3, total: 35 },
    { category: 'Fuel', pending: 5, approved: 18, rejected: 2, total: 25 },
    { category: 'Material', pending: 7, approved: 15, rejected: 1, total: 23 },
    { category: 'Vehicle', pending: 3, approved: 12, rejected: 0, total: 15 },
  ];

  return (
    <BaseDashboard
      title="Implementation Manager Dashboard"
      description="Unified approvals for fuel, material, finance, vehicle, and project tracking"
      stats={stats}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unified Approvals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Pending Approvals
            </CardTitle>
            <CardDescription>Review and approve various department requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {unifiedApprovals.map((approval) => (
              <div key={approval.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {approval.type === 'Finance' && <DollarSign className="h-3 w-3 mr-1" />}
                      {approval.type === 'Fuel' && <Fuel className="h-3 w-3 mr-1" />}
                      {approval.type === 'Material' && <Package2 className="h-3 w-3 mr-1" />}
                      {approval.type === 'Vehicle' && <Truck className="h-3 w-3 mr-1" />}
                      {approval.type}
                    </Badge>
                    <Badge variant={approval.priority === 'high' ? 'destructive' : 'secondary'}>
                      {approval.priority}
                    </Badge>
                  </div>
                  <p className="font-medium">{approval.purpose}</p>
                  <p className="text-sm text-muted-foreground">
                    {approval.requester} • {approval.amount} • {approval.date}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <X className="h-4 w-4" />
                  </Button>
                  <Button size="sm">
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Project Tracking UI */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Project Tracking
            </CardTitle>
            <CardDescription>Monitor project progress, budgets, and timelines</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {projectTracking.map((project) => (
              <div key={project.id} className="space-y-3 p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{project.name}</p>
                  <Badge variant={
                    project.status === 'on-track' ? 'default' :
                    project.status === 'delayed' ? 'destructive' : 'secondary'
                  }>
                    {project.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Progress</p>
                    <p className="font-medium">{project.completion}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Budget Used</p>
                    <p className="font-medium">{project.spent} / {project.budget}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Approval Summary Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Approval Summary
            </CardTitle>
            <CardDescription>Overview of approval metrics by category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {approvalSummary.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{category.category}</p>
                  <p className="text-sm text-muted-foreground">
                    {category.pending} pending • {category.approved} approved • {category.rejected} rejected
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{category.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used management tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <DollarSign className="mr-2 h-4 w-4" />
              Bulk Approve Finance Requests
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Fuel className="mr-2 h-4 w-4" />
              Fuel Allocation Report
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Package2 className="mr-2 h-4 w-4" />
              Material Usage Analytics
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <BarChart3 className="mr-2 h-4 w-4" />
              Project Performance Report
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Truck className="mr-2 h-4 w-4" />
              Vehicle Utilization Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </BaseDashboard>
  );
}