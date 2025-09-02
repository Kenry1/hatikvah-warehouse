import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ICTDashboard } from '@/components/dashboards/ICTDashboard';
import { FinanceDashboard } from '@/components/dashboards/FinanceDashboard';
import { EmployeeDashboard } from '@/components/dashboards/EmployeeDashboard';
import { HRDashboard } from '@/components/dashboards/HRDashboard';
import { SafetyDashboard } from '@/components/dashboards/SafetyDashboard';
import { LogisticsDashboard } from '@/components/dashboards/LogisticsDashboard';
import { OperationsDashboard } from '@/components/dashboards/OperationsDashboard';
import ImplementationManagerDashboard from '@/components/dashboards/ImplementationManagerDashboard';
import { ProjectManagerDashboard } from '@/components/dashboards/ProjectManagerDashboard';
import SiteEngineerDashboard from '@/components/dashboards/SiteEngineerDashboard';
import { WarehouseDashboard } from '@/components/dashboards/WarehouseDashboard';
import { AdminDashboard } from '@/components/dashboards/AdminDashboard';
import { ProcurementDashboard } from '@/components/dashboards/ProcurementDashboard';
import { ManagementDashboard } from '@/components/dashboards/ManagementDashboard';

function DashboardContent() {
  const { user } = useAuth();

  if (!user) return null;

  const getDashboardForRole = () => {
    switch (user.role) {
      case 'ICT':
        return <ICTDashboard />;
      case 'Finance':
        return <FinanceDashboard />;
      case 'Employee':
      case 'Planning':
        return <EmployeeDashboard />;
      case 'HR':
        return <HRDashboard />;
      case 'Health and Safety':
        return <SafetyDashboard />;
      case 'Logistics':
        return <LogisticsDashboard />;
      case 'Operations Manager':
        return <OperationsDashboard />;
      case 'Implementation Manager':
        return <ImplementationManagerDashboard />;
      case 'Project Manager':
        return <ProjectManagerDashboard />;
      case 'Site Engineer':
        return <SiteEngineerDashboard />;
      case 'Warehouse':
        return <WarehouseDashboard />;
      case 'Admin':
        return <AdminDashboard />;
      case 'Procurement':
        return <ProcurementDashboard />;
      case 'Management':
        return <ManagementDashboard />;
      default:
        return <EmployeeDashboard />;
    }
  };

  return getDashboardForRole();
}

export function Dashboard() {
  return (
    // Removed DashboardLayout and AuthProvider as they are handled by App.tsx's nested routes
    <DashboardContent />
  );
}

// Dashboard components are now in separate files for better organization