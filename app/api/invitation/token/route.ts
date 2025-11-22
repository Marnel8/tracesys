import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	const { token } = await req.json();

	if (!token) {
		return NextResponse.json(
			{ success: false, message: "Invitation token is required." },
			{ status: 400 }
		);
	}

	const response = NextResponse.json({ success: true });
	response.cookies.set({
		name: "invitationToken",
		value: token,
		path: "/",
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		maxAge: 60 * 10, // 10 minutes
	});

	return response;
}

