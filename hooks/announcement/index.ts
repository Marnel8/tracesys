export {
	useAnnouncements,
	usePublicAnnouncements,
	useAnnouncement,
	useAnnouncementStats,
	useCreateAnnouncement,
	useUpdateAnnouncement,
	useDeleteAnnouncement,
	useToggleAnnouncementPin,
	useAnnouncementComments,
	useCreateAnnouncementComment,
	useDeleteAnnouncementComment,
	announcementKeys,
} from "./useAnnouncement";

export { useStudentAnnouncementNotifications } from "./useStudentAnnouncementNotifications";

export type {
	Announcement,
	AnnouncementFormData,
	AnnouncementFilters,
	AnnouncementResponse,
	AnnouncementComment,
	CommentFormData,
	CommentFilters,
	CommentResponse,
	AnnouncementStats,
} from "@/data/announcements";
