"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Plus, Users, GraduationCap, Clock, FileText, Edit, Eye, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  SECTIONS,
  getCourseOptions,
  YEAR_OPTIONS,
  SEMESTER_OPTIONS,
  getTotalStudentsAcrossSections,
  getAverageAttendanceAcrossSections,
  getAverageCompletionAcrossSections,
} from "@/data/instructor-courses"

// Use centralized data
const sections = SECTIONS

export default function SectionsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newSection, setNewSection] = useState({
    name: "",
    course: "",
    year: "",
    semester: "",
    schedule: "",
    room: "",
  })

  const handleCreateSection = () => {
    console.log("Creating section:", newSection)
    setIsCreateDialogOpen(false)
    setNewSection({
      name: "",
      course: "",
      year: "",
      semester: "",
      schedule: "",
      room: "",
    })
  }

  const getPerformanceColor = (value: number, type: string) => {
    if (type === "attendance" || type === "completion") {
      if (value >= 90) return "text-green-600"
      if (value >= 80) return "text-yellow-600"
      return "text-red-600"
    }
    if (type === "grade") {
      if (value >= 4.0) return "text-green-600"
      if (value >= 3.5) return "text-yellow-600"
      return "text-red-600"
    }
    return "text-gray-600"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Section Management</h1>
          <p className="text-gray-600">Manage your assigned sections and track their progress</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary-500 hover:bg-primary-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Section
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Section</DialogTitle>
              <DialogDescription>Add a new section to your assigned classes.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Section Name</Label>
                  <Input
                    id="name"
                    value={newSection.name}
                    onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
                    placeholder="e.g., BSIT 4A"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course">Course</Label>
                  <Select onValueChange={(value) => setNewSection({ ...newSection, course: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {getCourseOptions().map((course) => (
                        <SelectItem key={course.value} value={course.value}>
                          {course.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year Level</Label>
                  <Select onValueChange={(value) => setNewSection({ ...newSection, year: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {YEAR_OPTIONS.map((year) => (
                        <SelectItem key={year.value} value={year.value}>
                          {year.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  <Select onValueChange={(value) => setNewSection({ ...newSection, semester: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEMESTER_OPTIONS.map((semester) => (
                        <SelectItem key={semester.value} value={semester.value}>
                          {semester.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schedule">Schedule</Label>
                  <Input
                    id="schedule"
                    value={newSection.schedule}
                    onChange={(e) => setNewSection({ ...newSection, schedule: e.target.value })}
                    placeholder="e.g., MWF 8:00-11:00 AM"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room">Room</Label>
                  <Input
                    id="room"
                    value={newSection.room}
                    onChange={(e) => setNewSection({ ...newSection, room: e.target.value })}
                    placeholder="e.g., IT Lab 1"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSection} className="bg-primary-500 hover:bg-primary-600">
                Create Section
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-secondary-50 border-primary-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sections</p>
                <p className="text-2xl font-bold text-gray-900">{sections.length}</p>
              </div>
              <GraduationCap className="w-8 h-8 text-primary-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-blue-600">
                  {sections.reduce((sum, section) => sum + section.totalStudents, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Attendance</p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round(sections.reduce((sum, section) => sum + section.avgAttendance, 0) / sections.length)}%
                </p>
              </div>
              <Clock className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Completion</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(sections.reduce((sum, section) => sum + section.completionRate, 0) / sections.length)}%
                </p>
              </div>
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sections.map((section) => (
          <Card key={section.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{section.name}</CardTitle>
                  <CardDescription className="text-sm">{section.course}</CardDescription>
                </div>
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
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Section
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Users className="mr-2 h-4 w-4" />
                      Manage Students
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">{section.year}</Badge>
                <Badge variant="outline">{section.semester}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Student Info */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Students</span>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {section.activeStudents}/{section.totalStudents}
                  </div>
                  <div className="text-xs text-gray-500">Active</div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Attendance</span>
                    <span className={`text-sm font-medium ${getPerformanceColor(section.avgAttendance, "attendance")}`}>
                      {section.avgAttendance}%
                    </span>
                  </div>
                  <Progress value={section.avgAttendance} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Completion Rate</span>
                    <span
                      className={`text-sm font-medium ${getPerformanceColor(section.completionRate, "completion")}`}
                    >
                      {section.completionRate}%
                    </span>
                  </div>
                  <Progress value={section.completionRate} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Average Grade</span>
                    <span className={`text-sm font-medium ${getPerformanceColor(section.avgGrade, "grade")}`}>
                      {section.avgGrade}/5.0
                    </span>
                  </div>
                  <Progress value={(section.avgGrade / 5) * 100} className="h-2" />
                </div>
              </div>

              {/* Practicum Progress */}
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Practicum Progress</span>
                  <span className="text-sm text-gray-600">
                    {section.practicum.completedHours}/{section.practicum.totalHours} hrs
                  </span>
                </div>
                <Progress
                  value={(section.practicum.completedHours / section.practicum.totalHours) * 100}
                  className="h-2"
                />
              </div>

              {/* Schedule Info */}
              <div className="pt-3 border-t text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Schedule:</span>
                  <span>{section.schedule}</span>
                </div>
                <div className="flex justify-between">
                  <span>Room:</span>
                  <span>{section.room}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Table View */}
      <Card>
        <CardHeader>
          <CardTitle>Section Details</CardTitle>
          <CardDescription>Comprehensive view of all section information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Section</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Completion</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sections.map((section) => (
                  <TableRow key={section.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{section.name}</div>
                        <div className="text-sm text-gray-600">{section.course}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-medium">{section.totalStudents}</div>
                        <div className="text-xs text-gray-500">{section.activeStudents} active</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`font-medium ${getPerformanceColor(section.avgAttendance, "attendance")}`}>
                        {section.avgAttendance}%
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`font-medium ${getPerformanceColor(section.avgGrade, "grade")}`}>
                        {section.avgGrade}/5.0
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`font-medium ${getPerformanceColor(section.completionRate, "completion")}`}>
                        {section.completionRate}%
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{section.schedule}</div>
                        <div className="text-gray-500">{section.room}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="w-24">
                        <Progress
                          value={(section.practicum.completedHours / section.practicum.totalHours) * 100}
                          className="h-2"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {Math.round((section.practicum.completedHours / section.practicum.totalHours) * 100)}%
                        </div>
                      </div>
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
                            <Users className="mr-2 h-4 w-4" />
                            Manage Students
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Section
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
