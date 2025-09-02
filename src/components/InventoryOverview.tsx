import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Search, Package, CheckCircle, XCircle } from "lucide-react";
import { InventoryItem } from "../lib/mockData";

interface InventoryOverviewProps {
  data: InventoryItem[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
}

export const InventoryOverview = ({ 
  data, 
  searchTerm, 
  setSearchTerm, 
  categoryFilter, 
  setCategoryFilter 
}: InventoryOverviewProps) => {
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter data based on search and filters
  const filteredData = data.filter(item => {
    const itemName = item.itemName || "";
    const itemCode = item.itemCode || "";
    const category = typeof item.category === "string" ? item.category : "unknown";
    const matchesSearch = itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         itemCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || category.toLowerCase() === categoryFilter.toLowerCase();
    let matchesStatus = true;
    if (statusFilter === "low stock") {
      matchesStatus = (item.quantity ?? 0) <= (item.reorderLevel ?? 0);
    } else if (statusFilter === "out of stock") {
      matchesStatus = (item.quantity ?? 0) === 0;
    } else if (statusFilter === "in stock") {
      matchesStatus = (item.quantity ?? 0) > (item.reorderLevel ?? 0);
    }
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity === 0) {
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Out of Stock</Badge>;
    } else if (item.quantity <= item.reorderLevel) {
      return <Badge className="bg-yellow-500 text-black"><AlertCircle className="h-3 w-3 mr-1" />Low Stock</Badge>;
    } else {
      return <Badge className="bg-green-500 text-white"><CheckCircle className="h-3 w-3 mr-1" />In Stock</Badge>;
    }
  };

  const categories = [...new Set(data.map(item => typeof item.category === "string" ? item.category : "unknown"))];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Package className="h-5 w-5" />
          <span>Inventory Overview</span>
        </CardTitle>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 pt-4">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by item name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category.toLowerCase()}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="in stock">In Stock</SelectItem>
              <SelectItem value="low stock">Low Stock</SelectItem>
              <SelectItem value="out of stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Stock Code</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">Reorder Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Unit Price (KES)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No items found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item, idx) => (
                  <TableRow key={item.itemCode || `row-${idx}`}>
                    <TableCell className="font-medium">{item.itemName}</TableCell>
                    <TableCell className="font-mono text-sm">{item.itemCode}</TableCell>
                    <TableCell>{typeof item.category === "string" ? item.category : "unknown"}</TableCell>
                    <TableCell className="text-right font-medium">{item.quantity}</TableCell>
                    <TableCell>{item.unit || ""}</TableCell>
                    <TableCell className="text-right">{item.reorderLevel ?? 0}</TableCell>
                    <TableCell>{getStockStatus(item)}</TableCell>
                    <TableCell className="text-right">{typeof item.unitPrice === "number" ? item.unitPrice.toFixed(2) : "0.00"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground">
          Showing {filteredData.length} of {data.length} items.
        </div>
      </CardContent>
    </Card>
  );
};
