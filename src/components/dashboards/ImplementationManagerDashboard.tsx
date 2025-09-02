
import { ApprovalTabs } from "../ApprovalTabs";
import { DashboardFilters } from "../DashboardFilters";
import { KPICard } from "../KPICard";
import {
  ClipboardList,
  Users,
  TrendingUp,
  CheckCircle2,
  Bell,
  Search,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ImplementationManagerDashboard = () => {
  return (
  <div className="min-h-screen bg-gradient-background">
    <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          Request Approvals Dashboard
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Review and approve fuel, material, and finance requests from your team
        </p>
      </div>
      {/* Filters */}
      <DashboardFilters />
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <KPICard
          title="Pending Approvals"
          value="12"
          previousValue="8"
          trend="up"
          trendValue="+50% vs last week"
          description="from last week"
          icon={<ClipboardList className="h-4 w-4 text-warning" />}
        />
        <KPICard
          title="Approved This Month"
          value="48"
          previousValue="42"
          trend="up"
          trendValue="+14.3% vs last month"
          description="from last month"
          icon={<CheckCircle2 className="h-4 w-4 text-success" />}
        />
        <KPICard
          title="Total Value Approved"
          value="$125,400"
          previousValue="$98,200"
          trend="up"
          trendValue="+27.7% vs last month"
          description="from last month"
          icon={<TrendingUp className="h-4 w-4 text-primary" />}
        />
      </div>
      {/* Approval Tabs - Main Feature */}
      <ApprovalTabs />
    </main>
  </div>
  );
};

export default ImplementationManagerDashboard;