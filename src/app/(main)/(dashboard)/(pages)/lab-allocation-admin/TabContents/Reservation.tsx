"use client";

import { useState, useMemo } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { PlusCircle, Calendar as CalendarIcon, Check, X, Pencil, Trash2, Wrench, CircleCheck, CircleX } from "lucide-react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
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

// --- 1. Data and Types ---
type BookingStatus = "pending" | "approved" | "denied";

interface Booking {
  id: string;
  lab: string;
  title: string;
  booker: string;
  date: Date;
  time: string;
  status: BookingStatus;
  computer_no: number;
}

interface Lab {
  name: string;
  id: string;
  computers: number;
  not_working_computers: number[];
}

const labs: Lab[] = [
  { name: "Lab A1", id: "lab-a1", computers: 20, not_working_computers: [5, 12] },
  { name: "Lab B2", id: "lab-b2", computers: 25, not_working_computers: [10] },
  { name: "Lab C3", id: "lab-c3", computers: 15, not_working_computers: [] },
];

const initialBookings: Booking[] = [
  {
    id: "1",
    lab: "Lab A1",
    title: "Intro to Python Workshop",
    booker: "Jane Smith",
    date: new Date(2025, 9, 15, 10),
    time: "10:00 AM - 12:00 PM",
    status: "approved",
    computer_no: 1,
  },
  {
    id: "2",
    lab: "Lab B2",
    title: "Database Management Class",
    booker: "John Doe",
    date: new Date(2025, 9, 17, 14),
    time: "02:00 PM - 04:00 PM",
    status: "pending",
    computer_no: 2,
  },
  {
    id: "3",
    lab: "Lab A1",
    title: "Individual Study Session",
    booker: "Alice Brown",
    date: new Date(2025, 9, 15, 13),
    time: "01:00 PM - 03:00 PM",
    status: "pending",
    computer_no: 3,
  },
  {
    id: "4",
    lab: "Lab C3",
    title: "Machine Learning Lab",
    booker: "David Wilson",
    date: new Date(2025, 9, 10, 9),
    time: "09:00 AM - 11:00 AM",
    status: "approved",
    computer_no: 4,
  },
];

// --- New Component for Lab Map ---
const LabMap = ({ lab, bookedComputers }: { lab: Lab; bookedComputers: number[] }) => {
  const computerArray = useMemo(() => {
    return Array.from({ length: lab.computers }, (_, i) => i + 1);
  }, [lab.computers]);

  const getComputerStatus = (computerId: number) => {
    if (lab.not_working_computers.includes(computerId)) {
      return "not_working";
    }
    if (bookedComputers.includes(computerId)) {
      return "booked";
    }
    return "available";
  };

  return (
    <div className="grid grid-cols-5 gap-2 p-4 border rounded-md">
      {computerArray.map(computerId => {
        const status = getComputerStatus(computerId);
        const color = status === "available" ? "bg-green-500" : status === "booked" ? "bg-red-500" : "bg-gray-400";
        const icon = status === "available" ? <CircleCheck className="h-4 w-4" /> : status === "booked" ? <CircleX className="h-4 w-4" /> : <Wrench className="h-4 w-4" />;
        const tooltip = status === "available" ? "Available" : status === "booked" ? "Booked" : "Not Working";
        return (
          <div
            key={computerId}
            className={cn(
              "h-10 w-10 border rounded-md flex flex-col items-center justify-center font-bold text-xs text-white",
              color
            )}
            title={`Computer ${computerId} - ${tooltip}`}
          >
            {icon}
            <span>{computerId}</span>
          </div>
        );
      })}
    </div>
  );
};

