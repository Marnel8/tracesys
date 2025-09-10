import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define route groups
const INSTRUCTOR_PROTECTED_PREFIX = "/dashboard/instructor";
const STUDENT_PROTECTED_PREFIX = "/dashboard/student";

const AUTH_ROUTES = [
	"/login/instructor",
	"/login/student",
	"/signup/instructor",
	"/select-role",
];

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const accessToken = request.cookies.get("access_token")?.value;

	const isInstructorProtected = pathname.startsWith(INSTRUCTOR_PROTECTED_PREFIX);
	const isStudentProtected = pathname.startsWith(STUDENT_PROTECTED_PREFIX);
	const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

	// 1) Protect dashboards: require auth cookie
	if (!accessToken && (isInstructorProtected || isStudentProtected)) {
		const loginTarget = isInstructorProtected
			? "/login/instructor"
			: "/login/student";
		const url = request.nextUrl.clone();
		url.pathname = loginTarget;
		url.searchParams.set("redirect", pathname);
		return NextResponse.redirect(url);
	}

	// 2) Prevent authenticated users from accessing auth routes
	if (accessToken && isAuthRoute) {
		// Heuristic: keep users within their area based on where they came from
		// If they try instructor login/signup, send to instructor dashboard; same for student
		const toInstructor = pathname.includes("/instructor");
		const redirectPath = toInstructor
			? INSTRUCTOR_PROTECTED_PREFIX
			: STUDENT_PROTECTED_PREFIX;
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
	],
};


