"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { ArchiveEntityType, ArchiveItem } from "@/lib/instructor-archives/types";
import {
  listArchivedEntities,
  restoreEntity,
  hardDeleteEntity,
} from "@/lib/instructor-archives/api";
import { RotateCcw, Trash2, RefreshCw } from "lucide-react";
import { agencyKeys } from "@/hooks/agency/useAgency";
import { courseKeys } from "@/hooks/course/useCourse";
import { sectionKeys } from "@/hooks/section/useSection";
import { announcementKeys } from "@/hooks/announcement/useAnnouncement";
import { cn } from "@/lib/utils";

export interface ArchiveColumn<T = any> {
  id: string;
  header: string;
  /**
   * Render function for the cell. Receives the normalized ArchiveItem.
   */
  cell: (item: ArchiveItem<T>) => React.ReactNode;
  className?: string;
}

interface InstructorArchiveTableProps<T = any> {
  entityType: ArchiveEntityType;
  columns: ArchiveColumn<T>[];
}

export function InstructorArchiveTable<T = any>({
  entityType,
  columns,
}: InstructorArchiveTableProps<T>) {
  const queryClient = useQueryClient();

  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<
    "yes" | "no" | null
  >(null);
  const [selectedItem, setSelectedItem] = useState<ArchiveItem<T> | null>(null);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["instructor-archives", entityType],
    queryFn: () => listArchivedEntities<T>(entityType, { page: 1, limit: 50 }),
    staleTime: 1000 * 60, // 1 minute
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => restoreEntity<T>(entityType, id),
    onSuccess: () => {
      // Invalidate the archive query for this entity type
      queryClient.invalidateQueries({
        queryKey: ["instructor-archives", entityType],
      });
      
      // Invalidate the main entity list queries based on entity type
      switch (entityType) {
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
      }
      
      toast.success("Item restored successfully");
    },
    onError: (err: any) => {
      toast.error(
        err?.message ||
          err?.response?.data?.message ||
          "Failed to restore item"
      );
    },
  });

  const hardDeleteMutation = useMutation({
    mutationFn: (id: string) => hardDeleteEntity(entityType, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["instructor-archives", entityType],
      });
      toast.success("Item deleted permanently");
      setDeleteAlertOpen(false);
      setDeleteConfirmation(null);
      setSelectedItem(null);
    },
    onError: (err: any) => {
      toast.error(
        err?.message ||
          err?.response?.data?.message ||
          "Failed to delete item permanently"
      );
    },
  });

  const items = useMemo(() => data?.items ?? [], [data]);

  const itemNameToDelete = useMemo(() => {
    if (!selectedItem) return "this item";
    return selectedItem.name || "this item";
  }, [selectedItem]);

  const handleDeleteClick = (item: ArchiveItem<T>) => {
    setSelectedItem(item);
    setDeleteConfirmation(null);
    setDeleteAlertOpen(true);
  };

  const handleDeleteDialogClose = (open: boolean) => {
    setDeleteAlertOpen(open);
    if (!open) {
      setDeleteConfirmation(null);
      setSelectedItem(null);
    }
  };

  const handleConfirmDelete = () => {
    if (!selectedItem || deleteConfirmation !== "yes") return;
    hardDeleteMutation.mutate(selectedItem.id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
        Loading archived items...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
        <span>
          Failed to load archived items
          {error instanceof Error ? `: ${error.message}` : ""}
        </span>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
        No archived items found for this category.
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.id} className={column.className}>
                {column.header}
              </TableHead>
            ))}
            <TableHead className="w-[160px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              {columns.map((column) => (
                <TableCell key={column.id} className={column.className}>
                  {column.cell(item as ArchiveItem<T>)}
                </TableCell>
              ))}
              <TableCell className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={restoreMutation.isPending}
                  onClick={() => restoreMutation.mutate(item.id)}
                >
                  <RotateCcw className="h-4 w-4" />
                  <span className="sr-only">Restore</span>
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  disabled={hardDeleteMutation.isPending}
                  onClick={() => handleDeleteClick(item as ArchiveItem<T>)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete permanently</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={handleDeleteDialogClose}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              Delete Archived Item
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete{" "}
              <strong className="font-semibold text-gray-900">
                {itemNameToDelete}
              </strong>
              ? This action cannot be undone and will remove the item from the
              archives.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Please confirm your decision:
              </label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={deleteConfirmation === "yes" ? "default" : "outline"}
                  className={cn(
                    "flex-1",
                    deleteConfirmation === "yes"
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : ""
                  )}
                  onClick={() => setDeleteConfirmation("yes")}
                >
                  Yes, permanently delete
                </Button>
                <Button
                  type="button"
                  variant={deleteConfirmation === "no" ? "default" : "outline"}
                  className={cn(
                    "flex-1",
                    deleteConfirmation === "no"
                      ? "bg-gray-600 hover:bg-gray-700 text-white"
                      : ""
                  )}
                  onClick={() => {
                    setDeleteConfirmation("no");
                    setDeleteAlertOpen(false);
                  }}
                >
                  No, cancel
                </Button>
              </div>
            </div>
          </div>

          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel onClick={() => setDeleteConfirmation(null)}>
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={
                hardDeleteMutation.isPending || deleteConfirmation !== "yes"
              }
            >
              {hardDeleteMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Permanently"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
