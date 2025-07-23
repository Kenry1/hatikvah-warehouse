import { BaseDashboard } from './BaseDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Truck, Calendar, Upload, Wrench, Plus, FileText } from 'lucide-react';

export function LogisticsDashboard() {
  const stats = [
    { title: 'Active Vehicles', value: 45, description: '8 in maintenance', color: 'primary' as const },
    { title: 'Service Due', value: 12, description: 'Next 30 days', color: 'warning' as const },
    { title: 'Documents', value: 156, description: 'Uploaded this month', color: 'success' as const },
    { title: 'Fleet Utilization', value: '87%', description: 'Current efficiency', color: 'success' as const },
  ];

  const vehicles = [
    { id: 'V001', make: 'Toyota', model: 'Hilux', year: '2023', plate: 'TH-2023', status: 'available', assignedTo: null },
    { id: 'V002', make: 'Ford', model: 'Ranger', year: '2024', plate: 'FR-2024', status: 'assigned', assignedTo: 'John Smith' },
    { id: 'V003', make: 'Isuzu', model: 'D-Max', year: '2023', plate: 'ID-2023', status: 'maintenance', assignedTo: null },
  ];

  const upcomingServices = [
    { vehicle: 'Toyota Hilux TH-2023', type: 'Oil Change', dueDate: '2024-12-15', mileage: '45,000 km' },
    { vehicle: 'Ford Ranger FR-2024', type: 'Tire Rotation', dueDate: '2024-12-18', mileage: '32,000 km' },
    { vehicle: 'Isuzu D-Max ID-2023', type: 'Brake Inspection', dueDate: '2024-12-20', mileage: '38,000 km' },
  ];

  const recentDocuments = [
    { vehicle: 'Toyota Hilux TH-2023', document: 'Insurance Certificate', uploadDate: '2024-12-10', type: 'insurance' },
    { vehicle: 'Ford Ranger FR-2024', document: 'Registration Renewal', uploadDate: '2024-12-08', type: 'registration' },
    { vehicle: 'Isuzu D-Max ID-2023', document: 'Safety Inspection', uploadDate: '2024-12-05', type: 'inspection' },
  ];

  return (
    <BaseDashboard
      title="Logistics Dashboard"
      description="Manage vehicle fleet, scheduling, and maintenance"
      stats={stats}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Creation & Assignment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Vehicle Management
            </CardTitle>
            <CardDescription>Create and assign vehicles to personnel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Fleet Overview</h4>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Vehicle
              </Button>
            </div>
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{vehicle.make} {vehicle.model} ({vehicle.year})</p>
                  <p className="text-sm text-muted-foreground">
                    {vehicle.plate} {vehicle.assignedTo && `• Assigned to: ${vehicle.assignedTo}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    vehicle.status === 'available' ? 'default' :
                    vehicle.status === 'assigned' ? 'secondary' : 'destructive'
                  }>
                    {vehicle.status}
                  </Badge>
                  <Button size="sm" variant="outline">Assign</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Service & Inspection Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Service & Inspection Calendar
            </CardTitle>
            <CardDescription>Schedule maintenance and inspections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Upcoming Services</h4>
              <Button size="sm" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                View Calendar
              </Button>
            </div>
            {upcomingServices.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{service.vehicle}</p>
                  <p className="text-sm text-muted-foreground">
                    {service.type} • Due: {service.dueDate}
                  </p>
                  <p className="text-xs text-muted-foreground">{service.mileage}</p>
                </div>
                <Button size="sm">Schedule</Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Vehicle Document Uploader */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Document Management
            </CardTitle>
            <CardDescription>Upload and manage vehicle documents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Recent Uploads</h4>
              <Button size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </div>
            {recentDocuments.map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{doc.document}</p>
                  <p className="text-sm text-muted-foreground">
                    {doc.vehicle} • {doc.uploadDate}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {doc.type}
                  </Badge>
                  <Button size="sm" variant="outline">
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Fleet Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Fleet Analytics
            </CardTitle>
            <CardDescription>Vehicle performance and maintenance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <p className="text-2xl font-bold text-primary">87%</p>
                <p className="text-sm text-muted-foreground">Uptime</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <p className="text-2xl font-bold text-warning">$2,450</p>
                <p className="text-sm text-muted-foreground">Monthly Costs</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <p className="text-2xl font-bold text-success">42,000</p>
                <p className="text-sm text-muted-foreground">KM/Month</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <p className="text-2xl font-bold text-primary">8.5L</p>
                <p className="text-sm text-muted-foreground">Avg. Fuel/100km</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </BaseDashboard>
  );
}