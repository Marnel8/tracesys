import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { 
	Announcement, 
	AnnouncementFormData, 
	AnnouncementFilters, 
	AnnouncementResponse, 
	AnnouncementComment,
	CommentFormData,
	CommentFilters,
	CommentResponse,
	AnnouncementStats
} from "@/data/announcements";
import { toast } from "sonner";

// API endpoints
const ANNOUNCEMENT_ENDPOINTS = {
	announcements: "/announcement/",
	announcement: (id: string) => `/announcement/${id}`,
	announcementPin: (id: string) => `/announcement/${id}/pin`,
	announcementStats: "/announcement/stats",
	comments: (announcementId: string) => `/announcement/${announcementId}/comment/`,
	comment: (id: string) => `/comment/${id}`,
};

// Query keys
export const announcementKeys = {
	all: ["announcements"] as const,
	lists: () => [...announcementKeys.all, "list"] as const,
	list: (filters: AnnouncementFilters) => [...announcementKeys.lists(), filters] as const,
	details: () => [...announcementKeys.all, "detail"] as const,
	detail: (id: string) => [...announcementKeys.details(), id] as const,
	stats: () => [...announcementKeys.all, "stats"] as const,
	comments: {
		all: (announcementId: string) => [...announcementKeys.all, "comments", announcementId] as const,
		lists: (announcementId: string) => [...announcementKeys.comments.all(announcementId), "list"] as const,
		list: (announcementId: string, filters: CommentFilters) => [...announcementKeys.comments.lists(announcementId), filters] as const,
	},
};

// Get all announcements with filters
export const useAnnouncements = (
	filters: AnnouncementFilters = {},
	options?: { enabled?: boolean; refetchOnWindowFocus?: boolean; refetchInterval?: number }
) => {
	return useQuery({
		queryKey: announcementKeys.list(filters),
		queryFn: async (): Promise<AnnouncementResponse> => {
			const params = new URLSearchParams();
			
			if (filters.search) params.append("search", filters.search);
			if (filters.authorId) params.append("authorId", filters.authorId);
			if (filters.userId) params.append("userId", filters.userId);
			if (filters.page) params.append("page", filters.page.toString());
			if (filters.limit) params.append("limit", filters.limit.toString());
			
			const response = await api.get(`${ANNOUNCEMENT_ENDPOINTS.announcements}?${params.toString()}`);
			return response.data.data;
		},
		placeholderData: (previousData) => previousData,
		enabled: options?.enabled !== false, // Default to true, but can be disabled
		refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
		refetchInterval: options?.refetchInterval,
	});
};

// Get public announcements (no authentication required) - for landing page
export const usePublicAnnouncements = (filters: Omit<AnnouncementFilters, "status" | "authorId" | "userId"> = {}) => {
	return useQuery({
		queryKey: [...announcementKeys.all, "public", filters],
		queryFn: async (): Promise<AnnouncementResponse> => {
			const params = new URLSearchParams();
			
			if (filters.search) params.append("search", filters.search);
			if (filters.page) params.append("page", filters.page.toString());
			if (filters.limit) params.append("limit", filters.limit.toString());
			
			const response = await api.get(`/announcement/public?${params.toString()}`);
			return response.data.data;
		},
		placeholderData: (previousData) => previousData,
		retry: 1, // Only retry once for public endpoint
	});
};

// Get single announcement
export const useAnnouncement = (id: string) => {
	return useQuery({
		queryKey: announcementKeys.detail(id),
		queryFn: async (): Promise<Announcement> => {
			const response = await api.get(ANNOUNCEMENT_ENDPOINTS.announcement(id));
			return response.data.data;
		},
		enabled: !!id,
	});
};

// Get announcement statistics
export const useAnnouncementStats = (authorId?: string) => {
	return useQuery({
		queryKey: announcementKeys.stats(),
		queryFn: async (): Promise<AnnouncementStats> => {
			const params = new URLSearchParams();
			if (authorId) params.append("authorId", authorId);
			
			const response = await api.get(`${ANNOUNCEMENT_ENDPOINTS.announcementStats}?${params.toString()}`);
			return response.data.data;
		},
	});
};

