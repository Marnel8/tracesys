import api from "@/lib/api";
import type {
  ArchiveEntityType,
  ArchiveItem,
  ArchiveListResponse,
} from "./types";

export interface ArchiveListFilters {
  page?: number;
  limit?: number;
  search?: string;
}

// Centralize endpoints so the implementation can evolve without touching callers.
const ARCHIVE_ENDPOINTS = {
  /**
   * Archive endpoints mapping. Currently, student archives are fully implemented.
   * Other entity types will return their respective endpoints when implemented.
   */
  list: (type: ArchiveEntityType) => {
    switch (type) {
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
        return `/${type}/archives`;
    }
  },
  restore: (type: ArchiveEntityType, id: string) => {
    switch (type) {
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
        return `/${type}/${id}/restore`;
    }
  },
  hardDelete: (type: ArchiveEntityType, id: string) => {
    switch (type) {
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
        return `/${type}/${id}/hard-delete`;
    }
  },
  softDelete: (type: ArchiveEntityType, id: string) => {
    switch (type) {
      case "student":
        // Use the existing soft-delete (deactivate) endpoint.
        return `/student/${id}`;
      default:
        // Generic pattern for future soft-delete endpoints.
        return `/${type}/${id}/archive`;
    }
  },
} as const;

export const buildArchiveQueryParams = (filters?: ArchiveListFilters) => {
  const params = new URLSearchParams();
  if (!filters) return params;
  if (filters.page) params.append("page", String(filters.page));
  if (filters.limit) params.append("limit", String(filters.limit));
  if (filters.search) params.append("search", filters.search);
  return params;
};

export async function listArchivedEntities<T = any>(
  type: ArchiveEntityType,
  filters?: ArchiveListFilters
): Promise<ArchiveListResponse<T>> {
  const params = buildArchiveQueryParams(filters);
  const res = await api.get(
    `${ARCHIVE_ENDPOINTS.list(type)}?${params.toString()}`
  );
  // Shape is intentionally normalized on the frontend so the backend can return
  // either { data: ... } or the list directly.
  const data = (res.data?.data ?? res.data) as ArchiveListResponse<T>;
  return data;
}

export async function restoreEntity<T = any>(
  type: ArchiveEntityType,
  id: string
): Promise<ArchiveItem<T>> {
  const res = await api.post(ARCHIVE_ENDPOINTS.restore(type, id));
  const data = (res.data?.data ?? res.data) as ArchiveItem<T>;
  return data;
}

export async function hardDeleteEntity(
  type: ArchiveEntityType,
  id: string
): Promise<void> {
  await api.delete(ARCHIVE_ENDPOINTS.hardDelete(type, id));
}

// Soft-delete is used from the main entity pages; those pages should NOT trigger
// hard deletes directly, only archive the item so it shows up in /archives.
export async function softDeleteEntity(
  type: ArchiveEntityType,
  id: string
): Promise<void> {
  // Students currently use the existing soft-delete (deactivate) DELETE endpoint.
  // Other entity types will use POST to a future /:type/:id/archive endpoint.
  if (type === "student") {
    await api.delete(ARCHIVE_ENDPOINTS.softDelete(type, id));
  } else {
    await api.post(ARCHIVE_ENDPOINTS.softDelete(type, id));
  }
}


