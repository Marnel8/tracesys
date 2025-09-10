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
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

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
	targetSections: z.array(z.string()).min(1, "Please select at least one target section"),
	targetCourses: z.array(z.string()).min(1, "Please select at least one target course"),
});

type AnnouncementForm = z.infer<typeof announcementSchema>;

// Mock data for announcements
const announcements = [
	{
		id: 1,
		title: "Weekly Report Reminder",
		content:
			"Don't forget to submit your weekly reports by Friday, 5:00 PM. Late submissions will not be accepted.",
		targetSections: ["BSIT 4A", "BSIT 4B"],
		targetCourses: ["BSIT"],
		priority: "High",
		status: "Published",
		createdAt: "2024-01-15T10:00:00Z",
		comments: 5,
		views: 42,
	},
	{
		id: 2,
		title: "New Requirement Added",
		content:
			"A new requirement has been added to your practicum checklist: Medical Certificate. Please submit this as soon as possible.",
		targetSections: ["BSIT 4A"],
		targetCourses: ["BSIT"],
		priority: "Medium",
		status: "Published",
		createdAt: "2024-01-14T14:30:00Z",
		comments: 8,
		views: 28,
	},
	{
		id: 3,
		title: "Practicum Evaluation Schedule",
		content:
			"The mid-term practicum evaluation will be conducted next week. Please coordinate with your agency supervisors.",
		targetSections: ["BSIT 4A", "BSIT 4B", "BSIT 4C", "BSIT 4D"],
		targetCourses: ["BSIT"],
		priority: "High",
		status: "Draft",
		createdAt: "2024-01-13T09:15:00Z",
		comments: 0,
		views: 0,
	},
];

export default function AnnouncementsPage() {
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	// Available sections and courses
	const availableSections = ["BSIT 4A", "BSIT 4B", "BSIT 4C", "BSIT 4D"];
	const availableCourses = ["BSIT"];

	const {
		register,
		handleSubmit,
		control,
		reset,
		formState: { errors },
	} = useForm<AnnouncementForm>({
		resolver: zodResolver(announcementSchema),
		defaultValues: {
			title: "",
			content: "",
			priority: "Medium",
			status: "Draft",
			isPinned: false,
			expiryDate: "",
			targetSections: [],
			targetCourses: [],
		},
	});

	const onSubmit = async (data: AnnouncementForm) => {
		setIsLoading(true);
		try {
			console.log("Creating announcement:", data);
			// TODO: Replace with actual API call
			await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
			toast.success("Announcement created successfully!");
			setIsCreateDialogOpen(false);
			reset();
		} catch (error: any) {
			toast.error(error.message || "Failed to create announcement. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		setIsCreateDialogOpen(false);
		reset();
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
										<Label className="text-gray-700 font-medium">Target Sections *</Label>
										<Controller
											name="targetSections"
											control={control}
											render={({ field }) => (
												<div className="grid grid-cols-2 gap-2">
													{availableSections.map((section) => (
														<div key={section} className="flex items-center space-x-2">
															<Checkbox
																id={`section-${section}`}
																checked={field.value.includes(section)}
																onCheckedChange={(checked) => {
																	if (checked) {
																		field.onChange([...field.value, section]);
																	} else {
																		field.onChange(field.value.filter((s) => s !== section));
																	}
																}}
															/>
															<Label htmlFor={`section-${section}`} className="text-sm">
																{section}
															</Label>
														</div>
													))}
												</div>
											)}
										/>
										{errors.targetSections && (
											<p className="text-sm text-red-600">
												{errors.targetSections.message}
											</p>
										)}
									</div>

									<div className="space-y-2">
										<Label className="text-gray-700 font-medium">Target Courses *</Label>
										<Controller
											name="targetCourses"
											control={control}
											render={({ field }) => (
												<div className="grid grid-cols-2 gap-2">
													{availableCourses.map((course) => (
														<div key={course} className="flex items-center space-x-2">
															<Checkbox
																id={`course-${course}`}
																checked={field.value.includes(course)}
																onCheckedChange={(checked) => {
																	if (checked) {
																		field.onChange([...field.value, course]);
																	} else {
																		field.onChange(field.value.filter((c) => c !== course));
																	}
																}}
															/>
															<Label htmlFor={`course-${course}`} className="text-sm">
																{course}
															</Label>
														</div>
													))}
												</div>
											)}
										/>
										{errors.targetCourses && (
											<p className="text-sm text-red-600">
												{errors.targetCourses.message}
											</p>
										)}
									</div>
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
									disabled={isLoading}
								>
									{isLoading ? "Creating..." : "Create Announcement"}
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card className="bg-secondary-50 border-primary-200">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600">Total Announcements</p>
								<p className="text-2xl font-bold text-gray-900">15</p>
							</div>
							<MessageSquare className="w-8 h-8 text-primary-600" />
						</div>
					</CardContent>
				</Card>

				<Card className="bg-secondary-50 border-green-200">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600">Published</p>
								<p className="text-2xl font-bold text-green-600">12</p>
							</div>
							<Badge className="bg-green-100 text-green-800">Active</Badge>
						</div>
					</CardContent>
				</Card>

				<Card className="bg-secondary-50 border-yellow-200">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600">Drafts</p>
								<p className="text-2xl font-bold text-yellow-600">3</p>
							</div>
							<Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
						</div>
					</CardContent>
				</Card>

				<Card className="bg-secondary-50 border-blue-200">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600">Total Views</p>
								<p className="text-2xl font-bold text-blue-600">342</p>
							</div>
							<Eye className="w-8 h-8 text-blue-600" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Announcements List */}
			<div className="space-y-4">
				{announcements.map((announcement) => (
					<Card
						key={announcement.id}
						className="hover:shadow-md transition-shadow"
					>
						<CardHeader>
							<div className="flex justify-between items-start">
								<div className="flex-1">
									<div className="flex items-center gap-3 mb-2">
										<CardTitle className="text-lg">
											{announcement.title}
										</CardTitle>
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
											{announcement.targetSections.join(", ")} •{" "}
											{announcement.targetCourses.join(", ")}
										</div>
										<div className="flex items-center gap-1">
											<Eye className="w-4 h-4" />
											{announcement.views} views
										</div>
										<div className="flex items-center gap-1">
											<MessageSquare className="w-4 h-4" />
											{announcement.comments} comments
										</div>
									</div>
								</div>
								<div className="flex gap-2">
									<Button variant="outline" size="sm">
										<Eye className="w-4 h-4" />
									</Button>
									<Button variant="outline" size="sm">
										<Edit className="w-4 h-4" />
									</Button>
									<Button
										variant="outline"
										size="sm"
										className="text-red-600 hover:text-red-700"
									>
										<Trash2 className="w-4 h-4" />
									</Button>
								</div>
							</div>
						</CardHeader>
					</Card>
				))}
			</div>
		</div>
	);
}
