export interface FilterOption {
  label: string;
  value: string;
  type: 'text' | 'select' | 'date' | 'number' | 'boolean';
  options?: { label: string; value: string }[];
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

export interface BulkAction {
  id: string;
  label: string;
  icon: string;
  action: (selectedIds: string[]) => void;
  variant?: 'default' | 'destructive' | 'secondary';
}

export interface ExportOption {
  format: 'csv' | 'excel' | 'pdf';
  label: string;
  filename: string;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

export interface DataTableProps {
  data: any[];
  columns: TableColumn[];
  bulkActions?: BulkAction[];
  exportOptions?: ExportOption[];
  filterOptions?: FilterOption[];
  searchable?: boolean;
  pagination?: boolean;
  pageSize?: number;
}

export interface StatsCardData {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon?: string;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}

export interface ActionPanelItem {
  id: string;
  title: string;
  description?: string;
  icon: string;
  action: () => void;
  variant?: 'default' | 'primary' | 'secondary';
}