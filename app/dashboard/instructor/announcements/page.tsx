"use client";

import React, { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  MessageSquare,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Users,
  Pin,
  Search,
  X,
  CheckCircle,
} from "lucide-react";
import { InstructorStatsCard } from "@/components/instructor-stats-card";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  useAnnouncements,
  useAnnouncement,
  useAnnouncementStats,
  useCreateAnnouncement,
  useUpdateAnnouncement,
  useDeleteAnnouncement,
  useToggleAnnouncementPin,
  AnnouncementFormData,
  AnnouncementFilters,
} from "@/hooks/announcement";
import { useAuth } from "@/hooks/auth/useAuth";
import { useSections } from "@/hooks/section/useSection";
import { useCourses } from "@/hooks/course/useCourse";

// Announcement form schema
const announcementSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(255, "Title must be less than 255 characters"),
    content: z.string().min(1, "Content is required"),
    isPinned: z.boolean(),
    targetType: z.enum(["all", "section", "course"], {
      required_error: "Please select a target type",
    }),
    targetId: z.string().optional(),
  })
  .refine(
    (data) => {
      // If targetType is not "all", targetId is required
      if (data.targetType !== "all" && !data.targetId) {
        return false;
      }
      return true;
    },
    {
      message: "Please select a target",
      path: ["targetId"],
    }
  );

type AnnouncementForm = z.infer<typeof announcementSchema>;

