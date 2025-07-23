import { useState, useMemo } from 'react';
import { applyFilters, applySorting, applySearch } from '@/utils/filters';
import { FilterOption } from '@/types/common';

export function useAdvancedFilter<T extends Record<string, any>>(
  data: T[],
  filterOptions: FilterOption[] = [],
  searchFields: string[] = []
) {
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    let result = data;

    // Apply search
    if (searchTerm && searchFields.length > 0) {
      result = applySearch(result, searchTerm, searchFields);
    }

    // Apply filters
    result = applyFilters(result, filters);

    // Apply sorting
    if (sortField) {
      result = applySorting(result, sortField, sortDirection);
    }

    return result;
  }, [data, filters, sortField, sortDirection, searchTerm, searchFields]);

  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilter = (key: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  const updateSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const hasActiveFilters = useMemo(() => {
    return Object.keys(filters).length > 0 || searchTerm.length > 0;
  }, [filters, searchTerm]);

  return {
    filteredData,
    filters,
    updateFilter,
    clearFilter,
    clearAllFilters,
    sortField,
    sortDirection,
    updateSort,
    searchTerm,
    setSearchTerm,
    hasActiveFilters
  };
}