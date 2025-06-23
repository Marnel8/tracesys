"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  User,
  Shield,
  Download,
  Filter,
  Search,
  Calendar,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react"

// Mock audit data
const auditLogs = [
  {
    id: "1",
    timestamp: "2024-01-15T10:30:00Z",
    user: "Prof. Juan Dela Cruz",
    userId: "instructor_001",
    action: "Student Grade Updated",
    resource: "Student Record",
    resourceId: "student_123",
    details: "Updated final grade for Maria Santos from B+ to A-",
    ipAddress: "192.168.1.100",
    userAgent: "Chrome 120.0.0.0",
    severity: "medium",
    category: "academic",
    status: "success",
  },
  {
    id: "2",
    timestamp: "2024-01-15T09:45:00Z",
    user: "Maria Santos",
    userId: "student_123",
    action: "Report Submitted",
    resource: "Weekly Report",
    resourceId: "report_456",
    details: "Submitted Week 3 practicum report",
    ipAddress: "192.168.1.105",
    userAgent: "Firefox 121.0.0.0",
    severity: "low",
    category: "submission",
    status: "success",
  },
  {
    id: "3",
    timestamp: "2024-01-15T09:15:00Z",
    user: "System",
    userId: "system",
    action: "Failed Login Attempt",
    resource: "Authentication",
    resourceId: "auth_789",
    details: "Multiple failed login attempts for user: john.doe@student.edu",
    ipAddress: "203.0.113.45",
    userAgent: "Chrome 119.0.0.0",
    severity: "high",
    category: "security",
    status: "failed",
  },
  {
    id: "4",
    timestamp: "2024-01-15T08:30:00Z",
    user: "Prof. Juan Dela Cruz",
    userId: "instructor_001",
    action: "Attendance Marked",
    resource: "Attendance Record",
    resourceId: "attendance_101",
    details: "Marked attendance for 15 students in Section A",
    ipAddress: "192.168.1.100",
    userAgent: "Chrome 120.0.0.0",
    severity: "low",
    category: "attendance",
    status: "success",
  },
  {
    id: "5",
    timestamp: "2024-01-15T08:00:00Z",
    user: "Admin User",
    userId: "admin_001",
    action: "User Account Created",
    resource: "User Management",
    resourceId: "user_new_001",
    details: "Created new student account for Pedro Reyes",
    ipAddress: "192.168.1.50",
    userAgent: "Chrome 120.0.0.0",
    severity: "medium",
    category: "user_management",
    status: "success",
  },
]

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "high":
      return "bg-red-100 text-red-800 border-red-200"
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "low":
      return "bg-green-100 text-green-800 border-green-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case "security":
      return "bg-red-50 text-red-700 border-red-200"
    case "academic":
      return "bg-blue-50 text-blue-700 border-blue-200"
    case "submission":
      return "bg-green-50 text-green-700 border-green-200"
    case "attendance":
      return "bg-purple-50 text-purple-700 border-purple-200"
    case "user_management":
      return "bg-orange-50 text-orange-700 border-orange-200"
    default:
      return "bg-gray-50 text-gray-700 border-gray-200"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "success":
      return <CheckCircle className="w-4 h-4 text-green-600" />
    case "failed":
      return <XCircle className="w-4 h-4 text-red-600" />
    case "warning":
      return <AlertTriangle className="w-4 h-4 text-yellow-600" />
    default:
      return <Activity className="w-4 h-4 text-gray-600" />
  }
}

export default function AuditTrailPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedSeverity, setSelectedSeverity] = useState("all")
  const [selectedUser, setSelectedUser] = useState("all")

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "all" || log.category === selectedCategory
    const matchesSeverity = selectedSeverity === "all" || log.severity === selectedSeverity
    const matchesUser = selectedUser === "all" || log.userId === selectedUser

    return matchesSearch && matchesCategory && matchesSeverity && matchesUser
  })

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Trail</h1>
          <p className="text-gray-600 mt-1">Track all system activities and changes for security and compliance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Events</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">-5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Actions</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">-2 from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">+8 new this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="submission">Submissions</SelectItem>
                  <SelectItem value="attendance">Attendance</SelectItem>
                  <SelectItem value="user_management">User Management</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Severity</Label>
              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger>
                  <SelectValue placeholder="All Severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>User</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="instructor_001">Prof. Juan Dela Cruz</SelectItem>
                  <SelectItem value="student_123">Maria Santos</SelectItem>
                  <SelectItem value="admin_001">Admin User</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Last 7 days
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Audit Logs
          </CardTitle>
          <CardDescription>
            Showing {filteredLogs.length} of {auditLogs.length} activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="table" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="timeline">Timeline View</TabsTrigger>
            </TabsList>

            <TabsContent value="table" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">{formatTimestamp(log.timestamp)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{log.user}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{log.action}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getCategoryColor(log.category)}>
                            {log.category.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getSeverityColor(log.severity)}>
                            {log.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(log.status)}
                            <span className="capitalize">{log.status}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate" title={log.details}>
                          {log.details}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <div className="space-y-4">
                {filteredLogs.map((log, index) => (
                  <div key={log.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                        {getStatusIcon(log.status)}
                      </div>
                      {index < filteredLogs.length - 1 && <div className="w-px h-16 bg-gray-200 mt-2" />}
                    </div>
                    <div className="flex-1 pb-8">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{log.action}</h4>
                            <Badge variant="outline" className={getCategoryColor(log.category)}>
                              {log.category.replace("_", " ")}
                            </Badge>
                            <Badge variant="outline" className={getSeverityColor(log.severity)}>
                              {log.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{log.details}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>By {log.user}</span>
                            <span>•</span>
                            <span>{formatTimestamp(log.timestamp)}</span>
                            <span>•</span>
                            <span>IP: {log.ipAddress}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
