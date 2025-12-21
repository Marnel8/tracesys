import { useMemo, useCallback, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { REPORT_ENDPOINTS } from "./useReport";

export interface ReportViewNotification {
  id: string;
  reportId: string;
  studentId: string;
  instructorId: string;
  createdAt: string;
  updatedAt: string;
  report?: {
    id: string;
    title: string;
    type: string;
    status: string;
    submittedDate?: string | null;
  } | null;
  instructor?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  } | null;
}

/**
 * Get storage key for read report views (user-specific)
 */
function getReadReportViewsKey(studentId?: string): string {
  if (!studentId) return "student_report_views_read";
  return `student_report_views_read_${studentId}`;
}

/**
 * Get storage key for last check time (user-specific)
 */
function getLastCheckTimeKey(studentId?: string): string {
  if (!studentId) return "student_report_views_last_check";
  return `student_report_views_last_check_${studentId}`;
}

/**
 * Get read report view IDs from localStorage (user-specific)
 */
function getReadReportViewIds(studentId?: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const key = getReadReportViewsKey(studentId);
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    return JSON.parse(stored) as string[];
  } catch {
    return [];
  }
}

/**
 * Save read report view IDs to localStorage (user-specific)
 */
function saveReadReportViewIds(ids: string[], studentId?: string): void {
  if (typeof window === "undefined") return;
  try {
    const key = getReadReportViewsKey(studentId);
    localStorage.setItem(key, JSON.stringify(ids));
  } catch (error) {
    console.error("Failed to save read report views:", error);
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
    console.error("Failed to save report views last check time:", error);
  }
}

/**
 * Fetch report view notifications for a student from the API
 */
function useStudentReportViews(studentId?: string, lastCheckTime?: string | null) {
  return useQuery({
    queryKey: ["studentReportViews", studentId, lastCheckTime],
    enabled: !!studentId,
    queryFn: async (): Promise<ReportViewNotification[]> => {
      if (!studentId) return [];
      const params = new URLSearchParams();
      if (lastCheckTime) {
        params.append("lastCheckTime", lastCheckTime);
      }
      const res = await api.get(
        `${REPORT_ENDPOINTS.studentViews(studentId)}${
          params.toString() ? `?${params.toString()}` : ""
        }`
      );
      return (res.data.data || []) as ReportViewNotification[];
    },
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });
}

/**
 * Hook for managing student report view notifications
 * Tracks read/unread status client-side using localStorage
 */
export function useStudentReportViewNotifications(studentId?: string) {
  const initialLastCheckTime = getLastCheckTime(studentId);

  const { data: viewsData, isLoading, error } = useStudentReportViews(
    studentId,
    initialLastCheckTime || undefined
  );

  const views = useMemo(() => {
    if (!studentId) return [];
    return (viewsData || []) as ReportViewNotification[];
  }, [viewsData, studentId]);

  // Track read IDs and last check time in state so they update reactively
  const [readIds, setReadIds] = useState<string[]>(() =>
    getReadReportViewIds(studentId)
  );
  const [lastCheckTimeState, setLastCheckTimeState] = useState<string | null>(
    () => getLastCheckTime(studentId)
  );

  // Sync with localStorage when studentId or views data changes
  useEffect(() => {
    if (studentId) {
      setReadIds(getReadReportViewIds(studentId));
      setLastCheckTimeState(getLastCheckTime(studentId));
    } else {
      // Clear state when studentId is undefined
      setReadIds([]);
      setLastCheckTimeState(null);
    }
  }, [studentId, viewsData]);

  // Determine unread report view notifications
  const unreadViews = useMemo(() => {
    if (!views.length) return [];

    const filtered = views.filter((view) => {
      // Check if already read
      if (readIds.includes(view.id)) {
        return false;
      }

      // Check if created after last check time (or if no last check time, consider it new)
      if (lastCheckTimeState) {
        const viewDate = new Date(view.createdAt);
        const lastCheck = new Date(lastCheckTimeState);
        return viewDate > lastCheck;
      }

      // If no last check time, consider all unread views as new
      return true;
    });

    return filtered;
  }, [views, readIds, lastCheckTimeState]);

  const unreadCount = unreadViews.length;

  // Mark a report view as read
  const markAsRead = useCallback(
    (viewId: string) => {
      if (!studentId) return;

      setReadIds((prevReadIds) => {
        if (prevReadIds.includes(viewId)) {
          return prevReadIds;
        }
        const newReadIds = [...prevReadIds, viewId];
        saveReadReportViewIds(newReadIds, studentId);
        return newReadIds;
      });
    },
    [studentId]
  );

  // Mark all report views as read
  const markAllAsRead = useCallback(() => {
    if (!studentId) return;

    setReadIds((prevReadIds) => {
      const allViewIds = views.map((v) => v.id);
      const newReadIds = [...new Set([...prevReadIds, ...allViewIds])];
      const newLastCheckTime = new Date().toISOString();
      setLastCheckTimeState(newLastCheckTime);
      saveReadReportViewIds(newReadIds, studentId);
      saveLastCheckTime(studentId);
      return newReadIds;
    });
  }, [views, studentId]);

  return {
    views,
    unreadViews,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
  };
}










