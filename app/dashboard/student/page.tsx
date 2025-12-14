"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  Calendar,
  Camera,
  Upload,
  User,
  Building2,
} from "lucide-react";
import { useMemo } from "react";
import { useAuth } from "@/hooks/auth/useAuth";
import { useStudent } from "@/hooks/student/useStudent";
import {
  useAttendanceStats,
  useStudentAttendance,
} from "@/hooks/student/useStudentAttendance";
import { useStudentRequirements } from "@/hooks/student/useStudentRequirements";
import { useStudentReports } from "@/hooks/student/useStudentReports";
import { useAnnouncements } from "@/hooks/announcement/useAnnouncement";

export default function StudentDashboard() {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useAuth();
  const studentId = (user as any)?.id as string | undefined;

  const userNeedsOnboarding = useMemo(() => {
    const normalizedUser: any = (user as any)?.data ?? user;
    if (!normalizedUser) return false;
    return (
      !normalizedUser.age ||
      !normalizedUser.phone ||
      !normalizedUser.gender ||
      (normalizedUser.role === "student" && !normalizedUser.studentId)
    );
  }, [user]);

  // Check if user needs onboarding based on user data
  useEffect(() => {
    if (isUserLoading) return;
    if (userNeedsOnboarding) {
      router.replace("/onboarding/student");
    }
  }, [userNeedsOnboarding, router, isUserLoading]);

  const { data: studentData } = useStudent(studentId as string);

  // Attendance overall stats
  const { data: attendanceStats } = useAttendanceStats(studentId as string);

  // Attendance this week (count present/late/excused as attended)
  const startOfWeek = useMemo(() => {
    const now = new Date();
    const day = now.getDay() || 7; // Monday=1..Sunday=7
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day - 1));
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString().split("T")[0];
  }, []);
  const endOfWeek = useMemo(() => {
    const now = new Date();
    const day = now.getDay() || 7;
    const sunday = new Date(now);
    sunday.setDate(now.getDate() + (7 - day));
    sunday.setHours(23, 59, 59, 999);
    return sunday.toISOString().split("T")[0];
  }, []);
  const { data: thisWeekAttendance } = useStudentAttendance(
    studentId as string,
    {
      page: 1,
      limit: 200,
      startDate: startOfWeek,
      endDate: endOfWeek,
    }
  );
  const thisWeekCounts = useMemo(() => {
    const records: any[] =
      (thisWeekAttendance as any)?.records ??
      (thisWeekAttendance as any)?.items ??
      (thisWeekAttendance as any)?.data?.records ??
      [];
    const attended = records.filter((r) =>
      ["present", "late", "excused"].includes(
        String(r?.status || "").toLowerCase()
      )
    ).length;
    return { attended, total: records.length };
  }, [thisWeekAttendance]);

  // Requirements list to compute submitted/pending
  const { data: requirementsData } = useStudentRequirements(
    studentId as string,
    { page: 1, limit: 200 }
  );
  const requirementCounts = useMemo(() => {
    const list: any[] =
      (requirementsData as any)?.requirements ??
      (requirementsData as any)?.items ??
      (requirementsData as any)?.data?.requirements ??
      [];
    const submitted = list.filter(
      (r) => String(r?.status || "").toLowerCase() === "submitted"
    ).length;
    const approved = list.filter(
      (r) => String(r?.status || "").toLowerCase() === "approved"
    ).length;
    const pending = list.filter((r) =>
      ["pending", "rejected", "expired"].includes(
        String(r?.status || "").toLowerCase()
      )
    ).length;
    return { total: list.length, submitted: submitted + approved, pending };
  }, [requirementsData]);

  // Reports for upcoming deadlines (use endDate for weekly reports)
  const { data: reportsData } = useStudentReports(studentId as string, {
    page: 1,
    limit: 50,
  });
  const upcomingDeadlines = useMemo(() => {
    const list: any[] =
      (reportsData as any)?.reports ??
      (reportsData as any)?.items ??
      (reportsData as any)?.data?.reports ??
      [];
    const now = new Date();
    return list
      .map((r) => ({
        title:
          r?.title ||
          (r?.weekNumber ? `Weekly Report #${r.weekNumber}` : "Report"),
        date: r?.endDate || r?.dueDate || r?.startDate,
        status: r?.status,
      }))
      .filter((i) => i.date)
      .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
      .filter((i) => new Date(i.date!).getTime() >= now.getTime())
      .slice(0, 2);
  }, [reportsData]);

  // Announcements (latest published for this user)
  const { data: announcementsData } = useAnnouncements({
    userId: studentId,
    page: 1,
    limit: 2,
  });
  const announcements = useMemo(() => {
    return (
      (announcementsData as any)?.announcements ??
      (announcementsData as any)?.data?.announcements ??
      []
    );
  }, [announcementsData]);

  // Hours progress calculated from actual attendance records
  const { data: allAttendanceData } = useStudentAttendance(
    studentId as string,
    {
      page: 1,
      limit: 1000, // Get all records to calculate total hours
    }
  );
  const hoursProgress = useMemo(() => {
    // Get total hours from practicum
    const student: any = (studentData as any)?.data ?? (studentData as any);
    const practicum = student?.practicums?.[0];
    const total = Number(practicum?.totalHours ?? 0);
    // Work setup is always "On-site" for all practicums
    const workSetup = practicum?.workSetup || "On-site";

    // Calculate completed hours from attendance records
    const records: any[] =
      (allAttendanceData as any)?.data?.attendance ??
      (allAttendanceData as any)?.attendance ??
      (allAttendanceData as any)?.records ??
      [];

    // Sum up hours from approved attendance records (present, late, excused)
    const completed = records
      .filter(
        (r) =>
          ["present", "late", "excused"].includes(
            String(r?.status || "").toLowerCase()
          ) &&
          String(r?.approvalStatus || "").toLowerCase() === "approved" &&
          r?.hours != null
      )
      .reduce((sum, r) => sum + Number(r.hours || 0), 0);

    const percent =
      total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
    return {
      completed: Math.round(completed * 100) / 100,
      total,
      percent,
      workSetup,
    };
  }, [studentData, allAttendanceData]);

  return (
    <div className="px-4 md:px-8 lg:px-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Student Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back! Track your practicum progress and submissions.
        </p>
      </div>

      {/* Announcements & Deadlines - Highly Emphasized */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="border-2 border-primary-400 shadow-lg bg-gradient-to-br from-primary-50 to-white">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-primary-700" />
                </div>
                Recent Announcements
              </CardTitle>
              <Link href="/dashboard/student/announcements">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary-700 hover:text-primary-800 hover:bg-primary-100 font-medium"
                >
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {announcements.length === 0 && (
              <div className="text-sm text-gray-500 py-4">
                No announcements.
              </div>
            )}
            {announcements.map((a: any) => (
              <div
                key={a.id}
                className="border-l-4 border-primary-600 pl-4 py-3 bg-white rounded-r-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <h4 className="font-semibold text-gray-900 text-base mb-1">
                  {a.title}
                </h4>
                <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                  {a.content}
                </p>
                <p className="text-xs text-gray-500 font-medium">
                  {new Date(a.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-2 border-primary-400 shadow-lg bg-gradient-to-br from-primary-50 to-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Calendar className="w-6 h-6 text-primary-700" />
              </div>
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingDeadlines.length === 0 && (
              <div className="text-sm text-gray-500 py-4">
                No upcoming deadlines.
              </div>
            )}
            {upcomingDeadlines.map((d, idx) => {
              const daysLeft = Math.ceil(
                (new Date(d.date!).getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24)
              );
              const urgent = daysLeft <= 3;
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-4 rounded-lg shadow-sm transition-all ${
                    urgent
                      ? "bg-red-50 border-2 border-red-200"
                      : "bg-white border border-primary-200"
                  }`}
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-base mb-1">
                      {d.title}
                    </h4>
                    <p
                      className={`text-sm font-medium ${
                        urgent ? "text-red-700" : "text-gray-700"
                      }`}
                    >
                      Due{" "}
                      {isNaN(daysLeft)
                        ? "soon"
                        : `in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`}
                    </p>
                  </div>
                  <Badge
                    variant={urgent ? "destructive" : "secondary"}
                    className={`font-semibold ${
                      urgent
                        ? "bg-red-600 text-white"
                        : "bg-primary-100 text-primary-700"
                    }`}
                  >
                    {urgent ? "Urgent" : "Pending"}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white border border-primary-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-600" />
              Hours Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Completed</span>
                <span className="font-medium">
                  {hoursProgress.completed} / {hoursProgress.total} hours
                </span>
              </div>
              <Progress value={hoursProgress.percent} className="h-2" />
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-600">
                  {Math.max(0, hoursProgress.total - hoursProgress.completed)}{" "}
                  hours remaining
                </p>
                {hoursProgress.workSetup && (
                  <Badge
                    variant="outline"
                    className="text-xs flex items-center gap-1 bg-primary-50 text-primary-700 border-primary-200"
                  >
                    <Building2 className="w-3 h-3" />
                    {hoursProgress.workSetup}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-primary-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-600" />
              Pre-internship Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Submitted</span>
                <Badge
                  variant="secondary"
                  className="bg-primary-50 text-primary-700"
                >
                  {requirementCounts.submitted}/{requirementCounts.total}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Pending</span>
                <Badge
                  variant="secondary"
                  className="bg-primary-50 text-primary-700"
                >
                  {requirementCounts.pending}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-primary-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary-600" />
              Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">This Week</span>
                <Badge
                  variant="secondary"
                  className="bg-primary-50 text-primary-700"
                >
                  {thisWeekCounts.attended}/{thisWeekCounts.total} days
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Overall</span>
                <span className="text-sm font-medium">
                  {Math.round(
                    Number(
                      (attendanceStats as any)?.attendancePercentage ??
                        (attendanceStats as any)?.data?.attendancePercentage ??
                        0
                    )
                  )}
                  %
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link href="/dashboard/student/attendance">
          <Button
            variant="outline"
            className="h-20 flex-col gap-2 border border-gray-300 text-gray-700 transition-all duration-300 hover:border-primary-400 hover:bg-primary-50/50 w-full"
          >
            <Camera className="w-6 h-6" />
            <span>Log Attendance</span>
          </Button>
        </Link>
        <Link href="/dashboard/student/reports">
          <Button
            variant="outline"
            className="h-20 flex-col gap-2 border border-gray-300 text-gray-700 transition-all duration-300 hover:border-primary-400 hover:bg-primary-50/50 w-full"
          >
            <Upload className="w-6 h-6" />
            <span>Submit Report</span>
          </Button>
        </Link>
        <Link href="/dashboard/student/requirements">
          <Button
            variant="outline"
            className="h-20 flex-col gap-2 border border-gray-300 text-gray-700 transition-all duration-300 hover:border-primary-400 hover:bg-primary-50/50 w-full"
          >
            <FileText className="w-6 h-6" />
            <span>Pre-internship Requirements</span>
          </Button>
        </Link>
        <Link href="/dashboard/student/profile">
          <Button
            variant="outline"
            className="h-20 flex-col gap-2 border border-gray-300 text-gray-700 transition-all duration-300 hover:border-primary-400 hover:bg-primary-50/50 w-full"
          >
            <User className="w-6 h-6" />
            <span>Profile</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
