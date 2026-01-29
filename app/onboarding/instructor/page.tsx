"use client";

import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";
import { useAuth } from "@/hooks/auth/useAuth";
import { toast } from "sonner";
import {
  CheckCircle2,
  Loader2,
} from "lucide-react";

const profileSchema = z.object({
  age: z.number().min(1).max(120),
  phone: z
    .string()
    .regex(
      /^\+63\d{10}$/,
      "Phone number must be in format +63XXXXXXXXXX (10 digits after +63)"
    ),
  gender: z.enum(["male", "female", "other"]),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function InstructorOnboardingPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  // Handle phone number input with +63 prefix
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-digits
    if (value.length <= 10) {
      form.setValue("phone", value ? `+63${value}` : "", { shouldValidate: true });
    }
  };

  const phoneValue = form.watch("phone")?.replace("+63", "") || "";

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login/instructor");
    }
  }, [isLoading, user, router]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user?.id) return;

    setLoading(true);
    try {
      await api.put(`/user/${user.id}`, {
        age: data.age,
        phone: data.phone,
        gender: data.gender,
      });

      toast.success("Profile completed successfully!");
      router.push("/dashboard/instructor");
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || "Failed to update profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const firstName =
    (user as any)?.firstName ||
    (user as any)?.name?.split(" ")[0] ||
    "there";

  if (isLoading || !user) {
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
            <p className="invitation-eyebrow">Instructor onboarding</p>
            <h1 className="text-3xl font-semibold text-gray-900">
              Welcome aboard, {firstName}
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              Complete your profile to start inviting students, tracking submissions, and managing practicum activities.
            </p>
          </div>
        </div>

        <div className="invitation-content mt-8">
          <Card className="invitation-card max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Provide your contact details to complete your account setup.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    min={1}
                    inputMode="numeric"
                    {...form.register("age", { valueAsNumber: true })}
                  />
                  {form.formState.errors.age && (
                    <p className="text-sm text-red-600">
                      {form.formState.errors.age.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={form.watch("gender") ?? undefined}
                    onValueChange={(value) =>
                      form.setValue(
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
                  {form.formState.errors.gender && (
                    <p className="text-sm text-red-600">
                      {form.formState.errors.gender.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
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
                  {form.formState.errors.phone && (
                    <p className="text-sm text-red-600">
                      {form.formState.errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="invitation-primary-btn w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Complete profile
                    <CheckCircle2 className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
