export interface Agency {
	id: string;
	name: string;
	address: string;
	contactPerson: string;
	contactRole: string;
	contactPhone: string;
	contactEmail: string;
	branchType: "Main" | "Branch";
	openingTime?: string;
	closingTime?: string;
	isActive: boolean;
	latitude?: number;
	longitude?: number;
	createdAt: string;
	updatedAt: string;
	supervisors?: Supervisor[];
	practicums?: Practicum[];
}

export interface Supervisor {
	id: string;
	agencyId: string;
	name: string;
	email: string;
	phone: string;
	position: string;
	department?: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface Practicum {
	id: string;
	studentId: string;
	agencyId: string;
	supervisorId: string;
	position: string;
	startDate: string;
	endDate: string;
	totalHours: number;
	completedHours: number;
	workSetup: "On-site" | "Hybrid" | "Work From Home";
	status: "active" | "completed" | "inactive";
	createdAt: string;
	updatedAt: string;
}

export interface AgencyFormData {
	name: string;
	address: string;
	contactPerson: string;
	contactRole: string;
	contactPhone: string;
	contactEmail: string;
	branchType: "Main" | "Branch";
	openingTime?: string;
	closingTime?: string;
	isActive?: boolean;
	latitude?: number;
	longitude?: number;
}

export interface AgencyFilters {
	search?: string;
	status?: "all" | "active" | "inactive";
	branchType?: "all" | "Main" | "Branch";
}

export interface AgencyPagination {
	currentPage: number;
	totalPages: number;
	totalItems: number;
	itemsPerPage: number;
}

export interface AgencyResponse {
	agencies: Agency[];
	pagination: AgencyPagination;
}

// Mock data for development
export const MOCK_AGENCIES: Agency[] = [
	{
		id: "1",
		name: "OMSC IT Department",
		address: "Occidental Mindoro State College, San Jose, Occidental Mindoro",
		contactPerson: "Dr. Juan Dela Cruz",
		contactRole: "IT Director",
		contactPhone: "+63 912 345 6789",
		contactEmail: "juan.delacruz@omsc.edu.ph",
		branchType: "Main",
		openingTime: "08:00",
		closingTime: "17:00",
		isActive: true,
		latitude: 12.3601,
		longitude: 121.0444,
		createdAt: "2024-01-01T00:00:00Z",
		updatedAt: "2024-01-01T00:00:00Z",
		supervisors: [
			{
				id: "1",
				agencyId: "1",
				name: "Dr. Juan Dela Cruz",
				email: "juan.delacruz@omsc.edu.ph",
				phone: "+63 912 345 6789",
				position: "IT Director",
				department: "Information Technology",
				isActive: true,
				createdAt: "2024-01-01T00:00:00Z",
				updatedAt: "2024-01-01T00:00:00Z",
			},
		],
		practicums: [],
	},
	{
		id: "2",
		name: "Metro Bank",
		address: "Metro Bank Building, Makati City, Philippines",
		contactPerson: "Ms. Sarah Johnson",
		contactRole: "HR Manager",
		contactPhone: "+63 912 345 6790",
		contactEmail: "sarah.johnson@metrobank.com",
		branchType: "Main",
		openingTime: "09:00",
		closingTime: "18:00",
		isActive: true,
		latitude: 14.5547,
		longitude: 121.0244,
		createdAt: "2024-01-02T00:00:00Z",
		updatedAt: "2024-01-02T00:00:00Z",
		supervisors: [
			{
				id: "2",
				agencyId: "2",
				name: "Ms. Sarah Johnson",
				email: "sarah.johnson@metrobank.com",
				phone: "+63 912 345 6790",
				position: "HR Manager",
				department: "Human Resources",
				isActive: true,
				createdAt: "2024-01-02T00:00:00Z",
				updatedAt: "2024-01-02T00:00:00Z",
			},
		],
		practicums: [],
	},
	{
		id: "3",
		name: "Provincial Capitol",
		address: "Provincial Capitol Building, Mamburao, Occidental Mindoro",
		contactPerson: "Engr. Roberto Santos",
		contactRole: "IT Officer",
		contactPhone: "+63 912 345 6791",
		contactEmail: "roberto.santos@capitol.gov.ph",
		branchType: "Main",
		openingTime: "08:00",
		closingTime: "17:00",
		isActive: true,
		latitude: 13.2236,
		longitude: 120.5961,
		createdAt: "2024-01-03T00:00:00Z",
		updatedAt: "2024-01-03T00:00:00Z",
		supervisors: [
			{
				id: "3",
				agencyId: "3",
				name: "Engr. Roberto Santos",
				email: "roberto.santos@capitol.gov.ph",
				phone: "+63 912 345 6791",
				position: "IT Officer",
				department: "Information Technology",
				isActive: true,
				createdAt: "2024-01-03T00:00:00Z",
				updatedAt: "2024-01-03T00:00:00Z",
			},
		],
		practicums: [],
	},
	{
		id: "4",
		name: "Sunshine Elementary School",
		address: "Sunshine Elementary School, San Jose, Occidental Mindoro",
		contactPerson: "Mrs. Maria Rodriguez",
		contactRole: "Principal",
		contactPhone: "+63 912 345 6792",
		contactEmail: "maria.rodriguez@sunshine.edu.ph",
		branchType: "Main",
		openingTime: "07:00",
		closingTime: "16:00",
		isActive: true,
		latitude: 12.3589,
		longitude: 121.0412,
		createdAt: "2024-01-04T00:00:00Z",
		updatedAt: "2024-01-04T00:00:00Z",
		supervisors: [
			{
				id: "4",
				agencyId: "4",
				name: "Mrs. Maria Rodriguez",
				email: "maria.rodriguez@sunshine.edu.ph",
				phone: "+63 912 345 6792",
				position: "Principal",
				department: "Administration",
				isActive: true,
				createdAt: "2024-01-04T00:00:00Z",
				updatedAt: "2024-01-04T00:00:00Z",
			},
		],
		practicums: [],
	},
	{
		id: "5",
		name: "Tech Solutions Inc.",
		address: "Tech Solutions Building, Quezon City, Philippines",
		contactPerson: "Mr. John Smith",
		contactRole: "Project Manager",
		contactPhone: "+63 912 345 6793",
		contactEmail: "john.smith@techsolutions.com",
		branchType: "Branch",
		openingTime: "09:00",
		closingTime: "18:00",
		isActive: false,
		latitude: 14.6760,
		longitude: 121.0437,
		createdAt: "2024-01-05T00:00:00Z",
		updatedAt: "2024-01-05T00:00:00Z",
		supervisors: [],
		practicums: [],
	},
];

export const BRANCH_TYPE_OPTIONS = [
	{ value: "Main", label: "Main Office" },
	{ value: "Branch", label: "Branch Office" },
];

export const STATUS_OPTIONS = [
	{ value: "all", label: "All Status" },
	{ value: "active", label: "Active" },
	{ value: "inactive", label: "Inactive" },
];
