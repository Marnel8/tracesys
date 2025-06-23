# Centralized Instructor Course Data

This system provides centralized course and section data that can be reused across all instructor pages.

## Files

- `instructor-courses.ts` - Core data definitions and utility functions
- `../hooks/use-instructor-data.ts` - React hook for easy data access

## Core Data Structures

### `SECTIONS`
Array of section objects with complete information:
- Basic info (name, course, year, semester)
- Statistics (attendance, grades, completion rates)
- Practicum information
- Schedule and room assignments

### `COURSES` 
Array of course definitions with codes and full names.

### `WEEKLY_ATTENDANCE_DATA`
Historical attendance and submission data for charts.

### `SECTION_PERFORMANCE_DATA`
Section performance data formatted for chart components.

## Usage Examples

### Simple Import (Basic Usage)
```typescript
import { SECTIONS, COURSES, getCourseOptions } from "@/data/instructor-courses"

// Use sections data directly
const totalStudents = SECTIONS.reduce((sum, section) => sum + section.totalStudents, 0)

// Use in form dropdowns
const courseOptions = getCourseOptions()
```

### React Hook (Recommended)
```typescript
import { useInstructorData } from "@/hooks/use-instructor-data"

function InstructorDashboard() {
  const { 
    stats, 
    sections, 
    performanceTrends,
    courseOptions,
    highPerformingSections 
  } = useInstructorData()

  return (
    <div>
      <h1>Total Students: {stats.totalStudents}</h1>
      <h2>Average Attendance: {stats.averageAttendance}%</h2>
      {/* Use other data... */}
    </div>
  )
}
```

### Charts and Analytics
```typescript
import { WEEKLY_ATTENDANCE_DATA, SECTION_PERFORMANCE_DATA } from "@/data/instructor-courses"

// Use directly in chart components
<LineChart data={WEEKLY_ATTENDANCE_DATA}>
  {/* Chart configuration */}
</LineChart>

<BarChart data={SECTION_PERFORMANCE_DATA}>
  {/* Chart configuration */}
</BarChart>
```

## Available Utility Functions

- `getCourseByCode(code)` - Get course by code
- `getSectionByName(name)` - Get section by name  
- `getSectionsByInstructor(name)` - Get sections for specific instructor
- `getTotalStudentsAcrossSections()` - Get total student count
- `getAverageAttendanceAcrossSections()` - Get average attendance
- `getAverageCompletionAcrossSections()` - Get average completion rate
- `getCourseOptions()` - Get formatted options for dropdowns
- `getSectionOptions()` - Get formatted section options

## Form Options

Pre-defined options for form components:
- `YEAR_OPTIONS` - Year level options
- `SEMESTER_OPTIONS` - Semester options  
- `getCourseOptions()` - Course dropdown options
- `getSectionOptions()` - Section dropdown options

## Adding New Data

To add new sections or courses:

1. Add to the appropriate array in `instructor-courses.ts`
2. Follow the existing TypeScript interfaces
3. The changes will automatically be available across all pages

## Migration Guide

To convert existing pages to use centralized data:

1. Remove hardcoded data arrays
2. Import needed data/functions from `@/data/instructor-courses`
3. Or use the `useInstructorData` hook for comprehensive access
4. Update component props to use the centralized data

## Benefits

- **Consistency**: Same data across all pages
- **Maintainability**: Update data in one place
- **Type Safety**: Full TypeScript support
- **Performance**: Optimized data structures
- **Extensibility**: Easy to add new features 