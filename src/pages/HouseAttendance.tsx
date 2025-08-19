import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/common/DataTable';
import { TableColumn } from '@/types/common';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, CheckCircle2, XCircle, PauseCircle, Fingerprint } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import EmployeeAttendanceControls from '@/components/attendance/EmployeeAttendanceControls';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, serverTimestamp } from "firebase/firestore";

interface EmployeeAttendance {
  id: string;
  name: string;
  status: 'present' | 'on-leave' | 'off-duty';
  lastLocation: string;
  clockInTime: string | null; // Formatted time string for display
  clockOutTime: string | null; // Formatted time string for display
  dailyHours: string;
  overtimeHours: string;
  clockInTimestamp: Date | null; // Actual Date object for calculations
  clockOutTimestamp: Date | null; // Actual Date object for calculations
  companyId: string;
  date: string; // YYYY-MM-DD
}

interface MonthlyLogEntry {
  date: string;
  status: 'Present' | 'Absent' | 'Leave';
}

interface EmployeeMonthlyLog {
  employeeId: string;
  logs: MonthlyLogEntry[];
}

const calculateTimeDiff = (start: Date | null, end: Date | null) => {
  if (!start || !end) return '00:00';

  const diffMs = end.getTime() - start.getTime();
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
  const { user } = useAuth();
  const [currentEmployeeAttendance, setCurrentEmployeeAttendance] = useState<EmployeeAttendance | null>(null);
  const [loadingAttendance, setLoadingAttendance] = useState(true);

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const fetchCurrentEmployeeAttendance = useCallback(async () => {
    if (!user || !user.companyId) {
      setLoadingAttendance(false);
      return;
    }

    setLoadingAttendance(true);
    try {
      const attendanceDocRef = doc(db, "companies", user.companyId, "dailyAttendance", user.id + "_" + today);
      const docSnap = await getDoc(attendanceDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as Omit<EmployeeAttendance, 'clockInTime' | 'clockOutTime'> & { clockInTimestamp?: any, clockOutTimestamp?: any };
        setCurrentEmployeeAttendance({
          ...data,
          clockInTime: data.clockInTimestamp ? new Date(data.clockInTimestamp.toDate()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : null,
          clockOutTime: data.clockOutTimestamp ? new Date(data.clockOutTimestamp.toDate()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : null,
          clockInTimestamp: data.clockInTimestamp ? data.clockInTimestamp.toDate() : null,
          clockOutTimestamp: data.clockOutTimestamp ? data.clockOutTimestamp.toDate() : null,
        });
      } else {
        // Initialize if no record exists for today
        setCurrentEmployeeAttendance({
          id: user.id,
          name: user.username || 'Logged-in User',
          status: 'off-duty',
          lastLocation: 'N/A',
          clockInTime: null,
          clockOutTime: null,
          dailyHours: '00:00',
          overtimeHours: '00:00',
          clockInTimestamp: null,
          clockOutTimestamp: null,
          companyId: user.companyId,
          date: today,
        });
      }
    } catch (error) {
      console.error("Error fetching current employee attendance:", error);
      toast({
        title: "Error",
        description: "Failed to fetch your attendance data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingAttendance(false);
    }
  }, [user, today]);

  useEffect(() => {
    fetchCurrentEmployeeAttendance();
  }, [fetchCurrentEmployeeAttendance]);

  // Provide a guest employee if no user is logged in
  const currentEmployeeForControls = user && !loadingAttendance && currentEmployeeAttendance
    ? currentEmployeeAttendance
    : {
        id: 'guest',
        name: 'Guest User',
        status: 'off-duty',
        lastLocation: 'N/A',
        clockInTime: null,
        clockOutTime: null,
        dailyHours: '00:00',
        overtimeHours: '00:00',
        clockInTimestamp: null,
        clockOutTimestamp: null,
        companyId: '',
        date: today,
      };

  const handleClockIn = async (employeeId: string) => {
    if (!user || !user.companyId) {
      toast({ title: "Login Required", description: "Please log in to use attendance features.", variant: "destructive" });
      return;
    }
    
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    try {
      const attendanceDocRef = doc(db, "companies", user.companyId, "dailyAttendance", user.id + "_" + today);
      await setDoc(attendanceDocRef, {
        id: user.id,
        name: user.username,
        companyId: user.companyId,
        date: today,
        clockInTimestamp: now,
        clockInTime: timeString, // Store formatted string for display simplicity
        status: 'present',
        lastLocation: currentEmployeeAttendance?.lastLocation || 'Unknown',
        dailyHours: '00:00',
        overtimeHours: '00:00',
        clockOutTimestamp: null,
        clockOutTime: null,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      }, { merge: true }); // Use merge: true to update existing fields or create if not exists

      toast({ title: "Clock In Successful", description: `You clocked in at ${timeString}.` });
      fetchCurrentEmployeeAttendance(); // Re-fetch to update local state
    } catch (error) {
      console.error("Error clocking in:", error);
      toast({ title: "Clock In Failed", description: "Could not record clock in. Please try again.", variant: "destructive" });
    }
  };

  const handleClockOut = async (employeeId: string) => {
    if (!user || !user.companyId || !currentEmployeeAttendance || !currentEmployeeAttendance.clockInTimestamp) {
      toast({ title: "Error", description: "Cannot clock out. No active clock-in found.", variant: "destructive" });
      return;
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    
    const daily = calculateTimeDiff(currentEmployeeAttendance.clockInTimestamp, now);
    const overtime = calculateOvertime(daily);

    try {
      const attendanceDocRef = doc(db, "companies", user.companyId, "dailyAttendance", user.id + "_" + today);
      await updateDoc(attendanceDocRef, {
        clockOutTimestamp: now,
        clockOutTime: timeString,
        dailyHours: daily,
        overtimeHours: overtime,
        status: 'off-duty',
        lastLocation: currentEmployeeAttendance?.lastLocation || 'Unknown',
        updatedAt: serverTimestamp(),
      });

      toast({ title: "Clock Out Successful", description: `You clocked out at ${timeString}. Daily Hours: ${daily}, Overtime: ${overtime}.` });
      fetchCurrentEmployeeAttendance(); // Re-fetch to update local state
    } catch (error) {
      console.error("Error clocking out:", error);
      toast({ title: "Clock Out Failed", description: "Could not record clock out. Please try again.", variant: "destructive" });
    }
  };

  const handleShareLiveLocation = async (employeeId: string, location: string) => {
    if (!user || !user.companyId || !currentEmployeeAttendance) {
      toast({ title: "Login Required", description: "Please log in to share your location.", variant: "destructive" });
      return;
    }

    try {
      const attendanceDocRef = doc(db, "companies", user.companyId, "dailyAttendance", user.id + "_" + today);
      await updateDoc(attendanceDocRef, {
        lastLocation: location,
        updatedAt: serverTimestamp(),
      });
      toast({ title: "Location Updated", description: `Your location has been updated to: ${location}.` });
      fetchCurrentEmployeeAttendance(); // Re-fetch to update local state
    } catch (error) {
      console.error("Error updating location:", error);
      toast({ title: "Location Update Failed", description: "Could not update location. Please try again.", variant: "destructive" });
    }
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
    { key: 'clockInTime', label: 'Clock In', sortable: true },
    { key: 'clockOutTime', label: 'Clock Out', sortable: true },
    { key: 'dailyHours', label: 'Daily Hours', sortable: true },
    { key: 'overtimeHours', label: 'Overtime', sortable: true },
  ];

  const monthlyLogColumns: TableColumn<MonthlyLogEntry>[] = [
    { key: 'date', label: 'Date', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
  ];

  // Filter monthly log for the current logged-in user only (Still mock, to be integrated with real data later)
  const loggedInUserMonthlyLog: MonthlyLogEntry[] = []; // Placeholder for real data

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 lg:ml-[var(--sidebar-width)]">
      <h1 className="text-2xl sm:text-3xl font-bold">Attendance Management</h1>

      {loadingAttendance ? (
        <Card className="mb-6">
          <CardContent className="flex justify-center items-center h-40">
            <Clock className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Loading your attendance...</p>
          </CardContent>
        </Card>
      ) : (
        <EmployeeAttendanceControls
          employee={currentEmployeeForControls}
          onClockIn={handleClockIn}
          onClockOut={handleClockOut}
          onShareLocation={handleShareLiveLocation}
        />
      )}

      {/* Daily Attendance Log */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Attendance Log</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable 
            data={currentEmployeeAttendance ? [currentEmployeeAttendance] : []} 
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
          {user && currentEmployeeAttendance && currentEmployeeAttendance.id !== 'guest' ? (
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
