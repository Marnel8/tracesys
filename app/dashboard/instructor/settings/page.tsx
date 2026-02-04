"use client";

import { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Bell,
  Shield,
  Palette,
  HelpCircle,
  LogOut,
  Camera,
  Loader2,
  Clock,
} from "lucide-react";
import {
  useAuth,
  useEditUser,
  useLogout,
  useChangePassword,
} from "@/hooks/auth/useAuth";
import { useDepartments } from "@/hooks/department";
import { useCourses } from "@/hooks/course";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Zod schemas with strict validation
const profileSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "First name can only contain letters, spaces, hyphens, and apostrophes"
    ),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Last name can only contain letters, spaces, hyphens, and apostrophes"
    ),
  middleName: z
    .string()
    .regex(
      /^[a-zA-Z\s'-]*$/,
      "Middle name can only contain letters, spaces, hyphens, and apostrophes"
    )
    .optional(),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(
      /^\+63\d{10}$/,
      "Phone number must be in format +63XXXXXXXXXX (10 digits after +63)"
    ),
  address: z.string().optional(),
  instructorId: z
    .string()
    .regex(
      /^[a-zA-Z0-9\-]*$/,
      "Instructor ID can only contain letters, numbers, and hyphens"
    )
    .optional(),
  gender: z.enum(["male", "female", ""]).optional(),
  age: z
    .number()
    .refine((val) => val === 0 || (val >= 22 && val <= 80), {
      message: "Age must be between 22 and 80",
    })
    .optional(),
  departmentId: z.string().optional(),
  program: z.string().optional(),
  ojtHours: z
    .number()
    .int("OJT hours must be a whole number")
    .min(1, "OJT hours must be at least 1")
    .optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { user, isLoading: userLoading } = useAuth();
  const editUserMutation = useEditUser();
  const changePasswordMutation = useChangePassword();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const router = useRouter();

  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    control: profileControl,
    watch: watchProfile,
    reset: resetProfile,
    setValue: setProfileValue,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      middleName: "",
      email: "",
      phone: "",
      address: "",
      instructorId: "",
      gender: "",
      age: 0,
      departmentId: "",
      program: "",
      ojtHours: undefined,
    },
  });

  // Handle phone number input with +63 prefix
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-digits
    if (value.length <= 10) {
      setProfileValue("phone", value ? `+63${value}` : "", { shouldValidate: true });
    }
  };

  const phoneValue = watchProfile("phone")?.replace("+63", "") || "";

  const watchedDepartmentId = watchProfile("departmentId");

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Fetch departments and courses
  const { data: departmentsData, isLoading: departmentsLoading } =
    useDepartments({ status: "active" });
  const departments = departmentsData?.departments || [];

  const { data: coursesData, isLoading: coursesLoading } = useCourses({
    status: "active",
    departmentId: selectedDepartmentId || undefined,
  });
  const courses = coursesData?.courses || [];

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    attendanceAlerts: true,
    systemUpdates: false,
  });

  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    sessionTimeout: "30",
    loginAlerts: true,
  });

  // Track if form has been initialized to prevent multiple resets
  const [formInitialized, setFormInitialized] = useState(false);

  // Update profile form when user data loads (wait for departments to be ready)
  useEffect(() => {
    if (user && !userLoading && !departmentsLoading && !formInitialized) {
      // Handle both direct user object and nested user.user structure
      const userData = (user as any)?.user || user;

      // Handle null/undefined values properly
      const departmentId = userData?.departmentId
        ? String(userData.departmentId)
        : "";
      const program = userData?.program ? String(userData.program) : "";

      const formValues = {
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        middleName: userData.middleName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        address: userData.address || "",
        instructorId: userData.instructorId || "",
        gender: userData.gender || "",
        age: userData.age || 0,
        departmentId: departmentId || undefined,
        program: program || undefined,
        ojtHours: userData.ojtHours || undefined,
      };

      // Reset form with user data
      resetProfile(formValues, {
        keepDefaultValues: false,
      });

      // Update selected department ID for course fetching
      if (departmentId) {
        setSelectedDepartmentId(departmentId);
      } else {
        setSelectedDepartmentId("");
      }

      // Update avatar preview
      if (userData.avatar) {
        setAvatarPreview(userData.avatar);
      } else {
        setAvatarPreview("");
      }

      setFormInitialized(true);
    }
  }, [user, userLoading, departmentsLoading, formInitialized, resetProfile]);

  // Set program value after courses load (if department is selected)
  useEffect(() => {
    if (
      user &&
      !userLoading &&
      !coursesLoading &&
      selectedDepartmentId &&
      formInitialized
    ) {
      const userData = (user as any)?.user || user;
      const program = userData?.program ? String(userData.program) : "";

      // Only set if program exists and matches a course
      if (program) {
        const programExists = courses.some(
          (course: any) => String(course.code) === program
        );
        if (programExists) {
          setProfileValue("program", program);
        }
      }
    }
  }, [
    user,
    userLoading,
    coursesLoading,
    selectedDepartmentId,
    formInitialized,
    courses,
    setProfileValue,
  ]);

  // Reset form initialization flag when user changes (e.g., after edit)
  useEffect(() => {
    if (user && editUserMutation.isSuccess) {
      setFormInitialized(false);
    }
  }, [user, editUserMutation.isSuccess]);

  // Update selectedDepartmentId when watched departmentId changes
  useEffect(() => {
    if (watchedDepartmentId && watchedDepartmentId !== selectedDepartmentId) {
      setSelectedDepartmentId(watchedDepartmentId);
    } else if (!watchedDepartmentId && selectedDepartmentId) {
      setSelectedDepartmentId("");
    }
  }, [watchedDepartmentId, selectedDepartmentId]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onProfileSubmit = async (data: ProfileFormData) => {
    if (!user?.id) {
      toast.error("User not found. Please try logging in again.");
      return;
    }

    try {
      const updateData: any = {
        id: user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        instructorId: data.instructorId,
        role: user.role,
        gender: data.gender,
        age: data.age,
        departmentId: data.departmentId ? data.departmentId : undefined,
        program: data.program ? data.program : undefined,
        ojtHours: data.ojtHours ? data.ojtHours : undefined,
      };

      if (avatarFile) {
        updateData.avatar = avatarFile;
      }

      await editUserMutation.mutateAsync(updateData);

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(
        error.message || "Failed to update profile. Please try again."
      );
    }
  };

  const handleNotificationUpdate = () => {
    console.log("Updating notifications:", notifications);
    toast.info("Notification preferences will be implemented soon.");
  };

  const handleSecurityUpdate = () => {
    console.log("Updating security:", security);
    toast.info("Security settings will be implemented soon.");
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      toast.success("Password changed successfully!");
      resetPassword();
    } catch (error: any) {
      toast.error(
        error.message || "Failed to change password. Please try again."
      );
    }
  };

  const handleSignOut = () => {
    logout(undefined, {
      onSuccess: () => {
        toast.success("Signed out");
        router.push("/login/instructor");
      },
      onError: (error: any) => {
        toast.error(error.message || "Please try again");
      },
    });
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading user data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal information and profile details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form
                onSubmit={handleProfileSubmit(onProfileSubmit)}
                className="space-y-6"
              >
                <div className="flex items-center gap-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage
                      src={
                        avatarPreview || "/placeholder.svg?height=80&width=80"
                      }
                      alt="Profile"
                    />
                    <AvatarFallback className="text-lg">
                      {watchProfile("firstName")?.[0]}
                      {watchProfile("lastName")?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      className="mb-2"
                      onClick={() =>
                        document.getElementById("avatar-upload")?.click()
                      }
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Change Photo
                    </Button>
                    <p className="text-sm text-gray-600">
                      JPG, GIF or PNG. 1MB max.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      {...registerProfile("firstName")}
                      disabled={editUserMutation.isPending}
                    />
                    {profileErrors.firstName && (
                      <p className="text-sm text-red-600">
                        {profileErrors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      {...registerProfile("lastName")}
                      disabled={editUserMutation.isPending}
                    />
                    {profileErrors.lastName && (
                      <p className="text-sm text-red-600">
                        {profileErrors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input
                    id="middleName"
                    {...registerProfile("middleName")}
                    disabled={editUserMutation.isPending}
                  />
                  {profileErrors.middleName && (
                    <p className="text-sm text-red-600">
                      {profileErrors.middleName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...registerProfile("email")}
                    disabled={editUserMutation.isPending}
                  />
                  {profileErrors.email && (
                    <p className="text-sm text-red-600">
                      {profileErrors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      +63
                    </span>
                    <Input
                      id="phone"
                      disabled={editUserMutation.isPending}
                      className="pl-12"
                      placeholder="9123456789"
                      value={phoneValue}
                      onChange={handlePhoneChange}
                      maxLength={10}
                      inputMode="numeric"
                    />
                  </div>
                  {profileErrors.phone && (
                    <p className="text-sm text-red-600">
                      {profileErrors.phone.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      inputMode="numeric"
                      min={22}
                      max={80}
                      {...registerProfile("age", { valueAsNumber: true })}
                      disabled={editUserMutation.isPending}
                    />
                    {profileErrors.age && (
                      <p className="text-sm text-red-600">
                        {profileErrors.age.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Sex</Label>
                    <Controller
                      name="gender"
                      control={profileControl}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={editUserMutation.isPending}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select sex" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {profileErrors.gender && (
                      <p className="text-sm text-red-600">
                        {profileErrors.gender.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructorId">Instructor ID</Label>
                  <Input
                    id="instructorId"
                    {...registerProfile("instructorId")}
                    disabled={editUserMutation.isPending}
                  />
                  {profileErrors.instructorId && (
                    <p className="text-sm text-red-600">
                      {profileErrors.instructorId.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Controller
                    name="departmentId"
                    control={profileControl}
                    render={({ field }) => {
                      const currentValue = field.value
                        ? String(field.value)
                        : undefined;
                      // Check if the value exists in departments
                      const valueExists = currentValue
                        ? departments.some(
                            (dept) => String(dept.id) === currentValue
                          )
                        : false;

                      return (
                        <Select
                          key={`dept-${formInitialized}-${
                            currentValue || "empty"
                          }`}
                          value={valueExists ? currentValue : undefined}
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedDepartmentId(value || "");
                            // Reset program when department changes
                            setProfileValue("program", undefined);
                          }}
                          disabled={
                            editUserMutation.isPending || departmentsLoading
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departmentsLoading ? (
                              <SelectItem value="loading" disabled>
                                Loading departments...
                              </SelectItem>
                            ) : departments.length > 0 ? (
                              departments.map((dept) => (
                                <SelectItem
                                  key={dept.id}
                                  value={String(dept.id)}
                                >
                                  {dept.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-departments" disabled>
                                No departments available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      );
                    }}
                  />
                  {profileErrors.departmentId && (
                    <p className="text-sm text-red-600">
                      {profileErrors.departmentId.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="program">Program</Label>
                  <div className="flex gap-2">
                    <Controller
                      name="program"
                      control={profileControl}
                      render={({ field }) => {
                        const currentValue = field.value
                          ? String(field.value)
                          : undefined;
                        // Check if the value exists in courses
                        const valueExists = currentValue
                          ? courses.some(
                              (course: any) =>
                                String(course.code) === currentValue
                            )
                          : false;

                        return (
                          <Select
                            key={`program-${formInitialized}-${selectedDepartmentId}-${
                              currentValue || "empty"
                            }`}
                            value={valueExists ? currentValue : undefined}
                            onValueChange={(value) => {
                              field.onChange(value);
                            }}
                            disabled={
                              !selectedDepartmentId ||
                              editUserMutation.isPending ||
                              coursesLoading
                            }
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue
                                placeholder={
                                  !selectedDepartmentId
                                    ? "Select department first"
                                    : coursesLoading
                                    ? "Loading programs..."
                                    : "Select program (optional)"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {coursesLoading ? (
                                <SelectItem value="loading" disabled>
                                  Loading programs...
                                </SelectItem>
                              ) : courses.length > 0 ? (
                                courses.map((course: any) => (
                                  <SelectItem
                                    key={course.id}
                                    value={String(course.code)}
                                  >
                                    {course.code} - {course.name}
                                  </SelectItem>
                                ))
                              ) : selectedDepartmentId ? (
                                <SelectItem value="no-programs" disabled>
                                  No programs available for this department
                                </SelectItem>
                              ) : (
                                <SelectItem value="select-dept" disabled>
                                  Select a department first
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        );
                      }}
                    />
                    {watchProfile("program") && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setProfileValue("program", undefined);
                        }}
                        disabled={editUserMutation.isPending}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  {profileErrors.program && (
                    <p className="text-sm text-red-600">
                      {profileErrors.program.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    {...registerProfile("address")}
                    rows={2}
                    disabled={editUserMutation.isPending}
                  />
                  {profileErrors.address && (
                    <p className="text-sm text-red-600">
                      {profileErrors.address.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={editUserMutation.isPending || userLoading}
                  className="bg-primary-500 hover:bg-primary-600"
                >
                  {editUserMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* OJT Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                OJT Settings
              </CardTitle>
              <CardDescription>
                Configure default OJT hours for new students
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form
                onSubmit={handleProfileSubmit(onProfileSubmit)}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Label htmlFor="ojtHours">Default OJT Hours</Label>
                  <Input
                    id="ojtHours"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    {...registerProfile("ojtHours", { valueAsNumber: true })}
                    disabled={editUserMutation.isPending}
                    placeholder="e.g., 400"
                  />
                  {profileErrors.ojtHours && (
                    <p className="text-sm text-red-600">
                      {profileErrors.ojtHours.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    This will be used as the default OJT hours when creating new students and practicums
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={editUserMutation.isPending || userLoading}
                  className="bg-primary-500 hover:bg-primary-600"
                >
                  {editUserMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save OJT Settings"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form
                onSubmit={handlePasswordSubmit(onPasswordSubmit)}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password *</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    {...registerPassword("currentPassword")}
                    disabled={changePasswordMutation.isPending}
                  />
                  {passwordErrors.currentPassword && (
                    <p className="text-sm text-red-600">
                      {passwordErrors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password *</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    {...registerPassword("newPassword")}
                    disabled={changePasswordMutation.isPending}
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-sm text-red-600">
                      {passwordErrors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    Confirm New Password *
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...registerPassword("confirmPassword")}
                    disabled={changePasswordMutation.isPending}
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-sm text-red-600">
                      {passwordErrors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="bg-primary-500 hover:bg-primary-600"
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Changing Password...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          {/* <Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Bell className="w-5 h-5" />
								Notification Preferences
							</CardTitle>
							<CardDescription>
								Choose what notifications you want to receive
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Email Notifications</Label>
									<p className="text-sm text-gray-600">
										Receive notifications via email
									</p>
								</div>
								<Switch
									checked={notifications.emailNotifications}
									onCheckedChange={(checked) =>
										setNotifications({
											...notifications,
											emailNotifications: checked,
										})
									}
								/>
							</div>

							<Separator />

							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Push Notifications</Label>
									<p className="text-sm text-gray-600">
										Receive push notifications in browser
									</p>
								</div>
								<Switch
									checked={notifications.pushNotifications}
									onCheckedChange={(checked) =>
										setNotifications({
											...notifications,
											pushNotifications: checked,
										})
									}
								/>
							</div>

							<Separator />

							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Weekly Reports</Label>
									<p className="text-sm text-gray-600">
										Get weekly summary reports
									</p>
								</div>
								<Switch
									checked={notifications.weeklyReports}
									onCheckedChange={(checked) =>
										setNotifications({
											...notifications,
											weeklyReports: checked,
										})
									}
								/>
							</div>

							<Separator />

							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Attendance Alerts</Label>
									<p className="text-sm text-gray-600">
										Get notified of new attendance submissions
									</p>
								</div>
								<Switch
									checked={notifications.attendanceAlerts}
									onCheckedChange={(checked) =>
										setNotifications({
											...notifications,
											attendanceAlerts: checked,
										})
									}
								/>
							</div>

							<Separator />

							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>System Updates</Label>
									<p className="text-sm text-gray-600">
										Get notified about system updates
									</p>
								</div>
								<Switch
									checked={notifications.systemUpdates}
									onCheckedChange={(checked) =>
										setNotifications({
											...notifications,
											systemUpdates: checked,
										})
									}
								/>
							</div>

							<Button
								onClick={handleNotificationUpdate}
								className="bg-primary-500 hover:bg-primary-600"
							>
								Save Preferences
							</Button>
						</CardContent>
					</Card> */}

          {/* Security Settings */}
          {/* <Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Shield className="w-5 h-5" />
								Security Settings
							</CardTitle>
							<CardDescription>
								Manage your account security and privacy
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Two-Factor Authentication</Label>
									<p className="text-sm text-gray-600">
										Add an extra layer of security to your account
									</p>
								</div>
								<Switch
									checked={security.twoFactorAuth}
									onCheckedChange={(checked) =>
										setSecurity({ ...security, twoFactorAuth: checked })
									}
								/>
							</div>

							<Separator />

							<div className="space-y-2">
								<Label>Session Timeout</Label>
								<Select
									value={security.sessionTimeout}
									onValueChange={(value) =>
										setSecurity({ ...security, sessionTimeout: value })
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="15">15 minutes</SelectItem>
										<SelectItem value="30">30 minutes</SelectItem>
										<SelectItem value="60">1 hour</SelectItem>
										<SelectItem value="120">2 hour/s</SelectItem>
									</SelectContent>
								</Select>
								<p className="text-sm text-gray-600">
									Automatically log out after period of inactivity
								</p>
							</div>

							<Separator />

							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Login Alerts</Label>
									<p className="text-sm text-gray-600">
										Get notified of new login attempts
									</p>
								</div>
								<Switch
									checked={security.loginAlerts}
									onCheckedChange={(checked) =>
										setSecurity({ ...security, loginAlerts: checked })
									}
								/>
							</div>

							<div className="space-y-4">
								<Button variant="outline" className="w-full">
									Change Password
								</Button>
								<Button
									onClick={handleSecurityUpdate}
									className="bg-primary-500 hover:bg-primary-600"
								>
									Save Security Settings
								</Button>
							</div>
						</CardContent>
					</Card> */}
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          {/* <Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Palette className="w-5 h-5" />
								Appearance
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label>Theme</Label>
								<Select defaultValue="light">
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="light">Light</SelectItem>
										<SelectItem value="dark">Dark</SelectItem>
										<SelectItem value="system">System</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label>Language</Label>
								<Select defaultValue="en">
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="en">English</SelectItem>
										<SelectItem value="fil">Filipino</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</CardContent>
					</Card> */}

          {/* <Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<HelpCircle className="w-5 h-5" />
								Support
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<Button variant="outline" className="w-full justify-start">
								<HelpCircle className="w-4 h-4 mr-2" />
								Help Center
							</Button>
							<Button variant="outline" className="w-full justify-start">
								<Bell className="w-4 h-4 mr-2" />
								Contact Support
							</Button>
							<Button variant="outline" className="w-full justify-start">
								<Shield className="w-4 h-4 mr-2" />
								Privacy Policy
							</Button>
						</CardContent>
					</Card> */}
        </div>
      </div>
    </div>
  );
}
