"use client";

import { useState, useRef, useEffect } from "react";
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

export default function AttendancePage() {
	const [currentTime, setCurrentTime] = useState<string>("");
	const [isMounted, setIsMounted] = useState(false);
	const [location, setLocation] = useState<{
		latitude: number;
		longitude: number;
		address?: string;
	} | null>(null);
	const [locationError, setLocationError] = useState<string | null>(null);
	const [isLoadingAddress, setIsLoadingAddress] = useState(false);
	const [isClockingIn, setIsClockingIn] = useState(false);
	const [isClockingOut, setIsClockingOut] = useState(false);
	const [todayAttendance, setTodayAttendance] = useState<{
		clockIn?: string;
		clockOut?: string;
		date: string;
	} | null>(null);
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

	// Handle client-side mounting, time updates, and location tracking
	useEffect(() => {
		setIsMounted(true);
		const updateTime = () => {
			setCurrentTime(new Date().toLocaleTimeString());
		};

		updateTime(); // Set initial time
		const interval = setInterval(updateTime, 1000);

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
						console.error("Location error:", error);
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
				console.error("Error getting address:", error);
				// Don't show error to user, just log it
			} finally {
				setIsLoadingAddress(false);
			}
		};

		getLocation();

		// Check today's attendance (simulate API call)
		const checkTodayAttendance = () => {
			const today = new Date().toISOString().split("T")[0];
			// TODO: Replace with actual API call
			// For now, simulate checking localStorage or API
			const savedAttendance = localStorage.getItem(`attendance_${today}`);
			if (savedAttendance) {
				setTodayAttendance(JSON.parse(savedAttendance));
			} else {
				setTodayAttendance({ date: today });
			}
		};

		checkTodayAttendance();

		return () => clearInterval(interval);
	}, []);

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
					console.error("Location error:", error);
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
			console.error("Error getting address:", error);
			// Don't show error to user, just log it
		} finally {
			setIsLoadingAddress(false);
		}
	};

	const attendanceHistory = [
		{
			date: "2024-01-15",
			status: "present",
			clockIn: "08:00 AM",
			clockOut: "05:00 PM",
			location: "Main Campus",
		},
		{
			date: "2024-01-14",
			status: "present",
			clockIn: "08:15 AM",
			clockOut: "05:15 PM",
			location: "Main Campus",
		},
		{
			date: "2024-01-13",
			status: "late",
			clockIn: "08:30 AM",
			clockOut: "05:30 PM",
			location: "Main Campus",
		},
		{
			date: "2024-01-12",
			status: "present",
			clockIn: "07:55 AM",
			clockOut: "04:55 PM",
			location: "Main Campus",
		},
	];

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
			console.error("Failed to load face detection models:", err);
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
			console.error("Error accessing camera:", error);
			setIsCapturing(false);
			setShowCamera(false);
			alert("Camera access denied. Please allow camera access to clock in.");
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
		if (!location) {
			alert(
				"Location is required to clock in. Please enable location services."
			);
			return;
		}

		// Start camera for selfie capture
		setIsClockingIn(true);
		await startCamera();
	};

	const submitClockIn = async () => {
		if (!capturedImage) {
			alert("Please take a selfie to complete clock in.");
			return;
		}

		try {
			const now = new Date();
			const timeString = now.toLocaleTimeString();
			const today = now.toISOString().split("T")[0];

			const attendanceData = {
				date: today,
				clockIn: timeString,
				selfieImage: capturedImage,
				location: location
					? {
							latitude: location.latitude,
							longitude: location.longitude,
					  }
					: null,
			};

			// TODO: Replace with actual API call
			localStorage.setItem(
				`attendance_${today}`,
				JSON.stringify(attendanceData)
			);
			setTodayAttendance(attendanceData);

			// Reset camera state
			setCapturedImage(null);
			setShowCamera(false);
			setIsClockingIn(false);

			console.log("Clocked in successfully:", attendanceData);
		} catch (error) {
			console.error("Error clocking in:", error);
			alert("Failed to clock in. Please try again.");
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
			console.error("Error restarting camera:", error);
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
		if (!location) {
			alert(
				"Location is required to clock out. Please enable location services."
			);
			return;
		}

		if (!todayAttendance?.clockIn) {
			alert("You must clock in first before clocking out.");
			return;
		}

		setIsClockingOut(true);
		try {
			const now = new Date();
			const timeString = now.toLocaleTimeString();
			const today = now.toISOString().split("T")[0];

			const updatedAttendance = {
				...todayAttendance,
				clockOut: timeString,
				location: {
					latitude: location.latitude,
					longitude: location.longitude,
				},
			};

			// TODO: Replace with actual API call
			localStorage.setItem(
				`attendance_${today}`,
				JSON.stringify(updatedAttendance)
			);
			setTodayAttendance(updatedAttendance);

			console.log("Clocked out successfully:", updatedAttendance);
		} catch (error) {
			console.error("Error clocking out:", error);
			alert("Failed to clock out. Please try again.");
		} finally {
			setIsClockingOut(false);
		}
	};

	return (
		<div className="px-3 sm:px-4 md:px-6 lg:px-8 xl:px-16">
			<AttendanceHeader />

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
										!location || isClockingIn || !!todayAttendance?.clockIn
									}
									disableClockOut={
										!location ||
										isClockingOut ||
										!todayAttendance?.clockIn ||
										!!todayAttendance?.clockOut
									}
									isClockingOut={isClockingOut}
								/>
							)}

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

					<RecentAttendance records={attendanceHistory} />
				</div>
			</div>
		</div>
	);
}
