import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

export interface Invitation {
	id: string;
	token: string;
	email: string;
	role: "student" | "instructor";
	departmentId?: string;
	sectionId?: string;
	program?: string;
	expiresAt: string;
	usedAt?: string;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
	department?: {
		id: string;
		name: string;
	};
	section?: {
		id: string;
		name: string;
	};
}

export interface CreateInvitationParams {
	email: string;
	role: "student" | "instructor";
	departmentId?: string;
	sectionId?: string;
	program?: string;
	expiresInDays?: number;
}

export interface BulkInvitationParams {
	emails: string[];
	role: "student" | "instructor";
	departmentId?: string;
	sectionId?: string;
	program?: string;
	expiresInDays?: number;
}

export interface InvitationsResponse {
	invitations: Invitation[];
	total: number;
}

interface UseGetInvitationsOptions {
	status?: "pending" | "used" | "expired" | "all";
	search?: string;
}

export const useGetInvitations = (options: UseGetInvitationsOptions = {}) => {
	const { status, search } = options;

	return useQuery<InvitationsResponse>({
		queryKey: ["invitations", status, search],
		queryFn: async () => {
			const params = new URLSearchParams();
			if (status) {
				params.set("status", status);
			}
			if (search) {
				params.set("search", search);
			}

			const query = params.toString();
			const response = await api.get(`/invitation/${query ? `?${query}` : ""}`);
			return response.data.data;
		},
	});
};

export const useCreateInvitation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: CreateInvitationParams) => {
			const response = await api.post("/invitation/", params);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["invitations"] });
			toast.success("Invitation sent successfully");
		},
		onError: (error: any) => {
			// Backend returns error directly in data, not nested under error
			const errorMessage = error.response?.data?.message || error.response?.data?.error?.message || "Failed to create invitation";
			// Only show toast if we have a meaningful message (not the generic axios error)
			if (errorMessage && !errorMessage.includes("Request failed with status code")) {
				toast.error(errorMessage);
			}
			// Re-throw to allow component to handle it
			throw error;
		},
	});
};

export const useCreateBulkInvitations = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: BulkInvitationParams) => {
			const response = await api.post("/invitation/bulk", params);
			return response.data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["invitations"] });
			const successCount = data.data?.count || data.data?.invitations?.length || 0;
			if (successCount > 0) {
				toast.success(`${successCount} invitation(s) sent successfully`);
			}
		},
		onError: (error: any) => {
			// Backend returns error directly in data, not nested under error
			const errorMessage = error.response?.data?.message || error.response?.data?.error?.message || "Failed to create invitations";
			// Only show toast if we have a meaningful message (not the generic axios error)
			if (errorMessage && !errorMessage.includes("Request failed with status code")) {
				toast.error(errorMessage);
			}
			// Re-throw to allow component to handle it
			throw error;
		},
	});
};

export const useValidateInvitation = (token: string) => {
	return useQuery<Invitation>({
		queryKey: ["invitation", token],
		queryFn: async () => {
			const response = await api.get(`/invitation/validate/${token}`);
			return response.data.data;
		},
		enabled: !!token,
	});
};

export const useDeleteInvitation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const response = await api.delete(`/invitation/${id}`);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["invitations"] });
			toast.success("Invitation deleted successfully");
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.error?.message || "Failed to delete invitation");
		},
	});
};

