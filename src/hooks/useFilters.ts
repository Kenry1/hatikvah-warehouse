import { useState, useMemo } from 'react';

export interface FilterConfig {
  search: string;
  status: string[];
  dateRange: {
    start: string;
    end: string;
  };
  category: string[];
  priority: string[];
  department: string[];
}

export function useFilters<T extends Record<string, any>>(
  data: T[],
  searchFields: (keyof T)[],
  initialFilters: Partial<FilterConfig> = {}
) {
  const [filters, setFilters] = useState<FilterConfig>({
    search: '',
    status: [],
    dateRange: { start: '', end: '' },
    category: [],
    priority: [],
    department: [],
    ...initialFilters
  });

  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = searchFields.some(field => {
          const value = item[field];
          return value && String(value).toLowerCase().includes(searchLower);
        });
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status.length > 0) {
        if (!filters.status.includes(item.status)) return false;
      }

      // Category filter
      if (filters.category.length > 0) {
        if (!filters.category.includes(item.category || item.type)) return false;
      }

      // Priority filter
      if (filters.priority.length > 0) {
        if (!filters.priority.includes(item.priority)) return false;
      }

      // Department filter
      if (filters.department.length > 0) {
        if (!filters.department.includes(item.department)) return false;
      }

      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const itemDate = item.dateCreated || item.dateRequested || item.dateReported || item.startDate;
        if (itemDate) {
          const date = new Date(itemDate);
          if (filters.dateRange.start && date < new Date(filters.dateRange.start)) return false;
          if (filters.dateRange.end && date > new Date(filters.dateRange.end)) return false;
        }
      }

      return true;
    });
  }, [data, filters, searchFields]);

  const updateFilter = (key: keyof FilterConfig, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: [],
      dateRange: { start: '', end: '' },
      category: [],
      priority: [],
      department: []
    });
  };

  const getFilterSummary = () => {
    const activeFilters: string[] = [];
    if (filters.search) activeFilters.push(`Search: "${filters.search}"`);
    if (filters.status.length > 0) activeFilters.push(`Status: ${filters.status.join(', ')}`);
    if (filters.category.length > 0) activeFilters.push(`Category: ${filters.category.join(', ')}`);
    if (filters.priority.length > 0) activeFilters.push(`Priority: ${filters.priority.join(', ')}`);
    if (filters.department.length > 0) activeFilters.push(`Department: ${filters.department.join(', ')}`);
    if (filters.dateRange.start || filters.dateRange.end) {
      activeFilters.push(`Date: ${filters.dateRange.start || 'Any'} - ${filters.dateRange.end || 'Any'}`);
    }
    return activeFilters;
  };

  return {
    filters,
    filteredData,
    updateFilter,
    clearFilters,
    getFilterSummary,
    hasActiveFilters: Object.values(filters).some(value => 
      Array.isArray(value) ? value.length > 0 : value !== '' && value !== null
    )
  };
}