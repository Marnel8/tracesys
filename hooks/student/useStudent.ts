import api from "@/lib/api";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { requirementKeys } from "../requirement/useRequirement";

// Student data interfaces
export interface Student {
	id: string;
	firstName: string;
	lastName: string;
	middleName?: string;
	email: string;
	phone: string;
	age: number;
	gender: string;
	studentId: string;
	avatar?: string;
	role: string;
	isActive: boolean;
	emailVerified: boolean;
	createdAt: string;
	updatedAt: string;
	practicums?: Practicum[];
	enrollments?: Enrollment[];
	requirements?: Requirement[];
	// Optional enriched/computed fields returned by teacher-students API
	computed?: {
		courseName?: string;
		courseCode?: string;
		sectionName?: string;
		academicYear?: string;
		agencyName?: string;
		attendance?: number;
		requirements?: number;
		reports?: number;
	};
}

export interface Practicum {
	id: string;
	position: string;
	startDate: string;
	endDate: string;
	totalHours: number;
	completedHours: number;
	workSetup: string;
	status: string;
	agency?: Agency;
	supervisor?: Supervisor;
}

export interface Agency {
	id: string;
	name: string;
	address: string;
	contactPerson: string;
	contactRole: string;
	contactPhone: string;
	contactEmail: string;
	branchType: string;
	isActive: boolean;
	latitude?: number | null;
	longitude?: number | null;
}

export interface Supervisor {
	id: string;
	name: string;
	email: string;
	phone: string;
	position: string;
	isActive: boolean;
}

export interface Enrollment {
	id: string;
	enrollmentDate: string;
	status: string;
	section?: Section;
}

export interface Section {
	id: string;
	name: string;
	year: string;
	semester: string;
	academicYear: string;
	maxStudents: number;
	isActive: boolean;
	course?: Course;
}

export interface Course {
	id: string;
	name: string;
	code: string;
	description: string;
	credits: number;
}

export interface Requirement {
	id: string;
	title: string;
	description: string;
	category: string;
	priority: string;
	status: string;
	dueDate: string;
	isRequired: boolean;
}

export interface StudentRegistrationParams {
	// Personal Information
	firstName: string;
	lastName: string;
	middleName?: string;
	email: string;
	phone: string;
	age: number;
	gender: string;
	avatar?: File;

	// Academic Information
	studentId: string;
	// IMPORTANT: backend expects department CODE (e.g., "CAST")
	department: string;
	// IMPORTANT: backend expects course CODE (e.g., "BSIT")
	course: string;
	// IMPORTANT: backend expects section NAME (e.g., "4A")
	section: string;
	year: string;
	semester: string;

	// Practicum Information (Optional)
	agency?: string;
	agencyAddress?: string;
	supervisor?: string;
	supervisorEmail?: string;
	supervisorPhone?: string;
	startDate?: string;
	endDate?: string;

	// Account Settings
	password: string;
	sendCredentials?: boolean;
}

export interface UpdateStudentParams {
	id: string;
	firstName?: string;
	lastName?: string;
	middleName?: string;
	email?: string;
	phone?: string;
	age?: number;
	gender?: string;
	avatar?: File;
	studentId?: string;
	address?: string;
	bio?: string;
	
	// Academic Information
	departmentId?: string;
	courseId?: string;
	sectionId?: string;
	yearLevel?: string;
	program?: string;
	year?: string;
	semester?: string;
	
	// Practicum Information
	agencyId?: string;
	supervisorId?: string;
	position?: string;
	startDate?: string;
	endDate?: string;
	totalHours?: number;
	workSetup?: "On-site" | "Hybrid" | "Work From Home";
}

