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
  submittedRequests: 0,
  approvedRequests: 0,
  issuedRequests: 0,
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
        // Map all requests from snapshot
        const allRequests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];

        // Filter to requests made by the logged-in user only and ensure status is a non-empty string
        const userRequests = user ? allRequests.filter(r => r.requestedBy === user.id && typeof r.status === 'string' && r.status.trim() !== '') : [];

  // Compute counts from user's requests using new statuses
  const submittedCount = userRequests.filter(r => r.status === 'submitted').length;
  const approvedCount = userRequests.filter(r => r.status === 'approved').length;
  const issuedCount = userRequests.filter(r => r.status === 'issued').length;

  setMetrics(prev => ({ ...prev, submittedRequests: submittedCount, approvedRequests: approvedCount, issuedRequests: issuedCount }));
        setMaterialRequests(userRequests as MaterialRequest[]);
      }
    );

    return () => {
      unsubStock();
      unsubRequests();
    };
  }, [user]);

  useEffect(() => {
    async function fetchMaterialRequests() {
      if (!user) return;
      try {
        const q = query(collection(db, "material_requests"), where("requestedBy", "==", user.id));
        const snapshot = await getDocs(q);
        const requests = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(r => typeof (r as any).status === 'string' && (r as any).status.trim() !== '');
        setMaterialRequests(requests as any[]);
      } catch (err) {
        console.error("Error fetching material requests from Firestore:", err);
      }
    }
    fetchMaterialRequests();
  }, [user]);

  // Compute month-to-date new requests (using requestDate or createdAt fallback)
  const monthNewRequests = (() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return materialRequests.filter((r: any) => {
      const dRaw = r.requestDate || r.requestedDate || r.createdAt;
      if (!dRaw) return false;
      const d = new Date(dRaw);
      if (isNaN(d.getTime())) return false;
      return d >= monthStart;
    }).length;
  })();

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
          {(() => {
            const issuedCount = materialRequests.filter((r: any) => r.status === 'issued').length;
            const progressTotal = materialRequests.filter((r: any) => ['submitted','approved','issued'].includes(r.status)).length;
            const rate = progressTotal > 0 ? Math.round((issuedCount / progressTotal) * 100) : null;
            return (
              <MetricsCard
                title="Fulfillment Rate"
                value={rate !== null ? `${rate}%` : 'N/A'}
                subtitle={progressTotal > 0 ? `${issuedCount} issued of ${progressTotal} active` : 'No active requests'}
                icon={CheckCircle}
                variant={rate !== null && rate >= 60 ? 'success' : 'default'}
                trend={{ value: issuedCount > 0 ? `+${issuedCount} issued` : '', positive: true }}
              />
            );
          })()}
          {(() => {
            const pendingCount = (metrics.submittedRequests || 0) + (metrics.approvedRequests || 0);
            const issuedCount = metrics.issuedRequests || 0;
            const subtitle = `${pendingCount} pending (S:${metrics.submittedRequests || 0} + A:${metrics.approvedRequests || 0}) vs ${issuedCount} issued`;
            return (
              <MetricsCard
                title="Pending Requests"
                value={pendingCount > 0 ? pendingCount : (pendingCount === 0 ? 0 : 'N/A')}
                subtitle={subtitle}
                icon={Clock}
                variant={pendingCount > issuedCount ? 'warning' : 'default'}
                trend={{ value: issuedCount > 0 ? `${issuedCount} issued` : '', positive: issuedCount > 0 }}
              />
            );
          })()}
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
                {/* Status Tabs */}
                <Tabs defaultValue="all" className="space-y-4">
                  <TabsList className="grid grid-cols-2 sm:inline-flex w-full sm:w-auto">
                    <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
                    <TabsTrigger value="submitted" className="text-xs sm:text-sm">Submitted ({metrics.submittedRequests})</TabsTrigger>
                    <TabsTrigger value="approved" className="text-xs sm:text-sm">Approved ({metrics.approvedRequests})</TabsTrigger>
                    <TabsTrigger value="issued" className="text-xs sm:text-sm">Issued ({metrics.issuedRequests})</TabsTrigger>
                  </TabsList>

                  {/* All */}
                  <TabsContent value="all" className="space-y-2">
                    <div className="overflow-x-auto w-full">
                      <div className="block sm:hidden">
                        <RequestsTable 
                          requests={materialRequests}
                          onViewDetails={setSelectedRequest}
                          variant="mobile"
                          showActions={false}
                        />
                      </div>
                      <div className="hidden sm:block md:hidden">
                        <RequestsTable 
                          requests={materialRequests}
                          onViewDetails={setSelectedRequest}
                          variant="tablet"
                          showActions={false}
                        />
                      </div>
                      <div className="hidden md:block">
                        <RequestsTable 
                          requests={materialRequests}
                          onViewDetails={setSelectedRequest}
                          variant="desktop"
                          showActions={false}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Submitted */}
                  <TabsContent value="submitted" className="space-y-2">
                    <div className="overflow-x-auto w-full">
                      <div className="block sm:hidden">
                        <RequestsTable 
                          requests={materialRequests}
                          onViewDetails={setSelectedRequest}
                          variant="mobile"
                          showActions={false}
                          statusScope="submitted"
                        />
                      </div>
                      <div className="hidden sm:block md:hidden">
                        <RequestsTable 
                          requests={materialRequests}
                          onViewDetails={setSelectedRequest}
                          variant="tablet"
                          showActions={false}
                          statusScope="submitted"
                        />
                      </div>
                      <div className="hidden md:block">
                        <RequestsTable 
                          requests={materialRequests}
                          onViewDetails={setSelectedRequest}
                          variant="desktop"
                          showActions={false}
                          statusScope="submitted"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Approved */}
                  <TabsContent value="approved" className="space-y-2">
                    <div className="overflow-x-auto w-full">
                      <div className="block sm:hidden">
                        <RequestsTable 
                          requests={materialRequests}
                          onViewDetails={setSelectedRequest}
                          variant="mobile"
                          showActions={false}
                          statusScope="approved"
                        />
                      </div>
                      <div className="hidden sm:block md:hidden">
                        <RequestsTable 
                          requests={materialRequests}
                          onViewDetails={setSelectedRequest}
                          variant="tablet"
                          showActions={false}
                          statusScope="approved"
                        />
                      </div>
                      <div className="hidden md:block">
                        <RequestsTable 
                          requests={materialRequests}
                          onViewDetails={setSelectedRequest}
                          variant="desktop"
                          showActions={false}
                          statusScope="approved"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Issued */}
                  <TabsContent value="issued" className="space-y-2">
                    <div className="overflow-x-auto w-full">
                      <div className="block sm:hidden">
                        <RequestsTable 
                          requests={materialRequests}
                          onViewDetails={setSelectedRequest}
                          variant="mobile"
                          showActions={false}
                          statusScope="issued"
                        />
                      </div>
                      <div className="hidden sm:block md:hidden">
                        <RequestsTable 
                          requests={materialRequests}
                          onViewDetails={setSelectedRequest}
                          variant="tablet"
                          showActions={false}
                          statusScope="issued"
                        />
                      </div>
                      <div className="hidden md:block">
                        <RequestsTable 
                          requests={materialRequests}
                          onViewDetails={setSelectedRequest}
                          variant="desktop"
                          showActions={false}
                          statusScope="issued"
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Total Requests
                  </CardTitle>
                  <CardDescription>All time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold tracking-tight">{metrics.totalRequests}</div>
                  <p className="text-sm mt-2 {monthNewRequests > 0 ? 'text-success' : 'text-muted-foreground'}">
                    {monthNewRequests > 0 ? `+${monthNewRequests} this month` : 'No new requests this month'}
                  </p>
                </CardContent>
              </Card>
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