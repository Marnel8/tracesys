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
			const res = await api.get(`${ENDPOINTS.list}?${params.toString()}`);
			return res.data.data as RequirementListResponse;
		},
		placeholderData: (prev) => prev,
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
			qc.invalidateQueries({ queryKey: requirementKeys.lists() });
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
			qc.invalidateQueries({ queryKey: requirementKeys.lists() });
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
			qc.invalidateQueries({ queryKey: requirementKeys.lists() });
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
			qc.invalidateQueries({ queryKey: requirementKeys.lists() });
			toast.success("Requirement rejected");
		},
		onError: (err: any) => {
			toast.error(err.response?.data?.message || "Failed to reject requirement");
		},
	});
};


