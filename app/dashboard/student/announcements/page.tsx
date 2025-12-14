"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Calendar, Pin, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/auth/useAuth";
import { useAnnouncements } from "@/hooks/announcement/useAnnouncement";

export default function StudentAnnouncementsPage() {
  const { user } = useAuth();
  const studentId = (user as any)?.id as string | undefined;

  const { data: announcementsData, isLoading } = useAnnouncements({
    userId: studentId,
    page: 1,
    limit: 100, // Get all announcements
  });

  const announcements = useMemo(() => {
    return (
      (announcementsData as any)?.announcements ??
      (announcementsData as any)?.data?.announcements ??
      []
    );
  }, [announcementsData]);

  // Sort announcements: pinned first, then by date (newest first)
  const sortedAnnouncements = useMemo(() => {
    return [...announcements].sort((a: any, b: any) => {
      // Pinned announcements first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // Then by date (newest first)
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
  }, [announcements]);

  if (isLoading) {
    return (
      <div className="px-4 md:px-8 lg:px-16 py-8">
        <div className="text-center text-gray-500">Loading announcements...</div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 lg:px-16 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
          <Link href="/dashboard/student">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 sm:gap-2 -ml-2 sm:ml-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Announcements
        </h1>
        <p className="text-gray-600">
          View all announcements and important updates.
        </p>
      </div>

      {/* Announcements List */}
      {sortedAnnouncements.length === 0 ? (
        <Card className="border border-primary-200 shadow-sm">
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No announcements available.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedAnnouncements.map((announcement: any) => (
            <Card
              key={announcement.id}
              className={`border ${
                announcement.isPinned
                  ? "border-primary-500 bg-primary-50/30"
                  : "border-primary-200"
              } shadow-sm`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {announcement.isPinned && (
                        <Pin className="w-4 h-4 text-primary-600 fill-primary-600" />
                      )}
                      <CardTitle className="text-xl">{announcement.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(announcement.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                      {announcement.status && (
                        <Badge
                          variant="secondary"
                          className="bg-primary-50 text-primary-700"
                        >
                          {announcement.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {announcement.content}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

