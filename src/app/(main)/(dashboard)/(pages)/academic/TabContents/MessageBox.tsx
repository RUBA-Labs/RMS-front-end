"use client";

import { useState, useEffect } from "react";
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

// Import the API services
import { createAnnouncement } from '@/services/api/Announcements/CreateAnnouncement';
import { getAnnouncementsCurrentUser } from '@/services/api/Announcements/GetAnnouncementsCurrentUser';

interface Announcement {
  title: string;
  viewer: string;
  date: string;
  message: string;
}

export function MessageBox() {
  const [title, setTitle] = useState("");
  const [viewer, setViewer] = useState("");
  const [message, setMessage] = useState("");
  
  // State for the list of sent announcements
  const [sentAnnouncements, setSentAnnouncements] = useState<Announcement[]>([]);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  
  // Loading states
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Function to fetch announcements from the backend
  const fetchAnnouncements = async () => {
    try {
      const data = await getAnnouncementsCurrentUser();
      
      // 1. Sort by raw createdAt timestamp (Desc) BEFORE mapping to string date
      // This ensures exact time sorting, so newer items on the same day appear first
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // 2. Map the API response to the local UI interface
      const mappedData: Announcement[] = data.map((item) => ({
        title: item.title,
        viewer: item.selectedViewer,
        message: item.message,
        // Format the date (YYYY-MM-DD)
        date: new Date(item.createdAt).toISOString().split('T')[0],
      }));

      setSentAnnouncements(mappedData);
    } catch (error) {
      console.error("Failed to load sent announcements", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Basic Empty Check
    if (!title || !viewer || !message) {
        alert("Please fill in all fields.");
        return;
    }

    // 2. Length Validation (Prevents 400 Bad Request)
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
      // 3. Call the backend API to create
      await createAnnouncement({
        title,
        message,
        selectedViewer: viewer, 
      });

      // 4. Reset form
      setTitle("");
      setViewer("");
      setMessage("");

      alert("Announcement sent successfully!");

      // 5. Refresh the list to show the newly created item from the server
      await fetchAnnouncements();

    } catch (error) {
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
              {isLoadingHistory ? (
                <div className="text-center text-gray-500 p-4">Loading history...</div>
              ) : sentAnnouncements.length === 0 ? (
                <div className="text-center text-gray-500 p-4">No announcements sent yet.</div>
              ) : (
                sentAnnouncements.map((announcement, index) => (
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
                ))
              )}
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