import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Monitor, Laptop, Server, Smartphone, Plus, Package } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface ITAsset {
  id: string;
  name: string;
  type: 'Laptop' | 'Desktop' | 'Monitor' | 'Server' | 'Network Device' | 'Mobile Device' | 'Printer' | 'Other';
  serialNumber: string;
  status: 'In Stock' | 'Issued' | 'Under Maintenance' | 'Retired';
  location: string;
  assignedTo?: string;
  purchaseDate: string;
  warrantyEndDate?: string;
}

interface AssetRequest {
  id: string;
  assetId: string;
  assetName: string;
  requestType: 'Issuance' | 'Collection';
  requester: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  requestDate: string;
}

const mockITAssets: ITAsset[] = [
  {
    id: 'ASSET-001',
    name: 'Dell Latitude 7420',
    type: 'Laptop',
    serialNumber: 'SN-LPT-98765',
    status: 'Issued',
    location: 'Office A, Desk 101',
    assignedTo: 'Alice Johnson',
    purchaseDate: '2023-01-15',
    warrantyEndDate: '2026-01-15',
  },
  {
    id: 'ASSET-002',
    name: 'HP EliteDesk 800 G6',
    type: 'Desktop',
    serialNumber: 'SN-DST-54321',
    status: 'In Stock',
    location: 'Warehouse, IT Section',
    purchaseDate: '2023-03-20',
  },
  {
    id: 'ASSET-003',
    name: 'LG UltraFine 4K',
    type: 'Monitor',
    serialNumber: 'SN-MON-11223',
    status: 'Issued',
    location: 'Office B, Desk 205',
    assignedTo: 'Bob Williams',
    purchaseDate: '2023-02-10',
  },
  {
    id: 'ASSET-004',
    name: 'Cisco Catalyst 9300',
    type: 'Network Device',
    serialNumber: 'SN-NET-45678',
    status: 'In Stock',
    location: 'Server Room, Rack 3',
    purchaseDate: '2022-11-01',
    warrantyEndDate: '2025-11-01',
  },
  {
    id: 'ASSET-005',
    name: 'iPhone 13 Pro',
    type: 'Mobile Device',
    serialNumber: 'SN-MOB-12345',
    status: 'Under Maintenance',
    location: 'IT Repair Shop',
    assignedTo: 'Charlie Brown',
    purchaseDate: '2023-05-10',
  },
];

const mockAssetRequests: AssetRequest[] = [
  {
    id: 'AR-001',
    assetId: 'ASSET-002',
    assetName: 'HP EliteDesk 800 G6',
    requestType: 'Issuance',
    requester: 'Diana Prince',
    status: 'Pending',
    requestDate: '2024-07-25',
  },
  {
    id: 'AR-002',
    assetId: 'ASSET-001',
    assetName: 'Dell Latitude 7420',
    requestType: 'Collection',
    requester: 'Alice Johnson',
    status: 'Completed',
    requestDate: '2024-07-20',
  },
];

