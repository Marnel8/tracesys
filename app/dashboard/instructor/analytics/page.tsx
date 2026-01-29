"use client"

import { useState, useMemo } from "react"
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
import { TrendingUp, TrendingDown, Users, Clock, CheckCircle, Award, Calendar } from "lucide-react"
import { InstructorStatsCard } from "@/components/instructor-stats-card"
import { useAnalytics } from "@/hooks/analytics"
import { format, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns"

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<"current" | "previous" | "all">("current")
  const [selectedSection, setSelectedSection] = useState<string>("all")

  // Calculate date range based on selection
  const dateRangeParams = useMemo(() => {
    const now = new Date()
    switch (dateRange) {
      case "current":
        return {
          startDate: format(startOfMonth(now), "yyyy-MM-dd"),
          endDate: format(endOfMonth(now), "yyyy-MM-dd"),
        }
      case "previous":
        const prevMonth = subMonths(now, 1)
        return {
          startDate: format(startOfMonth(prevMonth), "yyyy-MM-dd"),
          endDate: format(endOfMonth(prevMonth), "yyyy-MM-dd"),
        }
      case "all":
        return {
          startDate: format(startOfYear(now), "yyyy-MM-dd"),
          endDate: format(endOfYear(now), "yyyy-MM-dd"),
        }
      default:
        return undefined
    }
  }, [dateRange])

  const { data: analytics, isLoading } = useAnalytics(
    dateRangeParams,
    selectedSection === "all" ? undefined : selectedSection
  )

  // Prepare chart data
  const attendanceData = analytics?.attendanceTrends || []
  const weeklyProgress = analytics?.weeklyProgress || []
  const sectionPerformance = analytics?.sectionPerformance || []
  const genderDistribution = analytics?.genderDistribution || []
  const requirementStatus = analytics?.requirementBreakdown
    ? [
        { name: "Approved", value: analytics.requirementBreakdown.approved, color: "#10B981" },
        { name: "Pending", value: analytics.requirementBreakdown.pending, color: "#F59E0B" },
        { name: "Submitted", value: analytics.requirementBreakdown.submitted, color: "#3B82F6" },
        { name: "Rejected", value: analytics.requirementBreakdown.rejected, color: "#EF4444" },
      ].filter((item) => item.value > 0)
    : []

  const submissionPunctualityData = analytics?.submissionPatterns || []
  const topActivities = analytics?.topActivities || []
  const activityTrends = analytics?.activityTrends || []
  const dayOfWeekPatterns = analytics?.dayOfWeekPatterns || []

  // Key metrics with trends
  const analyticsHighlights = analytics
    ? [
        {
          label: "Total Students",
          value: String(analytics.totalStudents),
          icon: Users,
          helperText: "Current enrollment",
          trend: {
            label: `${analytics.totalStudents} students`,
            variant: "positive" as const,
          },
        },
        {
          label: "Avg. Attendance",
          value: `${analytics.averageAttendance}%`,
          icon: Clock,
          helperText: "Semester to date",
          trend: {
            label: `${analytics.attendanceTrend.direction === "up" ? "+" : analytics.attendanceTrend.direction === "down" ? "-" : ""}${analytics.attendanceTrend.percentage.toFixed(1)}% vs last period`,
            variant: analytics.attendanceTrend.direction === "up" ? ("positive" as const) : analytics.attendanceTrend.direction === "down" ? ("negative" as const) : ("neutral" as const),
          },
        },
        {
          label: "Completion Rate",
          value: `${analytics.averageCompletion}%`,
          icon: CheckCircle,
          helperText: "Requirements completed",
          trend: {
            label: `${analytics.completionTrend.direction === "up" ? "+" : analytics.completionTrend.direction === "down" ? "-" : ""}${analytics.completionTrend.percentage.toFixed(1)}% vs last period`,
            variant: analytics.completionTrend.direction === "up" ? ("positive" as const) : analytics.completionTrend.direction === "down" ? ("negative" as const) : ("neutral" as const),
          },
        },
        {
          label: "On-Time Submissions",
          value: `${analytics.onTimeSubmissionRate}%`,
          icon: Award,
          helperText: "Reports submitted on time",
          trend: {
            label: `${analytics.reportPunctuality.onTime}/${analytics.reportPunctuality.total} reports`,
            variant: "positive" as const,
          },
        },
      ]
    : []

  const COLORS = ["#3B82F6", "#EC4899", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Comprehensive insights into student performance and progress</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Comprehensive insights into student performance and progress</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">No data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights into student performance and progress</p>
        </div>
        <div className="flex gap-4">
          <Select value={dateRange} onValueChange={(value: "current" | "previous" | "all") => setDateRange(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Month</SelectItem>
              <SelectItem value="previous">Previous Month</SelectItem>
              <SelectItem value="all">This Year</SelectItem>
            </SelectContent>
          </Select>
          {sectionPerformance.length > 0 && (
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {sectionPerformance.map((section) => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {analyticsHighlights.map((metric) => (
          <InstructorStatsCard
            key={metric.label}
            icon={metric.icon}
            label={metric.label}
            value={metric.value}
            helperText={metric.helperText}
            trend={metric.trend}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Attendance & Submission Trends</CardTitle>
            <CardDescription>Weekly attendance rates and submission counts</CardDescription>
          </CardHeader>
          <CardContent>
            {attendanceData.length > 0 ? (
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
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No data available for the selected period
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Progress Overview</CardTitle>
            <CardDescription>Hours logged, reports, and requirements by week</CardDescription>
          </CardHeader>
          <CardContent>
            {weeklyProgress.length > 0 ? (
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
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No data available for the selected period
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Punctuality Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Submission Punctuality</CardTitle>
            <CardDescription>On-time vs late submission rates for reports</CardDescription>
          </CardHeader>
          <CardContent>
            {submissionPunctualityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={submissionPunctualityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="onTime" stackId="a" fill="#10B981" name="On Time" />
                  <Bar dataKey="late" stackId="a" fill="#EF4444" name="Late" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No submission data available
              </div>
            )}
            {analytics.reportPunctuality.total > 0 && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">On-Time Rate:</span>
                  <span className="font-semibold">
                    {Math.round((analytics.reportPunctuality.onTime / analytics.reportPunctuality.total) * 100)}%
                  </span>
                </div>
                {analytics.reportPunctuality.late > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Average Delay:</span>
                    <span className="font-semibold">
                      {analytics.reportPunctuality.averageDelayDays.toFixed(1)} days
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Day of Week Attendance Patterns</CardTitle>
            <CardDescription>Attendance rates by day of the week</CardDescription>
          </CardHeader>
          <CardContent>
            {dayOfWeekPatterns.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dayOfWeekPatterns}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="attendance" fill="#3B82F6" name="Attendance %" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No attendance data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Frequency */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Frequency Analysis</CardTitle>
          <CardDescription>Most common activities mentioned in weekly reports</CardDescription>
        </CardHeader>
        <CardContent>
          {topActivities.length > 0 ? (
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topActivities.slice(0, 10)} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8B5CF6" name="Frequency" />
                </BarChart>
              </ResponsiveContainer>
              {activityTrends.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold mb-2">Activity Trends Over Time</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={activityTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="activityCount" stroke="#8B5CF6" strokeWidth={2} name="Activities" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No activity data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Gender Distribution</CardTitle>
            <CardDescription>Student gender breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {genderDistribution.length > 0 ? (
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
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Requirement Status</CardTitle>
            <CardDescription>Overall requirement completion status</CardDescription>
          </CardHeader>
          <CardContent>
            {requirementStatus.length > 0 ? (
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
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Section Performance</CardTitle>
            <CardDescription>Performance metrics by section</CardDescription>
          </CardHeader>
          <CardContent>
            {sectionPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={sectionPerformance} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="avgAttendance" fill="#10B981" name="Avg Attendance %" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No section data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Section Performance Details */}
      {sectionPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Section Performance Details</CardTitle>
            <CardDescription>Detailed breakdown of each section's performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {sectionPerformance.map((section) => (
                <div key={section.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{section.name}</h3>
                    <Badge variant="outline">{section.totalStudents} students</Badge>
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
                        <span className="text-sm text-gray-600">Completion Rate</span>
                        <span className="text-sm font-medium">{section.completionRate}%</span>
                      </div>
                      <Progress value={section.completionRate} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Performance Score</span>
                        <span className="text-sm font-medium">{section.performanceScore.toFixed(1)}/100</span>
                      </div>
                      <Progress value={section.performanceScore} className="h-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
            {analytics.topPerformers.length > 0 ? (
              <div className="space-y-4">
                {analytics.topPerformers.map((student) => (
                  <div key={student.studentId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{student.studentName}</div>
                      <div className="text-sm text-gray-600">{student.sectionName}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{student.performanceScore.toFixed(1)}/100</div>
                      <div className="text-sm text-gray-600">
                        {student.attendanceRate}% attendance, {student.completionRate}% completion
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                No performance data available
              </div>
            )}
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
            {analytics.needsAttention.length > 0 ? (
              <div className="space-y-4">
                {analytics.needsAttention.map((student) => (
                  <div key={student.studentId} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <div className="font-medium">{student.studentName}</div>
                      <div className="text-sm text-gray-600">{student.sectionName}</div>
                      <div className="text-xs text-red-600 mt-1">
                        {student.issues.join(", ")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{student.performanceScore.toFixed(1)}/100</div>
                      <div className="text-sm text-gray-600">{student.attendanceRate}% attendance</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                All students are performing well!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
