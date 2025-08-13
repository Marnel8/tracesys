"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { memo } from "react";

const AttendanceHeader = () => {
	return (
		<div className="mb-4 sm:mb-6">
			<div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
				<Link href="/dashboard/student">
					<Button
						variant="ghost"
						size="sm"
						className="flex items-center gap-1 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3"
					>
						<ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
						<span className="hidden sm:inline text-xs sm:text-sm">
							Back to Dashboard
						</span>
					</Button>
				</Link>
			</div>
			<h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
				Attendance
			</h1>
			<p className="text-gray-600 text-xs sm:text-sm md:text-base">
				Log your daily attendance and view your history.
			</p>
		</div>
	);
};

export default memo(AttendanceHeader);
