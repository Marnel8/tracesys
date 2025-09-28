export interface Announcement {
	id: string;
	title: string;
	content: string;
	priority: "Low" | "Medium" | "High";
	status: "Draft" | "Published" | "Archived";
	authorId: string;
	expiryDate?: string;
	isPinned: boolean;
	views: number;
	createdAt: string;
	updatedAt: string;
	author?: User;
	targets?: AnnouncementTarget[];
	comments?: AnnouncementComment[];
	commentCount?: number;
}

export interface User {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
}

export interface AnnouncementTarget {
	id: string;
	announcementId: string;
	targetType: "section" | "course" | "department" | "all";
	targetId?: string;
	createdAt: string;
}

export interface AnnouncementComment {
	id: string;
	announcementId: string;
	userId: string;
	content: string;
	createdAt: string;
	updatedAt: string;
	user?: User;
}

export interface AnnouncementFormData {
	title: string;
	content: string;
	priority: "Low" | "Medium" | "High";
	status: "Draft" | "Published" | "Archived";
	authorId: string;
	expiryDate?: string;
	isPinned?: boolean;
	targets?: {
		targetType: "section" | "course" | "department" | "all";
		targetId?: string;
	}[];
}

export interface CommentFormData {
	announcementId: string;
	userId: string;
	content: string;
}

export interface AnnouncementFilters {
	search?: string;
	status?: "all" | "Draft" | "Published" | "Archived";
	priority?: "all" | "Low" | "Medium" | "High";
	authorId?: string;
	userId?: string;
	page?: number;
	limit?: number;
}

export interface CommentFilters {
	page?: number;
	limit?: number;
}

export interface AnnouncementPagination {
	currentPage: number;
	totalPages: number;
	totalItems: number;
	itemsPerPage: number;
}

export interface CommentPagination {
	currentPage: number;
	totalPages: number;
	totalItems: number;
	itemsPerPage: number;
}

export interface AnnouncementResponse {
	announcements: Announcement[];
	pagination: AnnouncementPagination;
}

export interface CommentResponse {
	comments: AnnouncementComment[];
	pagination: CommentPagination;
}

export interface AnnouncementStats {
	totalAnnouncements: number;
	publishedAnnouncements: number;
	draftAnnouncements: number;
	archivedAnnouncements: number;
	pinnedAnnouncements: number;
	totalViews: number;
}

// Mock data for development
export const MOCK_ANNOUNCEMENTS: Announcement[] = [
	{
		id: "1",
		title: "Welcome to the New Academic Year",
		content: "We are excited to welcome all students to the new academic year. Please make sure to check your schedules and attend all orientation sessions.",
		priority: "High",
		status: "Published",
		authorId: "1",
		expiryDate: "2024-12-31T23:59:59Z",
		isPinned: true,
		views: 150,
		createdAt: "2024-01-01T00:00:00Z",
		updatedAt: "2024-01-01T00:00:00Z",
		author: {
			id: "1",
			firstName: "Dr. Maria",
			lastName: "Santos",
			email: "maria.santos@omsc.edu.ph",
		},
		targets: [
			{
				id: "1",
				announcementId: "1",
				targetType: "all",
				createdAt: "2024-01-01T00:00:00Z",
			},
		],
		comments: [],
		commentCount: 0,
	},
	{
		id: "2",
		title: "IT Department Meeting",
		content: "There will be a department meeting next Friday at 2:00 PM in the main conference room. All faculty members are required to attend.",
		priority: "Medium",
		status: "Published",
		authorId: "2",
		expiryDate: "2024-02-15T23:59:59Z",
		isPinned: false,
		views: 45,
		createdAt: "2024-01-02T00:00:00Z",
		updatedAt: "2024-01-02T00:00:00Z",
		author: {
			id: "2",
			firstName: "Prof. Juan",
			lastName: "Dela Cruz",
			email: "juan.delacruz@omsc.edu.ph",
		},
		targets: [
			{
				id: "2",
				announcementId: "2",
				targetType: "department",
				targetId: "it-dept",
				createdAt: "2024-01-02T00:00:00Z",
			},
		],
		comments: [],
		commentCount: 0,
	},
	{
		id: "3",
		title: "Course Registration Deadline",
		content: "The deadline for course registration is approaching. Please make sure to register for your courses before the deadline to avoid any issues.",
		priority: "High",
		status: "Published",
		authorId: "1",
		expiryDate: "2024-01-31T23:59:59Z",
		isPinned: true,
		views: 200,
		createdAt: "2024-01-03T00:00:00Z",
		updatedAt: "2024-01-03T00:00:00Z",
		author: {
			id: "1",
			firstName: "Dr. Maria",
			lastName: "Santos",
			email: "maria.santos@omsc.edu.ph",
		},
		targets: [
			{
				id: "3",
				announcementId: "3",
				targetType: "all",
				createdAt: "2024-01-03T00:00:00Z",
			},
		],
		comments: [],
		commentCount: 0,
	},
	{
		id: "4",
		title: "Library Hours Update",
		content: "The library will have extended hours during the examination period. New hours: Monday to Friday 7:00 AM to 10:00 PM, Saturday 8:00 AM to 6:00 PM.",
		priority: "Low",
		status: "Published",
		authorId: "3",
		expiryDate: "2024-03-31T23:59:59Z",
		isPinned: false,
		views: 78,
		createdAt: "2024-01-04T00:00:00Z",
		updatedAt: "2024-01-04T00:00:00Z",
		author: {
			id: "3",
			firstName: "Ms. Ana",
			lastName: "Garcia",
			email: "ana.garcia@omsc.edu.ph",
		},
		targets: [
			{
				id: "4",
				announcementId: "4",
				targetType: "all",
				createdAt: "2024-01-04T00:00:00Z",
			},
		],
		comments: [],
		commentCount: 0,
	},
	{
		id: "5",
		title: "Draft: New Policy Guidelines",
		content: "This is a draft of the new policy guidelines that will be implemented next semester. Please review and provide feedback.",
		priority: "Medium",
		status: "Draft",
		authorId: "1",
		expiryDate: "2024-06-30T23:59:59Z",
		isPinned: false,
		views: 12,
		createdAt: "2024-01-05T00:00:00Z",
		updatedAt: "2024-01-05T00:00:00Z",
		author: {
			id: "1",
			firstName: "Dr. Maria",
			lastName: "Santos",
			email: "maria.santos@omsc.edu.ph",
		},
		targets: [
			{
				id: "5",
				announcementId: "5",
				targetType: "department",
				targetId: "admin-dept",
				createdAt: "2024-01-05T00:00:00Z",
			},
		],
		comments: [],
		commentCount: 0,
	},
];

export const PRIORITY_OPTIONS = [
	{ value: "Low", label: "Low Priority" },
	{ value: "Medium", label: "Medium Priority" },
	{ value: "High", label: "High Priority" },
];

export const STATUS_OPTIONS = [
	{ value: "all", label: "All Status" },
	{ value: "Draft", label: "Draft" },
	{ value: "Published", label: "Published" },
	{ value: "Archived", label: "Archived" },
];

export const TARGET_TYPE_OPTIONS = [
	{ value: "all", label: "All Users" },
	{ value: "section", label: "Specific Section" },
	{ value: "course", label: "Specific Course" },
	{ value: "department", label: "Specific Department" },
];