export interface AttendanceRecord {
	id: string;
	studentId: string;
	date: string;
	day: string;
	timeIn?: string;
	timeOut?: string;
	hours?: number;
	status: "present" | "absent" | "late" | "excused";
	location?: {
		latitude: number;
		longitude: number;
		address?: string;
	};
	selfieImage?: string;
	remarks?: string;
	createdAt: string;
}

export interface DetailedAttendanceLog {
	id: number;
	studentId: string;
	studentName: string;
	date: string;
	timeIn: string;
	timeOut: string;
	agency: string;
	status: "Pending" | "Approved" | "Declined";
	photoIn: string;
	photoOut: string;
	location: string;
	timeInLocationType: "Inside" | "In-field" | "Outside";
	timeInDeviceType: "Mobile" | "Desktop" | "Tablet";
	timeInDeviceUnit: string;
	timeInMacAddress: string;
	timeInRemarks: "Normal" | "Late" | "Early";
	timeInExactLocation: string;
	timeOutLocationType: "Inside" | "In-field" | "Outside";
	timeOutDeviceType: "Mobile" | "Desktop" | "Tablet";
	timeOutDeviceUnit: string;
	timeOutMacAddress: string;
	timeOutRemarks: "Normal" | "Early Departure" | "Overtime";
	timeOutExactLocation: string;
	// Agency Information
	agencyLocation: string;
	workSetup: "On-site" | "Hybrid" | "Work From Home";
	branchType: "Main" | "Branch";
	openingTime: string;
	closingTime: string;
	contactPerson: string;
	contactRole: string;
	contactPhone: string;
	contactEmail: string;
}

export interface AttendanceHistoryRecord {
	id: number;
	date: string;
	studentId: string;
	studentName: string;
	studentAvatar?: string;
	timeIn: string;
	timeOut: string;
	totalHours: number;
	agency: string;
	status: "Approved" | "Declined" | "Pending";
	approvedBy: string;
	approvedAt: string;
	location: string;
	notes: string;
}

// Sample attendance records
export const ATTENDANCE_RECORDS: AttendanceRecord[] = [
	{
		id: "att-001",
		studentId: "2021-00001",
		date: "2024-01-15",
		day: "Monday",
		timeIn: "08:00 AM",
		timeOut: "05:00 PM",
		hours: 8,
		status: "present",
		location: {
			latitude: 12.3522,
			longitude: 121.0676,
			address: "OMSC Main Campus, San Jose, Occidental Mindoro",
		},
		remarks: "Regular day",
		createdAt: "2024-01-15T08:00:00Z",
	},
	{
		id: "att-002",
		studentId: "2021-00001",
		date: "2024-01-16",
		day: "Tuesday",
		timeIn: "08:15 AM",
		timeOut: "05:30 PM",
		hours: 8.25,
		status: "present",
		location: {
			latitude: 12.3522,
			longitude: 121.0676,
			address: "OMSC Main Campus, San Jose, Occidental Mindoro",
		},
		remarks: "Overtime",
		createdAt: "2024-01-16T08:15:00Z",
	},
	{
		id: "att-003",
		studentId: "2021-00002",
		date: "2024-01-15",
		day: "Monday",
		timeIn: "08:00 AM",
		timeOut: "05:00 PM",
		hours: 8,
		status: "present",
		location: {
			latitude: 14.5995,
			longitude: 120.9842,
			address: "Metro Bank Building, Makati City",
		},
		remarks: "Regular day",
		createdAt: "2024-01-15T08:00:00Z",
	},
];

// Detailed attendance logs for instructor review
export const DETAILED_ATTENDANCE_LOGS: DetailedAttendanceLog[] = [
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
];

