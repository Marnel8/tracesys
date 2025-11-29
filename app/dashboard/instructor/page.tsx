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
import { useReports } from "@/hooks/report/useReport";
import {
  Users,
  FileCheck,
  Clock,
  Plus,
  MessageSquare,
  Settings,
  AlertTriangle,
  CheckCircle,
  MailPlus,
} from "lucide-react";
import { InstructorStatsCard } from "@/components/instructor-stats-card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "@/components/ui/chart";

const weeklyAttendanceChartConfig: ChartConfig = {
  attendance: {
    label: "Attendance %",
    color: "#c026d3",
  },
  submissions: {
    label: "Submissions",
    color: "#0ea5e9",
  },
};

const sectionPerformanceChartConfig: ChartConfig = {
  completion: {
    label: "Completion Rate %",
    color: "#c026d3",
  },
};

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
      const reqs: any[] = student?.requirements ?? [];
      bucket.totalReqs += reqs.length;
      bucket.approvedReqs += reqs.filter((r) => r.status === "approved").length;
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
  }, [students]);

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
    let totalReqs = 0;
    let approvedReqs = 0;
    for (const student of students) {
      const reqs: any[] = student?.requirements ?? [];
      totalReqs += reqs.length;
      approvedReqs += reqs.filter((r) => r.status === "approved").length;
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
    };
  }, [students, sectionsAgg, allWeeklyReportsData]);

  const weeklyAttendanceData = useMemo(() => {
    // Build last 8 weeks series from attendance record dates
    const now = new Date();
    const weeks: {
      weekStart: string;
      attendance: number;
      submissions: number;
    }[] = [];

    function startOfWeek(d: Date) {
      const date = new Date(
        Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
      );
      const day = date.getUTCDay() || 7; // Monday-start ISO-ish
      if (day !== 1) date.setUTCDate(date.getUTCDate() - (day - 1));
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }

    // Pre-index attendance per weekStart (ISO)
    const perWeek = new Map<string, { total: number; presentish: number }>();
    for (const student of students) {
      const records: any[] = student?.attendanceRecords ?? [];
      for (const r of records) {
        const dt = new Date(r.date);
        const wk = startOfWeek(dt).toISOString().slice(0, 10);
        if (!perWeek.has(wk)) perWeek.set(wk, { total: 0, presentish: 0 });
        const b = perWeek.get(wk)!;
        b.total += 1;
        if (["present", "late", "excused"].includes(r.status))
          b.presentish += 1;
      }
    }

    for (let i = 7; i >= 0; i--) {
      const d = new Date(now);
      d.setUTCDate(d.getUTCDate() - i * 7);
      const wk = startOfWeek(d).toISOString().slice(0, 10);
      const agg = perWeek.get(wk);
      const attendance =
        agg && agg.total > 0
          ? Math.round((agg.presentish / agg.total) * 100)
          : 0;
      weeks.push({ weekStart: wk, attendance, submissions: 0 });
    }

    return weeks.map((w, idx) => ({
      week: `W${idx + 1}`,
      attendance: w.attendance,
      submissions: w.submissions,
    }));
  }, [students]);

  const sectionPerformanceData = useMemo(() => {
    return sectionsAgg.map((s) => ({
      section: s.name,
      completion: s.completionRate,
    }));
  }, [sectionsAgg]);

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

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-primary-200 shadow-sm">
            <CardHeader>
              <CardTitle>Weekly Attendance Trends</CardTitle>
              <CardDescription>
                Attendance rates and submission counts over the past 8 weeks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={weeklyAttendanceChartConfig}
                className="h-[300px] w-full"
              >
                <LineChart data={weeklyAttendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    type="monotone"
                    dataKey="attendance"
                    stroke="var(--color-attendance)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="submissions"
                    stroke="var(--color-submissions)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="border border-primary-200 shadow-sm">
            <CardHeader>
              <CardTitle>Section Performance</CardTitle>
              <CardDescription>Completion rates by section</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={sectionPerformanceChartConfig}
                className="h-[300px] w-full"
              >
                <BarChart data={sectionPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="section" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="completion"
                    fill="var(--color-completion)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border border-primary-200 shadow-sm">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Frequently used actions for managing your students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 border border-primary-500 bg-primary-50 text-primary-700 transition-all duration-300 hover:border-primary-400 hover:bg-primary-50/50"
                onClick={() => handleQuickAction("add-student")}
              >
                <Plus className="w-6 h-6" />
                <span>Add Student</span>
              </Button>
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
