import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  Truck,
  Calendar,
  DollarSign,
  Ticket,
  Shield,
  Users,
  Settings,
  BarChart3,
  Package,
  UserCheck,
  FileText,
  MapPin,
  Building2,
  ClipboardList,
  Wrench,
  Home,
  Bell,
  Search,
  Archive,
  CheckSquare,
  Clock,
  AlertTriangle,
  TrendingUp,
  Database,
  Clipboard,
  Car,
  HardHat,
  Warehouse,
  ShoppingCart,
  Target,
  Monitor,
  BookOpen,
  Cog,
  ChevronDown
} from 'lucide-react';
import { UserRole } from '@/types/auth';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { cn } from '@/lib/utils'; // Import cn utility

interface AppSidebarProps {
  userRole: UserRole;
  className?: string; // Added className prop
}

// Navigation item type
interface NavigationItem {
  title: string;
  url?: string; // url is now optional
  icon: any;
  badge?: string;
  description?: string;
  subItems?: NavigationItem[]; // New property for sub-menu items
}

interface NavigationGroup {
  title: string;
  items: NavigationItem[];
}

// Define comprehensive navigation structure based on roles
const getNavigationStructure = (role: UserRole): NavigationGroup[] => {
  // Common items available to all roles
  const commonItems: NavigationItem[] = [
    { title: 'Vehicle Management', url: '/vehicles', icon: Truck, description: 'Fleet and vehicle operations' },
    {
      title: 'Attendance',
      icon: Calendar,
      description: 'Manage employee attendance and leave',
      subItems: [
        { title: 'House Attendance', url: '/attendance/house', icon: Home, description: 'Track daily attendance' },
        { title: 'Leave Query', url: '/leave-requests', icon: BookOpen, description: 'manage your leave requests' },
        { title: 'Field Trip Alert', url: '/field-trip-alert', icon: MapPin, description: 'Alert your field trips' },
      ],
    },
    { title: 'Finance Request', url: '/finance-requests', icon: DollarSign, description: 'Financial requests' },
    { title: 'IT Ticket Creation', url: '/it-tickets', icon: Ticket, description: 'Technical support tickets' },
    { title: 'Safety Reports', url: '/safety-reports', icon: Shield, description: 'Safety incidents and compliance' },
    { title: 'Employee Directory', url: '/employees', icon: Users, description: 'Team directory and status' },
  ];

  // Role-specific navigation groups
  const roleSpecificGroups: Record<UserRole, NavigationGroup[]> = {
    'ICT': [
      {
        title: 'System Management',
        items: [
          { title: 'User Management', url: '/user-management', icon: UserCheck, description: 'Manage user accounts and permissions' },
          { title: 'System Settings', url: '/settings', icon: Settings, description: 'Configure system parameters' },
          { title: 'System Monitoring', url: '/system-monitoring', icon: Monitor, description: 'Monitor system health' },
        ]
      },
      {
        title: 'IT Operations',
        items: [
          { title: 'Incoming Tickets', url: '/incoming-tickets', icon: Ticket, badge: '12', description: 'Manage all incoming IT support tickets' },
          { title: 'Asset Inventory', url: '/it-assets', icon: Database, description: 'IT equipment and software' },
        ]
      }
    ],
    'Finance': [
      {
        title: 'Approvals',
        items: [
          { title: 'Finance Approvals', url: '/finance-approvals', icon: CheckSquare, badge: '5', description: 'Review and approve requests' },
          { title: 'Budget Analytics', url: '/budget-analytics', icon: TrendingUp, description: 'Financial performance metrics' },
        ]
      },
      {
        title: 'Inventory & Procurement',
        items: [
          { title: 'Warehouse Inventory', url: '/warehouse-inventory', icon: Package, description: 'Stock levels and management' },
          { title: 'Procurement Resources', url: '/procurement-resources', icon: Building2, description: 'Supplier and vendor management' },
        ]
      }
    ],
    'Health and Safety': [
      {
        title: 'Safety Management',
        items: [
          { title: 'Vehicle Inspections', url: '/vehicle-inspections', icon: ClipboardList, description: 'Schedule and track inspections' },
          { title: 'Safety Equipment', url: '/safety-equipment', icon: HardHat, description: 'PPE and safety gear inventory' },
          { title: 'Safety Certificates', url: '/safety-certificates', icon: FileText, description: 'Compliance documentation' },
          { title: 'Active Vehicle Matrix', url: '/vehicle-matrix', icon: Car, description: 'Vehicle-user assignments' },
        ]
      },
      {
        title: 'Compliance',
        items: [
          { title: 'Safety Reports Viewer', url: '/sreportsv', icon: Archive, description: 'Incident analysis and reports' },
          { title: 'Risk Assessments', url: '/risk-assessments', icon: AlertTriangle, description: 'Workplace risk evaluation' },
        ]
      }
    ],
    'Employee': [],
    'HR': [
      {
        title: 'Employee Management',
        items: [
          { title: 'Leave Management', url: '/leave-management', icon: Calendar, badge: '8', description: 'Process leave requests' },
          { title: 'Field Trip Approvals', url: '/field-trip-approvals', icon: MapPin, description: 'Travel request approvals' },
          { title: 'Employee Records', url: '/employee-records', icon: Users, description: 'Personnel documentation' },
        ]
      }
    ],
    'Implementation Manager': [
      {
        title: 'Project Management',
        items: [
          { title: 'Unified Approvals', url: '/unified-approvals', icon: ClipboardList, badge: '15', description: 'Cross-department approvals' },
          { title: 'Project Tracking', url: '/project-tracking', icon: Target, description: 'Project progress and milestones' },
          { title: 'Resource Planning', url: '/resource-planning', icon: BarChart3, description: 'Allocation and scheduling' },
        ]
      }
    ],
    'Logistics': [
      {
        title: 'Fleet Management',
        items: [
          { title: 'Vehicle Creation', url: '/vehicle-creation', icon: Truck, description: 'Add and configure vehicles' },
          { title: 'Service Calendar', url: '/service-calendar', icon: Clock, description: 'Maintenance scheduling' },
          { title: 'Document Management', url: '/document-management', icon: FileText, description: 'Vehicle documentation' },
        ]
      }
    ],
    'Operations Manager': [
      {
        title: 'Operations Overview',
        items: [
          { title: 'Inventory Overview', url: '/inventory-overview', icon: Package, description: 'Stock levels across departments' },
          { title: 'Project Dashboard', url: '/project-dashboard', icon: BarChart3, description: 'Project performance metrics' },
          { title: 'Vehicle Status', url: '/vehicle-status', icon: Truck, description: 'Fleet status and utilization' },
          { title: 'Employee Tracker', url: '/employee-tracker', icon: Users, description: 'Staff assignments and availability' },
        ]
      }
    ],
    'Planning': [],
    'Project Manager': [
      {
        title: 'Project Management',
        items: [
          { title: 'Project Forms', url: '/project-forms', icon: Clipboard, description: 'Project setup and configuration' },
          { title: 'Employee Assignment', url: '/employee-assignment', icon: UserCheck, description: 'Team assignments and deadlines' },
          { title: 'Project Timeline', url: '/project-timeline', icon: Calendar, description: 'Schedule and milestones' },
        ]
      }
    ],
    'Site Engineer': [
      {
        title: 'Site Operations',
        items: [
          { title: 'Material Requests', url: '/material-requests', icon: Package, description: 'Request materials and supplies' },
          { title: 'Site Documentation', url: '/site-docs', icon: FileText, description: 'Technical drawings and specs' },
        ]
      }
    ],
    'Warehouse': [
      {
        title: 'Inventory Management',
        items: [
          { title: 'Material Creation', url: '/material-creation', icon: Package, description: 'Add new inventory items' },
          { title: 'Approved Requests', url: '/approved-requests', icon: CheckSquare, description: 'Process approved material requests' },
          { title: 'Stock Analytics', url: '/stock-analytics', icon: TrendingUp, description: 'Inventory trends and insights' },
        ]
      },
      {
        title: 'Categories',
        items: [
          { title: 'Safety Materials', url: '/materials/safety', icon: Shield, description: 'Safety equipment and supplies' },
          { title: 'FTTH Materials', url: '/materials/ftth', icon: Cog, description: 'Fiber to the home equipment' },
          { title: 'FTTX Materials', url: '/materials/fttx', icon: Cog, description: 'Fiber to the x equipment' },
          { title: 'Company Assets', url: '/materials/assets', icon: Building2, description: 'Corporate equipment and assets' },
        ]
      }
    ],
    'Admin': [
      {
        title: 'Administration',
        items: [
          { title: 'Analytics Dashboard', url: '/analytics', icon: BarChart3, description: 'System-wide analytics and metrics' },
          { title: 'System Administration', url: '/admin', icon: Settings, description: 'Global system configuration' },
          { title: 'User Audit', url: '/user-audit', icon: Search, description: 'User activity and logs' },
        ]
      }
    ],
    'Procurement': [
      {
        title: 'Supplier Management',
        items: [
          { title: 'Supplier Management', url: '/supplier-management', icon: Building2, description: 'Vendor relationships and contracts' },
          { title: 'Supply Rates', url: '/supply-rates', icon: DollarSign, description: 'Pricing and rate management' },
          { title: 'Reorder Alerts', url: '/reorder-alerts', icon: Bell, badge: '3', description: 'Low stock notifications' },
        ]
      }
    ],
    'Management': [
      {
        title: 'Executive Overview',
        items: [
          { title: 'Executive Dashboard', url: '/executive-dashboard', icon: BarChart3, description: 'High-level business metrics' },
          { title: 'Department Analytics', url: '/department-analytics', icon: TrendingUp, description: 'Cross-departmental performance' },
          { title: 'Performance Metrics', url: '/performance-metrics', icon: Target, description: 'KPI tracking and analysis' },
          { title: 'Resource Allocation', url: '/resource-allocation', icon: Settings, description: 'Strategic resource management' },
        ]
      }
    ],
  };

  return [
    { title: 'Common Tools', items: commonItems },
    ...roleSpecificGroups[role]
  ];
};

