"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Upload,
	FileText,
	Calendar,
	Clock,
	ArrowLeft,
	Plus,
	Eye,
	Download,
} from "lucide-react";
import Link from "next/link";

export default function ReportsPage() {
	const [reportTitle, setReportTitle] = useState("");
	const [reportContent, setReportContent] = useState("");
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

	const submittedReports = [
		{
			id: 1,
			title: "Weekly Report #8",
			date: "2024-01-15",
			status: "submitted",
			feedback: "Good progress on project tasks",
			dueDate: "2024-01-17",
		},
		{
			id: 2,
			title: "Weekly Report #7",
			date: "2024-01-08",
			status: "approved",
			feedback: "Excellent work on documentation",
			dueDate: "2024-01-10",
		},
		{
			id: 3,
			title: "Monthly Progress Report",
			date: "2024-01-01",
			status: "approved",
			feedback: "Comprehensive analysis",
			dueDate: "2024-01-05",
		},
	];

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setSelectedFiles(Array.from(e.target.files));
		}
	};

	const handleSubmitReport = () => {
		// TODO: Submit report logic
		console.log("Submitting report:", {
			reportTitle,
			reportContent,
			selectedFiles,
		});
		// Reset form
		setReportTitle("");
		setReportContent("");
		setSelectedFiles([]);
	};

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
				<h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
					Reports
				</h1>
				<p className="text-gray-600 text-sm md:text-base">
					Submit your weekly and monthly reports.
				</p>
			</div>

			<div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
				{/* Submit New Report */}
				<div className="xl:col-span-2 space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Plus className="w-5 h-5" />
								Submit New Report
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="report-title">Report Title</Label>
								<Input
									id="report-title"
									placeholder="e.g., Weekly Report #9"
									value={reportTitle}
									onChange={(e) => setReportTitle(e.target.value)}
									className="w-full"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="report-content">Report Content</Label>
								<Textarea
									id="report-content"
									placeholder="Describe your activities, accomplishments, challenges, and learnings..."
									value={reportContent}
									onChange={(e) => setReportContent(e.target.value)}
									className="min-h-[200px] resize-none"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="file-upload">Attachments (Optional)</Label>
								<div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
									<div className="text-center">
										<Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
										<p className="text-sm text-gray-600 mb-2">
											Drag and drop files here, or click to browse
										</p>
										<Input
											id="file-upload"
											type="file"
											multiple
											accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
											onChange={handleFileSelect}
											className="hidden"
										/>
										<Button
											variant="outline"
											onClick={() =>
												document.getElementById("file-upload")?.click()
											}
										>
											Choose Files
										</Button>
									</div>
								</div>

								{selectedFiles.length > 0 && (
									<div className="space-y-2">
										<p className="text-sm font-medium">Selected Files:</p>
										{selectedFiles.map((file, index) => (
											<div
												key={index}
												className="flex items-center justify-between p-2 bg-gray-50 rounded"
											>
												<span className="text-sm truncate">{file.name}</span>
												<span className="text-xs text-gray-500">
													{(file.size / 1024 / 1024).toFixed(2)} MB
												</span>
											</div>
										))}
									</div>
								)}
							</div>

							<div className="flex gap-2 pt-4">
								<Button
									onClick={handleSubmitReport}
									disabled={!reportTitle || !reportContent}
									className="bg-primary-500 hover:bg-primary-600 flex-1 sm:flex-none"
								>
									<Upload className="w-4 h-4 mr-2" />
									Submit Report
								</Button>
								<Button
									variant="outline"
									onClick={() => {
										setReportTitle("");
										setReportContent("");
										setSelectedFiles([]);
									}}
								>
									Clear
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Report History */}
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<FileText className="w-5 h-5" />
								Report History
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{submittedReports.map((report) => (
									<div
										key={report.id}
										className="border rounded-lg p-4 space-y-3"
									>
										<div className="flex items-start justify-between gap-2">
											<h4 className="font-medium text-sm leading-tight">
												{report.title}
											</h4>
											<Badge
												variant="secondary"
												className={
													report.status === "approved"
														? "bg-green-100 text-green-800"
														: report.status === "submitted"
														? "bg-blue-100 text-blue-800"
														: "bg-yellow-100 text-yellow-800"
												}
											>
												{report.status}
											</Badge>
										</div>

										<div className="space-y-2 text-xs text-gray-600">
											<div className="flex items-center gap-2">
												<Calendar className="w-3 h-3" />
												<span>Submitted: {report.date}</span>
											</div>
											<div className="flex items-center gap-2">
												<Clock className="w-3 h-3" />
												<span>Due: {report.dueDate}</span>
											</div>
										</div>

										{report.feedback && (
											<div className="bg-gray-50 p-2 rounded text-xs">
												<p className="font-medium text-gray-900 mb-1">
													Feedback:
												</p>
												<p className="text-gray-600">{report.feedback}</p>
											</div>
										)}

										<div className="flex gap-2">
											<Button size="sm" variant="outline" className="flex-1">
												<Eye className="w-3 h-3 mr-1" />
												View
											</Button>
											<Button size="sm" variant="outline" className="flex-1">
												<Download className="w-3 h-3 mr-1" />
												Download
											</Button>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Quick Stats */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Report Stats</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex justify-between items-center">
								<span className="text-sm">Total Submitted</span>
								<Badge
									variant="secondary"
									className="bg-blue-100 text-blue-800"
								>
									12
								</Badge>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm">Approved</span>
								<Badge
									variant="secondary"
									className="bg-green-100 text-green-800"
								>
									10
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
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
