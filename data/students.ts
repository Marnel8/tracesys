import {
	AttendanceRecord,
	getAttendanceRecordsByStudentId,
} from "./attendance";
import { Requirement, getRequirementsByStudentId } from "./requirements";
import { Report, getReportsByStudentId } from "./reports";

export interface Student {
	id: string;
	studentId: string;
	firstName: string;
	lastName: string;
	middleName?: string;
	email: string;
	phone: string;
	address: string;
	bio?: string;
	avatar?: string;
	avatarFileName?: string;
	password?: string;
	createdAt: string;
	updatedAt?: string;
}

export interface AcademicInfo {
	studentId: string;
	course: string;
	courseCode: string;
	year: string;
	semester: string;
	section: string;
	department: string;
}

export interface PracticumInfo {
	studentId: string;
	agency: string;
	agencyAddress: string;
	position: string;
	supervisor: string;
	supervisorEmail: string;
	supervisorPhone: string;
	startDate: string;
	endDate: string;
	totalHours: number;
	completedHours: number;
	status: "active" | "completed" | "inactive";
}

export interface Achievement {
	id: string;
	studentId: string;
	title: string;
	description: string;
	type: "attendance" | "academic" | "training" | "performance" | "milestone";
	date: string;
	points?: number;
	badge?: string;
	createdAt: string;
}

export interface StudentProfile extends Student {
	academic: AcademicInfo;
	practicum: PracticumInfo;
	attendance: {
		records: AttendanceRecord[];
		totalHours: number;
		attendanceRate: number;
		lastClockIn?: string;
		lastClockOut?: string;
	};
	reports: {
		submitted: number;
		approved: number;
		pending: number;
		total: number;
		recent: Report[];
	};
	requirements: {
		completed: number;
		pending: number;
		total: number;
		recent: Requirement[];
	};
	achievements: Achievement[];
	stats: {
		hoursCompleted: number;
		totalHours: number;
		attendanceRate: number;
		reportsSubmitted: number;
		requirementsDone: number;
		totalRequirements: number;
		completionRate: number;
	};
}

// Sample student data
export const STUDENTS: Student[] = [
	{
		id: "2021-00001",
		studentId: "2021-00001",
		firstName: "Juan",
		lastName: "Dela Cruz",
		email: "juan.delacruz@student.omsc.edu.ph",
		phone: "+63 912 345 6789",
		address: "123 Main Street, Quezon City, Philippines",
		bio: "Passionate IT student specializing in web development and software engineering.",
		avatar: "/placeholder-user.jpg",
		createdAt: "2024-01-01T00:00:00Z",
	},
	{
		id: "2021-00002",
		studentId: "2021-00002",
		firstName: "Maria",
		lastName: "Santos",
		email: "maria.santos@student.omsc.edu.ph",
		phone: "+63 912 345 6790",
		address: "456 Oak Avenue, Makati City, Philippines",
		bio: "Dedicated student with strong analytical skills and passion for technology.",
		avatar: "/placeholder-user.jpg",
		createdAt: "2024-01-01T00:00:00Z",
	},
	{
		id: "2021-00003",
		studentId: "2021-00003",
		firstName: "Pedro",
		lastName: "Rodriguez",
		email: "pedro.rodriguez@student.omsc.edu.ph",
		phone: "+63 912 345 6791",
		address: "789 Pine Street, Manila, Philippines",
		bio: "Enthusiastic learner focused on database management and system administration.",
		avatar: "/placeholder-user.jpg",
		createdAt: "2024-01-01T00:00:00Z",
	},
	{
		id: "2021-00004",
		studentId: "2021-00004",
		firstName: "Ana",
		lastName: "Garcia",
		email: "ana.garcia@student.omsc.edu.ph",
		phone: "+63 912 345 6792",
		address: "321 Elm Street, Taguig City, Philippines",
		bio: "Creative problem-solver with expertise in mobile app development.",
		avatar: "/placeholder-user.jpg",
		createdAt: "2024-01-01T00:00:00Z",
	},
	{
		id: "2021-00005",
		studentId: "2021-00005",
		firstName: "Carlos",
		lastName: "Mendoza",
		email: "carlos.mendoza@student.omsc.edu.ph",
		phone: "+63 912 345 6793",
		address: "654 Maple Drive, Pasig City, Philippines",
		bio: "Detail-oriented student with strong programming fundamentals.",
		avatar: "/placeholder-user.jpg",
		createdAt: "2024-01-01T00:00:00Z",
	},
];

