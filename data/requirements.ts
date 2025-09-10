export interface Requirement {
	id: string;
	studentId: string;
	title: string;
	description: string;
	category:
		| "health"
		| "reports"
		| "training"
		| "academic"
		| "evaluation"
		| "legal";
	status: "pending" | "submitted" | "approved" | "rejected" | "in-progress";
	priority: "urgent" | "high" | "medium" | "low";
	dueDate: string;
	submittedDate?: string;
	approvedDate?: string;
	feedback?: string;
	attachments?: string[];
	createdAt: string;
	updatedAt?: string;
}

export interface RequirementSubmission {
	id: number;
	title: string;
	studentId: string;
	studentName: string;
	studentAvatar?: string;
	submittedAt: string;
	status: "Pending" | "Approved" | "Returned";
	fileUrl: string;
	fileName: string;
	fileSize: string;
	comments: RequirementComment[];
	priority: "High" | "Medium" | "Low";
}

export interface RequirementComment {
	id: number;
	text: string;
	createdAt: string;
	author: string;
}

export interface RequirementTemplate {
	id: number;
	title: string;
	description: string;
	priority: "High" | "Medium" | "Low";
	isRequired: boolean;
	templateFile?: TemplateFile;
	fileTypes: string[];
	maxFileSize: string;
	instructions: string;
	courses: string[];
	sections: string[];
	isActive: boolean;
	createdAt: string;
	usageCount: number;
	downloadCount: number;
}

export interface TemplateFile {
	name: string;
	size: string;
	type: string;
	uploadedAt: string;
}

export interface RequirementType {
	name: string;
	total: number;
	completed: number;
	percentage: number;
}

// Sample requirements data
export const REQUIREMENTS: Requirement[] = [
	{
		id: "req-001",
		studentId: "2021-00001",
		title: "Medical Certificate",
		description: "Valid medical certificate from authorized physician",
		category: "health",
		status: "pending",
		priority: "urgent",
		dueDate: "2024-01-20",
		createdAt: "2024-01-01T00:00:00Z",
	},
	{
		id: "req-002",
		studentId: "2021-00001",
		title: "Weekly Report #8",
		description: "Weekly progress report for week 8",
		category: "reports",
		status: "submitted",
		priority: "high",
		dueDate: "2024-01-17",
		submittedDate: "2024-01-15",
		feedback: "Good progress documentation",
		createdAt: "2024-01-01T00:00:00Z",
	},
	{
		id: "req-003",
		studentId: "2021-00001",
		title: "Training Certificate",
		description: "Safety training completion certificate",
		category: "training",
		status: "approved",
		priority: "medium",
		dueDate: "2024-01-10",
		submittedDate: "2024-01-08",
		approvedDate: "2024-01-09",
		feedback: "Certificate validated successfully",
		createdAt: "2024-01-01T00:00:00Z",
	},
	{
		id: "req-004",
		studentId: "2021-00002",
		title: "Portfolio Documentation",
		description: "Complete portfolio of project work",
		category: "academic",
		status: "in-progress",
		priority: "high",
		dueDate: "2024-02-01",
		createdAt: "2024-01-01T00:00:00Z",
	},
	{
		id: "req-005",
		studentId: "2021-00002",
		title: "Supervisor Evaluation",
		description: "Mid-term evaluation from supervisor",
		category: "evaluation",
		status: "approved",
		priority: "high",
		dueDate: "2024-01-05",
		submittedDate: "2024-01-03",
		approvedDate: "2024-01-04",
		feedback: "Excellent performance rating",
		createdAt: "2024-01-01T00:00:00Z",
	},
];

// Requirement submissions for instructor review
export const REQUIREMENT_SUBMISSIONS: RequirementSubmission[] = [
	{
		id: 1,
		title: "Medical Certificate",
		studentId: "2021-00001",
		studentName: "Juan Dela Cruz",
		studentAvatar: "/placeholder.svg?height=32&width=32",
		submittedAt: "2024-01-15T10:30:00Z",
		status: "Pending",
		fileUrl: "/documents/medical-cert-001.pdf",
		fileName: "medical_certificate.pdf",
		fileSize: "2.3 MB",
		comments: [],
		priority: "High",
	},
	{
		id: 2,
		title: "Company MOA",
		studentId: "2021-00002",
		studentName: "Maria Santos",
		studentAvatar: "/placeholder.svg?height=32&width=32",
		submittedAt: "2024-01-14T14:20:00Z",
		status: "Approved",
		fileUrl: "/documents/moa-002.pdf",
		fileName: "company_moa.pdf",
		fileSize: "1.8 MB",
		comments: [
			{
				id: 1,
				text: "Document looks good. Approved.",
				createdAt: "2024-01-14T15:00:00Z",
				author: "Prof. Dela Cruz",
			},
		],
		priority: "Medium",
	},
	{
		id: 3,
		title: "Insurance Certificate",
		studentId: "2021-00003",
		studentName: "Pedro Rodriguez",
		studentAvatar: "/placeholder.svg?height=32&width=32",
		submittedAt: "2024-01-13T09:15:00Z",
		status: "Returned",
		fileUrl: "/documents/insurance-003.pdf",
		fileName: "insurance_cert.pdf",
		fileSize: "1.2 MB",
		comments: [
			{
				id: 1,
				text: "Please resubmit with updated expiration date.",
				createdAt: "2024-01-13T11:00:00Z",
				author: "Prof. Dela Cruz",
			},
		],
		priority: "High",
	},
	{
		id: 4,
		title: "Practicum Agreement",
		studentId: "2021-00004",
		studentName: "Ana Garcia",
		studentAvatar: "/placeholder.svg?height=32&width=32",
		submittedAt: "2024-01-12T16:45:00Z",
		status: "Pending",
		fileUrl: "/documents/agreement-004.pdf",
		fileName: "practicum_agreement.pdf",
		fileSize: "3.1 MB",
		comments: [],
		priority: "Medium",
	},
];

