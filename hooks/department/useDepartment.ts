import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Department, DepartmentFormData, DepartmentFilters, DepartmentResponse } from "@/data/departments";
import { toast } from "sonner";

// API endpoints
const DEPARTMENT_ENDPOINTS = {
	departments: "/department/",
	department: (id: string) => `/department/${id}`,
};

// Query keys
export const departmentKeys = {
	all: ["departments"] as const,
	lists: () => [...departmentKeys.all, "list"] as const,
	list: (filters: DepartmentFilters) => [...departmentKeys.lists(), filters] as const,
	details: () => [...departmentKeys.all, "detail"] as const,
	detail: (id: string) => [...departmentKeys.details(), id] as const,
};

// Get all departments with filters
export const useDepartments = (filters: DepartmentFilters = {}) => {
	return useQuery({
		queryKey: departmentKeys.list(filters),
		queryFn: async (): Promise<DepartmentResponse> => {
			const params = new URLSearchParams();
			
			if (filters.search) params.append("search", filters.search);
			if (filters.status && filters.status !== "all") params.append("status", filters.status);
			
			const response = await api.get(`${DEPARTMENT_ENDPOINTS.departments}?${params.toString()}`);
			return response.data.data;
		},
		placeholderData: (previousData) => previousData,
	});
};

// Get single department
export const useDepartment = (id: string) => {
	return useQuery({
		queryKey: departmentKeys.detail(id),
		queryFn: async (): Promise<Department> => {
			const response = await api.get(DEPARTMENT_ENDPOINTS.department(id));
			return response.data.data;
		},
		enabled: !!id,
	});
};

// Create department mutation
export const useCreateDepartment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: DepartmentFormData): Promise<Department> => {
			const response = await api.post(DEPARTMENT_ENDPOINTS.departments, data);
			return response.data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
			toast.success("Department created successfully");
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to create department");
		},
	});
};

// Update department mutation
export const useUpdateDepartment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, data }: { id: string; data: Partial<DepartmentFormData> }): Promise<Department> => {
			const response = await api.put(DEPARTMENT_ENDPOINTS.department(id), data);
			return response.data.data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
			queryClient.invalidateQueries({ queryKey: departmentKeys.detail(data.id) });
			toast.success("Department updated successfully");
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to update department");
		},
	});
};

// Delete department mutation
export const useDeleteDepartment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string): Promise<void> => {
			await api.delete(DEPARTMENT_ENDPOINTS.department(id));
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
			toast.success("Department deleted successfully");
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to delete department");
		},
	});
};

// Toggle department status mutation
export const useToggleDepartmentStatus = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }): Promise<Department> => {
			const response = await api.put(DEPARTMENT_ENDPOINTS.department(id), { isActive });
			return response.data.data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
			queryClient.invalidateQueries({ queryKey: departmentKeys.detail(data.id) });
			toast.success(`Department ${data.isActive ? "activated" : "deactivated"} successfully`);
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to update department status");
		},
	});
};
