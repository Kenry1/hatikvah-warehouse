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
  const companyId = "gDf7U2T33LuVeCIcbrr8";
  useEffect(() => {
    async function fetchRequests() {
      try {
        const reqs = await getMaterialRequestList(companyId);
        setRequests(reqs.map((r) => ({
          id: r.id ?? '',
          requesterId: r.requesterId ?? '',
          requestedBy: r.requestedBy ?? r.requesterId ?? '',
          requestedByUsername: r.requestedByUsername ?? '',
          requestorRole: r.requestorRole ?? '',
          approver: r.approver ?? '',
          approverRole: r.approverRole ?? '',
          issuedBy: r.issuedBy ?? '',
          requesterRole: r.requesterRole ?? '',
          companyId: r.companyId ?? '',
          requestDate: r.requestDate ?? '',
          assignedTo: r.assignedTo ?? '',
          comments: r.comments ?? '',
          notes: r.notes ?? '',
          price: r.price ?? 0,
          totalCost: r.totalCost ?? 0,
          urgency: r.urgency ?? 'low',
          priority: r.priority ?? 'low',
          siteId: r.siteId ?? '',
          siteName: r.siteName ?? '',
          items: r.items ?? [],
          status: r.status ?? 'pending',
        })));
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

  // Use allowed status values from MaterialRequest type
  const submittedRequests = requests.filter(req => req.status === "submitted");
  const approvedRequests = requests.filter(req => req.status === "approved");
  const issuedRequests = requests.filter(req => req.status === "issued");

  return (
    <div className="space-y-6">
      {/* Submitted Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-500" />
            <span>Submitted Requests</span>
            <Badge className="bg-blue-500 text-white ml-2">{submittedRequests.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {submittedRequests.length === 0 ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>No submitted requests.</AlertDescription>
            </Alert>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Requester Role</TableHead>
                    <TableHead>Approver</TableHead>
                    <TableHead>Approver Role</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Priority</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submittedRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-mono text-sm">{request.id}</TableCell>
                      <TableCell>{request.status}</TableCell>
                      <TableCell>{request.requestedByUsername ?? request.requestedBy ?? ''}</TableCell>
                      <TableCell>{request.requestorRole ?? ''}</TableCell>
                      <TableCell>{request.approver ?? ''}</TableCell>
                      <TableCell>{request.approverRole ?? ''}</TableCell>
                      <TableCell>{request.requestDate ? new Date(request.requestDate).toLocaleDateString() : "N/A"}</TableCell>
                      <TableCell>{request.priority ?? ''}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Approved Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Approved Requests</span>
            <Badge className="bg-green-500 text-white ml-2">{approvedRequests.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {approvedRequests.length === 0 ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>No approved requests.</AlertDescription>
            </Alert>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Requester Role</TableHead>
                    <TableHead>Approver</TableHead>
                    <TableHead>Approver Role</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Priority</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvedRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-mono text-sm">{request.id}</TableCell>
                      <TableCell>{request.status}</TableCell>
                      <TableCell>{request.requestedByUsername ?? request.requestedBy ?? ''}</TableCell>
                      <TableCell>{request.requestorRole ?? ''}</TableCell>
                      <TableCell>{request.approver ?? ''}</TableCell>
                      <TableCell>{request.approverRole ?? ''}</TableCell>
                      <TableCell>{request.requestDate ? new Date(request.requestDate).toLocaleDateString() : "N/A"}</TableCell>
                      <TableCell>{request.priority ?? ''}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleDispatchRequest(request.id)}
                          disabled={request.status === "issued"}
                        >
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
      {/* Issued Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-yellow-500" />
            <span>Issued Requests</span>
            <Badge className="bg-yellow-500 text-black ml-2">{issuedRequests.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {issuedRequests.length === 0 ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>No issued requests.</AlertDescription>
            </Alert>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Requester Role</TableHead>
                    <TableHead>Approver</TableHead>
                    <TableHead>Approver Role</TableHead>
                    <TableHead>Issued By</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Priority</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {issuedRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-mono text-sm">{request.id}</TableCell>
                      <TableCell>{request.status}</TableCell>
                      <TableCell>{request.requestedByUsername ?? request.requestedBy ?? ''}</TableCell>
                      <TableCell>{request.requestorRole ?? ''}</TableCell>
                      <TableCell>{request.approver ?? ''}</TableCell>
                      <TableCell>{request.approverRole ?? ''}</TableCell>
                      <TableCell>{request.issuedBy ?? ''}</TableCell>
                      <TableCell>{request.requestDate ? new Date(request.requestDate).toLocaleDateString() : "N/A"}</TableCell>
                      <TableCell>{request.priority ?? ''}</TableCell>
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
