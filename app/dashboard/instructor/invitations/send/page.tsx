"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RecipientPicker } from "@/components/invitation/recipient-picker";
import {
  useCreateInvitation,
  useCreateBulkInvitations,
} from "@/hooks/invitation";
import { useDepartments } from "@/hooks/department/useDepartment";
import { useSections } from "@/hooks/section/useSection";
import { useCourses } from "@/hooks/course";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Loader2, ArrowLeft, Users2, Sparkles, MailPlus } from "lucide-react";
import Link from "next/link";

const invitationSchema = z.object({
  role: z.enum(["student", "instructor"]),
  departmentId: z.string().optional(),
  sectionId: z.string().optional(),
  program: z.string().optional(),
});

type InvitationFormData = z.infer<typeof invitationSchema>;

interface Recipient {
  email: string;
  id: string;
}

export default function SendInvitationPage() {
  const router = useRouter();
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [isBulk, setIsBulk] = useState(false);
  const [recipientError, setRecipientError] = useState<string | null>(null);

  const form = useForm<InvitationFormData>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      role: "student",
    },
  });

  const { data: departmentsData } = useDepartments({ status: "active" });
  const selectedDepartmentId = form.watch("departmentId");
  const { data: sectionsData } = useSections({
    courseId: undefined,
    status: "active",
  });
  const { data: coursesData } = useCourses({
    status: "active",
    departmentId: selectedDepartmentId || undefined,
  });

  const createInvitation = useCreateInvitation();
  const createBulkInvitations = useCreateBulkInvitations();

  const role = form.watch("role");
  const filteredSections = sectionsData?.sections?.filter(
    (section: any) =>
      !selectedDepartmentId ||
      section.course?.departmentId === selectedDepartmentId
  );

  const handleRecipientsChange = (updatedRecipients: Recipient[]) => {
    setRecipients(updatedRecipients);
    if (recipientError && updatedRecipients.length > 0) {
      setRecipientError(null);
    }
  };

  const onSubmit = async (data: InvitationFormData) => {
    if (recipients.length === 0) {
      setRecipientError("Add at least one email address before sending.");
      return;
    }
    setRecipientError(null);

    if (data.role === "student" && !data.sectionId) {
      form.setError("sectionId", {
        type: "manual",
        message: "Section is required for student invitations.",
      });
      return;
    }

    if (recipients.length === 1 && !isBulk) {
      await createInvitation.mutateAsync({
        email: recipients[0].email,
        role: data.role,
        departmentId: data.departmentId,
        sectionId: data.sectionId,
        program: data.program,
      });
    } else {
      await createBulkInvitations.mutateAsync({
        emails: recipients.map((r) => r.email),
        role: data.role,
        departmentId: data.departmentId,
        sectionId: data.sectionId,
        program: data.program,
      });
    }

    router.push("/dashboard/instructor/invitations");
  };

  return (
    <div className="">
      <div className="invitation-hero invitation-hero--sub">
        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard/instructor/invitations"
            className="invitation-back-link"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to invitations
          </Link>
          <h1 className="text-3xl font-semibold text-gray-900">
            Send invitations
          </h1>
          <p className="max-w-3xl text-muted-foreground">
            Add individual recipients or paste entire lists, then tailor the
            invite details so new students and instructors can join instantly.
          </p>
        </div>
      </div>

      <div className="invitation-content invitation-content--form">
        <div className="invitation-form-grid">
          <Card className="invitation-form-card">
            <CardHeader className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Step 1</p>
                <CardTitle className="text-2xl">Compose invitation</CardTitle>
                <CardDescription>
                  Define recipients, roles, and academic context.
                </CardDescription>
              </div>
              {/* <div className="invitation-bulk-toggle">
                <div>
                  <p className="font-medium text-foreground">Bulk sending</p>
                  <p className="text-sm text-muted-foreground">
                    Enable when adding multiple addresses to avoid rate limits.
                  </p>
                </div>
                <Switch checked={isBulk} onCheckedChange={setIsBulk} />
              </div> */}
            </CardHeader>
            <CardContent>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Recipients</Label>
                    <Badge variant="secondary" className="invitation-pill">
                      {recipients.length} added
                    </Badge>
                  </div>
                  <RecipientPicker
                    recipients={recipients}
                    onRecipientsChange={handleRecipientsChange}
                    placeholder="Type email addresses and press Enter..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Tip: Paste comma-separated addresses for faster entry.
                  </p>
                  {recipientError && (
                    <p className="text-sm text-red-600">{recipientError}</p>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={form.watch("role")}
                      onValueChange={(value) =>
                        form.setValue("role", value as any)
                      }
                    >
                      <SelectTrigger className="invitation-select-trigger">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="instructor">Instructor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {role === "student" && (
                    <div className="space-y-2">
                      <Label htmlFor="departmentId">
                        Department (optional)
                      </Label>
                      <Select
                        value={form.watch("departmentId") ?? undefined}
                        onValueChange={(value) =>
                          form.setValue(
                            "departmentId",
                            value === "__none" ? undefined : value
                          )
                        }
                      >
                        <SelectTrigger className="invitation-select-trigger">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none">None</SelectItem>
                          {departmentsData?.departments?.map((dept: any) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {role === "student" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="sectionId">Section *</Label>
                      <Select
                        value={form.watch("sectionId") ?? undefined}
                        onValueChange={(value) =>
                          form.setValue("sectionId", value)
                        }
                      >
                        <SelectTrigger className="invitation-select-trigger">
                          <SelectValue placeholder="Select section" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredSections && filteredSections.length > 0 ? (
                            filteredSections.map((section: any) => (
                              <SelectItem key={section.id} value={section.id}>
                                {section.name} • {section.course?.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="__no_sections" disabled>
                              No sections available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.sectionId && (
                        <p className="text-sm text-red-600">
                          {form.formState.errors.sectionId.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="program">Program (optional)</Label>
                      <Select
                        value={form.watch("program") ?? undefined}
                        onValueChange={(value) =>
                          form.setValue(
                            "program",
                            value === "__none" ? undefined : value
                          )
                        }
                      >
                        <SelectTrigger className="invitation-select-trigger">
                          <SelectValue placeholder="Select program" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none">None</SelectItem>
                          {coursesData?.courses?.map((course: any) => (
                            <SelectItem key={course.id} value={course.code}>
                              {course.code} - {course.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <div className="invitation-action-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="invitation-back-btn"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      createInvitation.isPending ||
                      createBulkInvitations.isPending
                    }
                    className="invitation-primary-btn"
                  >
                    {createInvitation.isPending ||
                    createBulkInvitations.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send invitation(s)
                        <MailPlus className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
