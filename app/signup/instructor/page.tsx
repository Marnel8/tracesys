"use client";

import { useState } from "react";
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
import { ArrowLeft, Eye, EyeOff, Users } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getDepartmentOptions } from "@/data/instructor-courses";

const instructorSignupSchema = z
	.object({
		firstName: z.string().min(2, "First name must be at least 2 characters"),
		lastName: z.string().min(2, "Last name must be at least 2 characters"),
		email: z.string().email("Please enter a valid email address"),
		department: z.string().min(1, "Please select a department"),
		employeeId: z.string().min(1, "Employee ID is required"),
		password: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string().min(1, "Please confirm your password"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

type InstructorSignupForm = z.infer<typeof instructorSignupSchema>;

export default function InstructorSignupPage() {
	const router = useRouter();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	// Get departments from data
	const departments = getDepartmentOptions();
	console.log("Departments from getDepartmentOptions:", departments);

	const {
		register,
		handleSubmit,
		control,
		formState: { errors },
	} = useForm<InstructorSignupForm>({
		resolver: zodResolver(instructorSignupSchema),
	});

	const onSubmit = async (data: InstructorSignupForm) => {
		setIsLoading(true);
		// Simulate API call
		setTimeout(() => {
			console.log("Instructor signup:", data);
			setIsLoading(false);
			// Redirect to login page with success message or directly to dashboard
			router.push("/login/instructor");
		}, 2000);
	};

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
							<Users className="w-5 h-5 text-accent-600" />
							Create Instructor Account
						</CardTitle>
						<CardDescription className="text-gray-600">
							Join TracèSys to manage students and sections
						</CardDescription>
					</CardHeader>

					<CardContent className="space-y-6">
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label
										htmlFor="firstName"
										className="text-gray-700 font-medium"
									>
										First Name
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
									<Label
										htmlFor="lastName"
										className="text-gray-700 font-medium"
									>
										Last Name
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
								<Label htmlFor="email" className="text-gray-700 font-medium">
									Email Address
								</Label>
								<Input
									id="email"
									type="email"
									placeholder="instructor@omsc.edu.ph"
									className="border-gray-300 focus:border-accent-500 focus:ring-accent-500"
									{...register("email")}
								/>
								{errors.email && (
									<p className="text-sm text-red-600">{errors.email.message}</p>
								)}
							</div>

							<div className="space-y-2">
								<Label
									htmlFor="employeeId"
									className="text-gray-700 font-medium"
								>
									Employee ID
								</Label>
								<Input
									id="employeeId"
									placeholder="Enter your employee ID"
									className="border-gray-300 focus:border-accent-500 focus:ring-accent-500"
									{...register("employeeId")}
								/>
								{errors.employeeId && (
									<p className="text-sm text-red-600">
										{errors.employeeId.message}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label
									htmlFor="department"
									className="text-gray-700 font-medium"
								>
									Department
								</Label>
								<Controller
									name="department"
									control={control}
									render={({ field }) => (
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<SelectTrigger className="border-gray-300 focus:border-accent-500 focus:ring-accent-500">
												<SelectValue placeholder="Select your department" />
											</SelectTrigger>
											<SelectContent>
												{departments.map((dept) => (
													<SelectItem key={dept.value} value={dept.value}>
														{dept.label}
													</SelectItem>
												))}
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
								<Label htmlFor="password" className="text-gray-700 font-medium">
									Password
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
								<Label
									htmlFor="confirmPassword"
									className="text-gray-700 font-medium"
								>
									Confirm Password
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

							<Button
								type="submit"
								className="w-full bg-accent-500 hover:bg-accent-600 text-white font-medium py-2.5"
								disabled={isLoading}
							>
								{isLoading ? "Creating Account..." : "Create Account"}
							</Button>
						</form>

						<div className="text-center space-y-2">
							<p className="text-sm text-gray-600">
								Already have an account?{" "}
								<Link
									href="/login/instructor"
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
