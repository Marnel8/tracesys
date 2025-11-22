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

	const isInstructorProtected = pathname.startsWith(INSTRUCTOR_PROTECTED_PREFIX);
	const isStudentProtected = pathname.startsWith(STUDENT_PROTECTED_PREFIX);
	const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
	const isOnboardingRoute = pathname.startsWith("/onboarding");
	const isInvitationRoute = pathname.startsWith("/invitation");

	// Allow invitation routes
	if (isInvitationRoute) {
		return NextResponse.next();
	}

	const sessionRole = (session?.user as any)?.role as string | undefined;
	const needsOnboarding = (session as any)?.needsOnboarding === true;

	// 1) Protect dashboards: require auth (either JWT token or NextAuth session) AND valid role
	// Only consider authenticated if we have both token/session AND a valid role
	const hasTokenOrSession = !!accessToken || !!session;
	const hasValidRole = sessionRole === "instructor" || sessionRole === "student";
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
	if (isAuthenticated && needsOnboarding && (isInstructorProtected || isStudentProtected)) {
		const onboardingTarget = sessionRole === "instructor"
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
			const onboardingTarget = sessionRole === "instructor"
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


