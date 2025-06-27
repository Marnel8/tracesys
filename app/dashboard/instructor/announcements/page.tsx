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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
	Plus,
	MessageSquare,
	Edit,
	Trash2,
	Eye,
	Calendar,
	Users,
} from "lucide-react";

// Mock data for announcements
const announcements = [
	{
		id: 1,
		title: "Weekly Report Reminder",
		content:
			"Don't forget to submit your weekly reports by Friday, 5:00 PM. Late submissions will not be accepted.",
		targetSections: ["BSIT 4A", "BSIT 4B"],
		targetCourses: ["BSIT"],
		priority: "High",
		status: "Published",
		createdAt: "2024-01-15T10:00:00Z",
		comments: 5,
		views: 42,
	},
	{
		id: 2,
		title: "New Requirement Added",
		content:
			"A new requirement has been added to your practicum checklist: Medical Certificate. Please submit this as soon as possible.",
		targetSections: ["BSIT 4A"],
		targetCourses: ["BSIT"],
		priority: "Medium",
		status: "Published",
		createdAt: "2024-01-14T14:30:00Z",
		comments: 8,
		views: 28,
	},
	{
		id: 3,
		title: "Practicum Evaluation Schedule",
		content:
			"The mid-term practicum evaluation will be conducted next week. Please coordinate with your agency supervisors.",
		targetSections: ["BSIT 4A", "BSIT 4B", "BSIT 4C", "BSIT 4D"],
		targetCourses: ["BSIT"],
		priority: "High",
		status: "Draft",
		createdAt: "2024-01-13T09:15:00Z",
		comments: 0,
		views: 0,
	},
];

export default function AnnouncementsPage() {
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [newAnnouncement, setNewAnnouncement] = useState({
		title: "",
		content: "",
		targetSections: [],
		targetCourses: [],
		priority: "Medium",
	});

	const handleCreateAnnouncement = () => {
		console.log("Creating announcement:", newAnnouncement);
		setIsCreateDialogOpen(false);
		setNewAnnouncement({
			title: "",
			content: "",
			targetSections: [],
			targetCourses: [],
			priority: "Medium",
		});
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
					<p className="text-gray-600">
						Create and manage announcements for your students
					</p>
				</div>
				<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button className="bg-primary-500 hover:bg-primary-600">
							<Plus className="w-4 h-4 mr-2" />
							New Announcement
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[600px]">
						<DialogHeader>
							<DialogTitle>Create New Announcement</DialogTitle>
							<DialogDescription>
								Create a new announcement to share with your students.
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="grid gap-2">
								<Label htmlFor="title">Title</Label>
								<Input
									id="title"
									value={newAnnouncement.title}
									onChange={(e) =>
										setNewAnnouncement({
											...newAnnouncement,
											title: e.target.value,
										})
									}
									placeholder="Enter announcement title"
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="content">Content</Label>
								<Textarea
									id="content"
									value={newAnnouncement.content}
									onChange={(e) =>
										setNewAnnouncement({
											...newAnnouncement,
											content: e.target.value,
										})
									}
									placeholder="Enter announcement content"
									rows={4}
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="grid gap-2">
									<Label>Target Sections</Label>
									<Select>
										<SelectTrigger>
											<SelectValue placeholder="Select sections" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="BSIT 4A">BSIT 4A</SelectItem>
											<SelectItem value="BSIT 4B">BSIT 4B</SelectItem>
											<SelectItem value="BSIT 4C">BSIT 4C</SelectItem>
											<SelectItem value="BSIT 4D">BSIT 4D</SelectItem>
											<SelectItem value="all">All Sections</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="grid gap-2">
									<Label>Priority</Label>
									<Select
										value={newAnnouncement.priority}
										onValueChange={(value) =>
											setNewAnnouncement({
												...newAnnouncement,
												priority: value,
											})
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="Low">Low</SelectItem>
											<SelectItem value="Medium">Medium</SelectItem>
											<SelectItem value="High">High</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						</div>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setIsCreateDialogOpen(false)}
							>
								Cancel
							</Button>
							<Button
								onClick={handleCreateAnnouncement}
								className="bg-primary-500 hover:bg-primary-600"
							>
								Create Announcement
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card className="bg-secondary-50 border-primary-200">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600">Total Announcements</p>
								<p className="text-2xl font-bold text-gray-900">15</p>
							</div>
							<MessageSquare className="w-8 h-8 text-primary-600" />
						</div>
					</CardContent>
				</Card>

				<Card className="bg-secondary-50 border-green-200">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600">Published</p>
								<p className="text-2xl font-bold text-green-600">12</p>
							</div>
							<Badge className="bg-green-100 text-green-800">Active</Badge>
						</div>
					</CardContent>
				</Card>

				<Card className="bg-secondary-50 border-yellow-200">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600">Drafts</p>
								<p className="text-2xl font-bold text-yellow-600">3</p>
							</div>
							<Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
						</div>
					</CardContent>
				</Card>

				<Card className="bg-secondary-50 border-blue-200">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600">Total Views</p>
								<p className="text-2xl font-bold text-blue-600">342</p>
							</div>
							<Eye className="w-8 h-8 text-blue-600" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Announcements List */}
			<div className="space-y-4">
				{announcements.map((announcement) => (
					<Card
						key={announcement.id}
						className="hover:shadow-md transition-shadow"
					>
						<CardHeader>
							<div className="flex justify-between items-start">
								<div className="flex-1">
									<div className="flex items-center gap-3 mb-2">
										<CardTitle className="text-lg">
											{announcement.title}
										</CardTitle>
										<Badge
											variant={
												announcement.priority === "High"
													? "destructive"
													: "secondary"
											}
											className={
												announcement.priority === "High"
													? "bg-red-100 text-red-800"
													: announcement.priority === "Medium"
													? "bg-yellow-100 text-yellow-800"
													: "bg-gray-100 text-gray-800"
											}
										>
											{announcement.priority}
										</Badge>
										<Badge
											variant={
												announcement.status === "Published"
													? "default"
													: "secondary"
											}
											className={
												announcement.status === "Published"
													? "bg-green-100 text-green-800"
													: "bg-gray-100 text-gray-800"
											}
										>
											{announcement.status}
										</Badge>
									</div>
									<CardDescription className="text-base mb-3">
										{announcement.content}
									</CardDescription>
									<div className="flex items-center gap-4 text-sm text-gray-600">
										<div className="flex items-center gap-1">
											<Calendar className="w-4 h-4" />
											{formatDate(announcement.createdAt)}
										</div>
										<div className="flex items-center gap-1">
											<Users className="w-4 h-4" />
											{announcement.targetSections.join(", ")} •{" "}
											{announcement.targetCourses.join(", ")}
										</div>
										<div className="flex items-center gap-1">
											<Eye className="w-4 h-4" />
											{announcement.views} views
										</div>
										<div className="flex items-center gap-1">
											<MessageSquare className="w-4 h-4" />
											{announcement.comments} comments
										</div>
									</div>
								</div>
								<div className="flex gap-2">
									<Button variant="outline" size="sm">
										<Eye className="w-4 h-4" />
									</Button>
									<Button variant="outline" size="sm">
										<Edit className="w-4 h-4" />
									</Button>
									<Button
										variant="outline"
										size="sm"
										className="text-red-600 hover:text-red-700"
									>
										<Trash2 className="w-4 h-4" />
									</Button>
								</div>
							</div>
						</CardHeader>
					</Card>
				))}
			</div>
		</div>
	);
}
