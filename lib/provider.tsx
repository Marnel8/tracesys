"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "@/lib/auth-provider";
import { useState, ReactNode } from "react";

export default function Provider({ children }: { children: ReactNode }) {
	const [queryClient] = useState(() => new QueryClient());

	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				{/* {process.env.NODE_ENV === "development" && (
					<ReactQueryDevtools initialIsOpen={false} />
				)} */}
				{children}
			</AuthProvider>
		</QueryClientProvider>
	);
}