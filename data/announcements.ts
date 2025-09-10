export interface Announcement {
	id: number;
	title: string;
	content: string;
	targetSections: string[];
	targetCourses: string[];
	priority: "Low" | "Medium" | "High";
	status: "Draft" | "Published" | "Archived";
	createdAt: string;
	updatedAt?: string;
	comments: number;
	views: number;
	authorId?: string;
	authorName?: string;
	attachments?: string[];
	expiryDate?: string;
	isPinned?: boolean;
}

export interface AnnouncementComment {
	id: number;
	announcementId: number;
	studentId: string;
	studentName: string;
	studentAvatar?: string;
	content: string;
	createdAt: string;
	updatedAt?: string;
}

export interface AnnouncementTemplate {
	id: number;
	title: string;
	content: string;
	category: "reminder" | "requirement" | "schedule" | "general" | "urgent";
	priority: "Low" | "Medium" | "High";
	targetSections: string[];
	targetCourses: string[];
	isActive: boolean;
	createdAt: string;
	usageCount: number;
}

// Sample announcements data
export const ANNOUNCEMENTS: Announcement[] = [
	{
		id: 1,
		title: "Weekly Report Reminder",
		content:
			"Don't forget to submit your weekly reports by Friday, 5:00 PM. Late submissions will not be accepted.",
		targetSections: ["BSIT 4A", "BSIT 4B"],
		targetCourses: ["BSIT"],
		priority: "High",
		status: "Published",
		createdAt: "2024-01-15T10:00:00Z",
		comments: 5,
		views: 42,
		authorId: "instructor-001",
		authorName: "Prof. Dela Cruz",
		isPinned: true,
	},
	{
		id: 2,
		title: "New Requirement Added",
		content:
			"A new requirement has been added to your practicum checklist: Medical Certificate. Please submit this as soon as possible.",
		targetSections: ["BSIT 4A"],
		targetCourses: ["BSIT"],
		priority: "Medium",
		status: "Published",
		createdAt: "2024-01-14T14:30:00Z",
		comments: 8,
		views: 28,
		authorId: "instructor-001",
		authorName: "Prof. Dela Cruz",
		attachments: ["medical-certificate-template.pdf"],
	},
	{
		id: 3,
		title: "Practicum Evaluation Schedule",
		content:
			"The mid-term practicum evaluation will be conducted next week. Please coordinate with your agency supervisors.",
		targetSections: ["BSIT 4A", "BSIT 4B", "BSIT 4C", "BSIT 4D"],
		targetCourses: ["BSIT"],
		priority: "High",
		status: "Draft",
		createdAt: "2024-01-13T09:15:00Z",
		comments: 0,
		views: 0,
		authorId: "instructor-001",
		authorName: "Prof. Dela Cruz",
		expiryDate: "2024-02-15T23:59:59Z",
	},
	{
		id: 4,
		title: "Attendance Policy Update",
		content:
			"Please note that attendance tracking is now mandatory. Students must clock in/out daily through the system.",
		targetSections: ["BSIT 4A", "BSIT 4B", "BSIT 4C", "BSIT 4D"],
		targetCourses: ["BSIT"],
		priority: "High",
		status: "Published",
		createdAt: "2024-01-12T16:45:00Z",
		comments: 12,
		views: 67,
		authorId: "instructor-001",
		authorName: "Prof. Dela Cruz",
		isPinned: true,
	},
	{
		id: 5,
		title: "Portfolio Submission Guidelines",
		content:
			"Detailed guidelines for portfolio submission have been uploaded. Please review the requirements carefully.",
		targetSections: ["BSIT 4A", "BSIT 4B"],
		targetCourses: ["BSIT"],
		priority: "Medium",
		status: "Published",
		createdAt: "2024-01-11T11:20:00Z",
		comments: 3,
		views: 35,
		authorId: "instructor-001",
		authorName: "Prof. Dela Cruz",
		attachments: ["portfolio-guidelines.pdf", "portfolio-template.docx"],
	},
	{
		id: 6,
		title: "Holiday Schedule Notice",
		content:
			"Classes will be suspended on February 25, 2024, in observance of the national holiday. Regular classes resume on February 26.",
		targetSections: ["BSIT 4A", "BSIT 4B", "BSIT 4C", "BSIT 4D"],
		targetCourses: ["BSIT"],
		priority: "Low",
		status: "Published",
		createdAt: "2024-01-10T08:30:00Z",
		comments: 2,
		views: 89,
		authorId: "instructor-001",
		authorName: "Prof. Dela Cruz",
		expiryDate: "2024-02-26T00:00:00Z",
	},
];

