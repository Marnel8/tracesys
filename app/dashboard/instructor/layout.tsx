"use client";

import type React from "react";
import { Suspense } from "react";
import { usePathname } from "next/navigation";
import {
	SidebarProvider,
	SidebarInset,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { InstructorSidebar } from "@/components/instructor-sidebar";
import { Separator } from "@/components/ui/separator";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NotificationSystem } from "@/components/notification-system";

// Function to generate breadcrumbs based on pathname
function generateBreadcrumbs(pathname: string) {
	const segments = pathname.split("/").filter(Boolean);
	const breadcrumbs = [];

	// Always start with Dashboard
	breadcrumbs.push({
		label: "Dashboard",
		href: "/dashboard/instructor",
		isActive: pathname === "/dashboard/instructor",
	});

	// Map path segments to readable labels
	const pathMap: Record<string, string> = {
		students: "Students",
		add: "Add Student",
		attendance: "Attendance",
		requirements: "Requirements",
		templates: "Templates",
		reports: "Reports",
		weekly: "Weekly Reports",
		narrative: "Narrative Reports",
		announcements: "Announcements",
		analytics: "Analytics",
		settings: "Settings",
		sections: "Sections",
		history: "History",
		all: "All Submissions",
	};

	// Build breadcrumbs from segments
	if (segments.length > 2) {
		// More than just /dashboard/instructor
		for (let i = 2; i < segments.length; i++) {
			const segment = segments[i];
			const label =
				pathMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
			const href = "/" + segments.slice(0, i + 1).join("/");
			const isActive = i === segments.length - 1;

			breadcrumbs.push({
				label,
				href,
				isActive,
			});
		}
	}

	return breadcrumbs;
}

export default function InstructorLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const breadcrumbs = generateBreadcrumbs(pathname);

	return (
		<SidebarProvider defaultOpen={true}>
			<InstructorSidebar />
			<SidebarInset className="transition-all duration-200 ease-in-out">
				<Suspense
					fallback={
						<div className="flex items-center justify-center h-16">
							Loading...
						</div>
					}
				>
					<header className="flex h-16 shrink-0 items-center gap-2 border-b border-primary-200 bg-white px-4 sticky top-0 z-10">
						<SidebarTrigger className="-ml-1 hover:bg-primary-50 transition-colors" />
						<Separator orientation="vertical" className="mr-2 h-4" />

						{/* Dynamic Breadcrumb */}
						<Breadcrumb className="flex-1 min-w-0">
							<BreadcrumbList>
								{breadcrumbs.map((crumb, index) => (
									<div key={crumb.href} className="flex items-center">
										{index > 0 && <BreadcrumbSeparator className="mx-2" />}
										<BreadcrumbItem
											className={index === 0 ? "hidden md:block" : ""}
										>
											{crumb.isActive ? (
												<BreadcrumbPage className="text-gray-900 font-medium">
													{crumb.label}
												</BreadcrumbPage>
											) : (
												<BreadcrumbLink
													href={crumb.href}
													className="hover:text-primary-600 transition-colors text-gray-600"
												>
													{crumb.label}
												</BreadcrumbLink>
											)}
										</BreadcrumbItem>
									</div>
								))}
							</BreadcrumbList>
						</Breadcrumb>

						{/* Header Actions */}
						{/* <div className="flex items-center gap-4">
							<div className="relative hidden md:block">
								<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
								<Input
									placeholder="Search students, reports..."
									className="pl-10 w-64 border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
								/>
							</div>

							<NotificationSystem />
						</div> */}
					</header>
				</Suspense>

				<main className="flex flex-1 flex-col gap-4 p-4 bg-gray-50 min-h-0 overflow-auto">
					{children}
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
