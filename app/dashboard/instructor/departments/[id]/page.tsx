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
	BookOpen,
	Calendar,
	Building2,
	GraduationCap,
} from "lucide-react";
import { useDepartment, useDeleteDepartment, useToggleDepartmentStatus } from "@/hooks/department";
import { useCourses } from "@/hooks/course";
import { toast } from "sonner";

interface DepartmentDetailsPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function DepartmentDetailsPage({ params }: DepartmentDetailsPageProps) {
	const router = useRouter();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	
	// Unwrap params using React.use()
	const { id } = use(params);

	// Fetch department data
	const { data: department, isLoading: departmentLoading } = useDepartment(id);
	const { data: coursesData } = useCourses({ 
		departmentId: id,
		status: "all" 
	});

	const deleteDepartment = useDeleteDepartment();
	const toggleStatus = useToggleDepartmentStatus();

	const handleDelete = () => {
		setDeleteDialogOpen(true);
	};

	const confirmDelete = () => {
		if (department) {
			deleteDepartment.mutate(department.id, {
				onSuccess: () => {
					setDeleteDialogOpen(false);
					router.push("/dashboard/instructor/departments");
				},
			});
		}
	};

	const handleToggleStatus = () => {
		if (department) {
			toggleStatus.mutate({
				id: department.id,
				isActive: !department.isActive,
			});
		}
	};

	if (departmentLoading) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
			</div>
		);
	}

	if (!department) {
		return (
			<div className="text-center py-8">
				<p className="text-gray-500">Department not found</p>
				<Button
					variant="outline"
					onClick={() => router.push("/dashboard/instructor/departments")}
					className="mt-4"
				>
					<ArrowLeft className="w-4 h-4 mr-2" />
					Back to Departments
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
						<h1 className="text-3xl font-bold text-gray-900">{department.name}</h1>
						<p className="text-gray-600">
							{department.code} • {department.isActive ? "Active" : "Inactive"}
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
							onClick={() => router.push(`/dashboard/instructor/departments/${department.id}/edit`)}
						>
							<Edit className="w-4 h-4 mr-2" />
							Edit Department
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={handleToggleStatus}
						>
							{department.isActive ? (
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
				{/* Department Information */}
				<div className="lg:col-span-2 space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Department Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="text-sm font-medium text-gray-500">Department Name</label>
									<p className="text-sm">{department.name}</p>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-500">Department Code</label>
									<p className="text-sm">
										<Badge variant="outline">{department.code}</Badge>
									</p>
								</div>
							</div>
							{department.description && (
								<div>
									<label className="text-sm font-medium text-gray-500">Description</label>
									<p className="text-sm">{department.description}</p>
								</div>
							)}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="text-sm font-medium text-gray-500">Status</label>
									<p className="text-sm">
										<Badge variant={department.isActive ? "default" : "secondary"}>
											{department.isActive ? "Active" : "Inactive"}
										</Badge>
									</p>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-500">Created</label>
									<p className="text-sm">
										{new Date(department.createdAt).toLocaleDateString()}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Courses */}
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle>Courses</CardTitle>
									<CardDescription>
										Manage department courses and academic programs
									</CardDescription>
								</div>
								<Button
									size="sm"
									onClick={() => router.push(`/dashboard/instructor/courses/add?departmentId=${department.id}`)}
								>
									<Plus className="w-4 h-4 mr-2" />
									Add Course
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							{coursesData?.courses.length === 0 ? (
								<div className="text-center py-8">
									<BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
									<p className="text-gray-500 mb-4">No courses created yet</p>
									<Button
										variant="outline"
										onClick={() => router.push(`/dashboard/instructor/courses/add?departmentId=${department.id}`)}
									>
										<Plus className="w-4 h-4 mr-2" />
										Create First Course
									</Button>
								</div>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Course Name</TableHead>
											<TableHead>Code</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Sections</TableHead>
											<TableHead className="w-[50px]"></TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{coursesData?.courses.map((course) => (
											<TableRow key={course.id}>
												<TableCell>
													<div>
														<p className="font-medium">{course.name}</p>
														{course.description && (
															<p className="text-sm text-gray-500">
																{course.description}
															</p>
														)}
													</div>
												</TableCell>
												<TableCell>
													<Badge variant="outline">{course.code}</Badge>
												</TableCell>
												<TableCell>
													<Badge
														variant={course.isActive ? "default" : "secondary"}
													>
														{course.isActive ? "Active" : "Inactive"}
													</Badge>
												</TableCell>
												<TableCell>{course.sections?.length || 0}</TableCell>
												<TableCell>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => router.push(`/dashboard/instructor/courses/${course.id}`)}
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
					</Card>
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
									<p className="text-sm font-medium">Total Courses</p>
									<p className="text-2xl font-bold">{coursesData?.courses.length || 0}</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<div className="p-2 bg-green-100 rounded-lg">
									<GraduationCap className="w-5 h-5 text-green-600" />
								</div>
								<div>
									<p className="text-sm font-medium">Active Courses</p>
									<p className="text-2xl font-bold">
										{coursesData?.courses.filter(c => c.isActive).length || 0}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<div className="p-2 bg-purple-100 rounded-lg">
									<Building2 className="w-5 h-5 text-purple-600" />
								</div>
								<div>
									<p className="text-sm font-medium">Total Sections</p>
									<p className="text-2xl font-bold">
										{coursesData?.courses.reduce((total, course) => total + (course.sections?.length || 0), 0) || 0}
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
								onClick={() => router.push(`/dashboard/instructor/courses/add?departmentId=${department.id}`)}
							>
								<Plus className="w-4 h-4 mr-2" />
								Add Course
							</Button>
							<Button
								variant="outline"
								className="w-full justify-start"
								onClick={() => router.push(`/dashboard/instructor/departments/${department.id}/edit`)}
							>
								<Edit className="w-4 h-4 mr-2" />
								Edit Department
							</Button>
						</CardContent>
					</Card> */}
				</div>
			</div>

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Department</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete "{department.name}"? This action cannot be undone.
							{coursesData?.courses && coursesData.courses.length > 0 && (
								<span className="block mt-2 text-red-600 font-medium">
									This department has {coursesData.courses.length} courses and cannot be deleted.
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
							disabled={deleteDepartment.isPending || (coursesData?.courses && coursesData.courses.length > 0)}
						>
							{deleteDepartment.isPending ? "Deleting..." : "Delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
