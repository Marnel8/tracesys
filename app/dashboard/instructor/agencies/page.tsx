"use client";

import type React from "react";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  ToggleLeft,
  ToggleRight,
  Building2,
  GraduationCap,
  BookOpen,
  Users,
} from "lucide-react";
import {
  useAgencies,
  useDeleteAgency,
  useToggleAgencyStatus,
} from "@/hooks/agency";
import { toast } from "sonner";
import { Agency } from "@/data/agencies";
import { InstructorStatsCard } from "@/components/instructor-stats-card";
import { AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/auth/useAuth";

// Helper function to validate agency time settings
const validateAgencyTimes = (agency: Agency) => {
  const issues: string[] = [];
  const warnings: string[] = [];

  if (!agency.openingTime) {
    issues.push("Opening time not set");
  }
  if (!agency.closingTime) {
    issues.push("Closing time not set");
  }
  if (!agency.lunchStartTime) {
    warnings.push("Lunch start time not set (defaults will be used)");
  }
  if (!agency.lunchEndTime) {
    warnings.push("Lunch end time not set (defaults will be used)");
  }

  // Validate time relationships if times are set
  if (agency.openingTime && agency.closingTime) {
    const opening = parseTime(agency.openingTime);
    const closing = parseTime(agency.closingTime);
    if (opening && closing) {
      // Handle midnight crossover
      if (closing < opening && closing > 360 && opening < 1200) {
        // Normal case: closing should be after opening
        issues.push("Closing time should be after opening time");
      }
    }
  }

  if (agency.lunchStartTime && agency.lunchEndTime) {
    const lunchStart = parseTime(agency.lunchStartTime);
    const lunchEnd = parseTime(agency.lunchEndTime);
    if (lunchStart && lunchEnd) {
      // Handle midnight crossover
      if (lunchEnd < lunchStart && lunchEnd > 360 && lunchStart < 1200) {
        // Normal case: lunch end should be after lunch start
        issues.push("Lunch end time should be after lunch start time");
      }
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
  };
};

// Helper function to parse time string to minutes
const parseTime = (timeStr: string | undefined): number | null => {
  if (!timeStr) return null;
  const parts = timeStr.split(":");
  if (parts.length < 2) return null;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes)) return null;
  return hours * 60 + minutes;
};

// Helper function to format time for display
const formatTimeDisplay = (timeStr: string | undefined): string => {
  if (!timeStr) return "Not set";
  try {
    const parts = timeStr.split(":");
    if (parts.length < 2) return timeStr;
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return timeStr;
  }
};

// Helper function to check if current user can edit an agency
// User can edit if:
// 1. They are the creator (instructorId matches)
// 2. OR they created any supervisor for that agency
const canEditAgency = (agency: Agency, currentUserId: string | undefined): boolean => {
  if (!currentUserId) return false;
  
  // Check if user is the creator
  if (agency.instructorId === currentUserId) {
    return true;
  }
  
  // Check if user created any supervisor for this agency
  if (agency.supervisors && agency.supervisors.length > 0) {
    return agency.supervisors.some(
      (supervisor) => supervisor.createdByInstructorId === currentUserId
    );
  }
  
  return false;
};

