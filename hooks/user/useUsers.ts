import api from "@/lib/api";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: "admin" | "instructor" | "student" | "all";
  status?: "active" | "inactive" | "all";
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  age?: number;
  phone: string;
  role: string;
  gender?: string;
  avatar?: string;
  address?: string;
  bio?: string;
  studentId?: string;
  instructorId?: string;
  departmentId?: string;
  department?: {
    id: string;
    name: string;
    code: string;
  };
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateUserParams {
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  password: string;
  phone: string;
  age?: number;
  gender?: string;
  role: "admin" | "instructor" | "student";
  studentId?: string;
  instructorId?: string;
  departmentId?: string;
  avatar?: File;
}

const getUsers = async (filters: UserFilters = {}): Promise<UsersResponse> => {
  try {
    const params = new URLSearchParams();
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.search) params.append("search", filters.search);
    if (filters.role && filters.role !== "all")
      params.append("role", filters.role);
    if (filters.status && filters.status !== "all")
      params.append("status", filters.status);

    const res = await api.get(`/user?${params.toString()}`);
    return res.data.data || res.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Failed to fetch users"
      );
    } else if (error.request) {
      throw new Error("No response from server");
    } else {
      throw new Error("Error fetching users: " + error.message);
    }
  }
};

const createUser = async (userData: CreateUserParams) => {
  const formData = new FormData();

  formData.append("firstName", userData.firstName);
  formData.append("lastName", userData.lastName);
  formData.append("email", userData.email);
  formData.append("password", userData.password);
  formData.append("phone", userData.phone);
  formData.append("role", userData.role);

  if (userData.middleName) {
    formData.append("middleName", userData.middleName);
  }
  if (userData.age) {
    formData.append("age", userData.age.toString());
  }
  if (userData.gender) {
    formData.append("gender", userData.gender);
  }
  if (userData.studentId) {
    formData.append("studentId", userData.studentId);
  }
  if (userData.instructorId) {
    formData.append("instructorId", userData.instructorId);
  }
  if (userData.departmentId) {
    formData.append("departmentId", userData.departmentId);
  }
  if (userData.avatar) {
    formData.append("avatar", userData.avatar);
  }

  try {
    const res = await api.post("/user/create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error?.response.data.message || "Failed to create user");
    } else if (error.request) {
      throw new Error("No response from server");
    } else {
      throw new Error("Error creating user: " + error.message);
    }
  }
};

const deleteUser = async (userId: string) => {
  try {
    const res = await api.delete(`/user/${userId}`);
    return res.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error?.response.data.message || "Failed to delete user");
    } else if (error.request) {
      throw new Error("No response from server");
    } else {
      throw new Error("Error deleting user: " + error.message);
    }
  }
};

const toggleUserStatus = async ({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) => {
  try {
    const res = await api.put(`/user/${id}/status`, { isActive });
    return res.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        error?.response.data.message || "Failed to update user status"
      );
    } else if (error.request) {
      throw new Error("No response from server");
    } else {
      throw new Error("Error updating user status: " + error.message);
    }
  }
};

export const useUsers = (filters: UserFilters = {}) => {
  return useQuery({
    queryKey: ["users", filters],
    queryFn: () => getUsers(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleUserStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

