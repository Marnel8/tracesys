"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Search,
  MoreHorizontal,
  UserPlus,
  Users,
  Download,
  Eye,
  Edit,
  Trash2,
  User,
  Calendar,
  Building,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  FileCheck,
  Star,
  Loader2,
  Inbox,
  MailPlus,
} from "lucide-react";
import { InstructorStatsCard } from "@/components/instructor-stats-card";
import { useAuth } from "@/hooks/auth/useAuth";
import {
  useStudentsByTeacher,
  useStudent,
  useUpdateStudent,
  useDeleteStudent,
  type UpdateStudentParams,
} from "@/hooks/student/useStudent";
import { useAgencies } from "@/hooks/agency";
import { useAttendance } from "@/hooks/attendance";
import { useRequirements } from "@/hooks/requirement/useRequirement";
import { useRequirementTemplates } from "@/hooks/requirement-template/useRequirementTemplate";
import { useReports } from "@/hooks/report/useReport";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { cn } from "@/lib/utils";

const STUDENT_STATUS_BADGE: Record<string, string> = {
  Active: "invitation-status-pill--success",
  Inactive: "invitation-status-pill--neutral",
};

const getRequirementStatusClass = (value: number) => {
  if (value >= 100) return "invitation-status-pill--success";
  if (value >= 50) return "invitation-status-pill--warning";
  return "invitation-status-pill--danger";
};

const ATTENDANCE_BADGE: Record<string, string> = {
  Good: "invitation-status-pill--success",
  "Too Many Lates": "invitation-status-pill--warning",
  "Too Many Absences": "invitation-status-pill--danger",
};

const REPORT_STATUS_BADGE: Record<string, string> = {
  approved: "invitation-status-pill--success",
  submitted: "invitation-status-pill--warning",
  rejected: "invitation-status-pill--danger",
};

const getAttendanceRecordClass = (status?: string) => {
  if (status === "present") return "invitation-status-pill--success";
  if (status === "late") return "invitation-status-pill--warning";
  if (status === "absent") return "invitation-status-pill--danger";
  return "invitation-status-pill--neutral";
};

