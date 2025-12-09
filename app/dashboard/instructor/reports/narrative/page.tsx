"use client";

import { useMemo, useState, useEffect } from "react";
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
  Download,
  Eye,
  CheckCircle,
  XCircle,
  MessageSquare,
  Calendar,
  Clock,
  Star,
  FileText,
} from "lucide-react";
import { useNarrativeReports } from "@/hooks/report/useNarrativeReport";
import {
  useApproveReport,
  useRejectReport,
  Report,
} from "@/hooks/report/useReport";
import { useAuth } from "@/hooks/auth/useAuth";
import { InstructorStatsCard } from "@/components/instructor-stats-card";

export default function NarrativeReportsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [reviewRating, setReviewRating] = useState("");

  const { user } = useAuth();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const { data: reportsData, isLoading } = useNarrativeReports({
    page: 1,
    limit: 50,
    search: debouncedSearchTerm || undefined,
    status: selectedStatus as any,
  });

  const narrativeReports = useMemo(
    () => reportsData?.reports ?? [],
    [reportsData]
  );

  const stats = useMemo(() => {
    const reports = narrativeReports;
    const ratedReports = reports.filter((r: any) => r.rating);
    return {
      pending: reports.filter((r) => r.status === "submitted").length,
      approved: reports.filter((r) => r.status === "approved").length,
      returned: reports.filter((r) => r.status === "rejected").length,
      averageRating:
        ratedReports.length > 0
          ? ratedReports.reduce(
              (acc: number, r: any) => acc + (r.rating || 0),
              0
            ) / ratedReports.length
          : 0,
    };
  }, [narrativeReports]);

  const { mutate: approveReport, isPending: isApproving } = useApproveReport();
  const { mutate: rejectReport, isPending: isRejecting } = useRejectReport();

  const handleApprove = (id: string, rating: number, feedback: string) => {
    approveReport(
      { id, rating, feedback: feedback || null },
      {
        onSuccess: () => {
          setIsReviewDialogOpen(false);
          setReviewFeedback("");
          setReviewRating("");
          setSelectedReport(null);
        },
      }
    );
  };

  const handleReturn = (id: string, feedback: string) => {
    rejectReport(
      { id, reason: feedback },
      {
        onSuccess: () => {
          setIsReviewDialogOpen(false);
          setReviewFeedback("");
          setSelectedReport(null);
        },
      }
    );
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
        return "bg-green-100 text-green-800";
      case "submitted":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const getFullFileUrl = (fileUrl: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    return `${baseUrl}${fileUrl}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Narrative Reports</h1>
        <p className="text-gray-600">
          Review and evaluate student narrative reflection reports
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InstructorStatsCard
          icon={Clock}
          label="Pending Review"
          value={stats.pending}
          helperText="Awaiting evaluation"
        />
        <InstructorStatsCard
          icon={CheckCircle}
          label="Approved"
          value={stats.approved}
          helperText="Marked complete"
          trend={
            stats.approved > 0
              ? { label: `${stats.approved} cleared`, variant: "positive" }
              : undefined
          }
        />
        <InstructorStatsCard
          icon={XCircle}
          label="Returned"
          value={stats.returned}
          helperText="Needs revision"
          trend={
            stats.returned > 0
              ? { label: "Review required", variant: "negative" }
              : undefined
          }
        />
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Narrative Report Submissions</CardTitle>
          <CardDescription>
            Review and evaluate student narrative reflection reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by title, student name, or ID..."
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
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reports Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Loading reports...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : narrativeReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <p className="text-gray-500">
                        No reports found matching your criteria.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  narrativeReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="font-medium text-gray-900">
                              {report.student
                                ? `${report.student.firstName} ${report.student.lastName}`
                                : "Unknown Student"}
                            </div>
                            <div className="text-sm text-gray-600">
                              {report.student?.studentId || report.studentId}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{report.title}</div>
                          <div className="text-sm text-gray-600 max-w-xs truncate">
                            {report.content || "No content provided"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {report.hoursLogged || 0}h
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {report.submittedDate
                            ? formatDate(report.submittedDate)
                            : "Not submitted"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {report.rating ? (
                          <div className="flex items-center gap-1">
                            {renderStars(report.rating)}
                            <span className="text-sm text-gray-600 ml-1">
                              {report.rating}/5
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">
                            Not rated
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={getStatusColor(report.status)}
                        >
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          {report.fileUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const link = document.createElement("a");
                                link.href = getFullFileUrl(report.fileUrl!);
                                link.download = `Narrative_${
                                  report.title || "Report"
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
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedReport(report)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>
                                  {selectedReport?.title} -{" "}
                                  {selectedReport?.student
                                    ? `${selectedReport.student.firstName} ${selectedReport.student.lastName}`
                                    : "Unknown Student"}
                                </DialogTitle>
                                <DialogDescription>
                                  Submitted on{" "}
                                  {selectedReport?.submittedDate
                                    ? formatDate(selectedReport.submittedDate)
                                    : "Not submitted"}{" "}
                                  • Hours: {selectedReport?.hoursLogged || 0}h
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-6">
                                <div>
                                  <h4 className="font-semibold mb-2">
                                    Summary
                                  </h4>
                                  <p className="text-gray-700">
                                    {selectedReport?.content ||
                                      "No content provided"}
                                  </p>
                                </div>
                                {selectedReport?.feedback && (
                                  <div>
                                    <h4 className="font-semibold mb-2">
                                      Instructor Feedback
                                    </h4>
                                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                                      {selectedReport.feedback}
                                    </p>
                                  </div>
                                )}
                                {selectedReport?.fileUrl && (
                                  <Card>
                                    <CardHeader className="pb-3">
                                      <CardTitle className="text-lg flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-red-600" />
                                        Report File
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <FileText className="w-6 h-6 text-red-600" />
                                        <div className="flex-1">
                                          <p className="font-medium text-gray-700">
                                            {selectedReport.title ||
                                              "Narrative Report"}
                                            .pdf
                                          </p>
                                          <p className="text-sm text-gray-500">
                                            PDF Document
                                          </p>
                                        </div>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() =>
                                            window.open(
                                              getFullFileUrl(
                                                selectedReport.fileUrl!
                                              ),
                                              "_blank"
                                            )
                                          }
                                        >
                                          <Download className="w-4 h-4 mr-1" />
                                          Open
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                          {report.status === "submitted" && (
                            <Dialog
                              open={isReviewDialogOpen}
                              onOpenChange={setIsReviewDialogOpen}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  className="bg-primary-500 hover:bg-primary-600"
                                  onClick={() => setSelectedReport(report)}
                                >
                                  <MessageSquare className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>
                                    Review Narrative Report
                                  </DialogTitle>
                                  <DialogDescription>
                                    Provide feedback and rating for this
                                    narrative report.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label>
                                      Report: {selectedReport?.title}
                                    </Label>
                                    <p className="text-sm text-gray-600">
                                      Student:{" "}
                                      {selectedReport?.student
                                        ? `${selectedReport.student.firstName} ${selectedReport.student.lastName}`
                                        : "Unknown Student"}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      Hours: {selectedReport?.hoursLogged || 0}h
                                    </p>
                                  </div>
                                  <div>
                                    <Label htmlFor="rating">
                                      Rating (1-5 stars)
                                    </Label>
                                    <Select
                                      value={reviewRating}
                                      onValueChange={setReviewRating}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select rating" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="1">
                                          1 Star - Poor
                                        </SelectItem>
                                        <SelectItem value="2">
                                          2 Stars - Fair
                                        </SelectItem>
                                        <SelectItem value="3">
                                          3 Stars - Good
                                        </SelectItem>
                                        <SelectItem value="4">
                                          4 Stars - Very Good
                                        </SelectItem>
                                        <SelectItem value="5">
                                          5 Stars - Excellent
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label htmlFor="feedback">Feedback</Label>
                                    <Textarea
                                      id="feedback"
                                      placeholder="Provide detailed feedback on the narrative report..."
                                      value={reviewFeedback}
                                      onChange={(e) =>
                                        setReviewFeedback(e.target.value)
                                      }
                                      rows={4}
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => setIsReviewDialogOpen(false)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() =>
                                      handleReturn(
                                        selectedReport?.id || "",
                                        reviewFeedback
                                      )
                                    }
                                    disabled={isRejecting}
                                  >
                                    {isRejecting
                                      ? "Rejecting..."
                                      : "Return for Revision"}
                                  </Button>
                                  <Button
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() =>
                                      handleApprove(
                                        selectedReport?.id || "",
                                        Number.parseInt(reviewRating),
                                        reviewFeedback
                                      )
                                    }
                                    disabled={!reviewRating || isApproving}
                                  >
                                    {isApproving
                                      ? "Approving..."
                                      : "Approve Report"}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
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
