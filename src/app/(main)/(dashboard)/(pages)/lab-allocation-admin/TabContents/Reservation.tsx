"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { PlusCircle, Calendar as CalendarIcon, Pencil, Trash2, Wrench, CircleCheck, CircleX } from "lucide-react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { cn } from "@/lib/utils";

// --- Import Lab Service and LabDto Type ---
import { retrieveAllLabs, LabDto } from '@/services/api/ComputerLabs/retrieve_all_labs'; 

// --- Import UI Components ---
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


// --- Mock Booking Data (Until API is connected) ---

/** Interface for a single booking entry displayed in the table. */
interface Booking {
  id: string;
  lab: string;
  title: string;
  booker: string;
  date: Date;
  time: string;
  computer_no: number; 
}

const initialBookings: Booking[] = [
  { id: "1", lab: "Lab A1", title: "Intro to React Workshop", booker: "Jane Smith", date: new Date(2025, 10, 24), time: "10:00 AM - 12:00 PM", computer_no: 1 },
  { id: "2", lab: "Lab A1", title: "Debugging Session", booker: "John Doe", date: new Date(2025, 10, 24), time: "02:00 PM - 04:00 PM", computer_no: 8 },
  { id: "3", lab: "Lab B2", title: "Network Configuration", booker: "Alice Brown", date: new Date(2025, 10, 25), time: "01:00 PM - 03:00 PM", computer_no: 10 },
  { id: "4", lab: "Lab C3", title: "Machine Learning Lab", booker: "David Wilson", date: new Date(2025, 10, 26), time: "09:00 AM - 11:00 AM", computer_no: 4 },
];

// --- Sub-Component: Lab Map Visualization ---
interface LabMapProps {
  lab: LabDto | undefined;
  bookedComputers: number[]; 
}

