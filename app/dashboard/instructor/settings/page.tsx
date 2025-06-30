"use client";

import { useState } from "react";
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
} from "lucide-react";

export default function SettingsPage() {
	const [profile, setProfile] = useState({
		firstName: "Juan",
		lastName: "Dela Cruz",
		email: "juan.delacruz@omsc.edu.ph",
		phone: "+63 912 345 6789",
		department: "Bachelor of Science in Information Technology",
		position: "IT Instructor",
		bio: "Experienced educator with 10+ years in computer science and practicum supervision.",
	});

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

	const handleProfileUpdate = () => {
		console.log("Updating profile:", profile);
	};

	const handleNotificationUpdate = () => {
		console.log("Updating notifications:", notifications);
	};

	const handleSecurityUpdate = () => {
		console.log("Updating security:", security);
	};

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
										src="/placeholder.svg?height=80&width=80"
										alt="Profile"
									/>
									<AvatarFallback className="text-lg">JD</AvatarFallback>
								</Avatar>
								<div>
									<Button variant="outline" className="mb-2">
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
									<Label htmlFor="firstName">First Name</Label>
									<Input
										id="firstName"
										value={profile.firstName}
										onChange={(e) =>
											setProfile({ ...profile, firstName: e.target.value })
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="lastName">Last Name</Label>
									<Input
										id="lastName"
										value={profile.lastName}
										onChange={(e) =>
											setProfile({ ...profile, lastName: e.target.value })
										}
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="email">Email Address</Label>
								<Input
									id="email"
									type="email"
									value={profile.email}
									onChange={(e) =>
										setProfile({ ...profile, email: e.target.value })
									}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="phone">Phone Number</Label>
								<Input
									id="phone"
									value={profile.phone}
									onChange={(e) =>
										setProfile({ ...profile, phone: e.target.value })
									}
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="department">Department</Label>
									<Input
										id="department"
										value={profile.department}
										onChange={(e) =>
											setProfile({ ...profile, department: e.target.value })
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="position">Position</Label>
									<Input
										id="position"
										value={profile.position}
										onChange={(e) =>
											setProfile({ ...profile, position: e.target.value })
										}
									/>
								</div>
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
								/>
							</div>

							<Button
								onClick={handleProfileUpdate}
								className="bg-primary-500 hover:bg-primary-600"
							>
								Save Changes
							</Button>
						</CardContent>
					</Card>

					{/* Notification Settings */}
					<Card>
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
					</Card>

					{/* Security Settings */}
					<Card>
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
					</Card>
				</div>

				{/* Quick Actions Sidebar */}
				<div className="space-y-6">
					<Card>
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
					</Card>

					<Card>
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
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-red-600">Danger Zone</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<Button
								variant="outline"
								className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
							>
								<LogOut className="w-4 h-4 mr-2" />
								Sign Out
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
