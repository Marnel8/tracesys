"use client";

import { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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

export default function SettingsPage() {
  const { user, isLoading: userLoading } = useAuth();
  const editUserMutation = useEditUser();
  const changePasswordMutation = useChangePassword();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const router = useRouter();

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
    instructorId: "",
    role: "",
    gender: "",
    age: 0,
    departmentId: "",
    program: "",
  });

  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");

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

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Update profile state when user data loads
  useEffect(() => {
    if (user) {
      const departmentId = (user as any)?.departmentId || "";
      const program = (user as any)?.program || "";

      setProfile({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        middleName: user.middleName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        bio: user.bio || "",
        instructorId: user.instructorId || "",
        role: user.role || "",
        gender: user.gender || "",
        age: user.age || 0,
        departmentId: departmentId,
        program: program,
      });

      setSelectedDepartmentId(departmentId);

      if (user.avatar) {
        setAvatarPreview(user.avatar);
      }
    }
  }, [user]);

  // Update selectedDepartmentId when profile.departmentId changes
  useEffect(() => {
    if (profile.departmentId && profile.departmentId !== selectedDepartmentId) {
      setSelectedDepartmentId(profile.departmentId);
    }
  }, [profile.departmentId]);

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

  const handleProfileUpdate = async () => {
    if (!user?.id) {
      toast.error("User not found. Please try logging in again.");
      return;
    }

    // Validate age range
    if (profile.age && (profile.age < 22 || profile.age > 80)) {
      toast.error("Age must be between 22 and 80");
      return;
    }

    try {
      const updateData: any = {
        id: user.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        middleName: profile.middleName,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        bio: profile.bio,
        instructorId: profile.instructorId,
        role: profile.role,
        gender: profile.gender,
        age: profile.age,
        departmentId: profile.departmentId ? profile.departmentId : undefined,
        program: profile.program ? profile.program : undefined,
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

  const handleChangePassword = async () => {
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      toast.success("Password changed successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
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
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information and profile details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage
                    src={avatarPreview || "/placeholder.svg?height=80&width=80"}
                    alt="Profile"
                  />
                  <AvatarFallback className="text-lg">
                    {profile.firstName?.[0]}
                    {profile.lastName?.[0]}
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
                    value={profile.firstName}
                    onChange={(e) =>
                      setProfile({ ...profile, firstName: e.target.value })
                    }
                    disabled={editUserMutation.isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) =>
                      setProfile({ ...profile, lastName: e.target.value })
                    }
                    disabled={editUserMutation.isPending}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="middleName">Middle Name</Label>
                <Input
                  id="middleName"
                  value={profile.middleName}
                  onChange={(e) =>
                    setProfile({ ...profile, middleName: e.target.value })
                  }
                  disabled={editUserMutation.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                  disabled={editUserMutation.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                  disabled={editUserMutation.isPending}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    min={22}
                    max={80}
                    value={profile.age || ""}
                    onChange={(e) => {
                      const value =
                        e.target.value === "" ? 0 : parseInt(e.target.value);
                      setProfile({ ...profile, age: isNaN(value) ? 0 : value });
                    }}
                    onBlur={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      if (value > 0) {
                        const clampedValue =
                          value < 22 ? 22 : value > 80 ? 80 : value;
                        setProfile({ ...profile, age: clampedValue });
                      }
                    }}
                    disabled={editUserMutation.isPending}
                  />
                  <p className="text-sm text-gray-600">
                    Age must be between 22 and 80
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={profile.gender}
                    onValueChange={(value) =>
                      setProfile({ ...profile, gender: value })
                    }
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
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructorId">Instructor ID</Label>
                <Input
                  id="instructorId"
                  value={profile.instructorId}
                  onChange={(e) =>
                    setProfile({ ...profile, instructorId: e.target.value })
                  }
                  disabled={editUserMutation.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={profile.departmentId}
                  onValueChange={(value) => {
                    setProfile({
                      ...profile,
                      departmentId: value,
                      program: "",
                    });
                    setSelectedDepartmentId(value);
                  }}
                  disabled={editUserMutation.isPending || departmentsLoading}
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
                        <SelectItem key={dept.id} value={dept.id}>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="program">Program</Label>
                <div className="flex gap-2">
                  <Select
                    value={profile.program || undefined}
                    onValueChange={(value) =>
                      setProfile({ ...profile, program: value })
                    }
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
                          <SelectItem key={course.id} value={course.code}>
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
                  {profile.program && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setProfile({ ...profile, program: "" })}
                      disabled={editUserMutation.isPending}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={profile.address}
                  onChange={(e) =>
                    setProfile({ ...profile, address: e.target.value })
                  }
                  rows={2}
                  disabled={editUserMutation.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                  rows={3}
                  disabled={editUserMutation.isPending}
                />
              </div>

              <Button
                onClick={handleProfileUpdate}
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
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password *</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  disabled={changePasswordMutation.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password *</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  disabled={changePasswordMutation.isPending}
                />
                <p className="text-sm text-gray-600">
                  Password must be at least 6 characters long
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  disabled={changePasswordMutation.isPending}
                />
              </div>

              <Button
                onClick={handleChangePassword}
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
										<SelectItem value="120">2 hours</SelectItem>
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