export default function AnnouncementsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<
    string | null
  >(null);
  const [filters, setFilters] = useState<AnnouncementFilters>({
    search: "",
    page: 1,
    limit: 10,
  });
  const [searchInput, setSearchInput] = useState("");

  // Auth hook
  const { user } = useAuth();

  // Announcement hooks
  const { data: announcementsData, isLoading: isLoadingAnnouncements } =
    useAnnouncements(filters);
  const { data: announcementStats, isLoading: isLoadingStats } =
    useAnnouncementStats(user?.id);
  const { data: selectedAnnouncementData } = useAnnouncement(
    selectedAnnouncement || ""
  );

  // Data fetching hooks for target options
  const { data: sectionsData, isLoading: isLoadingSections } = useSections({
    status: "active",
  });
  const { data: coursesData, isLoading: isLoadingCourses } = useCourses({
    status: "active",
  });

  // Mutations
  const createAnnouncement = useCreateAnnouncement();
  const updateAnnouncement = useUpdateAnnouncement();
  const deleteAnnouncement = useDeleteAnnouncement();
  const togglePin = useToggleAnnouncementPin();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AnnouncementForm>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      content: "",
      isPinned: false,
      targetType: "all",
      targetId: "",
    },
  });

  const watchedTargetType = watch("targetType");

  // Clear targetId when targetType changes to "all"
  React.useEffect(() => {
    if (watchedTargetType === "all") {
      setValue("targetId", "");
    }
  }, [watchedTargetType, setValue]);

  // Debounce search input
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const onSubmit = async (data: AnnouncementForm) => {
    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }

    const announcementData: AnnouncementFormData = {
      title: data.title,
      content: data.content,
      status: "Published",
      authorId: user.id,
      isPinned: data.isPinned,
      targets: [
        {
          targetType: data.targetType as "section" | "course" | "all",
          targetId: data.targetId || undefined,
        },
      ],
    };

    if (selectedAnnouncement) {
      updateAnnouncement.mutate({
        id: selectedAnnouncement,
        data: announcementData,
      });
    } else {
      createAnnouncement.mutate(announcementData);
    }

    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    reset();
    setSelectedAnnouncement(null);
  };

  const handleEdit = (announcementId: string) => {
    setSelectedAnnouncement(announcementId);
    setIsEditDialogOpen(true);
  };

  // Populate form when edit dialog opens and data is available
  React.useEffect(() => {
    if (isEditDialogOpen && selectedAnnouncementData && selectedAnnouncement) {
      setValue("title", selectedAnnouncementData.title);
      setValue("content", selectedAnnouncementData.content);
      setValue("isPinned", selectedAnnouncementData.isPinned);
      if (
        selectedAnnouncementData.targets &&
        selectedAnnouncementData.targets.length > 0
      ) {
        const targetType = selectedAnnouncementData.targets[0].targetType;
        // Only set targetType if it's a valid option (not "department" since we removed that option)
        if (
          targetType === "all" ||
          targetType === "section" ||
          targetType === "course"
        ) {
          setValue("targetType", targetType);
          setValue(
            "targetId",
            selectedAnnouncementData.targets[0].targetId || ""
          );
        } else {
          // If it's a department target or unknown, default to "all"
          setValue("targetType", "all");
          setValue("targetId", "");
        }
      } else {
        setValue("targetType", "all");
        setValue("targetId", "");
      }
    }
  }, [
    isEditDialogOpen,
    selectedAnnouncementData,
    selectedAnnouncement,
    setValue,
  ]);

  const handleView = (announcementId: string) => {
    setSelectedAnnouncement(announcementId);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (announcementId: string) => {
    setSelectedAnnouncement(announcementId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedAnnouncement) {
      deleteAnnouncement.mutate(selectedAnnouncement);
      setIsDeleteDialogOpen(false);
      setSelectedAnnouncement(null);
    }
  };

  const handleTogglePin = async (announcementId: string) => {
    await togglePin.mutateAsync(announcementId);
  };

  const handleCancel = () => {
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsViewDialogOpen(false);
    setIsDeleteDialogOpen(false);
    reset();
    setSelectedAnnouncement(null);
  };

  // Reset form when edit dialog closes
  React.useEffect(() => {
    if (!isEditDialogOpen && !isCreateDialogOpen) {
      reset();
    }
  }, [isEditDialogOpen, isCreateDialogOpen, reset]);

  const handleFilterChange = (key: keyof AnnouncementFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      page: 1,
      limit: 10,
    });
    setSearchInput("");
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
            <Button className="h-11 border border-primary-500 bg-primary-50 px-6 text-primary-700 transition-all duration-300 hover:border-primary-400 hover:bg-primary-50/50 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              New Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Announcement</DialogTitle>
              <DialogDescription>
                Create a new announcement to share with your students.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 py-4">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    Basic Information
                  </h3>

                  <div className="space-y-2">
                    <Label
                      htmlFor="title"
                      className="text-gray-700 font-medium"
                    >
                      Title *
                    </Label>
                    <Input
                      id="title"
                      placeholder="Enter announcement title"
                      className="border-gray-300 bg-white focus:border-primary-500 focus:ring-primary-500"
                      {...register("title")}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-600">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="content"
                      className="text-gray-700 font-medium"
                    >
                      Content *
                    </Label>
                    <Textarea
                      id="content"
                      placeholder="Enter announcement content"
                      rows={4}
                      className="border-gray-300 bg-white focus:border-primary-500 focus:ring-primary-500"
                      {...register("content")}
                    />
                    {errors.content && (
                      <p className="text-sm text-red-600">
                        {errors.content.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    Settings
                  </h3>

                  <div className="flex items-center space-x-2">
                    <Controller
                      name="isPinned"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="isPinned"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label
                      htmlFor="isPinned"
                      className="text-gray-700 font-medium flex items-center gap-2"
                    >
                      <Pin className="w-4 h-4" />
                      Pin this announcement
                    </Label>
                  </div>
                </div>

                {/* Target Audience */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    Target Audience
                  </h3>

                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">
                      Target Type *
                    </Label>
                    <Controller
                      name="targetType"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="border-gray-300 bg-white focus:border-primary-500 focus:ring-primary-500">
                            <SelectValue placeholder="Select target type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Users</SelectItem>
                            <SelectItem value="section">
                              Specific Section
                            </SelectItem>
                            {/* <SelectItem value="course">
                              Specific Course
                            </SelectItem> */}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.targetType && (
                      <p className="text-sm text-red-600">
                        {errors.targetType.message}
                      </p>
                    )}
                  </div>

                  {watchedTargetType !== "all" && (
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">
                        Select{" "}
                        {watchedTargetType === "section" ? "Section" : "Course"}
                      </Label>
                      <Controller
                        name="targetId"
                        control={control}
                        render={({ field }) => {
                          const getOptions = () => {
                            switch (watchedTargetType) {
                              case "section":
                                return (
                                  sectionsData?.sections?.map((section) => ({
                                    value: section.id,
                                    label: `${section.name} (${
                                      section.code
                                    }) - ${
                                      section.course?.name || "Unknown Course"
                                    }`,
                                  })) || []
                                );
                              case "course":
                                return (
                                  coursesData?.courses?.map((course) => ({
                                    value: course.id,
                                    label: `${course.name} (${course.code}) - ${
                                      course.department?.name ||
                                      "Unknown Department"
                                    }`,
                                  })) || []
                                );
                              default:
                                return [];
                            }
                          };

                          const isLoading =
                            (watchedTargetType === "section" &&
                              isLoadingSections) ||
                            (watchedTargetType === "course" &&
                              isLoadingCourses);

                          return (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="border-gray-300 bg-white focus:border-primary-500 focus:ring-primary-500">
                                <SelectValue
                                  placeholder={
                                    isLoading
                                      ? "Loading..."
                                      : `Select ${
                                          watchedTargetType === "section"
                                            ? "section"
                                            : "course"
                                        }`
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {getOptions().map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          );
                        }}
                      />
                      {errors.targetId && (
                        <p className="text-sm text-red-600">
                          {errors.targetId.message}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary-500 hover:bg-primary-600"
                  disabled={createAnnouncement.isPending}
                >
                  {createAnnouncement.isPending
                    ? "Creating..."
                    : "Create Announcement"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Announcement</DialogTitle>
              <DialogDescription>
                Update the announcement details.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 py-4">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    Basic Information
                  </h3>

                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-title"
                      className="text-gray-700 font-medium"
                    >
                      Title *
                    </Label>
                    <Input
                      id="edit-title"
                      placeholder="Enter announcement title"
                      className="border-gray-300 bg-white focus:border-primary-500 focus:ring-primary-500"
                      {...register("title")}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-600">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-content"
                      className="text-gray-700 font-medium"
                    >
                      Content *
                    </Label>
                    <Textarea
                      id="edit-content"
                      placeholder="Enter announcement content"
                      rows={4}
                      className="border-gray-300 bg-white focus:border-primary-500 focus:ring-primary-500"
                      {...register("content")}
                    />
                    {errors.content && (
                      <p className="text-sm text-red-600">
                        {errors.content.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    Settings
                  </h3>

                  <div className="flex items-center space-x-2">
                    <Controller
                      name="isPinned"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="edit-isPinned"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label
                      htmlFor="edit-isPinned"
                      className="text-gray-700 font-medium flex items-center gap-2"
                    >
                      <Pin className="w-4 h-4" />
                      Pin this announcement
                    </Label>
                  </div>
                </div>

                {/* Target Audience */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    Target Audience
                  </h3>

                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">
                      Target Type *
                    </Label>
                    <Controller
                      name="targetType"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="border-gray-300 bg-white focus:border-primary-500 focus:ring-primary-500">
                            <SelectValue placeholder="Select target type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Users</SelectItem>
                            <SelectItem value="section">
                              Specific Section
                            </SelectItem>
                            <SelectItem value="course">
                              Specific Course
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.targetType && (
                      <p className="text-sm text-red-600">
                        {errors.targetType.message}
                      </p>
                    )}
                  </div>

                  {watchedTargetType !== "all" && (
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">
                        Select{" "}
                        {watchedTargetType === "section" ? "Section" : "Course"}
                      </Label>
                      <Controller
                        name="targetId"
                        control={control}
                        render={({ field }) => {
                          const getOptions = () => {
                            switch (watchedTargetType) {
                              case "section":
                                return (
                                  sectionsData?.sections?.map((section) => ({
                                    value: section.id,
                                    label: `${section.name} (${
                                      section.code
                                    }) - ${
                                      section.course?.name || "Unknown Course"
                                    }`,
                                  })) || []
                                );
                              case "course":
                                return (
                                  coursesData?.courses?.map((course) => ({
                                    value: course.id,
                                    label: `${course.name} (${course.code}) - ${
                                      course.department?.name ||
                                      "Unknown Department"
                                    }`,
                                  })) || []
                                );
                              default:
                                return [];
                            }
                          };

                          const isLoading =
                            (watchedTargetType === "section" &&
                              isLoadingSections) ||
                            (watchedTargetType === "course" &&
                              isLoadingCourses);

                          return (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="border-gray-300 bg-white focus:border-primary-500 focus:ring-primary-500">
                                <SelectValue
                                  placeholder={
                                    isLoading
                                      ? "Loading..."
                                      : `Select ${
                                          watchedTargetType === "section"
                                            ? "section"
                                            : "course"
                                        }`
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {getOptions().map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          );
                        }}
                      />
                      {errors.targetId && (
                        <p className="text-sm text-red-600">
                          {errors.targetId.message}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary-500 hover:bg-primary-600"
                  disabled={updateAnnouncement.isPending}
                >
                  {updateAnnouncement.isPending
                    ? "Updating..."
                    : "Update Announcement"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Delete Announcement</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this announcement? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteAnnouncement.isPending}
              >
                {deleteAnnouncement.isPending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>View Announcement</DialogTitle>
              <DialogDescription>Announcement details.</DialogDescription>
            </DialogHeader>
            {selectedAnnouncementData && (
              <div className="space-y-6">
                {/* Announcement Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold">
                      {selectedAnnouncementData.title}
                    </h3>
                    {selectedAnnouncementData.isPinned && (
                      <Badge variant="secondary">
                        <Pin className="w-3 h-3 mr-1" />
                        Pinned
                      </Badge>
                    )}
                  </div>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedAnnouncementData.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(selectedAnnouncementData.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InstructorStatsCard
          icon={MessageSquare}
          label="Total Announcements"
          value={announcementStats?.totalAnnouncements || 0}
          helperText="All-time posts"
          isLoading={isLoadingStats}
        />
        <InstructorStatsCard
          icon={Pin}
          label="Pinned Announcements"
          value={announcementStats?.pinnedAnnouncements || 0}
          helperText="Featured posts"
          trend={
            announcementStats?.pinnedAnnouncements
              ? {
                  label: `${announcementStats.pinnedAnnouncements} pinned`,
                  variant: "positive",
                }
              : undefined
          }
          isLoading={isLoadingStats}
        />
        <InstructorStatsCard
          icon={CheckCircle}
          label="Published"
          value={announcementStats?.publishedAnnouncements || 0}
          helperText="Live to students"
          trend={
            announcementStats?.publishedAnnouncements
              ? {
                  label: `${announcementStats.publishedAnnouncements} posted`,
                  variant: "positive",
                }
              : undefined
          }
          isLoading={isLoadingStats}
        />
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search announcements..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        {searchInput && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {isLoadingAnnouncements ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading announcements...</p>
          </div>
        ) : announcementsData?.announcements?.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No announcements found</p>
          </div>
        ) : (
          announcementsData?.announcements?.map((announcement) => (
            <Card
              key={announcement.id}
              className={`hover:shadow-md transition-shadow ${
                announcement.isPinned
                  ? "ring-2 ring-primary-200 bg-primary-50/30"
                  : ""
              }`}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">
                        {announcement.title}
                      </CardTitle>
                      {announcement.isPinned && (
                        <Badge variant="secondary">
                          <Pin className="w-3 h-3 mr-1" />
                          Pinned
                        </Badge>
                      )}
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
                        {announcement.targets
                          ?.map((target) => target.targetType)
                          .join(", ") || "All"}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(announcement.id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(announcement.id)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTogglePin(announcement.id)}
                      className={
                        announcement.isPinned
                          ? "text-primary-600 hover:text-primary-700"
                          : ""
                      }
                    >
                      <Pin className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(announcement.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {announcementsData?.pagination &&
        announcementsData.pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleFilterChange("page", (filters.page || 1) - 1)
              }
              disabled={!filters.page || filters.page <= 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {filters.page || 1} of{" "}
              {announcementsData.pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleFilterChange("page", (filters.page || 1) + 1)
              }
              disabled={
                !filters.page ||
                filters.page >= announcementsData.pagination.totalPages
              }
            >
              Next
            </Button>
          </div>
        )}
    </div>
  );
}
