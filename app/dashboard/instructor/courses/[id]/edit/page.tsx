"use client";

import type React from "react";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
	ArrowLeft,
	Save,
} from "lucide-react";
import { useCourse, useUpdateCourse } from "@/hooks/course";
import { useDepartments } from "@/hooks/department";
import { toast } from "sonner";

const courseSchema = z.object({
	name: z.string().min(2, "Course name must be at least 2 characters"),
	code: z.string().min(2, "Course code must be at least 2 characters"),
	description: z.string().optional(),
	departmentId: z.string().min(1, "Please select a department"),
	isActive: z.boolean(),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface EditCoursePageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function EditCoursePage({ params }: EditCoursePageProps) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	
	// Unwrap params using React.use()
	const { id } = use(params);

	// Fetch course and departments
	const { data: course, isLoading: courseLoading } = useCourse(id);
	const { data: departmentsData } = useDepartments({ status: "active" });

	// Update course mutation
	const updateCourse = useUpdateCourse();

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		reset,
		formState: { errors },
	} = useForm<CourseFormData>({
		resolver: zodResolver(courseSchema),
		defaultValues: {
			name: "",
			code: "",
			description: "",
			departmentId: "",
			isActive: true,
		},
	});
	const getDepartment = departmentsData?.departments.find((department) => department.id === course?.departmentId);

	// Reset form when course data is loaded
	useEffect(() => {
		if (course) {
			reset({
				name: course.name,
				code: course.code,
				description: course.description || "",
				departmentId: course.departmentId,
				isActive: course.isActive,
			});
		}
	}, [course, reset]);

	const onSubmit: SubmitHandler<CourseFormData> = async (data) => {
		setIsSubmitting(true);
		
		updateCourse.mutate(
			{ id, data },
			{
				onSuccess: () => {
					toast.success("Course updated successfully!");
					router.push(`/dashboard/instructor/courses/${id}`);
				},
				onError: (error: any) => {
					toast.error(error.response?.data?.message || "Failed to update course");
				},
				onSettled: () => {
					setIsSubmitting(false);
				},
			}
		);
	};

	const watchIsActive = watch("isActive");

	if (courseLoading) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
			</div>
		);
	}

	if (!course) {
		return (
			<div className="text-center py-8">
				<p className="text-gray-500">Course not found</p>
				<Button
					variant="outline"
					onClick={() => router.push("/dashboard/instructor/courses")}
					className="mt-4"
				>
					<ArrowLeft className="w-4 h-4 mr-2" />
					Back to Courses
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button variant="outline" size="sm" onClick={() => router.back()}>
					<ArrowLeft className="w-4 h-4 mr-2" />
					Back
				</Button>
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Edit Course</h1>
					<p className="text-gray-600">
						Update course information and settings
					</p>
				</div>
			</div>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Course Information */}
					<div className="lg:col-span-2 space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Course Information</CardTitle>
								<CardDescription>
									Basic course details and academic information
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="name">Course Name *</Label>
										<Input
											id="name"
											{...register("name")}
											placeholder="e.g., Bachelor of Science in Information Technology"
										/>
										{errors.name && (
											<p className="text-sm text-red-600">
												{errors.name.message}
											</p>
										)}
									</div>
									<div className="space-y-2">
										<Label htmlFor="code">Course Code *</Label>
										<Input
											id="code"
											{...register("code")}
											placeholder="e.g., BSIT"
										/>
										{errors.code && (
											<p className="text-sm text-red-600">
												{errors.code.message}
											</p>
										)}
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="departmentId">Department *</Label>
									<Select
										value={watch("departmentId")}
										onValueChange={(value) => setValue("departmentId", value)}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select department">
												{getDepartment ? `${getDepartment?.name} (${getDepartment.code})` : "Select department"}
											</SelectValue>
										</SelectTrigger>
										<SelectContent>
											{departmentsData?.departments.map((department) => (
												<SelectItem key={department.id} value={department.id}>
													{department.name} ({department.code})
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{errors.departmentId && (
										<p className="text-sm text-red-600">
											{errors.departmentId.message}
										</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="description">Description</Label>
									<Textarea
										id="description"
										{...register("description")}
										placeholder="Enter course description..."
										rows={4}
									/>
									{errors.description && (
										<p className="text-sm text-red-600">
											{errors.description.message}
										</p>
									)}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Course Settings */}
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Course Settings</CardTitle>
								<CardDescription>
									Configure course status and availability
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center space-x-2">
									<Checkbox
										id="isActive"
										{...register("isActive")}
										checked={watchIsActive}
										onCheckedChange={(checked) => setValue("isActive", checked as boolean)}
									/>
									<Label htmlFor="isActive">
										Active Course
									</Label>
								</div>
								<p className="text-sm text-gray-500">
									Active courses are available for student enrollment and section creation.
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Course Details</CardTitle>
								<CardDescription>
									Current course information
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-2 text-sm">
								<div className="flex justify-between">
									<span className="text-gray-500">Created:</span>
									<span>{new Date(course.createdAt).toLocaleDateString()}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-500">Last Updated:</span>
									<span>{new Date(course.updatedAt).toLocaleDateString()}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-500">Sections:</span>
									<span>{course.sections?.length || 0}</span>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* Form Actions */}
				<Card>
					<CardContent className="pt-6">
						<div className="flex justify-end gap-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => router.back()}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isSubmitting || updateCourse.isPending}
								className="bg-primary-500 hover:bg-primary-600"
							>
								{isSubmitting || updateCourse.isPending ? (
									<>
										<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
										Updating Course...
									</>
								) : (
									<>
										<Save className="w-4 h-4 mr-2" />
										Update Course
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
