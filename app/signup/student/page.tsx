"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Eye, EyeOff, GraduationCap } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRegister, useActivateUser } from "@useAuth";
import { useDepartments } from "@/hooks/department";
import { useCourses } from "@/hooks/course";
import { useSections } from "@/hooks/section";
import OtpVerification from "@/components/otp-verification";
import { toast } from "sonner";

const studentSignupSchema = z
	.object({
		firstName: z.string().min(2, "First name must be at least 2 characters"),
		lastName: z.string().min(2, "Last name must be at least 2 characters"),
		middleName: z.string().optional(),
		email: z.string().email("Please enter a valid email address"),
		phone: z.string().min(10, "Contact number must be at least 10 digits"),
		age: z.number().min(16, "Age must be at least 16").max(100, "Age must be less than 100"),
		gender: z.string().min(1, "Please select your gender"),
		department: z.string().min(1, "Please select a department"),
		course: z.string().min(1, "Please select a course"),
		section: z.string().min(1, "Please select a section"),
		studentId: z.string().min(8, "Student ID must be at least 8 characters"),
		year: z.string().min(1, "Please select your year level"),
		semester: z.string().min(1, "Please select your semester"),
		program: z.string().optional(),
		specialization: z.string().optional(),
		password: z
			.string()
			.min(8, "Password must be at least 8 characters")
			.refine(
				(value) => /[a-z]/.test(value) && /[A-Z]/.test(value),
				{
					message:
						"Password must contain both uppercase and lowercase letters",
				}
			),
		confirmPassword: z.string().min(1, "Please confirm your password"),
		address: z.string().optional(),
		bio: z.string().optional(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

type StudentSignupForm = z.infer<typeof studentSignupSchema>;

export default function StudentSignupPage() {
	const router = useRouter();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [showOtpVerification, setShowOtpVerification] = useState(false);
	const [activationToken, setActivationToken] = useState("");
	const [userEmail, setUserEmail] = useState("");
	const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");
	const [selectedCourseId, setSelectedCourseId] = useState<string>("");

	// Get departments from API
	const { data: departmentsData, isLoading: departmentsLoading } = useDepartments({ status: "active" });
	const departments = departmentsData?.departments || [];

	// Get courses based on selected department
	const { data: coursesData, isLoading: coursesLoading } = useCourses({ 
		status: "active", 
		departmentId: selectedDepartmentId || undefined 
	});
	const courses = coursesData?.courses || [];

	// Get sections based on selected course
	const { data: sectionsData, isLoading: sectionsLoading } = useSections({ 
		status: "active", 
		courseId: selectedCourseId || undefined 
	});
	const sections = sectionsData?.sections || [];

	// Auth hooks
	const registerMutation = useRegister();
	const activateUserMutation = useActivateUser();

	const {
		register,
		handleSubmit,
		control,
		watch,
		setValue,
		formState: { errors },
	} = useForm<StudentSignupForm>({
		resolver: zodResolver(studentSignupSchema),
	});

	// Watch department and course changes
	const watchedDepartment = watch("department");
	const watchedCourse = watch("course");

	// Update selected IDs when form values change
	React.useEffect(() => {
		if (watchedDepartment !== selectedDepartmentId) {
			setSelectedDepartmentId(watchedDepartment);
			setValue("course", ""); // Reset course when department changes
			setValue("section", ""); // Reset section when department changes
		}
	}, [watchedDepartment, selectedDepartmentId, setValue]);

	React.useEffect(() => {
		if (watchedCourse !== selectedCourseId) {
			setSelectedCourseId(watchedCourse);
			setValue("section", ""); // Reset section when course changes
		}
	}, [watchedCourse, selectedCourseId, setValue]);

	const onSubmit = async (data: StudentSignupForm) => {
		setIsLoading(true);
		try {
			const registrationData = {
				firstName: data.firstName,
				lastName: data.lastName,
				middleName: data.middleName,
				email: data.email,
				password: data.password,
				age: data.age,
				role: "student", // Automatically set as student
				gender: data.gender,
				phone: data.phone,
				address: data.address,
				bio: data.bio,
				studentId: data.studentId,
				departmentId: data.department, // Include department ID
				yearLevel: data.year,
				program: data.program,
				specialization: data.specialization,
			};

			const result = await registerMutation.mutateAsync(registrationData);
			
			// Store activation token and email for OTP verification
			setActivationToken(result.activationToken);
			setUserEmail(data.email);
			setShowOtpVerification(true);
			
			toast.success("Registration successful! Please check your email for verification code.");
		} catch (error: any) {
			toast.error(error.message || "Registration failed. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleOtpVerification = async (otpData: { activation_token: string; activation_code: string }) => {
		try {
			await activateUserMutation.mutateAsync(otpData);
			toast.success("Account activated successfully! You can now sign in.");
			router.push("/login/student");
		} catch (error: any) {
			toast.error(error.message || "Verification failed. Please try again.");
		}
	};

	const handleResendCode = async () => {
		// For now, we'll just show a message since the server doesn't have a resend endpoint
		toast.info("Please check your email for the verification code.");
	};

	const handleBackToRegistration = () => {
		setShowOtpVerification(false);
		setActivationToken("");
		setUserEmail("");
	};

	// Show OTP verification if registration was successful
	if (showOtpVerification) {
		return (
			<div
				className="min-h-screen flex items-center justify-center p-4 relative"
				style={{
					backgroundImage: "url(/images/auth-bg.jpg)",
					backgroundSize: "cover",
					backgroundPosition: "center",
					backgroundRepeat: "no-repeat",
				}}
			>
				{/* Overlay */}
				<div className="absolute inset-0 bg-primary-500/20 backdrop-blur-sm" />

				<div className="relative z-10 w-full max-w-md">
					<OtpVerification
						email={userEmail}
						activationToken={activationToken}
						onVerificationSuccess={handleOtpVerification}
						onBack={handleBackToRegistration}
						onResendCode={handleResendCode}
						isLoading={activateUserMutation.isPending}
					/>
				</div>
			</div>
		);
	}

	return (
		<div
			className="min-h-screen flex items-center justify-center p-4 relative"
			style={{
				backgroundImage: "url(/images/auth-bg.jpg)",
				backgroundSize: "cover",
				backgroundPosition: "center",
				backgroundRepeat: "no-repeat",
			}}
		>
			{/* Overlay */}
			<div className="absolute inset-0 bg-primary-500/20 backdrop-blur-sm" />
			<div className="relative z-10 w-full max-w-4xl">
				<Card className="bg-secondary-50/95 backdrop-blur-md border-primary-200 shadow-2xl animate-fade-in">
					<CardHeader className="text-center pb-6">
						<div className="flex justify-center items-center gap-4 mb-4">
							<Image
								src="/images/omsc-logo.png"
								alt="OMSC Logo"
								width={60}
								height={60}
								className="object-contain"
							/>
							<Image
								src="/images/tracesys-logo.png"
								alt="TracèSys Logo"
								width={60}
								height={60}
								className="object-contain"
							/>
						</div>
						<CardTitle className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
							<GraduationCap className="w-5 h-5 text-accent-600" />
							Create Student Account
						</CardTitle>
						<CardDescription className="text-gray-600">
							Join TracèSys to track your practicum journey
						</CardDescription>
					</CardHeader>

					<CardContent className="space-y-6">
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
							{/* Personal Information */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
									Personal Information
								</h3>
								
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="firstName" className="text-gray-700 font-medium">
											First Name *
										</Label>
										<Input
											id="firstName"
											placeholder="First name"
											className="border-gray-300 focus:border-accent-500 focus:ring-accent-500"
											{...register("firstName")}
										/>
										{errors.firstName && (
											<p className="text-sm text-red-600">
												{errors.firstName.message}
											</p>
										)}
									</div>

									<div className="space-y-2">
										<Label htmlFor="lastName" className="text-gray-700 font-medium">
											Last Name *
										</Label>
										<Input
											id="lastName"
											placeholder="Last name"
											className="border-gray-300 focus:border-accent-500 focus:ring-accent-500"
											{...register("lastName")}
										/>
										{errors.lastName && (
											<p className="text-sm text-red-600">
												{errors.lastName.message}
											</p>
										)}
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="middleName" className="text-gray-700 font-medium">
										Middle Name
									</Label>
									<Input
										id="middleName"
										placeholder="Middle name (optional)"
										className="border-gray-300 focus:border-accent-500 focus:ring-accent-500"
										{...register("middleName")}
									/>
									{errors.middleName && (
										<p className="text-sm text-red-600">
											{errors.middleName.message}
										</p>
									)}
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="age" className="text-gray-700 font-medium">
											Age *
										</Label>
										<Input
											id="age"
											type="number"
											placeholder="Age"
											className="border-gray-300 focus:border-accent-500 focus:ring-accent-500"
											{...register("age", { valueAsNumber: true })}
										/>
										{errors.age && (
											<p className="text-sm text-red-600">
												{errors.age.message}
											</p>
										)}
									</div>

									<div className="space-y-2">
										<Label htmlFor="gender" className="text-gray-700 font-medium">
											Gender *
										</Label>
										<Controller
											name="gender"
											control={control}
											render={({ field }) => (
												<Select onValueChange={field.onChange} defaultValue={field.value}>
													<SelectTrigger className="border-gray-300 focus:border-accent-500 focus:ring-accent-500">
														<SelectValue placeholder="Select gender" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="male">Male</SelectItem>
														<SelectItem value="female">Female</SelectItem>
														<SelectItem value="other">Other</SelectItem>
													</SelectContent>
												</Select>
											)}
										/>
										{errors.gender && (
											<p className="text-sm text-red-600">
												{errors.gender.message}
											</p>
										)}
									</div>
								</div>
							</div>

							{/* Contact Information */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
									Contact Information
								</h3>

								<div className="space-y-2">
									<Label htmlFor="email" className="text-gray-700 font-medium">
										Email Address *
									</Label>
									<Input
										id="email"
										type="email"
										placeholder="student@omsc.edu.ph"
										className="border-gray-300 focus:border-accent-500 focus:ring-accent-500"
										{...register("email")}
									/>
									{errors.email && (
										<p className="text-sm text-red-600">{errors.email.message}</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="contactNumber" className="text-gray-700 font-medium">
										Contact Number *
									</Label>
									<Input
										id="contactNumber"
										placeholder="+63 912 345 6789"
										className="border-gray-300 focus:border-accent-500 focus:ring-accent-500"
										{...register("phone")}
									/>
									{errors.phone && (
										<p className="text-sm text-red-600">
											{errors.phone.message}
										</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="address" className="text-gray-700 font-medium">
										Address
									</Label>
									<Input
										id="address"
										placeholder="Your address (optional)"
										className="border-gray-300 focus:border-accent-500 focus:ring-accent-500"
										{...register("address")}
									/>
									{errors.address && (
										<p className="text-sm text-red-600">
											{errors.address.message}
										</p>
									)}
								</div>
							</div>

							{/* Academic Information */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
									Academic Information
								</h3>

								<div className="space-y-2">
									<Label htmlFor="studentId" className="text-gray-700 font-medium">
										Student ID *
									</Label>
									<Input
										id="studentId"
										placeholder="Enter your student ID"
										className="border-gray-300 focus:border-accent-500 focus:ring-accent-500"
										{...register("studentId")}
									/>
									{errors.studentId && (
										<p className="text-sm text-red-600">
											{errors.studentId.message}
										</p>
									)}
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="department" className="text-gray-700 font-medium">
											Department *
										</Label>
										<Controller
											name="department"
											control={control}
											render={({ field }) => (
												<Select onValueChange={field.onChange} defaultValue={field.value}>
													<SelectTrigger className="border-gray-300 focus:border-accent-500 focus:ring-accent-500">
														<SelectValue placeholder="Select your department" />
													</SelectTrigger>
													<SelectContent>
														{departmentsLoading ? (
															<SelectItem value="loading" disabled>
																Loading departments...
															</SelectItem>
														) : departments.length > 0 ? (
															departments.map((dept) => (
																<SelectItem key={dept.id} value={dept.id}>
																	{dept.name}
																</SelectItem>
															))
														) : (
															<SelectItem value="no-departments" disabled>
																No departments available
															</SelectItem>
														)}
													</SelectContent>
												</Select>
											)}
										/>
										{errors.department && (
											<p className="text-sm text-red-600">
												{errors.department.message}
											</p>
										)}
									</div>

									<div className="space-y-2">
										<Label htmlFor="course" className="text-gray-700 font-medium">
											Course *
										</Label>
										<Controller
											name="course"
											control={control}
											render={({ field }) => (
												<Select onValueChange={field.onChange} defaultValue={field.value}>
													<SelectTrigger className="border-gray-300 focus:border-accent-500 focus:ring-accent-500">
														<SelectValue placeholder="Select your course" />
													</SelectTrigger>
													<SelectContent>
														{coursesLoading ? (
															<SelectItem value="loading" disabled>
																Loading courses...
															</SelectItem>
														) : courses.length > 0 ? (
															courses.map((course) => (
																<SelectItem key={course.id} value={course.id}>
																	{course.name}
																</SelectItem>
															))
														) : (
															<SelectItem value="no-courses" disabled>
																{selectedDepartmentId ? "No courses available" : "Select a department first"}
															</SelectItem>
														)}
													</SelectContent>
												</Select>
											)}
										/>
										{errors.course && (
											<p className="text-sm text-red-600">
												{errors.course.message}
											</p>
										)}
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div className="space-y-2">
										<Label htmlFor="section" className="text-gray-700 font-medium">
											Section *
										</Label>
										<Controller
											name="section"
											control={control}
											render={({ field }) => (
												<Select onValueChange={field.onChange} defaultValue={field.value}>
													<SelectTrigger className="border-gray-300 focus:border-accent-500 focus:ring-accent-500">
														<SelectValue placeholder="Select your section" />
													</SelectTrigger>
													<SelectContent>
														{sectionsLoading ? (
															<SelectItem value="loading" disabled>
																Loading sections...
															</SelectItem>
														) : sections.length > 0 ? (
															sections.map((section) => (
																<SelectItem key={section.id} value={section.id}>
																	{section.name}
																</SelectItem>
															))
														) : (
															<SelectItem value="no-sections" disabled>
																{selectedCourseId ? "No sections available" : "Select a course first"}
															</SelectItem>
														)}
													</SelectContent>
												</Select>
											)}
										/>
										{errors.section && (
											<p className="text-sm text-red-600">
												{errors.section.message}
											</p>
										)}
									</div>

									<div className="space-y-2">
										<Label htmlFor="year" className="text-gray-700 font-medium">
											Year Level *
										</Label>
										<Controller
											name="year"
											control={control}
											render={({ field }) => (
												<Select onValueChange={field.onChange} defaultValue={field.value}>
													<SelectTrigger className="border-gray-300 focus:border-accent-500 focus:ring-accent-500">
														<SelectValue placeholder="Select year level" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="1st Year">1st Year</SelectItem>
														<SelectItem value="2nd Year">2nd Year</SelectItem>
														<SelectItem value="3rd Year">3rd Year</SelectItem>
														<SelectItem value="4th Year">4th Year</SelectItem>
														<SelectItem value="5th Year">5th Year</SelectItem>
													</SelectContent>
												</Select>
											)}
										/>
										{errors.year && (
											<p className="text-sm text-red-600">
												{errors.year.message}
											</p>
										)}
									</div>

									<div className="space-y-2">
										<Label htmlFor="semester" className="text-gray-700 font-medium">
											Semester *
										</Label>
										<Controller
											name="semester"
											control={control}
											render={({ field }) => (
												<Select onValueChange={field.onChange} defaultValue={field.value}>
													<SelectTrigger className="border-gray-300 focus:border-accent-500 focus:ring-accent-500">
														<SelectValue placeholder="Select semester" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="1st Semester">1st Semester</SelectItem>
														<SelectItem value="2nd Semester">2nd Semester</SelectItem>
														<SelectItem value="Summer">Summer</SelectItem>
													</SelectContent>
												</Select>
											)}
										/>
										{errors.semester && (
											<p className="text-sm text-red-600">
												{errors.semester.message}
											</p>
										)}
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="program" className="text-gray-700 font-medium">
											Program
										</Label>
										<Input
											id="program"
											placeholder="e.g., Bachelor of Science in Computer Science"
											className="border-gray-300 focus:border-accent-500 focus:ring-accent-500"
											{...register("program")}
										/>
										{errors.program && (
											<p className="text-sm text-red-600">
												{errors.program.message}
											</p>
										)}
									</div>

									<div className="space-y-2">
										<Label htmlFor="specialization" className="text-gray-700 font-medium">
											Specialization
										</Label>
										<Input
											id="specialization"
											placeholder="e.g., Software Development"
											className="border-gray-300 focus:border-accent-500 focus:ring-accent-500"
											{...register("specialization")}
										/>
										{errors.specialization && (
											<p className="text-sm text-red-600">
												{errors.specialization.message}
											</p>
										)}
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="bio" className="text-gray-700 font-medium">
										Bio
									</Label>
									<textarea
										id="bio"
										placeholder="Tell us about yourself (optional)"
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
										rows={3}
										{...register("bio")}
									/>
									{errors.bio && (
										<p className="text-sm text-red-600">
											{errors.bio.message}
										</p>
									)}
								</div>
							</div>

							{/* Security */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
									Security
								</h3>

								<div className="space-y-2">
									<Label htmlFor="password" className="text-gray-700 font-medium">
										Password *
									</Label>
									<div className="relative">
										<Input
											id="password"
											type={showPassword ? "text" : "password"}
											placeholder="Create a strong password"
											className="border-gray-300 focus:border-accent-500 focus:ring-accent-500 pr-10"
											{...register("password")}
										/>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
											onClick={() => setShowPassword(!showPassword)}
										>
											{showPassword ? (
												<EyeOff className="h-4 w-4 text-gray-400" />
											) : (
												<Eye className="h-4 w-4 text-gray-400" />
											)}
										</Button>
									</div>
									{errors.password && (
										<p className="text-sm text-red-600">
											{errors.password.message}
										</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
										Confirm Password *
									</Label>
									<div className="relative">
										<Input
											id="confirmPassword"
											type={showConfirmPassword ? "text" : "password"}
											placeholder="Confirm your password"
											className="border-gray-300 focus:border-accent-500 focus:ring-accent-500 pr-10"
											{...register("confirmPassword")}
										/>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
											onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										>
											{showConfirmPassword ? (
												<EyeOff className="h-4 w-4 text-gray-400" />
											) : (
												<Eye className="h-4 w-4 text-gray-400" />
											)}
										</Button>
									</div>
									{errors.confirmPassword && (
										<p className="text-sm text-red-600">
											{errors.confirmPassword.message}
										</p>
									)}
								</div>
							</div>

							<Button
								type="submit"
								className="w-full bg-accent-500 hover:bg-accent-600 text-white font-medium py-2.5"
								disabled={isLoading || registerMutation.isPending}
							>
								{isLoading || registerMutation.isPending ? "Creating Account..." : "Create Account"}
							</Button>
						</form>

						<div className="text-center space-y-2">
							<p className="text-sm text-gray-600">
								Already have an account?{" "}
								<Link
									href="/login/student"
									className="text-accent-600 hover:text-accent-700 hover:underline"
								>
									Sign in here
								</Link>
							</p>
							<Link
								href="/select-role"
								className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-accent-600 transition-colors"
							>
								<ArrowLeft className="w-4 h-4" />
								Back to role selection
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
