"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ArchiveEntityType } from "@/lib/instructor-archives/types";
import { softDeleteEntity } from "@/lib/instructor-archives/api";

interface UseSoftDeleteOptions {
  entityType: ArchiveEntityType;
  /**
   * Optional: query keys to invalidate after a successful soft delete.
   * This keeps the hook generic while still allowing pages to refresh
   * their own data in a DRY way.
   */
  invalidateKeys?: (string | unknown[])[];
  /**
   * Optional: custom success message.
   */
  successMessage?: string;
}

export const useSoftDelete = ({
  entityType,
  invalidateKeys,
  successMessage,
}: UseSoftDeleteOptions) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      await softDeleteEntity(entityType, id);
    },
    onSuccess: () => {
      // Invalidate custom keys passed by the caller
      if (invalidateKeys) {
        invalidateKeys.forEach((key) => {
          queryClient.invalidateQueries({
            queryKey: Array.isArray(key) ? (key as any) : [key],
          });
        });
      }
      
      // Always invalidate archive queries so the archives page shows the newly archived item
      queryClient.invalidateQueries({
        queryKey: ["instructor-archives", entityType],
      });
      
      toast.success(successMessage ?? "Item moved to Archives");
    },
    onError: (error: any) => {
      const message =
        error?.message ||
        error?.response?.data?.message ||
        "Failed to move item to Archives";
      toast.error(message);
    },
  });

  return {
    softDelete: mutation.mutateAsync,
    softDeleteMutation: mutation,
  };
};


