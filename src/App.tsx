import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Dashboard } from "./pages/Dashboard";
import VehicleManagement from "./pages/VehicleManagement";
import LeaveRequests from "./pages/LeaveRequests";
import FinanceRequests from "./pages/FinanceRequests";
import ITTickets from "./pages/ITTickets";
import SafetyReports from "./pages/SafetyReports";
import EmployeeDirectory from "./pages/EmployeeDirectory";
import { RouteGuard } from "./components/navigation/RouteGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <RouteGuard requireAuth={false}>
              <Index />
            </RouteGuard>
          } />
          <Route path="/dashboard" element={
            <RouteGuard>
              <Dashboard />
            </RouteGuard>
          } />
          {/* Core application pages - all require authentication */}
          <Route path="/vehicles" element={
            <RouteGuard>
              <VehicleManagement />
            </RouteGuard>
          } />
          <Route path="/leave-requests" element={
            <RouteGuard>
              <LeaveRequests />
            </RouteGuard>
          } />
          <Route path="/finance-requests" element={
            <RouteGuard>
              <FinanceRequests />
            </RouteGuard>
          } />
          <Route path="/it-tickets" element={
            <RouteGuard>
              <ITTickets />
            </RouteGuard>
          } />
          <Route path="/safety-reports" element={
            <RouteGuard>
              <SafetyReports />
            </RouteGuard>
          } />
          <Route path="/employees" element={
            <RouteGuard>
              <EmployeeDirectory />
            </RouteGuard>
          } />
          
          {/* Department-specific routes - all require authentication */}
          <Route path="/field-trip-approvals" element={<RouteGuard><Dashboard /></RouteGuard>} />
          <Route path="/employee-analytics" element={<RouteGuard><Dashboard /></RouteGuard>} />
          <Route path="/vehicle-inspections" element={<RouteGuard><Dashboard /></RouteGuard>} />
          <Route path="/safety-equipment" element={<RouteGuard><Dashboard /></RouteGuard>} />
          <Route path="/compliance-tracking" element={<RouteGuard><Dashboard /></RouteGuard>} />
          <Route path="/vehicle-management" element={<RouteGuard><Dashboard /></RouteGuard>} />
          <Route path="/service-calendar" element={<RouteGuard><Dashboard /></RouteGuard>} />
          <Route path="/document-management" element={<RouteGuard><Dashboard /></RouteGuard>} />
          <Route path="/project-dashboard" element={<RouteGuard><Dashboard /></RouteGuard>} />
          <Route path="/inventory-overview" element={<RouteGuard><Dashboard /></RouteGuard>} />
          <Route path="/vehicle-status" element={<RouteGuard><Dashboard /></RouteGuard>} />
          
          {/* Management department routes */}
          <Route path="/executive-dashboard" element={<RouteGuard><Dashboard /></RouteGuard>} />
          <Route path="/department-analytics" element={<RouteGuard><Dashboard /></RouteGuard>} />
          <Route path="/performance-metrics" element={<RouteGuard><Dashboard /></RouteGuard>} />
          <Route path="/resource-allocation" element={<RouteGuard><Dashboard /></RouteGuard>} />
          
          {/* Additional role-specific routes */}
          <Route path="/user-management" element={<RouteGuard><Dashboard /></RouteGuard>} />
          <Route path="/settings" element={<RouteGuard><Dashboard /></RouteGuard>} />
          <Route path="/finance-approvals" element={<RouteGuard><Dashboard /></RouteGuard>} />
          <Route path="/warehouse-inventory" element={<RouteGuard><Dashboard /></RouteGuard>} />
          <Route path="/procurement-resources" element={<RouteGuard><Dashboard /></RouteGuard>} />
          <Route path="/leave-management" element={<RouteGuard><Dashboard /></RouteGuard>} />
          <Route path="/unified-approvals" element={<RouteGuard><Dashboard /></RouteGuard>} />
          <Route path="/project-tracking" element={<RouteGuard><Dashboard /></RouteGuard>} />
          <Route path="/vehicle-creation" element={<RouteGuard><Dashboard /></RouteGuard>} />
          <Route path="/material-requests" element={<RouteGuard><Dashboard /></RouteGuard>} />
          <Route path="/material-creation" element={<RouteGuard><Dashboard /></RouteGuard>} />
          <Route path="/approved-requests" element={<RouteGuard><Dashboard /></RouteGuard>} />
          <Route path="/analytics" element={<RouteGuard><Dashboard /></RouteGuard>} />
          <Route path="/admin" element={<RouteGuard><Dashboard /></RouteGuard>} />
          <Route path="/supplier-management" element={<RouteGuard><Dashboard /></RouteGuard>} />
          <Route path="/supply-rates" element={<RouteGuard><Dashboard /></RouteGuard>} />
          <Route path="/reorder-alerts" element={<RouteGuard><Dashboard /></RouteGuard>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
