import { useState, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricsCard } from "../../components/MetricsCard";
import { RequestsTable } from "../RequestsTable";
import { NewRequestForm } from "../NewRequestForm";
import { warehouseStock, sites } from "../../lib/mockData";
import { MaterialRequest } from "../../types/inventory";
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Plus,
  Warehouse,
  MapPin,
  DollarSign,
  BarChart3
} from "lucide-react";
import { db } from "../../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";
import { AuthContext } from "../../contexts/AuthContext";

function SiteEngineerDashboard() {
  const { user } = useContext(AuthContext) || {};
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaterialRequest | null>(null);
  const [stockData, setStockData] = useState([]);
  const [materialRequests, setMaterialRequests] = useState([]);

  // Metrics state
  const [metrics, setMetrics] = useState({
    totalRequests: 0,
    fulfilledRequests: 0,
    pendingRequests: 0,
    partialRequests: 0,
    totalStockValue: 0,
    lowStockItems: 0,
  });

  // Update metrics whenever materialRequests changes
  useEffect(() => {
    const totalRequests = materialRequests.length;
    const fulfilledRequests = materialRequests.filter(r => r.status === "fulfilled").length;
    const pendingRequests = materialRequests.filter(r => r.status === "pending").length;
    const partialRequests = materialRequests.filter(r => r.status === "partial").length;
    setMetrics(prev => ({
      ...prev,
      totalRequests,
      fulfilledRequests,
      pendingRequests,
      partialRequests,
    }));
  }, [materialRequests]);

  useEffect(() => {
    // Real-time listeners for stock and requests
    const unsubStock = onSnapshot(
      collection(db, "solar_warehouse"),
      (snapshot) => {
        const stockItems = snapshot.docs.map(doc => {
          const d = doc.data();
          return {
            id: doc.id,
            materialId: d.materialId ?? d.id ?? doc.id,
            materialName: d.materialName ?? d.itemName ?? "",
            category: d.category ?? "",
            unit: d.unit ?? "",
            availableQuantity: d.availableQuantity ?? d.quantity ?? 0,
            minStockLevel: d.minStockLevel ?? d.reorderLevel ?? 0,
            unitPrice: d.unitPrice ?? 0,
            totalValue: d.totalValue ?? d.totalStockValue ?? 0,
            lastUpdated: d.lastUpdated ? new Date(d.lastUpdated) : new Date(),
          };
        });
        setStockData(stockItems);

        // Compute metrics from stock data
        let totalStockValue = 0;
        let lowStockItems = 0;
        stockItems.forEach(stock => {
          totalStockValue += stock.totalValue || 0;
          if (stock.availableQuantity <= (stock.minStockLevel ?? 0)) lowStockItems++;
        });
        setMetrics(prev => ({ ...prev, totalStockValue, lowStockItems }));
      }
    );

    const unsubRequests = onSnapshot(
      collection(db, "material_requests"),
      (snapshot) => {
        // Only include requests for the logged-in user
        const requests = snapshot.docs.map(doc => {
          const d = doc.data();
          return {
            id: doc.id,
            ...d
          } as MaterialRequest;
        }).filter(r => user && r.requestedBy && r.requestedBy === user.id);
        setMaterialRequests(requests);
      }
    );

    return () => {
      unsubStock();
      unsubRequests();
    };
  }, []);

  useEffect(() => {
    async function fetchMaterialRequests() {
      if (!user) return;
      try {
        const q = query(collection(db, "material_requests"), where("requestedBy", "==", user.id));
        const snapshot = await getDocs(q);
        const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMaterialRequests(requests);
      } catch (err) {
        console.error("Error fetching material requests from Firestore:", err);
      }
    }
    fetchMaterialRequests();
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-2 sm:px-4 md:px-6 py-4 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Material Requests Dashboard</h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
              Monitor and manage material requests across all construction sites
            </p>
          </div>
          <Button 
            onClick={() => setShowNewRequestForm(true)}
            variant="default"
            size="lg"
            className="w-full md:w-auto"
          >
            <Plus className="h-5 w-5 mr-2" />
            Request Materials
          </Button>
        </div>

  {/* Key Metrics */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <MetricsCard
            title="Total Requests"
            value={metrics.totalRequests > 0 ? metrics.totalRequests : "N/A"}
            subtitle="All time"
            icon={Package}
            trend={{ value: metrics.totalRequests > 0 ? `+${metrics.totalRequests} this month` : "", positive: true }}
          />
          <MetricsCard
            title="Fulfillment Rate"
            value={metrics.totalRequests > 0 ? `${Math.round((metrics.fulfilledRequests / metrics.totalRequests) * 100)}%` : "N/A"}
            subtitle={metrics.totalRequests > 0 ? `${metrics.fulfilledRequests} of ${metrics.totalRequests} fulfilled` : "N/A"}
            icon={CheckCircle}
            variant="success"
            trend={{ value: metrics.fulfilledRequests > 0 ? "+5.2% improvement" : "", positive: true }}
          />
          <MetricsCard
            title="Pending Requests"
            value={metrics.totalRequests > 0 ? metrics.pendingRequests + metrics.partialRequests : "N/A"}
            subtitle={metrics.totalRequests > 0 ? `${metrics.pendingRequests} pending, ${metrics.partialRequests} partial` : "N/A"}
            icon={Clock}
            variant={metrics.pendingRequests > 5 ? "warning" : "default"}
          />
          <MetricsCard
            title="Stock Value"
            value={metrics.totalStockValue > 0 ? `KSh ${Math.round(metrics.totalStockValue / 1000)}K` : "N/A"}
            subtitle={metrics.totalStockValue > 0 ? "Current inventory" : "N/A"}
            icon={Warehouse}
            variant={metrics.lowStockItems > 0 ? "warning" : "default"}
            trend={{ value: metrics.lowStockItems > 0 ? `${metrics.lowStockItems} low stock items` : "", positive: false }}
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 p-1 sm:p-2 rounded-lg">
            <TabsTrigger value="requests" className="py-2 px-2 sm:py-3 sm:px-4 text-xs sm:text-sm">Material Requests</TabsTrigger>
            <TabsTrigger value="inventory" className="py-2 px-2 sm:py-3 sm:px-4 text-xs sm:text-sm">Inventory Status</TabsTrigger>
            <TabsTrigger value="analytics" className="py-2 px-2 sm:py-3 sm:px-4 text-xs sm:text-sm">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Material Requests</CardTitle>
                <CardDescription>
                  All material requests from construction sites with fulfillment status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto w-full">
                  <div className="block sm:hidden">
                    {/* Mobile: show compact table or cards */}
                    <RequestsTable 
                      requests={materialRequests}
                      onViewDetails={setSelectedRequest}
                      variant="mobile"
                    />
                  </div>
                  <div className="hidden sm:block md:hidden">
                    {/* Tablet: show medium table */}
                    <RequestsTable 
                      requests={materialRequests}
                      onViewDetails={setSelectedRequest}
                      variant="tablet"
                    />
                  </div>
                  <div className="hidden md:block">
                    {/* Desktop: show full table */}
                    <RequestsTable 
                      requests={materialRequests}
                      onViewDetails={setSelectedRequest}
                      variant="desktop"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Current Stock Levels
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stockData.slice(0, 5).map((stock) => (
                      <div key={stock.materialId || stock.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{stock.materialName}</p>
                          <p className="text-sm text-muted-foreground">{typeof stock.category === "string" ? stock.category : "unknown"}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{stock.availableQuantity} {stock.unit || ""}</p>
                          <p className={`text-sm ${stock.availableQuantity <= (stock.minStockLevel ?? 0)
                            ? "text-danger"
                            : "text-muted-foreground"
                          }`}>
                            Min: {stock.minStockLevel ?? 0}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    Low Stock Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stockData.filter(stock => stock.availableQuantity <= (stock.minStockLevel ?? 0)).slice(0, 5).length > 0 ? (
                    <div className="space-y-3">
                      {stockData.filter(stock => stock.availableQuantity <= (stock.minStockLevel ?? 0)).slice(0, 5).map((item) => (
                        <div key={item.materialId || item.id} className="p-3 border border-warning/20 bg-warning/5 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-warning-foreground">{item.materialName}</p>
                              <p className="text-sm text-muted-foreground">
                                Available: {item.availableQuantity} {item.unit || ""}
                              </p>
                            </div>
                            <Button variant="outline" size="sm">
                              Reorder
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      All items are sufficiently stocked
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Requests by Site
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Get unique site names from materialRequests */}
                    {Array.from(new Set(materialRequests.map(r => r.siteName).filter(Boolean))).slice(0, 5).map((siteName) => {
                      const siteRequests = materialRequests.filter(r => r.siteName === siteName).length;
                      return (
                        <div key={siteName} className="flex justify-between items-center">
                          <span className="text-sm">{siteName}</span>
                          <span className="font-semibold">{siteRequests}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Priority Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Urgent</span>
                      <span className="font-semibold text-danger">{materialRequests.filter(r => r.priority === "urgent").length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">High</span>
                      <span className="font-semibold text-warning">{materialRequests.filter(r => r.priority === "high").length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Medium</span>
                      <span className="font-semibold text-primary">{materialRequests.filter(r => r.priority === "medium").length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Low</span>
                      <span className="font-semibold text-muted-foreground">{materialRequests.filter(r => r.priority === "low").length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Cost Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Requests Value</span>
                      <span className="font-semibold">
                        KSh {materialRequests.reduce((sum, r) => sum + (r.totalCost || 0), 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Avg. Request Value</span>
                      <span className="font-semibold">
                        KSh {materialRequests.length > 0 ? Math.round(materialRequests.reduce((sum, r) => sum + (r.totalCost || 0), 0) / materialRequests.length).toLocaleString() : "0"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Inventory Value</span>
                      <span className="font-semibold">KSh {Math.round(stockData.reduce((sum, stock) => sum + (stock.totalValue || 0), 0)).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* New Request Form */}
        <NewRequestForm 
          open={showNewRequestForm}
          onOpenChange={setShowNewRequestForm}
        />
      </div>
    </div>
  );
}
export default SiteEngineerDashboard;