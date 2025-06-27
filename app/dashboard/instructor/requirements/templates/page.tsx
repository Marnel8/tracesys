"use client";

import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { COURSES, getSectionOptions } from "@/data/instructor-courses";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
	Plus,
	Edit,
	Trash2,
	MoreHorizontal,
	FileText,
	Copy,
	Eye,
	Upload,
	Download,
} from "lucide-react";

// Type definitions
type TemplateFile = {
	name: string;
	size: string;
	type: string;
	uploadedAt: string;
};

type RequirementTemplate = {
	id: number;
	title: string;
	description: string;
	priority: string;
	isRequired: boolean;
	templateFile?: TemplateFile;
	fileTypes: string[];
	maxFileSize: string;
	instructions: string;
	courses: string[];
	sections: string[];
	isActive: boolean;
	createdAt: string;
	usageCount: number;
	downloadCount: number;
};

type NewTemplate = {
	title: string;
	description: string;
	priority: string;
	isRequired: boolean;
	templateFile?: TemplateFile;
	fileTypes: string[];
	maxFileSize: string;
	instructions: string;
	courses: string[];
	sections: string[];
	isActive: boolean;
};

// Mock data for requirement templates
const requirementTemplates: RequirementTemplate[] = [
	{
		id: 1,
		title: "Medical Certificate",
		description: "Valid medical certificate from a licensed physician",
		priority: "High",
		isRequired: true,
		templateFile: {
			name: "medical-certificate-template.docx",
			size: "45KB",
			type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			uploadedAt: "2024-01-10",
		},
		fileTypes: ["PDF", "DOCX"],
		maxFileSize: "5MB",
		instructions:
			"Download the template, fill it out completely, and submit the signed document.",
		courses: ["BSIT"],
		sections: ["BSIT 4A", "BSIT 4B"],
		isActive: true,
		createdAt: "2024-01-10",
		usageCount: 42,
		downloadCount: 156,
	},
	{
		id: 2,
		title: "Company MOA",
		description: "Memorandum of Agreement between student and company",
		priority: "High",
		isRequired: true,
		templateFile: {
			name: "company-moa-template.docx",
			size: "78KB",
			type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			uploadedAt: "2024-01-08",
		},
		fileTypes: ["PDF", "DOCX"],
		maxFileSize: "10MB",
		instructions:
			"Download the MOA template, complete all required fields, and get signatures from both parties.",
		courses: ["BSIT"],
		sections: ["BSIT 4A", "BSIT 4B", "BSIT 4C", "BSIT 4D"],
		isActive: true,
		createdAt: "2024-01-08",
		usageCount: 38,
		downloadCount: 124,
	},
];

