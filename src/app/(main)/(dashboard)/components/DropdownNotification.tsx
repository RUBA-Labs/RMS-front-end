// components/ui/DropdownNotification.tsx

"use client"

import * as React from "react"
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu"
import { IoMdNotificationsOutline } from "react-icons/io";
import { BsEyeFill, BsEyeSlashFill } from "react-icons/bs";

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Notification } from "@/types/Notification"; 

type Checked = DropdownMenuCheckboxItemProps["checked"]

export function DropdownNotification() {
  const [notifications, setNotifications] = React.useState<Notification[]>([
    {
      id: "1",
      message: "You have a new message from the Faculty of Arts.",
      isRead: false,
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: "2",
      message: "Your application for the art history course has been approved.",
      isRead: false,
      timestamp: new Date(Date.now() - 7200000),
    },
    {
      id: "3",
      message: "Reminder: Your project is due tomorrow.",
      isRead: true,
      timestamp: new Date(Date.now() - 86400000),
    },
  ]);

  const toggleReadStatus = (id: string) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === id ? { ...notification, isRead: !notification.isRead } : notification
      )
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
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
            <span className="text-sm text-muted-foreground">{unreadCount > 0 ? `${unreadCount} unread` : 'No new notifications'}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`flex items-start justify-between p-2 rounded-md ${!notification.isRead ? 'bg-accent dark:bg-accent/40' : 'bg-transparent'} transition-colors hover:bg-muted dark:hover:bg-muted/50`}
            >
              <div className="flex flex-col gap-0.5">
                <span className={`text-sm font-medium ${!notification.isRead ? 'text-blue-600 dark:text-blue-400' : 'text-foreground'}`}>
                  {notification.message}
                </span>
                <span className="text-xs text-muted-foreground">
                  {notification.timestamp.toLocaleString()}
                </span>
              </div>
              <Button 
                onClick={() => toggleReadStatus(notification.id)} 
                variant="ghost" 
                size="icon" 
                className="w-8 h-8 flex-shrink-0 ml-2"
              >
                {notification.isRead ? (
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
  )
}