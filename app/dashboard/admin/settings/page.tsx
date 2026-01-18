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
  Shield,
  LogOut,
  Camera,
  Loader2,
} from "lucide-react";
import {
  useAuth,
  useEditUser,
  useLogout,
  useChangePassword,
} from "@/hooks/auth/useAuth";
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
      /^[\d\s\-()+]*$/,
      "Phone number can only contain numbers, spaces, hyphens, parentheses, and plus sign"
    ),
  address: z.string().optional(),
  bio: z.string().optional(),
  gender: z.enum(["male", "female", "other", ""]).optional(),
  age: z
    .number()
    .refine((val) => val === 0 || (val >= 18 && val <= 100), {
      message: "Age must be between 18 and 100",
    })
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

export default function AdminSettingsPage() {
  const { user, isLoading: userLoading } = useAuth();
  const editUserMutation = useEditUser();
  const changePasswordMutation = useChangePassword();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const router = useRouter();

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    control: profileControl,
    watch: watchProfile,
    reset: resetProfile,
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
      bio: "",
      gender: "",
      age: 0,
    },
  });

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

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  // Track if form has been initialized to prevent multiple resets
  const [formInitialized, setFormInitialized] = useState(false);

  // Update profile form when user data loads
  useEffect(() => {
    if (user && !userLoading && !formInitialized) {
      const userData = (user as any)?.user || user;

      const formValues = {
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        middleName: userData.middleName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        address: userData.address || "",
        bio: userData.bio || "",
        gender: userData.gender || "",
        age: userData.age || 0,
      };

      resetProfile(formValues, {
        keepDefaultValues: false,
      });

      if (userData.avatar) {
        setAvatarPreview(userData.avatar);
      } else {
        setAvatarPreview("");
      }

      setFormInitialized(true);
    }
  }, [user, userLoading, formInitialized, resetProfile]);

  // Reset form initialization flag when user changes
  useEffect(() => {
    if (user && editUserMutation.isSuccess) {
      setFormInitialized(false);
    }
  }, [user, editUserMutation.isSuccess]);

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
        bio: data.bio,
        role: user.role,
        gender: data.gender,
        age: data.age,
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
        router.push("/login/admin");
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
                Profile Information
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
                  <Input
                    id="phone"
                    {...registerProfile("phone")}
                    disabled={editUserMutation.isPending}
                  />
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
                      min={18}
                      max={100}
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
                    <Label htmlFor="gender">Gender</Label>
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
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
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

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    {...registerProfile("bio")}
                    rows={3}
                    disabled={editUserMutation.isPending}
                  />
                  {profileErrors.bio && (
                    <p className="text-sm text-red-600">
                      {profileErrors.bio.message}
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
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleSignOut}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing Out...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

