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
	RefreshCw,
} from "lucide-react";
import { useAuth } from "@/hooks/auth/useAuth";
import { useStudentsByTeacher, useStudent, useUpdateStudent, useDeleteStudent, type UpdateStudentParams } from "@/hooks/student/useStudent";
import { useAgencies } from "@/hooks/agency";
import { useDepartments } from "@/hooks/department";
import { useCourses } from "@/hooks/course";
import { useSections } from "@/hooks/section";
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
	
	// Dropdown states for edit form
	const [selectedAgencyId, setSelectedAgencyId] = useState<string>("");
	const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");
	const [selectedCourseId, setSelectedCourseId] = useState<string>("");
	const [includePracticum, setIncludePracticum] = useState(false);

	const { user } = useAuth();
	const teacherId = (user as any)?.user?.id ?? (user as any)?.data?.id ?? (user as any)?.id;

	const { data, isLoading, error, refetch } = useStudentsByTeacher(teacherId, {
		page: 1,
		limit: 50,
		search: searchTerm,
	});

	// Ensure hydration happens consistently
	useEffect(() => {
		setHasMounted(true);
		// Force refresh data on mount to ensure we have the latest data
		if (teacherId) {
			refetch();
		}
	}, [teacherId]); // refetch is stable, no need to include in deps

	// Fetch data for dropdowns
	const { data: agenciesData } = useAgencies({ status: "active" });
	const { data: departmentsData } = useDepartments({ status: editStudentOpen ? "all" : "active" });
	const { data: coursesData } = useCourses({ 
		status: editStudentOpen ? "all" : "active", 
		departmentId: selectedDepartmentId || undefined 
	});
	const { data: sectionsData } = useSections({ 
		status: editStudentOpen ? "all" : "active", 
		courseId: selectedCourseId || undefined 
	});

	// Get selected agency and its supervisors
	const selectedAgency = agenciesData?.agencies.find(agency => agency.id === selectedAgencyId);
	const availableSupervisors = selectedAgency?.supervisors || [];


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
			address: "",
			bio: "",
			departmentId: "",
			courseId: "",
			sectionId: "",
			agencyId: "",
			supervisorId: "",
			position: "",
			startDate: "",
			endDate: "",
			totalHours: 400,
			workSetup: "On-site",
			year: "",
			semester: "",
			yearLevel: "",
		} as UpdateStudentParams,
	});

	// Update form when student data is loaded
	useEffect(() => {
		if (selectedStudentData?.data && editStudentOpen) {
			const student = selectedStudentData.data;
			const enrollment = student.enrollments?.[0];
			const practicum = student.practicums?.[0];
			
			console.log("Student data:", student);
			console.log("Enrollment data:", enrollment);
			console.log("Practicum data:", practicum);
			
			// Extract IDs for dropdowns with robust fallbacks
			const departmentId =
				student.departmentId ||
				student.department?.id ||
				enrollment?.section?.course?.departmentId ||
				enrollment?.section?.course?.department?.id ||
				practicum?.departmentId ||
				practicum?.section?.course?.departmentId ||
				practicum?.section?.course?.department?.id ||
				"";
			const courseId =
				enrollment?.section?.courseId ||
				enrollment?.section?.course?.id ||
				practicum?.courseId ||
				practicum?.section?.courseId ||
				practicum?.section?.course?.id ||
				"";
			const sectionId =
				enrollment?.sectionId ||
				practicum?.sectionId ||
				practicum?.section?.id ||
				enrollment?.section?.id ||
				"";
			const agencyId = practicum?.agencyId || "";
			const supervisorId = practicum?.supervisorId || "";
			const workSetup = practicum?.workSetup || "On-site";
			// Normalize gender casing for select values
			const genderValue = (student.gender || "").toString();
			const normalizedGender = genderValue.toLowerCase();
			
			// Extract year level from enrollment or use default
			const rawYearLevel = enrollment?.section?.academicYear || 
								 enrollment?.yearLevel || 
								 student.yearLevel || 
								 "4th Year";
			
			// Normalize year level to match SelectItem values
			let yearLevel = "4th Year"; // default
			if (rawYearLevel) {
				const yearLevelStr = rawYearLevel.toString().toLowerCase();
				if (yearLevelStr.includes("4th") || yearLevelStr.includes("4")) {
					yearLevel = "4th Year";
				} else if (yearLevelStr.includes("3rd") || yearLevelStr.includes("3")) {
					yearLevel = "3rd Year";
				} else if (yearLevelStr.includes("2nd") || yearLevelStr.includes("2")) {
					yearLevel = "2nd Year";
				} else if (yearLevelStr.includes("1st") || yearLevelStr.includes("1")) {
					yearLevel = "1st Year";
				}
			}
			
			const year = yearLevel.includes("4th") ? "4th" : 
						yearLevel.includes("3rd") ? "3rd" :
						yearLevel.includes("2nd") ? "2nd" : "1st";
			
			console.log("Extracted values:", {
				departmentId,
				courseId,
				sectionId,
				agencyId,
				supervisorId,
				workSetup,
				yearLevel,
				year
			});
			
			// Set dropdown states
			setSelectedDepartmentId(departmentId);
			setSelectedCourseId(courseId);
			setSelectedAgencyId(agencyId);
			setIncludePracticum(!!agencyId);
			
			// Reset form with all values
			const formData = {
				id: student.id,
				firstName: student.firstName,
				lastName: student.lastName,
				middleName: student.middleName || "",
				email: student.email,
				phone: student.phone,
				age: student.age,
				gender: normalizedGender,
				studentId: student.studentId,
				address: student.address || "",
				bio: student.bio || "",
				departmentId: departmentId,
				courseId: courseId,
				sectionId: sectionId,
				agencyId: agencyId,
				supervisorId: supervisorId,
				position: practicum?.position || "",
				startDate: practicum?.startDate ? new Date(practicum.startDate).toISOString().split('T')[0] : "",
				endDate: practicum?.endDate ? new Date(practicum.endDate).toISOString().split('T')[0] : "",
				totalHours: practicum?.totalHours || 400,
				workSetup: workSetup,
				year: year,
				semester: "2nd",
				yearLevel: yearLevel,
			};
			
			console.log("Form data being set:", formData);
			form.reset(formData);
		}
	}, [selectedStudentData, editStudentOpen, form]);

	// Infer courseId and departmentId when only sectionId exists
	useEffect(() => {
		if (!editStudentOpen) return;
		const currentSectionId = form.getValues("sectionId");
		const currentCourseId = form.getValues("courseId");
		const currentDepartmentId = form.getValues("departmentId");

		if (currentSectionId && (!currentCourseId || !currentDepartmentId)) {
			const section = sectionsData?.sections.find((s) => s.id === currentSectionId);
			if (section?.courseId && !currentCourseId) {
				setSelectedCourseId(section.courseId);
				form.setValue("courseId", section.courseId);
			}
			const courseIdToUse = section?.courseId || currentCourseId;
			if (courseIdToUse && !currentDepartmentId) {
				const course = coursesData?.courses.find((c) => c.id === courseIdToUse);
				if (course?.departmentId) {
					setSelectedDepartmentId(course.departmentId);
					form.setValue("departmentId", course.departmentId);
				}
			}
		}
	}, [editStudentOpen, sectionsData, coursesData]);

	// Handler functions
	const handleDepartmentChange = (departmentId: string) => {
		setSelectedDepartmentId(departmentId);
		setSelectedCourseId("");
		form.setValue("departmentId", departmentId);
		form.setValue("courseId", "");
		form.setValue("sectionId", "");
	};

	const handleCourseChange = (courseId: string) => {
		setSelectedCourseId(courseId);
		form.setValue("courseId", courseId);
		form.setValue("sectionId", "");
	};

	const handleAgencyChange = (agencyId: string) => {
		setSelectedAgencyId(agencyId);
		form.setValue("agencyId", agencyId);
		form.setValue("supervisorId", "");
	};

	const handleViewProfile = (id: string) => {
		setSelectedStudentId(id);
		setViewProfileOpen(true);
	};

	const handleEditStudent = (studentId: string) => {
		setSelectedStudentId(studentId);
		setEditStudentOpen(true);
		// Reset dropdown states when opening dialog
		setSelectedDepartmentId("");
		setSelectedCourseId("");
		setSelectedAgencyId("");
		setIncludePracticum(false);
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
			console.log("Deleting student with ID:", selectedStudentId);
			await deleteStudentMutation.mutateAsync(selectedStudentId);
			console.log("Student deleted successfully");
			toast.success("Student deleted successfully");
			setDeleteAlertOpen(false);
			setSelectedStudentId(null);
		} catch (error: any) {
			console.error("Delete error:", error);
			toast.error(error.message || "Failed to delete student");
		}
	};

	const serverStudents = (data as any)?.data?.students ?? [];

	const normalizedStudents = useMemo(() => {
		return serverStudents.map((s: any) => {
			const enrollment = s.enrollments?.[0];
			const section = enrollment?.section;
			const course = section?.course;
			const practicum = s.practicums?.[0];
			const agency = practicum?.agency;
			
			// Use computed fields first, then fall back to nested structure
			const courseName = s.computed?.courseName || course?.code || course?.name || "-";
			const sectionName = s.computed?.sectionName || section?.name || "-";
			const agencyName = s.computed?.agencyName || agency?.name || "-";
			
			return {
				id: s.id,
				name: `${s.firstName} ${s.lastName}`,
				course: courseName,
				section: sectionName,
				email: s.email,
				agency: agencyName,
				status: s.isActive ? "Active" : "Inactive",
				attendance: s.computed?.attendance,
				requirements: s.computed?.requirements,
				reports: s.computed?.reports,
				studentId: s.studentId,
			};
		});
	}, [serverStudents]);

	// Get unique sections from the data for dynamic filter options
	const availableSections = useMemo(() => {
		const sections = new Set(normalizedStudents.map((student: any) => student.section).filter(Boolean));
		return Array.from(sections).sort() as string[];
	}, [normalizedStudents]);

	const filteredStudents = useMemo(() => {
		return normalizedStudents.filter((student: any) => {
			const matchesSearch =
				student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				String(student.id).includes(searchTerm) ||
				student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
				student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
			const matchesSection =
				selectedSection === "all" || student.section === selectedSection;
			const matchesStatus =
				selectedStatus === "all" ||
				student.status === selectedStatus;

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
				<div className="flex gap-2">
					<Button 
						variant="outline" 
						onClick={() => refetch()}
						disabled={isLoading}
					>
						<RefreshCw className={`w-4 h-4 mr-2 ${hasMounted && isLoading ? 'animate-spin' : ''}`} />
						Refresh
					</Button>
					{/* <Button className="bg-primary-500 hover:bg-primary-600">
						<UserPlus className="w-4 h-4 mr-2" />
						Add Student
					</Button> */}
				</div>
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
								{availableSections.map((section) => (
									<SelectItem key={section} value={section}>
										{section}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select value={selectedStatus} onValueChange={setSelectedStatus}>
							<SelectTrigger className="w-full md:w-40">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Status</SelectItem>
								<SelectItem value="Active">Active</SelectItem>
								<SelectItem value="Inactive">Inactive</SelectItem>
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
															{student.studentId}
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
				<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
				<DialogContent className="max-w-6xl max-h-[95vh] flex flex-col">
					<DialogHeader className="flex-shrink-0">
						<DialogTitle className="flex items-center gap-2">
							<Edit className="w-5 h-5" />
							Edit Student
						</DialogTitle>
						<DialogDescription>
							Update student information
						</DialogDescription>
					</DialogHeader>
					
					<Form {...form}>
						<form onSubmit={form.handleSubmit(handleUpdateStudent)} className="flex-1 flex flex-col min-h-0">
							<div className="flex-1 overflow-y-auto pr-2">
								<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
									{/* Personal Information */}
									<div className="lg:col-span-2 space-y-6">
									<Card>
										<CardHeader>
											<CardTitle>Personal Information</CardTitle>
											<CardDescription>
												Basic student information and contact details
											</CardDescription>
										</CardHeader>
										<CardContent className="space-y-4">
											<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
												<FormField
													control={form.control}
													name="firstName"
													render={({ field }) => (
														<FormItem>
															<FormLabel>First Name *</FormLabel>
															<FormControl>
																<Input placeholder="Enter first name" {...field} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													control={form.control}
													name="middleName"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Middle Name</FormLabel>
															<FormControl>
																<Input placeholder="Enter middle name" {...field} />
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
															<FormLabel>Last Name *</FormLabel>
															<FormControl>
																<Input placeholder="Enter last name" {...field} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											</div>

											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<FormField
													control={form.control}
													name="email"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Email Address *</FormLabel>
															<FormControl>
																<Input placeholder="student@omsc.edu.ph" type="email" {...field} />
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
															<FormLabel>Phone Number *</FormLabel>
															<FormControl>
																<Input placeholder="+63 912 345 6789" {...field} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											</div>

											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<FormField
													control={form.control}
													name="age"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Age *</FormLabel>
															<FormControl>
																<Input 
																	placeholder="18"
																	type="number"
																	min="16"
																	max="100"
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
															<FormLabel>Gender *</FormLabel>
															<Select onValueChange={field.onChange} value={field.value}>
																<FormControl>
																	<SelectTrigger>
																		<SelectValue placeholder="Select gender" />
																	</SelectTrigger>
																</FormControl>
																<SelectContent>
																	<SelectItem value="male">Male</SelectItem>
																	<SelectItem value="female">Female</SelectItem>
																	<SelectItem value="other">Other</SelectItem>
																</SelectContent>
															</Select>
															<FormMessage />
														</FormItem>
													)}
												/>
											</div>

											{/* Additional Personal Information */}
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<FormField
													control={form.control}
													name="address"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Address</FormLabel>
															<FormControl>
																<Input placeholder="Enter address" {...field} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													control={form.control}
													name="yearLevel"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Year Level</FormLabel>
															<Select onValueChange={field.onChange} value={field.value || ""}>
																<FormControl>
																	<SelectTrigger>
																		<SelectValue placeholder="Select year level" />
																	</SelectTrigger>
																</FormControl>
																<SelectContent>
																	<SelectItem value="4th Year">4th Year</SelectItem>
																	<SelectItem value="3rd Year">3rd Year</SelectItem>
																	<SelectItem value="2nd Year">2nd Year</SelectItem>
																	<SelectItem value="1st Year">1st Year</SelectItem>
																</SelectContent>
															</Select>
															<FormMessage />
														</FormItem>
													)}
												/>
											</div>

											<FormField
												control={form.control}
												name="bio"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Bio</FormLabel>
														<FormControl>
															<Input placeholder="Enter bio" {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</CardContent>
									</Card>

									{/* Academic Information */}
									<Card>
										<CardHeader>
											<CardTitle>Academic Information</CardTitle>
											<CardDescription>
												Student's academic details and enrollment information
											</CardDescription>
										</CardHeader>
										<CardContent className="space-y-4">
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<FormField
													control={form.control}
													name="studentId"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Student ID *</FormLabel>
															<FormControl>
																<Input placeholder="MBO-IT-0000" {...field} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													control={form.control}
													name="departmentId"
													render={({ field }) => (
														<FormItem>
															<FormLabel>College *</FormLabel>
															<Select
																onValueChange={handleDepartmentChange}
																value={field.value || selectedDepartmentId}
															>
																<FormControl>
																	<SelectTrigger>
																		<SelectValue placeholder="Select college" />
																	</SelectTrigger>
																</FormControl>
																<SelectContent>
																	{departmentsData?.departments.map((department) => (
																		<SelectItem key={department.id} value={department.id}>
																			{department.name} ({department.code})
																		</SelectItem>
																	))}
																</SelectContent>
															</Select>
															<FormMessage />
														</FormItem>
													)}
												/>
											</div>

											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<FormField
													control={form.control}
													name="courseId"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Course *</FormLabel>
															<Select
																onValueChange={handleCourseChange}
																value={field.value || selectedCourseId}
																disabled={!selectedDepartmentId}
															>
																<FormControl>
																	<SelectTrigger>
																		<SelectValue placeholder="Select course" />
																	</SelectTrigger>
																</FormControl>
																<SelectContent>
																	{coursesData?.courses.map((course) => (
																		<SelectItem key={course.id} value={course.id}>
																			{course.name} ({course.code})
																		</SelectItem>
																	))}
																</SelectContent>
															</Select>
															<FormMessage />
															{!selectedDepartmentId && (
																<p className="text-sm text-amber-600">
																	Please select a department first
																</p>
															)}
														</FormItem>
													)}
												/>
											</div>

											<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
												<FormField
													control={form.control}
													name="sectionId"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Section *</FormLabel>
															<Select
																onValueChange={(value) => form.setValue("sectionId", value)}
																value={field.value}
																disabled={!selectedCourseId}
															>
																<FormControl>
																	<SelectTrigger>
																		<SelectValue placeholder="Select section" />
																	</SelectTrigger>
																</FormControl>
																<SelectContent>
																	{sectionsData?.sections.map((section) => (
																		<SelectItem key={section.id} value={section.id}>
																			{section.name} ({section.code})
																		</SelectItem>
																	))}
																</SelectContent>
															</Select>
															<FormMessage />
															{!selectedCourseId && (
																<p className="text-sm text-amber-600">
																	Please select a course first
																</p>
															)}
														</FormItem>
													)}
												/>
												<FormField
													control={form.control}
													name="year"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Year Level *</FormLabel>
															<Select onValueChange={field.onChange} value={field.value || ""}>
																<FormControl>
																	<SelectTrigger>
																		<SelectValue placeholder="Select year" />
																	</SelectTrigger>
																</FormControl>
																<SelectContent>
																	<SelectItem value="4th">4th Year</SelectItem>
																</SelectContent>
															</Select>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													control={form.control}
													name="semester"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Semester *</FormLabel>
															<Select onValueChange={field.onChange} value={field.value || ""}>
																<FormControl>
																	<SelectTrigger>
																		<SelectValue placeholder="Select semester" />
																	</SelectTrigger>
																</FormControl>
																<SelectContent>
																	<SelectItem value="2nd">2nd Semester</SelectItem>
																</SelectContent>
															</Select>
															<FormMessage />
														</FormItem>
													)}
												/>
											</div>

										</CardContent>
									</Card>

									{/* Practicum Information */}
									<Card>
										<CardHeader>
											<CardTitle className="flex items-center justify-between">
												<span>Practicum Information</span>
												<div className="flex items-center space-x-2">
													<input
														type="checkbox"
														id="includePracticum"
														checked={includePracticum}
														onChange={(e) => setIncludePracticum(e.target.checked)}
														className="rounded border-gray-300"
													/>
													<label htmlFor="includePracticum" className="text-sm">
														Include practicum assignment
													</label>
												</div>
											</CardTitle>
											<CardDescription>
												{includePracticum 
													? "Select agency and supervisor for the student's practicum placement"
													: "Skip this section if practicum details are not yet available"
												}
											</CardDescription>
										</CardHeader>
										<CardContent className="space-y-4">
											{includePracticum ? (
												<>
													<FormField
														control={form.control}
														name="agencyId"
														render={({ field }) => (
															<FormItem>
																<FormLabel>Agency/Company *</FormLabel>
																<Select onValueChange={handleAgencyChange} value={field.value || selectedAgencyId}>
																	<FormControl>
																		<SelectTrigger>
																			<SelectValue placeholder="Select an agency" />
																		</SelectTrigger>
																	</FormControl>
																	<SelectContent>
																		{agenciesData?.agencies.map((agency) => (
																			<SelectItem key={agency.id} value={agency.id}>
																				{agency.name} ({agency.branchType})
																			</SelectItem>
																		))}
																	</SelectContent>
																</Select>
																<FormMessage />
															</FormItem>
														)}
													/>

													{selectedAgency && (
														<div className="p-4 bg-gray-50 rounded-lg">
															<h4 className="font-medium text-gray-900 mb-2">Selected Agency Details</h4>
															<div className="space-y-1 text-sm text-gray-600">
																<p><strong>Name:</strong> {selectedAgency.name}</p>
																<p><strong>Address:</strong> {selectedAgency.address}</p>
																<p><strong>Contact:</strong> {selectedAgency.contactPerson} ({selectedAgency.contactRole})</p>
																<p><strong>Phone:</strong> {selectedAgency.contactPhone}</p>
																<p><strong>Email:</strong> {selectedAgency.contactEmail}</p>
															</div>
														</div>
													)}

													<FormField
														control={form.control}
														name="supervisorId"
														render={({ field }) => (
															<FormItem>
																<FormLabel>Supervisor *</FormLabel>
																<Select onValueChange={(value) => form.setValue("supervisorId", value)} value={field.value}>
																	<FormControl>
																		<SelectTrigger>
																			<SelectValue placeholder="Select a supervisor" />
																		</SelectTrigger>
																	</FormControl>
																	<SelectContent>
																		{availableSupervisors.map((supervisor) => (
																			<SelectItem key={supervisor.id} value={supervisor.id}>
																				{supervisor.name} - {supervisor.position}
																			</SelectItem>
																		))}
																	</SelectContent>
																</Select>
																<FormMessage />
																{selectedAgencyId && availableSupervisors.length === 0 && (
																	<p className="text-sm text-amber-600">
																		No supervisors available for this agency. Please add supervisors to this agency first.
																	</p>
																)}
															</FormItem>
														)}
													/>

													<FormField
														control={form.control}
														name="position"
														render={({ field }) => (
															<FormItem>
																<FormLabel>Position/Job Title *</FormLabel>
																<FormControl>
																	<Input placeholder="Enter position or job title" {...field} />
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>

													<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
														<FormField
															control={form.control}
															name="startDate"
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Start Date *</FormLabel>
																	<FormControl>
																		<Input type="date" {...field} />
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>
														<FormField
															control={form.control}
															name="endDate"
															render={({ field }) => (
																<FormItem>
																	<FormLabel>End Date *</FormLabel>
																	<FormControl>
																		<Input type="date" {...field} />
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>
													</div>

													<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
														<FormField
															control={form.control}
															name="totalHours"
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Total Hours *</FormLabel>
																	<FormControl>
																		<Input 
																			type="number"
																			placeholder="400"
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
															name="workSetup"
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Work Setup *</FormLabel>
																	<Select onValueChange={(value) => form.setValue("workSetup", value as any)} value={field.value}>
																		<FormControl>
																			<SelectTrigger>
																				<SelectValue placeholder="Select work setup" />
																			</SelectTrigger>
																		</FormControl>
																		<SelectContent>
																			<SelectItem value="On-site">On-site</SelectItem>
																			<SelectItem value="Hybrid">Hybrid</SelectItem>
																			<SelectItem value="Work From Home">Work From Home</SelectItem>
																		</SelectContent>
																	</Select>
																	<FormMessage />
																</FormItem>
															)}
														/>
													</div>
												</>
											) : (
												<div className="p-4 bg-gray-50 rounded-lg text-center">
													<p className="text-sm text-gray-600">
														Practicum information can be added later when details are available.
													</p>
												</div>
											)}
										</CardContent>
									</Card>
								</div>

								{/* Sidebar for additional info */}
								<div className="space-y-6">
									<Card>
										<CardHeader>
											<CardTitle>Student Status</CardTitle>
											<CardDescription>
												Current student status and information
											</CardDescription>
										</CardHeader>
										<CardContent>
											<div className="space-y-2 text-sm">
												<div className="flex items-center gap-2">
													<Badge
														variant="outline"
														className="w-2 h-2 p-0 bg-green-500"
													></Badge>
													<span>Active Student</span>
												</div>
												<div className="flex items-center gap-2">
													<Badge
														variant="outline"
														className="w-2 h-2 p-0 bg-blue-500"
													></Badge>
													<span>Enrolled</span>
												</div>
												{includePracticum && (
													<div className="flex items-center gap-2">
														<Badge
															variant="outline"
															className="w-2 h-2 p-0 bg-orange-500"
														></Badge>
														<span>Practicum Assigned</span>
													</div>
												)}
											</div>
										</CardContent>
									</Card>
									</div>
								</div>
							</div>

							<DialogFooter className="flex-shrink-0 border-t pt-4">
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
