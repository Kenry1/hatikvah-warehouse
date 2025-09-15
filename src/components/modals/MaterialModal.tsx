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
import { Package, Barcode, DollarSign, AlertTriangle, Calendar, MapPin, FileText, Tag, Building2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const materialFormSchema = z.object({
  itemName: z.string().min(2, 'Item name must be at least 2 characters'),
  itemCode: z.string().min(3, 'Item code must be at least 3 characters'),
  barcode: z.string().optional(),
  category: z.string().min(1, 'Please select a category'),
  subcategory: z.string().min(1, 'Please select a subcategory'),
  description: z.string().min(10, 'Please provide a detailed description'),
  unit: z.string().min(1, 'Please select a unit of measurement'),
  currentStock: z.number().min(0, 'Current stock must be positive'),
  minimumStock: z.number().min(0, 'Minimum stock must be positive'),
  maximumStock: z.number().min(0, 'Maximum stock must be positive'),
  reorderPoint: z.number().min(0, 'Reorder point must be positive'),
  unitCost: z.number().min(0, 'Unit cost must be positive'),
  sellingPrice: z.number().min(0, 'Selling price must be positive'),
  supplierName: z.string().min(1, 'Please select a supplier'),
  supplierPartNumber: z.string().optional(),
  location: z.string().min(1, 'Please specify storage location'),
  shelf: z.string().optional(),
  bin: z.string().optional(),
  isActive: z.boolean(),
  isHazardous: z.boolean(),
  serialTracked: z.boolean(),
  batchTracked: z.boolean(),
  expirationDate: z.string().optional(),
  warrantyPeriod: z.number().min(0, 'Warranty period must be positive'),
  weight: z.number().min(0, 'Weight must be positive'),
  dimensions: z.string().optional(),
  color: z.string().optional(),
  material: z.string().optional(),
  manufacturer: z.string().optional(),
  modelNumber: z.string().optional(),
  specifications: z.string().optional(),
  safetyNotes: z.string().optional(),
  notes: z.string().optional(),
});

type MaterialFormData = z.infer<typeof materialFormSchema>;

interface MaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (materialData: MaterialFormData) => void;
  initialData?: Partial<MaterialFormData>;
  mode?: 'create' | 'edit';
}

