"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
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
  phone: z
    .string()
    .regex(
      /^\+63\d{10}$/,
      "Phone number must be in format +63XXXXXXXXXX (10 digits after +63)"
    ),
  sex: z.enum(["male", "female"]),
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
  const {
    user,
    isLoading: isUserLoading,
    error: authError,
    refetch: refetchUser,
  } = useAuth();
  const isAuthenticated = !!user;
  const queryClient = useQueryClient();
  const currentStep = parseInt(searchParams.get("step") || "1", 10);
  const [step, setStep] = useState(currentStep);
  const [loading, setLoading] = useState(false);
  const [authRetryCount, setAuthRetryCount] = useState(0);
  const [showAuthError, setShowAuthError] = useState(false);

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

  // Handle phone number input with +63 prefix
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-digits
    if (value.length <= 10) {
      profileForm.setValue("phone", value ? `+63${value}` : "", { shouldValidate: true });
    }
  };

  const phoneValue = profileForm.watch("phone")?.replace("+63", "") || "";

  // Fetch agencies - backend will automatically filter by the student's instructor
  // (from their enrollment section) if the user is a student
  const { data: agenciesData, isLoading: agenciesLoading } = useAgencies(
    {
      status: "active",
    },
    { enabled: isAuthenticated }
  );

  // Agencies are already filtered by the backend based on the student's instructor
  // (from their enrollment section)
  const filteredAgencies = useMemo(() => {
    if (!agenciesData?.agencies) return [];
    return agenciesData.agencies;
  }, [agenciesData?.agencies]);

  const completeOnboarding = async () => {
    await queryClient.invalidateQueries({ queryKey: ["user"] });
    toast.success("Onboarding completed successfully!");
    router.replace("/dashboard/student");
  };

  const onProfileSubmit = async (data: ProfileFormData) => {
    if (!user?.id) return;

    setLoading(true);
    try {
      await api.put(`/student/${user.id}`, {
        age: data.age,
        phone: data.phone,
        gender: data.sex,
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
      // If we're on step 1, we need to save the profile first before completing onboarding
      if (step === 1) {
        const profileData = profileForm.getValues();
        const isValid = await profileForm.trigger();
        
        if (!isValid) {
          toast.error("Please fill in all required fields");
          setLoading(false);
          return;
        }

        if (!user?.id) {
          toast.error("User not found");
          setLoading(false);
          return;
        }

        // Save profile data first
        await api.put(`/student/${user.id}`, {
          age: profileData.age,
          phone: profileData.phone,
          gender: profileData.sex,
          studentId: profileData.studentId,
        });
      }

      // Then complete onboarding
      await completeOnboarding();
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || "Failed to complete onboarding"
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedAgency = filteredAgencies?.find(
    (a) => a.id === agencyForm.watch("agencyId")
  );

  // Sync step state with URL params when they change
  useEffect(() => {
    const urlStep = parseInt(searchParams.get("step") || "1", 10);
    if (urlStep !== step && (urlStep === 1 || urlStep === 2)) {
      setStep(urlStep);
    }
  }, [searchParams, step]);

  // Retry authentication with delay to allow cookies to sync after OAuth redirect
  useEffect(() => {
    if (isUserLoading) return;

    // Check if error is a 401 (authentication error)
    // The error from useAuth is an Error object, so we check the message
    const errorMessage = authError?.message || "";
    const errorName = (authError as any)?.name || "";
    const isAuthError =
      authError &&
      (errorName === "UnauthorizedError" ||
        errorMessage.includes("Unauthorized") ||
        errorMessage.includes("login") ||
        errorMessage.includes("401") ||
        errorMessage.includes("Please login") ||
        errorMessage.includes("Please login to access"));

    // If we have an auth error and haven't retried yet, wait a bit and retry
    if (isAuthError && !user && authRetryCount < 3) {
      const delay = authRetryCount === 0 ? 500 : 1000 * authRetryCount; // First retry after 500ms, then 1s, 2s
      const timer = setTimeout(async () => {
        console.log(
          `[Onboarding] Retrying authentication (attempt ${
            authRetryCount + 1
          }/3)...`
        );
        setAuthRetryCount((prev) => prev + 1);
        try {
          await refetchUser();
        } catch (err) {
          console.error("[Onboarding] Auth retry failed:", err);
        }
      }, delay);

      return () => clearTimeout(timer);
    }

    // If we've exhausted retries or have a persistent error, show error
    if (isAuthError && !user && authRetryCount >= 3) {
      setShowAuthError(true);
    }

    // If no user after retries and not an auth error, redirect to login immediately
    if (!user && !isUserLoading && !isAuthError) {
      router.replace("/login/student?redirect=/onboarding/student");
    }
  }, [isUserLoading, user, authError, authRetryCount, refetchUser, router]);

  const firstName =
    (user as any)?.firstName || (user as any)?.name?.split(" ")[0] || "there";

  // Show loading state while checking authentication
  if (isUserLoading || (!user && authRetryCount < 3)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">
            {authRetryCount > 0
              ? `Connecting... (${authRetryCount}/3)`
              : "Loading your profile..."}
          </p>
        </div>
      </div>
    );
  }

  // Show error state if authentication failed after retries
  if (showAuthError || (authError && !user && authRetryCount >= 3)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <span className="text-2xl text-yellow-600">!</span>
              </div>
            </div>
            <CardTitle>Sign-in Error</CardTitle>
            <CardDescription>
              Something went wrong while signing you in. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              This might happen if your session expired or cookies couldn't be
              set properly.
            </p>
            <div className="flex flex-col gap-3">
              <Button
                onClick={async () => {
                  setAuthRetryCount(0);
                  setShowAuthError(false);
                  await refetchUser();
                }}
                className="w-full"
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  router.push("/login/student?redirect=/onboarding/student")
                }
                className="w-full"
              >
                Back to Sign-in Options
              </Button>
            </div>
            <div className="text-center pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Need help? Email{" "}
                <a
                  href="mailto:tracesys2025@gmail.com"
                  className="text-primary hover:underline"
                >
                  tracesys2025@gmail.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If no user and not loading, redirect to login
  if (!user) {
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
                      <Controller
                        control={profileForm.control}
                        name="age"
                        render={({ field }) => (
                          <Input
                            id="age"
                            type="number"
                            inputMode="numeric"
                            step="1"
                            min={20}
                            max={80}
                            value={field.value ?? ""}
                            onBlur={field.onBlur}
                            ref={field.ref}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === "" || /^\d+$/.test(value)) {
                                const parsed =
                                  value === ""
                                    ? undefined
                                    : parseInt(value, 10);
                                field.onChange(parsed);
                              }
                            }}
                          />
                        )}
                      />
                      {profileForm.formState.errors.age && (
                        <p className="text-sm text-red-600">
                          {profileForm.formState.errors.age.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sex">Sex</Label>
                      <Select
                        value={profileForm.watch("sex") ?? undefined}
                        onValueChange={(value) =>
                          profileForm.setValue(
                            "sex",
                            value as ProfileFormData["sex"]
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select sex" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      {profileForm.formState.errors.sex && (
                        <p className="text-sm text-red-600">
                          {profileForm.formState.errors.sex.message}
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
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                          +63
                        </span>
                        <Input
                          id="phone"
                          inputMode="numeric"
                          placeholder="9123456789"
                          className="pl-12"
                          value={phoneValue}
                          onChange={handlePhoneChange}
                          maxLength={10}
                        />
                      </div>
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
                          ) : filteredAgencies.length === 0 ? (
                            <SelectItem value="no-agencies" disabled>
                              No agencies available
                            </SelectItem>
                          ) : (
                            filteredAgencies.map((agency) => (
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
