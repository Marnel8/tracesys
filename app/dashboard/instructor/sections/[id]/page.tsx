"use client";

import type React from "react";
import { useState, use, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Edit,
  Trash2,
  MoreHorizontal,
  ToggleLeft,
  ToggleRight,
  Plus,
  Users,
  Calendar,
  BookOpen,
  Building2,
  GraduationCap,
  Loader2,
} from "lucide-react";
import {
  useSection,
  useDeleteSection,
  useToggleSectionStatus,
} from "@/hooks/section";
import { useStudentsByTeacher } from "@/hooks/student";
import { useAuth } from "@/hooks/auth/useAuth";
import { toast } from "sonner";

interface SectionDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function SectionDetailsPage({
  params,
}: SectionDetailsPageProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { user } = useAuth();

  // Unwrap params using React.use()
  const { id } = use(params);

  // Fetch section data
  const { data: section, isLoading: sectionLoading } = useSection(id);

  // Get teacher ID from user
  const teacherId =
    (user as any)?.user?.id ?? (user as any)?.data?.id ?? (user as any)?.id;

  // Fetch students by teacher (includes enrollments)
  const { data: studentsData } = useStudentsByTeacher(teacherId || "", {
    page: 1,
    limit: 1000,
    search: "",
  });

  const deleteSection = useDeleteSection();
  const toggleStatus = useToggleSectionStatus();

  // Filter students enrolled in this specific section
  const sectionStudents = useMemo(() => {
    if (!studentsData?.data?.students || !section) return [];
    return studentsData.data.students.filter((student: any) => {
      // Check if student has an enrollment for this section
      return student.enrollments?.some(
        (enrollment: any) => enrollment.section?.id === section.id
      );
    });
  }, [studentsData?.data?.students, section]);

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (section) {
      deleteSection.mutate(section.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          router.push("/dashboard/instructor/sections");
        },
      });
    }
  };

  const handleToggleStatus = () => {
    if (section) {
      toggleStatus.mutate({
        id: section.id,
        isActive: !section.isActive,
      });
    }
  };

  if (sectionLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!section) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Section not found</p>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/instructor/sections")}
          className="mt-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sections
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{section.name}</h1>
            <p className="text-gray-600">
              {section.code} • {section.course?.name}
            </p>
          </div>
        </div>
        {/* <DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline">
							<MoreHorizontal className="w-4 h-4 mr-2" />
							Actions
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem
							onClick={() => router.push(`/dashboard/instructor/sections/${section.id}/edit`)}
						>
							<Edit className="w-4 h-4 mr-2" />
							Edit Section
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={handleToggleStatus}
						>
							{section.isActive ? (
								<>
									<ToggleLeft className="w-4 h-4 mr-2" />
									Deactivate
								</>
							) : (
								<>
									<ToggleRight className="w-4 h-4 mr-2" />
									Activate
								</>
							)}
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={handleDelete}
							className="text-red-600"
						>
							<Trash2 className="w-4 h-4 mr-2" />
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Section Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Section Name
                  </label>
                  <p className="text-sm">{section.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Section Code
                  </label>
                  <div className="text-sm">
                    <Badge variant="outline">{section.code}</Badge>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Course
                </label>
                <p className="text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  {section.course?.name} ({section.course?.code})
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Year Level
                  </label>
                  <p className="text-sm">{section.year}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Semester
                  </label>
                  <p className="text-sm">{section.semester}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Academic Year
                  </label>
                  <p className="text-sm">{section.academicYear}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Max Students
                  </label>
                  <p className="text-sm">{section.maxStudents}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <div className="text-sm">
                    <Badge variant={section.isActive ? "default" : "secondary"}>
                      {section.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Created
                </label>
                <p className="text-sm">
                  {new Date(section.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Students */}
          {/* <Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle>Enrolled Students</CardTitle>
									<CardDescription>
										Manage student enrollment and attendance
									</CardDescription>
								</div>
								<Button
									size="sm"
									onClick={() => router.push(`/dashboard/instructor/students/add?sectionId=${section.id}`)}
								>
									<Plus className="w-4 h-4 mr-2" />
									Add Student
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							{!studentsData?.students || studentsData?.students.length === 0 ? (
								<div className="text-center py-8">
									<Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
									<p className="text-gray-500 mb-4">No students enrolled yet</p>
									<Button
										variant="outline"
										onClick={() => router.push(`/dashboard/instructor/students/add?sectionId=${section.id}`)}
									>
										<Plus className="w-4 h-4 mr-2" />
										Enroll First Student
									</Button>
								</div>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Student Name</TableHead>
											<TableHead>Student ID</TableHead>
											<TableHead>Email</TableHead>
											<TableHead>Status</TableHead>
											<TableHead className="w-[50px]"></TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{studentsData?.students?.map((student) => (
											<TableRow key={student.id}>
												<TableCell>
													<div>
														<p className="font-medium">{student.firstName} {student.lastName}</p>
													</div>
												</TableCell>
												<TableCell>
													<Badge variant="outline">{student.studentId}</Badge>
												</TableCell>
												<TableCell>{student.email}</TableCell>
												<TableCell>
													<Badge
														variant={student.isActive ? "default" : "secondary"}
													>
														{student.isActive ? "Active" : "Inactive"}
													</Badge>
												</TableCell>
												<TableCell>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => router.push(`/dashboard/instructor/students/${student.id}`)}
													>
														<MoreHorizontal className="w-4 h-4" />
													</Button>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							)}
						</CardContent>
					</Card> */}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Total Students</p>
                  <p className="text-2xl font-bold">{sectionStudents.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Active Students</p>
                  <p className="text-2xl font-bold">
                    {sectionStudents.filter((s: any) => s.isActive).length}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Capacity</p>
                  <p className="text-2xl font-bold">
                    {sectionStudents.length} / {section.maxStudents}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Section</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{section.name}"? This action
              cannot be undone.
              {sectionStudents && sectionStudents.length > 0 && (
                <span className="block mt-2 text-red-600 font-medium">
                  This section has {sectionStudents.length} enrolled students
                  and cannot be deleted.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={
                deleteSection.isPending ||
                (sectionStudents && sectionStudents.length > 0)
              }
            >
              {deleteSection.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
