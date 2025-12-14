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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
	AlertTriangle,
	X,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getCourseOptions } from "@/data/instructor-courses";
import { useRegisterStudent } from "@/hooks/student";
import { useAgencies } from "@/hooks/agency";
import { useDepartments } from "@/hooks/department";
import { useCourses } from "@/hooks/course";
import { useSections } from "@/hooks/section";
import { toast } from "sonner";

const createStudentSchema = (includePracticum: boolean) => z.object({
	// Personal Information
	firstName: z.string().min(2, "First name must be at least 2 characters"),
	lastName: z.string().min(2, "Last name must be at least 2 characters"),
	middleName: z.string().optional(),
	email: z.string().email("Please enter a valid email address"),
	phone: z.string().min(10, "Phone number must be at least 10 digits"),
	age: z.number().min(16, "Age must be at least 16").max(100, "Age must be less than 100"),
	gender: z.string().min(1, "Please select a gender"),
	address: z.string().optional(),
	bio: z.string().optional(),

	// Academic Information
	studentId: z.string().min(8, "Student ID must be at least 8 characters"),
	department: z.string().min(1, "Please select a college"),
	course: z.string().min(1, "Please select a course"),
	section: z.string().min(1, "Please select a section"),
	year: z.string().min(1, "Please select a year"),
	semester: z.string().min(1, "Please select a semester"),
	yearLevel: z.string().optional(),
	program: z.string().optional(),

	// Practicum Information (Optional)
	agencyId: z.string().optional(),
	supervisorId: z.string().optional(),
	position: z.string().optional(),
	startDate: z.string().optional(),
	endDate: z.string().optional(),
	totalHours: z.number().min(1, "Total hours must be at least 1").default(400),
	workSetup: z.enum(["On-site"]).default("On-site"), // Work setup is always "On-site"

	// Account Settings
	sendCredentials: z.boolean().default(true),
	generatePassword: z.boolean().default(true),
	customPassword: z.string().optional(),
}).refine((data) => {
	// If practicum is included, validate required fields
	if (includePracticum) {
		return data.agencyId && data.supervisorId && data.startDate && data.endDate;
	}
	return true;
}, {
	message: "Please fill in all practicum fields when including practicum assignment",
	path: ["agencyId"]
});

