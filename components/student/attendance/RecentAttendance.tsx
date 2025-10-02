"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Calendar } from "lucide-react";
import { memo } from "react";

type RecordItem = {
	date: string;
	status: "present" | "late" | "absent" | string;
	clockIn: string;
	clockOut: string;
	location: string;
	locationType?: "Inside" | "In-field" | "Outside" | string;
	timeInRemarks?: "Normal" | "Late" | "Early" | string;
	timeOutRemarks?: "Normal" | "Early Departure" | "Overtime" | string;
};

type Props = {
	records: RecordItem[];
};

const RecentAttendance = ({ records }: Props) => {
	const formatDate = (dateString: string) => {
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString('en-US', { 
				weekday: 'short', 
				month: 'short', 
				day: 'numeric' 
			});
		} catch {
			return dateString;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case "present":
				return "bg-green-100 text-green-800 border-green-200";
			case "late":
				return "bg-yellow-100 text-yellow-800 border-yellow-200";
			case "absent":
				return "bg-red-100 text-red-800 border-red-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	const getLocationTypeColor = (locationType: string) => {
		switch (locationType?.toLowerCase()) {
			case "inside":
				return "bg-blue-100 text-blue-800 border-blue-200";
			case "in-field":
				return "bg-orange-100 text-orange-800 border-orange-200";
			case "outside":
				return "bg-purple-100 text-purple-800 border-purple-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	const getRemarksColor = (remarks: string) => {
		switch (remarks?.toLowerCase()) {
			case "normal":
				return "bg-green-100 text-green-800 border-green-200";
			case "late":
				return "bg-yellow-100 text-yellow-800 border-yellow-200";
			case "early":
				return "bg-blue-100 text-blue-800 border-blue-200";
			case "early departure":
				return "bg-orange-100 text-orange-800 border-orange-200";
			case "overtime":
				return "bg-purple-100 text-purple-800 border-purple-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	const truncateLocation = (location: string, maxLength: number = 50) => {
		if (location.length <= maxLength) return location;
		return location.substring(0, maxLength) + "...";
	};

	return (
		<Card>
			<CardHeader className="pb-3 sm:pb-6">
				<CardTitle className="text-base sm:text-lg flex items-center gap-2">
					<Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
					Recent Attendance
				</CardTitle>
			</CardHeader>
			<CardContent>
				{records.length === 0 ? (
					<div className="text-center py-8 text-gray-500">
						<Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
						<p className="text-sm">No attendance records found</p>
					</div>
				) : (
					<div className="space-y-3">
						{records.map((record, index) => (
							<div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
								{/* Header with date and status */}
								<div className="flex items-center justify-between mb-3">
									<div className="flex items-center gap-2">
										<Calendar className="w-4 h-4 text-gray-500" />
										<span className="font-semibold text-sm text-gray-900">
											{formatDate(record.date)}
										</span>
									</div>
								</div>

								{/* Time information */}
								<div className="space-y-3 mb-3">
									<div className="flex items-center gap-4">
										<div className="flex items-center gap-2">
											<Clock className="w-4 h-4 text-gray-500" />
											<div className="text-sm">
												<span className="text-gray-600">In:</span>
												<span className="ml-1 font-mono font-medium text-gray-900">
													{record.clockIn}
												</span>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<Clock className="w-4 h-4 text-gray-500" />
											<div className="text-sm">
												<span className="text-gray-600">Out:</span>
												<span className="ml-1 font-mono font-medium text-gray-900">
													{record.clockOut}
												</span>
											</div>
										</div>
									</div>
									
									{/* Time remarks */}
									{(record.timeInRemarks || record.timeOutRemarks) && (
										<div className="flex flex-wrap gap-2">
											{record.timeInRemarks && record.timeInRemarks !== 'Normal' && (
												<Badge
													variant="outline"
													className={`text-xs font-medium px-2 py-1 ${getRemarksColor(record.timeInRemarks)}`}
												>
													Clock In: {record.timeInRemarks}
												</Badge>
											)}
											{record.timeOutRemarks && record.timeOutRemarks !== 'Normal' && (
												<Badge
													variant="outline"
													className={`text-xs font-medium px-2 py-1 ${getRemarksColor(record.timeOutRemarks)}`}
												>
													Clock Out: {record.timeOutRemarks}
												</Badge>
											)}
										</div>
									)}
								</div>

								{/* Location information */}
								{record.location && record.location !== 'N/A' && (
									<div className="space-y-2">
										<div className="flex items-start gap-2">
											<MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
											<span className="text-xs text-gray-600 leading-relaxed">
												{truncateLocation(record.location)}
											</span>
										</div>
										{record.locationType && (
											<div className="flex items-center gap-2">
												<Badge
													variant="outline"
													className={`text-xs font-medium px-2 py-1 ${getLocationTypeColor(record.locationType)}`}
												>
													{record.locationType}
												</Badge>
											</div>
										)}
									</div>
								)}
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export default memo(RecentAttendance);