// Create announcement mutation
export const useCreateAnnouncement = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: AnnouncementFormData): Promise<Announcement> => {
			const response = await api.post(ANNOUNCEMENT_ENDPOINTS.announcements, data);
			return response.data.data;
		},
		onSuccess: () => {
			// Invalidate all announcement list queries (including student-specific ones)
			queryClient.invalidateQueries({ queryKey: announcementKeys.lists() });
			// Also invalidate all queries that start with announcements key to catch student notifications
			queryClient.invalidateQueries({ queryKey: announcementKeys.all });
			queryClient.invalidateQueries({ queryKey: announcementKeys.stats() });
			toast.success("Announcement created successfully");
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to create announcement");
		},
	});
};

// Update announcement mutation
export const useUpdateAnnouncement = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, data }: { id: string; data: Partial<AnnouncementFormData> }): Promise<Announcement> => {
			const response = await api.put(ANNOUNCEMENT_ENDPOINTS.announcement(id), data);
			return response.data.data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: announcementKeys.lists() });
			queryClient.invalidateQueries({ queryKey: announcementKeys.detail(data.id) });
			queryClient.invalidateQueries({ queryKey: announcementKeys.stats() });
			toast.success("Announcement updated successfully");
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to update announcement");
		},
	});
};

// Delete announcement mutation
export const useDeleteAnnouncement = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string): Promise<void> => {
			await api.delete(ANNOUNCEMENT_ENDPOINTS.announcement(id));
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: announcementKeys.lists() });
			queryClient.invalidateQueries({ queryKey: announcementKeys.stats() });
			// Invalidate archive queries so the archives page shows the newly archived item
			queryClient.invalidateQueries({ queryKey: ["instructor-archives", "announcement"] });
			toast.success("Announcement moved to Archives");
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to delete announcement");
		},
	});
};

// Toggle pin status mutation
export const useToggleAnnouncementPin = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string): Promise<Announcement> => {
			const response = await api.put(ANNOUNCEMENT_ENDPOINTS.announcementPin(id));
			return response.data.data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: announcementKeys.lists() });
			queryClient.invalidateQueries({ queryKey: announcementKeys.detail(data.id) });
			toast.success(`Announcement ${data.isPinned ? "pinned" : "unpinned"} successfully`);
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to toggle pin status");
		},
	});
};

// Comment Management Hooks

// Get comments for an announcement with filters
export const useAnnouncementComments = (announcementId: string, filters: CommentFilters = {}) => {
	return useQuery({
		queryKey: announcementKeys.comments.list(announcementId, filters),
		queryFn: async (): Promise<CommentResponse> => {
			const params = new URLSearchParams();
			
			if (filters.page) params.append("page", filters.page.toString());
			if (filters.limit) params.append("limit", filters.limit.toString());
			
			const response = await api.get(`${ANNOUNCEMENT_ENDPOINTS.comments(announcementId)}?${params.toString()}`);
			return response.data.data;
		},
		enabled: !!announcementId,
		placeholderData: (previousData) => previousData,
	});
};

// Create comment mutation
export const useCreateAnnouncementComment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CommentFormData): Promise<AnnouncementComment> => {
			const response = await api.post(ANNOUNCEMENT_ENDPOINTS.comments(data.announcementId), data);
			return response.data.data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: announcementKeys.comments.lists(data.announcementId) });
			queryClient.invalidateQueries({ queryKey: announcementKeys.detail(data.announcementId) });
			toast.success("Comment added successfully");
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to add comment");
		},
	});
};

// Delete comment mutation
export const useDeleteAnnouncementComment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, announcementId }: { id: string; announcementId: string }): Promise<void> => {
			await api.delete(ANNOUNCEMENT_ENDPOINTS.comment(id));
		},
		onSuccess: (_, { announcementId }) => {
			queryClient.invalidateQueries({ queryKey: announcementKeys.comments.lists(announcementId) });
			queryClient.invalidateQueries({ queryKey: announcementKeys.detail(announcementId) });
			toast.success("Comment deleted successfully");
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || "Failed to delete comment");
		},
	});
};
