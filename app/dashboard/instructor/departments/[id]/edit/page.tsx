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
import { Checkbox } from "@/components/ui/checkbox";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
	ArrowLeft,
	Save,
} from "lucide-react";
import { useDepartment, useUpdateDepartment } from "@/hooks/department";
import { toast } from "sonner";

const departmentSchema = z.object({
	name: z.string().min(2, "Department name must be at least 2 characters"),
	code: z.string().min(2, "Department code must be at least 2 characters"),
	description: z.string().optional(),
	isActive: z.boolean(),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

interface EditDepartmentPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function EditDepartmentPage({ params }: EditDepartmentPageProps) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	
	// Unwrap params using React.use()
	const { id } = use(params);

	// Fetch department data
	const { data: department, isLoading: departmentLoading } = useDepartment(id);

	// Update department mutation
	const updateDepartment = useUpdateDepartment();

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		reset,
		formState: { errors },
	} = useForm<DepartmentFormData>({
		resolver: zodResolver(departmentSchema),
		defaultValues: {
			name: "",
			code: "",
			description: "",
			isActive: true,
		},
	});

	// Reset form when department data is loaded
	useEffect(() => {
		if (department) {
			reset({
				name: department.name,
				code: department.code,
				description: department.description || "",
				isActive: department.isActive,
			});
		}
	}, [department, reset]);

	const onSubmit: SubmitHandler<DepartmentFormData> = async (data) => {
		setIsSubmitting(true);
		
		updateDepartment.mutate(
			{ id, data },
			{
				onSuccess: () => {
					toast.success("Department updated successfully!");
					router.push(`/dashboard/instructor/departments/${id}`);
				},
				onError: (error: any) => {
					toast.error(error.response?.data?.message || "Failed to update department");
				},
				onSettled: () => {
					setIsSubmitting(false);
				},
			}
		);
	};

	const watchIsActive = watch("isActive");

	if (departmentLoading) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
			</div>
		);
	}

	if (!department) {
		return (
			<div className="text-center py-8">
				<p className="text-gray-500">Department not found</p>
				<Button
					variant="outline"
					onClick={() => router.push("/dashboard/instructor/departments")}
					className="mt-4"
				>
					<ArrowLeft className="w-4 h-4 mr-2" />
					Back to Departments
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
					<h1 className="text-3xl font-bold text-gray-900">Edit Department</h1>
					<p className="text-gray-600">
						Update department information and settings
					</p>
				</div>
			</div>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Department Information */}
					<div className="lg:col-span-2 space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Department Information</CardTitle>
								<CardDescription>
									Basic department details and academic information
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="name">Department Name *</Label>
										<Input
											id="name"
											{...register("name")}
											placeholder="e.g., College of Arts, Sciences, and Technology"
										/>
										{errors.name && (
											<p className="text-sm text-red-600">
												{errors.name.message}
											</p>
										)}
									</div>
									<div className="space-y-2">
										<Label htmlFor="code">Department Code *</Label>
										<Input
											id="code"
											{...register("code")}
											placeholder="e.g., CAST"
										/>
										{errors.code && (
											<p className="text-sm text-red-600">
												{errors.code.message}
											</p>
										)}
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="description">Description</Label>
									<Textarea
										id="description"
										{...register("description")}
										placeholder="Enter department description..."
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

					{/* Department Settings */}
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Department Settings</CardTitle>
								<CardDescription>
									Configure department status and availability
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
										Active Department
									</Label>
								</div>
								<p className="text-sm text-gray-500">
									Active departments are available for course creation and student enrollment.
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Department Details</CardTitle>
								<CardDescription>
									Current department information
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-2 text-sm">
								<div className="flex justify-between">
									<span className="text-gray-500">Created:</span>
									<span>{new Date(department.createdAt).toLocaleDateString()}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-500">Last Updated:</span>
									<span>{new Date(department.updatedAt).toLocaleDateString()}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-500">Courses:</span>
									<span>{department.courses?.length || 0}</span>
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
								disabled={isSubmitting || updateDepartment.isPending}
								className="bg-primary-500 hover:bg-primary-600"
							>
								{isSubmitting || updateDepartment.isPending ? (
									<>
										<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
										Updating Department...
									</>
								) : (
									<>
										<Save className="w-4 h-4 mr-2" />
										Update Department
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
