import { BaseDashboard } from './BaseDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, Plus, CheckCircle, Clock, AlertTriangle, MapPin } from 'lucide-react';

export function SiteEngineerDashboard() {
  const stats = [
    { title: 'Material Requests', value: 12, description: '8 pending approval', color: 'warning' as const },
    { title: 'Active Sites', value: 6, description: '3 installations ongoing', color: 'primary' as const },
    { title: 'Completed Tasks', value: 28, description: 'This month', color: 'success' as const },
    { title: 'Inventory Used', value: '$15,420', description: 'Current month', color: 'primary' as const },
  ];

  const materialCategories = [
    { name: 'Safety Equipment', subcategories: ['Hard Hats', 'Safety Vests', 'Gloves', 'Safety Glasses'] },
    { name: 'FTTH Equipment', subcategories: ['Fiber Cables', 'Optical Splitters', 'ONT Devices', 'Drop Cables'] },
    { name: 'FTTX Components', subcategories: ['Distribution Boxes', 'Patch Panels', 'Connectors', 'Adapters'] },
    { name: 'Company Assets', subcategories: ['Tools', 'Testing Equipment', 'Vehicles', 'Laptops'] },
  ];

  const recentRequests = [
    { id: 'MR001', category: 'FTTH Equipment', items: 'Fiber Cables (500m)', site: 'Site Alpha', status: 'pending', date: '2024-12-15', priority: 'high' },
    { id: 'MR002', category: 'Safety Equipment', items: 'Hard Hats (10pcs)', site: 'Site Beta', status: 'approved', date: '2024-12-14', priority: 'medium' },
    { id: 'MR003', category: 'FTTX Components', items: 'Distribution Boxes (5pcs)', site: 'Site Gamma', status: 'pending', date: '2024-12-13', priority: 'high' },
  ];

  const activeSites = [
    { name: 'Site Alpha', location: 'Industrial District A', type: 'FTTH Installation', progress: 75, materials: 12 },
    { name: 'Site Beta', location: 'Residential Area B', type: 'Network Upgrade', progress: 45, materials: 8 },
    { name: 'Site Gamma', location: 'Commercial Zone C', type: 'FTTX Deployment', progress: 90, materials: 15 },
  ];

  return (
    <BaseDashboard
      title="Site Engineer Dashboard"
      description="Request materials and manage site operations"
      stats={stats}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Material Request Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Material Request Form
            </CardTitle>
            <CardDescription>Request materials for your site projects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="site">Site Location</Label>
                <Input id="site" placeholder="Select site..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Material Category</Label>
                <Input id="category" placeholder="Select category..." />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="items">Required Items</Label>
              <Input id="items" placeholder="Describe materials needed..." />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" placeholder="Enter quantity..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Input id="priority" placeholder="Select priority..." />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="justification">Justification</Label>
              <Input id="justification" placeholder="Reason for request..." />
            </div>
            
            <Button className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Submit Material Request
            </Button>
          </CardContent>
        </Card>

        {/* Material Categories Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Available Material Categories
            </CardTitle>
            <CardDescription>Browse available materials by category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {materialCategories.map((category, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <p className="font-medium mb-2">{category.name}</p>
                <div className="flex flex-wrap gap-2">
                  {category.subcategories.map((sub, subIndex) => (
                    <Badge key={subIndex} variant="outline" className="text-xs">
                      {sub}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Material Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Material Requests
            </CardTitle>
            <CardDescription>Track your submitted material requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{request.items}</p>
                  <p className="text-sm text-muted-foreground">
                    {request.category} • {request.site}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Requested: {request.date}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={request.priority === 'high' ? 'destructive' : 'secondary'}>
                    {request.priority}
                  </Badge>
                  <Badge variant={request.status === 'approved' ? 'default' : 'secondary'}>
                    {request.status === 'approved' ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <Clock className="h-3 w-3 mr-1" />
                    )}
                    {request.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Active Site Operations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Active Site Operations
            </CardTitle>
            <CardDescription>Monitor your assigned site projects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeSites.map((site, index) => (
              <div key={index} className="space-y-3 p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{site.name}</p>
                    <p className="text-sm text-muted-foreground">{site.location}</p>
                    <p className="text-xs text-muted-foreground">{site.type}</p>
                  </div>
                  <Badge variant="outline">{site.progress}%</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Materials Used: {site.materials} items</span>
                  <Button size="sm" variant="outline">
                    <Package className="h-4 w-4 mr-1" />
                    Request Materials
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </BaseDashboard>
  );
}