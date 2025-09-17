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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
	UserPlus,
	Mail,
	Eye,
	EyeOff,
	Copy,
	Check,
	ArrowLeft,
	Camera,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getCourseOptions } from "@/data/instructor-courses";
import { useRegisterStudent } from "@/hooks/student";
import { useAgencies } from "@/hooks/agency";
import { useDepartments } from "@/hooks/department";
import { useCourses } from "@/hooks/course";
import { useSections } from "@/hooks/section";
import { toast } from "sonner";

const studentSchema = z.object({
	// Personal Information
	firstName: z.string().min(2, "First name must be at least 2 characters"),
	lastName: z.string().min(2, "Last name must be at least 2 characters"),
	middleName: z.string().optional(),
	email: z.string().email("Please enter a valid email address"),
	phone: z.string().min(10, "Phone number must be at least 10 digits"),
	age: z.number().min(16, "Age must be at least 16").max(100, "Age must be less than 100"),
	gender: z.string().min(1, "Please select a gender"),

	// Academic Information
	studentId: z.string().min(8, "Student ID must be at least 8 characters"),
	department: z.string().min(1, "Please select a college"),
	course: z.string().min(1, "Please select a course"),
	section: z.string().min(1, "Please select a section"),
	year: z.string().min(1, "Please select a year"),
	semester: z.string().min(1, "Please select a semester"),

	// Practicum Information
	agencyId: z.string().min(1, "Please select an agency"),
	supervisorId: z.string().min(1, "Please select a supervisor"),
	position: z.string().min(2, "Position is required"),
	startDate: z.string().min(1, "Start date is required"),
	endDate: z.string().min(1, "End date is required"),
	totalHours: z.number().min(1, "Total hours must be at least 1").default(400),
	workSetup: z.enum(["On-site", "Hybrid", "Work From Home"]).default("On-site"),

	// Account Settings
	sendCredentials: z.boolean().default(true),
	generatePassword: z.boolean().default(true),
	customPassword: z.string().optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

// Add type for created student
type CreatedStudent = StudentFormData & {
	id: string;
	password: string;
	avatar: string | null;
	avatarFileName: string | null;
	createdAt: string;
};

export default function AddStudentPage() {
	const router = useRouter();
	const [showPassword, setShowPassword] = useState(false);
	const [selectedAgencyId, setSelectedAgencyId] = useState<string>("");
	const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");
	const [selectedCourseId, setSelectedCourseId] = useState<string>("");
	
	// Fetch agencies for selection
	const { data: agenciesData } = useAgencies({ status: "active" });
	
	// Fetch departments, courses, and sections
	const { data: departmentsData } = useDepartments({ status: "active" });
	const { data: coursesData } = useCourses({ 
		status: "active", 
		departmentId: selectedDepartmentId || undefined 
	});
	const { data: sectionsData } = useSections({ 
		status: "active", 
		courseId: selectedCourseId || undefined 
	});
	
	// Get selected agency and its supervisors
	const selectedAgency = agenciesData?.agencies.find(agency => agency.id === selectedAgencyId);
	const availableSupervisors = selectedAgency?.supervisors || [];
	const [generatedPassword, setGeneratedPassword] = useState("");
	const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
	const [createdStudent, setCreatedStudent] = useState<any>(null);
	const [copiedField, setCopiedField] = useState("");
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [avatarPreview, setAvatarPreview] = useState<string>("");
	const [submittedPassword, setSubmittedPassword] = useState("");
	const [submittedEmail, setSubmittedEmail] = useState("");
	const [submittedSendCredentials, setSubmittedSendCredentials] = useState(true);

	// Use the student registration hook
	const registerStudent = useRegisterStudent();

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm<StudentFormData>({
		resolver: zodResolver(studentSchema) as any,
		defaultValues: {
			sendCredentials: true,
			generatePassword: true,
			firstName: "",
			lastName: "",
			middleName: "",
			email: "",
			phone: "",
			age: 18,
			gender: "",
			studentId: "",
			department: "",
			course: "",
			section: "",
			year: "",
			semester: "",
			agencyId: "",
			supervisorId: "",
			position: "",
			startDate: "",
			endDate: "",
			totalHours: 400,
			workSetup: "On-site",
			customPassword: "",
		},
	});

	const generatePassword = () => {
		const chars =
			"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
		let password = "";
		for (let i = 0; i < 12; i++) {
			password += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		setGeneratedPassword(password);
		setValue("customPassword", password);
	};

	const generateStudentId = () => {
		const year = new Date().getFullYear();
		const randomNum = Math.floor(Math.random() * 99999)
			.toString()
			.padStart(5, "0");
		return `${year}-${randomNum}`;
	};

	const copyToClipboard = (text: string, field: string) => {
		navigator.clipboard.writeText(text);
		setCopiedField(field);
		setTimeout(() => setCopiedField(""), 2000);
	};

	const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			if (file.size > 5 * 1024 * 1024) {
				// 5MB limit
				alert("File size must be less than 5MB");
				return;
			}

			if (!file.type.startsWith("image/")) {
				alert("Please select an image file");
				return;
			}

			setAvatarFile(file);

			// Create preview
			const reader = new FileReader();
			reader.onload = (e) => {
				setAvatarPreview(e.target?.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const removeAvatar = () => {
		setAvatarFile(null);
		setAvatarPreview("");
	};

	const onSubmit = async (data: StudentFormData) => {
		const password = data.generatePassword
			? generatedPassword
			: data.customPassword || "";

		// Map new practicum fields to old API format
		const studentData = {
			...data,
			password,
			avatar: avatarFile || undefined,
			// Map new fields to old API format
			agency: selectedAgency?.name || "",
			agencyAddress: selectedAgency?.address || "",
			supervisor: availableSupervisors.find(s => s.id === data.supervisorId)?.name || "",
			supervisorEmail: availableSupervisors.find(s => s.id === data.supervisorId)?.email || "",
			supervisorPhone: availableSupervisors.find(s => s.id === data.supervisorId)?.phone || "",
		};

		// Store submitted values for success modal
		setSubmittedPassword(password);
		setSubmittedEmail(data.email);
		setSubmittedSendCredentials(!!data.sendCredentials);

		registerStudent.mutate(studentData, {
			onSuccess: (response) => {
				setCreatedStudent(response.data);
				setIsSuccessDialogOpen(true);
				toast.success("Student created successfully!");
			},
			onError: (error) => {
				toast.error(error.message || "Failed to create student");
			},
		});
	};

	const handleAgencyChange = (agencyId: string) => {
		setSelectedAgencyId(agencyId);
		setValue("agencyId", agencyId);
		setValue("supervisorId", ""); // Reset supervisor when agency changes
	};

	const handleDepartmentChange = (departmentId: string) => {
		setSelectedDepartmentId(departmentId);
		setValue("department", departmentId);
		setValue("course", ""); // Reset course when department changes
		setValue("section", ""); // Reset section when department changes
		setSelectedCourseId("");
		setSelectedCourseId("");
	};

	const handleCourseChange = (courseId: string) => {
		setSelectedCourseId(courseId);
		setValue("course", courseId);
		setValue("section", ""); // Reset section when course changes
	};

	const watchGeneratePassword = watch("generatePassword");
	const watchSendCredentials = watch("sendCredentials");
	const isLoading = registerStudent.isPending;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button variant="outline" size="sm" onClick={() => router.back()}>
					<ArrowLeft className="w-4 h-4 mr-2" />
					Back
				</Button>
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Add New Student</h1>
					<p className="text-gray-600">
						Create a new student account for practicum management
					</p>
				</div>
			</div>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
								<div className="flex items-center gap-6">
									<div className="relative">
										<Avatar className="w-20 h-20">
											<AvatarImage
												src={
													avatarPreview || "/placeholder.svg?height=80&width=80"
												}
												alt="Profile"
											/>
											<AvatarFallback className="text-lg bg-gray-100">
												{watch("firstName")?.[0]?.toUpperCase() || ""}
												{watch("lastName")?.[0]?.toUpperCase() || ""}
											</AvatarFallback>
										</Avatar>
										{avatarPreview && (
											<Button
												type="button"
												variant="destructive"
												size="sm"
												className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
												onClick={removeAvatar}
											>
												×
											</Button>
										)}
									</div>
									<div className="space-y-2">
										<div className="flex gap-2">
											<Button
												type="button"
												variant="outline"
												onClick={() =>
													document.getElementById("avatar-upload")?.click()
												}
											>
												<Camera className="w-4 h-4 mr-2" />
												{avatarFile ? "Change Photo" : "Upload Photo"}
											</Button>
											{avatarFile && (
												<Button
													type="button"
													variant="outline"
													onClick={removeAvatar}
												>
													Remove
												</Button>
											)}
										</div>
										<input
											id="avatar-upload"
											type="file"
											accept="image/*"
											onChange={handleAvatarChange}
											className="hidden"
										/>
										<p className="text-sm text-gray-600">
											JPG, PNG or GIF. Max 5MB. Recommended: 400x400px
										</p>
										{avatarFile && (
											<p className="text-sm text-green-600">
												Selected: {avatarFile.name} (
												{(avatarFile.size / 1024 / 1024).toFixed(2)}MB)
											</p>
										)}
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div className="space-y-2">
										<Label htmlFor="firstName">First Name *</Label>
										<Input
											id="firstName"
											{...register("firstName")}
											placeholder="Enter first name"
										/>
										{errors.firstName && (
											<p className="text-sm text-red-600">
												{errors.firstName.message}
											</p>
										)}
									</div>
									<div className="space-y-2">
										<Label htmlFor="middleName">Middle Name</Label>
										<Input
											id="middleName"
											{...register("middleName")}
											placeholder="Enter middle name"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="lastName">Last Name *</Label>
										<Input
											id="lastName"
											{...register("lastName")}
											placeholder="Enter last name"
										/>
										{errors.lastName && (
											<p className="text-sm text-red-600">
												{errors.lastName.message}
											</p>
										)}
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="email">Email Address *</Label>
										<Input
											id="email"
											type="email"
											{...register("email")}
											placeholder="student@omsc.edu.ph"
										/>
										{errors.email && (
											<p className="text-sm text-red-600">
												{errors.email.message}
											</p>
										)}
									</div>
									<div className="space-y-2">
										<Label htmlFor="phone">Phone Number *</Label>
										<Input
											id="phone"
											{...register("phone")}
											placeholder="+63 912 345 6789"
										/>
										{errors.phone && (
											<p className="text-sm text-red-600">
												{errors.phone.message}
											</p>
										)}
									</div>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="age">Age *</Label>
										<Input
											id="age"
											type="number"
											{...register("age", { valueAsNumber: true })}
											placeholder="18"
											min="16"
											max="100"
										/>
										{errors.age && (
											<p className="text-sm text-red-600">
												{errors.age.message}
											</p>
										)}
									</div>
									<div className="space-y-2">
										<Label htmlFor="gender">Gender *</Label>
										<Select onValueChange={(value) => setValue("gender", value)}>
											<SelectTrigger>
												<SelectValue placeholder="Select gender" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="male">Male</SelectItem>
												<SelectItem value="female">Female</SelectItem>
												<SelectItem value="other">Other</SelectItem>
											</SelectContent>
										</Select>
										{errors.gender && (
											<p className="text-sm text-red-600">
												{errors.gender.message}
											</p>
										)}
									</div>
								</div>
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
									<div className="space-y-2">
										<Label htmlFor="studentId">Student ID *</Label>
										<div className="flex gap-2">
											<Input
												id="studentId"
												{...register("studentId")}
												placeholder="MBO-IT-0000"
											/>
										</div>
										{errors.studentId && (
											<p className="text-sm text-red-600">
												{errors.studentId.message}
											</p>
										)}
									</div>
									<div className="space-y-2">
										<Label htmlFor="department">College *</Label>
										<Select
											onValueChange={handleDepartmentChange}
											value={selectedDepartmentId}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select college" />
											</SelectTrigger>
											<SelectContent>
												{departmentsData?.departments.map((department) => (
													<SelectItem key={department.id} value={department.id}>
														{department.name} ({department.code})
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{errors.department && (
											<p className="text-sm text-red-600">
												{errors.department.message}
											</p>
										)}
									</div>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="course">Course *</Label>
										<Select
											onValueChange={handleCourseChange}
											value={selectedCourseId}
											disabled={!selectedDepartmentId}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select course" />
											</SelectTrigger>
											<SelectContent>
												{coursesData?.courses.map((course) => (
													<SelectItem key={course.id} value={course.id}>
														{course.name} ({course.code})
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{errors.course && (
											<p className="text-sm text-red-600">
												{errors.course.message}
											</p>
										)}
										{!selectedDepartmentId && (
											<p className="text-sm text-amber-600">
												Please select a department first
											</p>
										)}
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div className="space-y-2">
										<Label htmlFor="section">Section *</Label>
										<Select
											onValueChange={(value) => setValue("section", value)}
											disabled={!selectedCourseId}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select section" />
											</SelectTrigger>
											<SelectContent>
												{sectionsData?.sections.map((section) => (
													<SelectItem key={section.id} value={section.id}>
														{section.name} ({section.code})
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{errors.section && (
											<p className="text-sm text-red-600">
												{errors.section.message}
											</p>
										)}
										{!selectedCourseId && (
											<p className="text-sm text-amber-600">
												Please select a course first
											</p>
										)}
									</div>
									<div className="space-y-2">
										<Label htmlFor="year">Year Level *</Label>
										<Select onValueChange={(value) => setValue("year", value)}>
											<SelectTrigger>
												<SelectValue placeholder="Select year" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="1st">1st Year</SelectItem>
												<SelectItem value="2nd">2nd Year</SelectItem>
												<SelectItem value="3rd">3rd Year</SelectItem>
												<SelectItem value="4th">4th Year</SelectItem>
											</SelectContent>
										</Select>
										{errors.year && (
											<p className="text-sm text-red-600">
												{errors.year.message}
											</p>
										)}
									</div>
									<div className="space-y-2">
										<Label htmlFor="semester">Semester *</Label>
										<Select
											onValueChange={(value) => setValue("semester", value)}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select semester" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="1st">1st Semester</SelectItem>
												<SelectItem value="2nd">2nd Semester</SelectItem>
												<SelectItem value="Summer">Summer</SelectItem>
											</SelectContent>
										</Select>
										{errors.semester && (
											<p className="text-sm text-red-600">
												{errors.semester.message}
											</p>
										)}
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Practicum Information */}
						<Card>
							<CardHeader>
								<CardTitle>Practicum Information</CardTitle>
								<CardDescription>
									Select agency and supervisor for the student's practicum placement
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="agencyId">Agency/Company *</Label>
									<Select onValueChange={handleAgencyChange} value={selectedAgencyId}>
										<SelectTrigger>
											<SelectValue placeholder="Select an agency" />
										</SelectTrigger>
										<SelectContent>
											{agenciesData?.agencies.map((agency) => (
												<SelectItem key={agency.id} value={agency.id}>
													{agency.name} ({agency.branchType})
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{errors.agencyId && (
										<p className="text-sm text-red-600">
											{errors.agencyId.message}
										</p>
									)}
								</div>

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

								<div className="space-y-2">
									<Label htmlFor="supervisorId">Supervisor *</Label>
									<Select onValueChange={(value) => setValue("supervisorId", value)}>
										<SelectTrigger>
											<SelectValue placeholder="Select a supervisor" />
										</SelectTrigger>
										<SelectContent>
											{availableSupervisors.map((supervisor) => (
												<SelectItem key={supervisor.id} value={supervisor.id}>
													{supervisor.name} - {supervisor.position}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{errors.supervisorId && (
										<p className="text-sm text-red-600">
											{errors.supervisorId.message}
										</p>
									)}
									{selectedAgencyId && availableSupervisors.length === 0 && (
										<p className="text-sm text-amber-600">
											No supervisors available for this agency. Please add supervisors to this agency first.
										</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="position">Position/Job Title *</Label>
									<Input
										id="position"
										{...register("position")}
										placeholder="Enter position or job title"
									/>
									{errors.position && (
										<p className="text-sm text-red-600">
											{errors.position.message}
										</p>
									)}
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="startDate">Start Date *</Label>
										<Input
											id="startDate"
											type="date"
											{...register("startDate")}
										/>
										{errors.startDate && (
											<p className="text-sm text-red-600">
												{errors.startDate.message}
											</p>
										)}
									</div>
									<div className="space-y-2">
										<Label htmlFor="endDate">End Date *</Label>
										<Input id="endDate" type="date" {...register("endDate")} />
										{errors.endDate && (
											<p className="text-sm text-red-600">
												{errors.endDate.message}
											</p>
										)}
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="totalHours">Total Hours *</Label>
										<Input
											id="totalHours"
											type="number"
											{...register("totalHours", { valueAsNumber: true })}
											placeholder="400"
										/>
										{errors.totalHours && (
											<p className="text-sm text-red-600">
												{errors.totalHours.message}
											</p>
										)}
									</div>
									<div className="space-y-2">
										<Label htmlFor="workSetup">Work Setup *</Label>
										<Select onValueChange={(value) => setValue("workSetup", value as any)}>
											<SelectTrigger>
												<SelectValue placeholder="Select work setup" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="On-site">On-site</SelectItem>
												<SelectItem value="Hybrid">Hybrid</SelectItem>
												<SelectItem value="Work From Home">Work From Home</SelectItem>
											</SelectContent>
										</Select>
										{errors.workSetup && (
											<p className="text-sm text-red-600">
												{errors.workSetup.message}
											</p>
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Account Settings Sidebar */}
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Account Settings</CardTitle>
								<CardDescription>
									Configure student account access
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center space-x-2">
									<Checkbox
										id="generatePassword"
										{...register("generatePassword")}
										defaultChecked={true}
										onCheckedChange={(checked) => {
											setValue("generatePassword", checked as boolean);
											if (checked) {
												generatePassword();
											}
										}}
									/>
									<Label htmlFor="generatePassword">
										Generate secure password
									</Label>
								</div>

								{watchGeneratePassword && (
									<div className="space-y-2">
										<Label>Generated Password</Label>
										<div className="flex gap-2">
											<Input
												type={showPassword ? "text" : "password"}
												value={generatedPassword}
												readOnly
												className="font-mono"
											/>
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={() => setShowPassword(!showPassword)}
											>
												{showPassword ? (
													<EyeOff className="w-4 h-4" />
												) : (
													<Eye className="w-4 h-4" />
												)}
											</Button>
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={generatePassword}
											>
												Regenerate
											</Button>
										</div>
									</div>
								)}

								{!watchGeneratePassword && (
									<div className="space-y-2">
										<Label htmlFor="customPassword">Custom Password</Label>
										<Input
											id="customPassword"
											type={showPassword ? "text" : "password"}
											{...register("customPassword")}
											placeholder="Enter custom password"
										/>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => setShowPassword(!showPassword)}
										>
											{showPassword ? (
												<EyeOff className="w-4 h-4" />
											) : (
												<Eye className="w-4 h-4" />
											)}
										</Button>
									</div>
								)}

								<Separator />

								<div className="flex items-center space-x-2">
									<Checkbox
										id="sendCredentials"
										{...register("sendCredentials")}
										defaultChecked={true}
									/>
									<Label htmlFor="sendCredentials">
										Send credentials via email
									</Label>
								</div>

								{submittedSendCredentials && (
									<div className="p-3 bg-green-50 rounded-lg">
										<p className="text-sm text-green-800">
											<Mail className="w-4 h-4 inline mr-1" />
											Login credentials have been sent to the student's email
											address.
										</p>
									</div>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Requirements Checklist</CardTitle>
								<CardDescription>
									Documents needed for practicum
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-2 text-sm">
									<div className="flex items-center gap-2">
										<Badge
											variant="outline"
											className="w-2 h-2 p-0 bg-red-500"
										></Badge>
										<span>Medical Certificate</span>
									</div>
									<div className="flex items-center gap-2">
										<Badge
											variant="outline"
											className="w-2 h-2 p-0 bg-red-500"
										></Badge>
										<span>Insurance Certificate</span>
									</div>
									<div className="flex items-center gap-2">
										<Badge
											variant="outline"
											className="w-2 h-2 p-0 bg-red-500"
										></Badge>
										<span>Company MOA</span>
									</div>
									<div className="flex items-center gap-2">
										<Badge
											variant="outline"
											className="w-2 h-2 p-0 bg-red-500"
										></Badge>
										<span>Practicum Agreement</span>
									</div>
									<p className="text-xs text-gray-500 mt-2">
										These requirements will be automatically added to the
										student's checklist.
									</p>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* Form Actions */}
				<Card>
					<CardContent className="pt-6">
						<div className="flex justify-end gap-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => router.back()}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isLoading}
								className="bg-primary-500 hover:bg-primary-600"
							>
								{isLoading ? (
									<>
										<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
										Creating Student...
									</>
								) : (
									<>
										<UserPlus className="w-4 h-4 mr-2" />
										Create Student Account
									</>
								)}
							</Button>
						</div>
					</CardContent>
				</Card>
			</form>

			{/* Success Dialog */}
			<Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
								<Check className="w-4 h-4 text-green-600" />
							</div>
							Student Created Successfully!
						</DialogTitle>
						<DialogDescription>
							The student account has been created and credentials have been
							prepared.
						</DialogDescription>
					</DialogHeader>

					{createdStudent && (
						<div className="space-y-4">
							<div className="p-4 bg-gray-50 rounded-lg space-y-3">
								<div className="flex justify-between items-center">
									<span className="text-sm font-medium">Student ID:</span>
									<div className="flex items-center gap-2">
										<code className="text-sm bg-white px-2 py-1 rounded">
											{createdStudent.user?.studentId}
										</code>
										<Button
											variant="ghost"
											size="sm"
											onClick={() =>
												copyToClipboard(createdStudent.user?.studentId, "studentId")
											}
										>
											{copiedField === "studentId" ? (
												<Check className="w-4 h-4 text-green-600" />
											) : (
												<Copy className="w-4 h-4" />
											)}
										</Button>
									</div>
								</div>

								<div className="flex justify-between items-center">
									<span className="text-sm font-medium">Password:</span>
									<div className="flex items-center gap-2">
										<code className="text-sm bg-white px-2 py-1 rounded font-mono">
											{showPassword ? submittedPassword : "••••••••••••"}
										</code>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => setShowPassword(!showPassword)}
										>
											{showPassword ? (
												<EyeOff className="w-4 h-4" />
											) : (
												<Eye className="w-4 h-4" />
											)}
										</Button>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => copyToClipboard(submittedPassword, "password")}
										>
											{copiedField === "password" ? (
												<Check className="w-4 h-4 text-green-600" />
											) : (
												<Copy className="w-4 h-4" />
											)}
										</Button>
									</div>
								</div>

								<div className="flex justify-between items-center">
									<span className="text-sm font-medium">Email:</span>
									<span className="text-sm">{createdStudent.user?.email || submittedEmail}</span>
								</div>
							</div>

							{submittedSendCredentials && (
								<div className="p-3 bg-green-50 rounded-lg">
									<p className="text-sm text-green-800">
										<Mail className="w-4 h-4 inline mr-1" />
										Login credentials have been sent to the student's email
										address.
									</p>
								</div>
							)}
						</div>
					)}

					<DialogFooter className="flex gap-2">
						<Button
							variant="outline"
							onClick={() => {
								setIsSuccessDialogOpen(false);
								router.push("/dashboard/instructor/students");
							}}
						>
							View All Students
						</Button>
						<Button
							onClick={() => {
								setIsSuccessDialogOpen(false);
								// Reset form for creating another student
								window.location.reload();
							}}
							className="bg-primary-500 hover:bg-primary-600"
						>
							Create Another Student
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
