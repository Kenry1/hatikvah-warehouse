import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, ClipboardCheck, ArrowRightLeft, Car, Fuel, Gauge, Wrench, ArrowDown, ArrowUp, Clock, Waypoints, ShieldAlert, Shield, Download, Eye, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import ParkTransferModal from '@/components/modals/ParkTransferModal';
import { ChartContainer } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import FuelRequestModal from '@/components/modals/FuelRequestModal';
import PerformCheckupModal from '@/components/modals/PerformCheckupModal';

// Mock Data and Types
interface Vehicle {
  id: string;
  make: string;
  model: string;
  licensePlate: string;
  vin?: string;
  year: number;
  assignedTo?: string;
  assignedToId?: string;
  createdAt?: Date;
  lastInspectionDate?: Date;
  nextInspectionDate?: Date;
}

interface ServiceRequest {
  id: string;
  serviceType: string;
  requestedDate: Date;
  notes?: string;
  status: string;
}

interface Inspection {
  id: string;
  inspectionType: string;
  dueDate: Date;
  status: string;
}

interface InsuranceAlert {
  id: string;
  policyNumber: string;
  provider: string;
  expiryDate: Date;
  status: string;
}

const mockVehicle: Vehicle = {
  id: '1',
  make: 'Toyota',
  model: 'Hilux',
  licensePlate: 'ABC-123',
  vin: '1HGCM82633A004352',
  year: 2022,
  assignedTo: 'John Smith',
  assignedToId: 'emp-1',
  createdAt: new Date('2024-01-01'),
  lastInspectionDate: new Date('2024-03-01'),
  nextInspectionDate: new Date('2024-09-01'),
};

const mockServiceHistory: ServiceRequest[] = [
  { id: 's1', serviceType: 'Oil Change', requestedDate: new Date('2024-02-01'), notes: 'Changed oil and filter', status: 'Completed' },
  { id: 's2', serviceType: 'Tire Rotation', requestedDate: new Date('2024-04-01'), notes: 'Rotated all tires', status: 'Completed' },
];

const mockPendingServices: ServiceRequest[] = [
  { id: 's3', serviceType: 'Brake Inspection', requestedDate: new Date('2024-06-01'), notes: '', status: 'Pending' },
];

const mockUpcomingInspections: Inspection[] = [
  { id: 'i1', inspectionType: 'Annual Safety', dueDate: new Date('2024-09-01'), status: 'Upcoming' },
];

const mockInsuranceAlerts: InsuranceAlert[] = [
  { id: 'a1', policyNumber: 'POL123', provider: 'ABC Insurance', expiryDate: new Date('2024-09-15'), status: 'Expiring Soon' },
];

const pastOwnersData = [
  { name: 'John Smith', role: 'Previous Owner', period: 'Jan 2022 - Dec 2023', mileage: '15,000 km', icon: Car, iconBgClass: 'bg-purple-100', iconColorClass: 'text-purple-600' },
  { name: 'Sarah Johnson', role: 'First Owner', period: 'Mar 2021 - Jan 2022', mileage: '8,500 km', icon: Car, iconBgClass: 'bg-primary/10', iconColorClass: 'text-primary' },
];

const documentsData = [
  { name: 'Vehicle Registration', expiry: 'Expires: Jun 30, 2024', icon: Download, iconBgClass: 'bg-red-100', iconColorClass: 'text-red-600' },
  { name: 'Insurance Policy', expiry: 'Expires: Sep 15, 2024', icon: Download, iconBgClass: 'bg-blue-100', iconColorClass: 'text-blue-600' },
  { name: 'Purchase Invoice', expiry: 'Dated: Jan 10, 2024', icon: Download, iconBgClass: 'bg-yellow-100', iconColorClass: 'text-yellow-600' },
];

