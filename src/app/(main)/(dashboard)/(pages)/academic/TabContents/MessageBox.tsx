"use client";

import { useState } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';

// Import the API service
import { createAnnouncement } from '@/services/api/Announcements/CreateAnnouncement';

interface Announcement {
  title: string;
  viewer: string;
  date: string;
  message: string;
}

const initialSentAnnouncements: Announcement[] = [
  {
    title: "Scheduled Maintenance Break",
    viewer: "student",
    date: "2025-11-15",
    message: "The system will be down for scheduled maintenance on 2025-11-20 from 2:00 AM to 4:00 AM. Please save all your work before this time.",
  },
  {
    title: "New Feature: Dark Mode",
    viewer: "academic",
    date: "2025-11-10",
    message: "We are excited to announce that dark mode is now available in the user settings. You can enable it from the profile settings page.",
  },
  {
    title: "Welcome to the New Semester",
    viewer: "non_academic",
    date: "2025-09-01",
    message: "Welcome back to all students and staff. We wish you a successful semester. Please check your timetables for updates.",
  },
];

export function MessageBox() {
  const [title, setTitle] = useState("");
  const [viewer, setViewer] = useState("");
  const [message, setMessage] = useState("");
  const [sentAnnouncements, setSentAnnouncements] = useState<Announcement[]>(initialSentAnnouncements);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  
  // Loading state for the send button
  const [isSending, setIsSending] = useState(false);

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Basic Empty Check
    if (!title || !viewer || !message) {
        alert("Please fill in all fields.");
        return;
    }

    // 2. Length Validation (Fixes the 400 Error)
    if (title.length < 5) {
        alert("Title must be at least 5 characters long.");
        return;
    }

    if (message.length < 10) {
        alert("Message must be at least 10 characters long.");
        return;
    }

    setIsSending(true);

    try {
      // 3. Call the backend API
      await createAnnouncement({
        title,
        message,
        selectedViewer: viewer, 
      });

      // 4. On success, create the local object to update UI immediately
      const newAnnouncement: Announcement = {
        title,
        viewer,
        message,
        date: new Date().toISOString().split('T')[0], // Generate current date
      };

      // 5. Update local list
      setSentAnnouncements([newAnnouncement, ...sentAnnouncements]);
      
      // 6. Reset form
      setTitle("");
      setViewer("");
      setMessage("");

      alert("Announcement sent successfully!");

    } catch (error) {
      // Error is logged in the service, here we just show the alert
      // The error message thrown by the service is now clean (see CreateAnnouncement.ts update)
      alert(error instanceof Error ? error.message : "Failed to send announcement.");
    } finally {
      setIsSending(false);
    }
  };

  const handleViewAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsDialogOpen(true);
  };

  return (
    <ResizablePanelGroup direction="horizontal" className="min-h-screen">
      <ResizablePanel defaultSize={50}>
        <div className="flex h-full items-center justify-center p-6">
          <Card className="w-full h-full">
            <CardHeader>
              <CardTitle>Make Important Announcement</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendAnnouncement} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title <span className="text-xs text-gray-500">(Min 5 chars)</span></Label>
                  <Input
                    id="title"
                    placeholder="Enter the title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isSending}
                  />
                </div>
                <div>
                  <Label className="block mb-2">Select Viewer Group</Label>
                  <Select onValueChange={setViewer} value={viewer} disabled={isSending}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select target audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>General Roles</SelectLabel>
                        <SelectItem value="ALL">All Users</SelectItem>
                        <SelectItem value="user">General User</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="first_year_student">First Year Student</SelectItem>
                        <SelectItem value="academic">Academic Staff</SelectItem>
                        <SelectItem value="non_academic">Non-Academic Staff</SelectItem>
                      </SelectGroup>
                      
                      <SelectGroup>
                        <SelectLabel>Administrative Roles</SelectLabel>
                        <SelectItem value="admin">System Admin</SelectItem>
                        <SelectItem value="developer">Developer</SelectItem>
                        <SelectItem value="time_table_admin">Time Table Admin</SelectItem>
                        <SelectItem value="exam_claims_admin">Exam Claims Admin</SelectItem>
                        <SelectItem value="lab_allocation_admin">Lab Allocation Admin</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message <span className="text-xs text-gray-500">(Min 10 chars)</span></Label>
                  <Textarea
                    id="message"
                    placeholder="Enter your announcement"
                    className="min-h-[200px]"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isSending}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSending}>
                  {isSending ? "Sending..." : "Send Announcement"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </ResizablePanel>
      
      <ResizableHandle withHandle />
      
      <ResizablePanel defaultSize={50}>
        <div className="flex h-full items-center justify-center p-6">
          <Card className="w-full h-full">
            <CardHeader>
              <CardTitle>Sent Announcements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[80vh] overflow-y-auto">
              {sentAnnouncements.map((announcement, index) => (
                <Card key={index}>
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{announcement.title}</h3>
                      <p className="text-sm text-gray-500">{announcement.date}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleViewAnnouncement(announcement)}>
                      View
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>
      </ResizablePanel>

      {selectedAnnouncement && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <h3 className="text-sm text-gray-500"> Title :</h3>
              <DialogTitle>{selectedAnnouncement.title}</DialogTitle>
              
              <h3 className="text-sm text-gray-500 mt-2"> Target Audience :</h3>
              <DialogTitle className="capitalize">
                {selectedAnnouncement.viewer.replace(/_/g, ' ')}
              </DialogTitle>
              
              <h3 className="text-sm text-gray-500 mt-2"> Date :</h3>
              <DialogDescription className="text-sm text-gray-500">
                {selectedAnnouncement.date}
              </DialogDescription>
              
              <h3 className="text-sm text-gray-500 mt-2"> Message :</h3>
            </DialogHeader>
            <p className="text-base whitespace-pre-wrap">{selectedAnnouncement.message}</p>
          </DialogContent>
        </Dialog>
      )}
    </ResizablePanelGroup>
  );
}