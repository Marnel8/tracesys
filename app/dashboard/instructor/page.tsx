"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import {
  Users,
  FileCheck,
  Clock,
  TrendingUp,
  Plus,
  MessageSquare,
  Settings,
  BarChart3,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"
import {
  SECTIONS,
  WEEKLY_ATTENDANCE_DATA,
  SECTION_PERFORMANCE_DATA,
  getTotalStudentsAcrossSections,
  getAverageAttendanceAcrossSections,
  getAverageCompletionAcrossSections,
  getSectionsCount,
} from "@/data/instructor-courses"

export default function InstructorDashboard() {
  const router = useRouter()

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "add-student":
        router.push("/dashboard/instructor/students/add")
        break
      case "post-announcement":
        router.push("/dashboard/instructor/announcements")
        break
      case "view-analytics":
        router.push("/dashboard/instructor/analytics")
        break
      case "settings":
        router.push("/dashboard/instructor/settings")
        break
      default:
        break
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Prof. Dela Cruz!</h1>
        <p className="text-gray-600">Here's what's happening with your students today.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-secondary-50 border-primary-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-600" />
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{getTotalStudentsAcrossSections()}</div>
            <p className="text-sm text-gray-600">Across {getSectionsCount()} sections</p>
          </CardContent>
        </Card>

        <Card className="bg-secondary-50 border-accent-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-accent-600" />
              Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{getAverageCompletionAcrossSections()}%</div>
            <p className="text-sm text-gray-600">Completion rate</p>
          </CardContent>
        </Card>

        <Card className="bg-secondary-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-600" />
              Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{getAverageAttendanceAcrossSections()}%</div>
            <p className="text-sm text-gray-600">Average rate</p>
          </CardContent>
        </Card>

        <Card className="bg-secondary-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">78%</div>
            <p className="text-sm text-gray-600">Submitted on time</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Attendance Trends</CardTitle>
            <CardDescription>Attendance rates and submission counts over the past 8 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={WEEKLY_ATTENDANCE_DATA}>
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
            <CardTitle>Section Performance</CardTitle>
            <CardDescription>Completion rates by section</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={SECTION_PERFORMANCE_DATA}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="section" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completion" fill="#8884d8" name="Completion Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used actions for managing your students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              className="h-20 flex-col gap-2 bg-primary-500 hover:bg-primary-600"
              onClick={() => handleQuickAction("add-student")}
            >
              <Plus className="w-6 h-6" />
              <span>Add Student</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 border-accent-300 hover:bg-accent-50"
              onClick={() => handleQuickAction("post-announcement")}
            >
              <MessageSquare className="w-6 h-6" />
              <span>Post Announcement</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 border-green-300 hover:bg-green-50"
              onClick={() => handleQuickAction("view-analytics")}
            >
              <BarChart3 className="w-6 h-6" />
              <span>View Analytics</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 border-gray-300 hover:bg-gray-50"
              onClick={() => handleQuickAction("settings")}
            >
              <Settings className="w-6 h-6" />
              <span>Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity & Pending Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              Pending Approvals
            </CardTitle>
            <CardDescription>Items requiring your attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div>
                <h4 className="font-medium text-gray-900">Attendance Logs</h4>
                <p className="text-sm text-gray-600">12 pending approvals from today</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Urgent
                </Badge>
                <Button size="sm" variant="outline" onClick={() => router.push("/dashboard/instructor/attendance")}>
                  Review
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <h4 className="font-medium text-gray-900">Weekly Reports</h4>
                <p className="text-sm text-gray-600">8 new submissions this week</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  New
                </Badge>
                <Button size="sm" variant="outline" onClick={() => router.push("/dashboard/instructor/reports/weekly")}>
                  View
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div>
                <h4 className="font-medium text-gray-900">Requirements</h4>
                <p className="text-sm text-gray-600">5 documents ready for review</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Ready
                </Badge>
                <Button size="sm" variant="outline" onClick={() => router.push("/dashboard/instructor/requirements")}>
                  Check
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Section Performance
            </CardTitle>
            <CardDescription>Overview of your assigned sections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {SECTIONS.map((section) => (
              <div key={section.id} className="border rounded-lg p-4 bg-white">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900">{section.name}</h4>
                  <Badge variant="outline" className="bg-primary-50 text-primary-700">
                    {section.totalStudents} students
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{section.avgAttendance}%</div>
                    <span className="text-gray-600">Attendance</span>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{section.completionRate}%</div>
                    <span className="text-gray-600">Requirements</span>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{Math.round(section.completionRate * 0.9)}%</div>
                    <span className="text-gray-600">Reports</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
