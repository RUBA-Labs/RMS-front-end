"use client";

import { useState, useMemo, useEffect } from "react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

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

// API Imports
import { retrieveAllLabs, LabDto } from "@/services/api/ComputerLabs/retrieve_all_labs";
import { createLabSession, CreateLabSessionPayload, CreateLabSessionResponse } from "@/services/api/LabSessions/create_lab_session";
import { retrieveAllLabSessions, LabSessionDto } from "@/services/api/LabSessions/retrieve_all_lab_sessions";

/* --- 1. Data and Types --- */
export type Lab = LabDto;
type CreaterRole = "Lecturer" | "Admin";

/**
 * The unified local state type for a scheduled session. 
 */
export interface SessionScheduling {
    id: string; // The session ID from the backend (LabSessionDto.sessionId)
    labId: string;
    title: string; // Maps to LabSessionDto.sessionName
    lecturer: string;
    description: string;
    createrRole: CreaterRole;
    date: Date; // Converted from LabSessionDto.sessionDate
    startTime: string; // Format: "HH:MM" (from LabSessionDto.sessionTime)
    endTime: string;   // (Local field, not from DTO)
}

const loadLabsFromBackend = async (): Promise<Lab[]> => {
    try {
        const labs = await retrieveAllLabs();
        return labs;
    } catch (error) {
        console.error("Failed to load labs:", error);
        throw error;
    }
};

/**
 * Retrieves and maps lab sessions from the backend.
 */
const loadSessionsFromBackend = async (): Promise<SessionScheduling[]> => {
    try {
        const sessionDtos: LabSessionDto[] = await retrieveAllLabSessions();

        console.log('Raw Lab Session DTOs:(01)', sessionDtos);

        return sessionDtos.map(dto => ({
            id: dto.sessionId,
            labId: dto.labId,
            title: dto.sessionName,
            lecturer: dto.lecturer,
            description: dto.description,
            date: new Date(dto.sessionDate),
            startTime: dto.sessionTime.substring(0, 5),
            endTime: "17:00", // default, update when backend supports
            createrRole: "Lecturer" // default, update when backend supports
        }));
    } catch (error) {
        console.error("Failed to load sessions:", error);
        throw error;
    }
};

