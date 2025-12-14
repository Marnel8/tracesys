"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, ChevronDown, ChevronUp } from "lucide-react";
let faceApiModule: typeof import("face-api.js") | null = null;
import AttendanceHeader from "@/components/student/attendance/AttendanceHeader";
import LocationBanner from "@/components/student/attendance/LocationBanner";
import ClockStatus from "@/components/student/attendance/ClockStatus";
import SelfieCapture from "@/components/student/attendance/SelfieCapture";
import ClockButtons from "@/components/student/attendance/ClockButtons";
import CurrentLocationDisplay from "@/components/student/attendance/CurrentLocationDisplay";
import RecentAttendance from "@/components/student/attendance/RecentAttendance";
import { useAuth } from "@/hooks/auth/useAuth";
import { useStudentRequirements } from "@/hooks/student/useStudentRequirements";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRequirementTemplates } from "@/hooks/requirement-template/useRequirementTemplate";
import { useToast } from "@/hooks/use-toast";
import { useStudent } from "@/hooks/student";
import {
  useAttendance,
  useClockIn,
  useClockOut,
  AttendanceRecord,
} from "@/hooks/attendance";

export default function AttendancePage() {
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  } | null>(null);
  const [locationType, setLocationType] = useState<
    "Inside" | "In-field" | "Outside" | null
  >(null);
  const [deviceType, setDeviceType] = useState<"Mobile" | "Desktop" | "Tablet">(
    "Desktop"
  );
  const [deviceUnit, setDeviceUnit] = useState<string>("");
  const [macAddress, setMacAddress] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isClockingIn, setIsClockingIn] = useState(false);
  const [isClockingOut, setIsClockingOut] = useState(false);
  const [todayAttendance, setTodayAttendance] =
    useState<AttendanceRecord | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayCircleRef = useRef<HTMLDivElement>(null);
  const [isFaceModelLoaded, setIsFaceModelLoaded] = useState(false);
  const [isLoadingFaceModels, setIsLoadingFaceModels] = useState(false);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [wasCapturedWithFaceDetection, setWasCapturedWithFaceDetection] =
    useState(false);
  const detectionIntervalRef = useRef<number | null>(null);
  const detectionRafRef = useRef<number | null>(null);
  const [currentSession, setCurrentSession] = useState<
    "morning" | "afternoon" | null
  >(null);
  const [clockInSession, setClockInSession] = useState<
    "morning" | "afternoon" | null
  >(null);
  const [clockOutSession, setClockOutSession] = useState<
    "morning" | "afternoon" | null
  >(null);
  const [overtimeClockInSession, setOvertimeClockInSession] = useState<
    "overtime" | null
  >(null);
  const [overtimeClockOutSession, setOvertimeClockOutSession] = useState<
    "overtime" | null
  >(null);
  const [isOvertimeClockingIn, setIsOvertimeClockingIn] = useState(false);
  const [isOvertimeClockingOut, setIsOvertimeClockingOut] = useState(false);
  const [showClockingMechanism, setShowClockingMechanism] = useState(true);

  // Auth and required-requirements gate
  const { user } = useAuth();
  const studentId = (user as any)?.id as string | undefined;
  const { data: studentData } = useStudent(studentId as string);
  const { data: requirementsData } = useStudentRequirements(
    studentId as string,
    { limit: 200, page: 1 }
  );
  const { data: templatesData } = useRequirementTemplates({
    page: 1,
    limit: 200,
    status: "active",
  });
  const requirementsList: any[] =
    (requirementsData as any)?.requirements ??
    (requirementsData as any)?.items ??
    (requirementsData as any)?.data?.requirements ??
    [];
  const templatesList: any[] =
    (templatesData as any)?.requirementTemplates ??
    (templatesData as any)?.data?.requirementTemplates ??
    [];

  // Check if any instructor allows login/attendance without requirements
  // This respects the instructor's setting to bypass requirement checks
  const student: any =
    (studentData as any)?.student ?? (studentData as any)?.data ?? studentData;
  const enrollments: any[] = student?.enrollments ?? [];
  // Check if any of the student's instructors have enabled the bypass setting
  const hasInstructorAllowingLogin =
    enrollments.length > 0 &&
    enrollments.some(
      (enrollment: any) =>
        enrollment.section?.instructor?.allowLoginWithoutRequirements === true
    );

  const requiredTemplates: any[] = templatesList.filter(
    (t: any) => t?.isRequired
  );
  // Only block if instructor doesn't allow login without requirements
  const hasBlockingRequired =
    !hasInstructorAllowingLogin &&
    requiredTemplates.some((tpl: any) => {
      const matches = requirementsList.filter(
        (r: any) => r?.templateId === tpl?.id
      );
      if (matches.length === 0) return true; // no submission for required template
      const latest = matches.sort(
        (a: any, b: any) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];
      const status = String(latest?.status ?? "").toLowerCase();
      // allow only when approved
      return !["approved"].includes(status);
    });

  // Additional attendance gate: ensure student has an agency and has reached start date
  const practicums: any[] = student?.practicums ?? [];
  const practicumWithAgency: any | undefined =
    practicums.find((p: any) => p?.agency) ?? practicums[0];
  const hasAgency = !!practicumWithAgency?.agency;
  const startDateStr: string | undefined = practicumWithAgency?.startDate;
  const todayYmd = new Date().toISOString().split("T")[0];
  const isOnOrAfterStart = startDateStr
    ? todayYmd >= String(startDateStr).slice(0, 10)
    : false;
  const hasAgencyOrDateBlocking = !hasAgency || !isOnOrAfterStart;

  // Get agency operating info
  const agency = practicumWithAgency?.agency;
  const agencyOperatingDaysRaw = agency?.operatingDays;
  // Parse operating days - split by comma and clean up
  const agencyOperatingDays = agencyOperatingDaysRaw
    ? String(agencyOperatingDaysRaw)
        .split(",")
        .map((d: string) => d.trim())
        .filter((d: string) => d.length > 0)
    : [];
  const agencyOpeningTime = agency?.openingTime;
  const agencyClosingTime = agency?.closingTime;
  const agencyLunchStartTime = agency?.lunchStartTime;
  const agencyLunchEndTime = agency?.lunchEndTime;

  // Check if today is an operating day
  const todayDayName = new Date().toLocaleDateString("en-US", {
    weekday: "long",
  });

  // Normalize both for case-insensitive comparison
  const normalizedOperatingDays = agencyOperatingDays.map((day: string) =>
    day.trim().toLowerCase()
  );
  const normalizedTodayDayName = todayDayName.toLowerCase().trim();

  // Check if today is an operating day
  // If no operating days are set, allow all days
  const isOperatingDay =
    agencyOperatingDays.length === 0 ||
    normalizedOperatingDays.includes(normalizedTodayDayName);

  // Helper function to parse time string to minutes since midnight
  const parseTimeToMinutes = (
    timeStr: string | null | undefined
  ): number | null => {
    if (!timeStr) return null;
    const parts = timeStr.split(":");
    if (parts.length < 2) return null;
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  };

  // Check if current time is within operating hours (allowing early/late clock-ins)
  const isWithinOperatingHours = useMemo(() => {
    if (!agencyOpeningTime || !agencyClosingTime) {
      // If no operating hours set, allow clocking at any time
      return true;
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;

    const opening = parseTimeToMinutes(agencyOpeningTime);
    const closing = parseTimeToMinutes(agencyClosingTime);

    if (opening === null || closing === null) return true;

    // Handle case where operating hours span midnight (e.g., 12:00 AM - 5:00 AM)
    // If closing time is less than opening time, it means it spans midnight
    if (closing < opening) {
      // Operating hours span midnight (e.g., 12:00 AM - 5:00 AM)
      // Current time is valid if it's >= opening OR <= closing
      return currentTimeMinutes >= opening || currentTimeMinutes <= closing;
    } else {
      // Normal case: operating hours within the same day
      return currentTimeMinutes >= opening && currentTimeMinutes <= closing;
    }
  }, [agencyOpeningTime, agencyClosingTime, currentTime]);

  // Determine current session type based on time
  // Session determination is based on lunch times (if available) or midpoint of operating hours
  // Students can clock in/out at ANY time - operating hours are just reference points
  // NOTE: Agency lunch times (lunchStartTime, lunchEndTime) are REFERENCE POINTS ONLY
  // They are used for session determination and remarks calculation, NOT for hours calculation.
  // Actual lunch duration is calculated dynamically as: afternoonTimeIn - morningTimeOut
  useEffect(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;

    const lunchStart = parseTimeToMinutes(agencyLunchStartTime);
    const lunchEnd = parseTimeToMinutes(agencyLunchEndTime);
    const opening = parseTimeToMinutes(agencyOpeningTime);
    const closing = parseTimeToMinutes(agencyClosingTime);

    // Determine session based on lunch times (primary) or operating hours midpoint (fallback)
    // Morning session: before lunch start (reference point)
    // Afternoon session: at/after lunch start (reference point) - allows clocking in during lunch for afternoon
    // NOTE: These lunch times are reference points for session determination, not actual lunch duration
    if (lunchStart !== null) {
      // Use lunch start time (reference point) as the divider between morning and afternoon
      // Handle lunch break that might span midnight
      if (lunchEnd !== null && lunchEnd < lunchStart) {
        // Lunch spans midnight (e.g., 11:00 PM - 1:00 AM)
        // Morning: between lunch end and lunch start
        // Afternoon: at/after lunch start OR before/at lunch end
        if (currentTimeMinutes > lunchEnd && currentTimeMinutes < lunchStart) {
          setCurrentSession("morning");
        } else {
          setCurrentSession("afternoon");
        }
      } else {
        // Normal lunch break (e.g., 2:00 AM - 4:00 AM)
        // Morning: before lunch start
        // Afternoon: at/after lunch start (includes during lunch break)
        if (currentTimeMinutes < lunchStart) {
          setCurrentSession("morning");
        } else {
          setCurrentSession("afternoon");
        }
      }
    } else if (opening !== null && closing !== null) {
      // No lunch times, use midpoint of operating hours
      // Handle case where operating hours span midnight
      if (closing < opening) {
        // Operating hours span midnight (e.g., 12:00 AM - 5:00 AM)
        const totalMinutes = 24 * 60 - opening + closing;
        const midPoint = opening + totalMinutes / 2;

        // Adjust midpoint if it wraps past midnight
        if (midPoint >= 24 * 60) {
          const adjustedMidPoint = midPoint - 24 * 60;
          // Morning: from opening to adjusted midpoint (wrapping past midnight)
          // Afternoon: after adjusted midpoint to closing
          if (
            currentTimeMinutes >= opening ||
            currentTimeMinutes <= adjustedMidPoint
          ) {
            setCurrentSession("morning");
          } else {
            setCurrentSession("afternoon");
          }
        } else {
          // Midpoint doesn't wrap
          if (currentTimeMinutes >= opening && currentTimeMinutes < midPoint) {
            setCurrentSession("morning");
          } else {
            setCurrentSession("afternoon");
          }
        }
      } else {
        // Normal case: operating hours within same day
        const midPoint = opening + (closing - opening) / 2;
        setCurrentSession(
          currentTimeMinutes < midPoint ? "morning" : "afternoon"
        );
      }
    } else {
      // No time constraints, default to morning
      setCurrentSession("morning");
    }
  }, [
    agencyLunchStartTime,
    agencyLunchEndTime,
    agencyOpeningTime,
    agencyClosingTime,
    currentTime,
  ]);

  // Compute available session for clock-in based on time and operating hours
  // Always returns a session on operating days - restriction is handled in handleClockIn
  const availableSessionForClockIn = useMemo(() => {
    // If not an operating day, no session available
    if (!isOperatingDay) {
      return null;
    }

    const morningComplete =
      todayAttendance?.morningTimeIn && todayAttendance?.morningTimeOut;
    const afternoonComplete =
      todayAttendance?.afternoonTimeIn && todayAttendance?.afternoonTimeOut;

    // If both sessions are complete, no session available for clock-in
    if (morningComplete && afternoonComplete) {
      return null;
    }

    // Check for in-progress sessions - if any session is in progress, no clock-in available
    const morningInProgress =
      todayAttendance?.morningTimeIn && !todayAttendance?.morningTimeOut;
    const afternoonInProgress =
      todayAttendance?.afternoonTimeIn && !todayAttendance?.afternoonTimeOut;

    // If any session is in progress, no clock-in available (must clock out first)
    if (morningInProgress || afternoonInProgress) {
      return null;
    }

    // Determine session based on current time and operating hours
    // The restriction for second session is handled in handleClockIn
    if (currentSession) {
      return currentSession;
    }

    // Fallback: if currentSession is null, determine session based on operating hours
    const lunchStart = parseTimeToMinutes(agencyLunchStartTime);
    const opening = parseTimeToMinutes(agencyOpeningTime);
    const closing = parseTimeToMinutes(agencyClosingTime);
    const now = new Date();
    const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();

    if (lunchStart !== null) {
      // Use lunch start as divider
      return currentTimeMinutes < lunchStart ? "morning" : "afternoon";
    } else if (opening !== null && closing !== null) {
      // Use midpoint
      if (closing < opening) {
        // Spans midnight
        const totalMinutes = 24 * 60 - opening + closing;
        const midPoint = opening + totalMinutes / 2;
        if (midPoint >= 24 * 60) {
          const adjustedMidPoint = midPoint - 24 * 60;
          return currentTimeMinutes >= opening ||
            currentTimeMinutes <= adjustedMidPoint
            ? "morning"
            : "afternoon";
        } else {
          return currentTimeMinutes >= opening && currentTimeMinutes < midPoint
            ? "morning"
            : "afternoon";
        }
      } else {
        const midPoint = opening + (closing - opening) / 2;
        return currentTimeMinutes < midPoint ? "morning" : "afternoon";
      }
    }
    // Default to morning
    return "morning";
  }, [
    todayAttendance,
    currentSession,
    isOperatingDay,
    agencyLunchStartTime,
    agencyOpeningTime,
    agencyClosingTime,
  ]);

  // Compute available session for clock-out based on in-progress sessions
  // Operating hours are the determining factor
  const availableSessionForClockOut = useMemo(() => {
    // If not an operating day, no session available
    if (!isOperatingDay) {
      return null;
    }

    const morningInProgress =
      todayAttendance?.morningTimeIn && !todayAttendance?.morningTimeOut;
    const afternoonInProgress =
      todayAttendance?.afternoonTimeIn && !todayAttendance?.afternoonTimeOut;

    // If afternoon is in progress, allow afternoon clock-out
    if (afternoonInProgress) {
      return "afternoon";
    }

    // If morning is in progress, allow morning clock-out
    if (morningInProgress) {
      return "morning";
    }

    // No session in progress
    return null;
  }, [todayAttendance, isOperatingDay]);

  // Check if regular sessions are complete (both morning and afternoon clocked out)
  const areRegularSessionsComplete = useMemo(() => {
    return !!(
      todayAttendance?.morningTimeIn &&
      todayAttendance?.morningTimeOut &&
      todayAttendance?.afternoonTimeIn &&
      todayAttendance?.afternoonTimeOut
    );
  }, [todayAttendance]);

  // Compute available overtime session for clock-in
  // Overtime can only be clocked in if regular sessions are complete
  const availableOvertimeSessionForClockIn = useMemo(() => {
    if (!areRegularSessionsComplete) {
      return null;
    }

    // Check if overtime is already clocked in (has overtimeTimeIn but no overtimeTimeOut means in progress)
    if (todayAttendance?.overtimeTimeIn && !todayAttendance?.overtimeTimeOut) {
      return null; // Overtime is in progress, cannot clock in again
    }

    // Check if overtime is already complete
    if (todayAttendance?.overtimeTimeIn && todayAttendance?.overtimeTimeOut) {
      return null; // Overtime is already complete
    }

    // Regular sessions are complete and overtime hasn't started yet
    return "overtime";
  }, [areRegularSessionsComplete, todayAttendance]);

  // Compute available overtime session for clock-out
  const availableOvertimeSessionForClockOut = useMemo(() => {
    // Check if overtime is in progress
    // Overtime is in progress if we have overtimeTimeIn but not overtimeTimeOut
    if (todayAttendance?.overtimeTimeIn && !todayAttendance?.overtimeTimeOut) {
      return "overtime";
    }
    return null;
  }, [todayAttendance]);

  // Attendance hooks
  const clockInMutation = useClockIn();
  const clockOutMutation = useClockOut();

  // Get today's date for filtering - use local timezone, not UTC
  // This ensures the date matches the local day of the week
  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const today = getLocalDateString();

  // Fetch today's attendance record
  const { data: attendanceData, isLoading: isLoadingAttendance } =
    useAttendance({
      studentId: studentId,
      date: today,
      limit: 1,
    });

  // Fetch recent attendance for the history component
  const { data: recentAttendanceData } = useAttendance({
    studentId: studentId,
    limit: 10,
    page: 1,
  });

  // Set today's attendance from API data
  useEffect(() => {
    if (attendanceData?.attendance && attendanceData.attendance.length > 0) {
      setTodayAttendance(attendanceData.attendance[0]);
    } else {
      setTodayAttendance(null);
    }
  }, [attendanceData]);

  // Nullify incomplete sessions on page load (smart tracking)
  useEffect(() => {
    if (todayAttendance && practicumWithAgency?.id) {
      const now = new Date();
      const closingTime = agencyClosingTime;

      if (closingTime) {
        const [hours, minutes] = closingTime.split(":").map(Number);
        const closingDateTime = new Date();
        closingDateTime.setHours(hours, minutes || 0, 0, 0);

        // If past closing time, check for incomplete sessions
        if (now > closingDateTime) {
          const hasIncompleteMorning =
            todayAttendance.morningTimeIn && !todayAttendance.morningTimeOut;
          const hasIncompleteAfternoon =
            todayAttendance.afternoonTimeIn &&
            !todayAttendance.afternoonTimeOut;

          if (hasIncompleteMorning || hasIncompleteAfternoon) {
            // Refetch attendance to get updated data (backend should handle nullification)
            // This is handled by the backend when clocking in next day
          }
        }
      }
    }
  }, [todayAttendance, agencyClosingTime, practicumWithAgency?.id]);

  // Handle client-side mounting, time updates, and location tracking
  useEffect(() => {
    setIsMounted(true);
    const updateTime = () => {
      setCurrentTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };

    updateTime(); // Set initial time
    const interval = setInterval(updateTime, 1000);

    // Detect device type only on client side
    if (typeof navigator !== "undefined") {
      const userAgent = navigator.userAgent;
      setDeviceUnit(userAgent);

      if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
        setDeviceType("Mobile");
      } else if (/iPad/.test(userAgent)) {
        setDeviceType("Tablet");
      } else {
        setDeviceType("Desktop");
      }
    }

    // Get user location
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const coords = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };

            setLocation(coords);
            setLocationError(null);

            // Get address from coordinates
            await getAddressFromCoords(coords.latitude, coords.longitude);
          },
          (error) => {
            setLocationError(
              "Location access denied. Please enable location services."
            );
            toast({
              variant: "destructive",
              title: "Location error",
              description:
                "Location access denied. Please enable location services.",
            });
          }
        );
      } else {
        setLocationError("Geolocation is not supported by this browser.");
      }
    };

    // Function to get address from coordinates using reverse geocoding
    const getAddressFromCoords = async (lat: number, lng: number) => {
      setIsLoadingAddress(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
        );
        const data = await response.json();

        if (data.display_name) {
          setLocation((prev) =>
            prev
              ? {
                  ...prev,
                  address: data.display_name,
                }
              : null
          );
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Reverse geocoding failed",
          description: "Could not retrieve address for your current location.",
        });
      } finally {
        setIsLoadingAddress(false);
      }
    };

    getLocation();

    // Today's attendance is now handled by the API hook above

    return () => clearInterval(interval);
  }, []);

  // Compute location type whenever location or agency changes
  useEffect(() => {
    if (!location) return;
    const agency = practicumWithAgency?.agency as any;
    if (!agency) return;
    const agencyLat = Number(agency?.latitude);
    const agencyLng = Number(agency?.longitude);
    if (isNaN(agencyLat) || isNaN(agencyLng)) return;

    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371000; // meters
    const dLat = toRad(location.latitude - agencyLat);
    const dLon = toRad(location.longitude - agencyLng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(agencyLat)) *
        Math.cos(toRad(location.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // meters

    if (distance <= 150) setLocationType("Inside");
    else if (distance <= 500) setLocationType("In-field");
    else setLocationType("Outside");
  }, [location, practicumWithAgency]);

  // Helper function to format time string to 12-hour format
  const formatTimeTo12Hour = (timeStr: string | null | undefined): string => {
    if (!timeStr) return "";
    try {
      // Handle formats like "08:00:00" or "08:00"
      const parts = timeStr.split(":");
      if (parts.length < 2) return timeStr;

      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);

      if (isNaN(hours) || isNaN(minutes)) return timeStr;

      const date = new Date();
      date.setHours(hours, minutes, 0, 0);

      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return timeStr;
    }
  };

  // Short device label for UI display
  const shortDevice = useMemo(() => {
    if (!deviceUnit) return "";
    try {
      const ua = deviceUnit;
      if (/iPhone/i.test(ua)) return "iPhone";
      if (/iPad/i.test(ua)) return "iPad";
      if (/Android/i.test(ua)) return "Android";
      if (/Windows NT/i.test(ua)) return "Windows";
      if (/Mac OS X/i.test(ua)) return "macOS";
      if (/Linux/i.test(ua)) return "Linux";
      return ua.split(" ").slice(0, 1)[0];
    } catch {
      return "";
    }
  }, [deviceUnit]);

  // Helper function to shorten device type names
  const shortenDeviceType = (deviceType: string) => {
    const abbreviations: { [key: string]: string } = {
      "Mobile Phone": "Mobile",
      "Desktop Computer": "Desktop",
      "Laptop Computer": "Laptop",
      Tablet: "Tablet",
      Smartphone: "Phone",
      Computer: "PC",
      Workstation: "WS",
      "Personal Computer": "PC",
      "Mobile Device": "Mobile",
      "Handheld Device": "Handheld",
      "Portable Device": "Portable",
    };

    return abbreviations[deviceType] || deviceType;
  };

  // Cleanup face detection interval and media stream on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
      if (detectionIntervalRef.current) {
        window.clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
    };
  }, []);

  // Function to refresh location
  const refreshLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          setLocation(coords);
          setLocationError(null);

          // Get address from coordinates
          await getAddressFromCoords(coords.latitude, coords.longitude);
        },
        (error) => {
          setLocationError(
            "Location access denied. Please enable location services."
          );
          toast({
            variant: "destructive",
            title: "Location error",
            description:
              "Location access denied. Please enable location services.",
          });
        }
      );
    }
  };

  // Function to get address from coordinates using reverse geocoding
  const getAddressFromCoords = async (lat: number, lng: number) => {
    setIsLoadingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();

      if (data.display_name) {
        setLocation((prev) =>
          prev
            ? {
                ...prev,
                address: data.display_name,
              }
            : null
        );
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Reverse geocoding failed",
        description: "Could not retrieve address for your current location.",
      });
    } finally {
      setIsLoadingAddress(false);
    }
  };

  // Mock data removed - now using real API data

  // Load face-api models from /public/models
  const loadFaceModels = async () => {
    if (isFaceModelLoaded || isLoadingFaceModels) return;
    try {
      setIsLoadingFaceModels(true);
      setIsFaceModelLoaded(false); // Ensure we start with false
      if (!faceApiModule) {
        if (typeof window === "undefined") return; // guard for SSR
        faceApiModule = (await import("face-api.js")).default
          ? (await import("face-api.js")).default
          : await import("face-api.js");
      }
      const modelsUrl = "/models";
      await Promise.all([
        faceApiModule.nets.tinyFaceDetector.loadFromUri(modelsUrl),
      ]);

      // Add a small delay to ensure the model is fully ready
      await new Promise((resolve) => setTimeout(resolve, 100));

      setIsFaceModelLoaded(true);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Face model load failed",
        description: "Could not load face detection model. Try again.",
      });
      setIsFaceModelLoaded(false);
    } finally {
      setIsLoadingFaceModels(false);
    }
  };

  const stopFaceDetection = () => {
    if (detectionIntervalRef.current) {
      window.clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    if (detectionRafRef.current) {
      cancelAnimationFrame(detectionRafRef.current);
      detectionRafRef.current = null;
    }
    setIsFaceDetected(false);
  };

  const startFaceDetection = () => {
    if (!videoRef.current || !isFaceModelLoaded || isLoadingFaceModels) {
      return;
    }

    stopFaceDetection();
    if (!faceApiModule) return;
    // Increased scoreThreshold from 0.3 to 0.5 for more strict face detection
    // This helps prevent false positives when face is covered or partially obscured
    const options = new faceApiModule.TinyFaceDetectorOptions({
      inputSize: 320,
      scoreThreshold: 0.5, // More strict threshold to reduce false positives
    });

    const tick = async () => {
      try {
        const video = videoRef.current;
        if (!video) return;
        if (video.readyState >= 2) {
          const result = await faceApiModule!.detectSingleFace(video, options);
          if (result) {
            // Additional validation: check detection score/confidence
            // Higher score means more confident detection
            const detectionScore = result.score || 0;
            // Require minimum confidence score of 0.5 (already filtered by threshold, but double-check)
            if (detectionScore < 0.5) {
              setIsFaceDetected(false);
              return;
            }

            const box = result.box;
            // Validate face size - ensure it's not too small (likely a false positive)
            const faceArea = box.width * box.height;
            const videoArea = video.videoWidth * video.videoHeight;
            const faceAreaRatio = faceArea / videoArea;
            // Require face to be at least 5% of video area to be considered valid
            if (faceAreaRatio < 0.05) {
              setIsFaceDetected(false);
              return;
            }

            const container = containerRef.current;
            const circleEl = overlayCircleRef.current;
            if (container && circleEl) {
              const containerRect = container.getBoundingClientRect();
              const circleRect = circleEl.getBoundingClientRect();
              const circleCenterX =
                circleRect.left + circleRect.width / 2 - containerRect.left;
              const circleCenterY =
                circleRect.top + circleRect.height / 2 - containerRect.top;
              const radius = Math.min(circleRect.width, circleRect.height) / 2;

              const scaleX = containerRect.width / video.videoWidth;
              const scaleY = containerRect.height / video.videoHeight;
              const faceCenterX = (box.x + box.width / 2) * scaleX;
              const faceCenterY = (box.y + box.height / 2) * scaleY;
              const faceHalfDiag = Math.hypot(
                (box.width * scaleX) / 2,
                (box.height * scaleY) / 2
              );
              const centerDist = Math.hypot(
                faceCenterX - circleCenterX,
                faceCenterY - circleCenterY
              );

              // Face must be properly centered and within the circle
              const inside = centerDist + faceHalfDiag <= radius;
              setIsFaceDetected(inside);
            } else {
              setIsFaceDetected(false);
            }
          } else {
            setIsFaceDetected(false);
          }
        }
      } catch (err) {
        // ignore per-frame errors
      } finally {
        detectionRafRef.current = requestAnimationFrame(tick);
      }
    };

    detectionRafRef.current = requestAnimationFrame(tick);
  };

  const startCamera = async () => {
    try {
      setIsCapturing(true);
      setShowCamera(true);

      // Ensure models are loaded before starting detection
      await loadFaceModels();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Wait for video to be ready and models to be loaded
        await new Promise<void>((resolve) => {
          const checkReady = () => {
            if (
              videoRef.current &&
              videoRef.current.readyState >= 2 &&
              isFaceModelLoaded
            ) {
              resolve();
            } else {
              // Check again in next frame
              requestAnimationFrame(checkReady);
            }
          };

          const onPlaying = () => {
            checkReady();
          };

          videoRef.current?.addEventListener("playing", onPlaying, {
            once: true,
          });

          // Also start checking immediately in case video is already ready
          checkReady();

          // Fallback timeout
          setTimeout(() => resolve(), 2000);
        });

        // Double-check models are loaded before starting detection
        if (isFaceModelLoaded) {
          startFaceDetection();
        }
      }
    } catch (error) {
      setIsCapturing(false);
      setShowCamera(false);
      toast({
        variant: "destructive",
        title: "Camera access denied",
        description: "Please allow camera access to clock in.",
      });
    }
  };

  const capturePhoto = () => {
    // Validate that face is detected before allowing capture
    if (!isFaceDetected) {
      toast({
        variant: "destructive",
        title: "Face not detected",
        description:
          "Face must be detected before capturing. Please position your face properly inside the circle.",
      });
      return;
    }

    // Additional validation: ensure face model is loaded and detection is active
    if (!isFaceModelLoaded || isLoadingFaceModels) {
      toast({
        variant: "destructive",
        title: "Face detection not ready",
        description:
          "Face detection model is still loading. Please wait and try again.",
      });
      return;
    }

    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (context) {
        context.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL("image/png");
        setCapturedImage(imageData);
        // Mark that this image was captured with face detection active
        setWasCapturedWithFaceDetection(isFaceDetected && isFaceModelLoaded);

        // Stop camera
        const stream = video.srcObject as MediaStream;
        stream?.getTracks().forEach((track) => track.stop());
        stopFaceDetection();
        setIsCapturing(false);
      }
    }
  };

  const handleClockIn = async () => {
    if (hasBlockingRequired) {
      toast({
        variant: "destructive",
        title: "Action required",
        description: "Get required items approved before recording attendance.",
      });
      return;
    }
    if (!location) {
      toast({
        variant: "destructive",
        title: "Location required",
        description: "Enable location services to clock in.",
      });
      return;
    }

    if (!isOperatingDay) {
      const operatingDaysText = agencyOperatingDays.join(", ") || "Not set";
      const operatingHoursText =
        agencyOpeningTime && agencyClosingTime
          ? ` Operating hours: ${formatTimeTo12Hour(
              agencyOpeningTime
            )} - ${formatTimeTo12Hour(agencyClosingTime)}.`
          : "";
      toast({
        variant: "destructive",
        title: "Not an operating day",
        description: `Today (${todayDayName}) is not an operating day. Operating days: ${operatingDaysText}.${operatingHoursText}`,
      });
      return;
    }

    // Check if there's an in-progress session first
    const morningInProgress =
      todayAttendance?.morningTimeIn && !todayAttendance?.morningTimeOut;
    const afternoonInProgress =
      todayAttendance?.afternoonTimeIn && !todayAttendance?.afternoonTimeOut;

    if (morningInProgress || afternoonInProgress) {
      const inProgressSession = morningInProgress ? "morning" : "afternoon";
      toast({
        variant: "destructive",
        title: "Clock out required",
        description: `You have an active ${inProgressSession} session. Please clock out before clocking in again.`,
      });
      return;
    }

    // Use currentSession as fallback if availableSessionForClockIn is null
    // This ensures buttons are always enabled and session is determined by time
    const sessionToUse = availableSessionForClockIn || currentSession;

    if (!sessionToUse) {
      const bothComplete =
        todayAttendance?.morningTimeIn &&
        todayAttendance?.morningTimeOut &&
        todayAttendance?.afternoonTimeIn &&
        todayAttendance?.afternoonTimeOut;

      toast({
        variant: "destructive",
        title: "No session available",
        description: bothComplete
          ? "All sessions for today have been completed."
          : "Unable to determine session. Please try again.",
      });
      return;
    }

    // Note: In-progress session checks are handled by the early return above

    // Check if already clocked in for the session
    if (
      sessionToUse === "morning" &&
      todayAttendance?.morningTimeIn &&
      !todayAttendance?.morningTimeOut
    ) {
      toast({
        variant: "destructive",
        title: "Already clocked in",
        description:
          "You are already clocked in for the morning session. Please clock out first.",
      });
      return;
    }

    if (
      sessionToUse === "afternoon" &&
      todayAttendance?.afternoonTimeIn &&
      !todayAttendance?.afternoonTimeOut
    ) {
      toast({
        variant: "destructive",
        title: "Already clocked in",
        description:
          "You are already clocked in for the afternoon session. Please clock out first.",
      });
      return;
    }

    // Store the session for use in submitClockIn
    setClockInSession(sessionToUse);

    // Start camera for selfie capture
    setIsClockingIn(true);
    await startCamera();
  };

  const submitClockIn = async () => {
    if (!capturedImage) {
      toast({
        variant: "destructive",
        title: "Selfie required",
        description: "Take a selfie to complete clock in.",
      });
      return;
    }

    // Safety check: ensure image was captured with face detection active
    if (!wasCapturedWithFaceDetection) {
      toast({
        variant: "destructive",
        title: "Invalid capture",
        description:
          "The photo was not captured with face detection active. Please retake the photo with your face properly detected.",
      });
      // Reset captured image to force retake
      setCapturedImage(null);
      setWasCapturedWithFaceDetection(false);
      return;
    }

    if (!practicumWithAgency?.id) {
      toast({
        variant: "destructive",
        title: "No practicum found",
        description: "You need to be assigned to a practicum to clock in.",
      });
      return;
    }

    try {
      // Convert captured image to File object
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });

      // Get device information
      const deviceInfo = {
        deviceType: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent)
          ? "Mobile"
          : "Desktop",
        deviceUnit: navigator.userAgent,
        macAddress: null, // Not available in browser
      };

      // Determine session type and if late
      const now = new Date();
      const sessionType =
        clockInSession ||
        availableSessionForClockIn ||
        currentSession ||
        "morning";

      // Check if late based on opening time or lunch end time (reference points for remarks)
      // NOTE: These times are reference points for determining "Late" remarks, not for hours calculation
      let isLate = false;
      if (sessionType === "morning" && agencyOpeningTime) {
        const [hours, minutes] = agencyOpeningTime.split(":").map(Number);
        const expectedTime = new Date();
        expectedTime.setHours(hours, minutes || 0, 0, 0);
        isLate = now > expectedTime;
      } else if (sessionType === "afternoon" && agencyLunchEndTime) {
        // lunchEndTime is a reference point for determining if afternoon clock-in is late
        const [hours, minutes] = agencyLunchEndTime.split(":").map(Number);
        const expectedTime = new Date();
        expectedTime.setHours(hours, minutes || 0, 0, 0);
        isLate = now > expectedTime;
      }

      await clockInMutation.mutateAsync({
        practicumId: practicumWithAgency.id,
        date: today,
        day: now.toLocaleDateString("en-US", { weekday: "long" }),
        latitude: location?.latitude || null,
        longitude: location?.longitude || null,
        address: location?.address || null,
        locationType: (locationType || "Inside") as any,
        deviceType: deviceInfo.deviceType as "Mobile" | "Desktop" | "Tablet",
        deviceUnit: deviceInfo.deviceUnit,
        macAddress: macAddress,
        remarks: isLate ? "Late" : "Normal",
        photo: file,
        sessionType: sessionType,
      });

      // Reset camera state
      setCapturedImage(null);
      setWasCapturedWithFaceDetection(false);
      setShowCamera(false);
      setIsClockingIn(false);
      setClockInSession(null);
    } catch (error) {
      console.log(error);
    }
  };

  const restartCamera = async () => {
    // Stop current camera stream
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    stopFaceDetection();

    // Reset face detection state
    setIsFaceDetected(false);

    // Restart camera
    try {
      await startCamera();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Camera restart failed",
        description: "Could not restart camera. Try again.",
      });
    }
  };

  const cancelCamera = () => {
    // Stop camera if running
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    stopFaceDetection();

    setCapturedImage(null);
    setWasCapturedWithFaceDetection(false);
    setIsCapturing(false);
    setShowCamera(false);
    setIsClockingIn(false);
    setIsClockingOut(false);
    setIsOvertimeClockingIn(false);
    setIsOvertimeClockingOut(false);
    setClockInSession(null);
    setClockOutSession(null);
    setOvertimeClockInSession(null);
    setOvertimeClockOutSession(null);
  };

  const handleClockOut = async () => {
    if (hasBlockingRequired) {
      toast({
        variant: "destructive",
        title: "Action required",
        description: "Get required items approved before recording attendance.",
      });
      return;
    }
    if (!location) {
      toast({
        variant: "destructive",
        title: "Location required",
        description: "Enable location services to clock out.",
      });
      return;
    }

    // Determine which session to clock out from
    const sessionType = availableSessionForClockOut;

    if (!sessionType) {
      toast({
        variant: "destructive",
        title: "No session to clock out",
        description: "There is no active session to clock out from.",
      });
      return;
    }

    const hasMorningClockIn =
      todayAttendance?.morningTimeIn && !todayAttendance?.morningTimeOut;
    const hasAfternoonClockIn =
      todayAttendance?.afternoonTimeIn && !todayAttendance?.afternoonTimeOut;

    if (sessionType === "morning" && !hasMorningClockIn) {
      toast({
        variant: "destructive",
        title: "Clock in first",
        description:
          "You must clock in for the morning session before clocking out.",
      });
      return;
    }

    if (sessionType === "afternoon" && !hasAfternoonClockIn) {
      toast({
        variant: "destructive",
        title: "Clock in first",
        description:
          "You must clock in for the afternoon session before clocking out.",
      });
      return;
    }

    // Fallback for backward compatibility
    if (
      !hasMorningClockIn &&
      !hasAfternoonClockIn &&
      !todayAttendance?.timeIn
    ) {
      toast({
        variant: "destructive",
        title: "Clock in first",
        description: "You cannot clock out before clocking in.",
      });
      return;
    }

    if (!practicumWithAgency?.id) {
      toast({
        variant: "destructive",
        title: "No practicum found",
        description: "You need to be assigned to a practicum to clock out.",
      });
      return;
    }

    // Store the session for use in submitClockOut
    setClockOutSession(sessionType);

    // Start camera for selfie capture
    setIsClockingOut(true);
    await startCamera();
  };

  const submitClockOut = async () => {
    if (!capturedImage) {
      toast({
        variant: "destructive",
        title: "Selfie required",
        description: "Take a selfie to complete clock out.",
      });
      return;
    }

    // Safety check: ensure image was captured with face detection active
    if (!wasCapturedWithFaceDetection) {
      toast({
        variant: "destructive",
        title: "Invalid capture",
        description:
          "The photo was not captured with face detection active. Please retake the photo with your face properly detected.",
      });
      // Reset captured image to force retake
      setCapturedImage(null);
      setWasCapturedWithFaceDetection(false);
      return;
    }

    if (!practicumWithAgency?.id) {
      toast({
        variant: "destructive",
        title: "No practicum found",
        description: "You need to be assigned to a practicum to clock out.",
      });
      return;
    }

    try {
      // Convert captured image to File object
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });

      // Get device information
      const deviceInfo = {
        deviceType: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent)
          ? "Mobile"
          : "Desktop",
        deviceUnit: navigator.userAgent,
        macAddress: null, // Not available in browser
      };

      // Determine session type and if early departure
      const now = new Date();
      const sessionType =
        clockOutSession || availableSessionForClockOut || "morning";

      // Check if early departure (using reference points for remarks)
      // NOTE: These times are reference points for determining "Early Departure" remarks, not for hours calculation
      let isEarlyDeparture = false;
      if (sessionType === "morning" && agencyLunchStartTime) {
        // lunchStartTime is a reference point for determining if morning clock-out is early
        const [hours, minutes] = agencyLunchStartTime.split(":").map(Number);
        const expectedTime = new Date();
        expectedTime.setHours(hours, minutes || 0, 0, 0);
        isEarlyDeparture = now < expectedTime;
      } else if (sessionType === "afternoon" && agencyClosingTime) {
        const [hours, minutes] = agencyClosingTime.split(":").map(Number);
        const expectedTime = new Date();
        expectedTime.setHours(hours, minutes || 0, 0, 0);
        isEarlyDeparture = now < expectedTime;
      }

      await clockOutMutation.mutateAsync({
        practicumId: practicumWithAgency.id,
        date: today,
        latitude: location?.latitude || null,
        longitude: location?.longitude || null,
        address: location?.address || null,
        locationType: (locationType || "Inside") as any,
        deviceType: deviceInfo.deviceType as "Mobile" | "Desktop" | "Tablet",
        deviceUnit: deviceInfo.deviceUnit,
        macAddress: macAddress,
        remarks: isEarlyDeparture ? "Early Departure" : "Normal",
        photo: file,
        sessionType: sessionType,
      });

      // Reset camera state
      setCapturedImage(null);
      setWasCapturedWithFaceDetection(false);
      setShowCamera(false);
      setIsClockingOut(false);
      setClockOutSession(null);
    } catch (error) {
      console.log(error);
    }
  };

  const handleOvertimeClockIn = async () => {
    if (hasBlockingRequired) {
      toast({
        variant: "destructive",
        title: "Action required",
        description: "Get required items approved before recording attendance.",
      });
      return;
    }
    if (!location) {
      toast({
        variant: "destructive",
        title: "Location required",
        description: "Enable location services to clock in.",
      });
      return;
    }

    // Check if regular sessions are complete
    if (!areRegularSessionsComplete) {
      toast({
        variant: "destructive",
        title: "Regular sessions required",
        description:
          "You must complete both morning and afternoon sessions before clocking in for overtime.",
      });
      return;
    }

    // Store the session for use in submitOvertimeClockIn
    setOvertimeClockInSession("overtime");

    // Start camera for selfie capture
    setIsOvertimeClockingIn(true);
    await startCamera();
  };

  const submitOvertimeClockIn = async () => {
    if (!capturedImage) {
      toast({
        variant: "destructive",
        title: "Selfie required",
        description: "Take a selfie to complete clock in.",
      });
      return;
    }

    // Safety check: ensure image was captured with face detection active
    if (!wasCapturedWithFaceDetection) {
      toast({
        variant: "destructive",
        title: "Invalid capture",
        description:
          "The photo was not captured with face detection active. Please retake the photo with your face properly detected.",
      });
      // Reset captured image to force retake
      setCapturedImage(null);
      setWasCapturedWithFaceDetection(false);
      return;
    }

    if (!practicumWithAgency?.id) {
      toast({
        variant: "destructive",
        title: "No practicum found",
        description: "You need to be assigned to a practicum to clock in.",
      });
      return;
    }

    try {
      // Convert captured image to File object
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });

      // Get device information
      const deviceInfo = {
        deviceType: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent)
          ? "Mobile"
          : "Desktop",
        deviceUnit: navigator.userAgent,
        macAddress: null, // Not available in browser
      };

      const now = new Date();

      await clockInMutation.mutateAsync({
        practicumId: practicumWithAgency.id,
        date: today,
        day: now.toLocaleDateString("en-US", { weekday: "long" }),
        latitude: location?.latitude || null,
        longitude: location?.longitude || null,
        address: location?.address || null,
        locationType: (locationType || "Inside") as any,
        deviceType: deviceInfo.deviceType as "Mobile" | "Desktop" | "Tablet",
        deviceUnit: deviceInfo.deviceUnit,
        macAddress: macAddress,
        remarks: "Normal",
        photo: file,
        sessionType: "overtime",
      });

      // Reset camera state
      setCapturedImage(null);
      setWasCapturedWithFaceDetection(false);
      setShowCamera(false);
      setIsOvertimeClockingIn(false);
      setOvertimeClockInSession(null);
    } catch (error) {
      console.log(error);
    }
  };

  const handleOvertimeClockOut = async () => {
    if (hasBlockingRequired) {
      toast({
        variant: "destructive",
        title: "Action required",
        description: "Get required items approved before recording attendance.",
      });
      return;
    }
    if (!location) {
      toast({
        variant: "destructive",
        title: "Location required",
        description: "Enable location services to clock out.",
      });
      return;
    }

    // Check if overtime is clocked in
    // This would need to be checked from the backend response
    // For now, we'll allow it if regular sessions are complete
    if (!areRegularSessionsComplete) {
      toast({
        variant: "destructive",
        title: "Overtime not started",
        description: "You must clock in for overtime before clocking out.",
      });
      return;
    }

    if (!practicumWithAgency?.id) {
      toast({
        variant: "destructive",
        title: "No practicum found",
        description: "You need to be assigned to a practicum to clock out.",
      });
      return;
    }

    // Store the session for use in submitOvertimeClockOut
    setOvertimeClockOutSession("overtime");

    // Start camera for selfie capture
    setIsOvertimeClockingOut(true);
    await startCamera();
  };

  const submitOvertimeClockOut = async () => {
    if (!capturedImage) {
      toast({
        variant: "destructive",
        title: "Selfie required",
        description: "Take a selfie to complete clock out.",
      });
      return;
    }

    // Safety check: ensure image was captured with face detection active
    if (!wasCapturedWithFaceDetection) {
      toast({
        variant: "destructive",
        title: "Invalid capture",
        description:
          "The photo was not captured with face detection active. Please retake the photo with your face properly detected.",
      });
      // Reset captured image to force retake
      setCapturedImage(null);
      setWasCapturedWithFaceDetection(false);
      return;
    }

    if (!practicumWithAgency?.id) {
      toast({
        variant: "destructive",
        title: "No practicum found",
        description: "You need to be assigned to a practicum to clock out.",
      });
      return;
    }

    try {
      // Convert captured image to File object
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });

      // Get device information
      const deviceInfo = {
        deviceType: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent)
          ? "Mobile"
          : "Desktop",
        deviceUnit: navigator.userAgent,
        macAddress: null, // Not available in browser
      };

      await clockOutMutation.mutateAsync({
        practicumId: practicumWithAgency.id,
        date: today,
        latitude: location?.latitude || null,
        longitude: location?.longitude || null,
        address: location?.address || null,
        locationType: (locationType || "Inside") as any,
        deviceType: deviceInfo.deviceType as "Mobile" | "Desktop" | "Tablet",
        deviceUnit: deviceInfo.deviceUnit,
        macAddress: macAddress,
        remarks: "Overtime",
        photo: file,
        sessionType: "overtime",
      });

      // Reset camera state
      setCapturedImage(null);
      setWasCapturedWithFaceDetection(false);
      setShowCamera(false);
      setIsOvertimeClockingOut(false);
      setOvertimeClockOutSession(null);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="px-3 sm:px-4 md:px-6 lg:px-8 xl:px-16">
      <AttendanceHeader />

      {(hasBlockingRequired || hasAgencyOrDateBlocking) && (
        <Card className="mb-4 border border-primary-200 bg-primary-50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-primary-700 text-base sm:text-lg">
              Action required before using Attendance
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-primary-800 flex flex-col gap-3">
            {hasBlockingRequired && (
              <div>
                <p className="mb-2">
                  Your account has required requirements that are not yet
                  approved. Please submit and have them approved to continue.
                </p>
                <Link href="/dashboard/student/requirements">
                  <Button
                    variant="outline"
                    className="border border-primary-500 bg-primary-50 text-primary-700 transition-all duration-300 hover:border-primary-400 hover:bg-primary-50/50"
                  >
                    Go to Requirements
                  </Button>
                </Link>
              </div>
            )}
            {hasAgencyOrDateBlocking && (
              <div>
                <p className="mb-2">
                  You can only record attendance once you have an assigned
                  agency and your practicum start date has begun.
                </p>
                <ul className="list-disc pl-5">
                  {!hasAgency && (
                    <li>No agency is assigned to your account yet.</li>
                  )}
                  {startDateStr && !isOnOrAfterStart && (
                    <li>
                      Start date is{" "}
                      {new Date(startDateStr).toLocaleDateString()} — attendance
                      opens on/after this date.
                    </li>
                  )}
                  {!startDateStr && (
                    <li>Your practicum start date is not set.</li>
                  )}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Attendance Logging */}
        <div className="space-y-4 sm:space-y-6">
          <Card className="border border-primary-200 shadow-sm">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                Today's Attendance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <LocationBanner
                locationError={locationError}
                locationDetected={!!location}
              />

              {/* Operating Hours Information Note */}
              {agency &&
                (agencyOperatingDays.length > 0 ||
                  agencyOpeningTime ||
                  agencyClosingTime) && (
                  <Card className="bg-primary-50 border border-primary-200 shadow-sm">
                    <CardContent className="p-3 sm:p-4">
                      <div className="space-y-2 text-xs sm:text-sm">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-primary-900">
                            Clocking Mechanism
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setShowClockingMechanism(!showClockingMechanism)
                            }
                            className="h-6 w-6 p-0 text-primary-700 hover:text-primary-900"
                          >
                            {showClockingMechanism ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {showClockingMechanism && (
                          <>
                            {agencyOperatingDays.length > 0 && (
                              <p className="text-primary-800">
                                <strong>Operating Days:</strong>{" "}
                                {agencyOperatingDays.join(", ")}
                              </p>
                            )}
                            {agencyOpeningTime && agencyClosingTime && (
                              <p className="text-primary-800">
                                <strong>Operating Hours:</strong>{" "}
                                {formatTimeTo12Hour(agencyOpeningTime)} -{" "}
                                {formatTimeTo12Hour(agencyClosingTime)}
                              </p>
                            )}
                            {agencyLunchStartTime && agencyLunchEndTime && (
                              <p className="text-primary-800">
                                <strong>Lunch Break (Reference):</strong>{" "}
                                {formatTimeTo12Hour(agencyLunchStartTime)} -{" "}
                                {formatTimeTo12Hour(agencyLunchEndTime)}{" "}
                                <span className="text-xs italic">
                                  (Reference time only - actual lunch duration
                                  is calculated from your clock-out and clock-in
                                  times)
                                </span>
                              </p>
                            )}
                            <div className="mt-2 pt-2 border-t border-primary-300">
                              <p className="text-primary-800 font-medium">
                                Morning Session: You can clock in early (before{" "}
                                {agencyOpeningTime
                                  ? formatTimeTo12Hour(agencyOpeningTime)
                                  : "opening time"}
                                ) or anytime up to{" "}
                                {agencyLunchStartTime
                                  ? formatTimeTo12Hour(agencyLunchStartTime)
                                  : "lunch time"}
                                . Clock out anytime before or during lunch
                                break.
                              </p>
                              <p className="text-primary-800 font-medium mt-1">
                                Afternoon Session: You can clock in during lunch
                                break or after{" "}
                                {agencyLunchEndTime
                                  ? formatTimeTo12Hour(agencyLunchEndTime)
                                  : "lunch end"}
                                . Clock out anytime, including after{" "}
                                {agencyClosingTime
                                  ? formatTimeTo12Hour(agencyClosingTime)
                                  : "closing time"}
                                .
                              </p>
                              <p className="text-primary-800 text-sm mt-2 italic">
                                Note: Early or late clock-ins/outs are allowed.
                                The system will automatically determine your
                                session based on the current time.
                              </p>
                              <p className="text-primary-800 text-sm mt-2 italic">
                                <strong>Lunch Duration:</strong> Your actual
                                lunch break duration is calculated dynamically
                                as the time between your morning clock-out and
                                afternoon clock-in. This ensures accurate work
                                hours calculation by automatically excluding
                                your actual lunch break from total hours.
                              </p>
                            </div>
                            <p className="text-primary-900 font-semibold mt-2 pt-2 border-t border-primary-300">
                              Important: If you don't clock out by end of day,
                              the session will be nullified and you'll need to
                              clock in again the next day.
                            </p>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

              <ClockStatus todayAttendance={todayAttendance} />

              <SelfieCapture
                showCamera={showCamera}
                isCapturing={isCapturing}
                isFaceModelLoaded={isFaceModelLoaded}
                isLoadingFaceModels={isLoadingFaceModels}
                isFaceDetected={isFaceDetected}
                videoRef={videoRef}
                canvasRef={canvasRef}
                containerRef={containerRef}
                overlayCircleRef={overlayCircleRef}
                capturedImage={capturedImage}
                onCapture={capturePhoto}
                onCancel={cancelCamera}
                onSubmit={
                  isOvertimeClockingOut
                    ? submitOvertimeClockOut
                    : isOvertimeClockingIn
                    ? submitOvertimeClockIn
                    : isClockingOut
                    ? submitClockOut
                    : submitClockIn
                }
                onRetake={async () => {
                  setCapturedImage(null);
                  setWasCapturedWithFaceDetection(false);
                  await startCamera();
                }}
                onRestartCamera={restartCamera}
              />

              {!showCamera && (
                <ClockButtons
                  onClockIn={handleClockIn}
                  onClockOut={handleClockOut}
                  currentSession={currentSession}
                  clockInSession={availableSessionForClockIn}
                  clockOutSession={availableSessionForClockOut}
                  disableClockIn={
                    !!(
                      hasBlockingRequired ||
                      hasAgencyOrDateBlocking ||
                      !location ||
                      isClockingIn ||
                      clockInMutation.isPending ||
                      // Operating hours are the determining factor - always enable on operating days
                      !isOperatingDay ||
                      // Disable if no session is available for clock-in (e.g., session in progress)
                      !availableSessionForClockIn
                    )
                  }
                  disableClockOut={
                    !!(
                      hasBlockingRequired ||
                      hasAgencyOrDateBlocking ||
                      !location ||
                      isClockingOut ||
                      clockOutMutation.isPending ||
                      // Operating hours are the determining factor - always enable on operating days
                      !isOperatingDay ||
                      // Disable if no session is available for clock-out (no clock-in yet)
                      !availableSessionForClockOut
                    )
                  }
                  isClockingOut={isClockingOut || clockOutMutation.isPending}
                />
              )}

              {/* Overtime Section */}
              {areRegularSessionsComplete && (
                <Card className="border border-orange-200 shadow-sm bg-orange-50/30">
                  <CardHeader className="pb-3 sm:pb-6">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-orange-700">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                      Overtime Session
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <p className="text-xs sm:text-sm text-orange-800 mb-3">
                      You can clock in for overtime after completing both
                      morning and afternoon sessions.
                    </p>

                    {!showCamera && (
                      <ClockButtons
                        onClockIn={handleOvertimeClockIn}
                        onClockOut={handleOvertimeClockOut}
                        currentSession={null}
                        clockInSession={
                          availableOvertimeSessionForClockIn || null
                        }
                        clockOutSession={availableOvertimeSessionForClockOut}
                        disableClockIn={
                          !!(
                            hasBlockingRequired ||
                            hasAgencyOrDateBlocking ||
                            !location ||
                            isOvertimeClockingIn ||
                            clockInMutation.isPending ||
                            !areRegularSessionsComplete ||
                            !availableOvertimeSessionForClockIn
                          )
                        }
                        disableClockOut={
                          !!(
                            hasBlockingRequired ||
                            hasAgencyOrDateBlocking ||
                            !location ||
                            isOvertimeClockingOut ||
                            clockOutMutation.isPending ||
                            !areRegularSessionsComplete ||
                            !availableOvertimeSessionForClockOut
                          )
                        }
                        isClockingOut={
                          isOvertimeClockingOut || clockOutMutation.isPending
                        }
                      />
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="text-xs text-gray-600 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-md border p-3">
                <div>
                  <span className="font-medium">Location Type:</span>
                  <span className="ml-2">{locationType || "Unknown"}</span>
                </div>
                <div>
                  <span className="font-medium">Device:</span>
                  <span className="ml-2">
                    {shortenDeviceType(deviceType)} — {shortDevice}
                  </span>
                </div>
                {/* <div>
									<span className="font-medium">MAC Address:</span>
									<span className="ml-2">{macAddress || "Unavailable in browser"}</span>
								</div> */}
              </div>

              <CurrentLocationDisplay
                location={location}
                isLoadingAddress={isLoadingAddress}
                isMounted={isMounted}
                currentTime={currentTime}
                onRefresh={refreshLocation}
              />
            </CardContent>
          </Card>
        </div>

        {/* Calendar and History */}
        <div className="space-y-4 sm:space-y-6">
          {/* <Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<CalendarIcon className="w-5 h-5" />
								Calendar
							</CardTitle>
						</CardHeader>
						<CardContent className="flex justify-center">
							<Calendar
								mode="single"
								selected={selectedDate}
								onSelect={setSelectedDate}
								className="rounded-md border"
							/>
						</CardContent>
					</Card> */}

          <RecentAttendance
            records={
              recentAttendanceData?.attendance?.map((record) => ({
                date: record.date,
                status: record.status,
                clockIn: record.timeIn
                  ? new Date(record.timeIn).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : "N/A",
                clockOut: record.timeOut
                  ? new Date(record.timeOut).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : "N/A",
                location: record.address || record.agencyName || "N/A",
                locationType:
                  record.timeInLocationType ||
                  record.timeOutLocationType ||
                  undefined,
                timeInRemarks: record.timeInRemarks || undefined,
                timeOutRemarks: record.timeOutRemarks || undefined,
              })) || []
            }
          />
        </div>
      </div>
    </div>
  );
}
