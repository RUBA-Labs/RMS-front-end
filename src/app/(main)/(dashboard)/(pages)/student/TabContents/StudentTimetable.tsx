"use client";

import { useState, useEffect, useMemo } from "react";
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
  X, 
  Trash2, 
  List,
  Filter
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

import {
  getMyCoursesList,
  MyCourse
} from "@/services/api/MyCourses/getMyCousesList";

import { deleteMyCourse } from "@/services/api/MyCourses/deleteMyCodeById";

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
  const [loadingTimetable, setLoadingTimetable] = useState(false);

  // --- STATE: Add Subject Dialog Logic ---
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<AvailableCourse[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]); 
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [submittingCourses, setSubmittingCourses] = useState(false);

  // --- STATE: View My Courses Dialog Logic ---
  const [isMyCoursesOpen, setIsMyCoursesOpen] = useState(false);
  const [myCoursesData, setMyCoursesData] = useState<MyCourse[]>([]);
  const [loadingMyCourses, setLoadingMyCourses] = useState(false);
  const [deletingCourseId, setDeletingCourseId] = useState<number | null>(null);

  // --- STATE: Filter Logic ---
  const [showMyCoursesOnly, setShowMyCoursesOnly] = useState(false);
  const [enrolledCourseCodes, setEnrolledCourseCodes] = useState<string[]>([]);
  const [loadingFilterData, setLoadingFilterData] = useState(false);

  // --- HANDLERS: Navigation ---
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

  // --- EFFECT 1: Fetch Timetable ---
  useEffect(() => {
    const fetchTimetable = async () => {
      const dayName = currentDate.toLocaleDateString("en-US", { weekday: "long" });
      setLoadingTimetable(true);
      
      try {
        const data = await getFilteredTimetable(dayName, selectedStartTime);
        setTimetableData(data);
      } catch (error) {
        console.error("ERROR: Failed to fetch timetable:", error);
        setTimetableData([]);
      } finally {
        setLoadingTimetable(false);
      }
    };

    fetchTimetable();
  }, [currentDate, selectedStartTime]);

  // --- EFFECT 2: Fetch Available Courses (For Add Dialog) ---
  useEffect(() => {
    let isMounted = true;

    if (isDialogOpen) {
      const fetchCourses = async () => {
        setLoadingCourses(true);
        try {
          const courses = await getAvailableCoursesList();
          if (isMounted) setAvailableCourses(courses);
        } catch (error) {
          console.error("ERROR: Failed to load available courses", error);
        } finally {
          if (isMounted) setLoadingCourses(false);
        }
      };
      fetchCourses();
    } else {
      setAvailableCourses([]); 
      setSelectedCourses([]); 
    }

    return () => { isMounted = false; };
  }, [isDialogOpen]);

  // --- EFFECT 3: Fetch My Courses (For My Courses Dialog AND Filter) ---
  const fetchMyEnrolledCourses = async () => {
    console.log("DEBUG: Fetching enrolled courses...");
    setLoadingMyCourses(true);
    setLoadingFilterData(true);
    try {
      const data = await getMyCoursesList();
      setMyCoursesData(data);
      const codes = data.map(c => c.course_code);
      setEnrolledCourseCodes(codes);
      console.log("DEBUG: Enrolled codes updated:", codes);
    } catch (error) {
      console.error("ERROR: Failed to load my courses", error);
    } finally {
      setLoadingMyCourses(false);
      setLoadingFilterData(false);
    }
  };

  useEffect(() => {
    if (isMyCoursesOpen) {
      fetchMyEnrolledCourses();
    } else {
      // Clear dialog data but KEEP enrolledCourseCodes for filter
      setMyCoursesData([]);
    }
  }, [isMyCoursesOpen]);

  // --- EFFECT 4: Handle Filter Toggle Logic ---
  useEffect(() => {
    if (showMyCoursesOnly) {
      // Fetch if we don't have data yet
      if (enrolledCourseCodes.length === 0) {
        fetchMyEnrolledCourses();
      }
    }
  }, [showMyCoursesOnly]);


  // --- COMPUTED: Filtered Data (UPDATED LOGIC) ---
  const filteredTimetableData = useMemo(() => {
    if (!showMyCoursesOnly) return timetableData;
    
    console.log("DEBUG: Filtering Logic Running...");
    console.log("DEBUG: Timetable Items:", timetableData.length);
    console.log("DEBUG: My Enrolled Codes:", enrolledCourseCodes);

    const filtered = timetableData.filter(item => {
      // FIX: Normalize strings to handle case sensitivity or trailing spaces
      const normalize = (s: string) => s ? s.trim().toLowerCase() : "";
      
      const itemCode = normalize(item.s_course_code);
      const isMatch = enrolledCourseCodes.some(code => normalize(code) === itemCode);
      
      // Optional: Log mismatches for debugging
      // if (!isMatch) console.log(`DEBUG: Filtered out ${item.s_course_code} (No match found)`);
      
      return isMatch;
    });
    
    console.log("DEBUG: Filter Result Count:", filtered.length);
    return filtered;
  }, [timetableData, showMyCoursesOnly, enrolledCourseCodes]);


  // --- HANDLERS: Course Selection/Management ---
  const toggleCourseSelection = (courseCode: string) => {
    setSelectedCourses((prev) => 
      prev.includes(courseCode)
        ? prev.filter((code) => code !== courseCode)
        : [...prev, courseCode]
    );
  };

  const removeSelection = (courseCode: string) => {
    setSelectedCourses((prev) => prev.filter((code) => code !== courseCode));
  };

  const handleSubmitCourses = async () => {
    if (selectedCourses.length === 0) return;

    setSubmittingCourses(true);
    try {
      const coursesPayload: CourseInput[] = selectedCourses.map(code => {
        const courseObj = availableCourses.find(c => c.course_code === code);
        return {
          course_code: code,
          course_name: (courseObj as any).course_name || "not set yet"
        };
      });

      await addMyCourse(coursesPayload);
      setIsDialogOpen(false);
      
      // FIX: Immediately update local filter list so the user sees results instantly
      setEnrolledCourseCodes(prev => {
        // Merge new unique codes
        const newCodes = [...prev, ...selectedCourses];
        // Deduplicate
        return Array.from(new Set(newCodes));
      });
      
      console.log("DEBUG: Local filter list updated with new courses");
      
    } catch (error) {
      console.error("ERROR: Failed to add courses:", error);
    } finally {
      setSubmittingCourses(false);
    }
  };

  const handleDeleteMyCourse = async (courseId: number, courseCode: string) => {
    if (!window.confirm(`Are you sure you want to remove ${courseCode}?`)) return;

    setDeletingCourseId(courseId);
    try {
      await deleteMyCourse(courseId);
      
      // Update Dialog List
      setMyCoursesData((prev) => prev.filter((item) => item.id !== courseId));
      
      // Update Filter List
      setEnrolledCourseCodes((prev) => prev.filter((code) => code !== courseCode));
      
    } catch (error) {
      console.error("ERROR: Failed to delete course", error);
    } finally {
      setDeletingCourseId(null);
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
      {/* SECTION A: Header & Actions                              */}
      {/* -------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-card p-4 rounded-lg shadow-sm border gap-4">
        <div>
            <h2 className="text-lg font-semibold">Course Management</h2>
            <p className="text-sm text-muted-foreground">Manage your enrolled subjects here.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isMyCoursesOpen} onOpenChange={setIsMyCoursesOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <List className="h-4 w-4" />
                My Courses
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>My Enrolled Courses</DialogTitle>
                <DialogDescription>List of subjects you are currently enrolled in.</DialogDescription>
              </DialogHeader>
              
              <div className="py-4 h-[300px] overflow-y-auto border rounded-md p-2 bg-muted/10">
                {loadingMyCourses ? (
                   <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                     <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading your courses...
                   </div>
                ) : myCoursesData.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    You haven't added any courses yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {myCoursesData.map((course) => (
                      <div key={course.id} className="flex items-center justify-between p-3 rounded-md border bg-card shadow-sm">
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{course.course_code}</span>
                          {course.course_name && course.course_name !== "not set yet" && (
                             <span className="text-xs text-muted-foreground truncate max-w-[250px]">{course.course_name}</span>
                          )}
                        </div>
                        <Button 
                          variant="ghost" size="icon"
                          disabled={deletingCourseId === course.id}
                          className="text-destructive hover:bg-destructive/10 h-8 w-8"
                          onClick={() => handleDeleteMyCourse(course.id, course.course_code)}
                        >
                          {deletingCourseId === course.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button onClick={() => setIsMyCoursesOpen(false)} variant="secondary">Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add My Subject
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Add New Subjects</DialogTitle>
                <DialogDescription>Search available courses on the left and manage your selection on the right.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 h-[400px]">
                <div className="flex flex-col gap-2 h-full">
                  <h3 className="font-semibold text-sm">Available Courses</h3>
                  <div className="h-full border rounded-md overflow-hidden">
                    <Command className="h-full">
                      <CommandInput placeholder="Search course code..." />
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
                <div className="flex flex-col gap-2 h-full">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-sm">Selected Courses</h3>
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{selectedCourses.length}</span>
                  </div>
                  <div className="h-full border rounded-md p-2 overflow-y-auto bg-muted/30">
                    {selectedCourses.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-sm text-muted-foreground italic">No courses selected yet.</div>
                    ) : (
                      <div className="space-y-2">
                        {selectedCourses.map((code) => (
                          <div key={code} className="flex items-center justify-between p-3 rounded-md border bg-card shadow-sm animate-in fade-in zoom-in-95 duration-200">
                            <span className="font-medium text-sm">{code}</span>
                            <Button 
                              variant="ghost" size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => removeSelection(code)}
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
                <Button onClick={handleSubmitCourses} disabled={submittingCourses || selectedCourses.length === 0} className="w-full sm:w-auto">
                  {submittingCourses ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : `Save ${selectedCourses.length} Course${selectedCourses.length !== 1 ? 's' : ''}`}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
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
          {/* Time Slot Ribbon & Filter Toggle */}
          <div className="mb-6 space-y-4">
            
            {/* Row 1: Filter Toggle Button */}
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Filter by Start Time:</span>
               </div>

               {/* NEW FILTER TOGGLE BUTTON */}
               <Button 
                 variant={showMyCoursesOnly ? "default" : "outline"}
                 size="sm"
                 onClick={() => setShowMyCoursesOnly(!showMyCoursesOnly)}
                 className="gap-2"
               >
                 {loadingFilterData ? (
                   <Loader2 className="h-3 w-3 animate-spin" />
                 ) : (
                   <Filter className="h-3 w-3" />
                 )}
                 {showMyCoursesOnly ? "My Courses Only" : "All Courses"}
               </Button>
            </div>

            {/* Row 2: Time Slots */}
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
                {loadingTimetable ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading schedule...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredTimetableData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      {showMyCoursesOnly 
                        ? "No classes for your enrolled courses found in this time slot." 
                        : `No classes scheduled for ${formatTimeDisplay(selectedStartTime)} on this day.`}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTimetableData.map((entry, index) => (
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