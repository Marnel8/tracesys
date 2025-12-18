"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Upload,
  FileText,
  Calendar,
  Clock,
  ArrowLeft,
  Plus,
  Eye,
  Download,
  X,
  Filter,
  CalendarIcon,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/auth/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import {
  useReports,
  useSubmitReport,
  useCreateReport,
  useReportStats,
  useReport,
  Report,
  ReportType,
} from "@/hooks/report/useReport";
import { useCreateNarrativeReport } from "@/hooks/report/useNarrativeReport";
import { useAttendance } from "@/hooks/attendance";

// Helper function to format date as YYYY-MM-DD (date-only, no timezone conversion)
const formatDateOnly = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function ReportsPage() {
  const isMobile = useIsMobile();
  const [reportTitle, setReportTitle] = useState("");
  const [reportContent, setReportContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [hoursLogged, setHoursLogged] = useState<number | "">("");
  const [reportType, setReportType] = useState<ReportType>("weekly");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [reportTypeFilter, setReportTypeFilter] = useState<ReportType | "all">(
    "all"
  );

  const { user } = useAuth();
  // Fetch all attendance records to compute total approved hours (DTR total)
  const { data: allAttendanceData } = useAttendance({
    studentId: user?.id,
    limit: 10000,
  });

  // Compute total approved hours similar to Profile DTR logic
  const totalApprovedHours = useMemo(() => {
    const records: any[] =
      (allAttendanceData as any)?.data?.attendance ??
      (allAttendanceData as any)?.attendance ??
      (allAttendanceData as any)?.records ??
      [];
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
    return Math.round(completed * 100) / 100;
  }, [allAttendanceData]);

  // Initialize and lock Hours Logged field from DTR total
  useEffect(() => {
    if (
      typeof totalApprovedHours === "number" &&
      !Number.isNaN(totalApprovedHours)
    ) {
      setHoursLogged(totalApprovedHours);
    }
  }, [totalApprovedHours]);
  const { data: reportsData } = useReports({
    page: 1,
    limit: 50,
    status: "all",
    type: reportTypeFilter,
    studentId: user?.id,
  });

  const allReports = useMemo(() => reportsData?.reports ?? [], [reportsData]);
  const { mutate: submitReport, isPending: isSubmitting } = useSubmitReport();
  const { mutate: createReport, isPending: isCreating } = useCreateReport();
  const { mutate: createNarrativeReport, isPending: isCreatingNarrative } =
    useCreateNarrativeReport();
  const { data: statsData } = useReportStats(user?.id || "");
  const { data: selectedReport } = useReport(selectedReportId || "");

  // Use real data from API
  const submittedReports = allReports.filter(
    (report: any) => report.status !== "draft"
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleViewReport = (reportId: string) => {
    setSelectedReportId(reportId);
    setIsViewDialogOpen(true);
  };

  const startEditReport = (report: any) => {
    setEditingReportId(report.id);
    setReportType(report.type as ReportType);
    setReportTitle(report.title || "");
    setReportContent(report.content || "");

    if (report.type === "weekly") {
      const start = report.startDate ? new Date(report.startDate) : undefined;
      const end = report.endDate ? new Date(report.endDate) : undefined;
      setDateRange({ from: start, to: end });
    } else {
      setDateRange({ from: undefined, to: undefined });
    }

    const hours =
      typeof report.hoursLogged === "number"
        ? report.hoursLogged
        : typeof totalApprovedHours === "number" &&
          !Number.isNaN(totalApprovedHours)
        ? totalApprovedHours
        : "";
    setHoursLogged(hours);

    setSelectedFiles([]);
    // Scroll to top of form so the student sees the editing state
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getFullFileUrl = (fileUrl: string) => {
    // Construct full URL using the API base URL
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    return `${baseUrl}${fileUrl}`;
  };

  const getFileNameFromUrl = (fileUrl: string) => {
    // Extract filename from the fileUrl path
    const fileName = fileUrl.split("/").pop() || "unknown_file.pdf";
    return fileName;
  };

  const handleDownloadReport = (fileUrl: string, fileName: string) => {
    const fullUrl = getFullFileUrl(fileUrl);

    const link = document.createElement("a");
    link.href = fullUrl;
    link.download = fileName;
    link.target = "_blank"; // Open in new tab as fallback
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmitReport = async () => {
    if (!reportContent || !reportTitle) return;
    if (reportType === "weekly" && (!dateRange?.from || !dateRange?.to)) return;

    // Editing existing report: resubmit instead of creating a new one
    if (editingReportId) {
      submitReport(
        {
          id: editingReportId,
          payload: {
            title: reportTitle,
            content: reportContent,
            startDate:
              reportType === "weekly" && dateRange?.from
                ? formatDateOnly(dateRange.from)
                : undefined,
            endDate:
              reportType === "weekly" && dateRange?.to
                ? formatDateOnly(dateRange.to)
                : undefined,
            hoursLogged:
              typeof hoursLogged === "number" ? hoursLogged : undefined,
            file: selectedFiles[0] || null,
          },
        },
        {
          onSuccess: () => {
            setEditingReportId(null);
            setReportTitle("");
            setReportContent("");
            setSelectedFiles([]);
            setDateRange({ from: undefined, to: undefined });
            setHoursLogged("");
            setReportType("weekly");
          },
        }
      );
      return;
    }

    // New narrative reports submit directly via narrative endpoint (multipart)
    if (reportType === "narrative") {
      createNarrativeReport(
        {
          title: reportTitle,
          content: reportContent,
          hoursLogged:
            typeof hoursLogged === "number" ? hoursLogged : undefined,
          file: selectedFiles[0] || null,
        },
        {
          onSuccess: () => {
            setEditingReportId(null);
            setReportTitle("");
            setReportContent("");
            setSelectedFiles([]);
            setDateRange({ from: undefined, to: undefined });
            setHoursLogged("");
            setReportType("weekly");
          },
        }
      );
      return;
    }

    // Weekly: create draft then submit with file
    createReport(
      {
        title: reportTitle,
        content: reportContent,
        type: reportType,
        startDate:
          reportType === "weekly" && dateRange?.from
            ? formatDateOnly(dateRange.from)
            : undefined,
        endDate:
          reportType === "weekly" && dateRange?.to
            ? formatDateOnly(dateRange.to)
            : undefined,
      },
      {
        onSuccess: (newReport) => {
          submitReport(
            {
              id: newReport.id,
              payload: {
                title: reportTitle,
                content: reportContent,
                startDate:
                  reportType === "weekly" && dateRange?.from
                    ? formatDateOnly(dateRange.from)
                    : undefined,
                endDate:
                  reportType === "weekly" && dateRange?.to
                    ? formatDateOnly(dateRange.to)
                    : undefined,
                hoursLogged:
                  typeof hoursLogged === "number" ? hoursLogged : undefined,
                file: selectedFiles[0] || null,
              },
            },
            {
              onSuccess: () => {
                setReportTitle("");
                setReportContent("");
                setSelectedFiles([]);
                setDateRange({ from: undefined, to: undefined });
                setHoursLogged("");
                setReportType("weekly");
              },
            }
          );
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 xl:px-16 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
            <Link href="/dashboard/student">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 sm:gap-2 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden xs:inline sm:hidden">Back</span>
                <span className="hidden sm:inline">Back to Dashboard</span>
              </Button>
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            Reports
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm md:text-base">
            Submit your weekly and narrative reports.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Submit New Report */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <Card className="border border-primary-200 shadow-sm">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                  Submit New Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="report-type" className="text-sm font-medium">
                    Report Type
                  </Label>
                  <Select
                    value={reportType}
                    onValueChange={(value: ReportType) => setReportType(value)}
                  >
                    <SelectTrigger className="w-full text-sm">
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly Report</SelectItem>
                      <SelectItem value="narrative">
                        Narrative Report
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="report-title"
                      className="text-sm font-medium"
                    >
                      Report Title
                    </Label>
                    <Input
                      id="report-title"
                      placeholder={
                        reportType === "weekly"
                          ? "e.g., Weekly Report #9"
                          : "e.g., Narrative Report - Internship Experience"
                      }
                      value={reportTitle}
                      onChange={(e) => setReportTitle(e.target.value)}
                      className="w-full text-sm"
                    />
                  </div>

                  {reportType === "weekly" && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="date-range"
                        className="text-sm font-medium"
                      >
                        Date Range <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="flex-1 text-sm justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateRange?.from && dateRange?.to ? (
                                <>
                                  {format(dateRange.from, "MMM dd, yyyy")} -{" "}
                                  {format(dateRange.to, "MMM dd, yyyy")}
                                </>
                              ) : (
                                <span className="text-gray-500">
                                  Select start and end dates
                                </span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <div className="p-3 border-b">
                              <p className="text-xs text-gray-600">
                                Click a start date, then click an end date
                              </p>
                            </div>
                            <CalendarComponent
                              initialFocus
                              mode="range"
                              defaultMonth={dateRange?.from || new Date()}
                              selected={dateRange}
                              onSelect={setDateRange}
                              numberOfMonths={isMobile ? 1 : 2}
                            />
                          </PopoverContent>
                        </Popover>
                        {dateRange?.from && dateRange?.to && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setDateRange({ from: undefined, to: undefined })
                            }
                            className="flex-shrink-0"
                            title="Clear date range"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {dateRange?.from && !dateRange?.to && (
                        <p className="text-xs text-blue-600">
                          Now select an end date
                        </p>
                      )}
                      {!dateRange?.from && (
                        <p className="text-xs text-gray-500">
                          Select the start and end dates for this weekly report
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hours-logged" className="text-sm font-medium">
                    Hours Logged
                  </Label>
                  <Input
                    id="hours-logged"
                    type="number"
                    placeholder="Auto-calculated from DTR"
                    value={typeof hoursLogged === "number" ? hoursLogged : ""}
                    readOnly
                    disabled
                    className="w-full text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="report-content"
                    className="text-sm font-medium"
                  >
                    Report Content
                  </Label>
                  <Textarea
                    id="report-content"
                    placeholder="Describe your activities, accomplishments, challenges, and learnings..."
                    value={reportContent}
                    onChange={(e) => setReportContent(e.target.value)}
                    className="min-h-[150px] sm:min-h-[200px] resize-none text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file-upload" className="text-sm font-medium">
                    {reportType === "weekly"
                      ? "Weekly DTR (PDF Required)"
                      : "Narrative Report Document (PDF Required)"}
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6">
                    <div className="text-center">
                      <Upload className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-xs sm:text-sm text-gray-600 mb-3">
                        {reportType === "weekly"
                          ? "Upload your weekly Daily Time Record (DTR) in PDF format"
                          : "Upload your narrative report document in PDF format"}
                      </p>
                      <Input
                        id="file-upload"
                        type="file"
                        accept=".pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          document.getElementById("file-upload")?.click()
                        }
                        className="text-xs sm:text-sm"
                      >
                        Choose PDF File
                      </Button>
                    </div>
                  </div>

                  {selectedFiles.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm font-medium">
                        {reportType === "weekly"
                          ? "Selected DTR File:"
                          : "Selected Narrative Report File:"}
                      </p>
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 sm:p-3 bg-primary-50 border border-primary-200 rounded-lg"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-primary-600 flex-shrink-0" />
                            <span className="text-xs sm:text-sm font-medium text-primary-900 truncate">
                              {file.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                            <span className="text-xs text-primary-600">
                              {(file.size / 1024 / 1024).toFixed(1)} MB
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedFiles([])}
                              className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-primary-600 hover:text-primary-800"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
                  <Button
                    onClick={handleSubmitReport}
                    disabled={
                      !reportContent ||
                      !reportTitle ||
                      (reportType === "weekly" &&
                        (!dateRange?.from || !dateRange?.to)) ||
                      isSubmitting ||
                      isCreating ||
                      isCreatingNarrative
                    }
                    variant="outline"
                    className="border border-primary-500 bg-primary-50 text-primary-700 transition-all duration-300 hover:border-primary-400 hover:bg-primary-50/50 flex-1 sm:flex-none text-sm"
                  >
                    <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    {isSubmitting || isCreating || isCreatingNarrative
                      ? editingReportId
                        ? "Resubmitting..."
                        : "Submitting..."
                      : editingReportId
                      ? "Resubmit Report"
                      : "Submit Report"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingReportId(null);
                      setReportTitle("");
                      setReportContent("");
                      setSelectedFiles([]);
                      setDateRange({ from: undefined, to: undefined });
                      setHoursLogged("");
                      setReportType("weekly");
                    }}
                    className="border border-gray-300 text-gray-700 transition-all duration-300 hover:border-primary-400 hover:bg-primary-50/50 flex-1 sm:flex-none text-sm"
                  >
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Report History */}
          <div className="space-y-4 sm:space-y-6">
            <Card className="border border-primary-200 shadow-sm">
              <CardHeader className="pb-3 sm:pb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                    Report History
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <Select
                      value={reportTypeFilter}
                      onValueChange={(value: ReportType | "all") =>
                        setReportTypeFilter(value)
                      }
                    >
                      <SelectTrigger className="w-32 sm:w-40 text-sm">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="narrative">Narrative</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                {submittedReports.length === 0 ? (
                  <p className="text-xs sm:text-sm text-gray-500 text-center py-3 sm:py-4">
                    No reports submitted yet
                  </p>
                ) : (
                  submittedReports.map((report: any) => (
                    <div
                      key={report.id}
                      className="border border-primary-200 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-xs sm:text-sm leading-tight">
                            {report.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {report.type === "weekly"
                                ? "Weekly"
                                : "Narrative"}
                            </Badge>
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-primary-50 text-primary-700 text-xs"
                        >
                          {report.status}
                        </Badge>
                      </div>

                      <div className="space-y-1 sm:space-y-2 text-xs text-gray-600">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Calendar className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">
                            Submitted:{" "}
                            {report.submittedDate
                              ? new Date(
                                  report.submittedDate
                                ).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>
                        {report.dueDate && (
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">
                              Due:{" "}
                              {new Date(report.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {report.startDate && report.endDate ? (
                          <div className="flex items-center gap-1 sm:gap-2">
                            <FileText className="w-3 h-3 flex-shrink-0" />
                            <span>
                              {format(
                                new Date(report.startDate),
                                "MMM dd, yyyy"
                              )}{" "}
                              -{" "}
                              {format(new Date(report.endDate), "MMM dd, yyyy")}
                            </span>
                          </div>
                        ) : report.weekNumber ? (
                          <div className="flex items-center gap-1 sm:gap-2">
                            <FileText className="w-3 h-3 flex-shrink-0" />
                            <span>Week: {report.weekNumber}</span>
                          </div>
                        ) : null}
                      </div>

                      {report.feedback && (
                        <div className="bg-gray-50 p-2 rounded text-xs">
                          <p className="font-medium text-gray-900 mb-1">
                            Feedback:
                          </p>
                          <p className="text-gray-600 line-clamp-2">
                            {report.feedback}
                          </p>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full sm:w-auto text-xs border border-gray-300 text-gray-700 transition-all duration-300 hover:border-primary-400 hover:bg-primary-50/50"
                          onClick={() => handleViewReport(report.id)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        {report.fileUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full sm:w-auto text-xs border border-gray-300 text-gray-700 transition-all duration-300 hover:border-primary-400 hover:bg-primary-50/50"
                            onClick={() =>
                              handleDownloadReport(
                                report.fileUrl,
                                getFileNameFromUrl(report.fileUrl)
                              )
                            }
                          >
                            <Download className="w-3 h-3 mr-1" />
                            <span className="hidden xs:inline">
                              {report.type === "weekly"
                                ? "Download DTR"
                                : "Download Report"}
                            </span>
                            <span className="xs:hidden">Download</span>
                          </Button>
                        )}
                        {report.status === "rejected" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full sm:w-auto text-xs border border-red-300 text-red-700 transition-all duration-300 hover:border-red-400 hover:bg-red-50/50"
                            onClick={() => startEditReport(report)}
                          >
                            <Upload className="w-3 h-3 mr-1" />
                            Edit &amp; Resubmit
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border border-primary-200 shadow-sm">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-base sm:text-lg">
                  Report Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm">Total Submitted</span>
                  <Badge
                    variant="secondary"
                    className="bg-primary-50 text-primary-700 text-xs"
                  >
                    {statsData?.total || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm">Approved</span>
                  <Badge
                    variant="secondary"
                    className="bg-primary-50 text-primary-700 text-xs"
                  >
                    {statsData?.approved || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm">Pending</span>
                  <Badge
                    variant="secondary"
                    className="bg-primary-50 text-primary-700 text-xs"
                  >
                    {statsData?.submitted || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm">Rejected</span>
                  <Badge
                    variant="secondary"
                    className="bg-primary-50 text-primary-700 text-xs"
                  >
                    {statsData?.rejected || 0}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* View Report Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[95vw] sm:w-[90vw] sm:max-w-2xl md:max-w-4xl h-[95vh] max-h-[95vh] overflow-hidden flex flex-col p-0 sm:p-6">
          <DialogHeader className="px-4 sm:px-0 py-4 sm:py-0 pb-3 sm:pb-4 flex-shrink-0">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              Report Details
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              View your submitted report and DTR file
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="flex-1 overflow-y-auto px-4 sm:px-0">
              <div className="space-y-4 sm:space-y-6 pb-4">
                {/* Report Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                  <div className="space-y-2 min-w-0 flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold break-words">
                      {selectedReport.title}
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">
                          Submitted:{" "}
                          {selectedReport.submittedDate
                            ? new Date(
                                selectedReport.submittedDate
                              ).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                      {selectedReport.startDate && selectedReport.endDate ? (
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span>
                            {format(
                              new Date(selectedReport.startDate),
                              "MMM dd, yyyy"
                            )}{" "}
                            -{" "}
                            {format(
                              new Date(selectedReport.endDate),
                              "MMM dd, yyyy"
                            )}
                          </span>
                        </div>
                      ) : selectedReport.weekNumber ? (
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span>Week: {selectedReport.weekNumber}</span>
                        </div>
                      ) : null}
                      {selectedReport.hoursLogged && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span>Hours: {selectedReport.hoursLogged}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`text-xs sm:text-sm flex-shrink-0 ${
                      selectedReport.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : selectedReport.status === "submitted"
                        ? "bg-blue-100 text-blue-800"
                        : selectedReport.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {selectedReport.status}
                  </Badge>
                </div>

                {/* Report Content */}
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                      Report Content
                    </h4>
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap">
                        {selectedReport.content || "No content provided"}
                      </p>
                    </div>
                  </div>

                  {/* Activities, Learnings, Challenges */}
                  {(selectedReport.activities ||
                    selectedReport.learnings ||
                    selectedReport.challenges) && (
                    <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
                      {selectedReport.activities && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 text-xs sm:text-sm">
                            Activities
                          </h4>
                          <div className="bg-primary-50 p-3 rounded-lg">
                            <p className="text-xs sm:text-sm text-gray-700 break-words">
                              {selectedReport.activities}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedReport.learnings && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 text-xs sm:text-sm">
                            Learnings
                          </h4>
                          <div className="bg-primary-50 p-3 rounded-lg">
                            <p className="text-xs sm:text-sm text-gray-700 break-words">
                              {selectedReport.learnings}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedReport.challenges && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 text-xs sm:text-sm">
                            Challenges
                          </h4>
                          <div className="bg-primary-50 p-3 rounded-lg">
                            <p className="text-xs sm:text-sm text-gray-700 break-words">
                              {selectedReport.challenges}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Report File */}
                  {selectedReport.fileUrl && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                        {selectedReport.type === "weekly"
                          ? "Weekly DTR File"
                          : "Narrative Report File"}
                      </h4>
                      <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 text-sm sm:text-base break-words">
                                {getFileNameFromUrl(selectedReport.fileUrl)}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-500">
                                PDF Document{" "}
                                {selectedReport.startDate &&
                                selectedReport.endDate ? (
                                  <>
                                    •{" "}
                                    {format(
                                      new Date(selectedReport.startDate),
                                      "MMM dd, yyyy"
                                    )}{" "}
                                    -{" "}
                                    {format(
                                      new Date(selectedReport.endDate),
                                      "MMM dd, yyyy"
                                    )}
                                  </>
                                ) : selectedReport.weekNumber ? (
                                  <>• Week {selectedReport.weekNumber}</>
                                ) : (
                                  <>• Unknown</>
                                )}
                              </p>
                              <p className="text-xs text-gray-400 font-mono break-all">
                                {getFullFileUrl(selectedReport.fileUrl)}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col xs:flex-row gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (selectedReport.fileUrl) {
                                  window.open(
                                    getFullFileUrl(selectedReport.fileUrl),
                                    "_blank"
                                  );
                                }
                              }}
                              className="flex items-center justify-center gap-1 text-xs h-8"
                            >
                              <Eye className="w-3 h-3" />
                              Preview
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                selectedReport.fileUrl &&
                                handleDownloadReport(
                                  selectedReport.fileUrl,
                                  getFileNameFromUrl(selectedReport.fileUrl)
                                )
                              }
                              className="flex items-center justify-center gap-1 text-xs h-8"
                            >
                              <Download className="w-3 h-3" />
                              <span className="hidden xs:inline">
                                {selectedReport.type === "weekly"
                                  ? "Download DTR"
                                  : "Download Report"}
                              </span>
                              <span className="xs:hidden">Download</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Feedback */}
                  {selectedReport.feedback && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                        Instructor Feedback
                      </h4>
                      <div className="bg-primary-50 border border-primary-200 p-3 sm:p-4 rounded-lg">
                        <p className="text-xs sm:text-sm text-gray-700">
                          {selectedReport.feedback}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Rating */}
                  {selectedReport.rating && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                        Rating
                      </h4>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 sm:w-5 sm:h-5 ${
                                i < selectedReport.rating!
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-xs sm:text-sm text-gray-600">
                          {selectedReport.rating}/5
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
