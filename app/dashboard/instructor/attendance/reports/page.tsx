"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SECTIONS } from "@/data/instructor-courses";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Download,
  Calendar,
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { InstructorStatsCard } from "@/components/instructor-stats-card";

// Mock data for attendance reports
const weeklyAttendanceData = [
  { week: "Week 1", present: 40, absent: 2, late: 0, percentage: 95.2 },
  { week: "Week 2", present: 38, absent: 3, late: 1, percentage: 90.5 },
  { week: "Week 3", present: 39, absent: 2, late: 1, percentage: 92.9 },
  { week: "Week 4", present: 41, absent: 1, late: 0, percentage: 97.6 },
  { week: "Week 5", present: 37, absent: 4, late: 1, percentage: 88.1 },
  { week: "Week 6", present: 40, absent: 2, late: 0, percentage: 95.2 },
  { week: "Week 7", present: 38, absent: 3, late: 1, percentage: 90.5 },
  { week: "Week 8", present: 39, absent: 2, late: 1, percentage: 92.9 },
];

const sectionAttendanceData = [
  {
    section: SECTIONS[0].name,
    attendance: SECTIONS[0].avgAttendance,
    students: SECTIONS[0].totalStudents,
    totalHours: SECTIONS[0].practicum.completedHours * 3,
  },
  {
    section: SECTIONS[1].name,
    attendance: SECTIONS[1].avgAttendance,
    students: SECTIONS[1].totalStudents,
    totalHours: SECTIONS[1].practicum.completedHours * 3,
  },
  {
    section: SECTIONS[2].name,
    attendance: SECTIONS[2].avgAttendance,
    students: SECTIONS[2].totalStudents,
    totalHours: SECTIONS[2].practicum.completedHours * 3,
  },
];

const attendanceStatusData = [
  { name: "Present", value: 85, color: "#10B981" },
  { name: "Absent", value: 10, color: "#EF4444" },
  { name: "Late", value: 5, color: "#F59E0B" },
];

const monthlyTrendsData = [
  { month: "Jan", attendance: 92, submissions: 156 },
  { month: "Feb", attendance: 89, submissions: 142 },
  { month: "Mar", attendance: 94, submissions: 168 },
  { month: "Apr", attendance: 91, submissions: 159 },
  { month: "May", attendance: 93, submissions: 164 },
];

export default function AttendanceReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("current-semester");
  const [selectedSection, setSelectedSection] = useState("all");

  const exportReport = () => {
    console.log("Exporting attendance report...");
  };

  const summaryStats = [
    {
      label: "Overall Attendance",
      value: "92.3%",
      icon: Users,
      helperText: "vs last month",
      trend: { label: "+2.1% change", variant: "positive" } as const,
    },
    {
      label: "Total Hours Logged",
      value: "3,447",
      icon: Clock,
      helperText: "This semester",
      trend: { label: "+156 this week", variant: "positive" } as const,
    },
    {
      label: "Late Arrivals",
      value: "5.2%",
      icon: Calendar,
      helperText: "Needs follow-up",
      trend: { label: "-1.3% improvement", variant: "positive" } as const,
    },
    {
      label: "Absence Rate",
      value: "7.7%",
      icon: Users,
      helperText: "Monitor closely",
      trend: { label: "-2.1% improvement", variant: "positive" } as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Attendance Reports
          </h1>
          <p className="text-gray-600">
            Comprehensive attendance analytics and insights
          </p>
        </div>
        <div className="flex gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-semester">Current Semester</SelectItem>
              <SelectItem value="previous-semester">
                Previous Semester
              </SelectItem>
              <SelectItem value="current-year">Current Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {summaryStats.map((stat) => (
          <InstructorStatsCard
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            helperText={stat.helperText}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Attendance Trends</CardTitle>
            <CardDescription>
              Attendance patterns over the past 8 weeks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyAttendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Attendance %"
                />
                <Line
                  type="monotone"
                  dataKey="present"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Present"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Distribution</CardTitle>
            <CardDescription>
              Overall attendance status breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={attendanceStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {attendanceStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Section Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Section Performance Analysis</CardTitle>
          <CardDescription>
            Detailed attendance metrics by section
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {sectionAttendanceData.map((section) => (
              <div key={section.section} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">{section.section}</h3>
                  <div className="flex gap-4">
                    <Badge variant="outline">{section.students} students</Badge>
                    <Badge variant="outline">
                      {section.totalHours} total hours
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">
                        Attendance Rate
                      </span>
                      <span className="text-sm font-medium">
                        {section.attendance}%
                      </span>
                    </div>
                    <Progress value={section.attendance} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">
                        Avg. Hours/Student
                      </span>
                      <span className="text-sm font-medium">
                        {Math.round(section.totalHours / section.students)}h
                      </span>
                    </div>
                    <Progress
                      value={
                        (section.totalHours / section.students / 400) * 100
                      }
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Progress</span>
                      <span className="text-sm font-medium">
                        {Math.round(
                          (section.totalHours / (section.students * 400)) * 100
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        (section.totalHours / (section.students * 400)) * 100
                      }
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Attendance Trends</CardTitle>
          <CardDescription>
            Attendance and submission patterns over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyTrendsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="attendance" fill="#10B981" name="Attendance %" />
              <Bar dataKey="submissions" fill="#3B82F6" name="Submissions" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Insights and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800">Positive Trends</h4>
                <ul className="text-sm text-green-700 mt-2 space-y-1">
                  <li>• Overall attendance improved by 2.1% this month</li>
                  <li>• Late arrivals decreased by 1.3%</li>
                  <li>• BSIT 4A section shows consistent 94%+ attendance</li>
                </ul>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800">
                  Performance Highlights
                </h4>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• 3,447 total hours logged this semester</li>
                  <li>• 92.3% overall attendance rate</li>
                  <li>• 85% of students maintain perfect attendance</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-yellow-600" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-800">
                  Attention Needed
                </h4>
                <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                  <li>• BSIS 4A section has lower attendance (89%)</li>
                  <li>• Week 5 showed a dip in overall attendance</li>
                  <li>• 3 student/s have concerning absence patterns</li>
                </ul>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <h4 className="font-medium text-red-800">Action Items</h4>
                <ul className="text-sm text-red-700 mt-2 space-y-1">
                  <li>• Follow up with students having &gt;15% absence rate</li>
                  <li>• Review BSIS 4A section scheduling conflicts</li>
                  <li>• Implement attendance improvement strategies</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
