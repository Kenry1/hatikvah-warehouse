import { useState, useCallback } from 'react';

export function useSelection<T extends { id: string }>(items: T[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(items.map(item => item.id)));
  }, [items]);

  const selectNone = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback((id: string) => {
    return selectedIds.has(id);
  }, [selectedIds]);

  const selectedItems = items.filter(item => selectedIds.has(item.id));

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === items.length) {
      selectNone();
    } else {
      selectAll();
    }
  }, [selectedIds.size, items.length, selectAll, selectNone]);

  return {
    selectedIds: Array.from(selectedIds),
    selectedItems,
    toggleSelection,
    selectAll,
    selectNone,
    toggleSelectAll,
    isSelected,
    hasSelection: selectedIds.size > 0,
    isAllSelected: selectedIds.size === items.length,
    selectedCount: selectedIds.size
  };
}