// Academic information for students
export const ACADEMIC_INFO: AcademicInfo[] = [
	{
		studentId: "2021-00001",
		course: "Bachelor of Science in Information Technology",
		courseCode: "BSIT",
		year: "4th Year",
		semester: "1st Semester",
		section: "4A",
		department: "CAST",
	},
	{
		studentId: "2021-00002",
		course: "Bachelor of Science in Information Technology",
		courseCode: "BSIT",
		year: "4th Year",
		semester: "1st Semester",
		section: "4A",
		department: "CAST",
	},
	{
		studentId: "2021-00003",
		course: "Bachelor of Science in Information Technology",
		courseCode: "BSIT",
		year: "4th Year",
		semester: "1st Semester",
		section: "4A",
		department: "CAST",
	},
	{
		studentId: "2021-00004",
		course: "Bachelor of Science in Information Technology",
		courseCode: "BSIT",
		year: "4th Year",
		semester: "1st Semester",
		section: "4A",
		department: "CAST",
	},
	{
		studentId: "2021-00005",
		course: "Bachelor of Science in Information Technology",
		courseCode: "BSIT",
		year: "4th Year",
		semester: "1st Semester",
		section: "4B",
		department: "CAST",
	},
];

// Practicum information for students
export const PRACTICUM_INFO: PracticumInfo[] = [
	{
		studentId: "2021-00001",
		agency: "OMSC IT Department",
		agencyAddress:
			"Occidental Mindoro State College, San Jose, Occidental Mindoro",
		position: "IT Support Intern",
		supervisor: "Dr. Juan Dela Cruz",
		supervisorEmail: "juan.delacruz@omsc.edu.ph",
		supervisorPhone: "+63 912 345 6789",
		startDate: "2024-01-08",
		endDate: "2024-05-15",
		totalHours: 400,
		completedHours: 280,
		status: "active",
	},
	{
		studentId: "2021-00002",
		agency: "Metro Bank",
		agencyAddress: "Metro Bank Building, Makati City, Philippines",
		position: "Software Development Intern",
		supervisor: "Ms. Sarah Johnson",
		supervisorEmail: "sarah.johnson@metrobank.com",
		supervisorPhone: "+63 912 345 6790",
		startDate: "2024-01-08",
		endDate: "2024-05-15",
		totalHours: 400,
		completedHours: 265,
		status: "active",
	},
	{
		studentId: "2021-00003",
		agency: "Provincial Capitol",
		agencyAddress: "Provincial Capitol Building, Mamburao, Occidental Mindoro",
		position: "Database Administrator Intern",
		supervisor: "Engr. Roberto Santos",
		supervisorEmail: "roberto.santos@capitol.gov.ph",
		supervisorPhone: "+63 912 345 6791",
		startDate: "2024-01-08",
		endDate: "2024-05-15",
		totalHours: 400,
		completedHours: 245,
		status: "active",
	},
	{
		studentId: "2021-00004",
		agency: "Sunshine Elementary School",
		agencyAddress: "Sunshine Elementary School, San Jose, Occidental Mindoro",
		position: "IT Support Intern",
		supervisor: "Mrs. Maria Rodriguez",
		supervisorEmail: "maria.rodriguez@sunshine.edu.ph",
		supervisorPhone: "+63 912 345 6792",
		startDate: "2024-01-08",
		endDate: "2024-05-15",
		totalHours: 400,
		completedHours: 320,
		status: "active",
	},
	{
		studentId: "2021-00005",
		agency: "LGU Mamburao",
		agencyAddress: "Municipal Hall, Mamburao, Occidental Mindoro",
		position: "System Administrator Intern",
		supervisor: "Mr. Jose Garcia",
		supervisorEmail: "jose.garcia@mamburao.gov.ph",
		supervisorPhone: "+63 912 345 6793",
		startDate: "2024-01-08",
		endDate: "2024-05-15",
		totalHours: 400,
		completedHours: 300,
		status: "active",
	},
];

