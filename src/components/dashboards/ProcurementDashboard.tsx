import { useState } from 'react';
import { BaseDashboard } from './BaseDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, Plus, AlertTriangle, TrendingUp, DollarSign, Star, Package, Phone, Mail } from 'lucide-react';

export function ProcurementDashboard() {
  const [showSupplierDialog, setShowSupplierDialog] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    category: '',
    email: '',
    phone: '',
    rating: ''
  });

  const stats = [
    { title: 'Active Suppliers', value: 45, description: '8 new this quarter', color: 'primary' as const },
    { title: 'Reorder Alerts', value: 12, description: 'Items below threshold', color: 'warning' as const },
    { title: 'Cost Savings', value: '$125K', description: 'This year', color: 'success' as const },
    { title: 'Supply Orders', value: 234, description: 'This month', color: 'primary' as const },
  ];

  const suppliers = [
    { 
      id: 'SUP001', 
      name: 'TechSupply Corporation', 
      category: 'Network Equipment', 
      rating: 4.8, 
      totalOrders: 156, 
      totalValue: '$125,000',
      phone: '+1-555-0123',
      email: 'orders@techsupply.com',
      status: 'active',
      lastOrder: '2024-12-10'
    },
    { 
      id: 'SUP002', 
      name: 'SafetyFirst Industries', 
      category: 'Safety Equipment', 
      rating: 4.6, 
      totalOrders: 89, 
      totalValue: '$85,000',
      phone: '+1-555-0124',
      email: 'procurement@safetyfirst.com',
      status: 'active',
      lastOrder: '2024-12-08'
    },
    { 
      id: 'SUP003', 
      name: 'FiberNet Solutions', 
      category: 'Fiber Optics', 
      rating: 4.9, 
      totalOrders: 234, 
      totalValue: '$200,000',
      phone: '+1-555-0125',
      email: 'sales@fibernet.com',
      status: 'active',
      lastOrder: '2024-12-12'
    },
    { 
      id: 'SUP004', 
      name: 'ABC Materials Ltd', 
      category: 'Construction Materials', 
      rating: 4.2, 
      totalOrders: 67, 
      totalValue: '$45,000',
      phone: '+1-555-0126',
      email: 'info@abcmaterials.com',
      status: 'pending',
      lastOrder: '2024-11-28'
    }
  ];

  const supplyRates = [
    { item: 'Fiber Optic Cable (1000m)', category: 'FTTH', supplier: 'FiberNet Solutions', rate: '$1,800', lastUpdated: '2024-12-01' },
    { item: 'Safety Vest', category: 'Safety', supplier: 'SafetyFirst Industries', rate: '$25', lastUpdated: '2024-11-28' },
    { item: 'ONT Device', category: 'FTTH', supplier: 'TechSupply Corporation', rate: '$150', lastUpdated: '2024-12-05' },
    { item: 'Hard Hat', category: 'Safety', supplier: 'SafetyFirst Industries', rate: '$20', lastUpdated: '2024-12-03' },
  ];

  const reorderAlerts = [
    { item: 'Safety Vests', currentStock: 15, minLevel: 50, supplier: 'SafetyFirst Industries', unitCost: '$25', priority: 'high' },
    { item: 'Fiber Cables (1000m)', currentStock: 8, minLevel: 20, supplier: 'FiberNet Solutions', unitCost: '$1,800', priority: 'critical' },
    { item: 'Hard Hats', currentStock: 25, minLevel: 40, supplier: 'SafetyFirst Industries', unitCost: '$20', priority: 'medium' },
    { item: 'Network Switches', currentStock: 5, minLevel: 15, supplier: 'TechSupply Corporation', unitCost: '$300', priority: 'high' },
  ];

  const handleCreateSupplier = () => {
    console.log('Creating supplier:', newSupplier);
    setShowSupplierDialog(false);
    setNewSupplier({ name: '', category: '', email: '', phone: '', rating: '' });
  };

  const getSupplierRating = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-warning fill-current' : 'text-muted-foreground'}`} 
      />
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-warning text-warning-foreground';
      case 'medium': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <BaseDashboard
      title="Procurement Dashboard"
      description="Supplier management, supply rates, and reorder alerts"
      stats={stats}
    >
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Supplier Management */}
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Supplier Management
              </CardTitle>
              <CardDescription>Manage supplier relationships and performance</CardDescription>
            </div>
            <Dialog open={showSupplierDialog} onOpenChange={setShowSupplierDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Supplier
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Supplier</DialogTitle>
                  <DialogDescription>Create a new supplier profile for procurement management.</DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="supplierName">Company Name</Label>
                    <Input
                      id="supplierName"
                      value={newSupplier.name}
                      onChange={(e) => setNewSupplier(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter company name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={newSupplier.category} onValueChange={(value) => setNewSupplier(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Network Equipment">Network Equipment</SelectItem>
                        <SelectItem value="Safety Equipment">Safety Equipment</SelectItem>
                        <SelectItem value="Fiber Optics">Fiber Optics</SelectItem>
                        <SelectItem value="Construction Materials">Construction Materials</SelectItem>
                        <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newSupplier.email}
                        onChange={(e) => setNewSupplier(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="contact@supplier.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={newSupplier.phone}
                        onChange={(e) => setNewSupplier(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+1-555-0123"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={() => setShowSupplierDialog(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={handleCreateSupplier} className="flex-1">
                      Add Supplier
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{supplier.name}</p>
                        <p className="text-sm text-muted-foreground">
                          <Mail className="inline h-3 w-3 mr-1" />
                          {supplier.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{supplier.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getSupplierRating(supplier.rating)}
                        <span className="ml-1 text-sm">{supplier.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell>{supplier.totalOrders}</TableCell>
                    <TableCell className="font-semibold text-success">{supplier.totalValue}</TableCell>
                    <TableCell>
                      <Badge variant={supplier.status === 'active' ? 'default' : 'secondary'}>
                        {supplier.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="ghost">
                          <Phone className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Supply Rate Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Supply Rate Management
            </CardTitle>
            <CardDescription>Track and update material pricing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add New Rate
            </Button>
            
            <div className="space-y-3">
              {supplyRates.map((rate, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{rate.item}</p>
                    <p className="text-sm text-muted-foreground">
                      {rate.supplier} • {rate.category}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Updated: {rate.lastUpdated}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-success">{rate.rate}</p>
                    <Button size="sm" variant="outline">Update</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reorder Point Alert Manager */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Reorder Point Alerts
            </CardTitle>
            <CardDescription>Manage inventory thresholds and automatic reordering</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {reorderAlerts.map((alert, index) => (
              <div key={index} className="space-y-3 p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">{alert.item}</p>
                    <p className="text-sm text-muted-foreground">{alert.supplier}</p>
                  </div>
                  <Badge className={getPriorityColor(alert.priority)} variant="secondary">
                    {alert.priority}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Stock: {alert.currentStock}</span>
                    <span>Min: {alert.minLevel}</span>
                  </div>
                  <Progress 
                    value={(alert.currentStock / alert.minLevel) * 100} 
                    className="h-2"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Unit Cost: {alert.unitCost}
                    </span>
                    <Button size="sm">
                      <Package className="mr-2 h-4 w-4" />
                      Reorder
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Procurement Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Procurement Analytics
          </CardTitle>
          <CardDescription>Cost analysis and supplier performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Average Lead Time</p>
              <p className="text-2xl font-bold">12 days</p>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-success h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground">15% improvement</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Cost Reduction</p>
              <p className="text-2xl font-bold">$125K</p>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground">78% of target</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Supplier Rating</p>
              <p className="text-2xl font-bold">4.6</p>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-warning h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground">Avg. rating</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Order Accuracy</p>
              <p className="text-2xl font-bold">98.5%</p>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-success h-2 rounded-full" style={{ width: '98%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground">Above target</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </BaseDashboard>
  );
}