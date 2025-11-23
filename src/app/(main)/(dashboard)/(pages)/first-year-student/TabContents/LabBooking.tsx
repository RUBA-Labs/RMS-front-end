"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { retrieveComputersFromLab, ComputerDto } from "@/services/api/Computers/retrive_computers_from_a_lab";
import { Wrench, CircleCheck, CircleX } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Mock Data ---
const availableLabs = [
    { id: "lab-a1", name: "Computer Lab A1" },
    { id: "lab-b2", name: "Computer Lab B2" },
    { id: "lab-c3", name: "Electronics Lab C3" },
];

const timeSlots = [
    "08:00 AM - 10:00 AM",
    "10:00 AM - 12:00 PM",
    "01:00 PM - 03:00 PM",
    "03:00 PM - 05:00 PM",
];

const availableCourseCodes = ["CS101", "EE205", "ME301", "IS402"];

// --- Helper & Sub-Component ---
const getComputerNumber = (name: string): number => {
    const match = name.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
};

const LabMap = ({ computers, bookedComputerNumbers, onSelectComputer, selectedComputerNumber }: { computers: ComputerDto[]; bookedComputerNumbers: number[]; onSelectComputer: (computer: ComputerDto) => void; selectedComputerNumber: number | null; }) => {
    const getComputerStatus = (computer: ComputerDto) => {
        if (computer.status === 'faulty') return "not_working";
        if (bookedComputerNumbers.includes(getComputerNumber(computer.name))) return "booked";
        return "available";
    };

    return (
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 p-4 border rounded-md bg-muted/50">
            {computers.map(computer => {
                const status = getComputerStatus(computer);
                const computerNo = getComputerNumber(computer.name);
                const isSelected = selectedComputerNumber === computerNo;
                const statusConfig = {
                    available: { color: "bg-green-500", icon: <CircleCheck className="h-4 w-4" />, tooltip: "Available" },
                    booked: { color: "bg-red-500", icon: <CircleX className="h-4 w-4" />, tooltip: "Booked" },
                    not_working: { color: "bg-gray-400", icon: <Wrench className="h-4 w-4" />, tooltip: "Not Working" },
                };
                return (
                    <Button key={computer.computerId} variant="outline" disabled={status !== 'available'} onClick={() => onSelectComputer(computer)}
                        className={cn("h-12 w-12 flex flex-col items-center justify-center font-bold text-xs text-white p-1 hover:bg-opacity-80", statusConfig[status].color, isSelected && "ring-2 ring-offset-2 ring-blue-500")}
                        title={`Computer ${computerNo} - ${statusConfig[status].tooltip}`}>
                        {statusConfig[status].icon}
                        <span>{computerNo}</span>
                    </Button>
                );
            })}
        </div>
    );
};

