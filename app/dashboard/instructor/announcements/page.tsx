"use client";

import React, { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
	Plus,
	MessageSquare,
	Edit,
	Trash2,
	Eye,
	Calendar,
	Users,
	Pin,
	Search,
	X,
} from "lucide-react";
import { InstructorStatsCard } from "@/components/instructor-stats-card";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
	useAnnouncements,
	useAnnouncement,
	useAnnouncementStats,
	useCreateAnnouncement,
	useUpdateAnnouncement,
	useDeleteAnnouncement,
	useToggleAnnouncementPin,
	useAnnouncementComments,
	useCreateAnnouncementComment,
	useDeleteAnnouncementComment,
	AnnouncementFormData,
	AnnouncementFilters,
} from "@/hooks/announcement";
import { useAuth } from "@/hooks/auth/useAuth";
import { useSections } from "@/hooks/section/useSection";
import { useCourses } from "@/hooks/course/useCourse";
import { useDepartments } from "@/hooks/department/useDepartment";

// Announcement form schema
const announcementSchema = z.object({
	title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
	content: z.string().min(1, "Content is required"),
	priority: z.enum(["Low", "Medium", "High"], {
		required_error: "Please select a priority level",
	}),
	status: z.enum(["Draft", "Published", "Archived"], {
		required_error: "Please select a status",
	}),
	expiryDate: z.string().optional(),
	isPinned: z.boolean(),
	targetType: z.enum(["all", "section", "course", "department"], {
		required_error: "Please select a target type",
	}),
	targetId: z.string().optional(),
}).refine((data) => {
	// If targetType is not "all", targetId is required
	if (data.targetType !== "all" && !data.targetId) {
		return false;
	}
	return true;
}, {
	message: "Please select a target",
	path: ["targetId"],
});

type AnnouncementForm = z.infer<typeof announcementSchema>;

