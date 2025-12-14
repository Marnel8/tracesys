import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

// Helper function to format time strings in error messages (e.g., "17:00:00" -> "05:00 PM")
const formatTimeInMessage = (message: string): string => {
  if (!message) return message;

  // Match time patterns like "17:00:00", "17:00", "(17:00:00)", etc.
  // Pattern matches: optional opening paren, hours, colon, minutes, optional seconds, optional closing paren
  const timePattern = /(\(?)(\d{1,2}):(\d{2})(?::(\d{2}))?(\)?)/g;

  return message.replace(timePattern, (match, openParen, hours, minutes) => {
    try {
      const hourNum = parseInt(hours, 10);
      const minNum = parseInt(minutes, 10);

      if (
        isNaN(hourNum) ||
        isNaN(minNum) ||
        hourNum < 0 ||
        hourNum > 23 ||
        minNum < 0 ||
        minNum > 59
      ) {
        return match; // Return original if invalid
      }

      const date = new Date();
      date.setHours(hourNum, minNum, 0, 0);

      const formattedTime = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      // Preserve parentheses if they were in the original
      const hasOpenParen = openParen === "(";
      const hasCloseParen = match.endsWith(")");
      return (
        (hasOpenParen ? "(" : "") + formattedTime + (hasCloseParen ? ")" : "")
      );
    } catch {
      return match; // Return original if formatting fails
    }
  });
};

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
  morningTimeIn?: string | null;
  morningTimeOut?: string | null;
  afternoonTimeIn?: string | null;
  afternoonTimeOut?: string | null;
  overtimeTimeIn?: string | null;
  overtimeTimeOut?: string | null;
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
  operatingDays?: string | null;
  lunchStartTime?: string | null;
  lunchEndTime?: string | null;
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
  // detailed logs for session-specific photos
  detailedLogs?: Array<{
    id: string;
    sessionType?: "morning" | "afternoon" | "overtime" | null;
    photoIn?: string | null;
    photoOut?: string | null;
  }>;
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

export const useAttendance = (
  filters: {
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
  } = {}
) => {
  return useQuery({
    queryKey: attendanceKeys.list(filters),
    queryFn: async (): Promise<AttendanceListResponse> => {
      const params = new URLSearchParams();
      if (filters.page) params.append("page", String(filters.page));
      if (filters.limit) params.append("limit", String(filters.limit));
      if (filters.search) params.append("search", filters.search);
      if (filters.status && filters.status !== "all")
        params.append("status", filters.status);
      if (filters.approvalStatus && filters.approvalStatus !== "all")
        params.append("approvalStatus", filters.approvalStatus);
      if (filters.studentId) params.append("studentId", filters.studentId);
      if (filters.practicumId)
        params.append("practicumId", filters.practicumId);
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
      sessionType?: "morning" | "afternoon" | "overtime";
    }) => {
      const hasFile = !!data.photo;
      if (hasFile) {
        const form = new FormData();
        Object.entries({ ...data, photo: undefined }).forEach(([k, v]) => {
          if (v !== undefined && v !== null) {
            if ((v as any) instanceof File) {
              form.append(k, v as unknown as File);
            } else {
              form.append(k, String(v));
            }
          }
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
      const message = err.response?.data?.message || "Failed to clock in";
      // Format time strings in error messages (e.g., "17:00:00" -> "05:00 PM")
      const formattedMessage = formatTimeInMessage(message);
      toast.error(formattedMessage);
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
      sessionType?: "morning" | "afternoon" | "overtime";
    }) => {
      const hasFile = !!data.photo;
      if (hasFile) {
        const form = new FormData();
        Object.entries({ ...data, photo: undefined }).forEach(([k, v]) => {
          if (v !== undefined && v !== null) {
            if ((v as any) instanceof File) {
              form.append(k, v as unknown as File);
            } else {
              form.append(k, String(v));
            }
          }
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
      const message = err.response?.data?.message || "Failed to clock out";
      // Format time strings in error messages (e.g., "17:00:00" -> "05:00 PM")
      const formattedMessage = formatTimeInMessage(message);
      toast.error(formattedMessage);
    },
  });
};
