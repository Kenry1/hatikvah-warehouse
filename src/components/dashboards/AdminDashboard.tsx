import { BaseDashboard } from './BaseDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, Building, TrendingUp, Activity, DollarSign } from 'lucide-react';

export function AdminDashboard() {
  const stats = [
    { title: 'Total Users', value: 142, description: 'Across all departments', color: 'primary' as const },
    { title: 'Active Projects', value: 28, description: '85% on schedule', color: 'success' as const },
    { title: 'Monthly Revenue', value: '$2.8M', description: '12% increase', color: 'success' as const },
    { title: 'System Uptime', value: '99.8%', description: 'Last 30 days', color: 'primary' as const },
  ];

  return (
    <BaseDashboard
      title="Admin Dashboard"
      description="Summary statistics and analytics from all departments"
      stats={stats}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Department Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['ICT', 'Finance', 'HR', 'Logistics', 'Safety'].map((dept, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                  <span>{dept}</span>
                  <span className="font-medium">{Math.floor(Math.random() * 30) + 10} users</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              System Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <p className="text-2xl font-bold text-primary">15.2K</p>
                <p className="text-sm text-muted-foreground">Daily Transactions</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <p className="text-2xl font-bold text-success">$450K</p>
                <p className="text-sm text-muted-foreground">Monthly Savings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </BaseDashboard>
  );
}