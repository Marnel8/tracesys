"use client";

import type React from "react";
import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Plus,
	MoreHorizontal,
	Edit,
	Trash2,
	Eye,
	ToggleLeft,
	ToggleRight,
	Users,
	UserCheck,
	UserX,
	Building2,
	Search,
	Filter,
	X,
} from "lucide-react";
import {
	useAgencies,
	useSupervisors,
	useSupervisorStats,
	useCreateSupervisor,
	useUpdateSupervisor,
	useDeleteSupervisor,
	useToggleSupervisorStatus,
	type SupervisorFormData,
	type SupervisorFilters,
} from "@/hooks/agency";
import { toast } from "sonner";
import { Supervisor } from "@/data/agencies";

function SupervisorsPageContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [selectedAgencyId, setSelectedAgencyId] = useState<string>("");
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [supervisorToDelete, setSupervisorToDelete] = useState<Supervisor | null>(null);
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [editingSupervisor, setEditingSupervisor] = useState<Supervisor | null>(null);

	// Fetch data
	const { data: agenciesData } = useAgencies({ status: "active" });
	const { data: supervisorsData, isLoading: supervisorsLoading } = useSupervisors(
		selectedAgencyId,
		{
			search: searchTerm || undefined,
			status: statusFilter,
			page: 1,
			limit: 50,
		}
	);
	const { data: stats } = useSupervisorStats(selectedAgencyId);

	// Mutations
	const createSupervisor = useCreateSupervisor();
	const updateSupervisor = useUpdateSupervisor();
	const deleteSupervisor = useDeleteSupervisor();
	const toggleStatus = useToggleSupervisorStatus();

	// Form state
	const [formData, setFormData] = useState<SupervisorFormData>({
		agencyId: "",
		name: "",
		email: "",
		phone: "",
		position: "",
		department: "",
		isActive: true,
	});

	// Handle URL parameters for pre-selecting agency
	useEffect(() => {
		const agencyParam = searchParams.get("agency");
		if (agencyParam && agenciesData?.agencies.find(a => a.id === agencyParam)) {
			setSelectedAgencyId(agencyParam);
		}
	}, [searchParams, agenciesData]);

	const handleAgencyChange = (agencyId: string) => {
		setSelectedAgencyId(agencyId);
		setSearchTerm("");
		setStatusFilter("all");
	};

	const handleSearch = (value: string) => {
		setSearchTerm(value);
	};

	const handleStatusFilter = (value: string) => {
		setStatusFilter(value as "all" | "active" | "inactive");
	};

	const validatePhoneNumber = (phone: string): boolean => {
		return /^\+63\d{10}$/.test(phone);
	};

	// Handle phone number input with +63 prefix
	const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/\D/g, ""); // Remove non-digits
		if (value.length <= 10) {
			setFormData({ ...formData, phone: value ? `+63${value}` : "" });
		}
	};

	const phoneValue = formData.phone?.replace("+63", "") || "";

	const handleCreate = () => {
		if (!selectedAgencyId) {
			toast.error("Please select an agency first");
			return;
		}
		setFormData({
			agencyId: selectedAgencyId,
			name: "",
			email: "",
			phone: "",
			position: "",
			department: "",
			isActive: true,
		});
		setCreateDialogOpen(true);
	};

	const handleEdit = (supervisor: Supervisor) => {
		setEditingSupervisor(supervisor);
		setFormData({
			agencyId: supervisor.agencyId,
			name: supervisor.name,
			email: supervisor.email,
			phone: supervisor.phone,
			position: supervisor.position,
			department: supervisor.department || "",
			isActive: supervisor.isActive,
		});
		setEditDialogOpen(true);
	};

	const handleDelete = (supervisor: Supervisor) => {
		setSupervisorToDelete(supervisor);
		setDeleteDialogOpen(true);
	};

	const handleSubmitCreate = () => {
		if (!formData.name || !formData.email || !formData.phone || !formData.position) {
			toast.error("Please fill in all required fields");
			return;
		}

		if (!validatePhoneNumber(formData.phone)) {
			toast.error("Phone number must be in format +63XXXXXXXXXX (10 digits after +63)");
			return;
		}

		createSupervisor.mutate(formData, {
			onSuccess: () => {
				setCreateDialogOpen(false);
				setFormData({
					agencyId: "",
					name: "",
					email: "",
					phone: "",
					position: "",
					department: "",
					isActive: true,
				});
			},
		});
	};

	const handleSubmitEdit = () => {
		if (!editingSupervisor || !formData.name || !formData.email || !formData.phone || !formData.position) {
			toast.error("Please fill in all required fields");
			return;
		}

		if (!validatePhoneNumber(formData.phone)) {
			toast.error("Phone number must be in format +63XXXXXXXXXX (10 digits after +63)");
			return;
		}

		updateSupervisor.mutate(
			{
				id: editingSupervisor.id,
				data: formData,
			},
			{
				onSuccess: () => {
					setEditDialogOpen(false);
					setEditingSupervisor(null);
					setFormData({
						agencyId: "",
						name: "",
						email: "",
						phone: "",
						position: "",
						department: "",
						isActive: true,
					});
				},
			}
		);
	};

	const confirmDelete = () => {
		if (supervisorToDelete) {
			deleteSupervisor.mutate(
				{
					id: supervisorToDelete.id,
					agencyId: supervisorToDelete.agencyId,
				},
				{
					onSuccess: () => {
						setDeleteDialogOpen(false);
						setSupervisorToDelete(null);
					},
				}
			);
		}
	};

	const handleToggleStatus = (supervisor: Supervisor) => {
		toggleStatus.mutate({
			id: supervisor.id,
			isActive: !supervisor.isActive,
		});
	};

	const clearFilters = () => {
		setSearchTerm("");
		setStatusFilter("all");
	};

	const hasActiveFilters = searchTerm || statusFilter !== "all";

	const selectedAgency = agenciesData?.agencies.find((a) => a.id === selectedAgencyId);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Supervisor Management</h1>
					<p className="text-gray-600">Manage supervisors for your practicum agencies</p>
				</div>
				<Button
					className="bg-primary-500 hover:bg-primary-600"
					onClick={handleCreate}
					disabled={!selectedAgencyId}
				>
					<Plus className="w-4 h-4 mr-2" />
					Add Supervisor
				</Button>
			</div>

			{/* Agency Selection */}
			<Card>
				<CardHeader>
					<CardTitle>Select Agency</CardTitle>
					<CardDescription>Choose an agency to manage its supervisors</CardDescription>
				</CardHeader>
				<CardContent>
					<Select value={selectedAgencyId} onValueChange={handleAgencyChange}>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Select an agency..." />
						</SelectTrigger>
						<SelectContent>
							{agenciesData?.agencies.map((agency) => (
								<SelectItem key={agency.id} value={agency.id}>
									<div className="flex items-center gap-2">
										<Building2 className="w-4 h-4" />
										<span>{agency.name}</span>
										<Badge variant="outline" className="ml-2">
											{agency.branchType}
										</Badge>
									</div>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</CardContent>
			</Card>

			{selectedAgencyId && (
				<>
					{/* Stats */}
					{stats && (
						<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
							<Card className="bg-blue-50 border-blue-200">
								<CardContent className="p-4">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm text-gray-600">Total Supervisors</p>
											<p className="text-2xl font-bold text-gray-900">{stats.totalSupervisors}</p>
										</div>
										<Users className="w-8 h-8 text-blue-600" />
									</div>
								</CardContent>
							</Card>
							<Card className="bg-green-50 border-green-200">
								<CardContent className="p-4">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm text-gray-600">Active</p>
											<p className="text-2xl font-bold text-gray-900">{stats.activeSupervisors}</p>
										</div>
										<UserCheck className="w-8 h-8 text-green-600" />
									</div>
								</CardContent>
							</Card>
							<Card className="bg-red-50 border-red-200">
								<CardContent className="p-4">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm text-gray-600">Inactive</p>
											<p className="text-2xl font-bold text-gray-900">{stats.inactiveSupervisors}</p>
										</div>
										<UserX className="w-8 h-8 text-red-600" />
									</div>
								</CardContent>
							</Card>
							<Card className="bg-purple-50 border-purple-200">
								<CardContent className="p-4">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm text-gray-600">With Practicums</p>
											<p className="text-2xl font-bold text-gray-900">{stats.supervisorsWithPracticums}</p>
										</div>
										<Building2 className="w-8 h-8 text-purple-600" />
									</div>
								</CardContent>
							</Card>
						</div>
					)}

					{/* Filters */}
					<Card>
						<CardHeader>
							<CardTitle>Filters</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex flex-col sm:flex-row gap-4">
								<div className="flex-1">
									<div className="relative">
										<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
										<Input
											placeholder="Search supervisors..."
											value={searchTerm}
											onChange={(e) => handleSearch(e.target.value)}
											className="pl-10"
										/>
									</div>
								</div>
								<Select value={statusFilter} onValueChange={handleStatusFilter}>
									<SelectTrigger className="w-full sm:w-48">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Status</SelectItem>
										<SelectItem value="active">Active</SelectItem>
										<SelectItem value="inactive">Inactive</SelectItem>
									</SelectContent>
								</Select>
								{hasActiveFilters && (
									<Button variant="outline" onClick={clearFilters}>
										<X className="w-4 h-4 mr-2" />
										Clear
									</Button>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Supervisors Table */}
					<Card>
						<CardHeader>
							<CardTitle>Supervisors</CardTitle>
							<CardDescription>
								{selectedAgency?.name} - {supervisorsData?.pagination.totalItems || 0} supervisors
							</CardDescription>
						</CardHeader>
						<CardContent>
							{supervisorsLoading ? (
								<div className="flex items-center justify-center py-8">
									<div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
								</div>
							) : supervisorsData?.supervisors.length === 0 ? (
								<div className="text-center py-8">
									<p className="text-gray-500">No supervisors found</p>
									<Button
										variant="outline"
										onClick={handleCreate}
										className="mt-4"
									>
										<Plus className="w-4 h-4 mr-2" />
										Add First Supervisor
									</Button>
								</div>
							) : (
								<div className="rounded-md border">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Name</TableHead>
												<TableHead>Position</TableHead>
												<TableHead>Department</TableHead>
												<TableHead>Contact</TableHead>
												<TableHead>Status</TableHead>
												<TableHead className="text-right">Actions</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{supervisorsData?.supervisors.map((supervisor) => (
												<TableRow key={supervisor.id}>
													<TableCell>
														<div className="font-medium">{supervisor.name}</div>
														<div className="text-sm text-gray-500">{supervisor.email}</div>
													</TableCell>
													<TableCell>
														<div className="font-medium">{supervisor.position}</div>
													</TableCell>
													<TableCell>
														<div className="text-sm">
															{supervisor.department || "N/A"}
														</div>
													</TableCell>
													<TableCell>
														<div className="text-sm">
															<div>{supervisor.phone}</div>
														</div>
													</TableCell>
													<TableCell>
														<Badge variant={supervisor.isActive ? "default" : "secondary"}>
															{supervisor.isActive ? "Active" : "Inactive"}
														</Badge>
													</TableCell>
													<TableCell className="text-right">
														<DropdownMenu>
															<DropdownMenuTrigger asChild>
																<Button variant="ghost" size="sm">
																	<MoreHorizontal className="w-4 h-4" />
																</Button>
															</DropdownMenuTrigger>
															<DropdownMenuContent align="end">
																<DropdownMenuItem onClick={() => handleEdit(supervisor)}>
																	<Edit className="mr-2 h-4 w-4" />
																	Edit
																</DropdownMenuItem>
																<DropdownMenuSeparator />
																<DropdownMenuItem onClick={() => handleToggleStatus(supervisor)}>
																	{supervisor.isActive ? (
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
																	onClick={() => handleDelete(supervisor)}
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
				</>
			)}

			{/* Create Supervisor Dialog */}
			<Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Add New Supervisor</DialogTitle>
						<DialogDescription>
							Add a new supervisor for {selectedAgency?.name}
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div>
							<label className="text-sm font-medium">Name *</label>
							<Input
								value={formData.name}
								onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								placeholder="Enter supervisor name"
							/>
						</div>
						<div>
							<label className="text-sm font-medium">Email *</label>
							<Input
								type="email"
								value={formData.email}
								onChange={(e) => setFormData({ ...formData, email: e.target.value })}
								placeholder="Enter email address"
							/>
						</div>
						<div>
							<label className="text-sm font-medium">Phone *</label>
							<Input
								value={formData.phone}
								onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
								placeholder="Enter phone number"
							/>
						</div>
						<div>
							<label className="text-sm font-medium">Position *</label>
							<Input
								value={formData.position}
								onChange={(e) => setFormData({ ...formData, position: e.target.value })}
								placeholder="Enter position"
							/>
						</div>
						<div>
							<label className="text-sm font-medium">Department</label>
							<Input
								value={formData.department}
								onChange={(e) => setFormData({ ...formData, department: e.target.value })}
								placeholder="Enter department (optional)"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setCreateDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button
							onClick={handleSubmitCreate}
							disabled={createSupervisor.isPending}
						>
							{createSupervisor.isPending ? "Creating..." : "Create"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Edit Supervisor Dialog */}
			<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Edit Supervisor</DialogTitle>
						<DialogDescription>
							Update supervisor information
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div>
							<label className="text-sm font-medium">Name *</label>
							<Input
								value={formData.name}
								onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								placeholder="Enter supervisor name"
							/>
						</div>
						<div>
							<label className="text-sm font-medium">Email *</label>
							<Input
								type="email"
								value={formData.email}
								onChange={(e) => setFormData({ ...formData, email: e.target.value })}
								placeholder="Enter email address"
							/>
						</div>
						<div>
							<label className="text-sm font-medium">Phone *</label>
							<div className="relative">
								<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
									+63
								</span>
								<Input
									value={phoneValue}
									onChange={handlePhoneChange}
									placeholder="9123456789"
									className={`pl-12 ${
										formData.phone && !validatePhoneNumber(formData.phone)
											? "border-red-500"
											: ""
									}`}
									maxLength={10}
									inputMode="numeric"
								/>
							</div>
							{formData.phone && !validatePhoneNumber(formData.phone) && (
								<p className="text-sm text-red-600 mt-1">
									Phone number must be in format +63XXXXXXXXXX (10 digits after +63)
								</p>
							)}
						</div>
						<div>
							<label className="text-sm font-medium">Position *</label>
							<Input
								value={formData.position}
								onChange={(e) => setFormData({ ...formData, position: e.target.value })}
								placeholder="Enter position"
							/>
						</div>
						<div>
							<label className="text-sm font-medium">Department</label>
							<Input
								value={formData.department}
								onChange={(e) => setFormData({ ...formData, department: e.target.value })}
								placeholder="Enter department (optional)"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setEditDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button
							onClick={handleSubmitEdit}
							disabled={updateSupervisor.isPending}
						>
							{updateSupervisor.isPending ? "Updating..." : "Update"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Supervisor</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete "{supervisorToDelete?.name}"? This action cannot be undone.
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
							disabled={deleteSupervisor.isPending}
						>
							{deleteSupervisor.isPending ? "Deleting..." : "Delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

export default function SupervisorsPage() {
	return (
		<Suspense fallback={<div className="p-4">Loading...</div>}>
			<SupervisorsPageContent />
		</Suspense>
	);
}
