export interface Department {
	id: string;
	name: string;
	code: string;
	description?: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	courses?: Course[];
}

export interface Course {
	id: string;
	name: string;
	code: string;
	description?: string;
	departmentId: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	department?: Department;
	sections?: Section[];
}

export interface Section {
	id: string;
	name: string;
	code: string;
	description?: string;
	courseId: string;
	year: string;
	semester: string;
	academicYear: string;
	maxStudents: number;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	course?: Course;
}

export interface DepartmentFormData {
	name: string;
	code: string;
	description?: string;
	isActive?: boolean;
}

export interface CourseFormData {
	name: string;
	code: string;
	description?: string;
	departmentId: string;
	isActive?: boolean;
}

export interface SectionFormData {
	name: string;
	code: string;
	description?: string;
	courseId: string;
	year: string;
	semester: string;
	academicYear: string;
	maxStudents?: number;
	isActive?: boolean;
}

export interface DepartmentFilters {
	search?: string;
	status?: "all" | "active" | "inactive";
}

export interface CourseFilters {
	search?: string;
	status?: "all" | "active" | "inactive";
	departmentId?: string;
}

export interface SectionFilters {
	search?: string;
	status?: "all" | "active" | "inactive";
	courseId?: string;
	year?: string;
	semester?: string;
}

export interface Pagination {
	currentPage: number;
	totalPages: number;
	totalItems: number;
	itemsPerPage: number;
}

export interface DepartmentResponse {
	departments: Department[];
	pagination: Pagination;
}

export interface CourseResponse {
	courses: Course[];
	pagination: Pagination;
}

export interface SectionResponse {
	sections: Section[];
	pagination: Pagination;
}

// Mock data for development
export const MOCK_DEPARTMENTS: Department[] = [
	{
		id: "1",
		name: "College of Arts, Sciences, and Technology",
		code: "CAST",
		description: "Offers programs in computer science, information technology, and related fields",
		isActive: true,
		createdAt: "2024-01-01T00:00:00Z",
		updatedAt: "2024-01-01T00:00:00Z",
		courses: [],
	},
	{
		id: "2",
		name: "College of Teachers in Education",
		code: "CTE",
		description: "Offers programs in education and teacher training",
		isActive: true,
		createdAt: "2024-01-02T00:00:00Z",
		updatedAt: "2024-01-02T00:00:00Z",
		courses: [],
	},
	{
		id: "3",
		name: "College of Business Administration and Management",
		code: "CBAM",
		description: "Offers programs in business administration and management",
		isActive: true,
		createdAt: "2024-01-03T00:00:00Z",
		updatedAt: "2024-01-03T00:00:00Z",
		courses: [],
	},
];

export const MOCK_COURSES: Course[] = [
	{
		id: "1",
		name: "Bachelor of Science in Information Technology",
		code: "BSIT",
		description: "4-year program focusing on information technology and computer systems",
		departmentId: "1",
		isActive: true,
		createdAt: "2024-01-01T00:00:00Z",
		updatedAt: "2024-01-01T00:00:00Z",
		sections: [],
	},
	{
		id: "2",
		name: "Bachelor of Science in Computer Science",
		code: "BSCS",
		description: "4-year program focusing on computer science and software development",
		departmentId: "1",
		isActive: true,
		createdAt: "2024-01-02T00:00:00Z",
		updatedAt: "2024-01-02T00:00:00Z",
		sections: [],
	},
	{
		id: "3",
		name: "Bachelor of Elementary Education",
		code: "BEED",
		description: "4-year program for elementary education teachers",
		departmentId: "2",
		isActive: true,
		createdAt: "2024-01-03T00:00:00Z",
		updatedAt: "2024-01-03T00:00:00Z",
		sections: [],
	},
];

export const MOCK_SECTIONS: Section[] = [
	{
		id: "1",
		name: "BSIT 4A",
		code: "BSIT-4A",
		description: "Fourth year BSIT Section A",
		courseId: "1",
		year: "4th",
		semester: "1st",
		academicYear: "2024-2025",
		maxStudents: 50,
		isActive: true,
		createdAt: "2024-01-01T00:00:00Z",
		updatedAt: "2024-01-01T00:00:00Z",
	},
	{
		id: "2",
		name: "BSIT 4B",
		code: "BSIT-4B",
		description: "Fourth year BSIT Section B",
		courseId: "1",
		year: "4th",
		semester: "1st",
		academicYear: "2024-2025",
		maxStudents: 50,
		isActive: true,
		createdAt: "2024-01-02T00:00:00Z",
		updatedAt: "2024-01-02T00:00:00Z",
	},
	{
		id: "3",
		name: "BSCS 4A",
		code: "BSCS-4A",
		description: "Fourth year BSCS Section A",
		courseId: "2",
		year: "4th",
		semester: "1st",
		academicYear: "2024-2025",
		maxStudents: 40,
		isActive: true,
		createdAt: "2024-01-03T00:00:00Z",
		updatedAt: "2024-01-03T00:00:00Z",
	},
];

export const YEAR_OPTIONS = [
	{ value: "1st", label: "1st Year" },
	{ value: "2nd", label: "2nd Year" },
	{ value: "3rd", label: "3rd Year" },
	{ value: "4th", label: "4th Year" },
];

export const SEMESTER_OPTIONS = [
	{ value: "1st", label: "1st Semester" },
	{ value: "2nd", label: "2nd Semester" },
	{ value: "Summer", label: "Summer" },
];

export const ACADEMIC_YEAR_OPTIONS = [
	{ value: "2024-2025", label: "2024-2025" },
	{ value: "2025-2026", label: "2025-2026" },
	{ value: "2026-2027", label: "2026-2027" },
	{ value: "2027-2028", label: "2027-2028" },
];

export const STATUS_OPTIONS = [
	{ value: "all", label: "All Status" },
	{ value: "active", label: "Active" },
	{ value: "inactive", label: "Inactive" },
];
