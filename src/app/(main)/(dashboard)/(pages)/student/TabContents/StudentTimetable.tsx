"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Plus, 
  Check, 
  Loader2,
  X // Added X icon for the delete button
} from "lucide-react";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

// ----------------------------------------------------------------------
// 1. API IMPORTS 
// ----------------------------------------------------------------------
import { 
  getFilteredTimetable, 
  FilteredScheduleItem 
} from "@/services/api/TimetableManagement/FilteredDayofTheWeekAndStartTime";

import { 
  getAvailableCoursesList, 
  AvailableCourse 
} from "@/services/api/MyCourses/getAvailableCousesList"; 

import { 
  addMyCourse,
  CourseInput 
} from "@/services/api/MyCourses/AddMyCouse"; 

// ----------------------------------------------------------------------
// 2. CONSTANTS & HELPERS
// ----------------------------------------------------------------------
const TIME_SLOTS = [
  "08:00:00", "09:00:00", "10:00:00", "11:00:00", "12:00:00",
  "13:00:00", "14:00:00", "15:00:00", "16:00:00", "17:00:00"
];

const formatTimeDisplay = (timeStr: string) => {
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  return `${displayH}:${minutes} ${ampm}`;
};

// ----------------------------------------------------------------------
// 3. MAIN COMPONENT
// ----------------------------------------------------------------------
const StudentTimetable = () => {
  console.log("--- RENDER: StudentTimetable Component ---");

  // --- STATE: Timetable Logic ---
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const now = new Date();
    const currentHour = now.getHours();
    console.log("DEBUG: Initializing Date. Current Hour:", currentHour);
    if (currentHour >= 17) {
      now.setDate(now.getDate() + 1);
      console.log("DEBUG: After 5 PM, defaulting to tomorrow:", now);
    }
    return now;
  });

  const [selectedStartTime, setSelectedStartTime] = useState<string>(() => {
    const now = new Date();
    const currentHour = now.getHours();
    
    if (currentHour < 8 || currentHour >= 17) {
      console.log("DEBUG: Outside working hours, defaulting start time to 08:00:00");
      return "08:00:00";
    }
    const nextHour = Math.min(currentHour + 1, 17);
    const time = `${nextHour.toString().padStart(2, '0')}:00:00`;
    console.log("DEBUG: Defaulting start time to next hour:", time);
    return time;
  });

  const [timetableData, setTimetableData] = useState<FilteredScheduleItem[]>([]);
  const [loadingTimetable, setLoadingTimetable] = useState(false);

  // --- STATE: Add Subject Logic ---
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<AvailableCourse[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]); 
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [submittingCourses, setSubmittingCourses] = useState(false);

  // --- HANDLERS: Navigation ---
  const handlePrevDay = () => {
    console.log("ACTION: User clicked Previous Day");
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  };

  const handleNextDay = () => {
    console.log("ACTION: User clicked Next Day");
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  };

  // --- EFFECT 1: Fetch Timetable ---
  useEffect(() => {
    const fetchTimetable = async () => {
      const dayName = currentDate.toLocaleDateString("en-US", { weekday: "long" });
      
      console.log(`DEBUG: EFFECT 1 Triggered. Fetching Timetable for ${dayName} at ${selectedStartTime}`);
      setLoadingTimetable(true);
      
      try {
        const data = await getFilteredTimetable(dayName, selectedStartTime);
        console.log("DEBUG: Timetable API Response:", data);
        setTimetableData(data);
      } catch (error) {
        console.error("ERROR: Failed to fetch timetable:", error);
        setTimetableData([]);
      } finally {
        setLoadingTimetable(false);
        console.log("DEBUG: Timetable Fetch Complete. Loading state set to false.");
      }
    };

    fetchTimetable();
  }, [currentDate, selectedStartTime]);

  // --- EFFECT 2: Fetch Courses ONLY when Dialog is Open, Clear RAM when Closed ---
  useEffect(() => {
    console.log("DEBUG: EFFECT 2 Triggered. Dialog Open State:", isDialogOpen);
    let isMounted = true;

    if (isDialogOpen) {
      // 1. Dialog is OPEN: Fetch data into memory
      const fetchCourses = async () => {
        console.log("DEBUG: Dialog is OPEN. Starting to fetch available courses...");
        setLoadingCourses(true);
        try {
          const courses = await getAvailableCoursesList();
          console.log("DEBUG: Courses API Response Received. Items count:", courses.length);
          if (isMounted) {
            setAvailableCourses(courses);
            console.log("DEBUG: Available courses state updated.");
          }
        } catch (error) {
          console.error("ERROR: Failed to load available courses", error);
        } finally {
          if (isMounted) {
            setLoadingCourses(false);
            console.log("DEBUG: Course loading state set to false.");
          }
        }
      };
      fetchCourses();
    } else {
      // 2. Dialog is CLOSED: Clear arrays to free up RAM
      console.log("DEBUG: Dialog is CLOSED. Clearing availableCourses and selectedCourses from memory.");
      setAvailableCourses([]); 
      setSelectedCourses([]); 
    }

    return () => { 
      isMounted = false; 
      console.log("DEBUG: Cleanup for Course Effect running.");
    };
  }, [isDialogOpen]);

  // --- HANDLER: Toggle Course Selection (Add/Remove) ---
  const toggleCourseSelection = (courseCode: string) => {
    console.log("ACTION: Toggling selection for course:", courseCode);
    setSelectedCourses((prev) => {
      const isAlreadySelected = prev.includes(courseCode);
      const newSelection = isAlreadySelected
        ? prev.filter((code) => code !== courseCode)
        : [...prev, courseCode];
      
      console.log("DEBUG: New Selected Courses List:", newSelection);
      return newSelection;
    });
  };

  // --- HANDLER: Explicit Remove (For Delete Button) ---
  const removeCourse = (courseCode: string) => {
    console.log("ACTION: Removing course via delete button:", courseCode);
    setSelectedCourses((prev) => prev.filter((code) => code !== courseCode));
  };

  // --- HANDLER: Submit New Courses ---
  const handleSubmitCourses = async () => {
    console.log("ACTION: Submit button clicked. Selected Courses:", selectedCourses);
    
    if (selectedCourses.length === 0) {
      console.warn("WARNING: No courses selected. Aborting submit.");
      return;
    }

    setSubmittingCourses(true);
    try {
      // FIX: Lookup the full course object to check if a name exists
      const coursesPayload: CourseInput[] = selectedCourses.map(code => {
        // Try to find the course in the available list to see if it has a name
        const courseObj = availableCourses.find(c => c.course_code === code);
        
        return {
          course_code: code,
          // Use existing name if available, otherwise default to "not set yet"
          course_name: (courseObj as any).course_name || "not set yet"
        };
      });

      console.log("DEBUG: Sending Payload to AddMyCourse API:", JSON.stringify({ courses: coursesPayload }));

      await addMyCourse(coursesPayload);
      
      console.log("SUCCESS: Courses added successfully.");

      // Close dialog (This triggers Effect 2 to clear RAM)
      setIsDialogOpen(false);
      console.log("DEBUG: Dialog closed programmatically.");
      
    } catch (error) {
      console.error("ERROR: Failed to add courses:", error);
    } finally {
      setSubmittingCourses(false);
      console.log("DEBUG: Submitting state set to false.");
    }
  };

  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="w-full space-y-6">
      
      {/* -------------------------------------------------------- */}
      {/* SECTION A: Add My Subject (Dialog)                       */}
      {/* -------------------------------------------------------- */}
      <div className="flex items-center justify-between bg-card p-4 rounded-lg shadow-sm border">
        <div>
            <h2 className="text-lg font-semibold">Course Management</h2>
            <p className="text-sm text-muted-foreground">Manage your enrolled subjects here.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          console.log("ACTION: Dialog onOpenChange triggered. New state:", open);
          setIsDialogOpen(open);
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => console.log("ACTION: Add My Subject Button Clicked")}>
              <Plus className="h-4 w-4" />
              Add My Subject
            </Button>
          </DialogTrigger>
          
          {/* UPDATED: Increased width for two columns */}
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Add New Subjects</DialogTitle>
              <DialogDescription>
                Search available courses on the left and manage your selection on the right.
              </DialogDescription>
            </DialogHeader>

            {/* TWO COLUMN LAYOUT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 h-[400px]">
              
              {/* COLUMN 1: Search & Add */}
              <div className="flex flex-col gap-2 h-full">
                <h3 className="font-semibold text-sm">Available Courses</h3>
                <div className="h-full border rounded-md overflow-hidden">
                  <Command className="h-full">
                    <CommandInput placeholder="Search course code..." onValueChange={(val) => console.log("DEBUG: Search input:", val)}/>
                    <CommandList className="h-full max-h-[320px] overflow-y-auto">
                      {loadingCourses ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin inline mr-2" /> Loading...
                        </div>
                      ) : (
                        <>
                          <CommandEmpty>No course found.</CommandEmpty>
                          <CommandGroup>
                            {availableCourses.map((course) => {
                              const isSelected = selectedCourses.includes(course.course_code);
                              return (
                                <CommandItem
                                  key={course.id || course.course_code}
                                  value={course.course_code}
                                  onSelect={() => toggleCourseSelection(course.course_code)}
                                >
                                  <div className={cn(
                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                    isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                                  )}>
                                    <Check className={cn("h-4 w-4")} />
                                  </div>
                                  <span>{course.course_code}</span>
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </>
                      )}
                    </CommandList>
                  </Command>
                </div>
              </div>

              {/* COLUMN 2: Selected List (Delete Button Here) */}
              <div className="flex flex-col gap-2 h-full">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-sm">Selected Courses</h3>
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                    {selectedCourses.length}
                  </span>
                </div>
                
                <div className="h-full border rounded-md p-2 overflow-y-auto bg-muted/30">
                  {selectedCourses.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-sm text-muted-foreground italic">
                      No courses selected yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedCourses.map((code) => (
                        <div 
                          key={code} 
                          className="flex items-center justify-between p-3 rounded-md border bg-card shadow-sm animate-in fade-in zoom-in-95 duration-200"
                        >
                          <span className="font-medium text-sm">{code}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeCourse(code)}
                            title="Remove course"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>

            <DialogFooter className="mt-2">
              <Button 
                onClick={handleSubmitCourses} 
                disabled={submittingCourses || selectedCourses.length === 0}
                className="w-full sm:w-auto"
              >
                {submittingCourses ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  `Save ${selectedCourses.length} Course${selectedCourses.length !== 1 ? 's' : ''}`
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* -------------------------------------------------------- */}
      {/* SECTION B: Timetable Display                             */}
      {/* -------------------------------------------------------- */}
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
                  onClick={() => {
                    console.log("ACTION: Time slot selected:", time);
                    setSelectedStartTime(time);
                  }}
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
                {loadingTimetable ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading schedule...
                      </div>
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