export default function AnnouncementsPage() {
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [selectedAnnouncement, setSelectedAnnouncement] = useState<string | null>(null);
	const [filters, setFilters] = useState<AnnouncementFilters>({
		search: "",
		status: "all",
		priority: "all",
		page: 1,
		limit: 10,
	});
	const [searchInput, setSearchInput] = useState("");

	// Auth hook
	const { user } = useAuth();

	// Announcement hooks
	const { data: announcementsData, isLoading: isLoadingAnnouncements } = useAnnouncements(filters);
	const { data: announcementStats, isLoading: isLoadingStats } = useAnnouncementStats(user?.id);
	const { data: selectedAnnouncementData } = useAnnouncement(selectedAnnouncement || "");
	const { data: commentsData } = useAnnouncementComments(selectedAnnouncement || "", { page: 1, limit: 10 });

	// Data fetching hooks for target options
	const { data: sectionsData, isLoading: isLoadingSections } = useSections({ status: "active" });
	const { data: coursesData, isLoading: isLoadingCourses } = useCourses({ status: "active" });
	const { data: departmentsData, isLoading: isLoadingDepartments } = useDepartments({ status: "active" });

	// Mutations
	const createAnnouncement = useCreateAnnouncement();
	const updateAnnouncement = useUpdateAnnouncement();
	const deleteAnnouncement = useDeleteAnnouncement();
	const togglePin = useToggleAnnouncementPin();
	const createComment = useCreateAnnouncementComment();
	const deleteComment = useDeleteAnnouncementComment();

	const {
		register,
		handleSubmit,
		control,
		reset,
		formState: { errors },
		setValue,
		watch,
	} = useForm<AnnouncementForm>({
		resolver: zodResolver(announcementSchema),
		defaultValues: {
			title: "",
			content: "",
			priority: "Medium",
			status: "Draft",
			isPinned: false,
			expiryDate: "",
			targetType: "all",
			targetId: "",
		},
	});

	const watchedTargetType = watch("targetType");

	// Clear targetId when targetType changes to "all"
	React.useEffect(() => {
		if (watchedTargetType === "all") {
			setValue("targetId", "");
		}
	}, [watchedTargetType, setValue]);

	// Debounce search input
	React.useEffect(() => {
		const timeoutId = setTimeout(() => {
			setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
		}, 500);

		return () => clearTimeout(timeoutId);
	}, [searchInput]);

	const onSubmit = async (data: AnnouncementForm) => {
		if (!user?.id) {
			toast.error("User not authenticated");
			return;
		}

		const announcementData: AnnouncementFormData = {
			title: data.title,
			content: data.content,
			priority: data.priority,
			status: data.status,
			authorId: user.id,
			expiryDate: data.expiryDate ? new Date(data.expiryDate).toISOString() : undefined,
			isPinned: data.isPinned,
			targets: [{
				targetType: data.targetType as "section" | "course" | "department" | "all",
				targetId: data.targetId || undefined,
			}],
		};

		if (selectedAnnouncement) {
			updateAnnouncement.mutate({ id: selectedAnnouncement, data: announcementData });
		} else {
			createAnnouncement.mutate(announcementData);
		}

		setIsCreateDialogOpen(false);
		setIsEditDialogOpen(false);
		reset();
		setSelectedAnnouncement(null);
	};

	const handleEdit = (announcementId: string) => {
		setSelectedAnnouncement(announcementId);
		setIsEditDialogOpen(true);
		if (selectedAnnouncementData) {
			setValue("title", selectedAnnouncementData.title);
			setValue("content", selectedAnnouncementData.content);
			setValue("priority", selectedAnnouncementData.priority);
			setValue("status", selectedAnnouncementData.status);
			setValue("isPinned", selectedAnnouncementData.isPinned);
			setValue("expiryDate", selectedAnnouncementData.expiryDate ? new Date(selectedAnnouncementData.expiryDate).toISOString().slice(0, 16) : "");
			if (selectedAnnouncementData.targets && selectedAnnouncementData.targets.length > 0) {
				setValue("targetType", selectedAnnouncementData.targets[0].targetType);
				setValue("targetId", selectedAnnouncementData.targets[0].targetId || "");
			}
		}
	};

	const handleView = (announcementId: string) => {
		setSelectedAnnouncement(announcementId);
		setIsViewDialogOpen(true);
	};

	const handleDelete = (announcementId: string) => {
		setSelectedAnnouncement(announcementId);
		setIsDeleteDialogOpen(true);
	};

	const confirmDelete = () => {
		if (selectedAnnouncement) {
			deleteAnnouncement.mutate(selectedAnnouncement);
			setIsDeleteDialogOpen(false);
			setSelectedAnnouncement(null);
		}
	};

	const handleTogglePin = async (announcementId: string) => {
		 await togglePin.mutateAsync(announcementId);
	};

	const handleCancel = () => {
		setIsCreateDialogOpen(false);
		setIsEditDialogOpen(false);
		setIsViewDialogOpen(false);
		setIsDeleteDialogOpen(false);
		reset();
		setSelectedAnnouncement(null);
	};

	const handleFilterChange = (key: keyof AnnouncementFilters, value: any) => {
		setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
	};

	const clearFilters = () => {
		setFilters({
			search: "",
			status: "all",
			priority: "all",
			page: 1,
			limit: 10,
		});
		setSearchInput("");
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

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
					<p className="text-gray-600">
						Create and manage announcements for your students
					</p>
				</div>
				<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button className="bg-primary-500 hover:bg-primary-600">
							<Plus className="w-4 h-4 mr-2" />
							New Announcement
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>Create New Announcement</DialogTitle>
							<DialogDescription>
								Create a new announcement to share with your students.
							</DialogDescription>
						</DialogHeader>
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
							<div className="grid gap-4 py-4">
								{/* Basic Information */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
										Basic Information
									</h3>
									
									<div className="space-y-2">
										<Label htmlFor="title" className="text-gray-700 font-medium">
											Title *
										</Label>
										<Input
											id="title"
											placeholder="Enter announcement title"
											className="border-gray-300 focus:border-accent-500 focus:ring-accent-500"
											{...register("title")}
										/>
										{errors.title && (
											<p className="text-sm text-red-600">
												{errors.title.message}
											</p>
										)}
									</div>

									<div className="space-y-2">
										<Label htmlFor="content" className="text-gray-700 font-medium">
											Content *
										</Label>
										<Textarea
											id="content"
											placeholder="Enter announcement content"
											rows={4}
											className="border-gray-300 focus:border-accent-500 focus:ring-accent-500"
											{...register("content")}
										/>
										{errors.content && (
											<p className="text-sm text-red-600">
												{errors.content.message}
											</p>
										)}
									</div>
								</div>

								{/* Settings */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
										Settings
									</h3>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label className="text-gray-700 font-medium">Priority *</Label>
											<Controller
												name="priority"
												control={control}
												render={({ field }) => (
													<Select onValueChange={field.onChange} defaultValue={field.value}>
														<SelectTrigger className="border-gray-300 focus:border-accent-500 focus:ring-accent-500">
															<SelectValue placeholder="Select priority" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="Low">Low</SelectItem>
															<SelectItem value="Medium">Medium</SelectItem>
															<SelectItem value="High">High</SelectItem>
														</SelectContent>
													</Select>
												)}
											/>
											{errors.priority && (
												<p className="text-sm text-red-600">
													{errors.priority.message}
												</p>
											)}
										</div>

										<div className="space-y-2">
											<Label className="text-gray-700 font-medium">Status *</Label>
											<Controller
												name="status"
												control={control}
												render={({ field }) => (
													<Select onValueChange={field.onChange} defaultValue={field.value}>
														<SelectTrigger className="border-gray-300 focus:border-accent-500 focus:ring-accent-500">
															<SelectValue placeholder="Select status" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="Draft">Draft</SelectItem>
															<SelectItem value="Published">Published</SelectItem>
															<SelectItem value="Archived">Archived</SelectItem>
														</SelectContent>
													</Select>
												)}
											/>
											{errors.status && (
												<p className="text-sm text-red-600">
													{errors.status.message}
												</p>
											)}
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="expiryDate" className="text-gray-700 font-medium">
											Expiry Date
										</Label>
										<Input
											id="expiryDate"
											type="datetime-local"
											className="border-gray-300 focus:border-accent-500 focus:ring-accent-500"
											{...register("expiryDate")}
										/>
										{errors.expiryDate && (
											<p className="text-sm text-red-600">
												{errors.expiryDate.message}
											</p>
										)}
									</div>

									<div className="flex items-center space-x-2">
										<Controller
											name="isPinned"
											control={control}
											render={({ field }) => (
												<Checkbox
													id="isPinned"
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
											)}
										/>
										<Label htmlFor="isPinned" className="text-gray-700 font-medium flex items-center gap-2">
											<Pin className="w-4 h-4" />
											Pin this announcement
										</Label>
									</div>
								</div>

								{/* Target Audience */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
										Target Audience
									</h3>

									<div className="space-y-2">
										<Label className="text-gray-700 font-medium">Target Type *</Label>
										<Controller
											name="targetType"
											control={control}
											render={({ field }) => (
												<Select onValueChange={field.onChange} defaultValue={field.value}>
													<SelectTrigger className="border-gray-300 focus:border-accent-500 focus:ring-accent-500">
														<SelectValue placeholder="Select target type" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="all">All Users</SelectItem>
														<SelectItem value="section">Specific Section</SelectItem>
														<SelectItem value="course">Specific Course</SelectItem>
														<SelectItem value="department">Specific Department</SelectItem>
													</SelectContent>
												</Select>
											)}
										/>
										{errors.targetType && (
											<p className="text-sm text-red-600">
												{errors.targetType.message}
											</p>
										)}
									</div>

									{watchedTargetType !== "all" && (
										<div className="space-y-2">
											<Label className="text-gray-700 font-medium">
												Select {watchedTargetType === "section" ? "Section" : watchedTargetType === "course" ? "Course" : "Department"}
											</Label>
											<Controller
												name="targetId"
												control={control}
												render={({ field }) => {
													const getOptions = () => {
														switch (watchedTargetType) {
															case "section":
																return sectionsData?.sections?.map(section => ({
																	value: section.id,
																	label: `${section.name} (${section.code}) - ${section.course?.name || 'Unknown Course'}`
																})) || [];
															case "course":
																return coursesData?.courses?.map(course => ({
																	value: course.id,
																	label: `${course.name} (${course.code}) - ${course.department?.name || 'Unknown Department'}`
																})) || [];
															case "department":
															 return departmentsData?.departments?.map(department => ({
																	value: department.id,
																	label: `${department.name} (${department.code})`
																})) || [];
															default:
																return [];
														}
													};

													const isLoading = 
														(watchedTargetType === "section" && isLoadingSections) ||
														(watchedTargetType === "course" && isLoadingCourses) ||
														(watchedTargetType === "department" && isLoadingDepartments);

													return (
														<Select onValueChange={field.onChange} value={field.value}>
															<SelectTrigger className="border-gray-300 focus:border-accent-500 focus:ring-accent-500">
																<SelectValue placeholder={
																	isLoading 
																		? "Loading..." 
																		: `Select ${watchedTargetType === "section" ? "section" : watchedTargetType === "course" ? "course" : "department"}`
																} />
															</SelectTrigger>
															<SelectContent>
																{getOptions().map((option) => (
																	<SelectItem key={option.value} value={option.value}>
																		{option.label}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													);
												}}
											/>
											{errors.targetId && (
												<p className="text-sm text-red-600">
													{errors.targetId.message}
												</p>
											)}
										</div>
									)}
								</div>
							</div>
							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={handleCancel}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									className="bg-primary-500 hover:bg-primary-600"
									disabled={createAnnouncement.isPending}
								>
									{createAnnouncement.isPending ? "Creating..." : "Create Announcement"}
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>

				{/* Edit Dialog */}
				<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
					<DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>Edit Announcement</DialogTitle>
							<DialogDescription>
								Update the announcement details.
							</DialogDescription>
						</DialogHeader>
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
							<div className="grid gap-4 py-4">
								{/* Basic Information */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
										Basic Information
									</h3>
									
									<div className="space-y-2">
										<Label htmlFor="edit-title" className="text-gray-700 font-medium">
											Title *
										</Label>
										<Input
											id="edit-title"
											placeholder="Enter announcement title"
											className="border-gray-300 focus:border-accent-500 focus:ring-accent-500"
											{...register("title")}
										/>
										{errors.title && (
											<p className="text-sm text-red-600">
												{errors.title.message}
											</p>
										)}
									</div>

									<div className="space-y-2">
										<Label htmlFor="edit-content" className="text-gray-700 font-medium">
											Content *
										</Label>
										<Textarea
											id="edit-content"
											placeholder="Enter announcement content"
											rows={4}
											className="border-gray-300 focus:border-accent-500 focus:ring-accent-500"
											{...register("content")}
										/>
										{errors.content && (
											<p className="text-sm text-red-600">
												{errors.content.message}
											</p>
										)}
									</div>
								</div>

								{/* Settings */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
										Settings
									</h3>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label className="text-gray-700 font-medium">Priority *</Label>
											<Controller
												name="priority"
												control={control}
												render={({ field }) => (
													<Select onValueChange={field.onChange} defaultValue={field.value}>
														<SelectTrigger className="border-gray-300 focus:border-accent-500 focus:ring-accent-500">
															<SelectValue placeholder="Select priority" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="Low">Low</SelectItem>
															<SelectItem value="Medium">Medium</SelectItem>
															<SelectItem value="High">High</SelectItem>
														</SelectContent>
													</Select>
												)}
											/>
											{errors.priority && (
												<p className="text-sm text-red-600">
													{errors.priority.message}
												</p>
											)}
										</div>

										<div className="space-y-2">
											<Label className="text-gray-700 font-medium">Status *</Label>
											<Controller
												name="status"
												control={control}
												render={({ field }) => (
													<Select onValueChange={field.onChange} defaultValue={field.value}>
														<SelectTrigger className="border-gray-300 focus:border-accent-500 focus:ring-accent-500">
															<SelectValue placeholder="Select status" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="Draft">Draft</SelectItem>
															<SelectItem value="Published">Published</SelectItem>
															<SelectItem value="Archived">Archived</SelectItem>
														</SelectContent>
													</Select>
												)}
											/>
											{errors.status && (
												<p className="text-sm text-red-600">
													{errors.status.message}
												</p>
											)}
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="edit-expiryDate" className="text-gray-700 font-medium">
											Expiry Date
										</Label>
										<Input
											id="edit-expiryDate"
											type="datetime-local"
											className="border-gray-300 focus:border-accent-500 focus:ring-accent-500"
											{...register("expiryDate")}
										/>
										{errors.expiryDate && (
											<p className="text-sm text-red-600">
												{errors.expiryDate.message}
											</p>
										)}
									</div>

									<div className="flex items-center space-x-2">
										<Controller
											name="isPinned"
											control={control}
											render={({ field }) => (
												<Checkbox
													id="edit-isPinned"
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
											)}
										/>
										<Label htmlFor="edit-isPinned" className="text-gray-700 font-medium flex items-center gap-2">
											<Pin className="w-4 h-4" />
											Pin this announcement
										</Label>
									</div>
								</div>

								{/* Target Audience */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
										Target Audience
									</h3>

									<div className="space-y-2">
										<Label className="text-gray-700 font-medium">Target Type *</Label>
										<Controller
											name="targetType"
											control={control}
											render={({ field }) => (
												<Select onValueChange={field.onChange} defaultValue={field.value}>
													<SelectTrigger className="border-gray-300 focus:border-accent-500 focus:ring-accent-500">
														<SelectValue placeholder="Select target type" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="all">All Users</SelectItem>
														<SelectItem value="section">Specific Section</SelectItem>
														<SelectItem value="course">Specific Course</SelectItem>
														<SelectItem value="department">Specific Department</SelectItem>
													</SelectContent>
												</Select>
											)}
										/>
										{errors.targetType && (
											<p className="text-sm text-red-600">
												{errors.targetType.message}
											</p>
										)}
									</div>

									{watchedTargetType !== "all" && (
										<div className="space-y-2">
											<Label className="text-gray-700 font-medium">
												Select {watchedTargetType === "section" ? "Section" : watchedTargetType === "course" ? "Course" : "Department"}
											</Label>
											<Controller
												name="targetId"
												control={control}
												render={({ field }) => {
													const getOptions = () => {
														switch (watchedTargetType) {
															case "section":
																return sectionsData?.sections?.map(section => ({
																	value: section.id,
																	label: `${section.name} (${section.code}) - ${section.course?.name || 'Unknown Course'}`
																})) || [];
															case "course":
																return coursesData?.courses?.map(course => ({
																	value: course.id,
																	label: `${course.name} (${course.code}) - ${course.department?.name || 'Unknown Department'}`
																})) || [];
															case "department":
															 return departmentsData?.departments?.map(department => ({
																	value: department.id,
																	label: `${department.name} (${department.code})`
																})) || [];
															default:
																return [];
														}
													};

													const isLoading = 
														(watchedTargetType === "section" && isLoadingSections) ||
														(watchedTargetType === "course" && isLoadingCourses) ||
														(watchedTargetType === "department" && isLoadingDepartments);

													return (
														<Select onValueChange={field.onChange} value={field.value}>
															<SelectTrigger className="border-gray-300 focus:border-accent-500 focus:ring-accent-500">
																<SelectValue placeholder={
																	isLoading 
																		? "Loading..." 
																		: `Select ${watchedTargetType === "section" ? "section" : watchedTargetType === "course" ? "course" : "department"}`
																} />
															</SelectTrigger>
															<SelectContent>
																{getOptions().map((option) => (
																	<SelectItem key={option.value} value={option.value}>
																		{option.label}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													);
												}}
											/>
											{errors.targetId && (
												<p className="text-sm text-red-600">
													{errors.targetId.message}
												</p>
											)}
										</div>
									)}
								</div>
							</div>
							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={handleCancel}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									className="bg-primary-500 hover:bg-primary-600"
									disabled={updateAnnouncement.isPending}
								>
									{updateAnnouncement.isPending ? "Updating..." : "Update Announcement"}
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>

				{/* Delete Confirmation Dialog */}
				<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
					<DialogContent className="sm:max-w-[400px]">
						<DialogHeader>
							<DialogTitle>Delete Announcement</DialogTitle>
							<DialogDescription>
								Are you sure you want to delete this announcement? This action cannot be undone.
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={handleCancel}
							>
								Cancel
							</Button>
							<Button
								type="button"
								variant="destructive"
								onClick={confirmDelete}
								disabled={deleteAnnouncement.isPending}
							>
								{deleteAnnouncement.isPending ? "Deleting..." : "Delete"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				{/* View Dialog */}
				<Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
					<DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>View Announcement</DialogTitle>
							<DialogDescription>
								Announcement details and comments.
							</DialogDescription>
						</DialogHeader>
						{selectedAnnouncementData && (
							<div className="space-y-6">
								{/* Announcement Details */}
								<div className="space-y-4">
									<div className="flex items-center gap-3">
										<h3 className="text-xl font-semibold">{selectedAnnouncementData.title}</h3>
										{selectedAnnouncementData.isPinned && (
											<Badge className="bg-yellow-100 text-yellow-800">
												<Pin className="w-3 h-3 mr-1" />
												Pinned
											</Badge>
										)}
										<Badge
											className={
												selectedAnnouncementData.priority === "High"
													? "bg-red-100 text-red-800"
													: selectedAnnouncementData.priority === "Medium"
													? "bg-yellow-100 text-yellow-800"
													: "bg-gray-100 text-gray-800"
											}
										>
											{selectedAnnouncementData.priority}
										</Badge>
										<Badge
											className={
												selectedAnnouncementData.status === "Published"
													? "bg-green-100 text-green-800"
													: "bg-gray-100 text-gray-800"
											}
										>
											{selectedAnnouncementData.status}
										</Badge>
									</div>
									<div className="prose max-w-none">
										<p className="text-gray-700 whitespace-pre-wrap">{selectedAnnouncementData.content}</p>
									</div>
									<div className="flex items-center gap-4 text-sm text-gray-600">
										<div className="flex items-center gap-1">
											<Calendar className="w-4 h-4" />
											{formatDate(selectedAnnouncementData.createdAt)}
										</div>
										<div className="flex items-center gap-1">
											<Eye className="w-4 h-4" />
											{selectedAnnouncementData.views} views
										</div>
										<div className="flex items-center gap-1">
											<MessageSquare className="w-4 h-4" />
											{selectedAnnouncementData.commentCount || 0} comments
										</div>
									</div>
								</div>

								{/* Comments Section */}
								<div className="space-y-4">
									<h4 className="text-lg font-semibold">Comments</h4>
									{commentsData?.comments?.map((comment) => (
										<div key={comment.id} className="border rounded-lg p-4">
											<div className="flex justify-between items-start mb-2">
												<div className="flex items-center gap-2">
													<span className="font-medium">{comment.user?.firstName} {comment.user?.lastName}</span>
													<span className="text-sm text-gray-500">
														{formatDate(comment.createdAt)}
													</span>
												</div>
												<Button
													variant="outline"
													size="sm"
													onClick={() => deleteComment.mutate({ id: comment.id, announcementId: selectedAnnouncementData.id })}
													className="text-red-600 hover:text-red-700"
												>
													<Trash2 className="w-4 h-4" />
												</Button>
											</div>
											<p className="text-gray-700">{comment.content}</p>
										</div>
									))}
								</div>
							</div>
						)}
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={handleCancel}
							>
								Close
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<InstructorStatsCard
					icon={MessageSquare}
					label="Total Announcements"
					value={announcementStats?.totalAnnouncements || 0}
					helperText="All-time posts"
					isLoading={isLoadingStats}
				/>
				<InstructorStatsCard
					label="Published"
					value={announcementStats?.publishedAnnouncements || 0}
					helperText="Live to students"
					trend={
						announcementStats?.publishedAnnouncements
							? {
									label: `${announcementStats.publishedAnnouncements} active`,
									variant: "positive",
								}
							: undefined
					}
					isLoading={isLoadingStats}
				/>
				<InstructorStatsCard
					label="Drafts"
					value={announcementStats?.draftAnnouncements || 0}
					helperText="Waiting to publish"
					trend={
						announcementStats?.draftAnnouncements
							? { label: "Pending review", variant: "neutral" }
							: undefined
					}
					isLoading={isLoadingStats}
				/>
				<InstructorStatsCard
					icon={Eye}
					label="Total Views"
					value={announcementStats?.totalViews || 0}
					helperText="Engagement count"
					isLoading={isLoadingStats}
				/>
			</div>

			{/* Filters and Search */}
			<div className="flex flex-col sm:flex-row gap-4 mb-6">
				<div className="flex-1">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
						<Input
							placeholder="Search announcements..."
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							className="pl-10"
						/>
					</div>
				</div>
				<div className="flex gap-2">
					<Select
						value={filters.status}
						onValueChange={(value) => handleFilterChange("status", value)}
					>
						<SelectTrigger className="w-32">
							<SelectValue placeholder="Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Status</SelectItem>
							<SelectItem value="Draft">Draft</SelectItem>
							<SelectItem value="Published">Published</SelectItem>
							<SelectItem value="Archived">Archived</SelectItem>
						</SelectContent>
					</Select>
					<Select
						value={filters.priority}
						onValueChange={(value) => handleFilterChange("priority", value)}
					>
						<SelectTrigger className="w-32">
							<SelectValue placeholder="Priority" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Priority</SelectItem>
							<SelectItem value="Low">Low</SelectItem>
							<SelectItem value="Medium">Medium</SelectItem>
							<SelectItem value="High">High</SelectItem>
						</SelectContent>
					</Select>
					<Button
						variant="outline"
						size="sm"
						onClick={clearFilters}
						className="flex items-center gap-2"
					>
						<X className="w-4 h-4" />
						Clear
					</Button>
				</div>
			</div>

			{/* Announcements List */}
			<div className="space-y-4">
				{isLoadingAnnouncements ? (
					<div className="text-center py-8">
						<p className="text-gray-500">Loading announcements...</p>
					</div>
				) : announcementsData?.announcements?.length === 0 ? (
					<div className="text-center py-8">
						<p className="text-gray-500">No announcements found</p>
					</div>
				) : (
					announcementsData?.announcements?.map((announcement) => (
						<Card
							key={announcement.id}
							className={`hover:shadow-md transition-shadow ${announcement.isPinned ? 'ring-2 ring-yellow-200 bg-yellow-50' : ''}`}
						>
							<CardHeader>
								<div className="flex justify-between items-start">
									<div className="flex-1">
										<div className="flex items-center gap-3 mb-2">
											<CardTitle className="text-lg">
												{announcement.title}
											</CardTitle>
											{announcement.isPinned && (
												<Badge className="bg-yellow-100 text-yellow-800">
													<Pin className="w-3 h-3 mr-1" />
													Pinned
												</Badge>
											)}
											<Badge
												variant={
													announcement.priority === "High"
														? "destructive"
														: "secondary"
												}
												className={
													announcement.priority === "High"
														? "bg-red-100 text-red-800"
														: announcement.priority === "Medium"
														? "bg-yellow-100 text-yellow-800"
														: "bg-gray-100 text-gray-800"
												}
											>
												{announcement.priority}
											</Badge>
											<Badge
												variant={
													announcement.status === "Published"
														? "default"
														: "secondary"
												}
												className={
													announcement.status === "Published"
														? "bg-green-100 text-green-800"
														: "bg-gray-100 text-gray-800"
												}
											>
												{announcement.status}
											</Badge>
										</div>
										<CardDescription className="text-base mb-3">
											{announcement.content}
										</CardDescription>
										<div className="flex items-center gap-4 text-sm text-gray-600">
											<div className="flex items-center gap-1">
												<Calendar className="w-4 h-4" />
												{formatDate(announcement.createdAt)}
											</div>
											<div className="flex items-center gap-1">
												<Users className="w-4 h-4" />
												{announcement.targets?.map(target => target.targetType).join(", ") || "All"}
											</div>
											<div className="flex items-center gap-1">
												<Eye className="w-4 h-4" />
												{announcement.views} views
											</div>
											<div className="flex items-center gap-1">
												<MessageSquare className="w-4 h-4" />
												{announcement.commentCount || 0} comments
											</div>
										</div>
									</div>
									<div className="flex gap-2">
										<Button 
											variant="outline" 
											size="sm"
											onClick={() => handleView(announcement.id)}
										>
											<Eye className="w-4 h-4" />
										</Button>
										<Button 
											variant="outline" 
											size="sm"
											onClick={() => handleEdit(announcement.id)}
										>
											<Edit className="w-4 h-4" />
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleTogglePin(announcement.id)}
											className={announcement.isPinned ? "text-yellow-600 hover:text-yellow-700" : ""}
										>
											<Pin className="w-4 h-4" />
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleDelete(announcement.id)}
											className="text-red-600 hover:text-red-700"
										>
											<Trash2 className="w-4 h-4" />
										</Button>
									</div>
								</div>
							</CardHeader>
						</Card>
					))
				)}
			</div>

			{/* Pagination */}
			{announcementsData?.pagination && announcementsData.pagination.totalPages > 1 && (
				<div className="flex justify-center items-center gap-2 mt-6">
					<Button
						variant="outline"
						size="sm"
						onClick={() => handleFilterChange("page", (filters.page || 1) - 1)}
						disabled={!filters.page || filters.page <= 1}
					>
						Previous
					</Button>
					<span className="text-sm text-gray-600">
						Page {filters.page || 1} of {announcementsData.pagination.totalPages}
					</span>
					<Button
						variant="outline"
						size="sm"
						onClick={() => handleFilterChange("page", (filters.page || 1) + 1)}
						disabled={!filters.page || filters.page >= announcementsData.pagination.totalPages}
					>
						Next
					</Button>
				</div>
			)}
		</div>
	);
}
