import { useState, useEffect } from 'react';
import { BaseDashboard } from './BaseDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Settings, UserCheck, Ticket, AlertTriangle, CheckCircle, Clock, Trash2, Loader2 } from 'lucide-react';
import { UserRole, User } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useToast } from '@/components/ui/use-toast';

export function ICTDashboard() {
  const { user: currentUserAuth } = useAuth(); // Renamed to avoid conflict with mock user
  const { toast } = useToast();

  const [showUserDialog, setShowUserDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    role: '' as UserRole | '',
    password: ''
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [creatingUser, setCreatingUser] = useState(false);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);

  // Fetch users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentUserAuth || !currentUserAuth.companyId) {
        setLoadingUsers(false);
        return;
      }

      setLoadingUsers(true);
      try {
        const usersCollectionRef = collection(db, "users");
        const q = query(usersCollectionRef, where("companyId", "==", currentUserAuth.companyId));
        const querySnapshot = await getDocs(q);
        const fetchedUsers: User[] = [];
        querySnapshot.forEach(doc => {
          fetchedUsers.push({ id: doc.id, ...doc.data() } as User);
        });
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast({
          title: "Error",
          description: "Failed to fetch users. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [currentUserAuth, toast]);

  const stats = [
    { title: 'Active Users', value: users.filter(u => u.status !== 'Inactive').length, description: 'Total active users', color: 'success' as const },
    { title: 'Open Tickets', value: 8, description: '3 critical, 5 normal', color: 'warning' as const }, // Mock data for now
    { title: 'System Uptime', value: '99.9%', description: 'Last 30 days', color: 'success' as const },
    { title: 'Pending Approvals', value: 5, description: 'User access requests', color: 'primary' as const }, // Mock data for now
  ];

  const allRecentTickets = [
    { id: 'IT-001', title: 'VPN Connection Issues', priority: 'High', status: 'Open', assignee: 'John Doe', creatorId: currentUserAuth?.id, created: '2 hours ago' }, // Use actual creatorId
    { id: 'IT-002', title: 'Email Server Maintenance', priority: 'Medium', status: 'In Progress', assignee: 'Jane Smith', creatorId: 'jane_smith_id', created: '1 day ago' },
    { id: 'IT-003', title: 'Software License Renewal', priority: 'Low', status: 'Resolved', assignee: 'Mike Johnson', creatorId: 'mike_johnson_id', created: '3 days ago' },
    { id: 'IT-004', title: 'Printer Not Working', priority: 'High', status: 'Open', assignee: 'John Doe', creatorId: currentUserAuth?.id, created: '4 hours ago' }, // Use actual creatorId
  ];

  // Filter tickets to show only those created by the current user
  const recentTickets = allRecentTickets.filter(ticket => ticket.creatorId === currentUserAuth?.id);

  const roles: UserRole[] = ['ICT', 'Finance', 'Health and Safety', 'Employee', 'HR', 'Implementation Manager', 'Logistics', 'Operations Manager', 'Planning', 'Project Manager', 'Site Engineer', 'Warehouse', 'Admin', 'Procurement'];

  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.role || !newUser.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields to create a user.",
        variant: "destructive",
      });
      return;
    }

    if (!currentUserAuth || !currentUserAuth.companyId || !currentUserAuth.companyName) {
      toast({
        title: "Error",
        description: "Company information not available. Cannot create user.",
        variant: "destructive",
      });
      return;
    }

    setCreatingUser(true);
    try {
      // 1. Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, newUser.email, newUser.password);
      const firebaseUser = userCredential.user;

      // Set display name for the Firebase Auth user
      await updateProfile(firebaseUser, { displayName: newUser.username });

      // 2. Create user document in Firestore
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userData: User = {
        id: firebaseUser.uid,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        companyId: currentUserAuth.companyId,
        companyName: currentUserAuth.companyName,
        createdAt: serverTimestamp() as any,
        // Add other default fields if necessary, e.g., status: 'Active'
        status: 'Active',
        lastLogin: new Date().toISOString() // Or use serverTimestamp()
      };

      await setDoc(userDocRef, userData);

      // Update local state
      setUsers(prev => [...prev, userData]);
      setShowUserDialog(false);
      setNewUser({ username: '', email: '', role: '', password: '' });
      toast({
        title: "User Created",
        description: `User ${newUser.username} (${newUser.role}) has been successfully created.`,
      });
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast({
        title: "Error creating user",
        description: error.message || "Failed to create user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreatingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!currentUserAuth || !currentUserAuth.companyId) {
      toast({
        title: "Error",
        description: "Company information not available. Cannot delete user.",
        variant: "destructive",
      });
      return;
    }

    // Optional: Add a confirmation dialog before deleting
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    setDeletingUser(userId);
    try {
      const userDocRef = doc(db, "users", userId);
      await deleteDoc(userDocRef);

      // Note: Deleting the Firebase Authentication user account itself
      // must be done via a secure backend (e.g., Firebase Cloud Function)
      // for security reasons. This client-side operation only deletes the Firestore document.

      // Update local state
      setUsers(prev => prev.filter(user => user.id !== userId));
      toast({
        title: "User Deleted",
        description: "The user has been successfully deleted.",
      });
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error deleting user",
        description: error.message || "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingUser(null);
    }
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
                    <Button variant="outline" onClick={() => setShowUserDialog(false)} className="flex-1" disabled={creatingUser}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateUser} className="flex-1" disabled={creatingUser}>
                      {creatingUser ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
                      ) : (
                        "Create User"
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {loadingUsers ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <p className="text-center text-muted-foreground">No users found for this company.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
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
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={deletingUser === user.id || user.id === currentUserAuth?.id} // Prevent deleting self
                        >
                          {deletingUser === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
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