import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";

// Define route groups
const INSTRUCTOR_PROTECTED_PREFIX = "/dashboard/instructor";
const STUDENT_PROTECTED_PREFIX = "/dashboard/student";

const AUTH_ROUTES = [
  "/login/instructor",
  "/login/student",
  "/signup/instructor",
  "/select-role",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("access_token")?.value;

  // Check NextAuth session
  const session = await auth();

  const isInstructorProtected = pathname.startsWith(
    INSTRUCTOR_PROTECTED_PREFIX
  );
  const isStudentProtected = pathname.startsWith(STUDENT_PROTECTED_PREFIX);
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isOnboardingRoute = pathname.startsWith("/onboarding");
  const isInvitationRoute = pathname.startsWith("/invitation");

  // Allow invitation routes
  if (isInvitationRoute) {
    return NextResponse.next();
  }

  let sessionRole = (session?.user as any)?.role as string | undefined;
  let needsOnboarding = (session as any)?.needsOnboarding === true;

  // If we have an access_token cookie but no NextAuth session, fetch user info from API
  if (accessToken && !session) {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      const refreshToken = request.cookies.get("refresh_token")?.value;

      // Construct cookie header from request cookies
      // URL-encode cookie values to handle special characters safely
      const cookies = request.cookies.getAll();
      const cookieHeader = cookies
        .map((cookie) => `${cookie.name}=${encodeURIComponent(cookie.value)}`)
        .join("; ");

      let userResponse = await fetch(`${apiUrl}/api/v1/user/me`, {
        method: "GET",
        headers: {
          Cookie: cookieHeader,
        },
        // Ensure credentials are included for cross-origin requests
        credentials: "include",
      });

      // If we get a 401, try to refresh the token
      if (userResponse.status === 401 && refreshToken) {
        try {
          const refreshResponse = await fetch(
            `${apiUrl}/api/v1/user/refresh-token`,
            {
              method: "GET",
              headers: {
                Cookie: cookieHeader,
              },
              credentials: "include",
            }
          );

          if (refreshResponse.ok) {
            // Extract new tokens from Set-Cookie headers in refresh response
            const refreshSetCookieHeaders =
              refreshResponse.headers.getSetCookie?.() || [];

            // Parse Set-Cookie headers to extract token values
            let newAccessToken = accessToken; // fallback to original
            let newRefreshToken = refreshToken; // fallback to original
            let tokensExtracted = false;

            for (const setCookieHeader of refreshSetCookieHeaders) {
              // Parse Set-Cookie header format: "name=value; attributes"
              // Example: "access_token=eyJ...; Path=/; HttpOnly; Secure; SameSite=None"
              const accessMatch = setCookieHeader.match(
                /^access_token=([^;]+)/
              );
              const refreshMatch = setCookieHeader.match(
                /^refresh_token=([^;]+)/
              );

              if (accessMatch) {
                // Decode URL-encoded cookie values if needed
                try {
                  newAccessToken = decodeURIComponent(accessMatch[1]);
                } catch {
                  // If decoding fails, use raw value
                  newAccessToken = accessMatch[1];
                }
                tokensExtracted = true;
              }
              if (refreshMatch) {
                // Decode URL-encoded cookie values if needed
                try {
                  newRefreshToken = decodeURIComponent(refreshMatch[1]);
                } catch {
                  // If decoding fails, use raw value
                  newRefreshToken = refreshMatch[1];
                }
                tokensExtracted = true;
              }
            }

            // If we couldn't extract tokens from headers, log warning but try anyway
            // The server should have set cookies, so this shouldn't happen normally
            if (!tokensExtracted && refreshSetCookieHeaders.length === 0) {
              console.warn(
                "Middleware: Could not extract tokens from refresh response Set-Cookie headers"
              );
            }

            // Build new cookie header with refreshed tokens
            // Include all other cookies from original request
            // URL-encode cookie values to handle special characters safely
            const otherCookies = cookies.filter(
              (c) => c.name !== "access_token" && c.name !== "refresh_token"
            );
            const newCookieParts = [
              `access_token=${encodeURIComponent(newAccessToken)}`,
              `refresh_token=${encodeURIComponent(newRefreshToken)}`,
              ...otherCookies.map(
                (c) => `${c.name}=${encodeURIComponent(c.value)}`
              ),
            ];
            const newCookieHeader = newCookieParts.join("; ");

            // Retry user info request with new tokens
            userResponse = await fetch(`${apiUrl}/api/v1/user/me`, {
              method: "GET",
              headers: {
                Cookie: newCookieHeader,
              },
              credentials: "include",
            });
          } else {
            // Refresh failed, clear cookies and redirect if on protected route
            const response = NextResponse.next();
            response.cookies.delete("access_token");
            response.cookies.delete("refresh_token");

            // If on protected route, redirect to login
            if (isInstructorProtected || isStudentProtected) {
              const loginTarget = isInstructorProtected
                ? "/login/instructor"
                : "/login/student";
              const url = request.nextUrl.clone();
              url.pathname = loginTarget;
              return NextResponse.redirect(url);
            }
            return response;
          }
        } catch (refreshError) {
          console.error("Token refresh failed in middleware:", refreshError);
          // Clear invalid cookies
          const response = NextResponse.next();
          response.cookies.delete("access_token");
          response.cookies.delete("refresh_token");

          // If on protected route, redirect to login
          if (isInstructorProtected || isStudentProtected) {
            const loginTarget = isInstructorProtected
              ? "/login/instructor"
              : "/login/student";
            const url = request.nextUrl.clone();
            url.pathname = loginTarget;
            return NextResponse.redirect(url);
          }
          return response;
        }
      }

      if (userResponse.ok) {
        try {
          const userData = await userResponse.json();
          sessionRole = userData?.role;
          // Determine needsOnboarding from user data
          needsOnboarding =
            !userData?.age ||
            !userData?.phone ||
            !userData?.gender ||
            (userData?.role === "student" && !userData?.studentId);
        } catch (jsonError) {
          console.error(
            "Failed to parse user data JSON in middleware:",
            jsonError
          );
          // If JSON parsing fails, treat as auth failure
          const response = NextResponse.next();
          response.cookies.delete("access_token");
          response.cookies.delete("refresh_token");

          // If on protected route, redirect to login
          if (isInstructorProtected || isStudentProtected) {
            const loginTarget = isInstructorProtected
              ? "/login/instructor"
              : "/login/student";
            const url = request.nextUrl.clone();
            url.pathname = loginTarget;
            return NextResponse.redirect(url);
          }
          // Don't return here for non-protected routes, let normal flow handle it
        }
      } else if (userResponse.status === 401) {
        // Authentication failed, clear invalid cookies
        const response = NextResponse.next();
        response.cookies.delete("access_token");
        response.cookies.delete("refresh_token");

        // If on protected route, redirect to login
        if (isInstructorProtected || isStudentProtected) {
          const loginTarget = isInstructorProtected
            ? "/login/instructor"
            : "/login/student";
          const url = request.nextUrl.clone();
          url.pathname = loginTarget;
          return NextResponse.redirect(url);
        }
        // Don't return here for non-protected routes, let normal flow handle it
      }
    } catch (error) {
      // If API call fails, log error but continue with existing logic
      console.error("Failed to fetch user info from API in middleware:", error);

      // Clear cookies only on authentication errors, not network errors
      // Network errors might be temporary and shouldn't invalidate the session
      if (error instanceof Error && !error.message.includes("fetch")) {
        // Non-network error, might be auth-related, clear cookies
        const response = NextResponse.next();
        response.cookies.delete("access_token");
        response.cookies.delete("refresh_token");

        // If on protected route, redirect to login
        if (isInstructorProtected || isStudentProtected) {
          const loginTarget = isInstructorProtected
            ? "/login/instructor"
            : "/login/student";
          const url = request.nextUrl.clone();
          url.pathname = loginTarget;
          return NextResponse.redirect(url);
        }
        // Don't return here for non-protected routes, let normal flow handle it
      }
    }
  }

  // 1) Protect dashboards: require auth (either JWT token or NextAuth session) AND valid role
  // Only consider authenticated if we have both token/session AND a valid role
  const hasTokenOrSession = !!accessToken || !!session;
  const hasValidRole =
    sessionRole === "instructor" || sessionRole === "student";
  const isAuthenticated = hasTokenOrSession && hasValidRole;

  // Handle onboarding routes
  if (isOnboardingRoute) {
    // If not authenticated, allow access (they'll be redirected to login by auth route logic)
    if (!isAuthenticated) {
      return NextResponse.next();
    }

    // If authenticated and needs onboarding, allow access to onboarding
    if (needsOnboarding) {
      return NextResponse.next();
    }

    // If authenticated and doesn't need onboarding, redirect to appropriate dashboard
    if (sessionRole === "instructor") {
      const url = request.nextUrl.clone();
      url.pathname = INSTRUCTOR_PROTECTED_PREFIX;
      return NextResponse.redirect(url);
    } else if (sessionRole === "student") {
      const url = request.nextUrl.clone();
      url.pathname = STUDENT_PROTECTED_PREFIX;
      return NextResponse.redirect(url);
    }

    // If role is unknown, allow access
    return NextResponse.next();
  }

  // Enforce role-based dashboard access when role info is available
  if (sessionRole === "student" && isInstructorProtected) {
    const url = request.nextUrl.clone();
    url.pathname = STUDENT_PROTECTED_PREFIX;
    return NextResponse.redirect(url);
  }

  if (sessionRole === "instructor" && isStudentProtected) {
    const url = request.nextUrl.clone();
    url.pathname = INSTRUCTOR_PROTECTED_PREFIX;
    return NextResponse.redirect(url);
  }

  if (!isAuthenticated && (isInstructorProtected || isStudentProtected)) {
    const loginTarget = isInstructorProtected
      ? "/login/instructor"
      : "/login/student";
    const url = request.nextUrl.clone();
    url.pathname = loginTarget;
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Check if authenticated user needs onboarding before allowing dashboard access
  if (
    isAuthenticated &&
    needsOnboarding &&
    (isInstructorProtected || isStudentProtected)
  ) {
    const onboardingTarget =
      sessionRole === "instructor"
        ? "/onboarding/instructor"
        : "/onboarding/student";
    const url = request.nextUrl.clone();
    url.pathname = onboardingTarget;
    return NextResponse.redirect(url);
  }

  // 2) Prevent authenticated users from accessing auth routes
  // Only redirect if user has a valid, known role
  // If role is unknown/undefined, allow access to /select-role so user can choose
  if (isAuthenticated && isAuthRoute) {
    // Special case: if on /select-role and role is unknown, allow access
    if (pathname === "/select-role" && !hasValidRole) {
      return NextResponse.next();
    }

    // If user needs onboarding, redirect to onboarding instead of dashboard
    if (needsOnboarding) {
      const onboardingTarget =
        sessionRole === "instructor"
          ? "/onboarding/instructor"
          : "/onboarding/student";
      const url = request.nextUrl.clone();
      url.pathname = onboardingTarget;
      return NextResponse.redirect(url);
    }

    let redirectPath: string;

    if (sessionRole === "instructor") {
      redirectPath = INSTRUCTOR_PROTECTED_PREFIX;
    } else if (sessionRole === "student") {
      redirectPath = STUDENT_PROTECTED_PREFIX;
    } else {
      // If we have token/session but no valid role, don't redirect from /select-role
      // Allow user to select their role
      if (pathname === "/select-role") {
        return NextResponse.next();
      }
      // For other auth routes, use pathname heuristic as fallback
      const toInstructor = pathname.includes("/instructor");
      redirectPath = toInstructor
        ? INSTRUCTOR_PROTECTED_PREFIX
        : STUDENT_PROTECTED_PREFIX;
    }

    const url = request.nextUrl.clone();
    url.pathname = redirectPath;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login/:path*",
    "/signup/:path*",
    "/select-role",
    "/onboarding/:path*",
    "/invitation/:path*",
  ],
};
