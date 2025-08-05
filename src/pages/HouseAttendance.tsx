import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/common/DataTable';
import { TableColumn } from '@/types/common';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, CheckCircle2, XCircle, PauseCircle, Fingerprint } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import EmployeeAttendanceControls from '@/components/attendance/EmployeeAttendanceControls'; // Import new component
import { useAuth } from '@/contexts/AuthContext'; // Assuming useAuth provides current user

interface EmployeeAttendance {
  id: string;
  name: string;
  status: 'present' | 'on-leave' | 'off-duty';
  lastLocation: string; // Mock location string
  clockInTime: string | null;
  clockOutTime: string | null;
  dailyHours: string;
  overtimeHours: string;
}

interface MonthlyLogEntry {
  date: string;
  status: 'Present' | 'Absent' | 'Leave';
}

interface EmployeeMonthlyLog {
  employeeId: string;
  logs: MonthlyLogEntry[];
}

const mockEmployees: EmployeeAttendance[] = [
  {
    id: 'emp1',
    name: 'Alice Wonderland',
    status: 'present',
    lastLocation: 'Office Building A, Floor 3',
    clockInTime: '08:00 AM',
    clockOutTime: null,
    dailyHours: '00:00',
    overtimeHours: '00:00',
  },
  {
    id: 'emp2',
    name: 'Bob The Builder',
    status: 'on-leave',
    lastLocation: 'N/A',
    clockInTime: null,
    clockOutTime: null,
    dailyHours: '00:00',
    overtimeHours: '00:00',
  },
  {
    id: 'emp3',
    name: 'Charlie Chaplin',
    status: 'off-duty',
    lastLocation: 'Home',
    clockInTime: null,
    clockOutTime: null,
    dailyHours: '00:00',
    overtimeHours: '00:00',
  },
  {
    id: 'emp4',
    name: 'David Copperfield',
    status: 'present',
    lastLocation: 'Office Building A, Floor 5',
    clockInTime: '09:15 AM',
    clockOutTime: null,
    dailyHours: '00:00',
    overtimeHours: '00:00',
  },
];

const mockMonthlyLogs: EmployeeMonthlyLog[] = [
  {
    employeeId: 'emp1',
    logs: [
      { date: '2024-07-01', status: 'Present' },
      { date: '2024-07-02', status: 'Present' },
      { date: '2024-07-03', status: 'Leave' },
      { date: '2024-07-04', status: 'Present' },
      { date: '2024-07-05', status: 'Absent' },
    ],
  },
  {
    employeeId: 'emp2',
    logs: [
      { date: '2024-07-01', status: 'Leave' },
      { date: '2024-07-02', status: 'Leave' },
      { date: '2024-07-03', status: 'Leave' },
      { date: '2024-07-04', status: 'Present' },
      { date: '2024-07-05', status: 'Present' },
    ],
  },
];

