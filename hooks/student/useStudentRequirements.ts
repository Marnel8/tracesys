import api from "@/lib/api";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

// Requirements interfaces
export interface Requirement {
	id: string;
	studentId: string;
	templateId: string;
	title: string;
	description: string;
	category: "health" | "legal" | "academic" | "other";
	priority: "low" | "medium" | "high" | "urgent";
	status: "pending" | "submitted" | "approved" | "rejected" | "expired";
	dueDate: string;
	submittedAt?: string;
	approvedAt?: string;
	rejectedAt?: string;
	feedback?: string;
	attachments?: string[];
	createdAt: string;
	updatedAt: string;
	template?: RequirementTemplate;
}

export interface RequirementTemplate {
	id: string;
	title: string;
	description: string;
	category: "health" | "legal" | "academic" | "other";
	priority: "low" | "medium" | "high" | "urgent";
	isRequired: boolean;
	createdBy: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface SubmitRequirementParams {
	requirementId: string;
	attachments: File[];
	notes?: string;
}

export interface UpdateRequirementParams {
	requirementId: string;
	attachments?: File[];
	notes?: string;
}

// API functions
const getStudentRequirements = async (studentId: string, params?: {
	page?: number;
	limit?: number;
	status?: string;
	category?: string;
	priority?: string;
}) => {
	try {
		const queryParams = new URLSearchParams();
		queryParams.append("studentId", studentId);
		if (params?.page) queryParams.append("page", params.page.toString());
		if (params?.limit) queryParams.append("limit", params.limit.toString());
		if (params?.status) queryParams.append("status", params.status);
		if (params?.category) queryParams.append("category", params.category);
		if (params?.priority) queryParams.append("priority", params.priority);

		const res = await api.get(`/requirements/student?${queryParams.toString()}`);
		return res.data;
	} catch (error: any) {
		if (error.response) {
			throw new Error(error.response.data.message || "Failed to fetch requirements");
		} else if (error.request) {
			throw new Error("No response from server");
		} else {
			throw new Error("Error fetching requirements: " + error.message);
		}
	}
};

const getRequirementTemplates = async (params?: {
	category?: string;
	priority?: string;
	isRequired?: boolean;
}) => {
	try {
		const queryParams = new URLSearchParams();
		if (params?.category) queryParams.append("category", params.category);
		if (params?.priority) queryParams.append("priority", params.priority);
		if (params?.isRequired !== undefined) queryParams.append("isRequired", params.isRequired.toString());

		const res = await api.get(`/requirements/templates?${queryParams.toString()}`);
		return res.data;
	} catch (error: any) {
		if (error.response) {
			throw new Error(error.response.data.message || "Failed to fetch requirement templates");
		} else if (error.request) {
			throw new Error("No response from server");
		} else {
			throw new Error("Error fetching requirement templates: " + error.message);
		}
	}
};

const getRequirement = async (requirementId: string) => {
	try {
		const res = await api.get(`/requirements/${requirementId}`);
		return res.data;
	} catch (error: any) {
		if (error.response) {
			throw new Error(error.response.data.message || "Failed to fetch requirement");
		} else if (error.request) {
			throw new Error("No response from server");
		} else {
			throw new Error("Error fetching requirement: " + error.message);
		}
	}
};

const submitRequirement = async (params: SubmitRequirementParams) => {
	const formData = new FormData();
	
	formData.append("requirementId", params.requirementId);
	if (params.notes) formData.append("notes", params.notes);
	
	params.attachments.forEach((file, index) => {
		formData.append(`attachments`, file);
	});

	try {
		const res = await api.post(`/requirements/${params.requirementId}/submit`, formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return res.data;
	} catch (error: any) {
		if (error.response) {
			throw new Error(error?.response.data.message || "Failed to submit requirement");
		} else if (error.request) {
			throw new Error("No response from server");
		} else {
			throw new Error("Error submitting requirement: " + error.message);
		}
	}
};

const updateRequirement = async (params: UpdateRequirementParams) => {
	const formData = new FormData();
	
	formData.append("requirementId", params.requirementId);
	if (params.notes) formData.append("notes", params.notes);
	
	if (params.attachments) {
		params.attachments.forEach((file, index) => {
			formData.append(`attachments`, file);
		});
	}

	try {
		const res = await api.put(`/requirements/${params.requirementId}`, formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return res.data;
	} catch (error: any) {
		if (error.response) {
			throw new Error(error?.response.data.message || "Failed to update requirement");
		} else if (error.request) {
			throw new Error("No response from server");
		} else {
			throw new Error("Error updating requirement: " + error.message);
		}
	}
};

const getRequirementStats = async (studentId: string) => {
	try {
		const res = await api.get(`/requirements/stats/${studentId}`);
		return res.data;
	} catch (error: any) {
		if (error.response) {
			throw new Error(error.response.data.message || "Failed to fetch requirement stats");
		} else if (error.request) {
			throw new Error("No response from server");
		} else {
			throw new Error("Error fetching requirement stats: " + error.message);
		}
	}
};

// React Query hooks
export const useStudentRequirements = (studentId: string, params?: {
	page?: number;
	limit?: number;
	status?: string;
	category?: string;
	priority?: string;
}) => {
	return useQuery({
		queryKey: ["requirements", studentId, params],
		queryFn: () => getStudentRequirements(studentId, params),
		enabled: !!studentId,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
};

export const useRequirementTemplates = (params?: {
	category?: string;
	priority?: string;
	isRequired?: boolean;
}) => {
	return useQuery({
		queryKey: ["requirementTemplates", params],
		queryFn: () => getRequirementTemplates(params),
		staleTime: 1000 * 60 * 30, // 30 minutes
	});
};

export const useRequirement = (requirementId: string) => {
	return useQuery({
		queryKey: ["requirement", requirementId],
		queryFn: () => getRequirement(requirementId),
		enabled: !!requirementId,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
};

export const useSubmitRequirement = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: submitRequirement,
		onSuccess: (data, variables) => {
			queryClient.setQueryData(["requirement", variables.requirementId], data);
			queryClient.invalidateQueries({ queryKey: ["requirements"] });
			queryClient.invalidateQueries({ queryKey: ["requirementStats"] });
		},
	});
};

export const useUpdateRequirement = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: updateRequirement,
		onSuccess: (data, variables) => {
			queryClient.setQueryData(["requirement", variables.requirementId], data);
			queryClient.invalidateQueries({ queryKey: ["requirements"] });
		},
	});
};

export const useRequirementStats = (studentId: string) => {
	return useQuery({
		queryKey: ["requirementStats", studentId],
		queryFn: () => getRequirementStats(studentId),
		enabled: !!studentId,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
};