// API functions
const registerStudent = async (studentData: StudentRegistrationParams) => {
	const formData = new FormData();

	// Personal Information
	formData.append("firstName", studentData.firstName);
	formData.append("lastName", studentData.lastName);
	formData.append("email", studentData.email);
	formData.append("phone", studentData.phone);
	formData.append("age", studentData.age.toString());
	formData.append("gender", studentData.gender);
	formData.append("password", studentData.password);

	if (studentData.middleName) {
		formData.append("middleName", studentData.middleName);
	}
	if (studentData.avatar) {
		formData.append("avatar", studentData.avatar);
	}

	// Academic Information
	formData.append("studentId", studentData.studentId);
	formData.append("department", studentData.department);
	formData.append("course", studentData.course);
	formData.append("section", studentData.section);
	formData.append("year", studentData.year);
	formData.append("semester", studentData.semester);

	// Practicum Information (only if provided)
	if (studentData.agency) formData.append("agency", studentData.agency);
	if (studentData.agencyAddress) formData.append("agencyAddress", studentData.agencyAddress);
	if (studentData.supervisor) formData.append("supervisor", studentData.supervisor);
	if (studentData.supervisorEmail) formData.append("supervisorEmail", studentData.supervisorEmail);
	if (studentData.supervisorPhone) formData.append("supervisorPhone", studentData.supervisorPhone);
	if (studentData.startDate) formData.append("startDate", studentData.startDate);
	if (studentData.endDate) formData.append("endDate", studentData.endDate);

	// Account Settings
	if (studentData.sendCredentials !== undefined) {
		formData.append("sendCredentials", studentData.sendCredentials.toString());
	}

	try {
		const res = await api.post("/student", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});

		return res.data;
	} catch (error: any) {
		if (error.response) {
			throw new Error(error?.response.data.message || "Failed to create student");
		} else if (error.request) {
			throw new Error("No response from server");
		} else {
			throw new Error("Error creating student: " + error.message);
		}
	}
};

const getStudents = async (params?: {
	page?: number;
	limit?: number;
	search?: string;
}) => {
	try {
		const queryParams = new URLSearchParams();
		if (params?.page) queryParams.append("page", params.page.toString());
		if (params?.limit) queryParams.append("limit", params.limit.toString());
		if (params?.search) queryParams.append("search", params.search);

		const res = await api.get(`/student?${queryParams.toString()}`);
		return res.data;
	} catch (error: any) {
		if (error.response) {
			throw new Error(error.response.data.message || "Failed to fetch students");
		} else if (error.request) {
			throw new Error("No response from server");
		} else {
			throw new Error("Error fetching students: " + error.message);
		}
	}
};

const getStudentsByTeacher = async (
	teacherId: string,
	params?: {
		page?: number;
		limit?: number;
		search?: string;
	}
) => {
	try {
		const queryParams = new URLSearchParams();
		if (params?.page) queryParams.append("page", params.page.toString());
		if (params?.limit) queryParams.append("limit", params.limit.toString());
		if (params?.search) queryParams.append("search", params.search);

		const res = await api.get(`/student/teacher/${teacherId}?${queryParams.toString()}`);
		return res.data;
	} catch (error: any) {
		if (error.response) {
			throw new Error(error.response.data.message || "Failed to fetch students by teacher");
		} else if (error.request) {
			throw new Error("No response from server");
		} else {
			throw new Error("Error fetching students by teacher: " + error.message);
		}
	}
};

const getStudent = async (id: string) => {
	try {
		const res = await api.get(`/student/${id}`);
		return res.data;
	} catch (error: any) {
		if (error.response) {
			throw new Error(error.response.data.message || "Failed to fetch student");
		} else if (error.request) {
			throw new Error("No response from server");
		} else {
			throw new Error("Error fetching student: " + error.message);
		}
	}
};

const updateStudent = async (studentData: UpdateStudentParams) => {
	const formData = new FormData();

	formData.append("id", studentData.id);

	// Personal Information
	if (studentData.firstName) formData.append("firstName", studentData.firstName);
	if (studentData.lastName) formData.append("lastName", studentData.lastName);
	if (studentData.middleName !== undefined) formData.append("middleName", studentData.middleName);
	if (studentData.email) formData.append("email", studentData.email);
	if (studentData.phone) formData.append("phone", studentData.phone);
	if (studentData.age !== undefined) formData.append("age", studentData.age.toString());
	if (studentData.gender) formData.append("gender", studentData.gender);
	if (studentData.studentId) formData.append("studentId", studentData.studentId);
	if (studentData.address !== undefined) formData.append("address", studentData.address);
	if (studentData.bio !== undefined) formData.append("bio", studentData.bio);
	if (studentData.avatar) formData.append("avatar", studentData.avatar);

	// Academic Information
	if (studentData.departmentId) formData.append("departmentId", studentData.departmentId);
	if (studentData.courseId) formData.append("courseId", studentData.courseId);
	if (studentData.sectionId) formData.append("sectionId", studentData.sectionId);
	if (studentData.yearLevel) formData.append("yearLevel", studentData.yearLevel);
	if (studentData.program) formData.append("program", studentData.program);
	if (studentData.year) formData.append("year", studentData.year);
	if (studentData.semester) formData.append("semester", studentData.semester);

	// Practicum Information
	if (studentData.agencyId) formData.append("agencyId", studentData.agencyId);
	if (studentData.supervisorId) formData.append("supervisorId", studentData.supervisorId);
	if (studentData.position) formData.append("position", studentData.position);
	if (studentData.startDate) formData.append("startDate", studentData.startDate);
	if (studentData.endDate) formData.append("endDate", studentData.endDate);
	if (studentData.totalHours !== undefined) formData.append("totalHours", studentData.totalHours.toString());
	if (studentData.workSetup) formData.append("workSetup", studentData.workSetup);

	try {
		const res = await api.put(`/student/${studentData.id}`, formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});

		return res.data;
	} catch (error: any) {
		if (error.response) {
			throw new Error(error?.response.data.message || "Failed to update student");
		} else if (error.request) {
			throw new Error("No response from server");
		} else {
			throw new Error("Error updating student: " + error.message);
		}
	}
};

