import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWarehouse, Material } from '../WarehouseContext';
import { useToast } from '@/hooks/use-toast';

interface MaterialFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Material['category'];
}

export function MaterialFormModal({ isOpen, onClose, category }: MaterialFormModalProps) {
  const { addMaterial } = useWarehouse();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    stock: '',
    minLevel: '',
    value: '',
    serialNumber: '',
    assignedTo: '',
    status: 'active' as const,
  });

  const categoryLabels = {
    'safety': 'Safety Equipment',
    'ftth': 'FTTH Equipment',
    'fttx': 'FTTX Components',
    'company-assets': 'Company Asset',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.stock || !formData.minLevel || !formData.value) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const materialData: Omit<Material, 'id'> = {
      name: formData.name,
      category,
      stock: parseInt(formData.stock),
      minLevel: parseInt(formData.minLevel),
      value: formData.value.startsWith('$') ? formData.value : `$${formData.value}`,
      ...(category === 'company-assets' && {
        serialNumber: formData.serialNumber,
        assignedTo: formData.assignedTo,
        status: formData.status,
      }),
    };

    addMaterial(materialData);
    
    toast({
      title: "Material Added",
      description: `${categoryLabels[category]} has been added to inventory.`,
    });

    // Reset form
    setFormData({
      name: '',
      stock: '',
      minLevel: '',
      value: '',
      serialNumber: '',
      assignedTo: '',
      status: 'active',
    });
    
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New {categoryLabels[category]}</DialogTitle>
          <DialogDescription>
            Enter the details for the new {categoryLabels[category].toLowerCase()}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter material name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Value *</Label>
              <Input
                id="value"
                value={formData.value}
                onChange={(e) => handleInputChange('value', e.target.value)}
                placeholder="$1,000"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Current Stock *</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => handleInputChange('stock', e.target.value)}
                placeholder="0"
                min="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minLevel">Minimum Level *</Label>
              <Input
                id="minLevel"
                type="number"
                value={formData.minLevel}
                onChange={(e) => handleInputChange('minLevel', e.target.value)}
                placeholder="0"
                min="0"
                required
              />
            </div>
          </div>

          {category === 'company-assets' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serialNumber">Serial Number</Label>
                  <Input
                    id="serialNumber"
                    value={formData.serialNumber}
                    onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                    placeholder="SN001-123"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Assigned To</Label>
                  <Input
                    id="assignedTo"
                    value={formData.assignedTo}
                    onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                    placeholder="Employee name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Add {categoryLabels[category]}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}