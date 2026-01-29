"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
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
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	ArrowLeft,
	Edit,
	Trash2,
	Building2,
	Phone,
	Mail,
	MapPin,
	Clock,
	Users,
	User,
	Calendar,
	GraduationCap,
	Navigation,
	ExternalLink,
	MoreHorizontal,
	ToggleLeft,
	ToggleRight,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAgency, useDeleteAgency, useToggleAgencyStatus } from "@/hooks/agency";
import { toast } from "sonner";

export default function AgencyDetailsPage() {
	const router = useRouter();
	const params = useParams();
	const agencyId = params.id as string;
	
	const { data: agency, isLoading, error } = useAgency(agencyId);
	const deleteAgencyMutation = useDeleteAgency();
	const toggleStatusMutation = useToggleAgencyStatus();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	const handleDeleteAgency = async () => {
		if (!agency) return;

		try {
			await deleteAgencyMutation.mutateAsync(agency.id);
			router.push("/dashboard/instructor/agencies");
		} catch (error) {
			// Error is handled by the mutation
		}
	};

	const handleToggleStatus = async () => {
		if (!agency) return;

		try {
			await toggleStatusMutation.mutateAsync({
				id: agency.id,
				isActive: !agency.isActive,
			});
		} catch (error) {
			// Error is handled by the mutation
		}
	};

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
			month: "long",
			day: "numeric",
		});
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="text-center py-12">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
					<p className="mt-2 text-sm text-gray-500">Loading agency details...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="space-y-6">
				<div className="text-center py-12">
					<Building2 className="mx-auto h-12 w-12 text-gray-400" />
					<h3 className="mt-2 text-sm font-medium text-gray-900">Error loading agency</h3>
					<p className="mt-1 text-sm text-gray-500">
						{error instanceof Error ? error.message : "Something went wrong"}
					</p>
					<div className="mt-6">
						<Button onClick={() => router.push("/dashboard/instructor/agencies")}>
							Back to Agencies
						</Button>
					</div>
				</div>
			</div>
		);
	}

	if (!agency) {
		return (
			<div className="space-y-6">
				<div className="text-center py-12">
					<Building2 className="mx-auto h-12 w-12 text-gray-400" />
					<h3 className="mt-2 text-sm font-medium text-gray-900">Agency not found</h3>
					<p className="mt-1 text-sm text-gray-500">
						The agency you're looking for doesn't exist.
					</p>
					<div className="mt-6">
						<Button onClick={() => router.push("/dashboard/instructor/agencies")}>
							Back to Agencies
						</Button>
					</div>
				</div>
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
						<h1 className="text-3xl font-bold text-gray-900">{agency.name}</h1>
						<p className="text-gray-600">
							{agency.branchType} • {agency.isActive ? "Active" : "Inactive"}
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
							onClick={() => router.push(`/dashboard/instructor/agencies/${agency.id}/edit`)}
						>
							<Edit className="w-4 h-4 mr-2" />
							Edit Agency
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={handleToggleStatus}
						>
							{agency.isActive ? (
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
							onClick={() => setDeleteDialogOpen(true)}
							className="text-red-600"
						>
							<Trash2 className="w-4 h-4 mr-2" />
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Agency</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete "{agency.name}"? This action cannot be undone.
							{agency.practicums && agency.practicums.length > 0 && (
								<span className="block mt-2 text-red-600 font-medium">
									This agency has {agency.practicums.length} active practicums and cannot be deleted.
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
							onClick={handleDeleteAgency}
							disabled={
								deleteAgencyMutation.isPending ||
								(agency.practicums && agency.practicums.length > 0)
							}
						>
							{deleteAgencyMutation.isPending ? "Deleting..." : "Delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Agency Information */}
				<div className="lg:col-span-2 space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Agency Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="text-sm font-medium text-gray-500">Agency Name</label>
									<p className="text-sm">{agency.name}</p>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-500">Branch Type</label>
									<div className="text-sm">
										<Badge variant="outline">{agency.branchType}</Badge>
									</div>
								</div>
							</div>
							<div>
								<label className="text-sm font-medium text-gray-500">Address</label>
								<p className="text-sm">{agency.address}</p>
								{agency.latitude != null && agency.longitude != null && (
									<div className="mt-2 space-y-1">
										<div className="flex items-center gap-2 text-xs text-gray-500">
											<Navigation className="h-3 w-3" />
											<span>Coordinates: {Number(agency.latitude).toFixed(6)}, {Number(agency.longitude).toFixed(6)}</span>
										</div>
										<div className="flex items-center gap-2">
											<Button
												size="sm"
												variant="outline"
												className="h-6 px-2 text-xs"
												onClick={() => {
													const lat = Number(agency.latitude);
													const lng = Number(agency.longitude);
													const url = `https://www.google.com/maps?q=${lat},${lng}`;
													window.open(url, '_blank');
												}}
											>
												<ExternalLink className="h-3 w-3 mr-1" />
												View on Map
											</Button>
											<Button
												size="sm"
												variant="outline"
												className="h-6 px-2 text-xs"
												onClick={() => {
													const lat = Number(agency.latitude);
													const lng = Number(agency.longitude);
													navigator.clipboard.writeText(`${lat}, ${lng}`);
													toast.success("Coordinates copied to clipboard");
												}}
											>
												Copy Coordinates
											</Button>
										</div>
									</div>
								)}
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="text-sm font-medium text-gray-500">Opening Time</label>
									<p className="text-sm">{formatTime(agency.openingTime)}</p>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-500">Closing Time</label>
									<p className="text-sm">{formatTime(agency.closingTime)}</p>
								</div>
							</div>
							{agency.operatingDays && (
								<div>
									<label className="text-sm font-medium text-gray-500">Operating Days</label>
									<p className="text-sm">{agency.operatingDays}</p>
								</div>
							)}
							{(agency.lunchStartTime || agency.lunchEndTime) && (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="text-sm font-medium text-gray-500">Lunch Start Time</label>
										<p className="text-sm">{formatTime(agency.lunchStartTime)}</p>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-500">Lunch End Time</label>
										<p className="text-sm">{formatTime(agency.lunchEndTime)}</p>
									</div>
								</div>
							)}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="text-sm font-medium text-gray-500">Status</label>
									<div className="text-sm">
										<Badge variant={agency.isActive ? "default" : "secondary"}>
											{agency.isActive ? "Active" : "Inactive"}
										</Badge>
									</div>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-500">Created</label>
									<p className="text-sm">
										{new Date(agency.createdAt).toLocaleDateString()}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Contact Information */}
					<Card>
						<CardHeader>
							<CardTitle>Contact Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="text-sm font-medium text-gray-500">Contact Person</label>
									<p className="text-sm">{agency.contactPerson}</p>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-500">Role/Position</label>
									<p className="text-sm">{agency.contactRole}</p>
								</div>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="text-sm font-medium text-gray-500">Phone Number</label>
									<p className="text-sm">{agency.contactPhone}</p>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-500">Email Address</label>
									<p className="text-sm">{agency.contactEmail}</p>
								</div>
							</div>
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
									<Users className="w-5 h-5 text-blue-600" />
								</div>
								<div>
									<p className="text-sm font-medium">Supervisors</p>
									<p className="text-2xl font-bold">{agency.supervisors?.length || 0}</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<div className="p-2 bg-green-100 rounded-lg">
									<GraduationCap className="w-5 h-5 text-green-600" />
								</div>
								<div>
									<p className="text-sm font-medium">Active Practicums</p>
									<p className="text-2xl font-bold">{agency.practicums?.length || 0}</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<div className="p-2 bg-purple-100 rounded-lg">
									<Building2 className="w-5 h-5 text-purple-600" />
								</div>
								<div>
									<p className="text-sm font-medium">Branch Type</p>
									<p className="text-2xl font-bold">{agency.branchType}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Quick Actions</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							<Button
								variant="outline"
								className="w-full justify-start"
								onClick={() => router.push(`/dashboard/instructor/agencies/${agency.id}/edit`)}
							>
								<Edit className="w-4 h-4 mr-2" />
								Edit Agency
							</Button>
							<Button
								variant="outline"
								className="w-full justify-start"
								onClick={handleToggleStatus}
							>
								{agency.isActive ? (
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
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Supervisors */}
			{agency.supervisors && agency.supervisors.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Users className="h-5 w-5" />
							Supervisors ({agency.supervisors.length})
						</CardTitle>
						<CardDescription>
							People who supervise students at this agency
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Position</TableHead>
									<TableHead>Department</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Phone</TableHead>
									<TableHead>Status</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{agency.supervisors.map((supervisor) => (
									<TableRow key={supervisor.id}>
										<TableCell className="font-medium">{supervisor.name}</TableCell>
										<TableCell>{supervisor.position}</TableCell>
										<TableCell>{supervisor.department || "N/A"}</TableCell>
										<TableCell>{supervisor.email}</TableCell>
										<TableCell>{supervisor.phone}</TableCell>
										<TableCell>
											<Badge variant={supervisor.isActive ? "default" : "secondary"}>
												{supervisor.isActive ? "Active" : "Inactive"}
											</Badge>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			)}

			{/* Practicums */}
			{agency.practicums && agency.practicums.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<GraduationCap className="h-5 w-5" />
							Active Practicums ({agency.practicums.length})
						</CardTitle>
						<CardDescription>
							Current student placements at this agency
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Position</TableHead>
									<TableHead>Student</TableHead>
									<TableHead>Start Date</TableHead>
									<TableHead>End Date</TableHead>
									<TableHead>Hours</TableHead>
									<TableHead>Status</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{agency.practicums.map((practicum) => (
									<TableRow key={practicum.id}>
										<TableCell className="font-medium">{practicum.position}</TableCell>
										<TableCell>
											{practicum.student ? (
												<div>
													<div className="font-medium">
														{practicum.student.firstName} {practicum.student.lastName}
													</div>
													<div className="text-sm text-gray-500">
														ID: {practicum.student.studentId}
													</div>
												</div>
											) : (
												`Student ID: ${practicum.studentId}`
											)}
										</TableCell>
										<TableCell>{formatDate(practicum.startDate)}</TableCell>
										<TableCell>{formatDate(practicum.endDate)}</TableCell>
										<TableCell>
											{practicum.completedHours}/{practicum.totalHours}
										</TableCell>
										<TableCell>
											<Badge variant={practicum.status === "active" ? "default" : "secondary"}>
												{practicum.status}
											</Badge>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
