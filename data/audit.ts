export interface AuditLog {
	id: string;
	timestamp: string;
	user: string;
	userId: string;
	action: string;
	resource: string;
	resourceId: string;
	details: string;
	ipAddress: string;
	userAgent: string;
	severity: "low" | "medium" | "high";
	category:
		| "security"
		| "academic"
		| "submission"
		| "attendance"
		| "user_management"
		| "system";
	status: "success" | "failed" | "warning";
	sessionId?: string;
	location?: {
		country?: string;
		region?: string;
		city?: string;
	};
	metadata?: Record<string, any>;
}

export interface AuditStats {
	totalActivities: number;
	securityEvents: number;
	failedActions: number;
	activeUsers: number;
	activitiesChange: number;
	securityChange: number;
	failedChange: number;
	usersChange: number;
}

export interface AuditFilter {
	searchTerm?: string;
	category?: string;
	severity?: string;
	userId?: string;
	dateRange?: {
		start: string;
		end: string;
	};
	status?: string;
}

export interface AuditExport {
	format: "csv" | "json" | "pdf";
	filters: AuditFilter;
	dateRange: {
		start: string;
		end: string;
	};
	includeMetadata?: boolean;
}

// Sample audit logs data
export const AUDIT_LOGS: AuditLog[] = [
	{
		id: "1",
		timestamp: "2024-01-15T10:30:00Z",
		user: "Prof. Juan Dela Cruz",
		userId: "instructor_001",
		action: "Student Grade Updated",
		resource: "Student Record",
		resourceId: "student_123",
		details: "Updated final grade for Maria Santos from B+ to A-",
		ipAddress: "192.168.1.100",
		userAgent: "Chrome 120.0.0.0",
		severity: "medium",
		category: "academic",
		status: "success",
		sessionId: "sess_abc123",
		location: {
			country: "Philippines",
			region: "MIMAROPA",
			city: "San Jose",
		},
		metadata: {
			oldGrade: "B+",
			newGrade: "A-",
			reason: "Additional project completion",
		},
	},
	{
		id: "2",
		timestamp: "2024-01-15T09:45:00Z",
		user: "Maria Santos",
		userId: "student_123",
		action: "Report Submitted",
		resource: "Weekly Report",
		resourceId: "report_456",
		details: "Submitted Week 3 practicum report",
		ipAddress: "192.168.1.105",
		userAgent: "Firefox 121.0.0.0",
		severity: "low",
		category: "submission",
		status: "success",
		sessionId: "sess_def456",
		location: {
			country: "Philippines",
			region: "MIMAROPA",
			city: "Mamburao",
		},
		metadata: {
			reportType: "weekly",
			weekNumber: 3,
			fileSize: "2.3MB",
		},
	},
	{
		id: "3",
		timestamp: "2024-01-15T09:15:00Z",
		user: "System",
		userId: "system",
		action: "Failed Login Attempt",
		resource: "Authentication",
		resourceId: "auth_789",
		details: "Multiple failed login attempts for user: john.doe@student.edu",
		ipAddress: "203.0.113.45",
		userAgent: "Chrome 119.0.0.0",
		severity: "high",
		category: "security",
		status: "failed",
		sessionId: "sess_ghi789",
		location: {
			country: "Unknown",
			region: "Unknown",
			city: "Unknown",
		},
		metadata: {
			attemptCount: 5,
			blocked: true,
			reason: "Invalid credentials",
		},
	},
	{
		id: "4",
		timestamp: "2024-01-15T08:30:00Z",
		user: "Prof. Juan Dela Cruz",
		userId: "instructor_001",
		action: "Attendance Marked",
		resource: "Attendance Record",
		resourceId: "attendance_101",
		details: "Marked attendance for 15 students in Section A",
		ipAddress: "192.168.1.100",
		userAgent: "Chrome 120.0.0.0",
		severity: "low",
		category: "attendance",
		status: "success",
		sessionId: "sess_jkl012",
		location: {
			country: "Philippines",
			region: "MIMAROPA",
			city: "San Jose",
		},
		metadata: {
			section: "BSIT 4A",
			studentCount: 15,
			presentCount: 12,
			absentCount: 3,
		},
	},
	{
		id: "5",
		timestamp: "2024-01-15T08:00:00Z",
		user: "Admin User",
		userId: "admin_001",
		action: "User Account Created",
		resource: "User Management",
		resourceId: "user_new_001",
		details: "Created new student account for Pedro Reyes",
		ipAddress: "192.168.1.50",
		userAgent: "Chrome 120.0.0.0",
		severity: "medium",
		category: "user_management",
		status: "success",
		sessionId: "sess_mno345",
		location: {
			country: "Philippines",
			region: "MIMAROPA",
			city: "San Jose",
		},
		metadata: {
			userType: "student",
			assignedRole: "student",
			email: "pedro.reyes@student.omsc.edu.ph",
		},
	},
	{
		id: "6",
		timestamp: "2024-01-15T07:45:00Z",
		user: "Carlos Mendoza",
		userId: "student_005",
		action: "Password Changed",
		resource: "User Profile",
		resourceId: "profile_005",
		details: "Successfully changed password",
		ipAddress: "192.168.1.110",
		userAgent: "Safari 17.0.0.0",
		severity: "low",
		category: "security",
		status: "success",
		sessionId: "sess_pqr678",
		location: {
			country: "Philippines",
			region: "MIMAROPA",
			city: "Pasig",
		},
		metadata: {
			passwordStrength: "strong",
			lastPasswordChange: "2024-01-01T00:00:00Z",
		},
	},
	{
		id: "7",
		timestamp: "2024-01-15T07:30:00Z",
		user: "System",
		userId: "system",
		action: "Database Backup",
		resource: "System Maintenance",
		resourceId: "backup_20240115",
		details: "Automated daily database backup completed successfully",
		ipAddress: "127.0.0.1",
		userAgent: "System Process",
		severity: "low",
		category: "system",
		status: "success",
		sessionId: "sess_system_001",
		location: {
			country: "Philippines",
			region: "MIMAROPA",
			city: "San Jose",
		},
		metadata: {
			backupSize: "1.2GB",
			duration: "15 minutes",
			compressionRatio: "0.3",
		},
	},
	{
		id: "8",
		timestamp: "2024-01-15T07:15:00Z",
		user: "Ana Garcia",
		userId: "student_004",
		action: "Requirement Upload Failed",
		resource: "Requirement Submission",
		resourceId: "req_upload_004",
		details: "Failed to upload medical certificate - file size exceeds limit",
		ipAddress: "192.168.1.115",
		userAgent: "Edge 120.0.0.0",
		severity: "medium",
		category: "submission",
		status: "failed",
		sessionId: "sess_stu901",
		location: {
			country: "Philippines",
			region: "MIMAROPA",
			city: "Taguig",
		},
		metadata: {
			fileSize: "15.2MB",
			maxAllowedSize: "10MB",
			fileType: "pdf",
		},
	},
];

