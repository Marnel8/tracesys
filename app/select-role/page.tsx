"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users } from "lucide-react";

export default function SelectRolePage() {
	const router = useRouter();
	const [selectedRole, setSelectedRole] = useState<
		"student" | "instructor" | null
	>(null);

	const handleRoleSelect = (role: "student" | "instructor") => {
		setSelectedRole(role);
		// Add a small delay for visual feedback
		setTimeout(() => {
			router.push(`/login/${role}`);
		}, 300);
	};

	return (
		<div
			className="min-h-screen flex items-center justify-center p-2 sm:p-4 relative"
			style={{
				backgroundImage: "url(/images/auth-bg.jpg)",
				backgroundSize: "cover",
				backgroundPosition: "center",
				backgroundRepeat: "no-repeat",
			}}
		>
			{/* Overlay */}
			<div className="absolute inset-0 bg-primary-500/20 backdrop-blur-sm" />

			<div className="relative z-10 w-full max-w-4xl px-2 sm:px-0">
				<Card className="bg-secondary-50/95 backdrop-blur-md border-primary-200 shadow-2xl">
					<CardHeader className="text-center pb-4 sm:pb-8 px-4 sm:px-6">
						<div className="flex justify-center items-center gap-3 sm:gap-6 mb-4 sm:mb-6">
							<Image
								src="/images/omsc-logo.png"
								alt="OMSC Logo"
								width={60}
								height={60}
								className="w-12 h-12 sm:w-20 sm:h-20 object-contain"
							/>
							<Image
								src="/images/tracesys-logo.png"
								alt="TracèSys Logo"
								width={60}
								height={60}
								className="w-12 h-12 sm:w-20 sm:h-20 object-contain"
							/>
						</div>
						<CardTitle className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">
							OCCIDENTAL MINDORO STATE COLLEGE
						</CardTitle>
						<CardTitle className="text-base sm:text-xl md:text-2xl font-semibold text-gray-700 mb-3 sm:mb-4">
							MAMBURAO CAMPUS
						</CardTitle>
						<CardDescription className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed px-2">
							Performance Monitoring and File Management System for On-The-Job
							Training (Practicum) Course
						</CardDescription>
					</CardHeader>

					<CardContent className="px-4 sm:px-8 pb-6 sm:pb-8">
						<div className="text-center mb-6 sm:mb-8">
							<h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">
								Select your role to continue
							</h3>
							<p className="text-sm sm:text-base text-gray-600">
								Choose the appropriate login type for your account
							</p>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto">
							<Button
								variant="outline"
								size="lg"
								className={`h-24 sm:h-32 flex-col gap-2 sm:gap-4 border-2 transition-all duration-300 hover:scale-105 ${
									selectedRole === "student"
										? "border-primary-500 bg-primary-50 text-primary-700"
										: "border-gray-300 hover:border-primary-400 hover:bg-primary-50/50"
								}`}
								onClick={() => handleRoleSelect("student")}
							>
								<GraduationCap className="w-6 h-6 sm:w-8 sm:h-8" />
								<div className="text-center">
									<div className="font-semibold text-base sm:text-lg">
										Student Trainee
									</div>
									<div className="text-xs sm:text-sm opacity-75">
										Access your practicum records
									</div>
								</div>
							</Button>

							<Button
								variant="outline"
								size="lg"
								className={`h-24 sm:h-32 flex-col gap-2 sm:gap-4 border-2 transition-all duration-300 hover:scale-105 ${
									selectedRole === "instructor"
										? "border-primary-500 bg-primary-50 text-primary-700"
										: "border-gray-300 hover:border-primary-400 hover:bg-primary-50/50"
								}`}
								onClick={() => handleRoleSelect("instructor")}
							>
								<Users className="w-6 h-6 sm:w-8 sm:h-8" />
								<div className="text-center">
									<div className="font-semibold text-base sm:text-lg">
										Instructor / Adviser
									</div>
									<div className="text-xs sm:text-sm opacity-75">
										Manage students and sections
									</div>
								</div>
							</Button>
						</div>

						<div className="text-center mt-6 sm:mt-8 space-y-4">
							<div className="text-xs sm:text-sm text-gray-500 px-2">
								Don't have an account? Create one below
							</div>
							<div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
							
								<Button
									variant="outline"
									size="sm"
									onClick={() => router.push("/signup/instructor")}
									className="flex items-center gap-2"
								>
									<Users className="w-4 h-4" />
									Sign up as Instructor
								</Button>
							</div>
							<div className="text-xs sm:text-sm text-gray-500 px-2">
								Need help? Contact your system administrator
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
