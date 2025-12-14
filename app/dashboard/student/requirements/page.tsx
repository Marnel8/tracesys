"use client";

import { useMemo, useState, memo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Upload,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Eye,
  Download,
  Search,
  FileCheck,
  XCircle,
  MessageSquare,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRequirementTemplates } from "@/hooks/requirement-template/useRequirementTemplate";
import {
  useRequirements,
  useRequirementComments,
} from "@/hooks/requirement/useRequirement";
import { useAuth } from "@/hooks/auth/useAuth";
import { useDebounce } from "@/hooks/useDebounce";

export default function RequirementsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 400);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState<"templates" | "submissions">(
    "templates"
  );
  const [expandedComments, setExpandedComments] = useState<Set<string>>(
    new Set()
  );

  const { user } = useAuth();
  const { data: templatesData, isLoading: isLoadingTemplates } =
    useRequirementTemplates({
      page: 1,
      limit: 100,
      search: debouncedSearchTerm || undefined,
      status: "active",
    });
  const { data: requirementsData, isLoading: isLoadingRequirements } =
    useRequirements({
      page: 1,
      limit: 100,
      search: debouncedSearchTerm || undefined,
      studentId: user?.id,
    });

  const templates = useMemo(() => {
    const list = templatesData?.requirementTemplates || [];
    if (selectedCategory === "all") return list;
    return list.filter((t: any) => t.category === selectedCategory);
  }, [templatesData, selectedCategory]);

  const requirements = useMemo(() => {
    const list = requirementsData?.requirements || [];
    if (selectedCategory === "all") return list;
    return list.filter((r: any) => r.category === selectedCategory);
  }, [requirementsData, selectedCategory]);

  // Memoize requirement lookup map for O(1) access
  const requirementMap = useMemo(() => {
    const map = new Map<string, any>();
    requirements.forEach((r: any) => {
      if (
        r.templateId &&
        (!map.has(r.templateId) ||
          new Date(r.updatedAt) > new Date(map.get(r.templateId).updatedAt))
      ) {
        map.set(r.templateId, r);
      }
    });
    return map;
  }, [requirements]);

  const toggleComments = useCallback((requirementId: string) => {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(requirementId)) {
        next.delete(requirementId);
      } else {
        next.add(requirementId);
      }
      return next;
    });
  }, []);

  const categories = [
    { value: "all", label: "All Requirements" },
    { value: "health", label: "Health & Safety" },
    { value: "reports", label: "Reports" },
    { value: "training", label: "Training" },
    { value: "academic", label: "Academic" },
    { value: "evaluation", label: "Evaluations" },
    { value: "legal", label: "Legal" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-primary-50 text-primary-700";
      case "submitted":
        return "bg-primary-50 text-primary-700";
      case "in-progress":
        return "bg-primary-50 text-primary-700";
      case "pending":
        return "bg-primary-50 text-primary-700";
      case "rejected":
        return "bg-primary-50 text-primary-700";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-primary-700";
      case "high":
        return "text-primary-600";
      case "medium":
        return "text-primary-600";
      case "low":
        return "text-primary-600";
      default:
        return "text-gray-600";
    }
  };

  const approvedCount = requirements.filter(
    (r: any) => r.status === "approved"
  ).length;
  const submittedCount = requirements.filter(
    (r: any) => r.status === "submitted"
  ).length;
  const totalCount = templates.length;
  const completionPercentage =
    totalCount > 0 ? (approvedCount / totalCount) * 100 : 0;

  const getTemplateFileUrl = (url?: string | null) => {
    if (!url) return null;
    return url.startsWith("/")
      ? `${process.env.NEXT_PUBLIC_API_URL}${url}`
      : url;
  };

  return (
    <div className="px-3 sm:px-4 md:px-6 lg:px-8 xl:px-16">
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
          <Link href="/dashboard/student">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 sm:gap-2 -ml-2 sm:ml-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Button>
          </Link>
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
          Pre-internship Requirements
        </h1>
        <p className="text-gray-600 text-xs sm:text-sm md:text-base">
          Track and submit your pre-internship requirements.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Card className="border border-primary-200 shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium">
                Completion Rate
              </span>
              <span className="text-xs sm:text-sm text-gray-600">
                {approvedCount}/{totalCount}
              </span>
            </div>
            <Progress value={completionPercentage} className="h-2 mb-2" />
            <span className="text-xs text-gray-500">
              {completionPercentage.toFixed(0)}% Complete
            </span>
          </CardContent>
        </Card>

        <Card className="border border-primary-200 shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-primary-600" />
              <span className="text-xs sm:text-sm font-medium">Approved</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-primary-600">
              {approvedCount}
            </span>
          </CardContent>
        </Card>

        <Card className="border border-primary-200 shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-primary-600" />
              <span className="text-xs sm:text-sm font-medium">Submitted</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-primary-600">
              {submittedCount}
            </span>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-4 sm:mb-6 border border-primary-200 shadow-sm">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search requirements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 text-sm sm:text-base"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 -mx-1 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant={
                    selectedCategory === category.value ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                  className={`whitespace-nowrap transition-all duration-300 text-xs sm:text-sm ${
                    selectedCategory === category.value
                      ? "border border-primary-500 bg-primary-50 text-primary-700"
                      : "border border-gray-300 text-gray-700 hover:border-primary-400 hover:bg-primary-50/50"
                  }`}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4 sm:mb-6">
        <Button
          variant="outline"
          onClick={() => setActiveTab("templates")}
          className={`flex items-center justify-center gap-2 transition-all duration-300 text-sm sm:text-base ${
            activeTab === "templates"
              ? "border border-primary-500 bg-primary-50 text-primary-700"
              : "border border-gray-300 text-gray-700 hover:border-primary-400 hover:bg-primary-50/50"
          }`}
        >
          <FileText className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">
            Available Templates ({templates.length})
          </span>
        </Button>
        <Button
          variant="outline"
          onClick={() => setActiveTab("submissions")}
          className={`flex items-center justify-center gap-2 transition-all duration-300 text-sm sm:text-base ${
            activeTab === "submissions"
              ? "border border-primary-500 bg-primary-50 text-primary-700"
              : "border border-gray-300 text-gray-700 hover:border-primary-400 hover:bg-primary-50/50"
          }`}
        >
          <FileCheck className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">
            My Submissions ({requirements.length})
          </span>
        </Button>
      </div>

      {(isLoadingTemplates || isLoadingRequirements) && (
        <Card className="border border-primary-200 shadow-sm">
          <CardContent className="p-6 sm:p-8 text-center">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-primary-600 animate-spin mb-3 sm:mb-4" />
            <p className="text-xs sm:text-sm text-gray-600">
              Loading requirements...
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4 sm:space-y-6">
        {!isLoadingTemplates &&
          !isLoadingRequirements &&
          activeTab === "templates" &&
          templates.map((template: any) => {
            const templateDownloadUrl = getTemplateFileUrl(
              (template as any).templateFileUrl
            );
            return (
              <Card
                key={template.id}
                className="border border-primary-200 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <CardContent className="p-4 sm:p-5 lg:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4 sm:gap-5 lg:gap-6">
                    <div className="flex-1 space-y-3 sm:space-y-4 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight break-words">
                              {template.title}
                            </h3>
                            {/* Submission indicator for this template (if any) */}
                            {(() => {
                              const matched = requirementMap.get(template.id);
                              if (!matched) return null;
                              return (
                                <Badge
                                  className={`${getStatusColor(
                                    matched.status
                                  )} capitalize text-xs sm:text-sm flex-shrink-0`}
                                >
                                  {matched.status}
                                </Badge>
                              );
                            })()}
                            {template.isRequired && (
                              <Badge className="bg-primary-50 text-primary-700 border border-primary-200 text-xs sm:text-sm flex-shrink-0">
                                Required
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                            {template.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
                            Category:
                          </span>
                          <Badge
                            variant="outline"
                            className="text-xs capitalize"
                          >
                            {template.category}
                          </Badge>
                        </div>
                        {(Array.isArray(template.allowedFileTypes)
                          ? template.allowedFileTypes
                          : []
                        ).length > 0 && (
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
                              Allowed types:
                            </span>
                            <div className="flex gap-1 flex-wrap">
                              {(Array.isArray(template.allowedFileTypes)
                                ? template.allowedFileTypes
                                : []
                              ).map((t: string) => (
                                <Badge
                                  key={t}
                                  variant="secondary"
                                  className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1"
                                >
                                  {t}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {typeof template.maxFileSize === "number" && (
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
                              Max size:
                            </span>
                            <span className="text-xs text-gray-700">
                              {template.maxFileSize} MB
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-row lg:flex-col gap-2 sm:gap-3 lg:w-full lg:max-w-[200px]">
                      <Link
                        href={`/dashboard/student/requirements/templates/${template.id}`}
                        className="flex-1 lg:flex-none"
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full border border-primary-500 bg-primary-50 text-primary-700 transition-all duration-300 hover:border-primary-400 hover:bg-primary-50/50 text-xs sm:text-sm"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                          <span className="hidden min-[375px]:inline">
                            View Details
                          </span>
                          <span className="min-[375px]:hidden">View</span>
                        </Button>
                      </Link>
                      {templateDownloadUrl && (
                        <a
                          href={templateDownloadUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 lg:flex-none"
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full border border-gray-300 text-gray-700 transition-all duration-300 hover:border-primary-400 hover:bg-primary-50/50 text-xs sm:text-sm"
                          >
                            <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                            <span className="hidden min-[375px]:inline">
                              Download Template
                            </span>
                            <span className="min-[375px]:hidden">Download</span>
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

        {!isLoadingTemplates &&
          !isLoadingRequirements &&
          activeTab === "submissions" &&
          requirements.map((requirement: any) => {
            const getStatusIcon = (status: string) => {
              switch (status) {
                case "approved":
                  return <CheckCircle className="w-4 h-4 text-primary-600" />;
                case "submitted":
                  return <Clock className="w-4 h-4 text-primary-600" />;
                case "rejected":
                  return <XCircle className="w-4 h-4 text-primary-600" />;
                case "pending":
                  return <AlertTriangle className="w-4 h-4 text-primary-600" />;
                default:
                  return <Clock className="w-4 h-4 text-gray-600" />;
              }
            };

            return (
              <Card
                key={requirement.id}
                className="border border-primary-200 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <CardContent className="p-4 sm:p-5 lg:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4 sm:gap-5 lg:gap-6">
                    <div className="flex-1 space-y-3 sm:space-y-4 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight break-words">
                              {requirement.title}
                            </h3>
                            <Badge
                              className={`${getStatusColor(
                                requirement.status
                              )} text-xs sm:text-sm flex-shrink-0 capitalize`}
                            >
                              {requirement.status}
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                            {requirement.description}
                          </p>
                          {requirement.fileName && (
                            <div className="flex items-center text-xs sm:text-sm text-primary-600 break-words">
                              <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                              <span className="truncate">
                                <span className="hidden sm:inline">
                                  Submitted:{" "}
                                </span>
                                {requirement.fileName}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100">
                            {getStatusIcon(requirement.status)}
                            <span
                              className={`text-xs font-medium capitalize ${getPriorityColor(
                                requirement.priority
                              )}`}
                            >
                              {requirement.priority}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
                            Category:
                          </span>
                          <Badge
                            variant="outline"
                            className="text-xs capitalize"
                          >
                            {requirement.category}
                          </Badge>
                        </div>
                        {requirement.submittedDate && (
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
                              Submitted:
                            </span>
                            <span className="text-xs text-gray-700">
                              {new Date(
                                requirement.submittedDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {requirement.approvedDate && (
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
                              Approved:
                            </span>
                            <span className="text-xs text-gray-700">
                              {new Date(
                                requirement.approvedDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {requirement.feedback && (
                        <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                          <p className="text-xs font-medium text-gray-500 mb-1">
                            Feedback:
                          </p>
                          <p className="text-xs sm:text-sm text-gray-700 break-words">
                            {requirement.feedback}
                          </p>
                        </div>
                      )}

                      <RequirementCommentsSection
                        requirementId={requirement.id}
                        isExpanded={expandedComments.has(requirement.id)}
                        onToggle={() => toggleComments(requirement.id)}
                      />
                    </div>

                    <div className="flex flex-row lg:flex-col gap-2 sm:gap-3 lg:w-full lg:max-w-[200px]">
                      <Link
                        href={`/dashboard/student/requirements/${requirement.id}`}
                        className="flex-1 lg:flex-none"
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full border border-primary-500 bg-primary-50 text-primary-700 transition-all duration-300 hover:border-primary-400 hover:bg-primary-50/50 text-xs sm:text-sm"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                          <span className="hidden min-[375px]:inline">
                            View Details
                          </span>
                          <span className="min-[375px]:hidden">View</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

        {!isLoadingTemplates &&
          !isLoadingRequirements &&
          activeTab === "templates" &&
          templates.length === 0 && (
            <Card className="border border-primary-200 shadow-sm">
              <CardContent className="p-6 sm:p-8 text-center">
                <FileText className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-400 mb-3 sm:mb-4" />
                <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-1 sm:mb-2">
                  No templates found
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 px-4">
                  Try adjusting your search or filter criteria.
                </p>
              </CardContent>
            </Card>
          )}

        {!isLoadingTemplates &&
          !isLoadingRequirements &&
          activeTab === "submissions" &&
          requirements.length === 0 && (
            <Card className="border border-primary-200 shadow-sm">
              <CardContent className="p-6 sm:p-8 text-center">
                <FileCheck className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-400 mb-3 sm:mb-4" />
                <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-1 sm:mb-2">
                  No submissions found
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 px-4">
                  You haven't submitted any requirements yet. Check the
                  templates tab to get started.
                </p>
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  );
}

// Component to display comments for a requirement
const RequirementCommentsSection = memo(function RequirementCommentsSection({
  requirementId,
  isExpanded,
  onToggle,
}: {
  requirementId: string;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const { data: comments, isLoading } = useRequirementComments(requirementId, {
    enabled: isExpanded,
  });

  if (!isExpanded) {
    return (
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-primary-600 hover:text-primary-700 transition-colors mt-2"
      >
        <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
        <span>View Comments</span>
      </button>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-gray-50 border border-gray-200 p-2.5 sm:p-3 rounded-lg mt-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 flex-shrink-0" />
            <p className="text-xs sm:text-sm font-medium text-gray-700">
              Comments
            </p>
          </div>
          <button
            onClick={onToggle}
            className="text-xs text-gray-500 hover:text-gray-700 flex-shrink-0"
          >
            Hide
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-gray-400" />
          <p className="text-xs text-gray-500">Loading comments...</p>
        </div>
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 p-2.5 sm:p-3 rounded-lg mt-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 flex-shrink-0" />
            <p className="text-xs sm:text-sm font-medium text-gray-700">
              Comments
            </p>
          </div>
          <button
            onClick={onToggle}
            className="text-xs text-gray-500 hover:text-gray-700 flex-shrink-0"
          >
            Hide
          </button>
        </div>
        <p className="text-xs text-gray-500">No comments yet</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 p-3 sm:p-4 rounded-lg space-y-2 sm:space-y-3 mt-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 flex-shrink-0" />
          <p className="text-xs sm:text-sm font-medium text-gray-700 truncate">
            Comments ({comments.length})
          </p>
        </div>
        <button
          onClick={onToggle}
          className="text-xs text-gray-500 hover:text-gray-700 flex-shrink-0 ml-2"
        >
          Hide
        </button>
      </div>
      <div className="space-y-2 sm:space-y-3">
        {comments.map((comment: any) => (
          <div
            key={comment.id}
            className="bg-white border border-gray-200 p-2.5 sm:p-3 rounded-md"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1.5 sm:gap-2 mb-2">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-wrap">
                <span className="text-xs sm:text-sm font-medium text-gray-900 break-words">
                  {comment.user?.firstName} {comment.user?.lastName}
                </span>
                {comment.user?.role === "instructor" && (
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    Instructor
                  </Badge>
                )}
              </div>
              <span className="text-xs text-gray-500 flex-shrink-0">
                {new Date(comment.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
});
