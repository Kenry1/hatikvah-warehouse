import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MaterialRequest } from "../types/inventory";
import { Eye, Filter, Calendar } from "lucide-react";
import { format } from "date-fns";

interface RequestsTableProps {
  requests: MaterialRequest[];
  onViewDetails: (request: MaterialRequest) => void;
}

export function RequestsTable({ requests, onViewDetails }: RequestsTableProps) {
  const [siteFilter, setSiteFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredRequests = requests.filter(request => {
    if (siteFilter !== "all" && request.siteId !== siteFilter) return false;
    if (statusFilter !== "all" && request.status !== statusFilter) return false;
    return true;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      fulfilled: 'default',
      partial: 'secondary', 
      pending: 'destructive',
      cancelled: 'destructive'
    };

    const colors: Record<string, string> = {
      fulfilled: 'bg-success text-success-foreground',
      partial: 'bg-warning text-warning-foreground',
      pending: 'bg-danger text-danger-foreground',
      cancelled: 'bg-muted text-muted-foreground'
    };

    return (
      <Badge className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: 'bg-danger text-danger-foreground',
      high: 'bg-warning text-warning-foreground',
      medium: 'bg-primary text-primary-foreground',
      low: 'bg-muted text-muted-foreground'
    };

    return (
      <Badge variant="outline" className={colors[priority]}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const uniqueSites = [...new Set(requests.map(r => ({ id: r.siteId, name: r.siteName })))];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        
        <Select value={siteFilter} onValueChange={setSiteFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Sites" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sites</SelectItem>
            {uniqueSites.map(site => (
              <SelectItem key={site.id} value={site.id}>
                {site.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="fulfilled">Fulfilled</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request ID</TableHead>
              <TableHead>Site</TableHead>
              <TableHead>Requested By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Cost</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.map((request) => (
              <TableRow key={request.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{request.id}</TableCell>
                <TableCell>{request.siteName}</TableCell>
                <TableCell>{request.requestedBy}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    {format(request.requestDate, 'MMM dd, yyyy')}
                  </div>
                </TableCell>
                <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                <TableCell>{getStatusBadge(request.status)}</TableCell>
                <TableCell>KSh {request.totalCost.toLocaleString()}</TableCell>
                <TableCell>{request.items.length} items</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(request)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredRequests.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No requests found matching your filters.
        </div>
      )}
    </div>
  );
}
