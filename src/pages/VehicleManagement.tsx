import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, Search, Car, Calendar, AlertCircle, CheckCircle, Clock, 
  Fuel, Gauge, Wrench, ArrowDown, ArrowUp, Users, Shield, 
  FileText, Download, ClipboardCheck, ArrowRightLeft, Eye,
  MoreVertical, Loader2, TriangleAlert
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

interface Vehicle {
  id: string;
  plateNumber: string;
  type: string;
  model: string;
  make: string;
  year: number;
  status: 'available' | 'assigned' | 'maintenance' | 'out-of-service';
  assignedTo?: string;
  lastService: string;
  nextService: string;
  mileage: number;
  fuelConsumption: number;
  vin?: string;
}

interface ServiceRecord {
  id: string;
  date: string;
  type: string;
  description: string;
  status: 'completed' | 'pending' | 'overdue';
}

interface PendingService {
  id: string;
  vehicleId: string;
  type: string;
  scheduledDate: string;
  status: 'pending' | 'overdue';
  priority: 'low' | 'medium' | 'high';
}

interface InspectionAlert {
  id: string;
  vehicleId: string;
  type: string;
  dueDate: string;
  status: 'upcoming' | 'overdue';
}

const mockVehicles: Vehicle[] = [
  {
    id: '1',
    plateNumber: 'ABC-123',
    type: 'Pickup Truck',
    model: 'Hilux',
    make: 'Toyota',
    year: 2022,
    status: 'assigned',
    assignedTo: 'John Smith',
    lastService: '2024-01-15',
    nextService: '2024-04-15',
    mileage: 45000,
    fuelConsumption: 8.2,
    vin: 'JT3HN86R8Y0123456'
  },
  {
    id: '2',
    plateNumber: 'XYZ-789',
    type: 'Van',
    model: 'Transit',
    make: 'Ford',
    year: 2021,
    status: 'available',
    lastService: '2024-02-10',
    nextService: '2024-05-10',
    mileage: 32000,
    fuelConsumption: 9.1,
    vin: 'WF0SXXGBXSKW12345'
  },
  {
    id: '3',
    plateNumber: 'DEF-456',
    type: 'Sedan',
    model: 'Corolla',
    make: 'Toyota',
    year: 2023,
    status: 'maintenance',
    lastService: '2024-03-01',
    nextService: '2024-06-01',
    mileage: 18000,
    fuelConsumption: 6.8,
    vin: 'JTDEPRAE7NJ123456'
  }
];

const mockServiceRecords: ServiceRecord[] = [
  { id: '1', date: '2024-03-15', type: 'Oil Change', description: 'Regular maintenance service', status: 'completed' },
  { id: '2', date: '2024-02-28', type: 'Brake Inspection', description: 'Annual brake safety check', status: 'completed' },
  { id: '3', date: '2024-04-20', type: 'Tire Rotation', description: 'Scheduled tire maintenance', status: 'pending' }
];

const mockPendingServices: PendingService[] = [
  { id: '1', vehicleId: '1', type: 'Oil Change', scheduledDate: '2024-04-15', status: 'pending', priority: 'medium' },
  { id: '2', vehicleId: '3', type: 'Brake Service', scheduledDate: '2024-03-20', status: 'overdue', priority: 'high' }
];

const mockInspectionAlerts: InspectionAlert[] = [
  { id: '1', vehicleId: '1', type: 'Annual Safety Inspection', dueDate: '2024-05-01', status: 'upcoming' },
  { id: '2', vehicleId: '2', type: 'Emissions Test', dueDate: '2024-03-15', status: 'overdue' }
];

const fleetAnalyticsData = [
  { month: 'Jan', utilization: 78, fuelCost: 12500, maintenance: 3200 },
  { month: 'Feb', utilization: 82, fuelCost: 13200, maintenance: 2800 },
  { month: 'Mar', utilization: 85, fuelCost: 14100, maintenance: 4100 },
  { month: 'Apr', utilization: 79, fuelCost: 13800, maintenance: 2900 },
  { month: 'May', utilization: 88, fuelCost: 15200, maintenance: 3500 }
];

