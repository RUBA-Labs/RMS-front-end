"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Wrench, CircleCheck, CircleX } from "lucide-react";
import { cn } from "@/lib/utils";

// --- API Imports ---
// Assuming these file paths are correct in your project structure:
import { retrieveComputersFromLab, ComputerDto } from "@/services/api/Computers/retrive_computers_from_a_lab";
import { retrieveAllLabSessions, LabSessionDto } from "@/services/api/LabSessions/retrieve_all_lab_sessions";
import { retrieveAllLabBookings, LabBookingStatusResponse } from "@/services/api/LabBooking/retrieve_all_lab_bookings_by_session_ID";
import { createLabBooking, LabBookingPayload } from "@/services/api/LabBooking/booking_a_lab_session"; 

// --- Helper ---
const getComputerNumber = (name: string): number => {
  const match = name.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
};

// --- Sub Component for Computer Map ---
const LabMap = ({
  computers,
  bookedComputerNumbers,
  onSelectComputer,
  selectedComputerNumber,
}: {
  computers: ComputerDto[];
  bookedComputerNumbers: number[];
  onSelectComputer: (computer: ComputerDto) => void;
  selectedComputerNumber: number | null;
}) => {
  const getComputerStatus = (computer: ComputerDto) => {
    // Check if the computer itself is marked as 'faulty'
    if (computer.status.toLowerCase() === "faulty") return "not_working"; 
    // Check if the computer number is in the list of currently booked computers
    if (bookedComputerNumbers.includes(getComputerNumber(computer.name))) return "booked";
    // Otherwise, it's available
    return "available";
  };

  const statusConfig = {
    available: { color: "bg-green-500", icon: <CircleCheck className="h-4 w-4" />, tooltip: "Available" },
    booked: { color: "bg-red-500", icon: <CircleX className="h-4 w-4" />, tooltip: "Booked" },
    not_working: { color: "bg-gray-400", icon: <Wrench className="h-4 w-4" />, tooltip: "Not Working" },
  };

  return (
    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 p-4 border rounded-md bg-muted/50">
      {computers.map((computer) => {
        const status = getComputerStatus(computer);
        const computerNo = getComputerNumber(computer.name);
        const isSelected = selectedComputerNumber === computerNo;

        return (
          <Button
            key={computer.computerId}
            variant="outline"
            // Only enable button for available computers
            disabled={status !== "available"}
            onClick={() => onSelectComputer(computer)}
            className={cn(
              "h-12 w-12 flex flex-col items-center justify-center font-bold text-xs text-white p-1 hover:bg-opacity-80",
              statusConfig[status].color,
              isSelected && "ring-2 ring-offset-2 ring-blue-500"
            )}
            title={`Computer ${computerNo} - ${statusConfig[status].tooltip}`}
          >
            {statusConfig[status].icon}
            <span>{computerNo}</span>
          </Button>
        );
      })}
    </div>
  );
};

const CURRENT_STUDENT_ID = "00e7033c-3522-4a00-9883-841f48666571"; 

