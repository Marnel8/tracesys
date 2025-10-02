import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { Report, ReportListResponse, reportKeys } from "@/hooks/report/useReport";

const ENDPOINTS = {
	list: "/reports/narrative",
	create: "/reports/narrative",
};

export const useNarrativeReports = (filters: {
	page?: number;
	limit?: number;
	search?: string;
	status?: "draft" | "submitted" | "approved" | "rejected" | "all";
	studentId?: string;
	practicumId?: string;
} = {}) => {
	return useQuery({
		queryKey: ["reports", "narrative", "list", filters],
		queryFn: async (): Promise<ReportListResponse> => {
			const params = new URLSearchParams();
			if (filters.page) params.append("page", String(filters.page));
			if (filters.limit) params.append("limit", String(filters.limit));
			if (filters.search) params.append("search", filters.search);
			if (filters.status && filters.status !== "all") params.append("status", filters.status);
			if (filters.studentId) params.append("studentId", filters.studentId);
			if (filters.practicumId) params.append("practicumId", filters.practicumId);
			const res = await api.get(`${ENDPOINTS.list}?${params.toString()}`);
			return res.data.data as ReportListResponse;
		},
		placeholderData: (prev) => prev,
	});
};

export const useCreateNarrativeReport = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (data: {
			title: string;
			content?: string;
			practicumId?: string | null;
			dueDate?: string | null;
			hoursLogged?: number;
			activities?: string;
			learnings?: string;
			challenges?: string;
			file?: File | null;
		}) => {
			const form = new FormData();
			form.append("title", data.title);
			if (data.content) form.append("content", data.content);
			if (data.practicumId) form.append("practicumId", data.practicumId);
			if (data.dueDate) form.append("dueDate", data.dueDate);
			if (typeof data.hoursLogged === "number") form.append("hoursLogged", String(data.hoursLogged));
			if (data.activities) form.append("activities", data.activities);
			if (data.learnings) form.append("learnings", data.learnings);
			if (data.challenges) form.append("challenges", data.challenges);
			if (data.file) form.append("submissionFile", data.file);
			const res = await api.post(ENDPOINTS.create, form, {
				headers: { "Content-Type": "multipart/form-data" },
			});
			return res.data.data as Report;
		},
		onSuccess: (data) => {
			// Invalidate general report lists and narrative lists
			qc.invalidateQueries({ queryKey: reportKeys.lists() });
			qc.invalidateQueries({ queryKey: ["reports", "narrative", "list"] });
			qc.invalidateQueries({ queryKey: reportKeys.detail(data.id) });
			toast.success("Narrative report submitted");
		},
		onError: (err: any) => {
			toast.error(err.response?.data?.message || "Failed to submit narrative report");
		},
	});
};


