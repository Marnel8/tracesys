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
import {
  Search,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  MessageSquare,
  Calendar,
  Clock,
  Star,
  FileText,
} from "lucide-react"

// Mock data for narrative reports
const narrativeReports = [
  {
    id: 1,
    studentId: "2021-00001",
    studentName: "Juan Dela Cruz",
    studentAvatar: "/placeholder.svg?height=32&width=32",
    submittedAt: "2024-01-15T16:30:00Z",
    status: "Pending",
    title: "Mid-Term Narrative Report",
    summary: "Comprehensive reflection on the first half of my practicum experience at OMSC IT Department.",
    wordCount: 1250,
    sections: {
      introduction: "Detailed introduction about the practicum placement and objectives.",
      experiences: "Rich description of daily activities, projects worked on, and skills developed.",
      challenges: "Honest reflection on difficulties faced and how they were overcome.",
      learnings: "Key insights gained and how they relate to academic coursework.",
      conclusion: "Summary of growth and future goals for the remainder of the practicum.",
    },
    rating: null,
    feedback: "",
    fileUrl: "/reports/narrative-001.pdf",
  },
  {
    id: 2,
    studentId: "2021-00002",
    studentName: "Maria Santos",
    studentAvatar: "/placeholder.svg?height=32&width=32",
    submittedAt: "2024-01-10T14:20:00Z",
    status: "Approved",
    title: "Final Narrative Report",
    summary: "Complete reflection on the entire practicum experience at Municipal IT Office.",
    wordCount: 2100,
    sections: {
      introduction: "Overview of the practicum program and personal objectives.",
      experiences: "Detailed account of projects, responsibilities, and professional growth.",
      challenges: "Analysis of obstacles encountered and problem-solving approaches.",
      learnings: "Comprehensive review of technical and soft skills acquired.",
      conclusion: "Final thoughts on career readiness and future aspirations.",
    },
    rating: 5,
    feedback:
      "Excellent narrative report with deep reflection and professional insights. Well-structured and comprehensive.",
    fileUrl: "/reports/narrative-002.pdf",
  },
  {
    id: 3,
    studentId: "2021-00003",
    studentName: "Pedro Rodriguez",
    studentAvatar: "/placeholder.svg?height=32&width=32",
    submittedAt: "2024-01-08T10:15:00Z",
    status: "Returned",
    title: "Mid-Term Narrative Report",
    summary: "Reflection on practicum experience at Provincial Capitol.",
    wordCount: 800,
    sections: {
      introduction: "Brief overview of placement and initial expectations.",
      experiences: "General description of tasks and activities.",
      challenges: "Limited discussion of difficulties faced.",
      learnings: "Basic overview of skills learned.",
      conclusion: "Short summary of experience so far.",
    },
    rating: null,
    feedback:
      "Report needs more depth and reflection. Please expand on specific experiences and provide more detailed analysis of learnings.",
    fileUrl: "/reports/narrative-003.pdf",
  },
]

export default function NarrativeReportsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedReport, setSelectedReport] = useState(null)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [reviewFeedback, setReviewFeedback] = useState("")
  const [reviewRating, setReviewRating] = useState("")

  const filteredReports = narrativeReports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.studentId.includes(searchTerm)
    const matchesStatus = selectedStatus === "all" || report.status.toLowerCase() === selectedStatus

    return matchesSearch && matchesStatus
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

  const getWordCountColor = (wordCount: number) => {
    if (wordCount >= 1500) return "text-green-600"
    if (wordCount >= 1000) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Narrative Reports</h1>
        <p className="text-gray-600">Review and evaluate student narrative reflection reports</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-secondary-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {narrativeReports.filter((r) => r.status === "Pending").length}
                </p>
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
                <p className="text-2xl font-bold text-green-600">
                  {narrativeReports.filter((r) => r.status === "Approved").length}
                </p>
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
                <p className="text-2xl font-bold text-red-600">
                  {narrativeReports.filter((r) => r.status === "Returned").length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Word Count</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(narrativeReports.reduce((sum, r) => sum + r.wordCount, 0) / narrativeReports.length)}
                </p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Narrative Report Submissions</CardTitle>
          <CardDescription>Review and evaluate student narrative reflection reports</CardDescription>
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
          </div>

          {/* Reports Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Word Count</TableHead>
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
                        <div className="font-medium">{report.title}</div>
                        <div className="text-sm text-gray-600 max-w-xs truncate">{report.summary}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`font-medium ${getWordCountColor(report.wordCount)}`}>
                        {report.wordCount.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">words</div>
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
                                Submitted on {selectedReport && formatDate(selectedReport.submittedAt)} •{" "}
                                {selectedReport?.wordCount} words
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                              <div>
                                <h4 className="font-semibold mb-2">Summary</h4>
                                <p className="text-gray-700">{selectedReport?.summary}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Report Sections</h4>
                                <div className="space-y-3">
                                  <div>
                                    <h5 className="font-medium text-sm text-gray-800">Introduction</h5>
                                    <p className="text-sm text-gray-600">{selectedReport?.sections.introduction}</p>
                                  </div>
                                  <div>
                                    <h5 className="font-medium text-sm text-gray-800">Experiences</h5>
                                    <p className="text-sm text-gray-600">{selectedReport?.sections.experiences}</p>
                                  </div>
                                  <div>
                                    <h5 className="font-medium text-sm text-gray-800">Challenges</h5>
                                    <p className="text-sm text-gray-600">{selectedReport?.sections.challenges}</p>
                                  </div>
                                  <div>
                                    <h5 className="font-medium text-sm text-gray-800">Learnings</h5>
                                    <p className="text-sm text-gray-600">{selectedReport?.sections.learnings}</p>
                                  </div>
                                  <div>
                                    <h5 className="font-medium text-sm text-gray-800">Conclusion</h5>
                                    <p className="text-sm text-gray-600">{selectedReport?.sections.conclusion}</p>
                                  </div>
                                </div>
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
                                <DialogTitle>Review Narrative Report</DialogTitle>
                                <DialogDescription>
                                  Provide feedback and rating for this narrative report.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Report: {selectedReport?.title}</Label>
                                  <p className="text-sm text-gray-600">Student: {selectedReport?.studentName}</p>
                                  <p className="text-sm text-gray-600">Word Count: {selectedReport?.wordCount}</p>
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
                                    placeholder="Provide detailed feedback on the narrative report..."
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
              <p className="text-gray-500">No narrative reports found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
