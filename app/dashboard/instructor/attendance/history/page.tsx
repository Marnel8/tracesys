"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, CalendarIcon, Download, Clock, CheckCircle, XCircle } from "lucide-react"
import { format } from "date-fns"
import { InstructorStatsCard } from "@/components/instructor-stats-card"

// Mock data for attendance history
const attendanceHistory = [
  {
    id: 1,
    date: "2024-01-15",
    studentId: "2021-00001",
    studentName: "Juan Dela Cruz",
    studentAvatar: "/placeholder.svg?height=32&width=32",
    timeIn: "08:00 AM",
    timeOut: "05:00 PM",
    totalHours: 9,
    agency: "OMSC IT Department",
    status: "Approved",
    approvedBy: "Prof. Dela Cruz",
    approvedAt: "2024-01-15T17:30:00Z",
    location: "OMSC Campus",
    notes: "Regular attendance",
  },
  {
    id: 2,
    date: "2024-01-15",
    studentId: "2021-00002",
    studentName: "Maria Santos",
    studentAvatar: "/placeholder.svg?height=32&width=32",
    timeIn: "08:15 AM",
    timeOut: "05:30 PM",
    totalHours: 9.25,
    agency: "Municipal IT Office",
    status: "Approved",
    approvedBy: "Prof. Dela Cruz",
    approvedAt: "2024-01-15T18:00:00Z",
    location: "Municipal Hall",
    notes: "Excellent performance",
  },
  {
    id: 3,
    date: "2024-01-14",
    studentId: "2021-00001",
    studentName: "Juan Dela Cruz",
    studentAvatar: "/placeholder.svg?height=32&width=32",
    timeIn: "08:00 AM",
    timeOut: "04:45 PM",
    totalHours: 8.75,
    agency: "OMSC IT Department",
    status: "Approved",
    approvedBy: "Prof. Dela Cruz",
    approvedAt: "2024-01-14T17:00:00Z",
    location: "OMSC Campus",
    notes: "Left early for medical appointment",
  },
  {
    id: 4,
    date: "2024-01-14",
    studentId: "2021-00003",
    studentName: "Pedro Rodriguez",
    studentAvatar: "/placeholder.svg?height=32&width=32",
    timeIn: "08:30 AM",
    timeOut: "04:30 PM",
    totalHours: 8,
    agency: "Provincial Capitol",
    status: "Declined",
    approvedBy: "Prof. Dela Cruz",
    approvedAt: "2024-01-14T19:00:00Z",
    location: "Capitol Building",
    notes: "Insufficient documentation",
  },
]

export default function AttendanceHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedStudent, setSelectedStudent] = useState("all")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })

  const filteredHistory = attendanceHistory.filter((record) => {
    const matchesSearch =
      record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.studentId.includes(searchTerm) ||
      record.agency.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || record.status.toLowerCase() === selectedStatus
    const matchesStudent = selectedStudent === "all" || record.studentId === selectedStudent

    return matchesSearch && matchesStatus && matchesStudent
  })

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "declined":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "declined":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  const exportData = () => {
    console.log("Exporting attendance history data...")
  }

  const approvedRecords = attendanceHistory.filter((r) => r.status === "Approved")
  const declinedRecords = attendanceHistory.filter((r) => r.status === "Declined")
  const totalApproved = approvedRecords.length
  const totalDeclined = declinedRecords.length
  const totalApprovedHours = approvedRecords.reduce((sum, r) => sum + r.totalHours, 0)
  const averageDailyHours =
    approvedRecords.length > 0 ? (totalApprovedHours / approvedRecords.length).toFixed(1) : "0.0"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance History</h1>
          <p className="text-gray-600">View complete attendance records and history</p>
        </div>
        <Button onClick={exportData} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <InstructorStatsCard
          icon={CheckCircle}
          label="Total Approved"
          value={totalApproved}
          helperText="Logs cleared"
        />
        <InstructorStatsCard
          icon={XCircle}
          label="Total Declined"
          value={totalDeclined}
          helperText="Needs attention"
          trend={
            totalDeclined > 0 ? { label: "Follow up required", variant: "negative" } : undefined
          }
        />
        <InstructorStatsCard
          icon={Clock}
          label="Total Hours"
          value={`${totalApprovedHours}h`}
          helperText="Approved entries"
        />
        <InstructorStatsCard
          icon={CalendarIcon}
          label="Avg. Daily Hours"
          value={`${averageDailyHours}h`}
          helperText="Per approved log"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>Complete history of student attendance submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by student name, ID, or agency..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Student" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                <SelectItem value="2021-00001">Juan Dela Cruz</SelectItem>
                <SelectItem value="2021-00002">Maria Santos</SelectItem>
                <SelectItem value="2021-00003">Pedro Rodriguez</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* History Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time In/Out</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Agency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Approved By</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={record.studentAvatar || "/placeholder.svg"} alt={record.studentName} />
                          <AvatarFallback>
                            {record.studentName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900">{record.studentName}</div>
                          <div className="text-sm text-gray-600">{record.studentId}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{record.date}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>
                          {record.timeIn} - {record.timeOut}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{record.totalHours}h</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{record.agency}</div>
                        <div className="text-gray-500">{record.location}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(record.status)}
                        <Badge variant="secondary" className={getStatusColor(record.status)}>
                          {record.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{record.approvedBy}</div>
                        <div className="text-gray-500">{new Date(record.approvedAt).toLocaleDateString()}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600 max-w-xs truncate">{record.notes}</div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredHistory.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No attendance records found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
