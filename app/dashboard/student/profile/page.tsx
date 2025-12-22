"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Building,
  Camera,
  Edit,
  Save,
  ArrowLeft,
  Clock,
  Award,
  Target,
  Printer,
  Download,
  Search,
  Filter,
  Loader2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useAuth, useEditUser } from "@/hooks/auth/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  useAttendanceStats,
  useStudentAttendance,
} from "@/hooks/student/useStudentAttendance";
import { useAttendance } from "@/hooks/attendance";
import { useStudentReports } from "@/hooks/student/useStudentReports";
import { useRequirementStats } from "@/hooks/student/useStudentRequirements";
import { useStudent } from "@/hooks/student/useStudent";
import { useAgencies, useSupervisors } from "@/hooks/agency/useAgency";
import api from "@/lib/api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const practicumSchema = z
  .object({
    agencyId: z.string().min(1, "Agency is required"),
    supervisorId: z.string().optional(),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    position: z.string().min(1, "Position is required"),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end >= start;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

type PracticumFormData = z.infer<typeof practicumSchema>;

const profileSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "First name can only contain letters, spaces, hyphens, and apostrophes"
    ),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Last name can only contain letters, spaces, hyphens, and apostrophes"
    ),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(
      /^[\d\s\-()+]*$/,
      "Phone number can only contain numbers, spaces, hyphens, parentheses, and plus sign"
    ),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Please select a gender",
  }),
  address: z.string().optional(),
  bio: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPracticum, setIsEditingPracticum] = useState(false);
  const { user, isLoading: isUserLoading, error, refetch } = useAuth();
  const editUserMutation = useEditUser();
  const { toast: toastHook } = useToast();
  const queryClient = useQueryClient();

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors },
    watch: watchProfile,
    setValue: setProfileValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      gender: "male" as const,
      address: "",
      bio: "",
    },
  });

  // Hooks must be declared before any early return
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: "",
    endDate: "",
  });
  const [presetRange, setPresetRange] = useState<string>("all");

  // Student key used by student-facing APIs (uses user ID for attendance API)
  const studentKey = user?.id || "";

  // Handle preset date ranges
  const handlePresetRange = (preset: string) => {
    const today = new Date();
    let startDate = "";
    let endDate = today.toISOString().split("T")[0];

    switch (preset) {
      case "last7days":
        const last7Days = new Date(today);
        last7Days.setDate(today.getDate() - 6);
        startDate = last7Days.toISOString().split("T")[0];
        break;
      case "last30days":
        const last30Days = new Date(today);
        last30Days.setDate(today.getDate() - 29);
        startDate = last30Days.toISOString().split("T")[0];
        break;
      case "thisMonth":
        const thisMonthStart = new Date(
          today.getFullYear(),
          today.getMonth(),
          1
        );
        startDate = thisMonthStart.toISOString().split("T")[0];
        break;
      case "lastMonth":
        const lastMonthStart = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1
        );
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        startDate = lastMonthStart.toISOString().split("T")[0];
        endDate = lastMonthEnd.toISOString().split("T")[0];
        break;
      case "custom":
        // Keep current date range values, just set the preset
        setPresetRange(preset);
        return;
      default:
        // "all" - no date filtering
        startDate = "";
        endDate = "";
    }

    setDateRange({ startDate, endDate });
    setPresetRange(preset);
  };

  // Get the effective date range for API calls
  const getEffectiveDateRange = () => {
    if (presetRange === "all" || (!dateRange.startDate && !dateRange.endDate)) {
      return { startDate: undefined, endDate: undefined };
    }
    return {
      startDate: dateRange.startDate || undefined,
      endDate: dateRange.endDate || undefined,
    };
  };

  const { startDate: monthStart, endDate: monthEnd } = getEffectiveDateRange();

  // Queries for tabs (enabled only when studentKey exists)
  const { data: attendanceListData } = useAttendance({
    studentId: studentKey,
    page: 1,
    limit: 10000, // Increased limit to fetch all records
    startDate: monthStart,
    endDate: monthEnd,
  });
  const { data: attendanceStatsData } = useAttendanceStats(studentKey);
  const { data: reportsData } = useStudentReports(studentKey);
  const { data: requirementStatsData } = useRequirementStats(studentKey);

  // Fetch detailed student record for academic and practicum details
  const { data: studentFullData } = useStudent(user?.id || "");
  const studentRecord: any = studentFullData?.data;
  const currentEnrollment = studentRecord?.enrollments?.[0];
  const section = currentEnrollment?.section;
  const course = section?.course;
  const practicum = studentRecord?.practicums?.[0];
  const agency = practicum?.agency;
  const supervisor = practicum?.supervisor;

  // Fetch agencies for practicum form
  const { data: agenciesData } = useAgencies(
    { status: "active" },
    { enabled: isEditingPracticum }
  );

  // Practicum form setup
  const practicumForm = useForm<PracticumFormData>({
    resolver: zodResolver(practicumSchema),
    defaultValues: {
      agencyId: practicum?.agencyId || "",
      supervisorId: practicum?.supervisorId || "",
      startDate: practicum?.startDate
        ? new Date(practicum.startDate).toISOString().split("T")[0]
        : "",
      endDate: practicum?.endDate
        ? new Date(practicum.endDate).toISOString().split("T")[0]
        : "",
      position: practicum?.position || "Student Intern",
    },
  });

  // Watch agency selection to fetch supervisors
  const selectedAgencyId = practicumForm.watch("agencyId");
  const { data: supervisorsData } = useSupervisors(
    selectedAgencyId && isEditingPracticum ? selectedAgencyId : "",
    {}
  );

  // Update form when practicum data changes
  useEffect(() => {
    if (practicum && !isEditingPracticum) {
      practicumForm.reset({
        agencyId: practicum.agencyId || "",
        supervisorId: practicum.supervisorId || "",
        startDate: practicum.startDate
          ? new Date(practicum.startDate).toISOString().split("T")[0]
          : "",
        endDate: practicum.endDate
          ? new Date(practicum.endDate).toISOString().split("T")[0]
          : "",
        position: practicum.position || "Student Intern",
      });
    }
  }, [practicum, isEditingPracticum]);

  // Update practicum mutation
  // Note: Work setup is always "On-site" for all practicums
  const updatePracticum = async (data: PracticumFormData) => {
    try {
      await api.post("/practicum/", {
        agencyId: data.agencyId,
        ...(data.supervisorId && { supervisorId: data.supervisorId }),
        startDate: data.startDate,
        endDate: data.endDate,
        position: data.position,
        totalHours: practicum?.totalHours || 400,
        workSetup: "On-site", // Always "On-site" - no other options allowed
      });
      toast.success("Practicum details updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["student", user?.id] });
      setIsEditingPracticum(false);
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to update practicum details"
      );
    }
  };

  const computedStudentId = studentRecord?.studentId || user?.studentId || "";
  const computedCourse = course?.name || course?.code || "";
  const computedYear = section?.year || "";
  const computedSection = section?.name || "";
  const computedCompany = agency?.name || "";
  const computedPosition = practicum?.position || "";
  const computedSupervisor = supervisor?.name || "";
  const formatDate = (d?: any) => {
    try {
      if (!d) return "";
      const date = new Date(d);
      if (Number.isNaN(date.getTime())) return String(d);
      return date.toISOString().slice(0, 10);
    } catch {
      return "";
    }
  };
  const computedStartDate = formatDate(practicum?.startDate) || "";
  const computedEndDate = formatDate(practicum?.endDate) || "";

  // Format dates for display in a more readable format
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const displayStartDate = formatDisplayDate(computedStartDate);
  const displayEndDate = formatDisplayDate(computedEndDate);

  useEffect(() => {
    if (user) {
      resetProfile({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        gender: (user.gender as "male" | "female" | "other") || "male",
        address: user.address || "",
        bio: user.bio || "",
      });
      if ((user as any).avatar) {
        setAvatarPreview((user as any).avatar as string);
      }
    }
  }, [user, resetProfile]);

  if (isUserLoading) {
    return (
      <div className="px-4 md:px-8 lg:px-16">
        <div className="mb-6">
          <div className="h-8 w-40 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-72 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-gray-100 rounded animate-pulse" />
          <div className="h-64 bg-gray-100 rounded animate-pulse lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 md:px-8 lg:px-16">
        <Card>
          <CardContent className="p-6">
            <p className="text-primary-600">Failed to load profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const practicum_stats = {
    hoursCompleted: practicum?.completedHours ?? 0,
    totalHours: practicum?.totalHours ?? 0,
    reportsSubmitted: reportsData?.data?.total ?? 0,
    requirementsDone: requirementStatsData?.data?.approved ?? 0,
    totalRequirements: requirementStatsData?.data?.total ?? 0,
    attendanceRate: attendanceStatsData?.data?.attendancePercentage ?? 0,
  };

  // DTR data - from attendance API
  type DtrRecord = {
    date: string;
    day: string;
    timeIn: string;
    timeOut: string;
    morningTimeIn?: string | null;
    morningTimeOut?: string | null;
    morningHours?: number;
    afternoonTimeIn?: string | null;
    afternoonTimeOut?: string | null;
    afternoonHours?: number;
    overtimeTimeIn?: string | null;
    overtimeTimeOut?: string | null;
    overtimeHours?: number;
    hours: number;
    status: string;
    remarks: string;
  };

  // Debug: Log the attendance data structure
  console.log("Attendance data:", attendanceListData);

  const dtrRecords: DtrRecord[] = (attendanceListData?.attendance || []).map(
    (a: any) => {
      let day = "";
      try {
        day = new Date(a.date).toLocaleDateString(undefined, {
          weekday: "long",
        });
      } catch {}

      // Format time strings for display with AM/PM
      const formatTime = (timeStr: string | null | undefined) => {
        if (!timeStr) return "";
        try {
          const date = new Date(timeStr);
          return date.toLocaleTimeString("en-US", {
            hour12: true,
            hour: "2-digit",
            minute: "2-digit",
          });
        } catch {
          return timeStr;
        }
      };

      // Calculate morning hours
      let morningHours = 0;
      if (a.morningTimeIn && a.morningTimeOut) {
        try {
          const start = new Date(a.morningTimeIn);
          const end = new Date(a.morningTimeOut);
          morningHours = Math.max(
            0,
            (end.getTime() - start.getTime()) / (1000 * 60 * 60)
          );
        } catch {}
      }

      // Calculate afternoon hours
      let afternoonHours = 0;
      if (a.afternoonTimeIn && a.afternoonTimeOut) {
        try {
          const start = new Date(a.afternoonTimeIn);
          const end = new Date(a.afternoonTimeOut);
          afternoonHours = Math.max(
            0,
            (end.getTime() - start.getTime()) / (1000 * 60 * 60)
          );
        } catch {}
      }

      // Calculate overtime hours
      let overtimeHours = 0;
      if (a.overtimeTimeIn && a.overtimeTimeOut) {
        try {
          const start = new Date(a.overtimeTimeIn);
          const end = new Date(a.overtimeTimeOut);
          overtimeHours = Math.max(
            0,
            (end.getTime() - start.getTime()) / (1000 * 60 * 60)
          );
        } catch {}
      }

      // Calculate total hours (use provided hours or sum of sessions)
      let hours = a.hours || 0;
      if (
        hours === 0 &&
        (morningHours > 0 || afternoonHours > 0 || overtimeHours > 0)
      ) {
        hours = morningHours + afternoonHours + overtimeHours;
      } else if (hours === 0 && a.timeIn && a.timeOut) {
        // Fallback to legacy calculation
        try {
          const start = new Date(a.timeIn);
          const end = new Date(a.timeOut);
          hours = Math.max(
            0,
            (end.getTime() - start.getTime()) / (1000 * 60 * 60)
          );
        } catch {}
      }

      return {
        date: a.date,
        day: a.day || day,
        timeIn: formatTime(a.timeIn),
        timeOut: formatTime(a.timeOut),
        morningTimeIn: a.morningTimeIn ? formatTime(a.morningTimeIn) : null,
        morningTimeOut: a.morningTimeOut ? formatTime(a.morningTimeOut) : null,
        morningHours: Number(morningHours.toFixed(2)),
        afternoonTimeIn: a.afternoonTimeIn
          ? formatTime(a.afternoonTimeIn)
          : null,
        afternoonTimeOut: a.afternoonTimeOut
          ? formatTime(a.afternoonTimeOut)
          : null,
        afternoonHours: Number(afternoonHours.toFixed(2)),
        overtimeTimeIn: a.overtimeTimeIn ? formatTime(a.overtimeTimeIn) : null,
        overtimeTimeOut: a.overtimeTimeOut
          ? formatTime(a.overtimeTimeOut)
          : null,
        overtimeHours: Number(overtimeHours.toFixed(2)),
        hours: Number(hours.toFixed(2)),
        status: a.status || "present",
        remarks: a.timeInRemarks || a.timeOutRemarks || "",
      };
    }
  );

  // Calculate completed hours from attendance records and update practicum_stats
  const calculatedCompletedHours = dtrRecords.reduce(
    (sum: number, record: DtrRecord) => sum + record.hours,
    0
  );
  practicum_stats.hoursCompleted = calculatedCompletedHours;

  // Debug logging
  console.log("DTR Records:", dtrRecords);
  console.log("Calculated completed hours:", calculatedCompletedHours);
  console.log("Practicum total hours:", practicum?.totalHours);
  console.log("Requirements stats data:", requirementStatsData);
  console.log("Reports data:", reportsData);

  const onProfileSubmit = async (data: ProfileFormData) => {
    if (!user?.id) return;
    try {
      await editUserMutation.mutateAsync({
        id: user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        gender: data.gender,
        address: data.address,
        bio: data.bio,
        ...(avatarFile ? { avatar: avatarFile } : {}),
      });
      toastHook({ title: "Profile updated" });
      setIsEditing(false);
    } catch (e: any) {
      toastHook({
        title: "Update failed",
        description: e.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadPDF = () => {
    // Use the same data preparation as print function
    const studentName = `${watchProfile("firstName")} ${watchProfile(
      "lastName"
    )}`;
    const studentId = computedStudentId;
    const course = computedCourse;
    const company = computedCompany;
    const position = computedPosition;
    const supervisor = computedSupervisor;
    const startDate = computedStartDate;
    const endDate = computedEndDate;

    // Calculate total hours with 2 decimal places
    const totalHours = dtrRecords.reduce(
      (sum: number, record: DtrRecord) => sum + record.hours,
      0
    );

    // Calculate late days count
    const lateDaysCount = dtrRecords.filter(
      (record: DtrRecord) =>
        record.status === "late" ||
        record.remarks?.toLowerCase().includes("late")
    ).length;

    // Get current date for PDF
    const printDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Format practicum period dates for better readability
    const formatPeriodDate = (dateStr: string) => {
      if (!dateStr) return "N/A";
      try {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      } catch {
        return dateStr;
      }
    };

    const formattedStartDate = formatPeriodDate(startDate);
    const formattedEndDate = formatPeriodDate(endDate);

    // Create a new window with the DTR content
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
				<!DOCTYPE html>
				<html>
				<head>
					<title>Daily Time Record - ${studentName}</title>
					<style>
						body { 
							font-family: Arial, sans-serif; 
							margin: 20px; 
							line-height: 1.4;
						}
						.header { 
							text-align: center; 
							margin-bottom: 30px; 
							border-bottom: 2px solid #333;
							padding-bottom: 20px;
						}
						.header h1 { 
							margin: 0 0 10px 0; 
							font-size: 24px; 
							color: #333;
						}
						.header h2 { 
							margin: 0; 
							font-size: 18px; 
							color: #666;
						}
						.student-info { 
							margin-bottom: 25px; 
							background-color: #f9f9f9; 
							padding: 15px; 
							border-radius: 5px;
						}
						.student-info p { 
							margin: 5px 0; 
							font-size: 14px;
						}
						table { 
							width: 100%; 
							border-collapse: collapse; 
							margin-bottom: 25px; 
							font-size: 12px;
						}
						th, td { 
							border: 1px solid #333; 
							padding: 8px; 
							text-align: left; 
						}
						th { 
							background-color: #f2f2f2; 
							font-weight: bold;
							text-align: center;
						}
						td { 
							text-align: center;
						}
						.total { 
							font-weight: bold; 
							margin-top: 20px; 
							text-align: right;
							font-size: 16px;
						}
						.signature-section { 
							margin-top: 50px; 
							display: flex; 
							justify-content: space-between;
						}
						.signature-box { 
							width: 45%; 
							text-align: center;
						}
						.signature-line { 
							border-bottom: 1px solid #333; 
							margin: 20px 0 5px 0; 
							height: 30px;
						}
						.printed-name { 
							font-weight: bold; 
							margin: 5px 0; 
							font-size: 14px;
						}
						.print-date { 
							text-align: right; 
							margin-bottom: 20px; 
							font-size: 12px; 
							color: #666;
						}
						@media print { 
							body { margin: 0; }
							.header { page-break-after: avoid; }
							table { page-break-inside: avoid; }
						}
					</style>
				</head>
				<body>
					<div class="print-date">Printed on: ${printDate}</div>
					
					<div class="header">
						<h1>DAILY TIME RECORD</h1>
						<h2>${company || "Company Name"}</h2>
					</div>
					
					<div class="student-info">
						<p><strong>Student Name:</strong> ${studentName}</p>
						<p><strong>Student ID:</strong> ${studentId || "N/A"}</p>
						<p><strong>Course:</strong> ${course || "N/A"}</p>
						<p><strong>Year Level:</strong> ${computedYear || "N/A"}</p>
						<p><strong>Section:</strong> ${computedSection || "N/A"}</p>
						<p><strong>Company:</strong> ${company || "N/A"}</p>
						<p><strong>Position:</strong> ${position || "N/A"}</p>
						<p><strong>Supervisor:</strong> ${supervisor || "N/A"}</p>
						<p><strong>Practicum Period:</strong> ${formattedStartDate} to ${formattedEndDate}</p>
					</div>
					
													<table>
						<thead>
							<tr>
								<th>Date</th>
								<th>Day</th>
								<th colspan="2" style="background-color: #e0f2fe;">Morning Session</th>
								<th colspan="2" style="background-color: #dcfce7;">Afternoon Session</th>
								<th colspan="2" style="background-color: #fff7ed;">Overtime Session</th>
								<th>Total Hours</th>
								<th>Remarks</th>
							</tr>
							<tr>
								<th></th>
								<th></th>
								<th style="background-color: #e0f2fe;">In</th>
								<th style="background-color: #e0f2fe;">Out</th>
								<th style="background-color: #dcfce7;">In</th>
								<th style="background-color: #dcfce7;">Out</th>
								<th style="background-color: #fff7ed;">In</th>
								<th style="background-color: #fff7ed;">Out</th>
								<th></th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							${
                dtrRecords.length > 0
                  ? dtrRecords
                      .map(
                        (record: DtrRecord) => `
								<tr>
									<td>${record.date}</td>
									<td>${record.day}</td>
									<td style="background-color: #e0f2fe;">${record.morningTimeIn || "N/A"}</td>
									<td style="background-color: #e0f2fe;">${record.morningTimeOut || "N/A"}</td>
									<td style="background-color: #dcfce7;">${record.afternoonTimeIn || "N/A"}</td>
									<td style="background-color: #dcfce7;">${record.afternoonTimeOut || "N/A"}</td>
									<td style="background-color: #fff7ed;">${record.overtimeTimeIn || "N/A"}</td>
									<td style="background-color: #fff7ed;">${record.overtimeTimeOut || "N/A"}</td>
									<td>${record.hours.toFixed(2)}</td>
									<td>${record.remarks || "N/A"}</td>
								</tr>
							`
                      )
                      .join("")
                  : `
								<tr>
									<td colspan="10" style="text-align: center; font-style: italic; color: #666;">
										No attendance records found
									</td>
								</tr>
							`
              }
						</tbody>
					</table>
					
					<div class="total">
						<p><strong>Total Hours Worked: ${totalHours.toFixed(2)} hours</strong></p>
						<p><strong>Late Days: ${lateDaysCount}</strong></p>
					</div>
					
					<div class="signature-section">
						<div class="signature-box">
							<div class="signature-line"></div>
							<p><strong>Student Signature over Printed Name</strong></p>
							<p>Date: _________________</p>
						</div>
						
						<div class="signature-box">
							<div class="signature-line"></div>
							<p><strong>Supervisor Signature over Printed Name</strong></p>
							<p>Date: _________________</p>
						</div>
					</div>
				</body>
				</html>
			`);
      printWindow.document.close();

      // Wait for content to load, then trigger print dialog
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const handlePrintDTR = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      // Use computed values for accurate information
      const studentName = `${watchProfile("firstName")} ${watchProfile(
        "lastName"
      )}`;
      const studentId = computedStudentId;
      const course = computedCourse;
      const company = computedCompany;
      const position = computedPosition;
      const supervisor = computedSupervisor;
      const startDate = computedStartDate;
      const endDate = computedEndDate;

      // Calculate total hours with 2 decimal places
      const totalHours = dtrRecords.reduce(
        (sum: number, record: DtrRecord) => sum + record.hours,
        0
      );

      // Calculate late days count
      const lateDaysCount = dtrRecords.filter(
        (record: DtrRecord) =>
          record.status === "late" ||
          record.remarks?.toLowerCase().includes("late")
      ).length;

      // Get current date for print
      const printDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // Format practicum period dates for better readability
      const formatPeriodDate = (dateStr: string) => {
        if (!dateStr) return "N/A";
        try {
          const date = new Date(dateStr);
          return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        } catch {
          return dateStr;
        }
      };

      const formattedStartDate = formatPeriodDate(startDate);
      const formattedEndDate = formatPeriodDate(endDate);

      printWindow.document.write(`
				<!DOCTYPE html>
				<html>
				<head>
					<title>Daily Time Record - ${studentName}</title>
					<style>
						body { 
							font-family: Arial, sans-serif; 
							margin: 20px; 
							line-height: 1.4;
						}
						.header { 
							text-align: center; 
							margin-bottom: 30px; 
							border-bottom: 2px solid #333;
							padding-bottom: 20px;
						}
						.header h1 { 
							margin: 0 0 10px 0; 
							font-size: 24px; 
							color: #333;
						}
						.header h2 { 
							margin: 0; 
							font-size: 18px; 
							color: #666;
						}
						.student-info { 
							margin-bottom: 25px; 
							background-color: #f9f9f9; 
							padding: 15px; 
							border-radius: 5px;
						}
						.student-info p { 
							margin: 5px 0; 
							font-size: 14px;
						}
						table { 
							width: 100%; 
							border-collapse: collapse; 
							margin-bottom: 25px; 
							font-size: 12px;
						}
						th, td { 
							border: 1px solid #333; 
							padding: 8px; 
							text-align: left; 
						}
						th { 
							background-color: #f2f2f2; 
							font-weight: bold;
							text-align: center;
						}
						td { 
							text-align: center;
						}
						.total { 
							font-weight: bold; 
							margin-top: 20px; 
							text-align: right;
							font-size: 16px;
						}
						.signature-section { 
							margin-top: 50px; 
							display: flex; 
							justify-content: space-between;
						}
						.signature-box { 
							width: 45%; 
							text-align: center;
						}
						.signature-line { 
							border-bottom: 1px solid #333; 
							margin: 20px 0 5px 0; 
							height: 30px;
						}
						.printed-name { 
							font-weight: bold; 
							margin: 5px 0; 
							font-size: 14px;
						}
						.print-date { 
							text-align: right; 
							margin-bottom: 20px; 
							font-size: 12px; 
							color: #666;
						}
						@media print { 
							body { margin: 0; }
							.header { page-break-after: avoid; }
							table { page-break-inside: avoid; }
						}
					</style>
				</head>
				<body>
					<div class="print-date">Printed on: ${printDate}</div>
					
					<div class="header">
						<h1>DAILY TIME RECORD</h1>
						<h2>${company || "Company Name"}</h2>
					</div>
					
					<div class="student-info">
						<p><strong>Student Name:</strong> ${studentName}</p>
						<p><strong>Student ID:</strong> ${studentId || "N/A"}</p>
						<p><strong>Course:</strong> ${course || "N/A"}</p>
						<p><strong>Year Level:</strong> ${computedYear || "N/A"}</p>
						<p><strong>Section:</strong> ${computedSection || "N/A"}</p>
						<p><strong>Company:</strong> ${company || "N/A"}</p>
						<p><strong>Position:</strong> ${position || "N/A"}</p>
						<p><strong>Supervisor:</strong> ${supervisor || "N/A"}</p>
						<p><strong>Practicum Period:</strong> ${formattedStartDate} to ${formattedEndDate}</p>
					</div>
					
													<table>
						<thead>
							<tr>
								<th>Date</th>
								<th>Day</th>
								<th colspan="2" style="background-color: #e0f2fe;">Morning Session</th>
								<th colspan="2" style="background-color: #dcfce7;">Afternoon Session</th>
								<th colspan="2" style="background-color: #fff7ed;">Overtime Session</th>
								<th>Total Hours</th>
								<th>Remarks</th>
							</tr>
							<tr>
								<th></th>
								<th></th>
								<th style="background-color: #e0f2fe;">In</th>
								<th style="background-color: #e0f2fe;">Out</th>
								<th style="background-color: #dcfce7;">In</th>
								<th style="background-color: #dcfce7;">Out</th>
								<th style="background-color: #fff7ed;">In</th>
								<th style="background-color: #fff7ed;">Out</th>
								<th></th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							${
                dtrRecords.length > 0
                  ? dtrRecords
                      .map(
                        (record: DtrRecord) => `
								<tr>
									<td>${record.date}</td>
									<td>${record.day}</td>
									<td style="background-color: #e0f2fe;">${record.morningTimeIn || "N/A"}</td>
									<td style="background-color: #e0f2fe;">${record.morningTimeOut || "N/A"}</td>
									<td style="background-color: #dcfce7;">${record.afternoonTimeIn || "N/A"}</td>
									<td style="background-color: #dcfce7;">${record.afternoonTimeOut || "N/A"}</td>
									<td style="background-color: #fff7ed;">${record.overtimeTimeIn || "N/A"}</td>
									<td style="background-color: #fff7ed;">${record.overtimeTimeOut || "N/A"}</td>
									<td>${record.hours.toFixed(2)}</td>
									<td>${record.remarks || "N/A"}</td>
								</tr>
							`
                      )
                      .join("")
                  : `
								<tr>
									<td colspan="10" style="text-align: center; font-style: italic; color: #666;">
										No attendance records found
									</td>
								</tr>
							`
              }
						</tbody>
					</table>
					
					<div class="total">
						<p><strong>Total Hours Worked: ${totalHours.toFixed(2)} hours</strong></p>
						<p><strong>Late Days: ${lateDaysCount}</strong></p>
					</div>
					
					<div class="signature-section">
						<div class="signature-box">
							<div class="signature-line"></div>
							<p><strong>Student Signature over Printed Name</strong></p>
							<p>Date: _________________</p>
						</div>
						
						<div class="signature-box">
							<div class="signature-line"></div>
							<p><strong>Supervisor Signature over Printed Name</strong></p>
							<p>Date: _________________</p>
						</div>
					</div>
				</body>
				</html>
			`);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const filteredDTR: DtrRecord[] = dtrRecords.filter((record: DtrRecord) => {
    const matchesSearch =
      record.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.day.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.remarks.toLowerCase().includes(searchTerm.toLowerCase());

    // Apply date range filter
    let matchesDateRange = true;
    if (dateRange.startDate || dateRange.endDate) {
      const recordDate = new Date(record.date);
      if (dateRange.startDate) {
        const startDate = new Date(dateRange.startDate);
        matchesDateRange = matchesDateRange && recordDate >= startDate;
      }
      if (dateRange.endDate) {
        const endDate = new Date(dateRange.endDate);
        matchesDateRange = matchesDateRange && recordDate <= endDate;
      }
    }

    return matchesSearch && matchesDateRange;
  });

  const totalHours = filteredDTR.reduce(
    (sum: number, record: DtrRecord) => sum + record.hours,
    0
  );

  return (
    <div className="px-4 md:px-8 lg:px-16 ">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/dashboard/student">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Button>
          </Link>
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Profile
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Manage your personal information and track your progress.
          </p>
        </div>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
          <TabsTrigger value="personal" className="text-xs sm:text-sm py-2">
            Personal
          </TabsTrigger>
          <TabsTrigger value="practicum" className="text-xs sm:text-sm py-2">
            Practicum
          </TabsTrigger>
          <TabsTrigger value="progress" className="text-xs sm:text-sm py-2">
            Progress
          </TabsTrigger>
          <TabsTrigger value="dtr" className="text-xs sm:text-sm py-2">
            DTR
          </TabsTrigger>
        </TabsList>

        {/* Personal Information */}
        <TabsContent value="personal" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Picture */}
            <Card>
              <CardContent className="p-6 text-center space-y-4">
                <Avatar className="w-32 h-32 mx-auto">
                  <AvatarImage src={avatarPreview || "/placeholder-user.jpg"} />
                  <AvatarFallback className="text-2xl">
                    {watchProfile("firstName")?.[0]}
                    {watchProfile("lastName")?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">
                    {watchProfile("firstName")} {watchProfile("lastName")}
                  </h3>
                  <p className="text-gray-600">{computedStudentId}</p>
                  <Badge variant="secondary" className="mt-2">
                    {computedYear} Student
                  </Badge>
                </div>
                {isEditing && (
                  <>
                    <input
                      type="file"
                      id="student-avatar-upload"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        document
                          .getElementById("student-avatar-upload")
                          ?.click()
                      }
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Change Photo
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Personal Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Personal Information
                    </CardTitle>
                    {!isEditing && (
                      <Button
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                        size="sm"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form
                    onSubmit={handleProfileSubmit(onProfileSubmit)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          {...registerProfile("firstName")}
                          disabled={!isEditing}
                        />
                        {isEditing && profileErrors.firstName && (
                          <p className="text-xs text-red-600">
                            {profileErrors.firstName.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          {...registerProfile("lastName")}
                          disabled={!isEditing}
                        />
                        {isEditing && profileErrors.lastName && (
                          <p className="text-xs text-red-600">
                            {profileErrors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          {...registerProfile("email")}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                      {isEditing && profileErrors.email && (
                        <p className="text-xs text-red-600">
                          {profileErrors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="phone"
                          {...registerProfile("phone")}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                      {isEditing && profileErrors.phone && (
                        <p className="text-xs text-red-600">
                          {profileErrors.phone.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={watchProfile("gender") ?? undefined}
                        onValueChange={(value) =>
                          setProfileValue(
                            "gender",
                            value as "male" | "female" | "other"
                          )
                        }
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {isEditing && profileErrors.gender && (
                        <p className="text-xs text-red-600">
                          {profileErrors.gender.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Textarea
                          id="address"
                          {...registerProfile("address")}
                          disabled={!isEditing}
                          className="pl-10 min-h-[80px] resize-none"
                        />
                      </div>
                      {isEditing && profileErrors.address && (
                        <p className="text-xs text-red-600">
                          {profileErrors.address.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        {...registerProfile("bio")}
                        disabled={!isEditing}
                        placeholder="Tell us about yourself..."
                        className="min-h-[100px] resize-none"
                      />
                      {isEditing && profileErrors.bio && (
                        <p className="text-xs text-red-600">
                          {profileErrors.bio.message}
                        </p>
                      )}
                    </div>

                    {isEditing && (
                      <Button
                        type="submit"
                        disabled={editUserMutation.isPending}
                        className="w-full"
                      >
                        {editUserMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    )}
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Practicum Information */}
        <TabsContent value="practicum" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Academic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Student ID</Label>
                  <Input value={computedStudentId} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Course</Label>
                  <Input value={computedCourse} disabled />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Year Level</Label>
                    <Input value={computedYear} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Section</Label>
                    <Input value={computedSection} disabled />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Practicum Details
                  </CardTitle>
                  {!isEditingPracticum && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingPracticum(true)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      {practicum ? "Edit" : "Add Practicum"}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditingPracticum ? (
                  <form
                    onSubmit={practicumForm.handleSubmit(updatePracticum)}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="agencyId">Agency *</Label>
                      <Select
                        value={practicumForm.watch("agencyId") || ""}
                        onValueChange={(value) =>
                          practicumForm.setValue("agencyId", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select agency" />
                        </SelectTrigger>
                        <SelectContent>
                          {agenciesData?.agencies?.map((agency) => (
                            <SelectItem key={agency.id} value={agency.id}>
                              {agency.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {practicumForm.formState.errors.agencyId && (
                        <p className="text-sm text-red-600">
                          {practicumForm.formState.errors.agencyId.message}
                        </p>
                      )}
                    </div>

                    {selectedAgencyId && (
                      <div className="space-y-2">
                        <Label htmlFor="supervisorId">
                          Supervisor (Optional)
                        </Label>
                        <Select
                          value={practicumForm.watch("supervisorId") || ""}
                          onValueChange={(value) =>
                            practicumForm.setValue("supervisorId", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select supervisor (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            {supervisorsData?.supervisors &&
                            supervisorsData.supervisors.length > 0 ? (
                              supervisorsData.supervisors.map((sup) => (
                                <SelectItem key={sup.id} value={sup.id}>
                                  {sup.name} • {sup.position}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="none" disabled>
                                No supervisors available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        {practicumForm.formState.errors.supervisorId && (
                          <p className="text-sm text-red-600">
                            {
                              practicumForm.formState.errors.supervisorId
                                .message
                            }
                          </p>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="position">Position *</Label>
                      <Input
                        id="position"
                        {...practicumForm.register("position")}
                      />
                      {practicumForm.formState.errors.position && (
                        <p className="text-sm text-red-600">
                          {practicumForm.formState.errors.position.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date *</Label>
                        <Input
                          id="startDate"
                          type="date"
                          {...practicumForm.register("startDate")}
                        />
                        {practicumForm.formState.errors.startDate && (
                          <p className="text-sm text-red-600">
                            {practicumForm.formState.errors.startDate.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate">End Date *</Label>
                        <Input
                          id="endDate"
                          type="date"
                          {...practicumForm.register("endDate")}
                        />
                        {practicumForm.formState.errors.endDate && (
                          <p className="text-sm text-red-600">
                            {practicumForm.formState.errors.endDate.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        type="submit"
                        disabled={practicumForm.formState.isSubmitting}
                        className="flex-1"
                      >
                        {practicumForm.formState.isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditingPracticum(false);
                          practicumForm.reset();
                        }}
                        disabled={practicumForm.formState.isSubmitting}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : practicum ? (
                  <>
                    <div className="space-y-2">
                      <Label>Company</Label>
                      <Input value={computedCompany} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Position</Label>
                      <Input value={computedPosition} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Supervisor</Label>
                      <Input value={computedSupervisor} disabled />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input value={displayStartDate} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input value={displayEndDate} disabled />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Building className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">
                      No practicum details found. Click "Add Practicum" to set
                      up your practicum information.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Progress Tracking */}
        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-primary-200 shadow-sm">
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 mx-auto text-primary-600 mb-2" />
                <div className="text-2xl font-bold text-primary-600">
                  {practicum_stats.hoursCompleted}
                </div>
                <div className="text-sm text-gray-600">
                  of {practicum_stats.totalHours} hours
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {practicum_stats.totalHours > 0
                    ? (
                        (practicum_stats.hoursCompleted /
                          practicum_stats.totalHours) *
                        100
                      ).toFixed(0)
                    : 0}
                  % Complete
                </div>
              </CardContent>
            </Card>

            <Card className="border border-primary-200 shadow-sm">
              <CardContent className="p-4 text-center">
                <Target className="w-8 h-8 mx-auto text-primary-600 mb-2" />
                <div className="text-2xl font-bold text-primary-600">
                  {practicum_stats.attendanceRate}%
                </div>
                <div className="text-sm text-gray-600">Attendance Rate</div>
              </CardContent>
            </Card>

            <Card className="border border-primary-200 shadow-sm">
              <CardContent className="p-4 text-center">
                <Award className="w-8 h-8 mx-auto text-primary-600 mb-2" />
                <div className="text-2xl font-bold text-primary-600">
                  {practicum_stats.reportsSubmitted}
                </div>
                <div className="text-sm text-gray-600">Reports Submitted</div>
              </CardContent>
            </Card>

            <Card className="border border-primary-200 shadow-sm">
              <CardContent className="p-4 text-center">
                <GraduationCap className="w-8 h-8 mx-auto text-primary-600 mb-2" />
                <div className="text-2xl font-bold text-primary-600">
                  {practicum_stats.requirementsDone}
                </div>
                <div className="text-sm text-gray-600">
                  of {practicum_stats.totalRequirements} requirements
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* DTR - Daily Time Record */}
        <TabsContent value="dtr" className="space-y-6">
          <Card className="border border-primary-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-600" />
                Daily Time Record (DTR)
              </CardTitle>
              <p className="text-sm text-gray-600">
                View and print your daily time records for practicum hours
                tracking.
              </p>
            </CardHeader>
            <CardContent>
              {/* DTR Controls */}
              <div className="flex flex-col gap-4 mb-6">
                {/* Search and Filters Row */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search by date, day, or remarks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <Select
                      value={presetRange}
                      onValueChange={(value: string) =>
                        handlePresetRange(value)
                      }
                    >
                      <SelectTrigger className="w-32 sm:w-40 text-sm">
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="last7days">Last 7 Days</SelectItem>
                        <SelectItem value="last30days">Last 30 Days</SelectItem>
                        <SelectItem value="thisMonth">This Month</SelectItem>
                        <SelectItem value="lastMonth">Last Month</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Custom Date Range Picker */}
                {presetRange === "custom" && (
                  <div className="flex flex-col sm:flex-row gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor="startDate"
                        className="text-sm font-medium whitespace-nowrap"
                      >
                        From:
                      </Label>
                      <input
                        id="startDate"
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) =>
                          setDateRange((prev) => ({
                            ...prev,
                            startDate: e.target.value,
                          }))
                        }
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor="endDate"
                        className="text-sm font-medium whitespace-nowrap"
                      >
                        To:
                      </Label>
                      <input
                        id="endDate"
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) =>
                          setDateRange((prev) => ({
                            ...prev,
                            endDate: e.target.value,
                          }))
                        }
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDateRange({ startDate: "", endDate: "" });
                        setPresetRange("all");
                      }}
                      className="whitespace-nowrap"
                    >
                      Clear
                    </Button>
                  </div>
                )}

                {/* Action Buttons Row */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={handlePrintDTR}
                    variant="outline"
                    className="flex items-center justify-center gap-2 flex-1 sm:flex-none sm:w-auto"
                  >
                    <Printer className="w-4 h-4" />
                    <span className="hidden sm:inline">Print DTR</span>
                    <span className="sm:hidden">Print</span>
                  </Button>
                  {/* <Button
										onClick={handleDownloadPDF}
										variant="outline"
										className="flex items-center justify-center gap-2 flex-1 sm:flex-none sm:w-auto"
									>
										<Download className="w-4 h-4" />
										<span className="hidden sm:inline">Download PDF</span>
										<span className="sm:hidden">PDF</span>
									</Button> */}
                </div>
              </div>

              {/* DTR Summary */}
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">
                  {presetRange === "all" && "Showing all time records"}
                  {presetRange === "last7days" && "Showing last 7 days"}
                  {presetRange === "last30days" && "Showing last 30 days"}
                  {presetRange === "thisMonth" && "Showing this month"}
                  {presetRange === "lastMonth" && "Showing last month"}
                  {presetRange === "custom" &&
                    dateRange.startDate &&
                    dateRange.endDate &&
                    `Showing from ${new Date(
                      dateRange.startDate
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })} to ${new Date(dateRange.endDate).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" }
                    )}`}
                  {presetRange === "custom" &&
                    (!dateRange.startDate || !dateRange.endDate) &&
                    "Select start and end dates"}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                <Card className="border border-primary-200 shadow-sm">
                  <CardContent className="p-3 sm:p-4 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-primary-600">
                      {filteredDTR.length}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      Days Recorded
                    </div>
                  </CardContent>
                </Card>
                <Card className="border border-primary-200 shadow-sm">
                  <CardContent className="p-3 sm:p-4 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-primary-600">
                      {totalHours.toFixed(2)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      Total Hours
                    </div>
                  </CardContent>
                </Card>
                <Card className="sm:col-span-2 lg:col-span-1 border border-primary-200 shadow-sm">
                  <CardContent className="p-3 sm:p-4 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-primary-600">
                      {filteredDTR.length > 0
                        ? (totalHours / filteredDTR.length).toFixed(2)
                        : "0.00"}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      Avg Hours/Day
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* DTR Table - Mobile Responsive */}
              <div className="space-y-4">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-3 py-2 text-left text-xs sm:text-sm font-medium text-gray-700">
                          Date
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-xs sm:text-sm font-medium text-gray-700">
                          Day
                        </th>
                        <th
                          colSpan={2}
                          className="border border-gray-300 px-3 py-2 text-center text-xs sm:text-sm font-medium text-gray-700 bg-primary-50"
                        >
                          Morning Session
                        </th>
                        <th
                          colSpan={2}
                          className="border border-gray-300 px-3 py-2 text-center text-xs sm:text-sm font-medium text-gray-700 bg-primary-50"
                        >
                          Afternoon Session
                        </th>
                        <th
                          colSpan={2}
                          className="border border-gray-300 px-3 py-2 text-center text-xs sm:text-sm font-medium text-gray-700 bg-orange-50"
                        >
                          Overtime Session
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-xs sm:text-sm font-medium text-gray-700">
                          Total Hours
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-xs sm:text-sm font-medium text-gray-700">
                          Remarks
                        </th>
                      </tr>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-3 py-2"></th>
                        <th className="border border-gray-300 px-3 py-2"></th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-xs sm:text-sm font-medium text-gray-700 bg-primary-50">
                          In
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-xs sm:text-sm font-medium text-gray-700 bg-primary-50">
                          Out
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-xs sm:text-sm font-medium text-gray-700 bg-primary-50">
                          In
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-xs sm:text-sm font-medium text-gray-700 bg-primary-50">
                          Out
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-xs sm:text-sm font-medium text-gray-700 bg-orange-50">
                          In
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-xs sm:text-sm font-medium text-gray-700 bg-orange-50">
                          Out
                        </th>
                        <th className="border border-gray-300 px-3 py-2"></th>
                        <th className="border border-gray-300 px-3 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDTR.map((record: DtrRecord, index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-3 py-2 text-xs sm:text-sm">
                            {record.date}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-xs sm:text-sm">
                            {record.day}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-xs sm:text-sm bg-primary-50">
                            {record.morningTimeIn || "N/A"}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-xs sm:text-sm bg-primary-50">
                            {record.morningTimeOut || "N/A"}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-xs sm:text-sm bg-primary-50">
                            {record.afternoonTimeIn || "N/A"}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-xs sm:text-sm bg-primary-50">
                            {record.afternoonTimeOut || "N/A"}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-xs sm:text-sm bg-orange-50">
                            {record.overtimeTimeIn || "N/A"}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-xs sm:text-sm bg-orange-50">
                            {record.overtimeTimeOut || "N/A"}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-xs sm:text-sm font-semibold">
                            {record.hours.toFixed(2)}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-xs sm:text-sm">
                            {record.remarks}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {filteredDTR.map((record: DtrRecord, index: number) => (
                    <Card key={index} className="p-4">
                      <div className="space-y-3">
                        {/* Header Row */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-sm">
                              {record.date}
                            </span>
                          </div>
                        </div>

                        {/* Day */}
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Day:</span> {record.day}
                        </div>

                        {/* Morning Session */}
                        {(record.morningTimeIn || record.morningTimeOut) && (
                          <div className="pb-2 border-b border-gray-200">
                            <div className="text-xs font-semibold text-primary-700 mb-1">
                              Morning Session
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">
                                  Time In:
                                </span>
                                <div className="text-gray-900">
                                  {record.morningTimeIn || "N/A"}
                                </div>
                              </div>
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">
                                  Time Out:
                                </span>
                                <div className="text-gray-900">
                                  {record.morningTimeOut || "N/A"}
                                </div>
                              </div>
                            </div>
                            {record.morningHours && record.morningHours > 0 && (
                              <div className="text-xs text-gray-600 mt-1">
                                Hours: {record.morningHours.toFixed(2)}h
                              </div>
                            )}
                          </div>
                        )}

                        {/* Afternoon Session */}
                        {(record.afternoonTimeIn ||
                          record.afternoonTimeOut) && (
                          <div className="pb-2 border-b border-gray-200">
                            <div className="text-xs font-semibold text-primary-700 mb-1">
                              Afternoon Session
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">
                                  Time In:
                                </span>
                                <div className="text-gray-900">
                                  {record.afternoonTimeIn || "N/A"}
                                </div>
                              </div>
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">
                                  Time Out:
                                </span>
                                <div className="text-gray-900">
                                  {record.afternoonTimeOut || "N/A"}
                                </div>
                              </div>
                            </div>
                            {record.afternoonHours &&
                              record.afternoonHours > 0 && (
                                <div className="text-xs text-gray-600 mt-1">
                                  Hours: {record.afternoonHours.toFixed(2)}h
                                </div>
                              )}
                          </div>
                        )}

                        {/* Overtime Session */}
                        {(record.overtimeTimeIn || record.overtimeTimeOut) && (
                          <div className="pb-2 border-b border-gray-200">
                            <div className="text-xs font-semibold text-orange-700 mb-1">
                              Overtime Session
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">
                                  Time In:
                                </span>
                                <div className="text-gray-900">
                                  {record.overtimeTimeIn || "N/A"}
                                </div>
                              </div>
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">
                                  Time Out:
                                </span>
                                <div className="text-gray-900">
                                  {record.overtimeTimeOut || "N/A"}
                                </div>
                              </div>
                            </div>
                            {record.overtimeHours &&
                              record.overtimeHours > 0 && (
                                <div className="text-xs text-gray-600 mt-1">
                                  Hours: {record.overtimeHours.toFixed(2)}h
                                </div>
                              )}
                          </div>
                        )}

                        {/* Legacy format (backward compatibility) */}
                        {!record.morningTimeIn && !record.afternoonTimeIn && (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-sm">
                              <span className="font-medium text-gray-700">
                                Time In:
                              </span>
                              <div className="text-gray-900">
                                {record.timeIn || "N/A"}
                              </div>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium text-gray-700">
                                Time Out:
                              </span>
                              <div className="text-gray-900">
                                {record.timeOut || "N/A"}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Hours and Remarks */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">
                              Hours:
                            </span>
                            <div className="text-gray-900 font-semibold">
                              {record.hours.toFixed(2)}
                            </div>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">
                              Remarks:
                            </span>
                            <div className="text-gray-900">
                              {record.remarks}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* No Records Message */}
              {filteredDTR.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm sm:text-base">
                    No time records found for the selected criteria.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
