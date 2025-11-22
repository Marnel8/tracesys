import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

export type ReportStatus = "draft" | "submitted" | "approved" | "rejected";
export type ReportType = "weekly" | "monthly" | "final" | "narrative";

export interface Report {
	id: string;
	studentId: string;
	templateId?: string | null;
	practicumId?: string | null;
	title: string;
	content: string;
	type: ReportType;
	status: ReportStatus;
	weekNumber?: number | null;
	startDate?: string | null;
	endDate?: string | null;
	dueDate?: string | null;
	submittedDate?: string | null;
	approvedDate?: string | null;
	approvedBy?: string | null;
	feedback?: string | null;
	rating?: number | null;
	hoursLogged?: number | null;
	activities?: string | null;
	learnings?: string | null;
	challenges?: string | null;
	fileUrl?: string | null;
	createdAt: string;
	updatedAt: string;
	template?: any;
	student?: any;
}

export interface ReportListResponse {
	reports: Report[];
	pagination: {
		currentPage: number;
		totalPages: number;
		totalItems: number;
		itemsPerPage: number;
	};
}

const ENDPOINTS = {
	list: "/reports",
	detail: (id: string) => `/reports/${id}`,
	fromTemplate: "/reports/from-template",
	submit: (id: string) => `/reports/${id}/submit`,
	approve: (id: string) => `/reports/${id}/approve`,
	reject: (id: string) => `/reports/${id}/reject`,
	stats: (studentId: string) => `/reports/stats/${studentId}`,
};

export const reportKeys = {
	all: ["reports"] as const,
	lists: () => [...reportKeys.all, "list"] as const,
	list: (filters: any) => [...reportKeys.lists(), filters] as const,
	details: () => [...reportKeys.all, "detail"] as const,
	detail: (id: string) => [...reportKeys.details(), id] as const,
	stats: (studentId: string) => [...reportKeys.all, "stats", studentId] as const,
};

export const useReports = (filters: {
	page?: number;
	limit?: number;
	search?: string;
	status?: ReportStatus | "all";
	type?: ReportType | "all";
	studentId?: string;
	practicumId?: string;
	weekNumber?: number;
	startDate?: string;
	endDate?: string;
} = {}) => {
	return useQuery({
		queryKey: reportKeys.list(filters),
		queryFn: async (): Promise<ReportListResponse> => {
			const params = new URLSearchParams();
			if (filters.page) params.append("page", String(filters.page));
			if (filters.limit) params.append("limit", String(filters.limit));
			if (filters.search) params.append("search", filters.search);
			if (filters.status && filters.status !== "all") params.append("status", filters.status);
			if (filters.type && filters.type !== "all") params.append("type", filters.type);
			if (filters.studentId) params.append("studentId", filters.studentId);
			if (filters.practicumId) params.append("practicumId", filters.practicumId);
			if (typeof filters.weekNumber === "number") params.append("weekNumber", String(filters.weekNumber));
			if (filters.startDate) params.append("startDate", filters.startDate);
			if (filters.endDate) params.append("endDate", filters.endDate);
			const res = await api.get(`${ENDPOINTS.list}?${params.toString()}`);
			return res.data.data as ReportListResponse;
		},
		placeholderData: (prev) => prev,
	});
};

export const useReport = (id: string) => {
	return useQuery({
		queryKey: reportKeys.detail(id),
		queryFn: async (): Promise<Report> => {
			const res = await api.get(ENDPOINTS.detail(id));
			return res.data.data as Report;
		},
		enabled: !!id,
	});
};

export const useCreateReportFromTemplate = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (data: { templateId: string; studentId: string; practicumId?: string | null; dueDate?: string | null }) => {
			const res = await api.post(ENDPOINTS.fromTemplate, data);
			return res.data.data as Report;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: reportKeys.lists() });
			toast.success("Report created from template");
		},
		onError: (err: any) => {
			toast.error(err.response?.data?.message || "Failed to create report from template");
		},
	});
};

export const useCreateReport = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (data: { title: string; content?: string; type: ReportType; weekNumber?: number; startDate?: string; endDate?: string; practicumId?: string | null; dueDate?: string | null }) => {
            const res = await api.post(ENDPOINTS.list, data);
            return res.data.data as Report;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: reportKeys.lists() });
            toast.success("Report created");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to create report");
        },
    });
};

export const useSubmitReport = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, payload }: { id: string; payload: { title?: string; content?: string; weekNumber?: number; startDate?: string; endDate?: string; hoursLogged?: number; activities?: string; learnings?: string; challenges?: string; file?: File | null } }) => {
			const form = new FormData();
			if (payload.title) form.append("title", payload.title);
			if (payload.content) form.append("content", payload.content);
			if (typeof payload.weekNumber === "number") form.append("weekNumber", String(payload.weekNumber));
			if (payload.startDate) form.append("startDate", payload.startDate);
			if (payload.endDate) form.append("endDate", payload.endDate);
			if (typeof payload.hoursLogged === "number") form.append("hoursLogged", String(payload.hoursLogged));
			if (payload.activities) form.append("activities", payload.activities);
			if (payload.learnings) form.append("learnings", payload.learnings);
			if (payload.challenges) form.append("challenges", payload.challenges);
			if (payload.file) form.append("submissionFile", payload.file);
			const res = await api.post(ENDPOINTS.submit(id), form, {
				headers: { "Content-Type": "multipart/form-data" },
			});
			return res.data.data as Report;
		},
		onSuccess: (data) => {
			qc.invalidateQueries({ queryKey: reportKeys.detail(data.id) });
			qc.invalidateQueries({ queryKey: reportKeys.lists() });
			toast.success("Report submitted");
		},
		onError: (err: any) => {
			toast.error(err.response?.data?.message || "Failed to submit report");
		},
	});
};

export const useApproveReport = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, feedback, rating }: { id: string; feedback?: string | null; rating?: number | null }) => {
			const res = await api.put(ENDPOINTS.approve(id), { feedback: feedback ?? null, rating: rating ?? null });
			return res.data.data as Report;
		},
		onSuccess: (data) => {
			qc.invalidateQueries({ queryKey: reportKeys.detail(data.id) });
			qc.invalidateQueries({ queryKey: reportKeys.lists() });
			toast.success("Report approved");
		},
		onError: (err: any) => {
			toast.error(err.response?.data?.message || "Failed to approve report");
		},
	});
};

export const useRejectReport = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
			const res = await api.put(ENDPOINTS.reject(id), { reason });
			return res.data.data as Report;
		},
		onSuccess: (data) => {
			qc.invalidateQueries({ queryKey: reportKeys.detail(data.id) });
			qc.invalidateQueries({ queryKey: reportKeys.lists() });
			toast.success("Report rejected");
		},
		onError: (err: any) => {
			toast.error(err.response?.data?.message || "Failed to reject report");
		},
	});
};

export const useReportStats = (studentId: string) => {
	return useQuery({
		queryKey: reportKeys.stats(studentId),
		queryFn: async (): Promise<{ total: number; approved: number; submitted: number; rejected: number; draft: number }> => {
			const res = await api.get(ENDPOINTS.stats(studentId));
			return res.data.data;
		},
		enabled: !!studentId,
	});
};