export function MaterialModal({ isOpen, onClose, onSave, initialData, mode = 'create' }: MaterialModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
  'Safety Equipment', 'Solar Equipment', 'Company Assets', 'Electronic and Computing Devices'
  ];

  const subcategories = {
    'Safety Equipment': ['Hard Hats', 'Safety Vests', 'Work Gloves', 'Safety Boots', 'Eye Protection', 'Fall Protection'],
  'Solar Equipment': ['Distribution Boxes', 'Patch Panels', 'Network Connectors', 'Splice Trays', 'Cable Management'],
    'Company Assets': ['Testing Equipment', 'Power Tools', 'Vehicles', 'Office Equipment', 'Software Licenses'],
    'Electronic and Computing Devices': ['Laptops', 'Desktops', 'Monitors', 'Servers', 'Network Devices', 'Mobile Devices', 'Printers', 'Peripherals']
  };

  const units = [
    'Each', 'Meter', 'Feet', 'Kilogram', 'Pound', 'Liter', 'Gallon', 'Box', 'Pack', 'Roll', 'Set', 'Pair'
  ];

  const suppliers = [
    'ABC Materials Ltd', 'TechSupply Corp', 'SafetyFirst Inc', 'FiberTech Solutions', 
    'Industrial Supplies Co', 'Network Components Ltd', 'Premium Safety Gear', 'IT Hardware Solutions', 'Global Electronics'
  ];

  const locations = [
    'Warehouse A - Zone 1', 'Warehouse A - Zone 2', 'Warehouse B - Zone 1', 'Warehouse B - Zone 2',
    'Storage Room 1', 'Storage Room 2', 'Outdoor Storage', 'Cold Storage', 'Hazmat Storage', 'IT Storage Cage'
  ];

  const form = useForm<MaterialFormData>({
    resolver: zodResolver(materialFormSchema),
    defaultValues: {
      itemName: initialData?.itemName || '',
      itemCode: initialData?.itemCode || '',
      barcode: initialData?.barcode || '',
      category: initialData?.category || '',
      subcategory: initialData?.subcategory || '',
      description: initialData?.description || '',
      unit: initialData?.unit || 'Each',
      currentStock: initialData?.currentStock || 0,
      minimumStock: initialData?.minimumStock || 10,
      maximumStock: initialData?.maximumStock || 100,
      reorderPoint: initialData?.reorderPoint || 20,
      unitCost: initialData?.unitCost || 0,
      sellingPrice: initialData?.sellingPrice || 0,
      supplierName: initialData?.supplierName || '',
      supplierPartNumber: initialData?.supplierPartNumber || '',
      location: initialData?.location || '',
      shelf: initialData?.shelf || '',
      bin: initialData?.bin || '',
      isActive: initialData?.isActive ?? true,
      isHazardous: initialData?.isHazardous ?? false,
      serialTracked: initialData?.serialTracked ?? false,
      batchTracked: initialData?.batchTracked ?? false,
      expirationDate: initialData?.expirationDate || '',
      warrantyPeriod: initialData?.warrantyPeriod || 12,
      weight: initialData?.weight || 0,
      dimensions: initialData?.dimensions || '',
      color: initialData?.color || '',
      material: initialData?.material || '',
      manufacturer: initialData?.manufacturer || '',
      modelNumber: initialData?.modelNumber || '',
      specifications: initialData?.specifications || '',
      safetyNotes: initialData?.safetyNotes || '',
      notes: initialData?.notes || '',
    },
  });

  const selectedCategory = form.watch('category');

  const onSubmit = async (data: MaterialFormData) => {
    setIsSubmitting(true);
    try {
      onSave(data);
      toast({
        title: mode === 'create' ? 'Material Created' : 'Material Updated',
        description: `${data.itemName} has been ${mode === 'create' ? 'created' : 'updated'} successfully.`,
      });
      onClose();
      form.reset();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${mode} material. Please try again.`,
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
            <Package className="h-5 w-5" />
            {mode === 'create' ? 'Create New Material' : 'Edit Material'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Add a new material to inventory with complete specifications, pricing, and stock information.'
              : 'Update material information, stock levels, and specifications.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <h3 className="text-lg font-medium">Basic Information</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="itemName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Safety Hard Hat" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="itemCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Code</FormLabel>
                      <FormControl>
                        <Input placeholder="SHH-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
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
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subcategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategory</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedCategory}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subcategory" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {selectedCategory && subcategories[selectedCategory as keyof typeof subcategories]?.map((subcat) => (
                            <SelectItem key={subcat} value={subcat}>{subcat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit of Measurement</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
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
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Barcode (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="123456789012" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Detailed description of the item..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Stock Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <h3 className="text-lg font-medium">Stock Information</h3>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="currentStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Stock</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
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
                  name="minimumStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Stock</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="10" 
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
                  name="maximumStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Stock</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="100" 
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
                  name="reorderPoint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reorder Point</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="20" 
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

            {/* Pricing Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <h3 className="text-lg font-medium">Pricing Information</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="unitCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Cost ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="25.99" 
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
                  name="sellingPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selling Price ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="35.99" 
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

            {/* Supplier Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <h3 className="text-lg font-medium">Supplier Information</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="supplierName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select supplier" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {suppliers.map((supplier) => (
                            <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="supplierPartNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier Part Number</FormLabel>
                      <FormControl>
                        <Input placeholder="SUP-12345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <h3 className="text-lg font-medium">Storage Location</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location} value={location}>{location}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shelf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shelf (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="A-12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bin (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="B-034" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Physical Properties */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <h3 className="text-lg font-medium">Physical Properties</h3>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (lbs)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="1.5" 
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
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <Input placeholder="Yellow" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="material"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material</FormLabel>
                      <FormControl>
                        <Input placeholder="ABS Plastic" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="warrantyPeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warranty (Months)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="12" 
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
                  name="dimensions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dimensions (L x W x H)</FormLabel>
                      <FormControl>
                        <Input placeholder="10 x 8 x 6 inches" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expirationDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiration Date (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Manufacturer Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <h3 className="text-lg font-medium">Manufacturer Information</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="manufacturer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manufacturer</FormLabel>
                      <FormControl>
                        <Input placeholder="3M Company" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="modelNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model Number</FormLabel>
                      <FormControl>
                        <Input placeholder="H-700R" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Tracking Options */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Barcode className="h-4 w-4" />
                <h3 className="text-lg font-medium">Tracking Options</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="serialTracked"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Serial Number Tracking</FormLabel>
                        <FormDescription>Track individual serial numbers</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="batchTracked"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Batch/Lot Tracking</FormLabel>
                        <FormDescription>Track by batch or lot numbers</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isHazardous"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Hazardous Material</FormLabel>
                        <FormDescription>Requires special handling</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <FormDescription>Available for use/ordering</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="specifications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Technical Specifications</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Detailed technical specifications, compliance standards, performance metrics..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="safetyNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Safety Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Safety instructions, handling precautions, storage requirements..." {...field} />
                    </FormControl>
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
                      <Textarea placeholder="Any other relevant information..." {...field} />
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
                  : (mode === 'create' ? 'Create Material' : 'Update Material')
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}