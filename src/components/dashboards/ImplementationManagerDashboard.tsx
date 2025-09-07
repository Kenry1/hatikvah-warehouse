
import { useEffect, useState } from "react";
import { KPICard } from "../KPICard";
import { ApprovalTabs } from "../ApprovalTabs";
import { ClipboardList, TrendingUp, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getAssetRequestList, getLeaveRequestList } from "@/lib/firestoreHelpers";

const ImplementationManagerDashboard = () => {
  const { user } = useAuth();
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [approvedThisMonth, setApprovedThisMonth] = useState(0);
  const [totalValueApproved, setTotalValueApproved] = useState(0);

  useEffect(() => {
  // Fetch all material requests for KPIs
  import("@/lib/firestoreHelpers").then(m => m.getMaterialRequestList()).then((materialRequests) => {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      let pending = 0;
      let approvedMonth = 0;
      let totalValue = 0;
    materialRequests.forEach((req: any) => {
        if (req.status === "pending") pending++;
        if (req.status === "approved") {
      let date: any = req.requestDate?.toDate?.() || req.requestDate || req.createdAt;
      const d = typeof date === "string" ? new Date(date) : (date?.toDate?.() ? date.toDate() : date);
          if (d && d.getMonth && d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            approvedMonth++;
            if ('price' in req && typeof req.price === 'number') totalValue += req.price;
          }
        }
      });
      setPendingApprovals(pending);
      setApprovedThisMonth(approvedMonth);
      setTotalValueApproved(totalValue);
    });
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-background flex flex-col">
      <main className="container mx-auto px-2 sm:px-6 py-2 sm:py-6 space-y-6 flex-1 w-full">
        {/* Page Header */}
        <div className="flex flex-col gap-2 text-center sm:text-left md:flex-row md:items-center md:justify-between md:gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
              Request Approvals Dashboard
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
              Review and approve fuel, material, and finance requests from your team
            </p>
          </div>
        </div>
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 md:gap-8">
          <KPICard
            title="Pending Approvals"
            value={pendingApprovals}
            trend={pendingApprovals > 0 ? "up" : "neutral"}
            description="from all requests"
            icon={<ClipboardList className="h-4 w-4 text-warning" />}
          />
          <KPICard
            title="Approved This Month"
            value={approvedThisMonth}
            trend={approvedThisMonth > 0 ? "up" : "neutral"}
            description="approved this month"
            icon={<CheckCircle2 className="h-4 w-4 text-success" />}
          />
          <KPICard
            title="Total Value Approved"
            value={`$${totalValueApproved.toLocaleString()}`}
            trend={totalValueApproved > 0 ? "up" : "neutral"}
            description="approved this month"
            icon={<TrendingUp className="h-4 w-4 text-primary" />}
          />
        </div>
        {/* Approval Tabs - Main Feature */}
        <div className="w-full">
          <ApprovalTabs fetchAll />
        </div>
      </main>
    </div>
  );
};

export default ImplementationManagerDashboard;