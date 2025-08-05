import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface FieldTripApplication {
  id: string;
  destination: string;
  reason: string;
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedBy: string;
}

interface SiteVisitLog {
  id: string;
  siteName: string;
  checkInTime: string;
  checkOutTime: string | null;
  duration: string | null;
  checkInLatitude?: number | null;
  checkInLongitude?: number | null;
  checkOutLatitude?: number | null;
  checkOutLongitude?: number | null;
}

export function FieldTripAlert() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [destination, setDestination] = useState('');
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [siteName, setSiteName] = useState('');
  const [currentCheckIn, setCurrentCheckIn] = useState<SiteVisitLog | null>(null);
  const [monthlySiteVisits, setMonthlySiteVisits] = useState<SiteVisitLog[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number | null; longitude: number | null }>({ latitude: null, longitude: null });

  // Helper to get current location
  const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        toast({
          title: 'Geolocation Not Supported',
          description: 'Your browser does not support geolocation.',
          variant: 'destructive',
        });
        reject(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          toast({
            title: 'Location Error',
            description: `Unable to retrieve your location: ${error.message}`,
            variant: 'destructive',
          });
          reject(error);
        }
      );
    });
  };

  // Mock API functions
  const mockApplyFieldTrip = async (application: Omit<FieldTripApplication, 'id' | 'status' | 'appliedBy'>) => {
    return new Promise<FieldTripApplication>((resolve) => {
      setTimeout(() => {
        const newApplication: FieldTripApplication = {
          id: `ft-${Date.now()}`,
          ...application,
          status: 'Pending',
          appliedBy: user?.username || 'Unknown',
        };
        resolve(newApplication);
      }, 500);
    });
  };

  const mockCheckIn = async (site: string, latitude: number | null, longitude: number | null) => {
    return new Promise<SiteVisitLog>((resolve) => {
      setTimeout(() => {
        const checkInEntry: SiteVisitLog = {
          id: `ci-${Date.now()}`,
          siteName: site,
          checkInTime: new Date().toISOString(),
          checkOutTime: null,
          duration: null,
          checkInLatitude: latitude,
          checkInLongitude: longitude,
        };
        resolve(checkInEntry);
      }, 500);
    });
  };

  const mockCheckOut = async (visitId: string, latitude: number | null, longitude: number | null) => {
    return new Promise<SiteVisitLog>((resolve, reject) => {
      setTimeout(() => {
        const visitIndex = monthlySiteVisits.findIndex(v => v.id === visitId);
        if (visitIndex > -1) {
          const updatedVisits = [...monthlySiteVisits];
          const checkOutTime = new Date();
          const checkInTime = new Date(updatedVisits[visitIndex].checkInTime);
          const durationMs = checkOutTime.getTime() - checkInTime.getTime();
          const durationHours = (durationMs / (1000 * 60 * 60)).toFixed(2);

          updatedVisits[visitIndex] = {
            ...updatedVisits[visitIndex],
            checkOutTime: checkOutTime.toISOString(),
            duration: `${durationHours} hours`,
            checkOutLatitude: latitude,
            checkOutLongitude: longitude,
          };
          setMonthlySiteVisits(updatedVisits);
          resolve(updatedVisits[visitIndex]);
        } else {
          reject(new Error('Visit not found'));
        }
      }, 500);
    });
  };

  const mockFetchSiteVisits = async () => {
    return new Promise<SiteVisitLog[]>((resolve) => {
      setTimeout(() => {
        resolve([
          { id: '1', siteName: 'Construction Site A', checkInTime: '2023-10-26T09:00:00Z', checkOutTime: '2023-10-26T17:00:00Z', duration: '8.00 hours', checkInLatitude: 34.0522, checkInLongitude: -118.2437, checkOutLatitude: 34.0525, checkOutLongitude: -118.2430 },
          { id: '2', siteName: 'Client Office B', checkInTime: '2023-10-20T10:30:00Z', checkOutTime: '2023-10-20T14:30:00Z', duration: '4.00 hours', checkInLatitude: 34.0522, checkInLongitude: -118.2437, checkOutLatitude: 34.0525, checkOutLongitude: -118.2430 },
        ]);
      }, 700);
    });
  };

  useEffect(() => {
    const fetchVisits = async () => {
      const visits = await mockFetchSiteVisits();
      setMonthlySiteVisits(visits);
    };
    fetchVisits();
  }, []);

  const handleFieldTripSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination || !reason || !startDate || !endDate) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all field trip application fields.',
        variant: 'destructive',
      });
      return;
    }
    try {
      const newApplication = await mockApplyFieldTrip({ destination, reason, startDate, endDate });
      toast({
        title: 'Field Trip Application Submitted',
        description: `Application for ${newApplication.destination} (${newApplication.status}).`,
      });
      setDestination('');
      setReason('');
      setStartDate('');
      setEndDate('');
    } catch (error) {
      toast({
        title: 'Submission Failed',
        description: 'There was an error submitting your field trip application.',
        variant: 'destructive',
      });
    }
  };

  const handleCheckIn = async () => {
    if (!siteName) {
      toast({
        title: 'Missing Site Name',
        description: 'Please enter the site name to check in.',
        variant: 'destructive',
      });
      return;
    }
    if (currentCheckIn) {
      toast({
        title: 'Already Checked In',
        description: `You are currently checked in at ${currentCheckIn.siteName}. Please check out first.`,
        variant: 'warning',
      });
      return;
    }

    try {
      const location = await getCurrentLocation();
      setCurrentLocation(location);
      const newCheckIn = await mockCheckIn(siteName, location.latitude, location.longitude);
      setCurrentCheckIn(newCheckIn);
      setMonthlySiteVisits(prev => [...prev, newCheckIn]);
      toast({
        title: 'Checked In',
        description: `Successfully checked into ${siteName} at ${format(new Date(newCheckIn.checkInTime), 'PPpp')} (Lat: ${location.latitude?.toFixed(4)}, Lon: ${location.longitude?.toFixed(4)}).`,
      });
      setSiteName('');
    } catch (error) {
      console.error('Check-in error:', error);
      toast({
        title: 'Check-in Failed',
        description: 'There was an error during check-in or fetching location.',
        variant: 'destructive',
      });
    }
  };

  const handleCheckOut = async () => {
    if (!currentCheckIn) {
      toast({
        title: 'Not Checked In',
        description: 'You are not currently checked into any site.',
        variant: 'warning',
      });
      return;
    }

    try {
      const location = await getCurrentLocation();
      setCurrentLocation(location);
      await mockCheckOut(currentCheckIn.id, location.latitude, location.longitude);
      toast({
        title: 'Checked Out',
        description: `Successfully checked out from ${currentCheckIn.siteName} (Lat: ${location.latitude?.toFixed(4)}, Lon: ${location.longitude?.toFixed(4)}).`,
      });
      setCurrentCheckIn(null);
    } catch (error) {
      toast({
        title: 'Check-out Failed',
        description: 'There was an error during check-out or fetching location.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Field Trip Management</h1>

      {/* Field Trip Application */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Apply for Field Trip</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFieldTripSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g., Client Site X, Project Y"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Visit</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Briefly describe the purpose of the trip"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" className="w-full">
                Submit Application
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Check-in/Check-out Component */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Site Check-in/Check-out with Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-end gap-4 mb-4">
            <div className="flex-1 w-full space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="e.g., Construction Site Z"
                disabled={!!currentCheckIn}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button onClick={handleCheckIn} disabled={!!currentCheckIn}>
                Check In
              </Button>
              <Button onClick={handleCheckOut} disabled={!currentCheckIn} variant="outline">
                Check Out
              </Button>
            </div>
          </div>
          {currentCheckIn && (
            <div className="text-sm text-muted-foreground">
              Currently checked in at: <span className="font-semibold">{currentCheckIn.siteName}</span> since {format(new Date(currentCheckIn.checkInTime), 'PPpp')}.
              {currentCheckIn.checkInLatitude && currentCheckIn.checkInLongitude && (
                <span> (Lat: {currentCheckIn.checkInLatitude.toFixed(4)}, Lon: {currentCheckIn.checkInLongitude.toFixed(4)})</span>
              )}
            </div>
          )}
          {currentLocation.latitude && currentLocation.longitude && !currentCheckIn && (
            <div className="text-sm text-muted-foreground mt-2">
              Last fetched location: Lat: {currentLocation.latitude.toFixed(4)}, Lon: {currentLocation.longitude.toFixed(4)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Site Visits Log */}
      <Card>
        <CardHeader>
          <CardTitle>Your Monthly Site Visits Log</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlySiteVisits.length === 0 ? (
            <p className="text-muted-foreground">No site visits logged yet this month.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site Name</TableHead>
                    <TableHead>Check-in Time</TableHead>
                    <TableHead>Check-in Location</TableHead>
                    <TableHead>Check-out Time</TableHead>
                    <TableHead>Check-out Location</TableHead>
                    <TableHead>Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlySiteVisits.map((visit) => (
                    <TableRow key={visit.id}>
                      <TableCell className="font-medium">{visit.siteName}</TableCell>
                      <TableCell>{format(new Date(visit.checkInTime), 'MMM dd, yyyy HH:mm')}</TableCell>
                      <TableCell>
                        {visit.checkInLatitude && visit.checkInLongitude
                          ? `${visit.checkInLatitude.toFixed(4)}, ${visit.checkInLongitude.toFixed(4)}`
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {visit.checkOutTime ? format(new Date(visit.checkOutTime), 'MMM dd, yyyy HH:mm') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {visit.checkOutLatitude && visit.checkOutLongitude
                          ? `${visit.checkOutLatitude.toFixed(4)}, ${visit.checkOutLongitude.toFixed(4)}`
                          : 'N/A'}
                      </TableCell>
                      <TableCell>{visit.duration || 'Ongoing'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
