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
import { FolderPlus, Calendar, Users, DollarSign, MapPin, AlertTriangle, FileText, Target } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const projectFormSchema = z.object({
  projectName: z.string().min(3, 'Project name must be at least 3 characters'),
  projectCode: z.string().min(3, 'Project code must be at least 3 characters'),
  description: z.string().min(20, 'Please provide a detailed description'),
  category: z.string().min(1, 'Please select a project category'),
  priority: z.string().min(1, 'Please select project priority'),
  status: z.string().min(1, 'Please select project status'),
  startDate: z.string().min(1, 'Please select start date'),
  endDate: z.string().min(1, 'Please select end date'),
  plannedDuration: z.number().min(1, 'Planned duration must be at least 1 day'),
  projectManager: z.string().min(1, 'Please assign a project manager'),
  teamLead: z.string().optional(),
  clientName: z.string().min(1, 'Please enter client name'),
  clientContact: z.string().optional(),
  clientEmail: z.string().email().optional().or(z.literal('')),
  location: z.string().min(1, 'Please specify project location'),
  address: z.string().optional(),
  coordinates: z.string().optional(),
  budget: z.number().min(0, 'Budget must be positive'),
  allocatedBudget: z.number().min(0, 'Allocated budget must be positive'),
  laborCost: z.number().min(0, 'Labor cost must be positive'),
  materialCost: z.number().min(0, 'Material cost must be positive'),
  equipmentCost: z.number().min(0, 'Equipment cost must be positive'),
  overheadCost: z.number().min(0, 'Overhead cost must be positive'),
  contingencyPercentage: z.number().min(0).max(100, 'Contingency must be between 0-100%'),
  isActive: z.boolean(),
  requiresPermits: z.boolean(),
  environmentalImpact: z.boolean(),
  safetyRiskLevel: z.string().min(1, 'Please select safety risk level'),
  deliverables: z.string().min(10, 'Please describe project deliverables'),
  milestones: z.string().optional(),
  resources: z.string().optional(),
  constraints: z.string().optional(),
  assumptions: z.string().optional(),
  riskAssessment: z.string().optional(),
  qualityStandards: z.string().optional(),
  communicationPlan: z.string().optional(),
  notes: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: ProjectFormData) => void;
  initialData?: Partial<ProjectFormData>;
  mode?: 'create' | 'edit';
}

