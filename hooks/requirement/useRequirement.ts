import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

export type RequirementStatus = "pending" | "submitted" | "approved" | "rejected" | "in-progress";

export interface Requirement {
	id: string;
	studentId: string;
	templateId?: string | null;
	practicumId?: string | null;
	title: string;
	description: string;
	category: "health" | "reports" | "training" | "academic" | "evaluation" | "legal";
	status: RequirementStatus;
	priority: "urgent" | "high" | "medium" | "low";
	dueDate?: string | null;
	submittedDate?: string | null;
	approvedDate?: string | null;
	approvedBy?: string | null;
	feedback?: string | null;
	fileUrl?: string | null;
	fileName?: string | null;
	fileSize?: number | null;
	createdAt: string;
	updatedAt: string;
	template?: any;
	student?: any;
	comments?: RequirementComment[];
}

export interface RequirementComment {
	id: string;
	requirementId: string;
	userId: string;
	content: string;
	isPrivate: boolean;
	createdAt: string;
	updatedAt: string;
	user?: {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
		role: string;
	};
	requirement?: {
		id: string;
		title: string;
		studentId: string;
	};
}

export interface RequirementListResponse {
	requirements: Requirement[];
	pagination: {
		currentPage: number;
		totalPages: number;
		totalItems: number;
		itemsPerPage: number;
	};
}

const ENDPOINTS = {
	list: "/requirements",
	detail: (id: string) => `/requirements/${id}`,
	fromTemplate: "/requirements/from-template",
	submit: (id: string) => `/requirements/${id}/submit`,
	approve: (id: string) => `/requirements/${id}/approve`,
	reject: (id: string) => `/requirements/${id}/reject`,
	updateDueDate: (id: string) => `/requirements/${id}/due-date`,
	comments: (id: string) => `/requirements/${id}/comments`,
	studentComments: (studentId: string) => `/requirements/comments/student/${studentId}`,
};

export const requirementKeys = {
	all: ["requirements"] as const,
	lists: () => [...requirementKeys.all, "list"] as const,
	list: (filters: any) => [...requirementKeys.lists(), filters] as const,
	details: () => [...requirementKeys.all, "detail"] as const,
	detail: (id: string) => [...requirementKeys.details(), id] as const,
};

export const useRequirements = (filters: {
	page?: number;
	limit?: number;
	search?: string;
	status?: RequirementStatus | "all";
	studentId?: string;
	practicumId?: string;
	includePending?: boolean;
} = {}) => {
	return useQuery({
		queryKey: requirementKeys.list(filters),
		queryFn: async (): Promise<RequirementListResponse> => {
			const params = new URLSearchParams();
			if (filters.page) params.append("page", String(filters.page));
			if (filters.limit) params.append("limit", String(filters.limit));
			if (filters.search) params.append("search", filters.search);
			if (filters.status && filters.status !== "all") params.append("status", filters.status);
			if (filters.studentId) params.append("studentId", filters.studentId);
			if (filters.practicumId) params.append("practicumId", filters.practicumId);
			if (filters.includePending) params.append("includePending", "true");
			const res = await api.get(`${ENDPOINTS.list}?${params.toString()}`);
			return res.data.data as RequirementListResponse;
		},
		staleTime: 0,
		refetchOnMount: true,
		refetchOnWindowFocus: false,
	});
};

export const useRequirement = (id: string) => {
	return useQuery({
		queryKey: requirementKeys.detail(id),
		queryFn: async (): Promise<Requirement> => {
			const res = await api.get(ENDPOINTS.detail(id));
			return res.data.data as Requirement;
		},
		enabled: !!id,
	});
};

export const useCreateRequirementFromTemplate = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (data: { templateId: string; studentId: string; practicumId?: string | null; dueDate?: string | null }) => {
			const res = await api.post(ENDPOINTS.fromTemplate, data);
			return res.data.data as Requirement;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: requirementKeys.all });
			toast.success("Requirement assigned");
		},
		onError: (err: any) => {
			toast.error(err.response?.data?.message || "Failed to assign requirement");
		},
	});
};