// Sample achievements
export const ACHIEVEMENTS: Achievement[] = [
	{
		id: "ach-001",
		studentId: "2021-00001",
		title: "Perfect Attendance",
		description: "100% attendance for 2 weeks",
		type: "attendance",
		date: "2024-01-15",
		points: 50,
		badge: "attendance-star",
		createdAt: "2024-01-15T00:00:00Z",
	},
	{
		id: "ach-002",
		studentId: "2021-00001",
		title: "Outstanding Report",
		description: "Excellent weekly report #7",
		type: "academic",
		date: "2024-01-10",
		points: 75,
		badge: "report-excellence",
		createdAt: "2024-01-10T00:00:00Z",
	},
	{
		id: "ach-003",
		studentId: "2021-00002",
		title: "Quick Learner",
		description: "Completed training ahead of schedule",
		type: "training",
		date: "2024-01-08",
		points: 100,
		badge: "fast-learner",
		createdAt: "2024-01-08T00:00:00Z",
	},
];

// Utility functions
export const getStudentById = (id: string): Student | undefined => {
	return STUDENTS.find((student) => student.id === id);
};

export const getStudentByStudentId = (
	studentId: string
): Student | undefined => {
	return STUDENTS.find((student) => student.studentId === studentId);
};

export const getAcademicInfoByStudentId = (
	studentId: string
): AcademicInfo | undefined => {
	return ACADEMIC_INFO.find((info) => info.studentId === studentId);
};

export const getPracticumInfoByStudentId = (
	studentId: string
): PracticumInfo | undefined => {
	return PRACTICUM_INFO.find((info) => info.studentId === studentId);
};

export const getAchievementsByStudentId = (
	studentId: string
): Achievement[] => {
	return ACHIEVEMENTS.filter(
		(achievement) => achievement.studentId === studentId
	);
};

export const getCompleteStudentProfile = (
	studentId: string
): StudentProfile | undefined => {
	const student = getStudentByStudentId(studentId);
	if (!student) return undefined;

	const academic = getAcademicInfoByStudentId(studentId);
	const practicum = getPracticumInfoByStudentId(studentId);
	const attendanceRecords = getAttendanceRecordsByStudentId(studentId);
	const reports = getReportsByStudentId(studentId);
	const requirements = getRequirementsByStudentId(studentId);
	const achievements = getAchievementsByStudentId(studentId);

	if (!academic || !practicum) return undefined;

	// Calculate attendance stats
	const totalHours = attendanceRecords.reduce(
		(sum, record) => sum + (record.hours || 0),
		0
	);
	const presentDays = attendanceRecords.filter(
		(record) => record.status === "present"
	).length;
	const attendanceRate =
		attendanceRecords.length > 0
			? (presentDays / attendanceRecords.length) * 100
			: 0;

	// Calculate report stats
	const submittedReports = reports.filter(
		(report) => report.status === "submitted" || report.status === "approved"
	).length;
	const approvedReports = reports.filter(
		(report) => report.status === "approved"
	).length;
	const pendingReports = reports.filter(
		(report) => report.status === "submitted"
	).length;

	// Calculate requirement stats
	const completedRequirements = requirements.filter(
		(req) => req.status === "approved"
	).length;
	const pendingRequirements = requirements.filter(
		(req) => req.status === "pending" || req.status === "in-progress"
	).length;

	// Calculate completion rate
	const completionRate =
		practicum.totalHours > 0
			? (practicum.completedHours / practicum.totalHours) * 100
			: 0;

	return {
		...student,
		academic,
		practicum,
		attendance: {
			records: attendanceRecords,
			totalHours,
			attendanceRate,
			lastClockIn:
				attendanceRecords.length > 0 ? attendanceRecords[0].timeIn : undefined,
			lastClockOut:
				attendanceRecords.length > 0 ? attendanceRecords[0].timeOut : undefined,
		},
		reports: {
			submitted: submittedReports,
			approved: approvedReports,
			pending: pendingReports,
			total: reports.length,
			recent: reports.slice(0, 5),
		},
		requirements: {
			completed: completedRequirements,
			pending: pendingRequirements,
			total: requirements.length,
			recent: requirements.slice(0, 5),
		},
		achievements,
		stats: {
			hoursCompleted: practicum.completedHours,
			totalHours: practicum.totalHours,
			attendanceRate,
			reportsSubmitted: submittedReports,
			requirementsDone: completedRequirements,
			totalRequirements: requirements.length,
			completionRate,
		},
	};
};

