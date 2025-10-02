"use client"

import { useState, useMemo, useEffect } from "react"
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
import { Search, Download, Eye, CheckCircle, XCircle, MessageSquare, Calendar, Clock, Star, FileText, ChevronLeft, ChevronRight, X } from "lucide-react"
import { useReports, useApproveReport, useRejectReport, Report } from "@/hooks/report/useReport"
import { useAuth } from "@/hooks/auth/useAuth"

export default function WeeklyReportsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedWeek, setSelectedWeek] = useState("all")
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [reviewFeedback, setReviewFeedback] = useState("")
  const [reviewRating, setReviewRating] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const { user } = useAuth()
  
  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchTerm, selectedStatus, selectedWeek])
  
  // Fetch weekly reports
  const { data: reportsData, isLoading } = useReports({
    page: currentPage,
    limit: 50,
    search: debouncedSearchTerm || undefined,
    status: selectedStatus === "all" ? "all" : selectedStatus as any,
    type: "weekly",
    weekNumber: selectedWeek === "all" ? undefined : parseInt(selectedWeek),
  })

  const { mutate: approveReport, isPending: isApproving } = useApproveReport()
  const { mutate: rejectReport, isPending: isRejecting } = useRejectReport()

  const weeklyReports = useMemo(() => reportsData?.reports ?? [], [reportsData])

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("")
    setDebouncedSearchTerm("")
    setSelectedStatus("all")
    setSelectedWeek("all")
    setCurrentPage(1)
  }

  // Check if any filters are active
  const hasActiveFilters = searchTerm || selectedStatus !== "all" || selectedWeek !== "all"

  // Calculate stats from the reports
  const stats = useMemo(() => {
    const reports = weeklyReports
    const ratedReports = reports.filter(r => r.rating)
    return {
      pending: reports.filter(r => r.status === "submitted").length,
      approved: reports.filter(r => r.status === "approved").length,
      rejected: reports.filter(r => r.status === "rejected").length,
      averageRating: ratedReports.length > 0 
        ? ratedReports.reduce((acc, r) => acc + (r.rating || 0), 0) / ratedReports.length 
        : 0
    }
  }, [weeklyReports])

  const handleApprove = (id: string, rating: number, feedback: string) => {
    approveReport({
      id,
      rating,
      feedback: feedback || null
    }, {
      onSuccess: () => {
        setIsReviewDialogOpen(false)
        setReviewFeedback("")
        setReviewRating("")
        setSelectedReport(null)
      }
    })
  }

  const handleReturn = (id: string, feedback: string) => {
    rejectReport({
      id,
      reason: feedback
    }, {
      onSuccess: () => {
        setIsReviewDialogOpen(false)
        setReviewFeedback("")
        setSelectedReport(null)
      }
    })
  }

  const getFullFileUrl = (fileUrl: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    return `${baseUrl}${fileUrl}`
  }

  const handleDownloadReport = (fileUrl: string, fileName: string) => {
    const fullUrl = getFullFileUrl(fileUrl)
    const link = document.createElement('a')
    link.href = fullUrl
    link.download = fileName
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
      case "submitted":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
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
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
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
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
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
                <p className="text-2xl font-bold text-blue-600">{stats.averageRating.toFixed(1)}</p>
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
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
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
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </Button>
            )}
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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Loading reports...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : weeklyReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <p className="text-gray-500">No reports found matching your criteria.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  weeklyReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {/* <Avatar className="w-8 h-8">
                            <AvatarImage src={report.student?.avatar || "/placeholder.svg"} alt={report.student?.firstName || "Student"} />
                            <AvatarFallback>
                              {report.student ? 
                                `${report.student.firstName?.[0] || ''}${report.student.lastName?.[0] || ''}` :
                                'S'
                              }
                            </AvatarFallback>
                          </Avatar> */}
                          <div>
                            <div className="font-medium text-gray-900">
                              {report.student ? `${report.student.firstName} ${report.student.lastName}` : 'Unknown Student'}
                            </div>
                            <div className="text-sm text-gray-600">{report.student?.studentId || report.studentId}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">Week {report.weekNumber || 'N/A'}</div>
                          <div className="text-sm text-gray-600">{report.title}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{report.hoursLogged || 0}h</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {report.submittedDate ? formatDate(report.submittedDate) : 'Not submitted'}
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
                          {report.fileUrl && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownloadReport(report.fileUrl!, `DTR_Week_${report.weekNumber || 'Unknown'}.pdf`)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedReport(report)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                {selectedReport?.title} - Week {selectedReport?.weekNumber || 'N/A'}
                              </DialogTitle>
                              <DialogDescription className="flex items-center gap-4">
                                <span>Student: {selectedReport?.student ? `${selectedReport.student.firstName} ${selectedReport.student.lastName}` : 'Unknown Student'}</span>
                                <span>•</span>
                                <span>Submitted: {selectedReport?.submittedDate ? formatDate(selectedReport.submittedDate) : 'Not submitted'}</span>
                                <span>•</span>
                                <span>Hours: {selectedReport?.hoursLogged || 0}h</span>
                              </DialogDescription>
                            </DialogHeader>
                            
                            {/* Report Preview */}
                            <div className="space-y-6">
                              {/* Student Info Card */}
                              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-4">
                                    <Avatar className="w-12 h-12">
                                      <AvatarImage src={selectedReport?.student?.avatar || "/placeholder.svg"} alt={selectedReport?.student?.firstName || "Student"} />
                                      <AvatarFallback>
                                        {selectedReport?.student ? 
                                          `${selectedReport.student.firstName?.[0] || ''}${selectedReport.student.lastName?.[0] || ''}` :
                                          'S'
                                        }
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <h3 className="font-semibold text-lg">
                                        {selectedReport?.student ? `${selectedReport.student.firstName} ${selectedReport.student.lastName}` : 'Unknown Student'}
                                      </h3>
                                      <p className="text-gray-600">Student ID: {selectedReport?.student?.studentId || selectedReport?.studentId}</p>
                                      <div className="flex items-center gap-4 mt-2">
                                        <Badge variant="secondary" className={getStatusColor(selectedReport?.status || '')}>
                                          {selectedReport?.status}
                                        </Badge>
                                        {selectedReport?.rating && (
                                          <div className="flex items-center gap-1">
                                            {renderStars(selectedReport.rating)}
                                            <span className="text-sm text-gray-600 ml-1">{selectedReport.rating}/5</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Report Content Grid */}
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Main Content */}
                                <div className="space-y-4">
                                  <Card>
                                    <CardHeader className="pb-3">
                                      <CardTitle className="text-lg flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5" />
                                        Report Summary
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <p className="text-gray-700 leading-relaxed">
                                        {selectedReport?.content || 'No content provided'}
                                      </p>
                                    </CardContent>
                                  </Card>

                                  {selectedReport?.activities && (
                                    <Card>
                                      <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                          <CheckCircle className="w-5 h-5 text-green-600" />
                                          Activities Completed
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <p className="text-gray-700 leading-relaxed">{selectedReport.activities}</p>
                                      </CardContent>
                                    </Card>
                                  )}
                                </div>

                                {/* Side Content */}
                                <div className="space-y-4">
                                  {selectedReport?.learnings && (
                                    <Card>
                                      <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                          <Star className="w-5 h-5 text-yellow-600" />
                                          Key Learnings
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <p className="text-gray-700 leading-relaxed">{selectedReport.learnings}</p>
                                      </CardContent>
                                    </Card>
                                  )}

                                  {selectedReport?.challenges && (
                                    <Card>
                                      <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                          <XCircle className="w-5 h-5 text-red-600" />
                                          Challenges Faced
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <p className="text-gray-700 leading-relaxed">{selectedReport.challenges}</p>
                                      </CardContent>
                                    </Card>
                                  )}

                                  {selectedReport?.fileUrl && (
                                    <Card>
                                      <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                          <FileText className="w-5 h-5 text-red-600" />
                                          DTR File
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-4">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                          <FileText className="w-6 h-6 text-red-600" />
                                          <div className="flex-1">
                                            <p className="font-medium text-gray-700">DTR_Week_{selectedReport.weekNumber || 'Unknown'}.pdf</p>
                                            <p className="text-sm text-gray-500">Daily Time Record</p>
                                          </div>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDownloadReport(selectedReport.fileUrl!, `DTR_Week_${selectedReport.weekNumber || 'Unknown'}.pdf`)}
                                          >
                                            <Download className="w-4 h-4 mr-1" />
                                            Download
                                          </Button>
                                        </div>
                                        
                                        {/* PDF Preview */}
                                        <div className="border rounded-lg overflow-hidden">
                                          <div className="bg-gray-100 px-4 py-2 border-b flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">PDF Preview</span>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => window.open(getFullFileUrl(selectedReport.fileUrl!), '_blank')}
                                              className="text-xs"
                                            >
                                              Open in New Tab
                                            </Button>
                                          </div>
                                          <div className="bg-white">
                                            <iframe
                                              src={`${getFullFileUrl(selectedReport.fileUrl!)}#toolbar=0&navpanes=0&scrollbar=0`}
                                              className="w-full h-96 border-0"
                                              title={`DTR Week ${selectedReport.weekNumber || 'Unknown'} Preview`}
                                              onError={(e) => {
                                                const iframe = e.target as HTMLIFrameElement;
                                                iframe.style.display = 'none';
                                                const errorDiv = document.createElement('div');
                                                errorDiv.className = 'flex flex-col items-center justify-center h-96 bg-gray-50 text-gray-500';
                                                errorDiv.innerHTML = `
                                                  <FileText className="w-12 h-12 mb-2 text-gray-400" />
                                                  <p className="text-sm">PDF preview not available</p>
                                                  <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    className="mt-2"
                                                    onclick="window.open('${getFullFileUrl(selectedReport.fileUrl!)}', '_blank')"
                                                  >
                                                    <Download className="w-3 h-3 mr-1" />
                                                    View PDF
                                                  </Button>
                                                `;
                                                iframe.parentNode?.replaceChild(errorDiv, iframe);
                                              }}
                                            />
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  )}
                                </div>
                              </div>

                              {/* Instructor Feedback */}
                              {selectedReport?.feedback && (
                                <Card className="bg-yellow-50 border-yellow-200">
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                      <MessageSquare className="w-5 h-5 text-yellow-600" />
                                      Instructor Feedback
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="bg-white p-4 rounded-lg border border-yellow-200">
                                      <p className="text-gray-700 leading-relaxed">{selectedReport.feedback}</p>
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        {report.status === "submitted" && (
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
                                  <p className="text-sm text-gray-600">
                                    Student: {selectedReport?.student ? `${selectedReport.student.firstName} ${selectedReport.student.lastName}` : 'Unknown Student'}
                                  </p>
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
                                  onClick={() => handleReturn(selectedReport?.id || '', reviewFeedback)}
                                  disabled={isRejecting}
                                >
                                  {isRejecting ? 'Rejecting...' : 'Reject Report'}
                                </Button>
                                <Button
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() =>
                                    handleApprove(selectedReport?.id || '', Number.parseInt(reviewRating), reviewFeedback)
                                  }
                                  disabled={!reviewRating || isApproving}
                                >
                                  {isApproving ? 'Approving...' : 'Approve Report'}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            </Table>
          </div>

        </CardContent>
      </Card>

      {/* Pagination */}
      {reportsData && reportsData.pagination.totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * 50) + 1} to {Math.min(currentPage * 50, reportsData.pagination.totalItems)} of {reportsData.pagination.totalItems} reports
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, reportsData.pagination.totalPages) }, (_, i) => {
                    const pageNum = i + 1
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                  {reportsData.pagination.totalPages > 5 && (
                    <>
                      <span className="text-gray-400">...</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(reportsData.pagination.totalPages)}
                        className="w-8 h-8 p-0"
                      >
                        {reportsData.pagination.totalPages}
                      </Button>
                    </>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(reportsData.pagination.totalPages, prev + 1))}
                  disabled={currentPage === reportsData.pagination.totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