export const useSubmitRequirement = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, file }: { id: string; file: File }) => {
			const form = new FormData();
			form.append("submissionFile", file);
			const res = await api.post(ENDPOINTS.submit(id), form, {
				headers: { "Content-Type": "multipart/form-data" },
			});
			return res.data.data as Requirement;
		},
		onSuccess: (data) => {
			qc.invalidateQueries({ queryKey: requirementKeys.detail(data.id) });
			qc.invalidateQueries({ queryKey: requirementKeys.all });
			toast.success("Requirement submitted");
		},
		onError: (err: any) => {
			toast.error(err.response?.data?.message || "Failed to submit requirement");
		},
	});
};

export const useApproveRequirement = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, feedback }: { id: string; feedback?: string | null }) => {
			const res = await api.put(ENDPOINTS.approve(id), { feedback: feedback ?? null });
			return res.data.data as Requirement;
		},
		onSuccess: (data) => {
			qc.invalidateQueries({ queryKey: requirementKeys.detail(data.id) });
			qc.invalidateQueries({ queryKey: requirementKeys.all });
			toast.success("Requirement approved");
		},
		onError: (err: any) => {
			toast.error(err.response?.data?.message || "Failed to approve requirement");
		},
	});
};

export const useRejectRequirement = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
			const res = await api.put(ENDPOINTS.reject(id), { reason });
			return res.data.data as Requirement;
		},
		onSuccess: (data) => {
			qc.invalidateQueries({ queryKey: requirementKeys.detail(data.id) });
			qc.invalidateQueries({ queryKey: requirementKeys.all });
			toast.success("Requirement rejected");
		},
		onError: (err: any) => {
			toast.error(err.response?.data?.message || "Failed to reject requirement");
		},
	});
};

export const useCreateRequirementComment = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({
			requirementId,
			content,
			isPrivate = false,
		}: {
			requirementId: string;
			content: string;
			isPrivate?: boolean;
		}) => {
			const res = await api.post(ENDPOINTS.comments(requirementId), {
				content,
				isPrivate,
			});
			return res.data.data as RequirementComment;
		},
		onSuccess: (data) => {
			qc.invalidateQueries({ queryKey: requirementKeys.detail(data.requirementId) });
			qc.invalidateQueries({ queryKey: requirementKeys.all });
			qc.invalidateQueries({ queryKey: ["requirement-comments", data.requirementId] });
			qc.invalidateQueries({ queryKey: ["student-requirement-comments"] });
			toast.success("Comment added");
		},
		onError: (err: any) => {
			toast.error(err.response?.data?.message || "Failed to add comment");
		},
	});
};

export const useRequirementComments = (requirementId: string, options?: { enabled?: boolean }) => {
	return useQuery({
		queryKey: ["requirement-comments", requirementId],
		queryFn: async (): Promise<RequirementComment[]> => {
			const res = await api.get(ENDPOINTS.comments(requirementId));
			return res.data.data as RequirementComment[];
		},
		enabled: options?.enabled !== undefined ? options.enabled && !!requirementId : !!requirementId,
	});
};

export const useStudentRequirementComments = (studentId?: string, lastCheckTime?: string | null) => {
	return useQuery({
		queryKey: ["student-requirement-comments", studentId, lastCheckTime],
		queryFn: async (): Promise<RequirementComment[]> => {
			if (!studentId) return [];
			const params = new URLSearchParams();
			if (lastCheckTime) params.append("lastCheckTime", lastCheckTime);
			const res = await api.get(`${ENDPOINTS.studentComments(studentId)}?${params.toString()}`);
			return res.data.data as RequirementComment[];
		},
		enabled: !!studentId,
		staleTime: 0,
		refetchOnMount: true,
		refetchOnWindowFocus: true,
		refetchInterval: 30000, // Refetch every 30 seconds
	});
};

export const useUpdateRequirementDueDate = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, dueDate }: { id: string; dueDate: string | null }) => {
			const res = await api.put(ENDPOINTS.updateDueDate(id), { dueDate });
			return res.data.data as Requirement;
		},
		onSuccess: (data) => {
			qc.invalidateQueries({ queryKey: requirementKeys.detail(data.id) });
			qc.invalidateQueries({ queryKey: requirementKeys.all });
			toast.success("Due date updated successfully");
		},
		onError: (err: any) => {
			toast.error(err.response?.data?.message || "Failed to update due date");
		},
	});
};


