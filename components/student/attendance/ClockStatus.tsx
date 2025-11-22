"use client";

import { memo } from "react";

type TodayAttendance = {
	clockIn?: string;
	clockOut?: string;
	morningTimeIn?: string | null;
	morningTimeOut?: string | null;
	afternoonTimeIn?: string | null;
	afternoonTimeOut?: string | null;
	hours?: number | null;
	date: string;
} | null;

type Props = {
	todayAttendance: TodayAttendance;
};

const formatTime = (timeStr: string | null | undefined): string => {
	if (!timeStr) return "";
	try {
		const date = new Date(timeStr);
		return date.toLocaleTimeString('en-US', { 
			hour12: true, 
			hour: '2-digit', 
			minute: '2-digit' 
		});
	} catch {
		return timeStr;
	}
};

const ClockStatus = ({ todayAttendance }: Props) => {
	if (!todayAttendance) return null;
	
	const hasMorning = todayAttendance.morningTimeIn || todayAttendance.morningTimeOut;
	const hasAfternoon = todayAttendance.afternoonTimeIn || todayAttendance.afternoonTimeOut;
	const hasLegacy = todayAttendance.clockIn || todayAttendance.clockOut;
	
	// Calculate hours for each session
	const calculateSessionHours = (timeIn: string | null | undefined, timeOut: string | null | undefined): number => {
		if (!timeIn || !timeOut) return 0;
		try {
			const start = new Date(timeIn);
			const end = new Date(timeOut);
			const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
			return Math.max(0, Math.round(hours * 100) / 100);
		} catch {
			return 0;
		}
	};
	
	const morningHours = calculateSessionHours(todayAttendance.morningTimeIn, todayAttendance.morningTimeOut);
	const afternoonHours = calculateSessionHours(todayAttendance.afternoonTimeIn, todayAttendance.afternoonTimeOut);
	const totalHours = todayAttendance.hours || (morningHours + afternoonHours);
	
	return (
		<div className="bg-blue-50 border border-blue-200 p-3 sm:p-4 rounded-lg">
			<div className="space-y-3">
				{/* Morning Session */}
				{hasMorning && (
					<div className="pb-2 border-b border-blue-300">
						<div className="text-xs sm:text-sm font-semibold text-blue-900 mb-2">Morning Session</div>
						<div className="space-y-1">
							{todayAttendance.morningTimeIn && (
								<div className="flex items-center justify-between">
									<span className="text-xs sm:text-sm font-medium text-blue-800">
										Time In:
									</span>
									<span className="text-xs sm:text-sm text-blue-700 font-mono">
										{formatTime(todayAttendance.morningTimeIn)}
									</span>
								</div>
							)}
							{todayAttendance.morningTimeOut && (
								<div className="flex items-center justify-between">
									<span className="text-xs sm:text-sm font-medium text-blue-800">
										Time Out:
									</span>
									<span className="text-xs sm:text-sm text-blue-700 font-mono">
										{formatTime(todayAttendance.morningTimeOut)}
									</span>
								</div>
							)}
							{morningHours > 0 && (
								<div className="flex items-center justify-between">
									<span className="text-xs sm:text-sm font-medium text-blue-800">
										Hours:
									</span>
									<span className="text-xs sm:text-sm text-blue-700 font-mono">
										{morningHours.toFixed(2)}h
									</span>
								</div>
							)}
						</div>
					</div>
				)}
				
				{/* Afternoon Session */}
				{hasAfternoon && (
					<div className="pb-2 border-b border-blue-300">
						<div className="text-xs sm:text-sm font-semibold text-blue-900 mb-2">Afternoon Session</div>
						<div className="space-y-1">
							{todayAttendance.afternoonTimeIn && (
								<div className="flex items-center justify-between">
									<span className="text-xs sm:text-sm font-medium text-blue-800">
										Time In:
									</span>
									<span className="text-xs sm:text-sm text-blue-700 font-mono">
										{formatTime(todayAttendance.afternoonTimeIn)}
									</span>
								</div>
							)}
							{todayAttendance.afternoonTimeOut && (
								<div className="flex items-center justify-between">
									<span className="text-xs sm:text-sm font-medium text-blue-800">
										Time Out:
									</span>
									<span className="text-xs sm:text-sm text-blue-700 font-mono">
										{formatTime(todayAttendance.afternoonTimeOut)}
									</span>
								</div>
							)}
							{afternoonHours > 0 && (
								<div className="flex items-center justify-between">
									<span className="text-xs sm:text-sm font-medium text-blue-800">
										Hours:
									</span>
									<span className="text-xs sm:text-sm text-blue-700 font-mono">
										{afternoonHours.toFixed(2)}h
									</span>
								</div>
							)}
						</div>
					</div>
				)}
				
				{/* Legacy format (backward compatibility) */}
				{!hasMorning && !hasAfternoon && hasLegacy && (
					<div className="space-y-2">
						{todayAttendance.clockIn && (
							<div className="flex items-center justify-between">
								<span className="text-xs sm:text-sm font-medium text-blue-900">
									Clock In:
								</span>
								<span className="text-xs sm:text-sm text-blue-700 font-mono">
									{formatTime(todayAttendance.clockIn)}
								</span>
							</div>
						)}
						{todayAttendance.clockOut && (
							<div className="flex items-center justify-between">
								<span className="text-xs sm:text-sm font-medium text-blue-900">
									Clock Out:
								</span>
								<span className="text-xs sm:text-sm text-blue-700 font-mono">
									{formatTime(todayAttendance.clockOut)}
								</span>
							</div>
						)}
					</div>
				)}
				
				{/* Total Hours */}
				{totalHours > 0 && (
					<div className="pt-2 border-t border-blue-300">
						<div className="flex items-center justify-between">
							<span className="text-xs sm:text-sm font-semibold text-blue-900">
								Total Hours (excluding lunch):
							</span>
							<span className="text-xs sm:text-sm text-blue-700 font-mono font-semibold">
								{totalHours.toFixed(2)}h
							</span>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default memo(ClockStatus);
