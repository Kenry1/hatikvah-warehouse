import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Clock, User, Calendar, Package } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { getMaterialRequestList } from "../lib/firestoreHelpers";
import { MaterialRequest } from "../types/inventory";

export const IssueRequestsManager = () => {
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  // Replace with your actual companyId logic
  const companyId = "demo-company";
  // Fetch requests from Firestore
  useEffect(() => {
    async function fetchRequests() {
      try {
        const reqs = await getMaterialRequestList(companyId);
        // Map Firestore type to UI type
        const mapped = reqs.map((r) => ({
          id: r.id ?? '',
          siteId: '', // default since not in Firestore
          siteName: '', // default since not in Firestore
          requestDate: r.requestedDate ? new Date(r.requestedDate) : new Date(),
          requestedBy: r.requesterId ?? '',
          priority: (r.urgency as 'low' | 'medium' | 'high' | 'urgent') ?? 'low',
          status: (r.status as 'pending' | 'fulfilled' | 'partial' | 'cancelled') ?? 'pending',
          items: [], // default since not in Firestore
          totalCost: r.price ?? 0,
          notes: r.comments ?? '',
        }));
        setRequests(mapped);
      } catch (err) {
        console.error("Error fetching material requests:", err);
      }
    }
    fetchRequests();
  }, []);
  const { toast } = useToast();

  const handleDispatchRequest = (requestId: string) => {
    setRequests(prev => prev.map(req =>
      req.id === requestId
        ? { ...req, status: "issued" }
        : req
    ));
    toast({
      title: "Request Dispatched",
      description: "Stock has been dispatched from the warehouse.",
      className: "bg-blue-500 text-white",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500 text-black"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-500 text-white"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingRequests = requests.filter(req => req.status === "pending");
  const processedRequests = requests.filter(req => req.status !== "pending");

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            <span>Pending Requests</span>
            <Badge className="bg-yellow-500 text-black ml-2">
              {pendingRequests.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                No pending requests. All requests have been processed.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Urgency</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRequests.map((request) => (
                    <TableRow key={request.id ?? ''}>
                      <TableCell className="font-mono text-sm">{request.id ?? ''}</TableCell>
                      <TableCell>{request.requestedByUsername ?? request.requestedBy ?? ''}</TableCell>
                      <TableCell>{request.priority ?? ''}</TableCell>
                      <TableCell>{request.requestDate ? new Date(request.requestDate).toLocaleDateString() : "N/A"}</TableCell>
                      <TableCell>{request.status ?? ''}</TableCell>
                      <TableCell>{request.totalCost ? `$${request.totalCost.toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell>{request.notes ?? '-'}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => handleDispatchRequest(request.id ?? '')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Dispatch
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Recent Processed Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Recent Processed Requests</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {processedRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No processed requests yet
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total Cost</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedRequests.slice(0, 10).map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-mono text-sm">{request.id}</TableCell>
                      <TableCell>{request.requestedByUsername ?? request.requestedBy ?? ''}</TableCell>
                      <TableCell>{request.priority}</TableCell>
                      <TableCell>{request.requestDate ? new Date(request.requestDate).toLocaleDateString() : "N/A"}</TableCell>
                      <TableCell>{request.status}</TableCell>
                      <TableCell>{request.totalCost ? `$${request.totalCost.toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell>{request.notes ?? '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
