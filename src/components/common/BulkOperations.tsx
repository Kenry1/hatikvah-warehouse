import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, X } from 'lucide-react';
import { BulkAction } from '@/types/common';

interface BulkOperationsProps {
  selectedCount: number;
  totalCount: number;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  onSelectAll: () => void;
  onSelectNone: () => void;
  bulkActions: BulkAction[];
  isProcessing?: boolean;
}

export function BulkOperations({
  selectedCount,
  totalCount,
  isAllSelected,
  isIndeterminate,
  onSelectAll,
  onSelectNone,
  bulkActions,
  isProcessing = false
}: BulkOperationsProps) {
  if (selectedCount === 0) {
    return (
      <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg border">
        <Checkbox
          checked={isAllSelected}
          onCheckedChange={(checked) => {
            if (checked) {
              onSelectAll();
            } else {
              onSelectNone();
            }
          }}
          ref={(element) => {
            if (element) {
              const checkbox = element.querySelector('input[type="checkbox"]') as HTMLInputElement;
              if (checkbox) {
                checkbox.indeterminate = isIndeterminate;
              }
            }
          }}
        />
        <span className="text-sm text-muted-foreground">
          Select all {totalCount} items
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
      <div className="flex items-center gap-4">
        <Checkbox
          checked={isAllSelected}
          onCheckedChange={(checked) => {
            if (checked) {
              onSelectAll();
            } else {
              onSelectNone();
            }
          }}
          ref={(element) => {
            if (element) {
              const checkbox = element.querySelector('input[type="checkbox"]') as HTMLInputElement;
              if (checkbox) {
                checkbox.indeterminate = isIndeterminate;
              }
            }
          }}
        />
        <Badge variant="secondary" className="bg-primary/20 text-primary">
          {selectedCount} selected
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSelectNone}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        {bulkActions.map((action, index) => (
          <div key={action.id} className="flex items-center">
            {index > 0 && <Separator orientation="vertical" className="h-6 mx-2" />}
            <Button
              variant={action.variant || 'default'}
              size="sm"
              onClick={() => action.action(Array.from({length: selectedCount}, (_, i) => i.toString()))}
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              <span className="text-sm">{action.icon}</span>
              {action.label}
            </Button>
          </div>
        ))}
        
        {bulkActions.length > 3 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                More <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {bulkActions.slice(3).map((action) => (
                <DropdownMenuItem
                  key={action.id}
                  onClick={() => action.action(Array.from({length: selectedCount}, (_, i) => i.toString()))}
                  disabled={isProcessing}
                >
                  <span className="mr-2">{action.icon}</span>
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}