"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAgencies } from "@/hooks/agency/useAgency";
import { useAuth } from "@/hooks/auth/useAuth";
import api from "@/lib/api";
import { toast } from "sonner";
import { ArrowRight, Building2, CheckCircle2, Loader2 } from "lucide-react";

const profileSchema = z.object({
  age: z
    .number()
    .min(20, "Age must be at least 20")
    .max(80, "Age must be at most 80"),
  phone: z.string().min(10),
  gender: z.enum(["male", "female", "other"]),
  studentId: z.string().min(1, "Student ID is required"),
});

const agencySchema = z
  .object({
    agencyId: z.string().optional(),
    supervisorId: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })
  .refine(
    (data) => {
      // If any required agency field (agencyId, startDate, endDate) is provided,
      // all required fields must be provided. Supervisor is always optional.
      const hasRequiredFields = data.agencyId || data.startDate || data.endDate;
      if (hasRequiredFields) {
        return !!(data.agencyId && data.startDate && data.endDate);
      }
      return true;
    },
    {
      message:
        "Please fill in agency, start date, and end date, or leave them all empty",
      path: ["agencyId"],
    }
  );

type ProfileFormData = z.infer<typeof profileSchema>;
type AgencyFormData = z.infer<typeof agencySchema>;

function StudentOnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: isUserLoading } = useAuth();
  const isAuthenticated = !!user;
  const queryClient = useQueryClient();
  const currentStep = parseInt(searchParams.get("step") || "1", 10);
  const [step, setStep] = useState(currentStep);
  const [loading, setLoading] = useState(false);

  const updateStep = (newStep: number) => {
    setStep(newStep);
    const url = new URL(window.location.href);
    url.searchParams.set("step", newStep.toString());
    router.replace(url.pathname + url.search, { scroll: false });
  };

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const agencyForm = useForm<AgencyFormData>({
    resolver: zodResolver(agencySchema),
  });

  const { data: agenciesData, isLoading: agenciesLoading } = useAgencies(
    {
      status: "active",
    },
    { enabled: isAuthenticated }
  );

  const completeOnboarding = async () => {
    await queryClient.invalidateQueries({ queryKey: ["user"] });
    toast.success("Onboarding completed successfully!");
    router.push("/dashboard/student");
  };

  const onProfileSubmit = async (data: ProfileFormData) => {
    if (!user?.id) return;

    setLoading(true);
    try {
      await api.put(`/student/${user.id}`, {
        age: data.age,
        phone: data.phone,
        gender: data.gender,
        studentId: data.studentId,
      });

      toast.success("Profile updated successfully");
      updateStep(2);
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || "Failed to update profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const onAgencySubmit = async (data: AgencyFormData) => {
    setLoading(true);
    try {
      // Only create practicum if required fields are provided (supervisor is optional)
      // Note: Work setup is always "On-site" for all practicums
      if (data.agencyId && data.startDate && data.endDate) {
        await api.post("/practicum/", {
          agencyId: data.agencyId,
          ...(data.supervisorId && { supervisorId: data.supervisorId }),
          startDate: data.startDate,
          endDate: data.endDate,
          position: "Student Intern",
          totalHours: 400,
          workSetup: "On-site", // Always "On-site" - no other options allowed
        });
        toast.success("Agency placement added successfully!");
      }

      // Complete onboarding regardless of whether practicum was created
      await completeOnboarding();
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || "Failed to create practicum"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkipAgency = async () => {
    setLoading(true);
    try {
      await completeOnboarding();
    } catch (error: any) {
      toast.error("Failed to complete onboarding");
    } finally {
      setLoading(false);
    }
  };

  const selectedAgency = agenciesData?.agencies?.find(
    (a) => a.id === agencyForm.watch("agencyId")
  );

  // Sync step state with URL params when they change
  useEffect(() => {
    const urlStep = parseInt(searchParams.get("step") || "1", 10);
    if (urlStep !== step && (urlStep === 1 || urlStep === 2)) {
      setStep(urlStep);
    }
  }, [searchParams, step]);

  useEffect(() => {
    if (isUserLoading) return;
    if (!user) {
      router.replace("/login/student");
    }
  }, [isUserLoading, user, router]);

  const firstName =
    (user as any)?.firstName || (user as any)?.name?.split(" ")[0] || "there";

  if (isUserLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 md:px-8 lg:px-16 py-8">
        <div className="invitation-hero">
          <div className="space-y-3">
            <p className="invitation-eyebrow">Student onboarding</p>
            <h1 className="text-3xl font-semibold text-gray-900">
              Finish your practicum setup, {firstName}
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              Complete your profile to get started. You can optionally add your
              practicum agency later.
            </p>
          </div>
        </div>

        <div className="invitation-content mt-8">
          <Card className="invitation-card max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>
                {step === 1 ? "Personal Details" : "Agency Placement"}
              </CardTitle>
              <CardDescription>
                {step === 1
                  ? "Tell us about yourself to personalize your dashboard."
                  : "Optionally choose your practicum partner and timeline. You can skip this and add it later."}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {step === 1 ? (
                <form
                  onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                  className="space-y-6"
                >
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        min={20}
                        max={80}
                        inputMode="numeric"
                        onKeyDown={(e) => {
                          // Prevent non-numeric keys except backspace, delete, tab, escape, enter, and arrow keys
                          if (
                            !/[0-9]/.test(e.key) &&
                            ![
                              "Backspace",
                              "Delete",
                              "Tab",
                              "Escape",
                              "Enter",
                              "ArrowLeft",
                              "ArrowRight",
                              "ArrowUp",
                              "ArrowDown",
                            ].includes(e.key) &&
                            !(e.ctrlKey || e.metaKey) // Allow Ctrl/Cmd combinations
                          ) {
                            e.preventDefault();
                          }
                        }}
                        onInput={(e) => {
                          // Ensure value stays within bounds
                          const target = e.target as HTMLInputElement;
                          const value = parseInt(target.value, 10);
                          if (target.value && !isNaN(value)) {
                            if (value < 20) {
                              target.value = "20";
                            } else if (value > 80) {
                              target.value = "80";
                            }
                          }
                        }}
                        {...profileForm.register("age", {
                          valueAsNumber: true,
                        })}
                      />
                      {profileForm.formState.errors.age && (
                        <p className="text-sm text-red-600">
                          {profileForm.formState.errors.age.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={profileForm.watch("gender") ?? undefined}
                        onValueChange={(value) =>
                          profileForm.setValue(
                            "gender",
                            value as ProfileFormData["gender"]
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {profileForm.formState.errors.gender && (
                        <p className="text-sm text-red-600">
                          {profileForm.formState.errors.gender.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="studentId">Student ID *</Label>
                      <Input
                        id="studentId"
                        autoComplete="off"
                        required
                        {...profileForm.register("studentId")}
                      />
                      {profileForm.formState.errors.studentId && (
                        <p className="text-sm text-red-600">
                          {profileForm.formState.errors.studentId.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        inputMode="tel"
                        placeholder="+63 9XX XXX XXXX"
                        {...profileForm.register("phone")}
                      />
                      {profileForm.formState.errors.phone && (
                        <p className="text-sm text-red-600">
                          {profileForm.formState.errors.phone.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSkipAgency}
                      disabled={loading}
                      className="w-full sm:w-auto"
                    >
                      Complete without agency
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="invitation-primary-btn w-full sm:w-auto"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving profile...
                        </>
                      ) : (
                        <>
                          Continue to agency selection
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <form
                  onSubmit={agencyForm.handleSubmit(onAgencySubmit)}
                  className="space-y-6"
                >
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="agencyId">Select agency (Optional)</Label>
                      <Select
                        value={agencyForm.watch("agencyId") ?? undefined}
                        onValueChange={(value) =>
                          agencyForm.setValue("agencyId", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose your practicum partner (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {agenciesLoading ? (
                            <SelectItem value="loading" disabled>
                              Loading...
                            </SelectItem>
                          ) : (
                            agenciesData?.agencies?.map((agency) => (
                              <SelectItem key={agency.id} value={agency.id}>
                                {agency.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {agencyForm.formState.errors.agencyId && (
                        <p className="text-sm text-red-600">
                          {agencyForm.formState.errors.agencyId.message}
                        </p>
                      )}
                    </div>

                    {selectedAgency && (
                      <div className="rounded-2xl border border-primary-100 bg-primary-50/40 p-4">
                        <div className="flex items-start gap-3">
                          <Building2 className="h-5 w-5 text-primary-600 mt-0.5" />
                          <div className="space-y-2 flex-1">
                            <p className="font-medium text-foreground">
                              {selectedAgency.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {selectedAgency.address ||
                                "Address pending confirmation"}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="secondary">
                                400 hrs requirement
                              </Badge>
                              <Badge variant="outline">On-site setup</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedAgency && (
                      <div className="space-y-2">
                        <Label htmlFor="supervisorId">
                          Supervisor (Optional)
                        </Label>
                        <Select
                          value={agencyForm.watch("supervisorId") ?? undefined}
                          onValueChange={(value) =>
                            agencyForm.setValue("supervisorId", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a supervisor (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedAgency.supervisors &&
                            selectedAgency.supervisors.length > 0 ? (
                              selectedAgency.supervisors.map((supervisor) => (
                                <SelectItem
                                  key={supervisor.id}
                                  value={supervisor.id}
                                >
                                  {supervisor.name} • {supervisor.position}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="none" disabled>
                                No supervisors available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        {agencyForm.formState.errors.supervisorId && (
                          <p className="text-sm text-red-600">
                            {agencyForm.formState.errors.supervisorId.message}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start date (Optional)</Label>
                        <Input
                          id="startDate"
                          type="date"
                          {...agencyForm.register("startDate")}
                        />
                        {agencyForm.formState.errors.startDate && (
                          <p className="text-sm text-red-600">
                            {agencyForm.formState.errors.startDate.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="endDate">End date (Optional)</Label>
                        <Input
                          id="endDate"
                          type="date"
                          {...agencyForm.register("endDate")}
                        />
                        {agencyForm.formState.errors.endDate && (
                          <p className="text-sm text-red-600">
                            {agencyForm.formState.errors.endDate.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => updateStep(1)}
                      className="flex-1 sm:flex-initial"
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSkipAgency}
                      disabled={loading}
                      className="flex-1 sm:flex-initial"
                    >
                      Skip agency
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="invitation-primary-btn flex-1 sm:flex-initial"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Completing...
                        </>
                      ) : (
                        <>
                          Complete onboarding
                          <CheckCircle2 className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function StudentOnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <StudentOnboardingContent />
    </Suspense>
  );
}