export function AppSidebar({ userRole, className }: AppSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const navigationGroups = getNavigationStructure(userRole);
  // const isActive = (path: string) => currentPath === path; // No longer directly used for top-level NavLink

  // Function to check if any sub-item is active
  const hasActiveSubItem = (subItems: NavigationItem[]) => {
    return subItems.some(subItem => currentPath === subItem.url);
  };

  return (
    <Sidebar
      className={cn("bg-sidebar transition-all duration-300 border-r border-sidebar-border", className)}
      variant="inset" // Added variant="inset" here
    >
      <SidebarContent className="bg-sidebar">
        {navigationGroups.map((group, groupIndex) => (
          <SidebarGroup key={group.title} className={groupIndex > 0 ? 'mt-6' : ''}>
            <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs uppercase tracking-wider mb-3 px-3">
              {state !== 'collapsed' && group.title}
            </SidebarGroupLabel>
            
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    {item.subItems ? (
                      <Collapsible defaultOpen={hasActiveSubItem(item.subItems)}>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton 
                            className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-all duration-200 group 
                            ${hasActiveSubItem(item.subItems)
                                ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                                : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <item.icon className="h-4 w-4 flex-shrink-0" />
                              {state !== 'collapsed' && (
                                <span className="text-sm font-medium truncate">
                                  {item.title}
                                </span>
                              )}
                            </div>
                            {state !== 'collapsed' && <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                          <SidebarMenu className="ml-6 mt-1 space-y-1">
                            {item.subItems.map(subItem => (
                              <SidebarMenuItem key={subItem.title}>
                                <SidebarMenuButton asChild>
                                  <NavLink
                                    to={subItem.url || '#'}
                                    className={({ isActive: linkIsActive }) =>
                                      `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative ${
                                        linkIsActive
                                          ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                                          : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                                      }`
                                    }
                                  >
                                    <subItem.icon className="h-4 w-4 flex-shrink-0" />
                                    {state !== 'collapsed' && (
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm font-medium truncate">
                                            {subItem.title}
                                          </span>
                                          {subItem.badge && (
                                            <Badge 
                                              variant="secondary" 
                                              className="ml-2 h-5 min-w-[20px] flex items-center justify-center text-xs px-1.5 bg-primary/10 text-primary"
                                            >
                                              {subItem.badge}
                                            </Badge>
                                          )}
                                        </div>
                                        {subItem.description && (
                                          <p className="text-xs text-sidebar-foreground/60 mt-0.5 truncate">
                                            {subItem.description}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </NavLink>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            ))}
                          </SidebarMenu>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url || '#'}
                          className={({ isActive: linkIsActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                              linkIsActive
                                ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                                : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                            }`
                          }
                        >
                          <item.icon className="h-4 w-4 flex-shrink-0" />
                          
                          {state !== 'collapsed' && (
                            <>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium truncate">
                                    {item.title}
                                  </span>
                                  {item.badge && (
                                    <Badge 
                                      variant="secondary" 
                                      className="ml-2 h-5 min-w-[20px] flex items-center justify-center text-xs px-1.5 bg-primary/10 text-primary"
                                    >
                                      {item.badge}
                                    </Badge>
                                  )}
                                </div>
                                {item.description && (
                                  <p className="text-xs text-sidebar-foreground/60 mt-0.5 truncate">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </>
                          )}
                          
                          {/* Tooltip for collapsed state */}
                          {state === 'collapsed' && item.badge && (
                            <Badge 
                              variant="secondary" 
                              className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center text-xs p-0 bg-destructive text-destructive-foreground"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}