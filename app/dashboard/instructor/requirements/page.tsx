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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Search,
  FileText,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  MessageSquare,
  MoreHorizontal,
  Calendar,
  User,
  Clock,
} from "lucide-react"

// Mock data for requirements
const requirements = [
  {
    id: 1,
    title: "Medical Certificate",
    studentId: "2021-00001",
    studentName: "Juan Dela Cruz",
    studentAvatar: "/placeholder.svg?height=32&width=32",
    submittedAt: "2024-01-15T10:30:00Z",
    status: "Pending",
    fileUrl: "/documents/medical-cert-001.pdf",
    fileName: "medical_certificate.pdf",
    fileSize: "2.3 MB",
    comments: [],
    priority: "High",
  },
  {
    id: 2,
    title: "Company MOA",
    studentId: "2021-00002",
    studentName: "Maria Santos",
    studentAvatar: "/placeholder.svg?height=32&width=32",
    submittedAt: "2024-01-14T14:20:00Z",
    status: "Approved",
    fileUrl: "/documents/moa-002.pdf",
    fileName: "company_moa.pdf",
    fileSize: "1.8 MB",
    comments: [
      {
        id: 1,
        text: "Document looks good. Approved.",
        createdAt: "2024-01-14T15:00:00Z",
        author: "Prof. Dela Cruz",
      },
    ],
    priority: "Medium",
  },
  {
    id: 3,
    title: "Insurance Certificate",
    studentId: "2021-00003",
    studentName: "Pedro Rodriguez",
    studentAvatar: "/placeholder.svg?height=32&width=32",
    submittedAt: "2024-01-13T09:15:00Z",
    status: "Returned",
    fileUrl: "/documents/insurance-003.pdf",
    fileName: "insurance_cert.pdf",
    fileSize: "1.2 MB",
    comments: [
      {
        id: 1,
        text: "Please resubmit with updated expiration date.",
        createdAt: "2024-01-13T11:00:00Z",
        author: "Prof. Dela Cruz",
      },
    ],
    priority: "High",
  },
  {
    id: 4,
    title: "Practicum Agreement",
    studentId: "2021-00004",
    studentName: "Ana Garcia",
    studentAvatar: "/placeholder.svg?height=32&width=32",
    submittedAt: "2024-01-12T16:45:00Z",
    status: "Pending",
    fileUrl: "/documents/agreement-004.pdf",
    fileName: "practicum_agreement.pdf",
    fileSize: "3.1 MB",
    comments: [],
    priority: "Medium",
  },
]

export default function RequirementsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedRequirement, setSelectedRequirement] = useState(null)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [reviewComment, setReviewComment] = useState("")

  const filteredRequirements = requirements.filter((req) => {
    const matchesSearch =
      req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.studentId.includes(searchTerm)
    const matchesStatus = selectedStatus === "all" || req.status.toLowerCase() === selectedStatus

    return matchesSearch && matchesStatus
  })

  const handleApprove = (id: number) => {
    console.log("Approve requirement:", id)
  }

  const handleReturn = (id: number, comment: string) => {
    console.log("Return requirement:", id, "Comment:", comment)
    setIsReviewDialogOpen(false)
    setReviewComment("")
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Requirements Review</h1>
        <p className="text-gray-600">Review and approve student requirement submissions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-secondary-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">8</p>
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
                <p className="text-2xl font-bold text-green-600">45</p>
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
                <p className="text-2xl font-bold text-red-600">7</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold text-blue-600">60</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Requirement Submissions</CardTitle>
          <CardDescription>Review and manage student requirement submissions</CardDescription>
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
          </div>

          {/* Requirements Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Requirement</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
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
                      <div>
                        <div className="text-sm font-medium">{req.fileName}</div>
                        <div className="text-xs text-gray-500">{req.fileSize}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {formatDate(req.submittedAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getPriorityColor(req.priority)}>
                        {req.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusColor(req.status)}>
                        {req.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {req.status === "Pending" && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApprove(req.id)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="destructive" onClick={() => setSelectedRequirement(req)}>
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Return Requirement</DialogTitle>
                                  <DialogDescription>
                                    Provide feedback for why this requirement is being returned.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label>Requirement: {selectedRequirement?.title}</Label>
                                    <p className="text-sm text-gray-600">Student: {selectedRequirement?.studentName}</p>
                                  </div>
                                  <div>
                                    <Label htmlFor="comment">Feedback Comment</Label>
                                    <Textarea
                                      id="comment"
                                      placeholder="Explain why this requirement needs to be resubmitted..."
                                      value={reviewComment}
                                      onChange={(e) => setReviewComment(e.target.value)}
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
                                    onClick={() => handleReturn(selectedRequirement?.id, reviewComment)}
                                  >
                                    Return Requirement
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Add Comment
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <User className="mr-2 h-4 w-4" />
                              View Student Profile
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download File
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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
