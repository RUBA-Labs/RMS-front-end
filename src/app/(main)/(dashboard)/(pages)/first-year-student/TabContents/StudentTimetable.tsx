"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

// Import the service and type
import { 
  getFilteredTimetable, 
  FilteredScheduleItem 
} from "@/services/api/TimetableManagement/FilteredDayofTheWeekAndStartTime";

// Define available time slots (08:00 AM to 05:00 PM)
const TIME_SLOTS = [
  "08:00:00", "09:00:00", "10:00:00", "11:00:00", "12:00:00",
  "13:00:00", "14:00:00", "15:00:00", "16:00:00", "17:00:00"
];

// Helper to format time string (08:00:00 -> 08:00 AM) for display
const formatTimeDisplay = (timeStr: string) => {
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  return `${displayH}:${minutes} ${ampm}`;
};

const StudentTimetable = () => {
  // 1. Initialize Date: If current time > 5 PM, default to tomorrow
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const now = new Date();
    const currentHour = now.getHours();
    // If it's after 5 PM (17:00), move to next day
    if (currentHour >= 17) {
      now.setDate(now.getDate() + 1);
    }
    return now;
  });

  // 2. Initialize Time: Calculate the next logical slot
  const [selectedStartTime, setSelectedStartTime] = useState<string>(() => {
    const now = new Date();
    const currentHour = now.getHours();
    
    // If outside working hours (Before 8 AM or After 5 PM), default to 8 AM
    if (currentHour < 8 || currentHour >= 17) {
      return "08:00:00";
    }
    
    // Otherwise, pick the *next* hour (e.g., if 9:15 AM, pick 10:00 AM)
    // We cap it at 17 (5 PM)
    const nextHour = Math.min(currentHour + 1, 17);
    return `${nextHour.toString().padStart(2, '0')}:00:00`;
  });

  const [timetableData, setTimetableData] = useState<FilteredScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Navigation Handlers
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

  // Fetch Data Effect
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Format Day string (e.g., "Monday")
        const dayName = currentDate.toLocaleDateString("en-US", { weekday: "long" });
        
        // Call the service
        const data = await getFilteredTimetable(dayName, selectedStartTime);
        setTimetableData(data);
      } catch (error) {
        console.error("Failed to fetch timetable:", error);
        setTimetableData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentDate, selectedStartTime]);

  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="w-full">
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
              <span>Filter by Start Time:</span>
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
                  <TableHead className="text-right">Time Slot</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Loading schedule...
                    </TableCell>
                  </TableRow>
                ) : timetableData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No classes scheduled for {formatTimeDisplay(selectedStartTime)} on this day.
                    </TableCell>
                  </TableRow>
                ) : (
                  timetableData.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{entry.r_location_code}</TableCell>
                      <TableCell>{entry.r_room_name}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                          {entry.s_course_code}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {entry.s_start_time.substring(0, 5)} - {entry.s_end_time.substring(0, 5)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentTimetable;