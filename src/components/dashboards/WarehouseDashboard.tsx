import { useState } from "react";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Package, AlertTriangle, Clock, TrendingUp } from "lucide-react";
import { InventoryOverview } from "../InventoryOverview";
import { IssueRequestsManager } from "../IssueRequestsManager";
import { AddStockForm } from "../AddStockForm";
import { AuditTrail } from "../AuditTrail";
import { mockInventoryData } from "../../lib/mockData";
import { db } from "../../lib/firebase";
import { collection, getDocs, doc, updateDoc, increment, query, orderBy, limit, startAfter, DocumentSnapshot, addDoc, Timestamp } from "firebase/firestore";
import { IssueStockForm, IssueStockPayload } from "../IssueStockForm";

export const WarehouseDashboard = () => {
  // Requests refresh trigger for IssueRequestsManager
  const [requestsRefreshKey, setRequestsRefreshKey] = useState(0);
  useEffect(() => {
    const handler = () => setRequestsRefreshKey((k) => k + 1);
    window.addEventListener('materialRequests:refresh', handler);
    return () => window.removeEventListener('materialRequests:refresh', handler);
  }, []);
  // Delete inventory item from Firestore and update local state
  const handleDelete = async (itemId: string) => {
    try {
      await updateDoc(doc(db, "solar_warehouse", itemId), { deleted: true }); // Soft delete for safety
      setInventoryData(prev => prev.filter((it: any) => String(it.id) !== String(itemId)));
    } catch (err) {
      console.error("Error deleting inventory item in Firestore:", err);
    }
  };
  // Persist category change to Firestore and update local state
  const handleCategoryChange = async (itemId: string, newCategory: string) => {
    try {
      const ref = doc(db, "solar_warehouse", itemId);
      await updateDoc(ref, { category: newCategory });
      setInventoryData(prev => prev.map((it: any) =>
        String(it.id) === String(itemId)
          ? { ...it, category: newCategory }
          : it
      ));
    } catch (err) {
      console.error("Error updating category in Firestore:", err);
    }
  };
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const PAGE_SIZE = 25;
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  // Fetch inventory from Firestore solar_warehouse collection
  useEffect(() => {
  async function fetchInventory() {
      try {
    // Initial page ordered by createdAt desc
    const q = query(collection(db, "solar_warehouse"), orderBy("createdAt", "desc"), limit(PAGE_SIZE));
    const snapshot = await getDocs(q);
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setInventoryData(items);
        const last = snapshot.docs[snapshot.docs.length - 1] || null;
        setLastDoc(last);
        setHasMore(snapshot.size === PAGE_SIZE);
      } catch (err) {
        console.error("Error fetching inventory:", err);
      }
    }
    fetchInventory();
  }, []);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  // Firestore-backed KPI for pending requests
  const [pendingRequestCount, setPendingRequestCount] = useState(0);

  // Fetch count of pending/submitted material requests
  const refreshPendingCount = async () => {
    try {
      const snapshot = await getDocs(collection(db, "material_requests"));
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() as any }));
      const count = items.filter((r: any) => r.status === "pending" || r.status === "submitted").length;
      setPendingRequestCount(count);
    } catch (err) {
      console.error("Error fetching pending requests count:", err);
    }
  };

  useEffect(() => {
    // initial load
    refreshPendingCount();
    // refresh when global material requests events fire
    const handler = () => refreshPendingCount();
    window.addEventListener('materialRequests:refresh', handler);
    return () => window.removeEventListener('materialRequests:refresh', handler);
  }, []);

  const loadMore = async () => {
    if (!hasMore || loadingMore || !lastDoc) return;
    setLoadingMore(true);
    try {
      const q = query(
        collection(db, "solar_warehouse"),
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(PAGE_SIZE)
      );
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setInventoryData(prev => [...prev, ...items]);
      const last = snapshot.docs[snapshot.docs.length - 1] || null;
      setLastDoc(last);
      setHasMore(snapshot.size === PAGE_SIZE);
    } catch (err) {
      console.error("Error loading more inventory:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleStockAdded = (newItem) => {
    // newItem already contains Firestore doc id from AddStockForm
    const withDefaults = {
      ...newItem,
      itemCode: newItem.itemCode || `NEW-${Date.now()}`,
    } as any;
    setInventoryData(prev => [...prev, withDefaults]);
  };

  // Persist restock to Firestore and update local state
  const handleRestock = async (itemId: string, addQuantity: number) => {
    try {
      const ref = doc(db, "solar_warehouse", itemId);
      await updateDoc(ref, {
        availableQuantity: increment(addQuantity),
        quantity: increment(addQuantity),
      });
      setInventoryData(prev => prev.map((it: any) =>
        String(it.id) === String(itemId)
          ? { ...it, quantity: (Number(it.quantity) || 0) + addQuantity, availableQuantity: (Number((it as any).availableQuantity) || Number(it.quantity) || 0) + addQuantity }
          : it
      ));
    } catch (err) {
      console.error("Error updating stock in Firestore:", err);
    }
  };

  // NEW: Persist stock reduction to Firestore and update local state
  const handleReduceStock = async (itemId: string, reduceQuantity: number) => {
    try {
      if (reduceQuantity <= 0) return;
      // Find current item to clamp
      const current = inventoryData.find((it: any) => String(it.id) === String(itemId));
      const currentQty = Number(current?.quantity) || 0;
      const clamp = Math.min(reduceQuantity, currentQty);
      if (clamp <= 0) return;
      const ref = doc(db, "solar_warehouse", itemId);
      await updateDoc(ref, {
        availableQuantity: increment(-clamp),
        quantity: increment(-clamp),
      });
      setInventoryData(prev => prev.map((it: any) =>
        String(it.id) === String(itemId)
          ? { ...it, quantity: Math.max(0, (Number(it.quantity) || 0) - clamp), availableQuantity: Math.max(0, (Number((it as any).availableQuantity) || 0) - clamp) }
          : it
      ));
    } catch (err) {
      console.error("Error reducing stock in Firestore:", err);
    }
  };

  // Persist unit change to Firestore and update local state
  const handleUnitChange = async (itemId: string, newUnit: string) => {
    try {
      const ref = doc(db, "solar_warehouse", itemId);
      await updateDoc(ref, { unit: newUnit });
      setInventoryData(prev => prev.map((it: any) =>
        String(it.id) === String(itemId)
          ? { ...it, unit: newUnit }
          : it
      ));
    } catch (err) {
      console.error("Error updating unit in Firestore:", err);
    }
  };

  // Calculate dashboard metrics
  const totalItems = inventoryData.length;
  const lowStockItems = inventoryData.filter(item => item.quantity <= item.reorderLevel).length;
  const totalValue = inventoryData.reduce((sum, item) => {
    const quantity = typeof item.quantity === "number" ? item.quantity : 0;
    const unitPrice = typeof item.unitPrice === "number" ? item.unitPrice : 0;
    return sum + (quantity * unitPrice);
  }, 0);
  const pendingRequests = pendingRequestCount;

  // NEW: Issue stock handler
  const handleIssueStock = async ({ materialId, siteName, requestedBy, quantity, notes }: IssueStockPayload) => {
    // Clamp issuance to available stock
    const current = inventoryData.find((it: any) => String(it.id) === String(materialId));
    const currentQty = Number(current?.quantity) || 0;
    const issueQty = Math.min(quantity, currentQty);
    if (issueQty <= 0) return;

    // 1) Decrement warehouse quantities
    const ref = doc(db, "solar_warehouse", materialId);
    await updateDoc(ref, {
      availableQuantity: increment(-issueQty),
      quantity: increment(-issueQty),
    });

    // 2) Create a material_requests entry marked as issued for audit consistency
    const req = {
      siteName,
      requestedByUsername: requestedBy,
      status: "issued",
      items: [{ materialId, quantity: issueQty }],
      issuedBy: (await import("@/contexts/AuthContext")).useAuth().user?.username || "",
      companyId: (await import("@/contexts/AuthContext")).useAuth().user?.companyId || "",
      createdAt: Timestamp.now(),
      fulfilledDate: Timestamp.now(),
      notes: notes || "",
    };
    await addDoc(collection(db, "material_requests"), req);

    // 3) Update local state
    setInventoryData(prev => prev.map((it: any) =>
      String(it.id) === String(materialId)
        ? { ...it, quantity: Math.max(0, (Number(it.quantity) || 0) - issueQty), availableQuantity: Math.max(0, (Number((it as any).availableQuantity) || 0) - issueQty) }
        : it
    ));

    // 4) Notify listeners (KPI, requests tables)
    window.dispatchEvent(new CustomEvent('materialRequests:refresh'));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
            <div className="flex items-center space-x-3">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">SOLAR store</h1>
                <p className="text-sm text-muted-foreground">Warehouse Inventory Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Badge className="border border-yellow-500 text-yellow-500">
                {lowStockItems} Low Stock
              </Badge>
              <Badge className="border">
                {pendingRequests} Pending Requests
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6">
        {/* Alert for low stock */}
        {lowStockItems > 0 && (
          <Alert className="mb-6 border-yellow-500 bg-yellow-500/10 text-yellow-700">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <AlertDescription>
              <strong>{lowStockItems} items</strong> are below reorder level and need restocking.
            </AlertDescription>
          </Alert>
        )}

        {/* Dashboard Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItems}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{lowStockItems}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">KES {totalValue.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{pendingRequests}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="inventory" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="inventory">Inventory Overview</TabsTrigger>
            <TabsTrigger value="requests">Issue Requests</TabsTrigger>
            <TabsTrigger value="add-stock">Add Stock</TabsTrigger>
            <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory">
            <InventoryOverview 
              data={inventoryData} 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              onRestock={handleRestock}
              onReduceStock={handleReduceStock}
              onUnitChange={handleUnitChange}
              onCategoryChange={handleCategoryChange}
              onDelete={handleDelete}
              onLoadMore={loadMore}
              hasMore={hasMore}
              loadingMore={loadingMore}
            />
          </TabsContent>

          <TabsContent value="requests">
            <IssueRequestsManager fetchAll refreshKey={requestsRefreshKey} />
          </TabsContent>

          <TabsContent value="add-stock">
            <AddStockForm onStockAdded={handleStockAdded} />
            <div className="h-6" />
            <IssueStockForm materials={inventoryData.map(it => ({ id: it.id, itemName: it.itemName, itemCode: it.itemCode, unit: it.unit, quantity: it.quantity }))} onIssue={handleIssueStock} />
          </TabsContent>

          <TabsContent value="audit">
            <AuditTrail />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};