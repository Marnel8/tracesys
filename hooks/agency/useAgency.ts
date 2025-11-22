import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Agency, AgencyFormData, AgencyFilters, AgencyResponse, Supervisor } from "@/data/agencies";
import { toast } from "sonner";

// Supervisor interfaces
export interface SupervisorFormData {
	agencyId: string;
	name: string;
	email: string;
	phone: string;
	position: string;
	department?: string;
	isActive?: boolean;
}

export interface SupervisorFilters {
	search?: string;
	status?: "all" | "active" | "inactive";
	page?: number;
	limit?: number;
}

export interface SupervisorResponse {
	supervisors: Supervisor[];
	pagination: {
		currentPage: number;
		totalPages: number;
		totalItems: number;
		itemsPerPage: number;
	};
}

export interface SupervisorStats {
	totalSupervisors: number;
	activeSupervisors: number;
	inactiveSupervisors: number;
	supervisorsWithPracticums: number;
	supervisorsWithoutPracticums: number;
}

// API endpoints
const AGENCY_ENDPOINTS = {
	agencies: "/agency/",
	agency: (id: string) => `/agency/${id}`,
	supervisors: (agencyId: string) => `/agency/${agencyId}/supervisor/`,
	supervisor: (id: string) => `/supervisor/${id}`,
	supervisorStats: (agencyId: string) => `/agency/${agencyId}/supervisor/stats`,
};

// Query keys
export const agencyKeys = {
	all: ["agencies"] as const,
	lists: () => [...agencyKeys.all, "list"] as const,
	list: (filters: AgencyFilters) => [...agencyKeys.lists(), filters] as const,
	details: () => [...agencyKeys.all, "detail"] as const,
	detail: (id: string) => [...agencyKeys.details(), id] as const,
	supervisors: {
		all: (agencyId: string) => [...agencyKeys.all, "supervisors", agencyId] as const,
		lists: (agencyId: string) => [...agencyKeys.supervisors.all(agencyId), "list"] as const,
		list: (agencyId: string, filters: SupervisorFilters) => [...agencyKeys.supervisors.lists(agencyId), filters] as const,
		details: (agencyId: string) => [...agencyKeys.supervisors.all(agencyId), "detail"] as const,
		detail: (agencyId: string, id: string) => [...agencyKeys.supervisors.details(agencyId), id] as const,
		stats: (agencyId: string) => [...agencyKeys.supervisors.all(agencyId), "stats"] as const,
	},
};

interface UseAgenciesOptions {
	enabled?: boolean;
}

// Get all agencies with filters
export const useAgencies = (filters: AgencyFilters = {}, options: UseAgenciesOptions = {}) => {
	const { enabled = true } = options;

	return useQuery({
		queryKey: agencyKeys.list(filters),
		queryFn: async (): Promise<AgencyResponse> => {
			try {
				const params = new URLSearchParams();
				
				if (filters.search) params.append("search", filters.search);
				if (filters.status && filters.status !== "all") params.append("status", filters.status);
				if (filters.branchType && filters.branchType !== "all") params.append("branchType", filters.branchType);
				
				const response = await api.get(`${AGENCY_ENDPOINTS.agencies}?${params.toString()}`);
				
				if (!response.data || !response.data.data) {
					console.error("Invalid response structure:", response.data);
					throw new Error("Invalid response from server");
				}
				
				return response.data.data;
			} catch (error: any) {
				console.error("Error fetching agencies:", error);
				throw error;
			}
		},
		enabled,
		placeholderData: (previousData) => previousData,
		retry: 1,
	});
};

// Get single agency
export const useAgency = (id: string) => {
	return useQuery({
		queryKey: agencyKeys.detail(id),
		queryFn: async (): Promise<Agency> => {
			const response = await api.get(AGENCY_ENDPOINTS.agency(id));
			return response.data.data;
		},
		enabled: !!id,
	});
};

// Create agency mutation
export const useCreateAgency = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: AgencyFormData): Promise<Agency> => {
			const response = await api.post(AGENCY_ENDPOINTS.agencies, data);
			return response.data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: agencyKeys.lists() });
			toast.success("Agency created successfully");
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to create agency");
		},
	});
};

// Update agency mutation
export const useUpdateAgency = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, data }: { id: string; data: Partial<AgencyFormData> }): Promise<Agency> => {
			const response = await api.put(AGENCY_ENDPOINTS.agency(id), data);
			return response.data.data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: agencyKeys.lists() });
			queryClient.invalidateQueries({ queryKey: agencyKeys.detail(data.id) });
			toast.success("Agency updated successfully");
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to update agency");
		},
	});
};

// Delete agency mutation
export const useDeleteAgency = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string): Promise<void> => {
			await api.delete(AGENCY_ENDPOINTS.agency(id));
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: agencyKeys.lists() });
			toast.success("Agency deleted successfully");
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to delete agency");
		},
	});
};

