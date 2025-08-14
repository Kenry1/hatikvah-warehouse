import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface FuelRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AssignedVehicle {
  id: string;
  make: string;
  model: string;
  licensePlate: string;
}

// Mock user and vehicle assignment
const MOCK_USER = { uid: 'emp-1', name: 'John Smith' };
const MOCK_ASSIGNED_VEHICLE: AssignedVehicle = {
  id: '1',
  make: 'Toyota',
  model: 'Hilux',
  licensePlate: 'ABC-123',
};

const FuelRequestModal: React.FC<FuelRequestModalProps> = ({ isOpen, onClose }) => {
  // Simulate user and assigned vehicle
  const user = MOCK_USER;
  const [assignedVehicle, setAssignedVehicle] = useState<AssignedVehicle | null>(null);
  const [formData, setFormData] = useState({
    carRegistrationNumber: '',
    fuelAmount: '',
    fuelLocation: '',
    lastMileage: '',
    currentMileage: '',
    petrolStation: '',
    gpsPinLocation: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!user?.uid || !isOpen) {
      setAssignedVehicle(null);
      setFormData(prev => ({ ...prev, carRegistrationNumber: '' }));
      return;
    }
    // Simulate fetch
    setTimeout(() => {
      setAssignedVehicle(MOCK_ASSIGNED_VEHICLE);
      setFormData(prev => ({ ...prev, carRegistrationNumber: MOCK_ASSIGNED_VEHICLE.licensePlate }));
    }, 300);
  }, [user?.uid, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, upload file and store URL
      console.log('Selected file:', file.name);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setTimeout(() => {
      toast({
        title: 'Fuel Request Submitted',
        description: 'Your fuel request has been successfully submitted.',
      });
      setFormData({
        carRegistrationNumber: '',
        fuelAmount: '',
        fuelLocation: '',
        lastMileage: '',
        currentMileage: '',
        petrolStation: '',
        gpsPinLocation: '',
      });
      setAssignedVehicle(null);
      setIsSubmitting(false);
      onClose();
    }, 1200);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[425px] md:max-w-lg lg:max-w-xl px-2 sm:px-6">
        <DialogHeader>
          <DialogTitle>New Fuel Request</DialogTitle>
          <DialogDescription>
            Fill in the details for your fuel request.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2 sm:py-4">
          {assignedVehicle && (
            <div className="text-center text-sm text-muted-foreground mb-2 sm:mb-4 p-2 border rounded-md bg-accent">
              Assigned Vehicle: <span className="font-semibold">{assignedVehicle.make} {assignedVehicle.model} ({assignedVehicle.licensePlate})</span>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <Label htmlFor="carRegistrationNumber">Car Registration</Label>
            <Input
              id="carRegistrationNumber"
              value={formData.carRegistrationNumber}
              onChange={handleChange}
              readOnly={!!assignedVehicle}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="fuelAmount">Fuel Amount (Ksh)</Label>
            <Input
              id="fuelAmount"
              type="number"
              value={formData.fuelAmount}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="fuelLocation">Fuel Location</Label>
            <Input
              id="fuelLocation"
              value={formData.fuelLocation}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="lastMileage">Last Mileage</Label>
            <Input
              id="lastMileage"
              type="number"
              value={formData.lastMileage}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="currentMileage">Current Mileage</Label>
            <Input
              id="currentMileage"
              type="number"
              value={formData.currentMileage}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="petrolStation">Petrol Station</Label>
            <Input
              id="petrolStation"
              value={formData.petrolStation}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="attachment">Dashboard Photo</Label>
            <Input
              id="attachment"
              type="file"
              onChange={handleFileChange}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="gpsPinLocation">GPS Pin Location</Label>
            <Input
              id="gpsPinLocation"
              value={formData.gpsPinLocation}
              onChange={handleChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting || !user?.uid} className="w-full">
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FuelRequestModal;