import { useMemo } from "react";
import { useAuth } from "@/hooks/auth/useAuth";
import { useStudentsByTeacher } from "@/hooks/student/useStudent";
import { useAttendance } from "@/hooks/attendance/useAttendance";
import { useReports } from "@/hooks/report/useReport";
import { useRequirements } from "@/hooks/requirement/useRequirement";
import { useRequirementTemplates } from "@/hooks/requirement-template/useRequirementTemplate";
import {
  calculateExpectedAttendanceDays,
  parseActivities,
  countActivityFrequencies,
  getTopActivities,
  calculateTrend,
  groupByWeek,
  groupByMonth,
  calculatePunctuality,
  calculateStudentAttendanceRate,
  calculateAverageHours,
  calculatePerformanceScore,
  groupAttendanceByDayOfWeek,
  calculateClockInPunctuality,
} from "@/lib/analytics-utils";
import { format, startOfWeek, endOfWeek, eachWeekOfInterval, subWeeks, parseISO, isBefore, isAfter } from "date-fns";

export interface AnalyticsData {
  // Key metrics
  totalStudents: number;
  averageAttendance: number;
  averageCompletion: number;
  onTimeSubmissionRate: number;
  averageRating: number;
  
  // Trends
  attendanceTrend: { value: number; percentage: number; direction: "up" | "down" | "stable" };
  completionTrend: { value: number; percentage: number; direction: "up" | "down" | "stable" };
  
  // Attendance analytics
  attendanceTrends: Array<{ week: string; attendance: number; submissions: number }>;
  dayOfWeekPatterns: Array<{ day: string; attendance: number; count: number }>;
  averageHoursPerStudent: number;
  clockInPunctuality: { onTime: number; late: number; total: number; punctualityRate: number };
  
  // Submission punctuality
  reportPunctuality: {
    onTime: number;
    late: number;
    total: number;
    averageDelayHours: number;
    averageDelayDays: number;
  };
  requirementPunctuality: {
    onTime: number;
    late: number;
    total: number;
    averageDelayHours: number;
    averageDelayDays: number;
  };
  submissionPatterns: Array<{ week: string; onTime: number; late: number }>;
  
  // Activity frequency
  topActivities: Array<{ name: string; count: number }>;
  activityTrends: Array<{ week: string; activityCount: number }>;
  
  // Weekly progress
  weeklyProgress: Array<{ week: string; hours: number; reports: number; requirements: number }>;
  
  // Section performance
  sectionPerformance: Array<{
    id: string;
    name: string;
    totalStudents: number;
    avgAttendance: number;
    completionRate: number;
    performanceScore: number;
  }>;
  
  // Performance insights
  topPerformers: Array<{
    studentId: string;
    studentName: string;
    sectionName: string;
    attendanceRate: number;
    completionRate: number;
    punctualityRate: number;
    performanceScore: number;
  }>;
  needsAttention: Array<{
    studentId: string;
    studentName: string;
    sectionName: string;
    attendanceRate: number;
    missingRequirements: number;
    issues: string[];
    performanceScore: number;
  }>;
  
  // Requirement breakdown
  requirementBreakdown: {
    total: number;
    approved: number;
    submitted: number;
    pending: number;
    rejected: number;
  };
  
  // Gender distribution
  genderDistribution: Array<{ name: string; value: number }>;
}

