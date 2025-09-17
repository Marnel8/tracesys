"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useLogout } from "@/hooks/auth/useAuth";
import { useToast } from "@/hooks/use-toast";

export function StudentNavbar() {
	const router = useRouter();
    const logoutMutation = useLogout();
    const { toast } = useToast();

	async function handleSignOut() {
		try {
            await logoutMutation.mutateAsync();
            toast({ title: "Signed out" });
		} catch (error) {
			// ignore – still redirect
		} finally {
			router.replace("/select-role");
		}
	}

	return (
		<header className=" sticky top-0 z-10 flex h-14 items-center justify-between border-b border-primary-200 bg-white  ">
			<div className="px-4 md:px-8 lg:px-16 flex items-center justify-between w-full">
				<Link href="/dashboard/student" className="flex items-center gap-3">
					<Image
						src="/images/tracesys-logo.png"
						alt="TracèSys"
						width={28}
						height={28}
						priority
					/>
					<span className="font-semibold text-gray-900">TracèSys</span>
				</Link>
				<div className="flex items-center gap-3">
                    <Button
						variant="outline"
						className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={handleSignOut}
                        disabled={logoutMutation.isPending}
					>
                        <LogOut className="w-4 h-4 mr-2" />
                        {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
					</Button>
				</div>
			</div>
		</header>
	);
}