export default function VehicleManagement() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCheckupModalOpen, setIsCheckupModalOpen] = useState(false);
  const [isParkTransferModalOpen, setIsParkTransferModalOpen] = useState(false);
  const { toast } = useToast();

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status.toLowerCase()) {
      case 'available':
      case 'completed':
        return 'default';
      case 'assigned':
      case 'pending':
        return 'secondary';
      case 'maintenance':
      case 'overdue':
        return 'destructive';
      case 'out-of-service':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-4 w-4" />;
      case 'assigned':
        return <Clock className="h-4 w-4" />;
      case 'maintenance':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddVehicle = () => {
    toast({
      title: "Vehicle Added",
      description: "New vehicle has been successfully added to the fleet.",
    });
    setIsAddDialogOpen(false);
  };

  // Fleet analytics calculations
  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter(v => v.status === 'available').length;
  const inMaintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length;
  const avgFuelConsumption = vehicles.reduce((sum, v) => sum + v.fuelConsumption, 0) / vehicles.length;
  const totalMileage = vehicles.reduce((sum, v) => sum + v.mileage, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vehicle Management</h1>
          <p className="text-muted-foreground">Monitor and manage your company fleet operations</p>
        </div>
        <div className="flex items-center w-full mt-4 md:mt-0">
          <div className="relative flex-grow md:flex-grow-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search vehicles..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 h-9 w-full md:w-auto" 
            />
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
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Vehicle
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Vehicle</DialogTitle>
                  <DialogDescription>
                    Enter the details for the new vehicle to add to your fleet.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="plate">Plate Number</Label>
                      <Input id="plate" placeholder="ABC-123" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Vehicle Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedan">Sedan</SelectItem>
                          <SelectItem value="pickup">Pickup Truck</SelectItem>
                          <SelectItem value="van">Van</SelectItem>
                          <SelectItem value="suv">SUV</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="model">Model</Label>
                      <Input id="model" placeholder="Toyota Corolla" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year">Year</Label>
                      <Input id="year" type="number" placeholder="2023" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vin">VIN</Label>
                    <Input id="vin" placeholder="Vehicle Identification Number" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" placeholder="Additional vehicle details..." />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleAddVehicle} className="flex-1">Add Vehicle</Button>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Fleet Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary/10 text-primary mr-4">
                <Car className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Fleet</p>
                <h3 className="text-xl font-semibold text-foreground">{totalVehicles} Vehicles</h3>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div>
                <p className="text-xs text-muted-foreground">Available</p>
                <p className="text-sm font-medium text-foreground">{availableVehicles}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">In Use</p>
                <p className="text-sm font-medium text-foreground">{totalVehicles - availableVehicles - inMaintenanceVehicles}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Avg Fuel Consumption</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">
                  {avgFuelConsumption.toFixed(1)}
                  <span className="text-lg text-muted-foreground"> L/100km</span>
                </h3>
                <div className="flex items-center mt-2">
                  <span className="text-sm mr-2 text-green-500">
                    <ArrowDown className="inline h-4 w-4" /> 3.2%
                  </span>
                  <span className="text-xs text-muted-foreground">vs last month</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-green-600/10 text-green-600">
                <Fuel className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Total Mileage</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">
                  {(totalMileage / 1000).toFixed(0)}K
                  <span className="text-lg text-muted-foreground"> km</span>
                </h3>
                <div className="flex items-center mt-2">
                  <span className="text-sm mr-2 text-primary">
                    <ArrowUp className="inline h-4 w-4" /> 12.5K km
                  </span>
                  <span className="text-xs text-muted-foreground">this month</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <Gauge className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Maintenance Due</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">{inMaintenanceVehicles}</h3>
                <div className="flex items-center mt-2">
                  <span className="text-sm mr-2 text-orange-500">
                    <Clock className="inline h-4 w-4" /> 2 overdue
                  </span>
                  <span className="text-xs text-muted-foreground">services</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-orange-500/10 text-orange-500">
                <Wrench className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Fleet Analytics Chart */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <CardTitle className="text-xl mb-2 sm:mb-0">Fleet Analytics</CardTitle>
                <Select defaultValue="utilization">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utilization">Utilization</SelectItem>
                    <SelectItem value="fuelCost">Fuel Cost</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={fleetAnalyticsData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="utilization" name="Utilization %" stroke="hsl(var(--primary))" strokeWidth={2} />
                    <Line type="monotone" dataKey="fuelCost" name="Fuel Cost" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                    <Line type="monotone" dataKey="maintenance" name="Maintenance" stroke="hsl(var(--chart-3))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Management Tabs */}
          <Tabs defaultValue="vehicles" className="w-full">
            <Card className="overflow-hidden">
              <TabsList className="grid w-full grid-cols-3 border-b rounded-none p-0 h-auto bg-card">
                <TabsTrigger value="vehicles" className="py-3 text-sm data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Fleet Overview</TabsTrigger>
                <TabsTrigger value="services" className="py-3 text-sm data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Service History</TabsTrigger>
                <TabsTrigger value="assignments" className="py-3 text-sm data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Assignments</TabsTrigger>
              </TabsList>
              
              <TabsContent value="vehicles" className="p-0">
                <div className="p-6 border-b">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-foreground">Vehicle Fleet</h3>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="assigned">Assigned</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="out-of-service">Out of Service</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Mileage</TableHead>
                        <TableHead>Next Service</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVehicles.map((vehicle) => (
                        <TableRow key={vehicle.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <Car className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{vehicle.plateNumber}</p>
                                <p className="text-sm text-muted-foreground">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{vehicle.type}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(vehicle.status)} className="text-xs font-normal border px-2 py-0.5">
                              {getStatusIcon(vehicle.status)}
                              <span className="ml-1 capitalize">{vehicle.status}</span>
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{vehicle.assignedTo || 'Unassigned'}</TableCell>
                          <TableCell className="text-sm text-foreground">{vehicle.mileage.toLocaleString()} km</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{vehicle.nextService}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="services" className="p-0">
                <div className="p-6 border-b"><h3 className="text-lg font-medium text-foreground">Service Records</h3></div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Service Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockServiceRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="text-sm text-foreground">{record.date}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">ABC-123</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{record.type}</TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-xs truncate" title={record.description}>{record.description}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(record.status)} className="text-xs font-normal border px-2 py-0.5">
                              {record.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="assignments" className="p-6">
                <h3 className="text-lg font-medium text-foreground mb-4">Vehicle Assignments</h3>
                <div className="space-y-4">
                  {vehicles.filter(v => v.assignedTo).map((vehicle) => (
                    <div key={vehicle.id} className="flex items-center p-4 border border-border rounded-lg hover:bg-muted/50">
                      <div className="p-3 rounded-lg bg-primary/10 text-primary mr-4">
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{vehicle.plateNumber} - {vehicle.make} {vehicle.model}</h4>
                        <p className="text-sm text-muted-foreground">Assigned to: {vehicle.assignedTo}</p>
                        <p className="text-sm text-muted-foreground">Since: Jan 2024</p>
                      </div>
                      <Button variant="outline" size="sm">Reassign</Button>
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
              <Shield className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-0 space-y-3 max-h-80 overflow-y-auto">
              {mockPendingServices.length === 0 ? (
                <p className="p-3 text-muted-foreground text-center">No pending services.</p>
              ) : (
                mockPendingServices.map((service) => (
                  <div key={service.id} className="flex items-start p-3 border border-border rounded-lg hover:bg-muted/50">
                    <div className={cn(
                      "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center mr-3",
                      service.priority === 'high' ? 'bg-red-100 text-red-600' : 
                      service.priority === 'medium' ? 'bg-orange-100 text-orange-600' : 
                      'bg-blue-100 text-blue-600'
                    )}>
                      <Wrench className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-foreground">{service.type}</h4>
                      <p className="text-xs text-muted-foreground">Vehicle: {vehicles.find(v => v.id === service.vehicleId)?.plateNumber}</p>
                      <p className="text-xs text-muted-foreground">Due: {service.scheduledDate}</p>
                      <div className="mt-1">
                        <Badge variant={getStatusBadgeVariant(service.status)} className="text-xs">
                          {service.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">Inspection Alerts</CardTitle>
              <Shield className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-0 space-y-3 max-h-80 overflow-y-auto">
              {mockInspectionAlerts.length === 0 ? (
                <p className="p-3 text-muted-foreground text-center">No inspection alerts.</p>
              ) : (
                mockInspectionAlerts.map((alert) => (
                  <div key={alert.id} className={cn(
                    "flex items-start p-3 border rounded-lg hover:bg-muted/30",
                    alert.status === "overdue" ? "border-destructive/30 bg-destructive/5" : "border-primary/30 bg-primary/5"
                  )}>
                    <div className={cn(
                      "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center mr-3",
                      alert.status === "overdue" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                    )}>
                      <Shield className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-foreground">{alert.type}</h4>
                      <p className="text-xs text-muted-foreground">Vehicle: {vehicles.find(v => v.id === alert.vehicleId)?.plateNumber}</p>
                      <p className="text-xs text-muted-foreground">Due: {alert.dueDate}</p>
                      <div className="mt-1">
                        <Badge variant={getStatusBadgeVariant(alert.status)} className="text-xs">
                          {alert.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export Fleet Report
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Maintenance
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Users className="mr-2 h-4 w-4" />
                Assign Vehicle
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      {isCheckupModalOpen && (
        <Dialog open={isCheckupModalOpen} onOpenChange={setIsCheckupModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Perform Vehicle Checkup</DialogTitle>
              <DialogDescription>Select a vehicle to perform a checkup</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map(vehicle => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.plateNumber} - {vehicle.make} {vehicle.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button onClick={() => setIsCheckupModalOpen(false)} className="flex-1">
                  Start Checkup
                </Button>
                <Button variant="outline" onClick={() => setIsCheckupModalOpen(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {isParkTransferModalOpen && (
        <Dialog open={isParkTransferModalOpen} onOpenChange={setIsParkTransferModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Park/Transfer Vehicle</DialogTitle>
              <DialogDescription>Manage vehicle parking or transfer operations</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map(vehicle => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.plateNumber} - {vehicle.make} {vehicle.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="park">Park Vehicle</SelectItem>
                  <SelectItem value="transfer">Transfer Vehicle</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button onClick={() => setIsParkTransferModalOpen(false)} className="flex-1">
                  Confirm
                </Button>
                <Button variant="outline" onClick={() => setIsParkTransferModalOpen(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}