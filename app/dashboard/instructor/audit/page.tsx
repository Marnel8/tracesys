"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  User,
  Shield,
  Download,
  Filter,
  Search,
  Calendar,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  Trash2,
} from "lucide-react"
import {
  useAuditLogs,
  useAuditStats,
  useAuditFilters,
  useAuditPagination,
  useAuditRealtime,
  useExportAuditLogs,
  useDeleteOldAuditLogs,
  AuditFilters,
} from "@/hooks/audit"

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "high":
      return "bg-red-100 text-red-800 border-red-200"
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "low":
      return "bg-green-100 text-green-800 border-green-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case "security":
      return "bg-red-50 text-red-700 border-red-200"
    case "academic":
      return "bg-blue-50 text-blue-700 border-blue-200"
    case "submission":
      return "bg-green-50 text-green-700 border-green-200"
    case "attendance":
      return "bg-purple-50 text-purple-700 border-purple-200"
    case "user_management":
      return "bg-orange-50 text-orange-700 border-orange-200"
    default:
      return "bg-gray-50 text-gray-700 border-gray-200"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "success":
      return <CheckCircle className="w-4 h-4 text-green-600" />
    case "failed":
      return <XCircle className="w-4 h-4 text-red-600" />
    case "warning":
      return <AlertTriangle className="w-4 h-4 text-yellow-600" />
    default:
      return <Activity className="w-4 h-4 text-gray-600" />
  }
}

export default function AuditTrailPage() {
  const [filters, setFilters] = useState<AuditFilters>({
    search: "",
    category: "all",
    severity: "all",
    status: "all",
    userId: "all",
    page: 1,
    limit: 10,
  })

  // Hooks
  const { data: auditData, isLoading } = useAuditLogs(filters)
  const { data: stats, isLoading: statsLoading } = useAuditStats()
  const { categories, severities, statuses, users } = useAuditFilters()
  const { isEnabled: realtimeEnabled, enableRealtime, disableRealtime } = useAuditRealtime(filters)
  const exportMutation = useExportAuditLogs()
  const deleteOldMutation = useDeleteOldAuditLogs()

  // Pagination
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    goToPage,
    nextPage,
    prevPage,
    changePageSize,
    hasNextPage,
    hasPrevPage,
  } = useAuditPagination(filters)

  const handleFilterChange = (key: keyof AuditFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }))
  }

  const handleExport = () => {
    exportMutation.mutate(filters)
  }

  const handleDeleteOld = () => {
    if (confirm("Are you sure you want to delete audit logs older than 90 days? This action cannot be undone.")) {
      deleteOldMutation.mutate(90)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  if (isLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Trail</h1>
          <p className="text-gray-600 mt-1">Track all system activities and changes for security and compliance</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => realtimeEnabled ? disableRealtime() : enableRealtime()}
          >
            {realtimeEnabled ? (
              <>
                <Activity className="w-4 h-4 mr-2" />
                Real-time ON
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Enable Real-time
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={exportMutation.isPending}>
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </Button>
          <Button variant="outline" size="sm" onClick={handleDeleteOld} disabled={deleteOldMutation.isPending}>
            <Trash2 className="w-4 h-4 mr-2" />
            Cleanup
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalActivities.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">All time activities</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Events</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.securityEvents.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Security-related activities</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Actions</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.failedActions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Failed operations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search activities..."
                  value={filters.search || ""}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={filters.category || "all"} onValueChange={(value) => handleFilterChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Severity</Label>
              <Select value={filters.severity || "all"} onValueChange={(value) => handleFilterChange("severity", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Severities" />
                </SelectTrigger>
                <SelectContent>
                  {severities.map((severity) => (
                    <SelectItem key={severity.value} value={severity.value}>
                      {severity.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>User</Label>
              <Select value={filters.userId || "all"} onValueChange={(value) => handleFilterChange("userId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.value} value={user.value}>
                      {user.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Page Size</Label>
              <Select value={pageSize.toString()} onValueChange={(value) => changePageSize(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="25">25 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                  <SelectItem value="100">100 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Audit Logs
          </CardTitle>
          <CardDescription>
            Showing {auditData?.auditLogs.length || 0} of {totalItems} activities
            {realtimeEnabled && <span className="text-green-600 ml-2">• Real-time enabled</span>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="table" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="timeline">Timeline View</TabsTrigger>
            </TabsList>

            <TabsContent value="table" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditData?.auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">{formatTimestamp(log.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">
                              {log.user ? `${log.user.firstName} ${log.user.lastName}` : "System"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{log.action}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getCategoryColor(log.category)}>
                            {log.category.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getSeverityColor(log.severity)}>
                            {log.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(log.status)}
                            <span className="capitalize">{log.status}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate" title={log.details}>
                          {log.details}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} results
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevPage}
                    disabled={!hasPrevPage}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(page)}
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextPage}
                    disabled={!hasNextPage}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <div className="space-y-4">
                {auditData?.auditLogs.map((log, index) => (
                  <div key={log.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                        {getStatusIcon(log.status)}
                      </div>
                      {index < (auditData?.auditLogs.length || 0) - 1 && <div className="w-px h-16 bg-gray-200 mt-2" />}
                    </div>
                    <div className="flex-1 pb-8">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{log.action}</h4>
                            <Badge variant="outline" className={getCategoryColor(log.category)}>
                              {log.category.replace("_", " ")}
                            </Badge>
                            <Badge variant="outline" className={getSeverityColor(log.severity)}>
                              {log.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{log.details}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>By {log.user ? `${log.user.firstName} ${log.user.lastName}` : "System"}</span>
                            <span>•</span>
                            <span>{formatTimestamp(log.createdAt)}</span>
                            <span>•</span>
                            <span>IP: {log.ipAddress}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
