import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Dashboard } from "./pages/Dashboard";
import VehicleManagement from "./pages/VehicleManagement";
import LeaveRequests from "./pages/LeaveRequests";
import FinanceRequests from "./pages/FinanceRequests";
import ITTickets from "./pages/ITTickets";
import SafetyReports from "./pages/SafetyReports";
import EmployeeDirectory from "./pages/EmployeeDirectory";
import UserManagement from "./pages/UserManagement"; 
import HouseAttendance from "./pages/HouseAttendance"; // Import the new HouseAttendance component
import { FieldTripAlert } from "./pages/FieldTripAlert"; // Import the new FieldTripAlert component
import IncomingTickets from "./pages/IncomingTickets"; // Import IncomingTickets component
import AssetInventory from "./pages/AssetInventory"; // Import AssetInventory component
import SafetyReportsViewer from "./pages/sreportsv"; // Import the new SafetyReportsViewer component
import SiteDocumentation from "./pages/SiteDocumentation";
import { RouteGuard } from "./components/navigation/RouteGuard";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import ProjectTrackingPage from "./pages/ProjectTrackingPage";
// DriveOAuthTest removed after OAuth wiring was verified

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
  <Routes>
          <Route path="/" element={
            <RouteGuard requireAuth={false}>
              <Index />
            </RouteGuard>
          } />
          
          {/* Parent Route for Authenticated Layout */}
          <Route 
            element={
              <RouteGuard>
                <DashboardLayout>
                  <Outlet /> {/* Renders child routes here */}
                </DashboardLayout>
              </RouteGuard>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Core application pages */}
            <Route path="/vehicles" element={<VehicleManagement />} />
            <Route path="/leave-requests" element={<LeaveRequests />} />
            <Route path="/finance-requests" element={<FinanceRequests />} />
            <Route path="/it-tickets" element={<ITTickets />} />
            <Route path="/safety-reports" element={<SafetyReports />} />
            <Route path="/employees" element={<EmployeeDirectory />} />
            
            {/* Department-specific routes */}
            <Route path="/field-trip-approvals" element={<Dashboard />} />
            <Route path="/employee-analytics" element={<Dashboard />} />
            <Route path="/vehicle-inspections" element={<Dashboard />} />
            <Route path="/safety-equipment" element={<Dashboard />} />
            <Route path="/compliance-tracking" element={<Dashboard />} />
            <Route path="/vehicle-management" element={<Dashboard />} />
            <Route path="/service-calendar" element={<Dashboard />} />
            <Route path="/document-management" element={<Dashboard />} />
            <Route path="/project-dashboard" element={<Dashboard />} />
            <Route path="/inventory-overview" element={<Dashboard />} />
            <Route path="/vehicle-status" element={<Dashboard />} />
            
            {/* Management department routes */}
            <Route path="/executive-dashboard" element={<Dashboard />} />
            <Route path="/department-analytics" element={<Dashboard />} />
            <Route path="/performance-metrics" element={<Dashboard />} />
            <Route path="/resource-allocation" element={<Dashboard />} />
            
            {/* Additional role-specific routes */}
            <Route path="/user-management" element={<UserManagement />} />
            <Route path="/settings" element={<Dashboard />} />
            <Route path="/finance-approvals" element={<Dashboard />} />
            <Route path="/warehouse-inventory" element={<Dashboard />} />
            <Route path="/project-tracking" element={<ProjectTrackingPage />} />
            <Route path="/procurement-resources" element={<Dashboard />} />
            <Route path="/leave-management" element={<Dashboard />} />
            <Route path="/unified-approvals" element={<Dashboard />} />
            <Route path="/project-tracking" element={<Dashboard />} />
            <Route path="/vehicle-creation" element={<Dashboard />} />
            <Route path="/material-requests" element={<Dashboard />} />
            <Route path="/material-creation" element={<Dashboard />} />
            <Route path="/approved-requests" element={<Dashboard />} />
            <Route path="/analytics" element={<Dashboard />} />
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/supplier-management" element={<Dashboard />} />
            <Route path="/supply-rates" element={<Dashboard />} />
            <Route path="/reorder-alerts" element={<Dashboard />} />
            <Route path="/attendance/house" element={<HouseAttendance />} />
            <Route path="/field-trip-alert" element={<FieldTripAlert />} />
            <Route path="/incoming-tickets" element={<IncomingTickets />} /> 
            <Route path="/it-assets" element={<AssetInventory />} /> {/* New route for AssetInventory */} 
            <Route path="/sreportsv" element={<SafetyReportsViewer />} /> {/* New route for SafetyReportsViewer */} 
            {/* Site Documentation canonical route */}
            <Route path="/site-documentation" element={<SiteDocumentation />} />
            <Route path="/site-documentation/*" element={<SiteDocumentation />} />
            {/* Legacy / short aliases redirect to canonical */}
            <Route path="/site-docs" element={<Navigate to="/site-documentation" replace />} />
            <Route path="/site-docs/*" element={<Navigate to="/site-documentation" replace />} />
            <Route path="/site-doc" element={<Navigate to="/site-documentation" replace />} />
            {/* Drive OAuth test route removed */}
      </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
  </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
