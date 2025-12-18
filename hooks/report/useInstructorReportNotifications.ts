import { useMemo, useCallback, useState, useEffect } from "react";
import { useReports } from "./useReport";
import { useStudentsByTeacher } from "@/hooks/student/useStudent";
import type { Report } from "./useReport";

/**
 * Get storage key for read reports (instructor-specific)
 */
function getReadReportsKey(instructorId?: string): string {
  if (!instructorId) return "instructor_reports_read";
  return `instructor_reports_read_${instructorId}`;
}

/**
 * Get storage key for last check time (instructor-specific)
 */
function getLastCheckTimeKey(instructorId?: string): string {
  if (!instructorId) return "instructor_reports_last_check";
  return `instructor_reports_last_check_${instructorId}`;
}

/**
 * Get read report IDs from localStorage (instructor-specific)
 */
function getReadReportIds(instructorId?: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const key = getReadReportsKey(instructorId);
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    return JSON.parse(stored) as string[];
  } catch {
    return [];
  }
}

/**
 * Save read report IDs to localStorage (instructor-specific)
 */
function saveReadReportIds(ids: string[], instructorId?: string): void {
  if (typeof window === "undefined") return;
  try {
    const key = getReadReportsKey(instructorId);
    localStorage.setItem(key, JSON.stringify(ids));
  } catch (error) {
    console.error("Failed to save read reports:", error);
  }
}

/**
 * Get last check time from localStorage (instructor-specific)
 */
function getLastCheckTime(instructorId?: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const key = getLastCheckTimeKey(instructorId);
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Save last check time to localStorage (instructor-specific)
 */
function saveLastCheckTime(instructorId?: string): void {
  if (typeof window === "undefined") return;
  try {
    const key = getLastCheckTimeKey(instructorId);
    localStorage.setItem(key, new Date().toISOString());
  } catch (error) {
    console.error("Failed to save last check time:", error);
  }
}

/**
 * Hook for managing instructor report notifications
 * Tracks read/unread status client-side using localStorage
 * Only shows reports from students under this instructor
 */
export function useInstructorReportNotifications(instructorId?: string) {
  // Fetch students under this instructor
  const { data: studentsResp, isLoading: isStudentsLoading } = useStudentsByTeacher(
    instructorId || "",
    {
      page: 1,
      limit: 1000,
    }
  );

  const students = useMemo(() => {
    return (studentsResp as any)?.data?.students ?? [];
  }, [studentsResp]);

  const studentIds = useMemo(() => {
    return new Set(students.map((s: any) => s.id));
  }, [students]);

  // Fetch submitted reports
  const { data: reportsData, isLoading: isReportsLoading, error } = useReports({
    page: 1,
    limit: 1000,
    status: "submitted",
  });

  const allReports = useMemo(() => {
    return (reportsData as any)?.reports ?? [];
  }, [reportsData]);

  // Filter reports to only include those from instructor's students
  const reports = useMemo(() => {
    if (!instructorId || studentIds.size === 0) return [];
    return allReports.filter((report: Report) => studentIds.has(report.studentId));
  }, [allReports, studentIds, instructorId]);

  // Track read IDs and last check time in state so they update reactively
  const [readIds, setReadIds] = useState<string[]>(() => getReadReportIds(instructorId));
  const [lastCheckTime, setLastCheckTime] = useState<string | null>(() =>
    getLastCheckTime(instructorId)
  );

  // Sync with localStorage when instructorId or reports data changes
  useEffect(() => {
    if (instructorId) {
      setReadIds(getReadReportIds(instructorId));
      setLastCheckTime(getLastCheckTime(instructorId));
    } else {
      // Clear state when instructorId is undefined
      setReadIds([]);
      setLastCheckTime(null);
    }
  }, [instructorId, reportsData]);

  // Determine unread reports
  const unreadReports = useMemo(() => {
    if (!reports.length) return [];

    const filtered = reports.filter((report: Report) => {
      // If the report was submitted AFTER the last check time, always treat it as unread,
      // even if it was previously marked as read (covers re-submissions).
      if (lastCheckTime && report.submittedDate) {
        const reportDate = new Date(report.submittedDate);
        const lastCheck = new Date(lastCheckTime);
        if (reportDate > lastCheck) {
          return true;
        }
      }

      // For reports submitted on or before the last check time, use the readIds list.
      if (readIds.includes(report.id)) {
        return false;
      }

      // If we don't have a lastCheckTime or submittedDate, consider the report unread
      // unless it was explicitly marked as read.
      return true;
    });

    return filtered;
  }, [reports, readIds, lastCheckTime]);

  const unreadCount = unreadReports.length;
  const isLoading = isStudentsLoading || isReportsLoading;

  // Mark a report as read
  const markAsRead = useCallback(
    (reportId: string) => {
      if (!instructorId) return;

      setReadIds((prevReadIds) => {
        // Check if already read to prevent duplicates
        if (prevReadIds.includes(reportId)) {
          return prevReadIds;
        }
        const newReadIds = [...prevReadIds, reportId];
        // Save to localStorage atomically
        saveReadReportIds(newReadIds, instructorId);
        return newReadIds;
      });
    },
    [instructorId]
  );

  // Mark all reports as read
  const markAllAsRead = useCallback(() => {
    if (!instructorId) return;

    setReadIds((prevReadIds) => {
      const allReportIds = reports.map((r) => r.id);
      const newReadIds = [...new Set([...prevReadIds, ...allReportIds])];
      const newLastCheckTime = new Date().toISOString();
      setLastCheckTime(newLastCheckTime);
      // Save to localStorage atomically
      saveReadReportIds(newReadIds, instructorId);
      saveLastCheckTime(instructorId);
      return newReadIds;
    });
  }, [reports, instructorId]);

  return {
    reports,
    unreadReports,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
  };
}

