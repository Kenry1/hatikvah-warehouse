import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/common/DataTable';
import { TableColumn } from '@/types/common';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import { User, updateUser, deleteUser, UserRole } from '@/lib/firestoreHelpers';
import { useAuth } from '@/contexts/AuthContext'; // Assuming AuthContext provides current user's companyId
import { LoadingSpinner } from '@/components/navigation/LoadingSpinner';

const departments = [
  'HR', 'Finance', 'ICT', 'Operations', 'Logistics', 'Procurement', 'Management', 'Health and Safety', 'Employee', 'Implementation Manager', 'Project Manager', 'Site Engineer', 'Warehouse'
];

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [employees, setEmployees] = useState<User[]>([]);
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
      // Remove or replace getUserList
      //const fetchedUsers = await getUserList(currentUser.companyId);
      //setEmployees(fetchedUsers);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      setError("Failed to load employees.");
      toast({
        title: "Error",
        description: "Failed to load employee data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    //Remove or replace fetchEmployees
    //fetchEmployees();
  }, [currentUser?.companyId]);

  const handleDepartmentChange = async (employeeId: string, newDepartment: string) => {
    try {
      await updateUser(employeeId, { department: newDepartment });
      setEmployees(prevEmployees =>
        prevEmployees.map(emp =>
          emp.id === employeeId ? { ...emp, department: newDepartment } : emp
        )
      );
      toast({
        title: "Department Updated",
        description: `Employee department changed to ${newDepartment}.`,
      });
    } catch (err) {
      console.error("Failed to update department:", err);
      toast({
        title: "Error",
        description: "Failed to update department. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async (employeeId: string) => {
    try {
      await deleteUser(employeeId);
      setEmployees(prevEmployees =>
        prevEmployees.filter(emp => emp.id !== employeeId)
      );
      toast({
        title: "Account Deleted",
        description: `Employee account has been deleted.`,
      });
    } catch (err) {
      console.error("Failed to delete account:", err);
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    }
  };

  const columns: TableColumn<User>[] = [
    { key: 'username', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    {
      key: 'department',
      label: 'Department',
      sortable: true,
      render: (department: string, row: User) => (
        <Select
          onValueChange={(value: string) => handleDepartmentChange(row.id!, value)}
          defaultValue={department}
          disabled={!currentUser?.companyId} // Disable if no company ID
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map(dept => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    { key: 'role', label: 'Role', sortable: true },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: User) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleDeleteAccount(row.id!)} className="text-red-600 focus:text-red-700">
              Delete Account
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">User Management</h1>
      <DataTable
        data={employees}
        columns={columns}
        searchable={true}
        pagination={true}
        filterOptions={[
          { key: 'department', label: 'Department', type: 'select', options: departments.map(d => ({ value: d, label: d })) }
        ]}
      />
    </div>
  );
};

export default UserManagement;
