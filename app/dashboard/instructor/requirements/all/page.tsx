"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// Replace placeholder section data with live sections
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Download, Eye, CheckCircle, XCircle, Clock, MoreHorizontal, FileText, User } from "lucide-react"
import { useRequirements } from "@/hooks/requirement"
import { useSections } from "@/hooks/section"
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { InstructorStatsCard } from "@/components/instructor-stats-card"

const humanizeBytes = (bytes?: number | null) => {
  if (!bytes && bytes !== 0) return "-"
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(1)} MB`
}

export default function AllRequirementsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedSection, setSelectedSection] = useState("all")
  const [selectedRequirement, setSelectedRequirement] = useState("all")
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm), 300)
    return () => clearTimeout(id)
  }, [searchTerm])

  useEffect(() => {
    setPage(1)
  }, [selectedStatus, debouncedSearch])

  const { data, isLoading } = useRequirements({
    page,
    limit,
    status: selectedStatus as any,
    search: debouncedSearch || undefined,
  })

  // Live sections for the filter options
  const { data: sectionData } = useSections({ status: "active" })
  const sectionOptions = useMemo(() => {
    const list = sectionData?.sections ?? []
    return list.map((s) => ({ value: s.id, label: s.name }))
  }, [sectionData])

  const items = data?.requirements ?? []
  const pagination = data?.pagination
  const currentPage = pagination?.currentPage ?? page
  const totalPages = pagination?.totalPages ?? 1
  const itemsPerPage = pagination?.itemsPerPage ?? limit
  const totalItems = pagination?.totalItems ?? items.length
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const endIndex = totalItems === 0 ? 0 : startIndex + items.length - 1

  const getReqSection = (r: any) => {
    const enrollments = r.student?.enrollments as any[] | undefined
    const sectionName = enrollments?.[0]?.section?.name
    const sectionId = enrollments?.[0]?.section?.id
    return { sectionName: sectionName || "N/A", sectionId }
  }

  const filteredRequirements = useMemo(() => {
    return items.filter((r) => {
      const { sectionId } = getReqSection(r)
      const studentName = `${r.student?.firstName ?? ""} ${r.student?.lastName ?? ""}`.trim()
      const studentId = r.student?.id ?? ""
      const matchesSearch =
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        studentId.includes(searchTerm)
      const matchesStatus = selectedStatus === "all" || r.status.toLowerCase() === selectedStatus
      const matchesSection = selectedSection === "all" || sectionId === selectedSection
      const matchesRequirement = selectedRequirement === "all" || r.title === selectedRequirement
      return matchesSearch && matchesStatus && matchesSection && matchesRequirement
    })
  }, [items, searchTerm, selectedStatus, selectedSection, selectedRequirement])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "submitted":
        return "bg-blue-100 text-blue-800"
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
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />
      case "submitted":
        return <Clock className="w-4 h-4 text-blue-600" />
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

  const totals = useMemo(() => {
    const total = items.length
    const approved = items.filter((r) => r.status === "approved").length
    const pending = items.filter((r) => r.status === "pending").length
    const rejected = items.filter((r) => r.status === "rejected").length
    return { total, approved, pending, rejected }
  }, [items])

  const requirementTypes = useMemo(() => {
    const map = new Map<string, { name: string; total: number; completed: number; percentage: number }>()
    items.forEach((r) => {
      const key = r.title
      const entry = map.get(key) || { name: key, total: 0, completed: 0, percentage: 0 }
      entry.total += 1
      if (r.status === "approved") entry.completed += 1
      map.set(key, entry)
    })
    return Array.from(map.values()).map((e) => ({ ...e, percentage: e.total ? Math.round((e.completed / e.total) * 100) : 0 }))
  }, [items])

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
        <InstructorStatsCard
          icon={FileText}
          label="Total Submissions"
          value={totals.total}
          helperText="Across all requirements"
        />
        <InstructorStatsCard
          icon={CheckCircle}
          label="Approved"
          value={totals.approved}
          helperText="Cleared requirements"
          trend={
            totals.approved > 0 ? { label: `${totals.approved} approved`, variant: "positive" } : undefined
          }
        />
        <InstructorStatsCard
          icon={Clock}
          label="Pending"
          value={totals.pending}
          helperText="Awaiting review"
        />
        <InstructorStatsCard
          icon={XCircle}
          label="Rejected"
          value={totals.rejected}
          helperText="Needs revision"
          trend={totals.rejected > 0 ? { label: "Follow up", variant: "negative" } : undefined}
        />
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
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {sectionOptions.map((section) => (
                  <SelectItem key={section.value} value={section.value}>
                    {section.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedRequirement} onValueChange={setSelectedRequirement}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Requirement Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Requirements</SelectItem>
                {Array.from(new Set(items.map((r) => r.title))).map((title) => (
                  <SelectItem key={title} value={title}>{title}</SelectItem>
                ))}
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
                          <AvatarImage src={"/placeholder.svg"} alt={req.student?.firstName} />
                          <AvatarFallback>{`${(req.student?.firstName?.[0] ?? "").toUpperCase()}${(req.student?.lastName?.[0] ?? "").toUpperCase()}`}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900">{`${req.student?.firstName ?? ""} ${req.student?.lastName ?? ""}`.trim()}</div>
                          <div className="text-sm text-gray-600">{req.student?.email ?? req.student?.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{req.title}</div>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const { sectionName } = getReqSection(req)
                        return <Badge variant="outline">{sectionName}</Badge>
                      })()}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{formatDate(req.submittedDate || req.createdAt)}</div>
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
                      <div className="text-sm">{humanizeBytes(req.fileSize)}</div>
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

          {(!isLoading && filteredRequirements.length === 0) && (
            <div className="text-center py-8">
              <p className="text-gray-500">No requirements found matching your criteria.</p>
            </div>
          )}
          {/* Pagination Controls - counts + buttons aligned to end */}
          <div className="flex items-center justify-between mt-4 px-2">
            <span className="text-sm text-gray-600">
              {startIndex}-{endIndex} of {totalItems}
            </span>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    className={currentPage <= 1 ? "pointer-events-none opacity-50" : undefined}
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage > 1) setPage(currentPage - 1)
                    }}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    className={currentPage >= totalPages ? "pointer-events-none opacity-50" : undefined}
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage < totalPages) setPage(currentPage + 1)
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
