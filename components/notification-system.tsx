"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bell, Check, X, Eye, Clock, FileText, MessageSquare } from "lucide-react"

// Mock notifications data
const mockNotifications = [
  {
    id: 1,
    type: "attendance",
    title: "New Attendance Submission",
    message: "Juan Dela Cruz submitted attendance for today",
    timestamp: "2024-01-15T10:30:00Z",
    isRead: false,
    priority: "high",
    actionUrl: "/dashboard/instructor/attendance",
    studentName: "Juan Dela Cruz",
    studentId: "2021-00001",
  },
  {
    id: 2,
    type: "report",
    title: "Weekly Report Submitted",
    message: "Maria Santos submitted Week 8 report",
    timestamp: "2024-01-15T09:15:00Z",
    isRead: false,
    priority: "medium",
    actionUrl: "/dashboard/instructor/reports/weekly",
    studentName: "Maria Santos",
    studentId: "2021-00002",
  },
  {
    id: 3,
    type: "requirement",
    title: "Requirement Uploaded",
    message: "Pedro Rodriguez uploaded Medical Certificate",
    timestamp: "2024-01-15T08:45:00Z",
    isRead: true,
    priority: "medium",
    actionUrl: "/dashboard/instructor/requirements",
    studentName: "Pedro Rodriguez",
    studentId: "2021-00003",
  },
  {
    id: 4,
    type: "announcement",
    title: "Announcement Comment",
    message: "New comment on 'Weekly Report Reminder' announcement",
    timestamp: "2024-01-14T16:20:00Z",
    isRead: true,
    priority: "low",
    actionUrl: "/dashboard/instructor/announcements",
  },
  {
    id: 5,
    type: "system",
    title: "System Update",
    message: "TracèSys has been updated to version 2.1.0",
    timestamp: "2024-01-14T12:00:00Z",
    isRead: true,
    priority: "low",
    actionUrl: "/dashboard/instructor/settings",
  },
]

export function NotificationSystem() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [isOpen, setIsOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const markAsRead = (id: number) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })))
  }

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "attendance":
        return <Clock className="w-4 h-4 text-blue-600" />
      case "report":
        return <FileText className="w-4 h-4 text-green-600" />
      case "requirement":
        return <FileText className="w-4 h-4 text-purple-600" />
      case "announcement":
        return <MessageSquare className="w-4 h-4 text-orange-600" />
      case "system":
        return <Bell className="w-4 h-4 text-gray-600" />
      default:
        return <Bell className="w-4 h-4 text-gray-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 p-0 text-xs text-white flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <Check className="w-4 h-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 hover:bg-gray-50 cursor-pointer border-l-2 ${
                    notification.isRead ? "border-transparent" : "border-primary-500 bg-primary-50/30"
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p
                          className={`text-sm font-medium truncate ${
                            notification.isRead ? "text-gray-700" : "text-gray-900"
                          }`}
                        >
                          {notification.title}
                        </p>
                        <Badge variant="secondary" className={`text-xs ${getPriorityColor(notification.priority)}`}>
                          {notification.priority}
                        </Badge>
                      </div>
                      <p className={`text-xs mb-2 ${notification.isRead ? "text-gray-500" : "text-gray-700"}`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">{formatTimestamp(notification.timestamp)}</span>
                        <div className="flex gap-1">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                markAsRead(notification.id)
                              }}
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="p-3 border-t">
            <Button variant="outline" className="w-full" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              View All Notifications
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
