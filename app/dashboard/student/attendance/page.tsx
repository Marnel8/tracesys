"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
let faceApiModule: typeof import("face-api.js") | null = null;
import AttendanceHeader from "@/components/student/attendance/AttendanceHeader";
import LocationBanner from "@/components/student/attendance/LocationBanner";
import ClockStatus from "@/components/student/attendance/ClockStatus";
import SelfieCapture from "@/components/student/attendance/SelfieCapture";
import ClockButtons from "@/components/student/attendance/ClockButtons";
import CurrentLocationDisplay from "@/components/student/attendance/CurrentLocationDisplay";
import RecentAttendance from "@/components/student/attendance/RecentAttendance";
import { useAuth } from "@/hooks/auth/useAuth";
import { useStudentRequirements } from "@/hooks/student/useStudentRequirements";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRequirementTemplates } from "@/hooks/requirement-template/useRequirementTemplate";
import { useToast } from "@/hooks/use-toast";
import { useStudent } from "@/hooks/student";
import { useAttendance, useClockIn, useClockOut, AttendanceRecord } from "@/hooks/attendance";
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

export default function AttendancePage() {
	const { toast } = useToast();
	const [currentTime, setCurrentTime] = useState<string>("");
	const [isMounted, setIsMounted] = useState(false);
	const [location, setLocation] = useState<{
		latitude: number;
		longitude: number;
		address?: string;
	} | null>(null);
	const [locationType, setLocationType] = useState<"Inside" | "In-field" | "Outside" | null>(null);
	const [deviceType, setDeviceType] = useState<"Mobile" | "Desktop" | "Tablet">("Desktop");
	const [deviceUnit, setDeviceUnit] = useState<string>("");
	const [macAddress, setMacAddress] = useState<string | null>(null);
	const [locationError, setLocationError] = useState<string | null>(null);
	const [isLoadingAddress, setIsLoadingAddress] = useState(false);
	const [isClockingIn, setIsClockingIn] = useState(false);
	const [isClockingOut, setIsClockingOut] = useState(false);
	const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
	const [isCapturing, setIsCapturing] = useState(false);
	const [capturedImage, setCapturedImage] = useState<string | null>(null);
	const [showCamera, setShowCamera] = useState(false);
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const overlayCircleRef = useRef<HTMLDivElement>(null);
	const [isFaceModelLoaded, setIsFaceModelLoaded] = useState(false);
	const [isLoadingFaceModels, setIsLoadingFaceModels] = useState(false);
	const [isFaceDetected, setIsFaceDetected] = useState(false);
	const detectionIntervalRef = useRef<number | null>(null);
	const detectionRafRef = useRef<number | null>(null);
	const [showClockOutConfirm, setShowClockOutConfirm] = useState(false);

	// Auth and required-requirements gate
	const { user } = useAuth();
	const studentId = (user as any)?.id as string | undefined;
	const { data: studentData } = useStudent(studentId as string);
	const { data: requirementsData } = useStudentRequirements(studentId as string, { limit: 200, page: 1 });
	const { data: templatesData } = useRequirementTemplates({ page: 1, limit: 200, status: "active" });
	const requirementsList: any[] = (requirementsData as any)?.requirements
		?? (requirementsData as any)?.items
		?? (requirementsData as any)?.data?.requirements
		?? [];
	const templatesList: any[] = (templatesData as any)?.requirementTemplates
		?? (templatesData as any)?.data?.requirementTemplates
		?? [];

	const requiredTemplates: any[] = templatesList.filter((t: any) => t?.isRequired);
	const hasBlockingRequired = requiredTemplates.some((tpl: any) => {
		const matches = requirementsList.filter((r: any) => r?.templateId === tpl?.id);
		if (matches.length === 0) return true; // no submission for required template
		const latest = matches.sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
		const status = String(latest?.status ?? "").toLowerCase();
		// allow only when approved
		return !["approved"].includes(status);
	});

	// Additional attendance gate: ensure student has an agency and has reached start date
	const student: any = (studentData as any)?.student
		?? (studentData as any)?.data
		?? studentData;
	const practicums: any[] = student?.practicums ?? [];
	const practicumWithAgency: any | undefined = practicums.find((p: any) => p?.agency) ?? practicums[0];
	const hasAgency = !!practicumWithAgency?.agency;
	const startDateStr: string | undefined = practicumWithAgency?.startDate;
	const todayYmd = new Date().toISOString().split("T")[0];
	const isOnOrAfterStart = startDateStr ? todayYmd >= String(startDateStr).slice(0, 10) : false;
	const hasAgencyOrDateBlocking = !hasAgency || !isOnOrAfterStart;

	// Attendance hooks
	const clockInMutation = useClockIn();
	const clockOutMutation = useClockOut();
	
	// Get today's date for filtering
	const today = new Date().toISOString().split('T')[0];
	
	// Fetch today's attendance record
	const { data: attendanceData, isLoading: isLoadingAttendance } = useAttendance({
		studentId: studentId,
		date: today,
		limit: 1,
	});

	// Fetch recent attendance for the history component
	const { data: recentAttendanceData } = useAttendance({
		studentId: studentId,
		limit: 10,
		page: 1,
	});

	// Set today's attendance from API data
	useEffect(() => {
		if (attendanceData?.attendance && attendanceData.attendance.length > 0) {
			setTodayAttendance(attendanceData.attendance[0]);
		} else {
			setTodayAttendance(null);
		}
	}, [attendanceData]);

	// Handle client-side mounting, time updates, and location tracking
	useEffect(() => {
		setIsMounted(true);
		const updateTime = () => {
			setCurrentTime(new Date().toLocaleTimeString());
		};

		updateTime(); // Set initial time
		const interval = setInterval(updateTime, 1000);

		// Detect device type only on client side
		if (typeof navigator !== "undefined") {
			const userAgent = navigator.userAgent;
			setDeviceUnit(userAgent);
			
			if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
				setDeviceType("Mobile");
			} else if (/iPad/.test(userAgent)) {
				setDeviceType("Tablet");
			} else {
				setDeviceType("Desktop");
			}
		}

		// Get user location
		const getLocation = () => {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(
					async (position) => {
						const coords = {
							latitude: position.coords.latitude,
							longitude: position.coords.longitude,
						};

						setLocation(coords);
						setLocationError(null);

						// Get address from coordinates
						await getAddressFromCoords(coords.latitude, coords.longitude);
					},
					(error) => {
						setLocationError(
							"Location access denied. Please enable location services."
						);
						toast({
							variant: "destructive",
							title: "Location error",
							description: "Location access denied. Please enable location services.",
						});
					}
				);
			} else {
				setLocationError("Geolocation is not supported by this browser.");
			}
		};

		// Function to get address from coordinates using reverse geocoding
		const getAddressFromCoords = async (lat: number, lng: number) => {
			setIsLoadingAddress(true);
			try {
				const response = await fetch(
					`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
				);
				const data = await response.json();

				if (data.display_name) {
					setLocation((prev) =>
						prev
							? {
									...prev,
									address: data.display_name,
							  }
							: null
					);
				}
			} catch (error) {
				toast({
					variant: "destructive",
					title: "Reverse geocoding failed",
					description: "Could not retrieve address for your current location.",
				});
			} finally {
				setIsLoadingAddress(false);
			}
		};

		getLocation();

		// Today's attendance is now handled by the API hook above

		return () => clearInterval(interval);
	}, []);

	// Compute location type whenever location or agency changes
	useEffect(() => {
		if (!location) return;
		const agency = practicumWithAgency?.agency as any;
		if (!agency) return;
		const agencyLat = Number(agency?.latitude);
		const agencyLng = Number(agency?.longitude);
		if (isNaN(agencyLat) || isNaN(agencyLng)) return;

		const toRad = (v: number) => (v * Math.PI) / 180;
		const R = 6371000; // meters
		const dLat = toRad(location.latitude - agencyLat);
		const dLon = toRad(location.longitude - agencyLng);
		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(toRad(agencyLat)) *
				Math.cos(toRad(location.latitude)) *
				Math.sin(dLon / 2) * Math.sin(dLon / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		const distance = R * c; // meters
		
		// Debug logging
		console.log("Location Debug:", {
			currentLocation: { lat: location.latitude, lng: location.longitude },
			agencyLocation: { lat: agencyLat, lng: agencyLng },
			distance: Math.round(distance) + "m",
			locationType: distance <= 150 ? "Inside" : distance <= 500 ? "In-field" : "Outside"
		});
		
		if (distance <= 150) setLocationType("Inside");
		else if (distance <= 500) setLocationType("In-field");
		else setLocationType("Outside");
	}, [location, practicumWithAgency]);

	// Short device label for UI display
	const shortDevice = useMemo(() => {
		if (!deviceUnit) return "";
		try {
			const ua = deviceUnit;
			if (/iPhone/i.test(ua)) return "iPhone";
			if (/iPad/i.test(ua)) return "iPad";
			if (/Android/i.test(ua)) return "Android";
			if (/Windows NT/i.test(ua)) return "Windows";
			if (/Mac OS X/i.test(ua)) return "macOS";
			if (/Linux/i.test(ua)) return "Linux";
			return ua.split(" ").slice(0, 1)[0];
		} catch {
			return "";
		}
	}, [deviceUnit]);

	// Helper function to shorten device type names
	const shortenDeviceType = (deviceType: string) => {
		const abbreviations: { [key: string]: string } = {
			'Mobile Phone': 'Mobile',
			'Desktop Computer': 'Desktop',
			'Laptop Computer': 'Laptop',
			'Tablet': 'Tablet',
			'Smartphone': 'Phone',
			'Computer': 'PC',
			'Workstation': 'WS',
			'Personal Computer': 'PC',
			'Mobile Device': 'Mobile',
			'Handheld Device': 'Handheld',
			'Portable Device': 'Portable'
		};
		
		return abbreviations[deviceType] || deviceType;
	};

	// Cleanup face detection interval and media stream on unmount
	useEffect(() => {
		return () => {
			if (videoRef.current?.srcObject) {
				const stream = videoRef.current.srcObject as MediaStream;
				stream.getTracks().forEach((track) => track.stop());
			}
			if (detectionIntervalRef.current) {
				window.clearInterval(detectionIntervalRef.current);
				detectionIntervalRef.current = null;
			}
		};
	}, []);

	// Function to refresh location
	const refreshLocation = () => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				async (position) => {
					const coords = {
						latitude: position.coords.latitude,
						longitude: position.coords.longitude,
					};

					setLocation(coords);
					setLocationError(null);

					// Get address from coordinates
					await getAddressFromCoords(coords.latitude, coords.longitude);
				},
				(error) => {
					setLocationError(
						"Location access denied. Please enable location services."
					);
					toast({
						variant: "destructive",
						title: "Location error",
						description: "Location access denied. Please enable location services.",
					});
				}
			);
		}
	};

	// Function to get address from coordinates using reverse geocoding
	const getAddressFromCoords = async (lat: number, lng: number) => {
		setIsLoadingAddress(true);
		try {
			const response = await fetch(
				`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
			);
			const data = await response.json();

			if (data.display_name) {
				setLocation((prev) =>
					prev
						? {
								...prev,
								address: data.display_name,
						  }
						: null
				);
			}
		} catch (error) {
			toast({
				variant: "destructive",
				title: "Reverse geocoding failed",
				description: "Could not retrieve address for your current location.",
			});
		} finally {
			setIsLoadingAddress(false);
		}
	};

	// Mock data removed - now using real API data

	// Load face-api models from /public/models
	const loadFaceModels = async () => {
		if (isFaceModelLoaded || isLoadingFaceModels) return;
		try {
			setIsLoadingFaceModels(true);
			setIsFaceModelLoaded(false); // Ensure we start with false
			if (!faceApiModule) {
				if (typeof window === "undefined") return; // guard for SSR
				faceApiModule = (await import("face-api.js")).default
					? (await import("face-api.js")).default
					: await import("face-api.js");
			}
			const modelsUrl = "/models";
			await Promise.all([
				faceApiModule.nets.tinyFaceDetector.loadFromUri(modelsUrl),
			]);

			// Add a small delay to ensure the model is fully ready
			await new Promise((resolve) => setTimeout(resolve, 100));

			setIsFaceModelLoaded(true);
		} catch (err) {
			toast({
				variant: "destructive",
				title: "Face model load failed",
				description: "Could not load face detection model. Try again.",
			});
			setIsFaceModelLoaded(false);
		} finally {
			setIsLoadingFaceModels(false);
		}
	};

	const stopFaceDetection = () => {
		if (detectionIntervalRef.current) {
			window.clearInterval(detectionIntervalRef.current);
			detectionIntervalRef.current = null;
		}
		if (detectionRafRef.current) {
			cancelAnimationFrame(detectionRafRef.current);
			detectionRafRef.current = null;
		}
		setIsFaceDetected(false);
	};

	const startFaceDetection = () => {
		if (!videoRef.current || !isFaceModelLoaded || isLoadingFaceModels) {
			console.log("Cannot start face detection:", {
				hasVideo: !!videoRef.current,
				isFaceModelLoaded,
				isLoadingFaceModels,
			});
			return;
		}

		stopFaceDetection();
		if (!faceApiModule) return;
		const options = new faceApiModule.TinyFaceDetectorOptions({
			inputSize: 320,
			scoreThreshold: 0.3,
		});

		const tick = async () => {
			try {
				const video = videoRef.current;
				if (!video) return;
				if (video.readyState >= 2) {
					const result = await faceApiModule!.detectSingleFace(video, options);
					if (result) {
						const box = result.box;
						const container = containerRef.current;
						const circleEl = overlayCircleRef.current;
						if (container && circleEl) {
							const containerRect = container.getBoundingClientRect();
							const circleRect = circleEl.getBoundingClientRect();
							const circleCenterX =
								circleRect.left + circleRect.width / 2 - containerRect.left;
							const circleCenterY =
								circleRect.top + circleRect.height / 2 - containerRect.top;
							const radius = Math.min(circleRect.width, circleRect.height) / 2;

							const scaleX = containerRect.width / video.videoWidth;
							const scaleY = containerRect.height / video.videoHeight;
							const faceCenterX = (box.x + box.width / 2) * scaleX;
							const faceCenterY = (box.y + box.height / 2) * scaleY;
							const faceHalfDiag = Math.hypot(
								(box.width * scaleX) / 2,
								(box.height * scaleY) / 2
							);
							const centerDist = Math.hypot(
								faceCenterX - circleCenterX,
								faceCenterY - circleCenterY
							);

							const inside = centerDist + faceHalfDiag <= radius;
							setIsFaceDetected(inside);
						} else {
							setIsFaceDetected(false);
						}
					} else {
						setIsFaceDetected(false);
					}
				}
			} catch (err) {
				// ignore per-frame errors
			} finally {
				detectionRafRef.current = requestAnimationFrame(tick);
			}
		};

		detectionRafRef.current = requestAnimationFrame(tick);
	};

	const startCamera = async () => {
		try {
			setIsCapturing(true);
			setShowCamera(true);

			// Ensure models are loaded before starting detection
			await loadFaceModels();

			const stream = await navigator.mediaDevices.getUserMedia({
				video: {
					facingMode: "user",
					width: { ideal: 640 },
					height: { ideal: 480 },
				},
			});

			if (videoRef.current) {
				videoRef.current.srcObject = stream;

				// Wait for video to be ready and models to be loaded
				await new Promise<void>((resolve) => {
					const checkReady = () => {
						if (
							videoRef.current &&
							videoRef.current.readyState >= 2 &&
							isFaceModelLoaded
						) {
							resolve();
						} else {
							// Check again in next frame
							requestAnimationFrame(checkReady);
						}
					};

					const onPlaying = () => {
						checkReady();
					};

					videoRef.current?.addEventListener("playing", onPlaying, {
						once: true,
					});

					// Also start checking immediately in case video is already ready
					checkReady();

					// Fallback timeout
					setTimeout(() => resolve(), 2000);
				});

				// Double-check models are loaded before starting detection
				if (isFaceModelLoaded) {
					startFaceDetection();
				}
			}
		} catch (error) {
			setIsCapturing(false);
			setShowCamera(false);
			toast({
				variant: "destructive",
				title: "Camera access denied",
				description: "Please allow camera access to clock in.",
			});
		}
	};

	const capturePhoto = () => {
		if (videoRef.current && canvasRef.current) {
			const canvas = canvasRef.current;
			const video = videoRef.current;
			const context = canvas.getContext("2d");

			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;

			if (context) {
				context.drawImage(video, 0, 0);
				const imageData = canvas.toDataURL("image/png");
				setCapturedImage(imageData);

				// Stop camera
				const stream = video.srcObject as MediaStream;
				stream?.getTracks().forEach((track) => track.stop());
				stopFaceDetection();
				setIsCapturing(false);
			}
		}
	};

	const handleClockIn = async () => {
		if (hasBlockingRequired) {
			toast({
				variant: "destructive",
				title: "Action required",
				description: "Get required items approved before recording attendance.",
			});
			return;
		}
		if (!location) {
			toast({
				variant: "destructive",
				title: "Location required",
				description: "Enable location services to clock in.",
			});
			return;
		}

		// Start camera for selfie capture
		setIsClockingIn(true);
		await startCamera();
	};

	const submitClockIn = async () => {
		if (!capturedImage) {
			toast({
				variant: "destructive",
				title: "Selfie required",
				description: "Take a selfie to complete clock in.",
			});
			return;
		}

		if (!practicumWithAgency?.id) {
			toast({
				variant: "destructive",
				title: "No practicum found",
				description: "You need to be assigned to a practicum to clock in.",
			});
			return;
		}

		try {
			// Convert captured image to File object
			const response = await fetch(capturedImage);
			const blob = await response.blob();
			const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });

			// Get device information
			const deviceInfo = {
				deviceType: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? "Mobile" : "Desktop",
				deviceUnit: navigator.userAgent,
				macAddress: null, // Not available in browser
			};

			// Determine if late (assuming 8:00 AM is the expected time)
			const now = new Date();
			const expectedTime = new Date();
			expectedTime.setHours(8, 0, 0, 0);
			const isLate = now > expectedTime;

			await clockInMutation.mutateAsync({
				practicumId: practicumWithAgency.id,
				date: today,
				day: now.toLocaleDateString('en-US', { weekday: 'long' }),
				latitude: location?.latitude || null,
				longitude: location?.longitude || null,
				address: location?.address || null,
				locationType: (locationType || "Inside") as any,
				deviceType: deviceInfo.deviceType as "Mobile" | "Desktop" | "Tablet",
				deviceUnit: deviceInfo.deviceUnit,
				macAddress: macAddress,
				remarks: isLate ? "Late" : "Normal",
				photo: file,
			});

			// Reset camera state
			setCapturedImage(null);
			setShowCamera(false);
			setIsClockingIn(false);

		} catch (error) {
			toast({
				variant: "destructive",
				title: "Clock in failed",
				description: "Something went wrong. Please try again.",
			});
		}
	};

	const restartCamera = async () => {
		// Stop current camera stream
		if (videoRef.current?.srcObject) {
			const stream = videoRef.current.srcObject as MediaStream;
			stream.getTracks().forEach((track) => track.stop());
		}
		stopFaceDetection();

		// Reset face detection state
		setIsFaceDetected(false);

		// Restart camera
		try {
			await startCamera();
		} catch (error) {
			toast({
				variant: "destructive",
				title: "Camera restart failed",
				description: "Could not restart camera. Try again.",
			});
		}
	};

	const cancelClockIn = () => {
		// Stop camera if running
		if (videoRef.current?.srcObject) {
			const stream = videoRef.current.srcObject as MediaStream;
			stream.getTracks().forEach((track) => track.stop());
		}
		stopFaceDetection();

		setCapturedImage(null);
		setIsCapturing(false);
		setShowCamera(false);
		setIsClockingIn(false);
	};

	const handleClockOut = async () => {
		if (hasBlockingRequired) {
			toast({
				variant: "destructive",
				title: "Action required",
				description: "Get required items approved before recording attendance.",
			});
			return;
		}
		if (!location) {
			toast({
				variant: "destructive",
				title: "Location required",
				description: "Enable location services to clock out.",
			});
			return;
		}

		if (!todayAttendance?.timeIn) {
			toast({
				variant: "destructive",
				title: "Clock in first",
				description: "You cannot clock out before clocking in.",
			});
			return;
		}

		if (!practicumWithAgency?.id) {
			toast({
				variant: "destructive",
				title: "No practicum found",
				description: "You need to be assigned to a practicum to clock out.",
			});
			return;
		}

		// Show confirmation modal
		setShowClockOutConfirm(true);
	};

	const confirmClockOut = async () => {
		setIsClockingOut(true);
		setShowClockOutConfirm(false);
		
		try {
			// Get device information
			const deviceInfo = {
				deviceType: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? "Mobile" : "Desktop",
				deviceUnit: navigator.userAgent,
				macAddress: null, // Not available in browser
			};

			// Determine if early departure (assuming 5:00 PM is the expected time)
			const now = new Date();
			const expectedTime = new Date();
			expectedTime.setHours(17, 0, 0, 0);
			const isEarlyDeparture = now < expectedTime;

			await clockOutMutation.mutateAsync({
				practicumId: practicumWithAgency.id,
				date: today,
				latitude: location?.latitude || null,
				longitude: location?.longitude || null,
				address: location?.address || null,
				locationType: (locationType || "Inside") as any,
				deviceType: deviceInfo.deviceType as "Mobile" | "Desktop" | "Tablet",
				deviceUnit: deviceInfo.deviceUnit,
				macAddress: macAddress,
				remarks: isEarlyDeparture ? "Early Departure" : "Normal",
				photo: null, // Clock out doesn't require photo for now
			});

		} catch (error) {
			toast({
				variant: "destructive",
				title: "Clock out failed",
				description: "Something went wrong. Please try again.",
			});
		} finally {
			setIsClockingOut(false);
		}
	};

	return (
		<div className="px-3 sm:px-4 md:px-6 lg:px-8 xl:px-16">
			<AttendanceHeader />

			{(hasBlockingRequired || hasAgencyOrDateBlocking) && (
				<Card className="mb-4 border-red-300 bg-red-50">
					<CardHeader className="pb-2">
						<CardTitle className="text-red-700 text-base sm:text-lg">Action required before using Attendance</CardTitle>
					</CardHeader>
					<CardContent className="text-sm text-red-800 flex flex-col gap-3">
						{hasBlockingRequired && (
							<div>
								<p className="mb-2">Your account has required requirements that are not yet approved. Please submit and have them approved to continue.</p>
								<Link href="/dashboard/student/requirements">
									<Button variant="destructive">Go to Requirements</Button>
								</Link>
							</div>
						)}
						{hasAgencyOrDateBlocking && (
							<div>
								<p className="mb-2">You can only record attendance once you have an assigned agency and your practicum start date has begun.</p>
								<ul className="list-disc pl-5">
									{!hasAgency && <li>No agency is assigned to your account yet.</li>}
									{startDateStr && !isOnOrAfterStart && (
										<li>Start date is {new Date(startDateStr).toLocaleDateString()} — attendance opens on/after this date.</li>
									)}
									{!startDateStr && <li>Your practicum start date is not set.</li>}
								</ul>
							</div>
						)}
					</CardContent>
				</Card>
			)}

			<div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
				{/* Attendance Logging */}
				<div className="space-y-4 sm:space-y-6">
					<Card>
						<CardHeader className="pb-3 sm:pb-6">
							<CardTitle className="flex items-center gap-2 text-base sm:text-lg">
								<Clock className="w-4 h-4 sm:w-5 sm:h-5" />
								Today's Attendance
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3 sm:space-y-4">
							<LocationBanner
								locationError={locationError}
								locationDetected={!!location}
							/>

							<ClockStatus todayAttendance={todayAttendance} />

							<SelfieCapture
								showCamera={showCamera}
								isCapturing={isCapturing}
								isFaceModelLoaded={isFaceModelLoaded}
								isLoadingFaceModels={isLoadingFaceModels}
								isFaceDetected={isFaceDetected}
								videoRef={videoRef}
								canvasRef={canvasRef}
								containerRef={containerRef}
								overlayCircleRef={overlayCircleRef}
								capturedImage={capturedImage}
								onCapture={capturePhoto}
								onCancel={cancelClockIn}
								onSubmit={submitClockIn}
								onRetake={async () => {
									setCapturedImage(null);
									await startCamera();
								}}
								onRestartCamera={restartCamera}
							/>

							{!showCamera && (
							<ClockButtons
								onClockIn={handleClockIn}
								onClockOut={handleClockOut}
								disableClockIn={
									hasBlockingRequired || hasAgencyOrDateBlocking || !location || isClockingIn || clockInMutation.isPending || !!todayAttendance?.timeIn
								}
								disableClockOut={
									hasBlockingRequired || hasAgencyOrDateBlocking || !location ||
									isClockingOut || clockOutMutation.isPending ||
									!todayAttendance?.timeIn ||
									!!todayAttendance?.timeOut
								}
								isClockingOut={isClockingOut || clockOutMutation.isPending}
								/>
							)}

							<div className="text-xs text-gray-600 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-md border p-3">
								<div>
									<span className="font-medium">Location Type:</span>
									<span className="ml-2">
										{locationType || "Unknown"}
									</span>
								</div>
								<div>
									<span className="font-medium">Device:</span>
									<span className="ml-2">{shortenDeviceType(deviceType)} — {shortDevice}</span>
								</div>
								{/* <div>
									<span className="font-medium">MAC Address:</span>
									<span className="ml-2">{macAddress || "Unavailable in browser"}</span>
								</div> */}
							</div>

							<CurrentLocationDisplay
								location={location}
								isLoadingAddress={isLoadingAddress}
								isMounted={isMounted}
								currentTime={currentTime}
								onRefresh={refreshLocation}
							/>
						</CardContent>
					</Card>
				</div>

				{/* Calendar and History */}
				<div className="space-y-4 sm:space-y-6">
					{/* <Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<CalendarIcon className="w-5 h-5" />
								Calendar
							</CardTitle>
						</CardHeader>
						<CardContent className="flex justify-center">
							<Calendar
								mode="single"
								selected={selectedDate}
								onSelect={setSelectedDate}
								className="rounded-md border"
							/>
						</CardContent>
					</Card> */}

					<RecentAttendance 
						records={recentAttendanceData?.attendance?.map(record => ({
							date: record.date,
							status: record.status,
							clockIn: record.timeIn ? new Date(record.timeIn).toLocaleTimeString('en-US', { 
								hour: '2-digit', 
								minute: '2-digit',
								hour12: true 
							}) : 'N/A',
							clockOut: record.timeOut ? new Date(record.timeOut).toLocaleTimeString('en-US', { 
								hour: '2-digit', 
								minute: '2-digit',
								hour12: true 
							}) : 'N/A',
							location: record.address || record.agencyName || 'N/A',
							locationType: record.timeInLocationType || record.timeOutLocationType || undefined,
							timeInRemarks: record.timeInRemarks || undefined,
							timeOutRemarks: record.timeOutRemarks || undefined
						})) || []} 
					/>
				</div>
			</div>

			{/* Clock Out Confirmation Modal */}
			<AlertDialog open={showClockOutConfirm} onOpenChange={setShowClockOutConfirm}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Confirm Clock Out</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to clock out? This action will record your departure time and cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={confirmClockOut}>
							Clock Out
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
