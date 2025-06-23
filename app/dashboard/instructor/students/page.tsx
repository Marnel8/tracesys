"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MoreHorizontal, UserPlus, Download, Eye, Edit, Trash2, Mail } from "lucide-react"

// Mock data for students
const students = [
  {
    id: "2021-00001",
    name: "Juan Dela Cruz",
    course: "BSIT",
    section: "4A",
    email: "juan.delacruz@student.omsc.edu.ph",
    agency: "OMSC IT Department",
    status: "Active",
    attendance: 95,
    requirements: 8,
    reports: 12,
  },
  {
    id: "2021-00002",
    name: "Maria Santos",
    course: "BSBA-FM",
    section: "4A",
    email: "maria.santos@student.omsc.edu.ph",
    agency: "Metro Bank",
    status: "Active",
    attendance: 88,
    requirements: 7,
    reports: 10,
  },
  {
    id: "2021-00003",
    name: "Pedro Rodriguez",
    course: "BSBA-OM",
    section: "4A",
    email: "pedro.rodriguez@student.omsc.edu.ph",
    agency: "Provincial Capitol",
    status: "Inactive",
    attendance: 72,
    requirements: 5,
    reports: 8,
  },
  {
    id: "2021-00004",
    name: "Ana Garcia",
    course: "BEED",
    section: "4A",
    email: "ana.garcia@student.omsc.edu.ph",
    agency: "Sunshine Elementary School",
    status: "Active",
    attendance: 92,
    requirements: 9,
    reports: 11,
  },
  {
    id: "2021-00005",
    name: "Carlos Mendoza",
    course: "BSIT",
    section: "4B",
    email: "carlos.mendoza@student.omsc.edu.ph",
    agency: "LGU Mamburao",
    status: "Active",
    attendance: 85,
    requirements: 6,
    reports: 9,
  },
]

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSection, setSelectedSection] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.includes(searchTerm) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSection = selectedSection === "all" || student.section === selectedSection
    const matchesStatus = selectedStatus === "all" || student.status.toLowerCase() === selectedStatus

    return matchesSearch && matchesSection && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
          <p className="text-gray-600">Manage your assigned students and their information</p>
        </div>
        <Button className="bg-primary-500 hover:bg-primary-600">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Student
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-secondary-50 border-primary-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">42</p>
              </div>
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">38</p>
              </div>
              <Badge className="bg-green-100 text-green-800">90%</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-yellow-600">4</p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">10%</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Attendance</p>
                <p className="text-2xl font-bold text-blue-600">89%</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">Good</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
          <CardDescription>View and manage all your assigned students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by name, ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                <SelectItem value="4A">4A</SelectItem>
                <SelectItem value="4B">4B</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Students Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Info</TableHead>
                  <TableHead>Course & Section</TableHead>
                  <TableHead>Agency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-600">{student.id}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{student.course}</div>
                        <div className="text-sm text-gray-600">Section {student.section}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{student.agency}</div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={student.status === "Active" ? "default" : "secondary"}
                        className={
                          student.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }
                      >
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium">{student.attendance}%</div>
                        <div
                          className={`w-2 h-2 rounded-full ${
                            student.attendance >= 90
                              ? "bg-green-500"
                              : student.attendance >= 80
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Req: {student.requirements}/10</div>
                        <div>Rep: {student.reports}/15</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Student
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Student
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No students found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
