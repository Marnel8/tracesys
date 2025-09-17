import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Section, SectionFormData, SectionFilters, SectionResponse } from "@/data/departments";
import { toast } from "sonner";

// API endpoints
const SECTION_ENDPOINTS = {
	sections: "/section/",
	section: (id: string) => `/section/${id}`,
};

// Query keys
export const sectionKeys = {
	all: ["sections"] as const,
	lists: () => [...sectionKeys.all, "list"] as const,
	list: (filters: SectionFilters) => [...sectionKeys.lists(), filters] as const,
	details: () => [...sectionKeys.all, "detail"] as const,
	detail: (id: string) => [...sectionKeys.details(), id] as const,
};

// Get all sections with filters
export const useSections = (filters: SectionFilters = {}) => {
	return useQuery({
		queryKey: sectionKeys.list(filters),
		queryFn: async (): Promise<SectionResponse> => {
			const params = new URLSearchParams();
			
			if (filters.search) params.append("search", filters.search);
			if (filters.status && filters.status !== "all") params.append("status", filters.status);
			if (filters.courseId) params.append("courseId", filters.courseId);
			if (filters.year) params.append("year", filters.year);
			if (filters.semester) params.append("semester", filters.semester);
			
			const response = await api.get(`${SECTION_ENDPOINTS.sections}?${params.toString()}`);
			return response.data.data;
		},
		placeholderData: (previousData) => previousData,
	});
};

// Get single section
export const useSection = (id: string) => {
	return useQuery({
		queryKey: sectionKeys.detail(id),
		queryFn: async (): Promise<Section> => {
			const response = await api.get(SECTION_ENDPOINTS.section(id));
			return response.data.data;
		},
		enabled: !!id,
	});
};

// Create section mutation
export const useCreateSection = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: SectionFormData): Promise<Section> => {
			const response = await api.post(SECTION_ENDPOINTS.sections, data);
			return response.data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: sectionKeys.lists() });
			toast.success("Section created successfully");
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to create section");
		},
	});
};

// Update section mutation
export const useUpdateSection = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, data }: { id: string; data: Partial<SectionFormData> }): Promise<Section> => {
			const response = await api.put(SECTION_ENDPOINTS.section(id), data);
			return response.data.data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: sectionKeys.lists() });
			queryClient.invalidateQueries({ queryKey: sectionKeys.detail(data.id) });
			toast.success("Section updated successfully");
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to update section");
		},
	});
};

// Delete section mutation
export const useDeleteSection = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string): Promise<void> => {
			await api.delete(SECTION_ENDPOINTS.section(id));
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: sectionKeys.lists() });
			toast.success("Section deleted successfully");
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to delete section");
		},
	});
};

// Toggle section status mutation
export const useToggleSectionStatus = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }): Promise<Section> => {
			const response = await api.put(SECTION_ENDPOINTS.section(id), { isActive });
			return response.data.data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: sectionKeys.lists() });
			queryClient.invalidateQueries({ queryKey: sectionKeys.detail(data.id) });
			toast.success(`Section ${data.isActive ? "activated" : "deactivated"} successfully`);
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to update section status");
		},
	});
};
