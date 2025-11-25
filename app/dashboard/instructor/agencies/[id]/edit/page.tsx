"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Building2,
  Save,
  X,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import {
  useAgency,
  useUpdateAgency,
  useSupervisors,
  useCreateSupervisor,
  useUpdateSupervisor,
  useDeleteSupervisor,
} from "@/hooks/agency";
import { AgencyFormData } from "@/data/agencies";
import { BRANCH_TYPE_OPTIONS } from "@/data/agencies";
import { toast } from "sonner";

const agencySchema = z.object({
  name: z.string().min(2, "Agency name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  contactPerson: z
    .string()
    .min(2, "Contact person name must be at least 2 characters"),
  contactRole: z.string().min(2, "Contact role must be at least 2 characters"),
  contactPhone: z.string().min(10, "Phone number must be at least 10 digits"),
  contactEmail: z.string().email("Please enter a valid email address"),
  branchType: z.enum(["Main", "Branch"], {
    required_error: "Please select a branch type",
  }),
  openingTime: z.string().optional(),
  closingTime: z.string().optional(),
  operatingDays: z.string().optional(),
  lunchStartTime: z.string().optional(),
  lunchEndTime: z.string().optional(),
  isActive: z.boolean(),
  latitude: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined || isNaN(Number(val))
        ? undefined
        : Number(val),
    z
      .number()
      .min(-90, "Latitude must be between -90 and 90")
      .max(90, "Latitude must be between -90 and 90")
      .optional()
  ),
  longitude: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined || isNaN(Number(val))
        ? undefined
        : Number(val),
    z
      .number()
      .min(-180, "Longitude must be between -180 and 180")
      .max(180, "Longitude must be between -180 and 180")
      .optional()
  ),
});

const DAYS_OF_WEEK = [
  { value: "Monday", label: "Monday" },
  { value: "Tuesday", label: "Tuesday" },
  { value: "Wednesday", label: "Wednesday" },
  { value: "Thursday", label: "Thursday" },
  { value: "Friday", label: "Friday" },
  { value: "Saturday", label: "Saturday" },
  { value: "Sunday", label: "Sunday" },
];

type AgencyForm = z.infer<typeof agencySchema>;

