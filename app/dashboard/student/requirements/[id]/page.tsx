"use client";

import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, MessageSquare, Download, Eye } from "lucide-react";
import { useRequirement } from "@/hooks/requirement/useRequirement";
import { useRequirementComments } from "@/hooks/requirement/useRequirement";
import Link from "next/link";

export default function RequirementDetailPage() {
  const params = useParams() as { id: string };
  const router = useRouter();
  const { data: requirement, isLoading } = useRequirement(params.id);

  if (isLoading) {
    return (
      <div className="px-4 md:px-8 lg:px-16 py-8">
        <p>Loading...</p>
      </div>
    );
  }

  if (!requirement) {
    return (
      <div className="px-4 md:px-8 lg:px-16 py-8">
        <p>Requirement not found</p>
      </div>
    );
  }

  const fileUrl = requirement.fileUrl
    ? requirement.fileUrl.startsWith("/")
      ? `${process.env.NEXT_PUBLIC_API_URL}${requirement.fileUrl}`
      : requirement.fileUrl
    : null;

  return (
    <div className="px-4 md:px-8 lg:px-16 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Requirement Details
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          View your submission and instructor comments.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-primary-200 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-xl text-gray-900">
                    {requirement.template?.title || "Requirement"}
                  </CardTitle>
                  <Badge
                    className={`w-fit capitalize ${
                      requirement.status === "approved"
                        ? "bg-green-50 text-green-700"
                        : requirement.status === "rejected"
                        ? "bg-red-50 text-red-700"
                        : requirement.status === "submitted"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-yellow-50 text-yellow-700"
                    }`}
                  >
                    {requirement.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {requirement.template?.category && (
                    <Badge variant="outline" className="text-xs capitalize">
                      {requirement.template.category}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {requirement.template?.description && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {requirement.template.description}
                  </p>
                </div>
              )}

              {requirement.fileName && (
                <div className="bg-primary-50 border border-primary-200 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {requirement.fileName}
                        </p>
                        {typeof requirement.fileSize === "number" && (
                          <p className="text-xs text-gray-500">
                            {(requirement.fileSize / 1024 / 1024).toFixed(2)} MB
                          </p>
                        )}
                      </div>
                    </div>
                    {fileUrl && (
                      <div className="flex gap-2">
                        <a href={fileUrl} target="_blank" rel="noreferrer">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </Button>
                        </a>
                        <a href={fileUrl} download>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {requirement.feedback && (
                <div className={`p-4 rounded-lg border ${
                  requirement.status === "rejected"
                    ? "bg-red-50 border-red-200"
                    : "bg-primary-50 border-primary-200"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className={`w-5 h-5 ${
                      requirement.status === "rejected"
                        ? "text-red-600"
                        : "text-primary-600"
                    }`} />
                    <p className={`text-sm font-medium ${
                      requirement.status === "rejected"
                        ? "text-red-900"
                        : "text-primary-900"
                    }`}>
                      {requirement.status === "rejected" ? "Rejection Feedback" : "Instructor Feedback"}
                    </p>
                  </div>
                  <p className={`text-sm whitespace-pre-wrap leading-relaxed ${
                    requirement.status === "rejected"
                      ? "text-red-800"
                      : "text-primary-800"
                  }`}>
                    {requirement.feedback}
                  </p>
                  {requirement.status === "rejected" && (
                    <p className="text-xs text-red-600 mt-3 font-medium">
                      Please review the feedback and resubmit with revisions.
                    </p>
                  )}
                </div>
              )}

              <RequirementCommentsSection requirementId={requirement.id} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border border-primary-200 shadow-sm bg-primary-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-900">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <Badge
                    className={`text-xs capitalize ${
                      requirement.status === "approved"
                        ? "bg-green-50 text-green-700"
                        : requirement.status === "rejected"
                        ? "bg-red-50 text-red-700"
                        : requirement.status === "submitted"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-yellow-50 text-yellow-700"
                    }`}
                  >
                    {requirement.status}
                  </Badge>
                </div>
                {requirement.template?.category && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Category:</span>
                    <Badge variant="outline" className="text-xs capitalize">
                      {requirement.template.category}
                    </Badge>
                  </div>
                )}
                {requirement.submittedAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Submitted:</span>
                    <span className="text-gray-700">
                      {new Date(requirement.submittedAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {requirement.template?.templateFileUrl && (
            <Card className="border border-primary-200 shadow-sm bg-primary-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary-600" />
                  Template File
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a
                  href={
                    requirement.template.templateFileUrl.startsWith("/")
                      ? `${process.env.NEXT_PUBLIC_API_URL}${requirement.template.templateFileUrl}`
                      : requirement.template.templateFileUrl
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 hover:underline transition-colors"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {requirement.template.templateFileName || "Download template"}
                </a>
                <p className="text-xs text-gray-600">
                  Click to download the template file for this requirement.
                </p>
              </CardContent>
            </Card>
          )}

          {requirement.templateId && (
            <Link href={`/dashboard/student/requirements/templates/${requirement.templateId}`}>
              <Button
                variant="outline"
                className={`w-full ${
                  requirement.status === "rejected"
                    ? "border border-red-500 bg-red-50 text-red-700 hover:border-red-600 hover:bg-red-100"
                    : requirement.status === "submitted"
                    ? "border border-primary-500 bg-primary-50 text-primary-700 hover:border-primary-400 hover:bg-primary-100"
                    : ""
                }`}
              >
                {requirement.status === "rejected"
                  ? "Resubmit with Revisions"
                  : requirement.status === "submitted"
                  ? "Update Submission"
                  : requirement.status === "approved"
                  ? "Request Update"
                  : "Update Submission"}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// Component to display comments for a requirement
function RequirementCommentsSection({
  requirementId,
}: {
  requirementId: string;
}) {
  const { data: comments, isLoading } = useRequirementComments(requirementId);

  if (isLoading) {
    return (
      <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
        <p className="text-sm text-gray-500">Loading comments...</p>
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="w-5 h-5 text-primary-600" />
        <p className="text-sm font-medium text-gray-900">
          Comments ({comments.length})
        </p>
      </div>
      <div className="space-y-3">
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
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {comment.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

