"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Plus,
  GraduationCap,
  Edit,
  Eye,
  MoreHorizontal,
  Loader2,
  BookOpen,
  Users,
  AlertCircle,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  useSections,
  useCreateSection,
  useUpdateSection,
  useDeleteSection,
  useToggleSectionStatus,
} from "@/hooks/section";
import { useCourses } from "@/hooks/course";
import {
  YEAR_OPTIONS,
  SEMESTER_OPTIONS,
  ACADEMIC_YEAR_OPTIONS,
} from "@/data/departments";
import { SectionFormData } from "@/data/departments";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { InstructorStatsCard } from "@/components/instructor-stats-card";
import { useAuth } from "@/hooks/auth/useAuth";

export default function SectionsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<any>(null);
  const [editingSection, setEditingSection] = useState<any>(null);
  const [newSection, setNewSection] = useState<SectionFormData>({
    name: "",
    code: "",
    courseId: "",
    year: "",
    semester: "",
    academicYear: "",
    maxStudents: 50,
    isActive: true,
  });
  const [editSection, setEditSection] = useState<SectionFormData>({
    name: "",
    code: "",
    courseId: "",
    year: "",
    semester: "",
    academicYear: "",
    maxStudents: 50,
    isActive: true,
  });

  // Get instructor's departmentId
  const instructorDepartmentId = (user as any)?.departmentId;

  // Fetch sections and courses data
  const {
    data: sectionsData,
    isLoading: sectionsLoading,
    error: sectionsError,
  } = useSections({ status: "active" });
  const { data: coursesData, isLoading: coursesLoading } = useCourses();
  const createSectionMutation = useCreateSection();
  const updateSectionMutation = useUpdateSection();
  const deleteSectionMutation = useDeleteSection();
  const toggleStatusMutation = useToggleSectionStatus();

  // Filter courses to only show the instructor's department courses
  const filteredCourses = instructorDepartmentId
    ? coursesData?.courses.filter(
        (course) => course.departmentId === instructorDepartmentId
      ) || []
    : coursesData?.courses || [];

  // Filter sections to only show those from courses in the instructor's department
  const filteredSections = instructorDepartmentId
    ? (sectionsData?.sections || []).filter(
        (section) => section.course?.departmentId === instructorDepartmentId
      )
    : sectionsData?.sections || [];

  const sections = filteredSections;
  const courses = filteredCourses;

  const handleCreateSection = async () => {
    if (
      !newSection.name.trim() ||
      !newSection.courseId ||
      !newSection.year ||
      !newSection.semester
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createSectionMutation.mutateAsync({
        name: newSection.name.trim(),
        code: newSection.code.trim(),
        courseId: newSection.courseId,
        year: newSection.year,
        semester: newSection.semester,
        academicYear: newSection.academicYear,
        maxStudents: newSection.maxStudents || 50,
        isActive: true,
      });
      setIsCreateDialogOpen(false);
      setNewSection({
        name: "",
        code: "",
        courseId: "",
        year: "",
        semester: "",
        academicYear: "",
        maxStudents: 50,
        isActive: true,
      });
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const getCourseOptions = () => {
    return courses.map((course) => ({
      value: course.id,
      label: course.name,
    }));
  };

  const handleViewSection = (sectionId: string) => {
    router.push(`/dashboard/instructor/sections/${sectionId}`);
  };

  const handleEditSection = (section: any) => {
    setEditingSection(section);
    setEditSection({
      name: section.name,
      code: section.code,
      courseId: section.courseId,
      year: section.year,
      semester: section.semester,
      academicYear: section.academicYear,
      maxStudents: section.maxStudents,
      isActive: section.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateSection = async () => {
    if (
      !editSection.name.trim() ||
      !editSection.courseId ||
      !editSection.year ||
      !editSection.semester
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await updateSectionMutation.mutateAsync({
        id: editingSection.id,
        data: {
          name: editSection.name.trim(),
          code: editSection.code.trim(),
          courseId: editSection.courseId,
          year: editSection.year,
          semester: editSection.semester,
          academicYear: editSection.academicYear,
          maxStudents: editSection.maxStudents || 50,
          isActive: editSection.isActive,
        },
      });
      setIsEditDialogOpen(false);
      setEditingSection(null);
      setEditSection({
        name: "",
        code: "",
        courseId: "",
        year: "",
        semester: "",
        academicYear: "",
        maxStudents: 50,
        isActive: true,
      });
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const handleDelete = (section: any) => {
    setSectionToDelete(section);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (sectionToDelete) {
      deleteSectionMutation.mutate(sectionToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setSectionToDelete(null);
        },
      });
    }
  };

  const handleToggleStatus = (section: any) => {
    toggleStatusMutation.mutate({
      id: section.id,
      isActive: !section.isActive,
    });
  };

  // Error state component
  const ErrorState = () => (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Unable to load sections
      </h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        There was an error loading your sections. Please check your connection
        and try again.
      </p>
      <Button onClick={() => window.location.reload()} variant="outline">
        Try Again
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Section Management
          </h1>
          <p className="text-gray-600">
            Manage your assigned sections and track their progress
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="h-11 border border-primary-500 bg-primary-50 px-6 text-primary-700 transition-all duration-300 hover:border-primary-400 hover:bg-primary-50/50 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Section
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Section</DialogTitle>
              <DialogDescription>
                Add a new section to your assigned classes.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Year/Section</Label>
                  <Input
                    id="name"
                    value={newSection.name}
                    onChange={(e) =>
                      setNewSection({ ...newSection, name: e.target.value })
                    }
                    placeholder="e.g., BSIT 4A"
                  />
                </div>
                {/* <div className="space-y-2">
                  <Label htmlFor="code">Section Code</Label>
                  <Input
                    id="code"
                    value={newSection.code}
                    onChange={(e) =>
                      setNewSection({ ...newSection, code: e.target.value })
                    }
                    placeholder="e.g., BSIT-4A"
                  />
                </div> */}
                <div className="space-y-2">
                  <Label htmlFor="maxStudents">Max Students</Label>
                  <Input
                    id="maxStudents"
                    type="number"
                    value={newSection.maxStudents}
                    onChange={(e) =>
                      setNewSection({
                        ...newSection,
                        maxStudents: parseInt(e.target.value) || 50,
                      })
                    }
                    placeholder="50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="course">Course</Label>
                  <Select
                    onValueChange={(value) =>
                      setNewSection({ ...newSection, courseId: value })
                    }
                    disabled={coursesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          coursesLoading
                            ? "Loading courses..."
                            : "Select course"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {coursesLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          <span className="text-sm text-gray-500">
                            Loading courses...
                          </span>
                        </div>
                      ) : getCourseOptions().length === 0 ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="text-center">
                            <BookOpen className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                            <span className="text-sm text-gray-500">
                              No courses available
                            </span>
                          </div>
                        </div>
                      ) : (
                        getCourseOptions().map((course) => (
                          <SelectItem key={course.value} value={course.value}>
                            {course.label}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {!coursesLoading && getCourseOptions().length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      No courses available. Please create a course first before
                      adding sections.
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="academicYear">Academic Year</Label>
                  <Select
                    onValueChange={(value) =>
                      setNewSection({ ...newSection, academicYear: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select academic year" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACADEMIC_YEAR_OPTIONS.map((year) => (
                        <SelectItem key={year.value} value={year.value}>
                          {year.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year Level</Label>
                  <Select
                    onValueChange={(value) =>
                      setNewSection({ ...newSection, year: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {YEAR_OPTIONS.map((year) => (
                        <SelectItem key={year.value} value={year.value}>
                          {year.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  <Select
                    onValueChange={(value) =>
                      setNewSection({ ...newSection, semester: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEMESTER_OPTIONS.map((semester) => (
                        <SelectItem key={semester.value} value={semester.value}>
                          {semester.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateSection}
                className="bg-primary-500 hover:bg-primary-600"
                disabled={
                  createSectionMutation.isPending ||
                  coursesLoading ||
                  getCourseOptions().length === 0
                }
              >
                {createSectionMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {coursesLoading
                  ? "Loading..."
                  : getCourseOptions().length === 0
                  ? "No Courses Available"
                  : "Create Section"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Section Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
            <DialogDescription>Update section information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Year/Section</Label>
                <Input
                  id="edit-name"
                  value={editSection.name}
                  onChange={(e) =>
                    setEditSection({ ...editSection, name: e.target.value })
                  }
                  placeholder="e.g., BSIT 4A"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-maxStudents">Max Students</Label>
                <Input
                  id="edit-maxStudents"
                  type="number"
                  value={editSection.maxStudents}
                  onChange={(e) =>
                    setEditSection({
                      ...editSection,
                      maxStudents: parseInt(e.target.value) || 50,
                    })
                  }
                  placeholder="50"
                />
              </div>
              {/* <div className="space-y-2">
                <Label htmlFor="edit-code">Section Code</Label>
                <Input
                  id="edit-code"
                  value={editSection.code}
                  onChange={(e) =>
                    setEditSection({ ...editSection, code: e.target.value })
                  }
                  placeholder="e.g., BSIT-4A"
                />
              </div> */}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-course">Course</Label>
                <Select
                  onValueChange={(value) =>
                    setEditSection({ ...editSection, courseId: value })
                  }
                  value={editSection.courseId}
                  disabled={coursesLoading}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        coursesLoading ? "Loading courses..." : "Select course"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {coursesLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        <span className="text-sm text-gray-500">
                          Loading courses...
                        </span>
                      </div>
                    ) : getCourseOptions().length === 0 ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="text-center">
                          <BookOpen className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                          <span className="text-sm text-gray-500">
                            No courses available
                          </span>
                        </div>
                      </div>
                    ) : (
                      getCourseOptions().map((course) => (
                        <SelectItem key={course.value} value={course.value}>
                          {course.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-academicYear">Academic Year</Label>
                <Select
                  onValueChange={(value) =>
                    setEditSection({ ...editSection, academicYear: value })
                  }
                  value={editSection.academicYear}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACADEMIC_YEAR_OPTIONS.map((year) => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-year">Year Level</Label>
                <Select
                  onValueChange={(value) =>
                    setEditSection({ ...editSection, year: value })
                  }
                  value={editSection.year}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {YEAR_OPTIONS.map((year) => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-semester">Semester</Label>
                <Select
                  onValueChange={(value) =>
                    setEditSection({ ...editSection, semester: value })
                  }
                  value={editSection.semester}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEMESTER_OPTIONS.map((semester) => (
                      <SelectItem key={semester.value} value={semester.value}>
                        {semester.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateSection}
              className="bg-primary-500 hover:bg-primary-600"
              disabled={
                updateSectionMutation.isPending ||
                coursesLoading ||
                getCourseOptions().length === 0
              }
            >
              {updateSectionMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {updateSectionMutation.isPending
                ? "Updating..."
                : "Update Section"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Section</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{sectionToDelete?.name}"? This
              action cannot be undone.
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
              disabled={deleteSectionMutation.isPending}
            >
              {deleteSectionMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <InstructorStatsCard
          icon={GraduationCap}
          label="Total Sections"
          value={sectionsError ? "—" : sections.length}
          helperText="Across all courses"
          isLoading={sectionsLoading}
          trend={
            !sectionsError && sections.length > 0
              ? { label: `${sections.length} active`, variant: "positive" }
              : undefined
          }
        />
      </div>

      {/* Sections Grid */}
      {sectionsLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading sections...</p>
          </div>
        </div>
      ) : sectionsError ? (
        <ErrorState />
      ) : sections.length === 0 ? null : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sections.map((section) => (
            <Card
              key={section.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{section.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {section.course?.name || "No course assigned"}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleViewSection(section.id)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleEditSection(section)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Section
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleToggleStatus(section)}
                      >
                        {section.isActive ? (
                          <>
                            <ToggleLeft className="mr-2 h-4 w-4" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <ToggleRight className="mr-2 h-4 w-4" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(section)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">{section.year}</Badge>
                  <Badge variant="outline">{section.semester}</Badge>
                  <Badge variant="outline">{section.academicYear}</Badge>
                  <Badge variant={section.isActive ? "default" : "secondary"}>
                    {section.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Detailed Table View */}
      <Card>
        <CardHeader>
          <CardTitle>Section Details</CardTitle>
          <CardDescription>Overview of all sections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Year/Section</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Year Level</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sectionsLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-6 h-6 animate-spin mb-2" />
                        <p className="text-gray-500">Loading sections...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : sectionsError ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center">
                        <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                        <p className="text-red-600 mb-2">
                          Error loading sections
                        </p>
                        <Button
                          onClick={() => window.location.reload()}
                          variant="outline"
                          size="sm"
                        >
                          Try Again
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : sections.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center">
                        <BookOpen className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-gray-500 mb-2">
                          {instructorDepartmentId
                            ? "No sections found in your department"
                            : "No sections found"}
                        </p>
                        <Button
                          onClick={() => setIsCreateDialogOpen(true)}
                          size="sm"
                          className="bg-primary-500 hover:bg-primary-600"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create First Section
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  sections.map((section) => (
                    <TableRow key={section.id}>
                      <TableCell>
                        <div className="font-medium">{section.name}</div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {section.course?.name || "No course assigned"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{section.year}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{section.semester}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{section.academicYear}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={section.isActive ? "default" : "secondary"}
                        >
                          {section.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewSection(section.id)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditSection(section)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Section
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(section)}
                            >
                              {section.isActive ? (
                                <>
                                  <ToggleLeft className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <ToggleRight className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(section)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
