import {
  SECTIONS,
  COURSES,
  WEEKLY_ATTENDANCE_DATA,
  SECTION_PERFORMANCE_DATA,
  getTotalStudentsAcrossSections,
  getAverageAttendanceAcrossSections,
  getAverageCompletionAcrossSections,
  getSectionsCount,
  getCourseOptions,
  getSectionOptions,
  YEAR_OPTIONS,
  SEMESTER_OPTIONS,
  getSectionsByInstructor,
  getSectionByName,
  getCourseByCode,
  type Section,
  type CourseDefinition,
} from "@/data/instructor-courses"

export interface InstructorStats {
  totalStudents: number
  averageAttendance: number
  averageCompletion: number
  sectionsCount: number
  totalActiveStudents: number
  overallGrade: number
}

export function useInstructorData(instructorName?: string) {
  // Get sections for specific instructor or all sections
  const sections = instructorName ? getSectionsByInstructor(instructorName) : SECTIONS
  
  // Compute stats
  const stats: InstructorStats = {
    totalStudents: sections.reduce((sum, section) => sum + section.totalStudents, 0),
    averageAttendance: Math.round(
      sections.reduce((sum, section) => sum + section.avgAttendance, 0) / sections.length
    ),
    averageCompletion: Math.round(
      sections.reduce((sum, section) => sum + section.completionRate, 0) / sections.length
    ),
    sectionsCount: sections.length,
    totalActiveStudents: sections.reduce((sum, section) => sum + section.activeStudents, 0),
    overallGrade: Math.round(
      (sections.reduce((sum, section) => sum + section.avgGrade, 0) / sections.length) * 10
    ) / 10,
  }

  // Performance trends
  const performanceTrends = sections.map(section => ({
    section: section.name,
    students: section.totalStudents,
    completion: section.completionRate,
    attendance: section.avgAttendance,
    grade: section.avgGrade,
  }))

  // Get sections by performance level
  const highPerformingSections = sections.filter(section => section.completionRate >= 90)
  const lowPerformingSections = sections.filter(section => section.completionRate < 80)
  
  // Get sections by attendance level
  const highAttendanceSections = sections.filter(section => section.avgAttendance >= 95)
  const lowAttendanceSections = sections.filter(section => section.avgAttendance < 85)

  return {
    // Core data
    sections,
    courses: COURSES,
    weeklyAttendanceData: WEEKLY_ATTENDANCE_DATA,
    sectionPerformanceData: SECTION_PERFORMANCE_DATA,
    
    // Computed stats
    stats,
    performanceTrends,
    
    // Categorized sections
    highPerformingSections,
    lowPerformingSections,
    highAttendanceSections,
    lowAttendanceSections,
    
    // Options for forms
    courseOptions: getCourseOptions(),
    sectionOptions: getSectionOptions(),
    yearOptions: YEAR_OPTIONS,
    semesterOptions: SEMESTER_OPTIONS,
    
    // Utility functions
    getSectionByName,
    getCourseByCode,
    getSectionsByInstructor,
  }
}

// Export types for use in components
export type { Section, CourseDefinition } 