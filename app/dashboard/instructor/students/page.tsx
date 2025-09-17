"use client";

import { useMemo, useState, useEffect } from "react";
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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Search,
	MoreHorizontal,
	UserPlus,
	Download,
	Eye,
	Edit,
	Trash2,
	User,
	Calendar,
	MapPin,
	Phone,
	Building,
} from "lucide-react";
import { useAuth } from "@/hooks/auth/useAuth";
import { useStudentsByTeacher, useStudent, useUpdateStudent, useDeleteStudent, type UpdateStudentParams } from "@/hooks/student/useStudent";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function StudentsPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedSection, setSelectedSection] = useState("all");
	const [selectedStatus, setSelectedStatus] = useState("all");
	const [hasMounted, setHasMounted] = useState(false);
	
	// Dialog states
	const [viewProfileOpen, setViewProfileOpen] = useState(false);
	const [editStudentOpen, setEditStudentOpen] = useState(false);
	const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
	const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

	const { user } = useAuth();
	const teacherId = (user as any)?.user?.id ?? (user as any)?.data?.id ?? (user as any)?.id;

	// Ensure hydration happens consistently
	useEffect(() => {
		setHasMounted(true);
	}, []);

	const { data, isLoading, error } = useStudentsByTeacher(teacherId, {
		page: 1,
		limit: 50,
		search: searchTerm,
	});

	// Student operations hooks
	const { data: selectedStudentData, isLoading: isLoadingStudent } = useStudent(selectedStudentId || "");
	const updateStudentMutation = useUpdateStudent();
	const deleteStudentMutation = useDeleteStudent();

	// Form setup for editing
	const form = useForm<UpdateStudentParams>({
		defaultValues: {
			id: "",
			firstName: "",
			lastName: "",
			middleName: "",
			email: "",
			phone: "",
			age: 0,
			gender: "",
			studentId: "",
		},
	});

	// Update form when student data is loaded
	useEffect(() => {
		if (selectedStudentData?.data && editStudentOpen) {
			const student = selectedStudentData.data;
			form.reset({
				id: student.id,
				firstName: student.firstName,
				lastName: student.lastName,
				middleName: student.middleName || "",
				email: student.email,
				phone: student.phone,
				age: student.age,
				gender: student.gender,
				studentId: student.studentId,
			});
		}
	}, [selectedStudentData, editStudentOpen, form]);

	// Handler functions

	const handleViewProfile = (id: string) => {
		setSelectedStudentId(id);
		setViewProfileOpen(true);
	};

	const handleEditStudent = (studentId: string) => {
		setSelectedStudentId(studentId);
		setEditStudentOpen(true);
	};

	const handleDeleteStudent = (studentId: string) => {
		setSelectedStudentId(studentId);
		setDeleteAlertOpen(true);
	};

	const handleUpdateStudent = async (data: UpdateStudentParams) => {
		try {
			await updateStudentMutation.mutateAsync(data);
			toast.success("Student updated successfully");
			setEditStudentOpen(false);
			setSelectedStudentId(null);
		} catch (error: any) {
			toast.error(error.message || "Failed to update student");
		}
	};

	const handleConfirmDelete = async () => {
		if (!selectedStudentId) return;
		try {
			await deleteStudentMutation.mutateAsync(selectedStudentId);
			toast.success("Student deleted successfully");
			setDeleteAlertOpen(false);
			setSelectedStudentId(null);
		} catch (error: any) {
			toast.error(error.message || "Failed to delete student");
		}
	};

	const serverStudents = (data as any)?.data?.students ?? [];

	const normalizedStudents = useMemo(() => {

		console.log(serverStudents);
		return serverStudents.map((s: any) => {
			const enrollment = s.enrollments?.[0];
			const section = enrollment?.section;
			const course = section?.course;
			const practicum = s.practicums?.[0];
			const agency = practicum?.agency;
			return {
				id: s.id,
				name: `${s.firstName} ${s.lastName}`,
				course: course?.code || course?.name || "-",
				section: section?.name || "-",
				email: s.email,
				agency: agency?.name || "-",
				status: s.isActive ? "Active" : "Inactive",
				attendance: undefined as number | undefined,
				requirements: undefined as number | undefined,
				reports: undefined as number | undefined,
			};
		});
	}, [serverStudents]);

	const filteredStudents = useMemo(() => {
		return normalizedStudents.filter((student: any) => {
			const matchesSearch =
				student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				String(student.id).includes(searchTerm) ||
				student.email.toLowerCase().includes(searchTerm.toLowerCase());
			const matchesSection =
				selectedSection === "all" || student.section === selectedSection;
			const matchesStatus =
				selectedStatus === "all" ||
				student.status.toLowerCase() === selectedStatus;

			return matchesSearch && matchesSection && matchesStatus;
		});
	}, [normalizedStudents, searchTerm, selectedSection, selectedStatus]);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">
						Student Management
					</h1>
					<p className="text-gray-600">
						Manage your assigned students and their information
					</p>
				</div>
				{/* <Button className="bg-primary-500 hover:bg-primary-600">
					<UserPlus className="w-4 h-4 mr-2" />
					Add Student
				</Button> */}
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card className="bg-secondary-50 border-primary-200">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600">Total Students</p>
								<p className="text-2xl font-bold text-gray-900">
									{hasMounted && !isLoading ? normalizedStudents.length : "-"}
								</p>
							</div>
							<div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
								<UserPlus className="w-4 h-4 text-white" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="bg-secondary-50 border-green-200">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600">Active</p>
								<p className="text-2xl font-bold text-green-600">
									{hasMounted && !isLoading ? normalizedStudents.filter((s:any)=>s.status==="Active").length : "-"}
								</p>
							</div>
							<Badge className="bg-green-100 text-green-800">90%</Badge>
						</div>
					</CardContent>
				</Card>

				<Card className="bg-secondary-50 border-yellow-200">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600">Inactive</p>
								<p className="text-2xl font-bold text-yellow-600">
									{hasMounted && !isLoading ? normalizedStudents.filter((s:any)=>s.status!=="Active").length : "-"}
								</p>
							</div>
							<Badge className="bg-yellow-100 text-yellow-800">10%</Badge>
						</div>
					</CardContent>
				</Card>

				<Card className="bg-secondary-50 border-blue-200">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600">Avg. Attendance</p>
								<p className="text-2xl font-bold text-blue-600">-</p>
							</div>
							<Badge className="bg-blue-100 text-blue-800">Good</Badge>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Filters and Search */}
			<Card>
				<CardHeader>
					<CardTitle>Student List</CardTitle>
					<CardDescription>
						View and manage all your assigned students
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col md:flex-row gap-4 mb-6">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
							<Input
								placeholder="Search by name, ID, or email..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10"
							/>
						</div>
						<Select value={selectedSection} onValueChange={setSelectedSection}>
							<SelectTrigger className="w-full md:w-40">
								<SelectValue placeholder="Section" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Sections</SelectItem>
								<SelectItem value="4A">4A</SelectItem>
								<SelectItem value="4B">4B</SelectItem>
							</SelectContent>
						</Select>
						<Select value={selectedStatus} onValueChange={setSelectedStatus}>
							<SelectTrigger className="w-full md:w-40">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Status</SelectItem>
								<SelectItem value="active">Active</SelectItem>
								<SelectItem value="inactive">Inactive</SelectItem>
							</SelectContent>
						</Select>
						<Button variant="outline">
							<Download className="w-4 h-4 mr-2" />
							Export
						</Button>
					</div>

					{/* Students Table */}
					{(!hasMounted || isLoading) && (
						<div className="text-center py-8">
							<p className="text-gray-500">Loading students...</p>
						</div>
					)}
					{hasMounted && error && (
						<div className="text-center py-8">
							<p className="text-red-500">Failed to load students.</p>
						</div>
					)}
					{hasMounted && !isLoading && !error && (
						<>
							<div className="rounded-md border">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Student Info</TableHead>
											<TableHead>Course & Section</TableHead>
											<TableHead>Agency</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Attendance</TableHead>
											<TableHead>Progress</TableHead>
											<TableHead className="text-right">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredStudents.map((student: any) => (
											<TableRow key={student.id}>
												<TableCell>
													<div>
														<div className="font-medium text-gray-900">
															{student.name}
														</div>
														<div className="text-sm text-gray-600">
															{student.id}
														</div>
														<div className="text-sm text-gray-500">
															{student.email}
														</div>
													</div>
												</TableCell>
												<TableCell>
													<div>
														<div className="font-medium">{student.course}</div>
														<div className="text-sm text-gray-600">
															Section {student.section}
														</div>
													</div>
												</TableCell>
												<TableCell>
													<div className="text-sm">{student.agency}</div>
												</TableCell>
												<TableCell>
													<Badge
														variant={
															student.status === "Active" ? "default" : "secondary"
														}
														className={
															student.status === "Active"
																? "bg-green-100 text-green-800"
																: "bg-gray-100 text-gray-800"
														}
													>
														{student.status}
													</Badge>
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														<div className="text-sm font-medium">
															{student.attendance !== undefined ? `${student.attendance}%` : "-"}
														</div>
														<div
															className={`w-2 h-2 rounded-full ${
																student.attendance >= 90
																	? "bg-green-500"
																: student.attendance >= 80
																? "bg-yellow-500"
																: "bg-red-500"
															}`}
														/>
													</div>
												</TableCell>
												<TableCell>
													<div className="text-sm">
														<div>Req: {student.requirements ?? "-"}</div>
														<div>Rep: {student.reports ?? "-"}</div>
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
															<DropdownMenuItem onClick={() => handleViewProfile(student.id)}>
																<Eye className="mr-2 h-4 w-4" />
																View Profile
															</DropdownMenuItem>
															<DropdownMenuItem onClick={() => handleEditStudent(student.id)}>
																<Edit className="mr-2 h-4 w-4" />
																Edit Student
															</DropdownMenuItem>
															<DropdownMenuSeparator />
															<DropdownMenuItem 
																className="text-red-600"
																onClick={() => handleDeleteStudent(student.id)}
															>
																<Trash2 className="mr-2 h-4 w-4" />
																Delete Student
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>

							{filteredStudents.length === 0 && (
								<div className="text-center py-8">
									<p className="text-gray-500">
										No students found matching your criteria.
									</p>
								</div>
							)}
						</>
					)}
				</CardContent>
			</Card>

			{/* View Profile Dialog */}
			<Dialog open={viewProfileOpen} onOpenChange={setViewProfileOpen}>
				<DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<User className="w-5 h-5" />
							Student Profile
						</DialogTitle>
						<DialogDescription>
							Detailed information about the student
						</DialogDescription>
					</DialogHeader>
					
					{isLoadingStudent ? (
						<div className="text-center py-8">
							<p className="text-gray-500">Loading student details...</p>
						</div>
					) : selectedStudentData?.data ? (
						<div className="space-y-6">
							{/* Personal Information */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<Card>
									<CardHeader>
										<CardTitle className="text-lg flex items-center gap-2">
											<User className="w-4 h-4" />
											Personal Information
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div>
											<label className="text-sm font-medium text-gray-600">Full Name</label>
											<p className="text-gray-900">
												{`${selectedStudentData.data.firstName} ${selectedStudentData.data.middleName || ''} ${selectedStudentData.data.lastName}`.trim()}
											</p>
										</div>
										<div>
											<label className="text-sm font-medium text-gray-600">Email</label>
											<p className="text-gray-900">{selectedStudentData.data.email}</p>
										</div>
										<div>
											<label className="text-sm font-medium text-gray-600">Phone</label>
											<p className="text-gray-900">{selectedStudentData.data.phone}</p>
										</div>
										<div className="grid grid-cols-2 gap-4">
											<div>
												<label className="text-sm font-medium text-gray-600">Age</label>
												<p className="text-gray-900">{selectedStudentData.data.age}</p>
											</div>
											<div>
												<label className="text-sm font-medium text-gray-600">Gender</label>
												<p className="text-gray-900">{selectedStudentData.data.gender}</p>
											</div>
										</div>
										<div>
											<label className="text-sm font-medium text-gray-600">Student ID</label>
											<p className="text-gray-900">{selectedStudentData.data.studentId}</p>
										</div>
									</CardContent>
								</Card>

								{/* Academic Information */}
								<Card>
									<CardHeader>
										<CardTitle className="text-lg flex items-center gap-2">
											<Calendar className="w-4 h-4" />
											Academic Information
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										{selectedStudentData.data.enrollments?.[0] && (
											<>
												<div>
													<label className="text-sm font-medium text-gray-600">Course</label>
													<p className="text-gray-900">
														{selectedStudentData.data.enrollments[0].section?.course?.name || 'N/A'}
													</p>
												</div>
												<div>
													<label className="text-sm font-medium text-gray-600">Section</label>
													<p className="text-gray-900">
														{selectedStudentData.data.enrollments[0].section?.name || 'N/A'}
													</p>
												</div>
												<div>
													<label className="text-sm font-medium text-gray-600">Academic Year</label>
													<p className="text-gray-900">
														{selectedStudentData.data.enrollments[0].section?.academicYear || 'N/A'}
													</p>
												</div>
												<div>
													<label className="text-sm font-medium text-gray-600">Enrollment Date</label>
													<p className="text-gray-900">
														{new Date(selectedStudentData.data.enrollments[0].enrollmentDate).toLocaleDateString()}
													</p>
												</div>
											</>
										)}
										<div>
											<label className="text-sm font-medium text-gray-600">Status</label>
											<Badge
												variant={selectedStudentData.data.isActive ? "default" : "secondary"}
												className={
													selectedStudentData.data.isActive
														? "bg-green-100 text-green-800"
														: "bg-gray-100 text-gray-800"
												}
											>
												{selectedStudentData.data.isActive ? "Active" : "Inactive"}
											</Badge>
										</div>
									</CardContent>
								</Card>
							</div>

							{/* Practicum Information */}
							{selectedStudentData.data.practicums?.[0] && (
								<Card>
									<CardHeader>
										<CardTitle className="text-lg flex items-center gap-2">
											<Building className="w-4 h-4" />
											Practicum Information
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div>
												<label className="text-sm font-medium text-gray-600">Agency</label>
												<p className="text-gray-900">
													{selectedStudentData.data.practicums[0].agency?.name || 'N/A'}
												</p>
											</div>
											<div>
												<label className="text-sm font-medium text-gray-600">Position</label>
												<p className="text-gray-900">
													{selectedStudentData.data.practicums[0].position || 'N/A'}
												</p>
											</div>
											<div>
												<label className="text-sm font-medium text-gray-600">Start Date</label>
												<p className="text-gray-900">
													{selectedStudentData.data.practicums[0].startDate ? 
														new Date(selectedStudentData.data.practicums[0].startDate).toLocaleDateString() : 'N/A'}
												</p>
											</div>
											<div>
												<label className="text-sm font-medium text-gray-600">End Date</label>
												<p className="text-gray-900">
													{selectedStudentData.data.practicums[0].endDate ? 
														new Date(selectedStudentData.data.practicums[0].endDate).toLocaleDateString() : 'N/A'}
												</p>
											</div>
											<div>
												<label className="text-sm font-medium text-gray-600">Total Hours</label>
												<p className="text-gray-900">
													{selectedStudentData.data.practicums[0].totalHours || 0} hours
												</p>
											</div>
											<div>
												<label className="text-sm font-medium text-gray-600">Completed Hours</label>
												<p className="text-gray-900">
													{selectedStudentData.data.practicums[0].completedHours || 0} hours
												</p>
											</div>
										</div>
										{selectedStudentData.data.practicums[0].agency && (
											<div className="mt-4 pt-4 border-t">
												<h4 className="font-medium mb-2">Agency Details</h4>
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
													<div>
														<label className="text-gray-600">Address</label>
														<p>{selectedStudentData.data.practicums[0].agency.address}</p>
													</div>
													<div>
														<label className="text-gray-600">Contact Person</label>
														<p>{selectedStudentData.data.practicums[0].agency.contactPerson}</p>
													</div>
													<div>
														<label className="text-gray-600">Contact Phone</label>
														<p>{selectedStudentData.data.practicums[0].agency.contactPhone}</p>
													</div>
													<div>
														<label className="text-gray-600">Contact Email</label>
														<p>{selectedStudentData.data.practicums[0].agency.contactEmail}</p>
													</div>
												</div>
											</div>
										)}
									</CardContent>
								</Card>
							)}
						</div>
					) : (
						<div className="text-center py-8">
							<p className="text-red-500">Failed to load student details</p>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Edit Student Dialog */}
			<Dialog open={editStudentOpen} onOpenChange={setEditStudentOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Edit className="w-5 h-5" />
							Edit Student
						</DialogTitle>
						<DialogDescription>
							Update student information
						</DialogDescription>
					</DialogHeader>
					
					<Form {...form}>
						<form onSubmit={form.handleSubmit(handleUpdateStudent)} className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="firstName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>First Name</FormLabel>
											<FormControl>
												<Input placeholder="Enter first name" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="lastName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Last Name</FormLabel>
											<FormControl>
												<Input placeholder="Enter last name" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							
							<FormField
								control={form.control}
								name="middleName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Middle Name (Optional)</FormLabel>
										<FormControl>
											<Input placeholder="Enter middle name" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email</FormLabel>
											<FormControl>
												<Input placeholder="Enter email" type="email" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="phone"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Phone</FormLabel>
											<FormControl>
												<Input placeholder="Enter phone number" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<FormField
									control={form.control}
									name="age"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Age</FormLabel>
											<FormControl>
												<Input 
													placeholder="Enter age" 
													type="number"
													{...field}
													onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="gender"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Gender</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select gender" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="Male">Male</SelectItem>
													<SelectItem value="Female">Female</SelectItem>
													<SelectItem value="Other">Other</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="studentId"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Student ID</FormLabel>
											<FormControl>
												<Input placeholder="Enter student ID" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<DialogFooter>
								<Button 
									type="button" 
									variant="outline" 
									onClick={() => setEditStudentOpen(false)}
								>
									Cancel
								</Button>
								<Button 
									type="submit" 
									disabled={updateStudentMutation.isPending}
								>
									{updateStudentMutation.isPending ? "Updating..." : "Update Student"}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center gap-2">
							<Trash2 className="w-5 h-5 text-red-500" />
							Delete Student
						</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this student? This action cannot be undone and will permanently remove the student's data from the system.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleConfirmDelete}
							className="bg-red-600 hover:bg-red-700"
							disabled={deleteStudentMutation.isPending}
						>
							{deleteStudentMutation.isPending ? "Deleting..." : "Delete Student"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
