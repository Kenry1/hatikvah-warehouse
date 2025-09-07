// Helper functions for status/urgency (must be at the top for all components)
function getUrgencyColor(urgency: string) {
  switch (urgency) {
    case "high":
      return "bg-destructive text-destructive-foreground";
    case "medium":
      return "bg-warning text-warning-foreground";
    case "low":
      return "bg-success text-success-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "approved":
      return "bg-success text-success-foreground";
    case "rejected":
      return "bg-destructive text-destructive-foreground";
    case "pending":
      return "bg-warning text-warning-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "approved":
      return <CheckCircle className="h-4 w-4" />;
    case "rejected":
      return <XCircle className="h-4 w-4" />;
    case "pending":
      return <Clock className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
}
// ...existing code...
// Restore generic RequestCard for non-material requests
const RequestCard = ({ request }: { request: any }) => (
  <Card className="bg-gradient-card border shadow-sm hover:shadow-md transition-all px-2 py-2 sm:px-4 sm:py-4">
    <CardHeader className="pb-3">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
        <div className="flex-1">
          <CardTitle className="text-base sm:text-lg font-semibold text-foreground mb-2">
            {request.title || request.assetType || "Request"}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {request.requestor || request.requesterId || "Unknown"}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {request.requestedDate?.toDate?.() ? new Date(request.requestedDate.toDate()).toLocaleDateString() : "N/A"}
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              ${Number(request.price ?? request.amount ?? 0).toLocaleString()}
            </div>
          </div>
        </div>
        <div className="flex flex-row sm:flex-col items-end gap-2">
          <Badge className={getStatusColor(request.status)}>
            {getStatusIcon(request.status)}
            <span className="ml-1 capitalize">{request.status}</span>
          </Badge>
          <Badge className={getUrgencyColor(request.urgency || "medium")}> {/* Default to medium if missing */}
            {(request.urgency || "medium")} priority
          </Badge>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-xs sm:text-sm text-muted-foreground mb-4">{request.description || request.comments || "No description"}</p>
      {request.status === "pending" && (
        <div className="flex flex-col sm:flex-row gap-2">
          <Button size="sm" className="flex-1">
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve
          </Button>
          <Button size="sm" variant="destructive" className="flex-1">
            <XCircle className="h-4 w-4 mr-2" />
            Reject
          </Button>
        </div>
      )}
    </CardContent>
  </Card>
)
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Fuel, 
  Package, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  Calendar,
  DollarSign
} from "lucide-react"
import ApprovalRecordsTable from "./ApprovalRecordsTable"
import { useEffect, useState } from "react"
import { AdvancedFilters } from "@/components/common/AdvancedFilters"
import { useAdvancedFilter } from "@/hooks/useAdvancedFilter"
import type { FilterOption } from "@/types/common"
import { useToast } from "@/hooks/use-toast"
import { getMaterialRequestList } from "@/lib/firestoreHelpers"
import { doc, updateDoc, runTransaction, deleteDoc } from "firebase/firestore"
import { getDocs, collection } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/AuthContext"

interface RequestItem {
  id: string
  title: string
  requestor: string
  amount: number
  date: string
  urgency: "high" | "medium" | "low"
  status: "pending" | "approved" | "rejected"
  description: string
}


