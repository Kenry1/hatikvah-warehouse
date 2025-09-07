import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownUp, History, Search } from "lucide-react";
import { useEffect } from "react";
import { getMaterialRequestList } from "@/lib/firestoreHelpers";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const AuditTrail = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewItems, setViewItems] = useState<any[] | null>(null);
  const [allMaterials, setAllMaterials] = useState<any[]>([]);
  const [siteFilter, setSiteFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [issuedByFilter, setIssuedByFilter] = useState("all");

  useEffect(() => {
    (async () => {
      try {
        const { useAuth } = await import("@/contexts/AuthContext");
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const { user } = useAuth();
        const data = await getMaterialRequestList(user?.id);
        setRequests(data);
      } catch (e) {
        console.error(e);
      }
    })();
    // load materials for name lookup
    (async function loadMaterials(){
      try{
        const snap = await getDocs(collection(db, 'solar_warehouse'));
        const mats = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setAllMaterials(mats);
      } catch(e){
        console.error('Failed to load materials for audit trail', e);
      }
    })();
  }, []);

  const getMaterialName = (materialId?: string) => {
    if(!materialId) return undefined;
    const m = allMaterials.find(a => String(a.id) === String(materialId));
    return m?.materialName || m?.name || m?.itemName;
  }

  // Get unique options for filters
  const siteOptions = Array.from(new Set(requests.map(r => r.siteName).filter(Boolean)));
  const userOptions = Array.from(new Set(requests.map(r => r.requestedByUsername).filter(Boolean)));
  const issuedByOptions = Array.from(new Set(requests.map(r => r.issuedBy).filter(Boolean)));

  const filteredRequests = requests.filter(r => {
    const search = searchTerm.trim().toLowerCase();
    const searchMatch = !search ||
      (r.id && r.id.toLowerCase().includes(search)) ||
      (r.requestedByUsername && r.requestedByUsername.toLowerCase().includes(search)) ||
      (r.approver && r.approver.toLowerCase().includes(search)) ||
      (r.issuedBy && r.issuedBy.toLowerCase().includes(search));
    const siteMatch = siteFilter === "all" || r.siteName === siteFilter;
    const userMatch = userFilter === "all" || r.requestedByUsername === userFilter;
    const issuedByMatch = issuedByFilter === "all" || r.issuedBy === issuedByFilter;
    return searchMatch && siteMatch && userMatch && issuedByMatch;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <History className="h-5 w-5" />
          <span>Transaction Audit Trail</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
          {/* Search Input */}
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by item, user, or ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {/* Type Filter */}
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="issued">Issued</SelectItem>
                <SelectItem value="received">Received</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {/* Additional Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Select value={siteFilter} onValueChange={setSiteFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Site" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sites</SelectItem>
              {siteOptions.map(site => (
                <SelectItem key={site} value={site}>{site}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by User" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {userOptions.map(user => (
                <SelectItem key={user} value={user}>{user}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={issuedByFilter} onValueChange={setIssuedByFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Issued By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Issued By</SelectItem>
              {issuedByOptions.map(issued => (
                <SelectItem key={issued} value={issued}>{issued}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Requester</TableHead>
                <TableHead>Approved By</TableHead>
                <TableHead>Issued By</TableHead>
                <TableHead>Site Name</TableHead>
                <TableHead>Date of Issue</TableHead>
                <TableHead>View Items</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req, idx) => (
                  <TableRow key={req.id || idx}>
                    <TableCell>{req.id || ''}</TableCell>
                    <TableCell>{req.requestedByUsername || req.requestedBy || ''}</TableCell>
                    <TableCell>{req.approver || ''}</TableCell>
                    <TableCell>{req.issuedBy || ''}</TableCell>
                    <TableCell>{req.siteName || ''}</TableCell>
                    <TableCell>{req.fulfilledDate ? new Date(req.fulfilledDate).toLocaleString() : (req.approvedDate ? new Date(req.approvedDate).toLocaleString() : '')}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" onClick={() => setViewItems(req.items || [])}>View</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No matching transactions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      {/* Modal for viewing requested inventory */}
      <Dialog open={!!viewItems} onOpenChange={() => setViewItems(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Requested Inventory</DialogTitle>
          </DialogHeader>
          {Array.isArray(viewItems) && viewItems.length > 0 ? (
            <ul className="space-y-2">
              {viewItems.map((item, i) => (
                <li key={i} className="border rounded p-2">
                  <div><span className="font-semibold">Material ID:</span> {item.materialId || item.id || ''}</div>
                  <div><span className="font-semibold">Name:</span> {getMaterialName(item.materialId) || item.materialName || item.name || item.itemName || 'Unnamed Item'}</div>
                  <div><span className="font-semibold">Quantity:</span> {item.quantity || item.requestedQuantity || ''}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-muted-foreground">No inventory items found for this request.</div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewItems(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
