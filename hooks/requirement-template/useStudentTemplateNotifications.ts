import { useMemo, useCallback, useState, useEffect } from "react";
import { useRequirementTemplates } from "./useRequirementTemplate";
import type { RequirementTemplate } from "./useRequirementTemplate";

/**
 * Get storage key for read templates (user-specific)
 */
function getReadTemplatesKey(studentId?: string): string {
  if (!studentId) return "student_templates_read";
  return `student_templates_read_${studentId}`;
}

/**
 * Get storage key for last check time (user-specific)
 */
function getLastTemplateCheckTimeKey(studentId?: string): string {
  if (!studentId) return "student_templates_last_check";
  return `student_templates_last_check_${studentId}`;
}

/**
 * Get read template IDs from localStorage (user-specific)
 */
function getReadTemplateIds(studentId?: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const key = getReadTemplatesKey(studentId);
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    return JSON.parse(stored) as string[];
  } catch {
    return [];
  }
}

/**
 * Save read template IDs to localStorage (user-specific)
 */
function saveReadTemplateIds(ids: string[], studentId?: string): void {
  if (typeof window === "undefined") return;
  try {
    const key = getReadTemplatesKey(studentId);
    localStorage.setItem(key, JSON.stringify(ids));
  } catch (error) {
    console.error("Failed to save read templates:", error);
  }
}

/**
 * Get last check time from localStorage (user-specific)
 */
function getLastTemplateCheckTime(studentId?: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const key = getLastTemplateCheckTimeKey(studentId);
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Save last check time to localStorage (user-specific)
 */
function saveLastTemplateCheckTime(studentId?: string): void {
  if (typeof window === "undefined") return;
  try {
    const key = getLastTemplateCheckTimeKey(studentId);
    localStorage.setItem(key, new Date().toISOString());
  } catch (error) {
    console.error("Failed to save last template check time:", error);
  }
}

/**
 * Hook for managing student template notifications
 * Tracks read/unread status client-side using localStorage
 * Only shows templates from the student's instructor
 */
export function useStudentTemplateNotifications(
  studentId?: string,
  instructorId?: string
) {
  // Fetch active templates for the student (only when studentId exists)
  // Filter by instructorId to only show templates created by their instructor
  const { data: templatesData, isLoading, error } = useRequirementTemplates(
    {
      status: "active",
      createdBy: instructorId, // Filter by instructor who created the template
      page: 1,
      limit: 20, // Get recent templates
    },
    {
      enabled: !!studentId && !!instructorId, // Only fetch when both studentId and instructorId are provided
      refetchOnWindowFocus: true, // Refetch when window regains focus
      refetchInterval: 30000, // Refetch every 30 seconds to check for new templates
    }
  );

  const templates = useMemo(() => {
    if (!studentId) return [];
    const templatesList =
      (templatesData as any)?.requirementTemplates ??
      (templatesData as any)?.data?.requirementTemplates ??
      [];
    // Backend already filters by status: "active", but ensure isActive is true as a safety check
    return (templatesList as RequirementTemplate[]).filter(
      (t) => t.isActive === true
    );
  }, [templatesData, studentId]);

  // Track read IDs and last check time in state so they update reactively
  const [readIds, setReadIds] = useState<string[]>(() =>
    getReadTemplateIds(studentId)
  );
  const [lastCheckTime, setLastCheckTime] = useState<string | null>(() =>
    getLastTemplateCheckTime(studentId)
  );

  // Sync with localStorage when studentId or templates data changes
  useEffect(() => {
    if (studentId) {
      setReadIds(getReadTemplateIds(studentId));
      setLastCheckTime(getLastTemplateCheckTime(studentId));
    } else {
      // Clear state when studentId is undefined
      setReadIds([]);
      setLastCheckTime(null);
    }
  }, [studentId, templatesData]); // Re-check when studentId or templates data changes

  // Determine unread templates
  const unreadTemplates = useMemo(() => {
    if (!templates.length) return [];

    const filtered = templates.filter((template) => {
      // Check if already read
      if (readIds.includes(template.id)) {
        return false;
      }

      // Check if created after last check time (or if no last check time, consider it new)
      if (lastCheckTime) {
        const templateDate = new Date(template.createdAt);
        const lastCheck = new Date(lastCheckTime);
        return templateDate > lastCheck;
      }

      // If no last check time, consider all unread templates as new
      return true;
    });

    // Debug logging (remove in production)
    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
      console.log("Unread templates filter:", {
        totalTemplates: templates.length,
        readIds: readIds.length,
        lastCheckTime,
        filteredCount: filtered.length,
        templateIds: templates.map((t) => ({
          id: t.id,
          createdAt: t.createdAt,
          title: t.title,
        })),
      });
    }

    return filtered;
  }, [templates, readIds, lastCheckTime]);

  const unreadCount = unreadTemplates.length;

  // Mark a template as read (using functional setState to prevent race conditions)
  const markAsRead = useCallback(
    (templateId: string) => {
      if (!studentId) return;

      setReadIds((prevReadIds) => {
        // Check if already read to prevent duplicates
        if (prevReadIds.includes(templateId)) {
          return prevReadIds;
        }
        const newReadIds = [...prevReadIds, templateId];
        // Save to localStorage atomically
        saveReadTemplateIds(newReadIds, studentId);
        return newReadIds;
      });
    },
    [studentId]
  );

  // Mark all templates as read
  const markAllAsRead = useCallback(() => {
    if (!studentId) return;

    setReadIds((prevReadIds) => {
      const allTemplateIds = templates.map((t) => t.id);
      const newReadIds = [...new Set([...prevReadIds, ...allTemplateIds])];
      const newLastCheckTime = new Date().toISOString();
      setLastCheckTime(newLastCheckTime);
      // Save to localStorage atomically
      saveReadTemplateIds(newReadIds, studentId);
      saveLastTemplateCheckTime(studentId);
      return newReadIds;
    });
  }, [templates, studentId]);

  return {
    templates,
    unreadTemplates,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
  };
}

