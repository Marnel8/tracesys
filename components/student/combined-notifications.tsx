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
import { Bell, Check, MessageSquare, FileText, Eye } from "lucide-react";
import { useStudentAnnouncementNotifications } from "@/hooks/announcement/useStudentAnnouncementNotifications";
import { useStudentTemplateNotifications } from "@/hooks/requirement-template/useStudentTemplateNotifications";
import { useStudentRequirementCommentNotifications } from "@/hooks/requirement/useStudentRequirementCommentNotifications";
import { useStudentReportViewNotifications } from "@/hooks/report/useStudentReportViewNotifications";
import { useAuth } from "@/hooks/auth/useAuth";
import type { Announcement } from "@/data/announcements";
import type { RequirementTemplate } from "@/hooks/requirement-template/useRequirementTemplate";
import type { RequirementComment } from "@/hooks/requirement/useRequirement";
import type { ReportViewNotification } from "@/hooks/report/useStudentReportViewNotifications";

function getAnnouncementPriorityColor(priority: Announcement["priority"]) {
  switch (priority) {
    case "High":
      return "bg-red-100 text-red-800";
    case "Medium":
      return "bg-yellow-100 text-yellow-800";
    case "Low":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  // Handle future dates (edge case)
  if (diffInMinutes < 0) return "Just now";

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
}

interface CombinedNotificationsProps {
  studentId?: string;
}

export function CombinedNotifications({
  studentId,
}: CombinedNotificationsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const normalizedUser: any = (user as any)?.data ?? user;
  const effectiveStudentId = studentId || normalizedUser?.id;
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("announcements");

  // Announcement notifications
  const {
    announcements,
    unreadAnnouncements,
    unreadCount: announcementUnreadCount,
    isLoading: isLoadingAnnouncements,
    error: announcementError,
    markAsRead: markAnnouncementAsRead,
    markAllAsRead: markAllAnnouncementsAsRead,
  } = useStudentAnnouncementNotifications(effectiveStudentId);

  // Template notifications
  const {
    templates,
    unreadTemplates,
    unreadCount: templateUnreadCount,
    isLoading: isLoadingTemplates,
    error: templateError,
    markAsRead: markTemplateAsRead,
    markAllAsRead: markAllTemplatesAsRead,
  } = useStudentTemplateNotifications(effectiveStudentId);

  // Comment notifications
  const {
    comments,
    unreadComments,
    unreadCount: commentUnreadCount,
    isLoading: isLoadingComments,
    error: commentError,
    markAsRead: markCommentAsRead,
    markAllAsRead: markAllCommentsAsRead,
  } = useStudentRequirementCommentNotifications(effectiveStudentId);

  // Report view notifications (when instructor views student's report)
  const {
    views: reportViews,
    unreadViews,
    unreadCount: reportViewUnreadCount,
    isLoading: isLoadingReportViews,
    error: reportViewError,
    markAsRead: markReportViewAsRead,
    markAllAsRead: markAllReportViewsAsRead,
  } = useStudentReportViewNotifications(effectiveStudentId);

  // Create sets of unread IDs for quick lookup
  const unreadAnnouncementIds = new Set(unreadAnnouncements.map((a) => a.id));
  const unreadTemplateIds = new Set(unreadTemplates.map((t) => t.id));
  const unreadCommentIds = new Set(unreadComments.map((c) => c.id));
  const unreadReportViewIds = new Set(unreadViews.map((v) => v.id));

  // Combined unread count
  const totalUnreadCount =
    announcementUnreadCount +
    templateUnreadCount +
    commentUnreadCount +
    reportViewUnreadCount;

  const handleAnnouncementClick = (announcement: Announcement) => {
    markAnnouncementAsRead(announcement.id);
    setIsOpen(false);
    router.push("/dashboard/student");
  };

  const handleTemplateClick = (template: RequirementTemplate) => {
    markTemplateAsRead(template.id);
    setIsOpen(false);
    router.push("/dashboard/student/requirements");
  };

  const handleViewAllAnnouncements = () => {
    setIsOpen(false);
    router.push("/dashboard/student");
  };

  const handleViewAllTemplates = () => {
    setIsOpen(false);
    router.push("/dashboard/student/requirements");
  };

  const handleCommentClick = (comment: RequirementComment) => {
    markCommentAsRead(comment.id);
    setIsOpen(false);
    router.push("/dashboard/student/requirements");
  };

  const handleReportViewClick = (view: ReportViewNotification) => {
    markReportViewAsRead(view.id);
    setIsOpen(false);
    // For now, route to student dashboard; can be adjusted to a specific reports page if available
    router.push("/dashboard/student");
  };

  const handleViewAllReportViews = () => {
    setIsOpen(false);
    router.push("/dashboard/student");
  };

  const handleViewAllComments = () => {
    setIsOpen(false);
    router.push("/dashboard/student/requirements");
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
      <DropdownMenuContent
        align="end"
        className="w-[90vw] sm:w-[400px] md:w-[450px] max-w-[90vw]"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="p-3 border-b">
            <TabsList className="grid w-full grid-cols-4 gap-1">
              <TabsTrigger
                value="announcements"
                className="text-[10px] sm:text-xs px-1 sm:px-2"
              >
                <span className="truncate">Announcements</span>
                {announcementUnreadCount > 0 && (
                  <Badge className="ml-1 h-4 px-1 sm:px-1.5 text-[10px] sm:text-xs bg-red-500">
                    {announcementUnreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="templates"
                className="text-[10px] sm:text-xs px-1 sm:px-2"
              >
                <span className="truncate">Templates</span>
                {templateUnreadCount > 0 && (
                  <Badge className="ml-1 h-4 px-1 sm:px-1.5 text-[10px] sm:text-xs bg-red-500">
                    {templateUnreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="comments"
                className="text-[10px] sm:text-xs px-1 sm:px-2"
              >
                <span className="truncate">Comments</span>
                {commentUnreadCount > 0 && (
                  <Badge className="ml-1 h-4 px-1 sm:px-1.5 text-[10px] sm:text-xs bg-red-500">
                    {commentUnreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="text-[10px] sm:text-xs px-1 sm:px-2"
              >
                <span className="truncate">Reports</span>
                {reportViewUnreadCount > 0 && (
                  <Badge className="ml-1 h-4 px-1 sm:px-1.5 text-[10px] sm:text-xs bg-red-500">
                    {reportViewUnreadCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="announcements" className="mt-0">
            <div className="flex items-center justify-between p-3 border-b">
              <h3 className="font-semibold text-sm">Announcements</h3>
              {announcementUnreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAnnouncementsAsRead}
                  className="h-7 text-xs"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>

            <ScrollArea className="h-96">
              {announcementError ? (
                <div className="p-4 text-center text-red-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-red-300" />
                  <p className="text-sm font-medium mb-2">
                    Failed to load announcements
                  </p>
                  <p className="text-xs text-gray-500">
                    {(announcementError as any)?.response?.data?.message ||
                      (announcementError as any)?.message ||
                      "Please try again later"}
                  </p>
                </div>
              ) : isLoadingAnnouncements ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
                  </div>
                </div>
              ) : announcements.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No announcements</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {announcements.map((announcement) => {
                    const isUnread = unreadAnnouncementIds.has(announcement.id);
                    return (
                      <div
                        key={announcement.id}
                        className={`p-3 hover:bg-gray-50 cursor-pointer border-l-2 ${
                          isUnread
                            ? "border-primary-500 bg-primary-50/30"
                            : "border-transparent bg-gray-50/50"
                        }`}
                        onClick={() => handleAnnouncementClick(announcement)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            <MessageSquare className="w-4 h-4 text-orange-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {announcement.title}
                              </p>
                            </div>
                            <p className="text-xs text-gray-700 mb-2 line-clamp-2">
                              {announcement.content}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400">
                                {formatTimestamp(announcement.createdAt)}
                              </span>
                              {announcement.isPinned && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs bg-yellow-100 text-yellow-800"
                                >
                                  Pinned
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>

            {announcements.length > 0 && (
              <div className="p-3 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  size="sm"
                  onClick={handleViewAllAnnouncements}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View All Announcements
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="templates" className="mt-0">
            <div className="flex items-center justify-between p-3 border-b">
              <h3 className="font-semibold text-sm">Templates</h3>
              {templateUnreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllTemplatesAsRead}
                  className="h-7 text-xs"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>

            <ScrollArea className="h-96">
              {templateError ? (
                <div className="p-4 text-center text-red-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-red-300" />
                  <p className="text-sm font-medium mb-2">
                    Failed to load templates
                  </p>
                  <p className="text-xs text-gray-500">
                    {(templateError as any)?.response?.data?.message ||
                      (templateError as any)?.message ||
                      "Please try again later"}
                  </p>
                </div>
              ) : isLoadingTemplates ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
                  </div>
                </div>
              ) : templates.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No templates</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {templates.map((template) => {
                    const isUnread = unreadTemplateIds.has(template.id);
                    return (
                      <div
                        key={template.id}
                        className={`p-3 hover:bg-gray-50 cursor-pointer border-l-2 ${
                          isUnread
                            ? "border-blue-500 bg-blue-50/30"
                            : "border-transparent bg-gray-50/50"
                        }`}
                        onClick={() => handleTemplateClick(template)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            <FileText className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {template.title}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge
                                variant="outline"
                                className="text-xs capitalize"
                              >
                                {template.category}
                              </Badge>
                              {template.isRequired && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs bg-red-100 text-red-800"
                                >
                                  Required
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-700 mb-2 line-clamp-2">
                              {template.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400">
                                {formatTimestamp(template.createdAt)}
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

            {templates.length > 0 && (
              <div className="p-3 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  size="sm"
                  onClick={handleViewAllTemplates}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View All Templates
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="comments" className="mt-0">
            <div className="flex items-center justify-between p-3 border-b">
              <h3 className="font-semibold text-sm">Comments</h3>
              {commentUnreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllCommentsAsRead}
                  className="h-7 text-xs"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>

            <ScrollArea className="h-96">
              {commentError ? (
                <div className="p-4 text-center text-red-500">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-red-300" />
                  <p className="text-sm font-medium mb-2">
                    Failed to load comments
                  </p>
                  <p className="text-xs text-gray-500">
                    {(commentError as any)?.response?.data?.message ||
                      (commentError as any)?.message ||
                      "Please try again later"}
                  </p>
                </div>
              ) : isLoadingComments ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
                  </div>
                </div>
              ) : comments.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No comments</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {comments.map((comment) => {
                    const isUnread = unreadCommentIds.has(comment.id);
                    return (
                      <div
                        key={comment.id}
                        className={`p-3 hover:bg-gray-50 cursor-pointer border-l-2 ${
                          isUnread
                            ? "border-green-500 bg-green-50/30"
                            : "border-transparent bg-gray-50/50"
                        }`}
                        onClick={() => handleCommentClick(comment)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            <MessageSquare className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {comment.requirement?.title || "Requirement"}
                              </p>
                              <span className="text-xs text-gray-500">
                                {comment.user?.firstName}{" "}
                                {comment.user?.lastName}
                              </span>
                            </div>
                            <p className="text-xs text-gray-700 mb-2 line-clamp-2">
                              {comment.content}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400">
                                {formatTimestamp(comment.createdAt)}
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

            {comments.length > 0 && (
              <div className="p-3 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  size="sm"
                  onClick={handleViewAllComments}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View All Comments
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reports" className="mt-0">
            <div className="flex items-center justify-between p-3 border-b">
              <h3 className="font-semibold text-sm">Reports</h3>
              {reportViewUnreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllReportViewsAsRead}
                  className="h-7 text-xs"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>

            <ScrollArea className="h-96">
              {reportViewError ? (
                <div className="p-4 text-center text-red-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-red-300" />
                  <p className="text-sm font-medium mb-2">
                    Failed to load report notifications
                  </p>
                  <p className="text-xs text-gray-500">
                    {(reportViewError as any)?.response?.data?.message ||
                      (reportViewError as any)?.message ||
                      "Please try again later"}
                  </p>
                </div>
              ) : isLoadingReportViews ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
                  </div>
                </div>
              ) : reportViews.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No report notifications</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {reportViews.map((view) => {
                    const isUnread = unreadReportViewIds.has(view.id);
                    const instructorName = view.instructor
                      ? `${view.instructor.firstName} ${view.instructor.lastName}`
                      : "Your instructor";
                    const reportType =
                      view.report?.type === "weekly"
                        ? "weekly report"
                        : view.report?.type === "narrative"
                        ? "narrative report"
                        : "report";
                    const reportTitle =
                      view.report?.title || `Your ${reportType}`;

                    return (
                      <div
                        key={view.id}
                        className={`p-3 hover:bg-gray-50 cursor-pointer border-l-2 ${
                          isUnread
                            ? "border-purple-500 bg-purple-50/30"
                            : "border-transparent bg-gray-50/50"
                        }`}
                        onClick={() => handleReportViewClick(view)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            <Eye className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {reportTitle}
                              </p>
                            </div>
                            <p className="text-xs text-gray-700 mb-2 line-clamp-2">
                              {instructorName} reviewed your {reportType}.
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400">
                                {formatTimestamp(view.createdAt)}
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

            {reportViews.length > 0 && (
              <div className="p-3 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  size="sm"
                  onClick={handleViewAllReportViews}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View All Reports
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
