import api from "@/lib/api";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

// Report interfaces
export interface WeeklyReport {
	id: string;
	studentId: string;
	weekNumber: number;
	startDate: string;
	endDate: string;
	title: string;
	content: string;
	activities: string[];
	learnings: string[];
	challenges: string[];
	attachments?: string[];
	status: "draft" | "submitted" | "reviewed" | "returned";
	grade?: number;
	feedback?: string;
	submittedAt?: string;
	reviewedAt?: string;
	createdAt: string;
	updatedAt: string;
}

export interface NarrativeReport {
	id: string;
	studentId: string;
	title: string;
	content: string;
	attachments?: string[];
	status: "draft" | "submitted" | "reviewed" | "returned";
	grade?: number;
	feedback?: string;
	submittedAt?: string;
	reviewedAt?: string;
	createdAt: string;
	updatedAt: string;
}

export interface ReportTemplate {
	id: string;
	name: string;
	type: "weekly" | "narrative";
	description: string;
	sections: {
		title: string;
		description: string;
		required: boolean;
		order: number;
	}[];
	isActive: boolean;
}

export interface CreateWeeklyReportParams {
	studentId: string;
	weekNumber: number;
	startDate: string;
	endDate: string;
	title: string;
	content: string;
	activities: string[];
	learnings: string[];
	challenges: string[];
	attachments?: File[];
}

export interface CreateNarrativeReportParams {
	studentId: string;
	title: string;
	content: string;
	attachments?: File[];
}

export interface UpdateReportParams {
	id: string;
	title?: string;
	content?: string;
	activities?: string[];
	learnings?: string[];
	challenges?: string[];
	attachments?: File[];
}

