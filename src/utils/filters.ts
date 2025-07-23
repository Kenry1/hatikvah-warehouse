import { FilterOption } from '@/types/common';

export const applyFilters = (data: any[], filters: Record<string, any>): any[] => {
  return data.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value || value === '' || value === null || value === undefined) {
        return true;
      }

      const itemValue = item[key];
      
      if (typeof value === 'string') {
        return String(itemValue).toLowerCase().includes(value.toLowerCase());
      }
      
      if (typeof value === 'number') {
        return Number(itemValue) === value;
      }
      
      if (typeof value === 'boolean') {
        return Boolean(itemValue) === value;
      }
      
      if (value instanceof Date) {
        const itemDate = new Date(itemValue);
        return itemDate.toDateString() === value.toDateString();
      }
      
      if (Array.isArray(value)) {
        return value.includes(itemValue);
      }
      
      return true;
    });
  });
};

export const applySorting = (data: any[], sortField: string, sortDirection: 'asc' | 'desc'): any[] => {
  if (!sortField) return data;
  
  return [...data].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue === bValue) return 0;
    
    let comparison = 0;
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue;
    } else if (aValue instanceof Date && bValue instanceof Date) {
      comparison = aValue.getTime() - bValue.getTime();
    } else {
      comparison = String(aValue).localeCompare(String(bValue));
    }
    
    return sortDirection === 'desc' ? -comparison : comparison;
  });
};

export const applySearch = (data: any[], searchTerm: string, searchFields: string[]): any[] => {
  if (!searchTerm.trim()) return data;
  
  const term = searchTerm.toLowerCase();
  
  return data.filter(item =>
    searchFields.some(field => {
      const value = item[field];
      return String(value).toLowerCase().includes(term);
    })
  );
};

export const generateFilterOptions = (data: any[], field: string): { label: string; value: string }[] => {
  const uniqueValues = [...new Set(data.map(item => item[field]))].filter(Boolean);
  
  return uniqueValues.map(value => ({
    label: String(value),
    value: String(value)
  }));
};