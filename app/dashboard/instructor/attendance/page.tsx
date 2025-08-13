"use client";

import { useState } from "react";
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
} from "lucide-react";

// Mock data for attendance logs
const attendanceLogs = [
	{
		id: 1,
		studentId: "2021-00001",
		studentName: "Juan Dela Cruz",
		date: "2024-01-15",
		timeIn: "08:00 AM",
		timeOut: "05:00 PM",
		agency: "OMSC IT Department",
		status: "Pending",
		photoIn: "/placeholder.svg?height=40&width=40",
		photoOut: "/placeholder.svg?height=40&width=40",
		location: "OMSC Campus",
		timeInLocationType: "Inside",
		timeInDeviceType: "Mobile",
		timeInDeviceUnit: "vivo V2322",
		timeInMacAddress: "WA-1ac9d207f325170",
		timeInRemarks: "Late",
		timeInExactLocation: "OMSC IT Department Building, Room 201, 2nd Floor",
		timeOutLocationType: "Inside",
		timeOutDeviceType: "Mobile",
		timeOutDeviceUnit: "vivo V2322",
		timeOutMacAddress: "WA-1ac9d207f325170",
		timeOutRemarks: "Normal",
		timeOutExactLocation: "OMSC IT Department Building, Room 201, 2nd Floor",
		// Agency Information
		agencyLocation:
			"OMSC Campus, Poblacion, San Jose, Occidental Mindoro, Philippines",
		workSetup: "On-site",
		branchType: "Main",
		openingTime: "08:00 AM",
		closingTime: "05:00 PM",
		contactPerson: "Engr. Maria Santos",
		contactRole: "IT Department Head",
		contactPhone: "+63 917 123 4567",
		contactEmail: "maria.santos@omsc.edu.ph",
	},
	{
		id: 2,
		studentId: "2021-00002",
		studentName: "Maria Santos",
		date: "2024-01-15",
		timeIn: "08:15 AM",
		timeOut: "05:30 PM",
		agency: "Municipal IT Office",
		status: "Approved",
		photoIn: "/placeholder.svg?height=40&width=40",
		photoOut: "/placeholder.svg?height=40&width=40",
		location: "Municipal Hall",
		timeInLocationType: "In-field",
		timeInDeviceType: "Mobile",
		timeInDeviceUnit: "TECNO TECNO KI5k",
		timeInMacAddress: "WA-cb427233a4a20bb",
		timeInRemarks: "Late",
		timeInExactLocation:
			"Municipal IT Office, 3rd Floor, Municipal Hall Building",
		timeOutLocationType: "In-field",
		timeOutDeviceType: "Mobile",
		timeOutDeviceUnit: "Infinix Infinix X6852",
		timeOutMacAddress: "WA-519f9236930edbb",
		timeOutRemarks: "Normal",
		timeOutExactLocation:
			"Municipal IT Office, 3rd Floor, Municipal Hall Building",
		// Agency Information
		agencyLocation:
			"Municipal Hall, Poblacion, San Jose, Occidental Mindoro, Philippines",
		workSetup: "Hybrid",
		branchType: "Branch",
		openingTime: "08:00 AM",
		closingTime: "05:00 PM",
		contactPerson: "Atty. Pedro Rodriguez",
		contactRole: "Municipal Administrator",
		contactPhone: "+63 918 234 5678",
		contactEmail: "pedro.rodriguez@sanjose.gov.ph",
	},
	{
		id: 3,
		studentId: "2021-00003",
		studentName: "Pedro Rodriguez",
		date: "2024-01-15",
		timeIn: "08:30 AM",
		timeOut: "04:45 PM",
		agency: "Provincial Capitol",
		status: "Pending",
		photoIn: "/placeholder.svg?height=40&width=40",
		photoOut: "/placeholder.svg?height=40&width=40",
		location: "Capitol Building",
		timeInLocationType: "In-field",
		timeInDeviceType: "Mobile",
		timeInDeviceUnit: "Infinix Infinix X6852",
		timeInMacAddress: "WA-519f9236930edbb",
		timeInRemarks: "Late",
		timeInExactLocation:
			"Provincial IT Department, 2nd Floor, Capitol Building",
		timeOutLocationType: "Outside",
		timeOutDeviceType: "Mobile",
		timeOutDeviceUnit: "Infinix Infinix X6852",
		timeOutMacAddress: "WA-519f9236930edbb",
		timeOutRemarks: "Early Departure",
		timeOutExactLocation: "Capitol Grounds, Parking Area A",
		// Agency Information
		agencyLocation:
			"Provincial Capitol, Poblacion, Mamburao, Occidental Mindoro, Philippines",
		workSetup: "On-site",
		branchType: "Main",
		openingTime: "08:00 AM",
		closingTime: "05:00 PM",
		contactPerson: "Gov. Ana Garcia",
		contactRole: "Provincial Governor",
		contactPhone: "+63 919 345 6789",
		contactEmail: "ana.garcia@occidentalmindoro.gov.ph",
	},
	{
		id: 4,
		studentId: "2021-00004",
		studentName: "Ana Garcia",
		date: "2024-01-14",
		timeIn: "07:45 AM",
		timeOut: "05:15 PM",
		agency: "OMSC Registrar",
		status: "Declined",
		photoIn: "/placeholder.svg?height=40&width=40",
		photoOut: "/placeholder.svg?height=40&width=40",
		location: "OMSC Campus",
		timeInLocationType: "Inside",
		timeInDeviceType: "Mobile",
		timeInDeviceUnit: "Infinix Infinix X6528",
		timeInMacAddress: "WA-e0bfd640967d14e",
		timeInRemarks: "Normal",
		timeInExactLocation: "OMSC Registrar Office, Ground Floor, Admin Building",
		timeOutLocationType: "Outside",
		timeOutDeviceType: "Mobile",
		timeOutDeviceUnit: "Infinix Infinix X6528",
		timeOutMacAddress: "WA-e0bfd640967d14e",
		timeOutRemarks: "Normal",
		timeOutExactLocation: "OMSC Campus, Student Parking Lot B",
		// Agency Information
		agencyLocation:
			"OMSC Campus, Poblacion, Mamburao, Occidental Mindoro, Philippines",
		workSetup: "Work From Home",
		branchType: "Main",
		openingTime: "07:30 AM",
		closingTime: "05:30 PM",
		contactPerson: "Prof. Juan Dela Cruz",
		contactRole: "Registrar",
		contactPhone: "+63 920 456 7890",
		contactEmail: "juan.delacruz@omsc.edu.ph",
	},
];

