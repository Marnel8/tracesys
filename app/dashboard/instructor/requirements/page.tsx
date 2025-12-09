"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { Textarea } from "@/components/ui/textarea";
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
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  FileText,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  MessageSquare,
  MoreHorizontal,
  Calendar,
  User,
  Clock,
  FileImage,
  File,
} from "lucide-react";
import {
  useApproveRequirement,
  useRejectRequirement,
  useRequirements,
} from "@/hooks/requirement";
import { useRequirementTemplates } from "@/hooks/requirement-template/useRequirementTemplate";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { InstructorStatsCard } from "@/components/instructor-stats-card";
import { Switch } from "@/components/ui/switch";
import {
  useAuth,
  useUpdateAllowLoginWithoutRequirements,
} from "@/hooks/auth/useAuth";
import { toast } from "sonner";

const humanizeBytes = (bytes?: number | null) => {
  if (!bytes && bytes !== 0) return "-";
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
};

const resolveFileUrl = (url?: string | null) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    (typeof window !== "undefined" ? window.location.origin : "");
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${base}${path}`;
};

export default function RequirementsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("submitted");
  const [selectedRequirement, setSelectedRequirement] = useState<any>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewComment, setReviewComment] = useState("");
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const queryClient = useQueryClient();

  const { user } = useAuth();
  const updateAllowLoginWithoutRequirements =
    useUpdateAllowLoginWithoutRequirements();

  // Use state to prevent hydration mismatch - start with false and sync after mount
  const [allowLoginWithoutRequirements, setAllowLoginWithoutRequirements] =
    useState(false);

  // Sync with user data after mount to prevent hydration mismatch
  useEffect(() => {
    if (user) {
      setAllowLoginWithoutRequirements(
        (user as any)?.allowLoginWithoutRequirements ?? false
      );
    }
  }, [user]);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(id);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [selectedStatus, debouncedSearch]);

  const { data, refetch } = useRequirements({
    page,
    limit,
    status: selectedStatus as any,
    search: debouncedSearch || undefined,
  });

  // Refetch requirements when page becomes visible (e.g., after submitting from another tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        queryClient.invalidateQueries({ queryKey: ["requirements"] });
        refetch();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [queryClient, refetch]);

  // Also refetch when component mounts to ensure fresh data
  useEffect(() => {
    refetch();
  }, [refetch]);
  // Stats: fetch counts by status using minimal payload (limit=1)
  const { data: allStats } = useRequirements({
    page: 1,
    limit: 1,
    status: "all" as any,
  });
  const { data: submittedStats } = useRequirements({
    page: 1,
    limit: 1,
    status: "submitted" as any,
  });
  const { data: approvedStats } = useRequirements({
    page: 1,
    limit: 1,
    status: "approved" as any,
  });
  const { data: rejectedStats } = useRequirements({
    page: 1,
    limit: 1,
    status: "rejected" as any,
  });
  const { data: inProgressStats } = useRequirements({
    page: 1,
    limit: 1,
    status: "in-progress" as any,
  });
  const { data: templatesResp } = useRequirementTemplates({
    page: 1,
    limit: 1000,
    status: "active",
  });
  // Fetch all requirements to calculate per-student counts
  const { data: allRequirementsData } = useRequirements({
    page: 1,
    limit: 10000, // High limit to get all requirements for counting
    status: "all" as any,
  });
  const templatesCount = templatesResp?.requirementTemplates?.length ?? 0;
  const submittedCount = submittedStats?.pagination.totalItems ?? 0;
  const approvedCount = approvedStats?.pagination.totalItems ?? 0;
  const rejectedCount = rejectedStats?.pagination.totalItems ?? 0;
  const inProgressCount = inProgressStats?.pagination.totalItems ?? 0;
  // Treat "total submissions" as items that moved beyond initial pending state
  const totalSubmissionsCount =
    submittedCount + approvedCount + rejectedCount + inProgressCount;
  const items = data?.requirements ?? [];
  const pagination = data?.pagination;
  const currentPage = pagination?.currentPage ?? page;
  const totalPages = pagination?.totalPages ?? 1;
  const itemsPerPage = pagination?.itemsPerPage ?? limit;

  const reviewableStatuses = useMemo(() => ["submitted", "in-progress"], []);

  // Backend now filters by files when status is "all" for instructors
  // So we can use items directly without additional filtering
  const filteredItems = items;

  const totalItems = filteredItems.length;
  const startIndex =
    totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = totalItems === 0 ? 0 : startIndex + filteredItems.length - 1;

  // Calculate approved/total requirements per student
  const studentRequirementCounts = useMemo(() => {
    const allRequirements = allRequirementsData?.requirements ?? [];
    const countsMap = new Map<string, { approved: number; total: number }>();

    allRequirements.forEach((req) => {
      const studentId = req.studentId;
      if (!studentId) return;

      if (!countsMap.has(studentId)) {
        countsMap.set(studentId, { approved: 0, total: 0 });
      }

      const counts = countsMap.get(studentId)!;
      const isApproved = req.status?.toLowerCase() === "approved";
      if (isApproved) counts.approved += 1;
    });

    // Apply template-based denominator
    for (const [studentId, counts] of countsMap.entries()) {
      const denom = templatesCount > 0 ? templatesCount : counts.approved;
      counts.total = denom;
      counts.approved = Math.min(counts.approved, denom);
      countsMap.set(studentId, counts);
    }

    return countsMap;
  }, [allRequirementsData, templatesCount]);

  const approve = useApproveRequirement();
  const reject = useRejectRequirement();

  const handleApprove = (id: string) => {
    approve.mutate({ id });
  };

  const handleReturn = (id: string, comment: string) => {
    if (!comment?.trim()) {
      toast.error("Please provide a rejection reason.");
      return;
    }
    reject.mutate({ id, reason: comment.trim() });
    setIsReviewDialogOpen(false);
    setReviewComment("");
  };

  const handlePreview = (requirement: any) => {
    setPreviewFile(requirement);
    setIsPreviewDialogOpen(true);
  };

  const handleToggleAllowLoginWithoutRequirements = async (
    checked: boolean
  ) => {
    try {
      await updateAllowLoginWithoutRequirements.mutateAsync({
        allowLoginWithoutRequirements: checked,
      });
      // Update local state immediately for better UX
      setAllowLoginWithoutRequirements(checked);
      toast.success(
        checked
          ? "Students can now login without completing requirements"
          : "Students must submit requirements before logging in"
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to update setting");
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return <FileText className="w-4 h-4" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "webp":
        return <FileImage className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  const canPreview = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    const previewableTypes = [
      "pdf",
      "jpg",
      "jpeg",
      "png",
      "gif",
      "webp",
      "txt",
      "doc",
      "docx",
    ];
    return previewableTypes.includes(extension || "");
  };

  const renderFilePreview = () => {
    if (!previewFile) return null;

    const extension = previewFile.fileName.split(".").pop()?.toLowerCase();
    const fileUrl = resolveFileUrl(previewFile.fileUrl);

    switch (extension) {
      case "pdf":
        return (
          <iframe
            src={fileUrl}
            className="w-full h-96 border rounded"
            title={`Preview of ${previewFile.fileName}`}
          />
        );
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "webp":
        return (
          <div className="flex justify-center">
            <img
              src={fileUrl}
              alt={`Preview of ${previewFile.fileName}`}
              className="max-w-full max-h-96 object-contain rounded"
            />
          </div>
        );
      case "doc":
      case "docx": {
        const encoded = encodeURIComponent(fileUrl);
        const officeViewer = `https://view.officeapps.live.com/op/embed.aspx?src=${encoded}`;
        return (
          <iframe
            src={officeViewer}
            className="w-full h-96 border rounded"
            title={`Preview of ${previewFile.fileName}`}
          />
        );
      }
      case "txt":
        return (
          <div className="w-full h-96 border rounded p-4 overflow-auto bg-gray-50">
            <pre className="whitespace-pre-wrap text-sm">
              {/* This would need to fetch the text content */}
              Loading text content...
            </pre>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-96 text-gray-500">
            <File className="w-16 h-16 mb-4" />
            <p>Preview not available for this file type</p>
            <p className="text-sm">Please download to view the file</p>
          </div>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800 capitalize";
      case "pending":
        return "bg-yellow-100 text-yellow-800 capitalize";
      case "rejected":
        return "bg-red-100 text-red-800 capitalize";
      case "submitted":
        return "bg-blue-100 text-blue-800 capitalize";
      case "in-progress":
        return "bg-purple-100 text-purple-800 capitalize";
      default:
        return "bg-gray-100 text-gray-800 capitalize";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 capitalize";
      case "medium":
        return "bg-yellow-100 text-yellow-800 capitalize";
      case "low":
        return "bg-green-100 text-green-800 capitalize";
      case "urgent":
        return "bg-rose-100 text-rose-800 capitalize";
      default:
        return "bg-gray-100 text-gray-800 capitalize";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Requirements Review
            </h1>
            <p className="text-gray-600">
              Review and approve student requirement submissions
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex flex-col">
              <Label
                htmlFor="allow-login-switch"
                className="text-sm font-medium text-gray-700"
              >
                Allow students to login without completing requirements
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                When enabled, all your students can login even with zero
                requirements submitted
              </p>
            </div>
            <Switch
              id="allow-login-switch"
              checked={allowLoginWithoutRequirements}
              onCheckedChange={handleToggleAllowLoginWithoutRequirements}
              disabled={updateAllowLoginWithoutRequirements.isPending}
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <InstructorStatsCard
          icon={Clock}
          label="Pending Review"
          value={submittedStats?.pagination.totalItems ?? 0}
          helperText="Awaiting approval"
        />
        <InstructorStatsCard
          icon={CheckCircle}
          label="Approved"
          value={approvedStats?.pagination.totalItems ?? 0}
          helperText="Cleared submissions"
          trend={
            approvedStats?.pagination.totalItems
              ? {
                  label: `${approvedStats.pagination.totalItems} total`,
                  variant: "positive",
                }
              : undefined
          }
        />
        <InstructorStatsCard
          icon={XCircle}
          label="Rejected"
          value={rejectedStats?.pagination.totalItems ?? 0}
          helperText="Needs revision"
          trend={
            rejectedStats?.pagination.totalItems
              ? { label: "Follow up required", variant: "negative" }
              : undefined
          }
        />
        <InstructorStatsCard
          icon={FileText}
          label="Total Submissions"
          value={totalSubmissionsCount}
          helperText="Submitted, in-progress, approved, or rejected"
        />
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Requirement Submissions</CardTitle>
          <CardDescription>
            Review and manage student requirement submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by requirement, student name, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Requirements Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Requirement</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((req) => {
                  const normalizedStatus = (req.status || "").toLowerCase();
                  const canReview =
                    reviewableStatuses.includes(normalizedStatus);
                  return (
                    <TableRow key={req.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="font-medium text-gray-900">
                              {`${req.student?.firstName ?? ""} ${
                                req.student?.lastName ?? ""
                              }`.trim()}
                            </div>
                            <div className="text-sm text-gray-600">
                              {req.student?.email ?? req.student?.id}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const studentId = req.studentId;
                          const counts = studentId
                            ? studentRequirementCounts.get(studentId)
                            : null;
                          if (!counts)
                            return <span className="text-gray-400">-</span>;
                          return (
                            <div className="font-medium">
                              <span className="text-green-600">
                                {counts.approved}
                              </span>
                              <span className="text-gray-400">/</span>
                              <span className="text-gray-600">
                                {counts.total}
                              </span>
                            </div>
                          );
                        })()}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{req.title}</div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[220px]">
                          <div
                            className="text-sm font-medium truncate"
                            title={req.fileName ?? undefined}
                          >
                            {req.fileName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {humanizeBytes(req.fileSize)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {formatDate(req.submittedDate || req.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={getPriorityColor(req.priority)}
                        >
                          {req.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={getStatusColor(req.status)}
                        >
                          {req.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  const url = resolveFileUrl(req.fileUrl);
                                  if (!url) {
                                    toast.error("File URL not available");
                                    return;
                                  }
                                  window.open(url, "_blank");
                                }}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              {req.fileName && canPreview(req.fileName) && (
                                <DropdownMenuItem
                                  onClick={() => handlePreview(req)}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  Preview
                                </DropdownMenuItem>
                              )}
                              {canReview && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleApprove(req.id)}
                                    className="text-green-600"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedRequirement(req);
                                      setIsReviewDialogOpen(true);
                                    }}
                                    className="text-red-600"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Return
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No submitted requirements found for review.
              </p>
            </div>
          )}
          {/* Pagination Controls - counts + buttons aligned to end */}
          <div className="flex items-center justify-between mt-4 px-2">
            <span className="text-sm text-gray-600">
              {startIndex}-{endIndex} of {totalItems}
            </span>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    className={
                      currentPage <= 1
                        ? "pointer-events-none opacity-50"
                        : undefined
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setPage(currentPage - 1);
                    }}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    className={
                      currentPage >= totalPages
                        ? "pointer-events-none opacity-50"
                        : undefined
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) setPage(currentPage + 1);
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      {/* File Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewFile && getFileIcon(previewFile.fileName)}
              File Preview: {previewFile?.fileName}
            </DialogTitle>
            <DialogDescription>
              Student:{" "}
              {previewFile &&
                `${previewFile.student?.firstName ?? ""} ${
                  previewFile.student?.lastName ?? ""
                }`.trim()}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto">{renderFilePreview()}</div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsPreviewDialogOpen(false)}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                const url = resolveFileUrl(previewFile?.fileUrl);
                if (!url) {
                  toast.error("File URL not available");
                  return;
                }
                window.open(url, "_blank");
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return Requirement Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return Requirement</DialogTitle>
            <DialogDescription>
              Provide feedback for why this requirement is being returned.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Requirement: {selectedRequirement?.title}</Label>
              <p className="text-sm text-gray-600">
                Student:{" "}
                {`${selectedRequirement?.student?.firstName ?? ""} ${
                  selectedRequirement?.student?.lastName ?? ""
                }`.trim()}
              </p>
            </div>
            <div>
              <Label htmlFor="comment">Feedback Comment</Label>
              <Textarea
                id="comment"
                placeholder="Explain why this requirement needs to be resubmitted..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsReviewDialogOpen(false);
                setReviewComment("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                handleReturn(selectedRequirement?.id, reviewComment);
              }}
            >
              Return Requirement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
