import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";

// Audit Log interfaces
export interface AuditLog {
	id: string;
	userId?: string;
	sessionId?: string;
	action: string;
	resource: string;
	resourceId?: string;
	details: string;
	ipAddress: string;
	userAgent: string;
	severity: "low" | "medium" | "high";
	category: "security" | "academic" | "submission" | "attendance" | "user_management" | "system";
	status: "success" | "failed" | "warning";
	country?: string;
	region?: string;
	city?: string;
	metadata?: Record<string, any>;
	createdAt: string;
	user?: {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
		role: string;
	};
}

export interface AuditLogFormData {
	userId?: string;
	sessionId?: string;
	action: string;
	resource: string;
	resourceId?: string;
	details: string;
	ipAddress: string;
	userAgent: string;
	severity: "low" | "medium" | "high";
	category: "security" | "academic" | "submission" | "attendance" | "user_management" | "system";
	status: "success" | "failed" | "warning";
	country?: string;
	region?: string;
	city?: string;
	metadata?: Record<string, any>;
}

export interface AuditFilters {
	search?: string;
	category?: "all" | "security" | "academic" | "submission" | "attendance" | "user_management" | "system";
	severity?: "all" | "low" | "medium" | "high";
	status?: "all" | "success" | "failed" | "warning";
	userId?: "all" | string;
	startDate?: string;
	endDate?: string;
	page?: number;
	limit?: number;
}

