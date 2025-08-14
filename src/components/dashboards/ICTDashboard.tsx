import { useState } from 'react';
import { BaseDashboard } from './BaseDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Settings, UserCheck, Ticket, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { UserRole } from '@/types/auth';

export function ICTDashboard() {
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    role: '' as UserRole | '',
    password: ''
  });

  // Mock current user for demonstration purposes
  const currentUser = { id: 'john_doe_id', username: 'John Doe' };

  const stats = [
    { title: 'Active Users', value: 42, description: 'Total users in system', color: 'success' as const },
    { title: 'Open Tickets', value: 8, description: '3 critical, 5 normal', color: 'warning' as const },
    { title: 'System Uptime', value: '99.9%', description: 'Last 30 days', color: 'success' as const },
    { title: 'Pending Approvals', value: 5, description: 'User access requests', color: 'primary' as const },
  ];

  const allRecentTickets = [
    { id: 'IT-001', title: 'VPN Connection Issues', priority: 'High', status: 'Open', assignee: 'John Doe', creatorId: 'john_doe_id', created: '2 hours ago' },
    { id: 'IT-002', title: 'Email Server Maintenance', priority: 'Medium', status: 'In Progress', assignee: 'Jane Smith', creatorId: 'jane_smith_id', created: '1 day ago' },
    { id: 'IT-003', title: 'Software License Renewal', priority: 'Low', status: 'Resolved', assignee: 'Mike Johnson', creatorId: 'mike_johnson_id', created: '3 days ago' },
    { id: 'IT-004', title: 'Printer Not Working', priority: 'High', status: 'Open', assignee: 'John Doe', creatorId: 'john_doe_id', created: '4 hours ago' },
  ];

  // Filter tickets to show only those created by the current user
  const recentTickets = allRecentTickets.filter(ticket => ticket.creatorId === currentUser.id);

  const systemUsers = [
    { id: '1', username: 'admin', email: 'admin@techcorp.com', role: 'ICT', status: 'Active', lastLogin: '5 min ago' },
    { id: '2', username: 'finance', email: 'finance@techcorp.com', role: 'Finance', status: 'Active', lastLogin: '2 hours ago' },
    { id: '3', username: 'hr', email: 'hr@techcorp.com', role: 'HR', status: 'Active', lastLogin: '1 day ago' },
    { id: '4', username: 'safety', email: 'safety@techcorp.com', role: 'Health and Safety', status: 'Inactive', lastLogin: '1 week ago' },
  ];

  const roles: UserRole[] = ['ICT', 'Finance', 'Health and Safety', 'Employee', 'HR', 'Implementation Manager', 'Logistics', 'Operations Manager', 'Planning', 'Project Manager', 'Site Engineer', 'Warehouse', 'Admin', 'Procurement'];

  const handleCreateUser = () => {
    console.log('Creating user:', newUser);
    setShowUserDialog(false);
    setNewUser({ username: '', email: '', role: '', password: '' });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-destructive text-destructive-foreground';
      case 'Medium': return 'bg-warning text-warning-foreground';
      case 'Low': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open': return <AlertTriangle className="h-4 w-4" />;
      case 'In Progress': return <Clock className="h-4 w-4" />;
      case 'Resolved': return <CheckCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <BaseDashboard
      title="ICT Dashboard"
      description="System administration, user management, and IT support overview"
      stats={stats}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* IT Tickets Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                My Created IT Tickets
              </CardTitle>
              <CardDescription>Your recently created support requests and system issues</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTickets.length > 0 ? (
                recentTickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(ticket.status)}
                      <div>
                        <p className="font-medium">{ticket.title}</p>
                        <p className="text-sm text-muted-foreground">{ticket.id} • {ticket.assignee}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getPriorityColor(ticket.priority)} variant="secondary">
                        {ticket.priority}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{ticket.created}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground">No IT tickets created by you.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>Manage system users and permissions</CardDescription>
            </div>
            <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>Add a new user to the system with appropriate role permissions.</DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={newUser.username}
                        onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="johndoe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="john@company.com"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={newUser.role} onValueChange={(value: UserRole) => setNewUser(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Temporary Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Enter temporary password"
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={() => setShowUserDialog(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={handleCreateUser} className="flex-1">
                      Create User
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {systemUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'Active' ? 'default' : 'secondary'}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.lastLogin}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* System Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Configuration
          </CardTitle>
          <CardDescription>Configure system-wide settings and integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Settings className="h-6 w-6 mb-2" />
              Database Settings
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <UserCheck className="h-6 w-6 mb-2" />
              Permission Manager
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Ticket className="h-6 w-6 mb-2" />
              System Monitoring
            </Button>
          </div>
        </CardContent>
      </Card>
    </BaseDashboard>
  );
}