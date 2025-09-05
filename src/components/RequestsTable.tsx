import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "@/types/auth";
import { MaterialRequest } from "../types/inventory";
import { Eye, Filter, Calendar } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { format } from "date-fns";

interface RequestsTableProps {
  requests: MaterialRequest[];
  onViewDetails: (request: MaterialRequest) => void;
  onDispatch?: (request: MaterialRequest) => void;
  companyId?: string;
  variant?: 'desktop' | 'tablet' | 'mobile';
  showActions?: boolean;
}

export function RequestsTable({ requests, onViewDetails, onDispatch, companyId, variant = 'desktop', showActions = true }: RequestsTableProps) {
  const [userList, setUserList] = useState<User[]>([]);
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [modalItems, setModalItems] = useState<any[] | null>(null);

  // Enrich items with displayName (material name) when opening the modal.
  const handleOpenItemsModal = async (items: any[]) => {
    if (!items || items.length === 0) {
      setModalItems([]);
      setShowItemsModal(true);
      return;
    }

    const enriched = await Promise.all(items.map(async (it) => {
      // If the request already stored a name, prefer it
      const existingName = it.materialName || it.name || it.displayName;
      if (existingName) return { ...it, displayName: existingName };

      // Otherwise try to fetch from solar_warehouse by materialId
      try {
        const ref = doc(db, 'solar_warehouse', it.materialId);
        const snap = await getDoc(ref);
        const data = snap.exists() ? snap.data() : null;
        const fetchedName = data ? (data.materialName ?? data.itemName ?? data.name) : null;
        return { ...it, displayName: fetchedName || it.materialId };
      } catch (err) {
        // Fallback to id
        return { ...it, displayName: it.materialId };
      }
    }));

    setModalItems(enriched);
    setShowItemsModal(true);
  };
  useEffect(() => {
    if (companyId) {
    }
  }, [companyId]);
  const getUserName = (userId: string) => {
    const user = userList.find(u => u.id === userId);
    return user ? user.username : userId;
  };
  const [siteFilter, setSiteFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);

  const parseRequestDate = (request: any): Date | null => {
    if (!request) return null;
    const d = request.requestDate ?? request.requestedDate ?? request.createdAt ?? null;
    if (!d) return null;
    try {
      const dt = typeof d === 'number' ? new Date(d) : new Date(d);
      if (isNaN(dt.getTime())) return null;
      return dt;
    } catch {
      return null;
    }
  };

  const withinDateRange = (reqDate: Date | null) => {
    if (!reqDate) return true; // if request has no date, include it
    if (dateFrom) {
      const from = new Date(dateFrom + 'T00:00:00');
      if (reqDate < from) return false;
    }
    if (dateTo) {
      const to = new Date(dateTo + 'T23:59:59');
      if (reqDate > to) return false;
    }
    return true;
  };

  const filteredRequests = requests.filter(request => {
    if (siteFilter !== "all" && request.siteName !== siteFilter) return false;
    // For 'all' status, show all requests by the user
    if (statusFilter !== "all" && request.status !== statusFilter) return false;
    const rd = parseRequestDate(request);
    if (!withinDateRange(rd)) return false;
    return true;
  });

  const getStatusBadge = (status: string | undefined) => {
    if (!status) return <Badge className="bg-muted text-muted-foreground">Unknown</Badge>;
    const colors: Record<string, string> = {
      submitted: 'bg-blue-500 text-white',
      approved: 'bg-green-500 text-white',
      issued: 'bg-yellow-500 text-black',
      fulfilled: 'bg-success text-success-foreground',
      partial: 'bg-warning text-warning-foreground',
      pending: 'bg-danger text-danger-foreground',
      cancelled: 'bg-muted text-muted-foreground'
    };
    let label = status.charAt(0).toUpperCase() + status.slice(1);
    if (status === 'submitted') label = 'Submitted';
    if (status === 'approved') label = 'Approved';
    if (status === 'issued') label = 'Issued';
    return (
      <Badge className={colors[status] || 'bg-muted text-muted-foreground'}>
        {label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: 'bg-danger text-danger-foreground',
      high: 'bg-warning text-warning-foreground',
      medium: 'bg-primary text-primary-foreground',
      low: 'bg-muted text-muted-foreground'
    };

    return (
      <Badge variant="outline" className={colors[priority]}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  // Build a unique list of sites keyed by lower-cased site name to avoid duplicates
  const siteMap = new Map<string, { id: string; name: string }>();
  requests.forEach((r) => {
    const name = (r.siteName || "").trim();
    if (!name) return;
    const key = name.toLowerCase();
    if (!siteMap.has(key)) {
      // Use the first seen siteId for this name
      siteMap.set(key, { id: r.siteId || key, name });
    }
  });
  const uniqueSites = Array.from(siteMap.values());

  const handleDispatchRequest = async (request: MaterialRequest) => {
    if (!currentUser) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to dispatch requests.",
        variant: "destructive",
      });
      return;
    }

    if (request.status !== 'approved') {
      toast({
        title: "Dispatch Not Allowed",
        description: "Only approved requests can be dispatched.",
        variant: "destructive",
      });
      return;
    }

    try {
      const requestRef = doc(db, 'materialRequests', request.id);
      await updateDoc(requestRef, {
        status: 'issued',
        issuedBy: currentUser.username || currentUser.email,
        fulfilledDate: serverTimestamp(),
      });

      toast({
        title: "Request Dispatched",
        description: `Request ${request.id} has been successfully dispatched.`,
      });

      // Call the optional onDispatch callback if provided
      if (onDispatch) {
        onDispatch(request);
      }
    } catch (error) {
      console.error('Error dispatching request:', error);
      toast({
        title: "Dispatch Failed",
        description: "Failed to dispatch the request. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Desktop: full table
  if (variant === 'desktop') {
    return (
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          <Select value={siteFilter} onValueChange={setSiteFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Sites" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sites</SelectItem>
              {uniqueSites.map(site => (
                <SelectItem key={site.id} value={site.name}>
                  {site.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="issued">Issued</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Input type="date" value={dateFrom ?? ''} onChange={(e) => setDateFrom(e.target.value || null)} className="w-[160px]" />
            <Input type="date" value={dateTo ?? ''} onChange={(e) => setDateTo(e.target.value || null)} className="w-[160px]" />
          </div>
        </div>
        {/* Table */}
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Items</TableHead>
                {showActions && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
                  <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{request.id}</TableCell>
                  <TableCell>{request.siteName}</TableCell>
                  <TableCell>{request.status === 'pending' ? request.requestedByUsername : (request.requestedByUsername || getUserName(request.requestedBy) || request.requestedBy)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {(() => {
                        try {
                          return request.requestDate ? format(new Date(request.requestDate), 'MMM dd, yyyy') : 'N/A';
                        } catch {
                          return 'Invalid date';
                        }
                      })()}
                    </div>
                  </TableCell>
                  <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell>KSh {(request.totalCost ?? 0).toLocaleString()}</TableCell>
                  <TableCell className="flex items-center gap-2">
                    <span>{request.items.length} items</span>
                    <Button size="sm" variant="ghost" onClick={() => handleOpenItemsModal(request.items)}>
                      View
                    </Button>
                  </TableCell>
                  {showActions && (
                    <TableCell className="text-right flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(request)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDispatchRequest(request)}
                      >
                        Dispatch
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
          {showItemsModal && modalItems && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="bg-black/50 absolute inset-0" onClick={() => setShowItemsModal(false)} />
              <div className="bg-card p-4 rounded shadow relative z-10 w-[90%] max-w-xl">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Requested Items</h3>
                  <Button size="sm" onClick={() => setShowItemsModal(false)}>Close</Button>
                </div>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {modalItems.map((it, idx) => (
                    <div key={idx} className="border rounded p-2">
                      <div className="font-medium">{it.displayName || it.materialName || it.name || it.materialId || 'Unknown'}</div>
                      <div className="text-sm text-muted-foreground">Quantity: {it.quantity ?? it.requestedQuantity ?? it.qty ?? 0}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        {filteredRequests.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No requests found matching your filters.
          </div>
        )}
      </div>
    );
  }

  // Tablet: simplified table
  if (variant === 'tablet') {
    return (
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex gap-2 items-center">
          <Select value={siteFilter} onValueChange={setSiteFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Sites" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {uniqueSites.map(site => (
                <SelectItem key={site.id} value={site.name}>{site.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="issued">Issued</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Input type="date" value={dateFrom ?? ''} onChange={(e) => setDateFrom(e.target.value || null)} className="w-[120px]" />
            <Input type="date" value={dateTo ?? ''} onChange={(e) => setDateTo(e.target.value || null)} className="w-[120px]" />
          </div>
        </div>
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Site</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                {showActions && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id} className="hover:bg-muted/50">
                  <TableCell>{request.siteName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {(() => {
                        try {
                          return request.requestDate ? format(new Date(request.requestDate), 'MMM dd, yyyy') : 'N/A';
                        } catch {
                          return 'Invalid date';
                        }
                      })()}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  {showActions && (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(request)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {filteredRequests.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No requests found.
          </div>
        )}
      </div>
    );
  }

  // Mobile: card/list view
  if (variant === 'mobile') {
    return (
      <div className="space-y-2">
        {filteredRequests.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No requests found.
          </div>
        )}
        {filteredRequests.map((request) => (
          <div key={request.id} className="border rounded-lg p-3 bg-card flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold">{request.siteName}</span>
              {getStatusBadge(request.status)}
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>{(() => {
                try {
                  return request.requestDate ? format(new Date(request.requestDate), 'MMM dd, yyyy') : 'N/A';
                } catch {
                  return 'Invalid date';
                }
              })()}</span>
              <span>{getPriorityBadge(request.priority)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span>Items: {request.items.length}</span>
              <span>KSh {(request.totalCost ?? 0).toLocaleString()}</span>
            </div>
            {showActions && (
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(request)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }
}
