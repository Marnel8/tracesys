"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Check, MessageSquare, Eye } from "lucide-react";
import { useStudentAnnouncementNotifications } from "@/hooks/announcement/useStudentAnnouncementNotifications";
import { useAuth } from "@/hooks/auth/useAuth";
import { useStudent } from "@/hooks/student/useStudent";
import type { Announcement } from "@/data/announcements";

function getPriorityColor(priority: Announcement["priority"]) {
  switch (priority) {
    case "High":
      return "bg-red-100 text-red-800";
    case "Medium":
      return "bg-yellow-100 text-yellow-800";
    case "Low":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  // Handle future dates (edge case)
  if (diffInMinutes < 0) return "Just now";

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
}

interface AnnouncementNotificationsProps {
  studentId?: string;
}

export function AnnouncementNotifications({
  studentId,
}: AnnouncementNotificationsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const normalizedUser: any = (user as any)?.data ?? user;
  const effectiveStudentId = studentId || normalizedUser?.id;
  const [isOpen, setIsOpen] = useState(false);

  // Get student data to extract instructor ID
  const { data: studentResponse } = useStudent(effectiveStudentId || "");
  const studentRecord: any = (studentResponse as any)?.data ?? studentResponse;
  const mainSection = studentRecord?.enrollments?.[0]?.section;
  const instructorId =
    mainSection?.instructor?.id || mainSection?.instructorId || undefined;

  const {
    unreadAnnouncements,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    announcements, // Add this for debugging
  } = useStudentAnnouncementNotifications(effectiveStudentId, instructorId);

  // Debug logging (remove in production)
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    console.log("AnnouncementNotifications Debug:", {
      effectiveStudentId,
      isLoading,
      error,
      totalAnnouncements: announcements?.length || 0,
      unreadCount,
      unreadAnnouncements: unreadAnnouncements?.length || 0,
    });
  }

  const handleNotificationClick = (announcement: Announcement) => {
    markAsRead(announcement.id);
    setIsOpen(false);
    // Navigate to student dashboard where announcements are shown
    router.push("/dashboard/student");
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleViewAll = () => {
    setIsOpen(false);
    router.push("/dashboard/student");
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-8 w-8 sm:h-auto sm:w-auto sm:px-3 sm:py-2 p-0"
          aria-label="Notifications"
        >
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
          <h3 className="font-semibold text-sm">Announcements</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-7 text-xs"
            >
              <Check className="w-3 h-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-96">
          {error ? (
            <div className="p-4 text-center text-red-500">
              <Bell className="w-8 h-8 mx-auto mb-2 text-red-300" />
              <p className="text-sm font-medium mb-2">Failed to load announcements</p>
              <p className="text-xs text-gray-500">
                {(error as any)?.response?.data?.message || 
                 (error as any)?.message || 
                 "Please try again later"}
              </p>
            </div>
          ) : isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
              </div>
            </div>
          ) : unreadAnnouncements.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No new announcements</p>
              {process.env.NODE_ENV === "development" && announcements.length > 0 && (
                <p className="text-xs mt-2 text-gray-400">
                  Debug: {announcements.length} total, {readIds.length} read
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {unreadAnnouncements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-l-2 border-primary-500 bg-primary-50/30"
                  onClick={() => handleNotificationClick(announcement)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <MessageSquare className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {announcement.title}
                        </p>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${getPriorityColor(announcement.priority)}`}
                        >
                          {announcement.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-700 mb-2 line-clamp-2">
                        {announcement.content}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {formatTimestamp(announcement.createdAt)}
                        </span>
                        {announcement.isPinned && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-yellow-100 text-yellow-800"
                          >
                            Pinned
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {unreadAnnouncements.length > 0 && (
          <div className="p-3 border-t">
            <Button
              variant="outline"
              className="w-full"
              size="sm"
              onClick={handleViewAll}
            >
              <Eye className="w-4 h-4 mr-2" />
              View All Announcements
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

