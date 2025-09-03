import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, Filter, CheckCircle, XCircle, User, Calendar } from "lucide-react"
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { getMaterialRequestList } from "@/lib/firestoreHelpers"
import { useAuth } from "@/contexts/AuthContext"



interface ApprovalRecord {
  id: string;
  requestId: string;
  requestType: "fuel" | "material" | "finance";
  title: string;
  requestor: string;
}

const ApprovalRecordsTable = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [requestType, setRequestType] = useState("all-types");
  const [status, setStatus] = useState("all-status");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    if (!user?.companyId) return;
    getMaterialRequestList(user.companyId).then((data) => {
      // Only show approved/rejected requests
      const filtered = data.filter((r) => r.status === "approved" || r.status === "rejected");
      setRecords(filtered);
    });
  }, [user]);

  useEffect(() => {
    let temp = [...records];
    if (requestType !== "all-types") {
      temp = temp.filter(r => r.requestType === requestType);
    }
    if (status !== "all-status") {
      temp = temp.filter(r => r.status === status);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      temp = temp.filter(r =>
        (r.requestedByUsername?.toLowerCase().includes(term) || "") ||
        (r.approver?.toLowerCase().includes(term) || "") ||
        (r.title?.toLowerCase().includes(term) || "")
      );
    }
    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      temp = temp.filter(r => {
        const reqDate = r.requestDate ? new Date(r.requestDate).getTime() : 0;
        return reqDate >= from;
      });
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime();
      temp = temp.filter(r => {
        const reqDate = r.requestDate ? new Date(r.requestDate).getTime() : 0;
        return reqDate <= to;
      });
    }
    setFilteredRecords(temp);
  }, [records, requestType, status, searchTerm, dateFrom, dateTo]);

  const getRequestTypeColor = (type: string) => {
    switch (type) {
      case "fuel":
        return "bg-orange-100 text-orange-800";
      case "material":
        return "bg-blue-100 text-blue-800";
      case "finance":
        return "bg-green-100 text-green-800";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-success text-success-foreground";
      case "rejected":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Download handlers
  const handleDownloadXLS = () => {
    const data = filteredRecords.map(r => ({
      ID: r.id,
      Type: r.requestType,
      Title: r.materialType || r.description || r.title,
      Requestor: r.username || r.requestedByUsername || "",
      Amount: r.price ?? "",
      Approver: r.approver || "",
      Role: r.approverRole || "",
      Date: r.requestDate ? new Date(r.requestDate).toLocaleDateString() : "",
      Status: r.status,
      Comments: r.comments || ""
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ApprovalRecords");
    const xlsData = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([xlsData], { type: "application/octet-stream" });
    saveAs(blob, "approval_records.xlsx");
  };

  const handleDownloadPDF = async () => {
    const jsPDFModule = await import("jspdf");
    const doc = new jsPDFModule.default();
    let y = 10;
    doc.setFontSize(12);
    doc.text("Approval Records", 10, y);
    y += 10;
    filteredRecords.forEach((r, idx) => {
      doc.text(`ID: ${r.id} | Type: ${r.requestType} | Title: ${r.materialType || r.description || r.title} | Requestor: ${r.username || r.requestedByUsername || ""} | Amount: ${r.price ?? ""} | Approver: ${r.approver || ""} | Role: ${r.approverRole || ""} | Date: ${r.requestDate ? new Date(r.requestDate).toLocaleDateString() : ""} | Status: ${r.status} | Comments: ${r.comments || ""}`, 10, y);
      y += 8;
      if (y > 280) {
        doc.addPage();
        y = 10;
      }
    });
    doc.save("approval_records.pdf");
  };

  return (
    <Card className="bg-gradient-card border shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-primary" />
          Approval Records
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Complete history of all approval decisions with approver information
        </p>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by requestor, approver, or title..."
              className="pl-10"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 items-center">
            <label className="text-xs text-muted-foreground">From</label>
            <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-32" />
            <label className="text-xs text-muted-foreground">To</label>
            <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-32" />
          </div>
          <Select value={requestType} onValueChange={setRequestType}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-types">All Request Types</SelectItem>
              <SelectItem value="fuel">Fuel Requests</SelectItem>
              <SelectItem value="material">Material Requests</SelectItem>
              <SelectItem value="finance">Finance Requests</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-status">All Status</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadXLS} title="Download XLS" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span className="text-xs">.xls</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPDF} title="Download PDF" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span className="text-xs">.pdf</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Requestor</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Approver</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Comments</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.id}</TableCell>
                  <TableCell>
                    <Badge className={getRequestTypeColor("material")}>material</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate" title={record.materialType || record.description}>
                    {record.materialType || record.description}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-muted-foreground" />
                      {record.username || record.requestedByUsername || ""}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    ${Number(record.price ?? 0).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-muted-foreground" />
                      {record.approver || "—"}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {record.approverRole || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">
                        {record.requestDate ? new Date(record.requestDate).toLocaleDateString() : "—"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(record.status)}>
                      {getStatusIcon(record.status)}
                      <span className="ml-1 capitalize">{record.status}</span>
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <span className="text-sm text-muted-foreground truncate" title={record.comments}>
                      {record.comments || "—"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApprovalRecordsTable;
