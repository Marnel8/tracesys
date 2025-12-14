import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  Course,
  CourseFormData,
  CourseFilters,
  CourseResponse,
} from "@/data/departments";
import { toast } from "sonner";

// API endpoints
const COURSE_ENDPOINTS = {
  courses: "/course/",
  course: (id: string) => `/course/${id}`,
};

// Query keys
export const courseKeys = {
  all: ["courses"] as const,
  lists: () => [...courseKeys.all, "list"] as const,
  list: (filters: CourseFilters) => [...courseKeys.lists(), filters] as const,
  details: () => [...courseKeys.all, "detail"] as const,
  detail: (id: string) => [...courseKeys.details(), id] as const,
};

// Get all courses with filters
export const useCourses = (filters: CourseFilters = {}) => {
  return useQuery({
    queryKey: courseKeys.list(filters),
    queryFn: async (): Promise<CourseResponse> => {
      const params = new URLSearchParams();

      // Add pagination with a high limit to get all courses
      params.append("page", "1");
      params.append("limit", "100");

      if (filters.search) params.append("search", filters.search);
      if (filters.status && filters.status !== "all")
        params.append("status", filters.status);
      if (filters.departmentId)
        params.append("departmentId", filters.departmentId);

      const response = await api.get(
        `${COURSE_ENDPOINTS.courses}?${params.toString()}`
      );
      return response.data.data;
    },
  });
};

// Get single course
export const useCourse = (id: string) => {
  return useQuery({
    queryKey: courseKeys.detail(id),
    queryFn: async (): Promise<Course> => {
      const response = await api.get(COURSE_ENDPOINTS.course(id));
      return response.data.data;
    },
    enabled: !!id,
  });
};

// Create course mutation
export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CourseFormData): Promise<Course> => {
      const response = await api.post(COURSE_ENDPOINTS.courses, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      toast.success("Course created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create course");
    },
  });
};

// Update course mutation
export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CourseFormData>;
    }): Promise<Course> => {
      const response = await api.put(COURSE_ENDPOINTS.course(id), data);
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(data.id) });
      toast.success("Course updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update course");
    },
  });
};

// Delete course mutation
export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(COURSE_ENDPOINTS.course(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      toast.success("Course deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete course");
    },
  });
};

// Toggle course status mutation
export const useToggleCourseStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      isActive,
    }: {
      id: string;
      isActive: boolean;
    }): Promise<Course> => {
      const response = await api.put(COURSE_ENDPOINTS.course(id), { isActive });
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(data.id) });
      toast.success(
        `Course ${data.isActive ? "activated" : "deactivated"} successfully`
      );
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update course status"
      );
    },
  });
};
