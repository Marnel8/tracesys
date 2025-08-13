"use client";

import { Button } from "@/components/ui/button";
import { Camera, CheckCircle, Loader2, RotateCcw } from "lucide-react";
import { memo, RefObject } from "react";

type Props = {
	showCamera: boolean;
	isCapturing: boolean;
	isFaceModelLoaded: boolean;
	isLoadingFaceModels: boolean;
	isFaceDetected: boolean;
	videoRef: RefObject<HTMLVideoElement | null>;
	canvasRef: RefObject<HTMLCanvasElement | null>;
	containerRef: RefObject<HTMLDivElement | null>;
	overlayCircleRef: RefObject<HTMLDivElement | null>;
	capturedImage: string | null;
	onCapture: () => void;
	onCancel: () => void;
	onSubmit: () => void;
	onRetake: () => void;
	onRestartCamera: () => void;
};

const SelfieCapture = ({
	showCamera,
	isCapturing,
	isFaceModelLoaded,
	isLoadingFaceModels,
	isFaceDetected,
	videoRef,
	canvasRef,
	containerRef,
	overlayCircleRef,
	capturedImage,
	onCapture,
	onCancel,
	onSubmit,
	onRetake,
	onRestartCamera,
}: Props) => {
	if (!showCamera) return null;
	return (
		<div className="space-y-3 sm:space-y-4">
			<div className="text-center">
				<h3 className="text-base sm:text-lg font-semibold mb-2">
					Take a Selfie to Clock In
				</h3>
				<p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 px-2">
					Position your face in the camera and take a clear photo
				</p>
			</div>

			{!capturedImage && isCapturing && (
				<div className="space-y-3 sm:space-y-4">
					<div
						ref={containerRef}
						className="relative aspect-video bg-black rounded-lg overflow-hidden"
					>
						<video
							ref={videoRef}
							autoPlay
							playsInline
							className="w-full h-full object-cover scale-x-[-1]"
						/>
						<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
							<div
								ref={overlayCircleRef}
								className={`rounded-full border-2 ${
									isFaceDetected ? "border-green-400" : "border-white/60"
								} w-[65%] sm:w-[56%] md:w-[50%] max-w-[400px] aspect-square`}
							/>
						</div>
					</div>
					<div className="flex items-center justify-center gap-2 text-xs">
						{(!isFaceModelLoaded || isLoadingFaceModels) && (
							<span className="inline-flex items-center text-gray-600">
								<Loader2 className="w-3 h-3 mr-1 animate-spin" /> Loading face
								model...
							</span>
						)}
						{isFaceModelLoaded && (
							<span
								className={isFaceDetected ? "text-green-600" : "text-gray-600"}
							>
								{isFaceDetected ? "Face detected" : "No face detected"}
							</span>
						)}
					</div>
					<div className="px-2">
						<ul className="text-[11px] sm:text-xs text-gray-600 space-y-1 list-disc list-inside max-w-md mx-auto">
							<li>Align your face inside the circle</li>
							<li>Hold the device at eye level and look straight</li>
							<li>Use good lighting; avoid strong backlight and shadows</li>
							<li>Keep still for a moment until "Face detected" appears</li>
							<li>Remove masks or hats; reduce glasses glare if possible</li>
						</ul>

						{isFaceModelLoaded && !isLoadingFaceModels && !isFaceDetected && (
							<div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
								<p className="text-[11px] sm:text-xs text-blue-700 font-medium mb-1">
									Face detection not working?
								</p>
								<p className="text-[10px] sm:text-xs text-blue-600">
									Try the "Restart Camera" button below if your face isn't being
									detected after positioning it properly.
								</p>
							</div>
						)}
					</div>
					<div className="flex flex-col sm:flex-row gap-2 justify-center">
						<Button
							onClick={onCapture}
							className="bg-blue-500 hover:bg-blue-600 text-sm"
							disabled={
								!isFaceDetected || !isFaceModelLoaded || isLoadingFaceModels
							}
							size="sm"
						>
							<Camera className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
							{!isFaceModelLoaded || isLoadingFaceModels
								? "Loading..."
								: isFaceDetected
								? "Capture Photo"
								: "Align Face"}
						</Button>
						{isFaceModelLoaded && !isLoadingFaceModels && (
							<div className="flex flex-col items-center gap-1">
								<Button
									variant="outline"
									onClick={onRestartCamera}
									size="sm"
									className="text-sm"
									title="Restart camera if face detection isn't working"
								>
									<RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
									Restart Camera
								</Button>
								<p className="text-[10px] text-gray-500 text-center">
									Use this if face detection stops working
								</p>
							</div>
						)}
						<Button
							variant="outline"
							onClick={onCancel}
							size="sm"
							className="text-sm"
						>
							Cancel
						</Button>
					</div>
				</div>
			)}

			{capturedImage && (
				<div className="space-y-3 sm:space-y-4">
					<div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
						<img
							src={capturedImage}
							alt="Captured selfie for clock in"
							className="w-full h-full object-cover scale-x-[-1]"
						/>
					</div>
					<div className="flex flex-col sm:flex-row gap-2 justify-center">
						<Button
							onClick={onSubmit}
							className="bg-green-500 hover:bg-green-600 text-sm"
							size="sm"
						>
							<CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
							Complete Clock In
						</Button>
						<Button
							variant="outline"
							onClick={onRetake}
							size="sm"
							className="text-sm"
						>
							Retake Photo
						</Button>
						<Button
							variant="outline"
							onClick={onCancel}
							size="sm"
							className="text-sm"
						>
							Cancel
						</Button>
					</div>
				</div>
			)}

			<canvas ref={canvasRef} className="hidden" />
		</div>
	);
};

export default memo(SelfieCapture);
