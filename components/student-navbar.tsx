"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";
import { useAuth, useLogout } from "@/hooks/auth/useAuth";
import { useStudent } from "@/hooks/student/useStudent";
import { useToast } from "@/hooks/use-toast";

function getInitials(name?: string) {
  if (!name) return "ST";
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (!parts.length) return "ST";
  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}

export function StudentNavbar() {
  const router = useRouter();
  const logoutMutation = useLogout();
  const { toast } = useToast();
  const { user, isLoading: isUserLoading } = useAuth();
  const normalizedUser: any = (user as any)?.data ?? user;
  const studentId = normalizedUser?.id as string | undefined;
  const { data: studentResponse, isLoading: isStudentLoading } = useStudent(
    studentId || ""
  );
  const studentRecord: any = (studentResponse as any)?.data ?? studentResponse;
  const displayName =
    [
      studentRecord?.firstName || normalizedUser?.firstName,
      studentRecord?.lastName || normalizedUser?.lastName,
    ]
      .filter(Boolean)
      .join(" ") || "Student";
  const avatarUrl =
    studentRecord?.avatar || normalizedUser?.avatar || "/placeholder-user.jpg";
  const currentEnrollment = studentRecord?.enrollments?.[0];
  const computed = studentRecord?.computed ?? {};
  const sectionName =
    currentEnrollment?.section?.name ||
    computed?.sectionName ||
    studentRecord?.section?.name;
  const courseCode =
    currentEnrollment?.section?.course?.code ||
    currentEnrollment?.section?.course?.name ||
    computed?.courseCode ||
    computed?.courseName;
  const displaySection =
    [courseCode, sectionName].filter(Boolean).join(" • ") ||
    "Section not assigned";
  const isProfileLoading = isUserLoading || (!!studentId && isStudentLoading);

  async function handleSignOut() {
    try {
      await logoutMutation.mutateAsync();
      toast({ title: "Signed out" });
    } catch {
      // ignore – still redirect
    } finally {
      router.replace("/select-role");
    }
  }

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-primary-200 bg-white">
      <div className="px-3 sm:px-4 md:px-8 lg:px-16 flex items-center justify-between w-full gap-2">
        <Link
          href="/dashboard/student"
          className="flex items-center gap-2 sm:gap-3 flex-shrink-0"
        >
          <Image
            src="/images/tracesys-logo.png"
            alt="TracèSys"
            width={28}
            height={28}
            priority
            className="w-6 h-6 sm:w-7 sm:h-7"
          />
          <span className="font-semibold text-gray-900 text-sm sm:text-base hidden sm:inline">
            TracèSys
          </span>
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-3 px-1.5 sm:px-3 py-1.5 min-w-0">
            {isProfileLoading ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-200 animate-pulse" />
                <div className="hidden sm:flex flex-col gap-1">
                  <div className="h-3 w-24 rounded bg-gray-200 animate-pulse" />
                  <div className="h-2.5 w-20 rounded bg-gray-200 animate-pulse" />
                </div>
              </div>
            ) : (
              <>
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                  <AvatarImage src={avatarUrl} alt={displayName} />
                  <AvatarFallback className="text-xs sm:text-sm">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col leading-tight min-w-0">
                  <span className="text-sm font-semibold text-gray-900 truncate max-w-[120px] md:max-w-none">
                    {displayName}
                  </span>
                  <span className="text-xs text-gray-500 truncate max-w-[120px] md:max-w-none">
                    {displaySection}
                  </span>
                </div>
              </>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 border-red-200 hover:bg-red-50 h-8 w-8 sm:h-auto sm:w-auto sm:px-3 sm:py-2 p-0 flex-shrink-0"
            onClick={handleSignOut}
            disabled={logoutMutation.isPending}
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">
              {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
