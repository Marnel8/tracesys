export interface CourseDefinition {
	code: string;
	name: string;
	category: "Technology" | "Business" | "Education";
}

export interface PracticumInfo {
	startDate: string;
	endDate: string;
	totalHours: number;
	completedHours: number;
}

export interface Section {
	id: number;
	name: string;
	courseCode: string;
	course: string;
	year: string;
	semester: string;
	totalStudents: number;
	activeStudents: number;
	avgAttendance: number;
	avgGrade: number;
	completionRate: number;
	instructor: string;
	schedule: string;
	room: string;
	practicum: PracticumInfo;
}

export interface WeeklyAttendanceData {
	week: string;
	attendance: number;
	submissions: number;
}

export interface SectionPerformanceData {
	section: string;
	students: number;
	completion: number;
}

// Course definitions
export const COURSES: CourseDefinition[] = [
	{
		code: "BEED",
		name: "Bachelor of Elementary Education",
		category: "Education",
	},
	{
		code: "BSIT",
		name: "Bachelor of Science in Information Technology",
		category: "Technology",
	},
	{
		code: "BSBA-FM",
		name: "Bachelor of Science in Business Administration - Financial Management",
		category: "Business",
	},
	{
		code: "BSBA-OM",
		name: "Bachelor of Science in Business Administration - Operations Management",
		category: "Business",
	},
	{
		code: "BSEMC",
		name: "Bachelor of Science in Entertainment and Multimedia Computing",
		category: "Technology",
	},
];

// Section data with comprehensive information
export const SECTIONS: Section[] = [
	{
		id: 1,
		name: "BSIT 4A",
		courseCode: "BSIT",
		course: "Bachelor of Science in Information Technology",
		year: "4th Year",
		semester: "1st Semester",
		totalStudents: 15,
		activeStudents: 14,
		avgAttendance: 94,
		avgGrade: 4.2,
		completionRate: 87,
		instructor: "Prof. Juan Dela Cruz",
		schedule: "MWF 8:00-11:00 AM",
		room: "IT Lab 1",
		practicum: {
			startDate: "2024-01-08",
			endDate: "2024-05-15",
			totalHours: 400,
			completedHours: 280,
		},
	},
	{
		id: 2,
		name: "BSIT 4B",
		courseCode: "BSIT",
		course: "Bachelor of Science in Information Technology",
		year: "4th Year",
		semester: "1st Semester",
		totalStudents: 18,
		activeStudents: 17,
		avgAttendance: 91,
		avgGrade: 4.0,
		completionRate: 83,
		instructor: "Prof. Juan Dela Cruz",
		schedule: "TTH 1:00-4:00 PM",
		room: "IT Lab 2",
		practicum: {
			startDate: "2024-01-08",
			endDate: "2024-05-15",
			totalHours: 400,
			completedHours: 265,
		},
	},
	{
		id: 3,
		name: "BSIT 4C",
		courseCode: "BSIT",
		course: "Bachelor of Science in Information Technology",
		year: "4th Year",
		semester: "1st Semester",
		totalStudents: 12,
		activeStudents: 11,
		avgAttendance: 89,
		avgGrade: 3.8,
		completionRate: 78,
		instructor: "Prof. Juan Dela Cruz",
		schedule: "MWF 1:00-4:00 PM",
		room: "IT Lab 3",
		practicum: {
			startDate: "2024-01-08",
			endDate: "2024-05-15",
			totalHours: 400,
			completedHours: 245,
		},
	},
	{
		id: 4,
		name: "BSIT 4D",
		courseCode: "BSIT",
		course: "Bachelor of Science in Information Technology",
		year: "4th Year",
		semester: "1st Semester",
		totalStudents: 20,
		activeStudents: 19,
		avgAttendance: 96,
		avgGrade: 4.5,
		completionRate: 92,
		instructor: "Prof. Juan Dela Cruz",
		schedule: "MWF 8:00-11:00 AM",
		room: "IT Lab 4",
		practicum: {
			startDate: "2024-01-08",
			endDate: "2024-05-15",
			totalHours: 400,
			completedHours: 320,
		},
	},
];

// Weekly attendance trends data
export const WEEKLY_ATTENDANCE_DATA: WeeklyAttendanceData[] = [
	{ week: "Week 1", attendance: 95, submissions: 42 },
	{ week: "Week 2", attendance: 92, submissions: 40 },
	{ week: "Week 3", attendance: 88, submissions: 38 },
	{ week: "Week 4", attendance: 94, submissions: 41 },
	{ week: "Week 5", attendance: 91, submissions: 39 },
	{ week: "Week 6", attendance: 96, submissions: 42 },
	{ week: "Week 7", attendance: 89, submissions: 37 },
	{ week: "Week 8", attendance: 93, submissions: 40 },
];

// Section performance data for charts
export const SECTION_PERFORMANCE_DATA: SectionPerformanceData[] = [
	{ section: "BSIT 4A", students: 15, completion: 87 },
	{ section: "BSIT 4B", students: 18, completion: 83 },
	{ section: "BSIT 4C", students: 12, completion: 78 },
	{ section: "BSIT 4D", students: 20, completion: 92 },
];

// Utility functions
export const getCourseByCode = (code: string): CourseDefinition | undefined => {
	return COURSES.find((course) => course.code === code);
};

export const getSectionsByInstructor = (instructorName: string): Section[] => {
	return SECTIONS.filter((section) => section.instructor === instructorName);
};

export const getSectionByName = (name: string): Section | undefined => {
	return SECTIONS.find((section) => section.name === name);
};

export const getTotalStudentsAcrossSections = (): number => {
	return SECTIONS.reduce((total, section) => total + section.totalStudents, 0);
};

export const getAverageAttendanceAcrossSections = (): number => {
	const totalAttendance = SECTIONS.reduce(
		(total, section) => total + section.avgAttendance,
		0
	);
	return Math.round(totalAttendance / SECTIONS.length);
};

export const getAverageCompletionAcrossSections = (): number => {
	const totalCompletion = SECTIONS.reduce(
		(total, section) => total + section.completionRate,
		0
	);
	return Math.round(totalCompletion / SECTIONS.length);
};

export const getSectionsCount = (): number => {
	return SECTIONS.length;
};

export const getCourseOptions = () => {
	return COURSES.map((course) => ({
		value: course.code,
		label: course.name,
	}));
};

export const getSectionOptions = () => {
	return SECTIONS.map((section) => ({
		value: section.name,
		label: section.name,
	}));
};

// Year and semester options
export const YEAR_OPTIONS = [
	{ value: "3rd", label: "3rd Year" },
	{ value: "4th", label: "4th Year" },
];

export const SEMESTER_OPTIONS = [
	{ value: "1st", label: "1st Semester" },
	{ value: "2nd", label: "2nd Semester" },
	{ value: "Summer", label: "Summer" },
];

// Department definitions
export const DEPARTMENTS = [
	{
		code: "CBAM",
		name: "College of Business Administration Management",
	},
	{
		code: "CAST",
		name: "College of Arts, Science and Technology",
	},
	{
		code: "CTE",
		name: "College of Teacher Education",
	},
];

export const getDepartmentOptions = () => {
	return DEPARTMENTS.map((department) => ({
		value: department.code,
		label: department.name,
	}));
};
