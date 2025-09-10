export interface Report {
	id: string;
	studentId: string;
	title: string;
	content: string;
	type: "weekly" | "monthly" | "final";
	status: "draft" | "submitted" | "approved" | "rejected";
	dueDate: string;
	submittedDate?: string;
	approvedDate?: string;
	feedback?: string;
	attachments?: string[];
	createdAt: string;
	updatedAt?: string;
}

export interface WeeklyReport {
	id: number;
	weekNumber: number;
	studentId: string;
	studentName: string;
	studentAvatar?: string;
	submittedAt: string;
	status: "Pending" | "Approved" | "Returned";
	title: string;
	summary: string;
	hoursLogged: number;
	activities: string[];
	learnings: string;
	challenges: string;
	rating?: number;
	feedback: string;
	fileUrl: string;
}

export interface NarrativeReport {
	id: number;
	studentId: string;
	studentName: string;
	studentAvatar?: string;
	submittedAt: string;
	status: "Pending" | "Approved" | "Returned";
	title: string;
	summary: string;
	wordCount: number;
	sections: {
		introduction: string;
		experiences: string;
		challenges: string;
		learnings: string;
		conclusion: string;
	};
	rating?: number;
	feedback: string;
	fileUrl: string;
}

export interface ReportTemplate {
	id: number;
	title: string;
	description: string;
	type: "Weekly" | "Narrative" | "Final" | "Project";
	sections: string[];
	instructions: string;
	minWordCount: number;
	maxWordCount: number;
	courses: string[];
	isRequired: boolean;
	isActive: boolean;
	createdAt: string;
	usageCount: number;
}

// Sample reports data (basic)
export const REPORTS: Report[] = [
	{
		id: "rep-001",
		studentId: "2021-00001",
		title: "Weekly Report #8",
		content:
			"This week I focused on system maintenance and user support. Completed database optimization tasks and resolved several technical issues reported by users.",
		type: "weekly",
		status: "submitted",
		dueDate: "2024-01-17",
		submittedDate: "2024-01-15",
		feedback: "Good progress on project tasks",
		attachments: ["weekly_report_8.pdf"],
		createdAt: "2024-01-15T10:00:00Z",
	},
	{
		id: "rep-002",
		studentId: "2021-00001",
		title: "Weekly Report #7",
		content:
			"Completed documentation for the new system features and conducted user training sessions.",
		type: "weekly",
		status: "approved",
		dueDate: "2024-01-10",
		submittedDate: "2024-01-08",
		approvedDate: "2024-01-09",
		feedback: "Excellent work on documentation",
		attachments: ["weekly_report_7.pdf"],
		createdAt: "2024-01-08T10:00:00Z",
	},
	{
		id: "rep-003",
		studentId: "2021-00002",
		title: "Monthly Progress Report",
		content:
			"Comprehensive analysis of the software development project progress, including code reviews and testing phases.",
		type: "monthly",
		status: "approved",
		dueDate: "2024-01-05",
		submittedDate: "2024-01-01",
		approvedDate: "2024-01-03",
		feedback: "Comprehensive analysis",
		attachments: ["monthly_progress_jan.pdf"],
		createdAt: "2024-01-01T10:00:00Z",
	},
];

// Weekly reports for instructor review
export const WEEKLY_REPORTS: WeeklyReport[] = [
	{
		id: 1,
		weekNumber: 8,
		studentId: "2021-00001",
		studentName: "Juan Dela Cruz",
		studentAvatar: "/placeholder.svg?height=32&width=32",
		submittedAt: "2024-01-15T16:30:00Z",
		status: "Pending",
		title: "Week 8 - Database Development",
		summary:
			"Worked on database schema design and implementation of user authentication system.",
		hoursLogged: 40,
		activities: [
			"Database schema design",
			"User authentication implementation",
			"Testing and debugging",
			"Documentation updates",
		],
		learnings:
			"Learned about database normalization and security best practices.",
		challenges:
			"Had difficulty with complex SQL queries, but resolved with mentor guidance.",
		rating: undefined,
		feedback: "",
		fileUrl: "/reports/week8-001.pdf",
	},
	{
		id: 2,
		weekNumber: 7,
		studentId: "2021-00002",
		studentName: "Maria Santos",
		studentAvatar: "/placeholder.svg?height=32&width=32",
		submittedAt: "2024-01-08T14:20:00Z",
		status: "Approved",
		title: "Week 7 - Frontend Development",
		summary:
			"Developed responsive user interface components using React and Tailwind CSS.",
		hoursLogged: 38,
		activities: [
			"React component development",
			"Responsive design implementation",
			"API integration",
			"Code review sessions",
		],
		learnings: "Enhanced skills in React hooks and state management.",
		challenges: "Responsive design challenges on mobile devices.",
		rating: 4,
		feedback: "Excellent work on the UI components. Keep up the good work!",
		fileUrl: "/reports/week7-002.pdf",
	},
	{
		id: 3,
		weekNumber: 8,
		studentId: "2021-00003",
		studentName: "Pedro Rodriguez",
		studentAvatar: "/placeholder.svg?height=32&width=32",
		submittedAt: "2024-01-15T10:15:00Z",
		status: "Returned",
		title: "Week 8 - System Testing",
		summary: "Conducted system testing and bug fixes.",
		hoursLogged: 35,
		activities: ["System testing", "Bug identification", "Documentation"],
		learnings: "Learned about testing methodologies.",
		challenges: "Limited testing tools available.",
		rating: undefined,
		feedback:
			"Please provide more detailed activities and include test cases documentation.",
		fileUrl: "/reports/week8-003.pdf",
	},
];

