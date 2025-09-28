import { useMemo } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { useStudentsByTeacher } from '@/hooks/student/useStudent';
import { 
  DETAILED_ATTENDANCE_LOGS
} from '@/data/attendance';
import { 
  REQUIREMENT_SUBMISSIONS
} from '@/data/requirements';
import { 
  WEEKLY_REPORTS
} from '@/data/reports';

export interface SidebarBadges {
  totalStudents: number;
  pendingAttendance: number;
  pendingRequirements: number;
  pendingWeeklyReports: number;
}

export function useSidebarBadges(): SidebarBadges {
  const { user } = useAuth();
  
  // Get students data from the server
  const { data: studentsData } = useStudentsByTeacher(user?.id || '', {
    page: 1,
    limit: 1000, // Get all students for count
  });

  return useMemo(() => {
    // Calculate total students count from server data
    const totalStudents = studentsData?.data?.length || 0;

    // Calculate pending attendance logs (status: "Pending")
    const pendingAttendance = DETAILED_ATTENDANCE_LOGS.filter(
      log => log.status === "Pending"
    ).length;

    // Calculate pending requirement submissions (status: "Pending")
    const pendingRequirements = REQUIREMENT_SUBMISSIONS.filter(
      submission => submission.status === "Pending"
    ).length;

    // Calculate pending weekly reports (status: "Pending")
    const pendingWeeklyReports = WEEKLY_REPORTS.filter(
      report => report.status === "Pending"
    ).length;

    return {
      totalStudents,
      pendingAttendance,
      pendingRequirements,
      pendingWeeklyReports,
    };
  }, [studentsData]);
}
