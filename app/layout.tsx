import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";
import Provider from "@/lib/provider";
import { Toaster } from "sonner";

const poppins = Poppins({
	weight: ["400", "500", "600", "700"],
	subsets: ["latin"],
	display: "swap",
	variable: "--font-poppins",
});

export const metadata: Metadata = {
	title: "TracèSys",
	description: "Online Practicum Management System",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={poppins.variable}>
			<body suppressHydrationWarning>
				<Provider>
					{children}
					<Toaster position="top-right" richColors />
				</Provider>
			</body>
		</html>
	);
}
