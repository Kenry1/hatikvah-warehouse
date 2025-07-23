import { WarehouseProvider, useWarehouse } from '../warehouse/WarehouseContext';
import { WarehouseSidebar } from '../warehouse/WarehouseSidebar';
import { MaterialCreationSection } from '../warehouse/sections/MaterialCreationSection';
import { ApprovedRequestsSection } from '../warehouse/sections/ApprovedRequestsSection';
import { StockAnalyticsSection } from '../warehouse/sections/StockAnalyticsSection';
import { AssetsManagerSection } from '../warehouse/sections/AssetsManagerSection';
import { DashboardOverviewSection } from '../warehouse/sections/DashboardOverviewSection';

function WarehouseDashboardContent() {
  const { activeSection } = useWarehouse();

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'material-creation':
        return <MaterialCreationSection />;
      case 'approved-requests':
        return <ApprovedRequestsSection />;
      case 'stock-analytics':
        return <StockAnalyticsSection />;
      case 'assets-manager':
        return <AssetsManagerSection />;
      default:
        return <DashboardOverviewSection />;
    }
  };

  return (
    <div className="flex gap-6 h-full">
      <div className="w-80 flex-shrink-0">
        <WarehouseSidebar />
      </div>
      <div className="flex-1 min-w-0">
        {renderActiveSection()}
      </div>
    </div>
  );
}

export function WarehouseDashboard() {
  return (
    <WarehouseProvider>
      <div className="p-6 space-y-6">
        <WarehouseDashboardContent />
      </div>
    </WarehouseProvider>
  );
}