// API functions
const createWeeklyReport = async (params: CreateWeeklyReportParams) => {
	const formData = new FormData();
	
	formData.append("studentId", params.studentId);
	formData.append("weekNumber", params.weekNumber.toString());
	formData.append("startDate", params.startDate);
	formData.append("endDate", params.endDate);
	formData.append("title", params.title);
	formData.append("content", params.content);
	formData.append("activities", JSON.stringify(params.activities));
	formData.append("learnings", JSON.stringify(params.learnings));
	formData.append("challenges", JSON.stringify(params.challenges));
	
	if (params.attachments) {
		params.attachments.forEach((file, index) => {
			formData.append(`attachments`, file);
		});
	}

	try {
		const res = await api.post("/reports/weekly", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return res.data;
	} catch (error: any) {
		if (error.response) {
			throw new Error(error?.response.data.message || "Failed to create weekly report");
		} else if (error.request) {
			throw new Error("No response from server");
		} else {
			throw new Error("Error creating weekly report: " + error.message);
		}
	}
};

const createNarrativeReport = async (params: CreateNarrativeReportParams) => {
	const formData = new FormData();
	
	formData.append("studentId", params.studentId);
	formData.append("title", params.title);
	formData.append("content", params.content);
	
	if (params.attachments) {
		params.attachments.forEach((file, index) => {
			formData.append(`attachments`, file);
		});
	}

	try {
		const res = await api.post("/reports/narrative", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return res.data;
	} catch (error: any) {
		if (error.response) {
			throw new Error(error?.response.data.message || "Failed to create narrative report");
		} else if (error.request) {
			throw new Error("No response from server");
		} else {
			throw new Error("Error creating narrative report: " + error.message);
		}
	}
};

const updateReport = async (params: UpdateReportParams) => {
	const formData = new FormData();
	
	formData.append("id", params.id);
	if (params.title) formData.append("title", params.title);
	if (params.content) formData.append("content", params.content);
	if (params.activities) formData.append("activities", JSON.stringify(params.activities));
	if (params.learnings) formData.append("learnings", JSON.stringify(params.learnings));
	if (params.challenges) formData.append("challenges", JSON.stringify(params.challenges));
	
	if (params.attachments) {
		params.attachments.forEach((file, index) => {
			formData.append(`attachments`, file);
		});
	}

	try {
		const res = await api.put(`/reports/${params.id}`, formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return res.data;
	} catch (error: any) {
		if (error.response) {
			throw new Error(error?.response.data.message || "Failed to update report");
		} else if (error.request) {
			throw new Error("No response from server");
		} else {
			throw new Error("Error updating report: " + error.message);
		}
	}
};

const submitReport = async (reportId: string) => {
	try {
		const res = await api.post(`/reports/${reportId}/submit`);
		return res.data;
	} catch (error: any) {
		if (error.response) {
			throw new Error(error?.response.data.message || "Failed to submit report");
		} else if (error.request) {
			throw new Error("No response from server");
		} else {
			throw new Error("Error submitting report: " + error.message);
		}
	}
};

const getStudentReports = async (studentId: string, params?: {
	page?: number;
	limit?: number;
	type?: "weekly" | "narrative";
	status?: string;
}) => {
	try {
		const queryParams = new URLSearchParams();
		queryParams.append("studentId", studentId);
		if (params?.page) queryParams.append("page", params.page.toString());
		if (params?.limit) queryParams.append("limit", params.limit.toString());
		if (params?.type) queryParams.append("type", params.type);
		if (params?.status) queryParams.append("status", params.status);

		// Use the unified reports listing endpoint, filtered by studentId
		const res = await api.get(`/reports?${queryParams.toString()}`);
		// Normalize to return the data payload consistent with other report list hooks
		return res.data?.data ?? res.data;
	} catch (error: any) {
		if (error.response) {
			throw new Error(error.response.data.message || "Failed to fetch reports");
		} else if (error.request) {
			throw new Error("No response from server");
		} else {
			throw new Error("Error fetching reports: " + error.message);
		}
	}
};

const getReportTemplates = async (type?: "weekly" | "narrative") => {
	try {
		const queryParams = new URLSearchParams();
		if (type) queryParams.append("type", type);

		const res = await api.get(`/reports/templates?${queryParams.toString()}`);
		return res.data;
	} catch (error: any) {
		if (error.response) {
			throw new Error(error.response.data.message || "Failed to fetch report templates");
		} else if (error.request) {
			throw new Error("No response from server");
		} else {
			throw new Error("Error fetching report templates: " + error.message);
		}
	}
};

const getReport = async (reportId: string) => {
	try {
		const res = await api.get(`/reports/${reportId}`);
		return res.data;
	} catch (error: any) {
		if (error.response) {
			throw new Error(error.response.data.message || "Failed to fetch report");
		} else if (error.request) {
			throw new Error("No response from server");
		} else {
			throw new Error("Error fetching report: " + error.message);
		}
	}
};

// React Query hooks
export const useCreateWeeklyReport = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createWeeklyReport,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["reports"] });
		},
	});
};

export const useCreateNarrativeReport = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createNarrativeReport,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["reports"] });
		},
	});
};

export const useUpdateReport = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: updateReport,
		onSuccess: (data) => {
			queryClient.setQueryData(["report", data.data.id], data);
			queryClient.invalidateQueries({ queryKey: ["reports"] });
		},
	});
};

export const useSubmitReport = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: submitReport,
		onSuccess: (data, reportId) => {
			queryClient.setQueryData(["report", reportId], data);
			queryClient.invalidateQueries({ queryKey: ["reports"] });
		},
	});
};

export const useStudentReports = (studentId: string, params?: {
	page?: number;
	limit?: number;
	type?: "weekly" | "narrative";
	status?: string;
}) => {
	return useQuery({
		queryKey: ["reports", studentId, params],
		queryFn: () => getStudentReports(studentId, params),
		enabled: !!studentId,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
};

export const useReportTemplates = (type?: "weekly" | "narrative") => {
	return useQuery({
		queryKey: ["reportTemplates", type],
		queryFn: () => getReportTemplates(type),
		staleTime: 1000 * 60 * 30, // 30 minutes
	});
};

export const useReport = (reportId: string) => {
	return useQuery({
		queryKey: ["report", reportId],
		queryFn: () => getReport(reportId),
		enabled: !!reportId,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
};
