"use client";

import type React from "react";
import { useState, use } from "react";
import { useRouter } from "next/navigation";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	ArrowLeft,
	Edit,
	Trash2,
	MoreHorizontal,
	ToggleLeft,
	ToggleRight,
	Plus,
	Users,
	Calendar,
	BookOpen,
	Building2,
} from "lucide-react";
import { useCourse, useDeleteCourse, useToggleCourseStatus } from "@/hooks/course";
import { useSections } from "@/hooks/section";
import { toast } from "sonner";

interface CourseDetailsPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function CourseDetailsPage({ params }: CourseDetailsPageProps) {
	const router = useRouter();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	
	// Unwrap params using React.use()
	const { id } = use(params);

	// Fetch course data
	const { data: course, isLoading: courseLoading } = useCourse(id);
	const { data: sectionsData } = useSections({ 
		courseId: id,
		status: "all" 
	});

	const deleteCourse = useDeleteCourse();
	const toggleStatus = useToggleCourseStatus();

	const handleDelete = () => {
		setDeleteDialogOpen(true);
	};

	const confirmDelete = () => {
		if (course) {
			deleteCourse.mutate(course.id, {
				onSuccess: () => {
					setDeleteDialogOpen(false);
					router.push("/dashboard/instructor/courses");
				},
			});
		}
	};

	const handleToggleStatus = () => {
		if (course) {
			toggleStatus.mutate({
				id: course.id,
				isActive: !course.isActive,
			});
		}
	};

	if (courseLoading) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
			</div>
		);
	}

	if (!course) {
		return (
			<div className="text-center py-8">
				<p className="text-gray-500">Course not found</p>
				<Button
					variant="outline"
					onClick={() => router.push("/dashboard/instructor/courses")}
					className="mt-4"
				>
					<ArrowLeft className="w-4 h-4 mr-2" />
					Back to Courses
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button variant="outline" size="sm" onClick={() => router.back()}>
						<ArrowLeft className="w-4 h-4 mr-2" />
						Back
					</Button>
					<div>
						<h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
						<p className="text-gray-600">
							{course.code} • {course.department?.name}
						</p>
					</div>
				</div>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline">
							<MoreHorizontal className="w-4 h-4 mr-2" />
							Actions
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem
							onClick={() => router.push(`/dashboard/instructor/courses/${course.id}/edit`)}
						>
							<Edit className="w-4 h-4 mr-2" />
							Edit Course
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={handleToggleStatus}
						>
							{course.isActive ? (
								<>
									<ToggleLeft className="w-4 h-4 mr-2" />
									Deactivate
								</>
							) : (
								<>
									<ToggleRight className="w-4 h-4 mr-2" />
									Activate
								</>
							)}
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={handleDelete}
							className="text-red-600"
						>
							<Trash2 className="w-4 h-4 mr-2" />
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Course Information */}
				<div className="lg:col-span-2 space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Course Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="text-sm font-medium text-gray-500">Course Name</label>
									<p className="text-sm">{course.name}</p>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-500">Course Code</label>
									<div className="text-sm">
										<Badge variant="outline">{course.code}</Badge>
									</div>
								</div>
							</div>
							<div>
								<label className="text-sm font-medium text-gray-500">Department</label>
								<p className="text-sm flex items-center gap-2">
									<Building2 className="w-4 h-4" />
									{course.department?.name} ({course.department?.code})
								</p>
							</div>
							{course.description && (
								<div>
									<label className="text-sm font-medium text-gray-500">Description</label>
									<p className="text-sm">{course.description}</p>
								</div>
							)}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="text-sm font-medium text-gray-500">Status</label>
									<div className="text-sm">
										<Badge variant={course.isActive ? "default" : "secondary"}>
											{course.isActive ? "Active" : "Inactive"}
										</Badge>
									</div>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-500">Created</label>
									<p className="text-sm">
										{new Date(course.createdAt).toLocaleDateString()}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Sections */}
					{/* <Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle>Sections</CardTitle>
									<CardDescription>
										Manage course sections and student enrollment
									</CardDescription>
								</div>
								<Button
									size="sm"
									onClick={() => router.push(`/dashboard/instructor/sections/add?courseId=${course.id}`)}
								>
									<Plus className="w-4 h-4 mr-2" />
									Add Section
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							{sectionsData?.sections.length === 0 ? (
								<div className="text-center py-8">
									<BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
									<p className="text-gray-500 mb-4">No sections created yet</p>
									<Button
										variant="outline"
										onClick={() => router.push(`/dashboard/instructor/sections/add?courseId=${course.id}`)}
									>
										<Plus className="w-4 h-4 mr-2" />
										Create First Section
									</Button>
								</div>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Section Name</TableHead>
											<TableHead>Code</TableHead>
											<TableHead>Year</TableHead>
											<TableHead>Semester</TableHead>
											<TableHead>Max Students</TableHead>
											<TableHead>Status</TableHead>
											<TableHead className="w-[50px]"></TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{sectionsData?.sections.map((section) => (
											<TableRow key={section.id}>
												<TableCell>
													<div>
														<p className="font-medium">{section.name}</p>
														{section.description && (
															<p className="text-sm text-gray-500">
																{section.description}
															</p>
														)}
													</div>
												</TableCell>
												<TableCell>
													<Badge variant="outline">{section.code}</Badge>
												</TableCell>
												<TableCell>{section.year}</TableCell>
												<TableCell>{section.semester}</TableCell>
												<TableCell>{section.maxStudents}</TableCell>
												<TableCell>
													<Badge
														variant={section.isActive ? "default" : "secondary"}
													>
														{section.isActive ? "Active" : "Inactive"}
													</Badge>
												</TableCell>
												<TableCell>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => router.push(`/dashboard/instructor/sections/${section.id}`)}
													>
														<MoreHorizontal className="w-4 h-4" />
													</Button>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							)}
						</CardContent>
					</Card> */}
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Quick Stats</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-blue-100 rounded-lg">
									<BookOpen className="w-5 h-5 text-blue-600" />
								</div>
								<div>
									<p className="text-sm font-medium">Total Sections</p>
									<p className="text-2xl font-bold">{sectionsData?.sections.length || 0}</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<div className="p-2 bg-green-100 rounded-lg">
									<Users className="w-5 h-5 text-green-600" />
								</div>
								<div>
									<p className="text-sm font-medium">Active Sections</p>
									<p className="text-2xl font-bold">
										{sectionsData?.sections.filter(s => s.isActive).length || 0}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* <Card>
						<CardHeader>
							<CardTitle>Quick Actions</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							<Button
								variant="outline"
								className="w-full justify-start"
								onClick={() => router.push(`/dashboard/instructor/sections/add?courseId=${course.id}`)}
							>
								<Plus className="w-4 h-4 mr-2" />
								Add Section
							</Button>
							<Button
								variant="outline"
								className="w-full justify-start"
								onClick={() => router.push(`/dashboard/instructor/courses/${course.id}/edit`)}
							>
								<Edit className="w-4 h-4 mr-2" />
								Edit Course
							</Button>
						</CardContent>
					</Card> */}
				</div>
			</div>

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Course</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete "{course.name}"? This action cannot be undone.
							{sectionsData?.sections && sectionsData.sections.length > 0 && (
								<span className="block mt-2 text-red-600 font-medium">
									This course has {sectionsData.sections.length} sections and cannot be deleted.
								</span>
							)}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setDeleteDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={confirmDelete}
							disabled={deleteCourse.isPending || (sectionsData?.sections && sectionsData.sections.length > 0)}
						>
							{deleteCourse.isPending ? "Deleting..." : "Delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