const performanceChartData = [
  { month: 'Jan', yourVehicle: 7.8, fleetAvg: 8.5, bestInClass: 7.2 },
  { month: 'Feb', yourVehicle: 8.0, fleetAvg: 8.4, bestInClass: 7.1 },
  { month: 'Mar', yourVehicle: 7.5, fleetAvg: 8.2, bestInClass: 7.0 },
  { month: 'Apr', yourVehicle: 8.2, fleetAvg: 8.3, bestInClass: 7.3 },
  { month: 'May', yourVehicle: 7.9, fleetAvg: 8.1, bestInClass: 6.9 },
];

const getStatusBadgeVariant = (status: string | undefined): 'default' | 'secondary' | 'destructive' | 'outline' => {
  if (!status) return 'outline';
  switch (status.toLowerCase()) {
    case 'active':
    case 'completed':
    case 'ok':
      return 'default';
    case 'available':
    case 'upcoming':
    case 'pending':
    case 'in progress':
    case 'expiring soon':
      return 'secondary';
    case 'in service':
    case 'maintenance':
    case 'pending_approval':
    case 'pending transfer':
    case 'overdue':
    case 'not_ok':
      return 'destructive';
    case 'retired':
    case 'cancelled':
    case 'missed':
    case 'expired':
    case 'n/a':
      return 'outline';
    default:
      return 'outline';
  }
};