export function useAnalytics(
  dateRange?: { startDate?: string; endDate?: string },
  sectionId?: string
): {
  data: AnalyticsData | null;
  isLoading: boolean;
} {
  const { user, isLoading: isUserLoading } = useAuth();
  const teacherId = (user as any)?.id || "";

  // Fetch all data
  const { data: studentsResp, isLoading: isStudentsLoading } = useStudentsByTeacher(teacherId, {
    page: 1,
    limit: 1000,
  });

  const { data: attendanceData, isLoading: isAttendanceLoading } = useAttendance({
    page: 1,
    limit: 1000,
    startDate: dateRange?.startDate,
    endDate: dateRange?.endDate,
  });

  const { data: reportsData, isLoading: isReportsLoading } = useReports({
    page: 1,
    limit: 1000,
    type: "weekly",
    startDate: dateRange?.startDate,
    endDate: dateRange?.endDate,
  });

  const { data: requirementsData, isLoading: isRequirementsLoading } = useRequirements({
    page: 1,
    limit: 1000,
  });

  const { data: templatesResp } = useRequirementTemplates({
    page: 1,
    limit: 1000,
    status: "active",
  });

  const isLoading =
    isUserLoading ||
    isStudentsLoading ||
    isAttendanceLoading ||
    isReportsLoading ||
    isRequirementsLoading;

  const students: any[] = useMemo(
    () => studentsResp?.data?.students ?? [],
    [studentsResp]
  );

  const templatesCount = templatesResp?.requirementTemplates?.length ?? 0;

  const analyticsData = useMemo((): AnalyticsData | null => {
    if (isLoading || !students.length) return null;

    // Filter students by section if specified
    const filteredStudents = sectionId
      ? students.filter((s) => s?.enrollments?.[0]?.section?.id === sectionId)
      : students;

    const studentIds = new Set(filteredStudents.map((s) => s.id));

    // Filter attendance, reports, and requirements to only include data from filtered students and date range
    const attendanceRecords = (attendanceData?.attendance ?? [])
      .filter((r) => studentIds.has(r.studentId))
      .filter((r) => {
        if (!dateRange) return true;
        if (!r.date) return false;
        const date = parseISO(r.date);
        const start = dateRange.startDate ? parseISO(dateRange.startDate) : null;
        const end = dateRange.endDate ? parseISO(dateRange.endDate) : null;
        if (start && isBefore(date, start)) return false;
        if (end && isAfter(date, end)) return false;
        return true;
      });
    
    const reports = (reportsData?.reports ?? [])
      .filter((r) => studentIds.has(r.studentId))
      .filter((r) => {
        if (!dateRange) return true;
        const dateStr = r.submittedDate || r.createdAt;
        if (!dateStr) return false;
        const date = parseISO(dateStr);
        const start = dateRange.startDate ? parseISO(dateRange.startDate) : null;
        const end = dateRange.endDate ? parseISO(dateRange.endDate) : null;
        if (start && isBefore(date, start)) return false;
        if (end && isAfter(date, end)) return false;
        return true;
      });
    
    const requirements = (requirementsData?.requirements ?? [])
      .filter((r) => studentIds.has(r.studentId))
      .filter((r) => {
        if (!dateRange) return true;
        const dateStr = r.submittedDate || r.createdAt;
        if (!dateStr) return false;
        const date = parseISO(dateStr);
        const start = dateRange.startDate ? parseISO(dateRange.startDate) : null;
        const end = dateRange.endDate ? parseISO(dateRange.endDate) : null;
        if (start && isBefore(date, start)) return false;
        if (end && isAfter(date, end)) return false;
        return true;
      });

    // Calculate overall attendance
    const studentAttendanceRates: number[] = [];
    for (const student of filteredStudents) {
      const practicum = student?.practicums?.[0];
      const agency = practicum?.agency;
      const expectedDays = calculateExpectedAttendanceDays(
        practicum?.startDate,
        practicum?.endDate,
        agency?.operatingDays
      );

      if (expectedDays > 0) {
        const records: any[] = student?.attendanceRecords ?? [];
        const rate = calculateStudentAttendanceRate(records, expectedDays);
        studentAttendanceRates.push(rate);
      }
    }
    const averageAttendance =
      studentAttendanceRates.length > 0
        ? Math.round(
            studentAttendanceRates.reduce((sum, rate) => sum + rate, 0) /
              studentAttendanceRates.length
          )
        : 0;

    // Calculate overall completion
    let totalReqs = 0;
    let approvedReqs = 0;
    let submittedReqs = 0;
    let pendingReqs = 0;
    let rejectedReqs = 0;

    for (const student of filteredStudents) {
      const reqs: any[] = student?.requirements ?? [];
      const submitted = reqs.filter((r) => !!(r.fileUrl || r.fileName));
      const approved = submitted.filter((r) => r.status?.toLowerCase() === "approved").length;
      const pending = submitted.filter((r) => r.status?.toLowerCase() === "pending").length;
      const rejected = submitted.filter((r) => r.status?.toLowerCase() === "rejected").length;

      const denom = templatesCount > 0 ? templatesCount : submitted.length || 1;
      totalReqs += denom;
      approvedReqs += Math.min(approved, denom);
      submittedReqs += submitted.length;
      pendingReqs += pending;
      rejectedReqs += rejected;
    }

    const averageCompletion = totalReqs > 0 ? Math.round((approvedReqs / totalReqs) * 100) : 0;

    // Calculate on-time submission rate for reports
    let onTimeReports = 0;
    let lateReports = 0;
    let totalDelayHours = 0;
    let totalDelayDays = 0;

    for (const report of reports) {
      if (report.submittedDate && report.dueDate) {
        const punctuality = calculatePunctuality(report.submittedDate, report.dueDate);
        if (punctuality.isOnTime) {
          onTimeReports++;
        } else {
          lateReports++;
          totalDelayHours += punctuality.delayHours;
          totalDelayDays += punctuality.delayDays;
        }
      }
    }

    const onTimeSubmissionRate =
      reports.length > 0 ? Math.round((onTimeReports / reports.length) * 100) : 0;

    // Calculate requirement punctuality
    let onTimeRequirements = 0;
    let lateRequirements = 0;
    let reqTotalDelayHours = 0;
    let reqTotalDelayDays = 0;

    for (const req of requirements) {
      if (req.submittedDate && req.dueDate) {
        const punctuality = calculatePunctuality(req.submittedDate, req.dueDate);
        if (punctuality.isOnTime) {
          onTimeRequirements++;
        } else {
          lateRequirements++;
          reqTotalDelayHours += punctuality.delayHours;
          reqTotalDelayDays += punctuality.delayDays;
        }
      }
    }

    // Calculate trends (compare current period with previous period)
    const now = new Date();
    const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const previousWeekStart = subWeeks(currentWeekStart, 1);
    const previousWeekEnd = endOfWeek(previousWeekStart, { weekStartsOn: 1 });

    // Get previous period data for trend calculation
    const previousWeekAttendance = attendanceRecords.filter((r) => {
      if (!r.date) return false;
      const date = parseISO(r.date);
      return date >= previousWeekStart && date <= previousWeekEnd;
    });

    const previousWeekAvgAttendance =
      previousWeekAttendance.length > 0
        ? Math.round(
            (previousWeekAttendance.filter((r) =>
              ["present", "late", "excused"].includes(r.status)
            ).length /
              previousWeekAttendance.length) *
              100
          )
        : 0;

    const attendanceTrend = calculateTrend(averageAttendance, previousWeekAvgAttendance);

    // Calculate previous week completion
    const previousWeekReqs = requirements.filter((r) => {
      if (!r.submittedDate) return false;
      const date = parseISO(r.submittedDate);
      return date >= previousWeekStart && date <= previousWeekEnd;
    });
    const previousWeekApproved = previousWeekReqs.filter(
      (r) => r.status?.toLowerCase() === "approved"
    ).length;
    const previousWeekCompletion =
      previousWeekReqs.length > 0
        ? Math.round((previousWeekApproved / previousWeekReqs.length) * 100)
        : 0;

    const completionTrend = calculateTrend(averageCompletion, previousWeekCompletion);

    // Weekly attendance and submission trends
    const attendanceByWeek = groupByWeek(attendanceRecords, "date");
    const reportsByWeek = groupByWeek(reports, "submittedDate");
    
    // Get all weeks in range
    const allWeeks = new Set<string>();
    attendanceByWeek.forEach((_, week) => allWeeks.add(week));
    reportsByWeek.forEach((_, week) => allWeeks.add(week));
    
    const sortedWeeks = Array.from(allWeeks).sort();
    const attendanceTrends = sortedWeeks.map((weekKey) => {
      const weekRecords = attendanceByWeek.get(weekKey) || [];
      const weekReports = reportsByWeek.get(weekKey) || [];
      const expectedDays = weekRecords.length; // Simplified
      const presentCount = weekRecords.filter((r) =>
        ["present", "late", "excused"].includes(r.status)
      ).length;
      const attendance = expectedDays > 0 ? Math.round((presentCount / expectedDays) * 100) : 0;
      
      return {
        week: format(parseISO(weekKey), "MMM dd"),
        attendance,
        submissions: weekReports.length,
      };
    });

    // Day of week patterns
    const attendanceByDay = groupAttendanceByDayOfWeek(attendanceRecords);
    const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const dayOfWeekPatterns = dayOrder.map((day) => {
      const dayRecords = attendanceByDay.get(day) || [];
      const presentCount = dayRecords.filter((r) =>
        ["present", "late", "excused"].includes(r.status)
      ).length;
      return {
        day,
        attendance: dayRecords.length > 0 ? Math.round((presentCount / dayRecords.length) * 100) : 0,
        count: dayRecords.length,
      };
    }).filter((d) => d.count > 0);

    // Average hours per student
    const averageHoursPerStudent = calculateAverageHours(attendanceRecords);

    // Clock-in punctuality
    const clockInPunctuality = calculateClockInPunctuality(attendanceRecords);

    // Report punctuality details
    const reportPunctuality = {
      onTime: onTimeReports,
      late: lateReports,
      total: reports.length,
      averageDelayHours: lateReports > 0 ? Math.round((totalDelayHours / lateReports) * 10) / 10 : 0,
      averageDelayDays: lateReports > 0 ? Math.round((reqTotalDelayDays / lateReports) * 10) / 10 : 0,
    };

    // Requirement punctuality details
    const requirementPunctuality = {
      onTime: onTimeRequirements,
      late: lateRequirements,
      total: requirements.length,
      averageDelayHours: lateRequirements > 0 ? Math.round((reqTotalDelayHours / lateRequirements) * 10) / 10 : 0,
      averageDelayDays: lateRequirements > 0 ? Math.round((reqTotalDelayDays / lateRequirements) * 10) / 10 : 0,
    };

    // Submission patterns by week
    const submissionPatterns = sortedWeeks.map((weekKey) => {
      const weekReports = reportsByWeek.get(weekKey) || [];
      let onTime = 0;
      let late = 0;
      
      for (const report of weekReports) {
        if (report.submittedDate && report.dueDate) {
          const punctuality = calculatePunctuality(report.submittedDate, report.dueDate);
          if (punctuality.isOnTime) {
            onTime++;
          } else {
            late++;
          }
        }
      }
      
      return {
        week: format(parseISO(weekKey), "MMM dd"),
        onTime,
        late,
      };
    });

    // Activity frequency
    const activityFrequencyMap = countActivityFrequencies(reports);
    const topActivities = getTopActivities(activityFrequencyMap, 10);
    
    // Activity trends by week
    const activityTrends = sortedWeeks.map((weekKey) => {
      const weekReports = reportsByWeek.get(weekKey) || [];
      let activityCount = 0;
      for (const report of weekReports) {
        const activities = parseActivities(report.activities);
        activityCount += activities.length;
      }
      return {
        week: format(parseISO(weekKey), "MMM dd"),
        activityCount,
      };
    });

    // Weekly progress (hours, reports, requirements)
    const weeklyProgress = sortedWeeks.map((weekKey) => {
      const weekRecords = attendanceByWeek.get(weekKey) || [];
      const weekReports = reportsByWeek.get(weekKey) || [];
      const weekReqs = groupByWeek(requirements, "submittedDate").get(weekKey) || [];
      
      const totalHours = weekRecords.reduce((sum, r) => sum + (r.hours || 0), 0);
      
      return {
        week: format(parseISO(weekKey), "MMM dd"),
        hours: Math.round(totalHours),
        reports: weekReports.length,
        requirements: weekReqs.length,
      };
    });

    // Section performance
    const sectionsMap = new Map<
      string,
      {
        id: string;
        name: string;
        totalStudents: number;
        attendancePctSum: number;
        attendancePctCount: number;
        approvedReqs: number;
        totalReqs: number;
        onTimeSubmissions: number;
        totalSubmissions: number;
      }
    >();

    for (const student of filteredStudents) {
      const enrollment = student?.enrollments?.[0];
      const section = enrollment?.section;
      const sectionKey: string | undefined = section?.id;
      if (!sectionKey) continue;

      if (!sectionsMap.has(sectionKey)) {
        sectionsMap.set(sectionKey, {
          id: section.id,
          name: section.name,
          totalStudents: 0,
          attendancePctSum: 0,
          attendancePctCount: 0,
          approvedReqs: 0,
          totalReqs: 0,
          onTimeSubmissions: 0,
          totalSubmissions: 0,
        });
      }

      const bucket = sectionsMap.get(sectionKey)!;
      bucket.totalStudents += 1;

      // Attendance
      const practicum = student?.practicums?.[0];
      const agency = practicum?.agency;
      const expectedDays = calculateExpectedAttendanceDays(
        practicum?.startDate,
        practicum?.endDate,
        agency?.operatingDays
      );
      const records: any[] = student?.attendanceRecords ?? [];
      if (expectedDays > 0) {
        const rate = calculateStudentAttendanceRate(records, expectedDays);
        bucket.attendancePctSum += rate;
        bucket.attendancePctCount += 1;
      }

      // Requirements
      const reqs: any[] = student?.requirements ?? [];
      const submitted = reqs.filter((r) => !!(r.fileUrl || r.fileName));
      const approved = submitted.filter((r) => r.status?.toLowerCase() === "approved").length;
      const denom = templatesCount > 0 ? templatesCount : submitted.length || 1;
      bucket.totalReqs += denom;
      bucket.approvedReqs += Math.min(approved, denom);

      // Punctuality
      const studentReports = reports.filter((r) => r.studentId === student.id);
      for (const report of studentReports) {
        if (report.submittedDate && report.dueDate) {
          bucket.totalSubmissions++;
          const punctuality = calculatePunctuality(report.submittedDate, report.dueDate);
          if (punctuality.isOnTime) {
            bucket.onTimeSubmissions++;
          }
        }
      }
    }

    const sectionPerformance = Array.from(sectionsMap.values()).map((b) => {
      const avgAttendance =
        b.attendancePctCount > 0 ? Math.round(b.attendancePctSum / b.attendancePctCount) : 0;
      const completionRate =
        b.totalReqs > 0 ? Math.round((b.approvedReqs / b.totalReqs) * 100) : 0;
      const punctualityRate =
        b.totalSubmissions > 0
          ? Math.round((b.onTimeSubmissions / b.totalSubmissions) * 100)
          : 0;
      const performanceScore = calculatePerformanceScore(
        avgAttendance,
        completionRate,
        punctualityRate
      );

      return {
        id: b.id,
        name: b.name,
        totalStudents: b.totalStudents,
        avgAttendance,
        completionRate,
        performanceScore,
      };
    });

    // Top performers and needs attention
    const studentPerformance: Array<{
      studentId: string;
      studentName: string;
      sectionName: string;
      attendanceRate: number;
      completionRate: number;
      punctualityRate: number;
      performanceScore: number;
      missingRequirements: number;
      issues: string[];
    }> = [];

    for (const student of filteredStudents) {
      const enrollment = student?.enrollments?.[0];
      const section = enrollment?.section;
      const sectionName = section?.name || "No Section";

      // Attendance
      const practicum = student?.practicums?.[0];
      const agency = practicum?.agency;
      const expectedDays = calculateExpectedAttendanceDays(
        practicum?.startDate,
        practicum?.endDate,
        agency?.operatingDays
      );
      const records: any[] = student?.attendanceRecords ?? [];
      const attendanceRate = expectedDays > 0
        ? calculateStudentAttendanceRate(records, expectedDays)
        : 0;

      // Requirements
      const reqs: any[] = student?.requirements ?? [];
      const submitted = reqs.filter((r) => !!(r.fileUrl || r.fileName));
      const approved = submitted.filter((r) => r.status?.toLowerCase() === "approved").length;
      const expectedReqs = templatesCount > 0 ? templatesCount : submitted.length || 0;
      const missingReqs = expectedReqs - submitted.length;
      const completionRate = expectedReqs > 0
        ? Math.round((approved / expectedReqs) * 100)
        : 0;

      // Punctuality
      const studentReports = reports.filter((r) => r.studentId === student.id);
      let onTimeSubmissions = 0;
      let totalSubmissions = 0;
      for (const report of studentReports) {
        if (report.submittedDate && report.dueDate) {
          totalSubmissions++;
          const punctuality = calculatePunctuality(report.submittedDate, report.dueDate);
          if (punctuality.isOnTime) {
            onTimeSubmissions++;
          }
        }
      }
      const punctualityRate =
        totalSubmissions > 0 ? Math.round((onTimeSubmissions / totalSubmissions) * 100) : 100;

      const performanceScore = calculatePerformanceScore(
        attendanceRate,
        completionRate,
        punctualityRate
      );

      const issues: string[] = [];
      if (attendanceRate < 80 && expectedDays > 0) {
        issues.push(`Low attendance (${attendanceRate}%)`);
      }
      if (missingReqs > 0) {
        issues.push(`${missingReqs} missing requirement${missingReqs > 1 ? "s" : ""}`);
      }
      if (punctualityRate < 80 && totalSubmissions > 0) {
        issues.push(`Late submissions (${100 - punctualityRate}% late)`);
      }

      studentPerformance.push({
        studentId: student.id,
        studentName: `${student.firstName || ""} ${student.lastName || ""}`.trim() || "Unknown",
        sectionName,
        attendanceRate,
        completionRate,
        punctualityRate,
        performanceScore,
        missingRequirements: missingReqs,
        issues,
      });
    }

    const topPerformers = studentPerformance
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .slice(0, 5)
      .map((s) => ({
        studentId: s.studentId,
        studentName: s.studentName,
        sectionName: s.sectionName,
        attendanceRate: s.attendanceRate,
        completionRate: s.completionRate,
        punctualityRate: s.punctualityRate,
        performanceScore: s.performanceScore,
      }));

    const needsAttention = studentPerformance
      .filter((s) => s.issues.length > 0)
      .sort((a, b) => {
        if (b.issues.length !== a.issues.length) {
          return b.issues.length - a.issues.length;
        }
        return a.performanceScore - b.performanceScore;
      })
      .slice(0, 5)
      .map((s) => ({
        studentId: s.studentId,
        studentName: s.studentName,
        sectionName: s.sectionName,
        attendanceRate: s.attendanceRate,
        missingRequirements: s.missingRequirements,
        issues: s.issues,
        performanceScore: s.performanceScore,
      }));

    // Gender distribution
    const genderMap = new Map<string, number>();
    for (const student of filteredStudents) {
      const gender = (student.gender || "").toLowerCase();
      const key = gender === "male" ? "Male" : gender === "female" ? "Female" : "Other";
      genderMap.set(key, (genderMap.get(key) || 0) + 1);
    }
    const genderDistribution = Array.from(genderMap.entries())
      .map(([name, value]) => ({ name, value }))
      .filter((g) => g.value > 0);

    // Average rating (from reports)
    const reportsWithRatings = reports.filter((r) => r.rating != null && r.rating > 0);
    const averageRating =
      reportsWithRatings.length > 0
        ? Math.round(
            (reportsWithRatings.reduce((sum, r) => sum + (r.rating || 0), 0) /
              reportsWithRatings.length) *
              10
          ) / 10
        : 0;

    return {
      totalStudents: filteredStudents.length,
      averageAttendance,
      averageCompletion,
      onTimeSubmissionRate,
      averageRating,
      attendanceTrend,
      completionTrend,
      attendanceTrends,
      dayOfWeekPatterns,
      averageHoursPerStudent,
      clockInPunctuality,
      reportPunctuality,
      requirementPunctuality,
      submissionPatterns,
      topActivities,
      activityTrends,
      weeklyProgress,
      sectionPerformance,
      topPerformers,
      needsAttention,
      requirementBreakdown: {
        total: totalReqs,
        approved: approvedReqs,
        submitted: submittedReqs,
        pending: pendingReqs,
        rejected: rejectedReqs,
      },
      genderDistribution,
    };
  }, [
    isLoading,
    students,
    attendanceData,
    reportsData,
    requirementsData,
    templatesCount,
    sectionId,
  ]);

  return {
    data: analyticsData,
    isLoading,
  };
}