export function ProjectModal({ isOpen, onClose, onSave, initialData, mode = 'create' }: ProjectModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
  'Solar Equipment Deployment', 'Network Upgrade', 'Safety Implementation',
    'Infrastructure Development', 'Equipment Installation', 'Maintenance Project',
    'Software Implementation', 'Training Program', 'Consulting Services'
  ];

  const priorities = ['Low', 'Medium', 'High', 'Critical'];
  const statuses = ['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled', 'Under Review'];
  const safetyRiskLevels = ['Low', 'Medium', 'High', 'Critical'];

  const projectManagers = [
    'Alice Cooper - Lead Project Manager',
    'Bob Martin - Senior PM',
    'Carol White - Technical PM',
    'David Kim - Operations PM',
    'Eva Johnson - Infrastructure PM'
  ];

  const teamLeads = [
    'John Smith - Technical Lead',
    'Jane Doe - Engineering Lead',
    'Mike Wilson - Operations Lead',
    'Sarah Johnson - Safety Lead',
    'Tom Brown - Installation Lead'
  ];

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      projectName: initialData?.projectName || '',
      projectCode: initialData?.projectCode || '',
      description: initialData?.description || '',
      category: initialData?.category || '',
      priority: initialData?.priority || 'Medium',
      status: initialData?.status || 'Planning',
      startDate: initialData?.startDate || '',
      endDate: initialData?.endDate || '',
      plannedDuration: initialData?.plannedDuration || 30,
      projectManager: initialData?.projectManager || '',
      teamLead: initialData?.teamLead || '',
      clientName: initialData?.clientName || '',
      clientContact: initialData?.clientContact || '',
      clientEmail: initialData?.clientEmail || '',
      location: initialData?.location || '',
      address: initialData?.address || '',
      coordinates: initialData?.coordinates || '',
      budget: initialData?.budget || 0,
      allocatedBudget: initialData?.allocatedBudget || 0,
      laborCost: initialData?.laborCost || 0,
      materialCost: initialData?.materialCost || 0,
      equipmentCost: initialData?.equipmentCost || 0,
      overheadCost: initialData?.overheadCost || 0,
      contingencyPercentage: initialData?.contingencyPercentage || 10,
      isActive: initialData?.isActive ?? true,
      requiresPermits: initialData?.requiresPermits ?? false,
      environmentalImpact: initialData?.environmentalImpact ?? false,
      safetyRiskLevel: initialData?.safetyRiskLevel || 'Low',
      deliverables: initialData?.deliverables || '',
      milestones: initialData?.milestones || '',
      resources: initialData?.resources || '',
      constraints: initialData?.constraints || '',
      assumptions: initialData?.assumptions || '',
      riskAssessment: initialData?.riskAssessment || '',
      qualityStandards: initialData?.qualityStandards || '',
      communicationPlan: initialData?.communicationPlan || '',
      notes: initialData?.notes || '',
    },
  });

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    try {
      onSave(data);
      toast({
        title: mode === 'create' ? 'Project Created' : 'Project Updated',
        description: `${data.projectName} has been ${mode === 'create' ? 'created' : 'updated'} successfully.`,
      });
      onClose();
      form.reset();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${mode} project. Please try again.`,
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
            <FolderPlus className="h-5 w-5" />
            {mode === 'create' ? 'Create New Project' : 'Edit Project'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Create a new project with complete planning details, budget allocation, and team assignments.'
              : 'Update project information, timeline, budget, and resource allocation.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <h3 className="text-lg font-medium">Basic Information</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="projectName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Network Installation Project Alpha" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="projectCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Code</FormLabel>
                      <FormControl>
                        <Input placeholder="PRJ-2024-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Detailed description of the project objectives, scope, and requirements..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {priorities.map((priority) => (
                            <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <h3 className="text-lg font-medium">Project Timeline</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="plannedDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Planned Duration (Days)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="30" 
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

            {/* Team Assignment */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <h3 className="text-lg font-medium">Team Assignment</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="projectManager"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Manager</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select project manager" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {projectManagers.map((pm) => (
                            <SelectItem key={pm} value={pm}>{pm}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="teamLead"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Lead (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select team lead" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {teamLeads.map((lead) => (
                            <SelectItem key={lead} value={lead}>{lead}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Client Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <h3 className="text-lg font-medium">Client Information</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="clientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Corporation" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="clientContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Contact Person</FormLabel>
                      <FormControl>
                        <Input placeholder="John Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="clientEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@acme.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <h3 className="text-lg font-medium">Project Location</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Downtown Business District" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="coordinates"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GPS Coordinates (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="40.7128, -74.0060" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Business Street, New York, NY 10001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Budget Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <h3 className="text-lg font-medium">Budget Information</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Budget ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="150000" 
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
                  name="allocatedBudget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allocated Budget ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="120000" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="laborCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Labor Cost ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="60000" 
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
                  name="materialCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material Cost ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="40000" 
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
                  name="equipmentCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Equipment Cost ($)</FormLabel>
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
                <FormField
                  control={form.control}
                  name="overheadCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Overhead Cost ($)</FormLabel>
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
              <FormField
                control={form.control}
                name="contingencyPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contingency Percentage (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="10" 
                        min="0" 
                        max="100" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>Percentage of total budget reserved for unexpected costs</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Risk & Compliance */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <h3 className="text-lg font-medium">Risk & Compliance</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="safetyRiskLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Safety Risk Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select risk level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {safetyRiskLevels.map((level) => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="requiresPermits"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Requires Permits</FormLabel>
                          <FormDescription>Government permits needed</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="environmentalImpact"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Environmental Impact</FormLabel>
                          <FormDescription>Project affects environment</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <h3 className="text-lg font-medium">Project Details</h3>
              </div>
              <FormField
                control={form.control}
                name="deliverables"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Deliverables</FormLabel>
                    <FormControl>
                      <Textarea placeholder="List of project deliverables, outcomes, and expected results..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="milestones"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key Milestones</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Major project milestones and checkpoints..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="resources"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Required Resources</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Equipment, materials, personnel, and other resources needed..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="constraints"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Constraints</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Time, budget, resource, or regulatory constraints..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="assumptions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Assumptions</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Key assumptions made during project planning..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="riskAssessment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Risk Assessment</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Identified risks, mitigation strategies, and contingency plans..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="qualityStandards"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quality Standards</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Quality requirements, standards, and acceptance criteria..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="communicationPlan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Communication Plan</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Stakeholder communication, reporting schedule, and protocols..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Project</FormLabel>
                      <FormDescription>Project is currently active and visible to team members</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
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
                      <Textarea placeholder="Any additional information, special considerations, or important notes..." {...field} />
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
                  : (mode === 'create' ? 'Create Project' : 'Update Project')
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}