/* --- Main Component --- */
export function Scheduling() {
    // Labs State
    const [labs, setLabs] = useState<Lab[]>([]);
    const [isLoadingLabs, setIsLoadingLabs] = useState(true);
    const [labError, setLabError] = useState<string | null>(null);

    // Sessions State
    const [sessions, setSessions] = useState<SessionScheduling[]>([]);
    const [isLoadingSessions, setIsLoadingSessions] = useState(true);
    const [sessionLoadError, setSessionLoadError] = useState<string | null>(null);

    // UI State
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [filterRole,] = useState<CreaterRole | "All">("All");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [sessionApiError, setSessionApiError] = useState<string | null>(null);
    const [currentScheduling, setCurrentScheduling] = useState<Omit<SessionScheduling, 'id'> & { id?: string } | null>(null);
    const [selectedSession, setSelectedSession] = useState<SessionScheduling | null>(null);

    // Fetch Labs on mount
    useEffect(() => {
        const fetchLabs = async () => {
            setIsLoadingLabs(true);
            setLabError(null);
            try {
                const fetchedLabs = await loadLabsFromBackend();
                setLabs(fetchedLabs);
            } catch (error) {
                setLabError("Failed to load computer labs. Please check the network or log in again.");
            } finally {
                setIsLoadingLabs(false);
            }
        };
        fetchLabs();
    }, []);

    // Fetch Lab Sessions on mount (history + daily)
    useEffect(() => {
        const fetchSessions = async () => {
            setIsLoadingSessions(true);
            setSessionLoadError(null);
            try {
                const fetchedSessions = await loadSessionsFromBackend();
                console.log('Mapped Lab Sessions:(02)', fetchedSessions);
                setSessions(fetchedSessions);
            } catch (error) {
                setSessionLoadError("Failed to load existing lab sessions.");
                console.error("Session load error:", error);
            } finally {
                setIsLoadingSessions(false);
            }
        };
        fetchSessions();
    }, []);

    // Daily sessions based on selected date
    const dailySchedulings = useMemo(() => {
        if (!selectedDate) return [];
        let filtered = sessions.filter(b => b.date.toDateString() === selectedDate.toDateString());
        if (filterRole !== "All") {
            filtered = filtered.filter(b => b.createrRole === filterRole);
        }
        return filtered.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }, [sessions, selectedDate, filterRole]);

    // NEW: Show ALL sessions (no filters, no past-only)
    const historySchedulings = useMemo(() => {
        return [...sessions].sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [sessions]);

    // Table columns for history
    const historyColumns: ColumnDef<SessionScheduling>[] = [
        {
            accessorKey: "title",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Session Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div className="pl-4">{row.original.title}</div>
        },
        {
            accessorKey: "lecturer",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Lecturer
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div className="pl-4">{row.original.lecturer}</div>
        },
        {
            accessorKey: "date",
            header: "Date",
            cell: ({ row }) => format(row.original.date, "PPP")
        },
        { accessorKey: "startTime", header: "Time" },
        {
            accessorKey: "labId",
            header: "Lab",
            cell: ({ row }) => labs.find(l => l.id === row.original.labId)?.name,
        },
    ];

    // Table instance
    const historyTable = useReactTable({
        data: historySchedulings,
        columns: historyColumns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    /* --- Loading and Error States --- */
    if (labError) {
        return (
            <div className="p-4 sm:p-6 space-y-8">
                <Card className="border-destructive">
                    <CardHeader><CardTitle className="text-destructive">Data Load Error</CardTitle></CardHeader>
                    <CardContent><p>{labError}</p></CardContent>
                </Card>
            </div>
        );
    }
    if (isLoadingLabs || isLoadingSessions) {
        return (
            <div className="p-4 sm:p-6 space-y-8">
                <Card>
                    <CardHeader><CardTitle>Loading Data...</CardTitle></CardHeader>
                    <CardContent><p>Please wait while the list of computer labs and sessions is retrieved from the server.</p></CardContent>
                </Card>
            </div>
        );
    }

    /* --- Handlers --- */
    const labDefaultId = labs.length > 0 ? labs[0].id : "";

    const handleOpenDialog = (booking?: SessionScheduling) => {
        setSessionApiError(null);
        if (booking) {
            setCurrentScheduling(booking);
            setIsEditMode(true);
        } else {
            setCurrentScheduling({
                labId: labDefaultId,
                title: "",
                lecturer: "",
                createrRole: "Admin",
                description: "",
                date: selectedDate || new Date(),
                startTime: "",
                endTime: ""
            });
            setIsEditMode(false);
        }
        if (labs.length > 0) {
            setIsDialogOpen(true);
        }
    };

    const handleSaveSession = async () => {
        if (!currentScheduling || isSaving) return;
        if (isEditMode && currentScheduling.id) {
            setSessions(sessions.map(b => b.id === currentScheduling.id ? { ...currentScheduling, id: b.id } as SessionScheduling : b));
            setIsDialogOpen(false);
            return;
        }

        if (!currentScheduling.labId || !currentScheduling.title || !currentScheduling.lecturer || !currentScheduling.date || !currentScheduling.startTime) {
            setSessionApiError("Please fill in all required fields (Lab, Session Name, Lecturer, Date, and Start Time).");
            return;
        }
        setIsSaving(true);
        setSessionApiError(null);
        try {
            const payload: CreateLabSessionPayload = {
                sessionName: currentScheduling.title,
                sessionDate: format(currentScheduling.date, 'yyyy-MM-dd'),
                sessionTime: `${currentScheduling.startTime}:00`,
                description: currentScheduling.description,
                lecturer: currentScheduling.lecturer,
                labId: currentScheduling.labId,
            };
            const createdSession: CreateLabSessionResponse = await createLabSession(payload);
            const newSession: SessionScheduling = {
                id: createdSession.sessionId,
                labId: createdSession.labId,
                title: createdSession.sessionName,
                lecturer: createdSession.lecturer,
                description: createdSession.description,
                createrRole: "Admin",
                date: new Date(createdSession.sessionDate),
                startTime: createdSession.sessionTime.substring(0, 5),
                endTime: currentScheduling.endTime || "",
            };
            setSessions(s => [...s, newSession]);
            setIsDialogOpen(false);
        } catch (error) {
            console.error("API Error creating session:", error);
            setSessionApiError(error instanceof Error ? error.message : "An unknown error occurred while creating the session.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteSession = (id: string) => {
        // This is still local-only; implement DELETE API as needed
        setSessions(sessions.filter(b => b.id !== id));
        if (selectedSession?.id === id) {
            setSelectedSession(null);
        }
    };

    /* --- Render --- */
    return (
        <div className="p-4 sm:p-6 space-y-8">
            <h1 className="text-2xl sm:text-3xl font-bold">Session Scheduling</h1>
            {sessionLoadError && (
                <div className="p-4 text-sm text-yellow-700 bg-yellow-100 border border-yellow-300 rounded-md">
                    ⚠️ <b>Warning:</b> {sessionLoadError}
                </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Calendar View */}
                <Card className="lg:col-span-1 xl:col-span-2">
                    <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                        <CardTitle>Schedule Sessions</CardTitle>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center mt-4 sm:mt-0 space-y-2 sm:space-y-0 sm:space-x-4">
                            
                            
                                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button onClick={() => handleOpenDialog()} disabled={labs.length === 0}>
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
                                            {sessionApiError && (
                                                <div className="p-2 text-sm text-destructive border border-destructive rounded-md bg-destructive/10">
                                                    {sessionApiError}
                                                </div>
                                            )}
                                            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                                                <Label htmlFor="title" className="sm:col-span-1 sm:text-left whitespace-nowrap">Session Name</Label>
                                                <Input id="title" value={currentScheduling?.title ?? ""} onChange={e => setCurrentScheduling(s => s ? { ...s, title: e.target.value } : null)} className="sm:col-span-3" />
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                                                <Label htmlFor="lecturer" className="sm:text-right">Lecturer</Label>
                                                <Input id="lecturer" value={currentScheduling?.lecturer || ""} onChange={e => setCurrentScheduling(s => s ? { ...s, lecturer: e.target.value } : null)} className="sm:col-span-3" />
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                                                <Label htmlFor="description" className="sm:text-right">Description</Label>
                                                <Input id="description" value={currentScheduling?.description || ""} onChange={e => setCurrentScheduling(s => s ? { ...s, description: e.target.value } : null)} className="sm:col-span-3" />
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
                                                            onSelect={day => setCurrentScheduling(s => s ? { ...s, date: day as Date } : null)}
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
                                            <Button onClick={handleSaveSession} disabled={isSaving}>
                                                {isSaving ? "Saving..." : isEditMode ? "Save Changes" : "Create Session"}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="w-full">
                                <DayPicker
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    modifiers={{ booked: sessions.map(b => b.date) }}
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
                                            className={cn(
                                                "p-4 transition-all bg-card hover:bg-secondary cursor-pointer",
                                                selectedSession?.id === booking.id && "border-2 border-primary"
                                            )}
                                            onClick={() => setSelectedSession(booking)}
                                        >
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                                                <div>
                                                    <p className="font-medium">{booking.title}</p>
                                                    <p className="text-sm text-muted-foreground">Lab: {labs.find(l => l.id === booking.labId)?.name}</p>
                                                    <p className="text-sm text-muted-foreground">Lecturer: {booking.lecturer} </p>
                                                    <p className="text-sm text-muted-foreground">Time: {booking.startTime} - {booking.endTime}</p>
                                                </div>
                                                <div className="flex space-x-2 mt-2 sm:mt-0">
                                                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(booking)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteSession(booking.id)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
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

            {/* All Booking History */}
            <Card className="mt-8">
                <CardHeader className="mb-0">
                    <CardTitle>List of Lab Sessions</CardTitle>
                </CardHeader>
                <CardContent className="mt-0">
                    <div className="flex items-center py-4 mt-0">
                        <Input
                            placeholder="Search by lecturer..."
                            value={(historyTable.getColumn("lecturer")?.getFilterValue() as string) ?? ""}
                            onChange={event => historyTable.getColumn("lecturer")?.setFilterValue(event.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                    <div className="overflow-x-auto rounded-md border">
                        <Table>
                            <TableHeader>
                                {historyTable.getHeaderGroups().map(headerGroup => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map(header => (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {historyTable.getRowModel().rows.length ? (
                                    historyTable.getRowModel().rows.map(row => (
                                        <TableRow key={row.id}>
                                            {row.getVisibleCells().map(cell => (
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