export default function AssetInventory() {
  const [assets, setAssets] = useState<ITAsset[]>(mockITAssets);
  const [requests, setRequests] = useState<AssetRequest[]>(mockAssetRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    assetId: '',
    requestType: 'Issuance' as 'Issuance' | 'Collection',
    requester: 'Current User (Mock)', // Mock current user
    description: '',
  });
  const { toast } = useToast();

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'Laptop':
        return <Laptop className="h-4 w-4" />;
      case 'Desktop':
        return <Monitor className="h-4 w-4" />;
      case 'Monitor':
        return <Monitor className="h-4 w-4" />;
      case 'Server':
        return <Server className="h-4 w-4" />;
      case 'Network Device':
        return <Package className="h-4 w-4" />;
      case 'Mobile Device':
        return <Smartphone className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Issued':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Under Maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Retired':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          asset.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          asset.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || asset.type === filterType;
    const matchesStatus = filterStatus === 'all' || asset.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleRequestSubmit = () => {
    if (!newRequest.assetId || !newRequest.requestType) {
      toast({
        title: "Error",
        description: "Please select an asset and a request type.",
        variant: "destructive",
      });
      return;
    }

    const asset = assets.find(a => a.id === newRequest.assetId);
    if (!asset) {
      toast({
        title: "Error",
        description: "Selected asset not found.",
        variant: "destructive",
      });
      return;
    }

    const newReq: AssetRequest = {
      id: `AR-${(requests.length + 1).toString().padStart(3, '0')}`,
      assetId: newRequest.assetId,
      assetName: asset.name,
      requestType: newRequest.requestType,
      requester: newRequest.requester,
      status: 'Pending',
      requestDate: format(new Date(), 'yyyy-MM-dd'),
    };

    setRequests([...requests, newReq]);
    setNewRequest({ assetId: '', requestType: 'Issuance', requester: 'Current User (Mock)', description: '' });
    setIsRequestDialogOpen(false);
    toast({
      title: 'Request Submitted',
      description: `Your ${newRequest.requestType} request for ${asset.name} has been submitted.`,
    });
  };

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">IT Asset Inventory</h1>
          <p className="text-muted-foreground text-sm md:text-base">Manage and track electronic and computing devices</p>
        </div>
        <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Request Asset
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Request Asset Issuance/Collection</DialogTitle>
              <DialogDescription>
                Submit a request for an IT asset.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="asset">Asset</Label>
                <Select
                  value={newRequest.assetId}
                  onValueChange={(value) => setNewRequest(prev => ({ ...prev, assetId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an asset" />
                  </SelectTrigger>
                  <SelectContent>
                    {assets.map(asset => (
                      <SelectItem key={asset.id} value={asset.id}>
                        {asset.name} ({asset.serialNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="requestType">Request Type</Label>
                <Select
                  value={newRequest.requestType}
                  onValueChange={(value: 'Issuance' | 'Collection') => setNewRequest(prev => ({ ...prev, requestType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select request type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Issuance">Issuance</SelectItem>
                    <SelectItem value="Collection">Collection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Reason / Notes</Label>
                <Textarea
                  id="description"
                  placeholder="e.g., For new employee setup, faulty device return"
                  value={newRequest.description}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <Button onClick={handleRequestSubmit} className="w-full">Submit Request</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Filter by Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Laptop">Laptop</SelectItem>
            <SelectItem value="Desktop">Desktop</SelectItem>
            <SelectItem value="Monitor">Monitor</SelectItem>
            <SelectItem value="Server">Server</SelectItem>
            <SelectItem value="Network Device">Network Device</SelectItem>
            <SelectItem value="Mobile Device">Mobile Device</SelectItem>
            <SelectItem value="Printer">Printer</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="In Stock">In Stock</SelectItem>
            <SelectItem value="Issued">Issued</SelectItem>
            <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
            <SelectItem value="Retired">Retired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>IT Asset List</CardTitle>
          <CardDescription>All electronic and computing devices in the inventory.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Asset ID</th>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">S/N</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Location</th>
                  <th className="text-left p-3">Assigned To</th>
                  <th className="text-left p-3">Purchase Date</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.length > 0 ? (
                  filteredAssets.map(asset => (
                    <tr key={asset.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{asset.id}</td>
                      <td className="p-3">{asset.name}</td>
                      <td className="p-3">
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                          {getAssetIcon(asset.type)}
                          {asset.type}
                        </Badge>
                      </td>
                      <td className="p-3">{asset.serialNumber}</td>
                      <td className="p-3">
                        <Badge className={getStatusColor(asset.status)}>
                          {asset.status}
                        </Badge>
                      </td>
                      <td className="p-3">{asset.location}</td>
                      <td className="p-3">{asset.assignedTo || 'N/A'}</td>
                      <td className="p-3">{format(new Date(asset.purchaseDate), 'MMM dd, yyyy')}</td>
                      <td className="p-3">
                        <Button variant="ghost" size="sm">View</Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="p-3 text-center text-muted-foreground">
                      No IT assets found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Asset Issuance/Collection Requests</CardTitle>
          <CardDescription>Track pending and completed requests for IT assets.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Request ID</th>
                  <th className="text-left p-3">Asset</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Requester</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Request Date</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.length > 0 ? (
                  requests.map(req => (
                    <tr key={req.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{req.id}</td>
                      <td className="p-3">{req.assetName}</td>
                      <td className="p-3">{req.requestType}</td>
                      <td className="p-3">{req.requester}</td>
                      <td className="p-3">
                        <Badge className={getStatusColor(req.status)}>
                          {req.status}
                        </Badge>
                      </td>
                      <td className="p-3">{format(new Date(req.requestDate), 'MMM dd, yyyy')}</td>
                      <td className="p-3">
                        <Button variant="ghost" size="sm">View</Button>
                        {req.status === 'Pending' && (
                          <Button variant="outline" size="sm" className="ml-1">Approve/Reject</Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-3 text-center text-muted-foreground">
                      No asset issuance or collection requests.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 