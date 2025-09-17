"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	User,
	Mail,
	Phone,
	MapPin,
	Calendar,
	GraduationCap,
	Building,
	Camera,
	Edit,
	Save,
	ArrowLeft,
	Clock,
	Award,
	Target,
	Printer,
	Download,
	Search,
	Filter,
} from "lucide-react";
import Link from "next/link";
import { useAuth, useEditUser } from "@/hooks/auth/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useAttendanceStats, useStudentAttendance } from "@/hooks/student/useStudentAttendance";
import { useStudentReports } from "@/hooks/student/useStudentReports";
import { useRequirementStats } from "@/hooks/student/useStudentRequirements";

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const { user, isLoading: isUserLoading, error, refetch } = useAuth();
    const editUserMutation = useEditUser();
    const { toast } = useToast();

    const [profileData, setProfileData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        studentId: "",
        course: "",
        year: "",
        section: "",
        supervisor: "",
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        bio: "",
    });

    // Hooks must be declared before any early return
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");

    // Student key used by student-facing APIs (uses academic studentId string)
    const studentKey = user?.studentId || "";

    // Derive date range from selectedMonth (YYYY-MM)
    const monthStart = selectedMonth ? `${selectedMonth}-01` : undefined;
    const monthEnd = selectedMonth ? `${selectedMonth}-31` : undefined;

    // Queries for tabs (enabled only when studentKey exists)
    const { data: attendanceListData } = useStudentAttendance(studentKey, {
        page: 1,
        limit: 1000,
        startDate: monthStart,
        endDate: monthEnd,
    });
    const { data: attendanceStatsData } = useAttendanceStats(studentKey);
    const { data: reportsData } = useStudentReports(studentKey);
    const { data: requirementStatsData } = useRequirementStats(studentKey);

    useEffect(() => {
        if (user) {
            setProfileData((prev) => ({
                ...prev,
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                phone: user.phone || "",
                address: user.address || "",
                studentId: user.studentId || "",
                bio: user.bio || "",
            }));
        }
    }, [user]);

    if (isUserLoading) {
        return (
            <div className="px-4 md:px-8 lg:px-16">
                <div className="mb-6">
                    <div className="h-8 w-40 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-4 w-72 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="h-64 bg-gray-100 rounded animate-pulse" />
                    <div className="h-64 bg-gray-100 rounded animate-pulse lg:col-span-2" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="px-4 md:px-8 lg:px-16">
                <Card>
                    <CardContent className="p-6">
                        <p className="text-red-600">Failed to load profile.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const achievements = [
		{
			title: "Perfect Attendance",
			description: "100% attendance for 2 weeks",
			date: "2024-01-15",
			type: "attendance",
		},
		{
			title: "Outstanding Report",
			description: "Excellent weekly report #7",
			date: "2024-01-10",
			type: "academic",
		},
		{
			title: "Quick Learner",
			description: "Completed training ahead of schedule",
			date: "2024-01-08",
			type: "training",
		},
	];

    const practicum_stats = {
        hoursCompleted: attendanceStatsData?.data?.completedHours ?? 0,
        totalHours: attendanceStatsData?.data?.totalHours ?? 0,
        reportsSubmitted: reportsData?.data?.total ?? 0,
        requirementsDone: requirementStatsData?.data?.approved ?? 0,
        totalRequirements: requirementStatsData?.data?.total ?? 0,
        attendanceRate: attendanceStatsData?.data?.attendancePercentage ?? 0,
    };

    // DTR data - from attendance API
    const dtrRecords = (attendanceListData?.data || []).map((a: any) => {
        let day = "";
        try {
            day = new Date(a.date).toLocaleDateString(undefined, { weekday: "long" });
        } catch {}
        let hours = 0;
        if (a.timeIn && a.timeOut) {
            try {
                const start = new Date(`1970-01-01T${a.timeIn}`);
                const end = new Date(`1970-01-01T${a.timeOut}`);
                hours = Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60));
            } catch {}
        }
        return {
            date: a.date,
            day,
            timeIn: a.timeIn || "",
            timeOut: a.timeOut || "",
            hours,
            status: a.status || "present",
            remarks: a.notes || "",
        };
    });


    const handleSave = async () => {
        if (!user?.id) return;
        try {
            await editUserMutation.mutateAsync({
                id: user.id,
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                email: profileData.email,
                phone: profileData.phone,
                address: profileData.address,
                bio: profileData.bio,
            });
            toast({ title: "Profile updated" });
            setIsEditing(false);
        } catch (e: any) {
            toast({ title: "Update failed", description: e.message || "Please try again.", variant: "destructive" });
        }
    };

	const handleInputChange = (field: string, value: string) => {
		setProfileData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handlePrintDTR = () => {
		const printWindow = window.open("", "_blank");
		if (printWindow) {
			printWindow.document.write(`
				<!DOCTYPE html>
				<html>
				<head>
					<title>Daily Time Record - ${profileData.firstName} ${
				profileData.lastName
			}</title>
					<style>
						body { font-family: Arial, sans-serif; margin: 20px; }
						.header { text-align: center; margin-bottom: 30px; }
						.student-info { margin-bottom: 20px; }
						table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
						th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
						th { background-color: #f2f2f2; }
						.total { font-weight: bold; margin-top: 20px; }
						@media print { body { margin: 0; } }
					</style>
				</head>
				<body>
					<div class="header">
						<h1>Daily Time Record</h1>
						<h2>${profileData.company}</h2>
					</div>
					
					<div class="student-info">
						<p><strong>Student Name:</strong> ${profileData.firstName} ${
				profileData.lastName
			}</p>
						<p><strong>Student ID:</strong> ${profileData.studentId}</p>
						<p><strong>Course:</strong> ${profileData.course}</p>
						<p><strong>Company:</strong> ${profileData.company}</p>
						<p><strong>Position:</strong> ${profileData.position}</p>
						<p><strong>Supervisor:</strong> ${profileData.supervisor}</p>
						<p><strong>Period:</strong> ${profileData.startDate} to ${
				profileData.endDate
			}</p>
					</div>
					
					<table>
						<thead>
							<tr>
								<th>Date</th>
								<th>Day</th>
								<th>Time In</th>
								<th>Time Out</th>
								<th>Hours</th>
								<th>Remarks</th>
							</tr>
						</thead>
						<tbody>
							${dtrRecords
								.map(
									(record) => `
								<tr>
									<td>${record.date}</td>
									<td>${record.day}</td>
									<td>${record.timeIn}</td>
									<td>${record.timeOut}</td>
									<td>${record.hours}</td>
									<td>${record.remarks}</td>
								</tr>
							`
								)
								.join("")}
						</tbody>
					</table>
					
					<div class="total">
						<p><strong>Total Hours:</strong> ${dtrRecords.reduce(
							(sum, record) => sum + record.hours,
							0
						)} hours</p>
					</div>
					
					<div style="margin-top: 50px;">
						<p>Student Signature: _________________</p>
						<p>Date: _________________</p>
					</div>
					
					<div style="margin-top: 30px;">
						<p>Supervisor Signature: _________________</p>
						<p>Date: _________________</p>
					</div>
				</body>
				</html>
			`);
			printWindow.document.close();
			printWindow.print();
		}
	};

	const filteredDTR = dtrRecords.filter((record) => {
		const matchesSearch =
			record.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
			record.day.toLowerCase().includes(searchTerm.toLowerCase()) ||
			record.remarks.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesMonth =
			!selectedMonth || record.date.startsWith(selectedMonth);

		return matchesSearch && matchesMonth;
	});

	const totalHours = filteredDTR.reduce((sum, record) => sum + record.hours, 0);

	return (
		<div className="px-4 md:px-8 lg:px-16 ">
			{/* Header */}
			<div className="mb-6">
				<div className="flex items-center gap-4 mb-4">
					<Link href="/dashboard/student">
						<Button
							variant="ghost"
							size="sm"
							className="flex items-center gap-2"
						>
							<ArrowLeft className="w-4 h-4" />
							<span className="hidden sm:inline">Back to Dashboard</span>
						</Button>
					</Link>
				</div>
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
							Profile
						</h1>
						<p className="text-gray-600 text-sm md:text-base">
							Manage your personal information and track your progress.
						</p>
					</div>
					<Button
						onClick={isEditing ? handleSave : () => setIsEditing(true)}
						className={
							isEditing
								? "bg-green-500 hover:bg-green-600"
								: "bg-primary-500 hover:bg-primary-600"
						}
					>
						{isEditing ? (
							<>
								<Save className="w-4 h-4 mr-2" />
								Save Changes
							</>
						) : (
							<>
								<Edit className="w-4 h-4 mr-2" />
								Edit Profile
							</>
						)}
					</Button>
				</div>
			</div>

			<Tabs defaultValue="personal" className="space-y-6">
				<TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
					<TabsTrigger value="personal" className="text-xs sm:text-sm py-2">
						Personal
					</TabsTrigger>
					<TabsTrigger value="practicum" className="text-xs sm:text-sm py-2">
						Practicum
					</TabsTrigger>
					<TabsTrigger value="progress" className="text-xs sm:text-sm py-2">
						Progress
					</TabsTrigger>
					<TabsTrigger value="achievements" className="text-xs sm:text-sm py-2">
						Achievements
					</TabsTrigger>
					<TabsTrigger value="dtr" className="text-xs sm:text-sm py-2">
						DTR
					</TabsTrigger>
				</TabsList>

				{/* Personal Information */}
				<TabsContent value="personal" className="space-y-6">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Profile Picture */}
						<Card>
							<CardContent className="p-6 text-center space-y-4">
								<Avatar className="w-32 h-32 mx-auto">
									<AvatarImage src="/placeholder-user.jpg" />
									<AvatarFallback className="text-2xl">
										{profileData.firstName[0]}
										{profileData.lastName[0]}
									</AvatarFallback>
								</Avatar>
								<div>
									<h3 className="font-semibold text-lg">
										{profileData.firstName} {profileData.lastName}
									</h3>
									<p className="text-gray-600">{profileData.studentId}</p>
									<Badge variant="secondary" className="mt-2">
										{profileData.year} Student
									</Badge>
								</div>
								{isEditing && (
									<Button variant="outline" size="sm">
										<Camera className="w-4 h-4 mr-2" />
										Change Photo
									</Button>
								)}
							</CardContent>
						</Card>

						{/* Personal Details */}
						<div className="lg:col-span-2 space-y-6">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<User className="w-5 h-5" />
										Personal Information
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="firstName">First Name</Label>
											<Input
												id="firstName"
												value={profileData.firstName}
												onChange={(e) =>
													handleInputChange("firstName", e.target.value)
												}
												disabled={!isEditing}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="lastName">Last Name</Label>
											<Input
												id="lastName"
												value={profileData.lastName}
												onChange={(e) =>
													handleInputChange("lastName", e.target.value)
												}
												disabled={!isEditing}
											/>
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="email">Email Address</Label>
										<div className="relative">
											<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
											<Input
												id="email"
												value={profileData.email}
												onChange={(e) =>
													handleInputChange("email", e.target.value)
												}
												disabled={!isEditing}
												className="pl-10"
											/>
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="phone">Phone Number</Label>
										<div className="relative">
											<Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
											<Input
												id="phone"
												value={profileData.phone}
												onChange={(e) =>
													handleInputChange("phone", e.target.value)
												}
												disabled={!isEditing}
												className="pl-10"
											/>
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="address">Address</Label>
										<div className="relative">
											<MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
											<Textarea
												id="address"
												value={profileData.address}
												onChange={(e) =>
													handleInputChange("address", e.target.value)
												}
												disabled={!isEditing}
												className="pl-10 min-h-[80px] resize-none"
											/>
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="bio">Bio</Label>
										<Textarea
											id="bio"
											value={profileData.bio}
											onChange={(e) => handleInputChange("bio", e.target.value)}
											disabled={!isEditing}
											placeholder="Tell us about yourself..."
											className="min-h-[100px] resize-none"
										/>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</TabsContent>

				{/* Practicum Information */}
				<TabsContent value="practicum" className="space-y-6">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<GraduationCap className="w-5 h-5" />
									Academic Information
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label>Student ID</Label>
									<Input value={profileData.studentId} disabled />
								</div>
								<div className="space-y-2">
									<Label>Course</Label>
									<Input value={profileData.course} disabled />
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label>Year Level</Label>
										<Input value={profileData.year} disabled />
									</div>
									<div className="space-y-2">
										<Label>Section</Label>
										<Input value={profileData.section} disabled />
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Building className="w-5 h-5" />
									Practicum Details
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label>Company</Label>
									<Input value={profileData.company} disabled />
								</div>
								<div className="space-y-2">
									<Label>Position</Label>
									<Input value={profileData.position} disabled />
								</div>
								<div className="space-y-2">
									<Label>Supervisor</Label>
									<Input value={profileData.supervisor} disabled />
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label>Start Date</Label>
										<Input value={profileData.startDate} disabled />
									</div>
									<div className="space-y-2">
										<Label>End Date</Label>
										<Input value={profileData.endDate} disabled />
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				{/* Progress Tracking */}
				<TabsContent value="progress" className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<Card>
							<CardContent className="p-4 text-center">
								<Clock className="w-8 h-8 mx-auto text-blue-600 mb-2" />
								<div className="text-2xl font-bold text-blue-600">
									{practicum_stats.hoursCompleted}
								</div>
								<div className="text-sm text-gray-600">
									of {practicum_stats.totalHours} hours
								</div>
								<div className="text-xs text-gray-500 mt-1">
									{(
										(practicum_stats.hoursCompleted /
											practicum_stats.totalHours) *
										100
									).toFixed(0)}
									% Complete
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardContent className="p-4 text-center">
								<Target className="w-8 h-8 mx-auto text-green-600 mb-2" />
								<div className="text-2xl font-bold text-green-600">
									{practicum_stats.attendanceRate}%
								</div>
								<div className="text-sm text-gray-600">Attendance Rate</div>
							</CardContent>
						</Card>

						<Card>
							<CardContent className="p-4 text-center">
								<Award className="w-8 h-8 mx-auto text-purple-600 mb-2" />
								<div className="text-2xl font-bold text-purple-600">
									{practicum_stats.reportsSubmitted}
								</div>
								<div className="text-sm text-gray-600">Reports Submitted</div>
							</CardContent>
						</Card>

						<Card>
							<CardContent className="p-4 text-center">
								<GraduationCap className="w-8 h-8 mx-auto text-orange-600 mb-2" />
								<div className="text-2xl font-bold text-orange-600">
									{practicum_stats.requirementsDone}
								</div>
								<div className="text-sm text-gray-600">
									of {practicum_stats.totalRequirements} requirements
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				{/* Achievements */}
				<TabsContent value="achievements" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Award className="w-5 h-5" />
								Recent Achievements
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{achievements.map((achievement, index) => (
									<div
										key={index}
										className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
									>
										<div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
											<Award className="w-5 h-5 text-primary-600" />
										</div>
										<div className="flex-1 min-w-0">
											<h4 className="font-medium text-gray-900">
												{achievement.title}
											</h4>
											<p className="text-sm text-gray-600 mt-1">
												{achievement.description}
											</p>
											<div className="flex items-center gap-2 mt-2">
												<Calendar className="w-3 h-3 text-gray-400" />
												<span className="text-xs text-gray-500">
													{achievement.date}
												</span>
												<Badge variant="secondary" className="text-xs">
													{achievement.type}
												</Badge>
											</div>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* DTR - Daily Time Record */}
				<TabsContent value="dtr" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Clock className="w-5 h-5" />
								Daily Time Record (DTR)
							</CardTitle>
							<p className="text-sm text-gray-600">
								View and print your daily time records for practicum hours
								tracking.
							</p>
						</CardHeader>
						<CardContent>
							{/* DTR Controls */}
							<div className="flex flex-col gap-4 mb-6">
								{/* Search and Filters Row */}
								<div className="flex flex-col sm:flex-row gap-3">
									<div className="flex-1 min-w-0">
										<div className="relative">
											<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
											<Input
												placeholder="Search by date, day, or remarks..."
												value={searchTerm}
												onChange={(e) => setSearchTerm(e.target.value)}
												className="pl-10"
											/>
										</div>
									</div>
									<div className="flex flex-col sm:flex-row gap-2">
										<select
											value={selectedMonth}
											onChange={(e) => setSelectedMonth(e.target.value)}
											className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[140px]"
										>
											<option value="">All Months</option>
											<option value="2024-01">January 2024</option>
											<option value="2024-02">February 2024</option>
											<option value="2024-03">March 2024</option>
											<option value="2024-04">April 2024</option>
										</select>
									</div>
								</div>

								{/* Action Buttons Row */}
								<div className="flex flex-col sm:flex-row gap-2">
									<Button
										onClick={handlePrintDTR}
										variant="outline"
										className="flex items-center justify-center gap-2 flex-1 sm:flex-none sm:w-auto"
									>
										<Printer className="w-4 h-4" />
										<span className="hidden sm:inline">Print DTR</span>
										<span className="sm:hidden">Print</span>
									</Button>
									<Button
										onClick={() => {
											// TODO: Implement PDF download
											console.log("Downloading PDF...");
										}}
										variant="outline"
										className="flex items-center justify-center gap-2 flex-1 sm:flex-none sm:w-auto"
									>
										<Download className="w-4 h-4" />
										<span className="hidden sm:inline">Download PDF</span>
										<span className="sm:hidden">PDF</span>
									</Button>
								</div>
							</div>

							{/* DTR Summary */}
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
								<Card>
									<CardContent className="p-3 sm:p-4 text-center">
										<div className="text-xl sm:text-2xl font-bold text-blue-600">
											{filteredDTR.length}
										</div>
										<div className="text-xs sm:text-sm text-gray-600">
											Days Recorded
										</div>
									</CardContent>
								</Card>
								<Card>
									<CardContent className="p-3 sm:p-4 text-center">
										<div className="text-xl sm:text-2xl font-bold text-green-600">
											{totalHours.toFixed(2)}
										</div>
										<div className="text-xs sm:text-sm text-gray-600">
											Total Hours
										</div>
									</CardContent>
								</Card>
								<Card className="sm:col-span-2 lg:col-span-1">
									<CardContent className="p-3 sm:p-4 text-center">
										<div className="text-xl sm:text-2xl font-bold text-purple-600">
											{filteredDTR.length > 0
												? (totalHours / filteredDTR.length).toFixed(2)
												: "0.00"}
										</div>
										<div className="text-xs sm:text-sm text-gray-600">
											Avg Hours/Day
										</div>
									</CardContent>
								</Card>
							</div>

							{/* DTR Table - Mobile Responsive */}
							<div className="space-y-4">
								{/* Desktop Table View */}
								<div className="hidden md:block overflow-x-auto">
									<table className="w-full border-collapse border border-gray-300">
										<thead>
											<tr className="bg-gray-50">
												<th className="border border-gray-300 px-3 py-2 text-left text-xs sm:text-sm font-medium text-gray-700">
													Date
												</th>
												<th className="border border-gray-300 px-3 py-2 text-left text-xs sm:text-sm font-medium text-gray-700">
													Day
												</th>
												<th className="border border-gray-300 px-3 py-2 text-left text-xs sm:text-sm font-medium text-gray-700">
													Time In
												</th>
												<th className="border border-gray-300 px-3 py-2 text-left text-xs sm:text-sm font-medium text-gray-700">
													Time Out
												</th>
												<th className="border border-gray-300 px-3 py-2 text-left text-xs sm:text-sm font-medium text-gray-700">
													Hours
												</th>
												<th className="border border-gray-300 px-3 py-2 text-left text-xs sm:text-sm font-medium text-gray-700">
													Status
												</th>
												<th className="border border-gray-300 px-3 py-2 text-left text-xs sm:text-sm font-medium text-gray-700">
													Remarks
												</th>
											</tr>
										</thead>
										<tbody>
											{filteredDTR.map((record, index) => (
												<tr key={index} className="hover:bg-gray-50">
													<td className="border border-gray-300 px-3 py-2 text-xs sm:text-sm">
														{record.date}
													</td>
													<td className="border border-gray-300 px-3 py-2 text-xs sm:text-sm">
														{record.day}
													</td>
													<td className="border border-gray-300 px-3 py-2 text-xs sm:text-sm">
														{record.timeIn}
													</td>
													<td className="border border-gray-300 px-3 py-2 text-xs sm:text-sm">
														{record.timeOut}
													</td>
													<td className="border border-gray-300 px-3 py-2 text-xs sm:text-sm">
														{record.hours}
													</td>
													<td className="border border-gray-300 px-3 py-2 text-xs sm:text-sm">
														<Badge
															variant={
																record.status === "present"
																	? "default"
																	: "secondary"
															}
															className="text-xs"
														>
															{record.status}
														</Badge>
													</td>
													<td className="border border-gray-300 px-3 py-2 text-xs sm:text-sm">
														{record.remarks}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>

								{/* Mobile Card View */}
								<div className="md:hidden space-y-3">
									{filteredDTR.map((record, index) => (
										<Card key={index} className="p-4">
											<div className="space-y-3">
												{/* Header Row */}
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2">
														<Calendar className="w-4 h-4 text-gray-500" />
														<span className="font-medium text-sm">
															{record.date}
														</span>
													</div>
													<Badge
														variant={
															record.status === "present"
																? "default"
																: "secondary"
														}
														className="text-xs"
													>
														{record.status}
													</Badge>
												</div>

												{/* Day */}
												<div className="text-sm text-gray-600">
													<span className="font-medium">Day:</span> {record.day}
												</div>

												{/* Time Row */}
												<div className="grid grid-cols-2 gap-4">
													<div className="text-sm">
														<span className="font-medium text-gray-700">
															Time In:
														</span>
														<div className="text-gray-900">{record.timeIn}</div>
													</div>
													<div className="text-sm">
														<span className="font-medium text-gray-700">
															Time Out:
														</span>
														<div className="text-gray-900">
															{record.timeOut}
														</div>
													</div>
												</div>

												{/* Hours and Remarks */}
												<div className="grid grid-cols-2 gap-4">
													<div className="text-sm">
														<span className="font-medium text-gray-700">
															Hours:
														</span>
														<div className="text-gray-900 font-semibold">
															{record.hours}
														</div>
													</div>
													<div className="text-sm">
														<span className="font-medium text-gray-700">
															Remarks:
														</span>
														<div className="text-gray-900">
															{record.remarks}
														</div>
													</div>
												</div>
											</div>
										</Card>
									))}
								</div>
							</div>

							{/* No Records Message */}
							{filteredDTR.length === 0 && (
								<div className="text-center py-8 text-gray-500">
									<Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
									<p className="text-sm sm:text-base">
										No time records found for the selected criteria.
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
