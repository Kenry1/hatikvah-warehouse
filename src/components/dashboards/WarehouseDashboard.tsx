import { BaseDashboard } from './BaseDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Package, Plus, CheckCircle, AlertTriangle, Truck, Archive, BarChart3 } from 'lucide-react';

export function WarehouseDashboard() {
  const stats = [
    { title: 'Total Inventory Value', value: '$2.4M', description: '1,250 unique items', color: 'primary' as const },
    { title: 'Approved Requests', value: 18, description: '5 ready for pickup', color: 'success' as const },
    { title: 'Low Stock Items', value: 23, description: 'Require reordering', color: 'warning' as const },
    { title: 'Monthly Turnover', value: '$345K', description: '12% increase', color: 'success' as const },
  ];

  const materialCategories = [
    { 
      name: 'Safety Equipment',
      totalItems: 340,
      totalValue: '$125,000',
      lowStockItems: 5,
      items: [
        { name: 'Hard Hats', stock: 78, minLevel: 50, value: '$1,560' },
        { name: 'Safety Vests', stock: 105, minLevel: 80, value: '$2,625' },
        { name: 'Work Gloves', stock: 45, minLevel: 60, value: '$675' },
      ]
    },
    {
      name: 'FTTH Equipment',
      totalItems: 156,
      totalValue: '$680,000',
      lowStockItems: 8,
      items: [
        { name: 'Fiber Optic Cables (1000m)', stock: 25, minLevel: 30, value: '$45,000' },
        { name: 'ONT Devices', stock: 85, minLevel: 100, value: '$127,500' },
        { name: 'Optical Splitters', stock: 46, minLevel: 40, value: '$92,000' },
      ]
    },
    {
      name: 'FTTX Components',
      totalItems: 234,
      totalValue: '$450,000',
      lowStockItems: 6,
      items: [
        { name: 'Distribution Boxes', stock: 42, minLevel: 30, value: '$84,000' },
        { name: 'Patch Panels', stock: 67, minLevel: 50, value: '$133,400' },
        { name: 'Network Connectors', stock: 125, minLevel: 100, value: '$25,000' },
      ]
    },
    {
      name: 'Company Assets',
      totalItems: 89,
      totalValue: '$1,200,000',
      lowStockItems: 4,
      items: [
        { name: 'Testing Equipment', stock: 12, minLevel: 15, value: '$240,000' },
        { name: 'Laptops', stock: 28, minLevel: 25, value: '$420,000' },
        { name: 'Power Tools', stock: 49, minLevel: 40, value: '$245,000' },
      ]
    }
  ];

  const approvedRequests = [
    { id: 'REQ001', requester: 'John Smith - Site Alpha', items: 'Fiber Cables (500m), ONT (5pcs)', approvedDate: '2024-12-15', status: 'ready' },
    { id: 'REQ002', requester: 'Sarah Johnson - Site Beta', items: 'Safety Vests (10pcs), Hard Hats (8pcs)', approvedDate: '2024-12-14', status: 'picked-up' },
    { id: 'REQ003', requester: 'Mike Wilson - Site Gamma', items: 'Distribution Boxes (3pcs)', approvedDate: '2024-12-13', status: 'ready' },
  ];

  return (
    <BaseDashboard
      title="Warehouse Dashboard"
      description="Manage inventory, approved requests, and material distribution"
      stats={stats}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Material Creation by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Material Management
            </CardTitle>
            <CardDescription>Add and manage inventory by category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Add Safety Item
              </Button>
              <Button variant="outline" className="justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Add FTTH Equipment
              </Button>
              <Button variant="outline" className="justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Add FTTX Component
              </Button>
              <Button variant="outline" className="justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Add Company Asset
              </Button>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Quick Stock Overview</h4>
              {materialCategories.map((category, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{category.name}</p>
                    <Badge variant={category.lowStockItems > 0 ? "destructive" : "default"}>
                      {category.totalItems} items
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Value: {category.totalValue}
                    {category.lowStockItems > 0 && (
                      <span className="ml-2 text-warning">
                        <AlertTriangle className="inline h-3 w-3 mr-1" />
                        {category.lowStockItems} low stock
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Approved Material Request Board */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Approved Material Requests
            </CardTitle>
            <CardDescription>Process approved requests for material pickup</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {approvedRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{request.requester}</p>
                  <p className="text-sm text-muted-foreground">{request.items}</p>
                  <p className="text-xs text-muted-foreground">
                    Approved: {request.approvedDate}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={request.status === 'ready' ? 'default' : 'secondary'}>
                    {request.status}
                  </Badge>
                  {request.status === 'ready' && (
                    <Button size="sm">
                      <Truck className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Detailed Inventory by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5" />
              Inventory Details
            </CardTitle>
            <CardDescription>Detailed stock levels and reorder points</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {materialCategories.slice(0, 2).map((category, categoryIndex) => (
              <div key={categoryIndex} className="space-y-3">
                <h4 className="font-medium">{category.name}</h4>
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="space-y-2 p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.value}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Stock: {item.stock}</span>
                        <span>Min: {item.minLevel}</span>
                      </div>
                      <Progress 
                        value={(item.stock / (item.minLevel * 2)) * 100} 
                        className="h-2"
                      />
                      {item.stock < item.minLevel && (
                        <p className="text-xs text-warning">
                          <AlertTriangle className="inline h-3 w-3 mr-1" />
                          Below minimum level
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Warehouse Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Warehouse Analytics
            </CardTitle>
            <CardDescription>Inventory turnover and movement statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <p className="text-2xl font-bold text-primary">1,250</p>
                <p className="text-sm text-muted-foreground">Total Items</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <p className="text-2xl font-bold text-success">156</p>
                <p className="text-sm text-muted-foreground">Items Moved Today</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <p className="text-2xl font-bold text-warning">23</p>
                <p className="text-sm text-muted-foreground">Reorder Required</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <p className="text-2xl font-bold text-primary">87%</p>
                <p className="text-sm text-muted-foreground">Space Utilization</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Package className="mr-2 h-4 w-4" />
                Generate Inventory Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Reorder Recommendations
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </BaseDashboard>
  );
}