// Narrative reports for instructor review
export const NARRATIVE_REPORTS: NarrativeReport[] = [
	{
		id: 1,
		studentId: "2021-00001",
		studentName: "Juan Dela Cruz",
		studentAvatar: "/placeholder.svg?height=32&width=32",
		submittedAt: "2024-01-15T16:30:00Z",
		status: "Pending",
		title: "Mid-Term Narrative Report",
		summary:
			"Comprehensive reflection on the first half of my practicum experience at OMSC IT Department.",
		wordCount: 1250,
		sections: {
			introduction:
				"Detailed introduction about the practicum placement and objectives.",
			experiences:
				"Rich description of daily activities, projects worked on, and skills developed.",
			challenges:
				"Honest reflection on difficulties faced and how they were overcome.",
			learnings:
				"Key insights gained and how they relate to academic coursework.",
			conclusion:
				"Summary of growth and future goals for the remainder of the practicum.",
		},
		rating: undefined,
		feedback: "",
		fileUrl: "/reports/narrative-001.pdf",
	},
	{
		id: 2,
		studentId: "2021-00002",
		studentName: "Maria Santos",
		studentAvatar: "/placeholder.svg?height=32&width=32",
		submittedAt: "2024-01-10T14:20:00Z",
		status: "Approved",
		title: "Final Narrative Report",
		summary:
			"Complete reflection on the entire practicum experience at Municipal IT Office.",
		wordCount: 2100,
		sections: {
			introduction:
				"Overview of the practicum program and personal objectives.",
			experiences:
				"Detailed account of projects, responsibilities, and professional growth.",
			challenges:
				"Analysis of obstacles encountered and problem-solving approaches.",
			learnings: "Comprehensive review of technical and soft skills acquired.",
			conclusion: "Final thoughts on career readiness and future aspirations.",
		},
		rating: 5,
		feedback:
			"Excellent narrative report with deep reflection and professional insights. Well-structured and comprehensive.",
		fileUrl: "/reports/narrative-002.pdf",
	},
	{
		id: 3,
		studentId: "2021-00003",
		studentName: "Pedro Rodriguez",
		studentAvatar: "/placeholder.svg?height=32&width=32",
		submittedAt: "2024-01-08T10:15:00Z",
		status: "Returned",
		title: "Mid-Term Narrative Report",
		summary: "Reflection on practicum experience at Provincial Capitol.",
		wordCount: 800,
		sections: {
			introduction: "Brief overview of placement and initial expectations.",
			experiences: "General description of tasks and activities.",
			challenges: "Limited discussion of difficulties faced.",
			learnings: "Basic overview of skills learned.",
			conclusion: "Short summary of experience so far.",
		},
		rating: undefined,
		feedback:
			"Report needs more depth and reflection. Please expand on specific experiences and provide more detailed analysis of learnings.",
		fileUrl: "/reports/narrative-003.pdf",
	},
];

