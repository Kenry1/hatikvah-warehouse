import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, Filter, CheckCircle, XCircle, User, Calendar } from "lucide-react"

interface ApprovalRecord {
  id: string
  requestId: string
  requestType: "fuel" | "material" | "finance"
  title: string
  requestor: string
  amount: number
  approver: string
  approverRole: string
  approvalDate: string
  status: "approved" | "rejected"
  comments?: string
}

const approvalRecords: ApprovalRecord[] = [
  {
    id: "AR001",
    requestId: "F003",
    requestType: "fuel",
    title: "Heavy Machinery Fuel",
    requestor: "David Chen",
    amount: 2100,
    approver: "Sarah Mitchell",
    approverRole: "Operations Manager",
    approvalDate: "2024-01-13T10:30:00",
    status: "approved",
    comments: "Approved for urgent construction needs"
  },
  {
    id: "AR002",
    requestId: "M003",
    requestType: "material",
    title: "Electrical Wiring Kit",
    requestor: "Lisa Park",
    amount: 3200,
    approver: "John Williams",
    approverRole: "Project Manager",
    approvalDate: "2024-01-12T14:15:00",
    status: "approved",
    comments: "Standard procurement approved"
  },
  {
    id: "AR003",
    requestId: "FN003",
    requestType: "finance",
    title: "Training Program Budget",
    requestor: "Alex Johnson",
    amount: 8200,
    approver: "Emily Davis",
    approverRole: "Finance Director",
    approvalDate: "2024-01-13T09:45:00",
    status: "rejected",
    comments: "Budget constraints for Q1"
  },
  {
    id: "AR004",
    requestId: "F001",
    requestType: "fuel",
    title: "Generator Backup Fuel",
    requestor: "Mark Thompson",
    amount: 980,
    approver: "Sarah Mitchell",
    approverRole: "Operations Manager",
    approvalDate: "2024-01-11T16:20:00",
    status: "approved"
  },
  {
    id: "AR005",
    requestId: "M002",
    requestType: "material",
    title: "Construction Steel Rods",
    requestor: "Carlos Rodriguez",
    amount: 5400,
    approver: "John Williams",
    approverRole: "Project Manager",
    approvalDate: "2024-01-10T11:30:00",
    status: "approved",
    comments: "Expedited for Phase 1 completion"
  },
  {
    id: "AR006",
    requestId: "FN002",
    requestType: "finance",
    title: "Software License Renewal",
    requestor: "Jennifer Lee",
    amount: 4800,
    approver: "Emily Davis",
    approverRole: "Finance Director",
    approvalDate: "2024-01-09T13:10:00",
    status: "rejected",
    comments: "Alternative solution recommended"
  }
]

const getRequestTypeColor = (type: string) => {
  switch (type) {
    case "fuel":
      return "bg-orange-100 text-orange-800"
    case "material":
      return "bg-blue-100 text-blue-800"
    case "finance":
      return "bg-green-100 text-green-800"
    default:
      return "bg-muted text-muted-foreground"
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-success text-success-foreground"
    case "rejected":
      return "bg-destructive text-destructive-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "approved":
      return <CheckCircle className="h-4 w-4" />
    case "rejected":
      return <XCircle className="h-4 w-4" />
    default:
      return null
  }
}

export function ApprovalRecordsTable() {
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
            />
          </div>
          <Select defaultValue="all-types">
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
          <Select defaultValue="all-status">
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
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
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
              {approvalRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.requestId}</TableCell>
                  <TableCell>
                    <Badge className={getRequestTypeColor(record.requestType)}>
                      {record.requestType}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate" title={record.title}>
                    {record.title}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-muted-foreground" />
                      {record.requestor}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    ${record.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-muted-foreground" />
                      {record.approver}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {record.approverRole}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(record.approvalDate).toLocaleDateString()}
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
  )
}