export function LabBooking() {
  // Session list (from backend)
  const [labSessions, setLabSessions] = useState<LabSessionDto[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);

  // Selected session
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const selectedSession = labSessions.find((s) => s.sessionId === selectedSessionId) || null;

  // Computed labId
  const selectedLabId = selectedSession?.labId ?? null;

  // Computers
  const [computers, setComputers] = useState<ComputerDto[]>([]);
  const [selectedComputer, setSelectedComputer] = useState<ComputerDto | null>(null);
  const [computersLoading, setComputersLoading] = useState(false);
  const [computersError, setComputersError] = useState<string | null>(null);

  // Booked Computers Data (REAL API DATA)
  const [labBookingStatus, setLabBookingStatus] = useState<LabBookingStatusResponse | null>(null);

  // Extract booked computer numbers for the map component
  const bookedComputerNumbers = useMemo(() => {
    if (!labBookingStatus) return [];
    return labBookingStatus.bookingDetails
      .filter(detail => detail.isBooked)
      .map(detail => getComputerNumber(detail.computerName));
  }, [labBookingStatus]);

  // Booking status
  const [bookingStatus, setBookingStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Helper to trigger re-fetch of booking status after a successful booking
  const [bookingRefetchKey, setBookingRefetchKey] = useState(0);

  // Determine if the booking button should be disabled
  const isBookingDisabled = useMemo(() => {
    return (
      !selectedSessionId || // No session selected
      !selectedComputer || // No computer selected
      bookingStatus === "submitting" || // Already submitting
      computersLoading // Computer data is still loading
    );
  }, [selectedSessionId, selectedComputer, bookingStatus, computersLoading]);


  // 1. Load all lab sessions from backend 
 
  useEffect(() => {
    const fetchSessions = async () => {
      setSessionsLoading(true);
      setSessionsError(null);
      try {
        const sessions = await retrieveAllLabSessions();
        setLabSessions(sessions);
      } catch (error: any) {
        setSessionsError(error.message || "Failed to load sessions.");
      } finally {
        setSessionsLoading(false);
      }
    };

    fetchSessions();
  }, []);

  useEffect(() => {
    // Fetch Computers for the Lab
    const fetchComputers = async (labId: string) => {
      setComputersLoading(true);
      setComputersError(null);
      setComputers([]);
      setSelectedComputer(null);
      try {
        const fetchedComputers = await retrieveComputersFromLab(labId);
        setComputers(
          fetchedComputers.sort((a, b) => getComputerNumber(a.name) - getComputerNumber(b.name))
        );
      } catch (error: any) {
        setComputersError(error.message || "Failed to fetch computers.");
      } finally {
        setComputersLoading(false);
      }
    };

    // Fetch Booking Status for the Session
    const fetchBookingStatus = async (sessionId: string) => {
      setLabBookingStatus(null);
      // Reset the map error on fresh fetch, but wait for computersLoading to finish
      if (!computersLoading) setComputersError(null); 
      try {
        const status = await retrieveAllLabBookings(sessionId);
        setLabBookingStatus(status);
      } catch (error: any) {
        setLabBookingStatus(null);
        // Set this error only if computers have loaded successfully, otherwise let fetchComputers error prevail
        if (!computersLoading) {
          setComputersError(error.message || "Failed to fetch current booking status.");
        }
      }
    };

    if (selectedSessionId && selectedLabId) {
      fetchComputers(selectedLabId);
      // Trigger booking status fetch whenever the session ID changes OR when a new booking is successfully submitted
      fetchBookingStatus(selectedSessionId);
    } else {
      setComputers([]);
      setLabBookingStatus(null);
    }
    
  }, [selectedLabId, selectedSessionId, bookingRefetchKey]); 

  // --------------------------------------------------------------------
  // 3. Booking Handler (Corrected logic)
  // --------------------------------------------------------------------
  const handleBooking = async () => {
    // Clear any previous success or error message
    setBookingStatus("idle");
    setBookingError(null);

    if (!selectedSession || !selectedComputer) {
      setBookingError("Please select a session and an available computer.");
      setBookingStatus("error");
      return;
    }

    setBookingStatus("submitting");

    // Construct the payload based on the API function definition
    const payload: LabBookingPayload = {
      labSessionId: selectedSession.sessionId,
      computerId: selectedComputer.computerId,
    };

    try {
      // Call the API to create the booking
      await createLabBooking(payload);

      // Success: Update state
      setBookingStatus("success");
      
      // Clear selected computer after booking
      setSelectedComputer(null); 
      
      // Trigger refetch of the booking status to update the map (by changing the key)
      setBookingRefetchKey(prev => prev + 1);

      // Optional: Clear success message after a few seconds
      setTimeout(() => setBookingStatus("idle"), 5000);

    } catch (error: any) {
      // Failure: Update state
      setBookingStatus("error");
      setBookingError(error.message || "An unknown error occurred while trying to book the computer.");
    } 
    // Note: Removed the unnecessary and faulty 'finally' block.
  };

  
  return (
    // **Change:** Reduced vertical spacing here from mt-8 to mt-4
    <div className="mt-4"> 
      <div className="text-left mb-4">
        <h1 className="text-3xl font-bold">Book a Computer</h1>
        <p className="text-muted-foreground">Choose a lab session and select an available computer.</p>
      </div>

      {/* **Change:** New container with space-y-4 for card separation */}
      <div className="space-y-4"> 

        {/* ------------------- Lab Session Selector ------------------- */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Lab Session</CardTitle>
          </CardHeader>
          <CardContent>
            {sessionsLoading && <p>Loading sessions...</p>}
            {sessionsError && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{sessionsError}</AlertDescription>
              </Alert>
            )}

            {!sessionsLoading && !sessionsError && (
              <Select onValueChange={setSelectedSessionId} value={selectedSessionId || undefined}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a Session" />
                </SelectTrigger>
                <SelectContent>
                  {labSessions.map((session) => (
                    <SelectItem key={session.sessionId} value={session.sessionId}>
                      {session.sessionName} — {session.sessionDate} {session.sessionTime}
                      {" — Lab: "} {session.computerLab.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>

        {/* ------------------- Computer Map ------------------- */}
        {selectedLabId && (
          <Card>
            <CardHeader>
              <CardTitle>
                Select a Computer in {selectedSession?.computerLab.description}
              </CardTitle>
              {selectedComputer && (
                <p className="text-sm text-blue-500 font-medium">Selected: **{selectedComputer.name}**</p>
              )}
            </CardHeader>
            <CardContent>
              {(computersLoading || bookingStatus === "submitting") && <p className="text-center">Loading computer map or submitting booking...</p>}
              
              {/* Show any error from computers or booking status fetch */}
              {computersError && (
                <Alert variant="destructive">
                  <AlertTitle>Error Loading Map</AlertTitle>
                  <AlertDescription>{computersError}</AlertDescription>
                </Alert>
              )}

              {computers.length > 0 && (
                <LabMap
                  computers={computers}
                  bookedComputerNumbers={bookedComputerNumbers}
                  onSelectComputer={setSelectedComputer}
                  selectedComputerNumber={
                    selectedComputer ? getComputerNumber(selectedComputer.name) : null
                  }
                />
              )}

              {!computersLoading && !computersError && computers.length === 0 && (
                <p className="text-center text-muted-foreground">No computers found for this lab.</p>
              )}
              
              {/* Add legend for map */}
              <div className="flex justify-center space-x-4 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center"><CircleCheck className="h-4 w-4 text-green-500 mr-2" /> Available</div>
                <div className="flex items-center"><CircleX className="h-4 w-4 text-red-500 mr-2" /> Booked</div>
                <div className="flex items-center"><Wrench className="h-4 w-4 text-gray-400 mr-2" /> Not Working</div>
              </div>
            </CardContent>
          </Card>
        )}

      </div> {/* End of space-y-4 container */}

      {/* ------------------- Booking Button ------------------- */}
      {/* **Change:** Moved this div outside the space-y-4 container to control its top margin specifically */}
      <div className="flex flex-col items-left space-y-4 mt-4"> 
        <Button 
          onClick={handleBooking} 
          disabled={isBookingDisabled} 
          size="lg" 
          className="w-full max-w-xs"
        >
          {bookingStatus === "submitting" ? "Submitting..." : "Book Selected Computer"}
        </Button>

        {bookingStatus === "success" && (
          <Alert className="max-w-2xl bg-green-50 border-green-200 text-green-700">
            <AlertTitle>✅ Success!</AlertTitle>
            <AlertDescription>Your computer ({selectedComputer?.name || 'N/A'}) has been successfully booked! The map will refresh shortly.</AlertDescription>
          </Alert>
        )}

        {bookingStatus === "error" && (
          <Alert variant="destructive" className="max-w-2xl">
            <AlertTitle>Booking Failed</AlertTitle>
            <AlertDescription>{bookingError}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}