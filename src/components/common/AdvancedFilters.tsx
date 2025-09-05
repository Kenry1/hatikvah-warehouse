import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Calendar,
  ChevronDown,
  Filter,
  Search,
  X,
  SlidersHorizontal
} from 'lucide-react';
import { FilterOption } from '@/types/common';
// Removed Dialog components to avoid context errors when used within a Popover

interface AdvancedFiltersProps {
  filterOptions: FilterOption[];
  filters: Record<string, any>;
  onFilterChange: (key: string, value: any) => void;
  onClearFilter: (key: string) => void;
  onClearAll: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  searchPlaceholder?: string;
  hasActiveFilters: boolean;
}

export function AdvancedFilters({
  filterOptions,
  filters,
  onFilterChange,
  onClearFilter,
  onClearAll,
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Search...",
  hasActiveFilters
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeFilterCount = Object.keys(filters).length + (searchTerm ? 1 : 0);

  const renderFilterInput = (option: FilterOption) => {
    const value = filters[option.value] || '';

    switch (option.type) {
      case 'select':
        return (
          <Select
            value={value}
            onValueChange={(newValue) => onFilterChange(option.value, newValue)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${option.label}`} />
            </SelectTrigger>
            <SelectContent>
              {option.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => onFilterChange(option.value, e.target.value ? Number(e.target.value) : '')}
            placeholder={`Enter ${option.label}`}
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => onFilterChange(option.value, e.target.value)}
          />
        );

      case 'text':
      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => onFilterChange(option.value, e.target.value)}
            placeholder={`Enter ${option.label}`}
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                    {activeFilterCount}
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="start">
              <div className="mb-2">
                <h4 className="font-semibold text-sm">Advanced Filters</h4>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filters</h4>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClearAll}
                      className="text-xs"
                    >
                      Clear all
                    </Button>
                  )}
                </div>
                
                <div className="space-y-3">
                  {filterOptions.map((option) => (
                    <div key={option.value} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={option.value} className="text-sm">
                          {option.label}
                        </Label>
                        {filters[option.value] && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onClearFilter(option.value)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      {renderFilterInput(option)}
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear all filters
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {(Object.keys(filters).length > 0 || searchTerm) && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <Badge key="search-term-filter" variant="secondary" className="flex items-center gap-1">
              Search: "{searchTerm}"
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onSearchChange('')}
              />
            </Badge>
          )}
          {Object.entries(filters).map(([key, value]) => {
            if (!value) return null;
            const option = filterOptions.find(opt => opt.value === key);
            return (
              <Badge key={key} variant="secondary" className="flex items-center gap-1">
                {option?.label}: {String(value)}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => onClearFilter(key)}
                />
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}