import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, MapPin, Fingerprint } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface EmployeeAttendanceControlsProps {
  employee: {
    id: string;
    name: string;
    clockInTime: string | null;
    clockOutTime: string | null;
    dailyHours: string;
    overtimeHours: string;
  };
  onClockIn: (employeeId: string) => void;
  onClockOut: (employeeId: string) => void;
  onShareLocation: (employeeId: string, location: string) => void;
}

const EmployeeAttendanceControls: React.FC<EmployeeAttendanceControlsProps> = 
  ({ employee, onClockIn, onClockOut, onShareLocation }) => {
    const [locationStatus, setLocationStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

    const isGuest = employee.id === 'guest';

    const isClockedIn = employee.clockInTime !== null && employee.clockOutTime === null;
    // The isClockedOut state now primarily means the cycle (in and out) is complete for the current day, or not yet started.
    const isClockedOut = employee.clockOutTime !== null; // User has clocked out

    const handleAttendanceAction = () => {
      if (isGuest) {
        toast({
          title: "Login Required",
          description: "Please log in to record attendance.",
          variant: "destructive"
        });
        return;
      }

      if (!navigator.geolocation) {
        toast({
          title: "Location Not Supported",
          description: "Geolocation is not supported by your browser.",
          variant: "destructive"
        });
        return;
      }

      setLocationStatus('sending');

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation = `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;

          if (!isClockedIn) { // If not clocked in, perform check-in
            onClockIn(employee.id);
            onShareLocation(employee.id, newLocation);
            toast({
              title: "Checked In!",
              description: `You have successfully checked in from ${newLocation}`,
            });
          } else { // If clocked in, perform check-out
            onClockOut(employee.id);
            onShareLocation(employee.id, newLocation);
            toast({
              title: "Checked Out!",
              description: `You have successfully checked out from ${newLocation}`,
            });
          }
          setLocationStatus('success');
          setTimeout(() => setLocationStatus('idle'), 2000); // Reset after 2 seconds
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationStatus('error');
          toast({
            title: "Attendance Error",
            description: "Could not record attendance. Please enable location services.",
            variant: "destructive"
          });
          setTimeout(() => setLocationStatus('idle'), 2000); // Reset after 2 seconds
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    };

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your Attendance System</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col space-y-2">
            <p className="text-sm text-muted-foreground">Current User</p>
            <p className="text-lg font-semibold">{employee.name}</p>
          </div>
          <div className="flex flex-col space-y-2">
            <p className="text-sm text-muted-foreground">Clock In Time</p>
            <p className="text-lg font-semibold">{employee.clockInTime || '--:--'}</p>
          </div>
          <div className="flex flex-col space-y-2">
            <p className="text-sm text-muted-foreground">Clock Out Time</p>
            <p className="text-lg font-semibold">{employee.clockOutTime || '--:--'}</p>
          </div>
          <div className="flex flex-col space-y-2">
            <p className="text-sm text-muted-foreground">Daily Hours</p>
            <p className="text-lg font-semibold">{employee.dailyHours}</p>
          </div>
          <div className="flex flex-col space-y-2">
            <p className="text-sm text-muted-foreground">Overtime</p>
            <p className="text-lg font-semibold text-red-500">{employee.overtimeHours}</p>
          </div>

          <div className="col-span-1 md:col-span-2 lg:col-span-4 flex flex-wrap items-center justify-center gap-4 mt-4">
            {/* Biometric Button (CPU Style) */}
            <button
              onClick={handleAttendanceAction}
              disabled={locationStatus === 'sending' || isGuest || (isClockedIn && isClockedOut)} // Disable if sending, guest, or already clocked in and out for the day
              className={`
                relative flex items-center justify-center w-24 h-24 rounded-full p-2 group
                transition-all duration-300 ease-in-out
                bg-gray-800 border-2
                ${locationStatus === 'success' ? 'border-green-500 shadow-green-glow' : locationStatus === 'error' ? 'border-red-500 shadow-red-glow' : 'border-blue-500 shadow-blue-glow'}
              `}
            >
              {/* CPU Chip / PCB Design (Simplified SVG) */}
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full p-2" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="10" width="80" height="80" rx="10" ry="10" fill="#333" stroke="#555" strokeWidth="2" />
                <circle cx="25" cy="25" r="3" fill="#666" />
                <circle cx="75" cy="25" r="3" fill="#666" />
                <circle cx="25" cy="75" r="3" fill="#666" />
                <circle cx="75" cy="75" r="3" fill="#666" />
                <path d="M30 15 L70 15 M30 85 L70 85 M15 30 L15 70 M85 30 L85 70" stroke="#666" strokeWidth="1.5" strokeLinecap="round" />
                
                {/* Dynamic Circuitry (Lines) */}
                <path 
                  id="circuitry-path"
                  d="M20 20 L40 50 L20 80 M80 20 L60 50 L80 80 M50 15 L50 85" 
                  stroke={locationStatus === 'success' ? '#10B981' : '#3B82F6'} 
                  strokeWidth="2" 
                  strokeLinecap="round"
                  className={`
                    transition-all duration-700 ease-in-out
                    ${locationStatus === 'sending' ? 'animate-pulse' : ''}
                  `}
                />
                
                {/* Fingerprint Icon */}
                <Fingerprint 
                  className={`
                    w-1/2 h-1/2
                    ${locationStatus === 'success' ? 'text-green-400' : locationStatus === 'error' ? 'text-red-400' : 'text-blue-400'}
                    transition-colors duration-300 ease-in-out
                  `}
                />
              </svg>
              <span className="sr-only">{isClockedIn ? "Check Out" : "Check In"} and Share Live Location</span>
            </button>

            <div className="flex flex-col gap-2 flex-grow sm:flex-grow-0">
              <Button 
                // onClick={() => onClockIn(employee.id)} // Removed onClick
                disabled={isClockedIn || isGuest} // Disabled if already clocked in or guest
                className="w-full text-lg py-6"
              >
                <Clock className="h-5 w-5 mr-2" /> Check In
              </Button>
              <Button 
                // onClick={() => onClockOut(employee.id)} // Removed onClick
                disabled={!isClockedIn || isGuest} // Disabled if not clocked in or guest
                className="w-full text-lg py-6"
              >
                <Clock className="h-5 w-5 mr-2" /> Check Out
              </Button>
            </div>
          </div>

          {isGuest && (
            <p className="col-span-full text-center text-muted-foreground mt-4">
              Please log in to use attendance features and record your time.
            </p>
          )}
        </CardContent>
      </Card>
    );
};

export default EmployeeAttendanceControls;
