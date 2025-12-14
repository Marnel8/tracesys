"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Bell,
  Check,
  FileText,
  Eye,
} from "lucide-react";
import { useInstructorReportNotifications } from "@/hooks/report/useInstructorReportNotifications";
import { useInstructorRequirementNotifications } from "@/hooks/requirement/useInstructorRequirementNotifications";
import { useAuth } from "@/hooks/auth/useAuth";
import type { Report } from "@/hooks/report/useReport";
import type { Requirement } from "@/hooks/requirement/useRequirement";

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  // Handle future dates (edge case)
  if (diffInMinutes < 0) return "Just now";

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
}

function getReportTypeLabel(type: string) {
  switch (type) {
    case "weekly":
      return "Weekly";
    case "monthly":
      return "Monthly";
    case "final":
      return "Final";
    case "narrative":
      return "Narrative";
    default:
      return type;
  }
}

function getRequirementCategoryColor(category: string) {
  switch (category) {
    case "health":
      return "bg-red-100 text-red-800";
    case "reports":
      return "bg-blue-100 text-blue-800";
    case "training":
      return "bg-green-100 text-green-800";
    case "academic":
      return "bg-purple-100 text-purple-800";
    case "evaluation":
      return "bg-yellow-100 text-yellow-800";
    case "legal":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

interface InstructorNotificationsProps {
  instructorId?: string;
}

export function InstructorNotifications({
  instructorId,
}: InstructorNotificationsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const normalizedUser: any = (user as any)?.data ?? user;
  const effectiveInstructorId = instructorId || normalizedUser?.id;
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("reports");

  // Report notifications
  const {
    reports,
    unreadReports,
    unreadCount: reportUnreadCount,
    isLoading: isLoadingReports,
    error: reportError,
    markAsRead: markReportAsRead,
    markAllAsRead: markAllReportsAsRead,
  } = useInstructorReportNotifications(effectiveInstructorId);

  // Requirement notifications
  const {
    requirements,
    unreadRequirements,
    unreadCount: requirementUnreadCount,
    isLoading: isLoadingRequirements,
    error: requirementError,
    markAsRead: markRequirementAsRead,
    markAllAsRead: markAllRequirementsAsRead,
  } = useInstructorRequirementNotifications(effectiveInstructorId);

  // Create sets of unread IDs for quick lookup
  const unreadReportIds = new Set(unreadReports.map((r) => r.id));
  const unreadRequirementIds = new Set(unreadRequirements.map((r) => r.id));

  // Combined unread count
  const totalUnreadCount = reportUnreadCount + requirementUnreadCount;

  const handleReportClick = (report: Report) => {
    markReportAsRead(report.id);
    setIsOpen(false);
    router.push("/dashboard/instructor/reports");
  };

  const handleRequirementClick = (requirement: Requirement) => {
    markRequirementAsRead(requirement.id);
    setIsOpen(false);
    router.push("/dashboard/instructor/requirements");
  };

  const handleViewAllReports = () => {
    setIsOpen(false);
    router.push("/dashboard/instructor/reports");
  };

  const handleViewAllRequirements = () => {
    setIsOpen(false);
    router.push("/dashboard/instructor/requirements");
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-8 w-8 sm:h-auto sm:w-auto sm:px-3 sm:py-2 p-0"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {totalUnreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 p-0 text-xs text-white flex items-center justify-center">
              {totalUnreadCount > 9 ? "9+" : totalUnreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[90vw] sm:w-[400px] md:w-[450px] max-w-[90vw]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="p-3 border-b">
            <TabsList className="grid w-full grid-cols-2 gap-1">
              <TabsTrigger value="reports" className="text-[10px] sm:text-xs px-1 sm:px-2">
                <span className="truncate">Reports</span>
                {reportUnreadCount > 0 && (
                  <Badge className="ml-1 h-4 px-1 sm:px-1.5 text-[10px] sm:text-xs bg-red-500">
                    {reportUnreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="requirements" className="text-[10px] sm:text-xs px-1 sm:px-2">
                <span className="truncate">Requirements</span>
                {requirementUnreadCount > 0 && (
                  <Badge className="ml-1 h-4 px-1 sm:px-1.5 text-[10px] sm:text-xs bg-red-500">
                    {requirementUnreadCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="reports" className="mt-0">
            <div className="flex items-center justify-between p-3 border-b">
              <h3 className="font-semibold text-sm">Report Submissions</h3>
              {reportUnreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllReportsAsRead}
                  className="h-7 text-xs"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>

            <ScrollArea className="h-96">
              {reportError ? (
                <div className="p-4 text-center text-red-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-red-300" />
                  <p className="text-sm font-medium mb-2">
                    Failed to load reports
                  </p>
                  <p className="text-xs text-gray-500">
                    {(reportError as any)?.response?.data?.message ||
                      (reportError as any)?.message ||
                      "Please try again later"}
                  </p>
                </div>
              ) : isLoadingReports ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
                  </div>
                </div>
              ) : reports.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No report submissions</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {reports.map((report) => {
                    const isUnread = unreadReportIds.has(report.id);
                    const studentName = report.student
                      ? `${report.student.firstName || ""} ${report.student.lastName || ""}`.trim() || "Student"
                      : "Student";
                    return (
                      <div
                        key={report.id}
                        className={`p-3 hover:bg-gray-50 cursor-pointer border-l-2 ${
                          isUnread
                            ? "border-blue-500 bg-blue-50/30"
                            : "border-transparent bg-gray-50/50"
                        }`}
                        onClick={() => handleReportClick(report)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            <FileText className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {report.title || "Untitled Report"}
                              </p>
                              <Badge
                                variant="outline"
                                className="text-xs"
                              >
                                {getReportTypeLabel(report.type)}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-700 mb-2 line-clamp-1">
                              {studentName} submitted a {getReportTypeLabel(report.type).toLowerCase()} report
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400">
                                {report.submittedDate
                                  ? formatTimestamp(report.submittedDate)
                                  : formatTimestamp(report.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>

            {reports.length > 0 && (
              <div className="p-3 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  size="sm"
                  onClick={handleViewAllReports}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View All Reports
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="requirements" className="mt-0">
            <div className="flex items-center justify-between p-3 border-b">
              <h3 className="font-semibold text-sm">Requirement Submissions</h3>
              {requirementUnreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllRequirementsAsRead}
                  className="h-7 text-xs"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>

            <ScrollArea className="h-96">
              {requirementError ? (
                <div className="p-4 text-center text-red-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-red-300" />
                  <p className="text-sm font-medium mb-2">
                    Failed to load requirements
                  </p>
                  <p className="text-xs text-gray-500">
                    {(requirementError as any)?.response?.data?.message ||
                      (requirementError as any)?.message ||
                      "Please try again later"}
                  </p>
                </div>
              ) : isLoadingRequirements ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
                  </div>
                </div>
              ) : requirements.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No requirement submissions</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {requirements.map((requirement) => {
                    const isUnread = unreadRequirementIds.has(requirement.id);
                    const studentName = requirement.student
                      ? `${requirement.student.firstName || ""} ${requirement.student.lastName || ""}`.trim() || "Student"
                      : "Student";
                    return (
                      <div
                        key={requirement.id}
                        className={`p-3 hover:bg-gray-50 cursor-pointer border-l-2 ${
                          isUnread
                            ? "border-purple-500 bg-purple-50/30"
                            : "border-transparent bg-gray-50/50"
                        }`}
                        onClick={() => handleRequirementClick(requirement)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            <FileText className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {requirement.title}
                              </p>
                              <Badge
                                variant="secondary"
                                className={`text-xs ${getRequirementCategoryColor(requirement.category)}`}
                              >
                                {requirement.category}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-700 mb-2 line-clamp-1">
                              {studentName} submitted {requirement.title}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400">
                                {requirement.submittedDate
                                  ? formatTimestamp(requirement.submittedDate)
                                  : formatTimestamp(requirement.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>

            {requirements.length > 0 && (
              <div className="p-3 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  size="sm"
                  onClick={handleViewAllRequirements}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View All Requirements
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