const LabMap = ({ lab, bookedComputers }: LabMapProps) => {
  if (!lab) return <p className="text-center text-gray-500 py-8">Select a lab above to view its availability map.</p>;
  
  // Mock disabled computer IDs 
  const notWorkingComputers: number[] = useMemo(() => {
    const disabledMap: { [key: string]: number[] } = {
      "Lab A1": [5, 12], 
      "Lab B2": [25], 
      "Lab C3": [], 
    };
    return disabledMap[lab.name] || [];
  }, [lab.name]);

  const computerArray = useMemo(() => {
    return Array.from({ length: lab.capacity }, (_, i) => i + 1);
  }, [lab.capacity]);

  const getComputerStatus = (computerId: number) => {
    if (notWorkingComputers.includes(computerId)) {
      return "not_working";
    }
    if (bookedComputers.includes(computerId)) {
      return "booked";
    }
    return "available";
  };

  return (
    <div className="p-4 bg-gray-900 rounded-md border border-gray-700">
      <div className="grid grid-cols-5 gap-3">
        {computerArray.map(computerId => {
          const status = getComputerStatus(computerId);
          const color = status === "available" ? "bg-green-600 hover:bg-green-700" : status === "booked" ? "bg-red-600" : "bg-gray-500";
          const icon = status === "available" ? <CircleCheck className="h-4 w-4" /> : status === "booked" ? <CircleX className="h-4 w-4" /> : <Wrench className="h-4 w-4" />;
          const tooltip = status === "available" ? "Available" : status === "booked" ? "Booked" : "Not Working";
          
          return (
            <div
              key={computerId}
              className={cn(
                "h-14 w-14 sm:h-16 sm:w-16 border rounded-lg flex flex-col items-center justify-center font-bold text-xs text-white shadow-lg transition-colors",
                color,
                status !== "available" ? "cursor-not-allowed" : "cursor-pointer"
              )}
              title={`Computer ${computerId} - ${tooltip}`}
            >
              {icon}
              <span className="mt-1 text-sm">{computerId}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex justify-around text-xs text-gray-300">
        <span className="flex items-center"><CircleCheck className="h-3 w-3 text-green-500 mr-1" /> Available</span>
        <span className="flex items-center"><CircleX className="h-3 w-3 text-red-500 mr-1" /> Booked</span>
        <span className="flex items-center"><Wrench className="h-3 w-3 text-gray-400 mr-1" /> Not Working</span>
      </div>
    </div>
  );
};


// --- Main Component: Reservation ---

export function Reservation() {
  const [labs, setLabs] = useState<LabDto[]>([]);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [isLoadingLabs, setIsLoadingLabs] = useState(true);
  const [labsError, setLabsError] = useState<string | null>(null);

  // States for Dialog/Form
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Omit<Booking, 'id'> & { id?: string } | null>(null);

  // States for Map Filtering
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  // Use 'undefined' for "All Labs" state
  const [selectedLabName, setSelectedLabName] = useState<string | undefined>(undefined); 
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null); 

  // --- Data Fetch: Labs (Using the actual service) ---
  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const fetchedLabs = await retrieveAllLabs(); 
        setLabs(fetchedLabs);
        if (fetchedLabs.length > 0) {
          // Set initial selection to the first lab for immediate map view
          setSelectedLabName(fetchedLabs[0].name); 
        } else {
          // If no labs are returned, default to "All Labs" (undefined)
          setSelectedLabName(undefined);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to load computer labs due to an unexpected error.";
        setLabsError(errorMessage);
        console.error("Failed to load computer labs:", error);
      } finally {
        setIsLoadingLabs(false);
      }
    };
    fetchLabs();
  }, []);

  // --- Handlers for CRUD Operations (Mocked) ---
  
  const handleOpenDialog = (booking?: Booking) => {
    if (labs.length === 0 && !isLoadingLabs) {
        setLabsError("Cannot create a booking: No labs are available.");
        return;
    }
    
    const defaultLabName = labs[0]?.name;
    
    if (booking) {
      setSelectedBooking(booking);
      setIsEditMode(true);
      setSelectedLabName(booking.lab); 
    } else {
      setSelectedBooking({
        lab: defaultLabName || "",
        title: "",
        booker: "",
        date: selectedDate || new Date(), 
        time: "10:00 AM - 11:00 AM",
        computer_no: 1, 
      });
      setIsEditMode(false);
    }
    setIsDialogOpen(true);
  };

  const handleSaveBooking = () => {
    if (!selectedBooking?.title || !selectedBooking.booker || !selectedBooking.lab || !selectedBooking.computer_no) {
      alert("Please fill in all required fields.");
      return;
    }
    
    const targetLab = labs.find(l => l.name === selectedBooking.lab);
    if (targetLab && selectedBooking.computer_no > targetLab.capacity) {
        alert(`Computer number ${selectedBooking.computer_no} exceeds the capacity of ${targetLab.name} (${targetLab.capacity}).`);
        return;
    }

    if (isEditMode && selectedBooking.id) {
      setBookings(bookings.map(b => b.id === selectedBooking.id ? selectedBooking as Booking : b));
    } else {
      const newBooking: Booking = { 
        ...selectedBooking, 
        id: Date.now().toString(), 
        date: selectedBooking.date || new Date() 
      } as Booking;
      setBookings([...bookings, newBooking]);
    }
    setIsDialogOpen(false);
    setSelectedSessionId(selectedBooking.id || null);
  };

  const handleDeleteBooking = (id: string) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      setBookings(bookings.filter(b => b.id !== id));
      setSelectedSessionId(null);
    }
  };

  // --- Data Derived from State (Memoized for performance) ---

  const dailyBookings = useMemo(() => {
    if (!selectedDate) return [];
    return bookings
      .filter(b => b.date.toDateString() === selectedDate.toDateString())
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [bookings, selectedDate]);

  const currentLab = labs.find(l => l.name === selectedLabName);

  const sessionsForLabAndDate = dailyBookings.filter(
    (b) => b.lab === currentLab?.name
  );

  const selectedSession = selectedSessionId 
    ? sessionsForLabAndDate.find(b => b.id === selectedSessionId) 
    : sessionsForLabAndDate[0]; 

  const bookedComputersForSession = selectedSession
    ? [selectedSession.computer_no] 
    : dailyBookings.filter(b => b.lab === currentLab?.name).map(b => b.computer_no); 

  // --- Table Columns for History ---
  const bookingHistoryColumns: ColumnDef<Booking>[] = [
    { accessorKey: "title", header: "Session Name" },
    { accessorKey: "lab", header: "Lab" },
    { accessorKey: "booker", header: "Student ID" },
    { accessorKey: "computer_no", header: "Computer No." },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => format(row.original.date, "PPP"),
    },
    { accessorKey: "time", header: "Time" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(row.original)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDeleteBooking(row.original.id)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  // --- Table Instance ---
  const historyTable = useReactTable({
    data: bookings.sort((a, b) => b.date.getTime() - a.date.getTime()),
    columns: bookingHistoryColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  // --- Render Status ---

  if (isLoadingLabs) {
    return <div className="p-6 text-center text-xl text-gray-400">Loading lab data...</div>;
  }
  
  return (
    <div className="p-4 sm:p-6 space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold">🧪 Lab Reservation Management</h1>

      {labsError && (
        <Alert variant="destructive">
            <AlertTitle>Error Loading Labs</AlertTitle>
            <AlertDescription>{labsError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ----------------------------------- 1. Calendar and Daily Bookings ----------------------------------- */}
        <Card className="lg:col-span-1 bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle>Calendar View</CardTitle>
          </CardHeader>
          <CardContent>
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={{ booked: bookings.map(b => b.date) }}
              modifiersStyles={{
                booked: {
                  backgroundColor: "#f59e0b",
                  color: "white",
                  fontWeight: "bold",
                  borderRadius: "50%",
                },
                selected: {
                  backgroundColor: "#10b981",
                },
              }}
            />
            
            <h3 className="text-lg font-semibold mt-6 mb-2">
              Bookings for {format(selectedDate || new Date(), "PPP")}
            </h3>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {dailyBookings.length > 0 ? (
                dailyBookings.map(booking => (
                  <div
                    key={booking.id}
                    className={cn(
                        "p-3 rounded-md border cursor-pointer transition-colors",
                        selectedSessionId === booking.id ? "bg-blue-600 border-blue-600 text-white" : "bg-gray-800 border-gray-700 hover:bg-gray-700"
                    )}
                    onClick={() => {
                        setSelectedLabName(booking.lab); 
                        setSelectedSessionId(booking.id); 
                    }}
                  >
                    <p className="font-medium text-sm">{booking.title}</p>
                    <p className="text-xs">{booking.lab} | {booking.time}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No bookings for this date.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ----------------------------------- 2. Lab Availability Map ----------------------------------- */}
        <Card className="lg:col-span-2 bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Lab Availability Map</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button onClick={() => handleOpenDialog()} disabled={labs.length === 0}>
                        <PlusCircle className="mr-2 h-4 w-4" /> New Booking
                    </Button>
                </DialogTrigger>
                
                <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-700">
                    <DialogHeader>
                        <DialogTitle>{isEditMode ? "Edit Booking" : "Create a New Booking"}</DialogTitle>
                        <DialogDescription>Fill in the details for the lab session.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">Event Title</Label>
                            <Input 
                                id="title" 
                                value={selectedBooking?.title || ""} 
                                onChange={e => setSelectedBooking(s => s ? { ...s, title: e.target.value } : null)} 
                                className="col-span-3 bg-gray-800 border-gray-600" 
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="lab" className="text-right">Lab</Label>
                            <Select 
                                value={selectedBooking?.lab} 
                                onValueChange={value => setSelectedBooking(s => s ? { ...s, lab: value } : null)}
                            >
                                <SelectTrigger className="col-span-3 bg-gray-800 border-gray-600">
                                    <SelectValue placeholder="Select a lab" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-600">
                                    {labs.map(lab => <SelectItem key={lab.id} value={lab.name}>{lab.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="computer_no" className="text-right">Computer No.</Label>
                            <Input
                                id="computer_no"
                                type="number"
                                min={1}
                                max={labs.find(l => l.name === selectedBooking?.lab)?.capacity || 30}
                                value={selectedBooking?.computer_no}
                                onChange={e => {
                                    const val = parseInt(e.target.value);
                                    if (!isNaN(val) && val > 0) {
                                      setSelectedBooking(s => s ? { ...s, computer_no: val } : null)
                                    }
                                }}
                                className="col-span-3 bg-gray-800 border-gray-600"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="date" className="text-right">Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal col-span-3 bg-gray-800 border-gray-600",
                                            !selectedBooking?.date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {selectedBooking?.date ? format(selectedBooking.date, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-gray-900 border-gray-700">
                                    <DayPicker
                                        mode="single"
                                        selected={selectedBooking?.date}
                                        onSelect={(day) => setSelectedBooking(s => s ? { ...s, date: day as Date } : null)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="booker" className="text-right">Booked By</Label>
                            <Input 
                                id="booker" 
                                value={selectedBooking?.booker || ""} 
                                onChange={e => setSelectedBooking(s => s ? { ...s, booker: e.target.value } : null)} 
                                className="col-span-3 bg-gray-800 border-gray-600" 
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSaveBooking}>{isEditMode ? "Save changes" : "Create booking"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
                <Label htmlFor="lab-select" className="text-sm font-semibold">Select Lab:</Label>
                {/* --- Lab Selection Dropdown (Select Component) --- */}
                <Select
                    value={selectedLabName}
                    onValueChange={value => {
                        // Set selectedLabName to undefined if "all-labs" is selected
                        setSelectedLabName(value === "all-labs" ? undefined : value);
                        setSelectedSessionId(null); 
                    }}
                >
                    <SelectTrigger id="lab-select" className="w-[180px] bg-gray-800 border-gray-700">
                        <SelectValue placeholder="Select a Lab" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="all-labs">All Labs</SelectItem>
                        {labs.map(lab => (
                            <SelectItem key={lab.id} value={lab.name}>
                                {lab.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            
            {/* Session selection dropdown only appears if a specific lab is selected */}
            {selectedLabName && sessionsForLabAndDate.length > 0 && ( 
                <div className="flex items-center gap-2">
                    <Label className="text-sm">Viewing Session:</Label>
                    <Select
                        value={selectedSession?.id || sessionsForLabAndDate[0].id}
                        onValueChange={setSelectedSessionId}
                    >
                        <SelectTrigger className="w-[200px] bg-gray-800 border-gray-700">
                            <SelectValue placeholder="Select a specific session" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                            {sessionsForLabAndDate.map((s) => (
                                <SelectItem value={s.id} key={s.id}>
                                    {s.title} ({s.time})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
            
            <LabMap 
                lab={currentLab} 
                bookedComputers={selectedLabName ? bookedComputersForSession : []} 
            />
          </CardContent>
        </Card>
      </div>
      
      {/* ----------------------------------- 3. Booking History Table ----------------------------------- */}
      <Card className="mt-8 bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle>Booking History (All Sessions)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border border-gray-700">
            <Table>
              <TableHeader className="bg-gray-800">
                {historyTable.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="hover:bg-gray-700">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {historyTable.getRowModel().rows.length ? (
                  historyTable.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="hover:bg-gray-800/50 transition-colors">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={bookingHistoryColumns.length} className="h-24 text-center text-gray-500">
                      No booking history found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}