// Sample announcement comments
export const ANNOUNCEMENT_COMMENTS: AnnouncementComment[] = [
	{
		id: 1,
		announcementId: 1,
		studentId: "2021-00001",
		studentName: "Juan Dela Cruz",
		studentAvatar: "/placeholder.svg?height=32&width=32",
		content: "Thank you for the reminder! I'll make sure to submit on time.",
		createdAt: "2024-01-15T10:30:00Z",
	},
	{
		id: 2,
		announcementId: 1,
		studentId: "2021-00002",
		studentName: "Maria Santos",
		studentAvatar: "/placeholder.svg?height=32&width=32",
		content: "What if we have technical issues with the submission?",
		createdAt: "2024-01-15T11:15:00Z",
	},
	{
		id: 3,
		announcementId: 2,
		studentId: "2021-00001",
		studentName: "Juan Dela Cruz",
		studentAvatar: "/placeholder.svg?height=32&width=32",
		content: "Where can I get the medical certificate template?",
		createdAt: "2024-01-14T15:00:00Z",
	},
	{
		id: 4,
		announcementId: 4,
		studentId: "2021-00003",
		studentName: "Pedro Rodriguez",
		studentAvatar: "/placeholder.svg?height=32&width=32",
		content: "Is there a grace period for clocking in if we're running late?",
		createdAt: "2024-01-12T17:20:00Z",
	},
];

// Announcement templates
export const ANNOUNCEMENT_TEMPLATES: AnnouncementTemplate[] = [
	{
		id: 1,
		title: "Weekly Report Reminder",
		content:
			"Don't forget to submit your weekly reports by Friday, 5:00 PM. Late submissions will not be accepted.",
		category: "reminder",
		priority: "High",
		targetSections: ["BSIT 4A", "BSIT 4B"],
		targetCourses: ["BSIT"],
		isActive: true,
		createdAt: "2024-01-10",
		usageCount: 8,
	},
	{
		id: 2,
		title: "New Requirement Added",
		content:
			"A new requirement has been added to your practicum checklist: {requirement_name}. Please submit this as soon as possible.",
		category: "requirement",
		priority: "Medium",
		targetSections: ["BSIT 4A", "BSIT 4B", "BSIT 4C", "BSIT 4D"],
		targetCourses: ["BSIT"],
		isActive: true,
		createdAt: "2024-01-08",
		usageCount: 5,
	},
	{
		id: 3,
		title: "Evaluation Schedule",
		content:
			"The {evaluation_type} practicum evaluation will be conducted on {date}. Please coordinate with your agency supervisors.",
		category: "schedule",
		priority: "High",
		targetSections: ["BSIT 4A", "BSIT 4B", "BSIT 4C", "BSIT 4D"],
		targetCourses: ["BSIT"],
		isActive: true,
		createdAt: "2024-01-05",
		usageCount: 3,
	},
	{
		id: 4,
		title: "Holiday Notice",
		content:
			"Classes will be suspended on {date} in observance of {holiday_name}. Regular classes resume on {resume_date}.",
		category: "general",
		priority: "Low",
		targetSections: ["BSIT 4A", "BSIT 4B", "BSIT 4C", "BSIT 4D"],
		targetCourses: ["BSIT"],
		isActive: true,
		createdAt: "2024-01-03",
		usageCount: 2,
	},
	{
		id: 5,
		title: "Urgent System Maintenance",
		content:
			"URGENT: The system will undergo maintenance on {date} from {start_time} to {end_time}. Please save your work and log out before the maintenance period.",
		category: "urgent",
		priority: "High",
		targetSections: ["BSIT 4A", "BSIT 4B", "BSIT 4C", "BSIT 4D"],
		targetCourses: ["BSIT"],
		isActive: true,
		createdAt: "2024-01-01",
		usageCount: 1,
	},
];

