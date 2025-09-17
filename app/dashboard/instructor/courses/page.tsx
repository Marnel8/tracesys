"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	Search,
	Plus,
	MoreHorizontal,
	Edit,
	Trash2,
	Eye,
	ToggleLeft,
	ToggleRight,
	Filter,
	X,
	BookOpen,
	Building2,
} from "lucide-react";
import { useCourses, useDeleteCourse, useToggleCourseStatus, useCreateCourse } from "@/hooks/course";
import { useDepartments } from "@/hooks/department";
import { toast } from "sonner";
import { Course, CourseFilters } from "@/data/departments";

export default function CoursesPage() {
	const router = useRouter();
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
	const [departmentFilter, setDepartmentFilter] = useState<string>("all");
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
	const [newCourse, setNewCourse] = useState({
		name: "",
		code: "",
		departmentId: "",
		description: "",
	});

	// Fetch data
	const { data: departmentsData } = useDepartments({ status: "active" });
	const { data: coursesData, isLoading } = useCourses({
		search: searchTerm || undefined,
		status: statusFilter,
		departmentId: departmentFilter !== "all" ? departmentFilter : undefined,
	});

	const deleteCourse = useDeleteCourse();
	const toggleStatus = useToggleCourseStatus();
	const createCourse = useCreateCourse();

	const handleCreateCourse = async () => {
		if (!newCourse.name.trim() || !newCourse.code.trim() || !newCourse.departmentId) {
			toast.error("Please fill in all required fields");
			return;
		}

		try {
			await createCourse.mutateAsync({
				name: newCourse.name.trim(),
				code: newCourse.code.trim(),
				departmentId: newCourse.departmentId,
				description: newCourse.description.trim() || undefined,
				isActive: true,
			});
			setIsCreateDialogOpen(false);
			setNewCourse({
				name: "",
				code: "",
				departmentId: "",
				description: "",
			});
		} catch (error) {
			// Error is handled by the mutation hook
		}
	};

	const handleSearch = (value: string) => {
		setSearchTerm(value);
	};

	const handleStatusFilter = (value: string) => {
		setStatusFilter(value as "all" | "active" | "inactive");
	};

	const handleDepartmentFilter = (value: string) => {
		setDepartmentFilter(value);
	};

	const handleDelete = (course: Course) => {
		setCourseToDelete(course);
		setDeleteDialogOpen(true);
	};

	const confirmDelete = () => {
		if (courseToDelete) {
			deleteCourse.mutate(courseToDelete.id, {
				onSuccess: () => {
					setDeleteDialogOpen(false);
					setCourseToDelete(null);
				},
			});
		}
	};

	const handleToggleStatus = (course: Course) => {
		toggleStatus.mutate({
			id: course.id,
			isActive: !course.isActive,
		});
	};

	const clearFilters = () => {
		setSearchTerm("");
		setStatusFilter("all");
		setDepartmentFilter("all");
	};

	const hasActiveFilters = searchTerm || statusFilter !== "all" || departmentFilter !== "all";

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
					<p className="text-gray-600">Manage your academic courses and track their progress</p>
				</div>
				<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button className="bg-primary-500 hover:bg-primary-600">
							<Plus className="w-4 h-4 mr-2" />
							Add Course
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create New Course</DialogTitle>
							<DialogDescription>Add a new course to your academic programs.</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="name">Course Name</Label>
									<Input
										id="name"
										value={newCourse.name}
										onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
										placeholder="e.g., Bachelor of Science in Information Technology"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="code">Course Code</Label>
									<Input
										id="code"
										value={newCourse.code}
										onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
										placeholder="e.g., BSIT"
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="department">Department</Label>
								<Select onValueChange={(value) => setNewCourse({ ...newCourse, departmentId: value })}>
									<SelectTrigger>
										<SelectValue placeholder="Select department" />
									</SelectTrigger>
									<SelectContent>
										{departmentsData?.departments.map((department) => (
											<SelectItem key={department.id} value={department.id}>
												{department.name} ({department.code})
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="description">Description</Label>
								<Input
									id="description"
									value={newCourse.description}
									onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
									placeholder="Enter course description..."
								/>
							</div>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
								Cancel
							</Button>
							<Button 
								onClick={handleCreateCourse} 
								className="bg-primary-500 hover:bg-primary-600"
								disabled={createCourse.isPending}
							>
								{createCourse.isPending ? "Creating..." : "Create Course"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			{/* Overview Stats */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card className="bg-secondary-50 border-primary-200">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600">Total Courses</p>
								<p className="text-2xl font-bold text-gray-900">{coursesData?.pagination.totalItems || 0}</p>
							</div>
							<BookOpen className="w-8 h-8 text-primary-600" />
						</div>
					</CardContent>
				</Card>
				<Card className="bg-green-50 border-green-200">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600">Active Courses</p>
								<p className="text-2xl font-bold text-gray-900">
									{coursesData?.courses.filter(c => c.isActive).length || 0}
								</p>
							</div>
							<Building2 className="w-8 h-8 text-green-600" />
						</div>
					</CardContent>
				</Card>
				<Card className="bg-blue-50 border-blue-200">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600">Total Sections</p>
								<p className="text-2xl font-bold text-gray-900">
									{coursesData?.courses.reduce((total, course) => total + (course.sections?.length || 0), 0) || 0}
								</p>
							</div>
							<BookOpen className="w-8 h-8 text-blue-600" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Courses Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
				{coursesData?.courses.map((course) => (
					<Card key={course.id} className="hover:shadow-lg transition-shadow">
						<CardHeader className="pb-3">
							<div className="flex justify-between items-start">
								<div>
									<CardTitle className="text-lg">{course.name}</CardTitle>
									<CardDescription className="text-sm">{course.department?.name}</CardDescription>
								</div>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="sm">
											<MoreHorizontal className="w-4 h-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem
											onClick={() => router.push(`/dashboard/instructor/courses/${course.id}`)}
										>
											<Eye className="mr-2 h-4 w-4" />
											View Details
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => router.push(`/dashboard/instructor/courses/${course.id}/edit`)}
										>
											<Edit className="mr-2 h-4 w-4" />
											Edit Course
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											onClick={() => handleToggleStatus(course)}
										>
											{course.isActive ? (
												<>
													<ToggleLeft className="mr-2 h-4 w-4" />
													Deactivate
												</>
											) : (
												<>
													<ToggleRight className="mr-2 h-4 w-4" />
													Activate
												</>
											)}
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => handleDelete(course)}
											className="text-red-600"
										>
											<Trash2 className="mr-2 h-4 w-4" />
											Delete
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
							<div className="flex gap-2 mt-2">
								<Badge variant="outline">{course.code}</Badge>
								<Badge variant={course.isActive ? "default" : "secondary"}>
									{course.isActive ? "Active" : "Inactive"}
								</Badge>
								<Badge variant="outline">{course.sections?.length || 0} sections</Badge>
							</div>
						</CardHeader>
					</Card>
				))}
			</div>

			{/* Detailed Table View */}
			<Card>
				<CardHeader>
					<CardTitle>Course Details</CardTitle>
					<CardDescription>Overview of all courses</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex items-center justify-center py-8">
							<div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
						</div>
					) : coursesData?.courses.length === 0 ? (
						<div className="text-center py-8">
							<p className="text-gray-500">No courses found</p>
							<Button
								variant="outline"
								onClick={() => setIsCreateDialogOpen(true)}
								className="mt-4"
							>
								<Plus className="w-4 h-4 mr-2" />
								Add First Course
							</Button>
						</div>
					) : (
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Course Name</TableHead>
										<TableHead>Code</TableHead>
										<TableHead>Department</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Sections</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{coursesData?.courses.map((course) => (
										<TableRow key={course.id}>
											<TableCell>
												<div className="font-medium">{course.name}</div>
												{course.description && (
													<div className="text-sm text-gray-600 truncate max-w-xs">
														{course.description}
													</div>
												)}
											</TableCell>
											<TableCell>
												<Badge variant="outline">{course.code}</Badge>
											</TableCell>
											<TableCell>
												<div className="text-sm text-gray-600">{course.department?.name || "N/A"}</div>
											</TableCell>
											<TableCell>
												<Badge variant={course.isActive ? "default" : "secondary"}>
													{course.isActive ? "Active" : "Inactive"}
												</Badge>
											</TableCell>
											<TableCell>
												{course.sections?.length || 0} sections
											</TableCell>
											<TableCell className="text-right">
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="sm">
															<MoreHorizontal className="w-4 h-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem
															onClick={() => router.push(`/dashboard/instructor/courses/${course.id}`)}
														>
															<Eye className="mr-2 h-4 w-4" />
															View Details
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => router.push(`/dashboard/instructor/courses/${course.id}/edit`)}
														>
															<Edit className="mr-2 h-4 w-4" />
															Edit Course
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															onClick={() => handleToggleStatus(course)}
														>
															{course.isActive ? (
																<>
																	<ToggleLeft className="mr-2 h-4 w-4" />
																	Deactivate
																</>
															) : (
																<>
																	<ToggleRight className="mr-2 h-4 w-4" />
																	Activate
																</>
															)}
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => handleDelete(course)}
															className="text-red-600"
														>
															<Trash2 className="mr-2 h-4 w-4" />
															Delete
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Course</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete "{courseToDelete?.name}"? This action cannot be undone.
							{courseToDelete?.sections && courseToDelete.sections.length > 0 && (
								<span className="block mt-2 text-red-600 font-medium">
									This course has {courseToDelete.sections.length} active sections and cannot be deleted.
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
							disabled={deleteCourse.isPending || (courseToDelete?.sections && courseToDelete.sections.length > 0)}
						>
							{deleteCourse.isPending ? "Deleting..." : "Delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
