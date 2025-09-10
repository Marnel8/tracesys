"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, RefreshCw } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const otpSchema = z.object({
	otp: z.string().min(4, "Please enter the complete 4-digit code").max(4, "Code must be 4 digits"),
});

type OtpForm = z.infer<typeof otpSchema>;

interface OtpVerificationProps {
	email: string;
	activationToken: string;
	onVerificationSuccess: (data: any) => void;
	onBack: () => void;
	onResendCode: () => Promise<void>;
	isLoading?: boolean;
}

export default function OtpVerification({
	email,
	activationToken,
	onVerificationSuccess,
	onBack,
	onResendCode,
	isLoading = false,
}: OtpVerificationProps) {
	const [otp, setOtp] = useState(["", "", "", ""]);
	const [isResending, setIsResending] = useState(false);
	const [countdown, setCountdown] = useState(0);
	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

	const {
		handleSubmit,
		formState: { errors },
		setValue,
		watch,
	} = useForm<OtpForm>({
		resolver: zodResolver(otpSchema),
	});

	// Countdown timer for resend button
	useEffect(() => {
		if (countdown > 0) {
			const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
			return () => clearTimeout(timer);
		}
	}, [countdown]);

	const handleOtpChange = (index: number, value: string) => {
		if (value.length > 1) return; // Prevent multiple characters

		const newOtp = [...otp];
		newOtp[index] = value;
		setOtp(newOtp);

		// Update form value
		const otpString = newOtp.join("");
		setValue("otp", otpString);

		// Auto-focus next input
		if (value && index < 3) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
		if (e.key === "Backspace" && !otp[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const handlePaste = (e: React.ClipboardEvent) => {
		e.preventDefault();
		const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
		const newOtp = pastedData.split("").concat(Array(4 - pastedData.length).fill(""));
		setOtp(newOtp);
		setValue("otp", pastedData);
		
		// Focus the last filled input
		const lastFilledIndex = Math.min(pastedData.length - 1, 3);
		inputRefs.current[lastFilledIndex]?.focus();
	};

	const onSubmit = async (data: OtpForm) => {
		try {
			await onVerificationSuccess({
				activation_token: activationToken,
				activation_code: data.otp,
			});
		} catch (error) {
			console.error("OTP verification failed:", error);
		}
	};

	const handleResendCode = async () => {
		setIsResending(true);
		try {
			await onResendCode();
			setCountdown(60); // 60 seconds countdown
		} catch (error) {
			console.error("Failed to resend code:", error);
		} finally {
			setIsResending(false);
		}
	};

	return (
		<Card className="bg-secondary-50/95 backdrop-blur-md border-primary-200 shadow-2xl animate-fade-in">
			<CardHeader className="text-center pb-6">
				<div className="flex justify-center items-center gap-4 mb-4">
					<div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center">
						<Mail className="w-8 h-8 text-accent-600" />
					</div>
				</div>
				<CardTitle className="text-xl font-bold text-gray-800">
					Verify Your Email
				</CardTitle>
				<CardDescription className="text-gray-600">
					We've sent a 4-digit verification code to
					<br />
					<span className="font-medium text-gray-800">{email}</span>
				</CardDescription>
			</CardHeader>

			<CardContent className="space-y-6">
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					<div className="space-y-4">
						<Label className="text-gray-700 font-medium text-center block">
							Enter Verification Code
						</Label>
						<div className="flex justify-center gap-3">
							{otp.map((digit, index) => (
								<Input
									key={index}
									ref={(el) => (inputRefs.current[index] = el)}
									type="text"
									inputMode="numeric"
									pattern="[0-9]*"
									maxLength={1}
									value={digit}
									onChange={(e) => handleOtpChange(index, e.target.value)}
									onKeyDown={(e) => handleKeyDown(index, e)}
									onPaste={handlePaste}
									className="w-12 h-12 text-center text-lg font-semibold border-gray-300 focus:border-accent-500 focus:ring-accent-500"
									disabled={isLoading}
								/>
							))}
						</div>
						{errors.otp && (
							<p className="text-sm text-red-600 text-center">
								{errors.otp.message}
							</p>
						)}
					</div>

					<Button
						type="submit"
						className="w-full bg-accent-500 hover:bg-accent-600 text-white font-medium py-2.5"
						disabled={isLoading || otp.some(digit => !digit)}
					>
						{isLoading ? "Verifying..." : "Verify Email"}
					</Button>
				</form>

				<div className="text-center space-y-4">
					<p className="text-sm text-gray-600">
						Didn't receive the code?{" "}
						<Button
							variant="link"
							onClick={handleResendCode}
							disabled={isResending || countdown > 0}
							className="p-0 h-auto text-accent-600 hover:text-accent-700"
						>
							{isResending ? (
								<>
									<RefreshCw className="w-4 h-4 mr-1 animate-spin" />
									Sending...
								</>
							) : countdown > 0 ? (
								`Resend in ${countdown}s`
							) : (
								"Resend Code"
							)}
						</Button>
					</p>

					<Button
						variant="ghost"
						onClick={onBack}
						className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-accent-600 transition-colors"
					>
						<ArrowLeft className="w-4 h-4" />
						Back to Registration
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}


