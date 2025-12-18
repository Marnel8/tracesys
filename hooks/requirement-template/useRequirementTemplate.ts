import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

// Types aligned with server model
export type RequirementCategory =
	| "health"
	| "reports"
	| "training"
	| "academic"
	| "evaluation"
	| "legal";

export type RequirementPriority = "urgent" | "high" | "medium" | "low";

export interface RequirementTemplate {
	id: string;
	title: string;
	description: string;
	category: RequirementCategory;
	priority: RequirementPriority;
	isRequired: boolean;
	instructions?: string | null;
	allowedFileTypes?: string | string[] | null;
	maxFileSize?: number | null;
	isActive: boolean;
	appliesToSchoolAffiliated?: boolean;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
}

export interface RequirementTemplateFormData {
	title: string;
	description: string;
	category: RequirementCategory;
	priority?: RequirementPriority; // Optional, defaults to "medium" on backend
	isRequired: boolean;
	instructions?: string | null;
	allowedFileTypes?: string[]; // client uses array; server stores CSV
	maxFileSize?: number | null;
	isActive?: boolean;
	appliesToSchoolAffiliated?: boolean;
}

export interface RequirementTemplateFilters {
	search?: string;
	status?: "all" | "active" | "inactive";
	page?: number;
	limit?: number;
}

export interface RequirementTemplateListResponse {
	requirementTemplates: RequirementTemplate[];
	pagination: {
		currentPage: number;
		totalPages: number;
		totalItems: number;
		itemsPerPage: number;
	};
}

// API endpoints
const TEMPLATE_ENDPOINTS = {
	requirementTemplates: "/requirement-template/",
	requirementTemplate: (id: string) => `/requirement-template/${id}`,
};

// Query keys
export const requirementTemplateKeys = {
	all: ["requirementTemplates"] as const,
	lists: () => [...requirementTemplateKeys.all, "list"] as const,
	list: (filters: RequirementTemplateFilters) => [...requirementTemplateKeys.lists(), filters] as const,
	details: () => [...requirementTemplateKeys.all, "detail"] as const,
	detail: (id: string) => [...requirementTemplateKeys.details(), id] as const,
};

// Helpers to normalize server values where useful
const coerceAllowedFileTypes = (value: string | string[] | null | undefined): string[] | undefined => {
	if (Array.isArray(value)) return value;
	if (typeof value === "string") return value.split(",").filter(Boolean);
	return undefined;
};

// Get all requirement templates with filters
export const useRequirementTemplates = (
	filters: RequirementTemplateFilters = {},
	options?: { enabled?: boolean; refetchOnWindowFocus?: boolean; refetchInterval?: number }
) => {
	return useQuery({
		queryKey: requirementTemplateKeys.list(filters),
		queryFn: async (): Promise<RequirementTemplateListResponse> => {
			const params = new URLSearchParams();
			if (filters.search) params.append("search", filters.search);
			if (filters.status && filters.status !== "all") params.append("status", filters.status);
			if (filters.page) params.append("page", String(filters.page));
			if (filters.limit) params.append("limit", String(filters.limit));

			const response = await api.get(`${TEMPLATE_ENDPOINTS.requirementTemplates}?${params.toString()}`);
			const data = response.data.data as RequirementTemplateListResponse;
			// Normalize allowedFileTypes to array for client convenience
			data.requirementTemplates = data.requirementTemplates.map((t) => ({
				...t,
				allowedFileTypes: coerceAllowedFileTypes(t.allowedFileTypes),
			}));
			return data;
		},
		placeholderData: (previousData) => previousData,
		enabled: options?.enabled !== false,
		refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
		refetchInterval: options?.refetchInterval,
	});
};

// Get single requirement template
export const useRequirementTemplate = (id: string) => {
	return useQuery({
		queryKey: requirementTemplateKeys.detail(id),
		queryFn: async (): Promise<RequirementTemplate> => {
			const response = await api.get(TEMPLATE_ENDPOINTS.requirementTemplate(id));
			const t = response.data.data as RequirementTemplate;
			return { ...t, allowedFileTypes: coerceAllowedFileTypes(t.allowedFileTypes) } as RequirementTemplate;
		},
		enabled: !!id,
	});
};

