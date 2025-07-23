import { BaseDashboard } from './BaseDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, TrendingUp, Package, Building2, FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export function FinanceDashboard() {
  const stats = [
    { title: 'Pending Approvals', value: 12, description: '8 finance, 4 procurement', color: 'warning' as const },
    { title: 'Monthly Budget', value: '$125,000', description: '68% utilized', color: 'success' as const },
    { title: 'Outstanding Invoices', value: 7, description: 'Total: $45,230', color: 'destructive' as const },
    { title: 'Approved Requests', value: 89, description: 'This month', color: 'primary' as const },
  ];

  const financeRequests = [
    { id: 'FR-001', type: 'Equipment Purchase', amount: '$15,000', department: 'ICT', status: 'Pending', priority: 'High', submittedBy: 'John Doe', date: '2024-01-15' },
    { id: 'FR-002', type: 'Travel Expenses', amount: '$2,500', department: 'Sales', status: 'Approved', priority: 'Medium', submittedBy: 'Jane Smith', date: '2024-01-14' },
    { id: 'FR-003', type: 'Office Supplies', amount: '$850', department: 'HR', status: 'Under Review', priority: 'Low', submittedBy: 'Mike Johnson', date: '2024-01-13' },
    { id: 'FR-004', type: 'Software License', amount: '$5,200', department: 'ICT', status: 'Pending', priority: 'High', submittedBy: 'Sarah Wilson', date: '2024-01-12' },
  ];

  const warehouseInventory = [
    { item: 'Fiber Optic Cables', category: 'FTTH', stock: 250, unit: 'meters', value: '$12,500', status: 'In Stock' },
    { item: 'Network Switches', category: 'FTTX', stock: 15, unit: 'units', value: '$4,500', status: 'Low Stock' },
    { item: 'Safety Helmets', category: 'Safety', stock: 85, unit: 'pieces', value: '$2,125', status: 'In Stock' },
    { item: 'Cable Splitters', category: 'FTTH', stock: 5, unit: 'units', value: '$750', status: 'Critical' },
  ];

  const procurementResources = [
    { supplier: 'TechSupply Co.', category: 'Network Equipment', rating: 4.8, contracts: 12, totalValue: '$125,000' },
    { supplier: 'SafetyFirst Ltd.', category: 'Safety Equipment', rating: 4.6, contracts: 8, totalValue: '$85,000' },
    { supplier: 'FiberNet Solutions', category: 'Fiber Optics', rating: 4.9, contracts: 15, totalValue: '$200,000' },
    { supplier: 'OfficeMax Pro', category: 'Office Supplies', rating: 4.2, contracts: 25, totalValue: '$45,000' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock className="h-4 w-4 text-warning" />;
      case 'Approved': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'Under Review': return <AlertTriangle className="h-4 w-4 text-primary" />;
      default: return null;
    }
  };

  const getStockStatus = (status: string) => {
    switch (status) {
      case 'In Stock': return 'bg-success text-success-foreground';
      case 'Low Stock': return 'bg-warning text-warning-foreground';
      case 'Critical': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <BaseDashboard
      title="Finance Dashboard"
      description="Financial approvals, budget tracking, and procurement oversight"
      stats={stats}
    >
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Finance Request Approvals */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Finance Request Approvals
            </CardTitle>
            <CardDescription>Review and approve departmental finance requests</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {financeRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.id}</TableCell>
                    <TableCell>{request.type}</TableCell>
                    <TableCell className="font-semibold text-success">{request.amount}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{request.department}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        <span>{request.status}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {request.status === 'Pending' && (
                          <>
                            <Button size="sm" variant="outline" className="text-success border-success">
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" className="text-destructive border-destructive">
                              Reject
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="ghost">
                          View Details
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Warehouse Inventory */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Warehouse Inventory
            </CardTitle>
            <CardDescription>Current stock levels and inventory value</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {warehouseInventory.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{item.item}</p>
                    <p className="text-sm text-muted-foreground">{item.category} • {item.stock} {item.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{item.value}</p>
                    <Badge className={getStockStatus(item.status)} variant="secondary">
                      {item.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Procurement Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Procurement Resources
            </CardTitle>
            <CardDescription>Supplier relationships and contract management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {procurementResources.map((resource, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{resource.supplier}</p>
                    <p className="text-sm text-muted-foreground">{resource.category}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-sm text-warning">★</span>
                      <span className="text-sm font-medium">{resource.rating}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{resource.totalValue}</p>
                    <p className="text-sm text-muted-foreground">{resource.contracts} contracts</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Budget Analysis
          </CardTitle>
          <CardDescription>Monthly budget allocation and spending trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Equipment</p>
              <p className="text-2xl font-bold">$45,000</p>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground">75% used</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Operations</p>
              <p className="text-2xl font-bold">$30,000</p>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-success h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground">60% used</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Maintenance</p>
              <p className="text-2xl font-bold">$25,000</p>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-warning h-2 rounded-full" style={{ width: '90%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground">90% used</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Emergency</p>
              <p className="text-2xl font-bold">$25,000</p>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-muted-foreground h-2 rounded-full" style={{ width: '15%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground">15% used</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </BaseDashboard>
  );
}