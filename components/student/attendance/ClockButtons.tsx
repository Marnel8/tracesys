"use client";

import { Button } from "@/components/ui/button";
import { Clock, LogIn, LogOut } from "lucide-react";
import { memo } from "react";

type Props = {
	onClockIn: () => void;
	onClockOut: () => void;
	disableClockIn: boolean;
	disableClockOut: boolean;
	isClockingIn?: boolean;
	isClockingOut: boolean;
	currentSession?: "morning" | "afternoon" | "overtime" | null;
	clockInSession?: "morning" | "afternoon" | "overtime" | null;
	clockOutSession?: "morning" | "afternoon" | "overtime" | null;
};

const ClockButtons = ({
	onClockIn,
	onClockOut,
	disableClockIn,
	disableClockOut,
	isClockingIn,
	isClockingOut,
	currentSession,
	clockInSession,
	clockOutSession,
}: Props) => {
	// Use separate session labels for clock-in and clock-out
	const clockInLabel = clockInSession === "morning" ? "Morning" : clockInSession === "afternoon" ? "Afternoon" : clockInSession === "overtime" ? "Overtime" : "";
	const clockOutLabel = clockOutSession === "morning" ? "Morning" : clockOutSession === "afternoon" ? "Afternoon" : clockOutSession === "overtime" ? "Overtime" : "";
	// Fallback to currentSession if specific session not provided (for backward compatibility)
	const fallbackLabel = currentSession === "morning" ? "Morning" : currentSession === "afternoon" ? "Afternoon" : currentSession === "overtime" ? "Overtime" : "";
	const finalClockInLabel = clockInLabel || fallbackLabel;
	const finalClockOutLabel = clockOutLabel || fallbackLabel;
	
	return (
		<div className="flex items-center justify-center gap-4 sm:gap-6">
			<Button
				onClick={onClockIn}
				disabled={disableClockIn}
				className={`rounded-full w-20 h-20 sm:w-24 sm:h-24 p-0 flex flex-col items-center justify-center gap-1 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors ${
					isClockingIn
						? "bg-green-600 hover:bg-green-700"
						: "bg-green-500 hover:bg-green-600"
				}`}
			>
				{isClockingIn ? (
					<>
						<Clock className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-white" />
						<span className="text-xs sm:text-sm text-white font-medium">In...</span>
					</>
				) : (
					<>
						<LogIn className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
						<span className="text-xs sm:text-sm text-white font-medium">
							{finalClockInLabel || "In"}
						</span>
					</>
				)}
			</Button>

			<Button
				onClick={onClockOut}
				disabled={disableClockOut}
				className={`rounded-full w-20 h-20 sm:w-24 sm:h-24 p-0 flex flex-col items-center justify-center gap-1 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors ${
					isClockingOut
						? "bg-red-600 hover:bg-red-700"
						: "bg-red-500 hover:bg-red-600"
				}`}
			>
				{isClockingOut ? (
					<>
						<Clock className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-white" />
						<span className="text-xs sm:text-sm text-white font-medium">Out...</span>
					</>
				) : (
					<>
						<LogOut className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
						<span className="text-xs sm:text-sm text-white font-medium">
							{finalClockOutLabel || "Out"}
						</span>
					</>
				)}
			</Button>
		</div>
	);
};

export default memo(ClockButtons);
