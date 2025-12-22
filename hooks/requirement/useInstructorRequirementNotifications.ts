import { useMemo, useCallback, useState, useEffect } from "react";
import { useRequirements } from "./useRequirement";
import { useStudentsByTeacher } from "@/hooks/student/useStudent";
import type { Requirement } from "./useRequirement";

/**
 * Get storage key for read requirements (instructor-specific)
 */
function getReadRequirementsKey(instructorId?: string): string {
  if (!instructorId) return "instructor_requirements_read";
  return `instructor_requirements_read_${instructorId}`;
}

/**
 * Get storage key for last check time (instructor-specific)
 */
function getLastCheckTimeKey(instructorId?: string): string {
  if (!instructorId) return "instructor_requirements_last_check";
  return `instructor_requirements_last_check_${instructorId}`;
}

/**
 * Get read requirement IDs from localStorage (instructor-specific)
 */
function getReadRequirementIds(instructorId?: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const key = getReadRequirementsKey(instructorId);
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    return JSON.parse(stored) as string[];
  } catch {
    return [];
  }
}

/**
 * Save read requirement IDs to localStorage (instructor-specific)
 */
function saveReadRequirementIds(ids: string[], instructorId?: string): void {
  if (typeof window === "undefined") return;
  try {
    const key = getReadRequirementsKey(instructorId);
    localStorage.setItem(key, JSON.stringify(ids));
  } catch (error) {
    console.error("Failed to save read requirements:", error);
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
 * Hook for managing instructor requirement notifications
 * Tracks read/unread status client-side using localStorage
 * Only shows requirements from students under this instructor
 */
export function useInstructorRequirementNotifications(instructorId?: string) {
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

  // Fetch submitted requirements
  const { data: requirementsData, isLoading: isRequirementsLoading, error } = useRequirements({
    page: 1,
    limit: 1000,
    status: "submitted",
  });

  const allRequirements = useMemo(() => {
    return (requirementsData as any)?.requirements ?? [];
  }, [requirementsData]);

  // Filter requirements to only include those from instructor's students
  const requirements = useMemo(() => {
    if (!instructorId || studentIds.size === 0) return [];
    return allRequirements.filter((req: Requirement) => studentIds.has(req.studentId));
  }, [allRequirements, studentIds, instructorId]);

  // Track read IDs and last check time in state so they update reactively
  const [readIds, setReadIds] = useState<string[]>(() => getReadRequirementIds(instructorId));
  const [lastCheckTime, setLastCheckTime] = useState<string | null>(() =>
    getLastCheckTime(instructorId)
  );

  // Sync with localStorage when instructorId or requirements data changes
  useEffect(() => {
    if (instructorId) {
      setReadIds(getReadRequirementIds(instructorId));
      setLastCheckTime(getLastCheckTime(instructorId));
    } else {
      // Clear state when instructorId is undefined
      setReadIds([]);
      setLastCheckTime(null);
    }
  }, [instructorId, requirementsData]);

  // Determine unread requirements
  const unreadRequirements = useMemo(() => {
    if (!requirements.length) return [];

    const filtered = requirements.filter((req: Requirement) => {
      // Check if already read
      if (readIds.includes(req.id)) {
        return false;
      }

      // Check if submitted after last check time (or if no last check time, consider it new)
      if (lastCheckTime && req.submittedDate) {
        const reqDate = new Date(req.submittedDate);
        const lastCheck = new Date(lastCheckTime);
        return reqDate > lastCheck;
      }

      // If no last check time or no submittedDate, consider all unread requirements as new
      return true;
    });

    return filtered;
  }, [requirements, readIds, lastCheckTime]);

  const unreadCount = unreadRequirements.length;
  const isLoading = isStudentsLoading || isRequirementsLoading;

  // Mark a requirement as read
  const markAsRead = useCallback(
    (requirementId: string) => {
      if (!instructorId) return;

      setReadIds((prevReadIds) => {
        // Check if already read to prevent duplicates
        if (prevReadIds.includes(requirementId)) {
          return prevReadIds;
        }
        const newReadIds = [...prevReadIds, requirementId];
        // Save to localStorage atomically
        saveReadRequirementIds(newReadIds, instructorId);
        return newReadIds;
      });
    },
    [instructorId]
  );

  // Mark all requirements as read
  const markAllAsRead = useCallback(() => {
    if (!instructorId) return;

    setReadIds((prevReadIds) => {
      const allRequirementIds = requirements.map((r) => r.id);
      const newReadIds = [...new Set([...prevReadIds, ...allRequirementIds])];
      const newLastCheckTime = new Date().toISOString();
      setLastCheckTime(newLastCheckTime);
      // Save to localStorage atomically
      saveReadRequirementIds(newReadIds, instructorId);
      saveLastCheckTime(instructorId);
      return newReadIds;
    });
  }, [requirements, instructorId]);

  return {
    requirements,
    unreadRequirements,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
  };
}
















