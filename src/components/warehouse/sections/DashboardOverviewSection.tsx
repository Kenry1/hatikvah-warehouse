import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Package, Plus, CheckCircle, AlertTriangle, Truck, Archive, BarChart3 } from 'lucide-react';
import { useWarehouse } from '../WarehouseContext';
import { MaterialFormModal } from '../modals/MaterialFormModal';
import { InventoryReportModal } from '../modals/InventoryReportModal';
import { ReorderRecommendationsModal } from '../modals/ReorderRecommendationsModal';
import { useToast } from '@/hooks/use-toast';

export function DashboardOverviewSection() {
  const { materials, requests, updateRequestStatus, setActiveSection } = useWarehouse();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'safety' | 'ftth' | 'fttx' | 'company-assets'>('safety');
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const { toast } = useToast();

  const stats = [
    { 
      title: 'Total Inventory Value', 
      value: `$${(materials.reduce((sum, m) => sum + parseInt(m.value.replace(/[$,]/g, '')), 0) / 1000000).toFixed(1)}M`, 
      description: `${materials.length} unique items`, 
      color: 'primary' as const 
    },
    { 
      title: 'Approved Requests', 
      value: requests.length, 
      description: `${requests.filter(r => r.status === 'ready').length} ready for pickup`, 
      color: 'success' as const 
    },
    { 
      title: 'Low Stock Items', 
      value: materials.filter(m => m.stock < m.minLevel).length, 
      description: 'Require reordering', 
      color: 'warning' as const 
    },
    { 
      title: 'Monthly Turnover', 
      value: '$345K', 
      description: '12% increase', 
      color: 'success' as const 
    },
  ];

  const materialCategories = [
    { 
      id: 'safety' as const,
      name: 'Safety Equipment',
      items: materials.filter(m => m.category === 'safety')
    },
    {
      id: 'ftth' as const,
      name: 'FTTH Equipment',
      items: materials.filter(m => m.category === 'ftth')
    },
    {
      id: 'fttx' as const,
      name: 'FTTX Components',
      items: materials.filter(m => m.category === 'fttx')
    },
    {
      id: 'company-assets' as const,
      name: 'Company Assets',
      items: materials.filter(m => m.category === 'company-assets')
    }
  ];

  const handleAddMaterial = (category: typeof selectedCategory) => {
    setSelectedCategory(category);
    setIsAddModalOpen(true);
  };

  const handleMarkAsPickedUp = (requestId: string) => {
    updateRequestStatus(requestId, 'picked-up');
    toast({
      title: "Request Updated",
      description: "Material request marked as picked up.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Warehouse Dashboard</h2>
        <p className="text-muted-foreground">Manage inventory, approved requests, and material distribution</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="text-center">
                <p className={`text-2xl font-bold text-${stat.color}`}>{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => handleAddMaterial('safety')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Safety Item
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => handleAddMaterial('ftth')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add FTTH Equipment
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => handleAddMaterial('fttx')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add FTTX Component
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => handleAddMaterial('company-assets')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Company Asset
              </Button>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Quick Stock Overview</h4>
              {materialCategories.map((category, index) => {
                const totalValue = category.items.reduce((sum, item) => 
                  sum + parseInt(item.value.replace(/[$,]/g, '')), 0
                );
                const lowStockItems = category.items.filter(item => item.stock < item.minLevel).length;
                
                return (
                  <div 
                    key={index} 
                    className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                    onClick={() => setActiveSection('stock-analytics')}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{category.name}</p>
                      <Badge variant={lowStockItems > 0 ? "destructive" : "default"}>
                        {category.items.length} items
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Value: ${(totalValue / 1000).toFixed(0)}K
                      {lowStockItems > 0 && (
                        <span className="ml-2 text-warning">
                          <AlertTriangle className="inline h-3 w-3 mr-1" />
                          {lowStockItems} low stock
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
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
            {requests.slice(0, 3).map((request) => (
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
                    <Button size="sm" onClick={() => handleMarkAsPickedUp(request.id)}>
                      <Truck className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setActiveSection('approved-requests')}
            >
              View All Requests
            </Button>
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
                {category.items.slice(0, 3).map((item, itemIndex) => (
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
                <p className="text-2xl font-bold text-primary">{materials.reduce((sum, m) => sum + m.stock, 0).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Items</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <p className="text-2xl font-bold text-success">156</p>
                <p className="text-sm text-muted-foreground">Items Moved Today</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <p className="text-2xl font-bold text-warning">{materials.filter(m => m.stock < m.minLevel).length}</p>
                <p className="text-sm text-muted-foreground">Reorder Required</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <p className="text-2xl font-bold text-primary">87%</p>
                <p className="text-sm text-muted-foreground">Space Utilization</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setShowReportModal(true)}
              >
                <Package className="mr-2 h-4 w-4" />
                Generate Inventory Report
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setShowReorderModal(true)}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Reorder Recommendations
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <MaterialFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        category={selectedCategory}
      />

      <InventoryReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />

      <ReorderRecommendationsModal
        isOpen={showReorderModal}
        onClose={() => setShowReorderModal(false)}
      />
    </div>
  );
}