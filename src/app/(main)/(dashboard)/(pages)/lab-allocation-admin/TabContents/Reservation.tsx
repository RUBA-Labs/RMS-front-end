"use client";

import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Monitor, Users, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

// UI Components (Assuming Shadcn UI / Tailwind structure)
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// API Services
import { retrieveAllLabs, LabDto } from "@/services/api/ComputerLabs/retrieve_all_labs";
import { retrieveLabSessionsByLabId, LabSessionDto } from "@/services/api/LabSessions/retrieve_lab_sessions_by_lab_id";
import { retrieveComputersFromLab, ComputerDto } from "@/services/api/Computers/retrive_computers_from_a_lab";
import { retrieveAllLabBookings, BookingDetail } from "@/services/api/LabBooking/retrieve_all_lab_bookings";

// --- Types ---
// Ensuring strict typing for the visualization
type ComputerStatus = 'functional' | 'faulty';

// --- Sub-Component: Lab Visualization Map ---
interface LabVisualizationProps {
  computers: ComputerDto[];
  bookingDetails: BookingDetail[];
  loading: boolean;
}

const LabVisualization = ({ computers, bookingDetails, loading }: LabVisualizationProps) => {
  // Memoize sets for O(1) lookup time to prevent lag with many computers
  const bookedComputerIds = useMemo(() => new Set(bookingDetails.map(b => b.computerId)), [bookingDetails]);

  if (loading) {
    return <div className="h-64 flex items-center justify-center text-muted-foreground">Loading Map...</div>;
  }

  if (!computers || computers.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
        <Monitor className="h-10 w-10 mb-2 opacity-50" />
        <p>No computers found for this lab.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center space-x-4 text-sm justify-end">
        <div className="flex items-center"><div className="w-3 h-3 bg-primary rounded-full mr-2"></div>Available</div>
        <div className="flex items-center"><div className="w-3 h-3 bg-destructive rounded-full mr-2"></div>Booked</div>
        <div className="flex items-center"><div className="w-3 h-3 bg-muted rounded-full mr-2 border border-foreground/20"></div>Faulty</div>
      </div>

      {/* Grid Map */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 p-4 bg-secondary/30 border rounded-xl shadow-inner max-h-[500px] overflow-y-auto">
        {computers.map((computer) => {
          const isBooked = bookedComputerIds.has(computer.computerId);
          const isFaulty = computer.status === 'faulty';

          let statusClasses = "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105"; // Default: Available
          let icon = <Monitor className="h-5 w-5" />;

          if (isFaulty) {
            statusClasses = "bg-muted text-muted-foreground cursor-not-allowed opacity-70";
            icon = <AlertTriangle className="h-5 w-5" />;
          } else if (isBooked) {
            statusClasses = "bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer";
            icon = <Users className="h-5 w-5" />;
          }

          return (
            <div
              key={computer.computerId}
              className={`relative flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 shadow-sm border ${statusClasses}`}
              title={`${computer.name} - ${isFaulty ? 'Faulty' : isBooked ? 'Booked' : 'Available'}`}
            >
              {icon}
              <span className="text-[10px] font-bold mt-1 truncate w-full text-center">
                {computer.name.replace(/[^0-9]/g, '') || "PC"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Main Component: Reservation ---
export function Reservation() {
  // --- State Management ---
  const [labs, setLabs] = useState<LabDto[]>([]);
  const [selectedLabId, setSelectedLabId] = useState<string | null>(null);

  const [computers, setComputers] = useState<ComputerDto[]>([]);
  const [sessions, setSessions] = useState<LabSessionDto[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const [bookingDetails, setBookingDetails] = useState<BookingDetail[]>([]);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Loading States
  const [loadingLabs, setLoadingLabs] = useState(true);
  const [loadingSessionData, setLoadingSessionData] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // --- Derived Data ---
  const currentLab = labs.find(l => l.id === selectedLabId);
  const currentSession = sessions.find(s => s.sessionId === selectedSessionId);

  // Filter sessions for the Calendar list view
  const sessionsOnSelectedDate = useMemo(() => {
    if (!selectedDate || sessions.length === 0) return [];
    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    // NOTE: Adjust 'createdAt' or 'startTime' based on your actual API DTO date field
    return sessions.filter(s => {
      // Assuming ISO string "2023-10-25T14:00:00.000Z"
      const sessionDate = s.startTime ? s.startTime.split('T')[0] : '';
      return sessionDate === dateStr;
    });
  }, [sessions, selectedDate]);

  // Statistics for the currently selected session
  const sessionStats = useMemo(() => {
    if (!selectedSessionId) return { booked: 0, available: 0, capacity: 0 };

    const functionalComputers = computers.filter(c => c.status !== 'faulty').length;
    const bookedCount = bookingDetails.length;

    return {
      booked: bookedCount,
      available: Math.max(0, functionalComputers - bookedCount),
      capacity: computers.length
    };
  }, [selectedSessionId, computers, bookingDetails]);

  // --- Effects ---

  // 1. Initial Load: Get Labs
  useEffect(() => {
    const init = async () => {
      try {
        const data = await retrieveAllLabs();
        setLabs(data);
        if (data.length > 0) setSelectedLabId(data[0].id); // Auto-select first lab
      } catch (error) {
        console.error("Error loading labs:", error);
      } finally {
        setLoadingLabs(false);
      }
    };
    init();
  }, []);

  // 2. Lab Changed: Get Sessions & Computers
  useEffect(() => {
    if (!selectedLabId) return;

    const fetchLabData = async () => {
      setLoadingSessionData(true);
      // Reset downstream selections
      setSessions([]);
      setComputers([]);
      setSelectedSessionId(null);
      setBookingDetails([]);

      try {
        // Parallel fetch for efficiency
        const [sessionsData, computersData] = await Promise.all([
          retrieveLabSessionsByLabId(selectedLabId).catch(() => []), // Catch empty sessions gracefully
          retrieveComputersFromLab(selectedLabId).catch(() => [])
        ]);

        setSessions(sessionsData);
        setComputers(computersData);
      } catch (error) {
        console.error("Error fetching lab data:", error);
      } finally {
        setLoadingSessionData(false);
      }
    };

    fetchLabData();
  }, [selectedLabId]);

  // 3. Session Changed: Get Bookings
  useEffect(() => {
    if (!selectedSessionId) {
      setBookingDetails([]);
      return;
    }

    const fetchBookings = async () => {
      setLoadingBookings(true);
      try {
        const data = await retrieveAllLabBookings(selectedSessionId);
        setBookingDetails(data.bookingDetails || []);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setBookingDetails([]);
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchBookings();
  }, [selectedSessionId]);


  // --- Render ---
  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lab Allocation Admin</h1>
          <p className="text-muted-foreground">Manage first-year student bookings and visualize lab capacity.</p>
        </div>


      </div>

      

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* LEFT COLUMN: Map & Visualization (Takes up 2/3 width on large screens) */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="h-full border-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-primary" />
                  Live Lab Map
                </CardTitle>
                <CardDescription>
                  {currentLab?.name} • Capacity: {computers.length}
                </CardDescription>
              </div>

              {/* Lab Selector (Top Level Control) */}
              <div className="w-[250px]">
                <Select
                  value={selectedLabId || ""}
                  onValueChange={setSelectedLabId}
                  disabled={loadingLabs}
                >
                  <SelectTrigger className="h-12 text-lg">
                    <SelectValue placeholder="Select Laboratory" />
                  </SelectTrigger>
                  <SelectContent>
                    {labs.map((lab) => (
                      <SelectItem key={lab.id} value={lab.id}>{lab.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Session Selector within Map Card */}
              <div className="w-[250px]">
                <Select
                  value={selectedSessionId || ""}
                  onValueChange={setSelectedSessionId}
                  disabled={sessions.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={sessions.length === 0 ? "No Sessions" : "Select Session to View"} />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map(s => (
                      <SelectItem key={s.sessionId} value={s.sessionId}>
                        {s.sessionName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent>
              {/* Stats Bar */}
              {selectedSessionId && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg flex items-center justify-between border border-green-200 dark:border-green-800">
                    <div>
                      <p className="text-xs text-green-700 dark:text-green-400 font-medium">Available</p>
                      <p className="text-2xl font-bold text-green-800 dark:text-green-300">{sessionStats.available}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
                  </div>
                  <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg flex items-center justify-between border border-red-200 dark:border-red-800">
                    <div>
                      <p className="text-xs text-red-700 dark:text-red-400 font-medium">Booked</p>
                      <p className="text-2xl font-bold text-red-800 dark:text-red-300">{sessionStats.booked}</p>
                    </div>
                    <Users className="h-8 w-8 text-red-500 opacity-50" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg flex items-center justify-between border border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="text-xs text-gray-700 dark:text-gray-400 font-medium">Total Capacity</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-300">{sessionStats.capacity}</p>
                    </div>
                    <Monitor className="h-8 w-8 text-gray-500 opacity-50" />
                  </div>
                </div>
              )}

              {/* The Visual Map */}
              <LabVisualization
                computers={computers}
                bookingDetails={bookingDetails}
                loading={loadingSessionData || loadingBookings}
              />
            </CardContent>
          </Card>
        </div>


      </div>

      {/* BOTTOM SECTION: Detailed Table */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Detailed Booking Roster</CardTitle>
          <CardDescription>
            Showing {bookingDetails.length} students for session: <span className="font-semibold text-foreground">{currentSession?.sessionName || "None Selected"}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bookingDetails.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Student ID</TableHead>
                  <TableHead>Session Name</TableHead>
                  <TableHead>Computer Name</TableHead>
                  <TableHead>Lab Location</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookingDetails.map((booking, idx) => (
                  <TableRow key={booking.bookingId || idx}>
                    <TableCell className="font-medium">{booking.bookedByUserId}</TableCell>
                    <TableCell>{currentSession?.sessionName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                        {booking.computerName}
                      </div>
                    </TableCell>
                    <TableCell>{currentLab?.name}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">Confirmed</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              {selectedSessionId ? "No bookings found for this session." : "Select a session to view the booking roster."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}