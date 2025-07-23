import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Edit, Trash2, Package } from 'lucide-react';
import { useWarehouse } from '../WarehouseContext';
import { MaterialFormModal } from '../modals/MaterialFormModal';
import { useToast } from '@/hooks/use-toast';

export function AssetsManagerSection() {
  const { materials, updateMaterial, deleteMaterial } = useWarehouse();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { toast } = useToast();

  const companyAssets = materials.filter(m => m.category === 'company-assets');

  const filteredAssets = companyAssets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string = 'active') => {
    switch (status) {
      case 'active':
        return 'default';
      case 'maintenance':
        return 'warning';
      case 'retired':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const handleStatusUpdate = (assetId: string, newStatus: string) => {
    updateMaterial(assetId, { status: newStatus as any });
    toast({
      title: "Asset Updated",
      description: "Asset status has been updated successfully.",
    });
  };

  const handleDeleteAsset = (assetId: string, assetName: string) => {
    if (window.confirm(`Are you sure you want to delete "${assetName}"?`)) {
      deleteMaterial(assetId);
      toast({
        title: "Asset Deleted",
        description: "Asset has been removed from inventory.",
        variant: "destructive",
      });
    }
  };

  const stats = {
    total: companyAssets.length,
    active: companyAssets.filter(a => a.status === 'active').length,
    maintenance: companyAssets.filter(a => a.status === 'maintenance').length,
    retired: companyAssets.filter(a => a.status === 'retired').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Assets Manager</h2>
          <p className="text-muted-foreground">Manage and track company assets</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Asset
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Assets</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.maintenance}</p>
              <p className="text-sm text-muted-foreground">In Maintenance</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.retired}</p>
              <p className="text-sm text-muted-foreground">Retired</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="retired">Retired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Assets Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Company Assets
          </CardTitle>
          <CardDescription>
            Manage your company's equipment and assets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset Name</TableHead>
                <TableHead>Serial Number</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell className="font-medium">{asset.name}</TableCell>
                  <TableCell>{asset.serialNumber || '-'}</TableCell>
                  <TableCell>{asset.stock}</TableCell>
                  <TableCell>{asset.value}</TableCell>
                  <TableCell>
                    <Select
                      value={asset.status || 'active'}
                      onValueChange={(value) => handleStatusUpdate(asset.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{asset.assignedTo || 'Unassigned'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteAsset(asset.id, asset.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredAssets.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No assets found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      <MaterialFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        category="company-assets"
      />
    </div>
  );
}