"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

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
    </div>
  );
};

export default StudentTimetable;