export default function RequirementTemplatesPage() {
	const [templates, setTemplates] =
		useState<RequirementTemplate[]>(requirementTemplates);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [selectedTemplate, setSelectedTemplate] =
		useState<RequirementTemplate | null>(null);
	const [newTemplate, setNewTemplate] = useState<NewTemplate>({
		title: "",
		description: "",
		priority: "Medium",
		isRequired: true,
		fileTypes: [],
		maxFileSize: "5MB",
		instructions: "",
		courses: [],
		sections: [],
		isActive: true,
	});

	const handleCreateTemplate = () => {
		const template: RequirementTemplate = {
			...newTemplate,
			id: Math.max(...templates.map((t) => t.id)) + 1,
			createdAt: new Date().toISOString().split("T")[0],
			usageCount: 0,
			downloadCount: 0,
		};
		setTemplates([...templates, template]);
		setIsCreateDialogOpen(false);
		resetForm();
	};

	const handleEditTemplate = () => {
		if (!selectedTemplate) return;

		setTemplates(
			templates.map((t) =>
				t.id === selectedTemplate.id ? selectedTemplate : t
			)
		);
		setIsEditDialogOpen(false);
		setSelectedTemplate(null);
	};

	const handleDeleteTemplate = (id: number) => {
		setTemplates(templates.filter((t) => t.id !== id));
	};

	const handleToggleActive = (id: number) => {
		setTemplates(
			templates.map((t) => (t.id === id ? { ...t, isActive: !t.isActive } : t))
		);
	};

	const resetForm = () => {
		setNewTemplate({
			title: "",
			description: "",
			priority: "Medium",
			isRequired: true,
			fileTypes: [],
			maxFileSize: "5MB",
			instructions: "",
			courses: [],
			sections: [],
			isActive: true,
		});
	};

	const getPriorityColor = (priority: string) => {
		switch (priority.toLowerCase()) {
			case "high":
				return "bg-red-100 text-red-800";
			case "medium":
				return "bg-yellow-100 text-yellow-800";
			case "low":
				return "bg-green-100 text-green-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	return (
		<div className="space-y-6">
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
						<Button className="bg-primary-500 hover:bg-primary-600">
							<Plus className="w-4 h-4 mr-2" />
							New Template
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
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
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="priority">Priority</Label>
									<Select
										value={newTemplate.priority}
										onValueChange={(value) =>
											setNewTemplate({ ...newTemplate, priority: value })
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="High">High</SelectItem>
											<SelectItem value="Medium">Medium</SelectItem>
											<SelectItem value="Low">Low</SelectItem>
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
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>Allowed File Types</Label>
									<div className="space-y-2">
										{["PDF", "JPG", "PNG", "DOC", "DOCX", "ZIP"].map((type) => (
											<div key={type} className="flex items-center space-x-2">
												<Checkbox
													id={type}
													checked={newTemplate.fileTypes.includes(type)}
													onCheckedChange={(checked) => {
														if (checked) {
															setNewTemplate({
																...newTemplate,
																fileTypes: [...newTemplate.fileTypes, type],
															});
														} else {
															setNewTemplate({
																...newTemplate,
																fileTypes: newTemplate.fileTypes.filter(
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
									<Label htmlFor="maxFileSize">Max File Size</Label>
									<Select
										value={newTemplate.maxFileSize}
										onValueChange={(value) =>
											setNewTemplate({ ...newTemplate, maxFileSize: value })
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="1MB">1 MB</SelectItem>
											<SelectItem value="3MB">3 MB</SelectItem>
											<SelectItem value="5MB">5 MB</SelectItem>
											<SelectItem value="10MB">10 MB</SelectItem>
											<SelectItem value="25MB">25 MB</SelectItem>
											<SelectItem value="50MB">50 MB</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>Target Courses</Label>
									<div className="space-y-2">
										<div className="flex items-center space-x-2">
											<Checkbox
												id="BSIT"
												checked={newTemplate.courses.includes("BSIT")}
												onCheckedChange={(checked) => {
													if (checked) {
														setNewTemplate({
															...newTemplate,
															courses: ["BSIT"],
														});
													} else {
														setNewTemplate({
															...newTemplate,
															courses: [],
														});
													}
												}}
											/>
											<Label htmlFor="BSIT">BSIT</Label>
										</div>
									</div>
								</div>
								<div className="space-y-2">
									<Label>Target Sections</Label>
									<div className="space-y-2">
										{["BSIT 4A", "BSIT 4B", "BSIT 4C", "BSIT 4D"].map(
											(section) => (
												<div
													key={section}
													className="flex items-center space-x-2"
												>
													<Checkbox
														id={section}
														checked={newTemplate.sections.includes(section)}
														onCheckedChange={(checked) => {
															if (checked) {
																setNewTemplate({
																	...newTemplate,
																	sections: [...newTemplate.sections, section],
																});
															} else {
																setNewTemplate({
																	...newTemplate,
																	sections: newTemplate.sections.filter(
																		(s) => s !== section
																	),
																});
															}
														}}
													/>
													<Label htmlFor={section}>{section}</Label>
												</div>
											)
										)}
									</div>
								</div>
							</div>

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

							<div className="space-y-2">
								<Label htmlFor="templateFile">Template File</Label>
								<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
									<input
										type="file"
										id="templateFile"
										accept=".docx,.doc,.pdf,.xlsx,.xls,.pptx,.ppt"
										className="hidden"
										onChange={(e) => {
											const file = e.target.files?.[0];
											if (file) {
												setNewTemplate({
													...newTemplate,
													templateFile: {
														name: file.name,
														size: `${Math.round(file.size / 1024)}KB`,
														type: file.type,
														uploadedAt: new Date().toISOString().split("T")[0],
													},
												});
											}
										}}
									/>
									<label htmlFor="templateFile" className="cursor-pointer">
										<div className="flex flex-col items-center">
											<Upload className="w-8 h-8 text-gray-400 mb-2" />
											<p className="text-sm text-gray-600">
												Click to upload template file
											</p>
											<p className="text-xs text-gray-500 mt-1">
												DOCX, PDF, XLSX, PPTX (max 50MB)
											</p>
										</div>
									</label>
								</div>
								{newTemplate.templateFile && (
									<div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
										<FileText className="w-4 h-4 text-blue-600" />
										<span className="text-sm">
											{newTemplate.templateFile.name}
										</span>
										<span className="text-xs text-gray-500">
											({newTemplate.templateFile.size})
										</span>
									</div>
								)}
							</div>
						</div>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setIsCreateDialogOpen(false)}
							>
								Cancel
							</Button>
							<Button
								onClick={handleCreateTemplate}
								className="bg-primary-500 hover:bg-primary-600"
							>
								Create Template
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card className="bg-secondary-50 border-primary-200">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600">Total Templates</p>
								<p className="text-2xl font-bold text-gray-900">
									{templates.length}
								</p>
							</div>
							<FileText className="w-8 h-8 text-primary-600" />
						</div>
					</CardContent>
				</Card>

				<Card className="bg-secondary-50 border-green-200">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600">Active Templates</p>
								<p className="text-2xl font-bold text-green-600">
									{templates.filter((t) => t.isActive).length}
								</p>
							</div>
							<Badge className="bg-green-100 text-green-800">Active</Badge>
						</div>
					</CardContent>
				</Card>

				<Card className="bg-secondary-50 border-red-200">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600">Required</p>
								<p className="text-2xl font-bold text-red-600">
									{templates.filter((t) => t.isRequired).length}
								</p>
							</div>
							<Badge className="bg-red-100 text-red-800">Required</Badge>
						</div>
					</CardContent>
				</Card>

				<Card className="bg-secondary-50 border-blue-200">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600">Total Usage</p>
								<p className="text-2xl font-bold text-blue-600">
									{templates.reduce((sum, t) => sum + t.usageCount, 0)}
								</p>
							</div>
							<Eye className="w-8 h-8 text-blue-600" />
						</div>
					</CardContent>
				</Card>

				<Card className="bg-secondary-50 border-purple-200">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600">Total Downloads</p>
								<p className="text-2xl font-bold text-purple-600">
									{templates.reduce(
										(sum, t) => sum + (t.downloadCount || 0),
										0
									)}
								</p>
							</div>
							<Download className="w-8 h-8 text-purple-600" />
						</div>
					</CardContent>
				</Card>
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
									<TableHead>Priority</TableHead>
									<TableHead>File Types</TableHead>
									<TableHead>Target</TableHead>
									<TableHead>Usage</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
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
												{template.templateFile && (
													<div className="flex items-center gap-1 mt-1">
														<FileText className="w-3 h-3 text-blue-600" />
														<span className="text-xs text-blue-600">
															{template.templateFile.name}
														</span>
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
											<Badge
												variant="secondary"
												className={getPriorityColor(template.priority)}
											>
												{template.priority}
											</Badge>
										</TableCell>
										<TableCell>
											<div className="flex flex-wrap gap-1">
												{template.fileTypes.map((type) => (
													<Badge
														key={type}
														variant="outline"
														className="text-xs"
													>
														{type}
													</Badge>
												))}
											</div>
											<div className="text-xs text-gray-500 mt-1">
												Max: {template.maxFileSize}
											</div>
										</TableCell>
										<TableCell>
											<div className="text-sm">
												<div>Courses: {template.courses.join(", ")}</div>
												<div>Sections: {template.sections.join(", ")}</div>
											</div>
										</TableCell>
										<TableCell>
											<div className="text-sm font-medium">
												{template.usageCount} students
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<Switch
													checked={template.isActive}
													onCheckedChange={() =>
														handleToggleActive(template.id)
													}
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
													<DropdownMenuItem>
														<Copy className="mr-2 h-4 w-4" />
														Duplicate Template
													</DropdownMenuItem>
													<DropdownMenuItem>
														<Eye className="mr-2 h-4 w-4" />
														View Usage
													</DropdownMenuItem>
													<DropdownMenuItem>
														<Download className="mr-2 h-4 w-4" />
														Download Template
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
				</CardContent>
			</Card>

			{/* Edit Dialog */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
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
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="edit-priority">Priority</Label>
									<Select
										value={selectedTemplate.priority}
										onValueChange={(value) =>
											setSelectedTemplate({
												...selectedTemplate,
												priority: value,
											})
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="High">High</SelectItem>
											<SelectItem value="Medium">Medium</SelectItem>
											<SelectItem value="Low">Low</SelectItem>
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
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="edit-instructions">Instructions</Label>
								<Textarea
									id="edit-instructions"
									value={selectedTemplate.instructions}
									onChange={(e) =>
										setSelectedTemplate({
											...selectedTemplate,
											instructions: e.target.value,
										})
									}
									rows={4}
								/>
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
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsEditDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button
							onClick={handleEditTemplate}
							className="bg-primary-500 hover:bg-primary-600"
						>
							Save Changes
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