// Sample audit statistics
export const AUDIT_STATS: AuditStats = {
	totalActivities: 1247,
	securityEvents: 23,
	failedActions: 8,
	activeUsers: 156,
	activitiesChange: 12,
	securityChange: -5,
	failedChange: -2,
	usersChange: 8,
};

// Utility functions
export const getAuditLogsByCategory = (
	category:
		| "security"
		| "academic"
		| "submission"
		| "attendance"
		| "user_management"
		| "system"
): AuditLog[] => {
	return AUDIT_LOGS.filter((log) => log.category === category);
};

export const getAuditLogsBySeverity = (
	severity: "low" | "medium" | "high"
): AuditLog[] => {
	return AUDIT_LOGS.filter((log) => log.severity === severity);
};

export const getAuditLogsByStatus = (
	status: "success" | "failed" | "warning"
): AuditLog[] => {
	return AUDIT_LOGS.filter((log) => log.status === status);
};

export const getAuditLogsByUser = (userId: string): AuditLog[] => {
	return AUDIT_LOGS.filter((log) => log.userId === userId);
};

export const getAuditLogsByDateRange = (
	startDate: string,
	endDate: string
): AuditLog[] => {
	const start = new Date(startDate);
	const end = new Date(endDate);
	return AUDIT_LOGS.filter((log) => {
		const logDate = new Date(log.timestamp);
		return logDate >= start && logDate <= end;
	});
};

export const getFilteredAuditLogs = (filters: AuditFilter): AuditLog[] => {
	let filteredLogs = [...AUDIT_LOGS];

	if (filters.searchTerm) {
		const searchLower = filters.searchTerm.toLowerCase();
		filteredLogs = filteredLogs.filter(
			(log) =>
				log.action.toLowerCase().includes(searchLower) ||
				log.user.toLowerCase().includes(searchLower) ||
				log.details.toLowerCase().includes(searchLower) ||
				log.resource.toLowerCase().includes(searchLower)
		);
	}

	if (filters.category && filters.category !== "all") {
		filteredLogs = filteredLogs.filter(
			(log) => log.category === filters.category
		);
	}

	if (filters.severity && filters.severity !== "all") {
		filteredLogs = filteredLogs.filter(
			(log) => log.severity === filters.severity
		);
	}

	if (filters.userId && filters.userId !== "all") {
		filteredLogs = filteredLogs.filter((log) => log.userId === filters.userId);
	}

	if (filters.status && filters.status !== "all") {
		filteredLogs = filteredLogs.filter((log) => log.status === filters.status);
	}

	if (filters.dateRange) {
		filteredLogs = filteredLogs.filter((log) => {
			const logDate = new Date(log.timestamp);
			const start = new Date(filters.dateRange!.start);
			const end = new Date(filters.dateRange!.end);
			return logDate >= start && logDate <= end;
		});
	}

	return filteredLogs;
};

