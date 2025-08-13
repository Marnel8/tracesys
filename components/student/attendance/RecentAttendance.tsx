"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { memo } from "react";

type RecordItem = {
	date: string;
	status: "present" | "late" | "absent" | string;
	clockIn: string;
	clockOut: string;
	location: string;
};

type Props = {
	records: RecordItem[];
};

const RecentAttendance = ({ records }: Props) => {
	return (
		<Card>
			<CardHeader className="pb-3 sm:pb-6">
				<CardTitle className="text-base sm:text-lg">
					Recent Attendance
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-2 sm:space-y-3">
					{records.map((record, index) => (
						<div key={index} className="p-3 bg-gray-50 rounded-lg space-y-2">
							<div className="flex items-center justify-between">
								<p className="font-medium text-xs sm:text-sm">{record.date}</p>
								<Badge
									variant="secondary"
									className={
										record.status === "present"
											? "bg-green-100 text-green-800 text-xs"
											: record.status === "late"
											? "bg-yellow-100 text-yellow-800 text-xs"
											: "bg-red-100 text-red-800 text-xs"
									}
								>
									{record.status}
								</Badge>
							</div>
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-xs text-gray-600">
								<div className="flex items-center gap-3 sm:gap-4">
									<span className="font-mono">In: {record.clockIn}</span>
									<span className="font-mono">Out: {record.clockOut}</span>
								</div>
								<span className="text-xs">{record.location}</span>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
};

export default memo(RecentAttendance);
