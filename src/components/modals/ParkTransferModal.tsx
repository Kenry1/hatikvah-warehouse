import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ParkTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: string;
  vehicleName?: string;
  currentAssignedTo?: string;
  currentAssignedToId?: string;
}

interface UserForSelect {
  id: string;
  displayName: string;
}

// Mock user list for transfer
const MOCK_USERS: UserForSelect[] = [
  { id: 'emp-2', displayName: 'Sarah Johnson' },
  { id: 'emp-3', displayName: 'Michael Lee' },
  { id: 'emp-4', displayName: 'Aisha Bello' },
];

const ParkTransferModal: React.FC<ParkTransferModalProps> = ({ isOpen, onClose, vehicleId, vehicleName, currentAssignedTo, currentAssignedToId }) => {
  const { toast } = useToast();
  const [selectedAction, setSelectedAction] = useState<'park' | 'transfer' | null>(null);
  const [usersList, setUsersList] = useState<UserForSelect[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedAction === 'transfer' && isOpen) {
      setIsLoadingUsers(true);
      setError(null);
      // Simulate async fetch
      setTimeout(() => {
        // Exclude current assignee
        const filtered = MOCK_USERS.filter(u => u.id !== currentAssignedToId && u.displayName !== currentAssignedTo);
        setUsersList(filtered);
        if (filtered.length === 0) {
          setError('No other users available to transfer to.');
        }
        setIsLoadingUsers(false);
      }, 700);
    } else {
      setUsersList([]);
      setSelectedUserId('');
    }
  }, [selectedAction, isOpen, currentAssignedTo, currentAssignedToId]);

  const resetModalState = () => {
    setSelectedAction(null);
    setSelectedUserId('');
    setUsersList([]);
    setError(null);
    onClose();
  };

  const handleParkConfirm = async () => {
    setIsSubmitting(true);
    setTimeout(() => {
      toast({ title: 'Vehicle Parked', description: `${vehicleName || 'Vehicle'} has been unassigned and marked as available.` });
      setIsSubmitting(false);
      resetModalState();
    }, 1000);
  };

  const handleTransferRequestConfirm = async () => {
    if (!selectedUserId) {
      toast({ title: 'Error', description: 'Please select a user to transfer to.', variant: 'destructive' });
      return;
    }
    const userToTransferTo = usersList.find(u => u.id === selectedUserId);
    setIsSubmitting(true);
    setTimeout(() => {
      toast({ title: 'Transfer Requested', description: `Request to transfer ${vehicleName || 'Vehicle'} to ${userToTransferTo?.displayName} has been submitted for approval.` });
      setIsSubmitting(false);
      resetModalState();
    }, 1000);
  };

  const currentlyAssigned = currentAssignedTo && currentAssignedTo !== 'Unassigned';

  return (
    <Dialog open={isOpen} onOpenChange={open => { if (!open) resetModalState(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Park or Request Transfer</DialogTitle>
          <DialogDescription>
            Manage assignment for {vehicleName || `vehicle ${vehicleId}`}.
            {currentlyAssigned && ` Currently assigned to: ${currentAssignedTo}.`}
            {!currentlyAssigned && ` Currently unassigned.`}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <RadioGroup value={selectedAction || ''} onValueChange={value => setSelectedAction(value as 'park' | 'transfer')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="park" id="r-park" />
              <Label htmlFor="r-park">Park Vehicle (Unassign)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="transfer" id="r-transfer" />
              <Label htmlFor="r-transfer">Request Transfer to Another User</Label>
            </div>
          </RadioGroup>
          {selectedAction === 'park' && (
            <div className="p-4 border rounded-md bg-muted/50">
              <p className="text-sm text-foreground">
                This will unassign {vehicleName || 'the vehicle'} and mark it as "Available".
              </p>
            </div>
          )}
          {selectedAction === 'transfer' && (
            <div className="p-4 border rounded-md bg-muted/50 space-y-3">
              <p className="text-sm text-foreground">
                Request to transfer {vehicleName || 'the vehicle'} to another user. This will require approval from Logistics.
              </p>
              {isLoadingUsers && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading users...
                </div>
              )}
              {!isLoadingUsers && error && (
                <div className="flex items-center text-sm text-destructive">
                  <AlertTriangle className="mr-2 h-4 w-4" /> {error}
                </div>
              )}
              {!isLoadingUsers && !error && usersList.length > 0 && (
                <Select onValueChange={setSelectedUserId} value={selectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user to transfer to" />
                  </SelectTrigger>
                  <SelectContent>
                    {usersList.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {!isLoadingUsers && !error && usersList.length === 0 && (
                <p className="text-sm text-muted-foreground">No other users available to request a transfer to.</p>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={resetModalState} disabled={isSubmitting}>
            Cancel
          </Button>
          {selectedAction === 'park' && (
            <Button type="button" onClick={handleParkConfirm} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Park
            </Button>
          )}
          {selectedAction === 'transfer' && (
            <Button
              type="button"
              onClick={handleTransferRequestConfirm}
              disabled={isSubmitting || isLoadingUsers || !selectedUserId || usersList.length === 0 || !!error}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Transfer Request
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ParkTransferModal;