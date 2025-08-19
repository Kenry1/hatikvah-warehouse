import { useState, useEffect } from 'react';
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
import { ITAsset, AssetRequest, getITAssetList, addITAsset, getAssetRequestList, addAssetRequest } from '@/lib/firestoreHelpers';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/navigation/LoadingSpinner';

export default function AssetInventory() {
  const { user: currentUser } = useAuth();
  const [assets, setAssets] = useState<ITAsset[]>([]);
  const [requests, setRequests] = useState<AssetRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isAddAssetDialogOpen, setIsAddAssetDialogOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    assetId: '',
    requestType: 'Issuance' as 'Issuance' | 'Collection',
    requester: currentUser?.username || '', // Use current user's username
    description: '',
  });
  const [newAsset, setNewAsset] = useState<Omit<ITAsset, 'id' | 'createdAt' | 'updatedAt' | 'companyId'>>({
    name: '',
    type: 'Other', // Default type
    serialNumber: '',
    status: 'In Stock', // Default status
    location: '',
    purchaseDate: format(new Date(), 'yyyy-MM-dd'), // Default to today
  });
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [errorAssets, setErrorAssets] = useState<string | null>(null);
  const [errorRequests, setErrorRequests] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAssets = async () => {
    if (!currentUser?.companyId) {
      setLoadingAssets(false);
      setErrorAssets("No company ID found for the current user.");
      return;
    }
    setLoadingAssets(true);
    setErrorAssets(null);
    try {
      const fetchedAssets = await getITAssetList(currentUser.companyId);
      setAssets(fetchedAssets);
    } catch (err) {
      console.error("Failed to fetch assets:", err);
      setErrorAssets("Failed to load assets.");
      toast({
        title: "Error",
        description: "Failed to load asset data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoadingAssets(false);
    }
  };

  const fetchRequests = async () => {
    if (!currentUser?.companyId) {
      setLoadingRequests(false);
      setErrorRequests("No company ID found for the current user.");
      return;
    }
    setLoadingRequests(true);
    setErrorRequests(null);
    try {
      const fetchedRequests = await getAssetRequestList(currentUser.companyId);
      setRequests(fetchedRequests);
    } catch (err) {
      console.error("Failed to fetch requests:", err);
      setErrorRequests("Failed to load requests.");
      toast({
        title: "Error",
        description: "Failed to load asset request data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchAssets();
    fetchRequests();
  }, [currentUser?.companyId]);

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

  const handleAddAssetSubmit = async () => {
    if (!newAsset.name || !newAsset.serialNumber || !newAsset.location) {
      toast({
        title: "Error",
        description: "Please fill in all required asset fields.",
        variant: "destructive",
      });
      return;
    }
    if (!currentUser?.companyId) {
      toast({
        title: "Error",
        description: "User company information is missing.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addITAsset({
        ...newAsset,
        companyId: currentUser.companyId,
      });
      toast({
        title: 'Asset Added',
        description: `${newAsset.name} has been added to the inventory.`,
      });
      setNewAsset({
        name: '',
        type: 'Other',
        serialNumber: '',
        status: 'In Stock',
        location: '',
        purchaseDate: format(new Date(), 'yyyy-MM-dd'),
      });
      setIsAddAssetDialogOpen(false);
      fetchAssets(); // Re-fetch assets to show the new one
    } catch (error) {
      console.error("Error adding asset:", error);
      toast({
        title: 'Error',
        description: 'Failed to add asset. Please try again.',
        variant: "destructive",
      });
    }
  };

  const handleRequestSubmit = async () => {
    if (!newRequest.assetId || !newRequest.requestType) {
      toast({
        title: "Error",
        description: "Please select an asset and a request type.",
        variant: "destructive",
      });
      return;
    }
    if (!currentUser?.companyId || !currentUser?.username) {
      toast({
        title: "Error",
        description: "User authentication information is missing.",
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

    try {
      await addAssetRequest({
        assetId: newRequest.assetId,
        assetName: asset.name,
        requestType: newRequest.requestType,
        requester: currentUser.username, // Use current user's username
        status: 'Pending',
        description: newRequest.description,
        companyId: currentUser.companyId,
      });
      toast({
        title: 'Request Submitted',
        description: `Your ${newRequest.requestType} request for ${asset.name} has been submitted.`,
      });
      setNewRequest({ assetId: '', requestType: 'Issuance', requester: currentUser.username, description: '' });
      setIsRequestDialogOpen(false);
      fetchRequests(); // Re-fetch requests to show the new one
    } catch (error) {
      console.error("Error submitting request:", error);
      toast({
        title: 'Error',
        description: 'Failed to submit request. Please try again.',
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">IT Asset Inventory</h1>
          <p className="text-muted-foreground text-sm md:text-base">Manage and track electronic and computing devices</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddAssetDialogOpen} onOpenChange={setIsAddAssetDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Asset
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New IT Asset</DialogTitle>
                <DialogDescription>
                  Enter the details for the new IT asset.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="assetName">Asset Name</Label>
                  <Input
                    id="assetName"
                    placeholder="e.g., Dell XPS 15"
                    value={newAsset.name}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assetType">Type</Label>
                  <Select
                    value={newAsset.type}
                    onValueChange={(value: ITAsset['type']) => setNewAsset(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select asset type" />
                    </SelectTrigger>
                    <SelectContent>
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serialNumber">Serial Number</Label>
                  <Input
                    id="serialNumber"
                    placeholder="SN-XYZ-12345"
                    value={newAsset.serialNumber}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, serialNumber: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Office A, Server Room"
                    value={newAsset.location}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchaseDate">Purchase Date</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={newAsset.purchaseDate}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, purchaseDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warrantyEndDate">Warranty End Date (Optional)</Label>
                  <Input
                    id="warrantyEndDate"
                    type="date"
                    value={newAsset.warrantyEndDate || ''}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, warrantyEndDate: e.target.value }))}
                  />
                </div>
                <Button onClick={handleAddAssetSubmit} className="w-full">Add Asset</Button>
              </div>
            </DialogContent>
          </Dialog>

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
                      {assets.length > 0 ? (
                        assets.map(asset => (
                          <SelectItem key={asset.id} value={asset.id!}>
                            {asset.name} ({asset.serialNumber})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>No assets available</SelectItem>
                      )}
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
          {loadingAssets ? (
            <LoadingSpinner />
          ) : errorAssets ? (
            <div className="text-center text-red-500">Error: {errorAssets}</div>
          ) : (
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
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Asset Issuance/Collection Requests</CardTitle>
          <CardDescription>Track pending and completed requests for IT assets.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingRequests ? (
            <LoadingSpinner />
          ) : errorRequests ? (
            <div className="text-center text-red-500">Error: {errorRequests}</div>
          ) : (
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
                        <td className="p-3">{req.requestDate ? format(new Date(req.requestDate.toDate()), 'MMM dd, yyyy') : 'N/A'}</td>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
} 