import { BaseDashboard } from './BaseDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Truck, Wrench, FileCheck, AlertTriangle, Calendar } from 'lucide-react';

export function SafetyDashboard() {
  const stats = [
    { title: 'Vehicle Inspections', value: 25, description: '5 due this week', color: 'warning' as const },
    { title: 'Safety Equipment', value: 340, description: 'Items in inventory', color: 'success' as const },
    { title: 'Safety Reports', value: 8, description: 'This month', color: 'primary' as const },
    { title: 'Compliance Rate', value: '98%', description: 'Safety standards met', color: 'success' as const },
  ];

  const vehicleInspections = [
    { id: 'V001', vehicle: 'Toyota Hilux TH-2023', lastInspection: '2024-11-15', nextDue: '2024-12-15', status: 'due' },
    { id: 'V002', vehicle: 'Ford Ranger FR-2024', lastInspection: '2024-10-20', nextDue: '2024-12-20', status: 'upcoming' },
    { id: 'V003', vehicle: 'Isuzu D-Max ID-2023', lastInspection: '2024-09-10', nextDue: '2024-12-10', status: 'overdue' },
  ];

  const safetyEquipment = [
    { category: 'Hard Hats', total: 85, available: 78, inUse: 7 },
    { category: 'Safety Vests', total: 120, available: 105, inUse: 15 },
    { category: 'Fire Extinguishers', total: 45, available: 42, inUse: 3 },
    { category: 'First Aid Kits', total: 25, available: 23, inUse: 2 },
  ];

  const activeVehicleUsers = [
    { vehicle: 'Toyota Hilux TH-2023', driver: 'John Smith', destination: 'Site A', checkOut: '08:30', status: 'active' },
    { vehicle: 'Ford Ranger FR-2024', driver: 'Sarah Johnson', destination: 'Site B', checkOut: '09:15', status: 'active' },
    { vehicle: 'Isuzu D-Max ID-2023', driver: 'Mike Wilson', destination: 'Office', checkOut: '14:30', status: 'returned' },
  ];

  return (
    <BaseDashboard
      title="Health & Safety Dashboard"
      description="Monitor safety compliance, inspections, and equipment"
      stats={stats}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Inspection List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Vehicle Inspections
            </CardTitle>
            <CardDescription>Schedule and track vehicle safety inspections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {vehicleInspections.map((inspection) => (
              <div key={inspection.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{inspection.vehicle}</p>
                  <p className="text-sm text-muted-foreground">
                    Last: {inspection.lastInspection} • Next: {inspection.nextDue}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    inspection.status === 'overdue' ? 'destructive' :
                    inspection.status === 'due' ? 'secondary' : 'default'
                  }>
                    {inspection.status}
                  </Badge>
                  <Button size="sm">Schedule</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Safety Equipment Inventory */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Safety Equipment Inventory
            </CardTitle>
            <CardDescription>Manage safety equipment stock levels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {safetyEquipment.map((equipment, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{equipment.category}</p>
                  <p className="text-sm text-muted-foreground">
                    {equipment.available} available • {equipment.inUse} in use
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{equipment.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Active Vehicle-User Matrix */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Active Vehicle-User Matrix
            </CardTitle>
            <CardDescription>Track current vehicle assignments and usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeVehicleUsers.map((assignment, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{assignment.vehicle}</p>
                  <p className="text-sm text-muted-foreground">
                    {assignment.driver} • {assignment.destination}
                  </p>
                  <p className="text-xs text-muted-foreground">Check-out: {assignment.checkOut}</p>
                </div>
                <Badge variant={assignment.status === 'active' ? 'default' : 'secondary'}>
                  {assignment.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Safety Certificate Manager & Report Viewer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Safety Compliance & Reports
            </CardTitle>
            <CardDescription>Manage certificates and view safety reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 border rounded-lg">
                <p className="text-xl font-bold text-success">24</p>
                <p className="text-sm text-muted-foreground">Valid Certificates</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <p className="text-xl font-bold text-warning">3</p>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
              </div>
            </div>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <FileCheck className="mr-2 h-4 w-4" />
                View Safety Reports
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Certificate Calendar
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Incident Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </BaseDashboard>
  );
}