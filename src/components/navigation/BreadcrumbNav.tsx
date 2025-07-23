import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface BreadcrumbRoute {
  label: string;
  path: string;
}

const routeLabels: Record<string, string> = {
  '/': 'Home',
  '/dashboard': 'Dashboard',
  '/vehicles': 'Vehicle Management',
  '/leave-requests': 'Leave Requests',
  '/finance-requests': 'Finance Requests',
  '/it-tickets': 'IT Tickets',
  '/safety-reports': 'Safety Reports',
  '/employees': 'Employee Directory',
  '/executive-dashboard': 'Executive Dashboard',
  '/department-analytics': 'Department Analytics',
  '/performance-metrics': 'Performance Metrics',
  '/resource-allocation': 'Resource Allocation',
  '/user-management': 'User Management',
  '/settings': 'Settings',
  '/finance-approvals': 'Finance Approvals',
  '/warehouse-inventory': 'Warehouse Inventory',
  '/procurement-resources': 'Procurement Resources',
  '/leave-management': 'Leave Management',
  '/unified-approvals': 'Unified Approvals',
  '/project-tracking': 'Project Tracking',
  '/vehicle-creation': 'Vehicle Creation',
  '/material-requests': 'Material Requests',
  '/material-creation': 'Material Creation',
  '/approved-requests': 'Approved Requests',
  '/analytics': 'Analytics',
  '/admin': 'Administration',
  '/supplier-management': 'Supplier Management',
  '/supply-rates': 'Supply Rates',
  '/reorder-alerts': 'Reorder Alerts',
};

export function BreadcrumbNav() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const generateBreadcrumbs = (): BreadcrumbRoute[] => {
    const breadcrumbs: BreadcrumbRoute[] = [];
    
    // Always start with dashboard if not on home page
    if (location.pathname !== '/') {
      breadcrumbs.push({ label: 'Dashboard', path: '/dashboard' });
    }

    // Add current page if not dashboard
    if (location.pathname !== '/dashboard' && location.pathname !== '/') {
      const currentLabel = routeLabels[location.pathname] || 'Page';
      breadcrumbs.push({ label: currentLabel, path: location.pathname });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs on home page or if there's only one item
  if (location.pathname === '/' || breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/dashboard" className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        {breadcrumbs.length > 1 && (
          <>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>
                {breadcrumbs[breadcrumbs.length - 1].label}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}