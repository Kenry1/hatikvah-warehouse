import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Plus, 
  CheckCircle, 
  BarChart3, 
  Package,
  AlertTriangle
} from 'lucide-react';
import { useWarehouse } from './WarehouseContext';

export function WarehouseSidebar() {
  const { activeSection, setActiveSection, materials, requests } = useWarehouse();

  const sidebarItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview & Quick Actions'
    },
    {
      id: 'material-creation',
      label: 'Material Creation',
      icon: Plus,
      description: 'Add New Materials'
    },
    {
      id: 'approved-requests',
      label: 'Approved Requests',
      icon: CheckCircle,
      description: 'Process Material Pickups',
      badge: requests.filter(r => r.status === 'ready').length
    },
    {
      id: 'stock-analytics',
      label: 'Stock Analytics',
      icon: BarChart3,
      description: 'Inventory Reports & Insights'
    },
    {
      id: 'assets-manager',
      label: 'Assets Manager',
      icon: Package,
      description: 'Manage Company Assets',
      badge: materials.filter(m => m.category === 'company-assets').length
    }
  ];

  const lowStockCount = materials.filter(m => m.stock < m.minLevel).length;

  return (
    <Card className="h-full">
      <CardContent className="p-4 space-y-2">
        <div className="mb-4">
          <h3 className="font-semibold text-sm text-muted-foreground mb-2">WAREHOUSE MANAGEMENT</h3>
          {lowStockCount > 0 && (
            <div className="flex items-center gap-2 text-xs text-warning">
              <AlertTriangle className="h-3 w-3" />
              {lowStockCount} items need reordering
            </div>
          )}
        </div>

        {sidebarItems.map((item) => (
          <Button
            key={item.id}
            variant={activeSection === item.id ? "default" : "ghost"}
            className="w-full justify-start h-auto p-3"
            onClick={() => setActiveSection(item.id)}
          >
            <div className="flex items-center gap-3 w-full">
              <item.icon className="h-4 w-4 flex-shrink-0" />
              <div className="flex-1 text-left">
                <div className="font-medium text-sm">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.description}</div>
              </div>
              {item.badge && (
                <Badge variant="secondary" className="ml-auto">
                  {item.badge}
                </Badge>
              )}
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}