type StudentFormData = z.infer<ReturnType<typeof createStudentSchema>>;

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
	const [includePracticum, setIncludePracticum] = useState(false);

	// Use the student registration hook
	const registerStudent = useRegisterStudent();

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm<StudentFormData>({
		resolver: zodResolver(createStudentSchema(includePracticum)) as any,
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
			address: "",
			bio: "",
			studentId: "",
			department: "",
			course: "",
			section: "",
			year: "",
			semester: "",
			yearLevel: "",
			program: "",
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

		// Align with server expectations: send department CODE, course CODE, section NAME
		const departmentCode = departmentsData?.departments.find((d) => d.id === selectedDepartmentId)?.code || "";
		const courseCode = coursesData?.courses.find((c) => c.id === selectedCourseId)?.code || "";
		const sectionName = sectionsData?.sections.find((s) => s.id === data.section)?.name || "";

		if (!departmentCode || !courseCode || !sectionName) {
			toast.error("Please select college, course, and section.");
			return;
		}

		// Map new practicum fields to old API format (only if practicum is included)
		const studentData = {
			...data,
			password,
			avatar: avatarFile || undefined,
			// Override academic fields to match backend contract
			department: departmentCode,
			course: courseCode,
			section: sectionName,
			// Map practicum snapshot fields when included
			...(includePracticum && data.agencyId && selectedAgency && {
				agency: selectedAgency.name,
				agencyAddress: selectedAgency.address,
			}),
			...(includePracticum && data.supervisorId && availableSupervisors.find(s => s.id === data.supervisorId) && {
				supervisor: availableSupervisors.find(s => s.id === data.supervisorId)?.name,
				supervisorEmail: availableSupervisors.find(s => s.id === data.supervisorId)?.email,
				supervisorPhone: availableSupervisors.find(s => s.id === data.supervisorId)?.phone,
			}),
			...(includePracticum && data.startDate && { startDate: data.startDate }),
			...(includePracticum && data.endDate && { endDate: data.endDate }),
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

	// Get all validation errors
	const errorCount = Object.keys(errors).length;
	const hasErrors = errorCount > 0;

	// Get error messages for summary
	const getErrorSummary = () => {
		const errorFields = Object.entries(errors).map(([field, error]) => ({
			field,
			message: error?.message || "Invalid value",
			section: getFieldSection(field)
		}));
		return errorFields;
	};

	const getFieldSection = (field: string) => {
		const personalFields = ['firstName', 'lastName', 'middleName', 'email', 'phone', 'age', 'gender', 'address', 'bio', 'yearLevel'];
		const academicFields = ['studentId', 'department', 'course', 'section', 'year', 'semester', 'program'];
		const practicumFields = ['agencyId', 'supervisorId', 'position', 'startDate', 'endDate', 'totalHours', 'workSetup'];
		
		if (personalFields.includes(field)) return 'Personal Information';
		if (academicFields.includes(field)) return 'Academic Information';
		if (practicumFields.includes(field)) return 'Practicum Information';
		return 'Other';
	};

	const errorSummary = getErrorSummary();

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
				{/* Validation Error Summary */}
				{hasErrors && (
					<Alert variant="destructive" className="mb-6">
						<AlertTriangle className="h-4 w-4" />
						<AlertTitle className="flex items-center justify-between">
							<span>Please fix the following {errorCount} error{errorCount > 1 ? 's' : ''}:</span>
							<Badge variant="destructive" className="ml-2">
								{errorCount}
							</Badge>
						</AlertTitle>
						<AlertDescription>
							<div className="mt-3 space-y-2">
								{Object.entries(
									errorSummary.reduce((acc, error) => {
										if (!acc[error.section]) acc[error.section] = [];
										acc[error.section].push(error);
										return acc;
									}, {} as Record<string, typeof errorSummary>)
								).map(([section, sectionErrors]) => (
									<div key={section} className="border-l-2 border-red-200 pl-3">
										<p className="font-medium text-sm text-red-800 mb-1">{section}:</p>
										<ul className="space-y-1">
											{sectionErrors.map((error, index) => (
												<li key={index} className="text-sm text-red-700 flex items-center gap-2">
													<span className="w-1 h-1 bg-red-500 rounded-full flex-shrink-0"></span>
													<span className="capitalize">{error.field.replace(/([A-Z])/g, ' $1').trim()}:</span>
													<span>{error.message}</span>
												</li>
											))}
										</ul>
									</div>
								))}
							</div>
						</AlertDescription>
					</Alert>
				)}

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Personal Information */}
					<div className="lg:col-span-2 space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center justify-between">
									<span>Personal Information</span>
									{errorSummary.filter(e => e.section === 'Personal Information').length > 0 && (
										<Badge variant="destructive" className="ml-2">
											{errorSummary.filter(e => e.section === 'Personal Information').length} error{errorSummary.filter(e => e.section === 'Personal Information').length > 1 ? 's' : ''}
										</Badge>
									)}
								</CardTitle>
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
										<Label htmlFor="firstName" className={errors.firstName ? "text-red-700" : ""}>
											First Name *
											{errors.firstName && (
												<Badge variant="destructive" className="ml-2 text-xs">
													<X className="w-3 h-3 mr-1" />
													Error
												</Badge>
											)}
										</Label>
										<Input
											id="firstName"
											{...register("firstName")}
											placeholder="Enter first name"
											className={errors.firstName ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
										/>
										{errors.firstName && (
											<div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-200">
												<AlertTriangle className="w-4 h-4 flex-shrink-0" />
												<span>{errors.firstName.message}</span>
											</div>
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
										<Label htmlFor="lastName" className={errors.lastName ? "text-red-700" : ""}>
											Last Name *
											{errors.lastName && (
												<Badge variant="destructive" className="ml-2 text-xs">
													<X className="w-3 h-3 mr-1" />
													Error
												</Badge>
											)}
										</Label>
										<Input
											id="lastName"
											{...register("lastName")}
											placeholder="Enter last name"
											className={errors.lastName ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
										/>
										{errors.lastName && (
											<div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-200">
												<AlertTriangle className="w-4 h-4 flex-shrink-0" />
												<span>{errors.lastName.message}</span>
											</div>
										)}
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="email" className={errors.email ? "text-red-700" : ""}>
											Email Address *
											{errors.email && (
												<Badge variant="destructive" className="ml-2 text-xs">
													<X className="w-3 h-3 mr-1" />
													Error
												</Badge>
											)}
										</Label>
										<Input
											id="email"
											type="email"
											{...register("email")}
											placeholder="student@omsc.edu.ph"
											className={errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
										/>
										{errors.email && (
											<div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-200">
												<AlertTriangle className="w-4 h-4 flex-shrink-0" />
												<span>{errors.email.message}</span>
											</div>
										)}
									</div>
									<div className="space-y-2">
										<Label htmlFor="phone" className={errors.phone ? "text-red-700" : ""}>
											Phone Number *
											{errors.phone && (
												<Badge variant="destructive" className="ml-2 text-xs">
													<X className="w-3 h-3 mr-1" />
													Error
												</Badge>
											)}
										</Label>
										<Input
											id="phone"
											{...register("phone")}
											placeholder="+63 912 345 6789"
											className={errors.phone ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
										/>
										{errors.phone && (
											<div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-200">
												<AlertTriangle className="w-4 h-4 flex-shrink-0" />
												<span>{errors.phone.message}</span>
											</div>
										)}
									</div>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="age" className={errors.age ? "text-red-700" : ""}>
											Age *
											{errors.age && (
												<Badge variant="destructive" className="ml-2 text-xs">
													<X className="w-3 h-3 mr-1" />
													Error
												</Badge>
											)}
										</Label>
										<Input
											id="age"
											type="number"
											{...register("age", { valueAsNumber: true })}
											placeholder="18"
											min="16"
											max="100"
											className={errors.age ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
										/>
										{errors.age && (
											<div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-200">
												<AlertTriangle className="w-4 h-4 flex-shrink-0" />
												<span>{errors.age.message}</span>
											</div>
										)}
									</div>
									<div className="space-y-2">
										<Label htmlFor="gender" className={errors.gender ? "text-red-700" : ""}>
											Gender *
											{errors.gender && (
												<Badge variant="destructive" className="ml-2 text-xs">
													<X className="w-3 h-3 mr-1" />
													Error
												</Badge>
											)}
										</Label>
										<Select onValueChange={(value) => setValue("gender", value)}>
											<SelectTrigger className={errors.gender ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}>
												<SelectValue placeholder="Select gender" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="male">Male</SelectItem>
												<SelectItem value="female">Female</SelectItem>
												<SelectItem value="other">Other</SelectItem>
											</SelectContent>
										</Select>
										{errors.gender && (
											<div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-200">
												<AlertTriangle className="w-4 h-4 flex-shrink-0" />
												<span>{errors.gender.message}</span>
											</div>
										)}
									</div>
								</div>

								{/* Additional Personal Information */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="address">Address</Label>
										<Input
											id="address"
											{...register("address")}
											placeholder="Enter address"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="yearLevel">Year Level</Label>
										<Select onValueChange={(value) => setValue("yearLevel", value)}>
											<SelectTrigger>
												<SelectValue placeholder="Select year level" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="4th Year">4th Year</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="bio">Bio</Label>
									<Textarea
										id="bio"
										{...register("bio")}
										placeholder="Enter bio"
										rows={3}
									/>
								</div>
							</CardContent>
						</Card>

						{/* Academic Information */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center justify-between">
									<span>Academic Information</span>
									{errorSummary.filter(e => e.section === 'Academic Information').length > 0 && (
										<Badge variant="destructive" className="ml-2">
											{errorSummary.filter(e => e.section === 'Academic Information').length} error{errorSummary.filter(e => e.section === 'Academic Information').length > 1 ? 's' : ''}
										</Badge>
									)}
								</CardTitle>
								<CardDescription>
									Student's academic details and enrollment information
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="studentId" className={errors.studentId ? "text-red-700" : ""}>
											Student ID *
											{errors.studentId && (
												<Badge variant="destructive" className="ml-2 text-xs">
													<X className="w-3 h-3 mr-1" />
													Error
												</Badge>
											)}
										</Label>
										<div className="flex gap-2">
											<Input
												id="studentId"
												{...register("studentId")}
												placeholder="MBO-IT-0000"
												className={errors.studentId ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
											/>
										</div>
										{errors.studentId && (
											<div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-200">
												<AlertTriangle className="w-4 h-4 flex-shrink-0" />
												<span>{errors.studentId.message}</span>
											</div>
										)}
									</div>
									<div className="space-y-2">
										<Label htmlFor="department" className={errors.department ? "text-red-700" : ""}>
											College *
											{errors.department && (
												<Badge variant="destructive" className="ml-2 text-xs">
													<X className="w-3 h-3 mr-1" />
													Error
												</Badge>
											)}
										</Label>
										<Select
											onValueChange={handleDepartmentChange}
											value={selectedDepartmentId}
										>
											<SelectTrigger className={errors.department ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}>
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
											<div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-200">
												<AlertTriangle className="w-4 h-4 flex-shrink-0" />
												<span>{errors.department.message}</span>
											</div>
										)}
									</div>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="course" className={errors.course ? "text-red-700" : ""}>
											Course *
											{errors.course && (
												<Badge variant="destructive" className="ml-2 text-xs">
													<X className="w-3 h-3 mr-1" />
													Error
												</Badge>
											)}
										</Label>
										<Select
											onValueChange={handleCourseChange}
											value={selectedCourseId}
											disabled={!selectedDepartmentId}
										>
											<SelectTrigger className={errors.course ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}>
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
											<div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-200">
												<AlertTriangle className="w-4 h-4 flex-shrink-0" />
												<span>{errors.course.message}</span>
											</div>
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
										<Label htmlFor="section" className={errors.section ? "text-red-700" : ""}>
											Section *
											{errors.section && (
												<Badge variant="destructive" className="ml-2 text-xs">
													<X className="w-3 h-3 mr-1" />
													Error
												</Badge>
											)}
										</Label>
										<Select
											onValueChange={(value) => setValue("section", value)}
											disabled={!selectedCourseId}
										>
											<SelectTrigger className={errors.section ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}>
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
											<div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-200">
												<AlertTriangle className="w-4 h-4 flex-shrink-0" />
												<span>{errors.section.message}</span>
											</div>
										)}
										{!selectedCourseId && (
											<p className="text-sm text-amber-600">
												Please select a course first
											</p>
										)}
									</div>
									<div className="space-y-2">
										<Label htmlFor="year" className={errors.year ? "text-red-700" : ""}>
											Year Level *
											{errors.year && (
												<Badge variant="destructive" className="ml-2 text-xs">
													<X className="w-3 h-3 mr-1" />
													Error
												</Badge>
											)}
										</Label>
										<Select onValueChange={(value) => setValue("year", value)}>
											<SelectTrigger className={errors.year ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}>
												<SelectValue placeholder="Select year" />
											</SelectTrigger>
											<SelectContent>
												
												<SelectItem value="4th">4th Year</SelectItem>
											</SelectContent>
										</Select>
										{errors.year && (
											<div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-200">
												<AlertTriangle className="w-4 h-4 flex-shrink-0" />
												<span>{errors.year.message}</span>
											</div>
										)}
									</div>
									<div className="space-y-2">
										<Label htmlFor="semester" className={errors.semester ? "text-red-700" : ""}>
											Semester *
											{errors.semester && (
												<Badge variant="destructive" className="ml-2 text-xs">
													<X className="w-3 h-3 mr-1" />
													Error
												</Badge>
											)}
										</Label>
										<Select
											onValueChange={(value) => setValue("semester", value)}
										>
											<SelectTrigger className={errors.semester ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}>
												<SelectValue placeholder="Select semester" />
											</SelectTrigger>
											<SelectContent>
												{/* <SelectItem value="1st">1st Semester</SelectItem> */}
												<SelectItem value="2nd">2nd Semester</SelectItem>
												{/* <SelectItem value="Summer">Summer</SelectItem> */}
											</SelectContent>
										</Select>
										{errors.semester && (
											<div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-200">
												<AlertTriangle className="w-4 h-4 flex-shrink-0" />
												<span>{errors.semester.message}</span>
											</div>
										)}
									</div>
								</div>

								{/* Additional Academic Information */}
								<div className="space-y-2">
									<Label htmlFor="program">Program</Label>
									<Input
										id="program"
										{...register("program")}
										placeholder="Enter program"
									/>
								</div>
							</CardContent>
						</Card>

						{/* Practicum Information */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center justify-between">
									<div className="flex items-center space-x-2">
										<span>Practicum Information</span>
										{errorSummary.filter(e => e.section === 'Practicum Information').length > 0 && (
											<Badge variant="destructive" className="ml-2">
												{errorSummary.filter(e => e.section === 'Practicum Information').length} error{errorSummary.filter(e => e.section === 'Practicum Information').length > 1 ? 's' : ''}
											</Badge>
										)}
									</div>
									<div className="flex items-center space-x-2">
										<Checkbox
											id="includePracticum"
											checked={includePracticum}
											onCheckedChange={(checked) => setIncludePracticum(checked as boolean)}
										/>
										<Label htmlFor="includePracticum" className="text-sm">
											Include practicum assignment
										</Label>
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
								<div className="space-y-2">
									<Label htmlFor="agencyId" className={errors.agencyId ? "text-red-700" : ""}>
										Agency/Company *
										{errors.agencyId && (
											<Badge variant="destructive" className="ml-2 text-xs">
												<X className="w-3 h-3 mr-1" />
												Error
											</Badge>
										)}
									</Label>
							<Select onValueChange={handleAgencyChange} value={selectedAgencyId}>
								<SelectTrigger className={errors.agencyId ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}>
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
								<div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-200">
									<AlertTriangle className="w-4 h-4 flex-shrink-0" />
									<span>{errors.agencyId.message}</span>
								</div>
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
									<Label htmlFor="supervisorId" className={errors.supervisorId ? "text-red-700" : ""}>
										Supervisor *
										{errors.supervisorId && (
											<Badge variant="destructive" className="ml-2 text-xs">
												<X className="w-3 h-3 mr-1" />
												Error
											</Badge>
										)}
									</Label>
									<Select onValueChange={(value) => setValue("supervisorId", value)}>
										<SelectTrigger className={errors.supervisorId ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}>
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
										<div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-200">
											<AlertTriangle className="w-4 h-4 flex-shrink-0" />
											<span>{errors.supervisorId.message}</span>
										</div>
									)}
									{selectedAgencyId && availableSupervisors.length === 0 && (
										<p className="text-sm text-amber-600">
											No supervisors available for this agency. Please add supervisors to this agency first.
										</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="position" className={errors.position ? "text-red-700" : ""}>
										Position/Job Title *
										{errors.position && (
											<Badge variant="destructive" className="ml-2 text-xs">
												<X className="w-3 h-3 mr-1" />
												Error
											</Badge>
										)}
									</Label>
									<Input
										id="position"
										{...register("position")}
										placeholder="Enter position or job title"
										className={errors.position ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
									/>
									{errors.position && (
										<div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-200">
											<AlertTriangle className="w-4 h-4 flex-shrink-0" />
											<span>{errors.position.message}</span>
										</div>
									)}
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="startDate" className={errors.startDate ? "text-red-700" : ""}>
											Start Date *
											{errors.startDate && (
												<Badge variant="destructive" className="ml-2 text-xs">
													<X className="w-3 h-3 mr-1" />
													Error
												</Badge>
											)}
										</Label>
										<Input
											id="startDate"
											type="date"
											{...register("startDate")}
											className={errors.startDate ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
										/>
										{errors.startDate && (
											<div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-200">
												<AlertTriangle className="w-4 h-4 flex-shrink-0" />
												<span>{errors.startDate.message}</span>
											</div>
										)}
									</div>
									<div className="space-y-2">
										<Label htmlFor="endDate" className={errors.endDate ? "text-red-700" : ""}>
											End Date *
											{errors.endDate && (
												<Badge variant="destructive" className="ml-2 text-xs">
													<X className="w-3 h-3 mr-1" />
													Error
												</Badge>
											)}
										</Label>
										<Input 
											id="endDate" 
											type="date" 
											{...register("endDate")} 
											className={errors.endDate ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
										/>
										{errors.endDate && (
											<div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-200">
												<AlertTriangle className="w-4 h-4 flex-shrink-0" />
												<span>{errors.endDate.message}</span>
											</div>
										)}
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="totalHours" className={errors.totalHours ? "text-red-700" : ""}>
											Total Hours *
											{errors.totalHours && (
												<Badge variant="destructive" className="ml-2 text-xs">
													<X className="w-3 h-3 mr-1" />
													Error
												</Badge>
											)}
										</Label>
										<Input
											id="totalHours"
											type="number"
											{...register("totalHours", { valueAsNumber: true })}
											placeholder="400"
											className={errors.totalHours ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
										/>
										{errors.totalHours && (
											<div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-200">
												<AlertTriangle className="w-4 h-4 flex-shrink-0" />
												<span>{errors.totalHours.message}</span>
											</div>
										)}
									</div>
									<div className="space-y-2">
										<Label htmlFor="workSetup" className={errors.workSetup ? "text-red-700" : ""}>
											Work Setup *
											{errors.workSetup && (
												<Badge variant="destructive" className="ml-2 text-xs">
													<X className="w-3 h-3 mr-1" />
													Error
												</Badge>
											)}
										</Label>
										<Select 
											onValueChange={(value) => setValue("workSetup", value as any)}
											value="On-site"
											disabled
										>
											<SelectTrigger className={errors.workSetup ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}>
												<SelectValue placeholder="On-site" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="On-site">On-site</SelectItem>
											</SelectContent>
										</Select>
										{errors.workSetup && (
											<div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-200">
												<AlertTriangle className="w-4 h-4 flex-shrink-0" />
												<span>{errors.workSetup.message}</span>
											</div>
										)}
									</div>
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