// Toggle agency status mutation
export const useToggleAgencyStatus = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }): Promise<Agency> => {
			const response = await api.put(AGENCY_ENDPOINTS.agency(id), { isActive });
			return response.data.data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: agencyKeys.lists() });
			queryClient.invalidateQueries({ queryKey: agencyKeys.detail(data.id) });
			toast.success(`Agency ${data.isActive ? "activated" : "deactivated"} successfully`);
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to update agency status");
		},
	});
};

// Supervisor Management Hooks

// Get supervisors for an agency with filters
export const useSupervisors = (agencyId: string, filters: SupervisorFilters = {}) => {
	return useQuery({
		queryKey: agencyKeys.supervisors.list(agencyId, filters),
		queryFn: async (): Promise<SupervisorResponse> => {
			const params = new URLSearchParams();
			
			if (filters.search) params.append("search", filters.search);
			if (filters.status && filters.status !== "all") params.append("status", filters.status);
			if (filters.page) params.append("page", filters.page.toString());
			if (filters.limit) params.append("limit", filters.limit.toString());
			
			const response = await api.get(`${AGENCY_ENDPOINTS.supervisors(agencyId)}?${params.toString()}`);
			return response.data.data;
		},
		enabled: !!agencyId,
		placeholderData: (previousData) => previousData,
	});
};

// Get single supervisor
export const useSupervisor = (id: string) => {
	return useQuery({
		queryKey: agencyKeys.supervisors.detail("", id),
		queryFn: async (): Promise<Supervisor> => {
			const response = await api.get(AGENCY_ENDPOINTS.supervisor(id));
			return response.data.data;
		},
		enabled: !!id,
	});
};

// Get supervisor statistics for an agency
export const useSupervisorStats = (agencyId: string) => {
	return useQuery({
		queryKey: agencyKeys.supervisors.stats(agencyId),
		queryFn: async (): Promise<SupervisorStats> => {
			const response = await api.get(AGENCY_ENDPOINTS.supervisorStats(agencyId));
			return response.data.data;
		},
		enabled: !!agencyId,
	});
};

// Create supervisor mutation
export const useCreateSupervisor = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: SupervisorFormData): Promise<Supervisor> => {
			const response = await api.post(AGENCY_ENDPOINTS.supervisors(data.agencyId), data);
			return response.data.data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: agencyKeys.supervisors.lists(data.agencyId) });
			queryClient.invalidateQueries({ queryKey: agencyKeys.supervisors.stats(data.agencyId) });
			queryClient.invalidateQueries({ queryKey: agencyKeys.detail(data.agencyId) });
			toast.success("Supervisor created successfully");
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to create supervisor");
		},
	});
};

// Update supervisor mutation
export const useUpdateSupervisor = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, data }: { id: string; data: Partial<SupervisorFormData> }): Promise<Supervisor> => {
			const response = await api.put(AGENCY_ENDPOINTS.supervisor(id), data);
			return response.data.data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: agencyKeys.supervisors.lists(data.agencyId) });
			queryClient.invalidateQueries({ queryKey: agencyKeys.supervisors.detail(data.agencyId, data.id) });
			queryClient.invalidateQueries({ queryKey: agencyKeys.supervisors.stats(data.agencyId) });
			queryClient.invalidateQueries({ queryKey: agencyKeys.detail(data.agencyId) });
			toast.success("Supervisor updated successfully");
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to update supervisor");
		},
	});
};

// Delete supervisor mutation
export const useDeleteSupervisor = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, agencyId }: { id: string; agencyId: string }): Promise<void> => {
			await api.delete(AGENCY_ENDPOINTS.supervisor(id));
		},
		onSuccess: (_, { agencyId }) => {
			queryClient.invalidateQueries({ queryKey: agencyKeys.supervisors.lists(agencyId) });
			queryClient.invalidateQueries({ queryKey: agencyKeys.supervisors.stats(agencyId) });
			queryClient.invalidateQueries({ queryKey: agencyKeys.detail(agencyId) });
			toast.success("Supervisor deleted successfully");
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to delete supervisor");
		},
	});
};

// Toggle supervisor status mutation
export const useToggleSupervisorStatus = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }): Promise<Supervisor> => {
			const response = await api.put(AGENCY_ENDPOINTS.supervisor(id), { isActive });
			return response.data.data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: agencyKeys.supervisors.lists(data.agencyId) });
			queryClient.invalidateQueries({ queryKey: agencyKeys.supervisors.detail(data.agencyId, data.id) });
			queryClient.invalidateQueries({ queryKey: agencyKeys.supervisors.stats(data.agencyId) });
			queryClient.invalidateQueries({ queryKey: agencyKeys.detail(data.agencyId) });
			toast.success(`Supervisor ${data.isActive ? "activated" : "deactivated"} successfully`);
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to update supervisor status");
		},
	});
};
