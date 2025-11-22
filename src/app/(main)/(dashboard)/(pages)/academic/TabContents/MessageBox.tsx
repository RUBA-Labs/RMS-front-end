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

interface Announcement {
  title: string;
  viewer: string;
  date: string;
  message: string;
  
}

const initialSentAnnouncements: Announcement[] = [
  {
    title: "Scheduled Maintenance Break",
    viewer: "students",
    date: "2025-11-15",
    message: "The system will be down for scheduled maintenance on 2025-11-20 from 2:00 AM to 4:00 AM. Please save all your work before this time.",
  },
  {
    title: "New Feature: Dark Mode",
    viewer: "Academic staff",
    date: "2025-11-10",
    message: "We are excited to announce that dark mode is now available in the user settings. You can enable it from the profile settings page.",
  },
  {
    title: "Welcome to the New Semester",
    viewer: "Non academic staff",
    date: "2025-09-01",
    message: "Welcome back to all students and staff. We wish you a successful semester. Please check your timetables for updates.",
  },
];

export function MessageBox() {
  const [title, setTitle] = useState("");
  const [viewer, setViewer ] = useState("");
  const [message, setMessage] = useState("");
  const [sentAnnouncements, setSentAnnouncements] = useState<Announcement[]>(initialSentAnnouncements);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  const handleSendAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && viewer && message) {
      const newAnnouncement: Announcement = {
        title,
        viewer,
        message,
        date: new Date().toISOString().split('T')[0],
      };
      setSentAnnouncements([newAnnouncement, ...sentAnnouncements]);
      setTitle("");
      setViewer("");
      setMessage("");
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
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter the title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
            <Label className="block mb-2">Select Viwer</Label>
            <Select onValueChange={setViewer} value={viewer}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select the viewer" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Viewer</SelectLabel>
                  <SelectItem value="viewer1">Students</SelectItem>
                  <SelectItem value="viewer2">Academic staff</SelectItem>
                  <SelectItem value="viewer3">Non academic staff</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Enter your announcement"
                    className="min-h-[200px]"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Send Announcement
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
            <CardContent className="space-y-4">
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
              <DialogTitle>{ selectedAnnouncement.title}</DialogTitle>
              <h3 className="text-sm text-gray-500"> Viewer :</h3>
              <DialogTitle>{selectedAnnouncement.viewer}</DialogTitle>
              <h3 className="text-sm text-gray-500"> Date :</h3>
              <DialogDescription className="text-sm text-gray-500">
                {selectedAnnouncement.date}
              </DialogDescription>
              <h3 className="text-sm text-gray-500"> Message :</h3>
            </DialogHeader>
            <p className="text-base">{selectedAnnouncement.message}</p>
          </DialogContent>
        </Dialog>
      )}
    </ResizablePanelGroup>
  );
}