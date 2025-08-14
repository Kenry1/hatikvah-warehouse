import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

// Mock user
const MOCK_USER = { uid: 'emp-1', username: 'John Smith', email: 'john@example.com' };

// Minimal checklist for demo
const predefinedChecklist = {
  "Engine": [
    { id: 'oil_level', label: 'Oil Level' },
    { id: 'coolant', label: 'Coolant' },
  ],
  "Exterior": [
    { id: 'lights', label: 'Lights' },
    { id: 'tires', label: 'Tires' },
  ]
};

const checkupItemStatus = z.enum(['ok', 'not_ok', 'na']);

// Dynamically build Zod schema for checklist
const checklistFields = Object.values(predefinedChecklist).flat().reduce((acc, item) => {
  acc[`${item.id}_status`] = checkupItemStatus.default('na');
  acc[`${item.id}_notes`] = z.string().optional();
  return acc;
}, {} as Record<string, any>);

const performCheckupFormSchema = z.object({
  vehicleId: z.string(),
  checkupDate: z.date(),
  generalNotes: z.string().optional(),
  photos: z.any().optional(),
  ...checklistFields,
});

type PerformCheckupFormData = z.infer<typeof performCheckupFormSchema>;

type ChecklistCategory = keyof typeof predefinedChecklist;
type CheckupItemStatus = 'ok' | 'not_ok' | 'na';

interface PerformCheckupModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: string;
  vehicleName?: string;
}

const PerformCheckupModal: React.FC<PerformCheckupModalProps> = ({ isOpen, onClose, vehicleId, vehicleName }) => {
  const { toast } = useToast();
  const user = MOCK_USER;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PerformCheckupFormData>({
    resolver: zodResolver(performCheckupFormSchema),
    defaultValues: {
      vehicleId: vehicleId,
      checkupDate: new Date(),
      generalNotes: '',
      ...(Object.values(predefinedChecklist)
        .flat()
        .reduce((acc, item) => {
          acc[`${item.id}_status`] = 'na' as CheckupItemStatus;
          acc[`${item.id}_notes`] = '';
          return acc;
        }, {} as Partial<PerformCheckupFormData>)),
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        vehicleId: vehicleId,
        checkupDate: new Date(),
        generalNotes: '',
        photos: undefined,
        ...(Object.values(predefinedChecklist)
          .flat()
          .reduce((acc, item) => {
            acc[`${item.id}_status`] = 'na' as CheckupItemStatus;
            acc[`${item.id}_notes`] = '';
            return acc;
          }, {} as Partial<PerformCheckupFormData>)),
      });
    }
  }, [isOpen, vehicleId, form]);

  const onSubmit = async (data: PerformCheckupFormData) => {
    setIsSubmitting(true);
    setTimeout(() => {
      toast({
        title: 'Vehicle Checkup Submitted',
        description: `Checkup for vehicle ${vehicleName || vehicleId} has been recorded.`,
      });
      setIsSubmitting(false);
      onClose();
    }, 1200);
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="w-full max-w-2xl md:max-w-3xl lg:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Perform Vehicle Checkup</DialogTitle>
          <DialogDescription>
            Complete the checklist for vehicle: <span className="font-semibold">{vehicleName || vehicleId}</span>
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ScrollArea className="h-[60vh] pr-2">
              <div className="space-y-6 p-1">
                <FormField
                  control={form.control}
                  name="checkupDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Checkup Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value ? field.value.toISOString().slice(0, 10) : ''}
                          onChange={e => field.onChange(new Date(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {(Object.keys(predefinedChecklist) as ChecklistCategory[]).map(category => (
                  <div key={category} className="space-y-4 p-4 border rounded-md shadow-sm">
                    <h3 className="text-lg font-semibold text-primary">{category}</h3>
                    {predefinedChecklist[category].map(item => (
                      <div key={item.id} className="space-y-3 p-3 border-t">
                        <FormLabel className="font-medium">{item.label}</FormLabel>
                        <FormField
                          control={form.control}
                          name={`${item.id}_status` as keyof PerformCheckupFormData}
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  value={field.value as string | undefined}
                                  className="flex space-x-2 sm:space-x-4"
                                >
                                  <FormItem className="flex items-center space-x-2">
                                    <FormControl><RadioGroupItem value="ok" /></FormControl>
                                    <FormLabel className="font-normal">OK</FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-2">
                                    <FormControl><RadioGroupItem value="not_ok" /></FormControl>
                                    <FormLabel className="font-normal">Not OK</FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-2">
                                    <FormControl><RadioGroupItem value="na" /></FormControl>
                                    <FormLabel className="font-normal">N/A</FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`${item.id}_notes` as keyof PerformCheckupFormData}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="Optional notes..." {...field as any} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                  </div>
                ))}
                <FormField
                  control={form.control}
                  name="generalNotes"
                  render={({ field }) => (
                    <FormItem className="p-4 border rounded-md shadow-sm">
                      <FormLabel className="text-lg font-semibold text-primary">General Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any overall comments or observations..."
                          className="resize-y min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="photos"
                  render={({ field: { onChange, value, ...restField } }) => (
                    <FormItem className="p-4 border rounded-md shadow-sm">
                      <FormLabel className="text-lg font-semibold text-primary">Upload Photos (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          multiple
                          onChange={e => onChange(e.target.files)}
                          {...restField}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground mt-1">
                        Upload photos of any issues found. Multiple files can be selected.
                      </p>
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>
            <DialogFooter className="pt-6">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Checkup
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PerformCheckupModal;