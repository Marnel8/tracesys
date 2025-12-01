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
  const refreshToken = request.cookies.get("refresh_token")?.value;

  // Debug: Log all cookies to see what we have
  const allCookies = request.cookies.getAll();
  const cookieNames = allCookies.map((c) => c.name);
  const hasAccessToken = cookieNames.includes("access_token");
  const hasRefreshToken = cookieNames.includes("refresh_token");

  // Check for duplicate cookies (multiple access_token or refresh_token)
  const accessTokenCount = cookieNames.filter(
    (n) => n === "access_token"
  ).length;
  const refreshTokenCount = cookieNames.filter(
    (n) => n === "refresh_token"
  ).length;

  if (accessTokenCount > 1 || refreshTokenCount > 1) {
    console.warn("[Middleware] Duplicate cookies detected:", {
      accessTokenCount,
      refreshTokenCount,
      pathname,
      allCookieNames: cookieNames,
    });
  }

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
  // This helps us determine the user's role and onboarding status
  if (accessToken && !session) {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      const refreshToken = request.cookies.get("refresh_token")?.value;

      // Debug: Log cookie presence and details
      console.log("[Middleware] Access token found, fetching user info", {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        accessTokenLength: accessToken?.length,
        refreshTokenLength: refreshToken?.length,
        pathname,
        referer: request.headers.get("referer"),
        allCookieNames: cookieNames,
        accessTokenCount,
        refreshTokenCount,
      });

      // Check if this is a fresh login (coming from login page)
      const referer = request.headers.get("referer") || "";
      const isFreshLogin = referer.includes("/login/");

      // Additional check: if we just redirected from login, give cookies time to settle
      // This helps with cross-domain cookie synchronization delays
      const isImmediatePostLogin =
        isFreshLogin ||
        (pathname.startsWith("/dashboard/") && referer.includes("/login/"));

      // Construct cookie header from request cookies
      // URL-encode cookie values to handle special characters safely
      // If there are duplicate cookies, use the first one (browser should send the most specific match)
      const cookies = request.cookies.getAll();

      // Handle duplicate cookies - use a Map to keep only the first occurrence
      // This prevents sending duplicate cookie names in the header
      const uniqueCookies = new Map<string, string>();
      for (const cookie of cookies) {
        if (!uniqueCookies.has(cookie.name)) {
          uniqueCookies.set(cookie.name, cookie.value);
        } else if (accessTokenCount > 1 || refreshTokenCount > 1) {
          // If we detected duplicates earlier, log which value we're using
          console.warn(
            `[Middleware] Duplicate cookie ${cookie.name} detected, using first value`
          );
        }
      }

      const cookieHeader = Array.from(uniqueCookies.entries())
        .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
        .join("; ");

      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      let userResponse: Response;
      try {
        userResponse = await fetch(`${apiUrl}/api/v1/user/me`, {
          method: "GET",
          headers: {
            Cookie: cookieHeader,
          },
          // Ensure credentials are included for cross-origin requests
          credentials: "include",
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);

        // Check if it's a network error (not an HTTP error)
        if (
          fetchError.name === "AbortError" ||
          fetchError.message?.includes("fetch")
        ) {
          console.warn(
            "[Middleware] Network error fetching user info (timeout or fetch failed):",
            fetchError.message
          );
          // For network errors, preserve cookies and allow request to proceed
          // Client-side code will handle authentication
          return NextResponse.next();
        }
        // Re-throw if it's not a network error
        throw fetchError;
      }

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
            console.log("[Middleware] Token refresh successful");
            // Extract new tokens from Set-Cookie headers in refresh response
            const refreshSetCookieHeaders =
              refreshResponse.headers.getSetCookie?.() || [];

            console.log(
              "[Middleware] Refresh Set-Cookie headers count:",
              refreshSetCookieHeaders.length
            );

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
            // Refresh failed - check if it's a network error or actual auth failure
            const refreshStatus = refreshResponse.status;
            const isNetworkError = refreshStatus === 0 || refreshStatus >= 500;

            if (isNetworkError) {
              console.warn(
                "[Middleware] Refresh failed with network/server error - preserving cookies"
              );
              // Network/server errors shouldn't delete cookies
              return NextResponse.next();
            }

            // Only delete cookies if refresh explicitly failed with 401/403
            if (refreshStatus === 401 || refreshStatus === 403) {
              console.log(
                "[Middleware] Refresh failed with 401/403 - deleting cookies"
              );
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

            // For other status codes, preserve cookies
            console.warn(
              `[Middleware] Refresh failed with status ${refreshStatus} - preserving cookies`
            );
            return NextResponse.next();
          }
        } catch (refreshError: any) {
          console.error("[Middleware] Token refresh exception:", refreshError);

          // Check if it's a network error
          const isNetworkError =
            refreshError?.name === "AbortError" ||
            refreshError?.message?.includes("fetch") ||
            refreshError?.message?.includes("network") ||
            refreshError?.code === "ECONNREFUSED" ||
            refreshError?.code === "ETIMEDOUT";

          if (isNetworkError) {
            console.warn(
              "[Middleware] Refresh network error - preserving cookies"
            );
            // Network errors shouldn't delete cookies
            return NextResponse.next();
          }

          // For other errors, also preserve cookies - might be temporary server issue
          console.warn(
            "[Middleware] Refresh error (non-network) - preserving cookies, letting client handle"
          );
          return NextResponse.next();
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

          console.log("[Middleware] Successfully fetched user info", {
            role: sessionRole,
            needsOnboarding,
            pathname,
          });
        } catch (jsonError) {
          console.error(
            "[Middleware] Failed to parse user data JSON:",
            jsonError
          );
          // If JSON parsing fails, it might be a server error, not necessarily auth failure
          // Only delete cookies if we're certain it's an auth issue
          // For now, preserve cookies and let client-side handle it
          console.warn(
            "[Middleware] Preserving cookies despite JSON parse error - may be server issue"
          );
          // Don't delete cookies on JSON parse errors - could be server returning HTML error page
          // Client-side will handle authentication errors
          return NextResponse.next();
        }
      } else if (userResponse.status === 401) {
        // Authentication failed after refresh attempt (or no refresh token available)
        // Only delete cookies if we're CERTAIN it's an auth failure
        // Check if we have a refresh token - if not, tokens are definitely invalid
        if (!refreshToken) {
          console.log(
            "[Middleware] 401 received and no refresh token - deleting cookies"
          );
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
            // Validate redirect path to prevent open redirects
            const redirectPath = pathname.startsWith("/dashboard/")
              ? pathname
              : undefined;
            if (redirectPath) {
              url.searchParams.set("redirect", redirectPath);
            }
            return NextResponse.redirect(url);
          }
          return response;
        } else {
          // We have a refresh token but still got 401
          // This might be a temporary server issue or the refresh token is also invalid
          // For fresh logins, give it a chance - don't delete cookies immediately
          // This is especially important for cross-domain scenarios where cookies might
          // take a moment to sync properly
          if (isFreshLogin || isImmediatePostLogin) {
            console.warn(
              "[Middleware] 401 on fresh/immediate post-login with refresh token - preserving cookies, may be server issue or cookie sync delay",
              {
                isFreshLogin,
                isImmediatePostLogin,
                pathname,
                referer,
                hasAccessToken,
                hasRefreshToken,
                accessTokenCount,
                refreshTokenCount,
              }
            );
            // Don't delete cookies - might be a timing issue with cross-domain cookies
            return NextResponse.next();
          }
          // For non-fresh logins, delete cookies as they're likely invalid
          console.log(
            "[Middleware] 401 received with refresh token on non-fresh login - deleting cookies"
          );
          const response = NextResponse.next();
          response.cookies.delete("access_token");
          response.cookies.delete("refresh_token");

          if (isInstructorProtected || isStudentProtected) {
            const loginTarget = isInstructorProtected
              ? "/login/instructor"
              : "/login/student";
            const url = request.nextUrl.clone();
            url.pathname = loginTarget;
            const redirectPath = pathname.startsWith("/dashboard/")
              ? pathname
              : undefined;
            if (redirectPath) {
              url.searchParams.set("redirect", redirectPath);
            }
            return NextResponse.redirect(url);
          }
          return response;
        }
      } else {
        // Non-401 error status (500, 503, etc.)
        console.warn(
          `[Middleware] Non-401 error status ${userResponse.status} - preserving cookies`
        );
        // Don't delete cookies on server errors - preserve them and let client handle it
        return NextResponse.next();
      }
    } catch (error: any) {
      // If API call fails, log error but preserve cookies
      // We have an access token, so we should trust it
      // Client-side code will handle authentication errors
      console.error("[Middleware] Exception fetching user info from API:", {
        error: error?.message || error,
        errorName: error?.name,
        pathname,
        hasAccessToken: !!accessToken,
      });

      // Distinguish between network errors and other errors
      const isNetworkError =
        error?.name === "AbortError" ||
        error?.message?.includes("fetch") ||
        error?.message?.includes("network") ||
        error?.message?.includes("timeout") ||
        error?.code === "ECONNREFUSED" ||
        error?.code === "ETIMEDOUT";

      if (isNetworkError) {
        console.warn(
          "[Middleware] Network error detected - preserving cookies, allowing request to proceed"
        );
        // Network errors should not delete cookies - the token might still be valid
        return NextResponse.next();
      }

      // For other errors, also preserve cookies and let client handle it
      // Only delete cookies if we're absolutely certain they're invalid
      console.warn(
        "[Middleware] Non-network error - preserving cookies, letting client handle authentication"
      );
      return NextResponse.next();
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
    // Validate redirect path to prevent open redirects
    const redirectPath = pathname.startsWith("/dashboard/")
      ? pathname
      : undefined;
    if (redirectPath) {
      url.searchParams.set("redirect", redirectPath);
    }
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