// All requirements overview data
export const ALL_REQUIREMENTS: RequirementSubmission[] = [
	{
		id: 1,
		title: "Medical Certificate",
		studentId: "2021-00001",
		studentName: "Juan Dela Cruz",
		studentAvatar: "/placeholder.svg?height=32&width=32",
		submittedAt: "2024-01-15T10:30:00Z",
		status: "Approved",
		fileUrl: "/documents/medical-cert-001.pdf",
		fileName: "medical_certificate.pdf",
		fileSize: "2.3 MB",
		comments: [],
		priority: "High",
	},
	{
		id: 2,
		title: "Company MOA",
		studentId: "2021-00002",
		studentName: "Maria Santos",
		studentAvatar: "/placeholder.svg?height=32&width=32",
		submittedAt: "2024-01-14T14:20:00Z",
		status: "Approved",
		fileUrl: "/documents/moa-002.pdf",
		fileName: "company_moa.pdf",
		fileSize: "1.8 MB",
		comments: [],
		priority: "High",
	},
	{
		id: 3,
		title: "Insurance Certificate",
		studentId: "2021-00003",
		studentName: "Pedro Rodriguez",
		studentAvatar: "/placeholder.svg?height=32&width=32",
		submittedAt: "2024-01-13T09:15:00Z",
		status: "Returned",
		fileUrl: "/documents/insurance-003.pdf",
		fileName: "insurance_cert.pdf",
		fileSize: "1.2 MB",
		comments: [],
		priority: "High",
	},
	{
		id: 4,
		title: "Practicum Agreement",
		studentId: "2021-00004",
		studentName: "Ana Garcia",
		studentAvatar: "/placeholder.svg?height=32&width=32",
		submittedAt: "2024-01-12T16:45:00Z",
		status: "Pending",
		fileUrl: "/documents/agreement-004.pdf",
		fileName: "practicum_agreement.pdf",
		fileSize: "3.1 MB",
		comments: [],
		priority: "Medium",
	},
	{
		id: 5,
		title: "Medical Certificate",
		studentId: "2021-00005",
		studentName: "Carlos Mendoza",
		studentAvatar: "/placeholder.svg?height=32&width=32",
		submittedAt: "2024-01-11T08:30:00Z",
		status: "Approved",
		fileUrl: "/documents/medical-cert-005.pdf",
		fileName: "medical_certificate.pdf",
		fileSize: "2.1 MB",
		comments: [],
		priority: "High",
	},
];

// Requirement types and completion rates
export const REQUIREMENT_TYPES: RequirementType[] = [
	{ name: "Medical Certificate", total: 42, completed: 38, percentage: 90 },
	{ name: "Company MOA", total: 42, completed: 35, percentage: 83 },
	{ name: "Insurance Certificate", total: 42, completed: 32, percentage: 76 },
	{ name: "Practicum Agreement", total: 42, completed: 40, percentage: 95 },
	{ name: "Portfolio Submission", total: 42, completed: 15, percentage: 36 },
];