const calculateTimeDiff = (start: string, end: string | null) => {
  if (!start || !end) return '00:00';

  const [startHour, startMinute, startAmPm] = start.match(/(\d+):(\d+)\s(AM|PM)/)!.slice(1);
  const [endHour, endMinute, endAmPm] = end.match(/(\d+):(\d+)\s(AM|PM)/)!.slice(1);

  let sH = parseInt(startHour, 10);
  if (startAmPm === 'PM' && sH !== 12) sH += 12;
  if (startAmPm === 'AM' && sH === 12) sH = 0;

  let eH = parseInt(endHour, 10);
  if (endAmPm === 'PM' && eH !== 12) eH += 12;
  if (endAmPm === 'AM' && eH === 12) eH = 0;

  const startDate = new Date();
  startDate.setHours(sH, parseInt(startMinute, 10), 0, 0);

  const endDate = new Date();
  endDate.setHours(eH, parseInt(endMinute, 10), 0, 0);

  let diffMs = endDate.getTime() - startDate.getTime();
  if (diffMs < 0) {
    // Handles cases where clock out is on the next day (e.g., 10 PM to 2 AM)
    diffMs += 24 * 60 * 60 * 1000; 
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return `${String(diffHours).padStart(2, '0')}:${String(diffMinutes).padStart(2, '0')}`;
};

const calculateOvertime = (totalHours: string) => {
  const [hours, minutes] = totalHours.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  const standardWorkMinutes = 8 * 60; // 8 hours in minutes

  if (totalMinutes > standardWorkMinutes) {
    const overtimeMinutes = totalMinutes - standardWorkMinutes;
    const otHours = Math.floor(overtimeMinutes / 60);
    const otMinutes = overtimeMinutes % 60;
    return `${String(otHours).padStart(2, '0')}:${String(otMinutes).padStart(2, '0')}`;
  }
  return '00:00';
};

const HouseAttendance = () => {
  const { user } = useAuth(); // Get current user from AuthContext
  const [employees, setEmployees] = useState<EmployeeAttendance[]>(mockEmployees);

  // Determine the current employee for controls
  let currentEmployee: EmployeeAttendance | null = null;
  if (user) {
    currentEmployee = employees.find(emp => emp.id === user.id) || {
      // Create a mock employee if user is logged in but not in mockEmployees
      id: user.id,
      name: user.name || 'Logged-in User', // Use user's name or a default
      status: 'off-duty', 
      lastLocation: 'N/A',
      clockInTime: null,
      clockOutTime: null,
      dailyHours: '00:00',
      overtimeHours: '00:00',
    };
  } else {
    // If no user is logged in, provide a guest employee
    currentEmployee = {
      id: 'guest',
      name: 'Guest User',
      status: 'off-duty',
      lastLocation: 'N/A',
      clockInTime: null,
      clockOutTime: null,
      dailyHours: '00:00',
      overtimeHours: '00:00',
    };
  }

  // Simulate real-time location updates (for demonstration)
  useEffect(() => {
    const interval = setInterval(() => {
      setEmployees(prevEmployees =>
        prevEmployees.map(emp => {
          if (emp.status === 'present') {
            const randomSuffix = Math.floor(Math.random() * 100);
            return { ...emp, lastLocation: `Office Building A, Floor ${Math.floor(Math.random() * 5) + 1} - Area ${randomSuffix}` };
          }
          return emp;
        })
      );
    }, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleClockIn = (employeeId: string) => {
    if (employeeId === 'guest') {
      toast({ title: "Login Required", description: "Please log in to use attendance features.", variant: "destructive" });
      return;
    }
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    setEmployees(prevEmployees =>
      prevEmployees.map(emp =>
        emp.id === employeeId && emp.clockInTime === null
          ? { ...emp, status: 'present', clockInTime: time, clockOutTime: null, dailyHours: '00:00', overtimeHours: '00:00' }
          : emp
      )
    );
    toast({ title: "Clock In Successful", description: `Employee ${employeeId} clocked in at ${time}.` });
  };

  const handleClockOut = (employeeId: string) => {
    if (employeeId === 'guest') {
      toast({ title: "Login Required", description: "Please log in to use attendance features.", variant: "destructive" });
      return;
    }
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    setEmployees(prevEmployees =>
      prevEmployees.map(emp => {
        if (emp.id === employeeId && emp.clockInTime !== null && emp.clockOutTime === null) {
          const daily = calculateTimeDiff(emp.clockInTime, time);
          const overtime = calculateOvertime(daily);
          return { ...emp, status: 'off-duty', clockOutTime: time, dailyHours: daily, overtimeHours: overtime };
        }
        return emp;
      })
    );
    toast({ title: "Clock Out Successful", description: `Employee ${employeeId} clocked out at ${time}.` });
  };

  const handleShareLiveLocation = (employeeId: string, location: string) => {
    if (employeeId === 'guest') {
      toast({ title: "Login Required", description: "Please log in to use attendance features.", variant: "destructive" });
      return;
    }
    setEmployees(prevEmployees =>
      prevEmployees.map(emp =>
        emp.id === employeeId ? { ...emp, lastLocation: location } : emp
      )
    );
  };

  const dailyAttendanceColumns: TableColumn<EmployeeAttendance>[] = [
    { key: 'name', label: 'Employee Name', sortable: true },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true,
      render: (status: EmployeeAttendance['status']) => {
        let badgeVariant: "default" | "secondary" | "outline" | "destructive" = "secondary";
        let icon = null;
        switch (status) {
          case 'present':
            badgeVariant = 'default';
            icon = <CheckCircle2 className="h-3 w-3 mr-1" />;
            break;
          case 'on-leave':
            badgeVariant = 'outline';
            icon = <PauseCircle className="h-3 w-3 mr-1" />;
            break;
          case 'off-duty':
            badgeVariant = 'destructive';
            icon = <XCircle className="h-3 w-3 mr-1" />;
            break;
        }
        return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize border ${badgeVariant === 'default' ? 'bg-green-100 text-green-800 border-green-200' : badgeVariant === 'outline' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-red-100 text-red-800 border-red-200'}`}>{icon}{status.replace('-', ' ')}</span>;
      },
    },
    { key: 'lastLocation', label: 'Last Shared Location' },
    // Removed clockInTime, clockOutTime, dailyHours, overtimeHours, and actions from the table
  ];

  const monthlyLogColumns: TableColumn<MonthlyLogEntry>[] = [
    { key: 'date', label: 'Date', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
  ];

  // Filter monthly log for the current logged-in user only
  const loggedInUserMonthlyLog = currentEmployee && currentEmployee.id !== 'guest'
    ? mockMonthlyLogs.find(log => log.employeeId === currentEmployee.id)?.logs || []
    : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 lg:ml-[var(--sidebar-width)]">
      <h1 className="text-2xl sm:text-3xl font-bold">Attendance Management</h1>

      {/* Employee Attendance Controls Component */}
      <EmployeeAttendanceControls
        employee={currentEmployee}
        onClockIn={handleClockIn}
        onClockOut={handleClockOut}
        onShareLocation={handleShareLiveLocation}
      />

      {/* Overall Status */} 
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"> 
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.filter(emp => emp.status === 'present').length}</div>
            <p className="text-xs text-muted-foreground">Active employees in office</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Leave Today</CardTitle>
            <PauseCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.filter(emp => emp.status === 'on-leave').length}</div>
            <p className="text-xs text-muted-foreground">Employees currently on leave</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Off Duty</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.filter(emp => emp.status === 'off-duty').length}</div>
            <p className="text-xs text-muted-foreground">Employees not scheduled today</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Attendance Log */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Attendance Log</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable 
            data={employees} 
            columns={dailyAttendanceColumns} 
            searchable={true} 
            pagination={false}
          />
        </CardContent>
      </Card>

      {/* Monthly Attendance Log */}
      <Card>
        <CardHeader>
          <CardTitle>Your Monthly Attendance Log</CardTitle>
        </CardHeader>
        <CardContent>
          {currentEmployee && currentEmployee.id !== 'guest' ? (
            loggedInUserMonthlyLog.length > 0 ? (
              <DataTable 
                data={loggedInUserMonthlyLog} 
                columns={monthlyLogColumns} 
                searchable={false} 
                pagination={false}
              />
            ) : (
              <p className="text-muted-foreground">No monthly attendance logs found for your account.</p>
            )
          ) : (
            <p className="text-muted-foreground">Please log in to view your monthly attendance log.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HouseAttendance;
