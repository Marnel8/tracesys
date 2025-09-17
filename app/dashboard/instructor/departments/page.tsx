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
	Building2,
	GraduationCap,
	BookOpen,
} from "lucide-react";
import { useDepartments, useDeleteDepartment, useToggleDepartmentStatus, useCreateDepartment } from "@/hooks/department";
import { toast } from "sonner";
import { Department, DepartmentFilters } from "@/data/departments";

export default function DepartmentsPage() {
	const router = useRouter();
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
	const [newDepartment, setNewDepartment] = useState({
		name: "",
		code: "",
		description: "",
	});

	// Fetch data
	const { data: departmentsData, isLoading } = useDepartments({
		search: searchTerm || undefined,
		status: statusFilter,
	});

	const deleteDepartment = useDeleteDepartment();
	const toggleStatus = useToggleDepartmentStatus();
	const createDepartment = useCreateDepartment();

	const handleCreateDepartment = async () => {
		if (!newDepartment.name.trim() || !newDepartment.code.trim()) {
			toast.error("Please fill in all required fields");
			return;
		}

		try {
			await createDepartment.mutateAsync({
				name: newDepartment.name.trim(),
				code: newDepartment.code.trim(),
				description: newDepartment.description.trim() || undefined,
				isActive: true,
			});
			setIsCreateDialogOpen(false);
			setNewDepartment({
				name: "",
				code: "",
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

	const handleDelete = (department: Department) => {
		setDepartmentToDelete(department);
		setDeleteDialogOpen(true);
	};

	const confirmDelete = () => {
		if (departmentToDelete) {
			deleteDepartment.mutate(departmentToDelete.id, {
				onSuccess: () => {
					setDeleteDialogOpen(false);
					setDepartmentToDelete(null);
				},
			});
		}
	};

	const handleToggleStatus = (department: Department) => {
		toggleStatus.mutate({
			id: department.id,
			isActive: !department.isActive,
		});
	};

	const clearFilters = () => {
		setSearchTerm("");
		setStatusFilter("all");
	};

	const hasActiveFilters = searchTerm || statusFilter !== "all";

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Department Management</h1>
					<p className="text-gray-600">Manage your academic departments and track their progress</p>
				</div>
				<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button className="bg-primary-500 hover:bg-primary-600">
							<Plus className="w-4 h-4 mr-2" />
							Add Department
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create New Department</DialogTitle>
							<DialogDescription>Add a new department to your academic structure.</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="name">Department Name</Label>
									<Input
										id="name"
										value={newDepartment.name}
										onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
										placeholder="e.g., College of Arts, Sciences, and Technology"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="code">Department Code</Label>
									<Input
										id="code"
										value={newDepartment.code}
										onChange={(e) => setNewDepartment({ ...newDepartment, code: e.target.value })}
										placeholder="e.g., CAST"
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="description">Description</Label>
								<Input
									id="description"
									value={newDepartment.description}
									onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
									placeholder="Enter department description..."
								/>
							</div>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
								Cancel
							</Button>
							<Button 
								onClick={handleCreateDepartment} 
								className="bg-primary-500 hover:bg-primary-600"
								disabled={createDepartment.isPending}
							>
								{createDepartment.isPending ? "Creating..." : "Create Department"}
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
								<p className="text-sm text-gray-600">Total Departments</p>
								<p className="text-2xl font-bold text-gray-900">{departmentsData?.pagination.totalItems || 0}</p>
							</div>
							<Building2 className="w-8 h-8 text-primary-600" />
						</div>
					</CardContent>
				</Card>
				<Card className="bg-green-50 border-green-200">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600">Active Departments</p>
								<p className="text-2xl font-bold text-gray-900">
									{departmentsData?.departments.filter(d => d.isActive).length || 0}
								</p>
							</div>
							<GraduationCap className="w-8 h-8 text-green-600" />
						</div>
					</CardContent>
				</Card>
				<Card className="bg-blue-50 border-blue-200">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600">Total Courses</p>
								<p className="text-2xl font-bold text-gray-900">
									{departmentsData?.departments.reduce((total, dept) => total + (dept.courses?.length || 0), 0) || 0}
								</p>
							</div>
							<BookOpen className="w-8 h-8 text-blue-600" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Departments Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
				{departmentsData?.departments.map((department) => (
					<Card key={department.id} className="hover:shadow-lg transition-shadow">
						<CardHeader className="pb-3">
							<div className="flex justify-between items-start">
								<div>
									<CardTitle className="text-lg">{department.name}</CardTitle>
									<CardDescription className="text-sm">{department.code}</CardDescription>
								</div>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="sm">
											<MoreHorizontal className="w-4 h-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem
											onClick={() => router.push(`/dashboard/instructor/departments/${department.id}`)}
										>
											<Eye className="mr-2 h-4 w-4" />
											View Details
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => router.push(`/dashboard/instructor/departments/${department.id}/edit`)}
										>
											<Edit className="mr-2 h-4 w-4" />
											Edit Department
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											onClick={() => handleToggleStatus(department)}
										>
											{department.isActive ? (
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
											onClick={() => handleDelete(department)}
											className="text-red-600"
										>
											<Trash2 className="mr-2 h-4 w-4" />
											Delete
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
							<div className="flex gap-2 mt-2">
								<Badge variant="outline">{department.code}</Badge>
								<Badge variant={department.isActive ? "default" : "secondary"}>
									{department.isActive ? "Active" : "Inactive"}
								</Badge>
								<Badge variant="outline">{department.courses?.length || 0} courses</Badge>
							</div>
						</CardHeader>
					</Card>
				))}
			</div>

			{/* Detailed Table View */}
			<Card>
				<CardHeader>
					<CardTitle>Department Details</CardTitle>
					<CardDescription>Overview of all departments</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex items-center justify-center py-8">
							<div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
						</div>
					) : departmentsData?.departments.length === 0 ? (
						<div className="text-center py-8">
							<p className="text-gray-500">No departments found</p>
							<Button
								variant="outline"
								onClick={() => setIsCreateDialogOpen(true)}
								className="mt-4"
							>
								<Plus className="w-4 h-4 mr-2" />
								Add First Department
							</Button>
						</div>
					) : (
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Department Name</TableHead>
										<TableHead>Code</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Courses</TableHead>
										<TableHead>Created</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{departmentsData?.departments.map((department) => (
										<TableRow key={department.id}>
											<TableCell>
												<div className="font-medium">{department.name}</div>
												{department.description && (
													<div className="text-sm text-gray-600 truncate max-w-xs">
														{department.description}
													</div>
												)}
											</TableCell>
											<TableCell>
												<Badge variant="outline">{department.code}</Badge>
											</TableCell>
											<TableCell>
												<Badge variant={department.isActive ? "default" : "secondary"}>
													{department.isActive ? "Active" : "Inactive"}
												</Badge>
											</TableCell>
											<TableCell>
												{department.courses?.length || 0} courses
											</TableCell>
											<TableCell>
												{new Date(department.createdAt).toLocaleDateString()}
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
															onClick={() => router.push(`/dashboard/instructor/departments/${department.id}`)}
														>
															<Eye className="mr-2 h-4 w-4" />
															View Details
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => router.push(`/dashboard/instructor/departments/${department.id}/edit`)}
														>
															<Edit className="mr-2 h-4 w-4" />
															Edit Department
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															onClick={() => handleToggleStatus(department)}
														>
															{department.isActive ? (
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
															onClick={() => handleDelete(department)}
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
						<DialogTitle>Delete Department</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete "{departmentToDelete?.name}"? This action cannot be undone.
							{departmentToDelete?.courses && departmentToDelete.courses.length > 0 && (
								<span className="block mt-2 text-red-600 font-medium">
									This department has {departmentToDelete.courses.length} active courses and cannot be deleted.
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
							disabled={deleteDepartment.isPending || (departmentToDelete?.courses && departmentToDelete.courses.length > 0)}
						>
							{deleteDepartment.isPending ? "Deleting..." : "Delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