// --- 2. Main Component ---
export function Reservation() {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Omit<Booking, 'id'> & { id?: string } | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedLab, setSelectedLab] = useState<string>(labs[0].name);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const handleOpenDialog = (booking?: Booking) => {
    if (booking) {
      setSelectedBooking(booking);
      setIsEditMode(true);
    } else {
      setSelectedBooking({
        lab: labs[0].name,
        title: "",
        booker: "",
        date: new Date(),
        time: "10:00 AM - 11:00 AM",
        status: "pending",
        computer_no: 1, // Default computer number
      });
      setIsEditMode(false);
    }
    setIsDialogOpen(true);
  };

  const handleSaveBooking = () => {
    if (!selectedBooking) return;
    if (isEditMode && selectedBooking.id) {
      setBookings(bookings.map(b => b.id === selectedBooking.id ? selectedBooking as Booking : b));
    } else {
      const newBooking: Booking = { ...selectedBooking, id: Date.now().toString(), date: selectedBooking.date || new Date() } as Booking;
      setBookings([...bookings, newBooking]);
    }
    setIsDialogOpen(false);
  };

  const handleDeleteBooking = (id: string) => {
    setBookings(bookings.filter(b => b.id !== id));
  };

  const handleApproveDeny = (id: string, status: BookingStatus) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
  };

  // --- Filtered Data for Components ---
  const pendingBookings = useMemo(() => {
    return bookings.filter(b => b.status === "pending").sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [bookings]);

  const dailyBookings = useMemo(() => {
    if (!selectedDate) return [];
    return bookings.filter(b => b.date.toDateString() === selectedDate.toDateString()).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [bookings, selectedDate]);

  const allBookings = useMemo(() => {
    return bookings.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [bookings]);

  const currentLab = labs.find(l => l.name === selectedLab)!;

  // Get all approved sessions for the selected lab & date
  const sessionsForLabAndDate = dailyBookings.filter(
    (b) => b.lab === selectedLab && b.status === "approved"
  );

  const selectedSession = sessionsForLabAndDate.find(
    (b) => b.id === selectedSessionId
  ) ?? sessionsForLabAndDate[0];

  // The computers booked for the selected session
  const bookedComputersForSession = selectedSession
    ? [selectedSession.computer_no]
    : [];

  // --- Table Columns ---
  const bookingHistoryColumns: ColumnDef<Booking>[] = [
    { accessorKey: "title", header: "Event" },
    { accessorKey: "lab", header: "Lab" },
    { accessorKey: "booker", header: "Booked By" },
    { accessorKey: "computer_no", header: "Computer No." },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => format(row.original.date, "PPP"),
    },
    { accessorKey: "time", header: "Time" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const color = status === "approved" ? "bg-green-500" : status === "denied" ? "bg-red-500" : "bg-yellow-500";
        return <Badge className={cn("text-white", color)}>{status}</Badge>;
      },
    },
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

  const approvalQueueColumns: ColumnDef<Booking>[] = [
    { accessorKey: "title", header: "Event" },
    { accessorKey: "lab", header: "Lab" },
    { accessorKey: "booker", header: "Booked By" },
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleApproveDeny(row.original.id, "approved")}
          >
            <Check className="mr-2 h-4 w-4" /> Approve
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleApproveDeny(row.original.id, "denied")}
          >
            <X className="mr-2 h-4 w-4" /> Deny
          </Button>
        </div>
      ),
    },
  ];

  // --- Table Instances ---
  const approvalTable = useReactTable({
    data: pendingBookings,
    columns: approvalQueueColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const historyTable = useReactTable({
    data: allBookings,
    columns: bookingHistoryColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-4 sm:p-6 space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold">Lab Reservation</h1>

      {/* Booking and Approval */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking System */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <CardTitle>Lab Booking Calendar</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()} className="mt-4 sm:mt-0">
                  <PlusCircle className="mr-2 h-4 w-4" /> New Booking
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{isEditMode ? "Edit Booking" : "Create a New Booking"}</DialogTitle>
                  <DialogDescription>
                    Fill in the details for the lab session.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="sm:text-right">Event Title</Label>
                    <Input id="title" value={selectedBooking?.title} onChange={e => setSelectedBooking(s => s ? { ...s, title: e.target.value } : null)} className="sm:col-span-3" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="booker" className="sm:text-right">Booker</Label>
                    <Input id="booker" value={selectedBooking?.booker} onChange={e => setSelectedBooking(s => s ? { ...s, booker: e.target.value } : null)} className="sm:col-span-3" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="lab" className="sm:text-right">Lab</Label>
                    <Select value={selectedBooking?.lab} onValueChange={value => setSelectedBooking(s => s ? { ...s, lab: value } : null)}>
                      <SelectTrigger className="sm:col-span-3">
                        <SelectValue placeholder="Select a lab" />
                      </SelectTrigger>
                      <SelectContent>
                        {labs.map(lab => <SelectItem key={lab.id} value={lab.name}>{lab.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="computer_no" className="sm:text-right">Computer No.</Label>
                    <Input
                      id="computer_no"
                      type="number"
                      value={selectedBooking?.computer_no}
                      onChange={e => setSelectedBooking(s => s ? { ...s, computer_no: parseInt(e.target.value) } : null)}
                      className="sm:col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="sm:text-right">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal sm:col-span-3",
                            !selectedBooking?.date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedBooking?.date ? format(selectedBooking.date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <DayPicker
                          mode="single"
                          selected={selectedBooking?.date}
                          onSelect={(day) => setSelectedBooking(s => s ? { ...s, date: day as Date } : null)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="time" className="sm:text-right">Time</Label>
                    <Input id="time" value={selectedBooking?.time} onChange={e => setSelectedBooking(s => s ? { ...s, time: e.target.value } : null)} className="sm:col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleSaveBooking}>{isEditMode ? "Save changes" : "Create booking"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              <div className="w-full">
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  modifiers={{ booked: dailyBookings.map(b => b.date) }}
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
              </div>
              <div className="col-span-1 lg:col-span-2 xl:col-span-2 space-y-4 ml-30">
                <h3 className="text-lg font-semibold">Bookings for {format(selectedDate || new Date(), "PPP")}</h3>
                {dailyBookings.length > 0 ? (
                  dailyBookings.map(booking => (
                    <Card key={booking.id} className="p-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                        <div>
                          <p className="font-medium">{booking.title}</p>
                          <p className="text-sm text-gray-500">Lab: {booking.lab} | {booking.time} | Computer: {booking.computer_no}</p>
                          <p className="text-sm text-gray-500">Booked by: {booking.booker}</p>
                        </div>
                        <Badge className={cn("text-white mt-2 sm:mt-0", booking.status === "approved" ? "bg-green-500" : booking.status === "denied" ? "bg-red-500" : "bg-yellow-500")}>{booking.status}</Badge>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-gray-500">No bookings for this date.</p>
                )}
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-semibold">Lab Availability Map</h3>
              <div className="flex space-x-4 mb-2">
                {labs.map(lab => (
                  <Button
                    key={lab.id}
                    variant={selectedLab === lab.name ? "default" : "outline"}
                    onClick={() => {
                      setSelectedLab(lab.name);
                      setSelectedSessionId(null); // reset session when lab changes
                    }}
                  >
                    {lab.name}
                  </Button>
                ))}
              </div>
              {sessionsForLabAndDate.length > 0 && (
                <div className="mb-2 flex gap-2 flex-wrap">
                  <Label>Select Session:</Label>
                  <Select
                    value={selectedSessionId || sessionsForLabAndDate[0].id}
                    onValueChange={setSelectedSessionId}
                  >
                    <SelectTrigger className="w-60">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sessionsForLabAndDate.map((s) => (
                        <SelectItem value={s.id} key={s.id}>
                          {s.title} ({s.time}) [{s.booker}]
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Card>
                <CardContent className="p-4">
                  <LabMap lab={currentLab} bookedComputers={bookedComputersForSession} />
                </CardContent>
              </Card>
            </div>

          </CardContent>
        </Card>

        {/* Approval Queue */}
        <Card>
          <CardHeader>
            <CardTitle>Approval Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  {approvalTable.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {approvalTable.getRowModel().rows.length ? (
                    approvalTable.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={approvalQueueColumns.length} className="h-24 text-center">
                        No pending requests.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Booking History */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Booking History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                {historyTable.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
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
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={bookingHistoryColumns.length} className="h-24 text-center">
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