export const getStudentsBySection = (section: string): StudentProfile[] => {
	const academicInfos = ACADEMIC_INFO.filter(
		(info) => info.section === section
	);
	const studentProfiles: StudentProfile[] = [];

	for (const academic of academicInfos) {
		const profile = getCompleteStudentProfile(academic.studentId);
		if (profile) {
			studentProfiles.push(profile);
		}
	}

	return studentProfiles;
};

export const getStudentsByCourse = (courseCode: string): StudentProfile[] => {
	const academicInfos = ACADEMIC_INFO.filter(
		(info) => info.courseCode === courseCode
	);
	const studentProfiles: StudentProfile[] = [];

	for (const academic of academicInfos) {
		const profile = getCompleteStudentProfile(academic.studentId);
		if (profile) {
			studentProfiles.push(profile);
		}
	}

	return studentProfiles;
};

export const getStudentsByStatus = (
	status: "active" | "completed" | "inactive"
): StudentProfile[] => {
	const practicumInfos = PRACTICUM_INFO.filter(
		(info) => info.status === status
	);
	const studentProfiles: StudentProfile[] = [];

	for (const practicum of practicumInfos) {
		const profile = getCompleteStudentProfile(practicum.studentId);
		if (profile) {
			studentProfiles.push(profile);
		}
	}

	return studentProfiles;
};

export const getTotalStudentsCount = (): number => {
	return STUDENTS.length;
};

export const getActiveStudentsCount = (): number => {
	return PRACTICUM_INFO.filter((info) => info.status === "active").length;
};

export const getAverageAttendanceRate = (): number => {
	const allProfiles = STUDENTS.map((student) =>
		getCompleteStudentProfile(student.studentId)
	).filter(Boolean) as StudentProfile[];
	if (allProfiles.length === 0) return 0;

	const totalRate = allProfiles.reduce(
		(sum, profile) => sum + profile.stats.attendanceRate,
		0
	);
	return totalRate / allProfiles.length;
};

export const getAverageCompletionRate = (): number => {
	const allProfiles = STUDENTS.map((student) =>
		getCompleteStudentProfile(student.studentId)
	).filter(Boolean) as StudentProfile[];
	if (allProfiles.length === 0) return 0;

	const totalRate = allProfiles.reduce(
		(sum, profile) => sum + profile.stats.completionRate,
		0
	);
	return totalRate / allProfiles.length;
};

// Status and priority options for forms
export const STUDENT_STATUS_OPTIONS = [
	{ value: "active", label: "Active" },
	{ value: "completed", label: "Completed" },
	{ value: "inactive", label: "Inactive" },
];

export const ACHIEVEMENT_TYPE_OPTIONS = [
	{ value: "attendance", label: "Attendance" },
	{ value: "academic", label: "Academic" },
	{ value: "training", label: "Training" },
	{ value: "performance", label: "Performance" },
	{ value: "milestone", label: "Milestone" },
];
