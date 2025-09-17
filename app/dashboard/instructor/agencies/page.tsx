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
	Plus,
	MoreHorizontal,
	Edit,
	Trash2,
	Eye,
	ToggleLeft,
	ToggleRight,
	Building2,
	GraduationCap,
	BookOpen,
	Users,
} from "lucide-react";
import { useAgencies, useDeleteAgency, useToggleAgencyStatus } from "@/hooks/agency";
import { toast } from "sonner";
import { Agency } from "@/data/agencies";

export default function AgenciesPage() {
	const router = useRouter();
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
	const [branchTypeFilter, setBranchTypeFilter] = useState<"all" | "Main" | "Branch">("all");
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [agencyToDelete, setAgencyToDelete] = useState<Agency | null>(null);

	// Fetch data
	const { data: agenciesData, isLoading } = useAgencies({
		search: searchTerm || undefined,
		status: statusFilter,
		branchType: branchTypeFilter,
	});

	const deleteAgency = useDeleteAgency();
	const toggleStatus = useToggleAgencyStatus();


	const handleSearch = (value: string) => {
		setSearchTerm(value);
	};

	const handleStatusFilter = (value: string) => {
		setStatusFilter(value as "all" | "active" | "inactive");
	};

	const handleBranchTypeFilter = (value: string) => {
		setBranchTypeFilter(value as "all" | "Main" | "Branch");
	};

	const handleDelete = (agency: Agency) => {
		setAgencyToDelete(agency);
		setDeleteDialogOpen(true);
	};

	const confirmDelete = () => {
		if (agencyToDelete) {
			deleteAgency.mutate(agencyToDelete.id, {
				onSuccess: () => {
					setDeleteDialogOpen(false);
					setAgencyToDelete(null);
				},
			});
		}
	};

	const handleToggleStatus = (agency: Agency) => {
		toggleStatus.mutate({
			id: agency.id,
			isActive: !agency.isActive,
		});
	};

	const clearFilters = () => {
		setSearchTerm("");
		setStatusFilter("all");
		setBranchTypeFilter("all");
	};

	const hasActiveFilters = searchTerm || statusFilter !== "all" || branchTypeFilter !== "all";

	const formatTime = (time?: string) => {
		if (!time) return "N/A";
		return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: true,
		});
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Agency Management</h1>
					<p className="text-gray-600">Manage your practicum agencies and track their progress</p>
				</div>
				<div className="flex gap-2">
					<Button 
						variant="outline"
						onClick={() => router.push('/dashboard/instructor/agencies/supervisors')}
					>
						<Users className="w-4 h-4 mr-2" />
						Manage Supervisors
					</Button>
					<Button 
						className="bg-primary-500 hover:bg-primary-600"
						onClick={() => router.push('/dashboard/instructor/agencies/add')}
					>
						<Plus className="w-4 h-4 mr-2" />
						Add Agency
					</Button>
				</div>
			</div>

			{/* Overview Stats */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card className="bg-secondary-50 border-primary-200">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600">Total Agencies</p>
								<p className="text-2xl font-bold text-gray-900">{agenciesData?.pagination.totalItems || 0}</p>
							</div>
							<Building2 className="w-8 h-8 text-primary-600" />
						</div>
					</CardContent>
				</Card>
				<Card className="bg-green-50 border-green-200">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600">Active Agencies</p>
								<p className="text-2xl font-bold text-gray-900">
									{agenciesData?.agencies.filter(a => a.isActive).length || 0}
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
								<p className="text-sm text-gray-600">Main Branches</p>
								<p className="text-2xl font-bold text-gray-900">
									{agenciesData?.agencies.filter(a => a.branchType === "Main").length || 0}
								</p>
							</div>
							<BookOpen className="w-8 h-8 text-blue-600" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Agencies Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
				{agenciesData?.agencies.map((agency) => (
					<Card key={agency.id} className="hover:shadow-lg transition-shadow">
						<CardHeader className="pb-3">
							<div className="flex justify-between items-start">
								<div>
									<CardTitle className="text-lg">{agency.name}</CardTitle>
									<CardDescription className="text-sm">{agency.branchType}</CardDescription>
								</div>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="sm">
											<MoreHorizontal className="w-4 h-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem
											onClick={() => router.push(`/dashboard/instructor/agencies/${agency.id}`)}
										>
											<Eye className="mr-2 h-4 w-4" />
											View Details
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => router.push(`/dashboard/instructor/agencies/${agency.id}/edit`)}
										>
											<Edit className="mr-2 h-4 w-4" />
											Edit Agency
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => router.push(`/dashboard/instructor/agencies/supervisors?agency=${agency.id}`)}
										>
											<Users className="mr-2 h-4 w-4" />
											Manage Supervisors
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											onClick={() => handleToggleStatus(agency)}
										>
											{agency.isActive ? (
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
											onClick={() => handleDelete(agency)}
											className="text-red-600"
										>
											<Trash2 className="mr-2 h-4 w-4" />
											Delete
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
							<div className="flex gap-2 mt-2">
								<Badge variant="outline">{agency.branchType}</Badge>
								<Badge variant={agency.isActive ? "default" : "secondary"}>
									{agency.isActive ? "Active" : "Inactive"}
								</Badge>
								<Badge variant="outline">{agency.supervisors?.length || 0} supervisors</Badge>
							</div>
						</CardHeader>
					</Card>
				))}
			</div>

			{/* Detailed Table View */}
			<Card>
				<CardHeader>
					<CardTitle>Agency Details</CardTitle>
					<CardDescription>Overview of all agencies</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex items-center justify-center py-8">
							<div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
						</div>
					) : agenciesData?.agencies.length === 0 ? (
						<div className="text-center py-8">
							<p className="text-gray-500">No agencies found</p>
							<Button
								variant="outline"
								onClick={() => router.push('/dashboard/instructor/agencies/add')}
								className="mt-4"
							>
								<Plus className="w-4 h-4 mr-2" />
								Add First Agency
							</Button>
						</div>
					) : (
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Agency Name</TableHead>
										<TableHead>Type</TableHead>
										<TableHead>Contact</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Created</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{agenciesData?.agencies.map((agency) => (
										<TableRow key={agency.id}>
											<TableCell>
												<div className="font-medium">{agency.name}</div>
												<div className="text-sm text-gray-600 truncate max-w-xs">
													{agency.address}
												</div>
											</TableCell>
											<TableCell>
												<Badge variant="outline">{agency.branchType}</Badge>
											</TableCell>
											<TableCell>
												<div className="text-sm">
													<div className="font-medium">{agency.contactPerson}</div>
													<div className="text-gray-500">{agency.contactEmail}</div>
												</div>
											</TableCell>
											<TableCell>
												<Badge variant={agency.isActive ? "default" : "secondary"}>
													{agency.isActive ? "Active" : "Inactive"}
												</Badge>
											</TableCell>
											<TableCell>
												{new Date(agency.createdAt).toLocaleDateString()}
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
															onClick={() => router.push(`/dashboard/instructor/agencies/${agency.id}`)}
														>
															<Eye className="mr-2 h-4 w-4" />
															View Details
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => router.push(`/dashboard/instructor/agencies/${agency.id}/edit`)}
														>
															<Edit className="mr-2 h-4 w-4" />
															Edit Agency
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => router.push(`/dashboard/instructor/agencies/supervisors?agency=${agency.id}`)}
														>
															<Users className="mr-2 h-4 w-4" />
															Manage Supervisors
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															onClick={() => handleToggleStatus(agency)}
														>
															{agency.isActive ? (
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
															onClick={() => handleDelete(agency)}
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
						<DialogTitle>Delete Agency</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete "{agencyToDelete?.name}"? This action cannot be undone.
							{agencyToDelete?.practicums && agencyToDelete.practicums.length > 0 && (
								<span className="block mt-2 text-red-600 font-medium">
									This agency has {agencyToDelete.practicums.length} active practicums and cannot be deleted.
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
							disabled={deleteAgency.isPending || (agencyToDelete?.practicums && agencyToDelete.practicums.length > 0)}
						>
							{deleteAgency.isPending ? "Deleting..." : "Delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
