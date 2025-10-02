import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

export type AttendanceStatus = "present" | "absent" | "late" | "excused";
export type AttendanceApprovalStatus = "Pending" | "Approved" | "Declined";

export interface AttendanceRecord {
	id: string;
	studentId: string;
	practicumId: string;
	date: string;
	day: string;
	timeIn?: string | null;
	timeOut?: string | null;
	hours?: number | null;
	status: AttendanceStatus;
	latitude?: number | null;
	longitude?: number | null;
	address?: string | null;
	selfieImage?: string | null;
	remarks?: string | null;
	// agency
	agencyName?: string | null;
	agencyLocation?: string | null;
	workSetup?: "On-site" | "Hybrid" | "Work From Home" | null;
	branchType?: "Main" | "Branch" | null;
	openingTime?: string | null;
	closingTime?: string | null;
	contactPerson?: string | null;
	contactRole?: string | null;
	contactPhone?: string | null;
	contactEmail?: string | null;
	// device/time in
	timeInLocationType?: "Inside" | "In-field" | "Outside" | null;
	timeInDeviceType?: "Mobile" | "Desktop" | "Tablet" | null;
	timeInDeviceUnit?: string | null;
	timeInMacAddress?: string | null;
	timeInRemarks?: "Normal" | "Late" | "Early" | null;
	timeInExactLocation?: string | null;
	// device/time out
	timeOutLocationType?: "Inside" | "In-field" | "Outside" | null;
	timeOutDeviceType?: "Mobile" | "Desktop" | "Tablet" | null;
	timeOutDeviceUnit?: string | null;
	timeOutMacAddress?: string | null;
	timeOutRemarks?: "Normal" | "Early Departure" | "Overtime" | null;
	timeOutExactLocation?: string | null;
	// photos
	photoIn?: string | null;
	photoOut?: string | null;
	// approval
	approvalStatus?: AttendanceApprovalStatus;
	approvedBy?: string | null;
	approvedAt?: string | null;
	approvalNotes?: string | null;
	// timestamps
	createdAt: string;
	updatedAt: string;
	student?: any;
	practicum?: any;
}

export interface AttendanceListResponse {
	attendance: AttendanceRecord[];
	pagination: {
		currentPage: number;
		totalPages: number;
		totalItems: number;
		itemsPerPage: number;
	};
}

const ENDPOINTS = {
	list: "/attendance",
	detail: (id: string) => `/attendance/${id}`,
	clockIn: "/attendance/clock-in",
	clockOut: "/attendance/clock-out",
};

export const attendanceKeys = {
	all: ["attendance"] as const,
	lists: () => [...attendanceKeys.all, "list"] as const,
	list: (filters: any) => [...attendanceKeys.lists(), filters] as const,
	details: () => [...attendanceKeys.all, "detail"] as const,
	detail: (id: string) => [...attendanceKeys.details(), id] as const,
};

export const useAttendance = (filters: {
	page?: number;
	limit?: number;
	search?: string;
	status?: AttendanceStatus | "all";
	approvalStatus?: AttendanceApprovalStatus | "all";
	studentId?: string;
	practicumId?: string;
	date?: string;
	startDate?: string;
	endDate?: string;
} = {}) => {
	return useQuery({
		queryKey: attendanceKeys.list(filters),
		queryFn: async (): Promise<AttendanceListResponse> => {
			const params = new URLSearchParams();
			if (filters.page) params.append("page", String(filters.page));
			if (filters.limit) params.append("limit", String(filters.limit));
			if (filters.search) params.append("search", filters.search);
			if (filters.status && filters.status !== "all") params.append("status", filters.status);
			if (filters.approvalStatus && filters.approvalStatus !== "all")
				params.append("approvalStatus", filters.approvalStatus);
			if (filters.studentId) params.append("studentId", filters.studentId);
			if (filters.practicumId) params.append("practicumId", filters.practicumId);
			if (filters.date) params.append("date", filters.date);
			if (filters.startDate) params.append("startDate", filters.startDate);
			if (filters.endDate) params.append("endDate", filters.endDate);
			const res = await api.get(`${ENDPOINTS.list}?${params.toString()}`);
			return res.data.data as AttendanceListResponse;
		},
		placeholderData: (prev) => prev,
	});
};

export const useAttendanceRecord = (id: string) => {
	return useQuery({
		queryKey: attendanceKeys.detail(id),
		queryFn: async (): Promise<AttendanceRecord> => {
			const res = await api.get(ENDPOINTS.detail(id));
			return res.data.data as AttendanceRecord;
		},
		enabled: !!id,
	});
};

export const useClockIn = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (data: {
			practicumId: string;
			date?: string;
			day?: string;
			latitude?: number | null;
			longitude?: number | null;
			address?: string | null;
			locationType?: "Inside" | "In-field" | "Outside";
			deviceType?: "Mobile" | "Desktop" | "Tablet";
			deviceUnit?: string | null;
			macAddress?: string | null;
			remarks?: "Normal" | "Late" | "Early";
			photo?: File | null;
		}) => {
			const hasFile = !!data.photo;
			if (hasFile) {
				const form = new FormData();
				Object.entries({ ...data, photo: undefined }).forEach(([k, v]) => {
					if (v !== undefined && v !== null) form.append(k, String(v));
				});
				if (data.photo) form.append("photo", data.photo);
				const res = await api.post(ENDPOINTS.clockIn, form, {
					headers: { "Content-Type": "multipart/form-data" },
				});
				return res.data.data as AttendanceRecord;
			} else {
				const payload: any = { ...data };
				delete payload.photo;
				const res = await api.post(ENDPOINTS.clockIn, payload);
				return res.data.data as AttendanceRecord;
			}
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: attendanceKeys.lists() });
			toast.success("Clock-in successful");
		},
		onError: (err: any) => {
			toast.error(err.response?.data?.message || "Failed to clock in");
		},
	});
};

export const useClockOut = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (data: {
			practicumId: string;
			date?: string;
			latitude?: number | null;
			longitude?: number | null;
			address?: string | null;
			locationType?: "Inside" | "In-field" | "Outside";
			deviceType?: "Mobile" | "Desktop" | "Tablet";
			deviceUnit?: string | null;
			macAddress?: string | null;
			remarks?: "Normal" | "Early Departure" | "Overtime";
			photo?: File | null;
		}) => {
			const hasFile = !!data.photo;
			if (hasFile) {
				const form = new FormData();
				Object.entries({ ...data, photo: undefined }).forEach(([k, v]) => {
					if (v !== undefined && v !== null) form.append(k, String(v));
				});
				if (data.photo) form.append("photo", data.photo);
				const res = await api.post(ENDPOINTS.clockOut, form, {
					headers: { "Content-Type": "multipart/form-data" },
				});
				return res.data.data as AttendanceRecord;
			} else {
				const payload: any = { ...data };
				delete payload.photo;
				const res = await api.post(ENDPOINTS.clockOut, payload);
				return res.data.data as AttendanceRecord;
			}
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: attendanceKeys.lists() });
			toast.success("Clock-out successful");
		},
		onError: (err: any) => {
			toast.error(err.response?.data?.message || "Failed to clock out");
		},
	});
};


