"use client";

import { useState, useMemo } from "react";
import { format, isWithinInterval } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

// All necessary imports for the component to function correctly
import { PlusCircle, Calendar as CalendarIcon, Edit, Trash2, ArrowUpDown } from "lucide-react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";


// --- 1. Data and Types ---
interface Lab {
  name: string;
  id: string;
  computers: number;
  not_working_computers: number[];
}

type CreaterRole = "Lecturer" | "Admin";

interface SessionScheduling {
  id: string;
  labId: string;
  title: string;
  creater: string;
  createrRole: CreaterRole;
  date: Date;
  startTime: string;
  endTime: string;
}

const labs: Lab[] = [
  { name: "Lab A1", id: "lab-a1", computers: 20, not_working_computers: [5, 12] },
  { name: "Lab B2", id: "lab-b2", computers: 25, not_working_computers: [10] },
  { name: "Lab C3", id: "lab-c3", computers: 15, not_working_computers: [] },
];

const initialSchedulings: SessionScheduling[] = [
  {
    id: "1",
    labId: "lab-a1",
    title: "Intro to Python Workshop",
    creater: "Jane Smith",
    createrRole: "Lecturer",
    date: new Date(2025, 8, 5), // Past booking
    startTime: "10:00",
    endTime: "12:00"
  },
  {
    id: "2",
    labId: "lab-b2",
    title: "Database Management Class",
    creater: "John Doe",
    createrRole: "Admin",
    date: new Date(2025, 9, 17), // Future booking
    startTime: "14:00",
    endTime: "16:00"
  },
  {
    id: "4",
    labId: "lab-c3",
    title: "Data Science Class",
    creater: "David Wilson",
    createrRole: "Lecturer",
    date: new Date(2025, 9, 15), // Future booking
    startTime: "09:00",
    endTime: "11:00"
  },
  {
    id: "5",
    labId: "lab-a1",
    title: "Web Dev Fundamentals",
    creater: "David Wilson",
    createrRole: "Lecturer",
    date: new Date(2025, 8, 12),
    startTime: "16:00",
    endTime: "18:00"
  },
  {
    id: "6",
    labId: "lab-b2",
    title: "Advanced AI",
    creater: "Jane Smith",
    createrRole: "Lecturer",
    date: new Date(2025, 8, 10),
    startTime: "09:00",
    endTime: "11:00"
  },
  {
    id: "7",
    labId: "lab-c3",
    title: "Network Security Lab",
    creater: "Peter Jones",
    createrRole: "Admin",
    date: new Date(2025, 8, 8),
    startTime: "11:00",
    endTime: "13:00"
  },
];


