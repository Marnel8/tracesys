"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useGetInvitations, useDeleteInvitation } from "@/hooks/invitation";
import { useDebounce } from "@/hooks/useDebounce";
import { Inbox, Loader2, MailPlus, Search, Trash2 } from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type InvitationStatus = "all" | "pending" | "used" | "expired";

export default function InvitationsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<InvitationStatus>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState<{
    id: string;
    email: string;
  } | null>(null);
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { data, isLoading, isFetching } = useGetInvitations({
    status: statusFilter,
    search: debouncedSearch || undefined,
  });
  const invitations = data?.invitations ?? [];
  const isTableLoading = isLoading || isFetching;
  const deleteMutation = useDeleteInvitation();

  const handleDeleteClick = (invitation: any) => {
    setSelectedInvitation({
      id: invitation.id,
      email: invitation.email,
    });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedInvitation) return;

    try {
      await deleteMutation.mutateAsync(selectedInvitation.id);
      setDeleteDialogOpen(false);
      setSelectedInvitation(null);
    } catch (error) {
      console.error("Failed to delete invitation", error);
    }
  };

  const handleDialogChange = (open: boolean) => {
    setDeleteDialogOpen(open);
    if (!open) {
      setSelectedInvitation(null);
    }
  };

  const getStatusBadge = (invitation: any) => {
    const now = new Date();
    const expiresAt = new Date(invitation.expiresAt);
    const usedAt = invitation.usedAt ? new Date(invitation.usedAt) : null;

    if (usedAt) {
      return <Badge variant="secondary">Used</Badge>;
    }
    if (now > expiresAt) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    return <Badge variant="default">Pending</Badge>;
  };

  return (
    <div>
      <div className="invitation-hero">
        <div className="space-y-3">
          <p className="invitation-eyebrow">Instructor tools</p>
          <h1 className="text-3xl font-semibold leading-tight text-gray-900">
            Streamline your invitations
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl">
            Track pending invites, see who already registered, and resend any
            expiring links before practicum assignments begin.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            variant="secondary"
            className="h-11 border border-primary-500 bg-primary-50 px-6 text-primary-700 transition-all duration-300 hover:border-primary-400 hover:bg-primary-50/50 w-full sm:w-auto"
            onClick={() =>
              router.push("/dashboard/instructor/invitations/send")
            }
          >
            <MailPlus className="mr-2 h-4 w-4" />
            Send new invitation
          </Button>
        </div>
      </div>
      <div className="invitation-content">
        <Card className="invitation-card">
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-2xl">All invitations</CardTitle>
                <CardDescription>
                  {isTableLoading
                    ? "Loading invitations..."
                    : `${data?.total ?? 0} record(s)`}
                </CardDescription>
              </div>
              <div className="invitation-filter-group">
                <div className="invitation-search">
                  <Search className="invitation-search-icon" />
                  <Input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search Gmail or email..."
                    className="invitation-search-control"
                  />
                </div>
                <div className="invitation-select-group">
                  <Select
                    value={statusFilter}
                    onValueChange={(value: InvitationStatus) =>
                      setStatusFilter(value)
                    }
                  >
                    <SelectTrigger className="invitation-select-trigger">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="used">Used</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isTableLoading ? (
              <div className="invitation-loader">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : invitations.length > 0 ? (
              <div className="invitation-table-wrapper">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invitations.map((invitation: any) => (
                      <TableRow key={invitation.id}>
                        <TableCell className="font-medium">
                          {invitation.email}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="invitation-role-pill"
                          >
                            {invitation.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {invitation.department?.name || (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {invitation.section?.name || (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(invitation)}</TableCell>
                        <TableCell>
                          {format(
                            new Date(invitation.expiresAt),
                            "MMM dd, yyyy"
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {!invitation.usedAt && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="invitation-delete-btn"
                              onClick={() => handleDeleteClick(invitation)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="invitation-empty-state">
                <div className="invitation-empty-icon">
                  <Inbox className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  No invitations found
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Start by sending a new invitation to your students or fellow
                  instructors. You can track every status here afterwards.
                </p>
                <Button
                  className="invitation-primary-btn"
                  onClick={() =>
                    router.push("/dashboard/instructor/invitations/send")
                  }
                >
                  <MailPlus className="mr-2 h-4 w-4" />
                  Create your first invite
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <AlertDialog open={deleteDialogOpen} onOpenChange={handleDialogChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Delete invitation
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedInvitation
                ? `You're about to delete the invitation sent to ${selectedInvitation.email}. This action cannot be undone.`
                : "This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete invitation"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
