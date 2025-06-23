"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
  AreaChart,
  Area,
} from "recharts"
import { TrendingUp, TrendingDown, Users, Clock, CheckCircle, Award } from "lucide-react"

// Mock data for analytics
const attendanceData = [
  { week: "Week 1", attendance: 95, submissions: 42 },
  { week: "Week 2", attendance: 92, submissions: 40 },
  { week: "Week 3", attendance: 88, submissions: 38 },
  { week: "Week 4", attendance: 94, submissions: 41 },
  { week: "Week 5", attendance: 91, submissions: 39 },
  { week: "Week 6", attendance: 96, submissions: 42 },
  { week: "Week 7", attendance: 89, submissions: 37 },
  { week: "Week 8", attendance: 93, submissions: 40 },
]

import { SECTIONS } from "@/data/instructor-courses"

const sectionPerformance = SECTIONS.map(section => ({
  section: section.name,
  students: section.totalStudents,
  avgAttendance: section.avgAttendance,
  avgGrade: section.avgGrade,
  completionRate: section.completionRate,
}))

const genderDistribution = [
  { name: "Male", value: 24, color: "#3B82F6" },
  { name: "Female", value: 18, color: "#EEC5EB" },
]

const requirementStatus = [
  { name: "Completed", value: 85, color: "#10B981" },
  { name: "Pending", value: 12, color: "#F59E0B" },
  { name: "Missing", value: 3, color: "#EF4444" },
]

const weeklyProgress = [
  { week: "Week 1", hours: 320, reports: 42, requirements: 38 },
  { week: "Week 2", hours: 315, reports: 40, requirements: 35 },
  { week: "Week 3", hours: 298, reports: 38, requirements: 32 },
  { week: "Week 4", hours: 335, reports: 41, requirements: 39 },
  { week: "Week 5", hours: 312, reports: 39, requirements: 36 },
  { week: "Week 6", hours: 340, reports: 42, requirements: 40 },
  { week: "Week 7", hours: 295, reports: 37, requirements: 33 },
  { week: "Week 8", hours: 325, reports: 40, requirements: 38 },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights into student performance and progress</p>
        </div>
        <div className="flex gap-4">
          <Select defaultValue="current">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Semester</SelectItem>
              <SelectItem value="previous">Previous Semester</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-secondary-50 border-primary-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-gray-900">42</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">+5% from last month</span>
                </div>
              </div>
              <Users className="w-8 h-8 text-primary-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Attendance</p>
                <p className="text-3xl font-bold text-gray-900">92%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">+2% from last week</span>
                </div>
              </div>
              <Clock className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-3xl font-bold text-gray-900">83%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-600">-1% from last week</span>
                </div>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
                <p className="text-3xl font-bold text-gray-900">4.1</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">+0.2 from last month</span>
                </div>
              </div>
              <Award className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Attendance & Submission Trends</CardTitle>
            <CardDescription>Weekly attendance rates and submission counts</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="attendance" stroke="#10B981" strokeWidth={2} name="Attendance %" />
                <Line type="monotone" dataKey="submissions" stroke="#3B82F6" strokeWidth={2} name="Submissions" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Progress Overview</CardTitle>
            <CardDescription>Hours logged, reports, and requirements by week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={weeklyProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="hours" stackId="1" stroke="#8884d8" fill="#8884d8" name="Hours" />
                <Area type="monotone" dataKey="reports" stackId="2" stroke="#82ca9d" fill="#82ca9d" name="Reports" />
                <Area
                  type="monotone"
                  dataKey="requirements"
                  stackId="3"
                  stroke="#ffc658"
                  fill="#ffc658"
                  name="Requirements"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Gender Distribution</CardTitle>
            <CardDescription>Student gender breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={genderDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {genderDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Requirement Status</CardTitle>
            <CardDescription>Overall requirement completion status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={requirementStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {requirementStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Section Performance</CardTitle>
            <CardDescription>Performance metrics by section</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={sectionPerformance} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="section" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="avgAttendance" fill="#10B981" name="Avg Attendance" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Section Performance Details */}
      <Card>
        <CardHeader>
          <CardTitle>Section Performance Details</CardTitle>
          <CardDescription>Detailed breakdown of each section's performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {sectionPerformance.map((section) => (
              <div key={section.section} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">{section.section}</h3>
                  <Badge variant="outline">{section.students} students</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Attendance Rate</span>
                      <span className="text-sm font-medium">{section.avgAttendance}%</span>
                    </div>
                    <Progress value={section.avgAttendance} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Average Grade</span>
                      <span className="text-sm font-medium">{section.avgGrade}/5.0</span>
                    </div>
                    <Progress value={(section.avgGrade / 5) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Completion Rate</span>
                      <span className="text-sm font-medium">{section.completionRate}%</span>
                    </div>
                    <Progress value={section.completionRate} className="h-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Top Performers
            </CardTitle>
            <CardDescription>Students with highest overall performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Maria Santos", section: SECTIONS[1].name, score: 4.8, attendance: 98 },
                { name: "Juan Dela Cruz", section: SECTIONS[0].name, score: 4.6, attendance: 96 },
                { name: "Ana Garcia", section: SECTIONS[0].name, score: 4.4, attendance: 94 },
              ].map((student, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{student.name}</div>
                    <div className="text-sm text-gray-600">{student.section}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{student.score}/5.0</div>
                    <div className="text-sm text-gray-600">{student.attendance}% attendance</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              Needs Attention
            </CardTitle>
            <CardDescription>Students requiring additional support</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Pedro Rodriguez", section: SECTIONS[2].name, score: 3.2, attendance: 72, issue: "Low attendance" },
                { name: "Carlos Mendoza", section: SECTIONS[1].name, score: 3.4, attendance: 85, issue: "Missing reports" },
                { name: "Lisa Reyes", section: SECTIONS[0].name, score: 3.6, attendance: 78, issue: "Late submissions" },
              ].map((student, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <div className="font-medium">{student.name}</div>
                    <div className="text-sm text-gray-600">{student.section}</div>
                    <div className="text-xs text-red-600">{student.issue}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{student.score}/5.0</div>
                    <div className="text-sm text-gray-600">{student.attendance}% attendance</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
