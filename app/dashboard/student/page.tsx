"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
	Clock,
	FileText,
	CheckCircle,
	AlertCircle,
	Calendar,
	Camera,
	Upload,
	User,
} from "lucide-react";

export default function StudentDashboard() {
	return (
		<div className="px-4 md:px-8 lg:px-16">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">
					Student Dashboard
				</h1>
				<p className="text-gray-600">
					Welcome back! Track your practicum progress and submissions.
				</p>
			</div>

			{/* Progress Overview */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				<Card className="bg-secondary-50 border-primary-200">
					<CardHeader className="pb-3">
						<CardTitle className="text-lg flex items-center gap-2">
							<Clock className="w-5 h-5 text-primary-600" />
							Hours Progress
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							<div className="flex justify-between text-sm">
								<span>Completed</span>
								<span className="font-medium">240 / 400 hours</span>
							</div>
							<Progress value={60} className="h-2" />
							<p className="text-xs text-gray-600">160 hours remaining</p>
						</div>
					</CardContent>
				</Card>

				<Card className="bg-secondary-50 border-primary-200">
					<CardHeader className="pb-3">
						<CardTitle className="text-lg flex items-center gap-2">
							<FileText className="w-5 h-5 text-accent-600" />
							Requirements
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<div className="flex justify-between items-center">
								<span className="text-sm">Submitted</span>
								<Badge
									variant="secondary"
									className="bg-green-100 text-green-800"
								>
									8/10
								</Badge>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm">Pending</span>
								<Badge
									variant="secondary"
									className="bg-yellow-100 text-yellow-800"
								>
									2
								</Badge>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="bg-secondary-50 border-primary-200">
					<CardHeader className="pb-3">
						<CardTitle className="text-lg flex items-center gap-2">
							<CheckCircle className="w-5 h-5 text-green-600" />
							Attendance
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<div className="flex justify-between items-center">
								<span className="text-sm">This Week</span>
								<Badge
									variant="secondary"
									className="bg-green-100 text-green-800"
								>
									5/5 days
								</Badge>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm">Overall</span>
								<span className="text-sm font-medium">95%</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Quick Actions */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
				<Link href="/dashboard/student/attendance">
					<Button className="h-20 flex-col gap-2  hover:bg-green-100 w-full border border-green-300">
						<Camera className="w-6 h-6" />
						<span>Log Attendance</span>
					</Button>
				</Link>
				<Link href="/dashboard/student/reports">
					<Button
						variant="outline"
						className="h-20 flex-col gap-2 border-accent-300 hover:bg-accent-50 w-full"
					>
						<Upload className="w-6 h-6" />
						<span>Submit Report</span>
					</Button>
				</Link>
				<Link href="/dashboard/student/requirements">
					<Button
						variant="outline"
						className="h-20 flex-col gap-2 border-primary-300 hover:bg-primary-50 w-full"
					>
						<FileText className="w-6 h-6" />
						<span>Requirements</span>
					</Button>
				</Link>
				<Link href="/dashboard/student/profile">
					<Button
						variant="outline"
						className="h-20 flex-col gap-2 border-gray-300 hover:bg-gray-50 w-full"
					>
						<User className="w-6 h-6" />
						<span>Profile</span>
					</Button>
				</Link>
			</div>

			{/* Recent Activity */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<AlertCircle className="w-5 h-5 text-yellow-600" />
							Recent Announcements
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="border-l-4 border-primary-500 pl-4 py-2">
							<h4 className="font-medium text-gray-900">
								Weekly Report Reminder
							</h4>
							<p className="text-sm text-gray-600">
								Don't forget to submit your weekly report by Friday.
							</p>
							<p className="text-xs text-gray-500 mt-1">2 hours ago</p>
						</div>
						<div className="border-l-4 border-accent-500 pl-4 py-2">
							<h4 className="font-medium text-gray-900">
								New Requirement Added
							</h4>
							<p className="text-sm text-gray-600">
								Medical Certificate requirement has been added to your list.
							</p>
							<p className="text-xs text-gray-500 mt-1">1 day ago</p>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Calendar className="w-5 h-5 text-primary-600" />
							Upcoming Deadlines
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
							<div>
								<h4 className="font-medium text-gray-900">Weekly Report #8</h4>
								<p className="text-sm text-gray-600">Due in 2 days</p>
							</div>
							<Badge
								variant="secondary"
								className="bg-yellow-100 text-yellow-800"
							>
								Pending
							</Badge>
						</div>
						<div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
							<div>
								<h4 className="font-medium text-gray-900">
									Medical Certificate
								</h4>
								<p className="text-sm text-gray-600">Due in 5 days</p>
							</div>
							<Badge variant="secondary" className="bg-red-100 text-red-800">
								Urgent
							</Badge>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
