"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
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
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TimeChangeRequestForm = () => {
  const [timeSlots, setTimeSlots] = useState<{ day: string; time: string }[]>([
    { day: "", time: "" },
  ]);
  const [selectedOriginalDay, setSelectedOriginalDay] = useState<string>("");

  const addSlot = () => {
    if (timeSlots.length < 5) {
      setTimeSlots([...timeSlots, { day: "", time: "" }]);
    }
  };

  const handleSlotChange = (
    index: number,
    field: "day" | "time",
    value: string
  ) => {
    const newSlots = [...timeSlots];
    newSlots[index][field] = value;
    setTimeSlots(newSlots);
  };

  const removeSlot = (index: number) => {
    const newSlots = timeSlots.filter((_, i) => i !== index);
    setTimeSlots(newSlots);
  };

  const weekDaysOptions = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Request a Time Change</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID</Label>
              <Input id="studentId" placeholder="Enter your student ID" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="courseCode">Course Code</Label>
              <Input id="courseCode" placeholder="Enter the course code" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="originalDate">Original Day</Label>
              <Select onValueChange={setSelectedOriginalDay} value={selectedOriginalDay}>
                <SelectTrigger id="originalDate">
                  <SelectValue placeholder="Select a day" />
                </SelectTrigger>
                <SelectContent>
                  {weekDaysOptions.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Original Time</Label>
              <Input id="time" type="time" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Available Time Slots</Label>
            {timeSlots.map((slot, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Select
                  onValueChange={(value) => handleSlotChange(index, "day", value)}
                  value={slot.day}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a day" />
                  </SelectTrigger>
                  <SelectContent>
                    {weekDaysOptions.map((day) => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="time"
                  value={slot.time}
                  onChange={(e) =>
                    handleSlotChange(index, "time", e.target.value)
                  }
                />
                {timeSlots.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSlot(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {timeSlots.length < 5 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSlot}
                className="mt-2"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Slot
              </Button>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit">Submit Request</Button>
      </CardFooter>
    </Card>
  );
};

const StudentTimetable = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedStartTime, setSelectedStartTime] = useState<string>("");

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

  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Mock data for the timetable
  const timetableData = [
    {
      locationCode: "E-FAC",
      roomName: "E-LH1",
      courseCode: "CO221",
      startTime: "08:00",
      endTime: "10:00",
    },
    {
      locationCode: "E-FAC",
      roomName: "E-LH2",
      courseCode: "CO222",
      startTime: "10:00",
      endTime: "12:00",
    },
  ];

  const filteredTimetableData = selectedStartTime
    ? timetableData.filter((entry) => entry.startTime === selectedStartTime)
    : timetableData;

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <Button variant="outline" size="icon" onClick={handlePrevDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-center text-lg font-medium">
            {formattedDate}
          </CardTitle>
          <Button variant="outline" size="icon" onClick={handleNextDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center space-x-2">
            <label htmlFor="startTimeInput" className="text-sm font-medium">
              Filter by Start Time:
            </label>
            <Input
              id="startTimeInput"
              type="time"
              value={selectedStartTime}
              onChange={(e) => setSelectedStartTime(e.target.value)}
              className="w-[110px]"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location Code</TableHead>
                <TableHead>Room Name</TableHead>
                <TableHead>Course Code</TableHead>
                <TableHead>End Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTimetableData.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell>{entry.locationCode}</TableCell>
                  <TableCell>{entry.roomName}</TableCell>
                  <TableCell>{entry.courseCode}</TableCell>
                  <TableCell>{entry.endTime}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <TimeChangeRequestForm />
    </div>
  );
};

export default StudentTimetable;