// Utility functions
export const getAnnouncementsByStatus = (
	status: "Draft" | "Published" | "Archived"
): Announcement[] => {
	return ANNOUNCEMENTS.filter((announcement) => announcement.status === status);
};

export const getAnnouncementsByPriority = (
	priority: "Low" | "Medium" | "High"
): Announcement[] => {
	return ANNOUNCEMENTS.filter(
		(announcement) => announcement.priority === priority
	);
};

export const getAnnouncementsBySection = (section: string): Announcement[] => {
	return ANNOUNCEMENTS.filter((announcement) =>
		announcement.targetSections.includes(section)
	);
};

export const getAnnouncementsByCourse = (course: string): Announcement[] => {
	return ANNOUNCEMENTS.filter((announcement) =>
		announcement.targetCourses.includes(course)
	);
};

export const getPinnedAnnouncements = (): Announcement[] => {
	return ANNOUNCEMENTS.filter((announcement) => announcement.isPinned);
};

export const getActiveAnnouncements = (): Announcement[] => {
	return ANNOUNCEMENTS.filter(
		(announcement) => announcement.status === "Published"
	);
};

export const getAnnouncementComments = (
	announcementId: number
): AnnouncementComment[] => {
	return ANNOUNCEMENT_COMMENTS.filter(
		(comment) => comment.announcementId === announcementId
	);
};

export const getAnnouncementTemplatesByCategory = (
	category: "reminder" | "requirement" | "schedule" | "general" | "urgent"
): AnnouncementTemplate[] => {
	return ANNOUNCEMENT_TEMPLATES.filter(
		(template) => template.category === category
	);
};

export const getActiveAnnouncementTemplates = (): AnnouncementTemplate[] => {
	return ANNOUNCEMENT_TEMPLATES.filter((template) => template.isActive);
};

export const getAnnouncementStats = () => {
	const total = ANNOUNCEMENTS.length;
	const published = ANNOUNCEMENTS.filter(
		(a) => a.status === "Published"
	).length;
	const drafts = ANNOUNCEMENTS.filter((a) => a.status === "Draft").length;
	const totalViews = ANNOUNCEMENTS.reduce((sum, a) => sum + a.views, 0);
	const totalComments = ANNOUNCEMENTS.reduce((sum, a) => sum + a.comments, 0);

	return {
		total,
		published,
		drafts,
		totalViews,
		totalComments,
	};
};

// Status and priority options for forms
export const ANNOUNCEMENT_STATUS_OPTIONS = [
	{ value: "Draft", label: "Draft" },
	{ value: "Published", label: "Published" },
	{ value: "Archived", label: "Archived" },
];

export const ANNOUNCEMENT_PRIORITY_OPTIONS = [
	{ value: "Low", label: "Low" },
	{ value: "Medium", label: "Medium" },
	{ value: "High", label: "High" },
];

export const ANNOUNCEMENT_CATEGORY_OPTIONS = [
	{ value: "reminder", label: "Reminder" },
	{ value: "requirement", label: "Requirement" },
	{ value: "schedule", label: "Schedule" },
	{ value: "general", label: "General" },
	{ value: "urgent", label: "Urgent" },
];

export const TARGET_SECTION_OPTIONS = [
	{ value: "BSIT 4A", label: "BSIT 4A" },
	{ value: "BSIT 4B", label: "BSIT 4B" },
	{ value: "BSIT 4C", label: "BSIT 4C" },
	{ value: "BSIT 4D", label: "BSIT 4D" },
	{ value: "all", label: "All Sections" },
];

export const TARGET_COURSE_OPTIONS = [
	{ value: "BSIT", label: "BSIT" },
	{ value: "BSCS", label: "BSCS" },
	{ value: "BSIS", label: "BSIS" },
	{ value: "all", label: "All Courses" },
];

