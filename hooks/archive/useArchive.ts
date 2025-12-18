import api from "@/lib/api";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import type {
	ArchiveEntityType,
	ArchiveItem,
	ArchiveListResponse,
} from "@/lib/instructor-archives/types";
import { agencyKeys } from "../agency/useAgency";
import { courseKeys } from "../course/useCourse";
import { sectionKeys } from "../section/useSection";
import { announcementKeys } from "../announcement/useAnnouncement";

export interface ArchiveListFilters {
	page?: number;
	limit?: number;
	search?: string;
}

// API functions
const getArchivedEntities = async <T = any>(
	entityType: ArchiveEntityType,
	filters?: ArchiveListFilters
): Promise<ArchiveListResponse<T>> => {
	try {
		const queryParams = new URLSearchParams();
		if (filters?.page) queryParams.append("page", filters.page.toString());
		if (filters?.limit) queryParams.append("limit", filters.limit.toString());
		if (filters?.search) queryParams.append("search", filters.search);

		const endpoint = getArchiveEndpoint(entityType);
		const res = await api.get(`${endpoint}?${queryParams.toString()}`);
		const data = (res.data?.data ?? res.data) as ArchiveListResponse<T>;
		return data;
	} catch (error: any) {
		if (error.response) {
			throw new Error(
				error.response.data.message || "Failed to fetch archived items"
			);
		} else if (error.request) {
			throw new Error("No response from server");
		} else {
			throw new Error("Error fetching archived items: " + error.message);
		}
	}
};

const restoreEntity = async <T = any>(
	entityType: ArchiveEntityType,
	id: string
): Promise<ArchiveItem<T>> => {
	try {
		const endpoint = getRestoreEndpoint(entityType, id);
		const res = await api.post(endpoint);
		const data = (res.data?.data ?? res.data) as ArchiveItem<T>;
		return data;
	} catch (error: any) {
		if (error.response) {
			throw new Error(
				error.response.data.message || "Failed to restore item"
			);
		} else if (error.request) {
			throw new Error("No response from server");
		} else {
			throw new Error("Error restoring item: " + error.message);
		}
	}
};

const hardDeleteEntity = async (
	entityType: ArchiveEntityType,
	id: string
): Promise<void> => {
	try {
		const endpoint = getHardDeleteEndpoint(entityType, id);
		await api.delete(endpoint);
	} catch (error: any) {
		if (error.response) {
			throw new Error(
				error.response.data.message || "Failed to permanently delete item"
			);
		} else if (error.request) {
			throw new Error("No response from server");
		} else {
			throw new Error("Error permanently deleting item: " + error.message);
		}
	}
};

// Endpoint helpers
const getArchiveEndpoint = (entityType: ArchiveEntityType): string => {
	switch (entityType) {
		case "student":
			return "/student/archives";
		case "agency":
			return "/agency/archives";
		case "course":
			return "/course/archives";
		case "section":
			return "/section/archives";
		case "requirement":
			return "/requirements/archives";
		case "report":
			return "/reports/archives";
		case "announcement":
			return "/announcement/archives";
		default:
			throw new Error(`Unknown entity type: ${entityType}`);
	}
};

const getRestoreEndpoint = (
	entityType: ArchiveEntityType,
	id: string
): string => {
	switch (entityType) {
		case "student":
			return `/student/${id}/restore`;
		case "agency":
			return `/agency/${id}/restore`;
		case "course":
			return `/course/${id}/restore`;
		case "section":
			return `/section/${id}/restore`;
		case "requirement":
			return `/requirements/${id}/restore`;
		case "report":
			return `/reports/${id}/restore`;
		case "announcement":
			return `/announcement/${id}/restore`;
		default:
			throw new Error(`Unknown entity type: ${entityType}`);
	}
};

const getHardDeleteEndpoint = (
	entityType: ArchiveEntityType,
	id: string
): string => {
	switch (entityType) {
		case "student":
			return `/student/${id}/hard-delete`;
		case "agency":
			return `/agency/${id}/hard-delete`;
		case "course":
			return `/course/${id}/hard-delete`;
		case "section":
			return `/section/${id}/hard-delete`;
		case "requirement":
			return `/requirements/${id}/hard-delete`;
		case "report":
			return `/reports/${id}/hard-delete`;
		case "announcement":
			return `/announcement/${id}/hard-delete`;
		default:
			throw new Error(`Unknown entity type: ${entityType}`);
	}
};

// React Query hooks
export const useArchivedEntities = <T = any>(
	entityType: ArchiveEntityType,
	filters?: ArchiveListFilters
) => {
	return useQuery({
		queryKey: ["instructor-archives", entityType, filters],
		queryFn: () => getArchivedEntities<T>(entityType, filters),
		enabled: !!entityType,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
};

export const useRestoreEntity = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			entityType,
			id,
		}: {
			entityType: ArchiveEntityType;
			id: string;
		}) => restoreEntity(entityType, id),
		onSuccess: (_, variables) => {
			// Invalidate the archive query for this entity type
			queryClient.invalidateQueries({
				queryKey: ["instructor-archives", variables.entityType],
			});
			
			// Invalidate the main entity list queries based on entity type
			switch (variables.entityType) {
				case "student":
					queryClient.invalidateQueries({ queryKey: ["students"] });
					queryClient.invalidateQueries({ queryKey: ["students-by-teacher"] });
					break;
				case "agency":
					queryClient.invalidateQueries({ queryKey: agencyKeys.lists() });
					break;
				case "course":
					queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
					break;
				case "section":
					queryClient.invalidateQueries({ queryKey: sectionKeys.lists() });
					break;
				case "announcement":
					queryClient.invalidateQueries({ queryKey: announcementKeys.lists() });
					queryClient.invalidateQueries({ queryKey: announcementKeys.stats() });
					break;
				case "requirement":
					// Requirements use different query keys - handled elsewhere if needed
					break;
				case "report":
					// Reports use different query keys - handled elsewhere if needed
					break;
			}
		},
	});
};

export const useHardDeleteEntity = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			entityType,
			id,
		}: {
			entityType: ArchiveEntityType;
			id: string;
		}) => hardDeleteEntity(entityType, id),
		onSuccess: (_, variables) => {
			// Invalidate the archive query for this entity type
			queryClient.invalidateQueries({
				queryKey: ["instructor-archives", variables.entityType],
			});
			
			// Note: We don't invalidate main entity lists for hard delete
			// since the item is permanently deleted and won't appear in lists anyway
		},
	});
};