// Attendance history records
export const ATTENDANCE_HISTORY_RECORDS: AttendanceHistoryRecord[] = [
	{
		id: 1,
		date: "2024-01-15",
		studentId: "2021-00001",
		studentName: "Juan Dela Cruz",
		studentAvatar: "/placeholder.svg?height=32&width=32",
		timeIn: "08:00 AM",
		timeOut: "05:00 PM",
		totalHours: 9,
		agency: "OMSC IT Department",
		status: "Approved",
		approvedBy: "Prof. Dela Cruz",
		approvedAt: "2024-01-15T17:30:00Z",
		location: "OMSC Campus",
		notes: "Regular attendance",
	},
	{
		id: 2,
		date: "2024-01-15",
		studentId: "2021-00002",
		studentName: "Maria Santos",
		studentAvatar: "/placeholder.svg?height=32&width=32",
		timeIn: "08:15 AM",
		timeOut: "05:30 PM",
		totalHours: 9.25,
		agency: "Municipal IT Office",
		status: "Approved",
		approvedBy: "Prof. Dela Cruz",
		approvedAt: "2024-01-15T18:00:00Z",
		location: "Municipal Hall",
		notes: "Excellent performance",
	},
	{
		id: 3,
		date: "2024-01-14",
		studentId: "2021-00001",
		studentName: "Juan Dela Cruz",
		studentAvatar: "/placeholder.svg?height=32&width=32",
		timeIn: "08:00 AM",
		timeOut: "04:45 PM",
		totalHours: 8.75,
		agency: "OMSC IT Department",
		status: "Approved",
		approvedBy: "Prof. Dela Cruz",
		approvedAt: "2024-01-14T17:00:00Z",
		location: "OMSC Campus",
		notes: "Left early for medical appointment",
	},
	{
		id: 4,
		date: "2024-01-14",
		studentId: "2021-00003",
		studentName: "Pedro Rodriguez",
		studentAvatar: "/placeholder.svg?height=32&width=32",
		timeIn: "08:30 AM",
		timeOut: "04:30 PM",
		totalHours: 8,
		agency: "Provincial Capitol",
		status: "Declined",
		approvedBy: "Prof. Dela Cruz",
		approvedAt: "2024-01-14T19:00:00Z",
		location: "Capitol Building",
		notes: "Insufficient documentation",
	},
];

// Utility functions
export const getAttendanceRecordsByStudentId = (
	studentId: string
): AttendanceRecord[] => {
	return ATTENDANCE_RECORDS.filter((record) => record.studentId === studentId);
};

export const getDetailedAttendanceLogsByStudentId = (
	studentId: string
): DetailedAttendanceLog[] => {
	return DETAILED_ATTENDANCE_LOGS.filter((log) => log.studentId === studentId);
};

export const getAttendanceHistoryByStudentId = (
	studentId: string
): AttendanceHistoryRecord[] => {
	return ATTENDANCE_HISTORY_RECORDS.filter(
		(record) => record.studentId === studentId
	);
};

export const getAttendanceLogsByStatus = (
	status: "Pending" | "Approved" | "Declined"
): DetailedAttendanceLog[] => {
	return DETAILED_ATTENDANCE_LOGS.filter((log) => log.status === status);
};

export const getAttendanceHistoryByStatus = (
	status: "Approved" | "Declined" | "Pending"
): AttendanceHistoryRecord[] => {
	return ATTENDANCE_HISTORY_RECORDS.filter(
		(record) => record.status === status
	);
};

// Status and priority options for forms
export const ATTENDANCE_STATUS_OPTIONS = [
	{ value: "present", label: "Present" },
	{ value: "absent", label: "Absent" },
	{ value: "late", label: "Late" },
	{ value: "excused", label: "Excused" },
];

export const ATTENDANCE_LOG_STATUS_OPTIONS = [
	{ value: "Pending", label: "Pending" },
	{ value: "Approved", label: "Approved" },
	{ value: "Declined", label: "Declined" },
];

export const LOCATION_TYPE_OPTIONS = [
	{ value: "Inside", label: "Inside" },
	{ value: "In-field", label: "In-field" },
	{ value: "Outside", label: "Outside" },
];

export const DEVICE_TYPE_OPTIONS = [
	{ value: "Mobile", label: "Mobile" },
	{ value: "Desktop", label: "Desktop" },
	{ value: "Tablet", label: "Tablet" },
];

export const WORK_SETUP_OPTIONS = [
	{ value: "On-site", label: "On-site" },
	{ value: "Hybrid", label: "Hybrid" },
	{ value: "Work From Home", label: "Work From Home" },
];

export const BRANCH_TYPE_OPTIONS = [
	{ value: "Main", label: "Main" },
	{ value: "Branch", label: "Branch" },
];

export const TIME_REMARKS_OPTIONS = [
	{ value: "Normal", label: "Normal" },
	{ value: "Late", label: "Late" },
	{ value: "Early", label: "Early" },
	{ value: "Early Departure", label: "Early Departure" },
	{ value: "Overtime", label: "Overtime" },
];
