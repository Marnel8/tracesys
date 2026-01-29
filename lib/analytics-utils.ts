import { format, startOfWeek, endOfWeek, eachWeekOfInterval, startOfMonth, endOfMonth, eachMonthOfInterval, parseISO, isBefore, differenceInDays, differenceInHours } from "date-fns";
import type { AttendanceRecord } from "@/hooks/attendance/useAttendance";
import type { Report } from "@/hooks/report/useReport";
import type { Requirement } from "@/hooks/requirement/useRequirement";

// Helper function to calculate expected attendance days (reused from dashboard)
export function calculateExpectedAttendanceDays(
  startDate: string | Date | null | undefined,
  endDate: string | Date | null | undefined,
  operatingDays: string | null | undefined
): number {
  if (!startDate || !endDate) return 0;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  const endDateToUse = end > today ? today : end;

  if (start > endDateToUse) return 0;

  const operatingDaysList = operatingDays
    ? operatingDays.split(",").map((d) => d.trim())
    : [];

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const validDays =
    operatingDaysList.length > 0
      ? operatingDaysList
      : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  let count = 0;
  const current = new Date(start);
  current.setHours(0, 0, 0, 0);
  endDateToUse.setHours(23, 59, 59, 999);

  while (current <= endDateToUse) {
    const dayName = dayNames[current.getDay()];
    if (validDays.includes(dayName)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

// Parse activities from report activities field
export function parseActivities(activitiesString: string | null | undefined): string[] {
  if (!activitiesString) return [];
  
  // Handle different formats: JSON array, comma-separated, newline-separated
  try {
    // Try parsing as JSON first
    const parsed = JSON.parse(activitiesString);
    if (Array.isArray(parsed)) {
      return parsed.filter((a) => typeof a === "string" && a.trim().length > 0);
    }
  } catch {
    // Not JSON, try other formats
  }
  
  // Try comma-separated
  if (activitiesString.includes(",")) {
    return activitiesString
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a.length > 0);
  }
  
  // Try newline-separated
  if (activitiesString.includes("\n")) {
    return activitiesString
      .split("\n")
      .map((a) => a.trim())
      .filter((a) => a.length > 0);
  }
  
  // Single activity
  return [activitiesString.trim()].filter((a) => a.length > 0);
}

// Extract and count activity frequencies
export function countActivityFrequencies(reports: Report[]): Map<string, number> {
  const frequencyMap = new Map<string, number>();
  
  for (const report of reports) {
    const activities = parseActivities(report.activities);
    for (const activity of activities) {
      const normalized = activity.toLowerCase().trim();
      frequencyMap.set(normalized, (frequencyMap.get(normalized) || 0) + 1);
    }
  }
  
  return frequencyMap;
}

// Get top N activities by frequency
export function getTopActivities(
  frequencyMap: Map<string, number>,
  limit: number = 10
): Array<{ name: string; count: number }> {
  return Array.from(frequencyMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// Calculate week-over-week trend
export function calculateTrend(current: number, previous: number): {
  value: number;
  percentage: number;
  direction: "up" | "down" | "stable";
} {
  if (previous === 0) {
    return { value: current, percentage: current > 0 ? 100 : 0, direction: current > 0 ? "up" : "stable" };
  }
  
  const percentage = ((current - previous) / previous) * 100;
  const direction = percentage > 1 ? "up" : percentage < -1 ? "down" : "stable";
  
  return {
    value: current - previous,
    percentage: Math.abs(percentage),
    direction,
  };
}

// Group data by week
export function groupByWeek<T extends { date?: string | null; createdAt?: string | null; submittedDate?: string | null }>(
  items: T[],
  dateField: "date" | "createdAt" | "submittedDate" = "date"
): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  
  for (const item of items) {
    const dateStr = item[dateField];
    if (!dateStr) continue;
    
    try {
      const date = parseISO(dateStr);
      const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
      const weekKey = format(weekStart, "yyyy-MM-dd");
      
      if (!grouped.has(weekKey)) {
        grouped.set(weekKey, []);
      }
      grouped.get(weekKey)!.push(item);
    } catch {
      // Invalid date, skip
    }
  }
  
  return grouped;
}

// Group data by month
export function groupByMonth<T extends { date?: string | null; createdAt?: string | null; submittedDate?: string | null }>(
  items: T[],
  dateField: "date" | "createdAt" | "submittedDate" = "date"
): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  
  for (const item of items) {
    const dateStr = item[dateField];
    if (!dateStr) continue;
    
    try {
      const date = parseISO(dateStr);
      const monthKey = format(date, "yyyy-MM");
      
      if (!grouped.has(monthKey)) {
        grouped.set(monthKey, []);
      }
      grouped.get(monthKey)!.push(item);
    } catch {
      // Invalid date, skip
    }
  }
  
  return grouped;
}

// Calculate submission punctuality
export function calculatePunctuality(
  submittedDate: string | null | undefined,
  dueDate: string | null | undefined
): {
  isOnTime: boolean;
  delayHours: number;
  delayDays: number;
} {
  if (!submittedDate || !dueDate) {
    return { isOnTime: false, delayHours: 0, delayDays: 0 };
  }
  
  try {
    const submitted = parseISO(submittedDate);
    const due = parseISO(dueDate);
    
    const isOnTime = submitted <= due;
    const delayMs = Math.max(0, submitted.getTime() - due.getTime());
    const delayHours = delayMs / (1000 * 60 * 60);
    const delayDays = delayMs / (1000 * 60 * 60 * 24);
    
    return {
      isOnTime,
      delayHours: isOnTime ? 0 : delayHours,
      delayDays: isOnTime ? 0 : delayDays,
    };
  } catch {
    return { isOnTime: false, delayHours: 0, delayDays: 0 };
  }
}

// Calculate attendance rate for a student
export function calculateStudentAttendanceRate(
  attendanceRecords: AttendanceRecord[],
  expectedDays: number
): number {
  if (expectedDays === 0) return 0;
  
  const presentCount = attendanceRecords.filter((r) =>
    ["present", "late", "excused"].includes(r.status)
  ).length;
  
  return Math.round((presentCount / expectedDays) * 100);
}

// Calculate average hours per day
export function calculateAverageHours(attendanceRecords: AttendanceRecord[]): number {
  const recordsWithHours = attendanceRecords.filter((r) => r.hours != null && r.hours > 0);
  if (recordsWithHours.length === 0) return 0;
  
  const totalHours = recordsWithHours.reduce((sum, r) => sum + (r.hours || 0), 0);
  return Math.round((totalHours / recordsWithHours.length) * 10) / 10; // Round to 1 decimal
}

// Calculate performance score (composite)
export function calculatePerformanceScore(
  attendanceRate: number,
  completionRate: number,
  punctualityRate: number,
  weights: { attendance: number; completion: number; punctuality: number } = {
    attendance: 0.4,
    completion: 0.4,
    punctuality: 0.2,
  }
): number {
  const score =
    (attendanceRate * weights.attendance) +
    (completionRate * weights.completion) +
    (punctualityRate * weights.punctuality);
  
  return Math.round(score * 10) / 10; // Round to 1 decimal
}

// Get day of week from date string
export function getDayOfWeek(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  
  try {
    const date = parseISO(dateStr);
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return dayNames[date.getDay()];
  } catch {
    return null;
  }
}

// Group attendance by day of week
export function groupAttendanceByDayOfWeek(records: AttendanceRecord[]): Map<string, AttendanceRecord[]> {
  const grouped = new Map<string, AttendanceRecord[]>();
  
  for (const record of records) {
    const day = record.day || getDayOfWeek(record.date);
    if (!day) continue;
    
    if (!grouped.has(day)) {
      grouped.set(day, []);
    }
    grouped.get(day)!.push(record);
  }
  
  return grouped;
}

// Calculate punctuality for clock-ins (on-time vs late)
export function calculateClockInPunctuality(
  records: AttendanceRecord[],
  openingTime?: string | null
): {
  onTime: number;
  late: number;
  total: number;
  punctualityRate: number;
} {
  let onTime = 0;
  let late = 0;
  
  for (const record of records) {
    if (!record.timeIn) continue;
    
    const status = record.status;
    if (status === "late") {
      late++;
    } else if (status === "present" || status === "excused") {
      onTime++;
    }
  }
  
  const total = onTime + late;
  const punctualityRate = total > 0 ? Math.round((onTime / total) * 100) : 0;
  
  return { onTime, late, total, punctualityRate };
}

