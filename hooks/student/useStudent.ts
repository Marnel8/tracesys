import api from "@/lib/api";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

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
	department: string;
	course: string;
	section: string;
	year: string;
	semester: string;

	// Practicum Information
	agency: string;
	agencyAddress: string;
	supervisor: string;
	supervisorEmail: string;
	supervisorPhone: string;
	startDate: string;
	endDate: string;

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

	// Practicum Information
	formData.append("agency", studentData.agency);
	formData.append("agencyAddress", studentData.agencyAddress);
	formData.append("supervisor", studentData.supervisor);
	formData.append("supervisorEmail", studentData.supervisorEmail);
	formData.append("supervisorPhone", studentData.supervisorPhone);
	formData.append("startDate", studentData.startDate);
	formData.append("endDate", studentData.endDate);

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

	// Add only provided fields
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
		const res = await api.delete(`/student/${id}`);
		return res.data;
	} catch (error: any) {
		if (error.response) {
			throw new Error(error.response.data.message || "Failed to delete student");
		} else if (error.request) {
			throw new Error("No response from server");
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
			// Update the specific student in cache
			queryClient.setQueryData(["student", data.data.id], data);
			// Invalidate students list to refresh
			queryClient.invalidateQueries({ queryKey: ["students"] });
			queryClient.invalidateQueries({ queryKey: ["students-by-teacher"] });
		},
	});
};

export const useDeleteStudent = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteStudent,
		onSuccess: () => {
			// Invalidate students query to refresh the list
			queryClient.invalidateQueries({ queryKey: ["students"] });
			queryClient.invalidateQueries({ queryKey: ["students-by-teacher"] });
		},
	});
};
