import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Fuel, 
  Package, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  Calendar,
  DollarSign
} from "lucide-react"
import { ApprovalRecordsTable } from "./ApprovalRecordsTable"

interface RequestItem {
  id: string
  title: string
  requestor: string
  amount: number
  date: string
  urgency: "high" | "medium" | "low"
  status: "pending" | "approved" | "rejected"
  description: string
}

const fuelRequests: RequestItem[] = [
  {
    id: "F001",
    title: "Diesel for Generator Backup",
    requestor: "John Smith",
    amount: 1250,
    date: "2024-01-15",
    urgency: "high",
    status: "pending",
    description: "Emergency fuel for backup generator during maintenance"
  },
  {
    id: "F002", 
    title: "Vehicle Fleet Refueling",
    requestor: "Maria Garcia",
    amount: 850,
    date: "2024-01-14",
    urgency: "medium",
    status: "pending",
    description: "Monthly fuel allowance for company vehicles"
  },
  {
    id: "F003",
    title: "Heavy Machinery Fuel",
    requestor: "David Chen",
    amount: 2100,
    date: "2024-01-13",
    urgency: "high",
    status: "approved",
    description: "Fuel for construction equipment at Site A"
  }
]

const materialRequests: RequestItem[] = [
  {
    id: "M001",
    title: "Steel Beams - Grade A36",
    requestor: "Sarah Wilson",
    amount: 15750,
    date: "2024-01-15",
    urgency: "high",
    status: "pending",
    description: "Structural steel for Building Phase 2"
  },
  {
    id: "M002",
    title: "Concrete Mix - 50 Bags",
    requestor: "Tom Rodriguez",
    amount: 890,
    date: "2024-01-14",
    urgency: "medium",
    status: "pending",
    description: "Foundation concrete for parking area"
  },
  {
    id: "M003",
    title: "Electrical Wiring Kit",
    requestor: "Lisa Park",
    amount: 3200,
    date: "2024-01-12",
    urgency: "low",
    status: "approved",
    description: "Wiring materials for office renovation"
  }
]

const financeRequests: RequestItem[] = [
  {
    id: "FN001",
    title: "Consultant Fee - Q1 2024",
    requestor: "Michael Brown",
    amount: 12500,
    date: "2024-01-15",
    urgency: "medium",
    status: "pending",
    description: "Quarterly payment for technical consultant"
  },
  {
    id: "FN002",
    title: "Software License Renewal",
    requestor: "Jennifer Lee",
    amount: 4800,
    date: "2024-01-14",
    urgency: "high",
    status: "pending",
    description: "Annual renewal for project management software"
  },
  {
    id: "FN003",
    title: "Training Program Budget",
    requestor: "Alex Johnson",
    amount: 8200,
    date: "2024-01-13",
    urgency: "low",
    status: "rejected",
    description: "Staff training and development program"
  }
]

const getUrgencyColor = (urgency: string) => {
  switch (urgency) {
    case "high":
      return "bg-destructive text-destructive-foreground"
    case "medium": 
      return "bg-warning text-warning-foreground"
    case "low":
      return "bg-success text-success-foreground"
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
    case "pending":
      return "bg-warning text-warning-foreground"
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
    case "pending":
      return <Clock className="h-4 w-4" />
    default:
      return <Clock className="h-4 w-4" />
  }
}

const RequestCard = ({ request }: { request: RequestItem }) => (
  <Card className="bg-gradient-card border shadow-sm hover:shadow-md transition-all">
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <CardTitle className="text-lg font-semibold text-foreground mb-2">
            {request.title}
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {request.requestor}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(request.date).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              ${request.amount.toLocaleString()}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge className={getStatusColor(request.status)}>
            {getStatusIcon(request.status)}
            <span className="ml-1 capitalize">{request.status}</span>
          </Badge>
          <Badge className={getUrgencyColor(request.urgency)}>
            {request.urgency} priority
          </Badge>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground mb-4">{request.description}</p>
      {request.status === "pending" && (
        <div className="flex gap-2">
          <Button size="sm" className="flex-1">
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve
          </Button>
          <Button size="sm" variant="destructive" className="flex-1">
            <XCircle className="h-4 w-4 mr-2" />
            Reject
          </Button>
        </div>
      )}
    </CardContent>
  </Card>
)

export function ApprovalTabs() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="fuel" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted">
          <TabsTrigger value="fuel" className="flex items-center gap-2">
            <Fuel className="h-4 w-4" />
            Fuel Requests
          </TabsTrigger>
          <TabsTrigger value="material" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Material Requests
          </TabsTrigger>
          <TabsTrigger value="finance" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Finance Requests
          </TabsTrigger>
          <TabsTrigger value="records" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Approval Records
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fuel" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {fuelRequests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="material" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {materialRequests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="finance" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {financeRequests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="records" className="mt-6">
          <ApprovalRecordsTable />
        </TabsContent>
      </Tabs>
    </div>
  )
}
