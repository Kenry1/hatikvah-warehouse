import { ReactNode } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { AppNavbar } from './AppNavbar';
import { BreadcrumbNav } from '../navigation/BreadcrumbNav';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, profile } = useAuth();

  if (!user || !profile) {
    return null;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <AppSidebar userRole={profile.role} />
        
        <SidebarInset className="flex-1">
          <AppNavbar />
          
          <main className="flex-1 p-6 space-y-6">
            <BreadcrumbNav />
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}