import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricsCard } from "../../components/MetricsCard";
import { RequestsTable } from "../RequestsTable";
import { NewRequestForm } from "../NewRequestForm";
import { warehouseStock, sites, materialRequests } from "../../lib/mockData";
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

export default function Dashboard() {
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaterialRequest | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 sm:p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Material Requests Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Monitor and manage material requests across all construction sites
            </p>
          </div>
          <Button 
            onClick={() => setShowNewRequestForm(true)}
            variant="default"
            size="lg"
            className="w-full sm:w-auto"
          >
            <Plus className="h-5 w-5 mr-2" />
            Request Materials
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricsCard
            title="Total Requests"
            value={warehouseStock.reduce((sum, stock) => sum + stock.totalRequests, 0)}
            subtitle="All time"
            icon={Package}
            trend={{ value: "+12% from last month", positive: true }}
          />
          <MetricsCard
            title="Fulfillment Rate"
            value={`${Math.round((warehouseStock.reduce((sum, stock) => sum + stock.fulfilledRequests, 0) / warehouseStock.reduce((sum, stock) => sum + stock.totalRequests, 0)) * 100)}%`}
            subtitle={`${warehouseStock.reduce((sum, stock) => sum + stock.fulfilledRequests, 0)} of ${warehouseStock.reduce((sum, stock) => sum + stock.totalRequests, 0)} fulfilled`}
            icon={CheckCircle}
            variant="success"
            trend={{ value: "+5.2% improvement", positive: true }}
          />
          <MetricsCard
            title="Pending Requests"
            value={warehouseStock.reduce((sum, stock) => sum + stock.pendingRequests, 0) + warehouseStock.reduce((sum, stock) => sum + stock.partialRequests, 0)}
            subtitle={`${warehouseStock.reduce((sum, stock) => sum + stock.pendingRequests, 0)} pending, ${warehouseStock.reduce((sum, stock) => sum + stock.partialRequests, 0)} partial`}
            icon={Clock}
            variant={warehouseStock.reduce((sum, stock) => sum + stock.pendingRequests, 0) > 5 ? "warning" : "default"}
          />
          <MetricsCard
            title="Stock Value"
            value={`KSh ${Math.round(warehouseStock.reduce((sum, stock) => sum + stock.totalStockValue, 0) / 1000)}K`}
            subtitle="Current inventory"
            icon={Warehouse}
            variant={warehouseStock.some(stock => stock.availableQuantity <= stock.minStockLevel) ? "warning" : "default"}
            trend={{ value: `${warehouseStock.filter(stock => stock.availableQuantity <= stock.minStockLevel).length} low stock items`, positive: false }}
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
                <RequestsTable 
                  requests={materialRequests}
                  onViewDetails={(request) => setSelectedRequest(request)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Current Stock Levels
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {warehouseStock.map((stock) => (
                      <div key={stock.materialId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{stock.materialName}</p>
                          <p className="text-sm text-muted-foreground">{stock.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{stock.availableQuantity} {stock.unit}</p>
                          <p className={`text-sm ${stock.availableQuantity <= stock.minStockLevel 
                            ? "text-danger" 
                            : "text-muted-foreground"
                          }`}>
                            Min: {stock.minStockLevel}
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
                  {warehouseStock.filter(stock => stock.availableQuantity <= stock.minStockLevel).length > 0 ? (
                    <div className="space-y-3">
                      {warehouseStock.filter(stock => stock.availableQuantity <= stock.minStockLevel).map((item) => (
                        <div key={item.materialId} className="p-3 border border-warning/20 bg-warning/5 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-warning-foreground">{item.materialName}</p>
                              <p className="text-sm text-muted-foreground">
                                Available: {item.availableQuantity} {item.unit}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Requests by Site
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sites.slice(0, 5).map((site) => {
                      const siteRequests = warehouseStock.filter(r => r.siteId === site.id).length;
                      return (
                        <div key={site.id} className="flex justify-between items-center">
                          <span className="text-sm">{site.name}</span>
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
                      <span className="font-semibold text-danger">{warehouseStock.reduce((sum, stock) => sum + stock.priorityBreakdown.urgent, 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">High</span>
                      <span className="font-semibold text-warning">{warehouseStock.reduce((sum, stock) => sum + stock.priorityBreakdown.high, 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Medium</span>
                      <span className="font-semibold text-primary">{warehouseStock.reduce((sum, stock) => sum + stock.priorityBreakdown.medium, 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Low</span>
                      <span className="font-semibold text-muted-foreground">{warehouseStock.reduce((sum, stock) => sum + stock.priorityBreakdown.low, 0)}</span>
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
                        KSh {warehouseStock.reduce((sum, stock) => sum + stock.totalRequestsValue, 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Avg. Request Value</span>
                      <span className="font-semibold">
                        KSh {Math.round(warehouseStock.reduce((sum, stock) => sum + stock.totalRequestsValue, 0) / warehouseStock.length).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Inventory Value</span>
                      <span className="font-semibold">KSh {Math.round(warehouseStock.reduce((sum, stock) => sum + stock.totalStockValue, 0)).toLocaleString()}</span>
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