export default function StudentsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSection, setSelectedSection] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("current");
  const [selectedSemester, setSelectedSemester] = useState("current");
  const [showAllStudents, setShowAllStudents] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  // Dialog states
  const [viewProfileOpen, setViewProfileOpen] = useState(false);
  const [editStudentOpen, setEditStudentOpen] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<
    "yes" | "no" | null
  >(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null
  );

  // Dropdown states for edit form (practicum only)
  const [selectedAgencyId, setSelectedAgencyId] = useState<string>("");

  const { user } = useAuth();
  const teacherId =
    (user as any)?.user?.id ?? (user as any)?.data?.id ?? (user as any)?.id;

  const { data, isLoading, error, refetch } = useStudentsByTeacher(teacherId, {
    page: 1,
    limit: 50,
    search: searchTerm,
  });

  // Ensure hydration happens consistently
  useEffect(() => {
    setHasMounted(true);
    // Force refresh data on mount to ensure we have the latest data
    if (teacherId) {
      refetch();
    }
  }, [teacherId]); // refetch is stable, no need to include in deps

  // Fetch data for dropdowns (practicum only)
  const { data: agenciesData } = useAgencies({ status: "active" });

  // Get selected agency and its supervisors
  const selectedAgency = agenciesData?.agencies.find(
    (agency) => agency.id === selectedAgencyId
  );
  const availableSupervisors = selectedAgency?.supervisors || [];

  // Student operations hooks
  const { data: selectedStudentData, isLoading: isLoadingStudent } = useStudent(
    selectedStudentId || ""
  );
  const updateStudentMutation = useUpdateStudent();
  const deleteStudentMutation = useDeleteStudent();

  // Fetch attendance records for the selected student
  const { data: attendanceData, isLoading: isLoadingAttendance } =
    useAttendance({
      studentId: selectedStudentId || undefined,
      limit: 10,
    });

  // Fetch requirements data for the selected student
  const { data: requirementsData, isLoading: isLoadingRequirements } =
    useRequirements({
      studentId: selectedStudentId || undefined,
      limit: 100,
    });

  // Fetch requirement templates
  const { data: templatesData } = useRequirementTemplates({
    page: 1,
    limit: 100,
    status: "active",
  });

  // Fetch reports data for the selected student
  const { data: reportsData, isLoading: isLoadingReports } = useReports({
    page: 1,
    limit: 50,
    studentId: selectedStudentId || undefined,
    type: "weekly",
  });

  // Form setup for editing
  const form = useForm<UpdateStudentParams>({
    defaultValues: {
      id: "",
      firstName: "",
      lastName: "",
      middleName: "",
      email: "",
      phone: "",
      age: 0,
      gender: "",
      studentId: "",
      address: "",
      bio: "",
      departmentId: "",
      courseId: "",
      sectionId: "",
      agencyId: "",
      supervisorId: "",
      position: "",
      startDate: "",
      endDate: "",
      totalHours: 400,
      workSetup: "On-site",
      year: "",
      semester: "",
      yearLevel: "",
    } as UpdateStudentParams,
  });

  // Update form when student data is loaded - only practicum fields
  useEffect(() => {
    if (selectedStudentData?.data && editStudentOpen) {
      const student = selectedStudentData.data;
      const practicum = student.practicums?.[0];

      // Extract practicum-related fields only
      const agencyId = practicum?.agencyId || "";
      const supervisorId = practicum?.supervisorId || "";
      const workSetup = "On-site" as const;

      // Set dropdown states
      setSelectedAgencyId(agencyId);

      // Reset form with only practicum-related values
      const formData = {
        id: student.id,
        agencyId: agencyId,
        supervisorId: supervisorId,
        position: practicum?.position || "",
        startDate: practicum?.startDate
          ? new Date(practicum.startDate).toISOString().split("T")[0]
          : "",
        endDate: practicum?.endDate
          ? new Date(practicum.endDate).toISOString().split("T")[0]
          : "",
        totalHours: practicum?.totalHours || 400,
        workSetup: workSetup,
      } as UpdateStudentParams;

      form.reset(formData);
    }
  }, [selectedStudentData, editStudentOpen, form]);

  // Handler functions
  const handleAgencyChange = (agencyId: string) => {
    setSelectedAgencyId(agencyId);
    form.setValue("agencyId", agencyId);
    form.setValue("supervisorId", "");
  };

  const handleViewProfile = (id: string) => {
    setSelectedStudentId(id);
    setViewProfileOpen(true);
  };

  const handleEditStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    setEditStudentOpen(true);
    // Reset dropdown states when opening dialog
    setSelectedAgencyId("");
  };

  const handleDeleteStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    setDeleteConfirmation(null); // Reset confirmation when opening dialog
    setDeleteAlertOpen(true);
  };

  const handleDeleteDialogClose = (open: boolean) => {
    setDeleteAlertOpen(open);
    if (!open) {
      setDeleteConfirmation(null); // Reset confirmation when closing dialog
    }
  };

  const handleUpdateStudent = async (data: UpdateStudentParams) => {
    try {
      // Only send practicum-related fields
      const updatedData: UpdateStudentParams = {
        id: data.id,
        agencyId: data.agencyId || undefined,
        supervisorId: data.supervisorId || undefined,
        position: data.position || undefined,
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
        totalHours: data.totalHours || undefined,
        workSetup: "On-site" as const,
      };
      await updateStudentMutation.mutateAsync(updatedData);
      toast.success("Practicum information updated successfully");
      setEditStudentOpen(false);
      setSelectedStudentId(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update practicum information");
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedStudentId || deleteConfirmation !== "yes") return;

    try {
      await deleteStudentMutation.mutateAsync(selectedStudentId);
      toast.success("Student deleted successfully");
      setDeleteAlertOpen(false);
      setDeleteConfirmation(null);
      setSelectedStudentId(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete student");
    }
  };

  const handleExportToExcel = () => {
    try {
      // Prepare data for export
      const exportData = filteredStudents.map(
        (student: any, index: number) => ({
          "#": index + 1,
          "Student ID": student.studentId,
          "Full Name": student.name,
          Email: student.email,
          Course: student.course,
          Section: student.section,
          Agency: student.agency,
          Status: student.status,
          "Requirements Completed": `${student.requirements}/${
            templatesData?.requirementTemplates?.length || 0
          }`,
          "Requirements %": `${student.requirementsCompletion.toFixed(1)}%`,
          "Attendance %": `${student.attendance}%`,
          "Attendance Remarks": student.attendanceRemarks,
          Reports: student.reports || 0,
        })
      );

      // Calculate summary statistics
      const totalStudents = filteredStudents.length;
      const activeStudents = filteredStudents.filter(
        (s: any) => s.status === "Active"
      ).length;
      const inactiveStudents = totalStudents - activeStudents;
      const avgAttendance =
        totalStudents > 0
          ? (
              filteredStudents.reduce(
                (sum: number, s: any) => sum + s.attendance,
                0
              ) / totalStudents
            ).toFixed(1)
          : 0;
      const avgRequirements =
        totalStudents > 0
          ? (
              filteredStudents.reduce(
                (sum: number, s: any) => sum + s.requirementsCompletion,
                0
              ) / totalStudents
            ).toFixed(1)
          : 0;
      const completedRequirements = filteredStudents.filter(
        (s: any) => s.requirementsCompletion >= 100
      ).length;

      // Create summary data
      const summaryData = [
        { Metric: "Total Students", Value: totalStudents },
        { Metric: "Active Students", Value: activeStudents },
        { Metric: "Inactive Students", Value: inactiveStudents },
        { Metric: "Average Attendance %", Value: `${avgAttendance}%` },
        { Metric: "Average Requirements %", Value: `${avgRequirements}%` },
        {
          Metric: "Students with Complete Requirements",
          Value: completedRequirements,
        },
        { Metric: "Export Date", Value: new Date().toLocaleDateString() },
        { Metric: "Export Time", Value: new Date().toLocaleTimeString() },
      ];

      // Create workbook
      const wb = XLSX.utils.book_new();

      // Create students worksheet
      const studentsWs = XLSX.utils.json_to_sheet(exportData);
      const studentsColWidths = [
        { wch: 5 }, // #
        { wch: 15 }, // Student ID
        { wch: 25 }, // Full Name
        { wch: 30 }, // Email
        { wch: 20 }, // Course
        { wch: 15 }, // Section
        { wch: 25 }, // Agency
        { wch: 10 }, // Status
        { wch: 20 }, // Requirements Completed
        { wch: 15 }, // Requirements %
        { wch: 15 }, // Attendance %
        { wch: 20 }, // Attendance Remarks
        { wch: 10 }, // Reports
      ];
      studentsWs["!cols"] = studentsColWidths;

      // Create summary worksheet
      const summaryWs = XLSX.utils.json_to_sheet(summaryData);
      const summaryColWidths = [
        { wch: 30 }, // Metric
        { wch: 20 }, // Value
      ];
      summaryWs["!cols"] = summaryColWidths;

      // Add worksheets to workbook
      XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");
      XLSX.utils.book_append_sheet(wb, studentsWs, "Students");

      // Generate filename with current date
      const currentDate = new Date().toISOString().split("T")[0];
      const filename = `students_export_${currentDate}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);

      toast.success(
        `Exported ${filteredStudents.length} students to ${filename}`
      );
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data to Excel");
    }
  };

  const serverStudents = (data as any)?.data?.students ?? [];

  const normalizedStudents = useMemo(() => {
    const totalRequirements = templatesData?.requirementTemplates?.length || 0;

    // Debug: Log the first student's data structure
    if (serverStudents.length > 0) {
      console.log("First student data structure:", {
        student: serverStudents[0],
        totalRequirements,
        templatesData: templatesData?.requirementTemplates,
      });
    }

    return serverStudents.map((s: any) => {
      const enrollment = s.enrollments?.[0];
      const section = enrollment?.section;
      const course = section?.course;
      const practicum = s.practicums?.[0];
      const agency = practicum?.agency;

      // Use computed fields first, then fall back to nested structure
      const courseName =
        s.computed?.courseName || course?.code || course?.name || "-";
      const sectionName = s.computed?.sectionName || section?.name || "-";
      const agencyName = s.computed?.agencyName || agency?.name || "-";

      // Extract academic year and semester from section
      const academicYear =
        section?.academicYear || s.computed?.academicYear || "";
      const semester = section?.semester || "";

      // Calculate attendance percentage and requirements completion
      const attendancePercentage = s.computed?.attendance || 0;
      const reports = s.computed?.reports || 0;

      // Calculate requirements completion based on actual requirements data
      // Count approved requirements from the student's requirements array
      const studentRequirements = s.requirements || [];
      const approvedRequirements = studentRequirements.filter(
        (req: any) => req.status === "approved"
      ).length;

      // Calculate attendance remarks based on attendance records
      const attendanceRecords = s.attendanceRecords || [];
      const lateCount = attendanceRecords.filter(
        (record: any) => record.status === "late"
      ).length;
      const absentCount = attendanceRecords.filter(
        (record: any) => record.status === "absent"
      ).length;

      let attendanceRemarks = "Good";
      if (absentCount >= 3) {
        attendanceRemarks = "Too Many Absences";
      } else if (lateCount >= 3) {
        attendanceRemarks = "Too Many Lates";
      }

      // Debug logging for all students to see the data structure
      console.log(`Student ${s.firstName} ${s.lastName}:`, {
        studentRequirements: studentRequirements,
        approvedRequirements,
        totalRequirements,
        requirementsCompletion:
          totalRequirements > 0
            ? (approvedRequirements / totalRequirements) * 100
            : 0,
        hasRequirements: !!s.requirements,
        requirementsLength: studentRequirements.length,
        attendanceRecords: attendanceRecords.length,
        lateCount,
        absentCount,
        attendanceRemarks,
      });

      // Calculate requirements completion percentage
      const requirementsCompletion =
        totalRequirements > 0
          ? (approvedRequirements / totalRequirements) * 100
          : 0;

      return {
        id: s.id,
        name: `${s.firstName} ${s.lastName}`,
        course: courseName,
        section: sectionName,
        email: s.email,
        agency: agencyName,
        status: s.isActive ? "Active" : "Inactive",
        attendance: attendancePercentage,
        requirements: approvedRequirements,
        reports: reports,
        requirementsCompletion: requirementsCompletion,
        attendanceRemarks: attendanceRemarks,
        studentId: s.studentId,
        academicYear: academicYear,
        semester: semester,
      };
    });
  }, [serverStudents, templatesData]);

  // Get unique sections from the data for dynamic filter options
  const availableSections = useMemo(() => {
    const sections = new Set(
      normalizedStudents.map((student: any) => student.section).filter(Boolean)
    );
    return Array.from(sections).sort() as string[];
  }, [normalizedStudents]);

  // Extract unique academic years and semesters from student data
  const availableAcademicYears = useMemo(() => {
    const years = new Set(
      normalizedStudents
        .map((student: any) => student.academicYear)
        .filter(Boolean)
    );
    return Array.from(years).sort().reverse() as string[]; // Most recent first
  }, [normalizedStudents]);

  const availableSemesters = useMemo(() => {
    const semesters = new Set(
      normalizedStudents.map((student: any) => student.semester).filter(Boolean)
    );
    return Array.from(semesters).sort() as string[];
  }, [normalizedStudents]);

  // Determine current academic year and semester (most recent)
  const currentAcademicYear = useMemo(() => {
    return availableAcademicYears.length > 0 ? availableAcademicYears[0] : "";
  }, [availableAcademicYears]);

  const currentSemester = useMemo(() => {
    // Get the most common semester for the current academic year, or first available
    if (availableSemesters.length === 0) return "";

    // If we have a current academic year, find the most common semester for that year
    if (currentAcademicYear) {
      const semesterCounts = new Map<string, number>();
      normalizedStudents
        .filter((s: any) => s.academicYear === currentAcademicYear)
        .forEach((s: any) => {
          if (s.semester) {
            semesterCounts.set(
              s.semester,
              (semesterCounts.get(s.semester) || 0) + 1
            );
          }
        });

      if (semesterCounts.size > 0) {
        const mostCommon = Array.from(semesterCounts.entries()).sort(
          (a, b) => b[1] - a[1]
        )[0][0];
        return mostCommon;
      }
    }

    // Fallback to first available semester
    return availableSemesters[0] || "";
  }, [availableSemesters, currentAcademicYear, normalizedStudents]);

  const filteredStudents = useMemo(() => {
    return normalizedStudents.filter((student: any) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(student.id).includes(searchTerm) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSection =
        selectedSection === "all" || student.section === selectedSection;
      const matchesStatus =
        selectedStatus === "all" || student.status === selectedStatus;

      // Academic year and semester filtering
      let matchesAcademicYear = true;
      let matchesSemester = true;

      if (!showAllStudents) {
        // Determine which academic year to filter by
        const filterAcademicYear =
          selectedAcademicYear === "current"
            ? currentAcademicYear
            : selectedAcademicYear;

        // Determine which semester to filter by
        const filterSemester =
          selectedSemester === "current" ? currentSemester : selectedSemester;

        matchesAcademicYear =
          filterAcademicYear === "all" ||
          !filterAcademicYear ||
          student.academicYear === filterAcademicYear;

        matchesSemester =
          filterSemester === "all" ||
          !filterSemester ||
          student.semester === filterSemester;
      }

      return (
        matchesSearch &&
        matchesSection &&
        matchesStatus &&
        matchesAcademicYear &&
        matchesSemester
      );
    });
  }, [
    normalizedStudents,
    searchTerm,
    selectedSection,
    selectedStatus,
    selectedAcademicYear,
    selectedSemester,
    showAllStudents,
    currentAcademicYear,
    currentSemester,
  ]);

  // Get student name for delete confirmation
  const studentNameToDelete = useMemo(() => {
    if (!selectedStudentId) return "this student";

    const studentToDelete = filteredStudents.find(
      (s: any) => s.id === selectedStudentId
    );

    if (studentToDelete) {
      return studentToDelete.name;
    }

    if (selectedStudentData?.data) {
      return `${selectedStudentData.data.firstName} ${selectedStudentData.data.lastName}`.trim();
    }

    return "this student";
  }, [filteredStudents, selectedStudentId, selectedStudentData]);

  const statsLoading = !hasMounted || isLoading;
  const totalStudents = normalizedStudents.length;
  const activeStudents = normalizedStudents.filter(
    (s: any) => s.status === "Active"
  ).length;
  const inactiveStudents = totalStudents - activeStudents;
  const activePercent =
    totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0;
  const inactivePercent =
    totalStudents > 0
      ? Math.round((inactiveStudents / totalStudents) * 100)
      : 0;
  const averageAttendance =
    totalStudents > 0
      ? Math.round(
          normalizedStudents.reduce(
            (sum: number, student: any) => sum + (student.attendance ?? 0),
            0
          ) / totalStudents
        )
      : 0;

  return (
    <div className="space-y-10">
      <div className="invitation-hero">
        <div className="space-y-3">
          <p className="invitation-eyebrow">Instructor tools</p>
          <h1 className="text-3xl font-semibold leading-tight text-gray-900">
            Student management workspace
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl">
            Monitor practicum readiness, stay ahead of requirements, and spot
            attendance risks before they become blockers.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
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

      <div className="invitation-content">
        <div className="invitation-stat-grid lg:grid-cols-4">
          <InstructorStatsCard
            icon={Users}
            label="Total Students"
            value={totalStudents}
            helperText={`${availableSections.length || 0} sections`}
            isLoading={statsLoading}
          />
          <InstructorStatsCard
            icon={CheckCircle}
            label="Active"
            value={activeStudents}
            helperText="Currently active"
            trend={
              totalStudents > 0
                ? { label: `${activePercent}% active`, variant: "positive" }
                : undefined
            }
            isLoading={statsLoading}
          />
          <InstructorStatsCard
            icon={AlertTriangle}
            label="Inactive"
            value={inactiveStudents}
            helperText="Needs attention"
            trend={
              totalStudents > 0
                ? { label: `${inactivePercent}% inactive`, variant: "negative" }
                : undefined
            }
            isLoading={statsLoading}
          />
          <InstructorStatsCard
            icon={Clock}
            label="Avg. Attendance"
            value={`${averageAttendance}%`}
            helperText="Overall attendance"
            trend={{
              label: averageAttendance >= 85 ? "On track" : "Needs support",
              variant: averageAttendance >= 85 ? "positive" : "negative",
            }}
            isLoading={statsLoading}
          />
        </div>

        <Card className="invitation-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Student roster</CardTitle>
            <CardDescription>
              Manage {totalStudents} student
              {totalStudents === 1 ? "" : "s"} across{" "}
              {availableSections.length || 0} section
              {availableSections.length === 1 ? "" : "s"}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {/* Search and Export Row */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="invitation-search w-full sm:flex-1">
                  <Search className="invitation-search-icon" />
                  <Input
                    placeholder="Search by name, ID, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="invitation-search-control"
                  />
                </div>
                <Button
                  className="invitation-secondary-btn w-full sm:w-auto"
                  onClick={handleExportToExcel}
                  disabled={
                    !hasMounted || isLoading || filteredStudents.length === 0
                  }
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export summary
                </Button>
              </div>

              {/* Filters Row */}
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <Select
                  value={selectedSection}
                  onValueChange={setSelectedSection}
                >
                  <SelectTrigger className="invitation-select-trigger w-full sm:w-40">
                    <SelectValue placeholder="Section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sections</SelectItem>
                    {availableSections.map((section) => (
                      <SelectItem key={section} value={section}>
                        {section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="invitation-select-trigger w-full sm:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={selectedAcademicYear}
                  onValueChange={setSelectedAcademicYear}
                  disabled={showAllStudents}
                >
                  <SelectTrigger className="invitation-select-trigger w-full sm:w-44">
                    <SelectValue placeholder="Academic Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">
                      Current ({currentAcademicYear || "N/A"})
                    </SelectItem>
                    <SelectItem value="all">All Years</SelectItem>
                    {availableAcademicYears.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedSemester}
                  onValueChange={setSelectedSemester}
                  disabled={showAllStudents}
                >
                  <SelectTrigger className="invitation-select-trigger w-full sm:w-40">
                    <SelectValue placeholder="Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">
                      Current ({currentSemester || "N/A"})
                    </SelectItem>
                    <SelectItem value="all">All Semesters</SelectItem>
                    {availableSemesters.map((semester) => (
                      <SelectItem key={semester} value={semester}>
                        {semester}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center space-x-2 px-3 py-2 h-10 border rounded-md bg-white hover:bg-gray-50 transition-colors">
                  <Checkbox
                    id="showAllStudents"
                    checked={showAllStudents}
                    onCheckedChange={(checked) =>
                      setShowAllStudents(checked === true)
                    }
                  />
                  <label
                    htmlFor="showAllStudents"
                    className="text-sm font-medium leading-none cursor-pointer select-none"
                  >
                    Show All
                  </label>
                </div>
              </div>
            </div>

            {(!hasMounted || isLoading) && (
              <div className="invitation-loader">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {hasMounted && error && (
              <div className="invitation-empty-state">
                <div className="invitation-empty-icon">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Unable to load students
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Please try refreshing the page or check your connection.
                </p>
                <Button
                  className="invitation-primary-btn"
                  onClick={() => refetch()}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try again
                </Button>
              </div>
            )}

            {hasMounted &&
              !isLoading &&
              !error &&
              filteredStudents.length > 0 && (
                <div className="invitation-table-wrapper">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Info</TableHead>
                        <TableHead className="w-40">
                          Course &amp; Section
                        </TableHead>
                        <TableHead>Agency</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Requirements</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student: any) => (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium text-gray-900">
                                {student.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {student.studentId}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {student.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="w-40">
                            <div className="truncate">
                              <div
                                className="text-sm font-medium truncate"
                                title={student.course}
                              >
                                {student.course}
                              </div>
                              <div
                                className="text-xs text-muted-foreground truncate"
                                title={`Section ${student.section}`}
                              >
                                Sec {student.section}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-foreground">
                              {student.agency}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={cn(
                                "invitation-status-pill",
                                STUDENT_STATUS_BADGE[student.status] ??
                                  "invitation-status-pill--neutral"
                              )}
                            >
                              {student.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={cn(
                                "invitation-status-pill",
                                getRequirementStatusClass(
                                  student.requirementsCompletion
                                )
                              )}
                            >
                              {student.requirementsCompletion >= 100
                                ? "Complete"
                                : student.requirementsCompletion >= 50
                                ? "In progress"
                                : "Needs work"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="invitation-delete-btn h-9 w-9 p-0"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => handleViewProfile(student.id)}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleEditStudent(student.id)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Student
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() =>
                                    handleDeleteStudent(student.id)
                                  }
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Student
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

            {hasMounted &&
              !isLoading &&
              !error &&
              filteredStudents.length === 0 && (
                <div className="invitation-empty-state">
                  <div className="invitation-empty-icon">
                    <Inbox className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    No students match your filters
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Try adjusting your filters or clearing the search to see all
                    assigned students.
                  </p>
                  <Button
                    className="invitation-back-btn w-full sm:w-auto"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedSection("all");
                      setSelectedStatus("all");
                      setSelectedAcademicYear("current");
                      setSelectedSemester("current");
                      setShowAllStudents(false);
                    }}
                  >
                    Clear filters
                  </Button>
                </div>
              )}
          </CardContent>
        </Card>
      </div>

      {/* View Profile Dialog */}
      <Dialog open={viewProfileOpen} onOpenChange={setViewProfileOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Student Profile
            </DialogTitle>
            <DialogDescription>
              Detailed information about the student
            </DialogDescription>
          </DialogHeader>

          {isLoadingStudent ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading student details...</p>
            </div>
          ) : selectedStudentData?.data ? (
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="invitation-form-card">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Full Name
                      </label>
                      <p className="text-gray-900">
                        {`${selectedStudentData.data.firstName} ${
                          selectedStudentData.data.middleName || ""
                        } ${selectedStudentData.data.lastName}`.trim()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Email
                      </label>
                      <p className="text-gray-900">
                        {selectedStudentData.data.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Phone
                      </label>
                      <p className="text-gray-900">
                        {selectedStudentData.data.phone}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Age
                        </label>
                        <p className="text-gray-900">
                          {selectedStudentData.data.age}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Gender
                        </label>
                        <p className="text-gray-900">
                          {selectedStudentData.data.gender}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Student ID
                      </label>
                      <p className="text-gray-900">
                        {selectedStudentData.data.studentId}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Academic Information */}
                <Card className="invitation-form-card">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Academic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedStudentData.data.enrollments?.[0] && (
                      <>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Course
                          </label>
                          <p className="text-gray-900">
                            {selectedStudentData.data.enrollments[0].section
                              ?.course?.name || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Year and Section
                          </label>
                          <p className="text-gray-900">
                            {selectedStudentData.data.enrollments[0].section
                              ?.name || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Academic Year
                          </label>
                          <p className="text-gray-900">
                            {selectedStudentData.data.enrollments[0].section
                              ?.academicYear || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Enrollment Date
                          </label>
                          <p className="text-gray-900">
                            {new Date(
                              selectedStudentData.data.enrollments[0].enrollmentDate
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Status
                      </label>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "invitation-status-pill",
                          selectedStudentData.data.isActive
                            ? "invitation-status-pill--success"
                            : "invitation-status-pill--neutral"
                        )}
                      >
                        {selectedStudentData.data.isActive
                          ? "Active"
                          : "Inactive"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Practicum Information */}
              {selectedStudentData.data.practicums?.[0] && (
                <Card className="invitation-form-card">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Practicum Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Agency
                        </label>
                        <p className="text-gray-900">
                          {selectedStudentData.data.practicums[0].agency
                            ?.name || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Position
                        </label>
                        <p className="text-gray-900">
                          {selectedStudentData.data.practicums[0].position ||
                            "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Start Date
                        </label>
                        <p className="text-gray-900">
                          {selectedStudentData.data.practicums[0].startDate
                            ? new Date(
                                selectedStudentData.data.practicums[0].startDate
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          End Date
                        </label>
                        <p className="text-gray-900">
                          {selectedStudentData.data.practicums[0].endDate
                            ? new Date(
                                selectedStudentData.data.practicums[0].endDate
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Total Hours
                        </label>
                        <p className="text-gray-900">
                          {selectedStudentData.data.practicums[0].totalHours ||
                            0}{" "}
                          hours
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Completed Hours
                        </label>
                        <p className="text-gray-900">
                          {selectedStudentData.data.practicums[0]
                            .completedHours || 0}{" "}
                          hours
                        </p>
                      </div>
                    </div>
                    {selectedStudentData.data.practicums[0].agency && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium mb-2">Agency Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <label className="text-gray-600">Address</label>
                            <p>
                              {
                                selectedStudentData.data.practicums[0].agency
                                  .address
                              }
                            </p>
                          </div>
                          <div>
                            <label className="text-gray-600">
                              Contact Person
                            </label>
                            <p>
                              {
                                selectedStudentData.data.practicums[0].agency
                                  .contactPerson
                              }
                            </p>
                          </div>
                          <div>
                            <label className="text-gray-600">
                              Contact Phone
                            </label>
                            <p>
                              {
                                selectedStudentData.data.practicums[0].agency
                                  .contactPhone
                              }
                            </p>
                          </div>
                          <div>
                            <label className="text-gray-600">
                              Contact Email
                            </label>
                            <p>
                              {
                                selectedStudentData.data.practicums[0].agency
                                  .contactEmail
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Attendance Information */}
              <Card className="invitation-form-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Attendance Record
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-4 bg-gray-50 rounded-lg mb-4">
                    <div className="text-3xl font-bold text-gray-900">
                      {selectedStudentData.data.computed?.attendance || 0}%
                    </div>
                    <div className="text-sm text-gray-600">
                      Overall Attendance
                    </div>
                  </div>

                  {/* Attendance Records Table */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">
                      Recent Attendance
                    </h4>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Time In</TableHead>
                            <TableHead>Time Out</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Hours</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {isLoadingAttendance ? (
                            <TableRow>
                              <TableCell
                                colSpan={5}
                                className="text-center text-gray-500 py-4"
                              >
                                Loading attendance records...
                              </TableCell>
                            </TableRow>
                          ) : (attendanceData?.attendance?.length ?? 0) > 0 ? (
                            attendanceData?.attendance?.map(
                              (attendance: any, index: number) => (
                                <TableRow key={attendance.id || index}>
                                  <TableCell className="text-sm">
                                    {new Date(
                                      attendance.date
                                    ).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    {attendance.timeIn
                                      ? new Date(
                                          attendance.timeIn
                                        ).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })
                                      : "-"}
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    {attendance.timeOut
                                      ? new Date(
                                          attendance.timeOut
                                        ).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })
                                      : "-"}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant="secondary"
                                      className={cn(
                                        "invitation-status-pill",
                                        getAttendanceRecordClass(
                                          attendance.status
                                        )
                                      )}
                                    >
                                      {attendance.status || "Unknown"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    {attendance.hours
                                      ? `${attendance.hours}h`
                                      : "-"}
                                  </TableCell>
                                </TableRow>
                              )
                            )
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={5}
                                className="text-center text-gray-500 py-4"
                              >
                                No attendance records found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Requirements Progress */}
              <Card className="invitation-form-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Requirements Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingRequirements ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Loading requirements...</p>
                    </div>
                  ) : (
                    <>
                      {/* Progress Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Card className="invitation-form-card">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">
                                Completion Rate
                              </span>
                              <span className="text-sm text-gray-600">
                                {(() => {
                                  const requirements =
                                    requirementsData?.requirements || [];
                                  const templates =
                                    templatesData?.requirementTemplates || [];
                                  const approvedCount = requirements.filter(
                                    (r: any) => r.status === "approved"
                                  ).length;
                                  const totalCount = templates.length;
                                  return `${approvedCount}/${totalCount}`;
                                })()}
                              </span>
                            </div>
                            <Progress
                              value={(() => {
                                const requirements =
                                  requirementsData?.requirements || [];
                                const templates =
                                  templatesData?.requirementTemplates || [];
                                const approvedCount = requirements.filter(
                                  (r: any) => r.status === "approved"
                                ).length;
                                const totalCount = templates.length;
                                return totalCount > 0
                                  ? (approvedCount / totalCount) * 100
                                  : 0;
                              })()}
                              className="h-2 mb-2"
                            />
                            <span className="text-xs text-gray-500">
                              {(() => {
                                const requirements =
                                  requirementsData?.requirements || [];
                                const templates =
                                  templatesData?.requirementTemplates || [];
                                const approvedCount = requirements.filter(
                                  (r: any) => r.status === "approved"
                                ).length;
                                const totalCount = templates.length;
                                const percentage =
                                  totalCount > 0
                                    ? (approvedCount / totalCount) * 100
                                    : 0;
                                return `${percentage.toFixed(0)}% Complete`;
                              })()}
                            </span>
                          </CardContent>
                        </Card>

                        <Card className="invitation-form-card">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium">
                                Approved
                              </span>
                            </div>
                            <span className="text-2xl font-bold text-green-600">
                              {requirementsData?.requirements?.filter(
                                (r: any) => r.status === "approved"
                              ).length || 0}
                            </span>
                          </CardContent>
                        </Card>

                        <Card className="invitation-form-card">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="w-4 h-4 text-yellow-600" />
                              <span className="text-sm font-medium">
                                Submitted
                              </span>
                            </div>
                            <span className="text-2xl font-bold text-yellow-600">
                              {requirementsData?.requirements?.filter(
                                (r: any) => r.status === "submitted"
                              ).length || 0}
                            </span>
                          </CardContent>
                        </Card>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Weekly Reports */}
              <Card className="invitation-form-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileCheck className="w-4 h-4" />
                    Weekly Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingReports ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Loading reports...</p>
                    </div>
                  ) : (
                    <>
                      {/* Reports Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card className="invitation-form-card bg-yellow-50 border-yellow-200">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-600">
                                  Total Reports
                                </p>
                                <p className="text-2xl font-bold text-yellow-600">
                                  {reportsData?.reports?.length || 0}
                                </p>
                              </div>
                              <FileCheck className="w-8 h-8 text-yellow-600" />
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="invitation-form-card bg-green-50 border-green-200">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-600">
                                  Approved
                                </p>
                                <p className="text-2xl font-bold text-green-600">
                                  {reportsData?.reports?.filter(
                                    (r: any) => r.status === "approved"
                                  ).length || 0}
                                </p>
                              </div>
                              <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="invitation-form-card bg-yellow-50 border-yellow-200">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-600">Pending</p>
                                <p className="text-2xl font-bold text-yellow-600">
                                  {reportsData?.reports?.filter(
                                    (r: any) => r.status === "submitted"
                                  ).length || 0}
                                </p>
                              </div>
                              <Clock className="w-8 h-8 text-yellow-600" />
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="invitation-form-card bg-blue-50 border-blue-200">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-600">
                                  Avg. Rating
                                </p>
                                <p className="text-2xl font-bold text-blue-600">
                                  {(() => {
                                    const reports = reportsData?.reports || [];
                                    const ratedReports = reports.filter(
                                      (r: any) => r.rating
                                    );
                                    return ratedReports.length > 0
                                      ? (
                                          ratedReports.reduce(
                                            (acc: number, r: any) =>
                                              acc + (r.rating || 0),
                                            0
                                          ) / ratedReports.length
                                        ).toFixed(1)
                                      : "0.0";
                                  })()}
                                </p>
                              </div>
                              <Star className="w-8 h-8 text-blue-600" />
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Reports List */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">
                          Recent Reports
                        </h4>
                        {reportsData?.reports &&
                        reportsData.reports.length > 0 ? (
                          <div className="space-y-3">
                            {reportsData.reports
                              .slice(0, 5)
                              .map((report: any) => (
                                <Card
                                  key={report.id}
                                  className="invitation-form-card border-l-4 border-l-blue-500"
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                          <h5 className="font-medium text-gray-900">
                                            Week {report.weekNumber || "N/A"} -{" "}
                                            {report.title}
                                          </h5>
                                          <Badge
                                            variant="secondary"
                                            className={cn(
                                              "invitation-status-pill",
                                              report.status
                                                ? REPORT_STATUS_BADGE[
                                                    report.status
                                                  ] ??
                                                    "invitation-status-pill--neutral"
                                                : "invitation-status-pill--neutral"
                                            )}
                                          >
                                            {report.status}
                                          </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                          <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {report.submittedDate
                                              ? new Date(
                                                  report.submittedDate
                                                ).toLocaleDateString()
                                              : "Not submitted"}
                                          </span>
                                          <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {report.hoursLogged || 0}h logged
                                          </span>
                                          {report.rating && (
                                            <span className="flex items-center gap-1">
                                              <Star className="w-4 h-4 text-yellow-500" />
                                              {report.rating}/5
                                            </span>
                                          )}
                                        </div>
                                        {report.content && (
                                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                            {report.content}
                                          </p>
                                        )}
                                      </div>
                                      <div className="flex gap-2">
                                        {report.fileUrl && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                              const baseUrl =
                                                process.env
                                                  .NEXT_PUBLIC_API_URL ||
                                                "http://localhost:3001";
                                              const fullUrl = `${baseUrl}${report.fileUrl}`;
                                              const link =
                                                document.createElement("a");
                                              link.href = fullUrl;
                                              link.download = `DTR_Week_${
                                                report.weekNumber || "Unknown"
                                              }.pdf`;
                                              link.target = "_blank";
                                              document.body.appendChild(link);
                                              link.click();
                                              document.body.removeChild(link);
                                            }}
                                          >
                                            <Download className="w-4 h-4" />
                                          </Button>
                                        )}
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            // You can add a detailed view here if needed
                                            console.log(
                                              "View report details:",
                                              report
                                            );
                                          }}
                                        >
                                          <Eye className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            {reportsData.reports.length > 5 && (
                              <div className="text-center">
                                <Button variant="outline" size="sm">
                                  View All Reports ({reportsData.reports.length}
                                  )
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <FileCheck className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500">
                              No reports submitted yet
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-red-500">Failed to load student details</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog - Practicum Information Only */}
      <Dialog open={editStudentOpen} onOpenChange={setEditStudentOpen}>
        <DialogContent className="max-w-4xl max-h-[95vh] flex flex-col bg-white">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Edit Practicum Information
            </DialogTitle>
            <DialogDescription>
              Update practicum placement details for the student
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleUpdateStudent)}
              className="flex-1 flex flex-col min-h-0"
            >
              <div className="flex-1 overflow-y-auto pr-2">
                <Card className="invitation-form-card">
                  <CardHeader>
                    <CardTitle>Practicum Information</CardTitle>
                    <CardDescription>
                      Manage the student's practicum placement, agency
                      assignment, and supervisor details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="agencyId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Agency/Company *</FormLabel>
                          <Select
                            onValueChange={handleAgencyChange}
                            value={field.value || selectedAgencyId}
                          >
                            <FormControl>
                              <SelectTrigger className="invitation-select-trigger">
                                <SelectValue placeholder="Select an agency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {agenciesData?.agencies.map((agency) => (
                                <SelectItem key={agency.id} value={agency.id}>
                                  {agency.name} ({agency.branchType})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {selectedAgency && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Selected Agency Details
                        </h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>
                            <strong>Name:</strong> {selectedAgency.name}
                          </p>
                          <p>
                            <strong>Address:</strong> {selectedAgency.address}
                          </p>
                          <p>
                            <strong>Contact:</strong>{" "}
                            {selectedAgency.contactPerson} (
                            {selectedAgency.contactRole})
                          </p>
                          <p>
                            <strong>Phone:</strong>{" "}
                            {selectedAgency.contactPhone}
                          </p>
                          <p>
                            <strong>Email:</strong>{" "}
                            {selectedAgency.contactEmail}
                          </p>
                        </div>
                      </div>
                    )}

                    <FormField
                      control={form.control}
                      name="supervisorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Supervisor *</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              form.setValue("supervisorId", value)
                            }
                            value={field.value}
                            disabled={!selectedAgencyId}
                          >
                            <FormControl>
                              <SelectTrigger className="invitation-select-trigger">
                                <SelectValue placeholder="Select a supervisor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableSupervisors.map((supervisor) => (
                                <SelectItem
                                  key={supervisor.id}
                                  value={supervisor.id}
                                >
                                  {supervisor.name} - {supervisor.position}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                          {selectedAgencyId &&
                            availableSupervisors.length === 0 && (
                              <p className="text-sm text-amber-600">
                                No supervisors available for this agency. Please
                                add supervisors to this agency first.
                              </p>
                            )}
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position/Job Title *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter position or job title"
                              className="invitation-input"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date *</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                className="invitation-input"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date *</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                className="invitation-input"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="totalHours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Hours *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="400"
                                className="invitation-input"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value) || 0)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="workSetup"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Work Setup *</FormLabel>
                            <Select
                              onValueChange={(value) =>
                                form.setValue("workSetup", value as any)
                              }
                              value="On-site"
                              disabled
                            >
                              <FormControl>
                                <SelectTrigger className="invitation-select-trigger">
                                  <SelectValue placeholder="On-site" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="On-site">On-site</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <DialogFooter className="flex-shrink-0 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="invitation-back-btn w-full sm:w-auto"
                  onClick={() => setEditStudentOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="invitation-primary-btn w-full sm:w-auto"
                  disabled={updateStudentMutation.isPending}
                >
                  {updateStudentMutation.isPending
                    ? "Updating..."
                    : "Update Practicum"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteAlertOpen}
        onOpenChange={handleDeleteDialogClose}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              Delete Student
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong className="font-semibold text-gray-900">
                {studentNameToDelete}
              </strong>
              ? This action cannot be undone and will permanently remove the
              student's data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Yes/No Confirmation Step */}
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Please confirm your decision:
              </label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={deleteConfirmation === "yes" ? "default" : "outline"}
                  className={cn(
                    "flex-1",
                    deleteConfirmation === "yes"
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : ""
                  )}
                  onClick={() => setDeleteConfirmation("yes")}
                >
                  Yes, I want to delete
                </Button>
                <Button
                  type="button"
                  variant={deleteConfirmation === "no" ? "default" : "outline"}
                  className={cn(
                    "flex-1",
                    deleteConfirmation === "no"
                      ? "bg-gray-600 hover:bg-gray-700 text-white"
                      : ""
                  )}
                  onClick={() => {
                    setDeleteConfirmation("no");
                    setDeleteAlertOpen(false);
                  }}
                >
                  No, cancel
                </Button>
              </div>
            </div>
          </div>

          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel onClick={() => setDeleteConfirmation(null)}>
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={
                deleteStudentMutation.isPending || deleteConfirmation !== "yes"
              }
            >
              {deleteStudentMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Student"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
