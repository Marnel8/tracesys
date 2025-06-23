"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Clock, CheckCircle, XCircle, Eye, Calendar } from "lucide-react"

// Mock data for attendance logs
const attendanceLogs = [
  {
    id: 1,
    studentId: "2021-00001",
    studentName: "Juan Dela Cruz",
    date: "2024-01-15",
    timeIn: "08:00 AM",
    timeOut: "05:00 PM",
    agency: "OMSC IT Department",
    status: "Pending",
    photoIn: "/placeholder.svg?height=40&width=40",
    photoOut: "/placeholder.svg?height=40&width=40",
    location: "OMSC Campus",
  },
  {
    id: 2,
    studentId: "2021-00002",
    studentName: "Maria Santos",
    date: "2024-01-15",
    timeIn: "08:15 AM",
    timeOut: "05:30 PM",
    agency: "Municipal IT Office",
    status: "Approved",
    photoIn: "/placeholder.svg?height=40&width=40",
    photoOut: "/placeholder.svg?height=40&width=40",
    location: "Municipal Hall",
  },
  {
    id: 3,
    studentId: "2021-00003",
    studentName: "Pedro Rodriguez",
    date: "2024-01-15",
    timeIn: "08:30 AM",
    timeOut: "04:45 PM",
    agency: "Provincial Capitol",
    status: "Pending",
    photoIn: "/placeholder.svg?height=40&width=40",
    photoOut: "/placeholder.svg?height=40&width=40",
    location: "Capitol Building",
  },
  {
    id: 4,
    studentId: "2021-00004",
    studentName: "Ana Garcia",
    date: "2024-01-14",
    timeIn: "07:45 AM",
    timeOut: "05:15 PM",
    agency: "OMSC Registrar",
    status: "Declined",
    photoIn: "/placeholder.svg?height=40&width=40",
    photoOut: "/placeholder.svg?height=40&width=40",
    location: "OMSC Campus",
  },
]

export default function AttendancePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedDate, setSelectedDate] = useState("")

  const filteredLogs = attendanceLogs.filter((log) => {
    const matchesSearch =
      log.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || log.studentId.includes(searchTerm)
    const matchesStatus = selectedStatus === "all" || log.status.toLowerCase() === selectedStatus
    const matchesDate = !selectedDate || log.date === selectedDate

    return matchesSearch && matchesStatus && matchesDate
  })

  const handleApprove = (id: number) => {
    console.log("Approve attendance:", id)
  }

  const handleDecline = (id: number) => {
    console.log("Decline attendance:", id)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Attendance Review</h1>
        <p className="text-gray-600">Review and approve student attendance logs</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-secondary-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">12</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved Today</p>
                <p className="text-2xl font-bold text-green-600">28</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Declined</p>
                <p className="text-2xl font-bold text-red-600">3</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Hours</p>
                <p className="text-2xl font-bold text-blue-600">8.5</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Logs</CardTitle>
          <CardDescription>Review student attendance submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by student name or ID..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full md:w-40"
            />
          </div>

          {/* Attendance Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time In</TableHead>
                  <TableHead>Time Out</TableHead>
                  <TableHead>Agency</TableHead>
                  <TableHead>Photos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{log.studentName}</div>
                        <div className="text-sm text-gray-600">{log.studentId}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{log.date}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{log.timeIn}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{log.timeOut}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{log.agency}</div>
                      <div className="text-xs text-gray-500">{log.location}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={log.photoIn || "/placeholder.svg"} alt="Time In" />
                          <AvatarFallback>IN</AvatarFallback>
                        </Avatar>
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={log.photoOut || "/placeholder.svg"} alt="Time Out" />
                          <AvatarFallback>OUT</AvatarFallback>
                        </Avatar>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          log.status === "Approved" ? "default" : log.status === "Pending" ? "secondary" : "destructive"
                        }
                        className={
                          log.status === "Approved"
                            ? "bg-green-100 text-green-800"
                            : log.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }
                      >
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {log.status === "Pending" && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApprove(log.id)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDecline(log.id)}>
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No attendance logs found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