export default function AgenciesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [branchTypeFilter, setBranchTypeFilter] = useState<
    "all" | "Main" | "Branch"
  >("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [agencyToDelete, setAgencyToDelete] = useState<Agency | null>(null);

  // Fetch data - agencies are now shared across all instructors
  const { data: agenciesData, isLoading } = useAgencies({
    search: searchTerm || undefined,
    status: statusFilter,
    branchType: branchTypeFilter,
  });

  // Filter agencies - server handles filtering, client only applies status filter if needed
  const filteredAgencies = useMemo(() => {
    if (!agenciesData?.agencies) return [];

    // Server handles most filtering, but apply status filter on client-side as well for consistency
    return agenciesData.agencies.filter((agency) => {
      // Apply status filter
      if (statusFilter === "all" || statusFilter === "active") {
        // When "all" or "active", only show active agencies (server should already filter this)
        return agency.isActive === true;
      } else if (statusFilter === "inactive") {
        // When "inactive", show inactive agencies (note: archived agencies also have isActive: false)
        return agency.isActive === false;
      }

      return true;
    });
  }, [agenciesData?.agencies, statusFilter]);

  const deleteAgency = useDeleteAgency();
  const toggleStatus = useToggleAgencyStatus();

  const totalAgencies = filteredAgencies.length;
  const activeAgencies = filteredAgencies.filter((a) => a.isActive).length || 0;
  const mainBranches =
    filteredAgencies.filter((a) => a.branchType === "Main").length || 0;

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value as "all" | "active" | "inactive");
  };

  const handleBranchTypeFilter = (value: string) => {
    setBranchTypeFilter(value as "all" | "Main" | "Branch");
  };

  const handleDelete = (agency: Agency) => {
    setAgencyToDelete(agency);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (agencyToDelete) {
      deleteAgency.mutate(agencyToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setAgencyToDelete(null);
        },
      });
    }
  };

  const handleToggleStatus = (agency: Agency) => {
    toggleStatus.mutate({
      id: agency.id,
      isActive: !agency.isActive,
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setBranchTypeFilter("all");
  };

  const hasActiveFilters =
    searchTerm || statusFilter !== "all" || branchTypeFilter !== "all";

  const formatTime = (time?: string) => {
    if (!time) return "N/A";
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Agency Management
          </h1>
          <p className="text-gray-600">
            Manage your practicum agencies and track their progress
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            className="h-11 border border-primary-500 bg-primary-50 px-6 text-primary-700 transition-all duration-300 hover:border-primary-400 hover:bg-primary-50/50 w-full sm:w-auto"
            onClick={() => router.push("/dashboard/instructor/agencies/add")}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Agency
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InstructorStatsCard
          icon={Building2}
          label="Total Agencies"
          value={totalAgencies}
          helperText="All partner organizations"
          isLoading={isLoading}
        />
        <InstructorStatsCard
          icon={GraduationCap}
          label="Active Agencies"
          value={activeAgencies}
          helperText="Currently onboarding students"
          trend={
            activeAgencies > 0
              ? { label: `${activeAgencies} active`, variant: "positive" }
              : undefined
          }
          isLoading={isLoading}
        />
        <InstructorStatsCard
          icon={BookOpen}
          label="Main Branches"
          value={mainBranches}
          helperText="Primary locations"
          isLoading={isLoading}
        />
      </div>

      {/* Agencies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAgencies.map((agency) => (
          <Card key={agency.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{agency.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {agency.branchType}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(
                          `/dashboard/instructor/agencies/${agency.id}`
                        )
                      }
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    {canEditAgency(agency, user?.id) && (
                      <>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/dashboard/instructor/agencies/${agency.id}/edit`
                            )
                          }
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Agency
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(agency)}
                        >
                          {agency.isActive ? (
                            <>
                              <ToggleLeft className="mr-2 h-4 w-4" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <ToggleRight className="mr-2 h-4 w-4" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(agency)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">{agency.branchType}</Badge>
                <Badge variant={agency.isActive ? "default" : "secondary"}>
                  {agency.isActive ? "Active" : "Inactive"}
                </Badge>
                <Badge variant="outline">
                  {agency.supervisors?.length || 0} supervisors
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Official Time Settings */}
              <div className="mt-4 border-t pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <Label className="text-sm font-semibold">
                    Official Time Settings
                  </Label>
                </div>
                {(() => {
                  const validation = validateAgencyTimes(agency);
                  return (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Opening:</span>{" "}
                          <span className="font-medium">
                            {formatTimeDisplay(agency.openingTime)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Closing:</span>{" "}
                          <span className="font-medium">
                            {formatTimeDisplay(agency.closingTime)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Lunch Start:</span>{" "}
                          <span className="font-medium">
                            {formatTimeDisplay(agency.lunchStartTime)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Lunch End:</span>{" "}
                          <span className="font-medium">
                            {formatTimeDisplay(agency.lunchEndTime)}
                          </span>
                        </div>
                      </div>
                      {validation.issues.length > 0 && (
                        <Alert variant="destructive" className="py-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            <div className="font-semibold mb-1">
                              Time Configuration Issues:
                            </div>
                            <ul className="list-disc list-inside space-y-0.5">
                              {validation.issues.map((issue, idx) => (
                                <li key={idx}>{issue}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}
                      {validation.issues.length === 0 &&
                        validation.warnings.length > 0 && (
                          <Alert className="py-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-xs">
                              <div className="font-semibold mb-1">Note:</div>
                              <ul className="list-disc list-inside space-y-0.5">
                                {validation.warnings.map((warning, idx) => (
                                  <li key={idx}>{warning}</li>
                                ))}
                              </ul>
                            </AlertDescription>
                          </Alert>
                        )}
                      {validation.isValid &&
                        validation.warnings.length === 0 && (
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Time settings configured correctly</span>
                          </div>
                        )}
                    </div>
                  );
                })()}
              </div>
              {agency.practicums && agency.practicums.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <Label className="text-sm font-semibold mb-2 block">
                    Trainees ({agency.practicums.length})
                  </Label>
                  <div className="space-y-2">
                    {agency.practicums.map((practicum) => (
                      <div
                        key={practicum.id}
                        className="text-sm p-2 bg-gray-50 rounded"
                      >
                        <div className="font-medium">
                          {practicum.student
                            ? `${practicum.student.firstName} ${practicum.student.lastName}`
                            : `Student ID: ${practicum.studentId}`}
                        </div>
                        {practicum.student && (
                          <div className="text-gray-600 text-xs">
                            {practicum.student.studentId}
                          </div>
                        )}
                        <div className="text-gray-500 text-xs mt-1">
                          {practicum.position} • {practicum.completedHours}/
                          {practicum.totalHours} hours
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Table View */}
      <Card>
        <CardHeader>
          <CardTitle>Agency Details</CardTitle>
          <CardDescription>Overview of all agencies</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredAgencies.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No agencies found</p>
              <Button
                variant="outline"
                onClick={() =>
                  router.push("/dashboard/instructor/agencies/add")
                }
                className="mt-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Agency
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agency Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Trainees</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAgencies.map((agency) => (
                    <TableRow key={agency.id}>
                      <TableCell>
                        <div className="font-medium">{agency.name}</div>
                        <div className="text-sm text-gray-600 truncate max-w-xs">
                          {agency.address}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{agency.branchType}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {agency.contactPerson}
                          </div>
                          <div className="text-gray-500">
                            {agency.contactEmail}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={agency.isActive ? "default" : "secondary"}
                        >
                          {agency.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {agency.practicums && agency.practicums.length > 0 ? (
                          <div className="space-y-1">
                            {agency.practicums.slice(0, 2).map((practicum) => (
                              <div key={practicum.id} className="text-sm">
                                {practicum.student
                                  ? `${practicum.student.firstName} ${practicum.student.lastName}`
                                  : `Student ID: ${practicum.studentId}`}
                              </div>
                            ))}
                            {agency.practicums.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{agency.practicums.length - 2} more
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">No trainees</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(agency.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(
                                  `/dashboard/instructor/agencies/${agency.id}`
                                )
                              }
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {canEditAgency(agency, user?.id) && (
                              <>
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(
                                      `/dashboard/instructor/agencies/${agency.id}/edit`
                                    )
                                  }
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Agency
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleToggleStatus(agency)}
                                >
                                  {agency.isActive ? (
                                    <>
                                      <ToggleLeft className="mr-2 h-4 w-4" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <ToggleRight className="mr-2 h-4 w-4" />
                                      Activate
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(agency)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Agency</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{agencyToDelete?.name}"? This
              action cannot be undone.
              {agencyToDelete?.practicums &&
                agencyToDelete.practicums.length > 0 && (
                  <span className="block mt-2 text-red-600 font-medium">
                    This agency has {agencyToDelete.practicums.length} active
                    practicums and cannot be deleted.
                  </span>
                )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={
                deleteAgency.isPending ||
                (agencyToDelete?.practicums &&
                  agencyToDelete.practicums.length > 0)
              }
            >
              {deleteAgency.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