const deleteStudent = async (id: string) => {
	try {
		console.log("Attempting to delete student with ID:", id);
		console.log("API base URL:", process.env.NEXT_PUBLIC_API_URL);
		console.log("Full delete URL:", `${process.env.NEXT_PUBLIC_API_URL}/api/v1/student/${id}`);
		
		const res = await api.delete(`/student/${id}`);
		console.log("Delete response:", res.data);
		console.log("Delete response status:", res.status);
		return res.data;
	} catch (error: any) {
		console.error("Delete student error details:", {
			message: error.message,
			response: error.response?.data,
			status: error.response?.status,
			statusText: error.response?.statusText,
			config: {
				url: error.config?.url,
				method: error.config?.method,
				baseURL: error.config?.baseURL
			}
		});
		
		if (error.response) {
			const errorMessage = error.response.data?.message || error.response.data?.error || "Failed to delete student";
			throw new Error(`${errorMessage} (Status: ${error.response.status})`);
		} else if (error.request) {
			throw new Error("No response from server. Please check your internet connection.");
		} else {
			throw new Error("Error deleting student: " + error.message);
		}
	}
};

// React Query hooks
export const useRegisterStudent = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: registerStudent,
		onSuccess: () => {
			// Invalidate students query to refresh the list
			queryClient.invalidateQueries({ queryKey: ["students"] });
			queryClient.invalidateQueries({ queryKey: ["students-by-teacher"] });
		},
	});
};

export const useStudents = (params?: {
	page?: number;
	limit?: number;
	search?: string;
}) => {
	return useQuery({
		queryKey: ["students", params],
		queryFn: () => getStudents(params),
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
};

export const useStudentsByTeacher = (
	teacherId: string,
	params?: {
		page?: number;
		limit?: number;
		search?: string;
	}
) => {
	return useQuery({
		queryKey: ["students-by-teacher", teacherId, params],
		queryFn: () => getStudentsByTeacher(teacherId, params),
		enabled: !!teacherId,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
};

export const useStudent = (id: string) => {
	return useQuery({
		queryKey: ["student", id],
		queryFn: () => getStudent(id),
		enabled: !!id,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
};

export const useUpdateStudent = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: updateStudent,
		onSuccess: (data) => {
			// Refetch the specific student to ensure related entities are included
			queryClient.invalidateQueries({ queryKey: ["student", data.data.id] });
			// Invalidate students lists to refresh
			queryClient.invalidateQueries({ queryKey: ["students"] });
			queryClient.invalidateQueries({ queryKey: ["students-by-teacher"] });
		},
	});
};

export const useDeleteStudent = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteStudent,
		onSuccess: (data) => {
			console.log("Student deleted successfully:", data);
			// Invalidate students query to refresh the list
			queryClient.invalidateQueries({ queryKey: ["students"] });
			queryClient.invalidateQueries({ queryKey: ["students-by-teacher"] });
			// Invalidate archive queries so the archives page shows the newly archived item
			queryClient.invalidateQueries({ queryKey: ["instructor-archives", "student"] });
			// Invalidate requirement queries since deleting a student also deletes their requirements
			queryClient.invalidateQueries({ queryKey: requirementKeys.all });
		},
		onError: (error: any) => {
			console.error("Delete student mutation error:", error);
		},
	});
};
