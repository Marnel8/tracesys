"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, FileText, Upload, MessageSquare } from "lucide-react";
import { useRequirementTemplate } from "@/hooks/requirement-template/useRequirementTemplate";
import {
  useCreateRequirementFromTemplate,
  useSubmitRequirement,
  useRequirementComments,
} from "@/hooks/requirement/useRequirement";
import { useAuth } from "@/hooks/auth/useAuth";
import { toast } from "sonner";
import { useRequirements } from "@/hooks/requirement/useRequirement";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { useStudent } from "@/hooks/student/useStudent";

export default function RequirementTemplateDetailPage() {
  const params = useParams() as { id: string };
  const router = useRouter();
  const { data: template } = useRequirementTemplate(params.id);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const { data: studentData } = useStudent(user?.id || "");
  const createReq = useCreateRequirementFromTemplate();
  const submitReq = useSubmitRequirement();
  const { data: myRequirements } = useRequirements({
    studentId: user?.id,
    page: 1,
    limit: 200,
  });

  // Get student's agency affiliation status
  const studentRecord: any = studentData?.data;
  const practicum = studentRecord?.practicums?.[0];
  const agency = practicum?.agency;
  const isSchoolAffiliated = agency?.isSchoolAffiliated || false;

  // Check if template should be accessible based on agency affiliation
  const isTemplateAccessible = useMemo(() => {
    if (!template) return true; // Allow loading state
    // If agency is school-affiliated, only allow templates where appliesToSchoolAffiliated is true
    if (isSchoolAffiliated) {
      return template.appliesToSchoolAffiliated !== false; // Default to true if undefined (backward compatible)
    }
    // If agency is NOT school-affiliated, allow all templates
    return true;
  }, [template, isSchoolAffiliated]);

  const matchedRequirement = useMemo(() => {
    return (myRequirements?.requirements || []).find(
      (r: any) => r.templateId === template?.id
    );
  }, [myRequirements, template]);

  const templateDownloadUrl = useMemo(() => {
    const url = (template as any)?.templateFileUrl as string | undefined;
    if (!url) return null;
    return url.startsWith("/")
      ? `${process.env.NEXT_PUBLIC_API_URL}${url}`
      : url;
  }, [template]);

  const allowedTypes = useMemo(() => {
    const list = template?.allowedFileTypes as string[] | undefined;
    return Array.isArray(list) ? list : [];
  }, [template]);

  const onChooseFile = () => fileInputRef.current?.click();
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const validateFile = (file: File) => {
    // Validate extension
    const types = allowedTypes;
    if (types.length > 0) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!ext || !types.map((t) => t.toLowerCase()).includes(ext)) {
        throw new Error(`Only ${types.join(", ")} files are allowed`);
      }
    }
    // Validate size in MB
    if (typeof template?.maxFileSize === "number") {
      const maxBytes = template.maxFileSize * 1024 * 1024;
      if (file.size > maxBytes) {
        throw new Error(`Max file size is ${template.maxFileSize}MB`);
      }
    }
  };

  const onSubmit = async () => {
    try {
      if (!template?.id) {
        toast.error("Template not loaded yet");
        return;
      }
      if (!user?.id) {
        toast.error("You must be signed in to submit");
        return;
      }

      if (!selectedFile) {
        toast.error("Please choose a file to submit");
        return;
      }

      validateFile(selectedFile);

      setIsSubmitting(true);

      if (matchedRequirement) {
        await submitReq.mutateAsync({
          id: matchedRequirement.id,
          file: selectedFile,
        });
      } else {
        const requirement = await createReq.mutateAsync({
          templateId: template.id,
          studentId: user.id,
          practicumId: null,
          dueDate: null,
        });
        await submitReq.mutateAsync({ id: requirement.id, file: selectedFile });
      }

      toast.success("Requirement submitted successfully");
      router.push("/dashboard/student/requirements");
    } catch (err: any) {
      const message =
        err?.message || err?.response?.data?.message || "Submission failed";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show error if template is not accessible
  if (template && !isTemplateAccessible) {
    return (
      <div className="px-4 md:px-8 lg:px-16 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => router.push("/dashboard/student/requirements")}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Requirements</span>
            </Button>
          </div>
        </div>
        <Card className="border border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-xl text-red-900">Template Not Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-800">
              This requirement template is not available for your agency. 
              Some requirements like MOA are only applicable to non-school-affiliated agencies.
            </p>
            <Button
              onClick={() => router.push("/dashboard/student/requirements")}
              className="mt-4"
            >
              Go Back to Requirements
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 lg:px-16">
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
          Requirement Template
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          View details and prepare your submission.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-primary-200 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-xl text-gray-900">
                    {template?.title || "Loading..."}
                  </CardTitle>
                  {(() => {
                    const matched = matchedRequirement;
                    if (!matched) return null;
                    return (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className="w-fit bg-primary-50 text-primary-700 capitalize">
                          {matched.status}
                        </Badge>
                        {matched.dueDate && (
                          <Badge
                            variant="outline"
                            className="w-fit border-orange-300 bg-orange-50 text-orange-700 flex items-center gap-1"
                          >
                            <Calendar className="w-3 h-3" />
                            Due:{" "}
                            {format(new Date(matched.dueDate), "MMM d, yyyy")}
                          </Badge>
                        )}
                      </div>
                    );
                  })()}
                  {template?.isRequired && (
                    <Badge className="bg-primary-50 text-primary-700 border border-primary-200 w-fit">
                      Required Submission
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs capitalize">
                    {template?.category}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {template?.description && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {template.description}
                  </p>
                </div>
              )}
              {template?.instructions && (
                <div className="bg-primary-50 border border-primary-200 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    <p className="text-sm font-medium text-primary-900">
                      Instructions
                    </p>
                  </div>
                  <p className="text-sm text-primary-800 whitespace-pre-wrap leading-relaxed">
                    {template.instructions}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {allowedTypes.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Allowed File Types
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {allowedTypes.map((type: string) => (
                        <Badge
                          key={type}
                          variant="secondary"
                          className="text-xs px-2 py-1"
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {typeof template?.maxFileSize === "number" && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Maximum File Size
                    </p>
                    <p className="text-sm text-gray-700">
                      {template?.maxFileSize} MB
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-primary-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-gray-900">
                Submit Your Work
              </CardTitle>
              <p className="text-sm text-gray-600">
                Upload your completed requirement file
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current File Display */}
              {matchedRequirement?.fileName && !selectedFile && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Requirement file
                  </p>
                  <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 truncate">
                          {matchedRequirement.fileName}
                        </span>
                        {typeof matchedRequirement.fileSize === "number" && (
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            (
                            {(
                              matchedRequirement.fileSize /
                              1024 /
                              1024
                            ).toFixed(2)}{" "}
                            MB)
                          </span>
                        )}
                      </div>
                      {matchedRequirement?.fileUrl && (
                        <a
                          href={
                            matchedRequirement.fileUrl.startsWith("/")
                              ? `${process.env.NEXT_PUBLIC_API_URL}${matchedRequirement.fileUrl}`
                              : matchedRequirement.fileUrl
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                          >
                            Preview
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* File Upload Area */}
              <div className="space-y-3">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center space-y-4">
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-8 h-8 text-gray-400" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-700">
                          {selectedFile
                            ? "File selected"
                            : "Choose a file to upload"}
                        </p>
                        {!selectedFile && (
                          <p className="text-xs text-gray-500">
                            {allowedTypes.length > 0
                              ? `Accepted formats: ${allowedTypes.join(", ")}`
                              : "Select a file"}
                            {typeof template?.maxFileSize === "number" &&
                              ` • Max size: ${template.maxFileSize}MB`}
                          </p>
                        )}
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={onFileChange}
                      className="hidden"
                      accept={
                        allowedTypes.length
                          ? allowedTypes.map((t) => `.${t}`).join(",")
                          : undefined
                      }
                    />
                    <Button
                      variant="outline"
                      onClick={onChooseFile}
                      className="border border-gray-300 text-gray-700 hover:border-primary-400 hover:bg-primary-50/50"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {selectedFile ? "Change file" : "Browse files"}
                    </Button>
                  </div>
                </div>

                {/* Selected File Display */}
                {selectedFile && (
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <FileText className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-primary-900 mb-1">
                            Selected file
                          </p>
                          <p className="text-sm text-primary-800 truncate">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-primary-600 mt-1">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                        className="text-xs text-gray-600 hover:text-gray-900 flex-shrink-0"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end pt-2">
                  <Button
                    onClick={onSubmit}
                    disabled={!selectedFile || isSubmitting}
                    className="bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed min-w-[120px]"
                  >
                    {isSubmitting
                      ? "Submitting..."
                      : matchedRequirement
                      ? "Update Submission"
                      : "Submit"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {matchedRequirement?.feedback && (
            <Card className="border border-primary-200 shadow-sm bg-primary-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary-600" />
                  Instructor Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white/70 border border-primary-200 rounded-lg p-3">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {matchedRequirement.feedback}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {matchedRequirement && (
            <RequirementCommentsCard requirementId={matchedRequirement.id} />
          )}
          <Card className="border border-primary-200 shadow-sm bg-primary-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-600" />
                Template File
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {templateDownloadUrl ? (
                <div className="space-y-3">
                  <a
                    href={templateDownloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 hover:underline transition-colors"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {(template as any)?.templateFileName || "Download template"}
                  </a>
                  <p className="text-xs text-gray-600">
                    Click to download the template file for this requirement.
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <FileText className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    No template file available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-primary-200 shadow-sm bg-primary-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-900">
                Quick Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {matchedRequirement?.dueDate && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-orange-600" />
                      <span className="text-xs font-medium text-orange-900 uppercase tracking-wide">
                        Deadline
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-orange-700">
                      {format(
                        new Date(matchedRequirement.dueDate),
                        "EEEE, MMMM d, yyyy"
                      )}
                    </p>
                    {new Date(matchedRequirement.dueDate) < new Date() && (
                      <p className="text-xs text-orange-600 mt-1 font-medium">
                        ⚠️ Past due
                      </p>
                    )}
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Category:</span>
                  <Badge variant="outline" className="text-xs capitalize">
                    {template?.category}
                  </Badge>
                </div>
                {template?.isRequired && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <Badge className="bg-primary-50 text-primary-700 text-xs">
                      Required
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Component to display comments for a requirement
function RequirementCommentsCard({ requirementId }: { requirementId: string }) {
  const { data: comments, isLoading } = useRequirementComments(requirementId);

  if (isLoading) {
    return (
      <Card className="border border-primary-200 shadow-sm bg-primary-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary-600" />
            Comments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Loading comments...</p>
        </CardContent>
      </Card>
    );
  }

  if (!comments || comments.length === 0) {
    return null;
  }

  return (
    <Card className="border border-primary-200 shadow-sm bg-primary-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary-600" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {comments.map((comment: any) => (
            <div
              key={comment.id}
              className="bg-white border border-primary-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {comment.user?.firstName} {comment.user?.lastName}
                    </span>
                    {comment.user?.role === "instructor" && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-primary-50 text-primary-700 border-primary-200"
                      >
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
              </div>
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed mt-3">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
