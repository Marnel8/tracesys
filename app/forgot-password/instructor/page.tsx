"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForgotPassword, useResetPassword } from "@useAuth";
import { toast } from "sonner";
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
import { ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";

const requestSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
});

type RequestForm = z.infer<typeof requestSchema>;

const resetSchema = z
	.object({
		code: z.string().min(4, "Enter the code sent to your email"),
		password: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string().min(1, "Please confirm your password"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

type ResetForm = z.infer<typeof resetSchema>;

export default function InstructorForgotPasswordPage() {
	const router = useRouter();
	const [step, setStep] = useState<"request" | "reset">("request");
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const forgotPasswordMutation = useForgotPassword();
	const resetPasswordMutation = useResetPassword();

	const {
		register: registerRequest,
		handleSubmit: handleSubmitRequest,
		formState: { errors: requestErrors },
	} = useForm<RequestForm>({
		resolver: zodResolver(requestSchema),
	});

	const {
		register: registerReset,
		handleSubmit: handleSubmitReset,
		reset: resetResetForm,
		formState: { errors: resetErrors },
	} = useForm<ResetForm>({
		resolver: zodResolver(resetSchema),
		defaultValues: { code: "", password: "", confirmPassword: "" },
	});

	const onRequestReset: SubmitHandler<RequestForm> = async (data) => {
		setIsLoading(true);
		try {
			await forgotPasswordMutation.mutateAsync({ email: data.email });
			setEmail(data.email);
			setStep("reset");
			resetResetForm({ code: "", password: "", confirmPassword: "" });
			toast.success("Verification code sent to your email");
		} catch (error: any) {
			toast.error(error?.response?.data?.message || error?.message || "Failed to send code");
		} finally {
			setIsLoading(false);
		}
	};

	const onResetPassword: SubmitHandler<ResetForm> = async (data) => {
		setIsLoading(true);
		try {
			await resetPasswordMutation.mutateAsync({
				email,
				activation_code: data.code,
				password: data.password,
			});
			toast.success("Password updated. You can now sign in.");
			router.push("/login/instructor");
		} catch (error: any) {
			toast.error(error?.response?.data?.message || error?.message || "Failed to reset password");
		} finally {
			setIsLoading(false);
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
			<div className="absolute inset-0 bg-primary-500/20 backdrop-blur-sm" />

			<div className="relative z-10 w-full max-w-md">
				<Card className="bg-secondary-50/95 backdrop-blur-md border-primary-200 shadow-2xl animate-fade-in">
					<CardHeader className="text-center pb-6">
						<div className="flex justify-center items-center gap-4 mb-4">
							<Image src="/images/omsc-logo.png" alt="OMSC Logo" width={60} height={60} className="object-contain" />
							<Image src="/images/tracesys-logo.png" alt="TracèSys Logo" width={60} height={60} className="object-contain" />
						</div>
						<CardTitle className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
							{step === "request" ? (
								<>
									<KeyRound className="w-5 h-5 text-accent-600" />
									Forgot Password (Instructor)
								</>
							) : (
								<>
									<ShieldCheck className="w-5 h-5 text-accent-600" />
									Reset Your Password
								</>
							)}
						</CardTitle>
						<CardDescription className="text-gray-600">
							{step === "request"
								? "Enter your email to receive a verification code"
								: `We sent a verification code to ${email}`}
						</CardDescription>
					</CardHeader>

					<CardContent className="space-y-6">
						{step === "request" ? (
							<form onSubmit={handleSubmitRequest(onRequestReset)} className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="email" className="text-gray-700 font-medium">
										Email Address
									</Label>
									<Input
										id="email"
										type="email"
										autoComplete="email"
										placeholder="instructor@omsc.edu.ph"
										className="border-gray-300 focus:border-accent-500 focus:ring-accent-500"
										{...registerRequest("email")}
									/>
									{requestErrors.email && (
										<p className="text-sm text-red-600">{requestErrors.email.message}</p>
									)}
								</div>

								<Button
									type="submit"
									className="w-full bg-accent-500 hover:bg-accent-600 text-white font-medium py-2.5"
									disabled={isLoading || forgotPasswordMutation.isPending}
								>
									{isLoading || forgotPasswordMutation.isPending ? "Sending..." : "Send Verification Code"}
								</Button>
							</form>
						) : (
							<form onSubmit={handleSubmitReset(onResetPassword)} autoComplete="off" className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="code" className="text-gray-700 font-medium">
										Verification Code
									</Label>
									<Input
										id="code"
										type="text"
										autoComplete="off"
										inputMode="numeric"
										placeholder="Enter the code sent to your email"
										className="border-gray-300 focus:border-accent-500 focus:ring-accent-500"
										{...registerReset("code")}
									/>
									{resetErrors.code && (
										<p className="text-sm text-red-600">{resetErrors.code.message}</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="password" className="text-gray-700 font-medium">
										New Password
									</Label>
									<Input
										id="password"
										type="password"
										autoComplete="new-password"
										placeholder="Enter a new password"
										className="border-gray-300 focus:border-accent-500 focus:ring-accent-500"
										{...registerReset("password")}
									/>
									{resetErrors.password && (
										<p className="text-sm text-red-600">{resetErrors.password.message}</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
										Confirm New Password
									</Label>
									<Input
										id="confirmPassword"
										type="password"
										autoComplete="new-password"
										placeholder="Re-enter new password"
										className="border-gray-300 focus:border-accent-500 focus:ring-accent-500"
										{...registerReset("confirmPassword")}
									/>
									{resetErrors.confirmPassword && (
										<p className="text-sm text-red-600">{resetErrors.confirmPassword.message}</p>
									)}
								</div>

								<Button
									type="submit"
									className="w-full bg-accent-500 hover:bg-accent-600 text-white font-medium py-2.5"
									disabled={isLoading || resetPasswordMutation.isPending}
								>
									{isLoading || resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
								</Button>

								<div className="text-center">
									<Button
										variant="ghost"
										onClick={() => setStep("request")}
										className="text-sm"
									>
										Use a different email
									</Button>
								</div>
							</form>
						)}

						<div className="text-center space-y-2">
							<Link
								href="/login/instructor"
								className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-accent-600 transition-colors"
							>
								<ArrowLeft className="w-4 h-4" />
								Back to sign in
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}


