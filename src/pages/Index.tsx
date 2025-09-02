import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { HomePage } from '@/components/HomePage';
import { LoginPage } from '@/components/LoginPage';
import { ICTDashboard } from '@/components/dashboards/ICTDashboard';
import { FinanceDashboard } from '@/components/dashboards/FinanceDashboard';
import { EmployeeDashboard } from '@/components/dashboards/EmployeeDashboard';
import { HRDashboard } from '@/components/dashboards/HRDashboard';
import { SafetyDashboard } from '@/components/dashboards/SafetyDashboard';
import ImplementationManagerDashboard from '@/components/dashboards/ImplementationManagerDashboard';
import { LogisticsDashboard } from '@/components/dashboards/LogisticsDashboard';
import { OperationsDashboard } from '@/components/dashboards/OperationsDashboard';
import { ProjectManagerDashboard } from '@/components/dashboards/ProjectManagerDashboard';
import SiteEngineerDashboard from '@/components/dashboards/SiteEngineerDashboard';
import { WarehouseDashboard } from '@/components/dashboards/WarehouseDashboard';
import { AdminDashboard } from '@/components/dashboards/AdminDashboard';
import { ProcurementDashboard } from '@/components/dashboards/ProcurementDashboard';
import { ManagementDashboard } from '@/components/dashboards/ManagementDashboard';
import { CreateCompanyData } from '@/types/auth';

function AppContent() {
  const { user, login, createCompany, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<'home' | 'login'>('home');

  const handleCompanyCreate = async (data: CreateCompanyData) => {
    try {
      await createCompany(data);
      // User is automatically logged in after company creation
    } catch (error) {
      // Error handling is done in the HomePage component
      throw error;
    }
  };

  const handleLogin = async (companyName: string, username: string, password: string) => {
    await login(companyName, username, password);
  };

  const getDashboardForRole = () => {
    if (!user) return null;

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
      case 'Implementation Manager':
        return <ImplementationManagerDashboard />;
      case 'Logistics':
        return <LogisticsDashboard />;
      case 'Operations Manager':
        return <OperationsDashboard />;
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
        // For other roles, show the employee dashboard as default
        return <EmployeeDashboard />;
    }
  };

  if (user) {
    return (
      <DashboardLayout>
        {getDashboardForRole()}
      </DashboardLayout>
    );
  }

  if (currentView === 'login') {
    return (
      <LoginPage
        onLogin={handleLogin}
        onBackToHome={() => setCurrentView('home')}
        isLoading={isLoading}
      />
    );
  }

  return (
    <HomePage
      onCompanyCreate={handleCompanyCreate}
      onSignInClick={() => setCurrentView('login')}
      isLoading={isLoading}
    />
  );
}

const Index = () => {
  return <AppContent />;
};

export default Index;
