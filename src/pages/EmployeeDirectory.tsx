import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Mail, Phone, MapPin, Calendar, User as UserIcon, Building } from 'lucide-react';
import { User, getUserList } from '@/lib/firestoreHelpers';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/navigation/LoadingSpinner';

export default function EmployeeDirectory() {
  const { user: currentUser } = useAuth();
  const [employees, setEmployees] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = async () => {
    if (!currentUser?.companyId) {
      setLoading(false);
      setError("No company ID found for the current user.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const fetchedUsers = await getUserList(currentUser.companyId);
      setEmployees(fetchedUsers);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      setError("Failed to load employees.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [currentUser?.companyId]);

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'on-leave':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDepartmentColor = (department: string | undefined) => {
    const colors: { [key: string]: string } = {
      'ICT': 'bg-blue-100 text-blue-800 border-blue-200',
      'Finance': 'bg-green-100 text-green-800 border-green-200',
      'Operations': 'bg-purple-100 text-purple-800 border-purple-200',
      'HR': 'bg-pink-100 text-pink-800 border-pink-200',
      'Logistics': 'bg-orange-100 text-orange-800 border-orange-200',
      'Safety': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[department || ''] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = (employee.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           employee.position?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getInitials = (name: string | undefined) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const departments = [...new Set(employees.map(emp => emp.department).filter(Boolean))] as string[];

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Employee Directory</h1>
          <p className="text-muted-foreground">Find and connect with team members across the organization</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-muted-foreground">
              Across all departments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {employees.filter(emp => emp.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently working
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {employees.filter(emp => emp.status === 'on-leave').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently away
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground">
              Active departments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map(dept => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="on-leave">On Leave</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((employee) => (
          <Card key={employee.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={employee.avatar} alt={employee.username} />
                  <AvatarFallback>{getInitials(employee.username)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">{employee.username}</CardTitle>
                  <CardDescription>{employee.position}</CardDescription>
                </div>
                <div className="flex flex-col gap-1">
                  {employee.department && (
                    <Badge className={getDepartmentColor(employee.department)}>
                      {employee.department}
                    </Badge>
                  )}
                  {employee.status && (
                    <Badge className={getStatusColor(employee.status)}>
                      {employee.status === 'on-leave' ? 'On Leave' : employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {employee.leaveStatus && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                  <div className="font-medium text-yellow-800">{employee.leaveStatus.type}</div>
                  <div className="text-yellow-600">
                    {employee.leaveStatus.startDate} - {employee.leaveStatus.endDate}
                  </div>
                </div>
              )}

              <div className="space-y-2 text-sm">
                {employee.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${employee.email}`} className="text-primary hover:underline">
                      {employee.email}
                    </a>
                  </div>
                )}
                {employee.phoneNumber && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${employee.phoneNumber}`} className="text-primary hover:underline">
                      {employee.phoneNumber}
                    </a>
                  </div>
                )}
                {employee.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{employee.location}</span>
                  </div>
                )}
                {employee.manager && (
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    <span>Reports to: {employee.manager}</span>
                  </div>
                )}
                {employee.startDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Started: {new Date(employee.startDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Mail className="h-3 w-3 mr-1" />
                  Message
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Phone className="h-3 w-3 mr-1" />
                  Call
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <UserIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No employees found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or filters.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}