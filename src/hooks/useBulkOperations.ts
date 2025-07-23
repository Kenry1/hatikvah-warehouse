import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useBulkOperations() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(ids);
  }, []);

  const selectNone = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  }, []);

  const isSelected = useCallback((id: string) => {
    return selectedIds.includes(id);
  }, [selectedIds]);

  const isAllSelected = useCallback((totalIds: string[]) => {
    return totalIds.length > 0 && totalIds.every(id => selectedIds.includes(id));
  }, [selectedIds]);

  const isIndeterminate = useCallback((totalIds: string[]) => {
    return selectedIds.length > 0 && selectedIds.length < totalIds.length;
  }, [selectedIds]);

  const executeBulkAction = useCallback(async (
    action: (ids: string[]) => Promise<void> | void,
    actionName: string
  ) => {
    if (selectedIds.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select items to perform this action.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      await action(selectedIds);
      toast({
        title: "Success",
        description: `${actionName} completed for ${selectedIds.length} item(s).`
      });
      setSelectedIds([]);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${actionName.toLowerCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [selectedIds, toast]);

  return {
    selectedIds,
    selectAll,
    selectNone,
    toggleSelection,
    isSelected,
    isAllSelected,
    isIndeterminate,
    executeBulkAction,
    isProcessing,
    selectedCount: selectedIds.length
  };
}