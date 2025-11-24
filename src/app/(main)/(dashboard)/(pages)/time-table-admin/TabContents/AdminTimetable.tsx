"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Clock, Pencil } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription, // Required for accessibility
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Import API services
import { 
  getFilteredTimetable, 
  FilteredScheduleItem 
} from "@/services/api/TimetableManagement/FilteredDayofTheWeekAndStartTime";
import { 
  getAllRooms, 
  Room 
} from "@/services/api/TimetableManagement/RetrievesRooms";
import { 
  modifyAcademicSchedule, 
  UpdateScheduleDto 
} from "@/services/api/TimetableManagement/ModifiesAcademicSchedule";

// Define available time slots (08:00 AM to 05:00 PM)
const TIME_SLOTS = [
  "08:00:00", "09:00:00", "10:00:00", "11:00:00", "12:00:00",
  "13:00:00", "14:00:00", "15:00:00", "16:00:00", "17:00:00"
];

// Helper to format time string (08:00:00 -> 08:00 AM)
const formatTimeDisplay = (timeStr: string) => {
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  return `${displayH}:${minutes} ${ampm}`;
};

const Timetable = () => {
  // --- Timetable State ---
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const now = new Date();
    const currentHour = now.getHours();
    if (currentHour >= 17) {
      now.setDate(now.getDate() + 1);
    }
    return now;
  });

  const [selectedStartTime, setSelectedStartTime] = useState<string>(() => {
    const now = new Date();
    const currentHour = now.getHours();
    if (currentHour < 8 || currentHour >= 17) {
      return "08:00:00";
    }
    const nextHour = Math.min(currentHour + 1, 17);
    return `${nextHour.toString().padStart(2, '0')}:00:00`;
  });

  const [timetableData, setTimetableData] = useState<FilteredScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);

  // --- Rooms State ---
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isRoomListOpen, setIsRoomListOpen] = useState(false);

  // --- Edit State ---
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<FilteredScheduleItem | null>(null);
  const [formData, setFormData] = useState({
    locationCode: "",
    roomName: "",
    roomId: 0, 
    courseCode: "",
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  // --- Effects ---

  // 1. Fetch Rooms on Mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const roomData = await getAllRooms();
        setRooms(roomData);
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
      }
    };
    fetchRooms();
  }, []);

  // 2. Fetch Timetable Data when date/time changes
  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const dayName = currentDate.toLocaleDateString("en-US", { weekday: "long" });
      const data = await getFilteredTimetable(dayName, selectedStartTime);
      setTimetableData(data);
    } catch (error) {
      console.error("Failed to fetch timetable:", error);
      setTimetableData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, [currentDate, selectedStartTime]);

  // 3. Handle click outside to close room dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsRoomListOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Handlers ---

  const handlePrevDay = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  };

  const handleNextDay = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  };

  const handleEditClick = (item: FilteredScheduleItem) => {
    // Ensure we have a valid ID to update
    if (!item.s_id) {
        alert("Error: Missing Schedule ID (s_id). Cannot update this record.");
        console.error("Schedule item missing s_id:", item);
        return;
    }

    // Find current room ID to populate form state correctly
    const currentRoom = rooms.find(r => r.room_name === item.r_room_name);
    const currentRoomId = currentRoom ? currentRoom.room_id : 0;

    setEditingItem(item);
    setFormData({
      locationCode: item.r_location_code,
      roomName: item.r_room_name,
      roomId: currentRoomId, 
      courseCode: item.s_course_code,
    });
    setIsEditOpen(true);
    setIsRoomListOpen(false);
  };

  const handleSaveChanges = async () => {
    // We use s_id directly as requested
    if (!editingItem || !editingItem.s_id) return;
    
    if (!formData.roomId) {
      alert("Please select a valid room from the dropdown list.");
      return;
    }

    setIsSaving(true);

    try {
      const dayName = currentDate.toLocaleDateString("en-US", { weekday: "long" });

      const updatePayload: UpdateScheduleDto = {
        room_id: formData.roomId,
        course_code: formData.courseCode,
        day_of_week: dayName,
        start_time: editingItem.s_start_time,
        end_time: editingItem.s_end_time
      };

      console.log("Updating Schedule ID:", editingItem.s_id, "with payload:", updatePayload);

      // Call the modify service using the original s_id
      await modifyAcademicSchedule(editingItem.s_id, updatePayload);
      
      // Refresh the table to show updated data
      await fetchTimetable();
      
      setIsEditOpen(false);
      alert("Schedule updated successfully!");

    } catch (error) {
      console.error("Failed to update schedule:", error);
      alert("Failed to update schedule. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Filter rooms based on user input
  const filteredRooms = rooms.filter(room => 
    room.room_name.toLowerCase().includes(formData.roomName.toLowerCase())
  );

  // Handle room selection from dropdown
  const handleRoomSelect = (room: Room) => {
    setFormData(prev => ({
      ...prev,
      roomName: room.room_name,
      locationCode: room.location_code, 
      roomId: room.room_id 
    }));
    setIsRoomListOpen(false);
  };

  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 pb-2">
        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
          <Button variant="outline" size="icon" onClick={handlePrevDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-center text-lg font-medium min-w-[200px]">
            {formattedDate}
          </CardTitle>
          <Button variant="outline" size="icon" onClick={handleNextDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Time Slot Ribbon */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Select Start Time:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {TIME_SLOTS.map((time) => (
              <Button
                key={time}
                variant={selectedStartTime === time ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStartTime(time)}
                className={cn(
                  "min-w-[80px]",
                  selectedStartTime === time 
                    ? "bg-blue-600 text-white hover:bg-blue-700" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                {formatTimeDisplay(time)}
              </Button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Location Code</TableHead>
                <TableHead className="w-[200px]">Room Name</TableHead>
                <TableHead>Course Code</TableHead>
                <TableHead>Time Slot</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Loading schedule...
                  </TableCell>
                </TableRow>
              ) : timetableData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No classes scheduled for {formatTimeDisplay(selectedStartTime)} on this day.
                  </TableCell>
                </TableRow>
              ) : (
                timetableData.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{entry.r_location_code}</TableCell>
                    <TableCell>{entry.r_room_name}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-transparent bg-secondary text-secondary-foreground">
                        {entry.s_course_code}
                      </span>
                    </TableCell>
                    <TableCell>
                      {entry.s_start_time.substring(0, 5)} - {entry.s_end_time.substring(0, 5)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEditClick(entry)}
                        className="h-8 w-8 p-0"
                      >
                        <span className="sr-only">Edit</span>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Edit Overlay Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(open) => {
        if (!isSaving) setIsEditOpen(open);
      }}>
        <DialogContent className="sm:max-w-[425px] overflow-visible">
          <DialogHeader>
            <DialogTitle>Edit Schedule Details</DialogTitle>
            <DialogDescription>
              Modify the course code or room assignment for this time slot.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4 z-20">
              <Label htmlFor="roomName" className="text-right">
                Room Name
              </Label>
              <div className="col-span-3 relative" ref={dropdownRef}>
                <Input
                  id="roomName"
                  value={formData.roomName}
                  onChange={(e) => {
                    setFormData({
                        ...formData, 
                        roomName: e.target.value,
                        locationCode: "", 
                        roomId: 0 
                    });
                    setIsRoomListOpen(true);
                  }}
                  onFocus={() => setIsRoomListOpen(true)}
                  autoComplete="off"
                  placeholder="Search room..."
                  disabled={isSaving}
                />
                {isRoomListOpen && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-[200px] overflow-y-auto z-50">
                    {filteredRooms.length > 0 ? (
                      filteredRooms.map((room) => (
                        <div
                          key={room.room_id}
                          className="px-3 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm"
                          onClick={() => handleRoomSelect(room)}
                        >
                          {room.room_name}
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        No rooms found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-start-2 col-span-3">
                 <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-md border border-dashed">
                    {formData.locationCode 
                      ? `Location Code: ${formData.locationCode}` 
                      : "Please select a room above to see the location code."}
                 </p>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="courseCode" className="text-right">
                Course
              </Label>
              <Input
                id="courseCode"
                value={formData.courseCode}
                onChange={(e) => setFormData({...formData, courseCode: e.target.value})}
                className="col-span-3"
                disabled={isSaving}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline" disabled={isSaving}>Cancel</Button>
            </DialogClose>
            <Button type="submit" onClick={handleSaveChanges} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default Timetable;