export default function AttendancePage() {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedStatus, setSelectedStatus] = useState("all");
	const [selectedDate, setSelectedDate] = useState("");
	const [selectedLog, setSelectedLog] = useState<any>(null);
	const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

	const filteredLogs = attendanceLogs.filter((log) => {
		const matchesSearch =
			log.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			log.studentId.includes(searchTerm);
		const matchesStatus =
			selectedStatus === "all" || log.status.toLowerCase() === selectedStatus;
		const matchesDate = !selectedDate || log.date === selectedDate;

		return matchesSearch && matchesStatus && matchesDate;
	});

	const handleView = (log: any) => {
		setSelectedLog(log);
		setIsViewDialogOpen(true);
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
								<p className="text-2xl font-bold text-yellow-600">12</p>
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
								<p className="text-2xl font-bold text-green-600">28</p>
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
								<p className="text-2xl font-bold text-red-600">3</p>
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
								<p className="text-2xl font-bold text-blue-600">8.5</p>
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
								<SelectItem value="pending">Pending</SelectItem>
								<SelectItem value="approved">Approved</SelectItem>
								<SelectItem value="declined">Declined</SelectItem>
							</SelectContent>
						</Select>
						<Input
							type="date"
							value={selectedDate}
							onChange={(e) => setSelectedDate(e.target.value)}
							className="w-full md:w-40"
						/>
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
									<TableHead>Remarks</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredLogs.map((log) => (
									<TableRow key={log.id}>
										<TableCell>
											<div>
												<div className="font-medium text-gray-900">
													{log.studentName}
												</div>
												<div className="text-sm text-gray-600">
													{log.studentId}
												</div>
											</div>
										</TableCell>
										<TableCell>
											<div className="text-sm">{log.date}</div>
										</TableCell>
										<TableCell>
											<div className="flex flex-col gap-1">
												<div className="text-sm font-medium">{log.timeIn}</div>
												<div className="flex items-center gap-2">
													<Badge
														variant={
															log.timeInLocationType === "Inside"
																? "default"
																: log.timeInLocationType === "In-field"
																? "secondary"
																: "destructive"
														}
														className={
															log.timeInLocationType === "Inside"
																? "bg-green-100 text-green-800"
																: log.timeInLocationType === "In-field"
																? "bg-blue-100 text-blue-800"
																: "bg-red-100 text-red-800"
														}
													>
														{log.timeInLocationType}
													</Badge>
												</div>
												<div className="text-xs text-gray-500">
													{log.timeInDeviceType} — {log.timeInDeviceUnit}
												</div>
												<div className="text-xs text-gray-500">
													{log.location}
												</div>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex flex-col gap-1">
												<div className="text-sm font-medium">{log.timeOut}</div>
												<div className="flex items-center gap-2">
													<Badge
														variant={
															log.timeOutLocationType === "Inside"
																? "default"
																: log.timeOutLocationType === "In-field"
																? "secondary"
																: "destructive"
														}
														className={
															log.timeOutLocationType === "Inside"
																? "bg-green-100 text-green-800"
																: log.timeOutLocationType === "In-field"
																? "bg-blue-100 text-blue-800"
																: "bg-red-100 text-red-800"
														}
													>
														{log.timeOutLocationType}
													</Badge>
												</div>
												<div className="text-xs text-gray-500">
													{log.timeOutDeviceType} — {log.timeOutDeviceUnit}
												</div>
												<div className="text-xs text-gray-500">
													{log.location}
												</div>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex flex-col gap-1">
												<div className="flex items-center gap-2">
													<Badge
														variant={
															log.timeInRemarks === "Normal"
																? "default"
																: log.timeInRemarks === "Late"
																? "secondary"
																: "destructive"
														}
														className={
															log.timeInRemarks === "Normal"
																? "bg-green-100 text-green-800"
																: log.timeInRemarks === "Late"
																? "bg-yellow-100 text-yellow-800"
																: "bg-red-100 text-red-800"
														}
													>
														{log.timeInRemarks}
													</Badge>
												</div>
												<div className="flex items-center gap-2">
													<Badge
														variant={
															log.timeOutRemarks === "Normal"
																? "default"
																: log.timeOutRemarks === "Early Departure"
																? "destructive"
																: "default"
														}
														className={
															log.timeOutRemarks === "Normal"
																? "bg-green-100 text-green-800"
																: log.timeOutRemarks === "Early Departure"
																? "bg-red-100 text-red-800"
																: "bg-green-100 text-green-800"
														}
													>
														{log.timeOutRemarks}
													</Badge>
												</div>
											</div>
										</TableCell>
										<TableCell className="text-right">
											<div className="flex gap-2 justify-end">
												<Button
													variant="outline"
													size="sm"
													onClick={() => handleView(log)}
												>
													<Eye className="w-4 h-4" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>

					{filteredLogs.length === 0 && (
						<div className="text-center py-8">
							<p className="text-gray-500">
								No attendance logs found matching your criteria.
							</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* View Details Dialog */}
			<Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
				<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Attendance Details</DialogTitle>
						<DialogDescription>
							Complete information for {selectedLog?.studentName}
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
											<span>{selectedLog.studentName}</span>
										</div>
										<div className="flex items-center gap-2">
											<span className="font-medium">Student ID:</span>
											<span>{selectedLog.studentId}</span>
										</div>
										<div className="flex items-center gap-2">
											<span className="font-medium">Agency:</span>
											<span>{selectedLog.agency}</span>
										</div>
										<div className="flex items-center gap-2">
											<span className="font-medium">Date:</span>
											<span>{selectedLog.date}</span>
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
										<div className="flex items-center gap-2">
											<span className="font-medium">Location:</span>
											<span className="text-sm">
												{selectedLog.agencyLocation}
											</span>
										</div>
										<div className="flex items-center gap-2">
											<span className="font-medium">Work Setup:</span>
											<Badge
												variant={
													selectedLog.workSetup === "On-site"
														? "default"
														: selectedLog.workSetup === "Hybrid"
														? "secondary"
														: "destructive"
												}
												className={
													selectedLog.workSetup === "On-site"
														? "bg-green-100 text-green-800"
														: selectedLog.workSetup === "Hybrid"
														? "bg-blue-100 text-blue-800"
														: "bg-orange-100 text-orange-800"
												}
											>
												{selectedLog.workSetup}
											</Badge>
										</div>
										<div className="flex items-center gap-2">
											<span className="font-medium">Type:</span>
											<Badge
												variant={
													selectedLog.branchType === "Main"
														? "default"
														: "secondary"
												}
												className={
													selectedLog.branchType === "Main"
														? "bg-purple-100 text-purple-800"
														: "bg-gray-100 text-gray-800"
												}
											>
												{selectedLog.branchType}
											</Badge>
										</div>
										<div className="flex items-center gap-2">
											<span className="font-medium">Hours:</span>
											<span>
												{selectedLog.openingTime} - {selectedLog.closingTime}
											</span>
										</div>
										<div className="flex items-center gap-2">
											<span className="font-medium">Contact:</span>
											<span className="text-sm">
												{selectedLog.contactPerson}
											</span>
										</div>
										<div className="flex items-center gap-2">
											<span className="font-medium">Role:</span>
											<span className="text-sm">{selectedLog.contactRole}</span>
										</div>
										<div className="flex items-center gap-2">
											<span className="font-medium">Phone:</span>
											<span className="text-sm font-mono">
												{selectedLog.contactPhone}
											</span>
										</div>
										<div className="flex items-center gap-2">
											<span className="font-medium">Email:</span>
											<span className="text-sm font-mono">
												{selectedLog.contactEmail}
											</span>
										</div>
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
													{selectedLog.timeIn}
												</span>
											</div>
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
											<div className="flex items-center gap-2">
												<span className="font-medium">Device Type:</span>
												<span>{selectedLog.timeInDeviceType}</span>
											</div>
											<div className="flex items-center gap-2">
												<span className="font-medium">Device Unit:</span>
												<span>{selectedLog.timeInDeviceUnit}</span>
											</div>
											<div className="flex items-center gap-2">
												<span className="font-medium">MAC Address:</span>
												<span className="font-mono text-sm">
													{selectedLog.timeInMacAddress}
												</span>
											</div>
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
										</div>
										<div className="space-y-3">
											<div className="flex items-center gap-2">
												<span className="font-medium">General Location:</span>
												<span>{selectedLog.location}</span>
											</div>
											<div className="flex items-center gap-2">
												<span className="font-medium">Exact Location:</span>
												<span className="text-sm font-medium">
													{selectedLog.timeInExactLocation}
												</span>
											</div>
											<div className="space-y-2">
												<span className="font-medium">Photo:</span>
												<div className="flex justify-center">
													<Avatar className="w-32 h-32">
														<AvatarImage
															src={selectedLog.photoIn || "/placeholder.svg"}
															alt="Time In Photo"
														/>
														<AvatarFallback className="text-lg">
															IN
														</AvatarFallback>
													</Avatar>
												</div>
											</div>
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
													{selectedLog.timeOut}
												</span>
											</div>
											<div className="flex items-center gap-2">
												<span className="font-medium">Location Type:</span>
												<Badge
													variant={
														selectedLog.timeOutLocationType === "Inside"
															? "default"
															: selectedLog.timeOutLocationType === "In-field"
															? "secondary"
															: selectedLog.timeOutLocationType === "Outside"
															? "destructive"
															: "default"
													}
													className={
														selectedLog.timeOutLocationType === "Inside"
															? "bg-green-100 text-green-800"
															: selectedLog.timeOutLocationType === "In-field"
															? "bg-blue-100 text-blue-800"
															: selectedLog.timeOutLocationType === "Outside"
															? "bg-red-100 text-red-800"
															: "bg-green-100 text-green-800"
													}
												>
													{selectedLog.timeOutLocationType}
												</Badge>
											</div>
											<div className="flex items-center gap-2">
												<span className="font-medium">Device Type:</span>
												<span>{selectedLog.timeOutDeviceType}</span>
											</div>
											<div className="flex items-center gap-2">
												<span className="font-medium">Device Unit:</span>
												<span>{selectedLog.timeOutDeviceUnit}</span>
											</div>
											<div className="flex items-center gap-2">
												<span className="font-medium">MAC Address:</span>
												<span className="font-mono text-sm">
													{selectedLog.timeOutMacAddress}
												</span>
											</div>
											<div className="flex items-center gap-2">
												<span className="font-medium">Remarks:</span>
												<Badge
													variant={
														selectedLog.timeOutRemarks === "Normal"
															? "default"
															: selectedLog.timeOutRemarks === "Early Departure"
															? "destructive"
															: "default"
													}
													className={
														selectedLog.timeOutRemarks === "Normal"
															? "bg-green-100 text-green-800"
															: selectedLog.timeOutRemarks === "Early Departure"
															? "bg-red-100 text-red-800"
															: "bg-green-100 text-green-800"
													}
												>
													{selectedLog.timeOutRemarks}
												</Badge>
											</div>
										</div>
										<div className="space-y-3">
											<div className="flex items-center gap-2">
												<span className="font-medium">General Location:</span>
												<span>{selectedLog.location}</span>
											</div>
											<div className="flex items-center gap-2">
												<span className="font-medium">Exact Location:</span>
												<span className="text-sm font-medium">
													{selectedLog.timeOutExactLocation}
												</span>
											</div>
											<div className="space-y-2">
												<span className="font-medium">Photo:</span>
												<div className="flex justify-center">
													<Avatar className="w-32 h-32">
														<AvatarImage
															src={selectedLog.photoOut || "/placeholder.svg"}
															alt="Time Out Photo"
														/>
														<AvatarFallback className="text-lg">
															OUT
														</AvatarFallback>
													</Avatar>
												</div>
											</div>
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
