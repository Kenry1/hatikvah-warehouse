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
import { mockInventoryData, mockRequests } from "../../lib/mockData";
import { db } from "../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export const WarehouseDashboard = () => {
  const [inventoryData, setInventoryData] = useState([]);
  // Fetch inventory from Firestore solar_warehouse collection
  useEffect(() => {
    async function fetchInventory() {
      try {
        const snapshot = await getDocs(collection(db, "solar_warehouse"));
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setInventoryData(items);
      } catch (err) {
        console.error("Error fetching inventory:", err);
      }
    }
    fetchInventory();
  }, []);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const handleStockAdded = (newItem) => {
    const newStockItem = {
      ...newItem,
      id: `item-${Date.now()}`, // Ensure a unique ID
      itemCode: newItem.itemCode || `NEW-${Date.now()}`,
    };
    setInventoryData(prev => [...prev, newStockItem]);
  };

  // Calculate dashboard metrics
  const totalItems = inventoryData.length;
  const lowStockItems = inventoryData.filter(item => item.quantity <= item.reorderLevel).length;
  const totalValue = inventoryData.reduce((sum, item) => {
    const quantity = typeof item.quantity === "number" ? item.quantity : 0;
    const unitPrice = typeof item.unitPrice === "number" ? item.unitPrice : 0;
    return sum + (quantity * unitPrice);
  }, 0);
  const pendingRequests = mockRequests.filter(req => req.status === "pending").length;

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
              <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                {lowStockItems} Low Stock
              </Badge>
              <Badge variant="outline">
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
            />
          </TabsContent>

          <TabsContent value="requests">
            <IssueRequestsManager />
          </TabsContent>

          <TabsContent value="add-stock">
            <AddStockForm onStockAdded={handleStockAdded} />
          </TabsContent>

          <TabsContent value="audit">
            <AuditTrail />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};