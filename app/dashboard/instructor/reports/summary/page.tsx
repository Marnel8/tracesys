"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/auth/useAuth";
import { useStudentsByTeacher } from "@/hooks/student/useStudent";
import { useRequirements } from "@/hooks/requirement/useRequirement";
import { useRequirementTemplates } from "@/hooks/requirement-template/useRequirementTemplate";
import { useReports } from "@/hooks/report/useReport";
import {
  useCreateRequirementComment,
  useRequirementComments,
  useUpdateRequirementDueDate,
  useCreateRequirementFromTemplate,
} from "@/hooks/requirement/useRequirement";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Search,
  MessageSquare,
  CheckCircle,
  X,
  FileText,
  CalendarIcon,
  Filter,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function SummaryOfRequirementsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentTarget, setCommentTarget] = useState<{
    type: "requirement" | "report";
    id: string;
    studentId: string;
    title: string;
  } | null>(null);
  const [selectedStudentForComment, setSelectedStudentForComment] =
    useState<any>(null);
  const [isDueDateDialogOpen, setIsDueDateDialogOpen] = useState(false);
  const [selectedRequirementForDueDate, setSelectedRequirementForDueDate] =
    useState<{
      id: string;
      title: string;
      currentDueDate: string | null;
      templateId?: string;
      studentId?: string;
    } | null>(null);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);

  const teacherId = (user as any)?.id || "";

  // Fetch all data once (without search to avoid refetching on every keystroke)
  const { data: studentsData, isLoading: isLoadingStudents } =
    useStudentsByTeacher(teacherId, {
      page: 1,
      limit: 1000,
      search: "",
    });

  // Fetch all requirements including pending ones (without files) for the summary page
  const { data: requirementsData, refetch: refetchRequirements } =
    useRequirements({
      page: 1,
      limit: 10000,
      status: "all" as any,
      includePending: true, // Include pending requirements without files
    } as any);

  const { data: templatesData } = useRequirementTemplates({
    page: 1,
    limit: 1000,
    status: "active",
  });

  const { data: weeklyReportsData } = useReports({
    page: 1,
    limit: 10000,
    type: "weekly",
  });

  const { data: narrativeReportsData } = useReports({
    page: 1,
    limit: 10000,
    type: "narrative",
  });

  const queryClient = useQueryClient();
  const createComment = useCreateRequirementComment();
  const updateDueDate = useUpdateRequirementDueDate();
  const createRequirement = useCreateRequirementFromTemplate();

  // Extract unique sections for filter dropdown
  const sections = useMemo(() => {
    const allStudents = studentsData?.data?.students ?? [];
    const sectionMap = new Map<
      string,
      {
        sectionId: string;
        sectionName: string;
        courseName: string;
        courseCode: string;
        academicYear: string;
      }
    >();

    allStudents.forEach((student: any) => {
      const enrollment = student.enrollments?.[0];
      const section = enrollment?.section;

      if (section && !sectionMap.has(section.id)) {
        const course = section.course;
        sectionMap.set(section.id, {
          sectionId: section.id,
          sectionName: section.name || "Unknown Section",
          courseName: course?.name || course?.code || "-",
          courseCode: course?.code || "-",
          academicYear: section.academicYear || "-",
        });
      }
    });

    return Array.from(sectionMap.values()).sort((a, b) =>
      a.sectionName.localeCompare(b.sectionName)
    );
  }, [studentsData]);

  // Filter students by search term and selected section
  const filteredStudents = useMemo(() => {
    const allStudents = studentsData?.data?.students ?? [];

    let filtered = allStudents;

    // Filter by section
    if (selectedSectionId !== "all") {
      filtered = filtered.filter((student: any) => {
        const enrollment = student.enrollments?.[0];
        const section = enrollment?.section;
        return section?.id === selectedSectionId;
      });
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((student: any) => {
        const fullName =
          `${student.firstName} ${student.lastName}`.toLowerCase();
        const email = (student.email || "").toLowerCase();
        const sectionName = (student.computed?.sectionName || "").toLowerCase();
        const courseName = (student.computed?.courseName || "").toLowerCase();
        return (
          fullName.includes(searchLower) ||
          email.includes(searchLower) ||
          sectionName.includes(searchLower) ||
          courseName.includes(searchLower)
        );
      });
    }

    return filtered;
  }, [studentsData, searchTerm, selectedSectionId]);

  const requirements = useMemo(() => {
    return requirementsData?.requirements ?? [];
  }, [requirementsData]);

  const templates = useMemo(() => {
    return templatesData?.requirementTemplates ?? [];
  }, [templatesData]);

  const weeklyReports = useMemo(() => {
    return weeklyReportsData?.reports ?? [];
  }, [weeklyReportsData]);

  const narrativeReports = useMemo(() => {
    return narrativeReportsData?.reports ?? [];
  }, [narrativeReportsData]);

  // Create a map of student requirements by template
  const studentRequirementsMap = useMemo(() => {
    const map = new Map<string, Map<string, any>>();
    requirements.forEach((req: any) => {
      if (!map.has(req.studentId)) {
        map.set(req.studentId, new Map());
      }
      const studentReqs = map.get(req.studentId)!;
      if (req.templateId) {
        studentReqs.set(req.templateId, req);
      }
    });
    return map;
  }, [requirements]);

  // Create a map of student reports
  const studentReportsMap = useMemo(() => {
    const map = new Map<string, { weekly: any[]; narrative: any[] }>();
    [...weeklyReports, ...narrativeReports].forEach((report: any) => {
      if (!map.has(report.studentId)) {
        map.set(report.studentId, { weekly: [], narrative: [] });
      }
      const studentReports = map.get(report.studentId)!;
      if (report.type === "weekly") {
        studentReports.weekly.push(report);
      } else if (report.type === "narrative") {
        studentReports.narrative.push(report);
      }
    });
    return map;
  }, [weeklyReports, narrativeReports]);

  const handleAddComment = async () => {
    if (!commentTarget || !commentText.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    try {
      if (commentTarget.type === "requirement") {
        await createComment.mutateAsync({
          requirementId: commentTarget.id,
          content: commentText.trim(),
          isPrivate: false,
        });
      } else {
        // For reports, we might need a separate comment system
        // For now, we'll show an error
        toast.error("Comments for reports are not yet implemented");
        return;
      }
      setIsCommentDialogOpen(false);
      setCommentText("");
      setCommentTarget(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const getRequirementStatus = (studentId: string, templateId: string) => {
    const studentReqs = studentRequirementsMap.get(studentId);
    if (!studentReqs) return null;
    const req = studentReqs.get(templateId);
    return req?.status === "approved" ? true : false;
  };

  const getProgress = (studentId: string) => {
    const studentReqs = studentRequirementsMap.get(studentId);
    if (!studentReqs) return { approved: 0, total: templates.length };
    let approved = 0;
    templates.forEach((template: any) => {
      const req = studentReqs.get(template.id);
      if (req?.status === "approved") approved++;
    });
    return { approved, total: templates.length };
  };

  const getWeeklyReportStatus = (studentId: string) => {
    const studentReports = studentReportsMap.get(studentId);
    if (!studentReports) return null;
    const approved = studentReports.weekly.filter(
      (r: any) => r.status === "approved"
    ).length;
    return approved > 0 ? true : null;
  };

  const getNarrativeReportStatus = (studentId: string) => {
    const studentReports = studentReportsMap.get(studentId);
    if (!studentReports) return null;
    const approved = studentReports.narrative.filter(
      (r: any) => r.status === "approved"
    ).length;
    return approved > 0 ? true : null;
  };

  const openCommentDialog = (
    type: "requirement" | "report",
    id: string,
    studentId: string,
    title: string
  ) => {
    setCommentTarget({ type, id, studentId, title });
    setIsCommentDialogOpen(true);
  };

  const openDueDateDialog = (
    requirement: any,
    template: any,
    studentId: string
  ) => {
    if (requirement) {
      // Requirement exists - update it
      setSelectedRequirementForDueDate({
        id: requirement.id,
        title: requirement.title || template.title,
        currentDueDate: requirement.dueDate || null,
      });
      setDueDate(
        requirement.dueDate ? new Date(requirement.dueDate) : undefined
      );
    } else {
      // Requirement doesn't exist yet - we'll create it
      setSelectedRequirementForDueDate({
        id: "",
        title: template.title,
        currentDueDate: null,
        templateId: template.id,
        studentId: studentId,
      });
      setDueDate(undefined);
    }
    setIsDueDateDialogOpen(true);
  };

  const handleUpdateDueDate = async () => {
    if (!selectedRequirementForDueDate) return;

    try {
      let result;
      // If requirement doesn't exist (no id), create it first
      if (
        !selectedRequirementForDueDate.id &&
        selectedRequirementForDueDate.templateId &&
        selectedRequirementForDueDate.studentId
      ) {
        result = await createRequirement.mutateAsync({
          templateId: selectedRequirementForDueDate.templateId,
          studentId: selectedRequirementForDueDate.studentId,
          dueDate: dueDate ? dueDate.toISOString() : null,
        });
      } else {
        // Requirement exists - update it
        result = await updateDueDate.mutateAsync({
          id: selectedRequirementForDueDate.id,
          dueDate: dueDate ? dueDate.toISOString() : null,
        });
      }

      // Invalidate and refetch requirements to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ["requirements"] });
      // Wait a moment for server to process, then refetch
      setTimeout(async () => {
        await refetchRequirements();
      }, 300);

      setIsDueDateDialogOpen(false);
      setSelectedRequirementForDueDate(null);
      setDueDate(undefined);
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (isLoadingStudents) {
    return (
      <div className="p-6">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Summary of Requirements
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">
          Overview of all student requirements and reports
        </p>
      </div>

      <Card className="w-full overflow-hidden">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-xl sm:text-2xl">
              Student Requirements & Reports
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={selectedSectionId}
                onValueChange={setSelectedSectionId}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {sections.map((section) => (
                    <SelectItem
                      key={section.sectionId}
                      value={section.sectionId}
                    >
                      {section.sectionName} ({section.courseCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No students found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredStudents.map((student: any) => {
                const progress = getProgress(student.id);
                const studentReqs = studentRequirementsMap.get(student.id);
                const studentReports = studentReportsMap.get(student.id);
                return (
                  <StudentRequirementCard
                    key={student.id}
                    student={student}
                    templates={templates}
                    progress={progress}
                    studentReqs={studentReqs}
                    studentReports={studentReports}
                    getRequirementStatus={getRequirementStatus}
                    getWeeklyReportStatus={getWeeklyReportStatus}
                    getNarrativeReportStatus={getNarrativeReportStatus}
                    onCommentClick={() => {
                      setSelectedStudentForComment(student);
                      setIsCommentDialogOpen(true);
                    }}
                    onUpdateDueDate={openDueDateDialog}
                  />
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comment Dialog */}
      <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Comment</DialogTitle>
            <DialogDescription>
              {selectedStudentForComment
                ? `Add a comment for ${selectedStudentForComment.firstName} ${selectedStudentForComment.lastName}`
                : "Select an item to comment on"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedStudentForComment && (
              <>
                <div>
                  <Label className="mb-2 block">
                    Select Item to Comment On
                  </Label>
                  <div className="space-y-2 max-h-64 overflow-y-auto border rounded-md p-3">
                    {/* Requirements */}
                    <div>
                      <h4 className="font-medium text-sm mb-2">Requirements</h4>
                      <div className="space-y-1">
                        {templates.map((template: any) => {
                          const studentReqs = studentRequirementsMap.get(
                            selectedStudentForComment.id
                          );
                          const req = studentReqs?.get(template.id);
                          if (!req) return null;
                          return (
                            <Button
                              key={template.id}
                              variant={
                                commentTarget?.id === req.id
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              className="w-full justify-start"
                              onClick={() => {
                                setCommentTarget({
                                  type: "requirement",
                                  id: req.id,
                                  studentId: selectedStudentForComment.id,
                                  title: template.title,
                                });
                              }}
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              {template.title} ({req.status})
                            </Button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Weekly Reports */}
                    {(() => {
                      const studentReports = studentReportsMap.get(
                        selectedStudentForComment.id
                      );
                      if (!studentReports?.weekly.length) return null;
                      return (
                        <div>
                          <h4 className="font-medium text-sm mb-2">
                            Weekly Reports
                          </h4>
                          <div className="space-y-1">
                            {studentReports.weekly.map((report: any) => (
                              <Button
                                key={report.id}
                                variant={
                                  commentTarget?.id === report.id
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                className="w-full justify-start"
                                onClick={() => {
                                  setCommentTarget({
                                    type: "report",
                                    id: report.id,
                                    studentId: selectedStudentForComment.id,
                                    title: report.title || "Weekly Report",
                                  });
                                }}
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                {report.title ||
                                  `Weekly Report - Week ${
                                    report.weekNumber || "N/A"
                                  }`}{" "}
                                ({report.status})
                              </Button>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Narrative Reports */}
                    {(() => {
                      const studentReports = studentReportsMap.get(
                        selectedStudentForComment.id
                      );
                      if (!studentReports?.narrative.length) return null;
                      return (
                        <div>
                          <h4 className="font-medium text-sm mb-2">
                            Narrative Reports
                          </h4>
                          <div className="space-y-1">
                            {studentReports.narrative.map((report: any) => (
                              <Button
                                key={report.id}
                                variant={
                                  commentTarget?.id === report.id
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                className="w-full justify-start"
                                onClick={() => {
                                  setCommentTarget({
                                    type: "report",
                                    id: report.id,
                                    studentId: selectedStudentForComment.id,
                                    title: report.title || "Narrative Report",
                                  });
                                }}
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                {report.title || "Narrative Report"} (
                                {report.status})
                              </Button>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {commentTarget && (
                  <>
                    {/* Previous Comments Section */}
                    {commentTarget.type === "requirement" && (
                      <PreviousCommentsSection
                        requirementId={commentTarget.id}
                      />
                    )}

                    {/* Add New Comment Section */}
                    <div>
                      <Label htmlFor="comment">Comment</Label>
                      <Textarea
                        id="comment"
                        placeholder="Enter your comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        rows={4}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Commenting on: {commentTarget.title}
                      </p>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCommentDialogOpen(false);
                setCommentText("");
                setCommentTarget(null);
                setSelectedStudentForComment(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddComment}
              disabled={
                !commentTarget || !commentText.trim() || createComment.isPending
              }
            >
              {createComment.isPending ? "Adding..." : "Add Comment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Due Date Update Dialog */}
      <Dialog open={isDueDateDialogOpen} onOpenChange={setIsDueDateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Due Date</DialogTitle>
            <DialogDescription>
              {selectedRequirementForDueDate
                ? `Set a new due date for: ${selectedRequirementForDueDate.title}`
                : "Select a requirement to update"}
            </DialogDescription>
          </DialogHeader>
          {selectedRequirementForDueDate && (
            <div className="space-y-4 py-4">
              {selectedRequirementForDueDate.currentDueDate && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    Current Due Date:
                  </p>
                  <p className="text-sm text-blue-700">
                    {format(
                      new Date(selectedRequirementForDueDate.currentDueDate),
                      "EEEE, MMMM d, yyyy"
                    )}
                  </p>
                </div>
              )}
              <div>
                <Label>
                  {selectedRequirementForDueDate.currentDueDate
                    ? "Update Due Date"
                    : "Set Due Date"}
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal mt-2",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? (
                        format(dueDate, "EEEE, MMMM d, yyyy")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDueDate(undefined);
                  }}
                  className="flex-1"
                >
                  Clear Date
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDueDateDialogOpen(false);
                setSelectedRequirementForDueDate(null);
                setDueDate(undefined);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateDueDate}
              disabled={updateDueDate.isPending || createRequirement.isPending}
            >
              {updateDueDate.isPending || createRequirement.isPending
                ? "Saving..."
                : selectedRequirementForDueDate?.id
                ? "Update Due Date"
                : "Create & Set Due Date"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Component to display previous comments
function PreviousCommentsSection({ requirementId }: { requirementId: string }) {
  const { data: comments, isLoading } = useRequirementComments(requirementId);

  if (isLoading) {
    return (
      <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
        <p className="text-xs text-gray-500">Loading comments...</p>
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="w-4 h-4 text-gray-600" />
        <p className="text-sm font-medium text-gray-700">
          Previous Comments ({comments.length})
        </p>
      </div>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {comments.map((comment: any) => (
          <div
            key={comment.id}
            className="bg-white border border-gray-200 p-3 rounded-md"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">
                  {comment.user?.firstName} {comment.user?.lastName}
                </span>
                {comment.user?.role === "instructor" && (
                  <Badge variant="outline" className="text-xs">
                    Instructor
                  </Badge>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {new Date(comment.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Student Requirement Card Component
function StudentRequirementCard({
  student,
  templates,
  progress,
  studentReqs,
  studentReports,
  getRequirementStatus,
  getWeeklyReportStatus,
  getNarrativeReportStatus,
  onCommentClick,
  onUpdateDueDate,
}: {
  student: any;
  templates: any[];
  progress: { approved: number; total: number };
  studentReqs: Map<string, any> | undefined;
  studentReports: { weekly: any[]; narrative: any[] } | undefined;
  getRequirementStatus: (
    studentId: string,
    templateId: string
  ) => boolean | null;
  getWeeklyReportStatus: (studentId: string) => boolean | null;
  getNarrativeReportStatus: (studentId: string) => boolean | null;
  onCommentClick: () => void;
  onUpdateDueDate: (requirement: any, template: any, studentId: string) => void;
}) {
  return (
    <Card className="border border-gray-200 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-gray-900 truncate">
              {student.firstName} {student.lastName}
            </CardTitle>
            {student.email && (
              <p className="text-sm text-gray-500 truncate mt-1">
                {student.email}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onCommentClick}
            className="ml-2 flex-shrink-0"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Comment
          </Button>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Progress:</span>
          <Badge variant="outline" className="text-sm">
            {progress.approved}/{progress.total}
          </Badge>
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 transition-all"
              style={{
                width: `${
                  progress.total > 0
                    ? (progress.approved / progress.total) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {/* Requirements Section */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Requirements
              </h4>
              <div className="space-y-2">
                {templates.map((template: any) => {
                  const isApproved = getRequirementStatus(
                    student.id,
                    template.id
                  );
                  const req = studentReqs?.get(template.id);
                  return (
                    <div
                      key={template.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-md gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-gray-700 truncate block">
                          {template.title}
                        </span>
                        {req?.dueDate ? (
                          <span className="text-xs text-gray-500 block mt-1">
                            Due: {format(new Date(req.dueDate), "MMM d, yyyy")}
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Show button for requirements that aren't submitted/approved/rejected, or if requirement doesn't exist yet */}
                        {(!req ||
                          (req.status !== "submitted" &&
                            req.status !== "approved" &&
                            req.status !== "rejected")) && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 text-xs"
                            onClick={() =>
                              onUpdateDueDate(req, template, student.id)
                            }
                            title="Set or update due date"
                          >
                            <CalendarIcon className="w-3 h-3 mr-1" />
                            {req?.dueDate ? "Edit" : "Set"}
                          </Button>
                        )}
                        {isApproved ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : req ? (
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              req.status === "submitted"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : req.status === "rejected"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-yellow-50 text-yellow-700 border-yellow-200"
                            }`}
                          >
                            {req.status}
                          </Badge>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weekly Reports Section */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Weekly Reports
              </h4>
              <div className="space-y-2">
                {studentReports?.weekly && studentReports.weekly.length > 0 ? (
                  studentReports.weekly.map((report: any) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                    >
                      <span className="text-sm text-gray-700 truncate flex-1 mr-2">
                        {report.title || `Week ${report.weekNumber || "N/A"}`}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          report.status === "approved"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : report.status === "submitted"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : report.status === "rejected"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-gray-50 text-gray-700 border-gray-200"
                        }`}
                      >
                        {report.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="p-2 bg-gray-50 rounded-md">
                    <span className="text-sm text-gray-400">
                      No weekly reports
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Narrative Reports Section */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Narrative Reports
              </h4>
              <div className="space-y-2">
                {studentReports?.narrative &&
                studentReports.narrative.length > 0 ? (
                  studentReports.narrative.map((report: any) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                    >
                      <span className="text-sm text-gray-700 truncate flex-1 mr-2">
                        {report.title || "Narrative Report"}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          report.status === "approved"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : report.status === "submitted"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : report.status === "rejected"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-gray-50 text-gray-700 border-gray-200"
                        }`}
                      >
                        {report.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="p-2 bg-gray-50 rounded-md">
                    <span className="text-sm text-gray-400">
                      No narrative reports
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
