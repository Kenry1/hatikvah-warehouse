import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Package, ShoppingCart } from 'lucide-react';
import { useWarehouse } from '../WarehouseContext';
import { useToast } from '@/hooks/use-toast';

interface ReorderRecommendationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReorderRecommendationsModal({ isOpen, onClose }: ReorderRecommendationsModalProps) {
  const { materials } = useWarehouse();
  const { toast } = useToast();

  const lowStockItems = materials.filter(m => m.stock < m.minLevel);
  
  const groupedItems = lowStockItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof lowStockItems>);

  const categoryLabels = {
    'safety': 'Safety Equipment',
    'ftth': 'FTTH Equipment',
    'fttx': 'FTTX Components',
    'company-assets': 'Company Assets',
  };

  const getUrgencyLevel = (current: number, minimum: number) => {
    const ratio = current / minimum;
    if (ratio < 0.3) return { level: 'Critical', color: 'destructive' };
    if (ratio < 0.5) return { level: 'High', color: 'warning' };
    return { level: 'Medium', color: 'secondary' };
  };

  const handleCreatePurchaseOrder = () => {
    toast({
      title: "Purchase Order Created",
      description: `Purchase order created for ${lowStockItems.length} items requiring reorder.`,
    });
    onClose();
  };

  if (lowStockItems.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-600" />
              All Stock Levels Good
            </DialogTitle>
            <DialogDescription>
              All items are currently above their minimum stock levels.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <p className="text-muted-foreground">No reorders needed at this time.</p>
          </div>
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Reorder Recommendations
          </DialogTitle>
          <DialogDescription>
            {lowStockItems.length} items are below minimum stock levels and require reordering.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {Object.entries(groupedItems).map(([category, items]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {items.map((item) => {
                    const urgency = getUrgencyLevel(item.stock, item.minLevel);
                    const needed = item.minLevel * 2 - item.stock; // Reorder to 2x minimum
                    
                    return (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <Badge variant={urgency.color as any}>
                              {urgency.level} Priority
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Current: {item.stock} | Minimum: {item.minLevel} | Value: {item.value}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-primary">Order: {needed} units</p>
                          <p className="text-xs text-muted-foreground">
                            Est. Cost: ${(parseInt(item.value.replace(/[$,]/g, '')) / item.stock * needed).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Total Items to Reorder: {lowStockItems.length}</h3>
                <p className="text-sm text-muted-foreground">
                  Estimated total cost: ${lowStockItems.reduce((total, item) => {
                    const needed = item.minLevel * 2 - item.stock;
                    return total + (parseInt(item.value.replace(/[$,]/g, '')) / item.stock * needed);
                  }, 0).toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleCreatePurchaseOrder} className="flex-1">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Create Purchase Order
              </Button>
              <Button variant="outline" onClick={onClose} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}