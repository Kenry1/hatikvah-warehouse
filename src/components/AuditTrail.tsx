import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownUp, History, Search } from "lucide-react";
import { mockTransactions, Transaction } from "@/lib/mockData";

export const AuditTrail = () => {
  const [transactions] = useState<Transaction[]>(mockTransactions);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredTransactions = transactions.filter(tx => {
    const typeMatch = typeFilter === "all" || tx.type.toLowerCase() === typeFilter;
    const searchMatch = searchTerm === "" || 
      tx.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.ref.toLowerCase().includes(searchTerm.toLowerCase());
    return typeMatch && searchMatch;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <History className="h-5 w-5" />
          <span>Transaction Audit Trail</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
          {/* Search Input */}
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by item, user, or ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {/* Type Filter */}
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="issued">Issued</SelectItem>
                <SelectItem value="received">Received</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Item Code</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>User/Source</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Badge variant={tx.type === 'Issued' ? 'destructive' : 'default'} className={tx.type === 'Received' ? 'bg-green-500 text-white' : ''}>
                        {tx.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{tx.itemName}</TableCell>
                    <TableCell className="font-mono text-sm">{tx.itemCode}</TableCell>
                    <TableCell className="font-medium">{tx.quantity}</TableCell>
                    <TableCell>{tx.user}</TableCell>
                    <TableCell>{tx.timestamp}</TableCell>
                    <TableCell className="font-mono text-sm">{tx.ref}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No matching transactions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
