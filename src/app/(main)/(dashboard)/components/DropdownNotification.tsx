"use client"

import * as React from "react"
import { IoMdNotificationsOutline } from "react-icons/io";
import { 
  BsEyeFill, 
  BsEyeSlashFill, 
  BsPersonBadge, 
  BsEnvelope, 
  BsBriefcase, 
  BsChatSquareText,
  BsCardHeading 
} from "react-icons/bs";
import { CgSpinner } from "react-icons/cg";

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"; // Optional accessibility helper, or we use sr-only

import { getNotifications, Notification } from "@/services/api/Notification/getnotifications";
import { markNotificationAsRead } from "@/services/api/Notification/notificationRead";
import { markNotificationAsUnread } from "@/services/api/Notification/notificationUnread";
import { getFullNotificationById, FullNotification } from "@/services/api/Notification/fullNotificationById";

export function DropdownNotification() {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isError, setIsError] = React.useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);
  const [selectedNotification, setSelectedNotification] = React.useState<FullNotification | null>(null);
  const [isModalLoading, setIsModalLoading] = React.useState<boolean>(false);
  const [togglingId, setTogglingId] = React.useState<string | null>(null);

  // --- 1. Polling Logic ---
  React.useEffect(() => {
    let isMounted = true;

    const fetchNotifications = async (isBackgroundCheck = false) => {
      if (!isBackgroundCheck) {
        setIsLoading(true);
        setIsError(false);
      }

      try {
        const data = await getNotifications();
        if (isMounted) {
          setNotifications(data);
          if (isBackgroundCheck) setIsError(false);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        if (isMounted && !isBackgroundCheck) {
          setIsError(true);
        }
      } finally {
        if (isMounted && !isBackgroundCheck) {
          setIsLoading(false);
        }
      }
    };

    fetchNotifications();
    const intervalId = setInterval(() => {
      fetchNotifications(true);
    }, 10000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  // --- 2. Interaction Logic ---
  const handleNotificationClick = (id: string) => {
    if (togglingId) return;

    const partialNotification = notifications.find(n => n.id === id);
    if (!partialNotification) return;

    setIsModalLoading(true);
    setSelectedNotification({
      id: partialNotification.id,
      message: partialNotification.message,
      createdAt: partialNotification.createdAt,
      description: "", 
      isRead: true,
    });
    setIsDialogOpen(true);

    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );

    const fetchFullData = async () => {
      try {
        await markNotificationAsRead(id);
        const fullDetails = await getFullNotificationById(id);
        setSelectedNotification(fullDetails);
      } catch (error) {
        console.error("Failed to get full details:", error);
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, isRead: false } : n))
        );
      } finally {
        setIsModalLoading(false);
      }
    };

    fetchFullData();
  };

  const handleToggleReadStatus = async (id: string, currentStatus: boolean) => {
    setTogglingId(id);
    try {
      if (currentStatus) await markNotificationAsUnread(id);
      else await markNotificationAsRead(id);

      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: !n.isRead } : n))
      );
    } catch (error) {
      console.error("Failed to toggle status:", error);
    } finally {
      setTogglingId(null);
    }
  };

  // --- 3. Parsing Logic ---
  const parseContent = (text: string) => {
    if (!text) return { message: "", senderDetails: null };
    
    // Splits by " -- Sent by:" (case insensitive, flexible spaces)
    const parts = text.split(/\s+--\s+Sent by:\s*/i);
    
    const message = parts[0];
    const senderRaw = parts.length > 1 ? parts[1] : null;

    return { message, senderRaw };
  };

  const extractSenderInfo = (details: string) => {
    const nameMatch = details.match(/Name:\s*(.*?)(?=\s+Role:|$)/i);
    const roleMatch = details.match(/Role:\s*(.*?)(?=\s+Email:|$)/i);
    const emailMatch = details.match(/Email:\s*(.*)/i);

    return {
      name: nameMatch ? nameMatch[1].trim() : null,
      role: roleMatch ? roleMatch[1].trim() : null,
      email: emailMatch ? emailMatch[1].trim() : null,
      raw: details 
    };
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  const { message: modalMessage, senderRaw } = selectedNotification 
    ? parseContent(selectedNotification.description) 
    : { message: "", senderRaw: null };

  const senderInfo = senderRaw ? extractSenderInfo(senderRaw) : null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <IoMdNotificationsOutline className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center h-4 w-4 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-80 p-1" align="end">
          <DropdownMenuLabel className="p-2">
            <div className="flex items-center justify-between">
              Notifications
              <span className="text-sm text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} unread` : "No new notifications"}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
          ) : isError ? (
            <div className="p-4 text-center text-sm text-destructive">Failed to load.</div>
          ) : notifications.length > 0 ? (
            <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`flex items-start justify-between p-3 rounded-md cursor-pointer mb-1 last:mb-0 ${
                    !notification.isRead ? "bg-accent dark:bg-accent/40" : "bg-transparent"
                  } hover:bg-muted dark:hover:bg-muted/50 group`}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <div className="flex flex-col gap-1 flex-1 pr-2">
                    <span className={`text-sm font-medium leading-snug ${!notification.isRead ? "text-blue-600 dark:text-blue-400" : "text-foreground"}`}>
                      {notification.message}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleString("en-US", {
                        timeZone: "Asia/Colombo", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                      })}
                    </span>
                  </div>
                  <Button
                    onClick={e => {
                      e.stopPropagation();
                      handleToggleReadStatus(notification.id, notification.isRead);
                    }}
                    variant="ghost" size="icon" className="w-8 h-8 shrink-0 opacity-70 group-hover:opacity-100"
                    disabled={togglingId === notification.id}
                  >
                    {togglingId === notification.id ? <CgSpinner className="animate-spin" /> 
                      : notification.isRead ? <BsEyeFill className="text-muted-foreground" /> 
                      : <BsEyeSlashFill className="text-blue-600 dark:text-blue-400" />}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">No notifications.</div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* --- MODAL / DIALOG --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          
          {/* Hidden Title for Accessibility Requirement */}
          <DialogHeader className="sr-only">
            <DialogTitle>Notification Details</DialogTitle>
          </DialogHeader>

          {isModalLoading ? (
            <div className="flex flex-col items-center py-10 text-muted-foreground">
              <CgSpinner className="h-8 w-8 animate-spin mb-2" />
              <span>Loading details...</span>
            </div>
          ) : (
            selectedNotification && (
              <div className="flex flex-col gap-4 py-2 pt-6">
                
                {/* 1. SUBJECT / HEADLINE SECTION */}
                <div className="bg-muted/40 rounded-lg border overflow-hidden">
                  <div className="px-4 py-2 bg-muted/60 border-b text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                     <BsCardHeading className="w-3 h-3" />
                     Subject
                  </div>
                  <div className="p-4 text-base font-semibold text-foreground leading-snug">
                    {selectedNotification.message}
                  </div>
                </div>

                {/* 2. MESSAGE BODY SECTION */}
                <div className="bg-muted/40 rounded-lg border overflow-hidden">
                  <div className="px-4 py-2 bg-muted/60 border-b text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                     <BsChatSquareText className="w-3 h-3" />
                     Message
                  </div>
                  <div className="p-4 text-sm text-foreground leading-relaxed">
                    {modalMessage}
                  </div>
                </div>

                {/* 3. SENDER DETAILS SECTION */}
                {senderInfo && (
                  <div className="bg-muted/40 rounded-lg border overflow-hidden">
                     <div className="px-4 py-2 bg-muted/60 border-b text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Sender Details
                     </div>
                     <div className="p-4 space-y-3">
                        {senderInfo.name ? (
                          <>
                            <div className="flex items-start gap-3 text-sm">
                              <BsPersonBadge className="w-4 h-4 text-blue-500 mt-0.5" />
                              <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground">Name</span>
                                <span className="font-medium text-foreground">{senderInfo.name}</span>
                              </div>
                            </div>

                            <div className="flex items-start gap-3 text-sm">
                              <BsBriefcase className="w-4 h-4 text-orange-500 mt-0.5" />
                              <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground">Role</span>
                                <span className="font-medium text-foreground capitalize">{senderInfo.role}</span>
                              </div>
                            </div>

                            <div className="flex items-start gap-3 text-sm">
                              <BsEnvelope className="w-4 h-4 text-green-500 mt-0.5" />
                              <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground">Email</span>
                                <span className="font-medium text-foreground break-all">{senderInfo.email}</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="text-sm text-muted-foreground break-words italic">
                            {senderInfo.raw}
                          </div>
                        )}
                     </div>
                  </div>
                )}

                <DialogFooter className="sm:justify-between items-center border-t pt-4 mt-2">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    System Notification
                  </span>
                  <div className="text-xs text-muted-foreground">
                    {new Date(selectedNotification.createdAt).toLocaleString("en-US", {
                      timeZone: "Asia/Colombo",
                      weekday: "short", year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </div>
                </DialogFooter>
              </div>
            )
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}