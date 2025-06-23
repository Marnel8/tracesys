"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Download, Eye, CheckCircle, XCircle, MessageSquare, Calendar, Clock, Star } from "lucide-react"

// Mock data for weekly reports
const weeklyReports = [
  {
    id: 1,
    weekNumber: 8,
    studentId: "2021-00001",
    studentName: "Juan Dela Cruz",
    studentAvatar: "/placeholder.svg?height=32&width=32",
    submittedAt: "2024-01-15T16:30:00Z",
    status: "Pending",
    title: "Week 8 - Database Development",
    summary: "Worked on database schema design and implementation of user authentication system.",
    hoursLogged: 40,
    activities: [
      "Database schema design",
      "User authentication implementation",
      "Testing and debugging",
      "Documentation updates",
    ],
    learnings: "Learned about database normalization and security best practices.",
    challenges: "Had difficulty with complex SQL queries, but resolved with mentor guidance.",
    rating: null,
    feedback: "",
    fileUrl: "/reports/week8-001.pdf",
  },
  {
    id: 2,
    weekNumber: 7,
    studentId: "2021-00002",
    studentName: "Maria Santos",
    studentAvatar: "/placeholder.svg?height=32&width=32",
    submittedAt: "2024-01-08T14:20:00Z",
    status: "Approved",
    title: "Week 7 - Frontend Development",
    summary: "Developed responsive user interface components using React and Tailwind CSS.",
    hoursLogged: 38,
    activities: [
      "React component development",
      "Responsive design implementation",
      "API integration",
      "Code review sessions",
    ],
    learnings: "Enhanced skills in React hooks and state management.",
    challenges: "Responsive design challenges on mobile devices.",
    rating: 4,
    feedback: "Excellent work on the UI components. Keep up the good work!",
    fileUrl: "/reports/week7-002.pdf",
  },
  {
    id: 3,
    weekNumber: 8,
    studentId: "2021-00003",
    studentName: "Pedro Rodriguez",
    studentAvatar: "/placeholder.svg?height=32&width=32",
    submittedAt: "2024-01-15T10:15:00Z",
    status: "Returned",
    title: "Week 8 - System Testing",
    summary: "Conducted system testing and bug fixes.",
    hoursLogged: 35,
    activities: ["System testing", "Bug identification", "Documentation"],
    learnings: "Learned about testing methodologies.",
    challenges: "Limited testing tools available.",
    rating: null,
    feedback: "Please provide more detailed activities and include test cases documentation.",
    fileUrl: "/reports/week8-003.pdf",
  },
]

export default function WeeklyReportsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedWeek, setSelectedWeek] = useState("all")
  const [selectedReport, setSelectedReport] = useState(null)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [reviewFeedback, setReviewFeedback] = useState("")
  const [reviewRating, setReviewRating] = useState("")

  const filteredReports = weeklyReports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.studentId.includes(searchTerm)
    const matchesStatus = selectedStatus === "all" || report.status.toLowerCase() === selectedStatus
    const matchesWeek = selectedWeek === "all" || report.weekNumber.toString() === selectedWeek

    return matchesSearch && matchesStatus && matchesWeek
  })

  const handleApprove = (id: number, rating: number, feedback: string) => {
    console.log("Approve report:", id, "Rating:", rating, "Feedback:", feedback)
    setIsReviewDialogOpen(false)
    setReviewFeedback("")
    setReviewRating("")
  }

  const handleReturn = (id: number, feedback: string) => {
    console.log("Return report:", id, "Feedback:", feedback)
    setIsReviewDialogOpen(false)
    setReviewFeedback("")
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Weekly Reports</h1>
        <p className="text-gray-600">Review and evaluate student weekly progress reports</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-secondary-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">5</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
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
                <p className="text-sm text-gray-600">Returned</p>
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
                <p className="text-sm text-gray-600">Avg. Rating</p>
                <p className="text-2xl font-bold text-blue-600">4.2</p>
              </div>
              <Star className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Report Submissions</CardTitle>
          <CardDescription>Review and evaluate student weekly progress reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by title, student name, or ID..."
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
            <Select value={selectedWeek} onValueChange={setSelectedWeek}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Week" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Weeks</SelectItem>
                {Array.from({ length: 15 }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    Week {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reports Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Week & Title</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={report.studentAvatar || "/placeholder.svg"} alt={report.studentName} />
                          <AvatarFallback>
                            {report.studentName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900">{report.studentName}</div>
                          <div className="text-sm text-gray-600">{report.studentId}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">Week {report.weekNumber}</div>
                        <div className="text-sm text-gray-600">{report.title}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{report.hoursLogged}h</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {formatDate(report.submittedAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {report.rating ? (
                        <div className="flex items-center gap-1">
                          {renderStars(report.rating)}
                          <span className="text-sm text-gray-600 ml-1">{report.rating}/5</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Not rated</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedReport(report)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>
                                {selectedReport?.title} - {selectedReport?.studentName}
                              </DialogTitle>
                              <DialogDescription>
                                Submitted on {selectedReport && formatDate(selectedReport.submittedAt)}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                              <div>
                                <h4 className="font-semibold mb-2">Summary</h4>
                                <p className="text-gray-700">{selectedReport?.summary}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Activities Completed</h4>
                                <ul className="list-disc list-inside space-y-1">
                                  {selectedReport?.activities.map((activity, index) => (
                                    <li key={index} className="text-gray-700">
                                      {activity}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Key Learnings</h4>
                                <p className="text-gray-700">{selectedReport?.learnings}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Challenges Faced</h4>
                                <p className="text-gray-700">{selectedReport?.challenges}</p>
                              </div>
                              {selectedReport?.feedback && (
                                <div>
                                  <h4 className="font-semibold mb-2">Instructor Feedback</h4>
                                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedReport.feedback}</p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        {report.status === "Pending" && (
                          <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                className="bg-primary-500 hover:bg-primary-600"
                                onClick={() => setSelectedReport(report)}
                              >
                                <MessageSquare className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Review Report</DialogTitle>
                                <DialogDescription>
                                  Provide feedback and rating for this weekly report.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Report: {selectedReport?.title}</Label>
                                  <p className="text-sm text-gray-600">Student: {selectedReport?.studentName}</p>
                                </div>
                                <div>
                                  <Label htmlFor="rating">Rating (1-5 stars)</Label>
                                  <Select value={reviewRating} onValueChange={setReviewRating}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select rating" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="1">1 Star - Poor</SelectItem>
                                      <SelectItem value="2">2 Stars - Fair</SelectItem>
                                      <SelectItem value="3">3 Stars - Good</SelectItem>
                                      <SelectItem value="4">4 Stars - Very Good</SelectItem>
                                      <SelectItem value="5">5 Stars - Excellent</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="feedback">Feedback</Label>
                                  <Textarea
                                    id="feedback"
                                    placeholder="Provide constructive feedback..."
                                    value={reviewFeedback}
                                    onChange={(e) => setReviewFeedback(e.target.value)}
                                    rows={4}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleReturn(selectedReport?.id, reviewFeedback)}
                                >
                                  Return for Revision
                                </Button>
                                <Button
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() =>
                                    handleApprove(selectedReport?.id, Number.parseInt(reviewRating), reviewFeedback)
                                  }
                                  disabled={!reviewRating}
                                >
                                  Approve Report
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredReports.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No reports found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