// Create template
export const useCreateRequirementTemplate = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: RequirementTemplateFormData & { templateFile?: File | null }): Promise<RequirementTemplate> => {
		const form = new FormData();
		form.append("title", data.title);
		form.append("description", data.description);
		form.append("category", data.category);
		if (data.priority) form.append("priority", data.priority);
		form.append("isRequired", String(data.isRequired));
			if (data.instructions) form.append("instructions", data.instructions);
			if (Array.isArray(data.allowedFileTypes)) form.append("allowedFileTypes", JSON.stringify(data.allowedFileTypes));
			if (typeof data.maxFileSize === "number") form.append("maxFileSize", String(data.maxFileSize));
			if (typeof data.isActive === "boolean") form.append("isActive", String(data.isActive));
			if (typeof data.appliesToSchoolAffiliated === "boolean") form.append("appliesToSchoolAffiliated", String(data.appliesToSchoolAffiliated));
			if (data.templateFile) form.append("templateFile", data.templateFile);

			const response = await api.post(TEMPLATE_ENDPOINTS.requirementTemplates, form, {
				headers: { "Content-Type": "multipart/form-data" },
			});
			return response.data.data?.template ?? response.data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: requirementTemplateKeys.lists() });
			// Explicitly invalidate active templates query for student notifications
			queryClient.invalidateQueries({ queryKey: requirementTemplateKeys.list({ status: "active" }) });
			toast.success("Requirement template created successfully");
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to create requirement template");
		},
	});
};

// Update template
export const useUpdateRequirementTemplate = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, data }: { id: string; data: Partial<RequirementTemplateFormData> & { templateFile?: File | null } }): Promise<RequirementTemplate> => {
			const form = new FormData();
			if (data.title) form.append("title", data.title);
			if (data.description) form.append("description", data.description);
			if (data.category) form.append("category", data.category);
			if (data.priority) form.append("priority", data.priority);
			if (typeof data.isRequired === "boolean") form.append("isRequired", String(data.isRequired));
			if (typeof data.isActive === "boolean") form.append("isActive", String(data.isActive));
			if (typeof data.appliesToSchoolAffiliated === "boolean") form.append("appliesToSchoolAffiliated", String(data.appliesToSchoolAffiliated));
			if (data.instructions !== undefined) form.append("instructions", data.instructions ?? "");
			if (Array.isArray(data.allowedFileTypes)) form.append("allowedFileTypes", JSON.stringify(data.allowedFileTypes));
			if (typeof data.maxFileSize === "number") form.append("maxFileSize", String(data.maxFileSize));
			if (data.templateFile) form.append("templateFile", data.templateFile);

			const response = await api.put(TEMPLATE_ENDPOINTS.requirementTemplate(id), form, {
				headers: { "Content-Type": "multipart/form-data" },
			});
			return response.data.data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: requirementTemplateKeys.lists() });
			queryClient.invalidateQueries({ queryKey: requirementTemplateKeys.detail(data.id) });
			// Explicitly invalidate active templates query for student notifications
			queryClient.invalidateQueries({ queryKey: requirementTemplateKeys.list({ status: "active" }) });
			toast.success("Requirement template updated successfully");
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to update requirement template");
		},
	});
};

// Delete template
export const useDeleteRequirementTemplate = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string): Promise<void> => {
			await api.delete(TEMPLATE_ENDPOINTS.requirementTemplate(id));
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: requirementTemplateKeys.lists() });
			// Explicitly invalidate active templates query for student notifications
			queryClient.invalidateQueries({ queryKey: requirementTemplateKeys.list({ status: "active" }) });
			toast.success("Requirement template deleted successfully");
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to delete requirement template");
		},
	});
};

// Toggle active status
export const useToggleRequirementTemplateStatus = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }): Promise<RequirementTemplate> => {
			const response = await api.put(TEMPLATE_ENDPOINTS.requirementTemplate(id), { isActive });
			return response.data.data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: requirementTemplateKeys.lists() });
			queryClient.invalidateQueries({ queryKey: requirementTemplateKeys.detail(data.id) });
			// Explicitly invalidate active templates query for student notifications
			queryClient.invalidateQueries({ queryKey: requirementTemplateKeys.list({ status: "active" }) });
			toast.success(`Template ${data.isActive ? "activated" : "deactivated"} successfully`);
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to update template status");
		},
	});
};


