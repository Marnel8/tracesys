import type React from "react";
import { StudentNavbar } from "@/components/student-navbar";

export default function StudentLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen bg-gray-50 px-4 md:px-8 lg:px-0">
			<StudentNavbar />
			<main className="py-4">{children}</main>
		</div>
	);
}
