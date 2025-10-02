"use client";

import { useMemo, useState } from "react";
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
} from "lucide-react";
import Link from "next/link";
import { useRequirementTemplates } from "@/hooks/requirement-template/useRequirementTemplate";
import { useRequirements } from "@/hooks/requirement/useRequirement";
import { useAuth } from "@/hooks/auth/useAuth";

export default function RequirementsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [activeTab, setActiveTab] = useState<"templates" | "submissions">("templates");
    
    const { user } = useAuth();
    const { data: templatesData } = useRequirementTemplates({ page: 1, limit: 100, search: searchTerm || undefined, status: "active" });
    const { data: requirementsData } = useRequirements({ 
        page: 1, 
        limit: 100, 
        search: searchTerm || undefined, 
        studentId: user?.id 
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
                return "bg-green-100 text-green-800";
            case "submitted":
                return "bg-blue-100 text-blue-800";
            case "in-progress":
                return "bg-yellow-100 text-yellow-800";
            case "pending":
                return "bg-red-100 text-red-800";
            case "rejected":
                return "bg-rose-100 text-rose-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "urgent":
                return "text-red-600";
            case "high":
                return "text-orange-600";
            case "medium":
                return "text-yellow-600";
            case "low":
                return "text-green-600";
            default:
                return "text-gray-600";
        }
    };

    const approvedCount = requirements.filter((r: any) => r.status === "approved").length;
    const submittedCount = requirements.filter((r: any) => r.status === "submitted").length;
    const totalCount = templates.length;
    const completionPercentage = totalCount > 0 ? (approvedCount / totalCount) * 100 : 0;

    const getTemplateFileUrl = (url?: string | null) => {
        if (!url) return null;
        return url.startsWith("/") ? `${process.env.NEXT_PUBLIC_API_URL}${url}` : url;
    };

    return (
        <div className="px-4 md:px-8 lg:px-16">
            <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                    <Link href="/dashboard/student">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Back to Dashboard</span>
                        </Button>
                    </Link>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    Requirements
                </h1>
                <p className="text-gray-600 text-sm md:text-base">
                    Track and submit your practicum requirements.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Completion Rate</span>
                            <span className="text-sm text-gray-600">
                                {approvedCount}/{totalCount}
                            </span>
                        </div>
                        <Progress value={completionPercentage} className="h-2 mb-2" />
                        <span className="text-xs text-gray-500">
                            {completionPercentage.toFixed(0)}% Complete
                        </span>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium">Approved</span>
                        </div>
                        <span className="text-2xl font-bold text-green-600">
                            {approvedCount}
                        </span>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm font-medium">Submitted</span>
                        </div>
                        <span className="text-2xl font-bold text-yellow-600">
                            {submittedCount}
                        </span>
                    </CardContent>
                </Card>
            </div>

            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search requirements..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                            {categories.map((category) => (
                                <Button
                                    key={category.value}
                                    variant={
                                        selectedCategory === category.value ? "default" : "outline"
                                    }
                                    size="sm"
                                    onClick={() => setSelectedCategory(category.value)}
                                    className="whitespace-nowrap"
                                >
                                    {category.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6">
                <Button
                    variant={activeTab === "templates" ? "default" : "outline"}
                    onClick={() => setActiveTab("templates")}
                    className="flex items-center gap-2"
                >
                    <FileText className="w-4 h-4" />
                    Available Templates ({templates.length})
                </Button>
                <Button
                    variant={activeTab === "submissions" ? "default" : "outline"}
                    onClick={() => setActiveTab("submissions")}
                    className="flex items-center gap-2"
                >
                    <FileCheck className="w-4 h-4" />
                    My Submissions ({requirements.length})
                </Button>
            </div>

            <div className="space-y-6">
                {activeTab === "templates" && templates.map((template: any) => {
                    const templateDownloadUrl = getTemplateFileUrl((template as any).templateFileUrl);
                    return (
                        <Card key={template.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary-500">
                            <CardContent className="p-6">
                                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                                                        {template.title}
                                                    </h3>
                                                    {/* Submission indicator for this template (if any) */}
                                                    {(() => {
                                                        const matched = requirements
                                                            .filter((r: any) => r.templateId === template.id)
                                                            .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
                                                        if (!matched) return null;
                                                        return (
                                                            <Badge className={`${getStatusColor(matched.status)} capitalize`}>
                                                                {matched.status}
                                                            </Badge>
                                                        );
                                                    })()}
                                                    {template.isRequired && (
                                                        <Badge className="bg-red-100 text-red-800 border-red-200">
                                                            Required
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 leading-relaxed">
                                                    {template.description}
                                                </p>
                                                
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100">
                                                    <AlertTriangle className={`w-3 h-3 ${getPriorityColor(template.priority)}`} />
                                                    <span className={`text-xs font-medium capitalize ${getPriorityColor(template.priority)}`}>
                                                        {template.priority}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-medium text-gray-500">Category:</span>
                                                <Badge variant="outline" className="text-xs capitalize">
                                                    {template.category}
                                                </Badge>
                                            </div>
                                            {(Array.isArray(template.allowedFileTypes) ? template.allowedFileTypes : []).length > 0 && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium text-gray-500">Allowed types:</span>
                                                    <div className="flex gap-1">
                                                        {(Array.isArray(template.allowedFileTypes) ? template.allowedFileTypes : []).map((t: string) => (
                                                            <Badge key={t} variant="secondary" className="text-xs px-2 py-1">
                                                                {t}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {typeof template.maxFileSize === "number" && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium text-gray-500">Max size:</span>
                                                    <span className="text-xs text-gray-700">{template.maxFileSize} MB</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-row lg:flex-col gap-3 ">
                                        <Link href={`/dashboard/student/requirements/templates/${template.id}`} className="flex-1">
                                            <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200">
                                                <Eye className="w-4 h-4 mr-2" />
                                                View Details
                                            </Button>
                                        </Link>
                                        {templateDownloadUrl && (
                                            <a href={templateDownloadUrl} target="_blank" rel="noreferrer" className="flex-1">
                                                <Button size="sm" variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200">
                                                    <Download className="w-4 h-4 mr-2" />
                                                    Download Template
                                                </Button>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}

                {activeTab === "submissions" && requirements.map((requirement: any) => {
                    const getStatusIcon = (status: string) => {
                        switch (status) {
                            case "approved":
                                return <CheckCircle className="w-4 h-4 text-green-600" />;
                            case "submitted":
                                return <Clock className="w-4 h-4 text-blue-600" />;
                            case "rejected":
                                return <XCircle className="w-4 h-4 text-red-600" />;
                            case "pending":
                                return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
                            default:
                                return <Clock className="w-4 h-4 text-gray-600" />;
                        }
                    };

                    return (
                        <Card key={requirement.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary-500">
                            <CardContent className="p-6">
                                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                                                        {requirement.title}
                                                    </h3>
                                                    <Badge className={getStatusColor(requirement.status)}>
                                                        {requirement.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-600 leading-relaxed">
                                                    {requirement.description}
                                                </p>
                                                {requirement.fileName && (
                                                    <div className="flex items-center text-sm text-blue-600">
                                                        <FileText className="w-4 h-4 mr-2" />
                                                        Submitted: {requirement.fileName}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100">
                                                    {getStatusIcon(requirement.status)}
                                                    <span className={`text-xs font-medium capitalize ${getPriorityColor(requirement.priority)}`}>
                                                        {requirement.priority}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-medium text-gray-500">Category:</span>
                                                <Badge variant="outline" className="text-xs capitalize">
                                                    {requirement.category}
                                                </Badge>
                                            </div>
                                            {requirement.submittedDate && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium text-gray-500">Submitted:</span>
                                                    <span className="text-xs text-gray-700">
                                                        {new Date(requirement.submittedDate).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}
                                            {requirement.approvedDate && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium text-gray-500">Approved:</span>
                                                    <span className="text-xs text-gray-700">
                                                        {new Date(requirement.approvedDate).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {requirement.feedback && (
                                            <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                                                <p className="text-xs font-medium text-gray-500 mb-1">Feedback:</p>
                                                <p className="text-sm text-gray-700">{requirement.feedback}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-row lg:flex-col gap-3 lg:w-40">
                                        <Link href={`/dashboard/student/requirements/${requirement.id}`} className="flex-1">
                                            <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200">
                                                <Eye className="w-4 h-4 mr-2" />
                                                View Details
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}

                {activeTab === "templates" && templates.length === 0 && (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <h3 className="font-medium text-gray-900 mb-2">No templates found</h3>
                            <p className="text-sm text-gray-600">Try adjusting your search or filter criteria.</p>
                        </CardContent>
                    </Card>
                )}

                {activeTab === "submissions" && requirements.length === 0 && (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <FileCheck className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <h3 className="font-medium text-gray-900 mb-2">No submissions found</h3>
                            <p className="text-sm text-gray-600">You haven't submitted any requirements yet. Check the templates tab to get started.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
