import { useMemo, useCallback, useState, useEffect } from "react";
import { useStudentRequirementComments } from "./useRequirement";
import type { RequirementComment } from "./useRequirement";

/**
 * Get storage key for read comments (user-specific)
 */
function getReadCommentsKey(studentId?: string): string {
  if (!studentId) return "student_requirement_comments_read";
  return `student_requirement_comments_read_${studentId}`;
}

/**
 * Get storage key for last check time (user-specific)
 */
function getLastCheckTimeKey(studentId?: string): string {
  if (!studentId) return "student_requirement_comments_last_check";
  return `student_requirement_comments_last_check_${studentId}`;
}

/**
 * Get read comment IDs from localStorage (user-specific)
 */
function getReadCommentIds(studentId?: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const key = getReadCommentsKey(studentId);
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    return JSON.parse(stored) as string[];
  } catch {
    return [];
  }
}

/**
 * Save read comment IDs to localStorage (user-specific)
 */
function saveReadCommentIds(ids: string[], studentId?: string): void {
  if (typeof window === "undefined") return;
  try {
    const key = getReadCommentsKey(studentId);
    localStorage.setItem(key, JSON.stringify(ids));
  } catch (error) {
    console.error("Failed to save read comments:", error);
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
 * Hook for managing student requirement comment notifications
 * Tracks read/unread status client-side using localStorage
 */
export function useStudentRequirementCommentNotifications(studentId?: string) {
  const lastCheckTime = getLastCheckTime(studentId);
  
  // Fetch unread comments for the student (only when studentId exists)
  const { data: commentsData, isLoading, error } = useStudentRequirementComments(
    studentId,
    lastCheckTime || undefined
  );

  const comments = useMemo(() => {
    if (!studentId) return [];
    return (commentsData || []) as RequirementComment[];
  }, [commentsData, studentId]);

  // Track read IDs and last check time in state so they update reactively
  const [readIds, setReadIds] = useState<string[]>(() => getReadCommentIds(studentId));
  const [lastCheckTimeState, setLastCheckTimeState] = useState<string | null>(() =>
    getLastCheckTime(studentId)
  );

  // Sync with localStorage when studentId or comments data changes
  useEffect(() => {
    if (studentId) {
      setReadIds(getReadCommentIds(studentId));
      setLastCheckTimeState(getLastCheckTime(studentId));
    } else {
      // Clear state when studentId is undefined
      setReadIds([]);
      setLastCheckTimeState(null);
    }
  }, [studentId, commentsData]); // Re-check when studentId or comments data changes

  // Determine unread comments
  const unreadComments = useMemo(() => {
    if (!comments.length) return [];

    const filtered = comments.filter((comment) => {
      // Check if already read
      if (readIds.includes(comment.id)) {
        return false;
      }

      // Check if created after last check time (or if no last check time, consider it new)
      if (lastCheckTimeState) {
        const commentDate = new Date(comment.createdAt);
        const lastCheck = new Date(lastCheckTimeState);
        return commentDate > lastCheck;
      }

      // If no last check time, consider all unread comments as new
      return true;
    });

    return filtered;
  }, [comments, readIds, lastCheckTimeState]);

  const unreadCount = unreadComments.length;

  // Mark a comment as read (using functional setState to prevent race conditions)
  const markAsRead = useCallback(
    (commentId: string) => {
      if (!studentId) return;

      setReadIds((prevReadIds) => {
        // Check if already read to prevent duplicates
        if (prevReadIds.includes(commentId)) {
          return prevReadIds;
        }
        const newReadIds = [...prevReadIds, commentId];
        // Save to localStorage atomically
        saveReadCommentIds(newReadIds, studentId);
        return newReadIds;
      });
    },
    [studentId]
  );

  // Mark all comments as read
  const markAllAsRead = useCallback(() => {
    if (!studentId) return;

    setReadIds((prevReadIds) => {
      const allCommentIds = comments.map((c) => c.id);
      const newReadIds = [...new Set([...prevReadIds, ...allCommentIds])];
      const newLastCheckTime = new Date().toISOString();
      setLastCheckTimeState(newLastCheckTime);
      // Save to localStorage atomically
      saveReadCommentIds(newReadIds, studentId);
      saveLastCheckTime(studentId);
      return newReadIds;
    });
  }, [comments, studentId]);

  return {
    comments,
    unreadComments,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
  };
}

