import React, { useState } from 'react';
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

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
}

const initialEmployees: Employee[] = [
  { id: '1', name: 'Alice Smith', email: 'alice.s@example.com', department: 'HR', role: 'Employee' },
  { id: '2', name: 'Bob Johnson', email: 'bob.j@example.com', department: 'Finance', role: 'Employee' },
  { id: '3', name: 'Charlie Brown', email: 'charlie.b@example.com', department: 'ICT', role: 'ICT' },
  { id: '4', name: 'Diana Prince', email: 'diana.p@example.com', department: 'Operations', role: 'Operations Manager' },
  { id: '5', name: 'Eve Adams', email: 'eve.a@example.com', department: 'HR', role: 'HR' },
  { id: '6', name: 'Frank White', email: 'frank.w@example.com', department: 'Finance', role: 'Employee' },
  { id: '7', name: 'Grace Lee', email: 'grace.l@example.com', department: 'ICT', role: 'Employee' },
  { id: '8', name: 'Henry Miller', email: 'henry.m@example.com', department: 'Logistics', role: 'Logistics' },
  { id: '9', name: 'Ivy Wilson', email: 'ivy.w@example.com', department: 'Operations', role: 'Employee' },
  { id: '10', name: 'Jack Taylor', email: 'jack.t@example.com', department: 'Finance', role: 'Finance' },
];

const departments = [
  'HR', 'Finance', 'ICT', 'Operations', 'Logistics', 'Procurement', 'Management', 'Health and Safety', 'Employee', 'Implementation Manager', 'Project Manager', 'Site Engineer', 'Warehouse'
];

const UserManagement = () => {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);

  const handleDepartmentChange = (employeeId: string, newDepartment: string) => {
    setEmployees(prevEmployees =>
      prevEmployees.map(emp =>
        emp.id === employeeId ? { ...emp, department: newDepartment } : emp
      )
    );
    toast({
      title: "Department Updated",
      description: `Employee ${employeeId} department changed to ${newDepartment}.`,
    });
  };

  const handleDeleteAccount = (employeeId: string) => {
    setEmployees(prevEmployees =>
      prevEmployees.filter(emp => emp.id !== employeeId)
    );
    toast({
      title: "Account Deleted",
      description: `Employee ${employeeId} account has been deleted.`,
    });
  };

  const columns: TableColumn<Employee>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    {
      key: 'department',
      label: 'Department',
      sortable: true,
      render: (department: string, row: Employee) => (
        <Select
          onValueChange={(value) => handleDepartmentChange(row.id, value)}
          defaultValue={department}
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
      render: (_: any, row: Employee) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleDeleteAccount(row.id)} className="text-red-600 focus:text-red-700">
              Delete Account
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

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
