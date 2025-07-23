import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Truck, Clock, Package } from 'lucide-react';
import { useWarehouse } from '../WarehouseContext';
import { useToast } from '@/hooks/use-toast';

export function ApprovedRequestsSection() {
  const { requests, updateRequestStatus } = useWarehouse();
  const { toast } = useToast();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <Package className="h-4 w-4 text-green-500" />;
      case 'picked-up':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'default';
      case 'picked-up':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const handleMarkAsPickedUp = (requestId: string) => {
    updateRequestStatus(requestId, 'picked-up');
    toast({
      title: "Request Updated",
      description: "Material request marked as picked up.",
    });
  };

  const groupedRequests = requests.reduce((acc, request) => {
    if (!acc[request.category]) {
      acc[request.category] = [];
    }
    acc[request.category].push(request);
    return acc;
  }, {} as Record<string, typeof requests>);

  const categories = Object.keys(groupedRequests);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Approved Material Requests</h2>
        <p className="text-muted-foreground">Process and manage approved material pickups</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{requests.length}</p>
              <p className="text-sm text-muted-foreground">Total Requests</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{requests.filter(r => r.status === 'ready').length}</p>
              <p className="text-sm text-muted-foreground">Ready for Pickup</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{requests.filter(r => r.status === 'picked-up').length}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Requests</TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Approved Requests</CardTitle>
              <CardDescription>Complete list of all approved material requests</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Approved Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.id}</TableCell>
                      <TableCell>{request.requester}</TableCell>
                      <TableCell>{request.items}</TableCell>
                      <TableCell>{request.category}</TableCell>
                      <TableCell>{request.approvedDate}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(request.status)}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1 capitalize">{request.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {request.status === 'ready' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleMarkAsPickedUp(request.id)}
                          >
                            <Truck className="h-4 w-4 mr-1" />
                            Mark as Picked Up
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {categories.map((category) => (
          <TabsContent key={category} value={category}>
            <Card>
              <CardHeader>
                <CardTitle>{category} Requests</CardTitle>
                <CardDescription>Requests for {category.toLowerCase()}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request ID</TableHead>
                      <TableHead>Requester</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Approved Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupedRequests[category]?.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.id}</TableCell>
                        <TableCell>{request.requester}</TableCell>
                        <TableCell>{request.items}</TableCell>
                        <TableCell>{request.approvedDate}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(request.status)}>
                            {getStatusIcon(request.status)}
                            <span className="ml-1 capitalize">{request.status}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {request.status === 'ready' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleMarkAsPickedUp(request.id)}
                            >
                              <Truck className="h-4 w-4 mr-1" />
                              Mark as Picked Up
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}