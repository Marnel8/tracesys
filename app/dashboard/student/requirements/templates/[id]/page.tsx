"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, FileText, Upload } from "lucide-react";
import { useRequirementTemplate } from "@/hooks/requirement-template/useRequirementTemplate";
import { useCreateRequirementFromTemplate, useSubmitRequirement } from "@/hooks/requirement/useRequirement";
import { useAuth } from "@/hooks/auth/useAuth";
import { toast } from "sonner";
import { useRequirements } from "@/hooks/requirement/useRequirement";

export default function RequirementTemplateDetailPage() {
    const params = useParams() as { id: string };
    const router = useRouter();
    const { data: template } = useRequirementTemplate(params.id);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { user } = useAuth();
    const createReq = useCreateRequirementFromTemplate();
    const submitReq = useSubmitRequirement();
    const { data: myRequirements } = useRequirements({ studentId: user?.id, page: 1, limit: 200 });

    const matchedRequirement = useMemo(() => {
        return (myRequirements?.requirements || []).find((r: any) => r.templateId === template?.id);
    }, [myRequirements, template]);

    const templateDownloadUrl = useMemo(() => {
        const url = (template as any)?.templateFileUrl as string | undefined;
        if (!url) return null;
        return url.startsWith("/") ? `${process.env.NEXT_PUBLIC_API_URL}${url}` : url;
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
                await submitReq.mutateAsync({ id: matchedRequirement.id, file: selectedFile });
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
            const message = err?.message || err?.response?.data?.message || "Submission failed";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="px-4 md:px-8 lg:px-16">
            <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                    <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Back</span>
                    </Button>
                
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Requirement Template</h1>
                <p className="text-gray-600 text-sm md:text-base">View details and prepare your submission.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-l-4 border-l-primary-500">
                        <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <CardTitle className="text-xl text-gray-900">
                                        {template?.title || "Loading..."}
                                    </CardTitle>
                                    {(() => {
                                        const matched = matchedRequirement;
                                        if (!matched) return null;
                                        const color = matched.status === "approved" ? "bg-green-100 text-green-800" : matched.status === "submitted" ? "bg-blue-100 text-blue-800" : matched.status === "rejected" ? "bg-rose-100 text-rose-800" : "bg-gray-100 text-gray-800";
                                        return (
                                            <Badge className={`w-fit ${color} capitalize`}>
                                                {matched.status}
                                            </Badge>
                                        );
                                    })()}
                                    {template?.isRequired && (
                                        <Badge className="bg-red-100 text-red-800 border-red-200 w-fit">
                                            Required Submission
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs capitalize">
                                        {template?.category}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs capitalize">
                                        {template?.priority}
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {template?.description && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-700 leading-relaxed">{template.description}</p>
                                </div>
                            )}
                            {template?.instructions && (
                                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <p className="text-sm font-medium text-blue-900">Instructions</p>
                                    </div>
                                    <p className="text-sm text-blue-800 whitespace-pre-wrap leading-relaxed">{template.instructions}</p>
                                </div>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                {allowedTypes.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Allowed File Types</p>
                                        <div className="flex flex-wrap gap-1">
                                            {allowedTypes.map((type: string) => (
                                                <Badge key={type} variant="secondary" className="text-xs px-2 py-1">
                                                    {type}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {typeof template?.maxFileSize === "number" && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Maximum File Size</p>
                                        <p className="text-sm text-gray-700">{template?.maxFileSize} MB</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg text-gray-900">Submit Your Work</CardTitle>
                            <p className="text-sm text-gray-600">Upload your completed requirement file</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input ref={fileInputRef} type="file" onChange={onFileChange} className="hidden" accept={allowedTypes.length ? allowedTypes.map((t) => `.${t}`).join(",") : undefined} />
                                    <Button 
                                        variant="outline" 
                                        onClick={onChooseFile} 
                                        className="flex-1 sm:flex-none border-dashed border-2 border-gray-300 hover:border-primary-400 hover:bg-primary-50"
                                    >
                                        <Upload className="w-4 h-4 mr-2" />
                                        {selectedFile ? selectedFile.name : (matchedRequirement?.fileName ? `Current: ${matchedRequirement.fileName}` : "Choose file to upload")}
                                    </Button>
                                    {matchedRequirement?.fileUrl && (
                                        <a
                                            href={matchedRequirement.fileUrl.startsWith("/") ? `${process.env.NEXT_PUBLIC_API_URL}${matchedRequirement.fileUrl}` : matchedRequirement.fileUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="sm:flex-none"
                                        >
                                            <Button variant="outline" className="whitespace-nowrap">Preview</Button>
                                        </a>
                                    )}
                                    <Button 
                                        onClick={onSubmit}
                                        disabled={!selectedFile || isSubmitting}
                                        className="bg-primary-500 hover:bg-primary-600 disabled:opacity-60 disabled:cursor-not-allowed px-6"
                                    >
                                        {isSubmitting ? "Submitting..." : matchedRequirement ? "Update Submission" : "Submit"}
                                    </Button>
                                </div>
                                {selectedFile ? (
                                    <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                                        <p className="text-sm text-green-800">
                                            <strong>Selected:</strong> {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                                        </p>
                                    </div>
                                ) : matchedRequirement?.fileName ? (
                                    <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                                        <p className="text-sm text-gray-700">
                                            <strong>Current file:</strong> {matchedRequirement.fileName}
                                            {typeof matchedRequirement.fileSize === "number" && (
                                                <> ({(matchedRequirement.fileSize / 1024 / 1024).toFixed(2)} MB)</>
                                            )}
                                        </p>
                                    </div>
                                ) : null}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {matchedRequirement?.feedback && (
                        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-green-200">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-green-600" />
                                    Instructor Feedback
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-white/70 border border-green-200 rounded-lg p-3">
                                    <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                                        {matchedRequirement.feedback}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-600" />
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
                                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
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
                                    <p className="text-sm text-gray-600">No template file available</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg text-gray-900">Quick Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Category:</span>
                                    <Badge variant="outline" className="text-xs capitalize">
                                        {template?.category}
                                    </Badge>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Priority:</span>
                                    <Badge variant="secondary" className="text-xs capitalize">
                                        {template?.priority}
                                    </Badge>
                                </div>
                                {template?.isRequired && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Status:</span>
                                        <Badge className="bg-red-100 text-red-800 text-xs">
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


