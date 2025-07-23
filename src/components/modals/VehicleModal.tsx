import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Car, Truck, Calendar, MapPin, Wrench, FileText, Fuel, Shield, User, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const vehicleFormSchema = z.object({
  vehicleNumber: z.string().min(3, 'Vehicle number must be at least 3 characters'),
  licensePlate: z.string().min(5, 'License plate must be at least 5 characters'),
  make: z.string().min(2, 'Please enter vehicle make'),
  model: z.string().min(2, 'Please enter vehicle model'),
  year: z.number().min(1990, 'Year must be 1990 or later').max(new Date().getFullYear() + 1),
  vin: z.string().min(17, 'VIN must be 17 characters'),
  type: z.string().min(1, 'Please select vehicle type'),
  category: z.string().min(1, 'Please select vehicle category'),
  color: z.string().min(2, 'Please enter vehicle color'),
  fuelType: z.string().min(1, 'Please select fuel type'),
  engineCapacity: z.number().min(0.5, 'Engine capacity must be at least 0.5L'),
  transmission: z.string().min(1, 'Please select transmission type'),
  seatingCapacity: z.number().min(1, 'Seating capacity must be at least 1'),
  purchaseDate: z.string().min(1, 'Please enter purchase date'),
  purchasePrice: z.number().min(0, 'Purchase price must be positive'),
  currentMileage: z.number().min(0, 'Current mileage must be positive'),
  condition: z.string().min(1, 'Please select vehicle condition'),
  status: z.string().min(1, 'Please select vehicle status'),
  assignedDriver: z.string().optional(),
  assignedDepartment: z.string().optional(),
  currentLocation: z.string().optional(),
  insuranceProvider: z.string().min(1, 'Please enter insurance provider'),
  insurancePolicyNumber: z.string().min(1, 'Please enter insurance policy number'),
  insuranceExpiryDate: z.string().min(1, 'Please enter insurance expiry date'),
  registrationNumber: z.string().min(1, 'Please enter registration number'),
  registrationExpiryDate: z.string().min(1, 'Please enter registration expiry date'),
  lastServiceDate: z.string().optional(),
  nextServiceDate: z.string().optional(),
  serviceMileageInterval: z.number().min(1000, 'Service interval must be at least 1000 miles'),
  warrantyExpiryDate: z.string().optional(),
  isActive: z.boolean(),
  gpsEnabled: z.boolean(),
  maintenanceAlerts: z.boolean(),
  fuelEfficiency: z.number().min(1, 'Fuel efficiency must be positive'),
  maxLoadCapacity: z.number().min(0, 'Load capacity must be positive'),
  specialFeatures: z.string().optional(),
  safetyFeatures: z.string().optional(),
  maintenanceNotes: z.string().optional(),
  documents: z.string().optional(),
  notes: z.string().optional(),
});

type VehicleFormData = z.infer<typeof vehicleFormSchema>;

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicleData: VehicleFormData) => void;
  initialData?: Partial<VehicleFormData>;
  mode?: 'create' | 'edit';
}