// --- Main Component ---
export function Scheduling() {
    
  const [schedulings, setSchedulings] = useState<SessionScheduling[]>(initialSchedulings);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filterRole, setFilterRole] = useState<CreaterRole | "All">("All");
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentScheduling, setCurrentScheduling] = useState<Omit<SessionScheduling, 'id'> & { id?: string } | null>(null);
  const [selectedSession, setSelectedSession] = useState<SessionScheduling | null>(null);

  const handleOpenDialog = (booking?: SessionScheduling) => {
    if (booking) {
      setCurrentScheduling(booking);
      setIsEditMode(true);
    } else {
      setCurrentScheduling({
        labId: labs[0].id,
        title: "",
        creater: "",
        createrRole: "Admin",
        date: selectedDate || new Date(),
        startTime: "",
        endTime: ""
      });
      setIsEditMode(false);
    }
    setIsDialogOpen(true);
  };

  const handleSaveSession = () => {
    if (!currentScheduling) return;
    
    if (isEditMode && currentScheduling.id) {
      setSchedulings(schedulings.map(b => b.id === currentScheduling.id ? { ...currentScheduling, id: b.id } as SessionScheduling : b));
    } else {
      const newScheduling: SessionScheduling = { ...currentScheduling, id: Date.now().toString() } as SessionScheduling;
      setSchedulings([...schedulings, newScheduling]);
    }
    setIsDialogOpen(false);
  };

  const handleDeleteSession = (id: string) => {
    setSchedulings(schedulings.filter(b => b.id !== id));
    if (selectedSession?.id === id) {
        setSelectedSession(null);
    }
  };
  
  const dailySchedulings = useMemo(() => {
    if (!selectedDate) return [];
    
    let filteredSchedulings = schedulings.filter(b => b.date.toDateString() === selectedDate.toDateString());
    
    if (filterRole !== "All") {
      filteredSchedulings = filteredSchedulings.filter(b => b.createrRole === filterRole);
    }

    return filteredSchedulings.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [schedulings, selectedDate, filterRole]);
  
  const pastSchedulings = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return schedulings
      .filter(b => b.date < today)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [schedulings]);
  
    // --- Table Setup for Booking History ---

  const historyColumns: ColumnDef<SessionScheduling>[] = [
  { 
    accessorKey: "title", 
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Session
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="pl-4">{row.original.title}</div>
  },
  { 
    accessorKey: "creater", 
    header: "Created By" 
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => format(row.original.date, "PPP"),
  },
  { accessorKey: "startTime", header: "Time" },
  {
    accessorKey: "labId",
    header: "Lab", // Filter option has been removed
    cell: ({ row }) => labs.find(l => l.id === row.original.labId)?.name,
  },
];
  
  const historyTable = useReactTable({
    data: pastSchedulings,
    columns: historyColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="p-4 sm:p-6 space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold">Session Scheduling</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">

        {/* Calendar View */}
        <Card className="lg:col-span-1 xl:col-span-2">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <CardTitle>Schedule Sessions</CardTitle>
            <div className="flex flex-col sm:flex-row items-start sm:items-center mt-4 sm:mt-0 space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="filter-role">Filter by:</Label>
                <Select value={filterRole} onValueChange={setFilterRole as (value: string) => void}>
                  <SelectTrigger id="filter-role" className="w-[150px]">
                    <SelectValue placeholder="All Sessions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Sessions</SelectItem>
                    <SelectItem value="Lecturer">Lecturer</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {filterRole === "Admin" && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => handleOpenDialog()}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Create Session
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>{isEditMode ? "Edit Session" : "Create a New Session"}</DialogTitle>
                      <DialogDescription>
                        Fill in the details for the lab session.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="sm:text-right">Event Title</Label>
                        <Input id="title" value={currentScheduling?.title || ""} onChange={e => setCurrentScheduling(s => s ? { ...s, title: e.target.value } : null)} className="sm:col-span-3" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                        <Label htmlFor="creater" className="sm:text-right">Creater</Label>
                        <Input id="creater" value={currentScheduling?.creater || ""} onChange={e => setCurrentScheduling(s => s ? { ...s, creater: e.target.value } : null)} className="sm:col-span-3" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                        <Label htmlFor="lab" className="sm:text-right">Lab</Label>
                        <Select value={currentScheduling?.labId || ""} onValueChange={value => setCurrentScheduling(s => s ? { ...s, labId: value } : null)}>
                          <SelectTrigger className="sm:col-span-3">
                            <SelectValue placeholder="Select a lab" />
                          </SelectTrigger>
                          <SelectContent>
                            {labs.map(lab => <SelectItem key={lab.id} value={lab.id}>{lab.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="sm:text-right">Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal sm:col-span-3",
                                !currentScheduling?.date && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {currentScheduling?.date ? format(currentScheduling.date, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <DayPicker
                              mode="single"
                              selected={currentScheduling?.date}
                              onSelect={(day) => setCurrentScheduling(s => s ? { ...s, date: day as Date } : null)}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                        <Label htmlFor="start-time" className="sm:text-right">Time</Label>
                        <div className="flex sm:col-span-3 space-x-2">
                          <Input id="start-time" type="time" value={currentScheduling?.startTime || ""} onChange={e => setCurrentScheduling(s => s ? { ...s, startTime: e.target.value } : null)} />
                          <span className="self-center">-</span>
                          <Input id="end-time" type="time" value={currentScheduling?.endTime || ""} onChange={e => setCurrentScheduling(s => s ? { ...s, endTime: e.target.value } : null)} />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleSaveSession}>{isEditMode ? "Save Changes" : "Create Session"}</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="w-full">
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  modifiers={{ booked: schedulings.map(b => b.date) }}
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
              <div className="col-span-1 space-y-4">
                <h3 className="text-lg font-semibold">Sessions for {format(selectedDate || new Date(), "PPP")}</h3>
                {dailySchedulings.length > 0 ? (
                  dailySchedulings.map(booking => (
                    <Card
                      key={booking.id}
                      className={cn("p-4 transition-all hover:bg-gray-50 cursor-pointer", selectedSession?.id === booking.id && "border-2 border-blue-500")}
                      onClick={() => setSelectedSession(booking)}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                        <div>
                          <p className="font-medium">{booking.title}</p>
                          <p className="text-sm text-gray-500">Lab: {labs.find(l => l.id === booking.labId)?.name}</p>
                          <p className="text-sm text-gray-500">Created by: {booking.creater} <Badge variant="secondary">{booking.createrRole}</Badge></p>
                          <p className="text-sm text-gray-500">Time: {booking.startTime} - {booking.endTime}</p>
                        </div>
                        <div className="flex space-x-2 mt-2 sm:mt-0">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(booking)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteSession(booking.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-gray-500">No sessions for this date.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Updated: All Booking History */}
      <Card className="mt-8">
        <CardHeader className="mb-0">
          <CardTitle>Lab Session History</CardTitle>
        </CardHeader>
        <CardContent className="mt-0">
          <div className="flex items-center py-4 mt-0">
            <Input
              placeholder="Search by creater..."
              value={(historyTable.getColumn("creater")?.getFilterValue() as string) ?? ""}
              onChange={(event) => historyTable.getColumn("creater")?.setFilterValue(event.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                {historyTable.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
                    <TableCell colSpan={historyColumns.length} className="h-24 text-center">
                      No past sessions found.
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