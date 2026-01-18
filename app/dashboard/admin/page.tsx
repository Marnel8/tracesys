"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth/useAuth";
import { useDepartments } from "@/hooks/department";
import { useCourses } from "@/hooks/course";
import { useSections } from "@/hooks/section";
import {
  Building2,
  BookOpen,
  Layers,
  Users,
  Shield,
  Settings,
} from "lucide-react";
import { InstructorStatsCard } from "@/components/instructor-stats-card";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useAuth();

  const { data: departmentsData, isLoading: isDepartmentsLoading } =
    useDepartments();
  const { data: coursesData, isLoading: isCoursesLoading } = useCourses();
  const { data: sectionsData, isLoading: isSectionsLoading } = useSections();

  const totalDepartments = departmentsData?.departments?.length || 0;
  const totalCourses = coursesData?.courses?.length || 0;
  const totalSections = sectionsData?.sections?.length || 0;

  return (
    <div>
      <div className="mx-auto flex w-full flex-col gap-6 border border-primary-200 bg-white px-6 py-8 text-gray-900">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-700">
            Admin Overview
          </p>
          <h1 className="text-3xl font-semibold text-gray-900">
            Welcome back{user?.firstName ? `, ${user.firstName}!` : "!"}
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Manage departments, courses, sections, and users across the entire
            system.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            variant="outline"
            className="h-11 border border-primary-500 bg-primary-50 px-6 text-primary-700 transition-all duration-300 hover:border-primary-400 hover:bg-primary-50/50 w-full sm:w-auto"
            onClick={() => router.push("/dashboard/admin/users")}
          >
            <Users className="mr-2 h-4 w-4" />
            Manage Users
          </Button>
        </div>
      </div>

      <div className="mx-auto mt-8 flex w-full flex-col gap-8">
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <InstructorStatsCard
            icon={Building2}
            label="Total Departments"
            value={totalDepartments}
            helperText="Across all programs"
            isLoading={isUserLoading || isDepartmentsLoading}
          />
          <InstructorStatsCard
            icon={BookOpen}
            label="Total Courses"
            value={totalCourses}
            helperText="Available programs"
            isLoading={isUserLoading || isCoursesLoading}
          />
          <InstructorStatsCard
            icon={Layers}
            label="Total Sections"
            value={totalSections}
            helperText="Across all courses"
            isLoading={isUserLoading || isSectionsLoading}
          />
          <InstructorStatsCard
            icon={Users}
            label="User Management"
            value="—"
            helperText="Manage all users"
            isLoading={false}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border border-primary-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary-600" />
                Departments
              </CardTitle>
              <CardDescription>
                Manage academic departments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full border border-gray-300 text-gray-700 transition-all duration-300 hover:border-primary-400 hover:bg-primary-50/50"
                onClick={() => router.push("/dashboard/admin/departments")}
              >
                Manage Departments
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-primary-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary-600" />
                Courses
              </CardTitle>
              <CardDescription>
                Manage academic courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full border border-gray-300 text-gray-700 transition-all duration-300 hover:border-primary-400 hover:bg-primary-50/50"
                onClick={() => router.push("/dashboard/admin/courses")}
              >
                Manage Courses
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-primary-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary-600" />
                Sections
              </CardTitle>
              <CardDescription>
                Manage course sections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full border border-gray-300 text-gray-700 transition-all duration-300 hover:border-primary-400 hover:bg-primary-50/50"
                onClick={() => router.push("/dashboard/admin/sections")}
              >
                Manage Sections
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

