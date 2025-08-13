"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
	FileText,
	Upload,
	CheckCircle,
	Clock,
	AlertTriangle,
	ArrowLeft,
	Eye,
	Download,
	Search,
} from "lucide-react";
import Link from "next/link";

export default function RequirementsPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");

	const requirements = [
		{
			id: 1,
			title: "Medical Certificate",
			description: "Valid medical certificate from authorized physician",
			category: "health",
			status: "pending",
			dueDate: "2024-01-20",
			priority: "urgent",
			submitted: false,
			feedback: null,
		},
		{
			id: 2,
			title: "Weekly Report #8",
			description: "Weekly progress report for week 8",
			category: "reports",
			status: "submitted",
			dueDate: "2024-01-17",
			priority: "high",
			submitted: true,
			submittedDate: "2024-01-15",
			feedback: "Good progress documentation",
		},
		{
			id: 3,
			title: "Training Certificate",
			description: "Safety training completion certificate",
			category: "training",
			status: "approved",
			dueDate: "2024-01-10",
			priority: "medium",
			submitted: true,
			submittedDate: "2024-01-08",
			feedback: "Certificate validated successfully",
		},
		{
			id: 4,
			title: "Portfolio Documentation",
			description: "Complete portfolio of project work",
			category: "academic",
			status: "in-progress",
			dueDate: "2024-02-01",
			priority: "high",
			submitted: false,
			feedback: null,
		},
		{
			id: 5,
			title: "Supervisor Evaluation",
			description: "Mid-term evaluation from supervisor",
			category: "evaluation",
			status: "approved",
			dueDate: "2024-01-05",
			priority: "high",
			submitted: true,
			submittedDate: "2024-01-03",
			feedback: "Excellent performance rating",
		},
	];

	const categories = [
		{ value: "all", label: "All Requirements" },
		{ value: "health", label: "Health & Safety" },
		{ value: "reports", label: "Reports" },
		{ value: "training", label: "Training" },
		{ value: "academic", label: "Academic" },
		{ value: "evaluation", label: "Evaluations" },
	];

	const filteredRequirements = requirements.filter((req) => {
		const matchesSearch =
			req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			req.description.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesCategory =
			selectedCategory === "all" || req.category === selectedCategory;
		return matchesSearch && matchesCategory;
	});

	const getStatusColor = (status: string) => {
		switch (status) {
			case "approved":
				return "bg-green-100 text-green-800";
			case "submitted":
				return "bg-blue-100 text-blue-800";
			case "in-progress":
				return "bg-yellow-100 text-yellow-800";
			case "pending":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case "urgent":
				return "text-red-600";
			case "high":
				return "text-orange-600";
			case "medium":
				return "text-yellow-600";
			case "low":
				return "text-green-600";
			default:
				return "text-gray-600";
		}
	};

	const completedCount = requirements.filter(
		(req) => req.status === "approved"
	).length;
	const totalCount = requirements.length;
	const completionPercentage = (completedCount / totalCount) * 100;

	return (
		<div className="px-4 md:px-8 lg:px-16">
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
				<h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
					Requirements
				</h1>
				<p className="text-gray-600 text-sm md:text-base">
					Track and submit your practicum requirements.
				</p>
			</div>

			{/* Progress Overview */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm font-medium">Completion Rate</span>
							<span className="text-sm text-gray-600">
								{completedCount}/{totalCount}
							</span>
						</div>
						<Progress value={completionPercentage} className="h-2 mb-2" />
						<span className="text-xs text-gray-500">
							{completionPercentage.toFixed(0)}% Complete
						</span>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2 mb-2">
							<CheckCircle className="w-4 h-4 text-green-600" />
							<span className="text-sm font-medium">Approved</span>
						</div>
						<span className="text-2xl font-bold text-green-600">
							{completedCount}
						</span>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2 mb-2">
							<Clock className="w-4 h-4 text-yellow-600" />
							<span className="text-sm font-medium">Pending</span>
						</div>
						<span className="text-2xl font-bold text-yellow-600">
							{
								requirements.filter(
									(req) =>
										req.status === "pending" || req.status === "in-progress"
								).length
							}
						</span>
					</CardContent>
				</Card>
			</div>

			{/* Filters */}
			<Card className="mb-6">
				<CardContent className="p-4">
					<div className="flex flex-col sm:flex-row gap-4">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
							<Input
								placeholder="Search requirements..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10"
							/>
						</div>
						<div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
							{categories.map((category) => (
								<Button
									key={category.value}
									variant={
										selectedCategory === category.value ? "default" : "outline"
									}
									size="sm"
									onClick={() => setSelectedCategory(category.value)}
									className="whitespace-nowrap"
								>
									{category.label}
								</Button>
							))}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Requirements List */}
			<div className="space-y-4">
				{filteredRequirements.map((requirement) => (
					<Card
						key={requirement.id}
						className="hover:shadow-md transition-shadow"
					>
						<CardContent className="p-4 md:p-6">
							<div className="flex flex-col lg:flex-row lg:items-center gap-4">
								<div className="flex-1 space-y-3">
									<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
										<div className="space-y-1">
											<h3 className="font-semibold text-gray-900 leading-tight">
												{requirement.title}
											</h3>
											<p className="text-sm text-gray-600 leading-relaxed">
												{requirement.description}
											</p>
										</div>
										<div className="flex items-center gap-2 flex-shrink-0">
											<Badge
												variant="secondary"
												className={getStatusColor(requirement.status)}
											>
												{requirement.status.replace("-", " ")}
											</Badge>
											<div className="flex items-center gap-1">
												<AlertTriangle
													className={`w-3 h-3 ${getPriorityColor(
														requirement.priority
													)}`}
												/>
												<span
													className={`text-xs font-medium ${getPriorityColor(
														requirement.priority
													)}`}
												>
													{requirement.priority}
												</span>
											</div>
										</div>
									</div>

									<div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-gray-500">
										<div className="flex items-center gap-1">
											<Clock className="w-3 h-3" />
											<span>Due: {requirement.dueDate}</span>
										</div>
										{requirement.submitted && requirement.submittedDate && (
											<div className="flex items-center gap-1">
												<CheckCircle className="w-3 h-3 text-green-600" />
												<span>Submitted: {requirement.submittedDate}</span>
											</div>
										)}
									</div>

									{requirement.feedback && (
										<div className="bg-blue-50 p-3 rounded-lg">
											<p className="text-xs font-medium text-blue-900 mb-1">
												Feedback:
											</p>
											<p className="text-xs text-blue-800">
												{requirement.feedback}
											</p>
										</div>
									)}
								</div>

								<div className="flex flex-row lg:flex-col gap-2 lg:w-32">
									{!requirement.submitted ? (
										<Button
											size="sm"
											className="flex-1 lg:w-full bg-primary-500 hover:bg-primary-600"
										>
											<Upload className="w-3 h-3 mr-1" />
											Submit
										</Button>
									) : (
										<>
											<Button
												size="sm"
												variant="outline"
												className="flex-1 lg:w-full"
											>
												<Eye className="w-3 h-3 mr-1" />
												View
											</Button>
											<Button
												size="sm"
												variant="outline"
												className="flex-1 lg:w-full"
											>
												<Download className="w-3 h-3 mr-1" />
												Download
											</Button>
										</>
									)}
								</div>
							</div>
						</CardContent>
					</Card>
				))}

				{filteredRequirements.length === 0 && (
					<Card>
						<CardContent className="p-8 text-center">
							<FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
							<h3 className="font-medium text-gray-900 mb-2">
								No requirements found
							</h3>
							<p className="text-sm text-gray-600">
								Try adjusting your search or filter criteria.
							</p>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
