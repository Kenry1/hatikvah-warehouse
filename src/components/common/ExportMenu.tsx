import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, Table, FileSpreadsheet, Loader2 } from 'lucide-react';
import { ExportOption } from '@/types/common';

interface ExportMenuProps {
  data: any[];
  filename: string;
  title?: string;
  onExport: (format: 'csv' | 'excel' | 'pdf', data: any[], filename: string, title?: string) => void;
  isExporting?: boolean;
  disabled?: boolean;
  customExportOptions?: ExportOption[];
}

export function ExportMenu({
  data,
  filename,
  title,
  onExport,
  isExporting = false,
  disabled = false,
  customExportOptions
}: ExportMenuProps) {
  const defaultExportOptions = [
    { format: 'csv' as const, label: 'Export as CSV', icon: Table },
    { format: 'excel' as const, label: 'Export as Excel', icon: FileSpreadsheet },
    { format: 'pdf' as const, label: 'Export as PDF', icon: FileText },
  ];

  const exportOptions = customExportOptions || defaultExportOptions;

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    onExport(format, data, filename, title);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || isExporting || data.length === 0}
          className="flex items-center gap-2"
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">Export {data.length} items</p>
          <p className="text-xs text-muted-foreground">
            Choose your preferred format
          </p>
        </div>
        <DropdownMenuSeparator />
        {exportOptions.map((option, index) => {
          const IconComponent = 'icon' in option && option.icon ? option.icon : 
            option.format === 'csv' ? Table :
            option.format === 'excel' ? FileSpreadsheet : FileText;

          return (
            <DropdownMenuItem
              key={index}
              onClick={() => handleExport(option.format)}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              <IconComponent className="h-4 w-4" />
              {option.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}