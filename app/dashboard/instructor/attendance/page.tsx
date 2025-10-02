"use client";

import { useState, useMemo } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Search,
	Clock,
	CheckCircle,
	XCircle,
	Eye,
	Calendar,
	MapPin,
	Smartphone,
	Clock3,
	Download,
} from "lucide-react";
import { useAttendance, AttendanceRecord } from "@/hooks/attendance";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

// Helper functions for formatting data
const formatTime = (dateString: string | null | undefined) => {
	if (!dateString) return "N/A";
	const date = new Date(dateString);
	return date.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
	});
};

const formatDate = (dateString: string) => {
	const date = new Date(dateString);
	return date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
};

const getStudentName = (record: AttendanceRecord) => {
	if (record.student) {
		return `${record.student.firstName} ${record.student.lastName}`;
	}
	return "Unknown Student";
};

const getStudentId = (record: AttendanceRecord) => {
	return record.student?.studentId || record.studentId;
};

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

export default function AttendancePage() {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedStatus, setSelectedStatus] = useState("all");
	const [selectedApprovalStatus, setSelectedApprovalStatus] = useState("all");
	const [selectedDate, setSelectedDate] = useState("");
	const [selectedLog, setSelectedLog] = useState<AttendanceRecord | null>(null);
	const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

	// Fetch attendance data
	const { data: attendanceData, isLoading, error } = useAttendance({
		page: 1,
		limit: 50,
		search: searchTerm,
		status: selectedStatus === "all" ? undefined : selectedStatus as any,
		approvalStatus: selectedApprovalStatus === "all" ? undefined : selectedApprovalStatus as any,
		date: selectedDate || undefined,
	});

	const attendanceRecords = attendanceData?.attendance || [];

	// Calculate stats
	const stats = useMemo(() => {
		const today = new Date().toISOString().split('T')[0];
		const todayRecords = attendanceRecords.filter(record => record.date === today);
		
		const pendingCount = attendanceRecords.filter(record => record.approvalStatus === "Pending").length;
		const approvedToday = todayRecords.filter(record => record.approvalStatus === "Approved").length;
		const declinedCount = attendanceRecords.filter(record => record.approvalStatus === "Declined").length;
		
		const totalHours = attendanceRecords
			.filter(record => record.hours)
			.reduce((sum, record) => sum + (record.hours || 0), 0);
		const avgHours = attendanceRecords.length > 0 ? totalHours / attendanceRecords.length : 0;

		return {
			pending: pendingCount,
			approvedToday,
			declined: declinedCount,
			avgHours: Math.round(avgHours * 10) / 10,
		};
	}, [attendanceRecords]);

	const handleView = (record: AttendanceRecord) => {
		setSelectedLog(record);
		setIsViewDialogOpen(true);
	};

	const handleExportToExcel = () => {
		try {
			// Prepare data for export
			const exportData = attendanceRecords.map((record, index) => ({
				'#': index + 1,
				'Student ID': getStudentId(record),
				'Student Name': getStudentName(record),
				'Date': formatDate(record.date),
				'Time In': formatTime(record.timeIn),
				'Time Out': formatTime(record.timeOut),
				'Hours Worked': record.hours ? `${record.hours}h` : 'N/A',
				'Status': record.status,
				'Approval Status': record.approvalStatus || 'N/A',
				'Agency': record.practicum?.agency?.name || 'N/A',
				'Agency Address': record.practicum?.agency?.address || 'N/A',
				'Work Setup': record.practicum?.workSetup || 'N/A',
				'Branch Type': record.practicum?.agency?.branchType || 'N/A',
				'Time In Location': record.timeInLocationType || 'N/A',
				'Time Out Location': record.timeOutLocationType || 'N/A',
				'Time In Device': record.timeInDeviceType ? shortenDeviceType(record.timeInDeviceType) : 'N/A',
				'Time Out Device': record.timeOutDeviceType ? shortenDeviceType(record.timeOutDeviceType) : 'N/A',
				'Time In Remarks': record.timeInRemarks || 'N/A',
				'Time Out Remarks': record.timeOutRemarks || 'N/A',
				'Address': record.address || 'N/A',
				'Time In Exact Location': record.timeInExactLocation || 'N/A',
				'Time Out Exact Location': record.timeOutExactLocation || 'N/A',
				'Contact Person': record.practicum?.agency?.contactPerson || 'N/A',
				'Contact Role': record.practicum?.agency?.contactRole || 'N/A',
				'Contact Phone': record.practicum?.agency?.contactPhone || 'N/A',
				'Contact Email': record.practicum?.agency?.contactEmail || 'N/A',
			}));

			// Calculate summary statistics
			const totalRecords = attendanceRecords.length;
			const presentCount = attendanceRecords.filter(record => record.status === 'present').length;
			const lateCount = attendanceRecords.filter(record => record.status === 'late').length;
			const absentCount = attendanceRecords.filter(record => record.status === 'absent').length;
			const excusedCount = attendanceRecords.filter(record => record.status === 'excused').length;
			const pendingCount = attendanceRecords.filter(record => record.approvalStatus === 'Pending').length;
			const approvedCount = attendanceRecords.filter(record => record.approvalStatus === 'Approved').length;
			const declinedCount = attendanceRecords.filter(record => record.approvalStatus === 'Declined').length;
			
			const totalHours = attendanceRecords
				.filter(record => record.hours)
				.reduce((sum, record) => sum + (record.hours || 0), 0);
			const avgHours = totalRecords > 0 ? (totalHours / totalRecords).toFixed(1) : 0;

			// Create summary data
			const summaryData = [
				{ 'Metric': 'Total Records', 'Value': totalRecords },
				{ 'Metric': 'Present', 'Value': presentCount },
				{ 'Metric': 'Late', 'Value': lateCount },
				{ 'Metric': 'Absent', 'Value': absentCount },
				{ 'Metric': 'Excused', 'Value': excusedCount },
				{ 'Metric': 'Pending Approval', 'Value': pendingCount },
				{ 'Metric': 'Approved', 'Value': approvedCount },
				{ 'Metric': 'Declined', 'Value': declinedCount },
				{ 'Metric': 'Total Hours', 'Value': `${totalHours}h` },
				{ 'Metric': 'Average Hours per Record', 'Value': `${avgHours}h` },
				{ 'Metric': 'Export Date', 'Value': new Date().toLocaleDateString() },
				{ 'Metric': 'Export Time', 'Value': new Date().toLocaleTimeString() },
			];

			// Create workbook
			const wb = XLSX.utils.book_new();

			// Create attendance records worksheet
			const recordsWs = XLSX.utils.json_to_sheet(exportData);
			const recordsColWidths = [
				{ wch: 5 },   // #
				{ wch: 15 },  // Student ID
				{ wch: 25 },  // Student Name
				{ wch: 12 },  // Date
				{ wch: 12 },  // Time In
				{ wch: 12 },  // Time Out
				{ wch: 12 },  // Hours Worked
				{ wch: 10 },  // Status
				{ wch: 15 },  // Approval Status
				{ wch: 25 },  // Agency
				{ wch: 30 },  // Agency Address
				{ wch: 12 },  // Work Setup
				{ wch: 12 },  // Branch Type
				{ wch: 15 },  // Time In Location
				{ wch: 15 },  // Time Out Location
				{ wch: 15 },  // Time In Device
				{ wch: 15 },  // Time Out Device
				{ wch: 15 },  // Time In Remarks
				{ wch: 15 },  // Time Out Remarks
				{ wch: 30 },  // Address
				{ wch: 30 },  // Time In Exact Location
				{ wch: 30 },  // Time Out Exact Location
				{ wch: 20 },  // Contact Person
				{ wch: 15 },  // Contact Role
				{ wch: 15 },  // Contact Phone
				{ wch: 25 },  // Contact Email
			];
			recordsWs['!cols'] = recordsColWidths;

			// Create summary worksheet
			const summaryWs = XLSX.utils.json_to_sheet(summaryData);
			const summaryColWidths = [
				{ wch: 30 },  // Metric
				{ wch: 20 },  // Value
			];
			summaryWs['!cols'] = summaryColWidths;

			// Add worksheets to workbook
			XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
			XLSX.utils.book_append_sheet(wb, recordsWs, 'Attendance Records');

			// Generate filename with current date
			const currentDate = new Date().toISOString().split('T')[0];
			const filename = `attendance_export_${currentDate}.xlsx`;

			// Save file
			XLSX.writeFile(wb, filename);

			toast.success(`Exported ${attendanceRecords.length} attendance records to ${filename}`);
		} catch (error) {
			console.error('Export error:', error);
			toast.error('Failed to export attendance data to Excel');
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold text-gray-900">Attendance Review</h1>
				<p className="text-gray-600">
					Review and approve student attendance logs
				</p>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card className="bg-secondary-50 border-yellow-200">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600">Pending Review</p>
								<p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
							</div>
							<Clock className="w-8 h-8 text-yellow-600" />
						</div>
					</CardContent>
				</Card>

				<Card className="bg-secondary-50 border-green-200">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600">Approved Today</p>
								<p className="text-2xl font-bold text-green-600">{stats.approvedToday}</p>
							</div>
							<CheckCircle className="w-8 h-8 text-green-600" />
						</div>
					</CardContent>
				</Card>

				<Card className="bg-secondary-50 border-red-200">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600">Declined</p>
								<p className="text-2xl font-bold text-red-600">{stats.declined}</p>
							</div>
							<XCircle className="w-8 h-8 text-red-600" />
						</div>
					</CardContent>
				</Card>

				<Card className="bg-secondary-50 border-blue-200">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600">Avg. Hours</p>
								<p className="text-2xl font-bold text-blue-600">{stats.avgHours}</p>
							</div>
							<Calendar className="w-8 h-8 text-blue-600" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Filters and Search */}
			<Card>
				<CardHeader>
					<CardTitle>Attendance Logs</CardTitle>
					<CardDescription>
						Review student attendance submissions
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col md:flex-row gap-4 mb-6">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
							<Input
								placeholder="Search by student name or ID..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10"
							/>
						</div>
						<Select value={selectedStatus} onValueChange={setSelectedStatus}>
							<SelectTrigger className="w-full md:w-40">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Status</SelectItem>
								<SelectItem value="present">Present</SelectItem>
								<SelectItem value="absent">Absent</SelectItem>
								<SelectItem value="late">Late</SelectItem>
								<SelectItem value="excused">Excused</SelectItem>
							</SelectContent>
						</Select>
						<Select value={selectedApprovalStatus} onValueChange={setSelectedApprovalStatus}>
							<SelectTrigger className="w-full md:w-40">
								<SelectValue placeholder="Approval" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Approval</SelectItem>
								<SelectItem value="Pending">Pending</SelectItem>
								<SelectItem value="Approved">Approved</SelectItem>
								<SelectItem value="Declined">Declined</SelectItem>
							</SelectContent>
						</Select>
						<Input
							type="date"
							value={selectedDate}
							onChange={(e) => setSelectedDate(e.target.value)}
							className="w-full md:w-40"
						/>
						<Button 
							variant="outline"
							onClick={handleExportToExcel}
							disabled={isLoading || attendanceRecords.length === 0}
						>
							<Download className="w-4 h-4 mr-2" />
							Export to Excel
						</Button>
					</div>

					{/* Attendance Table */}
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Student</TableHead>
									<TableHead>Date</TableHead>
									<TableHead>Time In</TableHead>
									<TableHead>Time Out</TableHead>
									<TableHead>Agency</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{isLoading ? (
									<TableRow>
										<TableCell colSpan={7} className="text-center py-8">
											<div className="flex items-center justify-center">
												<Clock className="w-4 h-4 animate-spin mr-2" />
												Loading attendance records...
											</div>
										</TableCell>
									</TableRow>
								) : error ? (
									<TableRow>
										<TableCell colSpan={7} className="text-center py-8">
											<p className="text-red-500">Error loading attendance records</p>
										</TableCell>
									</TableRow>
								) : attendanceRecords.length === 0 ? (
									<TableRow>
										<TableCell colSpan={7} className="text-center py-8">
											<p className="text-gray-500">
												No attendance records found matching your criteria.
											</p>
										</TableCell>
									</TableRow>
								) : (
									attendanceRecords.map((record) => (
										<TableRow key={record.id}>
											<TableCell>
												<div>
													<div className="font-medium text-gray-900">
														{getStudentName(record)}
													</div>
													<div className="text-sm text-gray-600">
														{getStudentId(record)}
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div className="text-sm">{formatDate(record.date)}</div>
											</TableCell>
											<TableCell>
												<div className="space-y-1">
													<div className="text-sm font-medium">
														{formatTime(record.timeIn)}
													</div>
													<div className="flex items-center gap-1 text-xs text-gray-500">
														{record.timeInLocationType && (
															<Badge
																variant={
																	record.timeInLocationType === "Inside"
																		? "default"
																		: record.timeInLocationType === "In-field"
																		? "secondary"
																		: "destructive"
																}
																className={
																	record.timeInLocationType === "Inside"
																		? "bg-green-100 text-green-800 text-xs px-1 py-0"
																		: record.timeInLocationType === "In-field"
																		? "bg-blue-100 text-blue-800 text-xs px-1 py-0"
																		: "bg-red-100 text-red-800 text-xs px-1 py-0"
																}
															>
																{record.timeInLocationType}
															</Badge>
														)}
														{record.timeInDeviceType && (
															<span>
																{shortenDeviceType(record.timeInDeviceType)}
															</span>
														)}
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div className="space-y-1">
													<div className="text-sm font-medium">
														{formatTime(record.timeOut)}
													</div>
													<div className="flex items-center gap-1 text-xs text-gray-500">
														{record.timeOutLocationType && (
															<Badge
																variant={
																	record.timeOutLocationType === "Inside"
																		? "default"
																		: record.timeOutLocationType === "In-field"
																		? "secondary"
																		: "destructive"
																}
																className={
																	record.timeOutLocationType === "Inside"
																		? "bg-green-100 text-green-800 text-xs px-1 py-0"
																		: record.timeOutLocationType === "In-field"
																		? "bg-blue-100 text-blue-800 text-xs px-1 py-0"
																		: "bg-red-100 text-red-800 text-xs px-1 py-0"
																}
															>
																{record.timeOutLocationType}
															</Badge>
														)}
														{record.timeOutDeviceType && (
															<span>
																{shortenDeviceType(record.timeOutDeviceType)}
															</span>
														)}
														{record.hours && (
															<span className="text-blue-600 font-medium">
																{record.hours}h
															</span>
														)}
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div className="space-y-1">
													<div className="text-sm font-medium text-gray-900">
														{record.practicum?.agency?.name || "N/A"}
													</div>
													{record.practicum?.agency?.address && (
														<div className="text-xs text-gray-500">
															{record.practicum.agency.address}
														</div>
													)}
													<div className="flex items-center gap-1">
														{record.practicum?.workSetup && (
															<Badge
																variant={
																	record.practicum.workSetup === "On-site"
																		? "default"
																		: record.practicum.workSetup === "Hybrid"
																		? "secondary"
																		: "destructive"
																}
																className={
																	record.practicum.workSetup === "On-site"
																		? "bg-green-100 text-green-800 text-xs px-1 py-0"
																		: record.practicum.workSetup === "Hybrid"
																		? "bg-blue-100 text-blue-800 text-xs px-1 py-0"
																		: "bg-orange-100 text-orange-800 text-xs px-1 py-0"
																}
															>
																{record.practicum.workSetup}
															</Badge>
														)}
														{record.practicum?.agency?.branchType && (
															<Badge
																variant={
																	record.practicum.agency.branchType === "Main"
																		? "default"
																		: "secondary"
																}
																className={
																	record.practicum.agency.branchType === "Main"
																		? "bg-purple-100 text-purple-800 text-xs px-1 py-0"
																		: "bg-gray-100 text-gray-800 text-xs px-1 py-0"
																}
															>
																{record.practicum.agency.branchType}
															</Badge>
														)}
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex flex-col gap-1">
													<Badge
														variant={
															record.status === "present"
																? "default"
																: record.status === "late"
																? "secondary"
																: record.status === "absent"
																? "destructive"
																: "outline"
														}
														className={
															record.status === "present"
																? "bg-green-100 text-green-800"
																: record.status === "late"
																? "bg-yellow-100 text-yellow-800"
																: record.status === "absent"
																? "bg-red-100 text-red-800"
																: "bg-gray-100 text-gray-800"
														}
													>
														{record.status}
													</Badge>
													{record.approvalStatus && (
														<Badge
															variant={
																record.approvalStatus === "Approved"
																	? "default"
																	: record.approvalStatus === "Pending"
																	? "secondary"
																	: "destructive"
															}
															className={
																record.approvalStatus === "Approved"
																	? "bg-green-100 text-green-800"
																	: record.approvalStatus === "Pending"
																	? "bg-yellow-100 text-yellow-800"
																	: "bg-red-100 text-red-800"
															}
														>
															{record.approvalStatus}
														</Badge>
													)}
												</div>
											</TableCell>
											<TableCell className="text-right">
												<div className="flex gap-2 justify-end">
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleView(record)}
													>
														<Eye className="w-4 h-4" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>

			{/* View Details Dialog */}
			<Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
				<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Attendance Details</DialogTitle>
						<DialogDescription>
							Complete information for {selectedLog ? getStudentName(selectedLog) : "Student"}
						</DialogDescription>
					</DialogHeader>

					{selectedLog && (
						<div className="space-y-6">
							{/* Student Information */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<Card>
									<CardHeader>
										<CardTitle className="text-lg">
											Student Information
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-3">
										<div className="flex items-center gap-2">
											<span className="font-medium">Name:</span>
											<span>{getStudentName(selectedLog)}</span>
										</div>
										<div className="flex items-center gap-2">
											<span className="font-medium">Student ID:</span>
											<span>{getStudentId(selectedLog)}</span>
										</div>
										<div className="flex items-center gap-2">
											<span className="font-medium">Agency:</span>
											<span>{selectedLog.practicum?.agency?.name || "N/A"}</span>
										</div>
										<div className="flex items-center gap-2">
											<span className="font-medium">Date:</span>
											<span>{formatDate(selectedLog.date)}</span>
										</div>
										<div className="flex items-center gap-2">
											<span className="font-medium">Status:</span>
											<Badge
												variant={
													selectedLog.status === "present"
														? "default"
														: selectedLog.status === "late"
														? "secondary"
														: selectedLog.status === "absent"
														? "destructive"
														: "outline"
												}
												className={
													selectedLog.status === "present"
														? "bg-green-100 text-green-800"
														: selectedLog.status === "late"
														? "bg-yellow-100 text-yellow-800"
														: selectedLog.status === "absent"
														? "bg-red-100 text-red-800"
														: "bg-gray-100 text-gray-800"
												}
											>
												{selectedLog.status}
											</Badge>
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle className="text-lg flex items-center gap-2">
											<MapPin className="w-5 h-5" />
											Agency Information
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-3">
										<div className="space-y-1">
											<span className="font-medium">Address:</span>
											<div className="text-sm text-gray-600 break-words max-w-md">
												{selectedLog.practicum?.agency?.address || "N/A"}
											</div>
										</div>
										{selectedLog.practicum?.workSetup && (
											<div className="flex items-center gap-2">
												<span className="font-medium">Work Setup:</span>
												<Badge
													variant={
														selectedLog.practicum.workSetup === "On-site"
															? "default"
															: selectedLog.practicum.workSetup === "Hybrid"
															? "secondary"
															: "destructive"
													}
													className={
														selectedLog.practicum.workSetup === "On-site"
															? "bg-green-100 text-green-800"
															: selectedLog.practicum.workSetup === "Hybrid"
															? "bg-blue-100 text-blue-800"
															: "bg-orange-100 text-orange-800"
													}
												>
													{selectedLog.practicum.workSetup}
												</Badge>
											</div>
										)}
										{selectedLog.practicum?.agency?.branchType && (
											<div className="flex items-center gap-2">
												<span className="font-medium">Type:</span>
												<Badge
													variant={
														selectedLog.practicum.agency.branchType === "Main"
															? "default"
															: "secondary"
													}
													className={
														selectedLog.practicum.agency.branchType === "Main"
															? "bg-purple-100 text-purple-800"
															: "bg-gray-100 text-gray-800"
													}
												>
													{selectedLog.practicum.agency.branchType}
												</Badge>
											</div>
										)}
										{(selectedLog.practicum?.agency?.openingTime || selectedLog.practicum?.agency?.closingTime) && (
											<div className="flex items-center gap-2">
												<span className="font-medium">Hours:</span>
												<span>
													{selectedLog.practicum.agency.openingTime || "N/A"} - {selectedLog.practicum.agency.closingTime || "N/A"}
												</span>
											</div>
										)}
										{selectedLog.practicum?.agency?.contactPerson && (
											<div className="flex items-center gap-2">
												<span className="font-medium">Contact:</span>
												<span className="text-sm">
													{selectedLog.practicum.agency.contactPerson}
												</span>
											</div>
										)}
										{selectedLog.practicum?.agency?.contactRole && (
											<div className="flex items-center gap-2">
												<span className="font-medium">Role:</span>
												<span className="text-sm">{selectedLog.practicum.agency.contactRole}</span>
											</div>
										)}
										{selectedLog.practicum?.agency?.contactPhone && (
											<div className="flex items-center gap-2">
												<span className="font-medium">Phone:</span>
												<span className="text-sm font-mono">
													{selectedLog.practicum.agency.contactPhone}
												</span>
											</div>
										)}
										{selectedLog.practicum?.agency?.contactEmail && (
											<div className="flex items-center gap-2">
												<span className="font-medium">Email:</span>
												<span className="text-sm font-mono">
													{selectedLog.practicum.agency.contactEmail}
												</span>
											</div>
										)}
									</CardContent>
								</Card>
							</div>

							{/* Time In Details */}
							<Card>
								<CardHeader>
									<CardTitle className="text-lg flex items-center gap-2">
										<Clock3 className="w-5 h-5" />
										Time In Details
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-3">
											<div className="flex items-center gap-2">
												<span className="font-medium">Time:</span>
												<span className="text-lg font-semibold">
													{formatTime(selectedLog.timeIn)}
												</span>
											</div>
											{selectedLog.timeInLocationType && (
												<div className="flex items-center gap-2">
													<span className="font-medium">Location Type:</span>
													<Badge
														variant={
															selectedLog.timeInLocationType === "Inside"
																? "default"
																: selectedLog.timeInLocationType === "In-field"
																? "secondary"
																: "destructive"
														}
														className={
															selectedLog.timeInLocationType === "Inside"
																? "bg-green-100 text-green-800"
																: selectedLog.timeInLocationType === "In-field"
																? "bg-blue-100 text-blue-800"
																: "bg-red-100 text-red-800"
														}
													>
														{selectedLog.timeInLocationType}
													</Badge>
												</div>
											)}
											{selectedLog.timeInDeviceType && (
												<div className="flex items-center gap-2">
													<span className="font-medium">Device Type:</span>
													<span>{shortenDeviceType(selectedLog.timeInDeviceType)}</span>
												</div>
											)}
											{selectedLog.timeInDeviceUnit && (
												<div className="space-y-1">
													<span className="font-medium">Device Unit:</span>
													<div className="text-sm text-gray-600 break-all max-w-xs font-mono">
														{selectedLog.timeInDeviceUnit}
													</div>
												</div>
											)}
											{selectedLog.timeInMacAddress && (
												<div className="flex items-center gap-2">
													<span className="font-medium">MAC Address:</span>
													<span className="font-mono text-sm">
														{selectedLog.timeInMacAddress}
													</span>
												</div>
											)}
											{selectedLog.timeInRemarks && (
												<div className="flex items-center gap-2">
													<span className="font-medium">Remarks:</span>
													<Badge
														variant={
															selectedLog.timeInRemarks === "Normal"
																? "default"
																: selectedLog.timeInRemarks === "Late"
																? "secondary"
																: "destructive"
														}
														className={
															selectedLog.timeInRemarks === "Normal"
																? "bg-green-100 text-green-800"
																: selectedLog.timeInRemarks === "Late"
																? "bg-yellow-100 text-yellow-800"
																: "bg-red-100 text-red-800"
														}
													>
														{selectedLog.timeInRemarks}
													</Badge>
												</div>
											)}
										</div>
										<div className="space-y-3">
											{selectedLog.address && (
												<div className="space-y-1">
													<span className="font-medium">Address:</span>
													<div className="text-sm text-gray-600 break-words max-w-md">
														{selectedLog.address}
													</div>
												</div>
											)}
											{selectedLog.timeInExactLocation && (
												<div className="space-y-1">
													<span className="font-medium">Exact Location:</span>
													<div className="text-sm text-gray-600 break-words max-w-md">
														{selectedLog.timeInExactLocation}
													</div>
												</div>
											)}
											{selectedLog.photoIn && (
												<div className="space-y-2">
													<span className="font-medium">Time In Photo:</span>
													<div className="flex justify-center">
														<div className="relative">
															<img
																src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}${selectedLog.photoIn}`}
																alt="Time In Photo"
																className="w-48 h-48 object-cover rounded-lg border shadow-sm"
																onError={(e) => {
																	const target = e.target as HTMLImageElement;
																	target.style.display = 'none';
																	const fallback = target.nextElementSibling as HTMLElement;
																	if (fallback) fallback.style.display = 'flex';
																}}
															/>
															<div className="w-48 h-48 bg-gray-100 rounded-lg border flex items-center justify-center text-gray-500 font-medium" style={{display: 'none'}}>
																Photo unavailable
															</div>
														</div>
													</div>
												</div>
											)}
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Time Out Details */}
							<Card>
								<CardHeader>
									<CardTitle className="text-lg flex items-center gap-2">
										<Clock3 className="w-5 h-5" />
										Time Out Details
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-3">
											<div className="flex items-center gap-2">
												<span className="font-medium">Time:</span>
												<span className="text-lg font-semibold">
													{formatTime(selectedLog.timeOut)}
												</span>
											</div>
											{selectedLog.timeOutLocationType && (
												<div className="flex items-center gap-2">
													<span className="font-medium">Location Type:</span>
													<Badge
														variant={
															selectedLog.timeOutLocationType === "Inside"
																? "default"
																: selectedLog.timeOutLocationType === "In-field"
																? "secondary"
																: "destructive"
														}
														className={
															selectedLog.timeOutLocationType === "Inside"
																? "bg-green-100 text-green-800"
																: selectedLog.timeOutLocationType === "In-field"
																? "bg-blue-100 text-blue-800"
																: "bg-red-100 text-red-800"
														}
													>
														{selectedLog.timeOutLocationType}
													</Badge>
												</div>
											)}
											{selectedLog.timeOutDeviceType && (
												<div className="flex items-center gap-2">
													<span className="font-medium">Device Type:</span>
													<span>{shortenDeviceType(selectedLog.timeOutDeviceType)}</span>
												</div>
											)}
											{selectedLog.timeOutDeviceUnit && (
												<div className="space-y-1">
													<span className="font-medium">Device Unit:</span>
													<div className="text-sm text-gray-600 break-all max-w-xs font-mono">
														{selectedLog.timeOutDeviceUnit}
													</div>
												</div>
											)}
											{selectedLog.timeOutMacAddress && (
												<div className="flex items-center gap-2">
													<span className="font-medium">MAC Address:</span>
													<span className="font-mono text-sm">
														{selectedLog.timeOutMacAddress}
													</span>
												</div>
											)}
											{selectedLog.timeOutRemarks && (
												<div className="flex items-center gap-2">
													<span className="font-medium">Remarks:</span>
													<Badge
														variant={
															selectedLog.timeOutRemarks === "Normal"
																? "default"
																: selectedLog.timeOutRemarks === "Early Departure"
																? "destructive"
																: "secondary"
														}
														className={
															selectedLog.timeOutRemarks === "Normal"
																? "bg-green-100 text-green-800"
																: selectedLog.timeOutRemarks === "Early Departure"
																? "bg-red-100 text-red-800"
																: "bg-yellow-100 text-yellow-800"
														}
													>
														{selectedLog.timeOutRemarks}
													</Badge>
												</div>
											)}
											{selectedLog.hours && (
												<div className="flex items-center gap-2">
													<span className="font-medium">Hours Worked:</span>
													<span className="font-semibold text-blue-600">
														{selectedLog.hours}h
													</span>
												</div>
											)}
										</div>
										<div className="space-y-3">
											{selectedLog.address && (
												<div className="space-y-1">
													<span className="font-medium">Address:</span>
													<div className="text-sm text-gray-600 break-words max-w-md">
														{selectedLog.address}
													</div>
												</div>
											)}
											{selectedLog.timeOutExactLocation && (
												<div className="space-y-1">
													<span className="font-medium">Exact Location:</span>
													<div className="text-sm text-gray-600 break-words max-w-md">
														{selectedLog.timeOutExactLocation}
													</div>
												</div>
											)}
											{selectedLog.photoOut && (
												<div className="space-y-2">
													<span className="font-medium">Time Out Photo:</span>
													<div className="flex justify-center">
														<div className="relative">
															<img
																src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}${selectedLog.photoOut}`}
																alt="Time Out Photo"
																className="w-48 h-48 object-cover rounded-lg border shadow-sm"
																onError={(e) => {
																	const target = e.target as HTMLImageElement;
																	target.style.display = 'none';
																	const fallback = target.nextElementSibling as HTMLElement;
																	if (fallback) fallback.style.display = 'flex';
																}}
															/>
															<div className="w-48 h-48 bg-gray-100 rounded-lg border flex items-center justify-center text-gray-500 font-medium" style={{display: 'none'}}>
																Photo unavailable
															</div>
														</div>
													</div>
												</div>
											)}
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
