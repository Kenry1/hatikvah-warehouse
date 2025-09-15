import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Search, Package, CheckCircle, XCircle } from "lucide-react";
import { InventoryItem as BaseInventoryItem } from "../lib/mockData";

type InventoryItem = BaseInventoryItem & { id?: string };

type InventoryRow = InventoryItem & { id?: string; availableQuantity?: number };

interface InventoryOverviewProps {
  onDelete?: (itemId: string) => Promise<void> | void;
  onCategoryChange?: (itemId: string, newCategory: string) => Promise<void> | void;
  data: InventoryRow[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  onRestock?: (itemId: string, addQuantity: number) => Promise<void> | void;
  onUnitChange?: (itemId: string, newUnit: string) => Promise<void> | void;
  onLoadMore?: () => Promise<void> | void;
  hasMore?: boolean;
  loadingMore?: boolean;
}

export const InventoryOverview = ({ 
  data, 
  searchTerm, 
  setSearchTerm, 
  categoryFilter, 
  setCategoryFilter,
  onRestock,
  onUnitChange,
  onCategoryChange,
  onDelete,
  onLoadMore,
  hasMore = false,
  loadingMore = false,
}: InventoryOverviewProps) => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [restockQty, setRestockQty] = useState<Record<string, string>>({});
  const [unitEdit, setUnitEdit] = useState<Record<string, string>>({});
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Infinite scroll: observe sentinel and call onLoadMore when visible
  useEffect(() => {
    if (!onLoadMore || !hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting && hasMore && !loadingMore) {
        onLoadMore();
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [onLoadMore, hasMore, loadingMore]);

  // Filter data based on search and filters
  const filteredData = data.filter(item => {
    const matchesSearch = (typeof item.itemName === 'string' && item.itemName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (typeof item.itemCode === 'string' && item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === "all" || 
      (typeof item.category === 'string' && item.category.toLowerCase() === categoryFilter.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === "low stock") {
      matchesStatus = item.quantity <= item.reorderLevel;
    } else if (statusFilter === "out of stock") {
      matchesStatus = item.quantity === 0;
    } else if (statusFilter === "in stock") {
      matchesStatus = item.quantity > item.reorderLevel;
    }
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStockStatus = (item: InventoryRow) => {
    if (item.quantity === 0) {
      return <Badge className="bg-red-500 text-white"><XCircle className="h-3 w-3 mr-1" />Out of Stock</Badge>;
    } else if (item.quantity <= item.reorderLevel) {
      return <Badge className="bg-yellow-500 text-black"><AlertCircle className="h-3 w-3 mr-1" />Low Stock</Badge>;
    } else {
      return <Badge className="bg-green-500 text-white"><CheckCircle className="h-3 w-3 mr-1" />In Stock</Badge>;
    }
  };

  const allowedCategories = [
    "Safety Equipment",
    "Solar Equipment",
    "Company Assets",
    "Office Supplies"
  ];
  const categories = allowedCategories;

  // Predefined units: SI units + buckets, wheelbarrows, tonnes
  const unitOptions = [
    "kg", "g", "mg", "lb", "oz", "l", "ml", "m", "cm", "mm", "pcs", "buckets", "wheelbarrows", "tonnes"
  ];

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
                <TableHead className="text-right">Restock</TableHead>
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
                filteredData.map((item) => {
                  const key = item.itemCode || `${item.itemName}-${item.category}-${item.unit}-${item.reorderLevel}`;
                  const handleRestock = async () => {
                    const qty = parseInt(restockQty[key] || "", 10);
                    if (!isNaN(qty) && qty > 0) {
                      if (onRestock && item.id) {
                        await onRestock(String(item.id), qty);
                      }
                      item.quantity = (Number(item.quantity) || 0) + qty;
                      setRestockQty(prev => ({ ...prev, [key]: "" }));
                    }
                  };
                  const handleUnitChange = async (newUnit: string) => {
                    setUnitEdit(prev => ({ ...prev, [key]: newUnit }));
                    if (onUnitChange && item.id) {
                      await onUnitChange(String(item.id), newUnit);
                    }
                    item.unit = newUnit;
                  };
                  const handleDelete = async () => {
                    if (onDelete && item.id) {
                      await onDelete(String(item.id));
                    }
                  };
                  return (
                    <TableRow key={key}>
                      <TableCell className="font-medium">{item.itemName}</TableCell>
                      <TableCell className="font-mono text-sm">{item.itemCode}</TableCell>
                      <TableCell>
                        <Select value={item.category} onValueChange={async (newCategory) => {
                          if (onCategoryChange && item.id) {
                            await onCategoryChange(String(item.id), newCategory);
                          }
                        }}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            {allowedCategories.map(category => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right font-medium">{item.quantity}</TableCell>
                      <TableCell>
                        <Select value={unitEdit[key] || item.unit} onValueChange={handleUnitChange}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {unitOptions.map(unit => (
                              <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">{item.reorderLevel}</TableCell>
                      <TableCell>{getStockStatus(item)}</TableCell>
                      <TableCell className="text-right">{typeof item.unitPrice === 'number' ? item.unitPrice.toFixed(2) : '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 items-center">
                          <Input
                            type="number"
                            min="1"
                            value={restockQty[key] || ""}
                            onChange={e => setRestockQty(prev => ({ ...prev, [key]: e.target.value }))}
                            placeholder="Qty"
                            className="w-16"
                          />
                          <button
                            type="button"
                            className="bg-primary text-black dark:bg-gray-800 dark:text-white px-2 py-1 rounded hover:bg-primary/90 dark:hover:bg-gray-700 transition-colors"
                            onClick={handleRestock}
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
                            onClick={handleDelete}
                          >
                            Delete
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Infinite scroll sentinel and fallback button */}
        {(onLoadMore && hasMore) && (
          <div className="flex flex-col items-center gap-3 mt-4">
            <div ref={sentinelRef} className="h-2 w-full" />
            <button
              type="button"
              onClick={() => onLoadMore?.()}
              disabled={loadingMore}
              className="px-3 py-2 rounded border text-sm"
            >
              {loadingMore ? 'Loading…' : 'Load more'}
            </button>
          </div>
        )}
        
        <div className="mt-4 text-sm text-muted-foreground">
          Showing {filteredData.length} of {data.length} items.
        </div>
      </CardContent>
    </Card>
  );
};