// --- Main Component ---
export function LabBooking() {
    // State for selections
    const [selectedCourseCode, setSelectedCourseCode] = useState<string | null>(null);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
    const [selectedLab, setSelectedLab] = useState<string | null>(null);

    // State for computers
    const [computers, setComputers] = useState<ComputerDto[]>([]);
    const [selectedComputer, setSelectedComputer] = useState<ComputerDto | null>(null);
    const [computersLoading, setComputersLoading] = useState(false);
    const [computersError, setComputersError] = useState<string | null>(null);
    const [bookedComputers, setBookedComputers] = useState<number[]>([]);

    // State for booking
    const [bookingStatus, setBookingStatus] = useState<"idle" | "success" | "error">("idle");
    const [bookingError, setBookingError] = useState<string | null>(null);

    useEffect(() => {
        if (selectedLab) {
            const fetchComputers = async () => {
                setComputersLoading(true);
                setComputersError(null);
                setComputers([]);
                setSelectedComputer(null);
                try {
                    const fetchedComputers = await retrieveComputersFromLab(selectedLab);
                    setComputers(fetchedComputers.sort((a,b) => getComputerNumber(a.name) - getComputerNumber(b.name)));
                    const computerNumbers = fetchedComputers.map(c => getComputerNumber(c.name));
                    const shuffled = computerNumbers.sort(() => 0.5 - Math.random());
                    setBookedComputers(shuffled.slice(0, Math.floor(Math.random() * (computerNumbers.length / 2))));
                } catch (error: any) {
                    setComputersError(error.message || "Failed to fetch computers.");
                } finally {
                    setComputersLoading(false);
                }
            };
            fetchComputers();
        }
    }, [selectedLab]);

    const handleBooking = () => {
        if (!selectedCourseCode || !selectedTimeSlot || !selectedLab || !selectedComputer) {
            setBookingError("Please complete all selections, including choosing a computer.");
            setBookingStatus("error");
            return;
        }

        console.log(`Booking request for Computer: ${selectedComputer.name}, Course: ${selectedCourseCode}, Time: ${selectedTimeSlot}`);
        setBookingStatus("success");
        setBookedComputers(prev => [...prev, getComputerNumber(selectedComputer!.name)]);
        setSelectedComputer(null);
        setTimeout(() => setBookingStatus("idle"), 5000);
    };
    
    const handleLabChange = (labId: string) => {
        setSelectedLab(labId);
        setSelectedComputer(null); // Reset computer selection when lab changes
    }
    
    const isBookingDisabled = !selectedCourseCode || !selectedTimeSlot || !selectedLab || !selectedComputer;

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="text-left">
                <h1 className="text-3xl font-bold">Book a Computer</h1>
                <p className="text-muted-foreground">Select your course, session, and desired lab to see available computers.</p>
            </div>

            {/* Horizontal Cards for Selections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader><CardTitle className="text-lg">Course Code</CardTitle></CardHeader>
                    <CardContent>
                        <Select onValueChange={setSelectedCourseCode} value={selectedCourseCode || undefined}>
                            <SelectTrigger><SelectValue placeholder="Select a Course" /></SelectTrigger>
                            <SelectContent>{availableCourseCodes.map((code) => <SelectItem key={code} value={code}>{code}</SelectItem>)}</SelectContent>
                        </Select>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-lg">Lab Session</CardTitle></CardHeader>
                    <CardContent>
                        <Select onValueChange={setSelectedTimeSlot} value={selectedTimeSlot || undefined} disabled={!selectedCourseCode}>
                            <SelectTrigger><SelectValue placeholder="Select a Time Slot" /></SelectTrigger>
                            <SelectContent>{timeSlots.map((slot) => <SelectItem key={slot} value={slot}>{slot}</SelectItem>)}</SelectContent>
                        </Select>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-lg">Lab</CardTitle></CardHeader>
                    <CardContent>
                         <Select onValueChange={handleLabChange} value={selectedLab || undefined} disabled={!selectedTimeSlot}>
                            <SelectTrigger><SelectValue placeholder="Select a Lab" /></SelectTrigger>
                            <SelectContent>{availableLabs.map((lab) => <SelectItem key={lab.id} value={lab.id}>{lab.name}</SelectItem>)}</SelectContent>
                        </Select>
                    </CardContent>
                </Card>
            </div>

            {/* Computer Map Card */}
            {selectedLab && (
                 <Card>
                    <CardHeader>
                        <CardTitle>4. Select a Computer in {availableLabs.find(l => l.id === selectedLab)?.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {computersLoading && <p className="text-center">Loading computers...</p>}
                        {computersError && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{computersError}</AlertDescription></Alert>}
                        {computers.length > 0 && (
                            <LabMap 
                                computers={computers}
                                bookedComputerNumbers={bookedComputers}
                                onSelectComputer={setSelectedComputer}
                                selectedComputerNumber={selectedComputer ? getComputerNumber(selectedComputer.name) : null}
                            />
                        )}
                        {!computersLoading && !computersError && computers.length === 0 && <p className="text-center text-muted-foreground">No computers found for this lab.</p>}
                    </CardContent>
                </Card>
            )}
            
            {/* Booking Button and Status */}
            <div className="flex flex-col items-center space-y-4">
                <Button onClick={handleBooking} disabled={isBookingDisabled} size="lg" className="w-full max-w-xs">
                    Book Selected Computer
                </Button>
                
                {bookingStatus === 'success' && (
                    <Alert className="max-w-2xl">
                        <AlertTitle>Booking Request Sent!</AlertTitle>
                        <AlertDescription>Your request for computer {selectedComputer?.name} has been submitted for approval.</AlertDescription>
                    </Alert>
                )}
                {bookingStatus === 'error' && (
                    <Alert variant="destructive" className="max-w-2xl">
                        <AlertTitle>Booking Failed</AlertTitle>
                        <AlertDescription>{bookingError}</AlertDescription>
                    </Alert>
                )}
            </div>
        </div>
    );
}