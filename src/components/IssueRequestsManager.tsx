import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Clock, User, Calendar, Package } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "../hooks/use-toast";
import { getMaterialRequestList } from "../lib/firestoreHelpers";
import { MaterialRequest } from "../types/inventory";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

export const IssueRequestsManager = ({ fetchAll = false, refreshKey }: { fetchAll?: boolean, refreshKey?: number }) => {
  // Local materials list for lookup (can be replaced with Firestore fetch if needed)
  const [allMaterials, setAllMaterials] = useState<any[]>([]);
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [showAssetsModal, setShowAssetsModal] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<any[] | null>(null);
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchRequests() {
      try {
        const reqs = await getMaterialRequestList(fetchAll ? undefined : currentUser?.id);
        setRequests(reqs.map((r) => ({
          ...r,
          // Only include fields defined in MaterialRequest type
          id: r.id ?? '',
          requestedBy: r.requestedBy ?? '',
          requestedByUsername: r.requestedByUsername ?? '',
          requestorRole: r.requestorRole ?? '',
          approver: r.approver ?? '',
          approverRole: r.approverRole ?? '',
          issuedBy: r.issuedBy ?? '',
          notes: r.notes ?? '',
          totalCost: r.totalCost ?? 0,
          priority: r.priority ?? 'low',
          siteId: r.siteId ?? '',
          siteName: r.siteName ?? '',
          items: r.items ?? [],
          status: r.status ?? 'pending',
          // Convert requestDate to Date object if it's a string
          requestDate: r.requestDate ? (typeof r.requestDate === 'string' ? new Date(r.requestDate) : r.requestDate) : undefined,
          approvedBy: r.approvedBy ?? '',
          approvedDate: r.approvedDate ? (typeof r.approvedDate === 'string' ? new Date(r.approvedDate) : r.approvedDate) : undefined,
          fulfilledDate: r.fulfilledDate ? (typeof r.fulfilledDate === 'string' ? new Date(r.fulfilledDate) : r.fulfilledDate) : undefined,
        })));
      } catch (err) {
        console.error("Error fetching material requests:", err);
      }
    }
    fetchRequests();
    async function fetchMaterials() {
      try {
        // Try to fetch all materials from Firestore (solar_warehouse collection)
        const { db } = await import("../lib/firebase");
        const { getDocs, collection } = await import("firebase/firestore");
        const snapshot = await getDocs(collection(db, "solar_warehouse"));
        setAllMaterials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        // fallback: leave allMaterials empty
      }
    }
    fetchMaterials();
  }, [fetchAll, currentUser?.id, refreshKey]);
  // Helper to get item name from materialId
  const getMaterialName = (materialId: string) => {
    const material = allMaterials.find(m => m.id === materialId);
    return material ? (material.itemName || material.name) : "Unknown";
  };

  const handleDispatchRequest = async (requestId: string) => {
    if (!currentUser?.username) {
      toast({
        title: "Error",
        description: "User not authenticated.",
        variant: "destructive",
      });
      return;
    }

    // Find the request to check its status
    const request = requests.find(r => r.id === requestId);
    if (!request) {
      toast({
        title: "Error",
        description: "Request not found.",
        variant: "destructive",
      });
      return;
    }

    if (request.status !== "approved") {
      toast({
        title: "Error",
        description: "Only approved requests can be dispatched.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update Firestore
      const requestRef = doc(db, "material_requests", requestId);
      await updateDoc(requestRef, {
        status: "issued",
        issuedBy: currentUser.username,
        fulfilledDate: serverTimestamp(),
      });

      // Update local state
      setRequests(prev => prev.map(req =>
        req.id === requestId
          ? { ...req, status: "issued", issuedBy: currentUser.username, fulfilledDate: new Date() }
          : req
      ));

      toast({
        title: "Request Dispatched",
        description: "Stock has been dispatched from the warehouse.",
        className: "bg-blue-500 text-white",
      });
    } catch (error) {
      console.error("Error dispatching request:", error);
      toast({
        title: "Error",
        description: "Failed to dispatch request. Please try again.",
        variant: "destructive",
      });
    }
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

  // Group non-approved requests (include both 'submitted' and 'pending')
  const submittedRequests = requests.filter(req => req.status === "submitted" || req.status === "pending");
  const approvedRequests = requests.filter(req => req.status === "approved");
  const issuedRequests = requests.filter(req => req.status === "issued");

  return (
    <div className="space-y-6">
      {/* Assets Modal (Dialog) */}
      <Dialog open={showAssetsModal} onOpenChange={setShowAssetsModal}>
        <DialogContent className="max-w-2xl w-[92vw] sm:w-[640px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Requested Items</DialogTitle>
          </DialogHeader>
          <ul className="list-disc pl-4 space-y-2">
            {(selectedAssets ?? []).map((item, idx) => (
              <li key={idx}>
                <div><span className="font-semibold">Name:</span> {getMaterialName ? getMaterialName(item.materialId) : (item.itemName || item.materialName || item.name || 'Unnamed Item')}</div>
                <div><span className="font-semibold">Quantity:</span> {item.requestedQuantity ?? item.quantity ?? '-'} {item.unit ?? ''}</div>
                {item.notes && <div><span className="font-semibold">Notes:</span> {item.notes}</div>}
                {item.priority && <div><span className="font-semibold">Priority:</span> {item.priority}</div>}
              </li>
            ))}
          </ul>
          <div className="pt-4">
            <Button className="w-full" onClick={() => setShowAssetsModal(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
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
            <div className="rounded-md border overflow-x-auto">
              <Table className="text-xs sm:text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead className="hidden md:table-cell">Requester Role</TableHead>
                    <TableHead className="hidden lg:table-cell">Approver</TableHead>
                    <TableHead className="hidden xl:table-cell">Approver Role</TableHead>
                    <TableHead className="hidden sm:table-cell">Request Date</TableHead>
                    <TableHead className="hidden sm:table-cell">Priority</TableHead>
                    <TableHead>Assets</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submittedRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-mono text-[10px] sm:text-xs md:text-sm whitespace-nowrap">{request.id}</TableCell>
                      <TableCell>{request.status}</TableCell>
                      <TableCell>{request.requestedByUsername ?? request.requestedBy ?? ''}</TableCell>
                      <TableCell className="hidden md:table-cell">{request.requestorRole ?? ''}</TableCell>
                      <TableCell className="hidden lg:table-cell">{request.approver ?? request.approvedBy ?? ''}</TableCell>
                      <TableCell className="hidden xl:table-cell">{request.approverRole ?? ''}</TableCell>
                      <TableCell className="hidden sm:table-cell">{request.requestDate ? new Date(request.requestDate).toLocaleDateString() : "N/A"}</TableCell>
                      <TableCell className="hidden sm:table-cell">{request.priority ?? ''}</TableCell>
                      <TableCell>
                        <button
                          className="bg-blue-100 text-blue-900 px-2 py-1 rounded text-xs"
                          onClick={() => {
                            setSelectedAssets(request.items ?? []);
                            setShowAssetsModal(true);
                          }}
                        >
                          View
                        </button>
                      </TableCell>
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
            <div className="rounded-md border overflow-x-auto">
              <Table className="text-xs sm:text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead className="hidden md:table-cell">Requester Role</TableHead>
                    <TableHead className="hidden lg:table-cell">Approver</TableHead>
                    <TableHead className="hidden xl:table-cell">Approver Role</TableHead>
                    <TableHead className="hidden sm:table-cell">Request Date</TableHead>
                    <TableHead className="hidden sm:table-cell">Priority</TableHead>
                    <TableHead>Assets</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvedRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-mono text-[10px] sm:text-xs md:text-sm whitespace-nowrap">{request.id}</TableCell>
                      <TableCell>{request.status}</TableCell>
                      <TableCell>{request.requestedByUsername ?? request.requestedBy ?? ''}</TableCell>
                      <TableCell className="hidden md:table-cell">{request.requestorRole ?? ''}</TableCell>
                      <TableCell className="hidden lg:table-cell">{request.approver ?? ''}</TableCell>
                      <TableCell className="hidden xl:table-cell">{request.approverRole ?? ''}</TableCell>
                      <TableCell className="hidden sm:table-cell">{request.requestDate ? new Date(request.requestDate).toLocaleDateString() : "N/A"}</TableCell>
                      <TableCell className="hidden sm:table-cell">{request.priority ?? ''}</TableCell>
                      <TableCell>
                        <button
                          className="bg-blue-100 text-blue-900 px-2 py-1 rounded text-xs"
                          onClick={() => {
                            setSelectedAssets(request.items ?? []);
                            setShowAssetsModal(true);
                          }}
                        >
                          View
                        </button>
                      </TableCell>
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
            <div className="rounded-md border overflow-x-auto">
              <Table className="text-xs sm:text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead className="hidden md:table-cell">Requester Role</TableHead>
                    <TableHead className="hidden lg:table-cell">Approver</TableHead>
                    <TableHead className="hidden xl:table-cell">Approver Role</TableHead>
                    <TableHead className="hidden lg:table-cell">Issued By</TableHead>
                    <TableHead className="hidden sm:table-cell">Request Date</TableHead>
                    <TableHead className="hidden sm:table-cell">Priority</TableHead>
                    <TableHead>Assets</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {issuedRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-mono text-[10px] sm:text-xs md:text-sm whitespace-nowrap">{request.id}</TableCell>
                      <TableCell>{request.status}</TableCell>
                      <TableCell>{request.requestedByUsername ?? request.requestedBy ?? ''}</TableCell>
                      <TableCell className="hidden md:table-cell">{request.requestorRole ?? ''}</TableCell>
                      <TableCell className="hidden lg:table-cell">{request.approver ?? ''}</TableCell>
                      <TableCell className="hidden xl:table-cell">{request.approverRole ?? ''}</TableCell>
                      <TableCell className="hidden lg:table-cell">{request.issuedBy ?? ''}</TableCell>
                      <TableCell className="hidden sm:table-cell">{request.requestDate ? new Date(request.requestDate).toLocaleDateString() : "N/A"}</TableCell>
                      <TableCell className="hidden sm:table-cell">{request.priority ?? ''}</TableCell>
                      <TableCell>
                        <button
                          className="bg-blue-100 text-blue-900 px-2 py-1 rounded text-xs"
                          onClick={() => {
                            setSelectedAssets(request.items ?? []);
                            setShowAssetsModal(true);
                          }}
                        >
                          View
                        </button>
                      </TableCell>
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
