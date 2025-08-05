import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { BulkOperations } from './BulkOperations';
import { ExportMenu } from './ExportMenu';
import { AdvancedFilters } from './AdvancedFilters';
import { useBulkOperations } from '@/hooks/useBulkOperations';
import { useExport } from '@/hooks/useExport';
import { useAdvancedFilter } from '@/hooks/useAdvancedFilter';
import { DataTableProps, TableColumn } from '@/types/common';

export function DataTable({
  data,
  columns,
  bulkActions = [],
  exportOptions,
  filterOptions = [],
  searchable = true,
  pagination = true,
  pageSize = 10
}: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  
  const searchFields = columns
    .filter(col => !col.render)
    .map(col => col.key);

  const {
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
  } = useAdvancedFilter(data, filterOptions, searchFields);

  const {
    selectedIds,
    selectAll,
    selectNone,
    toggleSelection,
    isSelected,
    isAllSelected,
    isIndeterminate,
    executeBulkAction,
    isProcessing,
    selectedCount
  } = useBulkOperations();

  const { exportData, isExporting } = useExport();

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = pagination ? filteredData.slice(startIndex, endIndex) : filteredData;
  const currentDataIds = currentData.map((_, index) => `${startIndex + index}`);
  
  const handleSort = (column: TableColumn) => {
    if (!column.sortable) return;
    updateSort(column.key);
  };

  const getSortIcon = (column: TableColumn) => {
    if (!column.sortable) return null;
    
    if (sortField !== column.key) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    }
    
    return sortDirection === 'asc' ? 
      <ArrowUp className="ml-2 h-4 w-4" /> : 
      <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const enhancedBulkActions = bulkActions.map(action => ({
    ...action,
    action: (ids: string[]) => executeBulkAction(() => action.action(ids), action.label)
  }));

  return (
    <div className="space-y-4">
      {/* Filters */}
      {(searchable || filterOptions.length > 0) && (
        <AdvancedFilters
          filterOptions={filterOptions}
          filters={filters}
          onFilterChange={updateFilter}
          onClearFilter={clearFilter}
          onClearAll={clearAllFilters}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          hasActiveFilters={hasActiveFilters}
        />
      )}

      {/* Bulk Operations & Export */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {bulkActions.length > 0 && (
            <BulkOperations
              selectedCount={selectedCount}
              totalCount={currentDataIds.length}
              isAllSelected={isAllSelected(currentDataIds)}
              isIndeterminate={isIndeterminate(currentDataIds)}
              onSelectAll={() => selectAll(currentDataIds)}
              onSelectNone={selectNone}
              bulkActions={enhancedBulkActions}
              isProcessing={isProcessing}
            />
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            {filteredData.length} item{filteredData.length !== 1 ? 's' : ''}
            {hasActiveFilters && ` (filtered from ${data.length})`}
          </div>
          <ExportMenu
            data={filteredData}
            filename="export"
            onExport={(format, data, filename, title) => exportData(data, format, filename, title)}
            isExporting={isExporting}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-x-auto"> {/* Added overflow-x-auto here */}
        <Table>
          <TableHeader>
            <TableRow>
              {bulkActions.length > 0 && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected(currentDataIds)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        selectAll(currentDataIds);
                      } else {
                        selectNone();
                      }
                    }}
                    ref={(element) => {
                      if (element) {
                        const checkbox = element.querySelector('input[type="checkbox"]') as HTMLInputElement;
                        if (checkbox) {
                          checkbox.indeterminate = isIndeterminate(currentDataIds);
                        }
                      }
                    }}
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={column.width ? `w-${column.width}` : ''}
                >
                  {column.sortable ? (
                    <Button
                      variant="ghost"
                      onClick={() => handleSort(column)}
                      className="h-auto p-0 font-medium hover:bg-transparent"
                    >
                      {column.label}
                      {getSortIcon(column)}
                    </Button>
                  ) : (
                    column.label
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (bulkActions.length > 0 ? 1 : 0)}
                  className="text-center py-8 text-muted-foreground"
                >
                  {hasActiveFilters ? 'No results found for your filters.' : 'No data available.'}
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((row, index) => {
                const rowId = `${startIndex + index}`;
                return (
                  <TableRow
                    key={rowId}
                    className={isSelected(rowId) ? 'bg-muted/50' : ''}
                  >
                    {bulkActions.length > 0 && (
                      <TableCell>
                        <Checkbox
                          checked={isSelected(rowId)}
                          onCheckedChange={() => toggleSelection(rowId)}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell key={column.key}>
                        {column.render ? 
                          column.render(row[column.key], row) : 
                          row[column.key]
                        }
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredData.length)} of {filteredData.length}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}