// Requirement templates
export const REQUIREMENT_TEMPLATES: RequirementTemplate[] = [
	{
		id: 1,
		title: "Medical Certificate",
		description: "Valid medical certificate from a licensed physician",
		priority: "High",
		isRequired: true,
		templateFile: {
			name: "medical-certificate-template.docx",
			size: "45KB",
			type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			uploadedAt: "2024-01-10",
		},
		fileTypes: ["PDF", "DOCX"],
		maxFileSize: "5MB",
		instructions:
			"Download the template, fill it out completely, and submit the signed document.",
		courses: ["BSIT"],
		sections: ["BSIT 4A", "BSIT 4B"],
		isActive: true,
		createdAt: "2024-01-10",
		usageCount: 42,
		downloadCount: 156,
	},
	{
		id: 2,
		title: "Company MOA",
		description: "Memorandum of Agreement between student and company",
		priority: "High",
		isRequired: true,
		templateFile: {
			name: "company-moa-template.docx",
			size: "78KB",
			type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			uploadedAt: "2024-01-08",
		},
		fileTypes: ["PDF", "DOCX"],
		maxFileSize: "10MB",
		instructions:
			"Download the MOA template, complete all required fields, and get signatures from both parties.",
		courses: ["BSIT"],
		sections: ["BSIT 4A", "BSIT 4B", "BSIT 4C", "BSIT 4D"],
		isActive: true,
		createdAt: "2024-01-08",
		usageCount: 38,
		downloadCount: 124,
	},
	{
		id: 3,
		title: "Insurance Certificate",
		description: "Valid insurance certificate for practicum coverage",
		priority: "High",
		isRequired: true,
		templateFile: {
			name: "insurance-certificate-template.pdf",
			size: "32KB",
			type: "application/pdf",
			uploadedAt: "2024-01-05",
		},
		fileTypes: ["PDF"],
		maxFileSize: "3MB",
		instructions:
			"Download the template and submit the completed insurance certificate.",
		courses: ["BSIT"],
		sections: ["BSIT 4A", "BSIT 4B", "BSIT 4C", "BSIT 4D"],
		isActive: true,
		createdAt: "2024-01-05",
		usageCount: 35,
		downloadCount: 98,
	},
];

// Utility functions
export const getRequirementsByStudentId = (
	studentId: string
): Requirement[] => {
	return REQUIREMENTS.filter((req) => req.studentId === studentId);
};

export const getRequirementSubmissionsByStudentId = (
	studentId: string
): RequirementSubmission[] => {
	return REQUIREMENT_SUBMISSIONS.filter((sub) => sub.studentId === studentId);
};

export const getRequirementSubmissionsByStatus = (
	status: "Pending" | "Approved" | "Returned"
): RequirementSubmission[] => {
	return REQUIREMENT_SUBMISSIONS.filter((sub) => sub.status === status);
};

export const getRequirementTemplatesByCourse = (
	course: string
): RequirementTemplate[] => {
	return REQUIREMENT_TEMPLATES.filter((template) =>
		template.courses.includes(course)
	);
};

export const getRequirementTemplatesBySection = (
	section: string
): RequirementTemplate[] => {
	return REQUIREMENT_TEMPLATES.filter((template) =>
		template.sections.includes(section)
	);
};

export const getActiveRequirementTemplates = (): RequirementTemplate[] => {
	return REQUIREMENT_TEMPLATES.filter((template) => template.isActive);
};

export const getRequiredTemplates = (): RequirementTemplate[] => {
	return REQUIREMENT_TEMPLATES.filter((template) => template.isRequired);
};

// Status and priority options for forms
export const REQUIREMENT_STATUS_OPTIONS = [
	{ value: "pending", label: "Pending" },
	{ value: "submitted", label: "Submitted" },
	{ value: "approved", label: "Approved" },
	{ value: "rejected", label: "Rejected" },
	{ value: "in-progress", label: "In Progress" },
];

export const REQUIREMENT_CATEGORY_OPTIONS = [
	{ value: "health", label: "Health & Safety" },
	{ value: "reports", label: "Reports" },
	{ value: "training", label: "Training" },
	{ value: "academic", label: "Academic" },
	{ value: "evaluation", label: "Evaluations" },
	{ value: "legal", label: "Legal Documents" },
];

export const PRIORITY_OPTIONS = [
	{ value: "urgent", label: "Urgent" },
	{ value: "high", label: "High" },
	{ value: "medium", label: "Medium" },
	{ value: "low", label: "Low" },
];

export const SUBMISSION_STATUS_OPTIONS = [
	{ value: "Pending", label: "Pending" },
	{ value: "Approved", label: "Approved" },
	{ value: "Returned", label: "Returned" },
];

export const FILE_TYPE_OPTIONS = [
	{ value: "PDF", label: "PDF" },
	{ value: "JPG", label: "JPG" },
	{ value: "PNG", label: "PNG" },
	{ value: "DOC", label: "DOC" },
	{ value: "DOCX", label: "DOCX" },
	{ value: "ZIP", label: "ZIP" },
];

export const MAX_FILE_SIZE_OPTIONS = [
	{ value: "1MB", label: "1 MB" },
	{ value: "3MB", label: "3 MB" },
	{ value: "5MB", label: "5 MB" },
	{ value: "10MB", label: "10 MB" },
	{ value: "25MB", label: "25 MB" },
	{ value: "50MB", label: "50 MB" },
];
