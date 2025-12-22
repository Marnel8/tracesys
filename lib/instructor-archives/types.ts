export type ArchiveEntityType =
  | "student"
  | "agency"
  | "course"
  | "section"
  | "requirement"
  | "report"
  | "announcement"
  | "requirementTemplate";

export interface ArchiveItemBase {
  id: string;
  type: ArchiveEntityType;
  name: string;
  deletedAt: string;
  deletedBy?: string | null;
  // Additional metadata for display (e.g. IDs, codes, relationships)
  meta?: Record<string, unknown>;
}

export interface ArchiveItem<T = any> extends ArchiveItemBase {
  raw?: T;
}

export interface ArchiveListResponse<T = any> {
  items: ArchiveItem<T>[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}


