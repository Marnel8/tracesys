import { useMemo, useCallback, useState, useEffect } from "react";
import { useAnnouncements } from "./useAnnouncement";
import type { Announcement } from "@/data/announcements";

/**
 * Get storage key for read announcements (user-specific)
 */
function getReadAnnouncementsKey(studentId?: string): string {
  if (!studentId) return "student_announcements_read";
  return `student_announcements_read_${studentId}`;
}

/**
 * Get storage key for last check time (user-specific)
 */
function getLastCheckTimeKey(studentId?: string): string {
  if (!studentId) return "student_announcements_last_check";
  return `student_announcements_last_check_${studentId}`;
}

/**
 * Get read announcement IDs from localStorage (user-specific)
 */
function getReadAnnouncementIds(studentId?: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const key = getReadAnnouncementsKey(studentId);
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    return JSON.parse(stored) as string[];
  } catch {
    return [];
  }
}

/**
 * Save read announcement IDs to localStorage (user-specific)
 */
function saveReadAnnouncementIds(ids: string[], studentId?: string): void {
  if (typeof window === "undefined") return;
  try {
    const key = getReadAnnouncementsKey(studentId);
    localStorage.setItem(key, JSON.stringify(ids));
  } catch (error) {
    console.error("Failed to save read announcements:", error);
  }
}

/**
 * Get last check time from localStorage (user-specific)
 */
function getLastCheckTime(studentId?: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const key = getLastCheckTimeKey(studentId);
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Save last check time to localStorage (user-specific)
 */
function saveLastCheckTime(studentId?: string): void {
  if (typeof window === "undefined") return;
  try {
    const key = getLastCheckTimeKey(studentId);
    localStorage.setItem(key, new Date().toISOString());
  } catch (error) {
    console.error("Failed to save last check time:", error);
  }
}

/**
 * Hook for managing student announcement notifications
 * Tracks read/unread status client-side using localStorage
 */
export function useStudentAnnouncementNotifications(studentId?: string) {
  // Fetch published announcements for the student (only when studentId exists)
  const { data: announcementsData, isLoading, error } = useAnnouncements(
    {
      status: "Published",
      userId: studentId,
      page: 1,
      limit: 20, // Get recent announcements
    },
    {
      enabled: !!studentId, // Only fetch when studentId is provided
      refetchOnWindowFocus: true, // Refetch when window regains focus
      refetchInterval: 30000, // Refetch every 30 seconds to check for new announcements
    }
  );

  const announcements = useMemo(() => {
    if (!studentId) return [];
    return (
      (announcementsData as any)?.announcements ??
      (announcementsData as any)?.data?.announcements ??
      []
    ) as Announcement[];
  }, [announcementsData, studentId]);

  // Track read IDs and last check time in state so they update reactively
  const [readIds, setReadIds] = useState<string[]>(() => getReadAnnouncementIds(studentId));
  const [lastCheckTime, setLastCheckTime] = useState<string | null>(() => getLastCheckTime(studentId));

  // Sync with localStorage when studentId or announcements data changes
  useEffect(() => {
    if (studentId) {
      setReadIds(getReadAnnouncementIds(studentId));
      setLastCheckTime(getLastCheckTime(studentId));
    } else {
      // Clear state when studentId is undefined
      setReadIds([]);
      setLastCheckTime(null);
    }
  }, [studentId, announcementsData]); // Re-check when studentId or announcements data changes

  // Determine unread announcements
  const unreadAnnouncements = useMemo(() => {
    if (!announcements.length) return [];

    const filtered = announcements.filter((announcement) => {
      // Check if already read
      if (readIds.includes(announcement.id)) {
        return false;
      }

      // Check if created after last check time (or if no last check time, consider it new)
      if (lastCheckTime) {
        const announcementDate = new Date(announcement.createdAt);
        const lastCheck = new Date(lastCheckTime);
        return announcementDate > lastCheck;
      }

      // If no last check time, consider all unread announcements as new
      return true;
    });

    // Debug logging (remove in production)
    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
      console.log("Unread announcements filter:", {
        totalAnnouncements: announcements.length,
        readIds: readIds.length,
        lastCheckTime,
        filteredCount: filtered.length,
        announcementIds: announcements.map(a => ({ id: a.id, createdAt: a.createdAt, title: a.title })),
      });
    }

    return filtered;
  }, [announcements, readIds, lastCheckTime]);

  const unreadCount = unreadAnnouncements.length;

  // Mark an announcement as read (using functional setState to prevent race conditions)
  const markAsRead = useCallback(
    (announcementId: string) => {
      if (!studentId) return;
      
      setReadIds((prevReadIds) => {
        // Check if already read to prevent duplicates
        if (prevReadIds.includes(announcementId)) {
          return prevReadIds;
        }
        const newReadIds = [...prevReadIds, announcementId];
        // Save to localStorage atomically
        saveReadAnnouncementIds(newReadIds, studentId);
        return newReadIds;
      });
    },
    [studentId]
  );

  // Mark all announcements as read
  const markAllAsRead = useCallback(() => {
    if (!studentId) return;
    
    setReadIds((prevReadIds) => {
      const allAnnouncementIds = announcements.map((a) => a.id);
      const newReadIds = [...new Set([...prevReadIds, ...allAnnouncementIds])];
      const newLastCheckTime = new Date().toISOString();
      setLastCheckTime(newLastCheckTime);
      // Save to localStorage atomically
      saveReadAnnouncementIds(newReadIds, studentId);
      saveLastCheckTime(studentId);
      return newReadIds;
    });
  }, [announcements, studentId]);

  return {
    announcements,
    unreadAnnouncements,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
  };
}

