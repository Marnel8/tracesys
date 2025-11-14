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
  TrendingUp,
  Plus,
  MessageSquare,
  Settings,
  BarChart3,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

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

      // Attendance percentage for this student
      const records: any[] = student?.attendanceRecords ?? [];
      const totalDays = records.length;
      const presentish = records.filter((r) =>
        ["present", "late", "excused"].includes(r.status)
      ).length;
      if (totalDays > 0) {
        bucket.attendancePctSum += Math.round((presentish / totalDays) * 100);
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

    // Overall attendance across all students
    let totalRecords = 0;
    let totalPresentish = 0;
    for (const student of students) {
      const records: any[] = student?.attendanceRecords ?? [];
      totalRecords += records.length;
      totalPresentish += records.filter((r) =>
        ["present", "late", "excused"].includes(r.status)
      ).length;
    }
    const averageAttendance =
      totalRecords > 0 ? Math.round((totalPresentish / totalRecords) * 100) : 0;

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

    return {
      totalStudents,
      sectionsCount,
      averageAttendance,
      averageCompletion,
      onTimeSubmissionRate,
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
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back{user?.firstName ? `, ${user.firstName}!` : "!"}
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your students today.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-secondary-50 border-primary-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-600" />
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {isUserLoading || isStudentsLoading ? "…" : stats.totalStudents}
            </div>
            <p className="text-sm text-gray-600">
              Across{" "}
              {isUserLoading || isStudentsLoading ? "…" : stats.sectionsCount}{" "}
              sections
            </p>
          </CardContent>
        </Card>

        <Card className="bg-secondary-50 border-accent-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-accent-600" />
              Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {isUserLoading || isStudentsLoading
                ? "…"
                : `${stats.averageCompletion}%`}
            </div>
            <p className="text-sm text-gray-600">Completion rate</p>
          </CardContent>
        </Card>

        <Card className="bg-secondary-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-600" />
              Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {isUserLoading || isStudentsLoading
                ? "…"
                : `${stats.averageAttendance}%`}
            </div>
            <p className="text-sm text-gray-600">Average rate</p>
          </CardContent>
        </Card>

        {/* <Card className="bg-secondary-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {isWeeklyReportsLoading ? "…" : `${stats.onTimeSubmissionRate}%`}
            </div>
            <p className="text-sm text-gray-600">Submitted on time</p>
          </CardContent>
        </Card> */}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Attendance Trends</CardTitle>
            <CardDescription>
              Attendance rates and submission counts over the past 8 weeks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyAttendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Attendance %"
                />
                <Line
                  type="monotone"
                  dataKey="submissions"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Submissions"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Section Performance</CardTitle>
            <CardDescription>Completion rates by section</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sectionPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="section" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="completion"
                  fill="#8884d8"
                  name="Completion Rate %"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Frequently used actions for managing your students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              className="h-20 flex-col gap-2 bg-primary-500 hover:bg-primary-600"
              onClick={() => handleQuickAction("add-student")}
            >
              <Plus className="w-6 h-6" />
              <span>Add Student</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 border-accent-300 hover:bg-accent-50"
              onClick={() => handleQuickAction("post-announcement")}
            >
              <MessageSquare className="w-6 h-6" />
              <span>Post Announcement</span>
            </Button>
            {/* <Button
              variant="outline"
              className="h-20 flex-col gap-2 border-green-300 hover:bg-green-50"
              onClick={() => handleQuickAction("view-analytics")}
            >
              <BarChart3 className="w-6 h-6" />
              <span>View Analytics</span>
            </Button> */}
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 border-gray-300 hover:bg-gray-50"
              onClick={() => handleQuickAction("settings")}
            >
              <Settings className="w-6 h-6" />
              <span>Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity & Pending Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              Pending Approvals
            </CardTitle>
            <CardDescription>Items requiring your attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div>
                <h4 className="font-medium text-gray-900">Attendance Logs</h4>
                <p className="text-sm text-gray-600">
                  {isAttendanceLoading
                    ? "Loading..."
                    : `${pendingItems.attendance.length} pending approvals`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-yellow-100 text-yellow-800"
                >
                  {pendingItems.attendance.length > 0 ? "Urgent" : "None"}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    router.push("/dashboard/instructor/attendance")
                  }
                >
                  Review
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <h4 className="font-medium text-gray-900">Weekly Reports</h4>
                <p className="text-sm text-gray-600">
                  {isReportsLoading
                    ? "Loading..."
                    : `${pendingItems.reports.length} new submissions`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  {pendingItems.reports.length > 0 ? "New" : "None"}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    router.push("/dashboard/instructor/reports/weekly")
                  }
                >
                  View
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div>
                <h4 className="font-medium text-gray-900">Requirements</h4>
                <p className="text-sm text-gray-600">
                  {isRequirementsLoading
                    ? "Loading..."
                    : `${pendingItems.requirements.length} documents ready for review`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  {pendingItems.requirements.length > 0 ? "Ready" : "None"}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Section Performance
            </CardTitle>
            <CardDescription>
              Overview of your assigned sections
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sectionsAgg.map((section) => (
              <div key={section.id} className="border rounded-lg p-4 bg-white">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900">{section.name}</h4>
                  <Badge
                    variant="outline"
                    className="bg-primary-50 text-primary-700"
                  >
                    {section.totalStudents} students
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {section.avgAttendance}%
                    </div>
                    <span className="text-gray-600">Attendance</span>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {section.completionRate}%
                    </div>
                    <span className="text-gray-600">Requirements</span>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(section.completionRate * 0.9)}%
                    </div>
                    <span className="text-gray-600">Reports</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
