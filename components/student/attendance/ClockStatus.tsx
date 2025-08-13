"use client";

import { memo } from "react";

type TodayAttendance = {
	clockIn?: string;
	clockOut?: string;
	date: string;
} | null;

type Props = {
	todayAttendance: TodayAttendance;
};

const ClockStatus = ({ todayAttendance }: Props) => {
	if (!todayAttendance) return null;
	return (
		<div className="bg-blue-50 border border-blue-200 p-3 sm:p-4 rounded-lg">
			<div className="space-y-2">
				{todayAttendance.clockIn && (
					<div className="flex items-center justify-between">
						<span className="text-xs sm:text-sm font-medium text-blue-900">
							Clock In:
						</span>
						<span className="text-xs sm:text-sm text-blue-700 font-mono">
							{todayAttendance.clockIn}
						</span>
					</div>
				)}
				{todayAttendance.clockOut && (
					<div className="flex items-center justify-between">
						<span className="text-xs sm:text-sm font-medium text-blue-900">
							Clock Out:
						</span>
						<span className="text-xs sm:text-sm text-blue-700 font-mono">
							{todayAttendance.clockOut}
						</span>
					</div>
				)}
			</div>
		</div>
	);
};

export default memo(ClockStatus);
