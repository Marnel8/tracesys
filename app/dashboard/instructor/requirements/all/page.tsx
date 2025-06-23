"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SECTIONS, getSectionOptions } from "@/data/instructor-courses"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Download, Eye, CheckCircle, XCircle, Clock, MoreHorizontal, FileText, User } from "lucide-react"

// Mock data for all requirements
const allRequirements = [
  {
    id: 1,
    title: "Medical Certificate",
    studentId: "2021-00001",
    studentName: "Juan Dela Cruz",
    studentAvatar: "/placeholder.svg?height=32&width=32",
    section: SECTIONS[0].name,
    submittedAt: "2024-01-15T10:30:00Z",
    status: "Approved",
    priority: "High",
    fileSize: "2.3 MB",
    approvedBy: "Prof. Dela Cruz",
    approvedAt: "2024-01-15T14:20:00Z",
  },
  {
    id: 2,
    title: "Company MOA",
    studentId: "2021-00002",
    studentName: "Maria Santos",
    studentAvatar: "/placeholder.svg?height=32&width=32",
    section: SECTIONS[1].name,
    submittedAt: "2024-01-14T14:20:00Z",
    status: "Approved",
    priority: "High",
    fileSize: "1.8 MB",
    approvedBy: "Prof. Dela Cruz",
    approvedAt: "2024-01-14T16:45:00Z",
  },
  {
    id: 3,
    title: "Insurance Certificate",
    studentId: "2021-00003",
    studentName: "Pedro Rodriguez",
    studentAvatar: "/placeholder.svg?height=32&width=32",
    section: SECTIONS[2].name,
    submittedAt: "2024-01-13T09:15:00Z",
    status: "Returned",
    priority: "High",
    fileSize: "1.2 MB",
    approvedBy: "Prof. Dela Cruz",
    approvedAt: "2024-01-13T11:30:00Z",
  },
  {
    id: 4,
    title: "Practicum Agreement",
    studentId: "2021-00004",
    studentName: "Ana Garcia",
    studentAvatar: "/placeholder.svg?height=32&width=32",
    section: SECTIONS[0].name,
    submittedAt: "2024-01-12T16:45:00Z",
    status: "Pending",
    priority: "Medium",
    fileSize: "3.1 MB",
    approvedBy: null,
    approvedAt: null,
  },
  {
    id: 5,
    title: "Medical Certificate",
    studentId: "2021-00005",
    studentName: "Carlos Mendoza",
    studentAvatar: "/placeholder.svg?height=32&width=32",
    section: SECTIONS[1].name,
    submittedAt: "2024-01-11T08:30:00Z",
    status: "Approved",
    priority: "High",
    fileSize: "2.1 MB",
    approvedBy: "Prof. Dela Cruz",
    approvedAt: "2024-01-11T12:15:00Z",
  },
]

// Mock data for requirement types and their completion rates
const requirementTypes = [
  { name: "Medical Certificate", total: 42, completed: 38, percentage: 90 },
  { name: "Company MOA", total: 42, completed: 35, percentage: 83 },
  { name: "Insurance Certificate", total: 42, completed: 32, percentage: 76 },
  { name: "Practicum Agreement", total: 42, completed: 40, percentage: 95 },
  { name: "Portfolio Submission", total: 42, completed: 15, percentage: 36 },
]

export default function AllRequirementsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedSection, setSelectedSection] = useState("all")
  const [selectedRequirement, setSelectedRequirement] = useState("all")

  const filteredRequirements = allRequirements.filter((req) => {
    const matchesSearch =
      req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.studentId.includes(searchTerm)
    const matchesStatus = selectedStatus === "all" || req.status.toLowerCase() === selectedStatus
    const matchesSection = selectedSection === "all" || req.section === selectedSection
    const matchesRequirement = selectedRequirement === "all" || req.title === selectedRequirement

    return matchesSearch && matchesStatus && matchesSection && matchesRequirement
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "returned":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "returned":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <FileText className="w-4 h-4 text-gray-600" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Requirements</h1>
          <p className="text-gray-600">Complete overview of all student requirement submissions</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-secondary-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold text-blue-600">{allRequirements.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {allRequirements.filter((r) => r.status === "Approved").length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {allRequirements.filter((r) => r.status === "Pending").length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Returned</p>
                <p className="text-2xl font-bold text-red-600">
                  {allRequirements.filter((r) => r.status === "Returned").length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requirement Types Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Requirement Completion Overview</CardTitle>
          <CardDescription>Progress tracking for each requirement type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requirementTypes.map((type) => (
              <div key={type.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{type.name}</h3>
                    <span className="text-sm text-gray-600">
                      {type.completed}/{type.total} completed
                    </span>
                  </div>
                  <Progress value={type.percentage} className="h-2" />
                </div>
                <div className="ml-4">
                  <Badge
                    variant="secondary"
                    className={
                      type.percentage >= 90
                        ? "bg-green-100 text-green-800"
                        : type.percentage >= 70
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }
                  >
                    {type.percentage}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>All Requirement Submissions</CardTitle>
          <CardDescription>Complete list of all student requirement submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by requirement, student name, or ID..."
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
                <SelectItem value="returned">Returned</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                                    {getSectionOptions().map((section) => (
                      <SelectItem key={section.value} value={section.value}>
                        {section.label}
                      </SelectItem>
                    ))}
                <SelectItem value="BSCS 4B">BSCS 4B</SelectItem>
                <SelectItem value="BSIS 4A">BSIS 4A</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedRequirement} onValueChange={setSelectedRequirement}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Requirement Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Requirements</SelectItem>
                <SelectItem value="Medical Certificate">Medical Certificate</SelectItem>
                <SelectItem value="Company MOA">Company MOA</SelectItem>
                <SelectItem value="Insurance Certificate">Insurance Certificate</SelectItem>
                <SelectItem value="Practicum Agreement">Practicum Agreement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Requirements Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Requirement</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>File Size</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequirements.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={req.studentAvatar || "/placeholder.svg"} alt={req.studentName} />
                          <AvatarFallback>
                            {req.studentName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900">{req.studentName}</div>
                          <div className="text-sm text-gray-600">{req.studentId}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{req.title}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{req.section}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{formatDate(req.submittedAt)}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getPriorityColor(req.priority)}>
                        {req.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(req.status)}
                        <Badge variant="secondary" className={getStatusColor(req.status)}>
                          {req.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{req.fileSize}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download File
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4" />
                            View Student Profile
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredRequirements.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No requirements found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
