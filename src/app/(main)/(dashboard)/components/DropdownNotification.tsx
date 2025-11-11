"use client"

import * as React from "react"
import { IoMdNotificationsOutline } from "react-icons/io";
import { BsEyeFill, BsEyeSlashFill } from "react-icons/bs";
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
  DialogDescription,
} from "@/components/ui/dialog"

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

  React.useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const data = await getNotifications();
        setNotifications(data);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleNotificationClick = async (id: string) => {
    if (togglingId) return;

    setIsModalLoading(true);
    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, isRead: true } : n
      )
    );
    try {
      await markNotificationAsRead(id);
      const fullDetails = await getFullNotificationById(id);
      setSelectedNotification(fullDetails);
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Failed to get full notification details:", error);
      setNotifications(prev =>
        prev.map(n =>
          n.id === id ? { ...n, isRead: false } : n
        )
      );
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleToggleReadStatus = async (id: string, currentStatus: boolean) => {
    setTogglingId(id);
    try {
      if (currentStatus) {
        await markNotificationAsUnread(id);
      } else {
        await markNotificationAsRead(id);
      }

      setNotifications(prev =>
        prev.map(n =>
          n.id === id ? { ...n, isRead: !n.isRead } : n
        )
      );
    } catch (error) {
      console.error("Failed to toggle notification read status on the backend:", error);
    } finally {
      setTogglingId(null);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <IoMdNotificationsOutline className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center h-4 w-4 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                {unreadCount}
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
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading notifications...
            </div>
          ) : isError ? (
            <div className="p-4 text-center text-sm text-destructive">
              Failed to load notifications.
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start justify-between p-2 rounded-md cursor-pointer ${!notification.isRead ? 'bg-accent dark:bg-accent/40' : 'bg-transparent'} transition-colors hover:bg-muted dark:hover:bg-muted/50`}
                onClick={() => handleNotificationClick(notification.id)}
              >
                <div className="flex flex-col gap-0.5">
                  <span
                    className={`text-sm font-medium ${!notification.isRead ? 'text-blue-600 dark:text-blue-400' : 'text-foreground'}`}
                  >
                    {notification.message}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(notification.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Colombo' })}
                  </span>
                </div>

                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleReadStatus(notification.id, notification.isRead);
                  }}
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 flex-shrink-0 ml-2"
                  disabled={togglingId === notification.id}
                >
                  {togglingId === notification.id ? (
                    <CgSpinner className="h-4 w-4 animate-spin" />
                  ) : notification.isRead ? (
                    <BsEyeFill className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <BsEyeSlashFill className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  )}
                </Button>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications to display.
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedNotification?.message || "Loading..."}</DialogTitle>
          </DialogHeader>
          {isModalLoading ? (
            <div className="text-center text-muted-foreground py-4">
              Loading full notification details...
            </div>
          ) : (
            selectedNotification && (
              <div className="grid gap-4 py-4">
                <DialogDescription>
                  {selectedNotification.description}
                </DialogDescription>
                <div className="text-xs text-right text-muted-foreground mt-4">
                  {new Date(selectedNotification.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Colombo' })}
                </div>
              </div>
            )
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