export function ApprovalTabs({ fetchAll = false }: { fetchAll?: boolean } = {}) {
  // Lookup for materialId to itemName
  const [allMaterials, setAllMaterials] = useState<any[]>([]);

  useEffect(() => {
    async function fetchMaterials() {
      const snapshot = await getDocs(collection(db, "solar_warehouse"));
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllMaterials(items);
    }
    fetchMaterials();
  }, []);
  const { user } = useAuth();
  const [materialRequests, setMaterialRequests] = useState<any[]>([]);

  useEffect(() => {
    const key = fetchAll ? undefined : user?.id;
    getMaterialRequestList(key).then(setMaterialRequests).catch((e) => {
      console.error('Error fetching material requests:', e);
      setMaterialRequests([]);
    });
  }, [user, fetchAll]);

  // Asset requests disabled; show empty for Fuel/Finance (data source restricted to material_requests)
  const fuelRequests: any[] = [];
  const financeRequests: any[] = [];

  // ---------- Filters setup ----------
  const fuelFilterOptions: FilterOption[] = [
    { label: 'Status', value: 'status', type: 'select', options: [
      { label: 'Pending', value: 'pending' },
      { label: 'Approved', value: 'approved' },
      { label: 'Rejected', value: 'rejected' },
    ]},
    { label: 'Urgency', value: 'urgency', type: 'select', options: [
      { label: 'High', value: 'high' },
      { label: 'Medium', value: 'medium' },
      { label: 'Low', value: 'low' },
    ]},
  ];
  const financeFilterOptions: FilterOption[] = fuelFilterOptions;
  const materialFilterOptions: FilterOption[] = [
    { label: 'Status', value: 'status', type: 'select', options: [
      { label: 'Pending', value: 'pending' },
      { label: 'Approved', value: 'approved' },
      { label: 'Rejected', value: 'rejected' },
    ]},
    { label: 'Priority', value: 'priority', type: 'select', options: [
      { label: 'High', value: 'high' },
      { label: 'Medium', value: 'medium' },
      { label: 'Low', value: 'low' },
    ]},
    { label: 'Site', value: 'siteName', type: 'text' },
    { label: 'Requester', value: 'requestedByUsername', type: 'text' },
  ];

  const fuelFilter = useAdvancedFilter(
    fuelRequests,
    fuelFilterOptions,
    ['title', 'assetType', 'requestor', 'requesterId', 'description']
  );
  const financeFilter = useAdvancedFilter(
    financeRequests,
    financeFilterOptions,
    ['title', 'assetType', 'requestor', 'requesterId', 'description']
  );
  const materialFilter = useAdvancedFilter(
    materialRequests,
    materialFilterOptions,
    ['siteName', 'requestedByUsername']
  );

// Helper functions for status/urgency
function getUrgencyColor(urgency: string) {
  switch (urgency) {
    case "high":
      return "bg-destructive text-destructive-foreground";
    case "medium":
      return "bg-warning text-warning-foreground";
    case "low":
      return "bg-success text-success-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "approved":
      return "bg-success text-success-foreground";
    case "rejected":
      return "bg-destructive text-destructive-foreground";
    case "pending":
      return "bg-warning text-warning-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "approved":
      return <CheckCircle className="h-4 w-4" />;
    case "rejected":
      return <XCircle className="h-4 w-4" />;
    case "pending":
      return <Clock className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
}




const MaterialRequestCard = ({ request, onApprove }: { request: any, onApprove: (id: string) => void }) => {
  const [showItems, setShowItems] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const handleDiscard = async () => {
    setLoading(true);
    try {
      // Restore inventory using Firestore transaction
      await runTransaction(db, async (transaction) => {
        for (const item of request.items) {
          const materialDocRef = doc(db, "solar_warehouse", item.materialId);
          const materialDocSnap = await transaction.get(materialDocRef);
          if (!materialDocSnap.exists()) continue;
          const currentQty = materialDocSnap.data().quantity ?? materialDocSnap.data().availableQuantity ?? 0;
          const newQty = currentQty + item.quantity;
          transaction.update(materialDocRef, { quantity: newQty, availableQuantity: newQty });
        }
        // Mark the request as rejected instead of deleting
        transaction.update(doc(db, "material_requests", request.id), { status: "rejected" });
      });
  toast({ title: "Request Discarded", description: "Request marked as rejected and inventory restored." });
  if (typeof request.onDiscard === "function") request.onDiscard(request.id);
    } catch (error) {
      toast({ title: "Error", description: `Failed to discard request: ${error}` });
    }
    setLoading(false);
  };
  // Helper to get item name from materialId
  const getMaterialName = (materialId: string) => {
    const material = allMaterials.find(m => m.id === materialId);
    return material ? material.itemName : "Unknown";
  };

  return (
    <Card className="bg-gradient-card border shadow-sm hover:shadow-md transition-all px-2 py-2 sm:px-4 sm:py-4">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-base sm:text-lg font-semibold text-foreground mb-2">
              Material Request
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {request.requestedByUsername || "Unknown"}
              </div>
              <div className="flex items-center gap-1">
                <span className="font-semibold">Site:</span>
                {request.siteName || "N/A"}
              </div>
              <div className="flex items-center gap-1">
                <span className="font-semibold">Requester:</span>
                {request.requestedByUsername || "N/A"}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {request.requestDate ? new Date(request.requestDate).toLocaleDateString() : "N/A"}
              </div>
            </div>
          </div>
          <div className="flex flex-row sm:flex-col items-end gap-2">
            <Badge className={getStatusColor(request.status)}>
              {getStatusIcon(request.status)}
              <span className="ml-1 capitalize">{request.status}</span>
            </Badge>
            <Badge className={getUrgencyColor(request.priority || "medium")}> {/* Default to medium if missing */}
              {(request.priority || "medium")} priority
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="flex flex-row gap-2 w-full">
            <Button
              size="sm"
              className="flex-1 min-w-0"
              disabled={request.status === "approved"}
              onClick={() => onApprove(request.id)}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {request.status === "approved" ? "Approved" : "Approve"}
            </Button>
            <Button size="sm" variant="outline" className="flex-1 min-w-0" onClick={() => setShowItems((v) => !v)}>
              {showItems ? "Hide" : "View"}
            </Button>
            <Button size="sm" variant="destructive" className="flex-1 min-w-0" onClick={handleDiscard} disabled={loading || request.status === "approved"}>
              <XCircle className="h-4 w-4 mr-2" />
              {loading ? "Discarding..." : "Discard"}
            </Button>
          </div>
          {showItems && Array.isArray(request.items) && (
            <div className="mt-2 border rounded bg-muted p-2">
              <div className="font-semibold mb-2">Requested Items:</div>
              <ul className="list-disc pl-4">
                {request.items.map((item: any, idx: number) => (
                  <li key={idx} className="mb-2">
                    <div><span className="font-semibold">Name:</span> {getMaterialName(item.materialId)}</div>
                    <div><span className="font-semibold">Quantity:</span> {item.quantity} {item.unit}</div>
                    {item.notes && <div><span className="font-semibold">Notes:</span> {item.notes}</div>}
                    <div><span className="font-semibold">Priority:</span> {item.priority}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {request.status === "pending" && (
          <div className="flex flex-row gap-2 mt-2 w-full">
            <Button size="sm" className="flex-1 min-w-0" onClick={() => onApprove(request.id)}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button size="sm" variant="destructive" className="flex-1 min-w-0" onClick={handleDiscard} disabled={loading}>
              <XCircle className="h-4 w-4 mr-2" />
              {loading ? "Discarding..." : "Discard"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

  return (
    <div className="space-y-6">
      <Tabs defaultValue="fuel" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-muted gap-2 sm:gap-4 p-1 sm:p-2 rounded-lg">
          <TabsTrigger value="fuel" className="flex items-center gap-2 py-2 px-2 sm:py-3 sm:px-4 text-xs sm:text-sm">
            <Fuel className="h-4 w-4" />
            Fuel Requests
          </TabsTrigger>
          <TabsTrigger value="material" className="flex items-center gap-2 py-2 px-2 sm:py-3 sm:px-4 text-xs sm:text-sm">
            <Package className="h-4 w-4" />
            Material Requests
          </TabsTrigger>
          <TabsTrigger value="finance" className="flex items-center gap-2 py-2 px-2 sm:py-3 sm:px-4 text-xs sm:text-sm">
            <CreditCard className="h-4 w-4" />
            Finance Requests
          </TabsTrigger>
          <TabsTrigger value="records" className="flex items-center gap-2 py-2 px-2 sm:py-3 sm:px-4 text-xs sm:text-sm">
            <CheckCircle className="h-4 w-4" />
            Approval Records
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fuel" className="mt-6 space-y-4">
          <AdvancedFilters
            filterOptions={fuelFilterOptions}
            filters={fuelFilter.filters}
            onFilterChange={fuelFilter.updateFilter}
            onClearFilter={fuelFilter.clearFilter}
            onClearAll={fuelFilter.clearAllFilters}
            searchTerm={fuelFilter.searchTerm}
            onSearchChange={fuelFilter.setSearchTerm}
            searchPlaceholder="Search fuel requests..."
            hasActiveFilters={fuelFilter.hasActiveFilters}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {fuelFilter.filteredData.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="material" className="mt-6 space-y-4">
          <AdvancedFilters
            filterOptions={materialFilterOptions}
            filters={materialFilter.filters}
            onFilterChange={materialFilter.updateFilter}
            onClearFilter={materialFilter.clearFilter}
            onClearAll={materialFilter.clearAllFilters}
            searchTerm={materialFilter.searchTerm}
            onSearchChange={materialFilter.setSearchTerm}
            searchPlaceholder="Search material requests..."
            hasActiveFilters={materialFilter.hasActiveFilters}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {materialFilter.filteredData.map((request) => (
              <MaterialRequestCard
                key={request.id}
                request={{
                  ...request,
                  onDiscard: (id: string) => {
                    setMaterialRequests((prev) => prev.filter(r => r.id !== id));
                  },
                }}
                onApprove={async (id) => {
                  await updateDoc(doc(db, "material_requests", id), { status: "approved" });
                  setMaterialRequests((prev) => prev.map(r => r.id === id ? { ...r, status: "approved" } : r));
                }}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="finance" className="mt-6 space-y-4">
          <AdvancedFilters
            filterOptions={financeFilterOptions}
            filters={financeFilter.filters}
            onFilterChange={financeFilter.updateFilter}
            onClearFilter={financeFilter.clearFilter}
            onClearAll={financeFilter.clearAllFilters}
            searchTerm={financeFilter.searchTerm}
            onSearchChange={financeFilter.setSearchTerm}
            searchPlaceholder="Search finance requests..."
            hasActiveFilters={financeFilter.hasActiveFilters}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {financeFilter.filteredData.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="records" className="mt-6">
          <ApprovalRecordsTable fetchAll={fetchAll} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
