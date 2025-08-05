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
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <AppSidebar userRole={user.role} />
        
        <SidebarInset className="flex-1"> {/* SidebarInset is the main content area */}
          <AppNavbar />
          
          {/* Content directly inside SidebarInset, removed redundant <main> tag */}
          <div className="flex-1 p-6 space-y-6 overflow-auto">
            <BreadcrumbNav />
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}