export function VehicleModal({ isOpen, onClose, onSave, initialData, mode = 'create' }: VehicleModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const vehicleTypes = [
    'Sedan', 'SUV', 'Pickup Truck', 'Van', 'Motorcycle', 'Bus', 'Heavy Truck', 'Crane', 'Excavator', 'Other'
  ];

  const vehicleCategories = [
    'Passenger Vehicle', 'Commercial Vehicle', 'Service Vehicle', 'Emergency Vehicle', 
    'Construction Equipment', 'Delivery Vehicle', 'Executive Vehicle', 'Field Vehicle'
  ];

  const fuelTypes = [
    'Gasoline', 'Diesel', 'Electric', 'Hybrid', 'CNG', 'LPG', 'Hydrogen'
  ];

  const transmissionTypes = ['Manual', 'Automatic', 'CVT', 'Semi-Automatic'];

  const conditions = ['Excellent', 'Good', 'Fair', 'Poor', 'Needs Repair'];

  const statuses = ['Available', 'In Use', 'Under Maintenance', 'Out of Service', 'Reserved'];

  const departments = [
    'Operations', 'Field Services', 'Engineering', 'Executive', 'Logistics', 
    'Safety', 'Maintenance', 'Sales', 'Administration'
  ];

  const drivers = [
    'John Smith - Commercial License',
    'Mike Johnson - Standard License', 
    'Sarah Williams - Heavy Vehicle License',
    'David Brown - Motorcycle License',
    'Lisa Davis - Standard License',
    'Unassigned'
  ];

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      vehicleNumber: initialData?.vehicleNumber || '',
      licensePlate: initialData?.licensePlate || '',
      make: initialData?.make || '',
      model: initialData?.model || '',
      year: initialData?.year || new Date().getFullYear(),
      vin: initialData?.vin || '',
      type: initialData?.type || '',
      category: initialData?.category || '',
      color: initialData?.color || '',
      fuelType: initialData?.fuelType || 'Gasoline',
      engineCapacity: initialData?.engineCapacity || 2.0,
      transmission: initialData?.transmission || 'Automatic',
      seatingCapacity: initialData?.seatingCapacity || 5,
      purchaseDate: initialData?.purchaseDate || '',
      purchasePrice: initialData?.purchasePrice || 0,
      currentMileage: initialData?.currentMileage || 0,
      condition: initialData?.condition || 'Good',
      status: initialData?.status || 'Available',
      assignedDriver: initialData?.assignedDriver || 'Unassigned',
      assignedDepartment: initialData?.assignedDepartment || '',
      currentLocation: initialData?.currentLocation || '',
      insuranceProvider: initialData?.insuranceProvider || '',
      insurancePolicyNumber: initialData?.insurancePolicyNumber || '',
      insuranceExpiryDate: initialData?.insuranceExpiryDate || '',
      registrationNumber: initialData?.registrationNumber || '',
      registrationExpiryDate: initialData?.registrationExpiryDate || '',
      lastServiceDate: initialData?.lastServiceDate || '',
      nextServiceDate: initialData?.nextServiceDate || '',
      serviceMileageInterval: initialData?.serviceMileageInterval || 5000,
      warrantyExpiryDate: initialData?.warrantyExpiryDate || '',
      isActive: initialData?.isActive ?? true,
      gpsEnabled: initialData?.gpsEnabled ?? false,
      maintenanceAlerts: initialData?.maintenanceAlerts ?? true,
      fuelEfficiency: initialData?.fuelEfficiency || 25,
      maxLoadCapacity: initialData?.maxLoadCapacity || 1000,
      specialFeatures: initialData?.specialFeatures || '',
      safetyFeatures: initialData?.safetyFeatures || '',
      maintenanceNotes: initialData?.maintenanceNotes || '',
      documents: initialData?.documents || '',
      notes: initialData?.notes || '',
    },
  });

  const onSubmit = async (data: VehicleFormData) => {
    setIsSubmitting(true);
    try {
      onSave(data);
      toast({
        title: mode === 'create' ? 'Vehicle Created' : 'Vehicle Updated',
        description: `${data.make} ${data.model} (${data.licensePlate}) has been ${mode === 'create' ? 'created' : 'updated'} successfully.`,
      });
      onClose();
      form.reset();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${mode} vehicle. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            {mode === 'create' ? 'Create New Vehicle' : 'Edit Vehicle'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Add a new vehicle to the fleet with complete registration, insurance, and maintenance information.'
              : 'Update vehicle information, assignments, and maintenance records.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Vehicle Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4" />
                <h3 className="text-lg font-medium">Basic Vehicle Information</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="vehicleNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Number</FormLabel>
                      <FormControl>
                        <Input placeholder="VEH-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="licensePlate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Plate</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC-1234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="make"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Make</FormLabel>
                      <FormControl>
                        <Input placeholder="Toyota" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input placeholder="Camry" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="2024" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="vin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>VIN Number</FormLabel>
                      <FormControl>
                        <Input placeholder="1HGBH41JXMN109186" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <Input placeholder="White" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Vehicle Classification */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                <h3 className="text-lg font-medium">Vehicle Classification</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vehicleTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vehicleCategories.map((category) => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Engine & Technical Specifications */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                <h3 className="text-lg font-medium">Technical Specifications</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="fuelType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fuel Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select fuel type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {fuelTypes.map((fuel) => (
                            <SelectItem key={fuel} value={fuel}>{fuel}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="engineCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Engine Capacity (L)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="2.0" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="transmission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transmission</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select transmission" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {transmissionTypes.map((trans) => (
                            <SelectItem key={trans} value={trans}>{trans}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="seatingCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seating Capacity</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="5" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fuelEfficiency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fuel Efficiency (MPG)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="25" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxLoadCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Load Capacity (lbs)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="1000" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentMileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Mileage</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="15000" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Purchase & Financial Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <h3 className="text-lg font-medium">Purchase & Financial Information</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="purchaseDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="purchasePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Price ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="25000" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {conditions.map((condition) => (
                            <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="warrantyExpiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warranty Expiry Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Assignment & Status */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <h3 className="text-lg font-medium">Assignment & Status</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statuses.map((status) => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="assignedDriver"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned Driver</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select driver" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {drivers.map((driver) => (
                            <SelectItem key={driver} value={driver}>{driver}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="assignedDepartment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned Department</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="currentLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Main Office Parking" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Insurance & Registration */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <h3 className="text-lg font-medium">Insurance & Registration</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="insuranceProvider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance Provider</FormLabel>
                      <FormControl>
                        <Input placeholder="State Farm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="insurancePolicyNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Policy Number</FormLabel>
                      <FormControl>
                        <Input placeholder="POL-123456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="insuranceExpiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance Expiry Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="registrationExpiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration Expiry Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="registrationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration Number</FormLabel>
                    <FormControl>
                      <Input placeholder="REG-123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Maintenance Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                <h3 className="text-lg font-medium">Maintenance Information</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="lastServiceDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Service Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nextServiceDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Next Service Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="serviceMileageInterval"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Interval (Miles)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="5000" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Features & Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <h3 className="text-lg font-medium">Features & Settings</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <FormDescription>Vehicle is active in fleet</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gpsEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">GPS Tracking</FormLabel>
                        <FormDescription>Enable GPS tracking</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maintenanceAlerts"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Maintenance Alerts</FormLabel>
                        <FormDescription>Enable service reminders</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <h3 className="text-lg font-medium">Additional Information</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="specialFeatures"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Features</FormLabel>
                      <FormControl>
                        <Textarea placeholder="GPS, Bluetooth, Backup Camera..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="safetyFeatures"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Safety Features</FormLabel>
                      <FormControl>
                        <Textarea placeholder="ABS, Airbags, Stability Control..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="maintenanceNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maintenance Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Regular maintenance history and notes..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="documents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document References</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Insurance documents, registration papers, service records..." {...field} />
                    </FormControl>
                    <FormDescription>
                      List document names and reference numbers for record keeping.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any additional information about the vehicle..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting 
                  ? (mode === 'create' ? 'Creating...' : 'Updating...') 
                  : (mode === 'create' ? 'Create Vehicle' : 'Update Vehicle')
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}