export const getAuditLogById = (id: string): AuditLog | undefined => {
	return AUDIT_LOGS.find((log) => log.id === id);
};

export const getRecentAuditLogs = (limit: number = 10): AuditLog[] => {
	return AUDIT_LOGS.sort(
		(a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
	).slice(0, limit);
};

export const getSecurityEvents = (): AuditLog[] => {
	return AUDIT_LOGS.filter((log) => log.category === "security");
};

export const getFailedActions = (): AuditLog[] => {
	return AUDIT_LOGS.filter((log) => log.status === "failed");
};

export const getHighSeverityLogs = (): AuditLog[] => {
	return AUDIT_LOGS.filter((log) => log.severity === "high");
};

export const getAuditLogStats = () => {
	const total = AUDIT_LOGS.length;
	const security = AUDIT_LOGS.filter(
		(log) => log.category === "security"
	).length;
	const failed = AUDIT_LOGS.filter((log) => log.status === "failed").length;
	const highSeverity = AUDIT_LOGS.filter(
		(log) => log.severity === "high"
	).length;
	const uniqueUsers = new Set(AUDIT_LOGS.map((log) => log.userId)).size;

	return {
		total,
		security,
		failed,
		highSeverity,
		uniqueUsers,
	};
};

export const getAuditLogsByResource = (resource: string): AuditLog[] => {
	return AUDIT_LOGS.filter((log) => log.resource === resource);
};

export const getAuditLogsByAction = (action: string): AuditLog[] => {
	return AUDIT_LOGS.filter((log) => log.action === action);
};

// Status and category options for forms
export const AUDIT_CATEGORY_OPTIONS = [
	{ value: "security", label: "Security" },
	{ value: "academic", label: "Academic" },
	{ value: "submission", label: "Submissions" },
	{ value: "attendance", label: "Attendance" },
	{ value: "user_management", label: "User Management" },
	{ value: "system", label: "System" },
];

export const AUDIT_SEVERITY_OPTIONS = [
	{ value: "low", label: "Low" },
	{ value: "medium", label: "Medium" },
	{ value: "high", label: "High" },
];

export const AUDIT_STATUS_OPTIONS = [
	{ value: "success", label: "Success" },
	{ value: "failed", label: "Failed" },
	{ value: "warning", label: "Warning" },
];

export const AUDIT_USER_OPTIONS = [
	{ value: "instructor_001", label: "Prof. Juan Dela Cruz" },
	{ value: "student_123", label: "Maria Santos" },
	{ value: "student_005", label: "Carlos Mendoza" },
	{ value: "student_004", label: "Ana Garcia" },
	{ value: "admin_001", label: "Admin User" },
	{ value: "system", label: "System" },
];

export const AUDIT_RESOURCE_OPTIONS = [
	{ value: "Student Record", label: "Student Record" },
	{ value: "Weekly Report", label: "Weekly Report" },
	{ value: "Authentication", label: "Authentication" },
	{ value: "Attendance Record", label: "Attendance Record" },
	{ value: "User Management", label: "User Management" },
	{ value: "User Profile", label: "User Profile" },
	{ value: "System Maintenance", label: "System Maintenance" },
	{ value: "Requirement Submission", label: "Requirement Submission" },
];

export const AUDIT_ACTION_OPTIONS = [
	{ value: "Student Grade Updated", label: "Student Grade Updated" },
	{ value: "Report Submitted", label: "Report Submitted" },
	{ value: "Failed Login Attempt", label: "Failed Login Attempt" },
	{ value: "Attendance Marked", label: "Attendance Marked" },
	{ value: "User Account Created", label: "User Account Created" },
	{ value: "Password Changed", label: "Password Changed" },
	{ value: "Database Backup", label: "Database Backup" },
	{ value: "Requirement Upload Failed", label: "Requirement Upload Failed" },
];

export const DATE_RANGE_OPTIONS = [
	{ value: "today", label: "Today" },
	{ value: "yesterday", label: "Yesterday" },
	{ value: "last7days", label: "Last 7 days" },
	{ value: "last30days", label: "Last 30 days" },
	{ value: "last90days", label: "Last 90 days" },
	{ value: "custom", label: "Custom Range" },
];

export const EXPORT_FORMAT_OPTIONS = [
	{ value: "csv", label: "CSV" },
	{ value: "json", label: "JSON" },
	{ value: "pdf", label: "PDF" },
];