// Report templates
export const REPORT_TEMPLATES: ReportTemplate[] = [
	{
		id: 1,
		title: "Weekly Progress Report",
		description:
			"Standard weekly report template for tracking student progress",
		type: "Weekly",
		sections: [
			"Summary of Activities",
			"Hours Logged",
			"Key Accomplishments",
			"Challenges Faced",
			"Learning Outcomes",
			"Next Week's Goals",
		],
		instructions:
			"Submit a detailed weekly report covering all activities, accomplishments, and learnings from the past week.",
		minWordCount: 500,
		maxWordCount: 1000,
		courses: ["BSIT"],
		isRequired: true,
		isActive: true,
		createdAt: "2024-01-10",
		usageCount: 156,
	},
	{
		id: 2,
		title: "Mid-Term Narrative Report",
		description: "Comprehensive reflection report for mid-term evaluation",
		type: "Narrative",
		sections: [
			"Introduction and Objectives",
			"Detailed Experience Description",
			"Skills Development Analysis",
			"Challenges and Solutions",
			"Professional Growth Reflection",
			"Future Goals and Expectations",
		],
		instructions:
			"Provide a comprehensive narrative reflection on your practicum experience covering the first half of the semester.",
		minWordCount: 1500,
		maxWordCount: 2500,
		courses: ["BSIT"],
		isRequired: true,
		isActive: true,
		createdAt: "2024-01-08",
		usageCount: 42,
	},
	{
		id: 3,
		title: "Final Practicum Report",
		description: "Complete practicum experience summary and evaluation",
		type: "Final",
		sections: [
			"Executive Summary",
			"Practicum Overview",
			"Technical Skills Acquired",
			"Soft Skills Development",
			"Project Contributions",
			"Industry Insights",
			"Career Readiness Assessment",
			"Recommendations",
		],
		instructions:
			"Submit a comprehensive final report summarizing your entire practicum experience and professional development.",
		minWordCount: 2000,
		maxWordCount: 4000,
		courses: ["BSIT"],
		isRequired: true,
		isActive: true,
		createdAt: "2024-01-05",
		usageCount: 38,
	},
	{
		id: 4,
		title: "Technical Project Report",
		description: "Detailed report on specific technical projects completed",
		type: "Project",
		sections: [
			"Project Overview",
			"Technical Requirements",
			"Implementation Details",
			"Technologies Used",
			"Challenges and Solutions",
			"Results and Outcomes",
			"Lessons Learned",
		],
		instructions:
			"Document a specific technical project you worked on during your practicum, including technical details and outcomes.",
		minWordCount: 800,
		maxWordCount: 1500,
		courses: ["BSIT"],
		isRequired: false,
		isActive: true,
		createdAt: "2024-01-03",
		usageCount: 24,
	},
];

// Utility functions
export const getReportsByStudentId = (studentId: string): Report[] => {
	return REPORTS.filter((report) => report.studentId === studentId);
};

export const getWeeklyReportsByStudentId = (
	studentId: string
): WeeklyReport[] => {
	return WEEKLY_REPORTS.filter((report) => report.studentId === studentId);
};

export const getNarrativeReportsByStudentId = (
	studentId: string
): NarrativeReport[] => {
	return NARRATIVE_REPORTS.filter((report) => report.studentId === studentId);
};

export const getWeeklyReportsByStatus = (
	status: "Pending" | "Approved" | "Returned"
): WeeklyReport[] => {
	return WEEKLY_REPORTS.filter((report) => report.status === status);
};

export const getNarrativeReportsByStatus = (
	status: "Pending" | "Approved" | "Returned"
): NarrativeReport[] => {
	return NARRATIVE_REPORTS.filter((report) => report.status === status);
};

export const getReportTemplatesByType = (
	type: "Weekly" | "Narrative" | "Final" | "Project"
): ReportTemplate[] => {
	return REPORT_TEMPLATES.filter((template) => template.type === type);
};

export const getReportTemplatesByCourse = (
	course: string
): ReportTemplate[] => {
	return REPORT_TEMPLATES.filter((template) =>
		template.courses.includes(course)
	);
};

export const getActiveReportTemplates = (): ReportTemplate[] => {
	return REPORT_TEMPLATES.filter((template) => template.isActive);
};

export const getRequiredReportTemplates = (): ReportTemplate[] => {
	return REPORT_TEMPLATES.filter((template) => template.isRequired);
};

// Status and type options for forms
export const REPORT_STATUS_OPTIONS = [
	{ value: "draft", label: "Draft" },
	{ value: "submitted", label: "Submitted" },
	{ value: "approved", label: "Approved" },
	{ value: "rejected", label: "Rejected" },
];

export const REPORT_TYPE_OPTIONS = [
	{ value: "weekly", label: "Weekly Report" },
	{ value: "monthly", label: "Monthly Report" },
	{ value: "final", label: "Final Report" },
];

export const REPORT_TEMPLATE_TYPE_OPTIONS = [
	{ value: "Weekly", label: "Weekly" },
	{ value: "Narrative", label: "Narrative" },
	{ value: "Final", label: "Final" },
	{ value: "Project", label: "Project" },
];

export const REPORT_REVIEW_STATUS_OPTIONS = [
	{ value: "Pending", label: "Pending" },
	{ value: "Approved", label: "Approved" },
	{ value: "Returned", label: "Returned" },
];

export const RATING_OPTIONS = [
	{ value: "1", label: "1 Star - Poor" },
	{ value: "2", label: "2 Stars - Fair" },
	{ value: "3", label: "3 Stars - Good" },
	{ value: "4", label: "4 Stars - Very Good" },
	{ value: "5", label: "5 Stars - Excellent" },
];

