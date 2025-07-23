import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Download, AlertTriangle, TrendingUp, Package } from 'lucide-react';
import { useWarehouse } from '../WarehouseContext';
import { useState } from 'react';
import { InventoryReportModal } from '../modals/InventoryReportModal';
import { ReorderRecommendationsModal } from '../modals/ReorderRecommendationsModal';

export function StockAnalyticsSection() {
  const { materials } = useWarehouse();
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReorderModal, setShowReorderModal] = useState(false);

  const categoryStats = materials.reduce((acc, material) => {
    if (!acc[material.category]) {
      acc[material.category] = {
        totalItems: 0,
        totalValue: 0,
        lowStockItems: 0,
      };
    }
    acc[material.category].totalItems += material.stock;
    acc[material.category].totalValue += parseInt(material.value.replace(/[$,]/g, ''));
    if (material.stock < material.minLevel) {
      acc[material.category].lowStockItems++;
    }
    return acc;
  }, {} as Record<string, { totalItems: number; totalValue: number; lowStockItems: number }>);

  const totalValue = Object.values(categoryStats).reduce((sum, cat) => sum + cat.totalValue, 0);
  const totalItems = materials.reduce((sum, material) => sum + material.stock, 0);
  const lowStockItems = materials.filter(m => m.stock < m.minLevel);

  const categoryLabels = {
    'safety': 'Safety Equipment',
    'ftth': 'FTTH Equipment',
    'fttx': 'FTTX Components',
    'company-assets': 'Company Assets',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Stock Analytics</h2>
        <p className="text-muted-foreground">Inventory insights and performance metrics</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Package className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-primary">{totalItems.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Items</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">${(totalValue / 1000000).toFixed(1)}M</p>
              <p className="text-sm text-muted-foreground">Total Value</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <AlertTriangle className="h-6 w-6 text-warning mx-auto mb-2" />
              <p className="text-2xl font-bold text-warning">{lowStockItems.length}</p>
              <p className="text-sm text-muted-foreground">Low Stock Items</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <BarChart3 className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">4</p>
              <p className="text-sm text-muted-foreground">Categories</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
          <CardDescription>Inventory distribution by material category</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(categoryStats).map(([category, stats]) => (
            <div key={category} className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{categoryLabels[category as keyof typeof categoryLabels]}</h4>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{stats.totalItems} items</Badge>
                  <Badge variant="outline">${(stats.totalValue / 1000).toFixed(0)}K</Badge>
                  {stats.lowStockItems > 0 && (
                    <Badge variant="destructive">{stats.lowStockItems} low stock</Badge>
                  )}
                </div>
              </div>
              <Progress value={(stats.totalValue / totalValue) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {((stats.totalValue / totalValue) * 100).toFixed(1)}% of total inventory value
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-warning">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
            <CardDescription>The following items are below minimum stock levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockItems.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Current: {item.stock} | Minimum: {item.minLevel}
                    </p>
                  </div>
                  <Badge variant="destructive">
                    {item.minLevel - item.stock} needed
                  </Badge>
                </div>
              ))}
              {lowStockItems.length > 5 && (
                <p className="text-sm text-muted-foreground text-center">
                  +{lowStockItems.length - 5} more items need attention
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button onClick={() => setShowReportModal(true)} variant="outline" className="h-auto p-4">
          <div className="flex items-center gap-3">
            <Download className="h-5 w-5" />
            <div className="text-left">
              <p className="font-medium">Generate Inventory Report</p>
              <p className="text-xs text-muted-foreground">Export detailed inventory analysis</p>
            </div>
          </div>
        </Button>
        <Button onClick={() => setShowReorderModal(true)} variant="outline" className="h-auto p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5" />
            <div className="text-left">
              <p className="font-medium">Reorder Recommendations</p>
              <p className="text-xs text-muted-foreground">View items requiring reorder</p>
            </div>
          </div>
        </Button>
      </div>

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