export default function EditAgencyPage() {
  const router = useRouter();
  const params = useParams();
  const agencyId = params.id as string;

  const { data: agency, isLoading, error } = useAgency(agencyId);
  const { data: supervisorsData } = useSupervisors(agencyId || "", {});
  const updateAgencyMutation = useUpdateAgency();
  const createSupervisorMutation = useCreateSupervisor();
  const updateSupervisorMutation = useUpdateSupervisor();
  const deleteSupervisorMutation = useDeleteSupervisor();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AgencyForm>({
    // @ts-expect-error - zodResolver has type inference issues with z.preprocess
    resolver: zodResolver(agencySchema),
    defaultValues: {
      name: "",
      address: "",
      contactPerson: "",
      contactRole: "",
      contactPhone: "",
      contactEmail: "",
      branchType: "Main",
      openingTime: "",
      closingTime: "",
      operatingDays: "",
      lunchStartTime: "",
      lunchEndTime: "",
      isActive: true,
      latitude: undefined,
      longitude: undefined,
    },
  });

  const handleDayToggle = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // Update form when agency data is loaded
  useEffect(() => {
    if (agency) {
      reset({
        name: agency.name,
        address: agency.address,
        contactPerson: agency.contactPerson,
        contactRole: agency.contactRole,
        contactPhone: agency.contactPhone,
        contactEmail: agency.contactEmail,
        branchType: agency.branchType,
        openingTime: agency.openingTime || "",
        closingTime: agency.closingTime || "",
        operatingDays: agency.operatingDays || "",
        lunchStartTime: agency.lunchStartTime || "",
        lunchEndTime: agency.lunchEndTime || "",
        isActive: agency.isActive,
        latitude: agency.latitude,
        longitude: agency.longitude,
      });
      if (agency.operatingDays) {
        setSelectedDays(agency.operatingDays.split(","));
      }
    }
  }, [agency, reset]);

  const onSubmit = async (data: AgencyForm) => {
    setIsSubmitting(true);
    try {
      const formData: Partial<AgencyFormData> = {
        ...data,
        openingTime: data.openingTime || undefined,
        closingTime: data.closingTime || undefined,
        operatingDays:
          selectedDays.length > 0 ? selectedDays.join(",") : undefined,
        lunchStartTime: data.lunchStartTime || undefined,
        lunchEndTime: data.lunchEndTime || undefined,
      };

      await updateAgencyMutation.mutateAsync({
        id: agencyId,
        data: formData,
      });
      router.push("/dashboard/instructor/agencies");
    } catch (error) {
      // Error is handled by the mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">
            Loading agency details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Error loading agency
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {error instanceof Error ? error.message : "Something went wrong"}
          </p>
          <div className="mt-6">
            <Button
              onClick={() => router.push("/dashboard/instructor/agencies")}
            >
              Back to Agencies
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Agency not found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            The agency you're looking for doesn't exist.
          </p>
          <div className="mt-6">
            <Button
              onClick={() => router.push("/dashboard/instructor/agencies")}
            >
              Back to Agencies
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={handleCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Agency</h1>
          <p className="text-gray-600">
            Update agency information and settings
          </p>
        </div>
      </div>

      <form
        // @ts-expect-error - handleSubmit type inference issue with zodResolver and z.preprocess
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agency Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Agency Information</CardTitle>
                <CardDescription>
                  Basic agency details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Agency Name *</Label>
                    <Input
                      id="name"
                      {...register("name")}
                      placeholder="e.g., San Jose General Hospital"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="branchType">Branch Type *</Label>
                    <Controller
                      name="branchType"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select branch type" />
                          </SelectTrigger>
                          <SelectContent>
                            {BRANCH_TYPE_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.branchType && (
                      <p className="text-sm text-red-600">
                        {errors.branchType.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    {...register("address")}
                    placeholder="Enter complete agency address"
                    rows={3}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-600">
                      {errors.address.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Enter the primary contact person details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person *</Label>
                    <Input
                      id="contactPerson"
                      {...register("contactPerson")}
                      placeholder="Enter contact person name"
                    />
                    {errors.contactPerson && (
                      <p className="text-sm text-red-600">
                        {errors.contactPerson.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactRole">Role/Position *</Label>
                    <Input
                      id="contactRole"
                      {...register("contactRole")}
                      placeholder="Enter role or position"
                    />
                    {errors.contactRole && (
                      <p className="text-sm text-red-600">
                        {errors.contactRole.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Phone Number *</Label>
                    <Input
                      id="contactPhone"
                      {...register("contactPhone")}
                      placeholder="Enter phone number"
                    />
                    {errors.contactPhone && (
                      <p className="text-sm text-red-600">
                        {errors.contactPhone.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email Address *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      {...register("contactEmail")}
                      placeholder="Enter email address"
                    />
                    {errors.contactEmail && (
                      <p className="text-sm text-red-600">
                        {errors.contactEmail.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Agency Settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Agency Settings</CardTitle>
                <CardDescription>
                  Configure agency status and availability
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="isActive"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor="isActive">Active Agency</Label>
                </div>
                <p className="text-sm text-gray-500">
                  Active agencies are available for practicum placements.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Agency Details</CardTitle>
                <CardDescription>Current agency information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Created:</span>
                  <span>{new Date(agency.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Updated:</span>
                  <span>{new Date(agency.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Supervisors:</span>
                  <span>{agency.supervisors?.length || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Operating Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Operating Hours</CardTitle>
            <CardDescription>
              Enter the agency's operating hours and days (optional)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Operating Days</Label>
              <div className="flex flex-wrap gap-3">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${day.value}`}
                      checked={selectedDays.includes(day.value)}
                      onCheckedChange={() => handleDayToggle(day.value)}
                    />
                    <Label
                      htmlFor={`day-${day.value}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {day.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="openingTime">Opening Time</Label>
                <Input
                  id="openingTime"
                  type="time"
                  {...register("openingTime")}
                />
                {errors.openingTime && (
                  <p className="text-sm text-red-600">
                    {errors.openingTime.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="closingTime">Closing Time</Label>
                <Input
                  id="closingTime"
                  type="time"
                  {...register("closingTime")}
                />
                {errors.closingTime && (
                  <p className="text-sm text-red-600">
                    {errors.closingTime.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lunchStartTime">
                  Lunch Start Time (for DTR)
                </Label>
                <Input
                  id="lunchStartTime"
                  type="time"
                  {...register("lunchStartTime")}
                />
                {errors.lunchStartTime && (
                  <p className="text-sm text-red-600">
                    {errors.lunchStartTime.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lunchEndTime">Lunch End Time (for DTR)</Label>
                <Input
                  id="lunchEndTime"
                  type="time"
                  {...register("lunchEndTime")}
                />
                {errors.lunchEndTime && (
                  <p className="text-sm text-red-600">
                    {errors.lunchEndTime.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Coordinates */}
        <Card>
          <CardHeader>
            <CardTitle>Location Coordinates</CardTitle>
            <CardDescription>
              Enter the exact GPS coordinates for precise location tracking
              (optional)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  {...register("latitude", {
                    valueAsNumber: true,
                    setValueAs: (v: string) =>
                      v === "" || isNaN(Number(v)) ? undefined : Number(v),
                  })}
                  placeholder="e.g., 12.3601"
                />
                {errors.latitude && (
                  <p className="text-sm text-red-600">
                    {errors.latitude.message}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Range: -90 to 90 (e.g., 12.3601 for San Jose, Occidental
                  Mindoro)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  {...register("longitude", {
                    valueAsNumber: true,
                    setValueAs: (v: string) =>
                      v === "" || isNaN(Number(v)) ? undefined : Number(v),
                  })}
                  placeholder="e.g., 121.0444"
                />
                {errors.longitude && (
                  <p className="text-sm text-red-600">
                    {errors.longitude.message}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Range: -180 to 180 (e.g., 121.0444 for San Jose, Occidental
                  Mindoro)
                </p>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> You can find exact coordinates using
                Google Maps by right-clicking on the location and selecting
                "What's here?"
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Supervisors */}
        <Card>
          <CardHeader>
            <CardTitle>Supervisors</CardTitle>
            <CardDescription>
              Manage supervisors for this agency
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {supervisorsData?.supervisors &&
              supervisorsData.supervisors.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    Existing Supervisors
                  </Label>
                  {supervisorsData.supervisors.map((supervisor) => (
                    <div
                      key={supervisor.id}
                      className="p-3 border rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium">{supervisor.name}</div>
                        <div className="text-sm text-gray-500">
                          {supervisor.email} • {supervisor.position}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          if (!agencyId) {
                            toast.error("Agency ID is missing");
                            return;
                          }
                          if (
                            confirm(`Delete supervisor ${supervisor.name}?`)
                          ) {
                            try {
                              await deleteSupervisorMutation.mutateAsync({
                                id: supervisor.id,
                                agencyId: agencyId,
                              });
                            } catch (error) {
                              // Error handled by mutation
                            }
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            <div className="pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (agencyId) {
                    router.push(
                      `/dashboard/instructor/agencies/supervisors?agency=${agencyId}`
                    );
                  } else {
                    toast.error("Agency ID is missing");
                  }
                }}
                className="w-full"
              >
                <Users className="w-4 h-4 mr-2" />
                Manage Supervisors
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Agency Status</CardTitle>
            <CardDescription>Set the status of the agency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="isActive"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="isActive">
                Active (Agency is available for practicum placements)
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || updateAgencyMutation.isPending}
                className="bg-primary-500 hover:bg-primary-600"
              >
                {isSubmitting || updateAgencyMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Updating Agency...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Update Agency
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
