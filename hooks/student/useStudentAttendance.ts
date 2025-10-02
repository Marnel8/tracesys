import api from "@/lib/api";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

// Attendance interfaces
export interface AttendanceRecord {
	id: string;
	studentId: string;
	date: string;
	timeIn: string;
	timeOut?: string;
	status: "present" | "absent" | "late" | "excused";
	location: {
		latitude: number;
		longitude: number;
		address: string;
	};
	selfieUrl?: string;
	notes?: string;
	createdAt: string;
	updatedAt: string;
}

export interface AttendanceStats {
	totalDays: number;
	presentDays: number;
	absentDays: number;
	lateDays: number;
	excusedDays: number;
	attendancePercentage: number;
	currentStreak: number;
	longestStreak: number;
}

export interface ClockInParams {
	studentId: string;
	location: {
		latitude: number;
		longitude: number;
		address: string;
	};
	selfie?: File;
	notes?: string;
}

export interface ClockOutParams {
	attendanceId: string;
	notes?: string;
}

// API functions
const clockIn = async (params: ClockInParams) => {
	const formData = new FormData();
	
	formData.append("studentId", params.studentId);
	formData.append("latitude", params.location.latitude.toString());
	formData.append("longitude", params.location.longitude.toString());
	formData.append("address", params.location.address);
	
	if (params.selfie) {
		formData.append("selfie", params.selfie);
	}
	if (params.notes) {
		formData.append("notes", params.notes);
	}

	try {
		const res = await api.post("/attendance/clock-in", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return res.data;
	} catch (error: any) {
		if (error.response) {
			throw new Error(error?.response.data.message || "Failed to clock in");
		} else if (error.request) {
			throw new Error("No response from server");
		} else {
			throw new Error("Error clocking in: " + error.message);
		}
	}
};

const clockOut = async (params: ClockOutParams) => {
	try {
		const res = await api.post("/attendance/clock-out", params);
		return res.data;
	} catch (error: any) {
		if (error.response) {
			throw new Error(error?.response.data.message || "Failed to clock out");
		} else if (error.request) {
			throw new Error("No response from server");
		} else {
			throw new Error("Error clocking out: " + error.message);
		}
	}
};

const getStudentAttendance = async (studentId: string, params?: {
	page?: number;
	limit?: number;
	startDate?: string;
	endDate?: string;
}) => {
	try {
		const queryParams = new URLSearchParams();
		if (params?.page) queryParams.append("page", params.page.toString());
		if (params?.limit) queryParams.append("limit", params.limit.toString());
		if (params?.startDate) queryParams.append("startDate", params.startDate);
		if (params?.endDate) queryParams.append("endDate", params.endDate);

		const res = await api.get(`/attendance/student/${studentId}?${queryParams.toString()}`);
		return res.data;
	} catch (error: any) {
		if (error.response) {
			throw new Error(error.response.data.message || "Failed to fetch attendance");
		} else if (error.request) {
			throw new Error("No response from server");
		} else {
			throw new Error("Error fetching attendance: " + error.message);
		}
	}
};

const getAttendanceStats = async (studentId: string, params?: {
	startDate?: string;
	endDate?: string;
}) => {
	try {
		const queryParams = new URLSearchParams();
		queryParams.append("studentId", studentId);
		if (params?.startDate) queryParams.append("startDate", params.startDate);
		if (params?.endDate) queryParams.append("endDate", params.endDate);

		const res = await api.get(`/attendance/stats?${queryParams.toString()}`);
		return res.data;
	} catch (error: any) {
		if (error.response) {
			throw new Error(error.response.data.message || "Failed to fetch attendance stats");
		} else if (error.request) {
			throw new Error("No response from server");
		} else {
			throw new Error("Error fetching attendance stats: " + error.message);
		}
	}
};

const getTodayAttendance = async (studentId: string) => {
	try {
		const res = await api.get(`/attendance/today/${studentId}`);
		return res.data;
	} catch (error: any) {
		if (error.response) {
			throw new Error(error.response.data.message || "Failed to fetch today's attendance");
		} else if (error.request) {
			throw new Error("No response from server");
		} else {
			throw new Error("Error fetching today's attendance: " + error.message);
		}
	}
};

// React Query hooks
export const useClockIn = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: clockIn,
		onSuccess: () => {
			// Invalidate attendance queries to refresh data
			queryClient.invalidateQueries({ queryKey: ["attendance"] });
			queryClient.invalidateQueries({ queryKey: ["attendanceStats"] });
			queryClient.invalidateQueries({ queryKey: ["todayAttendance"] });
		},
	});
};

export const useClockOut = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: clockOut,
		onSuccess: () => {
			// Invalidate attendance queries to refresh data
			queryClient.invalidateQueries({ queryKey: ["attendance"] });
			queryClient.invalidateQueries({ queryKey: ["attendanceStats"] });
			queryClient.invalidateQueries({ queryKey: ["todayAttendance"] });
		},
	});
};

export const useStudentAttendance = (studentId: string, params?: {
	page?: number;
	limit?: number;
	startDate?: string;
	endDate?: string;
}) => {
	return useQuery({
		queryKey: ["attendance", studentId, params],
		queryFn: () => getStudentAttendance(studentId, params),
		enabled: !!studentId,
		staleTime: 1000 * 60 * 2, // 2 minutes
	});
};

export const useAttendanceStats = (studentId: string, params?: {
	startDate?: string;
	endDate?: string;
}) => {
	return useQuery({
		queryKey: ["attendanceStats", studentId, params],
		queryFn: () => getAttendanceStats(studentId, params),
		enabled: !!studentId,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
};

export const useTodayAttendance = (studentId: string) => {
	return useQuery({
		queryKey: ["todayAttendance", studentId],
		queryFn: () => getTodayAttendance(studentId),
		enabled: !!studentId,
		staleTime: 1000 * 30, // 30 seconds
		refetchInterval: 1000 * 60, // Refetch every minute
	});
};