export interface AuditResponse {
	auditLogs: AuditLog[];
	pagination: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

export interface AuditStats {
	totalActivities: number;
	securityEvents: number;
	failedActions: number;
	activeUsers: number;
	activitiesByCategory: Record<string, number>;
	activitiesBySeverity: Record<string, number>;
	activitiesByStatus: Record<string, number>;
	recentActivities: AuditLog[];
}

export interface AuditUser {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	role: string;
}

export interface AuditCategory {
	value: string;
	label: string;
}

export interface AuditSeverity {
	value: string;
	label: string;
}

export interface AuditStatus {
	value: string;
	label: string;
}

export interface AuditExportData {
	headers: string[];
	rows: string[][];
}

// API endpoints
const AUDIT_ENDPOINTS = {
	auditLogs: "/audit/",
	auditLog: (id: string) => `/audit/${id}`,
	stats: "/audit/stats",
	users: "/audit/users",
	categories: "/audit/categories",
	severities: "/audit/severities",
	statuses: "/audit/statuses",
	export: "/audit/export",
	cleanup: "/audit/cleanup",
};

// Query keys
export const auditKeys = {
	all: ["audit"] as const,
	lists: () => [...auditKeys.all, "list"] as const,
	list: (filters: AuditFilters) => [...auditKeys.lists(), filters] as const,
	details: () => [...auditKeys.all, "detail"] as const,
	detail: (id: string) => [...auditKeys.details(), id] as const,
	stats: () => [...auditKeys.all, "stats"] as const,
	users: () => [...auditKeys.all, "users"] as const,
	categories: () => [...auditKeys.all, "categories"] as const,
	severities: () => [...auditKeys.all, "severities"] as const,
	statuses: () => [...auditKeys.all, "statuses"] as const,
};

// Get all audit logs with filters
export const useAuditLogs = (filters: AuditFilters = {}) => {
	return useQuery({
		queryKey: auditKeys.list(filters),
		queryFn: async (): Promise<AuditResponse> => {
			const params = new URLSearchParams();
			
			if (filters.search) params.append("search", filters.search);
			if (filters.category && filters.category !== "all") params.append("category", filters.category);
			if (filters.severity && filters.severity !== "all") params.append("severity", filters.severity);
			if (filters.status && filters.status !== "all") params.append("status", filters.status);
			if (filters.userId && filters.userId !== "all") params.append("userId", filters.userId);
			if (filters.startDate) params.append("startDate", filters.startDate);
			if (filters.endDate) params.append("endDate", filters.endDate);
			if (filters.page) params.append("page", filters.page.toString());
			if (filters.limit) params.append("limit", filters.limit.toString());
			
			const response = await api.get(`${AUDIT_ENDPOINTS.auditLogs}?${params.toString()}`);
			return response.data.data;
		},
		placeholderData: (previousData) => previousData,
	});
};

// Get single audit log
export const useAuditLog = (id: string) => {
	return useQuery({
		queryKey: auditKeys.detail(id),
		queryFn: async (): Promise<AuditLog> => {
			const response = await api.get(AUDIT_ENDPOINTS.auditLog(id));
			return response.data.data;
		},
		enabled: !!id,
	});
};

// Get audit statistics
export const useAuditStats = () => {
	return useQuery({
		queryKey: auditKeys.stats(),
		queryFn: async (): Promise<AuditStats> => {
			const response = await api.get(AUDIT_ENDPOINTS.stats);
			return response.data.data;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
};

// Get users for audit filtering
export const useAuditUsers = () => {
	return useQuery({
		queryKey: auditKeys.users(),
		queryFn: async (): Promise<AuditUser[]> => {
			const response = await api.get(AUDIT_ENDPOINTS.users);
			return response.data.data;
		},
		staleTime: 10 * 60 * 1000, // 10 minutes
	});
};

// Get audit categories
export const useAuditCategories = () => {
	return useQuery({
		queryKey: auditKeys.categories(),
		queryFn: async (): Promise<AuditCategory[]> => {
			const response = await api.get(AUDIT_ENDPOINTS.categories);
			return response.data.data;
		},
		staleTime: 30 * 60 * 1000, // 30 minutes
	});
};

// Get audit severities
export const useAuditSeverities = () => {
	return useQuery({
		queryKey: auditKeys.severities(),
		queryFn: async (): Promise<AuditSeverity[]> => {
			const response = await api.get(AUDIT_ENDPOINTS.severities);
			return response.data.data;
		},
		staleTime: 30 * 60 * 1000, // 30 minutes
	});
};

// Get audit statuses
export const useAuditStatuses = () => {
	return useQuery({
		queryKey: auditKeys.statuses(),
		queryFn: async (): Promise<AuditStatus[]> => {
			const response = await api.get(AUDIT_ENDPOINTS.statuses);
			return response.data.data;
		},
		staleTime: 30 * 60 * 1000, // 30 minutes
	});
};

// Create audit log mutation
export const useCreateAuditLog = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: AuditLogFormData): Promise<AuditLog> => {
			const response = await api.post(AUDIT_ENDPOINTS.auditLogs, data);
			return response.data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: auditKeys.lists() });
			queryClient.invalidateQueries({ queryKey: auditKeys.stats() });
			toast.success("Audit log created successfully");
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to create audit log");
		},
	});
};

// Export audit logs mutation
export const useExportAuditLogs = () => {
	return useMutation({
		mutationFn: async (filters: AuditFilters = {}): Promise<Blob> => {
			const params = new URLSearchParams();
			
			if (filters.search) params.append("search", filters.search);
			if (filters.category && filters.category !== "all") params.append("category", filters.category);
			if (filters.severity && filters.severity !== "all") params.append("severity", filters.severity);
			if (filters.status && filters.status !== "all") params.append("status", filters.status);
			if (filters.userId && filters.userId !== "all") params.append("userId", filters.userId);
			if (filters.startDate) params.append("startDate", filters.startDate);
			if (filters.endDate) params.append("endDate", filters.endDate);
			
			const response = await api.get(`${AUDIT_ENDPOINTS.export}?${params.toString()}`, {
				responseType: 'blob',
			});
			return response.data;
		},
		onSuccess: (blob) => {
			// Create download link
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
			
			toast.success("Audit logs exported successfully");
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to export audit logs");
		},
	});
};

