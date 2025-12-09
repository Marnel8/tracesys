"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useAuth } from "@/hooks/auth/useAuth";
import { useStudentsByTeacher } from "@/hooks/student/useStudent";
import { useAttendance } from "@/hooks/attendance/useAttendance";
import { useRequirements } from "@/hooks/requirement/useRequirement";
import { useRequirementTemplates } from "@/hooks/requirement-template/useRequirementTemplate";
import { useReports } from "@/hooks/report/useReport";
import {
  Users,
  FileCheck,
  Clock,
  MessageSquare,
  Settings,
  AlertTriangle,
  CheckCircle,
  MailPlus,
  Info,
} from "lucide-react";
import { InstructorStatsCard } from "@/components/instructor-stats-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Helper function to calculate expected attendance days
function calculateExpectedAttendanceDays(
  startDate: string | Date | null | undefined,
  endDate: string | Date | null | undefined,
  operatingDays: string | null | undefined
): number {
  if (!startDate || !endDate) return 0;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  const endDateToUse = end > today ? today : end; // Use today if practicum hasn't ended yet

  if (start > endDateToUse) return 0;

  // Parse operating days (e.g., "Monday,Tuesday,Wednesday" or "Monday, Tuesday, Wednesday")
  const operatingDaysList = operatingDays
    ? operatingDays.split(",").map((d) => d.trim())
    : [];

  // If no operating days specified, assume all weekdays (Monday-Friday)
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

export default function InstructorDashboard() {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useAuth();

  const teacherId = (user as any)?.id || "";
  const { data: studentsResp, isLoading: isStudentsLoading } =
    useStudentsByTeacher(teacherId, {
      page: 1,
      limit: 1000,
    });
  const { data: templatesResp } = useRequirementTemplates({
    page: 1,
    limit: 1000,
    status: "active",
  });

  const students: any[] = useMemo(
    () => studentsResp?.data?.students ?? [],
    [studentsResp]
  );

  // Get pending items for approval
  const { data: attendanceData, isLoading: isAttendanceLoading } =
    useAttendance({
      page: 1,
      limit: 1000,
      approvalStatus: "Pending",
    });

  const { data: requirementsData, isLoading: isRequirementsLoading } =
    useRequirements({
      page: 1,
      limit: 1000,
      status: "submitted",
    });

  const { data: reportsData, isLoading: isReportsLoading } = useReports({
    page: 1,
    limit: 1000,
    status: "submitted",
  });

  // Fetch all weekly reports to calculate on-time submission rate
  const { data: allWeeklyReportsData, isLoading: isWeeklyReportsLoading } =
    useReports({
      page: 1,
      limit: 1000,
      type: "weekly",
    });

  const pendingItems = useMemo(() => {
    const attendanceRecords = attendanceData?.attendance ?? [];
    const requirements = requirementsData?.requirements ?? [];
    const reports = reportsData?.reports ?? [];

    // Filter to only include items from students under this instructor
    const studentIds = new Set(students.map((s) => s.id));

    const pendingAttendance = attendanceRecords.filter(
      (record) =>
        studentIds.has(record.studentId) && record.approvalStatus === "Pending"
    );

    const pendingRequirements = requirements.filter(
      (req) => studentIds.has(req.studentId) && req.status === "submitted"
    );

    const pendingReports = reports.filter(
      (report) =>
        studentIds.has(report.studentId) && report.status === "submitted"
    );

    return {
      attendance: pendingAttendance,
      requirements: pendingRequirements,
      reports: pendingReports,
    };
  }, [attendanceData, requirementsData, reportsData, students]);

  const templatesCount = templatesResp?.requirementTemplates?.length ?? 0;

  const sectionsAgg = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        name: string;
        totalStudents: number;
        attendancePctSum: number;
        attendancePctCount: number;
        approvedReqs: number;
        totalReqs: number;
      }
    >();

    for (const student of students) {
      const enrollment = student?.enrollments?.[0];
      const section = enrollment?.section;
      const sectionKey: string | undefined = section?.id;
      if (!sectionKey) continue;

      if (!map.has(sectionKey)) {
        map.set(sectionKey, {
          id: section.id,
          name: section.name,
          totalStudents: 0,
          attendancePctSum: 0,
          attendancePctCount: 0,
          approvedReqs: 0,
          totalReqs: 0,
        });
      }

      const bucket = map.get(sectionKey)!;
      bucket.totalStudents += 1;

      // Attendance percentage for this student based on expected days
      const practicum = student?.practicums?.[0];
      const agency = practicum?.agency;
      const expectedDays = calculateExpectedAttendanceDays(
        practicum?.startDate,
        practicum?.endDate,
        agency?.operatingDays
      );
      const records: any[] = student?.attendanceRecords ?? [];
      const presentish = records.filter((r) =>
        ["present", "late", "excused"].includes(r.status)
      ).length;
      if (expectedDays > 0) {
        bucket.attendancePctSum += Math.round(
          (presentish / expectedDays) * 100
        );
        bucket.attendancePctCount += 1;
      }

      // Requirement completion for this student
      // Only count requirements that have been submitted (have files)
      const reqs: any[] = student?.requirements ?? [];
      const submittedReqs = reqs.filter((r) => !!(r.fileUrl || r.fileName));
      const approved = submittedReqs.filter(
        (r) => r.status?.toLowerCase() === "approved"
      ).length;
      // Use templatesCount as denominator if available, otherwise use submitted requirements count
      const denom =
        templatesCount > 0 ? templatesCount : submittedReqs.length || 1;
      bucket.totalReqs += denom;
      bucket.approvedReqs += Math.min(approved, denom);
    }

    return Array.from(map.values()).map((b) => {
      const avgAttendance =
        b.attendancePctCount > 0
          ? Math.round(b.attendancePctSum / b.attendancePctCount)
          : 0;
      const completionRate =
        b.totalReqs > 0 ? Math.round((b.approvedReqs / b.totalReqs) * 100) : 0;
      return {
        id: b.id,
        name: b.name,
        totalStudents: b.totalStudents,
        avgAttendance,
        completionRate,
      };
    });
  }, [students, templatesCount]);

  const stats = useMemo(() => {
    const totalStudents = students.length;
    const sectionsCount = sectionsAgg.length;

    // Overall attendance: calculate each student's rate, then average them
    const studentAttendanceRates: number[] = [];
    for (const student of students) {
      const practicum = student?.practicums?.[0];
      const agency = practicum?.agency;
      const expectedDays = calculateExpectedAttendanceDays(
        practicum?.startDate,
        practicum?.endDate,
        agency?.operatingDays
      );

      if (expectedDays > 0) {
        const records: any[] = student?.attendanceRecords ?? [];
        const presentish = records.filter((r) =>
          ["present", "late", "excused"].includes(r.status)
        ).length;
        const studentRate = Math.round((presentish / expectedDays) * 100);
        studentAttendanceRates.push(studentRate);
      }
    }
    const averageAttendance =
      studentAttendanceRates.length > 0
        ? Math.round(
            studentAttendanceRates.reduce((sum, rate) => sum + rate, 0) /
              studentAttendanceRates.length
          )
        : 0;

    // Overall requirement completion across all students
    // Only count requirements that have been submitted (have files)
    let totalReqs = 0;
    let approvedReqs = 0;
    for (const student of students) {
      const reqs: any[] = student?.requirements ?? [];
      const submittedReqs = reqs.filter((r) => !!(r.fileUrl || r.fileName));
      const approved = submittedReqs.filter(
        (r) => r.status?.toLowerCase() === "approved"
      ).length;
      // Use templatesCount as denominator if available, otherwise use submitted requirements count
      const denom =
        templatesCount > 0 ? templatesCount : submittedReqs.length || 1;
      totalReqs += denom;
      approvedReqs += Math.min(approved, denom);
    }
    const averageCompletion =
      totalReqs > 0 ? Math.round((approvedReqs / totalReqs) * 100) : 0;

    // Calculate on-time submission rate for weekly reports
    const weeklyReports = allWeeklyReportsData?.reports ?? [];
    const studentIds = new Set(students.map((s) => s.id));

    // Filter reports to only include those from students under this instructor
    const instructorWeeklyReports = weeklyReports.filter(
      (report) => studentIds.has(report.studentId) && report.submittedDate
    );

    let onTimeSubmissions = 0;
    let totalSubmissions = 0;

    for (const report of instructorWeeklyReports) {
      if (report.submittedDate && report.dueDate) {
        const submittedDate = new Date(report.submittedDate);
        const dueDate = new Date(report.dueDate);

        // Consider submitted on time if submitted on or before due date
        if (submittedDate <= dueDate) {
          onTimeSubmissions++;
        }
        totalSubmissions++;
      }
    }

    const onTimeSubmissionRate =
      totalSubmissions > 0
        ? Math.round((onTimeSubmissions / totalSubmissions) * 100)
        : 0;

    // Calculate daily attendance: students who clocked in today
    const today = new Date();
    const todayDateStr = today.toISOString().split("T")[0]; // YYYY-MM-DD format

    let studentsWithPracticum = 0;
    let studentsPresentToday = 0;

    for (const student of students) {
      const practicum = student?.practicums?.[0];
      // Only count students with valid practicums
      if (practicum) {
        studentsWithPracticum++;

        // Check if student has attendance record for today
        const records: any[] = student?.attendanceRecords ?? [];
        const hasTodayRecord = records.some((record) => {
          if (!record.date) return false;
          const recordDate = new Date(record.date);
          const recordDateStr = recordDate.toISOString().split("T")[0];
          return (
            recordDateStr === todayDateStr &&
            ["present", "late", "excused"].includes(record.status)
          );
        });

        if (hasTodayRecord) {
          studentsPresentToday++;
        }
      }
    }

    const dailyAttendancePercentage =
      studentsWithPracticum > 0
        ? Math.round((studentsPresentToday / studentsWithPracticum) * 100)
        : 0;

    // Calculate students missing today (expected but haven't clocked in)
    const studentsMissingToday = studentsWithPracticum - studentsPresentToday;

    // Calculate requirement breakdown for detailed view
    let totalRequirements = 0;
    let approvedRequirements = 0;
    let submittedRequirements = 0;
    let pendingRequirements = 0;
    let rejectedRequirements = 0;

    for (const student of students) {
      const reqs: any[] = student?.requirements ?? [];
      const submittedReqs = reqs.filter((r) => !!(r.fileUrl || r.fileName));

      // Count by status (only requirements with files)
      approvedRequirements += submittedReqs.filter(
        (r) => r.status?.toLowerCase() === "approved"
      ).length;
      submittedRequirements += submittedReqs.filter(
        (r) => r.status?.toLowerCase() === "submitted"
      ).length;
      pendingRequirements += submittedReqs.filter(
        (r) => r.status?.toLowerCase() === "pending"
      ).length;
      rejectedRequirements += submittedReqs.filter(
        (r) => r.status?.toLowerCase() === "rejected"
      ).length;

      // Count total expected requirements (templates count per student)
      const denom =
        templatesCount > 0 ? templatesCount : submittedReqs.length || 1;
      totalRequirements += denom;
    }

    return {
      totalStudents,
      sectionsCount,
      averageAttendance,
      averageCompletion,
      onTimeSubmissionRate,
      dailyAttendancePercentage,
      dailyAttendanceCount: studentsPresentToday,
      dailyAttendanceTotal: studentsWithPracticum,
      studentsMissingToday,
      requirementBreakdown: {
        total: totalRequirements,
        approved: approvedRequirements,
        submitted: submittedRequirements,
        pending: pendingRequirements,
        rejected: rejectedRequirements,
        templatesCount,
      },
    };
  }, [students, sectionsAgg, allWeeklyReportsData, templatesCount]);

  // Students needing attention
  const studentsNeedingAttention = useMemo(() => {
    const issues: Array<{
      studentId: string;
      studentName: string;
      sectionName: string;
      issues: string[];
      attendanceRate: number;
      missingRequirements: number;
    }> = [];

    for (const student of students) {
      const enrollment = student?.enrollments?.[0];
      const section = enrollment?.section;
      const sectionName = section?.name || "No Section";
      const studentIssues: string[] = [];

      // Check attendance
      const practicum = student?.practicums?.[0];
      const agency = practicum?.agency;
      const expectedDays = calculateExpectedAttendanceDays(
        practicum?.startDate,
        practicum?.endDate,
        agency?.operatingDays
      );

      let attendanceRate = 0;
      if (expectedDays > 0) {
        const records: any[] = student?.attendanceRecords ?? [];
        const presentish = records.filter((r) =>
          ["present", "late", "excused"].includes(r.status)
        ).length;
        attendanceRate = Math.round((presentish / expectedDays) * 100);
      }

      if (attendanceRate < 80 && expectedDays > 0) {
        studentIssues.push(`Low attendance (${attendanceRate}%)`);
      }

      // Check missing requirements
      const reqs: any[] = student?.requirements ?? [];
      const submittedReqs = reqs.filter((r) => !!(r.fileUrl || r.fileName));
      const expectedReqs =
        templatesCount > 0 ? templatesCount : submittedReqs.length || 0;
      const missingReqs = expectedReqs - submittedReqs.length;

      if (missingReqs > 0) {
        studentIssues.push(
          `${missingReqs} missing requirement${missingReqs > 1 ? "s" : ""}`
        );
      }

      if (studentIssues.length > 0) {
        issues.push({
          studentId: student.id,
          studentName:
            `${student.firstName || ""} ${student.lastName || ""}`.trim() ||
            "Unknown",
          sectionName,
          issues: studentIssues,
          attendanceRate,
          missingRequirements: missingReqs,
        });
      }
    }

    // Sort by priority: first by number of issues, then by attendance rate
    return issues.sort((a, b) => {
      if (b.issues.length !== a.issues.length) {
        return b.issues.length - a.issues.length;
      }
      return a.attendanceRate - b.attendanceRate;
    });
  }, [students, templatesCount]);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "add-student":
        router.push("/dashboard/instructor/students/add");
        break;
      case "post-announcement":
        router.push("/dashboard/instructor/announcements");
        break;
      case "view-analytics":
        router.push("/dashboard/instructor/analytics");
        break;
      case "settings":
        router.push("/dashboard/instructor/settings");
        break;
      default:
        break;
    }
  };

  return (
    <div>
      <div className="mx-auto flex w-full flex-col gap-6 border border-primary-200 bg-white px-6 py-8 text-gray-900">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-700">
            Instructor overview
          </p>
          <h1 className="text-3xl font-semibold text-gray-900">
            Welcome back{user?.firstName ? `, ${user.firstName}!` : "!"}
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Track everything from attendance to requirements with the same calm
            palette as your invitations workspace.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            variant="outline"
            className="h-11 border border-gray-300 bg-white px-6 text-gray-700 transition-all duration-300 hover:border-primary-400 hover:bg-primary-50/50 w-full sm:w-auto"
            onClick={() => router.push("/dashboard/instructor/invitations")}
          >
            Manage invitations
          </Button>
          <Button
            variant="outline"
            className="h-11 border border-primary-500 bg-primary-50 px-6 text-primary-700 transition-all duration-300 hover:border-primary-400 hover:bg-primary-50/50 w-full sm:w-auto"
            onClick={() =>
              router.push("/dashboard/instructor/invitations/send")
            }
          >
            <MailPlus className="mr-2 h-4 w-4" />
            Send invites
          </Button>
        </div>
      </div>

      <div className="mx-auto mt-8 flex w-full flex-col gap-8">
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <InstructorStatsCard
            icon={Users}
            label="Total Students"
            value={stats.totalStudents}
            helperText={
              <>
                Across{" "}
                {isUserLoading || isStudentsLoading ? "…" : stats.sectionsCount}{" "}
                sections
              </>
            }
            isLoading={isUserLoading || isStudentsLoading}
          />
          <InstructorStatsCard
            icon={FileCheck}
            label="Requirements"
            value={`${stats.averageCompletion}%`}
            helperText="Completion rate"
            isLoading={isUserLoading || isStudentsLoading}
          />
          <InstructorStatsCard
            icon={AlertTriangle}
            label="Students Missing"
            value={stats.studentsMissingToday}
            helperText={
              stats.dailyAttendanceTotal > 0
                ? stats.studentsMissingToday === 0
                  ? "All students present"
                  : "Expected but haven't clocked in today"
                : "No students with practicums"
            }
            isLoading={isUserLoading || isStudentsLoading}
          />
        </div>

        {/* Actionable Content Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Requirement Status Overview */}
          <Card className="border border-primary-200 shadow-sm">
            <CardHeader>
              <CardTitle>Requirement Status</CardTitle>
              <CardDescription>
                Overview of requirement submissions and approvals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Approved</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="text-muted-foreground hover:text-foreground">
                          <Info className="h-4 w-4" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-2 text-sm">
                          <p className="font-semibold">
                            How is this calculated?
                          </p>
                          <p className="text-muted-foreground">
                            Approved percentage = (Number of approved
                            requirements / Total expected requirements) × 100%
                          </p>
                          <p className="text-muted-foreground">
                            Only requirements with submitted files are counted.
                            Total expected ={" "}
                            {stats.requirementBreakdown?.templatesCount || 0}{" "}
                            templates × {stats.totalStudents} students ={" "}
                            {stats.requirementBreakdown?.total || 0}{" "}
                            requirements.
                          </p>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">
                      {stats.requirementBreakdown?.approved || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stats.requirementBreakdown?.total
                        ? Math.round(
                            (stats.requirementBreakdown.approved /
                              stats.requirementBreakdown.total) *
                              100 || 0
                          )
                        : 0}
                      %
                    </div>
                  </div>
                </div>
                <Progress
                  value={
                    stats.requirementBreakdown?.total
                      ? (stats.requirementBreakdown.approved /
                          stats.requirementBreakdown.total) *
                          100 || 0
                      : 0
                  }
                  className="h-2"
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Pending</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="text-muted-foreground hover:text-foreground">
                          <Info className="h-4 w-4" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-2 text-sm">
                          <p className="font-semibold">
                            How is this calculated?
                          </p>
                          <p className="text-muted-foreground">
                            Pending percentage = (Number of pending requirements
                            / Total expected requirements) × 100%
                          </p>
                          <p className="text-muted-foreground">
                            Only requirements with submitted files that are
                            awaiting approval are counted. Total expected ={" "}
                            {stats.requirementBreakdown?.templatesCount || 0}{" "}
                            templates × {stats.totalStudents} students ={" "}
                            {stats.requirementBreakdown?.total || 0}{" "}
                            requirements.
                          </p>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">
                      {stats.requirementBreakdown?.pending || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stats.requirementBreakdown?.total
                        ? Math.round(
                            (stats.requirementBreakdown.pending /
                              stats.requirementBreakdown.total) *
                              100 || 0
                          )
                        : 0}
                      %
                    </div>
                  </div>
                </div>
                <Progress
                  value={
                    stats.requirementBreakdown?.total
                      ? (stats.requirementBreakdown.pending /
                          stats.requirementBreakdown.total) *
                          100 || 0
                      : 0
                  }
                  className="h-2"
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Submitted</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="text-muted-foreground hover:text-foreground">
                          <Info className="h-4 w-4" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-2 text-sm">
                          <p className="font-semibold">
                            How is this calculated?
                          </p>
                          <p className="text-muted-foreground">
                            Submitted percentage = (Number of submitted
                            requirements / Total expected requirements) × 100%
                          </p>
                          <p className="text-muted-foreground">
                            Only requirements with submitted files are counted.
                            Total expected ={" "}
                            {stats.requirementBreakdown?.templatesCount || 0}{" "}
                            templates × {stats.totalStudents} students ={" "}
                            {stats.requirementBreakdown?.total || 0}{" "}
                            requirements.
                          </p>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">
                      {stats.requirementBreakdown?.submitted || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stats.requirementBreakdown?.total
                        ? Math.round(
                            (stats.requirementBreakdown.submitted /
                              stats.requirementBreakdown.total) *
                              100 || 0
                          )
                        : 0}
                      %
                    </div>
                  </div>
                </div>
                <Progress
                  value={
                    stats.requirementBreakdown?.total
                      ? (stats.requirementBreakdown.submitted /
                          stats.requirementBreakdown.total) *
                          100 || 0
                      : 0
                  }
                  className="h-2"
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Rejected</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="text-muted-foreground hover:text-foreground">
                          <Info className="h-4 w-4" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-2 text-sm">
                          <p className="font-semibold">
                            How is this calculated?
                          </p>
                          <p className="text-muted-foreground">
                            Rejected percentage = (Number of rejected
                            requirements / Total expected requirements) × 100%
                          </p>
                          <p className="text-muted-foreground">
                            Only requirements with submitted files that were
                            rejected are counted. Total expected ={" "}
                            {stats.requirementBreakdown?.templatesCount || 0}{" "}
                            templates × {stats.totalStudents} students ={" "}
                            {stats.requirementBreakdown?.total || 0}{" "}
                            requirements.
                          </p>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">
                      {stats.requirementBreakdown?.rejected || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stats.requirementBreakdown?.total
                        ? Math.round(
                            (stats.requirementBreakdown.rejected /
                              stats.requirementBreakdown.total) *
                              100 || 0
                          )
                        : 0}
                      %
                    </div>
                  </div>
                </div>
                <Progress
                  value={
                    stats.requirementBreakdown?.total
                      ? (stats.requirementBreakdown.rejected /
                          stats.requirementBreakdown.total) *
                          100 || 0
                      : 0
                  }
                  className="h-2"
                />
              </div>
              <Button
                variant="outline"
                className="w-full border border-gray-300 text-gray-700 transition-all duration-300 hover:border-primary-400 hover:bg-primary-50/50"
                onClick={() =>
                  router.push("/dashboard/instructor/requirements")
                }
              >
                View All Requirements
              </Button>
            </CardContent>
          </Card>

          {/* Students Needing Attention */}
          <Card className="border border-primary-200 shadow-sm">
            <CardHeader>
              <CardTitle>Students Needing Attention</CardTitle>
              <CardDescription>
                Students with low attendance or missing requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {studentsNeedingAttention.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    All students are on track!
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {studentsNeedingAttention.slice(0, 5).map((student) => (
                    <div
                      key={student.studentId}
                      className="border border-primary-200 rounded-lg p-3 hover:bg-primary-50/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-sm">
                            {student.studentName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {student.sectionName}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-yellow-50 text-yellow-700"
                        >
                          {student.issues.length} issue
                          {student.issues.length > 1 ? "s" : ""}
                        </Badge>
                      </div>
                      <ul className="space-y-1">
                        {student.issues.map((issue, idx) => {
                          const isAttendanceIssue =
                            issue.includes("attendance");
                          const isRequirementIssue =
                            issue.includes("requirement");
                          return (
                            <li
                              key={idx}
                              className="text-xs text-muted-foreground flex items-center gap-1"
                            >
                              <span className="h-1 w-1 rounded-full bg-primary-600" />
                              <span>{issue}</span>
                              {(isAttendanceIssue || isRequirementIssue) && (
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <button className="text-muted-foreground hover:text-foreground ml-1">
                                      <Info className="h-3 w-3" />
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-80">
                                    <div className="space-y-2 text-sm">
                                      <p className="font-semibold">
                                        How is this calculated?
                                      </p>
                                      {isAttendanceIssue && (
                                        <>
                                          <p className="text-muted-foreground">
                                            Attendance Rate = (Present days /
                                            Expected days) × 100%
                                          </p>
                                          <p className="text-muted-foreground">
                                            Present days include: Present, Late,
                                            and Excused statuses. Expected days
                                            are calculated based on the
                                            practicum start/end dates and agency
                                            operating days.
                                          </p>
                                        </>
                                      )}
                                      {isRequirementIssue && (
                                        <>
                                          <p className="text-muted-foreground">
                                            Missing Requirements = Expected
                                            requirements - Submitted
                                            requirements
                                          </p>
                                          <p className="text-muted-foreground">
                                            Expected requirements = Number of
                                            active requirement templates (
                                            {templatesCount}). Only requirements
                                            with submitted files are counted.
                                          </p>
                                        </>
                                      )}
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="mt-2 h-7 text-xs w-full"
                        onClick={() =>
                          router.push(
                            `/dashboard/instructor/students?search=${encodeURIComponent(
                              student.studentName
                            )}`
                          )
                        }
                      >
                        View Details
                      </Button>
                    </div>
                  ))}
                  {studentsNeedingAttention.length > 5 && (
                    <Button
                      variant="outline"
                      className="w-full border border-gray-300 text-gray-700 transition-all duration-300 hover:border-primary-400 hover:bg-primary-50/50"
                      onClick={() =>
                        router.push("/dashboard/instructor/students")
                      }
                    >
                      View All ({studentsNeedingAttention.length} students)
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Insights */}
          <Card className="border border-primary-200 shadow-sm">
            <CardHeader>
              <CardTitle>Quick Insights</CardTitle>
              <CardDescription>Key metrics at a glance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="border border-primary-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        Today's Attendance
                      </span>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="text-muted-foreground hover:text-foreground">
                            <Info className="h-4 w-4" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                          <div className="space-y-2 text-sm">
                            <p className="font-semibold">
                              How is this calculated?
                            </p>
                            <p className="text-muted-foreground">
                              Today's Attendance = (Students present today /
                              Students with practicums) × 100%
                            </p>
                            <p className="text-muted-foreground">
                              Only students with active practicums are counted.
                              A student is considered present if they have an
                              attendance record for today with status: Present,
                              Late, or Excused.
                            </p>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        stats.dailyAttendancePercentage >= 80
                          ? "bg-green-50 text-green-700"
                          : stats.dailyAttendancePercentage >= 60
                          ? "bg-yellow-50 text-yellow-700"
                          : "bg-red-50 text-red-700"
                      }
                    >
                      {stats.dailyAttendancePercentage}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.dailyAttendanceCount} of {stats.dailyAttendanceTotal}{" "}
                    students present
                  </p>
                  <Progress
                    value={stats.dailyAttendancePercentage}
                    className="mt-2 h-2"
                  />
                </div>

                <div className="border border-primary-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        On-Time Submissions
                      </span>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="text-muted-foreground hover:text-foreground">
                            <Info className="h-4 w-4" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                          <div className="space-y-2 text-sm">
                            <p className="font-semibold">
                              How is this calculated?
                            </p>
                            <p className="text-muted-foreground">
                              On-Time Submission Rate = (Reports submitted on or
                              before due date / Total weekly reports) × 100%
                            </p>
                            <p className="text-muted-foreground">
                              Only weekly reports from your students are
                              counted. A report is considered on-time if the
                              submitted date is on or before the due date.
                            </p>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        stats.onTimeSubmissionRate >= 80
                          ? "bg-green-50 text-green-700"
                          : stats.onTimeSubmissionRate >= 60
                          ? "bg-yellow-50 text-yellow-700"
                          : "bg-red-50 text-red-700"
                      }
                    >
                      {stats.onTimeSubmissionRate}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Weekly reports submitted on time
                  </p>
                  <Progress
                    value={stats.onTimeSubmissionRate}
                    className="mt-2 h-2"
                  />
                </div>

                <div className="border border-primary-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        Overall Completion
                      </span>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="text-muted-foreground hover:text-foreground">
                            <Info className="h-4 w-4" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                          <div className="space-y-2 text-sm">
                            <p className="font-semibold">
                              How is this calculated?
                            </p>
                            <p className="text-muted-foreground">
                              Overall Completion = (Total approved requirements
                              / Total expected requirements) × 100%
                            </p>
                            <p className="text-muted-foreground">
                              Total expected ={" "}
                              {stats.requirementBreakdown?.templatesCount || 0}{" "}
                              templates × {stats.totalStudents} students ={" "}
                              {stats.requirementBreakdown?.total || 0}{" "}
                              requirements. Only requirements with submitted
                              files are counted.
                            </p>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        stats.averageCompletion >= 80
                          ? "bg-green-50 text-green-700"
                          : stats.averageCompletion >= 60
                          ? "bg-yellow-50 text-yellow-700"
                          : "bg-red-50 text-red-700"
                      }
                    >
                      {stats.averageCompletion}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Requirements completion rate
                  </p>
                  <Progress
                    value={stats.averageCompletion}
                    className="mt-2 h-2"
                  />
                </div>

                <div className="border border-primary-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        Average Attendance
                      </span>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="text-muted-foreground hover:text-foreground">
                            <Info className="h-4 w-4" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                          <div className="space-y-2 text-sm">
                            <p className="font-semibold">
                              How is this calculated?
                            </p>
                            <p className="text-muted-foreground">
                              Average Attendance = Average of all individual
                              student attendance rates
                            </p>
                            <p className="text-muted-foreground">
                              Each student's attendance rate = (Present days /
                              Expected days) × 100%. Present days include:
                              Present, Late, and Excused statuses. Expected days
                              are calculated based on practicum start/end dates
                              and agency operating days.
                            </p>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        stats.averageAttendance >= 80
                          ? "bg-green-50 text-green-700"
                          : stats.averageAttendance >= 60
                          ? "bg-yellow-50 text-yellow-700"
                          : "bg-red-50 text-red-700"
                      }
                    >
                      {stats.averageAttendance}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across all students
                  </p>
                  <Progress
                    value={stats.averageAttendance}
                    className="mt-2 h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Requirements Breakdown - Collapsible */}
        <Card className="border border-primary-200 shadow-sm">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem
              value="requirements-breakdown"
              className="border-none"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary-600" />
                  <CardTitle className="text-lg">
                    How is the completion rate calculated?
                  </CardTitle>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-2 text-sm text-gray-700">
                  <div>
                    <strong>Formula:</strong> Completion Rate = (Total Approved
                    Requirements / Total Expected Requirements) × 100%
                  </div>
                  <div>
                    <strong>Total Expected:</strong> Each student must complete
                    all {stats.requirementBreakdown?.templatesCount || 0}{" "}
                    requirement templates. With {stats.totalStudents}{" "}
                    student(s), total expected ={" "}
                    {stats.requirementBreakdown?.templatesCount || 0} templates
                    × {stats.totalStudents} students ={" "}
                    {stats.requirementBreakdown?.total || 0} requirements
                  </div>
                  <div>
                    <strong>Total Approved:</strong> Sum of all approved
                    requirements across all students ={" "}
                    {stats.requirementBreakdown?.approved || 0} requirements
                  </div>
                  <div>
                    <strong>Calculation:</strong> (
                    {stats.requirementBreakdown?.approved || 0} /{" "}
                    {stats.requirementBreakdown?.total || 1}) × 100% ={" "}
                    <strong>{stats.averageCompletion}%</strong>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>

        {/* Quick Actions */}
        <Card className="border border-primary-200 shadow-sm">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Frequently used actions for managing your students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 border border-gray-300 text-gray-700 transition-all duration-300 hover:border-primary-400 hover:bg-primary-50/50"
                onClick={() => handleQuickAction("post-announcement")}
              >
                <MessageSquare className="w-6 h-6" />
                <span>Post Announcement</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 border border-gray-300 text-gray-700 transition-all duration-300 hover:border-primary-400 hover:bg-primary-50/50"
                onClick={() => handleQuickAction("settings")}
              >
                <Settings className="w-6 h-6" />
                <span>Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity & Pending Items */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border border-primary-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Pending Approvals
              </CardTitle>
              <CardDescription>Items requiring your attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-4 border border-primary-200 bg-white p-5 shadow-sm">
                <div>
                  <h4 className="font-medium text-foreground">
                    Attendance Logs
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {isAttendanceLoading
                      ? "Loading..."
                      : `${pendingItems.attendance.length} pending approvals`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700"
                  >
                    {pendingItems.attendance.length > 0 ? "Urgent" : "None"}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border border-gray-300 text-gray-700 transition-all duration-300 hover:border-primary-400 hover:bg-primary-50/50"
                    onClick={() =>
                      router.push("/dashboard/instructor/attendance")
                    }
                  >
                    Review
                  </Button>
                </div>
              </div>
              <div className="flex items-start gap-4 border border-primary-200 bg-white p-5 shadow-sm">
                <div>
                  <h4 className="font-medium text-foreground">
                    Weekly Reports
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {isReportsLoading
                      ? "Loading..."
                      : `${pendingItems.reports.length} new submissions`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700"
                  >
                    {pendingItems.reports.length > 0 ? "New" : "None"}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border border-gray-300 text-gray-700 transition-all duration-300 hover:border-primary-400 hover:bg-primary-50/50"
                    onClick={() =>
                      router.push("/dashboard/instructor/reports/weekly")
                    }
                  >
                    View
                  </Button>
                </div>
              </div>
              <div className="flex items-start gap-4 border border-primary-200 bg-white p-5 shadow-sm">
                <div>
                  <h4 className="font-medium text-foreground">Requirements</h4>
                  <p className="text-sm text-muted-foreground">
                    {isRequirementsLoading
                      ? "Loading..."
                      : `${pendingItems.requirements.length} documents ready for review`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700"
                  >
                    {pendingItems.requirements.length > 0 ? "Ready" : "None"}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border border-gray-300 text-gray-700 transition-all duration-300 hover:border-primary-400 hover:bg-primary-50/50"
                    onClick={() =>
                      router.push("/dashboard/instructor/requirements")
                    }
                  >
                    Check
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-primary-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Section Performance
              </CardTitle>
              <CardDescription>
                Overview of your assigned sections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {sectionsAgg.map((section) => (
                  <div
                    key={section.id}
                    className="rounded-2xl border border-primary-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-primary-600">
                          Section
                        </p>
                        <h4 className="text-lg font-semibold text-foreground">
                          {section.name}
                        </h4>
                      </div>
                      <Badge
                        variant="outline"
                        className="border border-gray-300 bg-white text-gray-700"
                      >
                        {section.totalStudents} students
                      </Badge>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Attendance
                          </span>
                          <span className="font-semibold text-primary-700">
                            {section.avgAttendance}%
                          </span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-primary-100">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${section.avgAttendance}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Requirements
                          </span>
                          <span className="font-semibold text-primary-700">
                            {section.completionRate}%
                          </span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-primary-100">
                          <div
                            className="h-full rounded-full bg-primary/80"
                            style={{ width: `${section.completionRate}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Reports</span>
                          <span className="font-semibold text-primary-700">
                            {Math.round(section.completionRate * 0.9)}%
                          </span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-primary-100">
                          <div
                            className="h-full rounded-full bg-primary/60"
                            style={{
                              width: `${Math.round(
                                section.completionRate * 0.9
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
