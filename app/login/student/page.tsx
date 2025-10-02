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
import { ArrowLeft, Eye, EyeOff, GraduationCap } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLogin, useLogout } from "@/hooks/auth/useAuth";
import { useToast } from "@/hooks/use-toast";

const studentLoginSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	password: z.string().min(1, "Password is required"),
});

type StudentLoginForm = z.infer<typeof studentLoginSchema>;

export default function StudentLoginPage() {
	const router = useRouter();
	const [showPassword, setShowPassword] = useState(false);
	const { toast } = useToast();
    const loginMutation = useLogin();
    const logoutMutation = useLogout();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<StudentLoginForm>({
		resolver: zodResolver(studentLoginSchema),
	});

    const onSubmit = async (data: StudentLoginForm) => {
        try {
            const res: any = await loginMutation.mutateAsync(data);
            const userRole = res?.user?.role;
            if (userRole !== "student") {
                toast({
                    title: "Wrong portal",
                    description: "This login is for students only. Please use the correct portal.",
                    variant: "destructive",
                });
                try {
                    await logoutMutation.mutateAsync();
                } catch {}
                return;
            }
            toast({
                title: "Login Successful",
                description: "Welcome back! Redirecting to your dashboard...",
            });
            router.push("/dashboard/student");
        } catch (error: any) {
            toast({
                title: "Login Failed",
                description: error.message || "An error occurred during login. Please try again.",
                variant: "destructive",
            });
        }
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
							<GraduationCap className="w-5 h-5 text-primary-600" />
							Student Login
						</CardTitle>
						<CardDescription className="text-gray-600">
							Enter your credentials to access your practicum records
						</CardDescription>
					</CardHeader>

					<CardContent className="space-y-6">
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
							<div className="space-y-2">
								<Label
									htmlFor="email"
									className="text-gray-700 font-medium"
								>
									Email Address
								</Label>
								<Input
									id="email"
									type="email"
									placeholder="Enter your email address"
									className="border-gray-300 focus:border-primary-500 focus:ring-primary-500"
									{...register("email")}
								/>
								{errors.email && (
									<p className="text-sm text-red-600">
										{errors.email.message}
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
										placeholder="Enter your password"
										className="border-gray-300 focus:border-primary-500 focus:ring-primary-500 pr-10"
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

							<div className="flex items-center justify-between">
								<Link
									href="/forgot-password/student"
									className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
								>
									Forgot password?
								</Link>
							</div>

							<Button
								type="submit"
								className="w-full bg-primary-600 hover:bg-primary-500 text-white font-medium py-2.5"
								disabled={loginMutation.isPending}
							>
								{loginMutation.isPending ? "Signing in..." : "Sign In"}
							</Button>
						</form>

						<div className="text-center">
							<Link
								href="/select-role"
								className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
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