export default function VehicleManagement() {
  const [isCheckupModalOpen, setIsCheckupModalOpen] = useState(false);
  const [isParkTransferModalOpen, setIsParkTransferModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const vehicleDetails = mockVehicle;
  const serviceHistory = mockServiceHistory;
  const pendingServices = mockPendingServices;
  const upcomingInspections = mockUpcomingInspections;
  const insuranceAlerts = mockInsuranceAlerts;
  const loadingVehicle = false;
  const errorVehicle = null;
  const loadingServiceHistory = false;
  const errorServiceHistory = null;
  const loadingPendingServices = false;
  const errorPendingServices = null;
  const loadingUpcomingInspections = false;
  const errorUpcomingInspections = null;
  const loadingInsuranceAlerts = false;
  const errorInsuranceAlerts = null;

  const fuelConsumptionData = { average: 8.2, city: 9.4, highway: 6.8, change: -5 };
  const mileageData = { current: vehicleDetails.year || 24568, thisMonth: 1234, progressToService: 65 };
  const nextServiceData = {
    date: vehicleDetails.nextInspectionDate ? vehicleDetails.nextInspectionDate.toLocaleDateString() : 'N/A',
    daysRemaining: vehicleDetails.nextInspectionDate ? Math.max(0, Math.ceil((vehicleDetails.nextInspectionDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 'N/A',
    lastService: vehicleDetails.lastInspectionDate ? vehicleDetails.lastInspectionDate.toLocaleDateString() : 'N/A',
    interval: '10,000 km / 6 months',
  };
  const dynamicPastOwnersData = [...pastOwnersData];
  if (vehicleDetails.assignedTo) {
    const currentOwnerExists = dynamicPastOwnersData.find(owner => owner.role === 'Current Owner');
    if (currentOwnerExists) {
      currentOwnerExists.name = `${vehicleDetails.assignedTo} (You)`;
      currentOwnerExists.period = vehicleDetails.createdAt ? `${vehicleDetails.createdAt.toLocaleDateString()} - Present` : 'Jan 2024 - Present';
    } else {
      dynamicPastOwnersData.push({
        name: `${vehicleDetails.assignedTo} (You)`,
        role: 'Current Owner',
        period: vehicleDetails.createdAt ? `${vehicleDetails.createdAt.toLocaleDateString()} - Present` : 'Jan 2024 - Present',
        mileage: 'N/A',
        icon: Car,
        iconBgClass: 'bg-green-100',
        iconColorClass: 'text-green-600',
      });
    }
  }

  if (loadingVehicle) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading vehicle details...</p>
      </div>
    );
  }
  if (errorVehicle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-destructive">
        <TriangleAlert className="h-12 w-12 mb-4" />
        <p className="text-xl font-semibold">{errorVehicle}</p>
        <p>Please check the vehicle ID or try again later.</p>
      </div>
    );
  }
  if (!vehicleDetails) {
    return <div className="text-center py-10 text-muted-foreground">No vehicle data found.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vehicle Management</h1>
          <p className="text-muted-foreground">Monitor and manage details for vehicle: {vehicleDetails.make} {vehicleDetails.model} ({vehicleDetails.licensePlate})</p>
        </div>
        <div className="flex items-center w-full mt-4 md:mt-0">
          <div className="relative flex-grow md:flex-grow-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search..." className="pl-10 pr-4 py-2 h-9 w-full md:w-auto" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center space-x-2 md:space-x-4 ml-auto">
            <Button
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-600 hover:text-primary-foreground"
              onClick={() => setIsCheckupModalOpen(true)}
            >
              <ClipboardCheck className="mr-2 h-4 w-4" /> Perform Checkup
            </Button>
            <Button
              variant="outline"
              className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-primary-foreground"
              onClick={() => setIsParkTransferModalOpen(true)}
            >
              <ArrowRightLeft className="mr-2 h-4 w-4" /> Park/Transfer
            </Button>
          </div>
        </div>
      </div>
      {/* Vehicle Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary/10 text-primary mr-4">
                <Car className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vehicle</p>
                <h3 className="text-xl font-semibold text-foreground">{vehicleDetails.make} {vehicleDetails.model}</h3>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div>
                <p className="text-xs text-muted-foreground">VIN</p>
                <p className="text-sm font-medium text-foreground">{vehicleDetails.vin || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Plate</p>
                <p className="text-sm font-medium text-foreground">{vehicleDetails.licensePlate}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Fuel Consumption (Illustrative)</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">
                  {fuelConsumptionData.average}
                  <span className="text-lg text-muted-foreground"> L/100km</span>
                </h3>
                <div className="flex items-center mt-2">
                  <span className={cn('text-sm mr-2', fuelConsumptionData.change <= 0 ? 'text-green-500' : 'text-red-500')}>
                    {fuelConsumptionData.change <= 0 ? <ArrowDown className="inline h-4 w-4" /> : <ArrowUp className="inline h-4 w-4" />} {Math.abs(fuelConsumptionData.change)}%
                  </span>
                  <span className="text-xs text-muted-foreground">vs last month</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-green-600/10 text-green-600">
                <Fuel className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>City</span>
                <span>{fuelConsumptionData.city} L/100km</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Highway</span>
                <span>{fuelConsumptionData.highway} L/100km</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Mileage (Illustrative)</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">
                  {mileageData.current.toLocaleString()}
                  <span className="text-lg text-muted-foreground"> km</span>
                </h3>
                <div className="flex items-center mt-2">
                  <span className="text-sm mr-2 text-primary">
                    <ArrowUp className="inline h-4 w-4" /> {mileageData.thisMonth.toLocaleString()} km
                  </span>
                  <span className="text-xs text-muted-foreground">this month</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <Gauge className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={mileageData.progressToService} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{mileageData.progressToService}% to next service</span>
                <span>{100 - mileageData.progressToService}% remaining</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Next Service</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">{nextServiceData.date}</h3>
                <div className="flex items-center mt-2">
                  <span className="text-sm mr-2 text-orange-500">
                    <Clock className="inline h-4 w-4" /> {nextServiceData.daysRemaining} {nextServiceData.daysRemaining === 1 ? 'day' : 'days'}
                  </span>
                  <span className="text-xs text-muted-foreground">remaining</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-orange-500/10 text-orange-500">
                <Wrench className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 space-y-1 text-xs text-muted-foreground">
              <p>Last Service: {nextServiceData.lastService}</p>
              <p>Service Interval: {nextServiceData.interval}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <CardTitle className="text-xl mb-2 sm:mb-0">Performance Comparison (Demo)</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ChartContainer config={{
                  yourVehicle: { label: 'Your Vehicle', color: '#6366f1' },
                  fleetAvg: { label: 'Fleet Avg.', color: '#10b981' },
                  bestInClass: { label: 'Best in Class', color: '#f59e42' },
                }}>
                  <LineChart data={performanceChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="yourVehicle" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="fleetAvg" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="bestInClass" stroke="#f59e42" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
          <Tabs defaultValue="serviceHistory" className="w-full">
            <Card className="overflow-hidden">
              <TabsList className="grid w-full grid-cols-3 border-b rounded-none p-0 h-auto bg-card">
                <TabsTrigger value="pastOwners" className="py-3 text-sm">Past Owners</TabsTrigger>
                <TabsTrigger value="serviceHistory" className="py-3 text-sm">Service History</TabsTrigger>
                <TabsTrigger value="documents" className="py-3 text-sm">Documents</TabsTrigger>
              </TabsList>
              <TabsContent value="pastOwners" className="p-6">
                <h3 className="text-lg font-medium text-foreground mb-4">Ownership History (Illustrative)</h3>
                <div className="space-y-4">
                  {dynamicPastOwnersData.map((owner, index) => (
                    <div key={index} className={cn('flex items-start p-4 border rounded-lg', owner.role === 'Current Owner' ? 'bg-primary/5 border-primary/20' : 'border-border hover:bg-muted/50')}>
                      <div className={cn('flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center mr-4', owner.iconBgClass)}>
                        <owner.icon className={cn('h-5 w-5', owner.iconColorClass)} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-foreground">{owner.name}</h4>
                          <Badge variant={owner.role === 'Current Owner' ? 'default' : 'secondary'} className="text-xs px-2 py-0.5">{owner.role}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{owner.period}</p>
                        <p className="text-sm text-muted-foreground">Mileage during ownership: {owner.mileage}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="serviceHistory" className="p-0">
                <div className="p-6 border-b"><h3 className="text-lg font-medium text-foreground">Service Records</h3></div>
                {loadingServiceHistory ? <div className="p-6 text-center"><Loader2 className="inline h-6 w-6 animate-spin text-primary mr-2" />Loading service history...</div> :
                 errorServiceHistory ? <p className="p-6 text-destructive text-center">{errorServiceHistory}</p> :
                 serviceHistory.length === 0 ? <p className="p-6 text-muted-foreground text-center">No service records found for this vehicle.</p> : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Service Type</TableHead>
                          <TableHead>Notes/Description</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {serviceHistory.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="text-sm text-foreground">
                              {record.requestedDate.toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{record.serviceType}</TableCell>
                            <TableCell className="text-sm text-muted-foreground max-w-xs truncate" title={record.notes}>{record.notes || 'N/A'}</TableCell>
                            <TableCell><Badge variant={getStatusBadgeVariant(record.status)} className="text-xs font-normal border px-2 py-0.5">{record.status}</Badge></TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary"><Eye className="h-4 w-4" /></Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="documents" className="p-6">
                <h3 className="text-lg font-medium text-foreground mb-4">Vehicle Documents (Illustrative)</h3>
                <div className="space-y-3">
                  {documentsData.map((doc, index) => (
                    <div key={index} className="flex items-center p-3 border border-border rounded-lg hover:bg-muted/50">
                      <div className={cn('p-2 rounded-lg mr-4', doc.iconBgClass)}>
                        <doc.icon className={cn('h-5 w-5', doc.iconColorClass)} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{doc.name}</h4>
                        <p className="text-sm text-muted-foreground">{doc.expiry}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Card>
          </Tabs>
        </div>
        {/* Right Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">Pending Services</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3 max-h-80 overflow-y-auto">
              {loadingPendingServices ? <div className="p-3 text-center"><Loader2 className="inline h-5 w-5 animate-spin text-primary mr-2" />Loading...</div> :
               errorPendingServices ? <p className="p-3 text-destructive text-center">{errorPendingServices}</p> :
               pendingServices.length === 0 ? <p className="p-3 text-muted-foreground text-center">No pending services.</p> :
               pendingServices.map((service) => (
                <div key={service.id} className="flex items-start p-3 border border-border rounded-lg hover:bg-muted/50">
                   <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center mr-3 bg-orange-100">
                    <Waypoints className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-foreground">{service.serviceType}</h4>
                    <p className="text-xs text-muted-foreground">
                      Requested: {service.requestedDate.toLocaleDateString()}
                    </p>
                    <div className="mt-1 flex items-center text-xs">
                      <Badge variant={getStatusBadgeVariant(service.status)} className="text-xs">{service.status}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">Upcoming Inspections</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3 max-h-80 overflow-y-auto">
              {loadingUpcomingInspections ? <div className="p-3 text-center"><Loader2 className="inline h-5 w-5 animate-spin text-primary mr-2" />Loading...</div> :
                errorUpcomingInspections ? <p className="p-3 text-destructive text-center">{errorUpcomingInspections}</p> :
               upcomingInspections.length === 0 ? <p className="p-3 text-muted-foreground text-center">No upcoming inspections.</p> :
               upcomingInspections.map((inspection) => (
                <div key={inspection.id} className="flex items-start p-3 border border-border rounded-lg hover:bg-muted/50">
                   <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center mr-3 bg-purple-100">
                    <ShieldAlert className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-foreground">{inspection.inspectionType}</h4>
                    <p className="text-xs text-muted-foreground">
                      Due: {inspection.dueDate.toLocaleDateString()}
                    </p>
                     <div className="mt-1 flex items-center text-xs">
                       <Badge variant={getStatusBadgeVariant(inspection.status)} className="text-xs">{inspection.status}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">Insurance Alerts</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3 max-h-80 overflow-y-auto">
                {loadingInsuranceAlerts ? <div className="p-3 text-center"><Loader2 className="inline h-5 w-5 animate-spin text-primary mr-2" />Loading...</div> :
                 errorInsuranceAlerts ? <p className="p-3 text-destructive text-center">{errorInsuranceAlerts}</p> :
                 insuranceAlerts.length === 0 ? <p className="p-3 text-muted-foreground text-center">No insurance alerts.</p> :
                 insuranceAlerts.map((alertItem) => (
                    <div key={alertItem.id} className={cn('flex items-start p-3 border rounded-lg hover:bg-muted/30', alertItem.status === 'Expired' || alertItem.status === 'Expiring Soon' ? 'border-destructive/30 bg-destructive/5' : 'border-primary/30 bg-primary/5')}>
                        <div className={cn('flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center mr-3', alertItem.status === 'Expired' || alertItem.status === 'Expiring Soon' ? 'bg-destructive/10' : 'bg-primary/10')}>
                            <Shield className={cn('h-5 w-5', alertItem.status === 'Expired' || alertItem.status === 'Expiring Soon' ? 'text-destructive' : 'text-primary')} />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-medium text-sm text-foreground">Policy: {alertItem.policyNumber || 'N/A'}</h4>
                            <p className="text-xs text-muted-foreground">
                                Provider: {alertItem.provider || 'N/A'} - Expires: {alertItem.expiryDate.toLocaleDateString()}
                            </p>
                            <div className="mt-1 flex items-center text-xs">
                                <Badge variant={getStatusBadgeVariant(alertItem.status)} className="text-xs">{alertItem.status}</Badge>
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
          </Card>
          <Button className="w-full mt-2" variant="secondary" size="lg" onClick={() => setIsFuelModalOpen(true)}>
            Make New Fuel Request
          </Button>
        </div>
      </div>
      <PerformCheckupModal
        isOpen={isCheckupModalOpen}
        onClose={() => setIsCheckupModalOpen(false)}
        vehicleId={vehicleDetails.id}
        vehicleName={`${vehicleDetails.make} ${vehicleDetails.model}`}
      />
      <ParkTransferModal
        isOpen={isParkTransferModalOpen}
        onClose={() => setIsParkTransferModalOpen(false)}
        vehicleId={vehicleDetails.id}
        vehicleName={`${vehicleDetails.make} ${vehicleDetails.model}`}
        currentAssignedTo={vehicleDetails.assignedTo || 'Unassigned'}
        currentAssignedToId={vehicleDetails.assignedToId || undefined}
      />
      <FuelRequestModal isOpen={isFuelModalOpen} onClose={() => setIsFuelModalOpen(false)} />
    </div>
  );
}