// Delete old audit logs mutation
export const useDeleteOldAuditLogs = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (daysOld: number = 90): Promise<{ deletedCount: number }> => {
			const response = await api.delete(AUDIT_ENDPOINTS.cleanup, {
				data: { daysOld }
			});
			return response.data.data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: auditKeys.lists() });
			queryClient.invalidateQueries({ queryKey: auditKeys.stats() });
			toast.success(`Successfully deleted ${data.deletedCount} old audit logs`);
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to delete old audit logs");
		},
	});
};

// Helper hook for audit log filtering
export const useAuditFilters = () => {
	const { data: categories = [] } = useAuditCategories();
	const { data: severities = [] } = useAuditSeverities();
	const { data: statuses = [] } = useAuditStatuses();
	const { data: users = [] } = useAuditUsers();

	return {
		categories: [
			{ value: "all", label: "All Categories" },
			...categories
		],
		severities: [
			{ value: "all", label: "All Severities" },
			...severities
		],
		statuses: [
			{ value: "all", label: "All Statuses" },
			...statuses
		],
		users: [
			{ value: "all", label: "All Users" },
			...users.map(user => ({
				value: user.id,
				label: `${user.firstName} ${user.lastName} (${user.role})`
			}))
		]
	};
};

// Helper hook for audit log statistics
export const useAuditDashboard = () => {
	const { data: stats, isLoading: statsLoading, error: statsError } = useAuditStats();
	const { data: recentLogs, isLoading: logsLoading, error: logsError } = useAuditLogs({ 
		limit: 10 
	});

	return {
		stats,
		recentLogs: recentLogs?.auditLogs || [],
		isLoading: statsLoading || logsLoading,
		error: statsError || logsError,
	};
};

// Helper hook for audit log search
export const useAuditSearch = (searchTerm: string, debounceMs: number = 300) => {
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchTerm(searchTerm);
		}, debounceMs);

		return () => clearTimeout(timer);
	}, [searchTerm, debounceMs]);

	return useAuditLogs({
		search: debouncedSearchTerm,
		limit: 20
	});
};

// Helper hook for audit log pagination
export const useAuditPagination = (filters: AuditFilters = {}) => {
	const [currentPage, setCurrentPage] = useState(filters.page || 1);
	const [pageSize, setPageSize] = useState(filters.limit || 10);

	const { data, isLoading, error } = useAuditLogs({
		...filters,
		page: currentPage,
		limit: pageSize
	});

	const totalPages = data?.pagination.totalPages || 0;
	const totalItems = data?.pagination.total || 0;

	const goToPage = (page: number) => {
		setCurrentPage(Math.max(1, Math.min(page, totalPages)));
	};

	const nextPage = () => {
		if (currentPage < totalPages) {
			setCurrentPage(currentPage + 1);
		}
	};

	const prevPage = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
		}
	};

	const changePageSize = (newSize: number) => {
		setPageSize(newSize);
		setCurrentPage(1);
	};

	return {
		data,
		isLoading,
		error,
		currentPage,
		pageSize,
		totalPages,
		totalItems,
		goToPage,
		nextPage,
		prevPage,
		changePageSize,
		hasNextPage: currentPage < totalPages,
		hasPrevPage: currentPage > 1,
	};
};

// Helper hook for audit log real-time updates
export const useAuditRealtime = (filters: AuditFilters = {}) => {
	const queryClient = useQueryClient();
	const [isEnabled, setIsEnabled] = useState(false);

	// Poll for updates every 30 seconds when enabled
	useEffect(() => {
		if (!isEnabled) return;

		const interval = setInterval(() => {
			queryClient.invalidateQueries({ queryKey: auditKeys.lists() });
			queryClient.invalidateQueries({ queryKey: auditKeys.stats() });
		}, 30000);

		return () => clearInterval(interval);
	}, [isEnabled, queryClient]);

	const enableRealtime = () => setIsEnabled(true);
	const disableRealtime = () => setIsEnabled(false);

	return {
		isEnabled,
		enableRealtime,
		disableRealtime,
	};
};
