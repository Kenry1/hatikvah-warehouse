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
import { Building2, Mail, Phone, MapPin, DollarSign, Calendar, FileText, Star, Truck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const supplierFormSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  contactPerson: z.string().min(2, 'Contact person name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  alternativePhone: z.string().optional(),
  address: z.string().min(10, 'Please enter complete address'),
  city: z.string().min(2, 'Please enter city'),
  state: z.string().min(2, 'Please enter state'),
  zipCode: z.string().min(3, 'Please enter zip code'),
  country: z.string().min(2, 'Please select country'),
  category: z.string().min(1, 'Please select supplier category'),
  taxId: z.string().min(5, 'Please enter valid tax ID'),
  businessRegistration: z.string().min(5, 'Please enter business registration number'),
  paymentTerms: z.string().min(1, 'Please select payment terms'),
  creditLimit: z.number().min(0, 'Credit limit must be positive'),
  rating: z.number().min(1).max(5),
  isActive: z.boolean(),
  deliveryTime: z.number().min(1, 'Delivery time must be at least 1 day'),
  minimumOrderAmount: z.number().min(0, 'Minimum order amount must be positive'),
  discountPercentage: z.number().min(0).max(100, 'Discount percentage must be between 0-100'),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  routingNumber: z.string().optional(),
  website: z.string().optional(),
  notes: z.string().optional(),
  certifications: z.string().optional(),
});

type SupplierFormData = z.infer<typeof supplierFormSchema>;

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (supplierData: SupplierFormData) => void;
  initialData?: Partial<SupplierFormData>;
  mode?: 'create' | 'edit';
}

export function SupplierModal({ isOpen, onClose, onSave, initialData, mode = 'create' }: SupplierModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
  'Safety Equipment', 'Solar Equipment', 'Electronics',
    'Office Supplies', 'Vehicles & Parts', 'Software & Licenses', 'Consulting Services',
    'Construction Materials', 'Tools & Equipment', 'Telecommunications', 'IT Hardware'
  ];

  const paymentTerms = [
    'Net 30', 'Net 60', 'Net 90', 'Due on Receipt', 'Cash on Delivery',
    '2/10 Net 30', '1/10 Net 30', 'End of Month', 'Credit Card Only'
  ];

  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Germany', 'France',
    'Australia', 'Japan', 'China', 'India', 'Brazil', 'Mexico', 'Other'
  ];

  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      companyName: initialData?.companyName || '',
      contactPerson: initialData?.contactPerson || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      alternativePhone: initialData?.alternativePhone || '',
      address: initialData?.address || '',
      city: initialData?.city || '',
      state: initialData?.state || '',
      zipCode: initialData?.zipCode || '',
      country: initialData?.country || 'United States',
      category: initialData?.category || '',
      taxId: initialData?.taxId || '',
      businessRegistration: initialData?.businessRegistration || '',
      paymentTerms: initialData?.paymentTerms || 'Net 30',
      creditLimit: initialData?.creditLimit || 10000,
      rating: initialData?.rating || 5,
      isActive: initialData?.isActive ?? true,
      deliveryTime: initialData?.deliveryTime || 7,
      minimumOrderAmount: initialData?.minimumOrderAmount || 100,
      discountPercentage: initialData?.discountPercentage || 0,
      bankName: initialData?.bankName || '',
      accountNumber: initialData?.accountNumber || '',
      routingNumber: initialData?.routingNumber || '',
      website: initialData?.website || '',
      notes: initialData?.notes || '',
      certifications: initialData?.certifications || '',
    },
  });

  const onSubmit = async (data: SupplierFormData) => {
    setIsSubmitting(true);
    try {
      onSave(data);
      toast({
        title: mode === 'create' ? 'Supplier Created' : 'Supplier Updated',
        description: `${data.companyName} has been ${mode === 'create' ? 'created' : 'updated'} successfully.`,
      });
      onClose();
      form.reset();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${mode} supplier. Please try again.`,
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
            <Building2 className="h-5 w-5" />
            {mode === 'create' ? 'Create New Supplier' : 'Edit Supplier'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Add a new supplier with complete business information, payment terms, and delivery details.'
              : 'Update supplier information, rates, and business terms.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Company Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <h3 className="text-lg font-medium">Company Information</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC Supply Corp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person</FormLabel>
                      <FormControl>
                        <Input placeholder="John Smith" {...field} />
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
                  name="taxId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax ID / EIN</FormLabel>
                      <FormControl>
                        <Input placeholder="12-3456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="businessRegistration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Registration</FormLabel>
                      <FormControl>
                        <Input placeholder="BR123456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <h3 className="text-lg font-medium">Contact Information</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contact@company.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="alternativePhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alternative Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 987-6543" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.company.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <h3 className="text-lg font-medium">Address Information</h3>
              </div>
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Business Street" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="New York" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="NY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP Code</FormLabel>
                      <FormControl>
                        <Input placeholder="10001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country} value={country}>{country}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Financial Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <h3 className="text-lg font-medium">Financial Information</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="paymentTerms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Terms</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment terms" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {paymentTerms.map((term) => (
                            <SelectItem key={term} value={term}>{term}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="creditLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credit Limit ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="10000" 
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
                  name="minimumOrderAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Order Amount ($)</FormLabel>
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
                  name="discountPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Percentage (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="5" 
                          min="0" 
                          max="100" 
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

            {/* Banking Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <h3 className="text-lg font-medium">Banking Information (Optional)</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Chase Bank" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input placeholder="123456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="routingNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Routing Number</FormLabel>
                      <FormControl>
                        <Input placeholder="021000021" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Performance & Service */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                <h3 className="text-lg font-medium">Performance & Service</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier Rating (1-5)</FormLabel>
                      <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select rating" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <SelectItem key={rating} value={rating.toString()}>
                              {rating} Star{rating > 1 ? 's' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deliveryTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Time (Days)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="7" 
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
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <FormDescription>Enable supplier for orders</FormDescription>
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
                name="certifications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certifications</FormLabel>
                    <FormControl>
                      <Textarea placeholder="ISO 9001, OSHA Certified, Industry specific certifications..." {...field} />
                    </FormControl>
                    <FormDescription>List any relevant certifications or qualifications</FormDescription>
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
                      <Textarea placeholder="Special requirements, preferred contact methods, or other important information..." {...field} />
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
                  : (mode === 'create' ? 'Create Supplier' : 'Update Supplier')
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}