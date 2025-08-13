import type React from "react";
import { StudentNavbar } from "@/components/student-navbar";

export default function StudentLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen bg-gray-50 ">
			<StudentNavbar />
			<main className="p-4 md:px-8 lg:px-16">{children}</main>
		</div>
	);
}
