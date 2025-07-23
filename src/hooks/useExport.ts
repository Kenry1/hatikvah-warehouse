import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getExportHandler } from '@/utils/export';

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportData = async (
    data: any[],
    format: 'csv' | 'excel' | 'pdf',
    filename: string,
    title?: string
  ) => {
    if (data.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no items to export.",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    
    try {
      const handler = getExportHandler(format, data, filename, title);
      await handler();
      
      toast({
        title: "Export successful",
        description: `${data.length} item(s) exported as ${format.toUpperCase()}.`
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: `Failed to export data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportData,
    isExporting
  };
}