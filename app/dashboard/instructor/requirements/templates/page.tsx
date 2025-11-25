"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  FileText,
  Download,
} from "lucide-react";
import { InstructorStatsCard } from "@/components/instructor-stats-card";
import {
  useRequirementTemplates,
  useCreateRequirementTemplate,
  useUpdateRequirementTemplate,
  useDeleteRequirementTemplate,
  useToggleRequirementTemplateStatus,
} from "@/hooks/requirement-template";
import type {
  RequirementTemplate as APIRequirementTemplate,
  RequirementCategory,
  RequirementPriority,
} from "@/hooks/requirement-template/useRequirementTemplate";

// Use API types to ensure alignment with server response
type RequirementTemplate = APIRequirementTemplate;

type NewTemplate = {
  title: string;
  description: string;
  category: RequirementCategory;
  priority: RequirementPriority;
  isRequired: boolean;
  allowedFileTypes: string[];
  maxFileSize: number; // in MB
  instructions: string;
  isActive: boolean;
};

// Server-driven data via hooks

export default function RequirementTemplatesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading } = useRequirementTemplates({ page, limit });
  const templates =
    (data?.requirementTemplates as RequirementTemplate[] | undefined) || [];
  const pagination = data?.pagination;

  const createTemplate = useCreateRequirementTemplate();
  const updateTemplate = useUpdateRequirementTemplate();
  const deleteTemplate = useDeleteRequirementTemplate();
  const toggleTemplateStatus = useToggleRequirementTemplateStatus();

  const [newTemplateFile, setNewTemplateFile] = useState<File | null>(null);
  const [editTemplateFile, setEditTemplateFile] = useState<File | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<RequirementTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState<NewTemplate>({
    title: "",
    description: "",
    category: "health",
    priority: "medium",
    isRequired: true,
    allowedFileTypes: [],
    maxFileSize: 5,
    instructions: "",
    isActive: true,
  });

  const handleCreateTemplate = () => {
    createTemplate.mutate(
      {
        title: newTemplate.title,
        description: newTemplate.description,
        category: newTemplate.category,
        priority: newTemplate.priority,
        isRequired: newTemplate.isRequired,
        instructions: newTemplate.instructions || "",
        allowedFileTypes: newTemplate.allowedFileTypes,
        maxFileSize: newTemplate.maxFileSize,
        isActive: newTemplate.isActive,
        templateFile: newTemplateFile || undefined,
      },
      {
        onSuccess: () => {
          setIsCreateDialogOpen(false);
          resetForm();
          setNewTemplateFile(null);
        },
      }
    );
  };

  const handleEditTemplate = () => {
    if (!selectedTemplate) return;

    updateTemplate.mutate(
      {
        id: selectedTemplate.id,
        data: {
          title: selectedTemplate.title,
          description: selectedTemplate.description,
          category: selectedTemplate.category,
          priority: selectedTemplate.priority,
          isRequired: selectedTemplate.isRequired,
          instructions: selectedTemplate.instructions || "",
          allowedFileTypes: Array.isArray(selectedTemplate.allowedFileTypes)
            ? selectedTemplate.allowedFileTypes
            : typeof selectedTemplate.allowedFileTypes === "string"
            ? selectedTemplate.allowedFileTypes.split(",").filter(Boolean)
            : [],
          maxFileSize: selectedTemplate.maxFileSize,
          isActive: selectedTemplate.isActive,
          templateFile: editTemplateFile || undefined,
        },
      },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false);
          setSelectedTemplate(null);
          setEditTemplateFile(null);
        },
      }
    );
  };

  const handleDeleteTemplate = (id: string) => {
    deleteTemplate.mutate(id);
  };

  const handleToggleActive = (template: RequirementTemplate) => {
    toggleTemplateStatus.mutate({
      id: template.id,
      isActive: !template.isActive,
    });
  };

  const resetForm = () => {
    setNewTemplate({
      title: "",
      description: "",
      category: "health",
      priority: "medium",
      isRequired: true,
      allowedFileTypes: [],
      maxFileSize: 5,
      instructions: "",
      isActive: true,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "urgent":
        return "bg-red-200 text-red-900 capitalize";
      case "high":
        return "bg-red-100 text-red-800 capitalize";
      case "medium":
        return "bg-yellow-100 text-yellow-800 capitalize";
      case "low":
        return "bg-green-100 text-green-800 capitalize";
      default:
        return "bg-gray-100 text-gray-800 capitalize";
    }
  };

  const totalPages = pagination?.totalPages ?? 1;
  const currentPage = pagination?.currentPage ?? page;
  const itemsPerPage = pagination?.itemsPerPage ?? limit;
  const totalItems = pagination?.totalItems ?? templates.length;
  const activeTemplatesCount = templates.filter((t) => t.isActive).length;
  const requiredTemplatesCount = templates.filter((t) => t.isRequired).length;

  const startIndex =
    totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = totalItems === 0 ? 0 : startIndex + templates.length - 1;

  const buildPages = (current: number, total: number): (number | "...")[] => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 4) {
      return [1, 2, 3, 4, 5, "...", total];
    }
    if (current >= total - 3) {
      return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, "...", current - 1, current, current + 1, "...", total];
  };

  return (
    <div className="space-y-6">
      {isLoading && (
        <div className="text-sm text-gray-500">Loading templates...</div>
      )}
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Requirement Templates
          </h1>
          <p className="text-gray-600">
            Manage requirement templates for student submissions
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-11 border border-primary-500 bg-primary-50 px-6 text-primary-700 transition-all duration-300 hover:border-primary-400 hover:bg-primary-50/50 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="invitation-card sm:max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Requirement Template</DialogTitle>
              <DialogDescription>
                Create a new requirement template that students will need to
                submit.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={newTemplate.title}
                    onChange={(e) =>
                      setNewTemplate({ ...newTemplate, title: e.target.value })
                    }
                    placeholder="e.g., Medical Certificate"
                    className="invitation-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newTemplate.category}
                    onValueChange={(value) =>
                      setNewTemplate({
                        ...newTemplate,
                        category: value as RequirementCategory,
                      })
                    }
                  >
                    <SelectTrigger className="invitation-select-trigger">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="reports">Reports</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="evaluation">Evaluation</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newTemplate.priority}
                    onValueChange={(value) =>
                      setNewTemplate({
                        ...newTemplate,
                        priority: value as RequirementPriority,
                      })
                    }
                  >
                    <SelectTrigger className="invitation-select-trigger">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newTemplate.description}
                  onChange={(e) =>
                    setNewTemplate({
                      ...newTemplate,
                      description: e.target.value,
                    })
                  }
                  placeholder="Brief description of the requirement"
                  className="invitation-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={newTemplate.instructions}
                  onChange={(e) =>
                    setNewTemplate({
                      ...newTemplate,
                      instructions: e.target.value,
                    })
                  }
                  placeholder="Detailed instructions for students..."
                  rows={4}
                  className="invitation-textarea"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="templateFile">Template File (optional)</Label>
                <input
                  type="file"
                  id="templateFile"
                  accept=".docx"
                  onChange={(e) =>
                    setNewTemplateFile(e.target.files?.[0] || null)
                  }
                  className="invitation-input cursor-pointer file:text-sm"
                />
                {newTemplateFile && (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">{newTemplateFile.name}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Allowed File Types</Label>
                  <div className="space-y-2">
                    {["PDF", "JPG", "PNG", "DOC", "DOCX", "ZIP"].map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={type}
                          checked={newTemplate.allowedFileTypes.includes(type)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewTemplate({
                                ...newTemplate,
                                allowedFileTypes: [
                                  ...newTemplate.allowedFileTypes,
                                  type,
                                ],
                              });
                            } else {
                              setNewTemplate({
                                ...newTemplate,
                                allowedFileTypes:
                                  newTemplate.allowedFileTypes.filter(
                                    (t) => t !== type
                                  ),
                              });
                            }
                          }}
                        />
                        <Label htmlFor={type}>{type}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    min={1}
                    value={newTemplate.maxFileSize ?? 0}
                    onChange={(e) =>
                      setNewTemplate({
                        ...newTemplate,
                        maxFileSize: Number(e.target.value || 0),
                      })
                    }
                  />
                </div>
              </div>

              {/* Courses/Sections removed: not part of server model */}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isRequired"
                  checked={newTemplate.isRequired}
                  onCheckedChange={(checked) =>
                    setNewTemplate({
                      ...newTemplate,
                      isRequired: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="isRequired">
                  This is a required submission
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={newTemplate.isActive}
                  onCheckedChange={(checked) =>
                    setNewTemplate({
                      ...newTemplate,
                      isActive: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="isActive">Template is active</Label>
              </div>

              {/* Template file upload removed: no file field in server model */}
            </div>
            <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                className="invitation-back-btn w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateTemplate}
                className="invitation-primary-btn w-full sm:w-auto"
              >
                Create Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InstructorStatsCard
          label="Total Templates"
          value={totalItems}
          helperText="Configured requirements"
        />
        <InstructorStatsCard
          label="Active Templates"
          value={activeTemplatesCount}
          helperText="Currently assigned"
          trend={
            activeTemplatesCount > 0
              ? { label: `${activeTemplatesCount} active`, variant: "positive" }
              : undefined
          }
        />
        <InstructorStatsCard
          label="Required"
          value={requiredTemplatesCount}
          helperText="Marked as mandatory"
          trend={
            requiredTemplatesCount > 0
              ? { label: "Needs monitoring", variant: "neutral" }
              : undefined
          }
        />

        {/* Usage/Downloads removed: not part of server model */}
      </div>

      {/* Templates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Requirement Templates</CardTitle>
          <CardDescription>
            Manage and configure requirement templates for students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>File Types</TableHead>
                  <TableHead>Max Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div className="text-sm text-gray-500">
                        No templates found.
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">
                          {template.title}
                        </div>
                        <div className="text-sm text-gray-600">
                          {template.description}
                        </div>
                        {"templateFileUrl" in template &&
                          (template as any).templateFileUrl && (
                            <div className="flex items-center gap-1 mt-1">
                              <FileText className="w-3 h-3 text-blue-600" />
                              <a
                                className="text-xs text-blue-600 hover:underline"
                                href={
                                  (template as any).templateFileUrl as string
                                }
                                target="_blank"
                                rel="noreferrer"
                              >
                                {(template as any).templateFileName ||
                                  "Download template"}
                              </a>
                            </div>
                          )}
                        {template.isRequired && (
                          <Badge
                            variant="secondary"
                            className="bg-red-100 text-red-800 text-xs mt-1"
                          >
                            Required
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs capitalize">
                        {template.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={getPriorityColor(template.priority)}
                      >
                        {template.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(
                          (Array.isArray(template.allowedFileTypes)
                            ? template.allowedFileTypes
                            : typeof template.allowedFileTypes === "string"
                            ? template.allowedFileTypes
                                .split(",")
                                .filter(Boolean)
                            : []) as string[]
                        )
                          .filter((t: string) => t.toUpperCase() === "DOCX")
                          .map((type: string) => (
                            <Badge
                              key={type}
                              variant="outline"
                              className="text-xs"
                            >
                              {type}
                            </Badge>
                          ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-gray-700">
                        {template.maxFileSize ?? 0} MB
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={template.isActive}
                          onCheckedChange={() => handleToggleActive(template)}
                        />
                        <span className="text-sm">
                          {template.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedTemplate(template);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Template
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Template
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="invitation-card sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Requirement Template</DialogTitle>
            <DialogDescription>
              Update the requirement template details.
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title *</Label>
                  <Input
                    id="edit-title"
                    value={selectedTemplate.title}
                    onChange={(e) =>
                      setSelectedTemplate({
                        ...selectedTemplate,
                        title: e.target.value,
                      })
                    }
                    className="invitation-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select
                    value={selectedTemplate.category as any}
                    onValueChange={(value) =>
                      setSelectedTemplate({
                        ...selectedTemplate,
                        category: value as any,
                      })
                    }
                  >
                    <SelectTrigger className="invitation-select-trigger">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="reports">Reports</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="evaluation">Evaluation</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select
                    value={selectedTemplate.priority as any}
                    onValueChange={(value) =>
                      setSelectedTemplate({
                        ...selectedTemplate,
                        priority: value as any,
                      })
                    }
                  >
                    <SelectTrigger className="invitation-select-trigger">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={selectedTemplate.description}
                  onChange={(e) =>
                    setSelectedTemplate({
                      ...selectedTemplate,
                      description: e.target.value,
                    })
                  }
                  className="invitation-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-instructions">Instructions</Label>
                <Textarea
                  id="edit-instructions"
                  value={selectedTemplate.instructions ?? ""}
                  onChange={(e) =>
                    setSelectedTemplate({
                      ...selectedTemplate,
                      instructions: e.target.value,
                    })
                  }
                  rows={4}
                  className="invitation-textarea"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-templateFile">
                  Template File (optional)
                </Label>
                <input
                  type="file"
                  id="edit-templateFile"
                  accept=".docx"
                  onChange={(e) =>
                    setEditTemplateFile(e.target.files?.[0] || null)
                  }
                  className="invitation-input cursor-pointer file:text-sm"
                />
                {(editTemplateFile ||
                  ("templateFileUrl" in selectedTemplate &&
                    (selectedTemplate as any).templateFileUrl)) && (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <FileText className="w-4 h-4 text-blue-600" />
                    {editTemplateFile ? (
                      <span className="text-sm">{editTemplateFile.name}</span>
                    ) : (
                      <a
                        className="text-sm text-blue-600 hover:underline"
                        href={(selectedTemplate as any).templateFileUrl || "#"}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {(selectedTemplate as any).templateFileName ||
                          "Download template"}
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-isRequired"
                  checked={selectedTemplate.isRequired}
                  onCheckedChange={(checked) =>
                    setSelectedTemplate({
                      ...selectedTemplate,
                      isRequired: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="edit-isRequired">
                  This is a required submission
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-isActive"
                  checked={selectedTemplate.isActive}
                  onCheckedChange={(checked) =>
                    setSelectedTemplate({
                      ...selectedTemplate,
                      isActive: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="edit-isActive">Template is active</Label>
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="invitation-back-btn w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditTemplate}
              className="invitation-primary-btn w-full sm:w-auto"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
